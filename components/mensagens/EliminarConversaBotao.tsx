"use client";

import { Trash2 } from "lucide-react";
import { eliminarConversa } from "@/lib/actions/mensagens";

export function EliminarConversaBotao({ outroId, compacto = false }: { outroId: string; compacto?: boolean }) {
  return (
    <form action={eliminarConversa.bind(null, outroId)}>
      <button
        type="submit"
        title="Eliminar conversa"
        onClick={(e) => {
          e.stopPropagation();
          if (!confirm("Eliminar esta conversa? As mensagens desaparecem para as duas pessoas e não há como recuperar.")) {
            e.preventDefault();
          }
        }}
        className={
          compacto
            ? "flex items-center justify-center w-8 h-8 rounded-lg text-[#B0402F] hover:bg-[#FBEAE6] shrink-0"
            : "flex items-center gap-1.5 text-[13px] text-[#B0402F] border border-[#F0CFC6] rounded-lg px-3.5 py-2"
        }
      >
        <Trash2 size={14} />
        {!compacto && " Eliminar conversa"}
      </button>
    </form>
  );
}
