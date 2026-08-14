import { Users, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { eliminarInterveniente, moverInterveniente } from "@/lib/actions/obras";
import { NovoIntervenienteForm } from "@/components/obras/NovoIntervenienteForm";
import type { IntervenienteRow } from "@/lib/supabase/types";

function detalheInterveniente(p: IntervenienteRow): string | null {
  if (p.tipo === "Construtora" && p.empresa) return p.empresa;
  if ((p.tipo === "Direção de Obra" || p.tipo === "Arquitetura") && p.cedula_profissional) {
    const especialidade = p.colegio ? ` ${p.colegio}` : "";
    return `Cédula${especialidade} n.º ${p.cedula_profissional}`;
  }
  return null;
}

export function IntervenientesTab({ obraId, itens }: { obraId: string; itens: IntervenienteRow[] }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
        {itens.map((p, i) => {
          const detalhe = detalheInterveniente(p);
          return (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 group">
              <div className="flex flex-col shrink-0 -my-1.5">
                <form action={moverInterveniente.bind(null, obraId, p.id, "cima")}>
                  <button
                    type="submit"
                    disabled={i === 0}
                    className="text-[#8A8578] hover:text-[#14283A] disabled:opacity-20 disabled:cursor-not-allowed block"
                  >
                    <ChevronUp size={14} />
                  </button>
                </form>
                <form action={moverInterveniente.bind(null, obraId, p.id, "baixo")}>
                  <button
                    type="submit"
                    disabled={i === itens.length - 1}
                    className="text-[#8A8578] hover:text-[#14283A] disabled:opacity-20 disabled:cursor-not-allowed block"
                  >
                    <ChevronDown size={14} />
                  </button>
                </form>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#F0EEE5] flex items-center justify-center text-[#8A8578] shrink-0">
                <Users size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[#1F1D19]">{p.nome}</p>
                <p className="text-[11px] text-[#8A8578]">
                  {p.papel} {p.contacto && <>· {p.contacto}</>}
                </p>
                {detalhe && <p className="text-[11px] text-[#8A8578]">{detalhe}</p>}
              </div>
              <form action={eliminarInterveniente.bind(null, obraId, p.id)}>
                <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </form>
            </div>
          );
        })}
        {itens.length === 0 && (
          <p className="px-5 py-6 text-center text-[13px] text-[#8A8578]">Ainda sem intervenientes registados.</p>
        )}
      </div>

      <NovoIntervenienteForm obraId={obraId} />
    </div>
  );
}
