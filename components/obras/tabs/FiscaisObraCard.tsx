import { atualizarFiscaisObra } from "@/lib/actions/obraFiscais";
import type { ProfileRow } from "@/lib/supabase/types";

export function FiscaisObraCard({
  obraId,
  fiscaisAssociados,
  atribuidosIds,
}: {
  obraId: string;
  fiscaisAssociados: ProfileRow[];
  atribuidosIds: Set<string>;
}) {
  if (fiscaisAssociados.length === 0) return null;

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mt-5">
      <p className="text-[13px] font-medium text-[#4A4740] mb-1">Fiscais associados</p>
      <p className="text-[11px] text-[#8A8578] mb-4">
        Escolhe quais os fiscais que veem e podem trabalhar nesta obra. Os fiscais principais já veem todas as
        obras da empresa automaticamente.
      </p>

      <form action={atualizarFiscaisObra.bind(null, obraId)} className="space-y-2">
        {fiscaisAssociados.map((fiscal) => (
          <label key={fiscal.id} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
            <input
              type="checkbox"
              name="fiscalIds"
              value={fiscal.id}
              defaultChecked={atribuidosIds.has(fiscal.id)}
              className="w-3.5 h-3.5 accent-[#14283A]"
            />
            {fiscal.nome}
            <span className="text-[11px] text-[#8A8578]">{fiscal.email}</span>
          </label>
        ))}
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-[#14283A] text-white text-[12px] font-medium mt-2"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
