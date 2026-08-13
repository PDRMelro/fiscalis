"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfRelatorioVisita } from "@/lib/pdf/relatorioVisita";

export async function gerarRelatorio(visitaId: string) {
  const supabase = await createClient();

  const { data: visita, error: visitaError } = await supabase
    .from("visitas")
    .select("*, obras(*)")
    .eq("id", visitaId)
    .single();
  if (visitaError || !visita) throw new Error("Visita não encontrada.");

  const obra = visita.obras as unknown as import("@/lib/supabase/types").ObraRow;

  const [{ data: ncs }, { count: numFotos }] = await Promise.all([
    supabase.from("nao_conformidades").select("*").eq("visita_id", visitaId),
    supabase.from("visita_fotos").select("*", { count: "exact", head: true }).eq("visita_id", visitaId),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: relatorio, error } = await supabase
    .from("relatorios")
    .insert({ obra_id: obra.id, visita_id: visitaId, data: visita.data, created_by: user?.id ?? null })
    .select("*")
    .single();
  if (error || !relatorio) throw new Error(error?.message ?? "Não foi possível criar o relatório.");

  const buffer = await gerarPdfRelatorioVisita(relatorio.codigo ?? relatorio.id, obra, visita, ncs ?? [], numFotos ?? 0);
  const path = `${obra.id}/${relatorio.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("relatorios")
    .upload(path, buffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  await supabase.from("relatorios").update({ storage_path: path }).eq("id", relatorio.id);

  revalidatePath("/relatorios");
  revalidatePath("/visitas");
  revalidatePath(`/obras/${obra.id}`);
}

export async function eliminarRelatorio(id: string) {
  const supabase = await createClient();
  const { data: rel } = await supabase.from("relatorios").select("storage_path").eq("id", id).single();
  if (rel?.storage_path) await supabase.storage.from("relatorios").remove([rel.storage_path]);
  const { error } = await supabase.from("relatorios").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/relatorios");
}
