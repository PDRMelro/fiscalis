"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type Contacto = { id: string; nome: string; role: string; nome_empresa: string | null };

export function NovaConversaBotao({ contactos }: { contactos: Contacto[] }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  if (contactos.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-1.5 text-[13px] text-white bg-[#14283A] rounded-lg px-3.5 py-2"
      >
        <Plus size={14} /> Nova conversa
      </button>
      {aberto && (
        <div className="absolute right-0 top-10 w-64 bg-white border border-[#E4E1D6] rounded-xl shadow-lg z-20 overflow-hidden">
          <p className="text-[11px] text-[#8A8578] px-4 py-2.5 border-b border-[#EDEBE2]">Escolhe com quem falar</p>
          {contactos.map((c) => (
            <Link
              key={c.id}
              href={`/mensagens/${c.id}`}
              onClick={() => setAberto(false)}
              className="flex flex-col px-4 py-2.5 border-b border-[#F2F0E8] last:border-0 hover:bg-[#F9F8F4]"
            >
              <span className="text-[13px] text-[#1F1D19]">{c.nome}</span>
              <span className="text-[11px] text-[#8A8578]">
                {c.nome_empresa ?? (c.role === "admin" ? "Administrador" : "Fiscal")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
