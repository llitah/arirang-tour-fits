import { supabase } from "@/lib/supabase/client";

export async function addComment(lookId: string, profileId: string, text: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ look_id: lookId, profile_id: profileId, comment: text })
    .select("*, profiles(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}
