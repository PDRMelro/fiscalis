"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registarDocumentoCliente } from "@/lib/actions/documentos";

export function DocumentoUploadCliente({
  obraId,
  categoria = null,
  compacto = false,
}: {
  obraId: string;
  categoria?: string | null;
  compacto?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [pending, startTransition] = useTransition();
  const [progresso, setProgresso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function enviar(files: FileList | File[]) {
    const lista = Array.from(files);
    if (lista.length === 0) return;
    setErro(null);

    startTransition(async () => {
      const erros: string[] = [];
      try {
        const supabase = createClient();

        for (let i = 0; i < lista.length; i++) {
          const ficheiro = lista[i];
          setProgresso(lista.length > 1 ? `A enviar ${i + 1}/${lista.length}...` : "A enviar...");

          try {
            const path = `${obraId}/${crypto.randomUUID()}-${ficheiro.name}`;
            const { error: uploadError } = await supabase.storage
              .from("documentos")
              .upload(path, ficheiro, { contentType: ficheiro.type || undefined });
            if (uploadError) {
              erros.push(`${ficheiro.name}: ${uploadError.message}`);
              continue;
            }

            const resultado = await registarDocumentoCliente(categoria, {
              nome: ficheiro.name,
              path,
              tamanho: ficheiro.size,
            });
            if (resultado.error) erros.push(`${ficheiro.name}: ${resultado.error}`);
          } catch (err) {
            console.error("Falha ao enviar ficheiro", ficheiro.name, err);
            erros.push(`${ficheiro.name}: falha inesperada ao enviar.`);
          }
        }
      } catch (err) {
        console.error("DocumentoUploadCliente falhou", err);
        erros.push("Falha inesperada. Verifica a ligação e tenta outra vez.");
      }

      setProgresso(null);
      if (erros.length > 0) setErro(erros.join(" · "));
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className={compacto ? "" : "mt-2"}>
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
        className={`cursor-pointer border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
          compacto ? "py-3 px-2" : "py-4 px-3"
        } ${
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
          <Loader2 size={14} className="text-[#C9A050] animate-spin shrink-0" />
        ) : (
          <Upload size={14} className="text-[#8A8578] shrink-0" />
        )}
        <span className="text-[11px] text-[#8A8578] text-center">
          {progresso ?? "Arrasta ou clica"}
        </span>
      </div>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1">{erro}</p>}
    </div>
  );
}
