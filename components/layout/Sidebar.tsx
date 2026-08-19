"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Send,
  AlertTriangle,
  FileText,
  Settings,
  ClipboardList,
  CalendarDays,
  Users,
  X,
} from "lucide-react";
import { LOGO_SRC } from "@/lib/branding";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/obras", label: "Obras", icon: Building2 },
  { href: "/visitas", label: "Visitas", icon: ClipboardList },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/propostas", label: "Propostas", icon: Send },
  { href: "/nc", label: "Não conformidades", icon: AlertTriangle },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({
  nome,
  cargo,
  aberto,
  onFechar,
}: {
  nome: string;
  cargo: string;
  aberto: boolean;
  onFechar: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {aberto && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onFechar} />}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[220px] shrink-0 flex flex-col bg-[#14283A] transform transition-transform duration-200 md:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Fiscalis" className="h-8 w-auto" />
            <div className="leading-tight">
              <p className="text-white text-[13px] font-semibold tracking-wide">FISCALIS</p>
              <p className="text-[#C9A050] text-[9px] tracking-[0.15em] font-medium">ENGENHARIA</p>
            </div>
          </div>
          <button type="button" onClick={onFechar} className="md:hidden text-[#9FB0BF] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onFechar}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 relative border ${
                  active ? "text-[#F6EDD8]" : "border-transparent text-[#9FB0BF] hover:text-white hover:bg-white/[0.04]"
                }`}
                style={
                  active
                    ? { backgroundColor: "rgba(201,160,80,0.16)", borderColor: "rgba(201,160,80,0.45)" }
                    : undefined
                }
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 bg-[#E9CE8F] rounded-r" />
                )}
                <Icon size={16} className={active ? "text-[#E9CE8F]" : ""} strokeWidth={active ? 2 : 1.75} />
                <span className={active ? "font-medium" : ""} style={active ? { letterSpacing: "0.01em" } : undefined}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 relative">
          <p className="text-[11px] text-[#9FB0BF]">{nome}</p>
          <p className="text-[10px] text-[#6E8294]">{cargo}</p>
        </div>
      </aside>
    </>
  );
}
