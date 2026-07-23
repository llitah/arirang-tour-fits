"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import type { LookWithRelations, Profile } from "@/types/database";
import { createLook, updateLook } from "@/services/looks";
import { uploadLookImage, addLookImageRow, deleteLookImage, reorderLookImages } from "@/services/images";
import { replaceLookProducts } from "@/services/products";
import ImageUploader, { type UploaderImage } from "./ImageUploader";
import ProductsEditor, { type ProductDraft } from "./ProductsEditor";
import { useToast } from "./ui/Toast";
import { WINE, ONYX } from "@/lib/theme";

interface Props {
  look: LookWithRelations | null;
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}

export default function LookFormModal({ look, profile, onClose, onSaved }: Props) {
  const { push } = useToast();
  const [title, setTitle] = useState(look?.title ?? "");
  const [description, setDescription] = useState(look?.description ?? "");
  const [artist, setArtist] = useState(look?.artist ?? "");
  const [event, setEvent] = useState(look?.event ?? "");
  const [category, setCategory] = useState(look?.category ?? "");
  const [notes, setNotes] = useState(look?.notes ?? "");
  const [images, setImages] = useState<UploaderImage[]>(
    (look?.look_images ?? []).map((img) => ({ kind: "existing" as const, id: img.id, url: img.image_url }))
  );
  const [products, setProducts] = useState<ProductDraft[]>(
    (look?.products ?? []).map((p) => ({
      key: p.id,
      product_name: p.product_name,
      brand: p.brand ?? "",
      price: p.price != null ? String(p.price) : "",
      url: p.url ?? "",
    }))
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      push("error", "Dê um título para o look.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        artist: artist.trim(),
        event: event.trim(),
        category: category.trim(),
        notes: notes.trim(),
        created_by: profile.id,
      };

      let lookId: string;
      if (look) {
        await updateLook(look.id, payload);
        lookId = look.id;
      } else {
        const created = await createLook(payload);
        lookId = created.id;
      }

      // imagens que existiam antes e foram removidas na edição
      const existingBefore = look?.look_images ?? [];
      const stillExistingIds = new Set(
        images.filter((i): i is Extract<UploaderImage, { kind: "existing" }> => i.kind === "existing").map((i) => i.id)
      );
      const removed = existingBefore.filter((img) => !stillExistingIds.has(img.id));
      for (const img of removed) {
        await deleteLookImage(img);
      }

      // envia as novas fotos para o Storage e grava a ordem final
      const finalOrder: { id: string; order_index: number }[] = [];
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        if (img.kind === "existing") {
          finalOrder.push({ id: img.id, order_index: idx });
        } else {
          const url = await uploadLookImage(lookId, img.file);
          const row = await addLookImageRow(lookId, url, idx);
          finalOrder.push({ id: row.id, order_index: idx });
        }
      }
      await reorderLookImages(finalOrder);

      // produtos: substitui a lista inteira
      const productRows = products
        .filter((p) => p.product_name.trim())
        .map((p) => ({
          product_name: p.product_name.trim(),
          brand: p.brand.trim() || null,
          price: p.price ? parseFloat(p.price.replace(",", ".")) : null,
          url: p.url.trim() || null,
        }));
      await replaceLookProducts(lookId, productRows);

      push("success", look ? "Look atualizado." : "Look criado.");
      onSaved();
    } catch (e: any) {
      push("error", e?.message ?? "Não foi possível salvar o look.");
    }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(23,18,19,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="glass rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto animate-popIn">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 glass border-b hairline">
          <h3 className="font-display italic text-2xl" style={{ color: ONYX }}>
            {look ? "Editar look" : "Novo look"}
          </h3>
          <button onClick={onClose} className="tap">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do look"
            className="text-lg font-display px-4 py-3 rounded-xl bg-white/70 border hairline outline-none"
          />

          <div className="grid sm:grid-cols-3 gap-3">
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artista"
              className="text-sm px-3.5 py-2.5 rounded-xl bg-white/70 border hairline outline-none"
            />
            <input
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="Evento (ex: Show 28, Viagem SP)"
              className="text-sm px-3.5 py-2.5 rounded-xl bg-white/70 border hairline outline-none"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Categoria"
              className="text-sm px-3.5 py-2.5 rounded-xl bg-white/70 border hairline outline-none"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            rows={2}
            className="text-sm px-3.5 py-2.5 rounded-xl bg-white/70 border hairline outline-none resize-none"
          />

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: WINE }}>
              Fotos
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: WINE }}>
              Produtos
            </p>
            <ProductsEditor products={products} onChange={setProducts} />
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações"
            rows={2}
            className="text-sm px-3.5 py-2.5 rounded-xl bg-white/70 border hairline outline-none resize-none"
          />
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 px-6 py-4 glass border-t hairline">
          <button
            onClick={onClose}
            className="tap px-4 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: "rgba(23,18,19,0.06)" }}
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="tap px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${WINE}, #93132E)`, color: "#fff", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Salvando…" : "Salvar look"}
          </button>
        </div>
      </div>
    </div>
  );
}
