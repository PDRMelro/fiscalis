"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";

export type ResultadoAcao = { error: string | null };

export async function enviarMensagem(
  destinatarioId: string,
  _prev: ResultadoAcao,
  formData: FormData
): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return { error: "A tua sessão expirou. Volta a entrar." };

  const corpo = String(formData.get("corpo") ?? "").trim();
  if (!corpo) return { error: "Escreve uma mensagem." };

  const { error } = await supabase.from("mensagens").insert({
    remetente_id: user.id,
    destinatario_id: destinatarioId,
    corpo,
  });
  if (error) return { error: "Não foi possível enviar. Tenta outra vez." };

  revalidatePath(`/mensagens/${destinatarioId}`);
  revalidatePath("/", "layout");
  return { error: null };
}

// Chamada a partir do cliente (useEffect em ConversaMensagens), não durante
// a renderização da página — revalidatePath só é permitido dentro de uma
// Server Action invocada assim, nunca a meio do carregamento normal de uma
// página (foi exatamente isso que rebentava a conversa antes).
export async function marcarConversaComoLida(outroId: string) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return;

  const { error } = await supabase
    .from("mensagens")
    .update({ lida: true })
    .eq("destinatario_id", user.id)
    .eq("remetente_id", outroId)
    .eq("lida", false);
  if (error) return;

  revalidatePath("/", "layout");
}

export async function eliminarConversa(outroId: string): Promise<ResultadoAcao> {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return { error: "Sem permissões." };

  const { error } = await supabase
    .from("mensagens")
    .delete()
    .or(
      `and(remetente_id.eq.${user.id},destinatario_id.eq.${outroId}),and(remetente_id.eq.${outroId},destinatario_id.eq.${user.id})`
    );
  if (error) {
    console.error("eliminarConversa falhou", error);
    return { error: error.message };
  }

  revalidatePath("/mensagens");
  return { error: null };
}
