"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registarDocumento } from "@/lib/actions/documentos";
import type { DirecaoDocumento } from "@/lib/supabase/types";

export function DocumentoDropzone({
  obraId,
  direcao,
  categoria = null,
  orcamentoId = null,
  compacto = false,
}: {
  obraId: string;
  direcao: DirecaoDocumento;
  categoria?: string | null;
  orcamentoId?: string | null;
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

            const resultado = await registarDocumento(
              obraId,
              direcao,
              categoria,
              { nome: ficheiro.name, path, tamanho: ficheiro.size },
              orcamentoId
            );
            if (resultado.error) erros.push(`${ficheiro.name}: ${resultado.error}`);
          } catch (err) {
            console.error("Falha ao enviar ficheiro", ficheiro.name, err);
            erros.push(`${ficheiro.name}: falha inesperada ao enviar.`);
          }
        }
      } catch (err) {
        console.error("DocumentoDropzone falhou", err);
        erros.push("Falha inesperada. Verifica a ligação e tenta outra vez.");
      }

      setProgresso(null);
      if (erros.length > 0) setErro(erros.join(" · "));
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div>
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
        className={`cursor-pointer border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-center transition-colors ${
          compacto ? "py-3 px-3" : "py-8 px-4"
        } ${
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
          multiple
          className="hidden"
          onChange={(e) => e.target.files && enviar(e.target.files)}
        />
        {pending ? (
          <Loader2 size={compacto ? 14 : 20} className="text-[#C9A050] animate-spin shrink-0" />
        ) : (
          <Upload size={compacto ? 14 : 20} className="text-[#8A8578] shrink-0" />
        )}
        <span className={`text-[#8A8578] ${compacto ? "text-[11px]" : "text-[12px]"}`}>
          {progresso ?? "Arrasta ficheiros para aqui ou clica para escolher"}
        </span>
      </div>
      {erro && <p className="text-[11px] text-[#B0402F] mt-1">{erro}</p>}
    </div>
  );
}
