import { Users, Trash2 } from "lucide-react";
import { adicionarInterveniente, eliminarInterveniente } from "@/lib/actions/obras";
import type { IntervenienteRow } from "@/lib/supabase/types";

export function IntervenientesTab({ obraId, itens }: { obraId: string; itens: IntervenienteRow[] }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
        {itens.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 group">
            <div className="w-9 h-9 rounded-full bg-[#F0EEE5] flex items-center justify-center text-[#8A8578] shrink-0">
              <Users size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-[#1F1D19]">{p.nome}</p>
              <p className="text-[11px] text-[#8A8578]">
                {p.papel} {p.contacto && <>· {p.contacto}</>}
              </p>
            </div>
            <form action={eliminarInterveniente.bind(null, obraId, p.id)}>
              <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        ))}
        {itens.length === 0 && (
          <p className="px-5 py-6 text-center text-[13px] text-[#8A8578]">Ainda sem intervenientes registados.</p>
        )}
      </div>

      <form
        action={adicionarInterveniente.bind(null, obraId)}
        className="flex items-center gap-2 mt-4 bg-white border border-[#E4E1D6] rounded-xl p-3 flex-wrap"
      >
        <input name="papel" required placeholder="Papel (ex: Empreiteiro geral)" className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
        <input name="nome" required placeholder="Nome" className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
        <input name="contacto" placeholder="Contacto" className="flex-1 min-w-[140px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
        <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5">
          Adicionar
        </button>
      </form>
    </div>
  );
}
