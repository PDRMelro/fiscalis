"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { gerarTermoResponsabilidade } from "@/lib/actions/documentos";

export function GerarTermoButton({ obraId }: { obraId: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setErro(null);
            const resultado = await gerarTermoResponsabilidade(obraId);
            if (resultado.error) setErro(resultado.error);
          })
        }
        className="flex items-center gap-1.5 text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5 disabled:opacity-60"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
        {pending ? "A gerar..." : "Gerar Termo de Responsabilidade"}
      </button>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1.5">{erro}</p>}
    </div>
  );
}
