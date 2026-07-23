"use client";

import React, { useState } from "react";
import { Heart, Star, Pencil, Copy, Trash2, Image as ImageIcon, MessageCircle } from "lucide-react";
import type { LookWithRelations, Profile } from "@/types/database";
import { avgRating } from "@/services/looks";
import { toggleFavorite } from "@/services/favorites";
import { WINE, CRIMSON, GOLD, ONYX, SAND } from "@/lib/theme";
import { useToast } from "./ui/Toast";

interface Props {
  look: LookWithRelations;
  index: number;
  currentProfile: Profile;
  busy: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function LookCard({ look, index, currentProfile, busy, onOpen, onEdit, onDuplicate, onDelete }: Props) {
  const { push } = useToast();
  const [favBusy, setFavBusy] = useState(false);
  const isFavorite = look.favorites?.some((f) => f.profile_id === currentProfile.id);
  const cover = look.look_images?.[0]?.image_url;
  const rating = avgRating(look);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavBusy(true);
    try {
      await toggleFavorite(look.id, currentProfile.id, !!isFavorite);
    } catch {
      push("error", "Não foi possível favoritar.");
    }
    setFavBusy(false);
  };

  return (
    <div
      className="glass rounded-3xl overflow-hidden card-hover animate-fadeUp relative"
      style={{ animationDelay: `${index * 50}ms`, opacity: busy ? 0.5 : 1 }}
    >
      <button onClick={onOpen} className="tap w-full text-left block">
        <div className="aspect-[4/3] w-full relative" style={{ background: SAND + "60" }}>
          {cover ? (
            <img src={cover} alt={look.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={22} color={WINE} opacity={0.35} />
            </div>
          )}
          <button
            onClick={handleFavorite}
            disabled={favBusy}
            className="tap absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center glass-dark"
            aria-label="Favoritar"
          >
            <Heart size={16} fill={isFavorite ? "#fff" : "none"} />
          </button>
          {look.look_images && look.look_images.length > 1 && (
            <span className="absolute bottom-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full glass-dark">
              +{look.look_images.length - 1} fotos
            </span>
          )}
        </div>
        <div className="p-5">
          {(look.artist || look.event) && (
            <p className="eyebrow mb-1" style={{ color: CRIMSON }}>
              {[look.artist, look.event].filter(Boolean).join(" · ")}
            </p>
          )}
          <h4 className="font-display text-xl italic mb-1.5" style={{ color: ONYX }}>
            {look.title}
          </h4>
          <div className="flex items-center gap-3 text-xs font-medium" style={{ color: WINE }}>
            <span className="flex items-center gap-1">
              <Star size={12} fill={GOLD} color={GOLD} /> {rating ? rating.toFixed(1) : "—"} ({look.votes?.length ?? 0})
            </span>
            <span className="flex items-center gap-1 opacity-70">
              <MessageCircle size={12} /> {look.comments?.length ?? 0}
            </span>
            {look.category && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(75,14,32,0.08)" }}>
                {look.category}
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between px-5 pb-4 pt-1 border-t hairline">
        <button onClick={onEdit} className="tap flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100">
          <Pencil size={13} /> Editar
        </button>
        <button onClick={onDuplicate} className="tap flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100">
          <Copy size={13} /> Duplicar
        </button>
        <button
          onClick={onDelete}
          className="tap flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100"
          style={{ color: CRIMSON }}
        >
          <Trash2 size={13} /> Excluir
        </button>
      </div>
    </div>
  );
}
