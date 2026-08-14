const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Formata "2026-08-12" (ou Date) como "12 Ago 2026", igual ao protótipo original. */
export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data + (data.length === 10 ? "T00:00:00" : "")) : data;
  if (Number.isNaN(d.getTime())) return "—";
  const dia = String(d.getDate()).padStart(2, "0");
  return `${dia} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatarDinheiro(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(valor);
}

/** valor guardado é sempre sem IVA; isto calcula o valor com IVA a partir da taxa (%). */
export function comIva(valorSemIva: number, taxaIva: number): number {
  return valorSemIva * (1 + taxaIva / 100);
}

/** Input <input type="date"> espera sempre "yyyy-mm-dd". */
export function paraInputDate(data: string | Date | null | undefined): string {
  if (!data) return "";
  const d = typeof data === "string" ? new Date(data + (data.length === 10 ? "T00:00:00" : "")) : data;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
