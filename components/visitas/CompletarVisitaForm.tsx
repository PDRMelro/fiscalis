"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completarVisita, registarFotoVisita, eliminarFotoVisita } from "@/lib/actions/visitas";
import { FotoPicker, type FotoSelecionada } from "@/components/visitas/FotoPicker";
import { nomeSeguro } from "@/lib/nomeSeguro";
import type { VisitaRow } from "@/lib/supabase/types";

export function CompletarVisitaForm({
  visita,
  obraNome,
  fotosExistentes,
}: {
  visita: VisitaRow;
  obraNome: string;
  fotosExistentes: { id: string; nome_ficheiro: string; url: string | null }[];
}) {
  const router = useRouter();
  const jaRealizada = visita.estado === "Realizada";
  const [data, setData] = useState(visita.data);
  const [notas, setNotas] = useState(visita.notas ?? "");
  const [fotos, setFotos] = useState<FotoSelecionada[]>([]);
  const [pending, startTransition] = useTransition();
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function guardar() {
    setErro(null);
    if (!data) {
      setErro("Confirma a data da visita.");
      return;
    }

    startTransition(async () => {
      try {
        setProgresso("A guardar...");
        const resultado = await completarVisita(visita.id, visita.obra_id, data, notas);
        if (resultado.error) {
          setErro(resultado.error);
          setProgresso(null);
          return;
        }

        const supabase = createClient();
        const erros: string[] = [];

        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i];
          setProgresso(fotos.length > 1 ? `A enviar foto ${i + 1}/${fotos.length}...` : "A enviar foto...");
          try {
            const path = `${visita.obra_id}/${visita.id}/${crypto.randomUUID()}-${nomeSeguro(foto.nome)}`;
            const { error: uploadError } = await supabase.storage
              .from("visita-fotos")
              .upload(path, foto.file, { contentType: foto.file.type || undefined });
            if (uploadError) {
              erros.push(`${foto.nome}: ${uploadError.message}`);
              continue;
            }
            const registo = await registarFotoVisita(visita.id, visita.obra_id, { nome: foto.nome, path });
            if (registo.error) erros.push(`${foto.nome}: ${registo.error}`);
          } catch (err) {
            console.error("Falha ao enviar foto", foto.nome, err);
            erros.push(`${foto.nome}: falha inesperada ao enviar.`);
          }
        }

        setProgresso(null);
        if (erros.length > 0) {
          setErro(`Visita guardada, mas houve problemas com algumas fotos: ${erros.join(" · ")}`);
          return;
        }

        router.push("/visitas");
      } catch (err) {
        console.error("CompletarVisitaForm falhou", err);
        setProgresso(null);
        setErro("Falha inesperada. Verifica a ligação e tenta outra vez.");
      }
    });
  }

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra</label>
          <p className="px-3 py-2 rounded-lg border border-[#EDEBE2] bg-[#F5F4EF] text-[13px] text-[#4A4740]">{obraNome}</p>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data da visita</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
          />
        </div>
      </div>

      <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Notas da visita</label>
      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        rows={3}
        placeholder="Especialidades verificadas, observações..."
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A] resize-none mb-4"
      />

      {fotosExistentes.length > 0 && (
        <div className="mb-4">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Fotos já anexadas</label>
          <div className="grid grid-cols-4 gap-2">
            {fotosExistentes.map((f) => (
              <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#E4E1D6]">
                {f.url && <img src={f.url} alt={f.nome_ficheiro} className="w-full h-full object-cover" />}
                <form
                  action={async () => {
                    await eliminarFotoVisita(visita.id, visita.obra_id, f.id);
                  }}
                >
                  <button
                    type="submit"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
        Adicionar fotos {fotos.length > 0 && `(${fotos.length})`}
      </label>
      <FotoPicker fotos={fotos} onChange={setFotos} />

      {progresso && <p className="text-[12px] text-[#C9A050] mt-3">{progresso}</p>}
      {erro && <p className="text-[12px] text-[#B0402F] mt-3">{erro}</p>}

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={guardar}
          disabled={pending}
          className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "A guardar..." : jaRealizada ? "Guardar alterações" : "Completar visita"}
        </button>
        <a href="/visitas" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
          Cancelar
        </a>
      </div>

      {jaRealizada && (
        <p className="text-[11px] text-[#8A8578] mt-3">
          Se já tiveres um relatório gerado para esta visita, usa o botão de atualizar (ao lado de &ldquo;Ver
          PDF&rdquo;, na lista de Visitas) depois de guardares, para o PDF refletir estas alterações.
        </p>
      )}
    </div>
  );
}
