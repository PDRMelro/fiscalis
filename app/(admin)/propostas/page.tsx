import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaPropostaModal } from "@/components/propostas/NovaPropostaModal";
import { EstadoPropostaSelect } from "@/components/propostas/EstadoPropostaSelect";
import { GerarPdfPropostaButton } from "@/components/propostas/GerarPdfPropostaButton";
import { eliminarProposta } from "@/lib/actions/propostas";
import { formatarData } from "@/lib/format";

export default async function PropostasPage() {
  const supabase = await createClient();
  const [{ data: propostas }, { data: obras }] = await Promise.all([
    supabase.from("propostas").select("*").order("created_at", { ascending: false }),
    supabase.from("obras").select("id, nome").order("nome"),
  ]);

  return (
    <>
      <PageHeader
        title="Propostas"
        subtitle="Pedidos de cliente e propostas enviadas"
        action={<NovaPropostaModal obras={obras ?? []} />}
      />
      {(!propostas || propostas.length === 0) ? (
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
          Ainda sem propostas registadas.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {propostas.map((p) => (
            <div key={p.id} className="bg-white border border-[#E4E1D6] rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-[13px] text-[#14283A]">{p.codigo}</p>
                    <span className="text-[10px] font-medium text-[#8A6A2E] bg-[#FBF0DC] border border-[#E8C98F] rounded px-1.5 py-0.5">
                      {p.tipo_servico === "consultoria" ? "Consultoria" : "Fiscalização"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#1F1D19]">{p.cliente_nome}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/propostas/${p.id}/editar`} className="text-[#8A8578] hover:text-[#14283A]">
                    <Pencil size={13} />
                  </Link>
                  <form action={eliminarProposta.bind(null, p.id)}>
                    <button type="submit" className="text-[#B0402F]">
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-[13px] text-[#4A4740]">
                {p.tipo_obra} · {p.local}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#F2F0E8]">
                <span className="text-[12px] text-[#8A8578] font-mono">{formatarData(p.enviada_em)}</span>
                <div className="flex items-center gap-2">
                  <EstadoPropostaSelect id={p.id} estado={p.estado} />
                  <GerarPdfPropostaButton propostaId={p.id} pdfPath={p.pdf_path} temObra={!!p.obra_id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
