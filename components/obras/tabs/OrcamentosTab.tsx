import { Trash2 } from "lucide-react";
import { AreaEstadoTag } from "@/components/ui/Tags";
import { adicionarOrcamento, atualizarOrcamento, eliminarOrcamento } from "@/lib/actions/obras";
import type { OrcamentoRow, EstadoArea } from "@/lib/supabase/types";

function estadoDe(pct: number): EstadoArea {
  if (pct >= 100) return "Concluído";
  if (pct > 90) return "Atenção";
  if (pct === 0) return "Pendente";
  return "Em andamento";
}

export function OrcamentosTab({ obraId, itens }: { obraId: string; itens: OrcamentoRow[] }) {
  const totalOrc = itens.reduce((s, i) => s + i.valor_orcamentado, 0);
  const totalExec = itens.reduce((s, i) => s + i.valor_executado, 0);
  const pct = totalOrc > 0 ? Math.round((totalExec / totalOrc) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-8 mb-3">
          <div>
            <p className="text-[12px] text-[#8A8578]">Orçamentado</p>
            <p className="text-[20px] font-semibold text-[#14283A]">{totalOrc.toLocaleString("pt-PT")} €</p>
          </div>
          <div>
            <p className="text-[12px] text-[#8A8578]">Executado até agora</p>
            <p className="text-[20px] font-semibold text-[#C9A050]">{totalExec.toLocaleString("pt-PT")} €</p>
          </div>
          <div>
            <p className="text-[12px] text-[#8A8578]">% do orçamento gasto</p>
            <p className="text-[20px] font-semibold text-[#14283A]">{pct}%</p>
          </div>
        </div>
        <div className="w-full h-2 bg-[#EDEBE2] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 100 ? "#B0402F" : "#C9A050" }}
          />
        </div>
      </div>

      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
              <th className="px-5 py-3 font-medium">Serviço</th>
              <th className="px-5 py-3 font-medium">Fornecedor</th>
              <th className="px-5 py-3 font-medium">Orçamentado</th>
              <th className="px-5 py-3 font-medium">Executado</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => {
              const p = i.valor_orcamentado > 0 ? (i.valor_executado / i.valor_orcamentado) * 100 : 0;
              return (
                <tr key={i.id} className="border-b border-[#F2F0E8] last:border-0 group">
                  <td className="px-5 py-3 text-[#1F1D19]">{i.servico}</td>
                  <td className="px-5 py-3 text-[#8A8578]">{i.fornecedor}</td>
                  <td className="px-5 py-3 text-[#4A4740] font-mono">{i.valor_orcamentado.toLocaleString("pt-PT")} €</td>
                  <td className="px-5 py-3">
                    <form
                      action={atualizarOrcamento.bind(null, obraId, i.id)}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        name="valor_executado"
                        type="number"
                        step="0.01"
                        defaultValue={i.valor_executado}
                        className="w-24 font-mono text-[12px] border border-[#E4E1D6] rounded px-1.5 py-0.5"
                      />
                      <button type="submit" className="text-[11px] text-[#14283A] underline underline-offset-2">
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <AreaEstadoTag estado={estadoDe(p)} />
                  </td>
                  <td className="px-5 py-3">
                    <form action={eliminarOrcamento.bind(null, obraId, i.id)}>
                      <button
                        type="submit"
                        className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {itens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-[#8A8578]">
                  Ainda sem orçamentos nesta obra.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <form
          action={adicionarOrcamento.bind(null, obraId)}
          className="flex items-center gap-2 px-5 py-3 border-t border-[#EDEBE2] bg-[#F5F4EF] flex-wrap"
        >
          <input name="servico" required placeholder="Serviço" className="flex-1 min-w-[120px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <input name="fornecedor" required placeholder="Fornecedor" className="flex-1 min-w-[120px] text-[12px] border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <input name="valor_orcamentado" type="number" step="0.01" required placeholder="Orçamentado €" className="w-32 text-[12px] font-mono border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <input name="valor_executado" type="number" step="0.01" defaultValue={0} placeholder="Executado €" className="w-32 text-[12px] font-mono border border-[#DEDBD2] rounded-lg px-2.5 py-1.5" />
          <button type="submit" className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5">
            Adicionar orçamento
          </button>
        </form>
      </div>
    </div>
  );
}
