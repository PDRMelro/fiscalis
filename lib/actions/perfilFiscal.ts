"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoAcao = { error: string | null };

export async function atualizarPerfilFiscal(formData: FormData): Promise<ResultadoAcao> {
  try {
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
    if (error) return { error: error.message };

    revalidatePath("/configuracoes");
    return { error: null };
  } catch (err) {
    console.error("atualizarPerfilFiscal falhou", err);
    return { error: "Não foi possível guardar. Tenta outra vez." };
  }
}

export async function registarSeguroRC(ficheiro: { nome: string; path: string }): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const { data: atual } = await supabase.from("perfil_fiscal").select("seguro_rc_path").eq("id", true).single();

    const { error } = await supabase
      .from("perfil_fiscal")
      .update({ seguro_rc_path: ficheiro.path, seguro_rc_nome_ficheiro: ficheiro.nome })
      .eq("id", true);
    if (error) return { error: error.message };

    if (atual?.seguro_rc_path) {
      await supabase.storage.from("perfil-fiscal").remove([atual.seguro_rc_path]);
    }

    revalidatePath("/configuracoes");
    return { error: null };
  } catch (err) {
    console.error("registarSeguroRC falhou", err);
    return { error: "Não foi possível guardar o ficheiro. Tenta outra vez." };
  }
}

export async function eliminarSeguroRC() {
  try {
    const supabase = await createClient();
    const { data: atual } = await supabase.from("perfil_fiscal").select("seguro_rc_path").eq("id", true).single();
    if (atual?.seguro_rc_path) {
      await supabase.storage.from("perfil-fiscal").remove([atual.seguro_rc_path]);
    }
    await supabase.from("perfil_fiscal").update({ seguro_rc_path: null, seguro_rc_nome_ficheiro: null }).eq("id", true);
  } catch (err) {
    console.error("eliminarSeguroRC falhou", err);
  }
  revalidatePath("/configuracoes");
}
