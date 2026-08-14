import { FileArchive, Trash2, Download } from "lucide-react";
import { eliminarDocumento } from "@/lib/actions/documentos";
import type { DocumentoRow } from "@/lib/supabase/types";

function tamanho(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LinhaDocumento({ obraId, doc }: { obraId: string; doc: DocumentoRow }) {
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
