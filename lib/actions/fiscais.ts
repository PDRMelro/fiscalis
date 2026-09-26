"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { construirLinkConvite } from "@/lib/inviteLink";

export type ResultadoFiscal = { error: string | null; link: string | null };

async function exigirAdminDoTenant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role, tenant_id").eq("id", user.id).single();
  if (profile?.role !== "admin" || !profile.tenant_id) return null;

  return { supabase, tenantId: profile.tenant_id };
}

export async function criarFiscal(_prev: ResultadoFiscal, formData: FormData): Promise<ResultadoFiscal> {
  const contexto = await exigirAdminDoTenant();
  if (!contexto) return { error: "Sem permissões.", link: null };
  const { tenantId } = contexto;

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const qualificacao = String(formData.get("qualificacao") ?? "").trim();
  const cedulaProfissional = String(formData.get("cedulaProfissional") ?? "").trim();
  const fiscalPrincipal = formData.get("fiscalPrincipal") === "on";

  if (!nome || !email) return { error: "Preenche o nome e o email.", link: null };

  const admin = createAdminClient();

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { data: { nome } },
  });
  if (linkError || !linkData?.user) {
    console.error("criarFiscal: falha ao criar conta", linkError);
    return { error: `Não foi possível criar a conta de acesso: ${linkError?.message ?? "erro desconhecido"}`, link: null };
  }

  // O trigger on_auth_user_created já criou um profile como "client" —
  // atualiza-o para fiscal desta empresa, tal como se faz para as empresas.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: "fiscal",
      tenant_id: tenantId,
      nome,
      email,
      qualificacao: qualificacao || null,
      cedula_profissional: cedulaProfissional || null,
      fiscal_principal: fiscalPrincipal,
    })
    .eq("id", linkData.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(linkData.user.id);
    console.error("criarFiscal: falha ao atualizar profile", profileError);
    return { error: "Não foi possível preparar a conta de acesso.", link: null };
  }

  revalidatePath("/fiscais");

  const otp = linkData.properties?.email_otp;
  return { error: null, link: construirLinkConvite(email, otp, "invite") };
}

export async function gerarLinkConviteFiscal(_prev: ResultadoFiscal, formData: FormData): Promise<ResultadoFiscal> {
  const contexto = await exigirAdminDoTenant();
  if (!contexto) return { error: "Sem permissões.", link: null };
  const { supabase, tenantId } = contexto;

  const fiscalId = String(formData.get("fiscalId") ?? "").trim();
  if (!fiscalId) return { error: "Fiscal inválido.", link: null };

  const { data: fiscal, error: fiscalError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", fiscalId)
    .eq("tenant_id", tenantId)
    .eq("role", "fiscal")
    .single();
  if (fiscalError || !fiscal) return { error: "Fiscal não encontrado.", link: null };

  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: fiscal.email,
  });
  if (linkError || !linkData) {
    console.error("gerarLinkConviteFiscal falhou", linkError);
    return { error: "Não foi possível gerar o link.", link: null };
  }

  return { error: null, link: construirLinkConvite(fiscal.email, linkData.properties?.email_otp, "recovery") };
}

export async function alternarFiscalPrincipal(fiscalId: string): Promise<void> {
  const contexto = await exigirAdminDoTenant();
  if (!contexto) throw new Error("Sem permissões.");
  const { supabase, tenantId } = contexto;

  const { data: fiscal, error: fetchError } = await supabase
    .from("profiles")
    .select("fiscal_principal")
    .eq("id", fiscalId)
    .eq("tenant_id", tenantId)
    .eq("role", "fiscal")
    .single();
  if (fetchError || !fiscal) throw new Error("Fiscal não encontrado.");

  const { error } = await supabase
    .from("profiles")
    .update({ fiscal_principal: !fiscal.fiscal_principal })
    .eq("id", fiscalId);
  if (error) throw new Error(error.message);

  revalidatePath("/fiscais");
}

export async function desativarFiscal(fiscalId: string): Promise<void> {
  const contexto = await exigirAdminDoTenant();
  if (!contexto) throw new Error("Sem permissões.");
  const { supabase, tenantId } = contexto;

  const { error } = await supabase
    .from("profiles")
    .update({ ativo: false })
    .eq("id", fiscalId)
    .eq("tenant_id", tenantId)
    .eq("role", "fiscal");
  if (error) throw new Error(error.message);

  revalidatePath("/fiscais");
}

export async function reativarFiscal(fiscalId: string): Promise<void> {
  const contexto = await exigirAdminDoTenant();
  if (!contexto) throw new Error("Sem permissões.");
  const { supabase, tenantId } = contexto;

  const { error } = await supabase
    .from("profiles")
    .update({ ativo: true })
    .eq("id", fiscalId)
    .eq("tenant_id", tenantId)
    .eq("role", "fiscal");
  if (error) throw new Error(error.message);

  revalidatePath("/fiscais");
}
