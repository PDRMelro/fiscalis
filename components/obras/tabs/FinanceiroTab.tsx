import { Trash2 } from "lucide-react";
import { EstadoAutoTag } from "@/components/ui/Tags";
import { adicionarAuto, alternarEstadoAuto, eliminarAuto } from "@/lib/actions/obras";
import { formatarData, formatarDinheiro } from "@/lib/format";
import type { FaturacaoAutoRow } from "@/lib/supabase/types";

export function FinanceiroTab({
  obraId,
  honorarioMensal,
  autos,
}: {
  obraId: string;
  honorarioMensal: number | null;
  autos: FaturacaoAutoRow[];
}) {
  const pendentes = autos.filter((a) => a.estado === "Pendente").length;

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 mb-4 flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-[12px] text-[#8A8578]">Honorário mensal</p>
          <p className="text-[20px] font-semibold text-[#14283A]">{formatarDinheiro(honorarioMensal)}</p>
        </div>
        <div>
          <p className="text-[12px] text-[#8A8578]">Autos pendentes</p>
          <p className="text-[20px] font-semibold text-[#C4791E]">{pendentes}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {autos.length === 0 ? (
          <p className="px-5 py-6 text-center text-[13px] text-[#8A8578]">Ainda sem autos de medição nesta obra.</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                    <th className="px-5 py-3 font-medium">Auto</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium">Valor</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {autos.map((a) => (
                    <tr key={a.id} className="border-b border-[#F2F0E8] last:border-0 group">
                      <td className="px-5 py-3 font-mono text-[#14283A]">{a.numero}</td>
                      <td className="px-5 py-3 text-[#8A8578] font-mono">{formatarData(a.data)}</td>
                      <td className="px-5 py-3 text-[#1F1D19]">{formatarDinheiro(a.valor)}</td>
                      <td className="px-5 py-3">
                        <form action={alternarEstadoAuto.bind(null, obraId, a.id, a.estado === "Pago" ? "Pendente" : "Pago")}>
                          <button type="submit">
                            <EstadoAutoTag estado={a.estado} />
                          </button>
                        </form>
                      </td>
                      <td className="px-5 py-3">
                        <form action={eliminarAuto.bind(null, obraId, a.id)}>
                          <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={13} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-[#F2F0E8]">
              {autos.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-[13px] text-[#14283A]">{a.numero}</p>
                    <p className="text-[12px] text-[#8A8578] font-mono">{formatarData(a.data)}</p>
                    <p className="text-[13px] text-[#1F1D19] mt-0.5">{formatarDinheiro(a.valor)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <form action={alternarEstadoAuto.bind(null, obraId, a.id, a.estado === "Pago" ? "Pendente" : "Pago")}>
                      <button type="submit">
                        <EstadoAutoTag estado={a.estado} />
                      </button>
                    </form>
                    <form action={eliminarAuto.bind(null, obraId, a.id)}>
                      <button type="submit" className="text-[#B0402F]">
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <form
          action={adicionarAuto.bind(null, obraId)}
          className="flex items-center gap-2 px-5 py-3 border-t border-[#EDEBE2] bg-[#F5F4EF] flex-wrap"
        >
          <input name="numero" required placeholder="N.º (ex: AM-06)" className="w-28 text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <input name="data" type="date" required className="text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <input name="valor" type="number" step="0.01" required placeholder="Valor €" className="w-28 text-[12px] font-mono border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <select name="estado" defaultValue="Pendente" className="text-[12px] border border-[#DEDBD2] rounded-lg px-2 py-1.5">
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
          </select>
          <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5">
            Adicionar auto
          </button>
        </form>
      </div>
    </div>
  );
}
