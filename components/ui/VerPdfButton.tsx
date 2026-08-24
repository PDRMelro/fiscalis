"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FileText, Download, ExternalLink, X } from "lucide-react";

export function VerPdfButton({
  href,
  label = "Ver PDF",
  className,
  children,
}: {
  href: string;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={className ?? "inline-flex items-center gap-1.5 text-[12px] text-[#14283A] font-medium"}
      >
        {children ?? (
          <>
            <FileText size={12} /> {label}
          </>
        )}
      </button>

      {aberto &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={() => setAberto(false)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full h-full max-w-4xl relative overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#EDEBE2] shrink-0 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={href}
                    className="flex items-center gap-1.5 text-[12px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-3 py-1.5 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
                  >
                    <Download size={13} /> Fazer download
                  </a>
                  <a
                    href={`${href}?preview=1`}
                    target="_blank"
                    rel="noopener"
                    className="flex sm:hidden items-center gap-1.5 text-[12px] text-[#14283A] font-medium border border-[#DEDBD2] rounded-lg px-3 py-1.5 hover:bg-[#F5F4EF] hover:border-[#C9A050] transition-colors"
                  >
                    <ExternalLink size={13} /> Abrir em nova aba
                  </a>
                </div>
                <button type="button" onClick={() => setAberto(false)} className="text-[#8A8578] hover:text-[#14283A]">
                  <X size={18} />
                </button>
              </div>
              <p className="sm:hidden text-[11px] text-[#8A8578] px-4 pt-2">
                Se a pré-visualização não aparecer, usa &ldquo;Abrir em nova aba&rdquo; acima.
              </p>
              <iframe src={`${href}?preview=1`} title="Pré-visualização do documento" className="flex-1 w-full" />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
