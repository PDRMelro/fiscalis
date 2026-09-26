import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMeuTenantId } from "@/lib/tenant";

export async function GET() {
  const supabase = await createClient();
  const tenantId = await getMeuTenantId(supabase);
  if (!tenantId) return NextResponse.json({ error: "Sem sessão." }, { status: 401 });

  const { data: perfil } = await supabase
    .from("perfil_fiscal")
    .select("seguro_rc_path, seguro_rc_nome_ficheiro")
    .eq("tenant_id", tenantId)
    .single();
  if (!perfil?.seguro_rc_path) return NextResponse.json({ error: "Ficheiro não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("perfil-fiscal")
    .createSignedUrl(perfil.seguro_rc_path, 60, { download: perfil.seguro_rc_nome_ficheiro ?? "seguro-rc.pdf" });

  if (error || !data) return NextResponse.json({ error: "Sem acesso a este ficheiro." }, { status: 403 });

  return NextResponse.redirect(data.signedUrl);
}
