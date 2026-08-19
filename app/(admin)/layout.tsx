import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/login");

  let alertas: { id: string; descricao: string; prazo: string | null; obra: string; atrasada: boolean }[] = [];
  try {
    const hojeISO = new Date().toISOString().slice(0, 10);

    const { data: alertasRaw } = await supabase
      .from("nao_conformidades")
      .select("id, descricao, prazo, obras(nome)")
      .neq("estado", "Encerrada")
      .order("prazo", { ascending: true, nullsFirst: false })
      .limit(6);

    alertas = (alertasRaw ?? [])
      .map((n) => ({
        id: n.id as string,
        descricao: n.descricao as string,
        prazo: n.prazo as string | null,
        obra: (n.obras as unknown as { nome: string } | null)?.nome ?? "—",
        atrasada: !!n.prazo && (n.prazo as string) < hojeISO,
      }))
      .sort((a, b) => Number(b.atrasada) - Number(a.atrasada));
  } catch (err) {
    console.error("AdminLayout: falha ao carregar alertas", err);
  }

  const nome = profile.nome || "Administrador";
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AdminShell nome={nome} cargo="Eng.º Civil" empresa="Fiscalis Engenharia" iniciais={iniciais || "AD"} alertas={alertas}>
      {children}
    </AdminShell>
  );
}
