"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import { PlataformaTour } from "./PlataformaTour";
import { PortalTour } from "./PortalTour";
import { ObraAnimada } from "./ObraAnimada";
import "./hub.css";

type Route = "hub" | "servicos";
type ServicoTab = "fiscalizacao" | "consultoria" | "plataforma";
const SUB_IDS: ServicoTab[] = ["fiscalizacao", "consultoria", "plataforma"];

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot(): Route {
  const h = (window.location.hash || "").replace("#", "");
  return h === "servicos" || (SUB_IDS as string[]).includes(h) ? "servicos" : "hub";
}

function getHashServerSnapshot(): Route {
  return "hub";
}

export function HubView() {
  const route = useSyncExternalStore(subscribeToHash, getHashSnapshot, getHashServerSnapshot);
  const [activeTab, setActiveTab] = useState<ServicoTab>("fiscalizacao");
  const [entrarOpen, setEntrarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.classList.add("hub-body");
    return () => {
      document.body.classList.remove("hub-body");
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("route-hub", route === "hub");
    return () => {
      document.body.classList.remove("route-hub");
    };
  }, [route]);

  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash.replace("#", "");
      if ((SUB_IDS as string[]).includes(hash)) {
        setActiveTab(hash as ServicoTab);
      }
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    const active = mainRef.current?.querySelector(".view.is-active");
    if (!active) return;
    const els = active.querySelectorAll<HTMLElement>(".reveal:not(.in)");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route]);

  useEffect(() => {
    if (!entrarOpen) return;
    const onClick = (evt: MouseEvent) => {
      const wrap = document.querySelector(".hub-page .entrar-wrap");
      if (wrap && !wrap.contains(evt.target as Node)) setEntrarOpen(false);
    };
    const onKey = (evt: KeyboardEvent) => {
      if (evt.key === "Escape") setEntrarOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [entrarOpen]);

  return (
    <div className="hub-page">
      <header className="site">
        <div className="wrap nav">
          <a className="brand" href="#">
            <img className="brand-mark" src={LOGO_SRC_DARK} alt="Fiscalis" />
            <span className="brand-word">FISCALIS</span>
          </a>
          <div className="switcher">
            <a href="#" className={route === "hub" ? "nav-home is-active" : "nav-home"}>
              <span className="full">Início</span>
              <span className="short" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 10v8.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 19.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <a href="#servicos" className={route === "servicos" ? "is-active" : undefined}>
              <span className="full">Serviços</span>
            </a>
            <div className="entrar-wrap">
              <button
                type="button"
                className={entrarOpen ? "switcher-entrar is-open" : "switcher-entrar"}
                onClick={(e) => {
                  e.stopPropagation();
                  setEntrarOpen((o) => !o);
                }}
              >
                <span className="full">Entrar ↗</span>
              </button>
              <div className={entrarOpen ? "entrar-menu is-open" : "entrar-menu"}>
                <a href="/portal/login" onClick={() => setEntrarOpen(false)}>
                  <span className="entrar-ico">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M5.2 19.5c0-3.75 3.04-6.8 6.8-6.8s6.8 3.05 6.8 6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span><span className="entrar-t">Sou cliente</span><span className="entrar-d">Acompanhar a minha obra</span></span>
                </a>
                <a href="/login" onClick={() => setEntrarOpen(false)}>
                  <span className="entrar-ico">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="4.5" y="4" width="9" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
                      <rect x="13.5" y="9.5" width="6" height="10.5" rx="1" stroke="currentColor" strokeWidth="1.7" />
                      <circle cx="7.6" cy="7.6" r="0.85" fill="currentColor" />
                      <circle cx="10.4" cy="7.6" r="0.85" fill="currentColor" />
                      <circle cx="7.6" cy="11.6" r="0.85" fill="currentColor" />
                      <circle cx="10.4" cy="11.6" r="0.85" fill="currentColor" />
                      <circle cx="7.6" cy="15.6" r="0.85" fill="currentColor" />
                      <circle cx="10.4" cy="15.6" r="0.85" fill="currentColor" />
                    </svg>
                  </span>
                  <span><span className="entrar-t">Sou uma empresa</span><span className="entrar-d">Aceder à plataforma</span></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main ref={mainRef}>
        {/* ============ HUB (landing, sem scroll no pc) ============ */}
        <section className={route === "hub" ? "view is-active" : "view"} data-view="hub">
          <div className="wrap hub-hero">
            <div className="hub-mark"><img src={LOGO_SRC_DARK} alt="Fiscalis" /><span>FISCALIS</span></div>
            <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Engenharia · Fiscalização de obra</p>
            <h1>Fiscalização de obra, <em>à tua maneira.</em></h1>
            <p className="hero-sub">Fiscalização de obra, consultoria técnica, ou uma plataforma completa para empresas de fiscalização — escolhe o que precisas.</p>
          </div>
          <div className="wrap split">
            <a className="split-card" href="#fiscalizacao">
              <div className="split-art tint-b">
                <span className="split-badges"><span>SERVIÇO</span><span>CENTRO · NORTE</span></span>
                <div className="split-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 6 L40 12 V22 C40 32 33 39 24 42 C15 39 8 32 8 22 V12 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16.5 22.5 L21.5 27.5 L31.5 16.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="split-body">
                <span className="eyebrow">Para quem está a construir ou remodelar</span>
                <h2>Fiscalização de obra</h2>
                <p>Visitas regulares, registo do que é visto, e um portal onde vês tudo — sem teres de perguntar nada a ninguém.</p>
                <span className="go">Saber mais <span className="btn-arrow">→</span></span>
              </div>
            </a>
            <a className="split-card" href="#consultoria">
              <div className="split-art tint-c">
                <span className="split-badges"><span>SERVIÇO</span><span>PARECER TÉCNICO</span></span>
                <div className="split-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <rect x="10" y="8" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="15" y1="16" x2="25" y2="16" stroke="currentColor" strokeWidth="1.6" />
                    <line x1="15" y1="21" x2="25" y2="21" stroke="currentColor" strokeWidth="1.6" />
                    <line x1="15" y1="26" x2="21" y2="26" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="32" cy="30" r="6" stroke="currentColor" strokeWidth="2" />
                    <line x1="36.2" y1="34.2" x2="40" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="split-body">
                <span className="eyebrow">Para quem só precisa de uma opinião técnica</span>
                <h2>Consultoria técnica</h2>
                <p>Um parecer pontual — antes de comprar, antes de assinar um orçamento, ou uma segunda opinião sobre um problema.</p>
                <span className="go">Saber mais <span className="btn-arrow">→</span></span>
              </div>
            </a>
            <a className="split-card" href="#plataforma">
              <div className="split-art tint-a">
                <span className="split-badges"><span>APP</span><span>PARA EMPRESAS</span></span>
                <div className="split-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <rect x="9" y="15" width="26" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
                    <rect x="15" y="9" width="26" height="22" rx="2" fill="var(--heading)" stroke="currentColor" strokeWidth="2" />
                    <line x1="20" y1="16" x2="36" y2="16" stroke="currentColor" strokeWidth="1.6" />
                    <line x1="20" y1="21" x2="31" y2="21" stroke="currentColor" strokeWidth="1.6" />
                    <line x1="20" y1="26" x2="34" y2="26" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </div>
              </div>
              <div className="split-body">
                <span className="eyebrow">Para empresas e intervenientes de obra</span>
                <h2>Plataforma digital</h2>
                <p>Visitas, não conformidades, relatórios e um portal para o cliente, tudo num só lugar.</p>
                <span className="go">Saber mais <span className="btn-arrow">→</span></span>
              </div>
            </a>
          </div>
        </section>

        {/* ============ SERVIÇOS (separado por separadores, não scroll contínuo) ============ */}
        <section className={route === "servicos" ? "view is-active" : "view"} data-view="servicos" id="servicos">
          {/* ---- Separador de serviços (sempre visível) ---- */}
          <section className="block tab-bar-block">
            <div className="wrap">
              <div className="tab-bar reveal">
                <a href="#fiscalizacao" className={activeTab === "fiscalizacao" ? "is-active" : undefined}>Fiscalização de obra</a>
                <a href="#consultoria" className={activeTab === "consultoria" ? "is-active" : undefined}>Consultoria técnica</a>
                <a href="#plataforma" className={activeTab === "plataforma" ? "is-active" : undefined}>Plataforma digital</a>
              </div>
            </div>
          </section>

          {/* ---- Fiscalização de obra ---- */}
          <section className={activeTab === "fiscalizacao" ? "tab-panel is-active" : "tab-panel"}>
            <section className="block">
              <div className="wrap">
                <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                  <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Compromisso</p>
                  <h2>Um responsável. <em>Do início ao fim.</em></h2>
                  <p>A mesma pessoa visita a obra e assina o relatório, sempre — sem equipas rotativas, sem &ldquo;quem calhar esta semana&rdquo;. Engenharia civil a sério, membro da Ordem dos Engenheiros.</p>
                </div>
                <div className="trust-note reveal" style={{ maxWidth: "42rem", marginInline: "auto" }}>Um único ponto de contacto, do primeiro dia ao último — sem perderes o fio à história da tua obra.</div>
              </div>
            </section>

            <div className="wrap hero">
              <div className="hero-grid">
                <div>
                  <p className="eyebrow">Fiscalização de obra · Região Centro e Norte</p>
                  <h2 className="hero-title">Entre ti e o empreiteiro, <em>alguém tem de saber</em> o que está a ver.</h2>
                  <p className="hero-sub">Visitas regulares, registo do que é visto, e um portal próprio onde vês tudo — sem teres de perguntar nada a ninguém.</p>
                  <div className="hero-ctas">
                    <a className="btn btn-primary" href="/pedido?tipo=orcamento">Pedir um orçamento <span className="btn-arrow">→</span></a>
                  </div>
                  <a className="hero-portal" href="/portal/login">Já és cliente? Aceder ao portal ↗</a>
                </div>
                <div className="field-stack" aria-hidden="true">
                  <ObraAnimada />
                  <div className="field-card back">
                    <div className="field-row"><span className="field-label">Obra</span><span className="field-value">Moradia — Aveiro</span></div>
                    <div className="field-row"><span className="field-label">Progresso</span><span className="field-value">62%</span></div>
                    <div className="field-bar"><span style={{ width: "62%" }}></span></div>
                  </div>
                  <div className="field-card front">
                    <div className="field-row"><span className="field-label">Visita</span><span className="field-value" style={{ fontFamily: "var(--font-mono)" }}>18 Ago 2026</span></div>
                    <p className="doc-title" style={{ marginTop: "0.6rem" }}>Estrutura de cobertura verificada — conforme projeto.</p>
                    <div className="doc-checks">
                      <span className="doc-check"><span className="doc-box filled"></span>Conforme</span>
                      <span className="doc-check"><span className="doc-box"></span>Não conforme</span>
                    </div>
                    <div className="doc-sig">Eng.º Responsável · Fiscalização</div>
                  </div>
                </div>
              </div>
            </div>

            <section className="block">
              <div className="wrap">
                <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                  <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Ao contratares o serviço</p>
                  <h2>Ganhas acesso ao portal da tua obra.</h2>
                  <p>É aqui que vês tudo o que o fiscal regista — visitas, relatórios e não conformidades, sempre atualizados. Isto é o que vais ver:</p>
                </div>
                <PortalTour />
              </div>
            </section>

            <section className="block">
              <div className="wrap">
                <div className="cover reveal">
                  <div>
                    <p className="eyebrow">Próximo passo</p>
                    <h2>Vamos falar da tua obra.</h2>
                    <p>Em que fase está, onde é (região Centro ou Norte), e o que precisas de acompanhar — recebes uma proposta e os próximos passos.</p>
                  </div>
                  <div className="sign-box">
                    <a className="btn btn-primary" href="/pedido?tipo=orcamento">Pedir um orçamento <span className="btn-arrow">→</span></a>
                    {WHATSAPP_NUMBER && (
                      <a
                        className="btn btn-whatsapp"
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                          "Olá! Vim do site da Fiscalis e gostava de falar sobre a fiscalização da minha obra."
                        )}`}
                        target="_blank"
                        rel="noopener"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                          <path d="M12.04 2.1C6.58 2.1 2.15 6.53 2.15 11.99c0 1.83.48 3.55 1.4 5.06L2 22l5.1-1.5a9.86 9.86 0 0 0 4.94 1.32h.01c5.46 0 9.9-4.43 9.9-9.9 0-2.64-1.03-5.13-2.9-6.99a9.83 9.83 0 0 0-6.99-2.9Zm5.8 14.16c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.12-1.8-.11-.42-.14-.95-.31-1.63-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.2-1.17-1.56-1.17-2.97s.74-2.11 1-2.4c.27-.28.58-.35.77-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.52-.09.2-.14.32-.28.49-.15.18-.3.39-.43.52-.14.14-.29.29-.13.57.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.13.63-.07.17-.2.71-.83.9-1.12.19-.28.38-.23.63-.13.26.1 1.63.77 1.91.9.29.15.48.22.55.34.07.12.07.68-.17 1.36Z" />
                        </svg>
                        Falar no WhatsApp
                      </a>
                    )}
                    <div className="sign-line"><span>GERAL@FISCALIS-ENGENHARIA.PT</span></div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          {/* ---- Consultoria técnica ---- */}
          <section className={activeTab === "consultoria" ? "tab-panel is-active" : "tab-panel"}>
            <section className="block">
              <div className="wrap">
                <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                  <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Segunda opinião</p>
                  <h2>Uma opinião técnica, <em>sem compromisso de obra contínua.</em></h2>
                  <p>Nem sempre precisas de fiscalização regular — às vezes só de alguém que perceba do assunto, uma vez.</p>
                </div>
                <div className="trust-note reveal" style={{ maxWidth: "42rem", marginInline: "auto" }}>Uma visita, um parecer claro — sem reuniões a mais nem relatórios extensos.</div>
              </div>
            </section>

            <section className="block">
              <div className="wrap">
                <div className="steps steps-4">
                  <div className="step reveal"><p className="step-num">01</p><h3>Antes de comprar</h3><p>Uma vistoria técnica ao imóvel antes de avançares — para saberes exatamente o que estás a comprar.</p></div>
                  <div className="step reveal"><p className="step-num">02</p><h3>Validar um orçamento</h3><p>Uma segunda opinião sobre a proposta do empreiteiro, antes de assinares.</p></div>
                  <div className="step reveal"><p className="step-num">03</p><h3>Um problema numa casa já construída</h3><p>Notas uma fissura, humidade ou outro sinal de problema, e queres que alguém vá lá ver o que é.</p></div>
                  <div className="step reveal"><p className="step-num">04</p><h3>Resolver uma dúvida</h3><p>Um parecer técnico sobre um problema concreto, sem contrato de fiscalização.</p></div>
                </div>
                <div className="reveal" style={{ marginTop: "2.5rem", textAlign: "center" }}>
                  <a className="btn btn-primary" href="/pedido?tipo=consultoria">Pedir uma consulta <span className="btn-arrow">→</span></a>
                </div>
              </div>
            </section>
          </section>

          {/* ---- Plataforma digital ---- */}
          <section className={activeTab === "plataforma" ? "tab-panel is-active" : "tab-panel"}>
            <section className="block">
              <div className="wrap">
                <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                  <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Segurança · Para empresas</p>
                  <h2>Dás acesso a todos os teus clientes, <em>sem nenhum ver a obra dos outros.</em></h2>
                  <p>Isolamento aplicado na própria base de dados, obra a obra, cliente a cliente — não é uma opção escondida num menu que se possa esquecer de ativar.</p>
                </div>
                <div className="trust-note reveal" style={{ maxWidth: "42rem", marginInline: "auto" }}>O acesso de cada cliente é validado do lado do servidor, não só escondido na interface. A tua equipa configura uma vez — fica garantido para sempre.</div>
              </div>
            </section>

            <div className="wrap hero">
              <div className="hero-grid">
                <div>
                  <p className="eyebrow">Plataforma digital · Para empresas</p>
                  <h2 className="hero-title">A obra não pára.<br />Os registos <em>também não.</em></h2>
                  <p className="hero-sub">Fiscalis junta visitas, não conformidades, relatórios e o próprio cliente numa só plataforma — sem perder uma fotografia, um prazo ou uma assinatura pelo caminho.</p>
                  <div className="hero-ctas">
                    <a className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></a>
                  </div>
                  <p className="hero-note">Sem instalação. Um separador por obra. Cada cliente só vê a obra dele.</p>
                  <a className="hero-portal" href="/login">Já usas a Fiscalis? Entrar na plataforma ↗</a>
                </div>
                <div className="doc-stack" aria-hidden="true">
                  <ObraAnimada />
                  <div className="doc-card mini back">
                    <div className="doc-mini-date">18 Ago 2026</div>
                    <div className="doc-mini-obra">Obra Teste Cliente</div>
                    <div className="doc-mini-meta"><span className="chip chip-ok">Realizada</span><span>6 fotos</span></div>
                  </div>
                  <div className="doc-card front">
                    <div className="doc-row"><span className="doc-code">NC-014</span><span className="chip chip-warn">MAIOR</span></div>
                    <p className="doc-title">Impermeabilização incompleta na cobertura norte</p>
                    <div className="doc-checks">
                      <span className="doc-check"><span className="doc-box"></span>Crítica</span>
                      <span className="doc-check"><span className="doc-box filled"></span>Maior</span>
                      <span className="doc-check"><span className="doc-box"></span>Menor</span>
                    </div>
                    <div className="doc-sig">Fiscalização · Data: ___/___/______</div>
                  </div>
                </div>
              </div>
            </div>

            <section className="block">
              <div className="wrap">
                <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                  <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Isto é o que vais ver</p>
                  <h2>A plataforma em ação, do dashboard ao portal do cliente.</h2>
                </div>
                <PlataformaTour />
              </div>
            </section>

            <section className="block">
              <div className="wrap">
                <div className="section-head reveal">
                  <p className="eyebrow">Funcionalidades</p>
                  <h2>Tudo o que a tua equipa precisa, num só lugar.</h2>
                </div>
                <div className="features">
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-obra" style={{ marginBottom: 0 }}><div><div className="name">OBRA-004 — Moradia, Aveiro</div><div className="sub">Cliente: Família Ferreira</div></div><span className="mock-pct">68%</span></div>
                    </div>
                    <h3>Obras e clientes</h3>
                    <p>Cada obra com o seu separador — cliente, visitas, documentos e progresso, tudo junto.</p>
                  </div>
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-photo-grid">
                        <span className="mock-photo p1"></span>
                        <span className="mock-photo p2"></span>
                        <span className="mock-photo p3"></span>
                        <span className="mock-photo-add">+</span>
                      </div>
                    </div>
                    <h3>Visitas e fotos</h3>
                    <p>Regista o que vês no local, com fotos, sem passar por papel nem por outro telemóvel.</p>
                  </div>
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-nc-card" style={{ marginTop: 0 }}>
                        <div className="doc-row" style={{ marginBottom: 0 }}><span className="doc-code">NC-014</span><span className="chip chip-warn">MAIOR</span></div>
                      </div>
                    </div>
                    <h3>Não conformidades</h3>
                    <p>Auto gerado automaticamente, com código sequencial e alerta de prazo.</p>
                  </div>
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-portal-row" style={{ marginBottom: 0 }}><span>Relatório · 18 Ago 2026</span><span>↗</span></div>
                    </div>
                    <h3>Relatórios</h3>
                    <p>Prontos a enviar com um clique, sempre no mesmo modelo profissional.</p>
                  </div>
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-cal">
                        <span className="mock-cal-day">12</span>
                        <span className="mock-cal-day is-active">18</span>
                        <span className="mock-cal-day">22</span>
                        <span className="mock-cal-day">29</span>
                      </div>
                    </div>
                    <h3>Calendário</h3>
                    <p>Todas as visitas agendadas, de todas as obras, numa só vista.</p>
                  </div>
                  <div className="feature reveal">
                    <div className="feature-preview">
                      <div className="mock-nc-card" style={{ marginTop: 0 }}>
                        <div className="mock-proposta"><span className="mock-proposta-label">PROPOSTA · FISCALIZAÇÃO</span><span className="mock-proposta-val">690 €/ano</span></div>
                      </div>
                    </div>
                    <h3>Propostas</h3>
                    <p>Gera propostas de serviço profissionais para novos clientes, direto da plataforma.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="block">
              <div className="wrap">
                <div className="section-head reveal">
                  <p className="eyebrow">Como funciona</p>
                  <h2>Da obra ao portal, sem passos a mais.</h2>
                </div>
                <div className="steps">
                  <div className="step reveal"><p className="step-num">01</p><h3>Visita</h3><p>O fiscal vai à obra, tira fotos e regista notas — no telemóvel, no local, sem passar por papel.</p></div>
                  <div className="step reveal"><p className="step-num">02</p><h3>Registo</h3><p>Se houver algo a corrigir, gera-se logo o auto de não conformidade. O relatório sai a seguir, com um clique.</p></div>
                  <div className="step reveal"><p className="step-num">03</p><h3>Portal</h3><p>Tudo aparece automaticamente no portal do cliente — sem reenviar, sem copiar, sem esperar.</p></div>
                </div>
              </div>
            </section>

            <section className="block">
              <div className="wrap">
                <div className="cover reveal">
                  <div>
                    <p className="eyebrow">Próximo passo</p>
                    <h2>Vamos pôr a tua primeira obra na plataforma.</h2>
                    <p>Mostramos-te o dashboard do engenheiro fiscal e o portal do cliente com uma obra a sério — a tua, se quiseres — para veres exatamente o que muda no dia a dia.</p>
                  </div>
                  <div className="sign-box">
                    <a className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></a>
                    <div className="sign-line"><span>GERAL@FISCALIS-ENGENHARIA.PT</span></div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </section>
      </main>

      <footer>
        <div className="wrap foot-row">
          <div className="foot-brand"><img className="brand-mark" style={{ height: 22 }} src={LOGO_SRC_DARK} alt="Fiscalis" /><span className="brand-word">FISCALIS</span></div>
          <p className="foot-note">Plataforma de fiscalização de obra e serviço de fiscalização independente. © 2026 Fiscalis Engenharia.</p>
        </div>
      </footer>
    </div>
  );
}
