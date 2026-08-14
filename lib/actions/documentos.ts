"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfTermoResponsabilidade } from "@/lib/pdf/termoResponsabilidade";

export type ResultadoAcao = { error: string | null };

export type FicheiroEnviado = { nome: string; path: string; tamanho: number };

// Nota: em produção o Next.js esconde a mensagem real de qualquer erro
// "atirado" (throw) por uma Server Action, por segurança — por isso estas
// ações devolvem sempre { error } em vez de lançar, e todo o corpo está
// dentro de um try/catch para nunca deixar escapar uma exceção não tratada
// (ex: o Supabase a limitar pedidos por instantes).
//
// O ficheiro em si NUNCA passa por aqui — vai diretamente do browser para o
// Supabase Storage (o Vercel tem um limite rígido de ~4.5MB por pedido a uma
// Server Action, insuficiente para plantas/fotos). Estas ações só gravam os
// metadados (nome, caminho, tamanho) depois de o envio já ter terminado.

export async function registarDocumento(
  obraId: string,
  direcao: "recebido" | "enviado",
  categoria: string | null,
  ficheiro: FicheiroEnviado,
  orcamentoId: string | null = null
): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const user = await getUserSafe(supabase);

    const { error } = await supabase.from("documentos").insert({
      obra_id: obraId,
      orcamento_id: orcamentoId,
      direcao,
      categoria,
      nome_ficheiro: ficheiro.nome,
      storage_path: ficheiro.path,
      tamanho_bytes: ficheiro.tamanho,
      created_by: user?.id ?? null,
    });
    if (error) return { error: error.message };

    revalidatePath(`/obras/${obraId}`);
    revalidatePath("/documentos");
    return { error: null };
  } catch (err) {
    console.error("registarDocumento falhou", err);
    return { error: "Não foi possível guardar o documento. Tenta outra vez." };
  }
}

/**
 * Usado pelo Portal do Cliente — a obra vem sempre do perfil da conta com
 * sessão iniciada (nunca de um parâmetro), e o envio é sempre "recebido",
 * para o cliente nunca conseguir escrever fora da sua própria obra.
 */
export async function registarDocumentoCliente(
  categoria: string | null,
  ficheiro: FicheiroEnviado,
  orcamentoId: string | null = null
): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const user = await getUserSafe(supabase);
    if (!user) return { error: "A tua sessão expirou. Volta a entrar." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("obra_id, ativo, pode_ver_documentos, pode_ver_financeiro")
      .eq("id", user.id)
      .single();

    if (!profile?.ativo || !profile.pode_ver_documentos || !profile.obra_id) {
      return { error: "Não tens permissão para enviar documentos. Contacta o teu engenheiro fiscal." };
    }
    if (orcamentoId && !profile.pode_ver_financeiro) {
      return { error: "Não tens permissão para anexar documentos a orçamentos." };
    }

    const { error } = await supabase.from("documentos").insert({
      obra_id: profile.obra_id,
      orcamento_id: orcamentoId,
      direcao: "recebido",
      categoria,
      nome_ficheiro: ficheiro.nome,
      storage_path: ficheiro.path,
      tamanho_bytes: ficheiro.tamanho,
      created_by: user.id,
    });
    if (error) return { error: error.message };

    revalidatePath("/portal");
    revalidatePath(`/obras/${profile.obra_id}`);
    revalidatePath("/documentos");
    return { error: null };
  } catch (err) {
    console.error("registarDocumentoCliente falhou", err);
    return { error: "Não foi possível guardar o documento. Tenta outra vez." };
  }
}

export async function eliminarDocumento(obraId: string, documentoId: string) {
  try {
    const supabase = await createClient();
    const { data: doc } = await supabase
      .from("documentos")
      .select("storage_path")
      .eq("id", documentoId)
      .single();

    if (doc) await supabase.storage.from("documentos").remove([doc.storage_path]);
    await supabase.from("documentos").delete().eq("id", documentoId);
  } catch (err) {
    console.error("eliminarDocumento falhou", err);
  }

  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/documentos");
}

export async function gerarTermoResponsabilidade(obraId: string): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();

    const [{ data: obra, error: obraError }, { data: perfil, error: perfilError }] = await Promise.all([
      supabase.from("obras").select("*").eq("id", obraId).single(),
      supabase.from("perfil_fiscal").select("*").eq("id", true).single(),
    ]);
    if (obraError || !obra) return { error: "Obra não encontrada." };
    if (perfilError || !perfil) return { error: "Configura primeiro o teu perfil fiscal em Configurações." };

    const buffer = await gerarPdfTermoResponsabilidade(obra, perfil);
    const nome = `Termo_Responsabilidade_${obra.nome.replace(/\s+/g, "")}.pdf`;
    const path = `${obraId}/${crypto.randomUUID()}-${nome}`;

    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(path, buffer, { contentType: "application/pdf" });
    if (uploadError) return { error: uploadError.message };

    const user = await getUserSafe(supabase);

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
    if (error) return { error: error.message };

    revalidatePath(`/obras/${obraId}`);
    revalidatePath("/documentos");
    return { error: null };
  } catch (err) {
    console.error("gerarTermoResponsabilidade falhou", err);
    return { error: "Não foi possível gerar o documento agora. Tenta outra vez." };
  }
}
