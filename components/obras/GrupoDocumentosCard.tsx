"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";
import { LinhaDocumento } from "@/components/obras/LinhaDocumento";
import { resumoGrupo } from "@/lib/categoriasDocumento";
import type { DocumentoRow, DirecaoDocumento } from "@/lib/supabase/types";

export function GrupoDocumentosCard({
  obraId,
  categoria,
  documentos,
  direcao = "recebido",
}: {
  obraId: string;
  categoria: string;
  documentos: DocumentoRow[];
  direcao?: DirecaoDocumento;
}) {
  const [open, setOpen] = useState(false);
  const docsDoGrupo = documentos.filter((d) => d.categoria === categoria);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-white border border-[#E4E1D6] rounded-xl p-4 hover:border-[#C9A050] hover:shadow-[0_4px_14px_rgba(20,40,58,0.08)] transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F0EEE5] flex items-center justify-center text-[#8A8578] shrink-0">
            <FolderOpen size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#14283A]">{categoria}</p>
            <p className="text-[11px] text-[#8A8578] truncate">{resumoGrupo(docsDoGrupo)}</p>
          </div>
        </div>
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth="max-w-lg">
        {() => (
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-[#14283A] mb-3">{categoria}</h2>

            <DocumentoDropzone obraId={obraId} direcao={direcao} categoria={categoria} />

            <div className="mt-3 divide-y divide-[#F2F0E8]">
              {docsDoGrupo.length === 0 && (
                <p className="text-[12px] text-[#8A8578] py-3 text-center">Ainda sem documentos.</p>
              )}
              {docsDoGrupo.map((d) => (
                <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
              ))}
            </div>
          </div>
        )}
      </ModalShell>
    </>
  );
}
