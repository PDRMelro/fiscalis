import { redirect } from "next/navigation";
import { MapPin, User, ExternalLink, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { LOGO_SRC } from "@/lib/branding";
import { EstadoDot } from "@/components/ui/Tags";
import { clientLogout } from "@/lib/actions/auth";
import { formatarData, formatarDinheiro } from "@/lib/format";

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

  const [{ data: relatorios }, { data: ncs }, { data: documentos }, { data: orcamentos }, { data: autos }] =
    await Promise.all([
      supabase.from("relatorios").select("*").eq("obra_id", obra.id).order("data", { ascending: false }),
      supabase.from("nao_conformidades").select("*").eq("obra_id", obra.id).order("created_at", { ascending: false }),
      supabase.from("documentos").select("*").eq("obra_id", obra.id).order("created_at", { ascending: false }),
      // Só vêm dados aqui se o admin tiver ligado "Financeiro" para este cliente
      // (a Row Level Security filtra automaticamente — não é preciso verificar aqui).
      supabase.from("orcamentos").select("*").eq("obra_id", obra.id),
      supabase.from("faturacao_autos").select("*").eq("obra_id", obra.id).order("data", { ascending: false }),
    ]);

  const temAcessoFinanceiro = (orcamentos && orcamentos.length > 0) || (autos && autos.length > 0);

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Fiscalis" className="h-7 w-auto" />
            <span className="text-white text-[13px] font-medium">Fiscalis Engenharia</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#9FB0BF] flex items-center gap-1">
              <User size={12} /> {profile.nome}
            </span>
            <form action={clientLogout}>
              <button className="text-[11px] text-[#9FB0BF] hover:text-white underline underline-offset-2">
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[16px] font-semibold text-[#14283A]">{obra.nome}</p>
          <p className="text-[12px] text-[#8A8578] flex items-center gap-1 mt-1">
            <MapPin size={11} /> {obra.local}
            {obra.inicio && <> · Início: {formatarData(obra.inicio)}</>}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-[#EDEBE2] rounded-full overflow-hidden">
              <div className="h-full bg-[#C9A050] rounded-full" style={{ width: `${obra.progresso}%` }} />
            </div>
            <span className="text-[13px] font-mono text-[#14283A] font-medium">{obra.progresso}%</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-[12px] font-medium text-[#4A4740] mb-2">Relatórios disponíveis</p>
              <div className="space-y-1.5">
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

            <div>
              <p className="text-[12px] font-medium text-[#4A4740] mb-2">Não conformidades</p>
              <div className="space-y-1.5">
                {(!ncs || ncs.length === 0) && <p className="text-[12px] text-[#8A8578]">Sem registos.</p>}
                {ncs?.map((n) => (
                  <div key={n.id} className="flex items-center justify-between text-[12px] bg-[#F5F4EF] rounded-lg px-3 py-2">
                    <span className="text-[#1F1D19] truncate max-w-[160px]">{n.descricao}</span>
                    <EstadoDot estado={n.estado} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-medium text-[#4A4740] mb-2">Documentos do projeto</p>
            <div className="flex flex-wrap gap-2">
              {(!documentos || documentos.length === 0) && (
                <p className="text-[12px] text-[#8A8578]">Sem documentos.</p>
              )}
              {documentos?.map((d) => (
                <a
                  key={d.id}
                  href={`/api/documentos/${d.id}/download`}
                  className="text-[11px] text-[#4A4740] bg-[#F5F4EF] border border-[#E4E1D6] rounded px-2 py-1 hover:bg-[#EDEBE2]"
                >
                  {d.nome_ficheiro}
                </a>
              ))}
            </div>
          </div>
          {temAcessoFinanceiro && (
            <div className="mt-6">
              <p className="text-[12px] font-medium text-[#4A4740] mb-2">Financeiro</p>
              {orcamentos && orcamentos.length > 0 && (
                <div className="bg-[#F5F4EF] rounded-lg overflow-hidden mb-2">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-[#8A8578] border-b border-[#E4E1D6]">
                        <th className="px-3 py-2 font-medium">Serviço</th>
                        <th className="px-3 py-2 font-medium">Orçamentado</th>
                        <th className="px-3 py-2 font-medium">Executado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orcamentos.map((o) => (
                        <tr key={o.id} className="border-b border-[#E4E1D6] last:border-0">
                          <td className="px-3 py-2 text-[#1F1D19]">{o.servico}</td>
                          <td className="px-3 py-2 font-mono text-[#4A4740]">{formatarDinheiro(o.valor_orcamentado)}</td>
                          <td className="px-3 py-2 font-mono text-[#4A4740]">{formatarDinheiro(o.valor_executado)}</td>
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
          )}
        </div>
      </div>

      <div className="max-w-3xl mt-3 flex items-start gap-2 text-[12px] text-[#8A8578] bg-[#EAF0F7] border border-[#CFE0EE] rounded-lg px-3 py-2.5">
        <ShieldCheck size={14} className="text-[#2E5C8A] mt-0.5 shrink-0" />
        Só vês os dados da tua obra. O acesso é validado do lado do servidor (Supabase Row Level
        Security) e não apenas escondido na interface.
      </div>
    </div>
  );
}
