import { supabase } from "@/lib/supabase/client";

export async function toggleFavorite(lookId: string, profileId: string, isCurrentlyFavorite: boolean) {
  if (isCurrentlyFavorite) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("look_id", lookId)
      .eq("profile_id", profileId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ look_id: lookId, profile_id: profileId });
    if (error) throw error;
  }
}
