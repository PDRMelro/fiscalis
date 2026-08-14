import { FileArchive, ShieldCheck, Trash2, Download } from "lucide-react";
import { eliminarDocumento } from "@/lib/actions/documentos";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";
import { GerarTermoButton } from "@/components/obras/GerarTermoButton";
import { formatarData } from "@/lib/format";
import { CATEGORIAS_DOC } from "@/lib/categoriasDocumento";
import type { DocumentoRow } from "@/lib/supabase/types";

function tamanho(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function LinhaDocumento({ obraId, doc }: { obraId: string; doc: DocumentoRow }) {
  return (
    <div className="flex items-center gap-2 py-1.5 group">
      <FileArchive size={13} className="text-[#8A8578] shrink-0" />
      <a
        href={`/api/documentos/${doc.id}/download`}
        className="text-[12px] text-[#1F1D19] truncate flex-1 hover:underline"
        title={doc.nome_ficheiro}
      >
        {doc.nome_ficheiro}
      </a>
      <span className="text-[10px] text-[#8A8578] font-mono shrink-0">{tamanho(doc.tamanho_bytes)}</span>
      <a
        href={`/api/documentos/${doc.id}/download`}
        className="text-[#8A8578] hover:text-[#14283A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        <Download size={12} />
      </a>
      <form action={eliminarDocumento.bind(null, obraId, doc.id)}>
        <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Trash2 size={12} />
        </button>
      </form>
    </div>
  );
}

export function DocumentosTab({
  obraId,
  recebidos,
  enviados,
}: {
  obraId: string;
  recebidos: DocumentoRow[];
  enviados: DocumentoRow[];
}) {
  const semCategoria = recebidos.filter(
    (d) => !d.categoria || !CATEGORIAS_DOC.includes(d.categoria as (typeof CATEGORIAS_DOC)[number])
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-[13px] font-medium text-[#4A4740] mb-1">Recebidos do cliente</p>
        <p className="text-[12px] text-[#8A8578] mb-3">
          Arrasta os ficheiros diretamente para o quadrado da especialidade correta.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIAS_DOC.map((cat) => {
            const docs = recebidos.filter((d) => d.categoria === cat);
            return (
              <div key={cat} className="bg-white border border-[#E4E1D6] rounded-xl p-3">
                <p className="text-[12px] font-medium text-[#14283A] mb-2">{cat}</p>
                <DocumentoDropzone obraId={obraId} direcao="recebido" categoria={cat} compacto />
                {docs.length > 0 && (
                  <div className="mt-2 divide-y divide-[#F2F0E8]">
                    {docs.map((d) => (
                      <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {semCategoria.length > 0 && (
          <div className="mt-3 bg-white border border-[#E4E1D6] rounded-xl p-3">
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
