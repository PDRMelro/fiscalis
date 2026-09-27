"use client";

import { useActionState } from "react";
import { UserPlus, Star, StarOff, Link2, Ban, RotateCcw, Trash2 } from "lucide-react";
import {
  criarFiscal,
  gerarLinkConviteFiscal,
  alternarFiscalPrincipal,
  desativarFiscal,
  reativarFiscal,
  eliminarFiscal,
  type ResultadoFiscal,
  type ResultadoAcaoFiscal,
} from "@/lib/actions/fiscais";
import { LinkCopiavel } from "@/components/ui/LinkCopiavel";
import type { ProfileRow } from "@/lib/supabase/types";

const initialState: ResultadoFiscal = { error: null, link: null };
const initialAcao: ResultadoAcaoFiscal = { error: null };

function NovoFiscalForm() {
  const [state, formAction, pending] = useActionState(criarFiscal, initialState);

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mb-8">
      <p className="text-[13px] font-medium text-[#4A4740] mb-1 flex items-center gap-1.5">
        <UserPlus size={14} /> Novo fiscal
      </p>
      <p className="text-[11px] text-[#8A8578] mb-4">
        Cria uma conta de acesso para quem faz a fiscalização das tuas obras.
      </p>

      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome</label>
            <input
              name="nome"
              required
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Qualificação</label>
            <input
              name="qualificacao"
              placeholder="Ex: Eng.º Civil"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cédula profissional</label>
            <input
              name="cedulaProfissional"
              autoComplete="off"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
            />
          </div>
        </div>

        <label className="flex items-start gap-2 text-[12px] text-[#4A4740]">
          <input name="fiscalPrincipal" type="checkbox" className="w-3.5 h-3.5 mt-0.5 accent-[#14283A] shrink-0" />
          <span>
            É fiscal principal — vê todas as obras da empresa, não só as que lhe forem atribuídas.
          </span>
        </label>

        {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "A criar..." : "Criar fiscal"}
        </button>
      </form>

      {state.link && <LinkCopiavel link={state.link} />}
    </div>
  );
}

function LinkConviteBotaoFiscal({ fiscalId }: { fiscalId: string }) {
  const [state, formAction, pending] = useActionState(gerarLinkConviteFiscal, initialState);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="fiscalId" value={fiscalId} />
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] font-medium text-[#14283A] flex items-center gap-1 disabled:opacity-60"
        >
          <Link2 size={12} /> {pending ? "A gerar..." : "Gerar link de acesso"}
        </button>
      </form>
      {state.error && <p className="text-[11px] text-[#B0402F] mt-1">{state.error}</p>}
      {state.link && <LinkCopiavel link={state.link} />}
    </div>
  );
}

function EliminarFiscalBotao({ fiscalId, nomeFiscal }: { fiscalId: string; nomeFiscal: string }) {
  const [state, formAction, pending] = useActionState(eliminarFiscal, initialAcao);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="fiscalId" value={fiscalId} />
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (!confirm(`Eliminar definitivamente "${nomeFiscal}"? Esta ação não pode ser desfeita.`)) {
              e.preventDefault();
            }
          }}
          className="text-[11px] font-medium text-[#B0402F] flex items-center gap-1 disabled:opacity-60"
        >
          <Trash2 size={12} /> {pending ? "A eliminar..." : "Eliminar"}
        </button>
      </form>
      {state.error && <p className="text-[11px] text-[#B0402F] mt-1 max-w-[220px]">{state.error}</p>}
    </div>
  );
}

function FiscalLinha({ fiscal }: { fiscal: ProfileRow }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#F2F0E8] last:border-0">
      <div className="min-w-[160px]">
        <p className="text-[13px] font-medium text-[#1F1D19]">{fiscal.nome}</p>
        <p className="text-[11px] text-[#8A8578]">
          {fiscal.email}
          {fiscal.qualificacao ? ` · ${fiscal.qualificacao}` : ""}
        </p>
      </div>
      <span
        className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${
          fiscal.fiscal_principal
            ? "text-[#8A4A17] bg-[#FBF0DC] border-[#E8C98F]"
            : "text-[#4A4740] bg-[#F5F4EF] border-[#E4E1D6]"
        }`}
      >
        {fiscal.fiscal_principal ? "Principal" : "Associado"}
      </span>
      <span
        className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${
          fiscal.ativo ? "text-[#3E7A4D] bg-[#E9F3EB] border-[#BEDCC4]" : "text-[#B0402F] bg-[#FBEAE6] border-[#E8B9AC]"
        }`}
      >
        {fiscal.ativo ? "Ativo" : "Inativo"}
      </span>

      <LinkConviteBotaoFiscal fiscalId={fiscal.id} />

      <div className="flex items-center gap-3">
        <form action={alternarFiscalPrincipal.bind(null, fiscal.id)}>
          <button type="submit" className="text-[11px] font-medium text-[#4A4740] flex items-center gap-1">
            {fiscal.fiscal_principal ? <StarOff size={12} /> : <Star size={12} />}
            {fiscal.fiscal_principal ? "Tornar associado" : "Tornar principal"}
          </button>
        </form>
        <form action={(fiscal.ativo ? desativarFiscal : reativarFiscal).bind(null, fiscal.id)}>
          <button
            type="submit"
            className={`text-[11px] font-medium flex items-center gap-1 ${
              fiscal.ativo ? "text-[#B0402F]" : "text-[#3E7A4D]"
            }`}
          >
            {fiscal.ativo ? <Ban size={12} /> : <RotateCcw size={12} />}
            {fiscal.ativo ? "Desativar" : "Reativar"}
          </button>
        </form>
        {!fiscal.ativo && <EliminarFiscalBotao fiscalId={fiscal.id} nomeFiscal={fiscal.nome} />}
      </div>
    </div>
  );
}

export function FiscaisPainel({ fiscais }: { fiscais: ProfileRow[] }) {
  return (
    <>
      <NovoFiscalForm />

      <p className="text-[13px] font-medium text-[#4A4740] mb-2">Fiscais</p>
      <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-4xl overflow-x-auto">
        {fiscais.length === 0 && <p className="text-[13px] text-[#8A8578] px-4 py-4">Ainda sem fiscais.</p>}
        {fiscais.map((fiscal) => (
          <FiscalLinha key={fiscal.id} fiscal={fiscal} />
        ))}
      </div>
    </>
  );
}
