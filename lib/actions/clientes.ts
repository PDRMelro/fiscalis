"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

const CAMPOS_PERMITIDOS = [
  "ativo",
  "pode_ver_relatorios",
  "pode_ver_nc",
  "pode_ver_documentos",
  "pode_ver_financeiro",
] as const;

type CampoPermissao = (typeof CAMPOS_PERMITIDOS)[number];

export async function atualizarPermissaoCliente(
  profileId: string,
  campo: CampoPermissao,
  valor: boolean
) {
  if (!CAMPOS_PERMITIDOS.includes(campo)) throw new Error("Campo inválido.");

  const update: Partial<ProfileRow> = { [campo]: valor } as Partial<ProfileRow>;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", profileId)
    .eq("role", "client");

  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath("/portal");
}
