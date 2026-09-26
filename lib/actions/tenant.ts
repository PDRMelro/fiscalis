"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMeuTenantId } from "@/lib/tenant";

export type ResultadoAcao = { error: string | null };

const HEX_COR = /^#[0-9a-fA-F]{6}$/;

export async function atualizarAparenciaTenant(formData: FormData): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return { error: "A tua sessão expirou. Volta a entrar." };

    const nomeEmpresa = String(formData.get("nome_empresa") ?? "").trim();
    const corFundoBarra = String(formData.get("cor_fundo_barra") ?? "").trim();
    const corDestaque = String(formData.get("cor_destaque") ?? "").trim();
    const corTexto = String(formData.get("cor_texto") ?? "").trim();

    if (!nomeEmpresa) return { error: "O nome da empresa não pode ficar vazio." };
    if (!HEX_COR.test(corFundoBarra) || !HEX_COR.test(corDestaque) || !HEX_COR.test(corTexto)) {
      return { error: "Cor inválida." };
    }

    const { error } = await supabase
      .from("tenants")
      .update({ nome_empresa: nomeEmpresa, cor_fundo_barra: corFundoBarra, cor_destaque: corDestaque, cor_texto: corTexto })
      .eq("id", tenantId);
    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return { error: null };
  } catch (err) {
    console.error("atualizarAparenciaTenant falhou", err);
    return { error: "Não foi possível guardar. Tenta outra vez." };
  }
}

export async function registarLogoTenant(ficheiro: { nome: string; path: string }): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return { error: "A tua sessão expirou. Volta a entrar." };

    const { data: atual } = await supabase.from("tenants").select("logo_path").eq("id", tenantId).single();

    const { error } = await supabase.from("tenants").update({ logo_path: ficheiro.path }).eq("id", tenantId);
    if (error) return { error: error.message };

    if (atual?.logo_path) {
      await supabase.storage.from("tenant-branding").remove([atual.logo_path]);
    }

    revalidatePath("/", "layout");
    return { error: null };
  } catch (err) {
    console.error("registarLogoTenant falhou", err);
    return { error: "Não foi possível guardar o logótipo. Tenta outra vez." };
  }
}

export async function eliminarLogoTenant() {
  try {
    const supabase = await createClient();
    const tenantId = await getMeuTenantId(supabase);
    if (!tenantId) return;

    const { data: atual } = await supabase.from("tenants").select("logo_path").eq("id", tenantId).single();
    if (atual?.logo_path) {
      await supabase.storage.from("tenant-branding").remove([atual.logo_path]);
    }
    await supabase.from("tenants").update({ logo_path: null }).eq("id", tenantId);
  } catch (err) {
    console.error("eliminarLogoTenant falhou", err);
  }
  revalidatePath("/", "layout");
}
