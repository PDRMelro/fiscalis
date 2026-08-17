"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Building2, AlertTriangle, FileArchive, ClipboardList, Loader2 } from "lucide-react";
import { pesquisarGlobal, type ResultadoPesquisa } from "@/lib/actions/pesquisa";
import { formatarData } from "@/lib/format";

const VAZIO: ResultadoPesquisa = { obras: [], ncs: [], documentos: [], visitas: [] };

export function PesquisaGlobal() {
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [resultado, setResultado] = useState<ResultadoPesquisa>(VAZIO);
  const [pending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (termo.trim().length < 2) {
      startTransition(() => setResultado(VAZIO));
      return;
    }
    timeoutRef.current = setTimeout(() => {
      startTransition(async () => {
        const r = await pesquisarGlobal(termo);
        setResultado(r);
      });
    }, 250);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [termo]);

  const semResultados =
    resultado.obras.length === 0 &&
    resultado.ncs.length === 0 &&
    resultado.documentos.length === 0 &&
    resultado.visitas.length === 0;

  return (
    <div className="relative w-[320px]">
      <div className="flex items-center gap-2 text-[#8A8578] bg-[#F5F4EF] rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-[#C9A050]">
        {pending ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Search size={14} className="shrink-0" />}
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          placeholder="Pesquisar obras, NC, documentos..."
          className="bg-transparent text-[13px] outline-none w-full text-[#1F1D19] placeholder:text-[#8A8578]"
        />
      </div>

      {aberto && termo.trim().length >= 2 && (
        <div className="absolute left-0 top-10 w-[380px] bg-white border border-[#E4E1D6] rounded-xl shadow-lg z-30 overflow-hidden max-h-[70vh] overflow-y-auto">
          {semResultados && !pending && (
            <p className="text-[12px] text-[#8A8578] px-4 py-3">Sem resultados para &ldquo;{termo}&rdquo;.</p>
          )}

          {resultado.obras.length > 0 && (
            <GrupoResultado titulo="Obras">
              {resultado.obras.map((o) => (
                <Link key={o.id} href={`/obras/${o.id}`} className="flex items-start gap-2 px-4 py-2 hover:bg-[#F5F4EF]">
                  <Building2 size={13} className="text-[#8A8578] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#1F1D19] truncate">{o.nome}</p>
                    <p className="text-[11px] text-[#8A8578] truncate">
                      {o.local} · {o.cliente_nome}
                    </p>
                  </div>
                </Link>
              ))}
            </GrupoResultado>
          )}

          {resultado.ncs.length > 0 && (
            <GrupoResultado titulo="Não conformidades">
              {resultado.ncs.map((n) => (
                <Link key={n.id} href={`/nc/${n.id}/editar`} className="flex items-start gap-2 px-4 py-2 hover:bg-[#F5F4EF]">
                  <AlertTriangle size={13} className="text-[#8A8578] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-mono text-[#14283A]">{n.codigo}</p>
                    <p className="text-[11px] text-[#8A8578] truncate">{n.descricao}</p>
                  </div>
                </Link>
              ))}
            </GrupoResultado>
          )}

          {resultado.documentos.length > 0 && (
            <GrupoResultado titulo="Documentos">
              {resultado.documentos.map((d) => (
                <Link
                  key={d.id}
                  href={`/obras/${d.obra_id}?tab=Documentos`}
                  className="flex items-start gap-2 px-4 py-2 hover:bg-[#F5F4EF]"
                >
                  <FileArchive size={13} className="text-[#8A8578] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[#1F1D19] truncate">{d.nome_ficheiro}</p>
                </Link>
              ))}
            </GrupoResultado>
          )}

          {resultado.visitas.length > 0 && (
            <GrupoResultado titulo="Visitas">
              {resultado.visitas.map((v) => (
                <Link
                  key={v.id}
                  href={`/obras/${v.obra_id}?tab=Visitas`}
                  className="flex items-start gap-2 px-4 py-2 hover:bg-[#F5F4EF]"
                >
                  <ClipboardList size={13} className="text-[#8A8578] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#1F1D19]">{formatarData(v.data)}</p>
                    <p className="text-[11px] text-[#8A8578] truncate">{v.notas}</p>
                  </div>
                </Link>
              ))}
            </GrupoResultado>
          )}
        </div>
      )}
    </div>
  );
}

function GrupoResultado({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#F2F0E8] last:border-0">
      <p className="text-[10px] font-medium text-[#8A8578] uppercase tracking-wide px-4 pt-2.5 pb-1">{titulo}</p>
      <div className="pb-1.5">{children}</div>
    </div>
  );
}
