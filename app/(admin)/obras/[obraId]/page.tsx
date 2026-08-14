import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmSubmitButton } from "@/components/ui/ConfirmSubmitButton";
import { EditarObraModal } from "@/components/obras/EditarObraModal";
import { eliminarObra } from "@/lib/actions/obras";
import { formatarData } from "@/lib/format";
import { GeralTab } from "@/components/obras/tabs/GeralTab";
import { VisitasTab } from "@/components/obras/tabs/VisitasTab";
import { DocumentosTab } from "@/components/obras/tabs/DocumentosTab";
import { OrcamentosTab } from "@/components/obras/tabs/OrcamentosTab";
import { FinanceiroTab } from "@/components/obras/tabs/FinanceiroTab";
import { IntervenientesTab } from "@/components/obras/tabs/IntervenientesTab";

const TABS = ["Geral", "Visitas", "Documentos", "Orçamentos", "Financeiro", "Intervenientes"] as const;
type Tab = (typeof TABS)[number];

export default async function ObraDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ obraId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { obraId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "Geral";

  const supabase = await createClient();
  const { data: obra } = await supabase.from("obras").select("*").eq("id", obraId).single();
  if (!obra) notFound();

  return (
    <>
      <Link href="/obras" className="flex items-center gap-1 text-[13px] text-[#8A8578] mb-4 hover:text-[#14283A] w-fit">
        <ChevronLeft size={15} /> Voltar às obras
      </Link>
      <PageHeader
        title={obra.nome}
        subtitle={`${obra.local} · Cliente: ${obra.cliente_nome}${obra.inicio ? ` · Início: ${formatarData(obra.inicio)}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <EditarObraModal obra={obra} />
            <form action={eliminarObra.bind(null, obra.id)}>
              <ConfirmSubmitButton
                confirmMessage={`Eliminar a obra "${obra.nome}"? Esta ação apaga também todas as visitas, NCs, documentos e registos associados.`}
                className="text-[13px] text-[#B0402F] border border-[#F0CFC6] rounded-lg px-3.5 py-2"
              >
                Eliminar
              </ConfirmSubmitButton>
            </form>
          </div>
        }
      />

      <div className="flex items-center gap-1.5 text-[12px] text-[#8A8578] bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg px-3 py-2 mb-5 max-w-xl">
        <KeyRound size={13} />
        Código de acesso do cliente ao portal:
        <span className="font-mono font-medium text-[#14283A]">{obra.codigo_acesso}</span>
      </div>

      <div className="flex gap-5 border-b border-[#E4E1D6] mb-5">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/obras/${obraId}?tab=${encodeURIComponent(t)}`}
            className={`pb-2.5 -mb-px border-b-2 text-[13px] ${
              tab === t ? "border-[#C9A050] text-[#14283A] font-medium" : "border-transparent text-[#8A8578]"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {tab === "Geral" && <GeralTabData obraId={obraId} />}
      {tab === "Visitas" && <VisitasTabData obraId={obraId} />}
      {tab === "Documentos" && <DocumentosTabData obraId={obraId} />}
      {tab === "Orçamentos" && <OrcamentosTabData obraId={obraId} />}
      {tab === "Financeiro" && <FinanceiroTabData obraId={obraId} honorarioMensal={obra.honorario_mensal} />}
      {tab === "Intervenientes" && <IntervenientesTabData obraId={obraId} />}
    </>
  );
}

async function GeralTabData({ obraId }: { obraId: string }) {
  const supabase = await createClient();
  const { data: areas } = await supabase
    .from("obra_areas")
    .select("*")
    .eq("obra_id", obraId)
    .order("ordem", { ascending: true });
  return <GeralTab obraId={obraId} areas={areas ?? []} />;
}

async function VisitasTabData({ obraId }: { obraId: string }) {
  const supabase = await createClient();
  const { data: visitas } = await supabase
    .from("visitas_resumo")
    .select("*")
    .eq("obra_id", obraId)
    .order("data", { ascending: false });
  return <VisitasTab visitas={visitas ?? []} />;
}

async function DocumentosTabData({ obraId }: { obraId: string }) {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("documentos")
    .select("*")
    .eq("obra_id", obraId)
    .order("created_at", { ascending: false });
  const recebidos = (docs ?? []).filter((d) => d.direcao === "recebido");
  const enviados = (docs ?? []).filter((d) => d.direcao === "enviado");
  return <DocumentosTab obraId={obraId} recebidos={recebidos} enviados={enviados} />;
}

async function OrcamentosTabData({ obraId }: { obraId: string }) {
  const supabase = await createClient();
  const [{ data: itens }, { data: documentos }] = await Promise.all([
    supabase.from("orcamentos").select("*").eq("obra_id", obraId).order("created_at", { ascending: true }),
    supabase.from("documentos").select("*").eq("obra_id", obraId).not("orcamento_id", "is", null),
  ]);
  return <OrcamentosTab obraId={obraId} itens={itens ?? []} documentos={documentos ?? []} />;
}

async function FinanceiroTabData({ obraId, honorarioMensal }: { obraId: string; honorarioMensal: number | null }) {
  const supabase = await createClient();
  const { data: autos } = await supabase
    .from("faturacao_autos")
    .select("*")
    .eq("obra_id", obraId)
    .order("data", { ascending: false });
  return <FinanceiroTab obraId={obraId} honorarioMensal={honorarioMensal} autos={autos ?? []} />;
}

async function IntervenientesTabData({ obraId }: { obraId: string }) {
  const supabase = await createClient();
  const { data: itens } = await supabase
    .from("intervenientes")
    .select("*")
    .eq("obra_id", obraId)
    .order("created_at", { ascending: true });
  return <IntervenientesTab obraId={obraId} itens={itens ?? []} />;
}
