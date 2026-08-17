"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { VisitaResumoRow } from "@/lib/supabase/types";

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function paraISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function gerarGrelha(mesAtual: Date) {
  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
  const inicioGrelha = new Date(primeiroDia);
  inicioGrelha.setDate(primeiroDia.getDate() - primeiroDia.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(inicioGrelha);
    d.setDate(inicioGrelha.getDate() + i);
    return d;
  });
}

export function CalendarioMensal({
  visitas,
  mostrarObra = true,
  clicavel = true,
  semMoldura = false,
}: {
  visitas: VisitaResumoRow[];
  /** No portal do cliente é sempre a mesma obra — mostra a hora/estado em vez de repetir o nome. */
  mostrarObra?: boolean;
  /** No portal do cliente as etiquetas não levam a páginas do administrador. */
  clicavel?: boolean;
  /** Quando já vem dentro de outro cartão (ex: portal do cliente), não duplica o contorno. */
  semMoldura?: boolean;
}) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const dias = gerarGrelha(mesAtual);
  const hojeISO = paraISO(hoje);

  const porDia = new Map<string, VisitaResumoRow[]>();
  for (const v of visitas) {
    const lista = porDia.get(v.data) ?? [];
    lista.push(v);
    porDia.set(v.data, lista);
  }

  return (
    <div className={semMoldura ? "" : "bg-white border border-[#E4E1D6] rounded-xl overflow-hidden"}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#EDEBE2]">
        <p className="text-[14px] font-semibold text-[#14283A]">
          {NOMES_MES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
            className="text-[11px] text-[#8A8578] hover:text-[#14283A] px-2 py-1 rounded-lg border border-[#DEDBD2] mr-1"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
            className="text-[#8A8578] hover:text-[#14283A] p-1 rounded hover:bg-[#F5F4EF]"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
            className="text-[#8A8578] hover:text-[#14283A] p-1 rounded hover:bg-[#F5F4EF]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#EDEBE2]">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-[11px] font-medium text-[#8A8578] text-center py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dias.map((dia, i) => {
          const iso = paraISO(dia);
          const doMes = dia.getMonth() === mesAtual.getMonth();
          const ehHoje = iso === hojeISO;
          const eventos = porDia.get(iso) ?? [];

          return (
            <div
              key={i}
              className={`min-h-[92px] border-b border-r border-[#F2F0E8] p-1.5 ${doMes ? "bg-white" : "bg-[#FAF9F4]"}`}
            >
              <span
                className={`inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full ${
                  ehHoje ? "bg-[#14283A] text-white font-medium" : doMes ? "text-[#4A4740]" : "text-[#C7C3B6]"
                }`}
              >
                {dia.getDate()}
              </span>

              <div className="mt-1 space-y-1">
                {eventos.slice(0, 3).map((v) => {
                  const classes = `flex items-center gap-0.5 truncate text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                    v.estado === "Agendada"
                      ? `text-[#8A4A17] bg-[#FBF0DC] border-[#E8C98F] ${clicavel ? "hover:bg-[#F5E7C6]" : ""}`
                      : `text-[#3E7A4D] bg-[#E9F5EC] border-[#B9DCC2] ${clicavel ? "hover:bg-[#DCEFE1]" : ""}`
                  }`;
                  const conteudo = (
                    <>
                      {v.hora && <Clock size={9} className="shrink-0" />}
                      <span className="truncate">{mostrarObra ? v.obra_nome : v.estado}</span>
                    </>
                  );
                  const titulo = `${v.obra_nome}${v.hora ? " · " + v.hora.slice(0, 5) : ""} — ${v.estado}`;

                  return clicavel ? (
                    <Link
                      key={v.id}
                      href={v.estado === "Agendada" ? `/visitas/${v.id}/completar` : `/obras/${v.obra_id}`}
                      title={titulo}
                      className={classes}
                    >
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={v.id} title={titulo} className={classes}>
                      {conteudo}
                    </div>
                  );
                })}
                {eventos.length > 3 && <p className="text-[10px] text-[#8A8578] px-1">+{eventos.length - 3} mais</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
