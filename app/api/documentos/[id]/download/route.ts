import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: Request, context: RouteContext<"/api/documentos/[id]/download">) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: doc } = await supabase.from("documentos").select("storage_path, nome_ficheiro").eq("id", id).single();
  if (!doc) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(doc.storage_path, 60, { download: doc.nome_ficheiro });

  if (error || !data) return NextResponse.json({ error: "Sem acesso a este ficheiro." }, { status: 403 });

  return NextResponse.redirect(data.signedUrl);
}
