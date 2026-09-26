import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/** Logótipo da empresa (tenant) como data URI, pronto a embutir num PDF ao
 * lado do símbolo da Fiscalis — descarrega o ficheiro em vez de gerar um
 * link, para não depender do gerador de PDF conseguir ir buscar uma URL
 * remota (o resto das imagens dos PDFs já é sempre embutido assim). null
 * se a empresa não tiver logótipo próprio configurado. */
export async function obterLogoEmpresaUrl(
  supabase: SupabaseClient<Database>,
  tenantId: string | null
): Promise<string | null> {
  if (!tenantId) return null;

  const { data: tenant } = await supabase.from("tenants").select("logo_path").eq("id", tenantId).maybeSingle();
  if (!tenant?.logo_path) return null;

  const { data: blob } = await supabase.storage.from("tenant-branding").download(tenant.logo_path);
  if (!blob) return null;

  const buffer = Buffer.from(await blob.arrayBuffer());
  const tipo = blob.type || "image/png";
  return `data:${tipo};base64,${buffer.toString("base64")}`;
}
