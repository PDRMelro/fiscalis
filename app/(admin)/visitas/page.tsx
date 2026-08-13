import Link from "next/link";
import { Plus, Camera, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatarData } from "@/lib/format";
import { gerarRelatorio } from "@/lib/actions/relatorios";

export default async function VisitasPage() {
  const supabase = await createClient();
  const [{ data: visitas }, { data: relatorios }] = await Promise.all([
    supabase.from("visitas_resumo").select("*").order("data", { ascending: false }),
    supabase.from("relatorios").select("id, visita_id"),
  ]);
  const relatorioPorVisita = new Map((relatorios ?? []).filter((r) => r.visita_id).map((r) => [r.visita_id as string, r.id]));

  return (
    <>
      <PageHeader
        title="Visitas"
        subtitle="Histórico de visitas de fiscalização, todas as obras"
        action={
          <Link
            href="/visitas/nova"
            className="flex items-center gap-1.5 text-[13px] text-white bg-[#14283A] rounded-lg px-3.5 py-2"
          >
            <Plus size={14} /> Nova visita
          </Link>
        }
      />
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {(!visitas || visitas.length === 0) ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8578]">Ainda sem visitas registadas.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Especialidades / notas</th>
                <th className="px-5 py-3 font-medium">Fotos</th>
                <th className="px-5 py-3 font-medium">NC abertas</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => {
                const relatorioId = relatorioPorVisita.get(v.id);
                return (
                  <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0">
                    <td className="px-5 py-3 font-mono text-[#14283A]">{formatarData(v.data)}</td>
                    <td className="px-5 py-3 text-[#4A4740]">
                      <Link href={`/obras/${v.obra_id}`} className="hover:underline">
                        {v.obra_nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-[#4A4740] max-w-[260px] truncate">{v.especialidades || "—"}</td>
                    <td className="px-5 py-3 text-[#8A8578]">
                      <span className="flex items-center gap-1.5">
                        <Camera size={13} /> {v.fotos}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8A8578]">{v.nc_abertas}</td>
                    <td className="px-5 py-3 text-right">
                      {relatorioId ? (
                        <a href={`/api/relatorios/${relatorioId}/download`} className="text-[12px] text-[#14283A] font-medium">
                          Ver PDF
                        </a>
                      ) : (
                        <form action={gerarRelatorio.bind(null, v.id)}>
                          <button type="submit" className="flex items-center gap-1 text-[12px] text-[#14283A] font-medium ml-auto">
                            <FileText size={12} /> Gerar relatório
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
