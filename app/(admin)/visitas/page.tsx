import Link from "next/link";
import { Plus, CalendarPlus, Camera, FileText, AlertTriangle, Clock, X, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatarData } from "@/lib/format";
import { gerarRelatorio } from "@/lib/actions/relatorios";
import { cancelarVisitaAgendada, eliminarVisita } from "@/lib/actions/visitas";
import type { ReactNode } from "react";
import type { VisitaResumoRow } from "@/lib/supabase/types";

function aguardar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * O Supabase, por instantes, pode devolver "JWT issued at future" por um
 * pequeníssimo desfasamento de relógio entre serviços — intermitente e
 * mais provável quando há pedidos em paralelo a renovar o token ao mesmo
 * tempo. Por isso as duas consultas correm uma a seguir à outra (não em
 * Promise.all), e há até 3 tentativas com pequenas pausas antes de
 * desistir e mostrar erro.
 */
async function buscarDadosComRetry(tentativas = 3): Promise<{
  visitas: VisitaResumoRow[];
  relatorios: { id: string; visita_id: string | null }[];
}> {
  let ultimoErro: Error | null = null;

  for (let tentativa = 0; tentativa < tentativas; tentativa++) {
    try {
      const supabase = await createClient();

      const { data: visitas, error: erroVisitas } = await supabase
        .from("visitas_resumo")
        .select("*")
        .order("data", { ascending: false });
      if (erroVisitas) throw new Error(`visitas_resumo: ${erroVisitas.message}`);

      const { data: relatorios, error: erroRelatorios } = await supabase
        .from("relatorios")
        .select("id, visita_id");
      if (erroRelatorios) throw new Error(`relatorios: ${erroRelatorios.message}`);

      return { visitas: visitas ?? [], relatorios: relatorios ?? [] };
    } catch (err) {
      ultimoErro = err instanceof Error ? err : new Error(String(err));
      console.error(`VisitasPage: tentativa ${tentativa + 1}/${tentativas} falhou`, err);
      if (tentativa < tentativas - 1) await aguardar(300 * (tentativa + 1));
    }
  }

  throw ultimoErro;
}

function CartaoVisita({ v, agendada, relatorioId }: { v: VisitaResumoRow; agendada: boolean; relatorioId: string | undefined }) {
  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <p className="font-mono text-[13px] text-[#14283A]">{formatarData(v.data)}</p>
          {agendada && v.hora && (
            <span className="flex items-center gap-1 text-[11px] text-[#8A8578] font-mono mt-0.5">
              <Clock size={11} /> {v.hora.slice(0, 5)}
            </span>
          )}
        </div>
        {agendada ? (
          <span className="text-[11px] font-medium text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded px-1.5 py-0.5 shrink-0">
            Agendada
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#3E7A4D] bg-[#E9F5EC] border border-[#B9DCC2] rounded px-1.5 py-0.5 shrink-0">
            Realizada
          </span>
        )}
      </div>
      <Link href={`/obras/${v.obra_id}`} className="block text-[13px] text-[#4A4740] hover:underline">
        {v.obra_nome}
      </Link>
      <p className="text-[13px] text-[#4A4740]">{(agendada ? v.notas : v.especialidades) || "—"}</p>
      {!agendada && (
        <div className="flex items-center gap-4 text-[12px] text-[#8A8578]">
          <span className="flex items-center gap-1.5">
            <Camera size={13} /> {v.fotos} foto(s)
          </span>
          <span>{v.nc_abertas} NC aberta(s)</span>
        </div>
      )}
      <div className="pt-2 border-t border-[#F2F0E8]">
        {agendada ? <AcoesAgendada v={v} /> : <AcoesRealizada v={v} relatorioId={relatorioId} />}
      </div>
    </div>
  );
}

function AcoesAgendada({ v }: { v: VisitaResumoRow }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link
        href={`/visitas/${v.id}/completar`}
        className="text-[11px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-2 py-1 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
      >
        Completar visita
      </Link>
      <form action={cancelarVisitaAgendada.bind(null, v.obra_id, v.id)}>
        <button type="submit" className="text-[#B0402F]" title="Cancelar visita agendada">
          <X size={14} />
        </button>
      </form>
    </div>
  );
}

function AcoesRealizada({ v, relatorioId }: { v: VisitaResumoRow; relatorioId: string | undefined }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Link href={`/visitas/${v.id}/completar`} title="Editar visita" className="text-[#8A8578] hover:text-[#14283A]">
        <Pencil size={13} />
      </Link>
      <Link
        href={`/nc/nova?visitaId=${v.id}`}
        title="Nova não conformidade nesta visita"
        className="text-[#8A8578] hover:text-[#B0402F]"
      >
        <AlertTriangle size={14} />
      </Link>
      {relatorioId ? (
        <>
          <a href={`/api/relatorios/${relatorioId}/download`} className="text-[12px] text-[#14283A] font-medium">
            Ver PDF
          </a>
          <form
            action={async () => {
              "use server";
              await gerarRelatorio(v.id, false);
            }}
          >
            <button
              type="submit"
              title="Gerar novo PDF com as alterações mais recentes"
              className="text-[#8A8578] hover:text-[#14283A]"
            >
              <RefreshCw size={13} />
            </button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            "use server";
            await gerarRelatorio(v.id, false);
          }}
        >
          <button type="submit" className="flex items-center gap-1 text-[12px] text-[#14283A] font-medium">
            <FileText size={12} /> Gerar relatório
          </button>
        </form>
      )}
      <form
        action={async () => {
          "use server";
          await eliminarVisita(v.obra_id, v.id);
        }}
      >
        <button type="submit" title="Eliminar visita" className="text-[#8A8578] hover:text-[#B0402F]">
          <Trash2 size={13} />
        </button>
      </form>
    </div>
  );
}

export default async function VisitasPage() {
  const cartoes: ReactNode[] = [];
  let erroCarregar: string | null = null;

  try {
    const { visitas, relatorios } = await buscarDadosComRetry();

    const relatorioPorVisita = new Map(
      relatorios.filter((r) => r.visita_id).map((r) => [r.visita_id as string, r.id])
    );

    cartoes.push(
      ...visitas.map((v) => {
        const agendada = v.estado === "Agendada";
        const relatorioId = relatorioPorVisita.get(v.id);
        return <CartaoVisita key={v.id} v={v} agendada={agendada} relatorioId={relatorioId} />;
      })
    );
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

      {cartoes.length === 0 ? (
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
          {erroCarregar ? "—" : "Ainda sem visitas registadas."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">{cartoes}</div>
      )}
    </>
  );
}
