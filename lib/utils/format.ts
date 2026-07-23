export function money(v: number | string | null | undefined): string {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (n == null || isNaN(n)) return "R$ 0,00";
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function dateBR(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
