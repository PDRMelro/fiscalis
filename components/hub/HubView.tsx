"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { LOGO_SRC, LOGO_SRC_DARK } from "@/lib/branding";
import { PlataformaTour } from "./PlataformaTour";
import "./hub.css";

type Route = "hub" | "plataforma" | "servico";

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot(): Route {
  const h = (window.location.hash || "").replace("#", "");
  return h === "plataforma" || h === "servico" ? h : "hub";
}

function getHashServerSnapshot(): Route {
  return "hub";
}

export function HubView() {
  const route = useSyncExternalStore(subscribeToHash, getHashSnapshot, getHashServerSnapshot);
  const [entrarOpen, setEntrarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.classList.toggle("route-hub", route === "hub");
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      document.body.classList.remove("route-hub");
    };
  }, [route]);

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
            <img className="brand-mark" src={LOGO_SRC} alt="Fiscalis" />
            <span className="brand-word">FISCALIS</span>
          </a>
          <div className="switcher">
            <a href="#" data-route="hub" className={route === "hub" ? "is-active" : undefined}>
              <span className="full">Início</span>
              <span className="short" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 10v8.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 19.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <a href="#servico" data-route="servico" className={route === "servico" ? "is-active" : undefined}>
              <span className="full">Serviço</span>
            </a>
            <a href="#plataforma" data-route="plataforma" className={route === "plataforma" ? "is-active" : undefined}>
              <span className="full">Plataforma</span>
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
                <Link href="/portal/login" onClick={() => setEntrarOpen(false)}>
                  <span className="entrar-ico">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8.2" r="3.3" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M5.2 19.5c0-3.75 3.04-6.8 6.8-6.8s6.8 3.05 6.8 6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span><span className="entrar-t">Sou cliente</span><span className="entrar-d">Acompanhar a minha obra</span></span>
                </Link>
                <Link href="/login" onClick={() => setEntrarOpen(false)}>
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main ref={mainRef}>
        {/* ============ HUB ============ */}
        <section className={route === "hub" ? "view is-active" : "view"} data-view="hub">
          <div className="wrap hub-hero">
            <div className="hub-mark"><img src={LOGO_SRC} alt="Fiscalis" /><span>FISCALIS</span></div>
            <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Engenharia · Fiscalização de obra</p>
            <h1>Duas formas de trabalhar comigo — escolhe a tua.</h1>
            <p className="hero-sub">Sou engenheiro civil e construí uma plataforma própria para fiscalizar obras. Podes querer usar essa plataforma na tua empresa, ou querer que eu fiscalize a tua obra.</p>
          </div>
          <div className="wrap split">
            <a className="split-card" href="#servico">
              <div className="split-art tint-b">
                <span className="split-badges"><span>SERVIÇO</span><span>AVEIRO · PORTO</span></span>
                <div className="split-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path d="M24 6 L40 12 V22 C40 32 33 39 24 42 C15 39 8 32 8 22 V12 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16.5 22.5 L21.5 27.5 L31.5 16.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="split-body">
                <span className="eyebrow">Para quem está a construir ou remodelar</span>
                <h2>Contrata o serviço</h2>
                <p>Fiscalização de obra independente, em Aveiro e Porto. Visitas regulares, registo do que é visto, e um portal onde acompanhas tudo sem teres de perguntar.</p>
                <span className="go">Ver o serviço <span className="btn-arrow">→</span></span>
              </div>
            </a>
            <a className="split-card" href="#plataforma">
              <div className="split-art tint-a">
                <span className="split-badges"><span>APP</span><span>PLATAFORMA</span></span>
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
                <h2>Conhece a plataforma</h2>
                <p>Uma ferramenta para quem fiscaliza obras — visitas, não conformidades, relatórios e um portal para o cliente, tudo num só lugar. Vê como funciona e pede uma demonstração.</p>
                <span className="go">Ver a plataforma <span className="btn-arrow">→</span></span>
              </div>
            </a>
          </div>
        </section>

        {/* ============ PLATAFORMA ============ */}
        <section className={route === "plataforma" ? "view is-active" : "view"} data-view="plataforma">
          <div className="wrap hero" style={{ paddingTop: "clamp(2.5rem, 6vw, 4rem)" }}>
            <div className="hero-grid">
              <div>
                <p className="eyebrow">Plataforma de fiscalização de obra</p>
                <h1>A obra não pára.<br />Os registos <em>também não podiam.</em></h1>
                <p className="hero-sub">Fiscalis junta visitas, não conformidades, relatórios e o próprio cliente numa só plataforma — sem perder uma fotografia, um prazo ou uma assinatura pelo caminho.</p>
                <div className="hero-ctas">
                  <Link className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></Link>
                  <a className="btn btn-ghost" href="#servico">Sou dono de obra, não empresa →</a>
                </div>
                <p className="hero-note">Sem instalação. Sem folhas soltas. Um separador por obra.</p>
                <Link className="hero-portal" href="/login">Já usas a Fiscalis? Entrar na plataforma ↗</Link>
              </div>
              <div className="doc-stack" aria-hidden="true">
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

          <section className="block" id="muda">
            <div className="wrap">
              <div className="section-head reveal">
                <p className="eyebrow">O que muda</p>
                <h2>Isto já aconteceu na tua última obra.</h2>
                <p>Nenhum destes problemas é sobre falta de cuidado — é sobre o registo viver em quatro sítios diferentes ao mesmo tempo.</p>
              </div>
              <div className="exhibit">
                <div className="exhibit-row reveal">
                  <div className="exhibit-cell before"><p>Não conformidade escrita num Word qualquer, sem numeração nem controlo de prazo.</p></div>
                  <div className="exhibit-cell after"><p>Auto de não conformidade automático, no modelo oficial, com código sequencial e alerta de prazo.</p></div>
                </div>
                <div className="exhibit-row reveal">
                  <div className="exhibit-cell before"><p>O cliente a perguntar &ldquo;como vai a obra?&rdquo; por telefone, sem nada concreto para mostrar.</p></div>
                  <div className="exhibit-cell after"><p>Portal do cliente com progresso, relatórios e visitas sempre atualizados — sem teres de responder.</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="block" id="funciona">
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
              <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Segurança</p>
                <h2>Cada cliente só vê a obra dele. A sério.</h2>
                <p>Não é uma opção escondida num menu — é uma regra aplicada na própria base de dados, obra a obra, cliente a cliente.</p>
              </div>
              <div className="trust-note reveal" style={{ maxWidth: "42rem", marginInline: "auto" }}>&ldquo;Só vês os dados da tua obra. O acesso é validado do lado do servidor — e não apenas escondido na interface.&rdquo;</div>
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
                  <Link className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></Link>
                  <div className="sign-line"><span>PDRMELRO@GMAIL.COM</span></div>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* ============ SERVIÇO ============ */}
        <section className={route === "servico" ? "view is-active" : "view"} data-view="servico">
          <div className="wrap hero" style={{ paddingTop: "clamp(2.5rem, 6vw, 4rem)" }}>
            <div className="hero-grid">
              <div>
                <p className="eyebrow">Fiscalização de obra independente · Aveiro e Porto</p>
                <h1>Entre ti e o empreiteiro, <em>alguém tem de saber</em> o que está a ver.</h1>
                <p className="hero-sub">Sou engenheiro civil, membro da Ordem dos Engenheiros. Acompanho a tua obra com visitas regulares, registo do que é visto e um portal próprio onde vês tudo — sem teres de perguntar nada a ninguém.</p>
                <div className="hero-ctas">
                  <Link className="btn btn-primary" href="/pedido?tipo=orcamento">Pedir um orçamento <span className="btn-arrow">→</span></Link>
                  <a className="btn btn-ghost" href="#plataforma">Tenho uma empresa de fiscalização →</a>
                </div>
                <p className="hero-note">Aveiro · Porto — engenheiro civil, membro da Ordem dos Engenheiros.</p>
                <Link className="hero-portal" href="/portal/login">Já és cliente? Aceder ao portal ↗</Link>
              </div>
              <div className="field-stack" aria-hidden="true">
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
                  <div className="doc-sig">Eng.º Pedro Melro · Fiscalização</div>
                </div>
              </div>
            </div>
          </div>

          <section className="block">
            <div className="wrap">
              <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Isto é o que vais ver</p>
                <h2>O teu portal, com a tua obra a sério.</h2>
              </div>
              <div className="frame-wrap reveal">
                <div className="frame">
                  <div className="frame-bar">
                    <span className="frame-dot r"></span><span className="frame-dot y"></span><span className="frame-dot g"></span>
                    <span className="frame-url">fiscalis-pied.vercel.app/portal</span>
                  </div>
                  <div className="mock-portal">
                    <div className="mock-portal-head">
                      <div className="mock-portal-brand"><img src={LOGO_SRC_DARK} alt="" /><span>FISCALIS ENGENHARIA</span></div>
                      <span className="mock-portal-user">👤 Família Ferreira</span>
                    </div>
                    <div className="mock-portal-body">
                      <p className="mock-portal-welcome">Bem-vindo, Família Ferreira</p>
                      <p className="mock-portal-obra">Moradia — Aveiro</p>
                      <div className="mock-progress">
                        <div className="mock-progress-bar"><span style={{ width: "68%" }}></span></div>
                        <span className="mock-progress-n">68%</span>
                      </div>
                      <div className="mock-portal-grid">
                        <div className="mock-portal-panel">
                          <p className="t">Relatórios disponíveis</p>
                          <div className="mock-portal-row"><span>18 Ago 2026</span><span>↗</span></div>
                          <div className="mock-portal-row"><span>04 Ago 2026</span><span>↗</span></div>
                        </div>
                        <div className="mock-portal-panel">
                          <p className="t">Não conformidades</p>
                          <div className="mock-portal-row"><span className="mock-dot" style={{ background: "#C4791E" }}></span><span style={{ flex: 1, marginLeft: "0.4rem" }}>Impermeabilização da cobertura</span></div>
                          <div className="mock-portal-row"><span className="mock-dot" style={{ background: "#2C6B45" }}></span><span style={{ flex: 1, marginLeft: "0.4rem" }}>Vãos exteriores — corrigido</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="block" id="porque">
            <div className="wrap">
              <div className="section-head reveal">
                <p className="eyebrow">Porquê fiscalização</p>
                <h2>Sem alguém do teu lado, estás a confiar às cegas.</h2>
                <p>Não é desconfiança do empreiteiro — é que ninguém devia ter de ser, ao mesmo tempo, cliente e especialista técnico.</p>
              </div>
              <div className="exhibit">
                <div className="exhibit-row reveal">
                  <div className="exhibit-cell before"><p>Só percebes que há um problema estrutural quando já está tapado — e caro de corrigir.</p></div>
                  <div className="exhibit-cell after"><p>Não conformidades identificadas e registadas formalmente, com prazo de correção.</p></div>
                </div>
                <div className="exhibit-row reveal">
                  <div className="exhibit-cell before"><p>Ligas ao empreiteiro a perguntar como vai, e ficas com a palavra dele, sem mais nada.</p></div>
                  <div className="exhibit-cell after"><p>Tens um portal próprio — progresso, relatórios e visitas, sempre atualizado.</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="block">
            <div className="wrap">
              <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
                <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Quem sou</p>
                <h2>Engenheiro civil, não um intermediário.</h2>
                <p>Sou eu que visito a obra, sou eu que assino o relatório. Sem equipas rotativas, sem &ldquo;quem calhar esta semana&rdquo;. Engenheiro Civil, membro da Ordem dos Engenheiros — Aveiro e Porto.</p>
              </div>
              <div className="trust-note reveal" style={{ maxWidth: "42rem", marginInline: "auto" }}>&ldquo;O meu trabalho é olhar pela tua obra como se fosse a minha — e mostrar-te exatamente o que vi, sempre.&rdquo;</div>
            </div>
          </section>

          <section className="block">
            <div className="wrap">
              <div className="cover reveal">
                <div>
                  <p className="eyebrow">Próximo passo</p>
                  <h2>Fala-me da tua obra.</h2>
                  <p>Conta-me em que fase está, onde é (Aveiro, Porto ou perto), e o que precisas de acompanhar — respondo com uma proposta e os próximos passos.</p>
                </div>
                <div className="sign-box">
                  <Link className="btn btn-primary" href="/pedido?tipo=orcamento">Pedir um orçamento <span className="btn-arrow">→</span></Link>
                  <div className="sign-line"><span>PDRMELRO@GMAIL.COM</span></div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>

      <footer>
        <div className="wrap foot-row">
          <div className="foot-brand"><img className="brand-mark" style={{ height: 22 }} src={LOGO_SRC} alt="Fiscalis" /><span className="brand-word">FISCALIS</span></div>
          <p className="foot-note">Plataforma de fiscalização de obra e serviço de fiscalização independente. © 2026 Fiscalis Engenharia.</p>
        </div>
      </footer>
    </div>
  );
}
