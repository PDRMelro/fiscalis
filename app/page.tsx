import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HubView } from "@/components/hub/HubView";

export const metadata: Metadata = {
  title: "Fiscalis — Plataforma e Serviço de Fiscalização de Obra",
  description:
    "Duas formas de trabalhar com a Fiscalis: a plataforma de fiscalização de obra para empresas, ou o serviço de fiscalização independente em Aveiro e Porto.",
};

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

  if (!hasUser) return <HubView />;
  redirect(role === "client" ? "/portal" : "/dashboard");
}
