"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2 } from "lucide-react";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { VerPdfButton } from "@/components/ui/VerPdfButton";
import { gerarPdfProposta } from "@/lib/actions/propostas";

export function GerarPdfPropostaButton({
  propostaId,
  pdfPath,
  temObra,
}: {
  propostaId: string;
  pdfPath: string | null;
  temObra: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (pdfPath) {
    return (
      <VerPdfButton
        href={`/api/propostas/${propostaId}/download`}
        className="inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
      >
        <FileText size={12} /> Ver PDF
      </VerPdfButton>
    );
  }

  if (temObra) {
    return (
      <GerarComEnvioButton
        label="Gerar PDF"
        icon={FileText}
        categoriaLabel="Outros documentos"
        onGerar={gerarPdfProposta.bind(null, propostaId)}
        className="inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors cursor-pointer"
      />
    );
  }

  // Sem obra associada não há portal de cliente para onde enviar, por isso
  // gera-se logo o PDF sem passar pelo modal de "enviar também ao cliente".
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setErro(null);
          startTransition(async () => {
            const resultado = await gerarPdfProposta(propostaId, false);
            if (resultado.error) setErro(resultado.error);
          });
        }}
        className="inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors cursor-pointer disabled:opacity-60"
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
        {pending ? "A gerar..." : "Gerar PDF"}
      </button>
      {erro && <p className="text-[11px] text-[#B0402F]">{erro}</p>}
    </div>
  );
}
