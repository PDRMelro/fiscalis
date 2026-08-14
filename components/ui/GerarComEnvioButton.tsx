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
  const [erro, setErro] = useState<string | null>(null);

  function gerar(enviarCliente: boolean) {
    setErro(null);
    startTransition(async () => {
      const resultado = await onGerar(enviarCliente);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      setOpen(false);
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
            {erro && <p className="text-[12px] text-[#B0402F] mb-3">{erro}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => gerar(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
              >
                {pending && <Loader2 size={13} className="animate-spin" />} Sim, enviar também
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => gerar(false)}
                className="flex-1 px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#4A4740] disabled:opacity-60"
              >
                Não, só gerar
              </button>
            </div>
          </div>
        )}
      </ModalShell>
    </>
  );
}
