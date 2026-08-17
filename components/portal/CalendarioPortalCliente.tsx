"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { CalendarioMensal } from "@/components/calendario/CalendarioMensal";
import { VisitaDetalheModal } from "@/components/portal/VisitaDetalheModal";
import type { VisitaResumoRow } from "@/lib/supabase/types";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function paraISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function gerarSemana(hoje: Date) {
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - hoje.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    return d;
  });
}

export function CalendarioPortalCliente({ visitas }: { visitas: VisitaResumoRow[] }) {
  const [expandido, setExpandido] = useState(false);
  const [selecionada, setSelecionada] = useState<VisitaResumoRow | null>(null);

  const hoje = new Date();
  const hojeISO = paraISO(hoje);
  const proximasAgendadas = visitas.filter((v) => v.estado === "Agendada" && v.data >= hojeISO).length;

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EDEBE2]">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-medium text-[#4A4740]">{expandido ? "Calendário" : "Esta semana"}</p>
          {proximasAgendadas > 0 && (
            <span className="text-[11px] font-medium text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded px-1.5 py-0.5">
              {proximasAgendadas} agendamento{proximasAgendadas > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="flex items-center gap-1 text-[11px] font-medium text-[#14283A] border border-[#DEDBD2] rounded-lg px-2.5 py-1 hover:bg-[#F5F4EF] transition-colors"
        >
          {expandido ? (
            <>
              Fechar <ChevronUp size={13} />
            </>
          ) : (
            <>
              Abrir <ChevronDown size={13} />
            </>
          )}
        </button>
      </div>

      {expandido ? (
        <CalendarioMensal visitas={visitas} mostrarObra={false} semMoldura aoClicarVisita={setSelecionada} />
      ) : (
        <SemanaCompacta visitas={visitas} hoje={hoje} hojeISO={hojeISO} aoClicarVisita={setSelecionada} />
      )}

      {selecionada && <VisitaDetalheModal visita={selecionada} onClose={() => setSelecionada(null)} />}
    </div>
  );
}

function SemanaCompacta({
  visitas,
  hoje,
  hojeISO,
  aoClicarVisita,
}: {
  visitas: VisitaResumoRow[];
  hoje: Date;
  hojeISO: string;
  aoClicarVisita: (visita: VisitaResumoRow) => void;
}) {
  const semana = gerarSemana(hoje);

  const porDia = new Map<string, VisitaResumoRow[]>();
  for (const v of visitas) {
    const lista = porDia.get(v.data) ?? [];
    lista.push(v);
    porDia.set(v.data, lista);
  }

  return (
    <>
      <div className="grid grid-cols-7 border-b border-[#EDEBE2]">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-[11px] font-medium text-[#8A8578] text-center py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {semana.map((dia, i) => {
          const iso = paraISO(dia);
          const ehHoje = iso === hojeISO;
          const eventos = porDia.get(iso) ?? [];

          return (
            <div
              key={i}
              className={`min-h-[80px] border-r border-[#F2F0E8] last:border-r-0 p-1.5 ${ehHoje ? "bg-[#FAF7EF]" : "bg-white"}`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full ${
                  ehHoje ? "bg-[#14283A] text-white font-medium" : "text-[#4A4740]"
                }`}
              >
                {dia.getDate()}
              </span>

              <div className="mt-1 space-y-1">
                {eventos.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => aoClicarVisita(v)}
                    title={`${v.hora ? v.hora.slice(0, 5) + " · " : ""}${v.estado}`}
                    className={`flex items-center gap-0.5 w-full truncate text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                      v.estado === "Agendada"
                        ? "text-[#8A4A17] bg-[#FBF0DC] border-[#E8C98F] hover:bg-[#F5E7C6]"
                        : "text-[#3E7A4D] bg-[#E9F5EC] border-[#B9DCC2] hover:bg-[#DCEFE1]"
                    }`}
                  >
                    {v.hora && <Clock size={9} className="shrink-0" />}
                    <span className="truncate">{v.estado}</span>
                  </button>
                ))}
                {eventos.length > 3 && <p className="text-[10px] text-[#8A8578] px-1">+{eventos.length - 3} mais</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
