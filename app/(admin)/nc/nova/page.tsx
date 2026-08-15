import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaNCForm } from "@/components/nc/NovaNCForm";

export default async function NovaNCPage({
  searchParams,
}: {
  searchParams: Promise<{ obraId?: string; visitaId?: string }>;
}) {
  const { obraId, visitaId } = await searchParams;
  const supabase = await createClient();

  const [{ data: obras }, { data: visita }] = await Promise.all([
    supabase.from("obras").select("id, nome").order("nome"),
    visitaId
      ? supabase.from("visitas").select("obra_id, data").eq("id", visitaId).single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <>
      <PageHeader title="Nova não conformidade" subtitle="Preenche os dados e, se quiseres, anexa fotografias" />
      <NovaNCForm
        obras={obras ?? []}
        obraIdInicial={visita?.obra_id ?? obraId}
        visitaId={visitaId}
        visitaData={visita?.data}
      />
    </>
  );
}
