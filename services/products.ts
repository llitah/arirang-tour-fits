import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/database";

export interface ProductInput {
  product_name: string;
  brand: string | null;
  price: number | null;
  url: string | null;
}

/**
 * Substitui todos os produtos de um look pela lista enviada.
 * Mais simples e seguro do que tentar comparar diffs numa tela de edição.
 */
export async function replaceLookProducts(
  lookId: string,
  products: ProductInput[]
): Promise<Product[]> {
  const { error: delError } = await supabase.from("products").delete().eq("look_id", lookId);
  if (delError) throw delError;

  if (!products.length) return [];

  const rows = products.map((p) => ({ ...p, look_id: lookId }));
  const { data, error } = await supabase.from("products").insert(rows).select();
  if (error) throw error;
  return (data ?? []) as Product[];
}
