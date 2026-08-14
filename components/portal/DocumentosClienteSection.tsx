import { FileArchive } from "lucide-react";
import { CATEGORIAS_DOC } from "@/lib/categoriasDocumento";
import { DocumentoUploadCliente } from "@/components/portal/DocumentoUploadCliente";
import type { DocumentoRow } from "@/lib/supabase/types";

export function DocumentosClienteSection({
  obraId,
  documentos,
  podeEnviar,
}: {
  obraId: string;
  documentos: DocumentoRow[];
  podeEnviar: boolean;
}) {
  const semCategoria = documentos.filter((d) => !d.categoria || !CATEGORIAS_DOC.includes(d.categoria as (typeof CATEGORIAS_DOC)[number]));

  return (
    <div className="mt-6">
      <p className="text-[12px] font-medium text-[#4A4740] mb-2">Documentos do projeto</p>

      {documentos.length === 0 && !podeEnviar && <p className="text-[12px] text-[#8A8578]">Sem documentos.</p>}

      {(documentos.length > 0 || podeEnviar) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {CATEGORIAS_DOC.map((cat) => {
            const docs = documentos.filter((d) => d.categoria === cat);
            if (docs.length === 0 && !podeEnviar) return null;
            return (
              <div key={cat} className="bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-2.5">
                <p className="text-[11px] font-medium text-[#14283A] mb-1.5">{cat}</p>
                {podeEnviar && <DocumentoUploadCliente obraId={obraId} categoria={cat} compacto />}
                {docs.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {docs.map((d) => (
                      <a
                        key={d.id}
                        href={`/api/documentos/${d.id}/download`}
                        className="flex items-center gap-1.5 text-[11px] text-[#4A4740] hover:underline"
                      >
                        <FileArchive size={11} className="text-[#8A8578] shrink-0" />
                        <span className="truncate">{d.nome_ficheiro}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {semCategoria.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {semCategoria.map((d) => (
            <a
              key={d.id}
              href={`/api/documentos/${d.id}/download`}
              className="text-[11px] text-[#4A4740] bg-[#F5F4EF] border border-[#E4E1D6] rounded px-2 py-1 hover:bg-[#EDEBE2]"
            >
              {d.nome_ficheiro}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
