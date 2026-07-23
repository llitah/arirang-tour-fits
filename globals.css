import { supabase } from "@/lib/supabase/client";
import type { LookImage } from "@/types/database";

const BUCKET = "looks";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Envia um arquivo de imagem para o bucket "looks" e devolve a URL pública. */
export async function uploadLookImage(lookId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${lookId}/${genId()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function addLookImageRow(
  lookId: string,
  imageUrl: string,
  orderIndex: number
): Promise<LookImage> {
  const { data, error } = await supabase
    .from("look_images")
    .insert({ look_id: lookId, image_url: imageUrl, order_index: orderIndex })
    .select()
    .single();
  if (error) throw error;
  return data as LookImage;
}

export async function reorderLookImages(images: { id: string; order_index: number }[]) {
  await Promise.all(
    images.map((img) =>
      supabase.from("look_images").update({ order_index: img.order_index }).eq("id", img.id)
    )
  );
}

function extractStoragePath(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

export async function deleteLookImage(image: LookImage) {
  const path = extractStoragePath(image.image_url);
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]);
  }
  const { error } = await supabase.from("look_images").delete().eq("id", image.id);
  if (error) throw error;
}

/** Remove todas as fotos de um look do Storage (usado antes de excluir o look). */
export async function deleteAllLookImagesFromStorage(images: LookImage[]) {
  const paths = images.map((i) => extractStoragePath(i.image_url)).filter((p): p is string => !!p);
  if (paths.length) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}
