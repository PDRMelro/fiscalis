import { NovoIntervenienteForm } from "@/components/obras/NovoIntervenienteForm";
import { IntervenienteItem } from "@/components/obras/IntervenienteItem";
import type { IntervenienteRow } from "@/lib/supabase/types";

export function IntervenientesTab({ obraId, itens }: { obraId: string; itens: IntervenienteRow[] }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
        {itens.map((p, i) => (
          <IntervenienteItem key={p.id} obraId={obraId} item={p} isFirst={i === 0} isLast={i === itens.length - 1} />
        ))}
        {itens.length === 0 && (
          <p className="px-5 py-6 text-center text-[13px] text-[#8A8578]">Ainda sem intervenientes registados.</p>
        )}
      </div>

      <NovoIntervenienteForm obraId={obraId} />
    </div>
  );
}
