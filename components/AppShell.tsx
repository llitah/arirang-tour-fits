"use client";

import React, { useMemo, useState } from "react";
import { Plus, Sparkles, RefreshCw, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLooks } from "@/hooks/useLooks";
import type { LookFilters } from "@/services/looks";
import { deleteLook, duplicateLook } from "@/services/looks";
import type { LookWithRelations } from "@/types/database";
import PersonPicker from "./PersonPicker";
import LookGrid from "./LookGrid";
import FiltersBar from "./FiltersBar";
import LookFormModal from "./LookFormModal";
import LookDetailModal from "./LookDetailModal";
import ConfirmDialog from "./ui/ConfirmDialog";
import { useToast } from "./ui/Toast";
import { ONYX, WINE, CRIMSON, GOLD } from "@/lib/theme";

export default function AppShell() {
  const { profiles, profile, choose, reset, loading: loadingProfile } = useProfile();
  const { push } = useToast();

  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [event, setEvent] = useState("");
  const [category, setCategory] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [createdBy, setCreatedBy] = useState("");
  const [sort, setSort] = useState<NonNullable<LookFilters["sort"]>>("recent");

  const filters: LookFilters = useMemo(
    () => ({
      search: search || undefined,
      artist: artist || undefined,
      event: event || undefined,
      category: category || undefined,
      createdBy: createdBy || undefined,
      onlyFavoritesOf: onlyFavorites && profile ? profile.id : undefined,
      sort,
    }),
    [search, artist, event, category, createdBy, onlyFavorites, profile, sort]
  );

  const { looks, loading, reload } = useLooks(filters);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLook, setEditingLook] = useState<LookWithRelations | null>(null);
  const [detailLook, setDetailLook] = useState<LookWithRelations | null>(null);
  const [deletingLook, setDeletingLook] = useState<LookWithRelations | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const options = useMemo(() => {
    const artists = new Set<string>();
    const events = new Set<string>();
    const categories = new Set<string>();
    looks.forEach((l) => {
      if (l.artist) artists.add(l.artist);
      if (l.event) events.add(l.event);
      if (l.category) categories.add(l.category);
    });
    return {
      artists: Array.from(artists).sort(),
      events: Array.from(events).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [looks]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#F6F1EA" }}>
        <div className="font-display italic text-2xl" style={{ color: WINE }}>
          carregando…
        </div>
      </div>
    );
  }

  if (!profile) {
    return <PersonPicker profiles={profiles} onChoose={choose} />;
  }

  const handleDuplicate = async (look: LookWithRelations) => {
    setBusyId(look.id);
    try {
      await duplicateLook(look, profile.id);
      push("success", "Look duplicado.");
      reload();
    } catch (e: any) {
      push("error", e?.message ?? "Não foi possível duplicar.");
    }
    setBusyId(null);
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingLook) return;
    setBusyId(deletingLook.id);
    try {
      await deleteLook(deletingLook);
      push("success", "Look excluído.");
      setDeletingLook(null);
      setDetailLook(null);
      reload();
    } catch (e: any) {
      push("error", e?.message ?? "Não foi possível excluir.");
    }
    setBusyId(null);
  };

  return (
    <div className="min-h-screen w-full font-body" style={{ background: "#F6F1EA", color: ONYX }}>
      <header
        className="sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(120deg, ${ONYX}, ${WINE} 65%, ${CRIMSON})`, color: "#F6F1EA" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={20} color={GOLD} />
          <span className="font-display italic text-xl tracking-wide">Arirang Looks</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => reload()} className="tap p-2 rounded-full glass-dark" title="Atualizar">
            <RefreshCw size={15} />
          </button>
          <button onClick={reset} className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-dark text-sm font-medium">
            <User size={14} /> {profile.name}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-6">
        <section
          className="rounded-3xl overflow-hidden relative mb-8 p-8 sm:p-10"
          style={{ background: `linear-gradient(135deg, ${ONYX}, ${WINE} 60%, ${CRIMSON})` }}
        >
          <p className="eyebrow" style={{ color: GOLD }}>
            looks & viagens
          </p>
          <h1 className="font-display italic text-3xl sm:text-4xl mt-2 mb-4" style={{ color: "#F6F1EA" }}>
            Organizem, comparem e votem em cada look.
          </h1>
          <button
            onClick={() => {
              setEditingLook(null);
              setFormOpen(true);
            }}
            className="tap flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: "#F6F1EA", color: WINE }}
          >
            <Plus size={16} /> Novo look
          </button>
        </section>

        <FiltersBar
          search={search}
          setSearch={setSearch}
          artist={artist}
          setArtist={setArtist}
          event={event}
          setEvent={setEvent}
          category={category}
          setCategory={setCategory}
          onlyFavorites={onlyFavorites}
          setOnlyFavorites={setOnlyFavorites}
          createdBy={createdBy}
          setCreatedBy={setCreatedBy}
          sort={sort}
          setSort={setSort}
          profiles={profiles}
          options={options}
        />

        <LookGrid
          looks={looks}
          loading={loading}
          currentProfile={profile}
          busyId={busyId}
          onOpen={(l) => setDetailLook(l)}
          onEdit={(l) => {
            setEditingLook(l);
            setFormOpen(true);
          }}
          onDuplicate={handleDuplicate}
          onDelete={(l) => setDeletingLook(l)}
        />
      </main>

      {formOpen && (
        <LookFormModal
          look={editingLook}
          profile={profile}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            reload();
          }}
        />
      )}

      {detailLook && (
        <LookDetailModal
          lookId={detailLook.id}
          currentProfile={profile}
          onClose={() => setDetailLook(null)}
          onChanged={reload}
          onEdit={(l) => {
            setDetailLook(null);
            setEditingLook(l);
            setFormOpen(true);
          }}
          onDelete={(l) => setDeletingLook(l)}
        />
      )}

      {deletingLook && (
        <ConfirmDialog
          title="Excluir este look?"
          message={`"${deletingLook.title}" será removido para sempre, junto com fotos, produtos, votos e comentários.`}
          confirmLabel="Excluir"
          danger
          busy={busyId === deletingLook.id}
          onCancel={() => setDeletingLook(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}
