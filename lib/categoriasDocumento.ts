export const CATEGORIAS_DOC = ["Arquitetura", "Especialidades"] as const;

export type CategoriaDoc = (typeof CATEGORIAS_DOC)[number];

export function extensoesDeDocumentos(docs: { nome_ficheiro: string }[]): string {
  const exts = new Set(
    docs.map((d) => {
      const partes = d.nome_ficheiro.split(".");
      return partes.length > 1 ? partes[partes.length - 1].toUpperCase() : "?";
    })
  );
  return Array.from(exts).sort().join(", ");
}

export function resumoGrupo(docs: { nome_ficheiro: string }[]): string {
  if (docs.length === 0) return "Sem documentos";
  const exts = extensoesDeDocumentos(docs);
  return `${docs.length} documento${docs.length > 1 ? "s" : ""}${exts ? ` · ${exts}` : ""}`;
}
