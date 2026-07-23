"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import type { LookWithRelations, Profile } from "@/types/database";
import LookCard from "./LookCard";
import LookCardSkeleton from "./LookCardSkeleton";

interface Props {
  looks: LookWithRelations[];
  loading: boolean;
  currentProfile: Profile;
  busyId: string | null;
  onOpen: (l: LookWithRelations) => void;
  onEdit: (l: LookWithRelations) => void;
  onDuplicate: (l: LookWithRelations) => void;
  onDelete: (l: LookWithRelations) => void;
}

export default function LookGrid({ looks, loading, currentProfile, busyId, onOpen, onEdit, onDuplicate, onDelete }: Props) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <LookCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (looks.length === 0) {
    return (
      <div className="glass rounded-3xl p-10 text-center animate-fadeUp">
        <Sparkles className="mx-auto mb-3 opacity-40" size={26} />
        <p className="font-display italic text-xl mb-1">Nenhum look encontrado.</p>
        <p className="text-sm opacity-60">Ajustem os filtros ou criem um novo look.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {looks.map((look, i) => (
        <LookCard
          key={look.id}
          look={look}
          index={i}
          currentProfile={currentProfile}
          busy={busyId === look.id}
          onOpen={() => onOpen(look)}
          onEdit={() => onEdit(look)}
          onDuplicate={() => onDuplicate(look)}
          onDelete={() => onDelete(look)}
        />
      ))}
    </div>
  );
}
