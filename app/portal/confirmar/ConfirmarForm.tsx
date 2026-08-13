"use client";

import { useActionState, useState } from "react";
import { LOGO_SRC } from "@/lib/branding";
import { clientVerifyOtp, clientResendOtp, type ActionResult } from "@/lib/actions/auth";

const initialState: ActionResult = { error: null };

export function ConfirmarForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(clientVerifyOtp, initialState);
  const [reenviado, setReenviado] = useState(false);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-6 flex flex-col items-center">
          <img src={LOGO_SRC} alt="Fiscalis" className="h-10 w-auto mb-2" />
          <p className="text-white text-[13px] font-medium">Confirmar email</p>
        </div>
        <div className="p-6">
          <p className="text-[13px] text-[#4A4740] mb-4">
            Enviámos um código de 6 dígitos para <strong>{email}</strong>. Introduz o código abaixo para
            ativares a tua conta.
          </p>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="email" value={email} />
            <div>
              <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Código</label>
              <input
                name="token"
                required
                inputMode="numeric"
                placeholder="123456"
                className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[15px] tracking-[0.3em] text-center bg-white focus:outline-none focus:border-[#14283A]"
              />
            </div>

            {state.error && <p className="text-[12px] text-[#B0402F]">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
            >
              {pending ? "A confirmar..." : "Confirmar"}
            </button>
          </form>

          <button
            onClick={() => {
              clientResendOtp(email);
              setReenviado(true);
            }}
            className="w-full text-center text-[12px] text-[#8A8578] hover:text-[#14283A] mt-4 underline underline-offset-2"
          >
            {reenviado ? "Código reenviado" : "Reenviar código"}
          </button>
        </div>
      </div>
    </div>
  );
}
