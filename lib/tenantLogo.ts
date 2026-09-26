import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// @react-pdf/renderer só sabe desenhar PNG e JPEG — qualquer outro formato
// (webp, gif, svg, ...) fica sem aparecer no PDF, em silêncio.
function tipoImagemSuportado(caminho: string): string | null {
  const ext = caminho.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return null;
}

/** Logótipo da empresa (tenant) como data URI, pronto a embutir num PDF ao
 * lado do símbolo da Fiscalis — descarrega o ficheiro em vez de gerar um
 * link, para não depender do gerador de PDF conseguir ir buscar uma URL
 * remota (o resto das imagens dos PDFs já é sempre embutido assim). null
 * se a empresa não tiver logótipo próprio configurado, ou se o formato do
 * ficheiro não for suportado pelo gerador de PDF (só PNG/JPEG). */
export async function obterLogoEmpresaUrl(
  supabase: SupabaseClient<Database>,
  tenantId: string | null
): Promise<string | null> {
  if (!tenantId) return null;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("logo_path")
    .eq("id", tenantId)
    .maybeSingle();
  if (tenantError) console.error("obterLogoEmpresaUrl: falha ao ler tenant", tenantError);
  if (!tenant?.logo_path) return null;

  const tipo = tipoImagemSuportado(tenant.logo_path);
  if (!tipo) {
    console.error(
      `obterLogoEmpresaUrl: formato de imagem não suportado nos PDFs (só PNG/JPEG): ${tenant.logo_path}`
    );
    return null;
  }

  const { data: blob, error: downloadError } = await supabase.storage.from("tenant-branding").download(tenant.logo_path);
  if (downloadError) console.error("obterLogoEmpresaUrl: falha ao descarregar logótipo", downloadError);
  if (!blob) return null;

  const buffer = Buffer.from(await blob.arrayBuffer());
  return `data:${tipo};base64,${buffer.toString("base64")}`;
}
