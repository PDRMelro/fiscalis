"use client";

import { useRef, useState, useTransition } from "react";
import { ShieldCheck, Download, Trash2, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registarSeguroRC, eliminarSeguroRC } from "@/lib/actions/perfilFiscal";
import { nomeSeguro } from "@/lib/nomeSeguro";

export function SeguroRCCard({ nomeFicheiro }: { nomeFicheiro: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function enviar(ficheiro: File) {
    setErro(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const path = `seguro-rc/${crypto.randomUUID()}-${nomeSeguro(ficheiro.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("perfil-fiscal")
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

      {nomeFicheiro && (
        <div className="flex items-center gap-2 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg px-3 py-2 mb-3">
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
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          const ficheiro = e.dataTransfer.files?.[0];
          if (ficheiro) enviar(ficheiro);
        }}
        className={`cursor-pointer border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-center py-8 px-4 transition-colors ${
          arrastando
            ? "border-[#14283A] bg-[#EAF0F5]"
            : pending
              ? "border-[#C9A050] bg-[#FBF7EC]"
              : "border-[#C7C3B6] hover:border-[#8A8578] bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && enviar(e.target.files[0])}
        />
        {pending ? (
          <Loader2 size={20} className="text-[#C9A050] animate-spin shrink-0" />
        ) : (
          <Upload size={20} className="text-[#8A8578] shrink-0" />
        )}
        <span className="text-[#8A8578] text-[12px]">
          {pending ? "A enviar..." : nomeFicheiro ? "Arrasta para substituir ou clica para escolher" : "Arrasta o ficheiro para aqui ou clica para escolher"}
        </span>
      </div>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1">{erro}</p>}
    </div>
  );
}
