"use client";

import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

type FotoPreview = { id: string; url: string; nome: string; file: File };

export function FotoPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);

  function sincronizarInput(lista: FotoPreview[]) {
    const dt = new DataTransfer();
    lista.forEach((f) => dt.items.add(f.file));
    if (inputRef.current) inputRef.current.files = dt.files;
  }

  function adicionarFicheiros(fileList: FileList) {
    const novas = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      nome: file.name,
      file,
    }));
    setFotos((prev) => {
      const atualizado = [...prev, ...novas];
      sincronizarInput(atualizado);
      return atualizado;
    });
  }

  function remover(id: string) {
    setFotos((prev) => {
      const atualizado = prev.filter((f) => f.id !== id);
      sincronizarInput(atualizado);
      return atualizado;
    });
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name="fotos"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && adicionarFicheiros(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) adicionarFicheiros(e.dataTransfer.files);
        }}
        className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-[#C7C3B6] text-[#8A8578] hover:border-[#14283A] hover:text-[#14283A] transition-colors"
      >
        <Camera size={22} />
        <span className="text-[13px]">Clica ou arrasta fotos para aqui</span>
      </button>

      {fotos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {fotos.map((f) => (
            <div key={f.id} className="relative group aspect-square rounded-lg overflow-hidden border border-[#E4E1D6]">
              <img src={f.url} alt={f.nome} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remover(f.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
