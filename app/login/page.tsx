"use client";

import { useActionState } from "react";
import { LOGO_SRC } from "@/lib/branding";
import { adminLogin, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div
      className="min-h-screen w-full bg-[#14283A] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          <img src={LOGO_SRC} alt="Fiscalis" className="h-12 w-auto" />
          <p className="text-white text-[15px] font-semibold tracking-wide">FISCALIS</p>
          <p className="text-[#C9A050] text-[10px] tracking-[0.15em] font-medium">ENGENHARIA</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl">
          <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">Acesso interno</h1>
          <p className="text-[13px] text-[#8A8578] mb-6">Área de gestão — Fiscalis Engenharia</p>

          <form action={formAction} className="space-y-3.5">
            <div>
              <label className="text-[12px] text-[#4A4740] font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#C9A050]"
              />
            </div>
            <div>
              <label className="text-[12px] text-[#4A4740] font-medium">Palavra-passe</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#C9A050]"
              />
            </div>

            <label className="flex items-center gap-2 text-[12px] text-[#4A4740]">
              <input
                name="manterLigado"
                type="checkbox"
                defaultChecked
                className="w-3.5 h-3.5 accent-[#14283A]"
              />
              Manter-me ligado
            </label>

            {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#14283A] text-white text-[13px] font-medium rounded-lg py-2.5 mt-2 hover:bg-[#1C374E] transition-colors disabled:opacity-60"
            >
              {pending ? "A entrar..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#6E8294] mt-5">
          És cliente de uma obra?{" "}
          <a href="/portal/login" className="text-[#C9A050] hover:underline">
            Acede ao Portal do Cliente
          </a>
        </p>
      </div>
    </div>
  );
}
