import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissaoToggle } from "@/components/clientes/PermissaoToggle";
import type { ReactNode } from "react";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("profiles")
    .select("*, obras(id, nome)")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  const linhas: ReactNode[] = [];
  const cartoes: ReactNode[] = [];

  for (const c of clientes ?? []) {
    const obra = c.obras as unknown as { id: string; nome: string } | null;

    linhas.push(
      <tr key={c.id} className={`border-b border-[#F2F0E8] last:border-0 ${c.ativo ? "" : "opacity-50"}`}>
        <td className="px-5 py-3 text-[#1F1D19]">{c.nome || "—"}</td>
        <td className="px-5 py-3 text-[#8A8578]">{c.email}</td>
        <td className="px-5 py-3 text-[#4A4740]">
          {obra ? (
            <Link href={`/obras/${obra.id}`} className="hover:underline">
              {obra.nome}
            </Link>
          ) : (
            "—"
          )}
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="ativo" valorInicial={c.ativo} />
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="pode_ver_relatorios" valorInicial={c.pode_ver_relatorios} />
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="pode_ver_nc" valorInicial={c.pode_ver_nc} />
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="pode_ver_documentos" valorInicial={c.pode_ver_documentos} />
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="pode_ver_financeiro" valorInicial={c.pode_ver_financeiro} />
        </td>
        <td className="px-3 py-3 text-center">
          <PermissaoToggle profileId={c.id} campo="pode_ver_intervenientes" valorInicial={c.pode_ver_intervenientes} />
        </td>
      </tr>
    );

    cartoes.push(
      <div key={c.id} className={`p-4 space-y-2.5 ${c.ativo ? "" : "opacity-50"}`}>
        <div>
          <p className="text-[13px] text-[#1F1D19]">{c.nome || "—"}</p>
          <p className="text-[12px] text-[#8A8578]">{c.email}</p>
          {obra && (
            <Link href={`/obras/${obra.id}`} className="text-[12px] text-[#4A4740] hover:underline">
              {obra.nome}
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-[#F2F0E8]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Ativo</span>
            <PermissaoToggle profileId={c.id} campo="ativo" valorInicial={c.ativo} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Relatórios</span>
            <PermissaoToggle profileId={c.id} campo="pode_ver_relatorios" valorInicial={c.pode_ver_relatorios} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Não conf.</span>
            <PermissaoToggle profileId={c.id} campo="pode_ver_nc" valorInicial={c.pode_ver_nc} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Documentos</span>
            <PermissaoToggle profileId={c.id} campo="pode_ver_documentos" valorInicial={c.pode_ver_documentos} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Financeiro</span>
            <PermissaoToggle profileId={c.id} campo="pode_ver_financeiro" valorInicial={c.pode_ver_financeiro} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#8A8578]">Interv.</span>
            <PermissaoToggle profileId={c.id} campo="pode_ver_intervenientes" valorInicial={c.pode_ver_intervenientes} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Contas de clientes registadas e o que cada uma pode ver no Portal do Cliente"
      />

      {linhas.length === 0 ? (
        <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-8 text-center text-[13px] text-[#8A8578] max-w-2xl">
          Ainda sem clientes registados. Os clientes criam a própria conta em{" "}
          <span className="font-mono text-[#4A4740]">/portal/signup</span>, usando o código de acesso que
          encontras na página de cada obra.
        </div>
      ) : (
        <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Obra</th>
                  <th className="px-3 py-3 font-medium text-center">Ativo</th>
                  <th className="px-3 py-3 font-medium text-center">Relatórios</th>
                  <th className="px-3 py-3 font-medium text-center">Não conf.</th>
                  <th className="px-3 py-3 font-medium text-center">Documentos</th>
                  <th className="px-3 py-3 font-medium text-center">Financeiro</th>
                  <th className="px-3 py-3 font-medium text-center">Interv.</th>
                </tr>
              </thead>
              <tbody>{linhas}</tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-[#F2F0E8]">{cartoes}</div>
        </div>
      )}

      <div className="max-w-2xl mt-4 text-[12px] text-[#8A8578] space-y-1">
        <p>
          <strong className="text-[#4A4740]">Ativo</strong> — desligar suspende de imediato o acesso desta conta a
          tudo, sem apagar a conta (podes voltar a ligar quando quiseres).
        </p>
        <p>
          <strong className="text-[#4A4740]">Financeiro</strong> — está desligado por omissão; os orçamentos e a
          faturação da obra só ficam visíveis no portal do cliente se ligares esta opção.
        </p>
        <p>Progresso da obra e visitas ficam sempre visíveis para clientes ativos — não são configuráveis.</p>
      </div>
    </>
  );
}
