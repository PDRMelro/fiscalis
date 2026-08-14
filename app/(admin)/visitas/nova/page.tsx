import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaVisitaForm } from "@/components/visitas/NovaVisitaForm";

export default async function NovaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ obraId?: string }>;
}) {
  const { obraId } = await searchParams;
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <>
      <PageHeader title="Nova visita" subtitle="Regista a visita e carrega as fotos tiradas em obra" />
      <NovaVisitaForm obras={obras ?? []} obraIdInicial={obraId} />
    </>
  );
}
