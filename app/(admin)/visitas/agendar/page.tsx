import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { AgendarVisitaForm } from "@/components/visitas/AgendarVisitaForm";

export default async function AgendarVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ obraId?: string }>;
}) {
  const { obraId } = await searchParams;
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <>
      <PageHeader title="Agendar visita" subtitle="Marca uma visita com antecedência — completas os detalhes depois" />
      <AgendarVisitaForm obras={obras ?? []} obraIdInicial={obraId} />
    </>
  );
}
