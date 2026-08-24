"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { LOGO_SRC_DARK } from "@/lib/branding";

type ScreenId = "inicio" | "relatorios" | "nc";

const SCREENS: ScreenId[] = ["inicio", "relatorios", "nc"];

const URLS: Record<ScreenId, string> = {
  inicio: "fiscalis-pied.vercel.app/portal",
  relatorios: "fiscalis-pied.vercel.app/portal/relatorios",
  nc: "fiscalis-pied.vercel.app/portal/nc",
};

const LABELS: Record<ScreenId, string> = {
  inicio: "Início",
  relatorios: "Relatórios",
  nc: "Não conformidades",
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

function PortalHead() {
  return (
    <div className="mock-portal-head">
      <div className="mock-portal-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS ENGENHARIA</span></div>
      <span className="mock-portal-user">👤 Família Ferreira</span>
    </div>
  );
}

function InicioScreen() {
  return (
    <div className="mock-portal">
      <PortalHead />
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

function RelatoriosScreen() {
  return (
    <div className="mock-portal">
      <PortalHead />
      <div className="mock-portal-body">
        <p className="mock-portal-welcome">Relatórios da obra</p>
        <p className="mock-portal-obra">Moradia — Aveiro</p>
        <div className="mock-portal-panel" style={{ marginTop: "0.8rem" }}>
          <div className="mock-portal-row"><span>18 Ago 2026 — Visita de rotina</span><span>↗</span></div>
          <div className="mock-portal-row tour-target"><span>04 Ago 2026 — Visita de rotina</span><span>↗</span></div>
          <div className="mock-portal-row"><span>21 Jul 2026 — Visita inicial</span><span>↗</span></div>
        </div>
      </div>
      <Cursor tx="50%" ty="63%" dx="-90px" dy="-60px" />
    </div>
  );
}

function NcScreen() {
  return (
    <div className="mock-portal">
      <PortalHead />
      <div className="mock-portal-body">
        <p className="mock-portal-welcome">Não conformidades</p>
        <p className="mock-portal-obra">Moradia — Aveiro</p>
        <div className="mock-portal-panel" style={{ marginTop: "0.8rem" }}>
          <div className="mock-portal-row tour-target">
            <span className="mock-dot tour-resolve" style={{ background: "#C4791E" }}></span>
            <span style={{ flex: 1, marginLeft: "0.4rem" }}>Impermeabilização da cobertura</span>
          </div>
          <div className="mock-portal-row">
            <span className="mock-dot" style={{ background: "#2C6B45" }}></span>
            <span style={{ flex: 1, marginLeft: "0.4rem" }}>Vãos exteriores — corrigido</span>
          </div>
        </div>
      </div>
      <Cursor tx="30%" ty="63%" dx="-90px" dy="-60px" />
    </div>
  );
}

const SCREEN_COMPONENTS: Record<ScreenId, () => React.JSX.Element> = {
  inicio: InicioScreen,
  relatorios: RelatoriosScreen,
  nc: NcScreen,
};

export function PortalTour() {
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
      <div className="tour-dots" role="tablist" aria-label="Ecrãs do portal do cliente">
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
