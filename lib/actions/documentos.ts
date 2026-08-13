"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfTermoResponsabilidade } from "@/lib/pdf/termoResponsabilidade";

export async function uploadDocumento(
  obraId: string,
  direcao: "recebido" | "enviado",
  formData: FormData
) {
  const supabase = await createClient();
  const ficheiro = formData.get("ficheiro") as File | null;
  const categoria = String(formData.get("categoria") ?? "").trim() || null;
  if (!ficheiro || ficheiro.size === 0) throw new Error("Escolhe um ficheiro.");

  const path = `${obraId}/${crypto.randomUUID()}-${ficheiro.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("documentos").insert({
    obra_id: obraId,
    direcao,
    categoria,
    nome_ficheiro: ficheiro.name,
    storage_path: path,
    tamanho_bytes: ficheiro.size,
    created_by: user?.id ?? null,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/documentos");
}

export async function eliminarDocumento(obraId: string, documentoId: string) {
  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documentos")
    .select("storage_path")
    .eq("id", documentoId)
    .single();

  if (doc) await supabase.storage.from("documentos").remove([doc.storage_path]);
  const { error } = await supabase.from("documentos").delete().eq("id", documentoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/documentos");
}

export async function gerarTermoResponsabilidade(obraId: string) {
  const supabase = await createClient();

  const [{ data: obra, error: obraError }, { data: perfil, error: perfilError }] = await Promise.all([
    supabase.from("obras").select("*").eq("id", obraId).single(),
    supabase.from("perfil_fiscal").select("*").eq("id", true).single(),
  ]);
  if (obraError || !obra) throw new Error("Obra não encontrada.");
  if (perfilError || !perfil) throw new Error("Configura primeiro o teu perfil fiscal em Configurações.");

  const buffer = await gerarPdfTermoResponsabilidade(obra, perfil);
  const nome = `Termo_Responsabilidade_${obra.nome.replace(/\s+/g, "")}.pdf`;
  const path = `${obraId}/${crypto.randomUUID()}-${nome}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(path, buffer, { contentType: "application/pdf" });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("documentos").insert({
    obra_id: obraId,
    direcao: "enviado",
    tipo: "Termo de Responsabilidade",
    nome_ficheiro: nome,
    storage_path: path,
    tamanho_bytes: buffer.length,
    gerado_automaticamente: true,
    created_by: user?.id ?? null,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/documentos");
}
