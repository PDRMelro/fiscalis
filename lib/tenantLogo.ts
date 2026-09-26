import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/** Link temporário para o logótipo da empresa (tenant), para inserir nos
 * PDFs gerados ao lado do símbolo da Fiscalis. null se a empresa não tiver
 * logótipo próprio configurado. */
export async function obterLogoEmpresaUrl(
  supabase: SupabaseClient<Database>,
  tenantId: string | null
): Promise<string | null> {
  if (!tenantId) return null;

  const { data: tenant } = await supabase.from("tenants").select("logo_path").eq("id", tenantId).maybeSingle();
  if (!tenant?.logo_path) return null;

  const { data } = await supabase.storage.from("tenant-branding").createSignedUrl(tenant.logo_path, 300);
  return data?.signedUrl ?? null;
}
