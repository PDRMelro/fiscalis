import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, context: RouteContext<"/api/relatorios/[id]/download">) {
  const { id } = await context.params;
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const supabase = await createClient();

  const { data: rel } = await supabase.from("relatorios").select("storage_path, codigo").eq("id", id).single();
  if (!rel || !rel.storage_path) return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("relatorios")
    .createSignedUrl(rel.storage_path, 60, preview ? undefined : { download: `${rel.codigo ?? "relatorio"}.pdf` });

  if (error || !data) return NextResponse.json({ error: "Sem acesso a este ficheiro." }, { status: 403 });

  return NextResponse.redirect(data.signedUrl);
}
