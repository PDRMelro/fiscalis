import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompletarVisitaForm } from "@/components/visitas/CompletarVisitaForm";
import { SeveridadeTag } from "@/components/ui/Tags";

export default async function CompletarVisitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: visita }, { data: ncs }, { data: fotos }] = await Promise.all([
    supabase.from("visitas").select("*, obras(nome)").eq("id", id).single(),
    supabase.from("nao_conformidades").select("*").eq("visita_id", id).order("created_at", { ascending: false }),
    supabase.from("visita_fotos").select("*").eq("visita_id", id).order("created_at", { ascending: true }),
  ]);
  if (!visita) notFound();

  const obraNome = (visita.obras as unknown as { nome: string } | null)?.nome ?? "";

  const fotosExistentes = await Promise.all(
    (fotos ?? []).map(async (f) => {
      const { data } = await supabase.storage.from("visita-fotos").createSignedUrl(f.storage_path, 3600);
      return { id: f.id, nome_ficheiro: f.nome_ficheiro, url: data?.signedUrl ?? null };
    })
  );

  return (
    <>
      <PageHeader
        title={visita.estado === "Realizada" ? "Editar visita" : "Completar visita"}
        subtitle="Confirma a data, junta notas e as fotos tiradas em obra"
      />
      <CompletarVisitaForm visita={visita} obraNome={obraNome} fotosExistentes={fotosExistentes} />

      <div className="max-w-xl mt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-medium text-[#4A4740]">Não conformidades desta visita</p>
          <Link
            href={`/nc/nova?visitaId=${id}`}
            className="flex items-center gap-1 text-[12px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2.5 py-1.5 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
          >
            <Plus size={13} /> Nova não conformidade
          </Link>
        </div>

        {ncs && ncs.length > 0 ? (
          <div className="bg-white border border-[#E4E1D6] rounded-xl divide-y divide-[#F2F0E8]">
            {ncs.map((n) => (
              <Link key={n.id} href={`/nc/${n.id}/editar`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F9F8F4]">
                <div className="w-8 h-8 rounded-lg bg-[#FBEAE6] flex items-center justify-center text-[#B0402F] shrink-0">
                  <AlertTriangle size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-mono text-[#14283A]">{n.codigo}</p>
                  <p className="text-[13px] text-[#1F1D19] truncate">{n.descricao}</p>
                </div>
                <SeveridadeTag nivel={n.severidade} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#8A8578]">Ainda sem não conformidades ligadas a esta visita.</p>
        )}
      </div>
    </>
  );
}
