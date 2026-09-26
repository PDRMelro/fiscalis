"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, Landmark } from "lucide-react";
import { adminLogout } from "@/lib/actions/auth";
import { PesquisaGlobal } from "@/components/layout/PesquisaGlobal";
import type { PedidoPendenteResumo } from "@/components/layout/AdminShell";

type Alerta = { id: string; descricao: string; obra: string; prazo: string | null; atrasada: boolean };

export function Topbar({
  nome,
  empresa,
  ativoAte,
  iniciais,
  alertas,
  pedidosPendentes,
  onAbrirMenu,
}: {
  nome: string;
  empresa: string;
  ativoAte: string | null;
  iniciais: string;
  alertas: Alerta[];
  pedidosPendentes: PedidoPendenteResumo[];
  onAbrirMenu: () => void;
}) {
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const temAtrasadas = alertas.some((a) => a.atrasada);
  const totalNotificacoes = alertas.length + pedidosPendentes.length;
  const alertasRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alertasAbertos && !menuAberto) return;

    function aoClicarFora(e: MouseEvent) {
      const alvo = e.target as Node;
      if (alertasAbertos && !alertasRef.current?.contains(alvo)) setAlertasAbertos(false);
      if (menuAberto && !menuRef.current?.contains(alvo)) setMenuAberto(false);
    }
    function aoPremirEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAlertasAbertos(false);
        setMenuAberto(false);
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPremirEscape);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPremirEscape);
    };
  }, [alertasAbertos, menuAberto]);

  return (
    <div className="h-16 bg-white border-b border-[#E4E1D6] flex items-center justify-between gap-3 px-4 md:px-6 shrink-0 shadow-[0_1px_3px_rgba(20,40,58,0.04)] relative z-10">
      <button type="button" onClick={onAbrirMenu} className="md:hidden text-[#4A4740] shrink-0">
        <Menu size={20} />
      </button>
      <div className="hidden md:block flex-1 min-w-0">
        <PesquisaGlobal />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={alertasRef}>
          <button
            onClick={() => {
              setAlertasAbertos((v) => !v);
              setMenuAberto(false);
            }}
            className="relative text-[#4A4740]"
          >
            <Bell size={18} />
            {totalNotificacoes > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center ${
                  temAtrasadas || pedidosPendentes.length > 0 ? "bg-[#B0402F]" : "bg-[#C4791E]"
                }`}
              >
                {totalNotificacoes}
              </span>
            )}
          </button>
          {alertasAbertos && (
            <div className="absolute right-0 top-8 w-[85vw] max-w-80 bg-white border border-[#E4E1D6] rounded-xl shadow-lg z-20 overflow-hidden max-h-[70vh] overflow-y-auto">
              {pedidosPendentes.length > 0 && (
                <>
                  <p className="text-[12px] font-medium text-[#4A4740] px-4 py-3 border-b border-[#EDEBE2]">
                    Pedidos de empresas pendentes
                  </p>
                  {pedidosPendentes.map((p) => (
                    <Link
                      key={p.id}
                      href="/empresas"
                      className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F2F0E8] hover:bg-[#F5F4EF]"
                    >
                      <Landmark size={14} className="text-[#B08A3E] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-[#1F1D19] truncate">{p.nomeEmpresa}</p>
                        <p className="text-[11px] text-[#8A8578]">
                          Pedido em {new Date(p.criadoEm).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </>
              )}
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
        <div className="relative" ref={menuRef}>
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
            <div className="hidden sm:block leading-tight text-left">
              <p className="text-[13px] font-medium">{nome}</p>
              <p className="text-[11px] text-[#8A8578]">{empresa}</p>
              {ativoAte && (
                <p className="text-[10px] text-[#B08A3E]">
                  Acesso válido até {new Date(`${ativoAte}T00:00:00`).toLocaleDateString("pt-PT")}
                </p>
              )}
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
