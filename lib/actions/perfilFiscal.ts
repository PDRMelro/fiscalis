"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMeuTenantId } from "@/lib/tenant";

export type ResultadoAcao = { error: string | null };

export async function atualizarPerfilFiscal(formData: FormData): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return { error: "A tua sessão expirou. Volta a entrar." };

    const campos = {
      nome: String(formData.get("nome") ?? "").trim(),
      qualificacao: String(formData.get("qualificacao") ?? "").trim(),
      morada_fiscal: String(formData.get("morada_fiscal") ?? "").trim(),
      nif: String(formData.get("nif") ?? "").trim(),
      cartao_cidadao: String(formData.get("cartao_cidadao") ?? "").trim(),
      cedula_profissional: String(formData.get("cedula_profissional") ?? "").trim(),
    };

    // upsert (não update): uma empresa nova ainda não tem nenhuma linha em
    // perfil_fiscal, por isso um update simples não gravava nada (0 linhas
    // afetadas, sem erro) na primeira vez que alguém preenchia este formulário.
    const { error } = await supabase
      .from("perfil_fiscal")
      .upsert({ ...campos, tenant_id: tenantId }, { onConflict: "tenant_id" });
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
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return { error: "A tua sessão expirou. Volta a entrar." };

    const { data: atual } = await supabase
      .from("perfil_fiscal")
      .select("seguro_rc_path")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    const camposSeguro = { seguro_rc_path: ficheiro.path, seguro_rc_nome_ficheiro: ficheiro.nome };

    // Se ainda não existir nenhuma linha para este tenant (empresa nova que
    // ainda não guardou o perfil principal), cria-a com os campos
    // obrigatórios vazios em vez de um update que não afetaria nenhuma linha.
    const { error } = atual
      ? await supabase.from("perfil_fiscal").update(camposSeguro).eq("tenant_id", tenantId)
      : await supabase.from("perfil_fiscal").insert({
          tenant_id: tenantId,
          nome: "",
          qualificacao: "",
          morada_fiscal: "",
          nif: "",
          cartao_cidadao: "",
          cedula_profissional: "",
          ...camposSeguro,
        });
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
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return;

    const { data: atual } = await supabase
      .from("perfil_fiscal")
      .select("seguro_rc_path")
      .eq("tenant_id", tenantId)
      .single();
    if (atual?.seguro_rc_path) {
      await supabase.storage.from("perfil-fiscal").remove([atual.seguro_rc_path]);
    }
    await supabase
      .from("perfil_fiscal")
      .update({ seguro_rc_path: null, seguro_rc_nome_ficheiro: null })
      .eq("tenant_id", tenantId);
  } catch (err) {
    console.error("eliminarSeguroRC falhou", err);
  }
  revalidatePath("/configuracoes");
}
