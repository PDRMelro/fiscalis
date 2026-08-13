import { Trash2 } from "lucide-react";
import { AreaEstadoTag } from "@/components/ui/Tags";
import { adicionarArea, atualizarArea, eliminarArea } from "@/lib/actions/obras";
import type { ObraAreaRow } from "@/lib/supabase/types";

const ESTADOS: ObraAreaRow["estado"][] = ["Pendente", "Em andamento", "Atenção", "Atrasado", "Concluído"];

export function GeralTab({ obraId, areas }: { obraId: string; areas: ObraAreaRow[] }) {
  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl">
      <p className="text-[13px] font-medium text-[#4A4740] mb-4">Áreas da obra</p>

      {areas.length === 0 && (
        <p className="text-[13px] text-[#8A8578] mb-4">Ainda sem áreas registadas. Adiciona a primeira abaixo.</p>
      )}

      <div className="space-y-4">
        {areas.map((a) => (
          <div key={a.id} className="group">
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="text-[12px] text-[#4A4740] flex-1">{a.area}</span>
              <form action={atualizarArea.bind(null, obraId, a.id)} className="flex items-center gap-2">
                <select
                  name="estado"
                  defaultValue={a.estado}
                  className="text-[11px] border border-[#E4E1D6] rounded px-1.5 py-0.5"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <input
                  name="progresso"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={a.progresso}
                  className="w-14 text-[11px] font-mono border border-[#E4E1D6] rounded px-1.5 py-0.5"
                />
                <button type="submit" className="text-[11px] text-[#14283A] underline underline-offset-2">
                  Guardar
                </button>
              </form>
              <form action={eliminarArea.bind(null, obraId, a.id)}>
                <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={13} />
                </button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${a.progresso}%`, backgroundColor: a.progresso === 100 ? "#2C6B45" : "#14283A" }}
                />
              </div>
              <AreaEstadoTag estado={a.estado} />
            </div>
          </div>
        ))}
      </div>

      <form action={adicionarArea.bind(null, obraId)} className="flex items-center gap-2 mt-5 pt-4 border-t border-[#EDEBE2]">
        <input
          name="area"
          required
          placeholder="Nova área (ex: Impermeabilizações)"
          className="flex-1 text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5"
        />
        <input
          name="progresso"
          type="number"
          min={0}
          max={100}
          defaultValue={0}
          className="w-16 text-[12px] font-mono border border-[#DEDBD2] rounded-lg px-2 py-1.5"
        />
        <select name="estado" defaultValue="Pendente" className="text-[12px] border border-[#DEDBD2] rounded-lg px-2 py-1.5">
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5 shrink-0">
          Adicionar
        </button>
      </form>
    </div>
  );
}
