"use client";

import { Plus } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import {
  CondicoesPagamentoCampos,
  CondicoesPropostaCampos,
  DadosClienteCampos,
} from "@/components/propostas/CamposProposta";
import { criarProposta } from "@/lib/actions/propostas";

export function NovaPropostaModal({
  obras,
  ibanSugerido,
}: {
  obras: { id: string; nome: string }[];
  ibanSugerido: string | null;
}) {
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

          <DadosClienteCampos />

          <div className="border-t border-[#F2F0E8] pt-3">
            <p className="text-[12px] font-semibold text-[#14283A] mb-2">Dados da obra</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Tipo de obra</label>
                <input name="tipo_obra" required placeholder="Ex: Remodelação de moradia" autoComplete="off" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Morada da obra</label>
                <input name="local" required autoComplete="off" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data de envio</label>
                <input name="enviada_em" type="date" autoComplete="off" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
              </div>
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

          <CondicoesPropostaCampos />

          <CondicoesPagamentoCampos ibanSugerido={ibanSugerido} />

          <button type="submit" className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Criar pedido
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
