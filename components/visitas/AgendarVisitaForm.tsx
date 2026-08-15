"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { agendarVisita } from "@/lib/actions/visitas";

export function AgendarVisitaForm({
  obras,
  obraIdInicial,
}: {
  obras: { id: string; nome: string }[];
  obraIdInicial?: string;
}) {
  const router = useRouter();
  const [obraId, setObraId] = useState(obraIdInicial ?? "");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function guardar() {
    setErro(null);
    if (!obraId || !data) {
      setErro("Escolhe a obra e a data da visita.");
      return;
    }

    startTransition(async () => {
      const resultado = await agendarVisita(obraId, data, hora, notas);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      router.push("/visitas");
    });
  }

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-3">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra</label>
          <select
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
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
        </div>
        <div className="col-span-2">
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data prevista</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
          />
        </div>
      </div>

      <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Motivo / observações (opcional)</label>
      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        rows={3}
        placeholder="O que está previsto verificar nesta visita..."
        className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A] resize-none"
      />

      <p className="text-[11px] text-[#8A8578] mt-2">
        Depois de feita, entra em Visitas e usa &ldquo;Completar visita&rdquo; para juntar notas e fotos.
      </p>

      {erro && <p className="text-[12px] text-[#B0402F] mt-3">{erro}</p>}

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={guardar}
          disabled={pending}
          className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium disabled:opacity-60"
        >
          {pending ? "A agendar..." : "Agendar visita"}
        </button>
        <a href="/visitas" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
          Cancelar
        </a>
      </div>
    </div>
  );
}
