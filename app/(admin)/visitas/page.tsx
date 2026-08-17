import Link from "next/link";
import { Plus, CalendarPlus, Camera, FileText, AlertTriangle, Clock, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { GerarComEnvioButton } from "@/components/ui/GerarComEnvioButton";
import { formatarData } from "@/lib/format";
import { gerarRelatorio } from "@/lib/actions/relatorios";
import { cancelarVisitaAgendada } from "@/lib/actions/visitas";
import type { ReactNode } from "react";

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
      const agendada = v.estado === "Agendada";
      const relatorioId = relatorioPorVisita.get(v.id);
      return (
        <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0 group">
          <td className="px-5 py-3 font-mono text-[#14283A]">
            {formatarData(v.data)}
            {agendada && v.hora && (
              <span className="flex items-center gap-1 text-[11px] text-[#8A8578] font-mono mt-0.5">
                <Clock size={11} /> {v.hora.slice(0, 5)}
              </span>
            )}
          </td>
          <td className="px-5 py-3 text-[#4A4740]">
            <Link href={`/obras/${v.obra_id}`} className="hover:underline">
              {v.obra_nome}
            </Link>
          </td>
          <td className="px-5 py-3 text-[#4A4740] max-w-[260px] truncate">
            {(agendada ? v.notas : v.especialidades) || "—"}
          </td>
          <td className="px-5 py-3">
            {agendada ? (
              <span className="text-[11px] font-medium text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded px-1.5 py-0.5">
                Agendada
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#3E7A4D] bg-[#E9F5EC] border border-[#B9DCC2] rounded px-1.5 py-0.5">
                Realizada
              </span>
            )}
          </td>
          <td className="px-5 py-3 text-[#8A8578]">
            {agendada ? (
              "—"
            ) : (
              <span className="flex items-center gap-1.5">
                <Camera size={13} /> {v.fotos}
              </span>
            )}
          </td>
          <td className="px-5 py-3 text-[#8A8578]">{agendada ? "—" : v.nc_abertas}</td>
          <td className="px-5 py-3 text-right">
            {agendada ? (
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/visitas/${v.id}/completar`}
                  className="text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
                >
                  Completar visita
                </Link>
                <form action={cancelarVisitaAgendada.bind(null, v.obra_id, v.id)}>
                  <button
                    type="submit"
                    className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Cancelar visita agendada"
                  >
                    <X size={14} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/nc/nova?visitaId=${v.id}`}
                  title="Nova não conformidade nesta visita"
                  className="text-[#8A8578] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#B0402F]"
                >
                  <AlertTriangle size={14} />
                </Link>
                {relatorioId ? (
                  <a href={`/api/relatorios/${relatorioId}/download`} className="text-[12px] text-[#14283A] font-medium">
                    Ver PDF
                  </a>
                ) : (
                  <GerarComEnvioButton
                    label="Gerar relatório"
                    icon={FileText}
                    categoriaLabel="Relatórios"
                    onGerar={gerarRelatorio.bind(null, v.id)}
                  />
                )}
              </div>
            )}
          </td>
        </tr>
      );
    });
  } catch (err) {
    console.error("VisitasPage falhou", err);
    erroCarregar = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <PageHeader
        title="Visitas"
        subtitle="Histórico e visitas agendadas, todas as obras"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/visitas/agendar"
              className="flex items-center gap-1.5 text-[13px] text-[#14283A] border border-[#DEDBD2] rounded-lg px-3.5 py-2 hover:bg-[#F5F4EF] transition-colors"
            >
              <CalendarPlus size={14} /> Agendar visita
            </Link>
            <Link
              href="/visitas/nova"
              className="flex items-center gap-1.5 text-[13px] text-white bg-[#14283A] rounded-lg px-3.5 py-2"
            >
              <Plus size={14} /> Nova visita
            </Link>
          </div>
        }
      />

      {erroCarregar && (
        <div className="bg-white border border-[#F0CFC6] rounded-xl p-4 mb-4 text-[13px] text-[#B0402F]">
          Não foi possível carregar as visitas: {erroCarregar}
        </div>
      )}

      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {linhas.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8578]">
            {erroCarregar ? "—" : "Ainda sem visitas registadas."}
          </p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Notas / especialidades</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Fotos</th>
                <th className="px-5 py-3 font-medium">NC abertas</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>{linhas}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
