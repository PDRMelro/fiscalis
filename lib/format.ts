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

/** "2026-08-12T10:00:00Z" -> "há 5 dias", "hoje", "há 2 meses", etc. */
export function formatarTempoRelativo(data: string | null | undefined): string {
  if (!data) return "ainda não entrou";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "ainda não entrou";

  const segundos = Math.floor((Date.now() - d.getTime()) / 1000);
  if (segundos < 60) return "agora mesmo";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `há ${semanas} semana${semanas > 1 ? "s" : ""}`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} ${meses > 1 ? "meses" : "mês"}`;
  const anos = Math.floor(dias / 365);
  return `há ${anos} ano${anos > 1 ? "s" : ""}`;
}

/** Input <input type="date"> espera sempre "yyyy-mm-dd". */
export function paraInputDate(data: string | Date | null | undefined): string {
  if (!data) return "";
  const d = typeof data === "string" ? new Date(data + (data.length === 10 ? "T00:00:00" : "")) : data;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
