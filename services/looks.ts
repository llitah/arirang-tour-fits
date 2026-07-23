import { supabase } from "@/lib/supabase/client";
import type { LookWithRelations } from "@/types/database";
import { deleteAllLookImagesFromStorage } from "./images";

// created_by referencia profiles(id); o nome da constraint de FK é gerado
// automaticamente pelo Postgres como "<tabela>_<coluna>_fkey".
const SELECT_FULL = `
  *,
  creator:profiles!looks_created_by_fkey(*),
  look_images(*),
  products(*),
  votes(*, profiles(*)),
  comments(*, profiles(*)),
  favorites(*)
`;

export interface LookFilters {
  search?: string;
  artist?: string;
  event?: string;
  category?: string;
  createdBy?: string; // profile id
  onlyFavoritesOf?: string; // profile id
  sort?: "recent" | "rating" | "favorites";
}

function normalize(looks: LookWithRelations[]): LookWithRelations[] {
  return looks.map((l) => ({
    ...l,
    look_images: [...(l.look_images ?? [])].sort((a, b) => a.order_index - b.order_index),
    comments: [...(l.comments ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

export function avgRating(look: LookWithRelations): number {
  if (!look.votes?.length) return 0;
  return look.votes.reduce((sum, v) => sum + v.rating, 0) / look.votes.length;
}

export async function fetchLooks(filters: LookFilters = {}): Promise<LookWithRelations[]> {
  let query = supabase.from("looks").select(SELECT_FULL);

  if (filters.artist) query = query.eq("artist", filters.artist);
  if (filters.event) query = query.eq("event", filters.event);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.createdBy) query = query.eq("created_by", filters.createdBy);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    query = query.or(
      `title.ilike.%${s}%,description.ilike.%${s}%,artist.ilike.%${s}%,event.ilike.%${s}%,category.ilike.%${s}%`
    );
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let looks = normalize((data ?? []) as unknown as LookWithRelations[]);

  if (filters.onlyFavoritesOf) {
    looks = looks.filter((l) => l.favorites?.some((f) => f.profile_id === filters.onlyFavoritesOf));
  }

  if (filters.sort === "rating") {
    looks = [...looks].sort((a, b) => avgRating(b) - avgRating(a));
  } else if (filters.sort === "favorites") {
    looks = [...looks].sort((a, b) => (b.favorites?.length ?? 0) - (a.favorites?.length ?? 0));
  }

  return looks;
}

export async function fetchLookById(id: string): Promise<LookWithRelations> {
  const { data, error } = await supabase.from("looks").select(SELECT_FULL).eq("id", id).single();
  if (error) throw error;
  return normalize([data as unknown as LookWithRelations])[0];
}

export interface LookInput {
  title: string;
  description: string;
  artist: string;
  event: string;
  category: string;
  notes: string;
  created_by: string;
}

export async function createLook(input: LookInput) {
  const { data, error } = await supabase.from("looks").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateLook(id: string, input: Partial<LookInput>) {
  const { data, error } = await supabase.from("looks").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/** Exclui o look e tudo relacionado: fotos no Storage, produtos, votos,
 *  comentários e favoritos (as linhas do banco somem sozinhas via
 *  ON DELETE CASCADE; só as fotos no Storage precisam ser apagadas à parte). */
export async function deleteLook(look: LookWithRelations) {
  await deleteAllLookImagesFromStorage(look.look_images ?? []);
  const { error } = await supabase.from("looks").delete().eq("id", look.id);
  if (error) throw error;
}

/** Duplica um look (dados, produtos e referências das mesmas imagens).
 *  Comentários e votos não são copiados — o novo look começa "zerado". */
export async function duplicateLook(look: LookWithRelations, profileId: string) {
  const { data: newLook, error } = await supabase
    .from("looks")
    .insert({
      title: `${look.title} (cópia)`,
      description: look.description,
      artist: look.artist,
      event: look.event,
      category: look.category,
      notes: look.notes,
      created_by: profileId,
    })
    .select()
    .single();
  if (error) throw error;

  if (look.products?.length) {
    await supabase.from("products").insert(
      look.products.map((p) => ({
        look_id: newLook.id,
        product_name: p.product_name,
        brand: p.brand,
        price: p.price,
        url: p.url,
      }))
    );
  }

  if (look.look_images?.length) {
    await supabase.from("look_images").insert(
      look.look_images.map((img) => ({
        look_id: newLook.id,
        image_url: img.image_url,
        order_index: img.order_index,
      }))
    );
  }

  return newLook;
}
