"use client";

import { useState } from "react";
import type {
  FrequenciaVisitas,
  ModalidadeVisitas,
  PropostaRow,
  TipoClienteProposta,
  TipoServicoProposta,
} from "@/lib/supabase/types";

const FREQUENCIAS: { valor: FrequenciaVisitas; label: string }[] = [
  { valor: "semanal", label: "Semanal — 1 visita por semana" },
  { valor: "quinzenal", label: "Quinzenal — 1 visita a cada 15 dias" },
  { valor: "mensal", label: "Mensal — 1 visita por mês" },
];

const TIPOS_SERVICO: { valor: TipoServicoProposta; label: string }[] = [
  { valor: "fiscalizacao", label: "Fiscalização de obra" },
  { valor: "consultoria", label: "Consultoria de construção civil" },
];

const TIPOS_CLIENTE: { valor: TipoClienteProposta; label: string }[] = [
  { valor: "particular", label: "Cliente particular" },
  { valor: "empresa", label: "Empresa" },
];

const MODALIDADES: { valor: ModalidadeVisitas; label: string }[] = [
  { valor: "periodica", label: "Avença anual por periodicidade" },
  { valor: "pack", label: "Pack de visitas para o prazo da obra" },
];

const INPUT = "w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white";
const LABEL = "text-[12px] font-medium text-[#4A4740] block mb-1";

function Obrigatorio() {
  return <span className="text-[#B0402F]"> *</span>;
}

