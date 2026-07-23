"use client";

import React from "react";
import { Plus, Trash2, Link2, DollarSign, Tag } from "lucide-react";
import { WINE } from "@/lib/theme";

export interface ProductDraft {
  key: string;
  product_name: string;
  brand: string;
  price: string;
  url: string;
}

interface Props {
  products: ProductDraft[];
  onChange: (products: ProductDraft[]) => void;
}

export default function ProductsEditor({ products, onChange }: Props) {
  const update = (idx: number, field: keyof ProductDraft, value: string) => {
    const next = [...products];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const add = () =>
    onChange([...products, { key: Math.random().toString(36).slice(2), product_name: "", brand: "", price: "", url: "" }]);

  const remove = (idx: number) => onChange(products.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-2.5">
      {products.map((p, idx) => (
        <div key={p.key} className="rounded-xl border hairline p-3 flex flex-col gap-2 bg-white/60">
          <div className="flex gap-2">
            <input
              value={p.product_name}
              onChange={(e) => update(idx, "product_name", e.target.value)}
              placeholder="Nome do produto"
              className="flex-1 text-sm rounded-lg px-3 py-2 bg-white/70 border hairline outline-none"
            />
            <button type="button" onClick={() => remove(idx)} className="tap opacity-50 hover:opacity-90">
              <Trash2 size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center rounded-lg bg-white/70 border hairline px-2.5">
              <Tag size={12} color={WINE} className="flex-shrink-0" />
              <input
                value={p.brand}
                onChange={(e) => update(idx, "brand", e.target.value)}
                placeholder="Marca"
                className="text-xs px-2 py-2 w-full outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center rounded-lg bg-white/70 border hairline px-2.5">
              <DollarSign size={12} color={WINE} className="flex-shrink-0" />
              <input
                value={p.price}
                onChange={(e) => update(idx, "price", e.target.value)}
                placeholder="Preço"
                inputMode="decimal"
                className="text-xs px-2 py-2 w-full outline-none bg-transparent"
              />
            </div>
          </div>
          <div className="flex items-center rounded-lg bg-white/70 border hairline px-2.5">
            <Link2 size={12} color={WINE} className="flex-shrink-0" />
            <input
              value={p.url}
              onChange={(e) => update(idx, "url", e.target.value)}
              placeholder="Link da loja"
              className="text-xs px-2 py-2 w-full outline-none bg-transparent"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="tap flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl border-2 border-dashed hairline"
        style={{ color: WINE }}
      >
        <Plus size={13} /> Adicionar produto
      </button>
    </div>
  );
}
