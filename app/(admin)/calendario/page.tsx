import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { CalendarioMensal } from "@/components/calendario/CalendarioMensal";
import { formatarData } from "@/lib/format";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: visitas } = await supabase
    .from("visitas_resumo")
    .select("*")
    .order("data", { ascending: true });

  const eventos = visitas ?? [];
  const hojeISO = new Date().toISOString().slice(0, 10);
  const proximas = eventos.filter((v) => v.estado === "Agendada" && v.data >= hojeISO).slice(0, 3);

  return (
    <>
      <PageHeader title="Calendário" subtitle="Visitas agendadas e realizadas, todas as obras" />

      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-[11px] text-[#8A8578]">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FBF0DC] border border-[#E8C98F]" /> Agendada
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#8A8578]">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#E9F5EC] border border-[#B9DCC2]" /> Realizada
        </span>
      </div>

      {proximas.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {proximas.map((v) => (
            <Link
              key={v.id}
              href={`/visitas/${v.id}/completar`}
              className="bg-white border border-[#E4E1D6] rounded-xl p-4 hover:border-[#C9A050] transition-colors"
            >
              <div className="flex items-center gap-2 text-[#8A4A17] mb-2">
                <CalendarDays size={15} />
                <span className="text-[12px] font-mono">{formatarData(v.data)}</span>
                {v.hora && (
                  <span className="flex items-center gap-1 text-[12px] font-mono text-[#8A8578]">
                    <Clock size={11} /> {v.hora.slice(0, 5)}
                  </span>
                )}
              </div>
              <p className="text-[14px] font-medium text-[#14283A]">{v.obra_nome}</p>
              <p className="text-[12px] text-[#8A8578] mt-1 truncate">{v.notas || "—"}</p>
            </Link>
          ))}
        </div>
      )}

      <CalendarioMensal visitas={eventos} />
    </>
  );
}
