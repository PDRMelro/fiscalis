import { FileArchive } from "lucide-react";
import { CATEGORIAS_DOC, CATEGORIAS_ENVIADO_DOC } from "@/lib/categoriasDocumento";
import { GrupoDocumentosClienteCard } from "@/components/portal/GrupoDocumentosClienteCard";
import { GrupoDocumentosOrcamentoClienteCard } from "@/components/portal/GrupoDocumentosOrcamentoClienteCard";
import type { DocumentoRow } from "@/lib/supabase/types";

export function DocumentosClienteSection({
  obraId,
  documentos,
  podeEnviar,
  orcamentos,
}: {
  obraId: string;
  documentos: DocumentoRow[];
  podeEnviar: boolean;
  orcamentos: { id: string; servico: string }[];
}) {
  const recebidos = documentos.filter((d) => d.direcao === "recebido");
  const enviados = documentos.filter((d) => d.direcao === "enviado");

  const semCategoria = recebidos.filter(
    (d) => !d.orcamento_id && (!d.categoria || !CATEGORIAS_DOC.includes(d.categoria as never))
  );
  const enviadosSemCategoria = enviados.filter(
    (d) => !d.categoria || !CATEGORIAS_ENVIADO_DOC.includes(d.categoria as never)
  );

  return (
    <div className="mt-6">
      <p className="text-[12px] font-medium text-[#4A4740] mb-2">Documentos do projeto</p>

      <div className="grid grid-cols-2 gap-2.5 max-w-sm">
        {CATEGORIAS_DOC.map((categoria) => (
          <GrupoDocumentosClienteCard
            key={categoria}
            obraId={obraId}
            categoria={categoria}
            documentos={recebidos}
            podeEnviar={podeEnviar}
          />
        ))}
        {orcamentos.length > 0 && (
          <GrupoDocumentosOrcamentoClienteCard documentos={recebidos} orcamentos={orcamentos} />
        )}
      </div>

      {semCategoria.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {semCategoria.map((d) => (
            <a
              key={d.id}
              href={`/api/documentos/${d.id}/download`}
              className="flex items-center gap-1.5 text-[11px] text-[#4A4740] bg-[#F5F4EF] border border-[#E4E1D6] rounded px-2 py-1 hover:bg-[#EDEBE2]"
            >
              <FileArchive size={11} className="text-[#8A8578]" />
              {d.nome_ficheiro}
            </a>
          ))}
        </div>
      )}

      <p className="text-[12px] font-medium text-[#4A4740] mt-5 mb-2">Documentos enviados pelo fiscal</p>

      <div className="grid grid-cols-2 gap-2.5 max-w-sm">
        {CATEGORIAS_ENVIADO_DOC.map((categoria) => (
          <GrupoDocumentosClienteCard
            key={categoria}
            obraId={obraId}
            categoria={categoria}
            documentos={enviados}
            podeEnviar={false}
          />
        ))}
      </div>

      {enviadosSemCategoria.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {enviadosSemCategoria.map((d) => (
            <a
              key={d.id}
              href={`/api/documentos/${d.id}/download`}
              className="flex items-center gap-1.5 text-[11px] text-[#4A4740] bg-[#F5F4EF] border border-[#E4E1D6] rounded px-2 py-1 hover:bg-[#EDEBE2]"
            >
              <FileArchive size={11} className="text-[#8A8578]" />
              {d.nome_ficheiro}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
