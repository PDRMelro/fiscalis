import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { AdminShell } from "@/components/layout/AdminShell";
import { ContaExpirada } from "@/components/layout/ContaExpirada";
import { adminLogout } from "@/lib/actions/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/login");

  const { data: tenant } = profile.tenant_id
    ? await supabase.from("tenants").select("*").eq("id", profile.tenant_id).single()
    : { data: null };

  const hojeISO = new Date().toISOString().slice(0, 10);
  if (!profile.is_super_admin && tenant) {
    if (tenant.cancelado_em) {
      return (
        <ContaExpirada
          nomeEmpresa={tenant.nome_empresa}
          motivo="O acesso desta empresa foi cancelado. Contacta a Fiscalis para mais informações."
          logout={adminLogout}
        />
      );
    }
    if (tenant.ativo_ate && tenant.ativo_ate < hojeISO) {
      return (
        <ContaExpirada
          nomeEmpresa={tenant.nome_empresa}
          motivo="O período de acesso desta empresa terminou. Contacta a Fiscalis para renovar."
          logout={adminLogout}
        />
      );
    }
  }

  let logoUrl: string | null = null;
  if (tenant?.logo_path) {
    const { data: assinado } = await supabase.storage
      .from("tenant-branding")
      .createSignedUrl(tenant.logo_path, 60 * 60);
    logoUrl = assinado?.signedUrl ?? null;
  }

  let alertas: { id: string; descricao: string; prazo: string | null; obra: string; atrasada: boolean }[] = [];
  try {
    const { data: alertasRaw } = await supabase
      .from("nao_conformidades")
      .select("id, descricao, prazo, obras(nome)")
      .neq("estado", "Encerrada")
      .order("prazo", { ascending: true, nullsFirst: false })
      .limit(6);

    alertas = (alertasRaw ?? [])
      .map((n) => ({
        id: n.id as string,
        descricao: n.descricao as string,
        prazo: n.prazo as string | null,
        obra: (n.obras as unknown as { nome: string } | null)?.nome ?? "—",
        atrasada: !!n.prazo && (n.prazo as string) < hojeISO,
      }))
      .sort((a, b) => Number(b.atrasada) - Number(a.atrasada));
  } catch (err) {
    console.error("AdminLayout: falha ao carregar alertas", err);
  }

  let pedidosPendentes: { id: string; nomeEmpresa: string; criadoEm: string }[] = [];
  if (profile.is_super_admin) {
    const { data: pedidosRaw } = await supabase
      .from("tenant_pedidos")
      .select("id, nome_empresa, criado_em")
      .eq("estado", "pendente")
      .order("criado_em", { ascending: false });

    pedidosPendentes = (pedidosRaw ?? []).map((p) => ({
      id: p.id,
      nomeEmpresa: p.nome_empresa,
      criadoEm: p.criado_em,
    }));
  }

  const nome = profile.nome || "Administrador";
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AdminShell
      nome={nome}
      cargo="Eng.º Civil"
      nomeEmpresa={tenant?.nome_empresa ?? "Fiscalis Engenharia"}
      logoUrl={logoUrl}
      corFundoBarra={tenant?.cor_fundo_barra ?? null}
      corDestaque={tenant?.cor_destaque ?? null}
      corTexto={tenant?.cor_texto ?? null}
      ativoAte={tenant?.ativo_ate ?? null}
      isSuperAdmin={profile.is_super_admin}
      iniciais={iniciais || "AD"}
      alertas={alertas}
      pedidosPendentes={pedidosPendentes}
    >
      {children}
    </AdminShell>
  );
}
