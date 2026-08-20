import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerPdfButton } from "@/components/ui/VerPdfButton";
import { eliminarRelatorio } from "@/lib/actions/relatorios";
import { formatarData } from "@/lib/format";

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: relatorios } = await supabase
    .from("relatorios")
    .select("*, obras(id, nome)")
    .order("data", { ascending: false });

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Relatórios de fiscalização gerados" />
      {(!relatorios || relatorios.length === 0) ? (
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
          Ainda sem relatórios. Gera um a partir de uma visita em{" "}
          <Link href="/visitas" className="text-[#14283A] underline underline-offset-2">
            Visitas
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {relatorios.map((r) => {
            const obra = r.obras as unknown as { id: string; nome: string } | null;
            return (
              <div key={r.id} className="bg-white border border-[#E4E1D6] rounded-xl p-4 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="font-mono text-[13px] text-[#14283A]">{r.codigo}</p>
                  {obra && (
                    <Link href={`/obras/${obra.id}`} className="text-[13px] text-[#4A4740] hover:underline">
                      {obra.nome}
                    </Link>
                  )}
                  <p className="text-[12px] text-[#8A8578] font-mono">{formatarData(r.data)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.visita_id && (
                    <Link href={`/visitas/${r.visita_id}/completar`} title="Editar visita" className="text-[#8A8578] hover:text-[#14283A]">
                      <Pencil size={13} />
                    </Link>
                  )}
                  <VerPdfButton href={`/api/relatorios/${r.id}/download`} className="text-[12px] text-[#14283A] font-medium">
                    Ver PDF
                  </VerPdfButton>
                  <form action={eliminarRelatorio.bind(null, r.id)}>
                    <button type="submit" className="text-[#B0402F]">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
