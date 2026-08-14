"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";

export type ResultadoCriarVisita = { visitaId: string | null; error: string | null };
export type ResultadoAcao = { error: string | null };

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
        created_by: user?.id ?? null,
      })
      .select("id")
      .single();
    if (error || !visita) return { visitaId: null, error: error?.message ?? "Não foi possível criar a visita." };

    revalidatePath("/visitas");
    revalidatePath("/calendario");
    revalidatePath(`/obras/${obraId}`);

    return { visitaId: visita.id, error: null };
  } catch (err) {
    console.error("criarVisita falhou", err);
    return { visitaId: null, error: "Não foi possível criar a visita agora. Tenta outra vez." };
  }
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