export function DadosClienteCampos({ proposta }: { proposta?: PropostaRow }) {
  const [tipoCliente, setTipoCliente] = useState<TipoClienteProposta>(proposta?.cliente_tipo ?? "particular");
  const empresa = tipoCliente === "empresa";

  return (
    <div>
      <p className="text-[12px] font-semibold text-[#14283A] mb-2">Dados do cliente</p>
      <div className="flex gap-4 mb-3">
        {TIPOS_CLIENTE.map((t) => (
          <label key={t.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
            <input
              type="radio"
              name="cliente_tipo"
              value={t.valor}
              checked={tipoCliente === t.valor}
              onChange={() => setTipoCliente(t.valor)}
              className="accent-[#14283A]"
            />
            {t.label}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>
            {empresa ? "Nome da empresa" : "Cliente"}
            <Obrigatorio />
          </label>
          <input name="cliente_nome" defaultValue={proposta?.cliente_nome} required autoComplete="off" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>{empresa ? "NIPC" : "NIF / Contribuinte"}</label>
          <input name="cliente_nif" defaultValue={proposta?.cliente_nif ?? ""} autoComplete="off" className={INPUT} />
        </div>
        {empresa && (
          <div>
            <label className={LABEL}>Alvará n.º</label>
            <input
              name="cliente_alvara"
              defaultValue={proposta?.cliente_alvara ?? ""}
              placeholder="Ex: 12345-PUB"
              autoComplete="off"
              className={INPUT}
            />
          </div>
        )}
        <div className={empresa ? "" : "col-span-2"}>
          <label className={LABEL}>{empresa ? "Sede / morada fiscal" : "Morada fiscal do cliente"}</label>
          <input
            name="cliente_morada_fiscal"
            defaultValue={proposta?.cliente_morada_fiscal ?? ""}
            autoComplete="off"
            className={INPUT}
          />
        </div>
      </div>
    </div>
  );
}

export function CondicoesPropostaCampos({ proposta }: { proposta?: PropostaRow }) {
  const [tipoServico, setTipoServico] = useState<TipoServicoProposta>(proposta?.tipo_servico ?? "fiscalizacao");
  const [modalidade, setModalidade] = useState<ModalidadeVisitas>(proposta?.modalidade_visitas ?? "periodica");

  return (
    <>
      <div className="border-t border-[#F2F0E8] pt-3">
        <label className="text-[12px] font-medium text-[#4A4740] block mb-2">Tipo de proposta</label>
        <div className="flex gap-4">
          {TIPOS_SERVICO.map((t) => (
            <label key={t.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
              <input
                type="radio"
                name="tipo_servico"
                value={t.valor}
                checked={tipoServico === t.valor}
                onChange={() => setTipoServico(t.valor)}
                className="accent-[#14283A]"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {tipoServico === "fiscalizacao" ? (
        <>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-2">Modalidade das visitas</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {MODALIDADES.map((m) => (
                <label key={m.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
                  <input
                    type="radio"
                    name="modalidade_visitas"
                    value={m.valor}
                    checked={modalidade === m.valor}
                    onChange={() => setModalidade(m.valor)}
                    className="accent-[#14283A]"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {modalidade === "periodica" ? (
            <>
              <div>
                <label className="text-[12px] font-medium text-[#4A4740] block mb-2">Periodicidade das visitas</label>
                <div className="space-y-2">
                  {FREQUENCIAS.map((f) => (
                    <label key={f.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
                      <input
                        type="radio"
                        name="frequencia_visitas"
                        value={f.valor}
                        defaultChecked={proposta?.frequencia_visitas === f.valor}
                        className="accent-[#14283A]"
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Valor fixo anual (€)</label>
                  <input
                    name="valor_anual"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={proposta?.valor_anual ?? ""}
                    autoComplete="off"
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Valor por visita extra (€)</label>
                  <input
                    name="valor_visita_extra"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={proposta?.valor_visita_extra ?? ""}
                    autoComplete="off"
                    className={INPUT}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>N.º de visitas incluídas</label>
                <input
                  name="pack_num_visitas"
                  type="number"
                  step="1"
                  min="1"
                  defaultValue={proposta?.pack_num_visitas ?? ""}
                  autoComplete="off"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Prazo estimado da obra (meses)</label>
                <input
                  name="prazo_obra_meses"
                  type="number"
                  step="1"
                  min="1"
                  defaultValue={proposta?.prazo_obra_meses ?? ""}
                  autoComplete="off"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Valor do pack (€)</label>
                <input
                  name="valor_pack"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={proposta?.valor_pack ?? ""}
                  autoComplete="off"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Valor por visita extra (€)</label>
                <input
                  name="valor_visita_extra"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={proposta?.valor_visita_extra ?? ""}
                  autoComplete="off"
                  className={INPUT}
                />
              </div>
              <p className="col-span-2 text-[11px] text-[#8A8578]">
                O valor por visita extra aplica-se a cada visita pedida pelo cliente para além das visitas incluídas no
                pack.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label className={LABEL}>Descrição do serviço de consultoria</label>
            <textarea
              name="descricao_servico"
              rows={3}
              defaultValue={proposta?.descricao_servico ?? ""}
              placeholder="Ex: Análise e parecer técnico ao projeto de estabilidade, acompanhamento do processo de licenciamento..."
              autoComplete="off"
              className={INPUT}
            />
          </div>
          <div className="w-1/2 pr-1.5">
            <label className={LABEL}>Valor fixo do serviço (€)</label>
            <input
              name="valor_servico"
              type="number"
              step="0.01"
              min="0"
              defaultValue={proposta?.valor_servico ?? ""}
              autoComplete="off"
              className={INPUT}
            />
          </div>
        </div>
      )}
    </>
  );
}

export function CondicoesPagamentoCampos({
  proposta,
  ibanSugerido,
}: {
  proposta?: PropostaRow;
  ibanSugerido?: string | null;
}) {
  return (
    <div className="border-t border-[#F2F0E8] pt-3 space-y-3">
      <p className="text-[12px] font-semibold text-[#14283A]">Condições de pagamento</p>

      <label className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
        <input
          type="checkbox"
          name="com_iva"
          defaultChecked={proposta?.com_iva ?? true}
          className="accent-[#14283A]"
        />
        Acresce IVA à taxa legal em vigor
        <span className="text-[11px] text-[#8A8578]">(desmarca se os valores forem sem IVA)</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Na adjudicação (%)</label>
          <input
            name="pagamento_adjudicacao_pct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={proposta?.pagamento_adjudicacao_pct ?? ""}
            placeholder="Ex: 30"
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Data</label>
          <input
            name="pagamento_adjudicacao_data"
            type="date"
            defaultValue={proposta?.pagamento_adjudicacao_data ?? ""}
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Restante pagamento (%)</label>
          <input
            name="pagamento_segunda_pct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={proposta?.pagamento_segunda_pct ?? ""}
            placeholder="Ex: 70"
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Data</label>
          <input
            name="pagamento_segunda_data"
            type="date"
            defaultValue={proposta?.pagamento_segunda_data ?? ""}
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div className="col-span-2">
          <label className={LABEL}>IBAN para pagamento</label>
          <input
            name="iban"
            defaultValue={proposta ? (proposta.iban ?? "") : (ibanSugerido ?? "")}
            placeholder="PT50 0000 0000 0000 0000 0000 0"
            autoComplete="off"
            className={`${INPUT} font-mono uppercase`}
          />
          <p className="text-[11px] text-[#8A8578] mt-1">Aparece a negrito no PDF da proposta.</p>
        </div>
      </div>
    </div>
  );
}
