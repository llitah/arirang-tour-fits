"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Star,
  Heart,
  MessageCircle,
  Send,
  Pencil,
  Copy,
  Trash2,
  Link2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";
import type { LookWithRelations, Profile } from "@/types/database";
import { fetchLookById, avgRating, duplicateLook } from "@/services/looks";
import { upsertVote } from "@/services/votes";
import { addComment, deleteComment } from "@/services/comments";
import { toggleFavorite } from "@/services/favorites";
import { useToast } from "./ui/Toast";
import ImageLightbox from "./ImageLightbox";
import { WINE, CRIMSON, GOLD, ONYX, SAND } from "@/lib/theme";
import { money } from "@/lib/utils/format";

interface Props {
  lookId: string;
  currentProfile: Profile;
  onClose: () => void;
  onChanged: () => void;
  onEdit: (look: LookWithRelations) => void;
  onDelete: (look: LookWithRelations) => void;
}

export default function LookDetailModal({ lookId, currentProfile, onClose, onChanged, onEdit, onDelete }: Props) {
  const { push } = useToast();
  const [look, setLook] = useState<LookWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [voting, setVoting] = useState(false);
  const [dupBusy, setDupBusy] = useState(false);

  const load = async () => {
    try {
      const data = await fetchLookById(lookId);
      setLook(data);
    } catch {
      push("error", "Não foi possível carregar o look.");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookId]);

  if (loading || !look) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(23,18,19,0.55)" }}>
        <div className="glass rounded-3xl p-10 animate-popIn font-display italic text-xl" style={{ color: WINE }}>
          carregando look…
        </div>
      </div>
    );
  }

  const images = look.look_images ?? [];
  const myVote = look.votes?.find((v) => v.profile_id === currentProfile.id);
  const isFavorite = look.favorites?.some((f) => f.profile_id === currentProfile.id);
  const rating = avgRating(look);

  const rate = async (value: number) => {
    setVoting(true);
    try {
      await upsertVote(look.id, currentProfile.id, value);
      await load();
      onChanged();
    } catch {
      push("error", "Não foi possível registrar o voto.");
    }
    setVoting(false);
  };

  const handleFavorite = async () => {
    try {
      await toggleFavorite(look.id, currentProfile.id, !!isFavorite);
      await load();
      onChanged();
    } catch {
      push("error", "Não foi possível favoritar.");
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(look.id, currentProfile.id, commentText.trim());
      setCommentText("");
      await load();
      onChanged();
    } catch {
      push("error", "Não foi possível comentar.");
    }
  };

  const removeComment = async (id: string) => {
    try {
      await deleteComment(id);
      await load();
      onChanged();
    } catch {
      push("error", "Não foi possível remover o comentário.");
    }
  };

  const handleDuplicate = async () => {
    setDupBusy(true);
    try {
      await duplicateLook(look, currentProfile.id);
      push("success", "Look duplicado.");
      onChanged();
      onClose();
    } catch {
      push("error", "Não foi possível duplicar.");
    }
    setDupBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(23,18,19,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto animate-popIn">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 glass border-b hairline">
          <div>
            {(look.artist || look.event) && (
              <p className="eyebrow" style={{ color: CRIMSON }}>
                {[look.artist, look.event].filter(Boolean).join(" · ")}
              </p>
            )}
            <h3 className="font-display italic text-2xl" style={{ color: ONYX }}>
              {look.title}
            </h3>
          </div>
          <button onClick={onClose} className="tap">
            <X size={20} />
          </button>
        </div>

        {images.length > 0 && (
          <div className="relative aspect-[4/3] sm:aspect-[16/9]" style={{ background: SAND + "60" }}>
            <img
              src={images[imgIdx]?.image_url}
              alt=""
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
            <button
              onClick={() => setLightbox(true)}
              className="tap absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center glass-dark"
            >
              <ZoomIn size={15} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="tap absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center glass-dark"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="tap absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center glass-dark"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.4)" }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Star size={16} fill={GOLD} color={GOLD} />
                <span className="font-semibold" style={{ color: WINE }}>
                  {rating ? rating.toFixed(1) : "—"}
                </span>
                <span className="text-xs opacity-50">({look.votes?.length ?? 0} votos)</span>
              </div>
              <button
                onClick={handleFavorite}
                className="tap flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                style={{ background: isFavorite ? WINE : "rgba(23,18,19,0.06)", color: isFavorite ? "#fff" : ONYX }}
              >
                <Heart size={14} fill={isFavorite ? "#fff" : "none"} /> Favorito
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(look)} className="tap flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full glass">
                <Pencil size={12} /> Editar
              </button>
              <button
                onClick={handleDuplicate}
                disabled={dupBusy}
                className="tap flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full glass"
              >
                <Copy size={12} /> Duplicar
              </button>
              <button
                onClick={() => onDelete(look)}
                className="tap flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full glass"
                style={{ color: CRIMSON }}
              >
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: WINE }}>
              Sua nota {myVote ? `(atual: ${myVote.rating})` : ""}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const value = i + 1;
                const active = !!myVote && myVote.rating >= value;
                return (
                  <button
                    key={value}
                    disabled={voting}
                    onClick={() => rate(value)}
                    className="tap w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                    style={{ background: active ? WINE : "rgba(23,18,19,0.06)", color: active ? "#fff" : ONYX }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            {look.votes && look.votes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {look.votes.map((v) => (
                  <span key={v.id} className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(23,18,19,0.06)" }}>
                    {v.profiles?.name ?? "?"}: {v.rating}
                  </span>
                ))}
              </div>
            )}
          </div>

          {(look.description || look.notes) && (
            <div className="flex flex-col gap-1 text-sm">
              {look.description && <p>{look.description}</p>}
              {look.notes && <p className="opacity-60 italic">{look.notes}</p>}
            </div>
          )}

          {look.products && look.products.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: WINE }}>
                Produtos
              </p>
              <div className="flex flex-col gap-2">
                {look.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border hairline px-3.5 py-2.5 bg-white/60">
                    <div>
                      <p className="text-sm font-medium">{p.product_name}</p>
                      <p className="text-xs opacity-60">{[p.brand, p.price != null ? money(p.price) : null].filter(Boolean).join(" · ")}</p>
                    </div>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-xs font-semibold flex items-center gap-1" style={{ color: WINE }}>
                        <Link2 size={12} /> loja
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: WINE }}>
              <MessageCircle size={13} /> Comentários
            </p>
            <div className="flex flex-col gap-3 mb-3 max-h-56 overflow-y-auto pr-1">
              {(look.comments ?? []).map((c) => (
                <div key={c.id} className="flex gap-2.5 group">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: c.profile_id === currentProfile.id ? WINE : GOLD, color: "#fff" }}
                  >
                    {c.profiles?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div
                    className="flex-1 rounded-2xl px-3.5 py-2"
                    style={{ background: c.profile_id === currentProfile.id ? "rgba(75,14,32,0.08)" : "rgba(23,18,19,0.05)" }}
                  >
                    <p className="text-xs font-semibold mb-0.5" style={{ color: WINE }}>
                      {c.profiles?.name}
                    </p>
                    <p className="text-sm">{c.comment}</p>
                  </div>
                  {c.profile_id === currentProfile.id && (
                    <button onClick={() => removeComment(c.id)} className="tap opacity-0 group-hover:opacity-60 self-start mt-1">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              {(!look.comments || look.comments.length === 0) && <p className="text-sm opacity-50">Nenhum comentário ainda.</p>}
            </div>
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Escreva um comentário…"
                className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white/70 outline-none border hairline"
              />
              <button onClick={submitComment} className="tap w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: WINE }}>
                <Send size={16} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightbox && images.length > 0 && (
        <ImageLightbox images={images.map((i) => i.image_url)} index={imgIdx} onIndexChange={setImgIdx} onClose={() => setLightbox(false)} />
      )}
    </div>
  );
}
