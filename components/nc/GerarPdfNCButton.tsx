"use client";

import { FileText } from "lucide-react";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { gerarPdfAutoNC } from "@/lib/actions/nc";

export function GerarPdfNCButton({ ncId, pdfPath }: { ncId: string; pdfPath: string | null }) {
  if (pdfPath) {
    return (
      <a href={`/api/nc/${ncId}/download`} className="text-[12px] text-[#14283A] font-medium">
        Ver PDF
      </a>
    );
  }

  return (
    <GerarComEnvioButton
      label="Gerar PDF"
      icon={FileText}
      categoriaLabel="Não conformidades"
      onGerar={gerarPdfAutoNC.bind(null, ncId)}
      className="flex items-center gap-1 text-[12px] text-[#14283A] font-medium"
    />
  );
}
