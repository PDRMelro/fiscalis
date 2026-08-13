import { FileArchive, ShieldCheck, Upload, Trash2, Download } from "lucide-react";
import { uploadDocumento, eliminarDocumento, gerarTermoResponsabilidade } from "@/lib/actions/documentos";
import { formatarData } from "@/lib/format";
import type { DocumentoRow } from "@/lib/supabase/types";

const CATEGORIAS_DOC = ["Arquitetura", "Estruturas", "Águas e esgotos", "Eletricidade", "Térmica e acústica", "Outros"];

function tamanho(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3 gap-4">
          <p className="text-[13px] font-medium text-[#4A4740]">
            Recebidos do cliente{" "}
            <span className="text-[#8A8578] font-normal">— projetos de arquitetura e especialidades</span>
          </p>
        </div>

        <form
          action={uploadDocumento.bind(null, obraId, "recebido")}
          encType="multipart/form-data"
          className="flex items-center gap-2 mb-3 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-2.5"
        >
          <select name="categoria" className="text-[12px] border border-[#DEDBD2] rounded-lg px-2 py-1.5 bg-white">
            {CATEGORIAS_DOC.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input name="ficheiro" type="file" required className="flex-1 text-[12px]" />
          <button
            type="submit"
            className="flex items-center gap-1.5 text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5 shrink-0"
          >
            <Upload size={13} /> Adicionar ficheiro
          </button>
        </form>

        {recebidos.length === 0 ? (
          <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-6 text-center text-[13px] text-[#8A8578]">
            Ainda sem documentos recebidos nesta obra.
          </div>
        ) : (
          <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
            {recebidos.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3 group">
                <div className="w-9 h-9 rounded-lg bg-[#F0EEE5] flex items-center justify-center text-[#8A8578] shrink-0">
                  <FileArchive size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-[#1F1D19] truncate">{d.nome_ficheiro}</p>
                  <p className="text-[11px] text-[#8A8578]">
                    {d.categoria} · {formatarData(d.created_at)} · {tamanho(d.tamanho_bytes)}
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

      <div className="border-t border-[#E4E1D6]" />

      <div>
        <p className="text-[13px] font-medium text-[#4A4740] mb-3">Enviados ao cliente</p>

        <div className="flex gap-2 mb-3">
          <form action={gerarTermoResponsabilidade.bind(null, obraId)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5"
            >
              <ShieldCheck size={13} /> Gerar Termo de Responsabilidade
            </button>
          </form>
        </div>

        <form
          action={uploadDocumento.bind(null, obraId, "enviado")}
          encType="multipart/form-data"
          className="flex items-center gap-2 mb-3 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-2.5"
        >
          <input name="ficheiro" type="file" required className="flex-1 text-[12px]" />
          <button
            type="submit"
            className="flex items-center gap-1.5 text-[12px] text-[#14283A] border border-[#DEDBD2] bg-white rounded-lg px-3 py-1.5 shrink-0"
          >
            <Upload size={13} /> Adicionar outro documento
          </button>
        </form>

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
