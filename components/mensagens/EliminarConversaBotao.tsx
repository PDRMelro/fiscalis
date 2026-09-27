"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { eliminarConversa } from "@/lib/actions/mensagens";

export function EliminarConversaBotao({
  outroId,
  compacto = false,
  aposEliminarIrPara,
}: {
  outroId: string;
  compacto?: boolean;
  aposEliminarIrPara?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function eliminar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Eliminar esta conversa? As mensagens desaparecem para as duas pessoas e não há como recuperar.")) {
      return;
    }
    setErro(null);
    startTransition(async () => {
      const resultado = await eliminarConversa(outroId);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      if (aposEliminarIrPara) {
        router.push(aposEliminarIrPara);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        title="Eliminar conversa"
        disabled={pending}
        onClick={eliminar}
        className={
          compacto
            ? "flex items-center justify-center w-8 h-8 rounded-lg text-[#B0402F] hover:bg-[#FBEAE6] shrink-0 disabled:opacity-60"
            : "flex items-center gap-1.5 text-[13px] text-[#B0402F] border border-[#F0CFC6] rounded-lg px-3.5 py-2 disabled:opacity-60"
        }
      >
        <Trash2 size={14} />
        {!compacto && (pending ? " A eliminar..." : " Eliminar conversa")}
      </button>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1 max-w-[220px]">{erro}</p>}
    </div>
  );
}
