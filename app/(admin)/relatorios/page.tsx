import Link from "next/link";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
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
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {(!relatorios || relatorios.length === 0) ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8578]">
            Ainda sem relatórios. Gera um a partir de uma visita em{" "}
            <Link href="/visitas" className="text-[#14283A] underline underline-offset-2">
              Visitas
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                    <th className="px-5 py-3 font-medium">Referência</th>
                    <th className="px-5 py-3 font-medium">Obra</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-5 py-3 font-medium" />
                    <th className="px-5 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {relatorios.map((r) => {
                    const obra = r.obras as unknown as { id: string; nome: string } | null;
                    return (
                      <tr key={r.id} className="border-b border-[#F2F0E8] last:border-0 group">
                        <td className="px-5 py-3 font-mono text-[#14283A]">{r.codigo}</td>
                        <td className="px-5 py-3 text-[#4A4740]">
                          {obra && (
                            <Link href={`/obras/${obra.id}`} className="hover:underline">
                              {obra.nome}
                            </Link>
                          )}
                        </td>
                        <td className="px-5 py-3 text-[#8A8578] font-mono">{formatarData(r.data)}</td>
                        <td className="px-5 py-3 text-right">
                          <a href={`/api/relatorios/${r.id}/download`} className="text-[12px] text-[#14283A] font-medium">
                            Ver PDF
                          </a>
                        </td>
                        <td className="px-5 py-3">
                          <form action={eliminarRelatorio.bind(null, r.id)}>
                            <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={13} />
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-[#F2F0E8]">
              {relatorios.map((r) => {
                const obra = r.obras as unknown as { id: string; nome: string } | null;
                return (
                  <div key={r.id} className="p-4 flex items-center justify-between gap-2">
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
                      <a href={`/api/relatorios/${r.id}/download`} className="text-[12px] text-[#14283A] font-medium">
                        Ver PDF
                      </a>
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
          </>
        )}
      </div>
    </>
  );
}
