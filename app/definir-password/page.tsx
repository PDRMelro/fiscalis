"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { LOGO_SRC_DARK } from "@/lib/branding";
import { definirPasswordConvite, type ActionResult } from "@/lib/actions/definirPassword";
import { PasswordInput } from "@/components/ui/PasswordInput";

const initialState: ActionResult = { error: null };

function DefinirPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const tipo = searchParams.get("tipo") ?? "invite";
  const [state, formAction, pending] = useActionState(definirPasswordConvite, initialState);

  if (!email || !token) {
    return (
      <p className="text-[13px] text-[#B0402F]">Este link parece incompleto. Peça um novo convite à Fiscalis.</p>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="tipo" value={tipo} />
      <div>
        <label className="text-[12px] text-[#4A4740] font-medium">Email</label>
        <input
          value={email}
          disabled
          autoComplete="off"
          className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#8A8578] bg-[#F5F4EF]"
        />
      </div>
      <div>
        <label className="text-[12px] text-[#4A4740] font-medium">Nova palavra-passe</label>
        <PasswordInput
          name="password"
          required
          autoComplete="new-password"
          className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
        />
      </div>
      <div>
        <label className="text-[12px] text-[#4A4740] font-medium">Confirmar palavra-passe</label>
        <PasswordInput
          name="confirmar"
          required
          autoComplete="new-password"
          className="mt-1 w-full border border-[#E4E1D6] rounded-lg px-3 py-2 text-[13px] text-[#1F1D19] bg-white outline-none focus:border-[#C9A050]"
        />
      </div>

      {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-[#14283A] text-white text-[13px] font-medium rounded-lg py-2.5 mt-2 hover:bg-[#1C374E] transition-colors disabled:opacity-60"
      >
        {pending ? "A ativar..." : "Ativar acesso"}
      </button>
    </form>
  );
}

export default function DefinirPasswordPage() {
  return (
    <div
      className="min-h-screen w-full bg-[#14283A] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-12 w-auto" />
          <p className="text-white text-[15px] font-semibold tracking-wide">FISCALIS</p>
          <p className="text-[#C9A050] text-[10px] tracking-[0.15em] font-medium">ENGENHARIA</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl">
          <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">Bem-vindo à Fiscalis</h1>
          <p className="text-[13px] text-[#8A8578] mb-6">Defina a sua palavra-passe para ativar o acesso.</p>

          <Suspense fallback={null}>
            <DefinirPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
