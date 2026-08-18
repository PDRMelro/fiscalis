"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { criarNC, registarFotoNC } from "@/lib/actions/nc";
import { FotoPicker, type FotoSelecionada } from "@/components/visitas/FotoPicker";
import { CamposNC } from "@/components/nc/CamposNC";
import { nomeSeguro } from "@/lib/nomeSeguro";
import { formatarData } from "@/lib/format";

export function NovaNCForm({
  obras,
  obraIdInicial,
  visitaId,
  visitaData,
}: {
  obras: { id: string; nome: string }[];
  obraIdInicial?: string;
  visitaId?: string;
  visitaData?: string;
}) {
  const router = useRouter();
  const [obraId, setObraId] = useState(obraIdInicial ?? "");
  const obraNome = obras.find((o) => o.id === obraId)?.nome;
  const [fotos, setFotos] = useState<FotoSelecionada[]>([]);
  const [pending, startTransition] = useTransition();
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function guardar(formData: FormData) {
    setErro(null);
    if (!obraId) {
      setErro("Escolhe a obra.");
      return;
    }

    startTransition(async () => {
      try {
        setProgresso("A criar registo...");
        const resultado = await criarNC(formData);
        if (resultado.error || !resultado.ncId) {
          setErro(resultado.error ?? "Não foi possível criar a não conformidade.");
          setProgresso(null);
          return;
        }

        const ncId = resultado.ncId;
        const supabase = createClient();
        const erros: string[] = [];

        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i];
          setProgresso(fotos.length > 1 ? `A enviar foto ${i + 1}/${fotos.length}...` : "A enviar foto...");
          try {
            const path = `${obraId}/${ncId}/${crypto.randomUUID()}-${nomeSeguro(foto.nome)}`;
            const { error: uploadError } = await supabase.storage
              .from("nc-anexos")
              .upload(path, foto.file, { contentType: foto.file.type || undefined });
            if (uploadError) {
              erros.push(`${foto.nome}: ${uploadError.message}`);
              continue;
            }
            const registo = await registarFotoNC(ncId, { nome: foto.nome, path });
            if (registo.error) erros.push(`${foto.nome}: ${registo.error}`);
          } catch (err) {
            console.error("Falha ao enviar foto", foto.nome, err);
            erros.push(`${foto.nome}: falha inesperada ao enviar.`);
          }
        }

        setProgresso(null);
        if (erros.length > 0) {
          setErro(`Não conformidade guardada, mas houve problemas com algumas fotos: ${erros.join(" · ")}`);
          return;
        }

        router.push("/nc");
      } catch (err) {
        console.error("NovaNCForm falhou", err);
        setProgresso(null);
        setErro("Falha inesperada. Verifica a ligação e tenta outra vez.");
      }
    });
  }

  return (
    <form action={guardar} className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-2xl space-y-4">
      {visitaId && (
        <>
          <input type="hidden" name="visita_id" value={visitaId} />
          <p className="text-[12px] text-[#8A4A17] bg-[#FBF0DC] border border-[#E8C98F] rounded-lg px-3 py-2">
            Vai ficar associada à visita de {visitaData ? formatarData(visitaData) : "—"}.
          </p>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
            Obra<span className="text-[#B0402F]"> *</span>
          </label>
          {visitaId ? (
            <>
              <input type="hidden" name="obra_id" value={obraId} />
              <p className="px-3 py-2 rounded-lg border border-[#EDEBE2] bg-[#F5F4EF] text-[13px] text-[#4A4740]">
                {obraNome ?? "—"}
              </p>
            </>
          ) : (
            <select
              name="obra_id"
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
            >
              <option value="" disabled>
                Escolhe a obra
              </option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
            Data de deteção<span className="text-[#B0402F]"> *</span>
          </label>
          <input
            name="data_deteccao"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
          />
        </div>
      </div>

      <CamposNC />

      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
          Registo fotográfico {fotos.length > 0 && `(${fotos.length})`}
        </label>
        <FotoPicker fotos={fotos} onChange={setFotos} />
      </div>

      {progresso && <p className="text-[12px] text-[#C9A050]">{progresso}</p>}
      {erro && <p className="text-[12px] text-[#B0402F]">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={pending} className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60">
          {pending ? "A guardar..." : "Guardar não conformidade"}
        </button>
        <a href="/nc" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
          Cancelar
        </a>
      </div>
    </form>
  );
}
