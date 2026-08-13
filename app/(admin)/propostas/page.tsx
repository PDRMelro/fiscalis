import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NovaPropostaModal } from "@/components/propostas/NovaPropostaModal";
import { EstadoPropostaSelect } from "@/components/propostas/EstadoPropostaSelect";
import { eliminarProposta } from "@/lib/actions/propostas";
import { formatarData } from "@/lib/format";

export default async function PropostasPage() {
  const supabase = await createClient();
  const { data: propostas } = await supabase.from("propostas").select("*").order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Propostas" subtitle="Pedidos de cliente e propostas enviadas" action={<NovaPropostaModal />} />
      <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        {(!propostas || propostas.length === 0) ? (
          <p className="px-5 py-8 text-center text-[13px] text-[#8A8578]">Ainda sem propostas registadas.</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Tipo de obra</th>
                <th className="px-5 py-3 font-medium">Local</th>
                <th className="px-5 py-3 font-medium">Enviada</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {propostas.map((p) => (
                <tr key={p.id} className="border-b border-[#F2F0E8] last:border-0 group">
                  <td className="px-5 py-3 font-mono text-[#14283A]">{p.codigo}</td>
                  <td className="px-5 py-3 text-[#1F1D19]">{p.cliente_nome}</td>
                  <td className="px-5 py-3 text-[#4A4740]">{p.tipo_obra}</td>
                  <td className="px-5 py-3 text-[#4A4740]">{p.local}</td>
                  <td className="px-5 py-3 text-[#8A8578] font-mono">{formatarData(p.enviada_em)}</td>
                  <td className="px-5 py-3">
                    <EstadoPropostaSelect id={p.id} estado={p.estado} />
                  </td>
                  <td className="px-5 py-3">
                    <form action={eliminarProposta.bind(null, p.id)}>
                      <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
