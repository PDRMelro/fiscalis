"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions/auth";
import { PesquisaGlobal } from "@/components/layout/PesquisaGlobal";

type Alerta = { id: string; descricao: string; obra: string; prazo: string | null; atrasada: boolean };

export function Topbar({
  nome,
  empresa,
  iniciais,
  alertas,
}: {
  nome: string;
  empresa: string;
  iniciais: string;
  alertas: Alerta[];
}) {
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const temAtrasadas = alertas.some((a) => a.atrasada);

  return (
    <div className="h-16 bg-white border-b border-[#E4E1D6] flex items-center justify-between px-6 shrink-0 shadow-[0_1px_3px_rgba(20,40,58,0.04)] relative z-10">
      <PesquisaGlobal />
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => {
              setAlertasAbertos((v) => !v);
              setMenuAberto(false);
            }}
            className="relative text-[#4A4740]"
          >
            <Bell size={18} />
            {alertas.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center ${
                  temAtrasadas ? "bg-[#B0402F]" : "bg-[#C4791E]"
                }`}
              >
                {alertas.length}
              </span>
            )}
          </button>
          {alertasAbertos && (
            <div className="absolute right-0 top-8 w-80 bg-white border border-[#E4E1D6] rounded-xl shadow-lg z-20 overflow-hidden">
              <p className="text-[12px] font-medium text-[#4A4740] px-4 py-3 border-b border-[#EDEBE2]">
                Prazos de não conformidades
              </p>
              {alertas.length === 0 && (
                <p className="text-[12px] text-[#8A8578] px-4 py-3">Sem prazos pendentes.</p>
              )}
              {alertas.map((n) => (
                <div key={n.id} className="px-4 py-2.5 border-b border-[#F2F0E8] last:border-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12px] text-[#1F1D19] flex-1">{n.descricao}</p>
                    {n.atrasada && (
                      <span className="text-[9px] font-medium text-[#B0402F] bg-[#FBEAE6] border border-[#E8B9AC] rounded px-1 py-0.5 shrink-0">
                        Atrasada
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${n.atrasada ? "text-[#B0402F]" : "text-[#8A8578]"}`}>
                    {n.obra} · prazo {n.prazo ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            className="flex items-center gap-2"
            onClick={() => {
              setMenuAberto((v) => !v);
              setAlertasAbertos(false);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-[#14283A] text-white flex items-center justify-center text-[12px] font-medium">
              {iniciais}
            </div>
            <div className="leading-tight text-left">
              <p className="text-[13px] font-medium">{nome}</p>
              <p className="text-[11px] text-[#8A8578]">{empresa}</p>
            </div>
            <ChevronDown size={14} className="text-[#8A8578]" />
          </button>
          {menuAberto && (
            <div className="absolute right-0 top-11 w-44 bg-white border border-[#E4E1D6] rounded-xl shadow-lg z-20 overflow-hidden">
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#B0402F] hover:bg-[#F5F4EF]"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
