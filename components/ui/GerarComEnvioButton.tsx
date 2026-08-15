"use client";

import { useState, useTransition, type ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";

export function GerarComEnvioButton({
  label,
  icon: Icon,
  categoriaLabel,
  onGerar,
  className,
}: {
  label: string;
  icon: ComponentType<{ size?: number }>;
  categoriaLabel: string;
  onGerar: (enviarCliente: boolean) => Promise<{ error: string | null }>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [escolha, setEscolha] = useState<"enviar" | "so" | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function gerar(enviarCliente: boolean) {
    setErro(null);
    setEscolha(enviarCliente ? "enviar" : "so");
    startTransition(async () => {
      const resultado = await onGerar(enviarCliente);
      if (resultado.error) {
        setErro(resultado.error);
        setEscolha(null);
        return;
      }
      setOpen(false);
      setEscolha(null);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "flex items-center gap-1 text-[12px] text-[#14283A] font-medium ml-auto"}
      >
        <Icon size={12} /> {label}
      </button>

      <ModalShell open={open} onClose={() => !pending && setOpen(false)} maxWidth="max-w-sm">
        {() => (
          <div className="p-6">
            <h2 className="text-[15px] font-semibold text-[#14283A] mb-2">{label}</h2>
            <p className="text-[13px] text-[#4A4740] mb-4">
              Queres também colocar este documento em Documentos → Enviados ao cliente, na pasta
              &ldquo;{categoriaLabel}&rdquo;?
            </p>

            {pending && (
              <div className="flex items-center gap-2 text-[12px] text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded-lg px-3 py-2 mb-3">
                <Loader2 size={13} className="animate-spin shrink-0" />
                A gerar o PDF, aguarda um momento...
              </div>
            )}
            {erro && <p className="text-[12px] text-[#B0402F] mb-3">{erro}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => gerar(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-70"
              >
                {escolha === "enviar" && <Loader2 size={13} className="animate-spin" />}
                {escolha === "enviar" ? "A gerar..." : "Sim, enviar também"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => gerar(false)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#4A4740] disabled:opacity-70"
              >
                {escolha === "so" && <Loader2 size={13} className="animate-spin" />}
                {escolha === "so" ? "A gerar..." : "Não, só gerar"}
              </button>
            </div>
          </div>
        )}
      </ModalShell>
    </>
  );
}
