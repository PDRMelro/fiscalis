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
  Landmark,
  HardHat,
  X,
} from "lucide-react";
import { LOGO_SRC_DARK, COR_FUNDO_BARRA_OMISSAO, COR_DESTAQUE_OMISSAO, COR_TEXTO_OMISSAO } from "@/lib/branding";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/obras", label: "Obras", icon: Building2 },
  { href: "/visitas", label: "Visitas", icon: ClipboardList },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/nc", label: "Não conformidades", icon: AlertTriangle },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/propostas", label: "Propostas", icon: Send },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/fiscais", label: "Fiscais", icon: HardHat },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const NAV_FISCAL_HREFS = new Set(["/dashboard", "/obras", "/visitas", "/calendario", "/nc", "/relatorios"]);

const NAV_SUPER_ADMIN = { href: "/empresas", label: "Empresas", icon: Landmark };

function hexParaRgba(hex: string, alfa: number): string {
  const limpo = hex.replace("#", "");
  const r = parseInt(limpo.slice(0, 2), 16);
  const g = parseInt(limpo.slice(2, 4), 16);
  const b = parseInt(limpo.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alfa})`;
}

export function Sidebar({
  nome,
  cargo,
  nomeEmpresa,
  logoUrl,
  corFundoBarra,
  corDestaque,
  corTexto,
  isSuperAdmin,
  isFiscal,
  numPedidosPendentes,
  aberto,
  onFechar,
}: {
  nome: string;
  cargo: string;
  nomeEmpresa: string;
  logoUrl: string | null;
  corFundoBarra: string | null;
  corDestaque: string | null;
  corTexto: string | null;
  isSuperAdmin: boolean;
  isFiscal: boolean;
  numPedidosPendentes: number;
  aberto: boolean;
  onFechar: () => void;
}) {
  const pathname = usePathname();
  const corFundo = corFundoBarra || COR_FUNDO_BARRA_OMISSAO;
  const corAcento = corDestaque || COR_DESTAQUE_OMISSAO;
  const corLetras = corTexto || COR_TEXTO_OMISSAO;
  const itensNav = isFiscal
    ? NAV.filter((item) => NAV_FISCAL_HREFS.has(item.href))
    : isSuperAdmin
      ? [...NAV, NAV_SUPER_ADMIN]
      : NAV;

  return (
    <>
      {aberto && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onFechar} />}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-[220px] shrink-0 flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          aberto ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: corFundo }}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl || LOGO_SRC_DARK} alt={nomeEmpresa} className="h-8 w-auto max-w-9 object-contain shrink-0" />
            <p className="text-[13px] font-semibold tracking-wide truncate" style={{ color: corLetras }}>
              {nomeEmpresa}
            </p>
          </div>
          <button type="button" onClick={onFechar} className="md:hidden text-[#9FB0BF] hover:text-white shrink-0">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-3 space-y-0.5">
          {itensNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onFechar}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 relative border ${
                  active ? "" : "border-transparent hover:bg-white/[0.04]"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: hexParaRgba(corAcento, 0.16),
                        borderColor: hexParaRgba(corAcento, 0.45),
                        color: corAcento,
                      }
                    : { color: hexParaRgba(corLetras, 0.7) }
                }
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-r"
                    style={{ backgroundColor: corAcento }}
                  />
                )}
                <Icon size={16} style={active ? { color: corAcento } : undefined} strokeWidth={active ? 2 : 1.75} />
                <span className={active ? "font-medium" : ""} style={active ? { letterSpacing: "0.01em" } : undefined}>
                  {item.label}
                </span>
                {item.href === "/empresas" && numPedidosPendentes > 0 && (
                  <span className="ml-auto min-w-[16px] h-4 px-1 rounded-full bg-[#B0402F] text-white text-[9px] font-medium flex items-center justify-center">
                    {numPedidosPendentes}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10 relative">
          <p className="text-[11px]" style={{ color: hexParaRgba(corLetras, 0.75) }}>
            {nome}
          </p>
          <p className="text-[10px]" style={{ color: hexParaRgba(corLetras, 0.5) }}>
            {cargo}
          </p>
        </div>
      </aside>
    </>
  );
}
