import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditarNCForm } from "@/components/nc/EditarNCForm";

export default async function EditarNCPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: nc }, { data: obras }, { data: fotos }] = await Promise.all([
    supabase.from("nao_conformidades").select("*").eq("id", id).single(),
    supabase.from("obras").select("id, nome").order("nome"),
    supabase.from("nc_fotos").select("*").eq("nc_id", id).order("created_at", { ascending: true }),
  ]);

  if (!nc) notFound();

  const fotosExistentes = await Promise.all(
    (fotos ?? []).map(async (f) => {
      const { data } = await supabase.storage.from("nc-anexos").createSignedUrl(f.storage_path, 3600);
      return { id: f.id, nome_ficheiro: f.nome_ficheiro, url: data?.signedUrl ?? null };
    })
  );

  return (
    <>
      <PageHeader title={`Editar não conformidade ${nc.codigo ?? ""}`} subtitle="Atualiza os dados e as fotos anexadas" />
      <EditarNCForm nc={nc} obras={obras ?? []} fotosExistentes={fotosExistentes} />
    </>
  );
}
