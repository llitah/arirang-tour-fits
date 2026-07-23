"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { WINE, CRIMSON, ONYX } from "@/lib/theme";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  danger,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{ background: "rgba(23,18,19,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div className="glass rounded-3xl max-w-sm w-full p-6 animate-popIn text-center">
        <AlertTriangle className="mx-auto mb-3" size={26} color={danger ? CRIMSON : WINE} />
        <h3 className="font-display italic text-xl mb-2" style={{ color: ONYX }}>
          {title}
        </h3>
        <p className="text-sm opacity-70 mb-6">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="tap flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: "rgba(23,18,19,0.06)" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="tap flex-1 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: danger ? CRIMSON : WINE, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "Excluindo…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
