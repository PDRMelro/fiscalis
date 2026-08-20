"use client";

import { FileText } from "lucide-react";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { VerPdfButton } from "@/components/ui/VerPdfButton";
import { gerarPdfAutoNC } from "@/lib/actions/nc";

export function GerarPdfNCButton({ ncId, pdfPath }: { ncId: string; pdfPath: string | null }) {
  if (pdfPath) {
    return (
      <VerPdfButton
        href={`/api/nc/${ncId}/download`}
        className="inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
      >
        <FileText size={12} /> Ver PDF
      </VerPdfButton>
    );
  }

  return (
    <GerarComEnvioButton
      label="Gerar PDF"
      icon={FileText}
      categoriaLabel="Não conformidades"
      onGerar={gerarPdfAutoNC.bind(null, ncId)}
      className="inline-flex items-center gap-1 text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors cursor-pointer"
    />
  );
}
