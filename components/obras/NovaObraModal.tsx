"use client";

import { useActionState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import { criarObra, type ResultadoObra } from "@/lib/actions/obras";

const LocalizacaoObraPicker = dynamic(
  () => import("@/components/obras/LocalizacaoObraPicker").then((m) => m.LocalizacaoObraPicker),
  { ssr: false, loading: () => <div className="h-[220px] sm:h-[280px] rounded-lg border border-[#DEDBD2] bg-[#F5F4EF]" /> }
);

const inicial: ResultadoObra = { error: null };

export function NovaObraModal() {
  const [state, formAction, pending] = useActionState(criarObra, inicial);

  return (
    <ModalTrigger label="Nova obra" icon={Plus} maxWidth="max-w-xl">
      {() => (
        <form action={formAction} className="p-6 space-y-3">
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Nova obra</h2>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome da obra</label>
            <input
              name="nome"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] focus:outline-none focus:border-[#14283A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cliente</label>
            <input
              name="cliente_nome"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] focus:outline-none focus:border-[#14283A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Localização</label>
            <input
              name="local"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] focus:outline-none focus:border-[#14283A]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Localização exata no mapa</label>
            <LocalizacaoObraPicker />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Início</label>
              <input
                name="inicio"
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] focus:outline-none focus:border-[#14283A]"
              />
            </div>
            <div className="flex-1">
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Honorário mensal (€)</label>
              <input
                name="honorario_mensal"
                type="number"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] focus:outline-none focus:border-[#14283A]"
              />
            </div>
          </div>
          {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
          >
            {pending ? "A criar..." : "Criar obra"}
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
