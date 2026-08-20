import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, context: RouteContext<"/api/nc/[id]/download">) {
  const { id } = await context.params;
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const supabase = await createClient();

  const { data: nc } = await supabase.from("nao_conformidades").select("pdf_path, codigo").eq("id", id).single();
  if (!nc || !nc.pdf_path) return NextResponse.json({ error: "PDF não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("nc-anexos")
    .createSignedUrl(nc.pdf_path, 60, preview ? undefined : { download: `Auto_${nc.codigo ?? "nc"}.pdf` });

  if (error || !data) return NextResponse.json({ error: "Sem acesso a este ficheiro." }, { status: 403 });

  return NextResponse.redirect(data.signedUrl);
}
