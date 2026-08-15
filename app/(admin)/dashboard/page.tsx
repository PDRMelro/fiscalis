import Link from "next/link";
import { Calendar, Building2, Activity, AlertTriangle, CheckCircle2, Hammer, MapPin, Clock, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EstadoDot, AreaEstadoTag } from "@/components/ui/Tags";
import { ObraProgressoChart } from "@/components/charts/ObraProgressoChart";
import { NcDonutChart } from "@/components/charts/NcDonutChart";
import { formatarData } from "@/lib/format";
import type { ObraAreaRow } from "@/lib/supabase/types";

const CORES_ESTADO: Record<string, string> = {
  Aberta: "#C4791E",
  "Em correção": "#C9A050",
  Fechada: "#2C6B45",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: obras }, { data: ncs }, { count: totalVisitas }, { data: visitasAgendadas }] = await Promise.all([
    supabase.from("obras").select("*").order("created_at", { ascending: false }),
    supabase.from("nao_conformidades").select("*, obras(nome)").order("created_at", { ascending: false }),
    supabase.from("visitas").select("*", { count: "exact", head: true }),
    supabase
      .from("visitas_resumo")
      .select("*")
      .eq("estado", "Agendada")
      .order("data", { ascending: true })
      .limit(5),
  ]);

  const todasObras = obras ?? [];
  const todasNcs = ncs ?? [];
  const obrasAtivas = todasObras.filter((o) => o.estado === "Em curso").length;
  const ncAbertas = todasNcs.filter((n) => n.estado === "Aberta").length;
  const ncFechadas = todasNcs.filter((n) => n.estado === "Fechada").length;

  const ncPorEstado = (["Aberta", "Em correção", "Fechada"] as const).map((estado) => ({
    nome: estado === "Aberta" ? "Abertas" : estado === "Em correção" ? "Em correção" : "Fechadas",
    valor: todasNcs.filter((n) => n.estado === estado).length,
    cor: CORES_ESTADO[estado],
  }));

  const obraDestaque = todasObras[0];
  let areasDestaque: ObraAreaRow[] = [];
  if (obraDestaque) {
    const { data } = await supabase
      .from("obra_areas")
      .select("*")
      .eq("obra_id", obraDestaque.id)
      .order("ordem", { ascending: true });
    areasDestaque = data ?? [];
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão global das obras em fiscalização"
        action={
          <div className="flex items-center gap-1.5 text-[12px] text-[#8A8578] bg-white border border-[#E4E1D6] rounded-lg px-3 py-1.5">
            <Calendar size={13} />
            Visão atual
          </div>
        }
      />

      <div className="flex gap-4 mb-6">
        <StatCard label="Obras ativas" value={obrasAtivas} icon={Building2} />
        <StatCard label="Visitas realizadas" value={totalVisitas ?? 0} icon={Activity} />
        <StatCard label="Não conformidades abertas" value={ncAbertas} tone="warn" icon={AlertTriangle} />
        <StatCard label="Conformidades fechadas" value={ncFechadas} tone="ok" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="col-span-3 bg-white border border-[#E4E1D6] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-medium text-[#4A4740]">Progresso das obras</p>
            <span className="flex items-center gap-1 text-[11px] text-[#8A8578]">
              <Hammer size={12} className="text-[#C9A050]" /> % executado
            </span>
          </div>
          {todasObras.length === 0 ? (
            <p className="text-[13px] text-[#8A8578] py-10 text-center">Sem obras para mostrar.</p>
          ) : (
            <ObraProgressoChart dados={todasObras.map((o) => ({ nome: o.nome, progresso: o.progresso }))} />
          )}
        </div>

        <div className="col-span-2 bg-white border border-[#E4E1D6] rounded-xl p-5">
          <p className="text-[13px] font-medium text-[#4A4740] mb-4">Não conformidades por estado</p>
          <NcDonutChart dados={ncPorEstado} total={todasNcs.length} />
          <div className="flex justify-center gap-3 mt-1">
            {ncPorEstado.map((e) => (
              <div key={e.nome} className="flex items-center gap-1.5 text-[11px] text-[#8A8578]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.cor }} />
                {e.nome}
                <span className="font-mono text-[#4A4740]">{e.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white border border-[#E4E1D6] rounded-xl p-5">
          <p className="text-[13px] font-medium text-[#4A4740] mb-4">Não conformidades recentes</p>
          {todasNcs.length === 0 ? (
            <p className="text-[13px] text-[#8A8578] py-6 text-center">Sem não conformidades registadas.</p>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Obra</th>
                  <th className="pb-2 font-medium">Descrição</th>
                  <th className="pb-2 font-medium">Prazo</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {todasNcs.slice(0, 3).map((n) => (
                  <tr key={n.id} className="border-b border-[#F2F0E8] last:border-0">
                    <td className="py-2.5 font-mono text-[#14283A]">{n.codigo}</td>
                    <td className="py-2.5 text-[#4A4740]">{(n.obras as unknown as { nome: string } | null)?.nome}</td>
                    <td className="py-2.5 text-[#4A4740] max-w-[220px] truncate">{n.descricao}</td>
                    <td className="py-2.5 text-[#8A8578] font-mono">{formatarData(n.prazo)}</td>
                    <td className="py-2.5">
                      <EstadoDot estado={n.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="col-span-2 bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
          {obraDestaque ? (
            <>
              <Link
                href={`/obras/${obraDestaque.id}`}
                className="block w-full text-left px-5 pt-4 pb-3 border-b border-[#EDEBE2] hover:bg-[#F9F8F4]"
              >
                <p className="text-[13px] font-medium text-[#14283A]">Obra: {obraDestaque.nome}</p>
                <p className="text-[11px] text-[#8A8578] flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {obraDestaque.local} · Cliente: {obraDestaque.cliente_nome}
                </p>
              </Link>
              <div className="p-5 space-y-3">
                {areasDestaque.length === 0 && (
                  <p className="text-[12px] text-[#8A8578]">Ainda sem áreas definidas para esta obra.</p>
                )}
                {areasDestaque.map((a) => (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#4A4740]">{a.area}</span>
                      <AreaEstadoTag estado={a.estado} />
                    </div>
                    <div className="w-full h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${a.progresso}%`, backgroundColor: a.progresso === 100 ? "#2C6B45" : "#14283A" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[13px] text-[#8A8578] p-5 text-center">Ainda sem obras criadas.</p>
          )}
        </div>
      </div>
    </>
  );
}
