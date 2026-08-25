import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request, context: RouteContext<"/api/propostas/[id]/download">) {
  const { id } = await context.params;
  const preview = new URL(request.url).searchParams.get("preview") === "1";
  const supabase = await createClient();

  const { data: proposta } = await supabase.from("propostas").select("pdf_path, codigo").eq("id", id).single();
  if (!proposta || !proposta.pdf_path) return NextResponse.json({ error: "PDF não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("propostas")
    .createSignedUrl(proposta.pdf_path, 60, preview ? undefined : { download: `Proposta_${proposta.codigo ?? "proposta"}.pdf` });

  if (error || !data) return NextResponse.json({ error: "Sem acesso a este ficheiro." }, { status: 403 });

  return NextResponse.redirect(data.signedUrl);
}
