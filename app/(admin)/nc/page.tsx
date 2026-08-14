import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SeveridadeTag } from "@/components/ui/Tags";
import { EstadoNCSelect } from "@/components/nc/EstadoNCSelect";
import { GerarPdfNCButton } from "@/components/nc/GerarPdfNCButton";
import { eliminarNC } from "@/lib/actions/nc";
import { formatarData } from "@/lib/format";

export default async function NaoConformidadesPage() {
  const supabase = await createClient();
  const { data: ncs } = await supabase
    .from("nao_conformidades")
    .select("*, obras(id, nome)")
    .order("created_at", { ascending: false });

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
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {(!ncs || ncs.length === 0) ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8578]">Ainda sem não conformidades registadas.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                <th className="px-5 py-3 font-medium">Ref.</th>
                <th className="px-5 py-3 font-medium">Obra</th>
                <th className="px-5 py-3 font-medium">Descrição</th>
                <th className="px-5 py-3 font-medium">Severidade</th>
                <th className="px-5 py-3 font-medium">Responsável</th>
                <th className="px-5 py-3 font-medium">Prazo</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">PDF</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {ncs.map((n) => {
                const obra = n.obras as unknown as { id: string; nome: string } | null;
                return (
                  <tr key={n.id} className="border-b border-[#F2F0E8] last:border-0 group">
                    <td className="px-5 py-3 font-mono text-[#14283A]">{n.codigo}</td>
                    <td className="px-5 py-3 text-[#4A4740]">
                      {obra && (
                        <Link href={`/obras/${obra.id}`} className="hover:underline">
                          {obra.nome}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#1F1D19] max-w-[280px]">{n.descricao}</td>
                    <td className="px-5 py-3">
                      <SeveridadeTag nivel={n.severidade} />
                    </td>
                    <td className="px-5 py-3 text-[#8A8578]">{n.responsavel || "—"}</td>
                    <td className="px-5 py-3 text-[#8A8578] font-mono">{formatarData(n.prazo)}</td>
                    <td className="px-5 py-3">
                      <EstadoNCSelect id={n.id} estado={n.estado} />
                    </td>
                    <td className="px-5 py-3">
                      <GerarPdfNCButton ncId={n.id} pdfPath={n.pdf_path} />
                    </td>
                    <td className="px-5 py-3">
                      <form action={eliminarNC.bind(null, n.id)}>
                        <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
