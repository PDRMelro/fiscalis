import Link from "next/link";
import { FileArchive, Trash2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { eliminarDocumento } from "@/lib/actions/documentos";
import { DocumentoDropzone } from "@/components/obras/DocumentoDropzone";

function tamanho(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentosPage() {
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");
  const { data: documentos } = await supabase
    .from("documentos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Documentos" subtitle="Ficheiros de projeto por obra" />
      <div className="space-y-5">
        {(obras ?? []).map((o) => {
          const docs = (documentos ?? []).filter((d) => d.obra_id === o.id);
          return (
            <div key={o.id} className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#EDEBE2] flex items-center justify-between gap-3">
                <Link href={`/obras/${o.id}?tab=Documentos`} className="text-[13px] font-medium text-[#14283A] hover:underline">
                  {o.nome}
                </Link>
                <div className="w-64 shrink-0">
                  <DocumentoDropzone obraId={o.id} direcao="recebido" compacto />
                </div>
              </div>
              {docs.length === 0 ? (
                <p className="px-5 py-4 text-[12px] text-[#8A8578]">Sem documentos.</p>
              ) : (
                <div className="divide-y divide-[#F2F0E8]">
                  {docs.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 px-5 py-2.5 group">
                      {d.direcao === "enviado" ? (
                        <ShieldCheck size={15} className="text-[#8A4A17] shrink-0" />
                      ) : (
                        <FileArchive size={15} className="text-[#8A8578] shrink-0" />
                      )}
                      <a
                        href={`/api/documentos/${d.id}/download`}
                        className="text-[12px] text-[#1F1D19] flex-1 truncate hover:underline"
                      >
                        {d.nome_ficheiro}
                      </a>
                      <span className="text-[11px] text-[#8A8578] bg-[#F5F4EF] rounded px-2 py-0.5">
                        {d.categoria || d.tipo || (d.direcao === "enviado" ? "Enviado" : "Recebido")}
                      </span>
                      <span className="text-[11px] text-[#8A8578] font-mono w-16 text-right">{tamanho(d.tamanho_bytes)}</span>
                      <form action={eliminarDocumento.bind(null, o.id, d.id)}>
                        <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {(!obras || obras.length === 0) && (
          <div className="bg-white border border-dashed border-[#C7C3B6] rounded-xl p-8 text-center text-[13px] text-[#8A8578]">
            Cria primeiro uma obra para poderes adicionar documentos.
          </div>
        )}
      </div>
    </>
  );
}
