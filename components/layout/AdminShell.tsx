"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type Alerta = { id: string; descricao: string; obra: string; prazo: string | null; atrasada: boolean };

export function AdminShell({
  nome,
  cargo,
  empresa,
  iniciais,
  alertas,
  children,
}: {
  nome: string;
  cargo: string;
  empresa: string;
  iniciais: string;
  alertas: Alerta[];
  children: ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div
      className="w-full min-h-screen bg-[#F5F4EF] flex text-[#1F1D19]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar nome={nome} cargo={cargo} aberto={menuAberto} onFechar={() => setMenuAberto(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          nome={nome}
          empresa={empresa}
          iniciais={iniciais}
          alertas={alertas}
          onAbrirMenu={() => setMenuAberto(true)}
        />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
