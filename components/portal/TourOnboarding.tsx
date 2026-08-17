"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { concluirTourCliente } from "@/lib/actions/auth";

export type PassoTour = { alvo: string; titulo: string; texto: string };

export function TourOnboarding({
  passos,
  nome,
  onClose,
}: {
  passos: PassoTour[];
  nome: string;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(-1); // -1 = ecrã de boas-vindas

  useEffect(() => {
    if (indice < 0) return;
    const passo = passos[indice];
    if (!passo) return;
    const el = document.getElementById(passo.alvo);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("tour-destaque");
    return () => el?.classList.remove("tour-destaque");
  }, [indice, passos]);

  function terminar() {
    onClose();
    concluirTourCliente();
  }

  const passo = indice >= 0 ? passos[indice] : null;
  const primeiroNome = nome.split(" ")[0];

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40" />
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-white rounded-xl shadow-2xl border border-[#E4E1D6] p-5">
        {indice < 0 ? (
          <>
            <div className="flex items-center gap-2 text-[#C9A050] mb-2">
              <Sparkles size={16} />
              <span className="text-[11px] font-medium uppercase tracking-wide">Bem-vindo ao portal</span>
            </div>
            <p className="text-[15px] font-semibold text-[#14283A] mb-1.5">Olá, {primeiroNome}!</p>
            <p className="text-[13px] text-[#4A4740] mb-4">
              Este é o teu espaço para acompanhares a tua obra: relatórios, não conformidades, visitas,
              documentos e muito mais. Queres uma volta rápida pelas funcionalidades?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIndice(0)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium"
              >
                Mostrar-me
              </button>
              <button onClick={terminar} className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
                Pular
              </button>
            </div>
          </>
        ) : passo ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-[#8A4A17]">
                Passo {indice + 1} de {passos.length}
              </p>
              <button onClick={terminar} className="text-[#8A8578] hover:text-[#14283A]">
                <X size={15} />
              </button>
            </div>
            <p className="text-[14px] font-semibold text-[#14283A] mb-1">{passo.titulo}</p>
            <p className="text-[13px] text-[#4A4740] mb-4">{passo.texto}</p>

            <div className="flex items-center gap-1.5 mb-4">
              {passos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === indice ? "w-5 bg-[#C9A050]" : "w-1.5 bg-[#EDEBE2]"}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {indice > 0 && (
                <button
                  onClick={() => setIndice((i) => i - 1)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#4A4740]"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
              )}
              <button
                onClick={() => (indice + 1 < passos.length ? setIndice(indice + 1) : terminar())}
                className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium"
              >
                {indice + 1 < passos.length ? (
                  <>
                    Seguinte <ChevronRight size={14} />
                  </>
                ) : (
                  "Concluir"
                )}
              </button>
              <button onClick={terminar} className="px-3 py-2 rounded-lg text-[13px] text-[#8A8578]">
                Pular
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
