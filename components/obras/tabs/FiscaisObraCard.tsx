"use client";

import { useState, useTransition } from "react";
import { atualizarFiscaisObra } from "@/lib/actions/obraFiscais";
import type { ProfileRow } from "@/lib/supabase/types";

export function FiscaisObraCard({
  obraId,
  fiscaisAssociados,
  atribuidosIds,
}: {
  obraId: string;
  fiscaisAssociados: ProfileRow[];
  atribuidosIds: Set<string>;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  if (fiscaisAssociados.length === 0) return null;

  function guardar(formData: FormData) {
    setErro(null);
    setGuardado(false);
    startTransition(async () => {
      const resultado = await atualizarFiscaisObra(obraId, { error: null }, formData);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      setGuardado(true);
    });
  }

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mt-5">
      <p className="text-[13px] font-medium text-[#4A4740] mb-1">Fiscais associados</p>
      <p className="text-[11px] text-[#8A8578] mb-4">
        Escolhe quais os fiscais que veem e podem trabalhar nesta obra. Os fiscais principais já veem todas as
        obras da empresa automaticamente.
      </p>

      <form action={guardar} className="space-y-2">
        {fiscaisAssociados.map((fiscal) => (
          <label key={fiscal.id} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
            <input
              type="checkbox"
              name="fiscalIds"
              value={fiscal.id}
              defaultChecked={atribuidosIds.has(fiscal.id)}
              className="w-3.5 h-3.5 accent-[#14283A]"
            />
            {fiscal.nome}
            <span className="text-[11px] text-[#8A8578]">{fiscal.email}</span>
          </label>
        ))}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-[#14283A] text-white text-[12px] font-medium disabled:opacity-60"
          >
            {pending ? "A guardar..." : "Guardar"}
          </button>
          {guardado && !pending && <span className="text-[12px] text-[#3E7A4D]">Guardado.</span>}
          {erro && <span className="text-[12px] text-[#B0402F]">{erro}</span>}
        </div>
      </form>
    </div>
  );
}
