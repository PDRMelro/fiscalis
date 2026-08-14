"use client";

import type { TipoInterveniente } from "@/lib/supabase/types";

export function IntervenienteCampos({
  tipo,
  onTipoChange,
  defaults,
}: {
  tipo: TipoInterveniente | "";
  onTipoChange: (tipo: TipoInterveniente | "") => void;
  defaults?: {
    papel?: string;
    nome?: string;
    contacto?: string | null;
    empresa?: string | null;
    cedula_profissional?: string | null;
    colegio?: string | null;
  };
}) {
  const mostrarEmpresa = tipo === "Construtora";
  const mostrarCedula = tipo === "Direção de Obra" || tipo === "Arquitetura" || tipo === "Coordenador de Segurança";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => onTipoChange(e.target.value as TipoInterveniente | "")}
          className="text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5 bg-white"
        >
          <option value="">Tipo de interveniente</option>
          <option value="Direção de Obra">Direção de Obra</option>
          <option value="Construtora">Construtora</option>
          <option value="Arquitetura">Arquitetura</option>
          <option value="Coordenador de Segurança">Coordenador de Segurança em Obra</option>
          <option value="Outro">Outro</option>
        </select>
        <input
          name="papel"
          required
          defaultValue={defaults?.papel}
          placeholder="Papel (ex: Dono de obra, Fiscal...)"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          name="nome"
          required
          defaultValue={defaults?.nome}
          placeholder="Nome"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
        <input
          name="contacto"
          defaultValue={defaults?.contacto ?? undefined}
          placeholder="Contacto"
          className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      </div>

      {mostrarEmpresa && (
        <input
          name="empresa"
          defaultValue={defaults?.empresa ?? undefined}
          placeholder="Nome da empresa"
          className="w-full text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
      )}

      {mostrarCedula && (
        <div className="flex flex-wrap gap-2">
          <input
            name="cedula_profissional"
            defaultValue={defaults?.cedula_profissional ?? undefined}
            placeholder="N.º cédula profissional"
            className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
          />
          {tipo === "Direção de Obra" && (
            <input
              name="colegio"
              defaultValue={defaults?.colegio ?? undefined}
              placeholder="Colégio / especialidade (ex: Civil)"
              className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
            />
          )}
        </div>
      )}
    </>
  );
}
