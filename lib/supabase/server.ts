import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient(opts?: { esquecerAoFechar?: boolean }) {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                // Sem "Manter-me ligado": grava a sessão como cookie de
                // sessão do browser (sem validade definida), para
                // desaparecer sozinho quando o browser fechar de vez.
                opts?.esquecerAoFechar ? { ...options, maxAge: undefined, expires: undefined } : options
              )
            );
          } catch {
            // chamado a partir de um Server Component — ignorado porque o
            // proxy.ts já trata do refresh de sessão em cada pedido.
          }
        },
      },
    }
  );
}
