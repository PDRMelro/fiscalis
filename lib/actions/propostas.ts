"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfPropostaServico } from "@/lib/pdf/propostaServico";
import { obterLogoEmpresaUrl } from "@/lib/tenantLogo";
import { copiarParaDocumentosEnviados } from "@/lib/actions/documentos";
import type {
  EstadoProposta,
  FrequenciaVisitas,
  ModalidadeVisitas,
  PropostaRow,
  TipoClienteProposta,
  TipoServicoProposta,
} from "@/lib/supabase/types";

export type ResultadoAcao = { error: string | null };

function numeroOuNull(formData: FormData, campo: string) {
  const raw = String(formData.get(campo) ?? "");
  return raw ? Number(raw) : null;
}

function textoOuNull(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim() || null;
}

/**
 * Lê os campos comuns ao criar e ao editar uma proposta. Os campos que não
 * se aplicam ao tipo escolhido (ex.: alvará num particular, periodicidade
 * num pack) não vêm no formulário e ficam a null.
 */
function lerCamposProposta(formData: FormData) {
  const tipo_servico = String(formData.get("tipo_servico") ?? "fiscalizacao") as TipoServicoProposta;
  const cliente_tipo = String(formData.get("cliente_tipo") ?? "particular") as TipoClienteProposta;
  const modalidade_visitas = String(formData.get("modalidade_visitas") ?? "periodica") as ModalidadeVisitas;

  return {
    cliente_nome: String(formData.get("cliente_nome") ?? "").trim(),
    cliente_tipo,
    cliente_nif: textoOuNull(formData, "cliente_nif"),
    cliente_alvara: cliente_tipo === "empresa" ? textoOuNull(formData, "cliente_alvara") : null,
    cliente_morada_fiscal: textoOuNull(formData, "cliente_morada_fiscal"),
    local: String(formData.get("local") ?? "").trim(),
    tipo_obra: String(formData.get("tipo_obra") ?? "").trim(),
    enviada_em: String(formData.get("enviada_em") ?? "") || undefined,
    obra_id: String(formData.get("obra_id") ?? "") || null,
    tipo_servico,
    modalidade_visitas,
    frequencia_visitas: (String(formData.get("frequencia_visitas") ?? "") || null) as FrequenciaVisitas | null,
    valor_anual: numeroOuNull(formData, "valor_anual"),
    pack_num_visitas: numeroOuNull(formData, "pack_num_visitas"),
    prazo_obra_meses: numeroOuNull(formData, "prazo_obra_meses"),
    valor_pack: numeroOuNull(formData, "valor_pack"),
    valor_visita_extra: numeroOuNull(formData, "valor_visita_extra"),
    valor_servico: numeroOuNull(formData, "valor_servico"),
    descricao_servico: textoOuNull(formData, "descricao_servico"),
  };
}

export async function criarProposta(formData: FormData) {
  const supabase = await createClient();
  const campos = lerCamposProposta(formData);
  if (!campos.cliente_nome || !campos.local || !campos.tipo_obra) throw new Error("Preenche todos os campos.");

  const { error } = await supabase.from("propostas").insert(campos);
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

    const campos = lerCamposProposta(formData);
    if (!campos.cliente_nome || !campos.local || !campos.tipo_obra) {
      return { error: "Preenche cliente, local e tipo de obra." };
    }

    const { error } = await supabase.from("propostas").update(campos).eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/propostas");
    revalidatePath(`/propostas/${id}/editar`);
    return { error: null };
  } catch (err) {
    console.error("atualizarProposta falhou", err);
    return { error: "Não foi possível guardar as alterações. Tenta outra vez." };
  }
}

function camposEmFaltaParaPdf(proposta: PropostaRow): string | null {
  if (proposta.tipo_servico === "consultoria") {
    return proposta.valor_servico === null ? "Preenche o valor do serviço antes de gerar o PDF." : null;
  }
  if (proposta.modalidade_visitas === "pack") {
    return !proposta.pack_num_visitas ||
      !proposta.prazo_obra_meses ||
      proposta.valor_pack === null ||
      proposta.valor_visita_extra === null
      ? "Preenche o n.º de visitas, o prazo da obra, o valor do pack e o valor da visita extra antes de gerar o PDF."
      : null;
  }
  return !proposta.frequencia_visitas || proposta.valor_anual === null || proposta.valor_visita_extra === null
    ? "Preenche a frequência de visitas e os valores antes de gerar o PDF."
    : null;
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

    const emFalta = camposEmFaltaParaPdf(proposta);
    if (emFalta) return { error: emFalta };
    if (enviarCliente && !proposta.obra_id) {
      return { error: "Associa esta proposta a uma obra para a poderes enviar ao cliente." };
    }

    const [{ data: perfil, error: perfilError }, logoEmpresaUrl] = await Promise.all([
      supabase.from("perfil_fiscal").select("*").eq("tenant_id", proposta.tenant_id).single(),
      obterLogoEmpresaUrl(supabase, proposta.tenant_id),
    ]);
    if (perfilError || !perfil) return { error: "Configura primeiro o teu perfil fiscal em Configurações." };

    const buffer = await gerarPdfPropostaServico(proposta, perfil, logoEmpresaUrl);
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
