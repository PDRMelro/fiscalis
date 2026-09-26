"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = "https://www.fiscalis-engenharia.pt";

export type ResultadoAprovacao = { error: string | null; link: string | null };

async function exigirSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  return profile?.is_super_admin ? supabase : null;
}

export async function aprovarPedido(_prev: ResultadoAprovacao, formData: FormData): Promise<ResultadoAprovacao> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) return { error: "Sem permissões.", link: null };

  const pedidoId = String(formData.get("pedidoId") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const ativoAte = String(formData.get("ativoAte") ?? "").trim();
  if (!pedidoId) return { error: "Pedido inválido.", link: null };

  const { data: pedido, error: pedidoError } = await supabase
    .from("tenant_pedidos")
    .select("*")
    .eq("id", pedidoId)
    .eq("estado", "pendente")
    .single();
  if (pedidoError || !pedido) return { error: "Pedido não encontrado ou já foi decidido.", link: null };

  const admin = createAdminClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ nome_empresa: pedido.nome_empresa, plano: plano || null, ativo_ate: ativoAte || null })
    .select()
    .single();
  if (tenantError || !tenant) {
    console.error("aprovarPedido: falha ao criar tenant", tenantError);
    return { error: "Não foi possível criar a empresa.", link: null };
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: pedido.email,
    options: { data: { nome: pedido.nome_responsavel } },
  });
  if (linkError || !linkData?.user) {
    await admin.from("tenants").delete().eq("id", tenant.id);
    console.error("aprovarPedido: falha ao criar conta", linkError);
    return { error: `Não foi possível criar a conta de acesso: ${linkError?.message ?? "erro desconhecido"}`, link: null };
  }

  // O trigger on_auth_user_created já criou um profile como "client" —
  // atualiza-o para administrador desta empresa em vez de inserir outro.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "admin", tenant_id: tenant.id, nome: pedido.nome_responsavel, email: pedido.email })
    .eq("id", linkData.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(linkData.user.id);
    await admin.from("tenants").delete().eq("id", tenant.id);
    console.error("aprovarPedido: falha ao atualizar profile", profileError);
    return { error: "Não foi possível preparar a conta de acesso.", link: null };
  }

  await supabase
    .from("tenant_pedidos")
    .update({ estado: "aprovado", tenant_id: tenant.id, decidido_em: new Date().toISOString() })
    .eq("id", pedidoId);

  revalidatePath("/empresas");

  const otp = linkData.properties?.email_otp;
  const link = `${SITE_URL}/definir-password?email=${encodeURIComponent(pedido.email)}&token=${otp ?? ""}`;

  return { error: null, link };
}

export async function rejeitarPedido(pedidoId: string): Promise<void> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) throw new Error("Sem permissões.");

  const { error } = await supabase
    .from("tenant_pedidos")
    .update({ estado: "rejeitado", decidido_em: new Date().toISOString() })
    .eq("id", pedidoId)
    .eq("estado", "pendente");
  if (error) throw new Error(error.message);

  revalidatePath("/empresas");
}

export async function cancelarAcessoTenant(tenantId: string): Promise<void> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) throw new Error("Sem permissões.");

  const { error } = await supabase.from("tenants").update({ cancelado_em: new Date().toISOString() }).eq("id", tenantId);
  if (error) throw new Error(error.message);

  revalidatePath("/empresas");
}

export async function reativarAcessoTenant(tenantId: string): Promise<void> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) throw new Error("Sem permissões.");

  const { error } = await supabase.from("tenants").update({ cancelado_em: null }).eq("id", tenantId);
  if (error) throw new Error(error.message);

  revalidatePath("/empresas");
}
