"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = "https://www.fiscalis-engenharia.pt";

export type ResultadoAprovacao = { error: string | null };
export type ResultadoLink = { error: string | null; link: string | null };

function construirLinkConvite(email: string, otp: string | undefined, tipo: "invite" | "recovery"): string {
  return `${SITE_URL}/definir-password?email=${encodeURIComponent(email)}&token=${otp ?? ""}&tipo=${tipo}`;
}

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
  if (!supabase) return { error: "Sem permissões." };

  const pedidoId = String(formData.get("pedidoId") ?? "").trim();
  const plano = String(formData.get("plano") ?? "").trim();
  const ativoAte = String(formData.get("ativoAte") ?? "").trim();
  const valorPagoTexto = String(formData.get("valorPago") ?? "").trim();
  const valorPago = valorPagoTexto ? Number(valorPagoTexto) : null;
  if (!pedidoId) return { error: "Pedido inválido." };
  if (valorPagoTexto && (Number.isNaN(valorPago) || valorPago! < 0)) {
    return { error: "Valor pago inválido." };
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from("tenant_pedidos")
    .select("*")
    .eq("id", pedidoId)
    .eq("estado", "pendente")
    .single();
  if (pedidoError || !pedido) return { error: "Pedido não encontrado ou já foi decidido." };

  const admin = createAdminClient();

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ nome_empresa: pedido.nome_empresa, plano: plano || null, ativo_ate: ativoAte || null, valor_pago: valorPago })
    .select()
    .single();
  if (tenantError || !tenant) {
    console.error("aprovarPedido: falha ao criar tenant", tenantError);
    return { error: "Não foi possível criar a empresa." };
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: pedido.email,
    options: { data: { nome: pedido.nome_responsavel } },
  });
  if (linkError || !linkData?.user) {
    await admin.from("tenants").delete().eq("id", tenant.id);
    console.error("aprovarPedido: falha ao criar conta", linkError);
    return { error: `Não foi possível criar a conta de acesso: ${linkError?.message ?? "erro desconhecido"}` };
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
    return { error: "Não foi possível preparar a conta de acesso." };
  }

  await supabase
    .from("tenant_pedidos")
    .update({ estado: "aprovado", tenant_id: tenant.id, decidido_em: new Date().toISOString() })
    .eq("id", pedidoId);

  revalidatePath("/empresas");
  return { error: null };
}

/**
 * Gera (ou regenera) o link de ativação da conta do administrador de um
 * tenant — usado logo a seguir a aprovar, ou mais tarde se o link anterior
 * se perder/expirar. Fica disponível na lista de empresas enquanto a
 * conta não estiver ativada (password_definida_em null).
 */
export async function gerarLinkConvite(_prev: ResultadoLink, formData: FormData): Promise<ResultadoLink> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) return { error: "Sem permissões.", link: null };

  const tenantId = String(formData.get("tenantId") ?? "").trim();
  if (!tenantId) return { error: "Empresa inválida.", link: null };

  const { data: adminProfile, error: profileError } = await supabase
    .from("profiles")
    .select("email")
    .eq("tenant_id", tenantId)
    .eq("role", "admin")
    .limit(1)
    .single();
  if (profileError || !adminProfile) {
    return { error: "Não foi encontrada nenhuma conta de administrador para esta empresa.", link: null };
  }

  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: adminProfile.email,
  });
  if (linkError || !linkData) {
    console.error("gerarLinkConvite falhou", linkError);
    return { error: "Não foi possível gerar o link.", link: null };
  }

  return { error: null, link: construirLinkConvite(adminProfile.email, linkData.properties?.email_otp, "recovery") };
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

/**
 * Elimina definitivamente uma empresa com acesso já cancelado, incluindo a(s)
 * conta(s) de login associadas. Falha de propósito (por causa das chaves
 * estrangeiras) se ainda houver obras/propostas/etc. ligadas a este tenant —
 * isto é só para limpar empresas de teste ou pedidos criados por engano, não
 * para apagar uma empresa com dados reais.
 */
export async function eliminarTenant(_prev: ResultadoAprovacao, formData: FormData): Promise<ResultadoAprovacao> {
  const supabase = await exigirSuperAdmin();
  if (!supabase) return { error: "Sem permissões." };

  const tenantId = String(formData.get("tenantId") ?? "").trim();
  if (!tenantId) return { error: "Empresa inválida." };

  const { data: tenant } = await supabase.from("tenants").select("cancelado_em").eq("id", tenantId).single();
  if (!tenant?.cancelado_em) return { error: "Só é possível eliminar uma empresa depois de lhe cancelar o acesso." };

  const admin = createAdminClient();

  const { data: perfis, error: perfisError } = await admin.from("profiles").select("id").eq("tenant_id", tenantId);
  if (perfisError) {
    console.error("eliminarTenant: falha ao listar perfis", perfisError);
    return { error: `Não foi possível eliminar: ${perfisError.message}` };
  }

  for (const perfil of perfis ?? []) {
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(perfil.id);
    if (deleteUserError) {
      console.error("eliminarTenant: falha ao eliminar utilizador", deleteUserError);
      return { error: `Não foi possível eliminar a conta de acesso: ${deleteUserError.message}` };
    }
  }

  // O pedido de acesso original que deu origem a este tenant também aponta
  // para ele — apaga-se junto, já não faz sentido manter esse histórico
  // isolado de uma empresa que deixou de existir.
  const { error: pedidosError } = await admin.from("tenant_pedidos").delete().eq("tenant_id", tenantId);
  if (pedidosError) {
    console.error("eliminarTenant: falha ao eliminar pedidos associados", pedidosError);
    return { error: `Não foi possível eliminar: ${pedidosError.message}` };
  }

  const { error } = await admin.from("tenants").delete().eq("id", tenantId);
  if (error) {
    console.error("eliminarTenant: falha ao eliminar tenant", error);
    return {
      error: `Não foi possível eliminar: ${error.message || "ainda há dados associados a esta empresa (obras, propostas, etc.)."}`,
    };
  }

  revalidatePath("/empresas");
  return { error: null };
}
