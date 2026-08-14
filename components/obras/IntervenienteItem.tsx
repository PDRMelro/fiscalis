"use client";

import { useState, useTransition } from "react";
import { Users, Trash2, ChevronUp, ChevronDown, Pencil, X } from "lucide-react";
import { eliminarInterveniente, moverInterveniente, editarInterveniente } from "@/lib/actions/obras";
import { IntervenienteCampos } from "@/components/obras/IntervenienteCampos";
import type { IntervenienteRow, TipoInterveniente } from "@/lib/supabase/types";

function detalheInterveniente(p: IntervenienteRow): string | null {
  if (p.tipo === "Construtora" && p.empresa) return p.empresa;
  if (
    (p.tipo === "Direção de Obra" || p.tipo === "Arquitetura" || p.tipo === "Coordenador de Segurança") &&
    p.cedula_profissional
  ) {
    const especialidade = p.colegio ? ` ${p.colegio}` : "";
    return `Cédula${especialidade} n.º ${p.cedula_profissional}`;
  }
  return null;
}

export function IntervenienteItem({
  obraId,
  item,
  isFirst,
  isLast,
}: {
  obraId: string;
  item: IntervenienteRow;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [tipo, setTipo] = useState<TipoInterveniente | "">((item.tipo as TipoInterveniente) ?? "");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (editando) {
    return (
      <form
        action={(formData: FormData) => {
          setErro(null);
          startTransition(async () => {
            try {
              await editarInterveniente(obraId, item.id, formData);
              setEditando(false);
            } catch (err) {
              setErro(err instanceof Error ? err.message : "Não foi possível guardar.");
            }
          });
        }}
        className="p-3 space-y-2 bg-[#FAF9F4]"
      >
        <IntervenienteCampos
          tipo={tipo}
          onTipoChange={setTipo}
          defaults={{
            papel: item.papel,
            nome: item.nome,
            contacto: item.contacto,
            empresa: item.empresa,
            cedula_profissional: item.cedula_profissional,
            colegio: item.colegio,
          }}
        />
        {erro && <p className="text-[11px] text-[#B0402F]">{erro}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="text-[12px] text-white bg-[#14283A] rounded-lg px-3 py-1.5 disabled:opacity-60">
            {pending ? "A guardar..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setErro(null);
              setEditando(false);
            }}
            className="flex items-center gap-1 text-[12px] text-[#8A8578] px-3 py-1.5"
          >
            <X size={13} /> Cancelar
          </button>
        </div>
      </form>
    );
  }

  const detalhe = detalheInterveniente(item);

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 group">
      <div className="flex flex-col shrink-0 -my-1.5">
        <form action={moverInterveniente.bind(null, obraId, item.id, "cima")}>
          <button
            type="submit"
            disabled={isFirst}
            className="text-[#8A8578] hover:text-[#14283A] disabled:opacity-20 disabled:cursor-not-allowed block"
          >
            <ChevronUp size={14} />
          </button>
        </form>
        <form action={moverInterveniente.bind(null, obraId, item.id, "baixo")}>
          <button
            type="submit"
            disabled={isLast}
            className="text-[#8A8578] hover:text-[#14283A] disabled:opacity-20 disabled:cursor-not-allowed block"
          >
            <ChevronDown size={14} />
          </button>
        </form>
      </div>
      <div className="w-9 h-9 rounded-full bg-[#F0EEE5] flex items-center justify-center text-[#8A8578] shrink-0">
        <Users size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#1F1D19]">{item.nome}</p>
        <p className="text-[11px] text-[#8A8578]">
          {item.papel} {item.contacto && <>· {item.contacto}</>}
        </p>
        {detalhe && <p className="text-[11px] text-[#8A8578]">{detalhe}</p>}
      </div>
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="text-[#8A8578] hover:text-[#14283A] opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Pencil size={13} />
      </button>
      <form action={eliminarInterveniente.bind(null, obraId, item.id)}>
        <button type="submit" className="text-[#B0402F] opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={14} />
        </button>
      </form>
    </div>
  );
}
