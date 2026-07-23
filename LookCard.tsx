"use client";

import React from "react";
import { Search, Heart } from "lucide-react";
import type { Profile } from "@/types/database";
import type { LookFilters } from "@/services/looks";
import { WINE, ONYX } from "@/lib/theme";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  artist: string;
  setArtist: (v: string) => void;
  event: string;
  setEvent: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (v: boolean) => void;
  createdBy: string;
  setCreatedBy: (v: string) => void;
  sort: NonNullable<LookFilters["sort"]>;
  setSort: (v: NonNullable<LookFilters["sort"]>) => void;
  profiles: Profile[];
  options: { artists: string[]; events: string[]; categories: string[] };
}

export default function FiltersBar({
  search,
  setSearch,
  artist,
  setArtist,
  event,
  setEvent,
  category,
  setCategory,
  onlyFavorites,
  setOnlyFavorites,
  createdBy,
  setCreatedBy,
  sort,
  setSort,
  profiles,
  options,
}: Props) {
  const selectClass = "text-sm rounded-full px-3.5 py-2 bg-white/70 border hairline outline-none";

  return (
    <div className="glass rounded-3xl p-3.5 mb-6 flex flex-wrap items-center gap-2.5 animate-fadeUp">
      <div className="flex items-center gap-2 flex-1 min-w-[180px] rounded-full bg-white/70 border hairline px-3.5 py-2">
        <Search size={15} color={WINE} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, artista, evento…"
          className="text-sm outline-none bg-transparent flex-1"
        />
      </div>

      <select className={selectClass} value={artist} onChange={(e) => setArtist(e.target.value)}>
        <option value="">Artista (todos)</option>
        {options.artists.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select className={selectClass} value={event} onChange={(e) => setEvent(e.target.value)}>
        <option value="">Evento (todos)</option>
        {options.events.map((e2) => (
          <option key={e2} value={e2}>
            {e2}
          </option>
        ))}
      </select>

      <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Categoria (todas)</option>
        {options.categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select className={selectClass} value={createdBy} onChange={(e) => setCreatedBy(e.target.value)}>
        <option value="">Cadastrado por (todos)</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={sort}
        onChange={(e) => setSort(e.target.value as NonNullable<LookFilters["sort"]>)}
      >
        <option value="recent">Mais recentes</option>
        <option value="rating">Melhor nota</option>
        <option value="favorites">Mais favoritados</option>
      </select>

      <button
        onClick={() => setOnlyFavorites(!onlyFavorites)}
        className="tap flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full"
        style={{ background: onlyFavorites ? WINE : "rgba(23,18,19,0.06)", color: onlyFavorites ? "#fff" : ONYX }}
      >
        <Heart size={14} fill={onlyFavorites ? "#fff" : "none"} /> Favoritos
      </button>
    </div>
  );
}
