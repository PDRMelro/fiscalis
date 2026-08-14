import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaNCForm } from "@/components/nc/NovaNCForm";

export default async function NovaNCPage({
  searchParams,
}: {
  searchParams: Promise<{ obraId?: string }>;
}) {
  const { obraId } = await searchParams;
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <>
      <PageHeader title="Nova não conformidade" subtitle="Preenche os dados e, se quiseres, anexa fotografias" />
      <NovaNCForm obras={obras ?? []} obraIdInicial={obraId} />
    </>
  );
}
