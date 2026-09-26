"use client";

import { useActionState, useEffect, useRef } from "react";
import { enviarMensagem, type ResultadoAcao } from "@/lib/actions/mensagens";
import type { MensagemRow } from "@/lib/supabase/types";

const initialState: ResultadoAcao = { error: null };

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ConversaMensagens({
  destinatarioId,
  mensagens,
  meuId,
}: {
  destinatarioId: string;
  mensagens: MensagemRow[];
  meuId: string;
}) {
  const [state, formAction, pending] = useActionState(enviarMensagem.bind(null, destinatarioId), initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length]);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-2xl flex flex-col h-[65vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {mensagens.length === 0 && (
          <p className="text-[13px] text-[#8A8578] text-center py-6">Ainda sem mensagens. Diz olá.</p>
        )}
        {mensagens.map((m) => {
          const minha = m.remetente_id === meuId;
          return (
            <div key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-[13px] ${
                  minha ? "bg-[#14283A] text-white" : "bg-[#F5F4EF] text-[#1F1D19]"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.corpo}</p>
                <p className={`text-[10px] mt-1 ${minha ? "text-[#9FB0BF]" : "text-[#8A8578]"}`}>
                  {formatarHora(m.criado_em)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={fimRef} />
      </div>
      <form ref={formRef} action={formAction} className="flex items-center gap-2 border-t border-[#E4E1D6] p-3">
        <input
          name="corpo"
          required
          autoComplete="off"
          placeholder="Escreve uma mensagem..."
          className="flex-1 px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "..." : "Enviar"}
        </button>
      </form>
      {state.error && <p className="text-[11px] text-[#B0402F] px-3 pb-2">{state.error}</p>}
    </div>
  );
}
