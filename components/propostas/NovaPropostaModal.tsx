"use client";

import { Plus } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import { criarProposta } from "@/lib/actions/propostas";
import type { FrequenciaVisitas } from "@/lib/supabase/types";

const FREQUENCIAS: { valor: FrequenciaVisitas; label: string }[] = [
  { valor: "semanal", label: "Semanal — 1 visita por semana" },
  { valor: "quinzenal", label: "Quinzenal — 1 visita a cada 15 dias" },
  { valor: "mensal", label: "Mensal — 1 visita por mês" },
];

export function NovaPropostaModal({ obras }: { obras: { id: string; nome: string }[] }) {
  return (
    <ModalTrigger label="Novo pedido de cliente" icon={Plus} maxWidth="max-w-lg">
      {(close) => (
        <form
          action={async (formData) => {
            await criarProposta(formData);
            close();
          }}
          className="p-6 space-y-3"
        >
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Novo pedido de cliente</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cliente</label>
              <input name="cliente_nome" required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Tipo de obra</label>
              <input name="tipo_obra" required placeholder="Ex: Remodelação de moradia" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Local</label>
              <input name="local" required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data de envio</label>
              <input name="enviada_em" type="date" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra associada</label>
            <select name="obra_id" defaultValue="" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white">
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

          <div className="border-t border-[#F2F0E8] pt-3">
            <label className="text-[12px] font-medium text-[#4A4740] block mb-2">Periodicidade das visitas</label>
            <div className="space-y-2">
              {FREQUENCIAS.map((f) => (
                <label key={f.valor} className="flex items-center gap-2 text-[13px] text-[#1F1D19]">
                  <input type="radio" name="frequencia_visitas" value={f.valor} className="accent-[#14283A]" />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Valor fixo anual (€)</label>
              <input name="valor_anual" type="number" step="0.01" min="0" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Valor por visita extra (€)</label>
              <input name="valor_visita_extra" type="number" step="0.01" min="0" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
          </div>

          <button type="submit" className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Criar pedido
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
