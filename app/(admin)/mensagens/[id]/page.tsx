import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

  const { data: podeConversar } = await supabase.rpc("pode_conversar", { p_outro_id: id });
  if (!podeConversar) notFound();

  const { data: outraPessoa } = await supabase.from("profiles").select("id, nome").eq("id", id).single();
  if (!outraPessoa) notFound();

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
