"use client";

import { useRef, useState, useTransition } from "react";
import { ShieldCheck, Download, Trash2, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registarSeguroRC, eliminarSeguroRC } from "@/lib/actions/perfilFiscal";
import { nomeSeguro } from "@/lib/nomeSeguro";

export function SeguroRCCard({ nomeFicheiro }: { nomeFicheiro: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function enviar(ficheiro: File) {
    setErro(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const path = `perfil-fiscal/seguro-rc/${crypto.randomUUID()}-${nomeSeguro(ficheiro.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("documentos")
          .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
        if (uploadError) {
          setErro(uploadError.message);
          return;
        }
        const resultado = await registarSeguroRC({ nome: ficheiro.name, path });
        if (resultado.error) setErro(resultado.error);
      } catch (err) {
        console.error("Falha ao enviar seguro RC", err);
        setErro("Falha inesperada. Verifica a ligação e tenta outra vez.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-4 max-w-xl">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={15} className="text-[#8A8578]" />
        <p className="text-[13px] font-medium text-[#4A4740]">Seguro de responsabilidade civil</p>
      </div>
      <p className="text-[11px] text-[#8A8578] mb-3">
        Carrega a apólice em vigor para a teres sempre disponível para descarregar.
      </p>

      {nomeFicheiro ? (
        <div className="flex items-center gap-2 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg px-3 py-2">
          <span className="text-[12px] text-[#1F1D19] truncate flex-1">{nomeFicheiro}</span>
          <a href="/api/perfil-fiscal/seguro-rc/download" className="text-[#8A8578] hover:text-[#14283A] shrink-0">
            <Download size={14} />
          </a>
          <form action={eliminarSeguroRC}>
            <button type="submit" className="text-[#B0402F] shrink-0">
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      ) : (
        <p className="text-[12px] text-[#8A8578] mb-2">Ainda sem ficheiro carregado.</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && enviar(e.target.files[0])}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="mt-2 flex items-center gap-1.5 text-[12px] text-[#14283A] font-medium disabled:opacity-60"
      >
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        {pending ? "A enviar..." : nomeFicheiro ? "Substituir ficheiro" : "Carregar ficheiro"}
      </button>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1">{erro}</p>}
    </div>
  );
}
