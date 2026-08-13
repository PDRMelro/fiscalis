"use client";

import { Plus } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import { criarProposta } from "@/lib/actions/propostas";

export function NovaPropostaModal() {
  return (
    <ModalTrigger label="Novo pedido de cliente" icon={Plus}>
      {(close) => (
        <form
          action={async (formData) => {
            await criarProposta(formData);
            close();
          }}
          className="p-6 space-y-3"
        >
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Novo pedido de cliente</h2>
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
          <button type="submit" className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Criar pedido
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
