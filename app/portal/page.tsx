import { redirect } from "next/navigation";
import { MapPin, User, ExternalLink, ShieldCheck, Users, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { LOGO_SRC } from "@/lib/branding";
import { clientLogout } from "@/lib/actions/auth";
import { DocumentosClienteSection } from "@/components/portal/DocumentosClienteSection";
import { OrcamentoDocumentosClienteButton } from "@/components/portal/OrcamentoDocumentosClienteButton";
import { CalendarioPortalCliente } from "@/components/portal/CalendarioPortalCliente";
import { NCListaCliente } from "@/components/portal/NCListaCliente";
import { ContaClienteModal } from "@/components/portal/ContaClienteModal";
import { PortalTourController } from "@/components/portal/PortalTourController";
import type { PassoTour } from "@/components/portal/TourOnboarding";
import { formatarData, formatarDinheiro, comIva } from "@/lib/format";

export default async function PortalHomePage() {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (profile?.role === "admin") redirect("/dashboard");

  const { data: obra } = profile?.obra_id
    ? await supabase.from("obras").select("*").eq("id", profile.obra_id).maybeSingle()
    : { data: null };

  if (!profile || !obra) {
    return (
      <div className="w-full max-w-sm bg-white border border-[#E4E1D6] rounded-xl p-6 text-center">
        <p className="text-[13px] text-[#4A4740]">
          A tua conta ainda não está associada a nenhuma obra. Contacta o teu engenheiro fiscal.
        </p>
        <form action={clientLogout} className="mt-4">
          <button className="text-[12px] text-[#8A8578] underline underline-offset-2">Sair</button>
        </form>
      </div>
    );
  }

  const [{ data: relatorios }, { data: ncs }, { data: documentos }, { data: orcamentos }, { data: autos }, { data: intervenientes }, { data: visitas }] =
    await Promise.all([
      supabase.from("relatorios").select("*").eq("obra_id", obra.id).order("data", { ascending: false }),
      supabase.from("nao_conformidades").select("*").eq("obra_id", obra.id).order("created_at", { ascending: false }),
      supabase.from("documentos").select("*").eq("obra_id", obra.id).order("created_at", { ascending: false }),
      // Só vêm dados aqui se o admin tiver ligado "Financeiro" para este cliente
      // (a Row Level Security filtra automaticamente — não é preciso verificar aqui).
      supabase.from("orcamentos").select("*").eq("obra_id", obra.id),
      supabase.from("faturacao_autos").select("*").eq("obra_id", obra.id).order("data", { ascending: false }),
      // Idem para "Intervenientes" — só vem algo se pode_ver_intervenientes estiver ligado.
      supabase
        .from("intervenientes")
        .select("*")
        .eq("obra_id", obra.id)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("visitas_resumo").select("*").eq("obra_id", obra.id).order("data", { ascending: true }),
    ]);

  const temAcessoFinanceiro = (orcamentos && orcamentos.length > 0) || (autos && autos.length > 0);

  // Compara com o "último visto" ANTES de o atualizar, para saber o que é
  // novo desde a última vez que o cliente entrou no portal. Numa conta
  // nova (primeiro login, portal_visto_em ainda nulo) não mostra nada —
  // não faz sentido "novidades" para tudo o que já existia.
  const ultimaVisita = profile.portal_visto_em;
  let novidades: { relatorios: number; ncs: number; documentos: number; visitas: number } | null = null;
  if (ultimaVisita) {
    const desde = new Date(ultimaVisita).getTime();
    novidades = {
      relatorios: (relatorios ?? []).filter((r) => new Date(r.created_at).getTime() > desde).length,
      ncs: (ncs ?? []).filter((n) => new Date(n.created_at).getTime() > desde).length,
      documentos: (documentos ?? []).filter((d) => d.direcao === "enviado" && new Date(d.created_at).getTime() > desde).length,
      visitas: (visitas ?? []).filter((v) => new Date(v.created_at).getTime() > desde).length,
    };
  }
  const totalNovidades = novidades ? novidades.relatorios + novidades.ncs + novidades.documentos + novidades.visitas : 0;

  await supabase.from("profiles").update({ portal_visto_em: new Date().toISOString() }).eq("id", user.id);

  const passosTour: PassoTour[] = [
    {
      alvo: "tour-obra",
      titulo: "A tua obra",
      texto: `Aqui vês o nome, localização e o progresso de "${obra.nome}", atualizado pelo teu engenheiro fiscal.`,
    },
    {
      alvo: "tour-relatorios",
      titulo: "Relatórios",
      texto: "Cada visita à obra pode gerar um relatório em PDF — encontras todos aqui, prontos a descarregar.",
    },
    {
      alvo: "tour-nc",
      titulo: "Não conformidades",
      texto: "Sempre que for identificado algo a corrigir em obra, aparece aqui. Clica numa para ver todos os detalhes e fotos.",
    },
    {
      alvo: "tour-calendario",
      titulo: "Calendário de visitas",
      texto: "Vês as visitas agendadas e já realizadas. Clica numa para ver as notas e as fotos tiradas em obra.",
    },
    {
      alvo: "tour-documentos",
      titulo: "Documentos",
      texto: "Aqui trocamos ficheiros — os que recebes do teu engenheiro fiscal e os que lhe podes enviar, organizados por categoria.",
    },
  ];
  if (temAcessoFinanceiro) {
    passosTour.push({
      alvo: "tour-financeiro",
      titulo: "Financeiro",
      texto: "Acompanha os orçamentos e a faturação associados à tua obra.",
    });
  }
  if (profile.pode_ver_intervenientes && intervenientes && intervenientes.length > 0) {
    passosTour.push({
      alvo: "tour-intervenientes",
      titulo: "Intervenientes",
      texto: "Consulta os contactos de quem está envolvido na tua obra.",
    });
  }
  passosTour.push({
    alvo: "tour-conta",
    titulo: "A tua conta",
    texto: "Aqui podes sempre mudar o teu nome ou a palavra-passe.",
  });

  return (
    <div className="w-full max-w-3xl lg:max-w-6xl lg:h-[calc(100vh-3rem)] lg:flex lg:flex-col">
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
        <div className="bg-[#14283A] px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-y-2 lg:shrink-0">
          <div className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Fiscalis" className="h-7 w-auto" />
            <span className="hidden sm:inline text-white text-[13px] font-medium">Fiscalis Engenharia</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex text-[11px] text-[#9FB0BF] items-center gap-1">
              <User size={12} /> {profile.nome}
            </span>
            <PortalTourController passos={passosTour} nome={profile.nome} tourConcluido={profile.tour_concluido} />
            <ContaClienteModal nomeAtual={profile.nome} />
            <form action={clientLogout}>
              <button className="text-[11px] text-[#9FB0BF] hover:text-white underline underline-offset-2">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="p-6 lg:flex-1 lg:flex lg:flex-col lg:min-h-0 lg:overflow-hidden">
          {totalNovidades > 0 && novidades && (
            <div className="flex items-start gap-2.5 bg-[#FBF7EC] border border-[#E9CE8F] rounded-lg px-4 py-3 mb-5 lg:shrink-0">
              <Sparkles size={16} className="text-[#8A4A17] mt-0.5 shrink-0" />
              <div className="text-[12px] text-[#4A4740]">
                <p className="font-medium text-[#14283A] mb-0.5">Novidades desde a tua última visita</p>
                <p>
                  {[
                    novidades.relatorios > 0 && `${novidades.relatorios} relatório${novidades.relatorios > 1 ? "s" : ""}`,
                    novidades.ncs > 0 && `${novidades.ncs} não conformidade${novidades.ncs > 1 ? "s" : ""}`,
                    novidades.documentos > 0 && `${novidades.documentos} documento${novidades.documentos > 1 ? "s" : ""}`,
                    novidades.visitas > 0 && `${novidades.visitas} visita${novidades.visitas > 1 ? "s" : ""} agendada${novidades.visitas > 1 ? "s" : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
          )}

          <div id="tour-obra" className="lg:shrink-0">
            <p className="text-[12px] text-[#C9A050] font-medium mb-1">Bem-vindo, {profile.nome.split(" ")[0]}</p>
            <p className="text-[16px] font-semibold text-[#14283A] break-words">{obra.nome}</p>
            <p className="text-[12px] text-[#8A8578] flex items-start gap-1 mt-1 break-words">
              <MapPin size={11} className="shrink-0 mt-0.5" />
              <span>
                {obra.local}
                {obra.inicio && <> · Início: {formatarData(obra.inicio)}</>}
              </span>
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#EDEBE2] rounded-full overflow-hidden">
                <div className="h-full bg-[#C9A050] rounded-full" style={{ width: `${obra.progresso}%` }} />
              </div>
              <span className="text-[13px] font-mono text-[#14283A] font-medium">{obra.progresso}%</span>
            </div>
          </div>

          <div className="mt-6 lg:mt-4 lg:flex-1 lg:min-h-0 lg:grid lg:grid-cols-3 lg:auto-rows-fr lg:gap-4 lg:overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:contents">
              <div
                id="tour-relatorios"
                className="lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-hidden"
              >
                <p className="text-[12px] font-medium text-[#4A4740] mb-2 lg:shrink-0">Relatórios disponíveis</p>
                <div className="space-y-1.5 lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                  {(!relatorios || relatorios.length === 0) && (
                    <p className="text-[12px] text-[#8A8578]">Ainda sem relatórios.</p>
                  )}
                  {relatorios?.map((r) => (
                    <a
                      key={r.id}
                      href={r.storage_path ? `/api/relatorios/${r.id}/download` : undefined}
                      className="flex items-center justify-between text-[12px] bg-[#F5F4EF] rounded-lg px-3 py-2 hover:bg-[#EDEBE2]"
                    >
                      <span className="text-[#1F1D19]">{formatarData(r.data)}</span>
                      <ExternalLink size={12} className="text-[#8A8578]" />
                    </a>
                  ))}
                </div>
              </div>

              <div
                id="tour-nc"
                className="lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-hidden"
              >
                <p className="text-[12px] font-medium text-[#4A4740] mb-2 lg:shrink-0">Não conformidades</p>
                <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                  <NCListaCliente ncs={ncs ?? []} />
                </div>
              </div>
            </div>

            <div
              id="tour-calendario"
              className="mt-6 lg:mt-0 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-hidden"
            >
              <p className="text-[12px] font-medium text-[#4A4740] mb-2 lg:shrink-0">Calendário de visitas</p>
              <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                <div className="flex items-center gap-4 mb-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#8A8578]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FBF0DC] border border-[#E8C98F]" /> Agendada
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[#8A8578]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#E9F5EC] border border-[#B9DCC2]" /> Realizada
                  </span>
                </div>
                <CalendarioPortalCliente visitas={visitas ?? []} />
              </div>
            </div>

            <div
              id="tour-documentos"
              className="lg:self-start lg:max-h-full lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-y-auto"
            >
              <DocumentosClienteSection
                obraId={obra.id}
                documentos={documentos ?? []}
                podeEnviar={profile.pode_ver_documentos}
                orcamentos={orcamentos ?? []}
              />
            </div>
            {temAcessoFinanceiro && (
              <div
                id="tour-financeiro"
                className="mt-6 lg:mt-0 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-hidden"
              >
                <p className="text-[12px] font-medium text-[#4A4740] mb-2 lg:shrink-0">Financeiro</p>
                <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                {orcamentos && orcamentos.length > 0 && (
                  <div className="bg-[#F5F4EF] rounded-lg overflow-x-auto mb-2">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[#8A8578] border-b border-[#E4E1D6]">
                        <th className="px-3 py-2 font-medium">Serviço</th>
                        <th className="px-3 py-2 font-medium">Orçamentado</th>
                        <th className="px-3 py-2 font-medium">Executado</th>
                        <th className="px-3 py-2 font-medium">Docs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamentos.map((o) => (
                        <tr key={o.id} className="border-b border-[#E4E1D6] last:border-0">
                          <td className="px-3 py-2 text-[#1F1D19]">{o.servico}</td>
                          <td className="px-3 py-2 font-mono text-[#4A4740]">
                            <div>{formatarDinheiro(o.valor_orcamentado)}</div>
                            <div className="text-[10px] text-[#8A8578]">
                              {formatarDinheiro(comIva(o.valor_orcamentado, o.taxa_iva))} c/ IVA
                            </div>
                          </td>
                          <td className="px-3 py-2 font-mono text-[#4A4740]">
                            <div>{formatarDinheiro(o.valor_executado)}</div>
                            <div className="text-[10px] text-[#8A8578]">
                              {formatarDinheiro(comIva(o.valor_executado, o.taxa_iva))} c/ IVA
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <OrcamentoDocumentosClienteButton
                              obraId={obra.id}
                              orcamentoId={o.id}
                              servico={o.servico}
                              documentos={documentos ?? []}
                              podeEnviar={profile.pode_ver_documentos}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {autos && autos.length > 0 && (
                <div className="space-y-1.5">
                  {autos.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-[12px] bg-[#F5F4EF] rounded-lg px-3 py-2">
                      <span className="text-[#1F1D19]">
                        {a.numero} · {formatarData(a.data)}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[#4A4740]">{formatarDinheiro(a.valor)}</span>
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded"
                          style={
                            a.estado === "Pago"
                              ? { backgroundColor: "#E3EEE6", color: "#2C6B45" }
                              : { backgroundColor: "#FBEAD9", color: "#8A4A17" }
                          }
                        >
                          {a.estado}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
                </div>
              </div>
            )}

            {profile.pode_ver_intervenientes && intervenientes && intervenientes.length > 0 && (
              <div
                id="tour-intervenientes"
                className="mt-6 lg:mt-0 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:bg-white lg:border lg:border-[#E4E1D6] lg:rounded-lg lg:p-3 lg:overflow-hidden"
              >
                <p className="text-[12px] font-medium text-[#4A4740] mb-2 lg:shrink-0">Intervenientes</p>
                <div className="lg:flex-1 lg:overflow-y-auto lg:min-h-0">
                <div className="bg-[#F5F4EF] rounded-lg divide-y divide-[#E4E1D6]">
                {intervenientes.map((p) => {
                  const detalhe =
                    p.tipo === "Construtora" && p.empresa
                      ? p.empresa
                      : (p.tipo === "Direção de Obra" || p.tipo === "Arquitetura") && p.cedula_profissional
                        ? `Cédula${p.colegio ? ` ${p.colegio}` : ""} n.º ${p.cedula_profissional}`
                        : null;
                  return (
                    <div key={p.id} className="flex items-center gap-2.5 px-3 py-2.5">
                      <Users size={13} className="text-[#8A8578] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#1F1D19] break-words">{p.nome}</p>
                        <p className="text-[11px] text-[#8A8578] break-words">
                          {p.papel} {p.contacto && <>· {p.contacto}</>}
                          {detalhe && <> · {detalhe}</>}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 text-[12px] text-[#8A8578] bg-[#EAF0F7] border border-[#CFE0EE] rounded-lg px-3 py-2.5 lg:shrink-0">
        <ShieldCheck size={14} className="text-[#2E5C8A] mt-0.5 shrink-0" />
        Só vês os dados da tua obra. O acesso é validado do lado do servidor (Supabase Row Level
        Security) e não apenas escondido na interface.
      </div>
    </div>
  );
}
