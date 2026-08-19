"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LOGO_SRC } from "@/lib/branding";
import { clientSignUp, type ActionResult } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/ui/PasswordInput";

const initialState: ActionResult = { error: null };

export default function PortalSignupPage() {
  const [state, formAction, pending] = useActionState(clientSignUp, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-6 flex flex-col items-center">
          <img src={LOGO_SRC} alt="Fiscalis" className="h-10 w-auto mb-2" />
          <p className="text-white text-[13px] font-medium">Criar conta de cliente</p>
        </div>
        <div className="p-6">
          <form action={formAction} className="space-y-3">
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
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Código de acesso da obra</label>
              <input
                name="codigoAcesso"
                required
                placeholder="Fornecido pelo teu engenheiro fiscal"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A] uppercase"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Palavra-passe</label>
              <PasswordInput
                name="password"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Confirmar palavra-passe</label>
              <PasswordInput
                name="confirmar"
                required
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
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
              className="w-full py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
            >
              {pending ? "A criar conta..." : "Criar conta"}
            </button>
          </form>
          <p className="text-[12px] text-[#8A8578] text-center mt-3">
            Já tens conta?{" "}
            <Link href="/portal/login" className="text-[#14283A] font-medium underline underline-offset-2">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
