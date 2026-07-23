import { supabase } from "@/lib/supabase/client";

/** Cria o voto da pessoa para o look, ou atualiza se ela já tinha votado. */
export async function upsertVote(lookId: string, profileId: string, rating: number) {
  const { error } = await supabase
    .from("votes")
    .upsert({ look_id: lookId, profile_id: profileId, rating }, { onConflict: "look_id,profile_id" });
  if (error) throw error;
}

export async function removeVote(lookId: string, profileId: string) {
  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("look_id", lookId)
    .eq("profile_id", profileId);
  if (error) throw error;
}
