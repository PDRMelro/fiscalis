"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarFiscaisObra(obraId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem permissões.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Sem permissões.");

  const fiscalIds = formData.getAll("fiscalIds").map(String);

  const { error: deleteError } = await supabase.from("obra_fiscais").delete().eq("obra_id", obraId);
  if (deleteError) throw new Error(deleteError.message);

  if (fiscalIds.length > 0) {
    const { error: insertError } = await supabase
      .from("obra_fiscais")
      .insert(fiscalIds.map((fiscalId) => ({ obra_id: obraId, fiscal_id: fiscalId })));
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/obras/${obraId}`);
}
