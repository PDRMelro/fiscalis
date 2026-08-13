"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoProposta } from "@/lib/supabase/types";

export async function criarProposta(formData: FormData) {
  const supabase = await createClient();
  const cliente_nome = String(formData.get("cliente_nome") ?? "").trim();
  const local = String(formData.get("local") ?? "").trim();
  const tipo_obra = String(formData.get("tipo_obra") ?? "").trim();
  if (!cliente_nome || !local || !tipo_obra) throw new Error("Preenche todos os campos.");

  const { error } = await supabase.from("propostas").insert({
    cliente_nome,
    local,
    tipo_obra,
    enviada_em: String(formData.get("enviada_em") ?? "") || undefined,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}

export async function atualizarEstadoProposta(id: string, estado: EstadoProposta) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}

export async function eliminarProposta(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}
