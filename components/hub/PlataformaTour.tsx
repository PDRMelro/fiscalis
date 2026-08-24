"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LOGO_SRC_DARK } from "@/lib/branding";

type ScreenId = "dashboard" | "visita" | "nc" | "portal";

const SCREENS: ScreenId[] = ["dashboard", "visita", "nc", "portal"];

const URLS: Record<ScreenId, string> = {
  dashboard: "fiscalis-pied.vercel.app/dashboard",
  visita: "fiscalis-pied.vercel.app/visitas/nova",
  nc: "fiscalis-pied.vercel.app/obras/nc-014",
  portal: "fiscalis-pied.vercel.app/portal",
};

const LABELS: Record<ScreenId, string> = {
  dashboard: "Dashboard",
  visita: "Nova visita",
  nc: "Não conformidade",
  portal: "Portal do cliente",
};

const DWELL_MS = 4200;

function cursorStyle(tx: string, ty: string, dx: string, dy: string): CSSProperties {
  return { left: tx, top: ty, "--dx0": dx, "--dy0": dy } as CSSProperties;
}

function Cursor({ tx, ty, dx, dy }: { tx: string; ty: string; dx: string; dy: string }) {
  return (
    <span className="tour-cursor" style={cursorStyle(tx, ty, dx, dy)} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M5 3.5 19 12l-6.2 1.4L10 20Z" fill="#14283A" stroke="#F7F5EF" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function DashboardScreen() {
  return (
    <div className="mock-admin">
      <div className="mock-sb">
        <div className="mock-sb-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS</span></div>
        <div className="mock-nav-item active">Dashboard</div>
        <div className="mock-nav-item">Obras</div>
        <div className="mock-nav-item">Visitas</div>
        <div className="mock-nav-item">Calendário</div>
        <div className="mock-nav-item">Não conformidades</div>
        <div className="mock-nav-item">Relatórios</div>
        <div className="mock-nav-item">Clientes</div>
      </div>
      <div className="mock-main">
        <div className="mock-topbar">
          <span className="mock-search">🔍 Pesquisar obras, NC...</span>
          <span className="mock-avatar"></span>
        </div>
        <div className="mock-stats">
          <div className="mock-stat" style={{ "--bar": "#14283A" } as CSSProperties}><div className="n">6</div><div className="l">Obras ativas</div></div>
          <div className="mock-stat" style={{ "--bar": "#14283A" } as CSSProperties}><div className="n">42</div><div className="l">Visitas realizadas</div></div>
          <div className="mock-stat" style={{ "--bar": "#C4791E" } as CSSProperties}><div className="n">3</div><div className="l">NC abertas</div></div>
          <div className="mock-stat" style={{ "--bar": "#2C6B45" } as CSSProperties}><div className="n">18</div><div className="l">NC encerradas</div></div>
        </div>
        <div className="mock-obra"><div><div className="name">OBRA-004 — Moradia, Aveiro</div><div className="sub">Cliente: Família Ferreira</div></div><span className="mock-pct">68%</span></div>
        <div className="mock-obra tour-target"><div><div className="name">OBRA-005 — Armazém industrial, Porto</div><div className="sub">Cliente: Construções Vale Lda.</div></div><span className="mock-pct">32%</span></div>
        <div className="mock-obra"><div><div className="name">OBRA-006 — Remodelação, Aveiro</div><div className="sub">Cliente: João Sequeira</div></div><span className="mock-pct">91%</span></div>
      </div>
      <Cursor tx="60%" ty="68%" dx="-140px" dy="-90px" />
    </div>
  );
}

function VisitaScreen() {
  return (
    <div className="mock-admin">
      <div className="mock-sb">
        <div className="mock-sb-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS</span></div>
        <div className="mock-nav-item">Dashboard</div>
        <div className="mock-nav-item">Obras</div>
        <div className="mock-nav-item active">Visitas</div>
        <div className="mock-nav-item">Calendário</div>
        <div className="mock-nav-item">Não conformidades</div>
        <div className="mock-nav-item">Relatórios</div>
        <div className="mock-nav-item">Clientes</div>
      </div>
      <div className="mock-main">
        <div className="mock-topbar">
          <span className="mock-visita-title">OBRA-005 — Armazém industrial, Porto</span>
          <span className="chip chip-ok">18 Ago 2026</span>
        </div>
        <p className="mock-visita-label">Fotos da visita</p>
        <div className="mock-photo-grid">
          <span className="mock-photo p1"></span>
          <span className="mock-photo p2 tour-target"></span>
          <span className="mock-photo p3"></span>
          <span className="mock-photo p4 mock-photo-add">+</span>
        </div>
        <p className="mock-visita-label">Notas</p>
        <div className="mock-visita-notes">Impermeabilização da cobertura norte por concluir. Restante estrutura conforme.</div>
      </div>
      <Cursor tx="46%" ty="52%" dx="-120px" dy="-70px" />
    </div>
  );
}

function NcScreen() {
  return (
    <div className="mock-admin">
      <div className="mock-sb">
        <div className="mock-sb-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS</span></div>
        <div className="mock-nav-item">Dashboard</div>
        <div className="mock-nav-item">Obras</div>
        <div className="mock-nav-item">Visitas</div>
        <div className="mock-nav-item">Calendário</div>
        <div className="mock-nav-item active">Não conformidades</div>
        <div className="mock-nav-item">Relatórios</div>
        <div className="mock-nav-item">Clientes</div>
      </div>
      <div className="mock-main">
        <div className="mock-nc-card">
          <div className="doc-row"><span className="doc-code">NC-014</span><span className="chip chip-warn">MAIOR</span></div>
          <p className="doc-title">Impermeabilização incompleta na cobertura norte</p>
          <div className="doc-checks">
            <span className="doc-check"><span className="doc-box"></span>Crítica</span>
            <span className="doc-check tour-target"><span className="doc-box tour-fill"></span>Maior</span>
            <span className="doc-check"><span className="doc-box"></span>Menor</span>
          </div>
          <div className="doc-sig">Fiscalização · Prazo: 05/09/2026</div>
        </div>
      </div>
      <Cursor tx="46%" ty="63%" dx="-110px" dy="-60px" />
    </div>
  );
}

function PortalScreen() {
  return (
    <div className="mock-portal">
      <div className="mock-portal-head">
        <div className="mock-portal-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS ENGENHARIA</span></div>
        <span className="mock-portal-user">👤 Família Ferreira</span>
      </div>
      <div className="mock-portal-body">
        <p className="mock-portal-welcome">Bem-vindo, Família Ferreira</p>
        <p className="mock-portal-obra">Moradia — Aveiro</p>
        <div className="mock-progress">
          <div className="mock-progress-bar"><span className="tour-fill-bar" style={{ width: "68%" }}></span></div>
          <span className="mock-progress-n">68%</span>
        </div>
        <div className="mock-portal-grid">
          <div className="mock-portal-panel">
            <p className="t">Relatórios disponíveis</p>
            <div className="mock-portal-row tour-target"><span>18 Ago 2026</span><span>↗</span></div>
            <div className="mock-portal-row"><span>04 Ago 2026</span><span>↗</span></div>
          </div>
          <div className="mock-portal-panel">
            <p className="t">Não conformidades</p>
            <div className="mock-portal-row"><span className="mock-dot" style={{ background: "#C4791E" }}></span><span style={{ flex: 1, marginLeft: "0.4rem" }}>Impermeabilização da cobertura</span></div>
            <div className="mock-portal-row"><span className="mock-dot" style={{ background: "#2C6B45" }}></span><span style={{ flex: 1, marginLeft: "0.4rem" }}>Vãos exteriores — corrigido</span></div>
          </div>
        </div>
      </div>
      <Cursor tx="27%" ty="47%" dx="-100px" dy="-70px" />
    </div>
  );
}

const SCREEN_COMPONENTS: Record<ScreenId, () => React.JSX.Element> = {
  dashboard: DashboardScreen,
  visita: VisitaScreen,
  nc: NcScreen,
  portal: PortalScreen,
};

export function PlataformaTour() {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const id = setInterval(() => {
      if (pausedRef.current || document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % SCREENS.length);
      setCycle((c) => c + 1);
    }, DWELL_MS);
    return () => clearInterval(id);
  }, []);

  const goTo = (i: number) => {
    setIndex(i);
    setCycle((c) => c + 1);
  };

  const active = SCREENS[index];

  return (
    <div className="frame-wrap reveal">
      <div
        className="frame"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div className="frame-bar">
          <span className="frame-dot r"></span><span className="frame-dot y"></span><span className="frame-dot g"></span>
          <span className="frame-url">{URLS[active]}</span>
        </div>
        <div className="tour-stage">
          {SCREENS.map((s) => {
            const Screen = SCREEN_COMPONENTS[s];
            const isActive = s === active;
            return (
              <div
                key={isActive ? `${s}-${cycle}` : s}
                className={isActive ? "tour-screen is-active" : "tour-screen"}
                aria-hidden={!isActive}
              >
                <Screen />
              </div>
            );
          })}
        </div>
      </div>
      <div className="tour-dots" role="tablist" aria-label="Ecrãs da plataforma">
        {SCREENS.map((s, i) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={LABELS[s]}
            className={i === index ? "tour-dot is-active" : "tour-dot"}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
