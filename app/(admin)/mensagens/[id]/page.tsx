import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConversaMensagens } from "@/components/mensagens/ConversaMensagens";
import { marcarConversaComoLida } from "@/lib/actions/mensagens";

export default async function ConversaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) redirect("/login");

  const [{ data: podeConversar, error: podeConversarError }, { data: outraPessoa, error: outraPessoaError }] =
    await Promise.all([
      supabase.rpc("pode_conversar", { p_outro_id: id }),
      supabase.from("profiles").select("id, nome").eq("id", id).maybeSingle(),
    ]);

  if (podeConversarError) console.error("ConversaPage: falha em pode_conversar", podeConversarError);
  if (outraPessoaError) console.error("ConversaPage: falha ao ler perfil do contacto", outraPessoaError);

  if (podeConversarError || outraPessoaError || !podeConversar || !outraPessoa) {
    return (
      <>
        <Link
          href="/mensagens"
          className="flex items-center gap-1 text-[13px] text-[#8A8578] mb-4 hover:text-[#14283A] w-fit"
        >
          <ChevronLeft size={15} /> Voltar às mensagens
        </Link>
        <PageHeader title="Não foi possível abrir esta conversa" />
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl text-[12px] text-[#4A4740] space-y-2 font-mono">
          <p>pode_conversar: {String(podeConversar)}{podeConversarError ? ` — erro: ${podeConversarError.message}` : ""}</p>
          <p>perfil encontrado: {outraPessoa ? "sim" : "não"}{outraPessoaError ? ` — erro: ${outraPessoaError.message}` : ""}</p>
        </div>
      </>
    );
  }

  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("*")
    .or(`and(remetente_id.eq.${user.id},destinatario_id.eq.${id}),and(remetente_id.eq.${id},destinatario_id.eq.${user.id})`)
    .order("criado_em", { ascending: true });

  await marcarConversaComoLida(id);

  return (
    <>
      <Link
        href="/mensagens"
        className="flex items-center gap-1 text-[13px] text-[#8A8578] mb-4 hover:text-[#14283A] w-fit"
      >
        <ChevronLeft size={15} /> Voltar às mensagens
      </Link>
      <PageHeader title={outraPessoa.nome} />
      <ConversaMensagens destinatarioId={id} mensagens={mensagens ?? []} meuId={user.id} />
    </>
  );
}
