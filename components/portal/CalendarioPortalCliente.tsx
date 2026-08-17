"use client";

import { useState } from "react";
import { CalendarDays, Clock, ChevronUp } from "lucide-react";
import { CalendarioMensal } from "@/components/calendario/CalendarioMensal";
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

  if (expandido) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpandido(false)}
          className="flex items-center gap-1 text-[11px] text-[#8A8578] hover:text-[#14283A] mb-2"
        >
          <ChevronUp size={13} /> Ver só esta semana
        </button>
        <CalendarioMensal visitas={visitas} mostrarObra={false} clicavel={false} />
      </div>
    );
  }

  const hoje = new Date();
  const hojeISO = paraISO(hoje);
  const semana = gerarSemana(hoje);

  const porDia = new Map<string, VisitaResumoRow[]>();
  for (const v of visitas) {
    const lista = porDia.get(v.data) ?? [];
    lista.push(v);
    porDia.set(v.data, lista);
  }

  const proximasAgendadas = visitas.filter((v) => v.estado === "Agendada" && v.data >= hojeISO).length;

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EDEBE2]">
        <p className="text-[12px] font-medium text-[#4A4740]">Esta semana</p>
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="flex items-center gap-1.5 text-[11px] font-medium text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded-lg px-2.5 py-1 hover:bg-[#F5E7C6] transition-colors"
          title="Ver calendário completo"
        >
          <CalendarDays size={12} />
          {proximasAgendadas > 0 ? `${proximasAgendadas} agendamento${proximasAgendadas > 1 ? "s" : ""}` : "Ver mês"}
        </button>
      </div>

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
                  <div
                    key={v.id}
                    title={`${v.hora ? v.hora.slice(0, 5) + " · " : ""}${v.estado}`}
                    className={`flex items-center gap-0.5 truncate text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                      v.estado === "Agendada"
                        ? "text-[#8A4A17] bg-[#FBF0DC] border-[#E8C98F]"
                        : "text-[#3E7A4D] bg-[#E9F5EC] border-[#B9DCC2]"
                    }`}
                  >
                    {v.hora && <Clock size={9} className="shrink-0" />}
                    <span className="truncate">{v.estado}</span>
                  </div>
                ))}
                {eventos.length > 3 && <p className="text-[10px] text-[#8A8578] px-1">+{eventos.length - 3} mais</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
