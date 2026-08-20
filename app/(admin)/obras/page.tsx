import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaObraModal } from "@/components/obras/NovaObraModal";
import { ObrasMapaCliente } from "@/components/obras/ObrasMapaCliente";

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const verConcluidas = estado === "concluidas";

  const supabase = await createClient();
  const { data: todasObras } = await supabase.from("obras").select("*").order("created_at", { ascending: false });

  const concluidas = (todasObras ?? []).filter((o) => o.estado === "Concluída");
  const obras = (todasObras ?? []).filter((o) => o.estado !== "Concluída");
  const listaAtual = verConcluidas ? concluidas : obras;

  return (
    <>
      <PageHeader title="Obras" subtitle="Todas as obras em fiscalização" action={<NovaObraModal />} />

      <ObrasMapaCliente obras={todasObras ?? []} />

      <div className="flex gap-5 border-b border-[#E4E1D6] mb-5">
        <Link
          href="/obras"
          className={`pb-2.5 -mb-px border-b-2 text-[13px] ${
            !verConcluidas ? "border-[#C9A050] text-[#14283A] font-medium" : "border-transparent text-[#8A8578]"
          }`}
        >
          Em curso ({obras.length})
        </Link>
        <Link
          href="/obras?estado=concluidas"
          className={`pb-2.5 -mb-px border-b-2 text-[13px] ${
            verConcluidas ? "border-[#C9A050] text-[#14283A] font-medium" : "border-transparent text-[#8A8578]"
          }`}
        >
          Concluídas ({concluidas.length})
        </Link>
      </div>

      {listaAtual.length === 0 && (
        <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
          {verConcluidas ? "Ainda sem obras concluídas." : 'Ainda sem obras. Cria a primeira com o botão "Nova obra".'}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {listaAtual.map((o) => (
          <Link
            key={o.id}
            href={`/obras/${o.id}`}
            className="group text-left bg-white border border-[#E4E1D6] rounded-xl p-4 hover:border-[#C9A050] hover:shadow-[0_6px_20px_rgba(20,40,58,0.10)] transition-all relative overflow-hidden block"
          >
            <span className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-[#F5EFDD] opacity-0 group-hover:opacity-60 transition-opacity" />
            <div className="flex items-start justify-between relative">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#14283A]">{o.nome}</p>
                <p className="text-[12px] text-[#8A8578] flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {o.local} · {o.cliente_nome}
                </p>
              </div>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold text-white shrink-0 ml-2"
                style={{ background: `conic-gradient(#C9A050 ${o.progresso * 3.6}deg, #E4E1D6 0deg)` }}
              >
                <span className="w-8 h-8 rounded-full bg-[#14283A] flex items-center justify-center text-[10px]">
                  {o.progresso}%
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 relative">
              <div className="flex-1 h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
                <div className="h-full bg-[#14283A] rounded-full" style={{ width: `${o.progresso}%` }} />
              </div>
              <span className="text-[11px] font-mono text-[#8A8578]">{o.progresso}%</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
