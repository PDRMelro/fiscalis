"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2 } from "lucide-react";
import { gerarPdfAutoNC } from "@/lib/actions/nc";

export function GerarPdfNCButton({ ncId, pdfPath }: { ncId: string; pdfPath: string | null }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (pdfPath) {
    return (
      <a href={`/api/nc/${ncId}/download`} className="text-[12px] text-[#14283A] font-medium">
        Ver PDF
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setErro(null);
            const resultado = await gerarPdfAutoNC(ncId);
            if (resultado.error) setErro(resultado.error);
          })
        }
        className="flex items-center gap-1 text-[12px] text-[#14283A] font-medium disabled:opacity-60"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
        {pending ? "A gerar..." : "Gerar PDF"}
      </button>
      {erro && <p className="text-[10px] text-[#B0402F] mt-0.5 max-w-[160px]">{erro}</p>}
    </div>
  );
}
