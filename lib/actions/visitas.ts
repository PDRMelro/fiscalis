"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";

export type ResultadoCriarVisita = { visitaId: string | null; error: string | null };
export type ResultadoAcao = { error: string | null };
export type FotoComUrl = { id: string; nome: string; url: string | null };
export type DetalheVisita = {
  data: string;
  hora: string | null;
  notas: string | null;
  estado: string;
  fotos: FotoComUrl[];
};

export async function criarVisita(obraId: string, data: string, notas: string): Promise<ResultadoCriarVisita> {
  try {
    if (!obraId || !data) return { visitaId: null, error: "Escolhe a obra e a data da visita." };

    const supabase = await createClient();
    const user = await getUserSafe(supabase);

    const { data: visita, error } = await supabase
      .from("visitas")
      .insert({
        obra_id: obraId,
        data,
        notas: notas || null,
        especialidades: notas || null,
        estado: "Realizada",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !visita) return { visitaId: null, error: error?.message ?? "Não foi possível criar a visita." };

    revalidatePath("/visitas");
    revalidatePath("/calendario");
    revalidatePath("/dashboard");
    revalidatePath(`/obras/${obraId}`);

    return { visitaId: visita.id, error: null };
  } catch (err) {
    console.error("criarVisita falhou", err);
    return { visitaId: null, error: "Não foi possível criar a visita agora. Tenta outra vez." };
  }
}

export async function agendarVisita(
  obraId: string,
  data: string,
  hora: string,
  notas: string
): Promise<ResultadoCriarVisita> {
  try {
    if (!obraId || !data) return { visitaId: null, error: "Escolhe a obra e a data da visita." };

    const supabase = await createClient();
    const user = await getUserSafe(supabase);

    const { data: visita, error } = await supabase
      .from("visitas")
      .insert({
        obra_id: obraId,
        data,
        hora: hora || null,
        notas: notas || null,
        estado: "Agendada",
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !visita) return { visitaId: null, error: error?.message ?? "Não foi possível agendar a visita." };

    revalidatePath("/visitas");
    revalidatePath("/calendario");
    revalidatePath("/dashboard");
    revalidatePath(`/obras/${obraId}`);

    return { visitaId: visita.id, error: null };
  } catch (err) {
    console.error("agendarVisita falhou", err);
    return { visitaId: null, error: "Não foi possível agendar a visita agora. Tenta outra vez." };
  }
}

export async function completarVisita(
  visitaId: string,
  obraId: string,
  data: string,
  notas: string
): Promise<ResultadoAcao> {
  try {
    if (!data) return { error: "Confirma a data da visita." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("visitas")
      .update({ data, notas: notas || null, especialidades: notas || null, estado: "Realizada" })
      .eq("id", visitaId);
    if (error) return { error: error.message };

    revalidatePath("/visitas");
    revalidatePath("/calendario");
    revalidatePath("/dashboard");
    revalidatePath(`/obras/${obraId}`);

    return { error: null };
  } catch (err) {
    console.error("completarVisita falhou", err);
    return { error: "Não foi possível completar a visita agora. Tenta outra vez." };
  }
}

export async function cancelarVisitaAgendada(obraId: string, visitaId: string) {
  try {
    const supabase = await createClient();
    await supabase.from("visitas").delete().eq("id", visitaId).eq("estado", "Agendada");
  } catch (err) {
    console.error("cancelarVisitaAgendada falhou", err);
  }
  revalidatePath("/visitas");
  revalidatePath("/calendario");
  revalidatePath("/dashboard");
  revalidatePath(`/obras/${obraId}`);
}

/**
 * O ficheiro em si vai diretamente do browser para o Supabase Storage (o
 * Vercel rejeita pedidos a Server Actions acima de ~4.5MB, insuficiente
 * para fotos de obra) — isto só grava os metadados depois de já enviado.
 */
export async function registarFotoVisita(
  visitaId: string,
  obraId: string,
  foto: { nome: string; path: string }
): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("visita_fotos").insert({
      visita_id: visitaId,
      storage_path: foto.path,
      nome_ficheiro: foto.nome,
    });
    if (error) return { error: error.message };

    revalidatePath("/visitas");
    revalidatePath(`/obras/${obraId}`);
    return { error: null };
  } catch (err) {
    console.error("registarFotoVisita falhou", err);
    return { error: "Não foi possível guardar a foto." };
  }
}

/**
 * Usado pelo calendário (admin e portal do cliente) para mostrar notas e
 * fotos de uma visita ao clicar nela, sem ter de carregar tudo à partida.
 * A RLS já limita o que cada sessão consegue ler.
 */
export async function obterDetalheVisita(visitaId: string): Promise<{ detalhe: DetalheVisita | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: visita, error } = await supabase.from("visitas").select("*").eq("id", visitaId).single();
    if (error || !visita) return { detalhe: null, error: "Visita não encontrada." };

    const { data: fotos } = await supabase
      .from("visita_fotos")
      .select("*")
      .eq("visita_id", visitaId)
      .order("created_at", { ascending: true });

    const fotosComUrl = await Promise.all(
      (fotos ?? []).map(async (f) => {
        const { data } = await supabase.storage.from("visita-fotos").createSignedUrl(f.storage_path, 3600);
        return { id: f.id, nome: f.nome_ficheiro, url: data?.signedUrl ?? null };
      })
    );

    return {
      detalhe: { data: visita.data, hora: visita.hora, notas: visita.notas, estado: visita.estado, fotos: fotosComUrl },
      error: null,
    };
  } catch (err) {
    console.error("obterDetalheVisita falhou", err);
    return { detalhe: null, error: "Não foi possível carregar os detalhes da visita." };
  }
}
