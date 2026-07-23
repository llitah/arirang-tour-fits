import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
