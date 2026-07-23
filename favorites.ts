"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLooks, type LookFilters } from "@/services/looks";
import type { LookWithRelations } from "@/types/database";
import { supabase } from "@/lib/supabase/client";

export function useLooks(filters: LookFilters) {
  const [looks, setLooks] = useState<LookWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersKey = JSON.stringify(filters);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchLooks(JSON.parse(filtersKey));
      setLooks(data);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar os looks.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  // Assim que Letícia ou Stella mexem em algo, a outra pessoa recebe a
  // atualização automaticamente (Supabase Realtime via replication).
  const reloadRef = useRef(reload);
  reloadRef.current = reload;

  useEffect(() => {
    const channel = supabase
      .channel("arirang-looks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "looks" }, () => reloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "look_images" }, () => reloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => reloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => reloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => reloadRef.current())
      .on("postgres_changes", { event: "*", schema: "public", table: "favorites" }, () => reloadRef.current())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { looks, loading, error, reload };
}
