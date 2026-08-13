"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoNC, Severidade } from "@/lib/supabase/types";

export async function criarNC(formData: FormData) {
  const supabase = await createClient();
  const obraId = String(formData.get("obra_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (!obraId || !descricao) throw new Error("Escolhe a obra e descreve a não conformidade.");

  const { error } = await supabase.from("nao_conformidades").insert({
    obra_id: obraId,
    descricao,
    severidade: String(formData.get("severidade") ?? "Média") as Severidade,
    responsavel: String(formData.get("responsavel") ?? "").trim() || null,
    prazo: String(formData.get("prazo") ?? "") || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/nc");
  revalidatePath("/dashboard");
}

export async function atualizarEstadoNC(id: string, estado: EstadoNC) {
  const supabase = await createClient();
  const { error } = await supabase.from("nao_conformidades").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nc");
  revalidatePath("/dashboard");
}

export async function eliminarNC(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("nao_conformidades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nc");
  revalidatePath("/dashboard");
}
