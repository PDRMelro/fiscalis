import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatarData } from "@/lib/format";
import type { ReactNode } from "react";

export default async function VisitasPage() {
  let linhas: ReactNode[] = [];
  let erroCarregar: string | null = null;

  try {
    const supabase = await createClient();
    const { data: visitas, error } = await supabase.from("visitas_resumo").select("*").order("data", { ascending: false });
    if (error) throw new Error(error.message);

    const todas = visitas ?? [];

    linhas = todas.map((v) => (
      <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0">
        <td className="px-5 py-3 font-mono text-[#14283A]">{formatarData(v.data)}</td>
        <td className="px-5 py-3 text-[#4A4740]">
          <Link href={`/obras/${v.obra_id}`} className="hover:underline">
            {v.obra_nome}
          </Link>
        </td>
        <td className="px-5 py-3 text-[#4A4740]">{v.estado}</td>
        <td className="px-5 py-3 text-[#8A8578]">{v.fotos}</td>
        <td className="px-5 py-3 text-[#8A8578]">{v.nc_abertas}</td>
      </tr>
    ));
  } catch (err) {
    console.error("VisitasPage (debug 3) falhou", err);
    erroCarregar = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <PageHeader title="Visitas (debug 3)" subtitle="Tabela simples, sem botões complexos" />

      {erroCarregar && (
        <div className="bg-white border border-[#F0CFC6] rounded-xl p-4 mb-4 text-[13px] text-[#B0402F]">
          {erroCarregar}
        </div>
      )}

      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Obra</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Fotos</th>
              <th className="px-5 py-3 font-medium">NC abertas</th>
            </tr>
          </thead>
          <tbody>{linhas}</tbody>
        </table>
      </div>
    </>
  );
}
