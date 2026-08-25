"use client";

import { useState, useTransition } from "react";
import { atualizarProposta } from "@/lib/actions/propostas";
import { GerarPdfPropostaButton } from "@/components/propostas/GerarPdfPropostaButton";
import type { FrequenciaVisitas, PropostaRow } from "@/lib/supabase/types";

const FREQUENCIAS: { valor: FrequenciaVisitas; label: string }[] = [
  { valor: "semanal", label: "Semanal — 1 visita por semana" },
  { valor: "quinzenal", label: "Quinzenal — 1 visita a cada 15 dias" },
  { valor: "mensal", label: "Mensal — 1 visita por mês" },
];

export function EditarPropostaForm({
  proposta,
  obras,
}: {
  proposta: PropostaRow;
  obras: { id: string; nome: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function guardar(formData: FormData) {
    setErro(null);
    setGuardado(false);
    startTransition(async () => {
      const resultado = await atualizarProposta(proposta.id, formData);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      setGuardado(true);
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <form action={guardar} className="bg-white border border-[#E4E1D6] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
              Cliente<span className="text-[#B0402F]"> *</span>
            </label>
            <input
              name="cliente_nome"
              defaultValue={proposta.cliente_nome}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
              Tipo de obra<span className="text-[#B0402F]"> *</span>
            </label>
            <input
              name="tipo_obra"
              defaultValue={proposta.tipo_obra}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
              Local<span className="text-[#B0402F]"> *</span>
            </label>
            <input
              name="local"
              defaultValue={proposta.local}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data de envio</label>
            <input
              name="enviada_em"
              type="date"
              defaultValue={proposta.enviada_em}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra associada</label>
          <select
            name="obra_id"
            defaultValue={proposta.obra_id ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
          >
            <option value="">— sem obra associada (ainda não é cliente) —</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[#8A8578] mt-1">
            Só é possível enviar a proposta diretamente ao cliente quando estiver associada a uma obra.
          </p>
        </div>

        <div className="border-t border-[#F2F0E8] pt-4">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-2">Periodicidade das visitas</label>
          <div className="space-y-2">
            {FREQUENCIAS.map((f) => (
              <label key={f.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
                <input
                  type="radio"
                  name="frequencia_visitas"
                  value={f.valor}
                  defaultChecked={proposta.frequencia_visitas === f.valor}
                  className="accent-[#14283A]"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Valor fixo anual (€)</label>
            <input
              name="valor_anual"
              type="number"
              step="0.01"
              min="0"
              defaultValue={proposta.valor_anual ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Valor por visita extra (€)</label>
            <input
              name="valor_visita_extra"
              type="number"
              step="0.01"
              min="0"
              defaultValue={proposta.valor_visita_extra ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            />
          </div>
        </div>

        {erro && <p className="text-[12px] text-[#B0402F]">{erro}</p>}
        {guardado && !erro && <p className="text-[12px] text-[#2C6B45]">Alterações guardadas.</p>}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
          >
            {pending ? "A guardar..." : "Guardar alterações"}
          </button>
          <a href="/propostas" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
            Voltar
          </a>
        </div>
      </form>

      <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[#14283A]">Documento da proposta</p>
          <p className="text-[12px] text-[#8A8578]">Gera o PDF com os valores guardados acima.</p>
        </div>
        <GerarPdfPropostaButton propostaId={proposta.id} pdfPath={proposta.pdf_path} temObra={!!proposta.obra_id} />
      </div>
    </div>
  );
}
