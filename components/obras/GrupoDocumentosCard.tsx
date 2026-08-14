"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";
import { LinhaDocumento } from "@/components/obras/LinhaDocumento";
import { resumoGrupo } from "@/lib/categoriasDocumento";
import type { DocumentoRow } from "@/lib/supabase/types";

export function GrupoDocumentosCard({
  obraId,
  titulo,
  categorias,
  documentos,
}: {
  obraId: string;
  titulo: string;
  categorias: readonly string[];
  documentos: DocumentoRow[];
}) {
  const [open, setOpen] = useState(false);
  const docsDoGrupo = documentos.filter((d) => d.categoria && categorias.includes(d.categoria));

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
            <p className="text-[13px] font-medium text-[#14283A]">{titulo}</p>
            <p className="text-[11px] text-[#8A8578] truncate">{resumoGrupo(docsDoGrupo)}</p>
          </div>
        </div>
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth="max-w-lg">
        {() => (
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-[#14283A] mb-3">{titulo}</h2>

            {categorias.length === 1 ? (
              <DocumentoDropzone obraId={obraId} direcao="recebido" categoria={categorias[0]} />
            ) : (
              <div className="space-y-4">
                {categorias.map((cat) => {
                  const docsDaCategoria = documentos.filter((d) => d.categoria === cat);
                  return (
                    <div key={cat}>
                      <p className="text-[12px] font-medium text-[#4A4740] mb-1.5">{cat}</p>
                      <DocumentoDropzone obraId={obraId} direcao="recebido" categoria={cat} compacto />
                      {docsDaCategoria.length > 0 && (
                        <div className="mt-1.5 divide-y divide-[#F2F0E8]">
                          {docsDaCategoria.map((d) => (
                            <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {categorias.length === 1 && (
              <div className="mt-3 divide-y divide-[#F2F0E8]">
                {docsDoGrupo.length === 0 && (
                  <p className="text-[12px] text-[#8A8578] py-3 text-center">Ainda sem documentos.</p>
                )}
                {docsDoGrupo.map((d) => (
                  <LinhaDocumento key={d.id} obraId={obraId} doc={d} />
                ))}
              </div>
            )}
          </div>
        )}
      </ModalShell>
    </>
  );
}
