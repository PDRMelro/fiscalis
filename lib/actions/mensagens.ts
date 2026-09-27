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
  revalidatePath("/mensagens");
  return { error: null };
}

// Chamada diretamente durante o carregamento da página da conversa (não a
// partir de um formulário) — por isso não pode chamar revalidatePath aqui
// (só é permitido em Server Actions/Route Handlers despoletados por uma
// mutação); a lista de mensagens já fica atualizada sozinha da próxima vez
// que a página de Mensagens carregar.
export async function marcarConversaComoLida(outroId: string) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return;

  await supabase
    .from("mensagens")
    .update({ lida: true })
    .eq("destinatario_id", user.id)
    .eq("remetente_id", outroId)
    .eq("lida", false);
}
