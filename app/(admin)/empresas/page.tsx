import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmpresasPainel } from "@/components/empresas/EmpresasPainel";

export default async function EmpresasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_super_admin").eq("id", user.id).single();
  if (!profile?.is_super_admin) redirect("/dashboard");

  const [{ data: pedidos }, { data: tenants }] = await Promise.all([
    supabase.from("tenant_pedidos").select("*").eq("estado", "pendente").order("criado_em", { ascending: true }),
    supabase.from("tenants").select("*").order("criado_em", { ascending: true }),
  ]);

  const tenantsComContagens = await Promise.all(
    (tenants ?? []).map(async (tenant) => {
      const [{ count: numClientes }, { count: numObras }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("role", "client"),
        supabase.from("obras").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
      ]);
      return { ...tenant, numClientes: numClientes ?? 0, numObras: numObras ?? 0 };
    })
  );

  return (
    <>
      <PageHeader title="Empresas" subtitle="Pedidos de acesso e empresas ativas na plataforma" />
      <EmpresasPainel pedidos={pedidos ?? []} tenants={tenantsComContagens} />
    </>
  );
}
