"use client";

import { useTransition } from "react";
import { atualizarEstadoNC } from "@/lib/actions/nc";
import type { EstadoNC } from "@/lib/supabase/types";

const ESTADOS: EstadoNC[] = ["Aberta", "Em correção", "Corrigida", "Encerrada"];

const CORES_ESTADO: Record<EstadoNC, string> = {
  Aberta: "text-[#B0402F] bg-[#FBEAE6] border-[#E8B9AC]",
  "Em correção": "text-[#8A4A17] bg-[#FBF0DC] border-[#E8C98F]",
  Corrigida: "text-[#2E5C8A] bg-[#EAF0F7] border-[#C3D6E8]",
  Encerrada: "text-[#3E7A4D] bg-[#E9F5EC] border-[#B9DCC2]",
};

export function EstadoNCSelect({ id, estado }: { id: string; estado: EstadoNC }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={estado}
      disabled={pending}
      onChange={(e) => startTransition(() => atualizarEstadoNC(id, e.target.value as EstadoNC))}
      className={`text-[11px] font-medium border rounded px-1.5 py-1 disabled:opacity-60 ${CORES_ESTADO[estado]}`}
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e} className="bg-white text-[#1F1D19]">
          {e}
        </option>
      ))}
    </select>
  );
}
