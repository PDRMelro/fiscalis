"use client";

import { useState, useTransition } from "react";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { VerPdfButton } from "@/components/ui/VerPdfButton";
import { gerarPdfProposta } from "@/lib/actions/propostas";

const CLASSE_BOTAO =
  "inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors cursor-pointer disabled:opacity-60";

export function GerarPdfPropostaButton({
  propostaId,
  pdfPath,
  temObra,
}: {
  propostaId: string;
  pdfPath: string | null;
  temObra: boolean;
}) {
  if (!pdfPath) return <BotaoGerar propostaId={propostaId} temObra={temObra} label="Gerar PDF" />;

  // Depois de gerado, o PDF pode ser regenerado a partir dos valores atuais da
  // proposta (substitui o ficheiro anterior), sem ser preciso criar outra proposta.
  return (
    <div className="flex items-start gap-2">
      <VerPdfButton href={`/api/propostas/${propostaId}/download`} className={CLASSE_BOTAO}>
        <FileText size={12} /> Ver PDF
      </VerPdfButton>
      <BotaoGerar propostaId={propostaId} temObra={temObra} label="Atualizar PDF" />
    </div>
  );
}

function BotaoGerar({ propostaId, temObra, label }: { propostaId: string; temObra: boolean; label: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const Icone = label === "Gerar PDF" ? FileText : RefreshCw;

  if (temObra) {
    return (
      <GerarComEnvioButton
        label={label}
        icon={Icone}
        categoriaLabel="Outros documentos"
        onGerar={gerarPdfProposta.bind(null, propostaId)}
        className={CLASSE_BOTAO}
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
        className={CLASSE_BOTAO}
      >
        {pending ? <Loader2 size={12} className="animate-spin" /> : <Icone size={12} />}
        {pending ? "A gerar..." : label}
      </button>
      {erro && <p className="text-[11px] text-[#B0402F]">{erro}</p>}
    </div>
  );
}
