import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  // redirect() lança internamente um erro especial do Next que tem de
  // propagar — por isso só o que fala com o Supabase fica dentro do
  // try/catch, nunca as chamadas a redirect() em si.
  let hasUser = false;
  let role: "admin" | "client" | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      hasUser = true;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      role = (profile?.role as "admin" | "client" | undefined) ?? null;
    }
  } catch {
    hasUser = false;
  }

  if (!hasUser) redirect("/login");
  redirect(role === "client" ? "/portal" : "/dashboard");
}
