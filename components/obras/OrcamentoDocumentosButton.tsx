"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";
import { LinhaDocumento } from "@/components/obras/LinhaDocumento";
import type { DocumentoRow } from "@/lib/supabase/types";

export function OrcamentoDocumentosButton({
  obraId,
  orcamentoId,
  servico,
  documentos,
}: {
  obraId: string;
  orcamentoId: string;
  servico: string;
  documentos: DocumentoRow[];
}) {
  const [open, setOpen] = useState(false);
  const docsDoOrcamento = documentos.filter((d) => d.orcamento_id === orcamentoId);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[11px] text-[#8A8578] hover:text-[#14283A]"
        title="Documentos deste orçamento"
      >
        <Paperclip size={12} />
        {docsDoOrcamento.length > 0 && docsDoOrcamento.length}
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth="max-w-lg">
        {() => (
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Documentos</h2>
            <p className="text-[12px] text-[#8A8578] mb-3">{servico}</p>

            <DocumentoDropzone obraId={obraId} direcao="recebido" orcamentoId={orcamentoId} />

            <div className="mt-3 divide-y divide-[#F2F0E8]">
              {docsDoOrcamento.length === 0 && (
                <p className="text-[12px] text-[#8A8578] py-3 text-center">Ainda sem documentos.</p>
              )}
              {docsDoOrcamento.map((d) => (
                <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
              ))}
            </div>
          </div>
        )}
      </ModalShell>
    </>
  );
}
