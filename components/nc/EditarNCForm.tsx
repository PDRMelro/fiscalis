"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { editarNC, registarFotoNC, eliminarFotoNC } from "@/lib/actions/nc";
import { FotoPicker, type FotoSelecionada } from "@/components/visitas/FotoPicker";
import { nomeSeguro } from "@/lib/nomeSeguro";
import { ESPECIALIDADES_OBRA } from "@/lib/especialidadesObra";
import type { NaoConformidadeRow } from "@/lib/supabase/types";

export function EditarNCForm({
  nc,
  obras,
  fotosExistentes,
}: {
  nc: NaoConformidadeRow;
  obras: { id: string; nome: string }[];
  fotosExistentes: { id: string; nome_ficheiro: string; url: string | null }[];
}) {
  const router = useRouter();
  const [obraId, setObraId] = useState(nc.obra_id);
  const [fotosNovas, setFotosNovas] = useState<FotoSelecionada[]>([]);
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
        setProgresso("A guardar...");
        const resultado = await editarNC(nc.id, formData);
        if (resultado.error) {
          setErro(resultado.error);
          setProgresso(null);
          return;
        }

        const supabase = createClient();
        const erros: string[] = [];

        for (let i = 0; i < fotosNovas.length; i++) {
          const foto = fotosNovas[i];
          setProgresso(fotosNovas.length > 1 ? `A enviar foto ${i + 1}/${fotosNovas.length}...` : "A enviar foto...");
          try {
            const path = `${obraId}/${nc.id}/${crypto.randomUUID()}-${nomeSeguro(foto.nome)}`;
            const { error: uploadError } = await supabase.storage
              .from("nc-anexos")
              .upload(path, foto.file, { contentType: foto.file.type || undefined });
            if (uploadError) {
              erros.push(`${foto.nome}: ${uploadError.message}`);
              continue;
            }
            const registo = await registarFotoNC(nc.id, { nome: foto.nome, path });
            if (registo.error) erros.push(`${foto.nome}: ${registo.error}`);
          } catch (err) {
            console.error("Falha ao enviar foto", foto.nome, err);
            erros.push(`${foto.nome}: falha inesperada ao enviar.`);
          }
        }

        setProgresso(null);
        if (erros.length > 0) {
          setErro(`Alterações guardadas, mas houve problemas com algumas fotos: ${erros.join(" · ")}`);
          return;
        }

        router.push("/nc");
      } catch (err) {
        console.error("EditarNCForm falhou", err);
        setProgresso(null);
        setErro("Falha inesperada. Verifica a ligação e tenta outra vez.");
      }
    });
  }

  return (
    <form action={guardar} className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra</label>
          <select
            name="obra_id"
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
          >
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data de deteção</label>
          <input
            name="data_deteccao"
            type="date"
            defaultValue={nc.data_deteccao}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Localização / zona na obra</label>
          <input
            name="local_zona"
            defaultValue={nc.local_zona ?? ""}
            placeholder="Ex: Piso 1, fachada norte"
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Especialidade</label>
          <select
            name="especialidade"
            defaultValue={nc.especialidade ?? ""}
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white"
          >
            <option value="">— Não especificada —</option>
            {ESPECIALIDADES_OBRA.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Descrição da não conformidade</label>
        <textarea
          name="descricao"
          defaultValue={nc.descricao}
          required
          rows={3}
          placeholder="O que foi observado em obra..."
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] resize-none"
        />
      </div>

      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Requisito / norma não cumprido</label>
        <textarea
          name="requisito_incumprido"
          defaultValue={nc.requisito_incumprido ?? ""}
          rows={2}
          placeholder="O que deveria ter sido executado, segundo o projeto/regulamento..."
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] resize-none"
        />
      </div>

      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Ação corretiva proposta</label>
        <textarea
          name="acao_corretiva"
          defaultValue={nc.acao_corretiva ?? ""}
          rows={2}
          placeholder="O que tem de ser feito para corrigir..."
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Severidade</label>
          <select name="severidade" defaultValue={nc.severidade} className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white">
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Responsável pela correção</label>
          <input name="responsavel" defaultValue={nc.responsavel ?? ""} placeholder="Ex: Empreiteiro Geral" className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Prazo de resolução</label>
          <input name="prazo" type="date" defaultValue={nc.prazo ?? ""} className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
        </div>
      </div>

      {fotosExistentes.length > 0 && (
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Fotos já anexadas</label>
          <div className="grid grid-cols-4 gap-2">
            {fotosExistentes.map((f) => (
              <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#E4E1D6]">
                {f.url && <img src={f.url} alt={f.nome_ficheiro} className="w-full h-full object-cover" />}
                <form
                  action={async () => {
                    await eliminarFotoNC(nc.id, f.id);
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

      <div>
        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">
          Adicionar novas fotos {fotosNovas.length > 0 && `(${fotosNovas.length})`}
        </label>
        <FotoPicker fotos={fotosNovas} onChange={setFotosNovas} />
      </div>

      {progresso && <p className="text-[12px] text-[#C9A050]">{progresso}</p>}
      {erro && <p className="text-[12px] text-[#B0402F]">{erro}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={pending} className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60">
          {pending ? "A guardar..." : "Guardar alterações"}
        </button>
        <a href="/nc" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
          Cancelar
        </a>
      </div>
    </form>
  );
}
