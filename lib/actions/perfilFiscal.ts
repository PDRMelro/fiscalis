"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarPerfilFiscal(formData: FormData) {
  const supabase = await createClient();
  const campos = {
    nome: String(formData.get("nome") ?? "").trim(),
    qualificacao: String(formData.get("qualificacao") ?? "").trim(),
    morada_fiscal: String(formData.get("morada_fiscal") ?? "").trim(),
    nif: String(formData.get("nif") ?? "").trim(),
    cartao_cidadao: String(formData.get("cartao_cidadao") ?? "").trim(),
    cedula_profissional: String(formData.get("cedula_profissional") ?? "").trim(),
  };

  const { error } = await supabase.from("perfil_fiscal").update(campos).eq("id", true);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}
