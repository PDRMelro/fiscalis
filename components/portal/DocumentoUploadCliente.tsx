"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadDocumentoCliente } from "@/lib/actions/documentos";

export function DocumentoUploadCliente() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function enviar(files: FileList | File[]) {
    const lista = Array.from(files);
    if (lista.length === 0) return;
    const fd = new FormData();
    lista.forEach((f) => fd.append("ficheiros", f));
    setErro(null);
    startTransition(async () => {
      const resultado = await uploadDocumentoCliente(fd);
      if (resultado.error) setErro(resultado.error);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="mt-2">
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
          if (e.dataTransfer.files) enviar(e.dataTransfer.files);
        }}
        className={`cursor-pointer border-2 border-dashed rounded-lg flex items-center justify-center gap-2 py-4 px-3 transition-colors ${
          arrastando
            ? "border-[#14283A] bg-[#EAF0F5]"
            : pending
              ? "border-[#C9A050] bg-[#FBF7EC]"
              : "border-[#DEDBD2] hover:border-[#8A8578] bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && enviar(e.target.files)}
        />
        {pending ? (
          <Loader2 size={15} className="text-[#C9A050] animate-spin shrink-0" />
        ) : (
          <Upload size={15} className="text-[#8A8578] shrink-0" />
        )}
        <span className="text-[11px] text-[#8A8578] text-center">
          {pending ? "A enviar..." : "Arrasta ficheiros para aqui ou clica para escolher"}
        </span>
      </div>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1">{erro}</p>}
    </div>
  );
}
