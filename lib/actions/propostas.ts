"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfPropostaServico } from "@/lib/pdf/propostaServico";
import { copiarParaDocumentosEnviados } from "@/lib/actions/documentos";
import type { EstadoProposta, FrequenciaVisitas } from "@/lib/supabase/types";

export type ResultadoAcao = { error: string | null };

export async function criarProposta(formData: FormData) {
  const supabase = await createClient();
  const cliente_nome = String(formData.get("cliente_nome") ?? "").trim();
  const local = String(formData.get("local") ?? "").trim();
  const tipo_obra = String(formData.get("tipo_obra") ?? "").trim();
  if (!cliente_nome || !local || !tipo_obra) throw new Error("Preenche todos os campos.");

  const { error } = await supabase.from("propostas").insert({
    cliente_nome,
    local,
    tipo_obra,
    enviada_em: String(formData.get("enviada_em") ?? "") || undefined,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}

export async function atualizarEstadoProposta(id: string, estado: EstadoProposta) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}

export async function eliminarProposta(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("propostas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/propostas");
}

export async function atualizarProposta(id: string, formData: FormData): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();

    const cliente_nome = String(formData.get("cliente_nome") ?? "").trim();
    const local = String(formData.get("local") ?? "").trim();
    const tipo_obra = String(formData.get("tipo_obra") ?? "").trim();
    if (!cliente_nome || !local || !tipo_obra) return { error: "Preenche cliente, local e tipo de obra." };

    const obraIdRaw = String(formData.get("obra_id") ?? "");
    const frequenciaRaw = String(formData.get("frequencia_visitas") ?? "");
    const valorAnualRaw = String(formData.get("valor_anual") ?? "");
    const valorExtraRaw = String(formData.get("valor_visita_extra") ?? "");

    const { error } = await supabase
      .from("propostas")
      .update({
        cliente_nome,
        local,
        tipo_obra,
        enviada_em: String(formData.get("enviada_em") ?? "") || undefined,
        obra_id: obraIdRaw || null,
        frequencia_visitas: (frequenciaRaw || null) as FrequenciaVisitas | null,
        valor_anual: valorAnualRaw ? Number(valorAnualRaw) : null,
        valor_visita_extra: valorExtraRaw ? Number(valorExtraRaw) : null,
      })
      .eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/propostas");
    revalidatePath(`/propostas/${id}/editar`);
    return { error: null };
  } catch (err) {
    console.error("atualizarProposta falhou", err);
    return { error: "Não foi possível guardar as alterações. Tenta outra vez." };
  }
}

export async function gerarPdfProposta(propostaId: string, enviarCliente: boolean): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();

    const { data: proposta, error: propostaError } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", propostaId)
      .single();
    if (propostaError || !proposta) return { error: "Proposta não encontrada." };

    if (!proposta.frequencia_visitas || proposta.valor_anual === null || proposta.valor_visita_extra === null) {
      return { error: "Preenche a frequência de visitas e os valores antes de gerar o PDF." };
    }
    if (enviarCliente && !proposta.obra_id) {
      return { error: "Associa esta proposta a uma obra para a poderes enviar ao cliente." };
    }

    const { data: perfil, error: perfilError } = await supabase.from("perfil_fiscal").select("*").eq("id", true).single();
    if (perfilError || !perfil) return { error: "Configura primeiro o teu perfil fiscal em Configurações." };

    const buffer = await gerarPdfPropostaServico(proposta, perfil);
    const nomeFicheiro = `Proposta_${proposta.codigo ?? propostaId}.pdf`;
    const path = `${propostaId}/${nomeFicheiro}`;

    const { error: uploadError } = await supabase.storage
      .from("propostas")
      .upload(path, buffer, { contentType: "application/pdf", upsert: true });
    if (uploadError) return { error: uploadError.message };

    const { error: updateError } = await supabase.from("propostas").update({ pdf_path: path }).eq("id", propostaId);
    if (updateError) return { error: updateError.message };

    if (enviarCliente && proposta.obra_id) {
      const user = await getUserSafe(supabase);
      const resultado = await copiarParaDocumentosEnviados(supabase, {
        obraId: proposta.obra_id,
        categoria: "Outros documentos",
        nomeFicheiro,
        buffer,
        createdBy: user?.id ?? null,
      });
      if (resultado.error) return { error: resultado.error };
    }

    revalidatePath("/propostas");
    revalidatePath(`/propostas/${propostaId}/editar`);
    return { error: null };
  } catch (err) {
    console.error("gerarPdfProposta falhou", err);
    return { error: "Não foi possível gerar o PDF agora. Tenta outra vez." };
  }
}
