import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Resolve o tenant_id do utilizador autenticado (admin ou cliente), a partir
 * do seu próprio profile. Devolve null se não houver sessão.
 */
export async function getMeuTenantId(supabase: SupabaseClient<Database>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
  return data?.tenant_id ?? null;
}
