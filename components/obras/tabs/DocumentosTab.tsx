import { ShieldCheck, Trash2, Download } from "lucide-react";
import { eliminarDocumento } from "@/lib/actions/documentos";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";
import { GrupoDocumentosCard } from "@/components/obras/GrupoDocumentosCard";
import { GrupoDocumentosOrcamentoCard } from "@/components/obras/GrupoDocumentosOrcamentoCard";
import { LinhaDocumento } from "@/components/obras/LinhaDocumento";
import { GerarTermoButton } from "@/components/obras/GerarTermoButton";
import { formatarData } from "@/lib/format";
import { CATEGORIAS_DOC } from "@/lib/categoriasDocumento";
import type { DocumentoRow } from "@/lib/supabase/types";

export function DocumentosTab({
  obraId,
  recebidos,
  enviados,
  orcamentos,
}: {
  obraId: string;
  recebidos: DocumentoRow[];
  enviados: DocumentoRow[];
  orcamentos: { id: string; servico: string }[];
}) {
  const semCategoria = recebidos.filter(
    (d) => !d.orcamento_id && (!d.categoria || !CATEGORIAS_DOC.includes(d.categoria as never))
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-[13px] font-medium text-[#4A4740] mb-1">Recebidos do cliente</p>
        <p className="text-[12px] text-[#8A8578] mb-3">Clica numa das caixas para ver e adicionar documentos.</p>

        <div className="grid grid-cols-2 max-w-md gap-3">
          {CATEGORIAS_DOC.map((categoria) => (
            <GrupoDocumentosCard key={categoria} obraId={obraId} categoria={categoria} documentos={recebidos} />
          ))}
          {orcamentos.length > 0 && (
            <GrupoDocumentosOrcamentoCard obraId={obraId} documentos={recebidos} orcamentos={orcamentos} />
          )}
        </div>

        {semCategoria.length > 0 && (
          <div className="mt-3 bg-white border border-[#E4E1D6] rounded-xl p-3 max-w-md">
            <p className="text-[12px] font-medium text-[#14283A] mb-2">Sem categoria</p>
            <div className="divide-y divide-[#F2F0E8]">
              {semCategoria.map((d) => (
                <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#E4E1D6]" />

      <div>
        <p className="text-[13px] font-medium text-[#4A4740] mb-3">Enviados ao cliente</p>

        <div className="mb-3">
          <GerarTermoButton obraId={obraId} />
        </div>

        <div className="mb-3 max-w-md">
          <DocumentoDropzone obraId={obraId} direcao="enviado" />
        </div>

        {enviados.length === 0 ? (
          <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-6 text-center text-[13px] text-[#8A8578]">
            Ainda sem documentos enviados a esta obra.
          </div>
        ) : (
          <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
            {enviados.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#F5EFDD] flex items-center justify-center text-[#8A4A17] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[#1F1D19] truncate">{d.nome_ficheiro}</p>
                  <p className="text-[11px] text-[#8A8578]">
                    {d.tipo || "Documento"} · {formatarData(d.created_at)}
                  </p>
                </div>
                <a
                  href={`/api/documentos/${d.id}/download`}
                  className="text-[#8A8578] hover:text-[#14283A] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={14} />
                </a>
                <form action={eliminarDocumento.bind(null, obraId, d.id)}>
                  <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
