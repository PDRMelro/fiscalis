"use client";

import { useState, useTransition } from "react";
import { atualizarPerfilFiscal } from "@/lib/actions/perfilFiscal";
import type { PerfilFiscalRow } from "@/lib/supabase/types";

export function PerfilFiscalForm({ perfil }: { perfil: PerfilFiscalRow | null }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const iniciais = (perfil?.nome ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function guardar(formData: FormData) {
    setErro(null);
    setGuardado(false);
    startTransition(async () => {
      const resultado = await atualizarPerfilFiscal(formData);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      setGuardado(true);
    });
  }

  return (
    <form action={guardar} className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-[#14283A] text-white flex items-center justify-center text-[16px] font-medium shrink-0">
          {iniciais || "?"}
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[#1F1D19] truncate">{perfil?.nome}</p>
          <p className="text-[12px] text-[#8A8578]">
            {perfil?.qualificacao} · Cédula Profissional n.º {perfil?.cedula_profissional}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome</label>
          <input name="nome" defaultValue={perfil?.nome} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Qualificação</label>
          <input name="qualificacao" defaultValue={perfil?.qualificacao} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div className="col-span-2">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Morada fiscal</label>
          <input name="morada_fiscal" defaultValue={perfil?.morada_fiscal} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">NIF</label>
          <input name="nif" defaultValue={perfil?.nif} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cartão de Cidadão</label>
          <input name="cartao_cidadao" defaultValue={perfil?.cartao_cidadao} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div className="col-span-2">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cédula profissional</label>
          <input name="cedula_profissional" defaultValue={perfil?.cedula_profissional} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
      </div>
      <p className="text-[11px] text-[#8A8578] mt-2">
        Estes dados preenchem automaticamente o Termo de Responsabilidade gerado em cada obra.
      </p>
      <div className="flex items-center gap-2 mt-3">
        <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60">
          {pending ? "A guardar..." : "Guardar"}
        </button>
        {guardado && !pending && <span className="text-[12px] text-[#3E7A4D]">Guardado.</span>}
        {erro && <span className="text-[12px] text-[#B0402F]">{erro}</span>}
      </div>
    </form>
  );
}
