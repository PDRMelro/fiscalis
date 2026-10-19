import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditarPropostaForm } from "@/components/propostas/EditarPropostaForm";
import { construirLinkRegistoCliente } from "@/lib/inviteLink";

export default async function EditarPropostaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: proposta }, { data: obras }] = await Promise.all([
    supabase.from("propostas").select("*").eq("id", id).single(),
    supabase.from("obras").select("id, nome, codigo_acesso").order("nome"),
  ]);

  if (!proposta) notFound();

  const obraAssociada = obras?.find((o) => o.id === proposta.obra_id);
  const linkRegistoDonoObra = obraAssociada
    ? construirLinkRegistoCliente(obraAssociada.codigo_acesso, proposta.dono_obra_nome, proposta.dono_obra_email)
    : null;

  return (
    <>
      <PageHeader title={`Editar proposta ${proposta.codigo ?? ""}`} subtitle="Preço, periodicidade e geração do PDF" />
      <EditarPropostaForm
        proposta={proposta}
        obras={(obras ?? []).map((o) => ({ id: o.id, nome: o.nome }))}
        linkRegistoDonoObra={linkRegistoDonoObra}
      />
    </>
  );
}
