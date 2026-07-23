"use client";

import { useCallback, useEffect, useState } from "react";
import { listProfiles } from "@/services/profiles";
import type { Profile } from "@/types/database";

const STORAGE_KEY = "arirang:profile_id";

export function useProfile() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await listProfiles();
        setProfiles(list);
        const savedId = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        const found = list.find((p) => p.id === savedId) ?? null;
        setProfile(found);
      } catch (e) {
        console.error("Falha ao carregar perfis do Supabase", e);
      }
      setLoading(false);
    })();
  }, []);

  const choose = useCallback((p: Profile) => {
    setProfile(p);
    try {
      window.localStorage.setItem(STORAGE_KEY, p.id);
    } catch (e) {}
  }, []);

  const reset = useCallback(() => {
    setProfile(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  return { profiles, profile, choose, reset, loading };
}
