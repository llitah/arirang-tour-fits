"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { Check, AlertCircle, X } from "lucide-react";
import { WINE, CRIMSON } from "@/lib/theme";

type ToastKind = "success" | "error";
interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-0 right-0 sm:left-auto sm:right-4 z-[100] flex flex-col gap-2 max-w-xs w-full px-4 sm:px-0 mx-auto sm:mx-0">
        {items.map((i) => (
          <div
            key={i.id}
            className="animate-popIn rounded-2xl px-4 py-3 shadow-lg flex items-start gap-2.5 text-sm glass"
          >
            {i.kind === "success" ? (
              <Check size={16} color={WINE} className="mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} color={CRIMSON} className="mt-0.5 flex-shrink-0" />
            )}
            <span className="flex-1">{i.message}</span>
            <button onClick={() => remove(i.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
