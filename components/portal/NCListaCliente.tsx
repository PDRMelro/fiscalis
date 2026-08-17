"use client";

import { useState } from "react";
import { EstadoDot } from "@/components/ui/Tags";
import { NCDetalheModal } from "@/components/portal/NCDetalheModal";
import type { NaoConformidadeRow } from "@/lib/supabase/types";

export function NCListaCliente({ ncs }: { ncs: NaoConformidadeRow[] }) {
  const [selecionada, setSelecionada] = useState<NaoConformidadeRow | null>(null);

  if (ncs.length === 0) {
    return <p className="text-[12px] text-[#8A8578]">Sem registos.</p>;
  }

  return (
    <>
      <div className="space-y-1.5">
        {ncs.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setSelecionada(n)}
            className="w-full flex items-center justify-between text-[12px] bg-[#F5F4EF] rounded-lg px-3 py-2 hover:bg-[#EDEBE2] transition-colors text-left"
          >
            <span className="text-[#1F1D19] truncate max-w-[160px]">{n.descricao}</span>
            <EstadoDot estado={n.estado} />
          </button>
        ))}
      </div>

      {selecionada && <NCDetalheModal nc={selecionada} onClose={() => setSelecionada(null)} />}
    </>
  );
}
