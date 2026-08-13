"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adicionarItemChecklist(formData: FormData) {
  const supabase = await createClient();
  const especialidade = String(formData.get("especialidade") ?? "").trim();
  const item = String(formData.get("item") ?? "").trim();
  if (!item) return;

  const { error } = await supabase.from("checklist_config").insert({ especialidade, item });
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}

export async function eliminarItemChecklist(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_config").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracoes");
}
