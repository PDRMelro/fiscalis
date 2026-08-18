import { ESPECIALIDADES_OBRA } from "@/lib/especialidadesObra";
import type { NaoConformidadeRow } from "@/lib/supabase/types";

const campo = "w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white";
const rotulo = "text-[12px] font-medium text-[#4A4740] block mb-1";
const seccao = "text-[11px] font-semibold text-[#8A4A17] uppercase tracking-wide pt-1";

export function CamposNC({ defaults }: { defaults?: Partial<NaoConformidadeRow> }) {
  return (
    <>
      <p className={seccao}>1. Identificação</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>Localização / zona na obra</label>
          <input
            name="local_zona"
            defaultValue={defaults?.local_zona ?? ""}
            placeholder="Ex: Piso 1, fachada norte"
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>Frente / fase</label>
          <input name="frente_fase" defaultValue={defaults?.frente_fase ?? ""} className={campo} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>Contrato n.º</label>
          <input name="contrato_numero" defaultValue={defaults?.contrato_numero ?? ""} className={campo} />
        </div>
        <div>
          <label className={rotulo}>Empreiteiro / subempreiteiro</label>
          <input
            name="responsavel"
            defaultValue={defaults?.responsavel ?? ""}
            placeholder="Ex: Empreiteiro Geral"
            className={campo}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>Especialidade</label>
          <select name="especialidade" defaultValue={defaults?.especialidade ?? ""} className={campo}>
            <option value="">— Não especificada —</option>
            {ESPECIALIDADES_OBRA.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={rotulo}>Origem</label>
          <input
            name="origem"
            defaultValue={defaults?.origem ?? ""}
            placeholder="Ex: Inspeção de rotina, auditoria, reclamação..."
            className={campo}
          />
        </div>
      </div>

      <div>
        <label className={rotulo}>2. Descrição da não conformidade</label>
        <textarea
          name="descricao"
          defaultValue={defaults?.descricao ?? ""}
          required
          rows={3}
          placeholder="O que foi observado em obra..."
          className={`${campo} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>3. Requisito não cumprido</label>
          <textarea
            name="requisito_incumprido"
            defaultValue={defaults?.requisito_incumprido ?? ""}
            rows={2}
            placeholder="Requisito contratual, normativo ou legal não cumprido..."
            className={`${campo} resize-none`}
          />
        </div>
        <div>
          <label className={rotulo}>4. Evidências</label>
          <textarea
            name="evidencias"
            defaultValue={defaults?.evidencias ?? ""}
            rows={2}
            placeholder="Fotografias, relatórios, medições, ensaios, etc."
            className={`${campo} resize-none`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>5. Classificação</label>
          <select name="severidade" defaultValue={defaults?.severidade ?? "Maior"} className={`${campo} mb-2`}>
            <option value="Crítica">Crítica — risco elevado para segurança, integridade ou funcionalidade</option>
            <option value="Maior">Maior — impacto significativo na qualidade ou desempenho</option>
            <option value="Menor">Menor — impacto reduzido</option>
          </select>
          <input
            name="classificacao_justificacao"
            defaultValue={defaults?.classificacao_justificacao ?? ""}
            placeholder="Justificação (opcional)"
            className={campo}
          />
        </div>
        <div>
          <label className={rotulo}>6. Ação corretiva</label>
          <textarea
            name="acao_corretiva"
            defaultValue={defaults?.acao_corretiva ?? ""}
            rows={2}
            placeholder="O que tem de ser feito para eliminar a não conformidade..."
            className={`${campo} resize-none mb-2`}
          />
          <label className={rotulo}>Prazo para correção</label>
          <input name="prazo" type="date" defaultValue={defaults?.prazo ?? ""} className={campo} />
        </div>
      </div>

      <p className={seccao}>7. Verificação da correção</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={rotulo}>Verificação efetuada em</label>
          <input name="data_verificacao" type="date" defaultValue={defaults?.data_verificacao ?? ""} className={campo} />
        </div>
        <div>
          <label className={rotulo}>Resultado</label>
          <select name="resultado_verificacao" defaultValue={defaults?.resultado_verificacao ?? ""} className={campo}>
            <option value="">— Ainda não verificada —</option>
            <option value="Conforme">Conforme</option>
            <option value="Não conforme">Não conforme</option>
          </select>
        </div>
      </div>
      <div>
        <label className={rotulo}>Evidências da verificação</label>
        <textarea
          name="evidencias_verificacao"
          defaultValue={defaults?.evidencias_verificacao ?? ""}
          rows={2}
          className={`${campo} resize-none`}
        />
      </div>

      <p className={seccao}>8. Encerramento</p>
      <div>
        <label className={rotulo}>Observações / recomendações</label>
        <textarea
          name="observacoes_recomendacoes"
          defaultValue={defaults?.observacoes_recomendacoes ?? ""}
          rows={2}
          className={`${campo} resize-none`}
        />
      </div>
    </>
  );
}
