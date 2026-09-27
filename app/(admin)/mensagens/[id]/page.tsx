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

  const { data: outraPessoa, error: outraPessoaError } = await supabase
    .rpc("pessoa_conversa", { p_id: id })
    .maybeSingle();

  if (outraPessoaError) console.error("ConversaPage: falha em pessoa_conversa", outraPessoaError);

  if (outraPessoaError || !outraPessoa) {
    return (
      <>
        <Link
          href="/mensagens"
          className="flex items-center gap-1 text-[13px] text-[#8A8578] mb-4 hover:text-[#14283A] w-fit"
        >
          <ChevronLeft size={15} /> Voltar às mensagens
        </Link>
        <PageHeader title="Não foi possível abrir esta conversa" />
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl text-[12px] text-[#4A4740] font-mono">
          <p>{outraPessoaError ? `erro: ${outraPessoaError.message}` : "Esta conversa não é permitida."}</p>
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
