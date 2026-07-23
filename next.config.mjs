"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import type { Profile } from "@/types/database";
import { WINE, CRIMSON, ONYX } from "@/lib/theme";

export default function PersonPicker({
  profiles,
  onChoose,
}: {
  profiles: Profile[];
  onChoose: (p: Profile) => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: "#F6F1EA" }}>
      <div className="glass rounded-3xl max-w-sm w-full p-8 animate-popIn text-center shadow-2xl">
        <Sparkles className="mx-auto mb-3" size={26} color={WINE} />
        <p className="eyebrow" style={{ color: CRIMSON }}>
          arirang looks
        </p>
        <h2 className="font-display text-3xl italic mt-1 mb-6" style={{ color: ONYX }}>
          Quem é você?
        </h2>
        <div className="flex flex-col gap-3">
          {profiles.length === 0 && (
            <p className="text-sm opacity-60">
              Nenhum perfil encontrado no Supabase. Rode a migration de seed (0002_seed.sql).
            </p>
          )}
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => onChoose(p)}
              className="tap rounded-2xl py-4 px-5 font-semibold text-lg font-display"
              style={{ background: `linear-gradient(135deg, ${WINE}, ${CRIMSON})`, color: "#F6F1EA" }}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-xs mt-5 opacity-50">Isso fica salvo apenas neste dispositivo.</p>
      </div>
    </div>
  );
}
