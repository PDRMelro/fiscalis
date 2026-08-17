import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

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
      .neq("estado", "Fechada")
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
    <div
      className="w-full min-h-screen bg-[#F5F4EF] flex text-[#1F1D19]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar nome={nome} cargo="Eng.º Civil" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar nome={nome} empresa="Fiscalis Engenharia" iniciais={iniciais || "AD"} alertas={alertas} />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
