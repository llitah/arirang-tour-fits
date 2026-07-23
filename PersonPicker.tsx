"use client";

import React, { useRef, useState } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { WINE, SAND } from "@/lib/theme";

export type UploaderImage =
  | { kind: "existing"; id: string; url: string }
  | { kind: "pending"; tempId: string; file: File; previewUrl: string };

interface Props {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
}

function keyOf(img: UploaderImage) {
  return img.kind === "existing" ? img.id : img.tempId;
}
function urlOf(img: UploaderImage) {
  return img.kind === "existing" ? img.url : img.previewUrl;
}

export default function ImageUploader({ images, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const next: UploaderImage[] = [...images];
    Array.from(files).forEach((file) => {
      next.push({
        kind: "pending",
        tempId: Math.random().toString(36).slice(2),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });
    onChange(next);
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const onDrop = (idx: number) => {
    if (dragIndex.current === null || dragIndex.current === idx) return;
    const next = [...images];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    dragIndex.current = null;
    setOverIndex(null);
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-2.5">
        {images.map((img, idx) => (
          <div
            key={keyOf(img)}
            draggable
            onDragStart={() => (dragIndex.current = idx)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(idx);
            }}
            onDragLeave={() => setOverIndex((cur) => (cur === idx ? null : cur))}
            onDrop={() => onDrop(idx)}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-grab"
            style={{ background: SAND + "60", outline: overIndex === idx ? `2px solid ${WINE}` : "none" }}
          >
            <img src={urlOf(img)} alt="" className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={14} color="#fff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))" }} />
            </div>
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="tap absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "rgba(23,18,19,0.65)" }}
            >
              <X size={12} color="#fff" />
            </button>
            {idx === 0 && (
              <span
                className="absolute bottom-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(23,18,19,0.65)", color: "#fff" }}
              >
                capa
              </span>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="tap aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed hairline"
        >
          <Upload size={16} color={WINE} />
          <span className="text-[10px] font-medium" style={{ color: WINE }}>
            Adicionar
          </span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="text-[11px] opacity-50">Arraste as fotos para reordenar. A primeira é a capa do look.</p>
    </div>
  );
}
