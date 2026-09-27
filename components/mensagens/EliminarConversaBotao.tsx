"use client";

import { Trash2 } from "lucide-react";
import { eliminarConversa } from "@/lib/actions/mensagens";

export function EliminarConversaBotao({ outroId }: { outroId: string }) {
  return (
    <form action={eliminarConversa.bind(null, outroId)}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("Eliminar esta conversa? As mensagens desaparecem para as duas pessoas e não há como recuperar.")) {
            e.preventDefault();
          }
        }}
        className="flex items-center gap-1.5 text-[13px] text-[#B0402F] border border-[#F0CFC6] rounded-lg px-3.5 py-2"
      >
        <Trash2 size={14} /> Eliminar conversa
      </button>
    </form>
  );
}
