/**
 * O Supabase Storage recusa certos caracteres no caminho do ficheiro (ex:
 * "[", "]"), mesmo que o nome original apareça normal em qualquer lado.
 * Isto gera uma versão só com letras/números/pontuação simples, para usar
 * apenas no caminho de armazenamento — o nome original continua a ser
 * guardado tal e qual na base de dados para mostrar ao utilizador.
 */
export function nomeSeguro(nome: string): string {
  const idx = nome.lastIndexOf(".");
  const base = idx > 0 ? nome.slice(0, idx) : nome;
  const ext = idx > 0 ? nome.slice(idx + 1).replace(/[^a-zA-Z0-9]/g, "") : "";

  const baseSegura = base
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // acentos (á -> a, ç -> c, etc.)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "");

  const nomeFinal = baseSegura || "ficheiro";
  return ext ? `${nomeFinal}.${ext}` : nomeFinal;
}
