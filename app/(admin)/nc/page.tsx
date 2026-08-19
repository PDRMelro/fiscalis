import Link from "next/link";
import { Plus, Pencil, Trash2, AlarmClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SeveridadeTag } from "@/components/ui/Tags";
import { EstadoNCSelect } from "@/components/nc/EstadoNCSelect";
import { GerarPdfNCButton } from "@/components/nc/GerarPdfNCButton";
import { eliminarNC } from "@/lib/actions/nc";
import { formatarData } from "@/lib/format";
import type { ReactNode } from "react";

export default async function NaoConformidadesPage() {
  const supabase = await createClient();
  const { data: ncs } = await supabase
    .from("nao_conformidades")
    .select("*, obras(id, nome)")
    .order("created_at", { ascending: false });

  const hojeISO = new Date().toISOString().slice(0, 10);

  const cartoes: ReactNode[] = [];

  for (const n of ncs ?? []) {
    const obra = n.obras as unknown as { id: string; nome: string } | null;
    const atrasada = n.estado !== "Encerrada" && !!n.prazo && n.prazo < hojeISO;

    cartoes.push(
      <div
        key={n.id}
        className={`bg-white border rounded-xl p-4 space-y-2.5 ${atrasada ? "border-[#F0CFC6] bg-[#FCF3F1]" : "border-[#E4E1D6]"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-[13px] text-[#14283A]">{n.codigo}</p>
            {obra && (
              <Link href={`/obras/${obra.id}`} className="text-[13px] text-[#4A4740] hover:underline">
                {obra.nome}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/nc/${n.id}/editar`} className="text-[#8A8578] hover:text-[#14283A]">
              <Pencil size={13} />
            </Link>
            <form action={eliminarNC.bind(null, n.id)}>
              <button type="submit" className="text-[#B0402F]">
                <Trash2 size={13} />
              </button>
            </form>
          </div>
        </div>
        <p className="text-[13px] text-[#1F1D19]">{n.descricao}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <SeveridadeTag nivel={n.severidade} />
          <span className={`text-[12px] font-mono flex items-center gap-1 ${atrasada ? "text-[#B0402F] font-medium" : "text-[#8A8578]"}`}>
            {atrasada && <AlarmClock size={12} />}
            {formatarData(n.prazo)}
          </span>
          {n.responsavel && <span className="text-[12px] text-[#8A8578]">{n.responsavel}</span>}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F2F0E8]">
          <EstadoNCSelect id={n.id} estado={n.estado} />
          <GerarPdfNCButton ncId={n.id} pdfPath={n.pdf_path} />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Não conformidades"
        subtitle="Registo de não conformidades em obra"
        action={
          <Link
            href="/nc/nova"
            className="flex items-center gap-1.5 text-[13px] text-white bg-[#14283A] rounded-lg px-3.5 py-2"
          >
            <Plus size={14} /> Nova não conformidade
          </Link>
        }
      />
      {cartoes.length === 0 ? (
        <div className="bg-white border border-[#E4E1D6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
          Ainda sem não conformidades registadas.
        </div>
      ) : (
        <div className="flex flex-col gap-4">{cartoes}</div>
      )}
    </>
  );
}
