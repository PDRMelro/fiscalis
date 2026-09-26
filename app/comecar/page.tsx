"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { criarPedidoTenant, type ResultadoPedido } from "@/lib/actions/tenantPedidos";

const initialState: ResultadoPedido = { error: null, sucesso: false };

export default function ComecarPage() {
  const [state, formAction, pending] = useActionState(criarPedidoTenant, initialState);

  return (
    <div
      className="min-h-screen w-full bg-[#14283A] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-12 w-auto" />
          <p className="text-white text-[15px] font-semibold tracking-wide">FISCALIS</p>
          <p className="text-[#C9A050] text-[10px] tracking-[0.15em] font-medium">ENGENHARIA</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl">
          {state.sucesso ? (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <CheckCircle2 size={36} className="text-[#3E7A4D]" />
              <h1 className="text-[16px] font-semibold text-[#14283A]">Pedido enviado</h1>
              <p className="text-[13px] text-[#4A4740]">
                Obrigado pelo interesse. Vamos analisar o seu pedido e entraremos em contacto em breve.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">Usar a Fiscalis na sua empresa</h1>
              <p className="text-[13px] text-[#8A8578] mb-6">
                Preencha os seus dados e entraremos em contacto para ativar o seu acesso.
              </p>

              <form action={formAction} className="space-y-3.5">
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">Nome da empresa</label>
                  <input
                    name="nomeEmpresa"
                    required
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">O seu nome</label>
                  <input
                    name="nomeResponsavel"
                    required
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">Email de contacto</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">Telefone (opcional)</label>
                  <input
                    name="telefone"
                    type="tel"
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">Mensagem (opcional)</label>
                  <textarea
                    name="mensagem"
                    rows={3}
                    placeholder="Ex: número de obras, tipo de necessidade..."
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050] resize-none"
                  />
                </div>

                <label className="flex items-start gap-2 text-[12px] text-[#4A4740]">
                  <input
                    name="aceitouPolitica"
                    type="checkbox"
                    required
                    className="w-3.5 h-3.5 mt-0.5 accent-[#14283A] shrink-0"
                  />
                  <span>
                    Li e aceito a{" "}
                    <Link href="/privacidade" target="_blank" className="text-[#14283A] underline underline-offset-2">
                      Política de Proteção de Dados
                    </Link>
                    .
                  </span>
                </label>

                {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-[#14283A] text-white text-[13px] font-medium rounded-lg py-2.5 mt-2 hover:bg-[#1C374E] transition-colors disabled:opacity-60"
                >
                  {pending ? "A enviar..." : "Enviar pedido"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#6E8294] mt-5">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-[#C9A050] hover:underline">
            Aceda ao painel
          </Link>
        </p>
      </div>
    </div>
  );
}
