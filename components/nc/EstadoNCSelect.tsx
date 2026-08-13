"use client";

import { useTransition } from "react";
import { atualizarEstadoNC } from "@/lib/actions/nc";
import type { EstadoNC } from "@/lib/supabase/types";

const ESTADOS: EstadoNC[] = ["Aberta", "Em correção", "Fechada"];

export function EstadoNCSelect({ id, estado }: { id: string; estado: EstadoNC }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estado}
      disabled={pending}
      onChange={(e) => startTransition(() => atualizarEstadoNC(id, e.target.value as EstadoNC))}
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
