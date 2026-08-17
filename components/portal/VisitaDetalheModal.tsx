"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock, Loader2 } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { obterDetalheVisita, type DetalheVisita } from "@/lib/actions/visitas";
import { formatarData } from "@/lib/format";
import type { VisitaResumoRow } from "@/lib/supabase/types";

export function VisitaDetalheModal({ visita, onClose }: { visita: VisitaResumoRow; onClose: () => void }) {
  const [detalhe, setDetalhe] = useState<DetalheVisita | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setDetalhe(null);
      const resultado = await obterDetalheVisita(visita.id);
      setDetalhe(resultado.detalhe);
    });
  }, [visita.id]);

  const agendada = visita.estado === "Agendada";

  return (
    <ModalShell open onClose={onClose} maxWidth="max-w-md">
      {() => (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-medium rounded px-1.5 py-0.5 ${
                agendada
                  ? "text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F]"
                  : "text-[#3E7A4D] bg-[#E9F5EC] border border-[#B9DCC2]"
              }`}
            >
              {visita.estado}
            </span>
          </div>
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-3 flex items-center gap-2">
            {formatarData(visita.data)}
            {visita.hora && (
              <span className="flex items-center gap-1 text-[13px] font-normal text-[#8A8578]">
                <Clock size={12} /> {visita.hora.slice(0, 5)}
              </span>
            )}
          </h2>

          {pending && !detalhe && (
            <p className="flex items-center gap-1.5 text-[12px] text-[#8A8578] mb-3">
              <Loader2 size={13} className="animate-spin" /> A carregar...
            </p>
          )}

          {detalhe?.notas && (
            <div className="mb-4">
              <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1">
                {agendada ? "Motivo / observações" : "Notas da visita"}
              </p>
              <p className="text-[13px] text-[#1F1D19]">{detalhe.notas}</p>
            </div>
          )}
          {detalhe && !detalhe.notas && (
            <p className="text-[12px] text-[#8A8578] mb-4">Sem notas registadas.</p>
          )}

          {!agendada && (
            <div>
              <p className="text-[11px] font-medium text-[#8A8578] uppercase tracking-wide mb-1.5">Fotos</p>
              {detalhe && detalhe.fotos.length === 0 && (
                <p className="text-[12px] text-[#8A8578]">Sem fotos anexadas.</p>
              )}
              {detalhe && detalhe.fotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {detalhe.fotos.map((f) =>
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
          )}

          {agendada && <p className="text-[12px] text-[#8A8578]">Esta visita ainda vai acontecer.</p>}
        </div>
      )}
    </ModalShell>
  );
}
