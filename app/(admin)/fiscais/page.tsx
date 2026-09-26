import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMeuTenantId } from "@/lib/tenant";
import { PageHeader } from "@/components/ui/PageHeader";
import { FiscaisPainel } from "@/components/fiscais/FiscaisPainel";

export default async function FiscaisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const tenantId = await getMeuTenantId(supabase);
  if (!tenantId) redirect("/login");

  const { data: fiscais } = await supabase
    .from("profiles")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("role", "fiscal")
    .order("created_at", { ascending: true });

  return (
    <>
      <PageHeader title="Fiscais" subtitle="Contas de acesso para quem faz a fiscalização das tuas obras" />
      <FiscaisPainel fiscais={fiscais ?? []} />
    </>
  );
}
