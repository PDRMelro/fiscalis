"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { enviarPedido, type ResultadoPedido } from "@/lib/actions/contacto";

const inicial: ResultadoPedido = { error: null };

export function PedidoForm({ tipo }: { tipo: string }) {
  const [state, formAction, pending] = useActionState(enviarPedido, inicial);
  const [enviado, setEnviado] = useState(false);
  const submeteuRef = useRef(false);

  useEffect(() => {
    if (submeteuRef.current && !pending && state.error === null) {
      setEnviado(true);
    }
  }, [state, pending]);

  function acao(formData: FormData) {
    submeteuRef.current = true;
    formAction(formData);
  }

  if (enviado) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 size={32} className="text-[#2C6B45] mx-auto mb-3" />
        <p className="text-[15px] font-semibold text-[#14283A] mb-1">Pedido enviado!</p>
        <p className="text-[13px] text-[#8A8578]">Obrigado — vou responder-te em breve.</p>
      </div>
    );
  }

  return (
    <form action={acao} className="space-y-3">
      <input type="hidden" name="tipo" value={tipo} />
      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome</label>
        <input
          name="nome"
          required
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Telefone (opcional)</label>
        <input
          name="telefone"
          type="tel"
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Mensagem (opcional)</label>
        <textarea
          name="mensagem"
          rows={3}
          placeholder={tipo === "orcamento" ? "Fase da obra, localização, o que precisas de acompanhar..." : "A tua empresa, quantas obras acompanhas..."}
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A] resize-none"
        />
      </div>
      {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full mt-1 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
      >
        {pending ? "A enviar..." : "Enviar pedido"}
      </button>
    </form>
  );
}
