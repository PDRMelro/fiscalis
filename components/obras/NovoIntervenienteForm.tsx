"use client";

import { useState } from "react";
import { adicionarInterveniente } from "@/lib/actions/obras";
import type { TipoInterveniente } from "@/lib/supabase/types";

export function NovoIntervenienteForm({ obraId }: { obraId: string }) {
  const [tipo, setTipo] = useState<TipoInterveniente | "">("");
  const mostrarEmpresa = tipo === "Construtora";
  const mostrarCedula = tipo === "Direção de Obra" || tipo === "Arquitetura";

  return (
    <form
      action={adicionarInterveniente.bind(null, obraId)}
      className="bg-white border border-[#E4E1D6] rounded-xl p-3 mt-4 space-y-2"
    >
      <div className="flex flex-wrap gap-2">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoInterveniente | "")}
          className="text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5 bg-white"
        >
          <option value="">Tipo de interveniente</option>
          <option value="Direção de Obra">Direção de Obra</option>
          <option value="Construtora">Construtora</option>
          <option value="Arquitetura">Arquitetura</option>
          <option value="Outro">Outro</option>
        </select>
        <input
          name="papel"
          required
          placeholder="Papel (ex: Dono de obra, Fiscal...)"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          name="nome"
          required
          placeholder="Nome"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
        <input
          name="contacto"
          placeholder="Contacto"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      </div>

      {mostrarEmpresa && (
        <input
          name="empresa"
          placeholder="Nome da empresa"
          className="w-full text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      )}

      {mostrarCedula && (
        <div className="flex flex-wrap gap-2">
          <input
            name="cedula_profissional"
            placeholder="N.º cédula profissional"
            className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
          />
          {tipo === "Direção de Obra" && (
            <input
              name="colegio"
              placeholder="Colégio / especialidade (ex: Civil)"
              className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
            />
          )}
        </div>
      )}

      <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5">
        Adicionar
      </button>
    </form>
  );
}
