"use client";

import { useTransition } from "react";
import { atualizarPermissaoCliente } from "@/lib/actions/clientes";

type Campo = "ativo" | "pode_ver_relatorios" | "pode_ver_nc" | "pode_ver_documentos" | "pode_ver_financeiro";

export function PermissaoToggle({
  profileId,
  campo,
  valorInicial,
}: {
  profileId: string;
  campo: Campo;
  valorInicial: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={valorInicial}
      disabled={pending}
      onChange={(e) => startTransition(() => atualizarPermissaoCliente(profileId, campo, e.target.checked))}
      className="w-4 h-4 accent-[#14283A] disabled:opacity-50 cursor-pointer"
    />
  );
}
