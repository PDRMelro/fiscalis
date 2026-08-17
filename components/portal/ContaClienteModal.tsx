"use client";

import { useActionState, useState } from "react";
import { UserCog, Check } from "lucide-react";
import { ModalShell } from "@/components/ui/Modal";
import { atualizarNomeCliente, atualizarPasswordCliente, type ActionResult } from "@/lib/actions/auth";

const inicial: ActionResult = { error: null };

export function ContaClienteModal({ nomeAtual }: { nomeAtual: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-[#9FB0BF] hover:text-white flex items-center gap-1"
      >
        <UserCog size={13} /> Conta
      </button>

      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth="max-w-sm">
        {() => (
          <div className="p-6 space-y-6">
            <h2 className="text-[15px] font-semibold text-[#14283A]">A minha conta</h2>
            <FormNome nomeAtual={nomeAtual} />
            <div className="border-t border-[#EDEBE2]" />
            <FormPassword />
          </div>
        )}
      </ModalShell>
    </>
  );
}

function FormNome({ nomeAtual }: { nomeAtual: string }) {
  const [state, formAction, pending] = useActionState(atualizarNomeCliente, inicial);
  const [guardado, setGuardado] = useState(false);

  return (
    <form
      action={(fd) => {
        setGuardado(false);
        formAction(fd);
      }}
      className="space-y-2"
    >
      <label className="text-[12px] font-medium text-[#4A4740] block">Nome</label>
      <input
        name="nome"
        defaultValue={nomeAtual}
        required
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
      />
      {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          onClick={() => setGuardado(true)}
          className="px-3 py-1.5 rounded-lg bg-[#14283A] text-white text-[12px] font-medium disabled:opacity-60"
        >
          {pending ? "A guardar..." : "Guardar nome"}
        </button>
        {guardado && !pending && !state.error && (
          <span className="flex items-center gap-1 text-[11px] text-[#3E7A4D]">
            <Check size={12} /> Guardado
          </span>
        )}
      </div>
    </form>
  );
}

function FormPassword() {
  const [state, formAction, pending] = useActionState(atualizarPasswordCliente, inicial);
  const [guardado, setGuardado] = useState(false);

  return (
    <form
      action={(fd) => {
        setGuardado(false);
        formAction(fd);
      }}
      className="space-y-2"
    >
      <label className="text-[12px] font-medium text-[#4A4740] block">Mudar palavra-passe</label>
      <input
        name="passwordAtual"
        type="password"
        placeholder="Palavra-passe atual"
        required
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
      />
      <input
        name="novaPassword"
        type="password"
        placeholder="Nova palavra-passe"
        required
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
      />
      <input
        name="confirmar"
        type="password"
        placeholder="Confirmar nova palavra-passe"
        required
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
      />
      {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          onClick={() => setGuardado(true)}
          className="px-3 py-1.5 rounded-lg bg-[#14283A] text-white text-[12px] font-medium disabled:opacity-60"
        >
          {pending ? "A mudar..." : "Mudar palavra-passe"}
        </button>
        {guardado && !pending && !state.error && (
          <span className="flex items-center gap-1 text-[11px] text-[#3E7A4D]">
            <Check size={12} /> Alterada
          </span>
        )}
      </div>
    </form>
  );
}
