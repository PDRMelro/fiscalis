"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import { PlataformaTour } from "./PlataformaTour";
import { PortalTour } from "./PortalTour";
import { ObraAnimada } from "./ObraAnimada";
import "./hub.css";

export function HubView() {
  const [entrarOpen, setEntrarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.body.classList.add("hub-body");
    return () => {
      document.body.classList.remove("hub-body");
    };
  }, []);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const els = container.querySelectorAll<HTMLElement>(".reveal:not(.in)");
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
  }, []);

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
            <a href="#" className="nav-home">
              <span className="full">Início</span>
              <span className="short" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 10v8.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 19.5v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <a href="#servicos">
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
        {/* ============ HERO ============ */}
        <div className="wrap hub-hero">
          <div className="hub-mark"><img src={LOGO_SRC_DARK} alt="Fiscalis" /><span>FISCALIS</span></div>
          <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Engenharia · Fiscalização de obra</p>
          <h1>Fiscalização de obra, <em>à tua maneira.</em></h1>
          <p className="hero-sub">Uma plataforma para quem fiscaliza obras. Um serviço completo para quem só quer alguém de confiança do lado da obra.</p>
          <a className="hero-portal" href="#servicos">Ver os serviços ↓</a>
        </div>

        {/* ============ SERVIÇOS ============ */}
        <section className="block" id="servicos">
          <div className="wrap">
            <div className="section-head reveal" style={{ marginInline: "auto", textAlign: "center" }}>
              <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Serviços</p>
              <h2>Três formas de nunca perderes o controlo da obra.</h2>
            </div>
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

        {/* ============ COMPROMISSO ============ */}
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

        {/* ============ FISCALIZAÇÃO DE OBRA ============ */}
        <section id="fiscalizacao">
          <div className="wrap hero">
            <div className="hero-grid">
              <div>
                <p className="eyebrow">Fiscalização de obra · Região Centro e Norte</p>
                <h2 className="hero-title">Entre ti e o empreiteiro, <em>alguém tem de saber</em> o que está a ver.</h2>
                <p className="hero-sub">Visitas regulares, registo do que é visto, e um portal próprio onde vês tudo — sem teres de perguntar nada a ninguém.</p>
                <div className="hero-ctas">
                  <a className="btn btn-primary" href="/pedido?tipo=orcamento">Pedir um orçamento <span className="btn-arrow">→</span></a>
                  <a className="btn btn-ghost" href="#plataforma">Tenho uma empresa de fiscalização →</a>
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
                <p className="eyebrow" style={{ justifyContent: "center", display: "flex" }}>Isto é o que vais ver</p>
                <h2>O teu portal, com a tua obra a sério.</h2>
              </div>
              <PortalTour />
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
        </section>

        {/* ============ CONSULTORIA TÉCNICA ============ */}
        <section className="block" id="consultoria">
          <div className="wrap">
            <div className="section-head reveal">
              <p className="eyebrow">Consultoria técnica</p>
              <h2>Uma opinião técnica, sem compromisso de obra contínua.</h2>
              <p>Nem sempre precisas de fiscalização regular — às vezes só de alguém que perceba do assunto, uma vez.</p>
            </div>
            <div className="steps">
              <div className="step reveal"><p className="step-num">01</p><h3>Antes de comprar</h3><p>Uma vistoria técnica ao imóvel antes de avançares — para saberes exatamente o que estás a comprar.</p></div>
              <div className="step reveal"><p className="step-num">02</p><h3>Validar um orçamento</h3><p>Uma segunda opinião sobre a proposta do empreiteiro, antes de assinares.</p></div>
              <div className="step reveal"><p className="step-num">03</p><h3>Resolver uma dúvida</h3><p>Um parecer técnico pontual sobre um problema concreto, sem contrato de fiscalização.</p></div>
            </div>
            <div className="reveal" style={{ marginTop: "2.5rem", textAlign: "center" }}>
              <a className="btn btn-primary" href="/pedido?tipo=consultoria">Pedir uma consulta <span className="btn-arrow">→</span></a>
            </div>
          </div>
        </section>

        {/* ============ CTA: fiscalização / consultoria ============ */}
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

        {/* ============ PLATAFORMA DIGITAL ============ */}
        <section id="plataforma">
          <div className="wrap hero">
            <div className="hero-grid">
              <div>
                <p className="eyebrow">Plataforma digital · Para empresas</p>
                <h2 className="hero-title">A obra não pára.<br />Os registos <em>também não podiam.</em></h2>
                <p className="hero-sub">Fiscalis junta visitas, não conformidades, relatórios e o próprio cliente numa só plataforma — sem perder uma fotografia, um prazo ou uma assinatura pelo caminho.</p>
                <div className="hero-ctas">
                  <a className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></a>
                  <a className="btn btn-ghost" href="#fiscalizacao">Sou dono de obra, não empresa →</a>
                </div>
                <p className="hero-note">Sem instalação. Sem folhas soltas. Um separador por obra.</p>
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
                  <a className="btn btn-primary" href="/pedido?tipo=demonstracao">Pedir uma demonstração <span className="btn-arrow">→</span></a>
                  <div className="sign-line"><span>GERAL@FISCALIS-ENGENHARIA.PT</span></div>
                </div>
              </div>
            </div>
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
