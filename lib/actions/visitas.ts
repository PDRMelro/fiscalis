"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";

export async function criarVisita(formData: FormData) {
  const supabase = await createClient();

  const obraId = String(formData.get("obra_id") ?? "");
  const data = String(formData.get("data") ?? "");
  const notas = String(formData.get("notas") ?? "").trim();
  if (!obraId || !data) throw new Error("Escolhe a obra e a data da visita.");

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
  if (error) throw new Error(error.message);

  const fotos = formData.getAll("fotos") as File[];
  for (const foto of fotos) {
    if (!foto || foto.size === 0) continue;
    const path = `${obraId}/${visita.id}/${crypto.randomUUID()}-${foto.name}`;
    const { error: uploadError } = await supabase.storage
      .from("visita-fotos")
      .upload(path, foto, { contentType: foto.type || undefined });
    if (uploadError) continue;
    await supabase.from("visita_fotos").insert({
      visita_id: visita.id,
      storage_path: path,
      nome_ficheiro: foto.name,
    });
  }

  revalidatePath("/visitas");
  revalidatePath("/calendario");
  revalidatePath(`/obras/${obraId}`);
  redirect("/visitas");
}
