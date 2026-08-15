import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompletarVisitaForm } from "@/components/visitas/CompletarVisitaForm";

export default async function CompletarVisitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: visita } = await supabase.from("visitas").select("*, obras(nome)").eq("id", id).single();
  if (!visita) notFound();

  const obraNome = (visita.obras as unknown as { nome: string } | null)?.nome ?? "";

  return (
    <>
      <PageHeader title="Completar visita" subtitle="Confirma a data, junta notas e as fotos tiradas em obra" />
      <CompletarVisitaForm visita={visita} obraNome={obraNome} />
    </>
  );
}
