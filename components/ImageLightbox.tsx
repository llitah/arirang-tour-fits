"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}

export default function ImageLightbox({ images, index, onIndexChange, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onIndexChange((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onIndexChange]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button onClick={onClose} className="tap absolute top-5 right-5 text-white">
        <X size={26} />
      </button>
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((index - 1 + images.length) % images.length);
          }}
          className="tap absolute left-4 top-1/2 -translate-y-1/2 text-white"
        >
          <ChevronLeft size={30} />
        </button>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-h-[88vh] max-w-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onIndexChange((index + 1) % images.length);
          }}
          className="tap absolute right-4 top-1/2 -translate-y-1/2 text-white"
        >
          <ChevronRight size={30} />
        </button>
      )}
    </div>
  );
}
