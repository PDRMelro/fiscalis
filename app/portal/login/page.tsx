"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { clientLogin, type ActionResult } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/ui/PasswordInput";

const initialState: ActionResult = { error: null };

export default function PortalLoginPage() {
  const [state, formAction, pending] = useActionState(clientLogin, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-6 flex flex-col items-center">
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-10 w-auto mb-2" />
          <p className="text-white text-[13px] font-medium">Portal do Cliente</p>
        </div>
        <div className="p-6">
          <form action={formAction}>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="o-teu-email@exemplo.com"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A] mb-3"
            />
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Palavra-passe</label>
            <PasswordInput
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] text-[#1F1D19] bg-white focus:outline-none focus:border-[#14283A]"
            />

            <label className="flex items-center gap-2 text-[12px] text-[#4A4740] mt-3">
              <input
                name="manterLigado"
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 accent-[#14283A]"
              />
              Manter-me ligado
            </label>

            {state.error && <p className="text-[12px] text-[#B0402F] mt-2">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
            >
              {pending ? "A entrar..." : "Entrar"}
            </button>
          </form>
          <p className="text-[12px] text-[#8A8578] text-center mt-3">
            Ainda não tens conta?{" "}
            <Link href="/portal/signup" className="text-[#14283A] font-medium underline underline-offset-2">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
      <p className="text-center text-[11px] text-[#8A8578] mt-5">
        És o fiscal responsável?{" "}
        <Link href="/login" className="text-[#14283A] hover:underline">
          Acede à área interna
        </Link>
      </p>
    </div>
  );
}
