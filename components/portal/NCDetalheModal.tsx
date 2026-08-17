"use client";

import { useEffect, useState, useTransition } from "react";
import { FileText, Loader2, MapPin, Wrench, ClipboardList, CalendarClock } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { EstadoDot, SeveridadeTag } from "@/components/ui/Tags";
import { listarFotosNC, type FotoComUrl } from "@/lib/actions/nc";
import { formatarData } from "@/lib/format";
import type { NaoConformidadeRow } from "@/lib/supabase/types";

export function NCDetalheModal({ nc, onClose }: { nc: NaoConformidadeRow; onClose: () => void }) {
  const [fotos, setFotos] = useState<FotoComUrl[] | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setFotos(null);
      const resultado = await listarFotosNC(nc.id);
      setFotos(resultado.fotos);
    });
  }, [nc.id]);

  return (
    <ModalShell open onClose={onClose} maxWidth="max-w-lg">
      {() => (
        <div className="p-6">
          <div className="flex items-center justify-between mb-1 pr-6">
            <p className="text-[11px] font-mono text-[#8A8578]">{nc.codigo}</p>
            <EstadoDot estado={nc.estado} />
          </div>
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-3">{nc.descricao}</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-[12px] text-[#4A4740]">
              <CalendarClock size={13} className="text-[#8A8578] shrink-0" />
              Detetada a {formatarData(nc.data_deteccao)}
            </div>
            {nc.local_zona && (
              <div className="flex items-center gap-2 text-[12px] text-[#4A4740]">
                <MapPin size={13} className="text-[#8A8578] shrink-0" />
                {nc.local_zona}
              </div>
            )}
            {nc.especialidade && (
              <div className="flex items-center gap-2 text-[12px] text-[#4A4740]">
                <Wrench size={13} className="text-[#8A8578] shrink-0" />
                {nc.especialidade}
              </div>
            )}
            <div className="flex items-center gap-2 text-[12px] text-[#4A4740]">
              <SeveridadeTag nivel={nc.severidade} />
            </div>
          </div>

          {nc.requisito_incumprido && (
            <div className="mb-3">
              <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1">
                Requisito não cumprido
              </p>
              <p className="text-[13px] text-[#1F1D19]">{nc.requisito_incumprido}</p>
            </div>
          )}

          {nc.acao_corretiva && (
            <div className="mb-3">
              <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1 flex items-center gap-1">
                <ClipboardList size={11} /> Ação corretiva
              </p>
              <p className="text-[13px] text-[#1F1D19]">{nc.acao_corretiva}</p>
            </div>
          )}

          {(nc.responsavel || nc.prazo) && (
            <div className="flex items-center gap-4 mb-4 text-[12px] text-[#4A4740]">
              {nc.responsavel && <span>Responsável: {nc.responsavel}</span>}
              {nc.prazo && <span>Prazo: {formatarData(nc.prazo)}</span>}
            </div>
          )}

          <div className="mb-4">
            <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1.5">Fotos</p>
            {pending && !fotos && (
              <p className="flex items-center gap-1.5 text-[12px] text-[#8A8578]">
                <Loader2 size={13} className="animate-spin" /> A carregar...
              </p>
            )}
            {fotos && fotos.length === 0 && <p className="text-[12px] text-[#8A8578]">Sem fotos anexadas.</p>}
            {fotos && fotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {fotos.map((f) =>
                  f.url ? (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-[#E4E1D6] block"
                    >
                      <img src={f.url} alt={f.nome} className="w-full h-full object-cover" />
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>

          {nc.pdf_path && (
            <a
              href={`/api/nc/${nc.id}/download`}
              className="inline-flex items-center gap-1.5 text-[12px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-3 py-1.5 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
            >
              <FileText size={13} /> Descarregar Auto em PDF
            </a>
          )}
        </div>
      )}
    </ModalShell>
  );
}
