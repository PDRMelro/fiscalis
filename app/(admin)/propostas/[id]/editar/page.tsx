import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditarPropostaForm } from "@/components/propostas/EditarPropostaForm";

export default async function EditarPropostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: proposta }, { data: obras }] = await Promise.all([
    supabase.from("propostas").select("*").eq("id", id).single(),
    supabase.from("obras").select("id, nome").order("nome"),
  ]);

  if (!proposta) notFound();

  return (
    <>
      <PageHeader title={`Editar proposta ${proposta.codigo ?? ""}`} subtitle="Preço, periodicidade e geração do PDF" />
      <EditarPropostaForm proposta={proposta} obras={obras ?? []} />
    </>
  );
}
