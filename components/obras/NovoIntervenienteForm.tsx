"use client";

import { useState } from "react";
import { adicionarInterveniente } from "@/lib/actions/obras";
import { IntervenienteCampos } from "@/components/obras/IntervenienteCampos";
import type { TipoInterveniente } from "@/lib/supabase/types";

export function NovoIntervenienteForm({ obraId }: { obraId: string }) {
  const [tipo, setTipo] = useState<TipoInterveniente | "">("");

  return (
    <form
      action={adicionarInterveniente.bind(null, obraId)}
      className="bg-white border border-[#E4E1D6] rounded-xl p-3 mt-4 space-y-2"
    >
      <IntervenienteCampos tipo={tipo} onTipoChange={setTipo} />
      <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5">
        Adicionar
      </button>
    </form>
  );
}
