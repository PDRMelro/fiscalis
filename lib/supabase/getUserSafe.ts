import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * supabase.auth.getUser() pode lançar uma exceção (não só devolver um
 * {error}) quando o Supabase está lento, a limitar pedidos, ou indisponível
 * por instantes — e em produção o Next.js esconde essa exceção e mostra só
 * um ecrã de erro genérico. Todas as chamadas devem passar por aqui, que
 * trata isso como "sem sessão" em vez de rebentar a página.
 */
export async function getUserSafe(supabase: SupabaseClient<Database>): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
