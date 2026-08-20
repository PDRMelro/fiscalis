"use client";

import dynamic from "next/dynamic";
import { Pencil } from "lucide-react";
import { ModalTrigger } from "@/components/ui/Modal";
import { atualizarObra } from "@/lib/actions/obras";
import { paraInputDate } from "@/lib/format";
import type { ObraRow } from "@/lib/supabase/types";

const LocalizacaoObraPicker = dynamic(
  () => import("@/components/obras/LocalizacaoObraPicker").then((m) => m.LocalizacaoObraPicker),
  { ssr: false, loading: () => <div className="h-[220px] sm:h-[280px] rounded-lg border border-[#DEDBD2] bg-[#F5F4EF]" /> }
);

export function EditarObraModal({ obra }: { obra: ObraRow }) {
  const acao = atualizarObra.bind(null, obra.id);

  return (
    <ModalTrigger label="Editar" icon={Pencil} variant="secondary" maxWidth="max-w-xl">
      {() => (
        <form action={acao} className="p-6 space-y-3">
          <h2 className="text-[15px] font-semibold text-[#14283A] mb-1">Editar obra</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome</label>
              <input name="nome" defaultValue={obra.nome} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cliente</label>
              <input name="cliente_nome" defaultValue={obra.cliente_nome} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Localização</label>
            <input name="local" defaultValue={obra.local} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Localização exata no mapa</label>
            <LocalizacaoObraPicker defaultLat={obra.latitude} defaultLng={obra.longitude} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Início</label>
              <input name="inicio" type="date" defaultValue={paraInputDate(obra.inicio)} className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Estado</label>
              <select name="estado" defaultValue={obra.estado} className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]">
                <option value="Em curso">Em curso</option>
                <option value="Concluída">Concluída</option>
                <option value="Suspensa">Suspensa</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDEBE2]">
            <p className="text-[12px] font-medium text-[#4A4740] mb-2">Dados para o Termo de Responsabilidade</p>
            <div className="space-y-2">
              <input
                name="termo_descricao_obra"
                defaultValue={obra.termo_descricao_obra ?? ""}
                placeholder="Descrição da obra (ex: construção de moradia unifamiliar)"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
              />
              <input
                name="termo_freguesia"
                defaultValue={obra.termo_freguesia ?? ""}
                placeholder="Freguesia"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    name="termo_processo"
                    defaultValue={obra.termo_processo ?? ""}
                    placeholder="n/nnn/aaaa"
                    pattern="\d+/\d+/\d{4}"
                    title="Formato: n/nnn/aaaa"
                    className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
                  />
                  <p className="text-[10px] text-[#8A8578] mt-0.5">Formato: n/nnn/aaaa</p>
                </div>
                <div>
                  <input
                    name="termo_requerimento"
                    defaultValue={obra.termo_requerimento ?? ""}
                    placeholder="nnnnn/aaaa"
                    pattern="\d+/\d{4}"
                    title="Formato: nnnnn/aaaa"
                    className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
                  />
                  <p className="text-[10px] text-[#8A8578] mt-0.5">Formato: nnnnn/aaaa</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full mt-2 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Guardar alterações
          </button>
        </form>
      )}
    </ModalTrigger>
  );
}
