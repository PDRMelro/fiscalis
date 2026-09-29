"use client";

import { useActionState } from "react";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { pedirRecuperacaoPassword, type ResultadoRecuperacao } from "@/lib/actions/auth";

const initialState: ResultadoRecuperacao = { error: null, enviado: false };

export default function EsqueciPasswordPage() {
  const [state, formAction, pending] = useActionState(pedirRecuperacaoPassword, initialState);
  const enviadoComSucesso = state.enviado && !state.error;

  return (
    <div
      className="min-h-screen w-full bg-[#14283A] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-12 w-auto" />
          <p className="text-white text-[15px] font-semibold tracking-wide">FISCALIS</p>
          <p className="text-[#C9A050] text-[10px] tracking-[0.15em] font-medium">ENGENHARIA</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl">
          {enviadoComSucesso ? (
            <>
              <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">Verifica o teu email</h1>
              <p className="text-[13px] text-[#4A4740]">
                Se existir uma conta com esse email, vais receber uma mensagem com um link para definires uma nova
                palavra-passe.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">Esqueceste a password?</h1>
              <p className="text-[13px] text-[#8A8578] mb-6">Introduz o teu email e enviamos-te um link para a repores.</p>

              <form action={formAction} className="space-y-3.5">
                <div>
                  <label className="text-[12px] text-[#4A4740] font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
                  />
                </div>

                {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-[#14283A] text-white text-[13px] font-medium rounded-lg py-2.5 mt-2 hover:bg-[#1C374E] transition-colors disabled:opacity-60"
                >
                  {pending ? "A enviar..." : "Enviar link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#6E8294] mt-5">
          <a href="/login" className="text-[#C9A050] hover:underline">
            Voltar ao login
          </a>
        </p>
      </div>
    </div>
  );
}
