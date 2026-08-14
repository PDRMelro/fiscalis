"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfTermoResponsabilidade } from "@/lib/pdf/termoResponsabilidade";

export type ResultadoAcao = { error: string | null };

// Nota: em produção o Next.js esconde a mensagem real de qualquer erro
// "atirado" (throw) por uma Server Action, por segurança — por isso estas
// ações devolvem sempre { error } em vez de lançar, e todo o corpo está
// dentro de um try/catch para nunca deixar escapar uma exceção não tratada
// (ex: o Supabase a limitar pedidos por instantes).

export async function uploadDocumentos(
  obraId: string,
  direcao: "recebido" | "enviado",
  categoria: string | null,
  formData: FormData
): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const ficheiros = formData.getAll("ficheiros").filter((f): f is File => f instanceof File && f.size > 0);
    if (ficheiros.length === 0) return { error: "Escolhe pelo menos um ficheiro." };

    const user = await getUserSafe(supabase);
    const erros: string[] = [];

    for (const ficheiro of ficheiros) {
      const path = `${obraId}/${crypto.randomUUID()}-${ficheiro.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
      if (uploadError) {
        erros.push(`${ficheiro.name}: ${uploadError.message}`);
        continue;
      }

      const { error } = await supabase.from("documentos").insert({
        obra_id: obraId,
        direcao,
        categoria,
        nome_ficheiro: ficheiro.name,
        storage_path: path,
        tamanho_bytes: ficheiro.size,
        created_by: user?.id ?? null,
      });
      if (error) erros.push(`${ficheiro.name}: ${error.message}`);
    }

    revalidatePath(`/obras/${obraId}`);
    revalidatePath("/documentos");

    return { error: erros.length > 0 ? erros.join(" · ") : null };
  } catch (err) {
    console.error("uploadDocumentos falhou", err);
    return { error: "Não foi possível enviar agora — o Supabase pode estar temporariamente indisponível. Tenta outra vez." };
  }
}

/**
 * Usado pelo Portal do Cliente — a obra vem sempre do perfil da conta com
 * sessão iniciada (nunca de um parâmetro), e o envio é sempre "recebido",
 * para o cliente nunca conseguir escrever fora da sua própria obra.
 */
export async function uploadDocumentoCliente(formData: FormData): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const user = await getUserSafe(supabase);
    if (!user) return { error: "A tua sessão expirou. Volta a entrar." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("obra_id, ativo, pode_ver_documentos")
      .eq("id", user.id)
      .single();

    if (!profile?.ativo || !profile.pode_ver_documentos || !profile.obra_id) {
      return { error: "Não tens permissão para enviar documentos. Contacta o teu engenheiro fiscal." };
    }

    const ficheiros = formData.getAll("ficheiros").filter((f): f is File => f instanceof File && f.size > 0);
    if (ficheiros.length === 0) return { error: "Escolhe pelo menos um ficheiro." };

    const erros: string[] = [];

    for (const ficheiro of ficheiros) {
      const path = `${profile.obra_id}/${crypto.randomUUID()}-${ficheiro.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
      if (uploadError) {
        erros.push(`${ficheiro.name}: ${uploadError.message}`);
        continue;
      }

      const { error } = await supabase.from("documentos").insert({
        obra_id: profile.obra_id,
        direcao: "recebido",
        categoria: null,
        nome_ficheiro: ficheiro.name,
        storage_path: path,
        tamanho_bytes: ficheiro.size,
        created_by: user.id,
      });
      if (error) erros.push(`${ficheiro.name}: ${error.message}`);
    }

    revalidatePath("/portal");
    revalidatePath(`/obras/${profile.obra_id}`);
    revalidatePath("/documentos");

    return { error: erros.length > 0 ? erros.join(" · ") : null };
  } catch (err) {
    console.error("uploadDocumentoCliente falhou", err);
    return { error: "Não foi possível enviar agora. Tenta outra vez." };
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
