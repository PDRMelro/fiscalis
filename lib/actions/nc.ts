"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfAutoNaoConformidade } from "@/lib/pdf/autoNaoConformidade";
import { copiarParaDocumentosEnviados } from "@/lib/actions/documentos";
import type { EstadoNC, Severidade } from "@/lib/supabase/types";

export type ResultadoAcao = { error: string | null };
export type ResultadoCriarNC = { ncId: string | null; error: string | null };
export type FotoComUrl = { id: string; nome: string; url: string | null };

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
        visita_id: str(formData, "visita_id") || null,
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

    const visitaId = str(formData, "visita_id");
    revalidatePath("/nc");
    revalidatePath("/dashboard");
    revalidatePath("/visitas");
    revalidatePath("/calendario");
    if (visitaId) revalidatePath(`/visitas/${visitaId}/completar`);
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
    await invalidarPdfNC(supabase, ncId);
    revalidatePath("/nc");
    return { error: null };
  } catch (err) {
    console.error("registarFotoNC falhou", err);
    return { error: "Não foi possível guardar a foto." };
  }
}

/**
 * Usado pelo modal de detalhe da NC (admin e portal do cliente) para
 * mostrar as fotos sem as carregar todas à partida. A RLS já limita o que
 * cada sessão consegue ler.
 */
export async function listarFotosNC(ncId: string): Promise<{ fotos: FotoComUrl[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: fotos, error } = await supabase
      .from("nc_fotos")
      .select("*")
      .eq("nc_id", ncId)
      .order("created_at", { ascending: true });
    if (error) return { fotos: [], error: error.message };

    const fotosComUrl = await Promise.all(
      (fotos ?? []).map(async (f) => {
        const { data } = await supabase.storage.from("nc-anexos").createSignedUrl(f.storage_path, 3600);
        return { id: f.id, nome: f.nome_ficheiro, url: data?.signedUrl ?? null };
      })
    );
    return { fotos: fotosComUrl, error: null };
  } catch (err) {
    console.error("listarFotosNC falhou", err);
    return { fotos: [], error: "Não foi possível carregar as fotos." };
  }
}

export async function eliminarFotoNC(ncId: string, fotoId: string): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const { data: foto } = await supabase.from("nc_fotos").select("storage_path").eq("id", fotoId).single();
    if (foto) await supabase.storage.from("nc-anexos").remove([foto.storage_path]);

    const { error } = await supabase.from("nc_fotos").delete().eq("id", fotoId);
    if (error) return { error: error.message };

    await invalidarPdfNC(supabase, ncId);
    revalidatePath(`/nc/${ncId}/editar`);
    revalidatePath("/nc");
    return { error: null };
  } catch (err) {
    console.error("eliminarFotoNC falhou", err);
    return { error: "Não foi possível remover a foto." };
  }
}

/** O PDF gerado deixa de corresponder ao conteúdo assim que a NC ou as suas fotos mudam. */
async function invalidarPdfNC(supabase: Awaited<ReturnType<typeof createClient>>, ncId: string) {
  const { data: nc } = await supabase.from("nao_conformidades").select("pdf_path").eq("id", ncId).single();
  if (!nc?.pdf_path) return;
  await supabase.storage.from("nc-anexos").remove([nc.pdf_path]);
  await supabase.from("nao_conformidades").update({ pdf_path: null }).eq("id", ncId);
}

export async function editarNC(ncId: string, formData: FormData): Promise<ResultadoAcao> {
  try {
    const obraId = str(formData, "obra_id");
    const descricao = str(formData, "descricao");
    if (!obraId || !descricao) return { error: "Escolhe a obra e descreve a não conformidade." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("nao_conformidades")
      .update({
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
      .eq("id", ncId);
    if (error) return { error: error.message };

    await invalidarPdfNC(supabase, ncId);

    revalidatePath("/nc");
    revalidatePath(`/nc/${ncId}/editar`);
    revalidatePath("/dashboard");
    return { error: null };
  } catch (err) {
    console.error("editarNC falhou", err);
    return { error: "Não foi possível guardar as alterações. Tenta outra vez." };
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

export async function gerarPdfAutoNC(ncId: string, enviarCliente: boolean): Promise<ResultadoAcao> {
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

    if (enviarCliente) {
      const user = await getUserSafe(supabase);
      const resultado = await copiarParaDocumentosEnviados(supabase, {
        obraId: nc.obra_id,
        categoria: "Não conformidades",
        nomeFicheiro: `Auto_${nc.codigo}.pdf`,
        buffer,
        createdBy: user?.id ?? null,
      });
      if (resultado.error) return { error: resultado.error };
    }

    revalidatePath("/nc");
    return { error: null };
  } catch (err) {
    console.error("gerarPdfAutoNC falhou", err);
    return { error: "Não foi possível gerar o PDF agora. Tenta outra vez." };
  }
}
