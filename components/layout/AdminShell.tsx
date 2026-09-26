"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type Alerta = { id: string; descricao: string; obra: string; prazo: string | null; atrasada: boolean };
export type PedidoPendenteResumo = { id: string; nomeEmpresa: string; criadoEm: string };

export function AdminShell({
  nome,
  cargo,
  nomeEmpresa,
  logoUrl,
  corFundoBarra,
  corDestaque,
  corTexto,
  ativoAte,
  isSuperAdmin,
  iniciais,
  alertas,
  pedidosPendentes,
  children,
}: {
  nome: string;
  cargo: string;
  nomeEmpresa: string;
  logoUrl: string | null;
  corFundoBarra: string | null;
  corDestaque: string | null;
  corTexto: string | null;
  ativoAte: string | null;
  isSuperAdmin: boolean;
  iniciais: string;
  alertas: Alerta[];
  pedidosPendentes: PedidoPendenteResumo[];
  children: ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div
      className="w-full min-h-screen bg-[#F5F4EF] flex text-[#1F1D19]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar
        nome={nome}
        cargo={cargo}
        nomeEmpresa={nomeEmpresa}
        logoUrl={logoUrl}
        corFundoBarra={corFundoBarra}
        corDestaque={corDestaque}
        corTexto={corTexto}
        isSuperAdmin={isSuperAdmin}
        numPedidosPendentes={pedidosPendentes.length}
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          nome={nome}
          empresa={nomeEmpresa}
          ativoAte={ativoAte}
          iniciais={iniciais}
          alertas={alertas}
          pedidosPendentes={pedidosPendentes}
          onAbrirMenu={() => setMenuAberto(true)}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
