"use client";

import { Plus } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import { criarNC } from "@/lib/actions/nc";

export function NovaNCModal({ obras }: { obras: { id: string; nome: string }[] }) {
  return (
    <ModalTrigger label="Nova não conformidade" icon={Plus}>
      {(close) => (
        <form
          action={async (formData) => {
            await criarNC(formData);
            close();
          }}
          className="p-6 space-y-3"
        >
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Nova não conformidade</h2>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra</label>
            <select name="obra_id" required defaultValue="" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]">
              <option value="" disabled>
                Escolhe a obra
              </option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Descrição</label>
            <textarea name="descricao" required rows={3} className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Severidade</label>
              <select name="severidade" defaultValue="Média" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]">
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Prazo</label>
              <input name="prazo" type="date" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Responsável</label>
            <input name="responsavel" placeholder="Ex: Empreiteiro Geral" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <button type="submit" className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Criar não conformidade
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
