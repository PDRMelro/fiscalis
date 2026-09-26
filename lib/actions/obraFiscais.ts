"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResultadoObraFiscais = { error: string | null };

export async function atualizarFiscaisObra(
  obraId: string,
  _prev: ResultadoObraFiscais,
  formData: FormData
): Promise<ResultadoObraFiscais> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sem permissões." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Sem permissões." };

  const fiscalIds = formData.getAll("fiscalIds").map(String);

  const { error: deleteError } = await supabase.from("obra_fiscais").delete().eq("obra_id", obraId);
  if (deleteError) return { error: deleteError.message };

  if (fiscalIds.length > 0) {
    const { error: insertError } = await supabase
      .from("obra_fiscais")
      .insert(fiscalIds.map((fiscalId) => ({ obra_id: obraId, fiscal_id: fiscalId })));
    if (insertError) return { error: insertError.message };
  }

  revalidatePath(`/obras/${obraId}`);
  return { error: null };
}
