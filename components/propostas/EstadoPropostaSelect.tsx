"use client";

import { useTransition } from "react";
import { atualizarEstadoProposta } from "@/lib/actions/propostas";
import type { EstadoProposta } from "@/lib/supabase/types";

const ESTADOS: EstadoProposta[] = ["aguarda adjudicação", "adjudicada", "recusada"];

export function EstadoPropostaSelect({ id, estado }: { id: string; estado: EstadoProposta }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estado}
      disabled={pending}
      onChange={(e) => startTransition(() => atualizarEstadoProposta(id, e.target.value as EstadoProposta))}
      className="text-[11px] border border-[#E4E1D6] rounded px-1.5 py-1 bg-white disabled:opacity-60"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {e}
        </option>
      ))}
    </select>
  );
}
