"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfAutoNaoConformidade } from "@/lib/pdf/autoNaoConformidade";
import type { EstadoNC, Severidade } from "@/lib/supabase/types";

export type ResultadoAcao = { error: string | null };
export type ResultadoCriarNC = { ncId: string | null; error: string | null };

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function criarNC(formData: FormData): Promise<ResultadoCriarNC> {
  try {
    const obraId = str(formData, "obra_id");
    const descricao = str(formData, "descricao");
    if (!obraId || !descricao) return { ncId: null, error: "Escolhe a obra e descreve a não conformidade." };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("nao_conformidades")
      .insert({
        obra_id: obraId,
        data_deteccao: str(formData, "data_deteccao") || new Date().toISOString().slice(0, 10),
        local_zona: str(formData, "local_zona") || null,
        especialidade: str(formData, "especialidade") || null,
        descricao,
        requisito_incumprido: str(formData, "requisito_incumprido") || null,
        acao_corretiva: str(formData, "acao_corretiva") || null,
        severidade: (str(formData, "severidade") || "Média") as Severidade,
        responsavel: str(formData, "responsavel") || null,
        prazo: str(formData, "prazo") || null,
      })
      .select("id")
      .single();

    if (error || !data) return { ncId: null, error: error?.message ?? "Não foi possível criar a não conformidade." };

    revalidatePath("/nc");
    revalidatePath("/dashboard");
    return { ncId: data.id, error: null };
  } catch (err) {
    console.error("criarNC falhou", err);
    return { ncId: null, error: "Não foi possível criar a não conformidade agora. Tenta outra vez." };
  }
}

export async function registarFotoNC(
  ncId: string,
  foto: { nome: string; path: string }
): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("nc_fotos").insert({
      nc_id: ncId,
      storage_path: foto.path,
      nome_ficheiro: foto.nome,
    });
    if (error) return { error: error.message };
    revalidatePath("/nc");
    return { error: null };
  } catch (err) {
    console.error("registarFotoNC falhou", err);
    return { error: "Não foi possível guardar a foto." };
  }
}

export async function atualizarEstadoNC(id: string, estado: EstadoNC) {
  const supabase = await createClient();
  const { error } = await supabase.from("nao_conformidades").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nc");
  revalidatePath("/dashboard");
}

export async function eliminarNC(id: string) {
  try {
    const supabase = await createClient();
    const { data: fotos } = await supabase.from("nc_fotos").select("storage_path").eq("nc_id", id);
    const { data: nc } = await supabase.from("nao_conformidades").select("pdf_path").eq("id", id).single();

    const caminhos = [...(fotos ?? []).map((f) => f.storage_path), ...(nc?.pdf_path ? [nc.pdf_path] : [])];
    if (caminhos.length > 0) await supabase.storage.from("nc-anexos").remove(caminhos);

    await supabase.from("nao_conformidades").delete().eq("id", id);
  } catch (err) {
    console.error("eliminarNC falhou", err);
  }
  revalidatePath("/nc");
  revalidatePath("/dashboard");
}

export async function gerarPdfAutoNC(ncId: string): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();

    const { data: nc, error: ncError } = await supabase.from("nao_conformidades").select("*").eq("id", ncId).single();
    if (ncError || !nc) return { error: "Não conformidade não encontrada." };

    const [{ data: obra, error: obraError }, { data: perfil, error: perfilError }, { data: fotosRows }] =
      await Promise.all([
        supabase.from("obras").select("*").eq("id", nc.obra_id).single(),
        supabase.from("perfil_fiscal").select("*").eq("id", true).single(),
        supabase.from("nc_fotos").select("*").eq("nc_id", ncId),
      ]);
    if (obraError || !obra) return { error: "Obra não encontrada." };
    if (perfilError || !perfil) return { error: "Configura primeiro o teu perfil fiscal em Configurações." };

    const fotosBase64: string[] = [];
    for (const foto of fotosRows ?? []) {
      const { data: blob } = await supabase.storage.from("nc-anexos").download(foto.storage_path);
      if (!blob) continue;
      const buffer = Buffer.from(await blob.arrayBuffer());
      const tipo = blob.type || "image/jpeg";
      fotosBase64.push(`data:${tipo};base64,${buffer.toString("base64")}`);
    }

    const buffer = await gerarPdfAutoNaoConformidade(nc, obra, perfil, fotosBase64);
    const path = `${nc.obra_id}/${ncId}/Auto_${nc.codigo}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("nc-anexos")
      .upload(path, buffer, { contentType: "application/pdf", upsert: true });
    if (uploadError) return { error: uploadError.message };

    const { error: updateError } = await supabase.from("nao_conformidades").update({ pdf_path: path }).eq("id", ncId);
    if (updateError) return { error: updateError.message };

    revalidatePath("/nc");
    return { error: null };
  } catch (err) {
    console.error("gerarPdfAutoNC falhou", err);
    return { error: "Não foi possível gerar o PDF agora. Tenta outra vez." };
  }
}
