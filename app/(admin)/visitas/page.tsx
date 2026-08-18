import Link from "next/link";
import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { formatarData } from "@/lib/format";
import type { ReactNode } from "react";

async function acaoFalsa(_visitaId: string, _enviarCliente: boolean) {
  "use server";
  return { error: null };
}

export default async function VisitasPage() {
  let linhas: ReactNode[] = [];
  let erroCarregar: string | null = null;

  try {
    const supabase = await createClient();
    const [{ data: visitas, error: erroVisitas }, { data: relatorios, error: erroRelatorios }] = await Promise.all([
      supabase.from("visitas_resumo").select("*").order("data", { ascending: false }),
      supabase.from("relatorios").select("id, visita_id"),
    ]);
    if (erroVisitas) throw new Error(`visitas_resumo: ${erroVisitas.message}`);
    if (erroRelatorios) throw new Error(`relatorios: ${erroRelatorios.message}`);

    const todas = visitas ?? [];
    const relatorioPorVisita = new Map(
      (relatorios ?? []).filter((r) => r.visita_id).map((r) => [r.visita_id as string, r.id])
    );

    linhas = todas.map((v) => {
      const relatorioId = relatorioPorVisita.get(v.id);
      return (
        <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0">
          <td className="px-5 py-3 font-mono text-[#14283A]">{formatarData(v.data)}</td>
          <td className="px-5 py-3 text-[#4A4740]">
            <Link href={`/obras/${v.obra_id}`} className="hover:underline">
              {v.obra_nome}
            </Link>
          </td>
          <td className="px-5 py-3 text-[#4A4740]">{v.estado}</td>
          <td className="px-5 py-3 text-right">
            {relatorioId ? (
              <a href={`/api/relatorios/${relatorioId}/download`} className="text-[12px] text-[#14283A] font-medium">
                Ver PDF
              </a>
            ) : (
              <GerarComEnvioButton
                label="Gerar relatório (teste)"
                icon={FileText}
                categoriaLabel="Relatórios"
                onGerar={acaoFalsa.bind(null, v.id)}
              />
            )}
          </td>
        </tr>
      );
    });
  } catch (err) {
    console.error("VisitasPage (debug 6) falhou", err);
    erroCarregar = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <PageHeader title="Visitas (debug 6)" subtitle="Botão com ação falsa, sem lib/actions/relatorios" />

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
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>{linhas}</tbody>
        </table>
      </div>
    </>
  );
}
