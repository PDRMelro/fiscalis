"use client";

import { useState } from "react";
import { FolderOpen, FileArchive } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { resumoGrupo } from "@/lib/categoriasDocumento";
import type { DocumentoRow } from "@/lib/supabase/types";

export function GrupoDocumentosOrcamentoClienteCard({
  documentos,
  orcamentos,
}: {
  documentos: DocumentoRow[];
  orcamentos: { id: string; servico: string }[];
}) {
  const [open, setOpen] = useState(false);
  const docsDoGrupo = documentos.filter((d) => d.orcamento_id);
  const porOrcamento = orcamentos
    .map((o) => ({ orcamento: o, docs: docsDoGrupo.filter((d) => d.orcamento_id === o.id) }))
    .filter((g) => g.docs.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-3 hover:border-[#C9A050] transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#8A8578] shrink-0">
            <FolderOpen size={13} />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#14283A]">Orçamentos</p>
            <p className="text-[10px] text-[#8A8578] truncate">{resumoGrupo(docsDoGrupo)}</p>
          </div>
        </div>
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth="max-w-lg">
        {() => (
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Orçamentos</h2>
            <p className="text-[12px] text-[#8A8578] mb-3">Documentos anexados a cada orçamento em Financeiro.</p>

            {porOrcamento.length === 0 && (
              <p className="text-[12px] text-[#8A8578] py-3 text-center">Ainda sem documentos.</p>
            )}

            <div className="space-y-4">
              {porOrcamento.map(({ orcamento, docs }) => (
                <div key={orcamento.id}>
                  <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1">{orcamento.servico}</p>
                  <div className="divide-y divide-[#F2F0E8]">
                    {docs.map((d) => (
                      <a
                        key={d.id}
                        href={`/api/documentos/${d.id}/download`}
                        className="flex items-center gap-2 py-1.5 text-[12px] text-[#1F1D19] hover:underline"
                      >
                        <FileArchive size={13} className="text-[#8A8578] shrink-0" />
                        <span className="truncate">{d.nome_ficheiro}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalShell>
    </>
  );
}
