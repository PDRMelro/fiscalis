import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatarData } from "@/lib/format";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: visitas } = await supabase
    .from("visitas_resumo")
    .select("*")
    .order("data", { ascending: true });

  const eventos = visitas ?? [];
  const proximas = eventos.filter((v) => v.estado === "Agendada").slice(0, 3);

  return (
    <>
      <PageHeader title="Calendário" subtitle="Próximas visitas agendadas, todas as obras" />

      {proximas.length === 0 ? (
        <p className="text-[13px] text-[#8A8578]">Ainda sem visitas agendadas.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {proximas.map((v) => (
            <Link key={v.id} href={`/visitas/${v.id}/completar`} className="bg-white border border-[#E4E1D6] rounded-xl p-4 hover:border-[#C9A050] transition-colors">
              <div className="flex items-center gap-2 text-[#C9A050] mb-2">
                <CalendarDays size={15} />
                <span className="text-[12px] font-mono text-[#8A8578]">{formatarData(v.data)}</span>
                {v.hora && (
                  <span className="flex items-center gap-1 text-[12px] font-mono text-[#8A8578]">
                    <Clock size={11} /> {v.hora.slice(0, 5)}
                  </span>
                )}
              </div>
              <p className="text-[14px] font-medium text-[#14283A]">{v.obra_nome}</p>
              <p className="text-[12px] text-[#8A8578] mt-1">{v.notas || "—"}</p>
            </Link>
          ))}
        </div>
      )}

      <p className="text-[13px] font-medium text-[#4A4740] mt-6 mb-3">Todas as visitas</p>
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Obra</th>
              <th className="px-5 py-3 font-medium">Notas</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((v) => (
              <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0">
                <td className="px-5 py-3 font-mono text-[#14283A]">{formatarData(v.data)}</td>
                <td className="px-5 py-3 text-[#4A4740]">
                  <Link href={`/obras/${v.obra_id}`} className="hover:underline">
                    {v.obra_nome}
                  </Link>
                </td>
                <td className="px-5 py-3 text-[#8A8578]">{v.especialidades || v.notas || "—"}</td>
                <td className="px-5 py-3">
                  {v.estado === "Agendada" ? (
                    <span className="text-[11px] font-medium text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded px-1.5 py-0.5">
                      Agendada
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#3E7A4D] bg-[#E9F5EC] border border-[#B9DCC2] rounded px-1.5 py-0.5">
                      Realizada
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-[#8A8578]">
                  Sem visitas registadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
