"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { gerarPdfRelatorioVisita } from "@/lib/pdf/relatorioVisita";
import { copiarParaDocumentosEnviados, type ResultadoAcao } from "@/lib/actions/documentos";

export async function gerarRelatorio(visitaId: string, enviarCliente: boolean): Promise<ResultadoAcao> {
  try {
    const supabase = await createClient();

    const { data: visita, error: visitaError } = await supabase
      .from("visitas")
      .select("*, obras(*)")
      .eq("id", visitaId)
      .single();
    if (visitaError || !visita) return { error: "Visita não encontrada." };

    const obra = visita.obras as unknown as import("@/lib/supabase/types").ObraRow;

    const [{ data: ncs }, { count: numFotos }] = await Promise.all([
      supabase.from("nao_conformidades").select("*").eq("visita_id", visitaId),
      supabase.from("visita_fotos").select("*", { count: "exact", head: true }).eq("visita_id", visitaId),
    ]);

    const user = await getUserSafe(supabase);

    // Se já existir um relatório para esta visita, atualiza-o (mantém o
    // mesmo código/ficheiro) em vez de criar um duplicado — é assim que
    // "editar a visita e gerar novo PDF" deve funcionar.
    const { data: existente } = await supabase
      .from("relatorios")
      .select("id, codigo")
      .eq("visita_id", visitaId)
      .maybeSingle();

    let relatorio: { id: string; codigo: string | null };
    if (existente) {
      const { data: atualizado, error: erroAtualizar } = await supabase
        .from("relatorios")
        .update({ data: visita.data })
        .eq("id", existente.id)
        .select("id, codigo")
        .single();
      if (erroAtualizar || !atualizado) return { error: erroAtualizar?.message ?? "Não foi possível atualizar o relatório." };
      relatorio = atualizado;
    } else {
      const { data: novo, error } = await supabase
        .from("relatorios")
        .insert({ obra_id: obra.id, visita_id: visitaId, data: visita.data, created_by: user?.id ?? null })
        .select("id, codigo")
        .single();
      if (error || !novo) return { error: error?.message ?? "Não foi possível criar o relatório." };
      relatorio = novo;
    }

    const buffer = await gerarPdfRelatorioVisita(relatorio.codigo ?? relatorio.id, obra, visita, ncs ?? [], numFotos ?? 0);
    const path = `${obra.id}/${relatorio.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("relatorios")
      .upload(path, buffer, { contentType: "application/pdf", upsert: true });
    if (uploadError) return { error: uploadError.message };

    await supabase.from("relatorios").update({ storage_path: path }).eq("id", relatorio.id);

    if (enviarCliente) {
      const resultado = await copiarParaDocumentosEnviados(supabase, {
        obraId: obra.id,
        categoria: "Relatórios",
        nomeFicheiro: `Relatorio_${relatorio.codigo ?? relatorio.id}.pdf`,
        buffer,
        createdBy: user?.id ?? null,
      });
      if (resultado.error) return { error: resultado.error };
    }

    revalidatePath("/relatorios");
    revalidatePath("/visitas");
    revalidatePath(`/obras/${obra.id}`);
    return { error: null };
  } catch (err) {
    console.error("gerarRelatorio falhou", err);
    return { error: "Não foi possível gerar o relatório agora. Tenta outra vez." };
  }
}

export async function eliminarRelatorio(id: string) {
  const supabase = await createClient();
  const { data: rel } = await supabase.from("relatorios").select("storage_path").eq("id", id).single();
  if (rel?.storage_path) await supabase.storage.from("relatorios").remove([rel.storage_path]);
  const { error } = await supabase.from("relatorios").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/relatorios");
}
