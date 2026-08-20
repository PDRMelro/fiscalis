"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

function useEscapeToClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

export function ModalShell({
  open,
  onClose,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
  maxWidth?: string;
}) {
  useEscapeToClose(open, onClose);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-[#8A8578] hover:text-[#14283A]">
          <X size={16} />
        </button>
        {children(onClose)}
      </div>
    </div>
  );
}

export function ModalTrigger({
  label,
  icon: Icon,
  children,
  variant = "primary",
  maxWidth,
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  children: (close: () => void) => ReactNode;
  variant?: "primary" | "secondary";
  maxWidth?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "primary"
            ? "flex items-center gap-1.5 text-[13px] text-white bg-[#14283A] rounded-lg px-3.5 py-2"
            : "flex items-center gap-1.5 text-[12px] text-[#14283A] border border-[#DEDBD2] rounded-lg px-3 py-1.5"
        }
      >
        {Icon && <Icon size={14} />} {label}
      </button>
      <ModalShell open={open} onClose={() => setOpen(false)} maxWidth={maxWidth}>
        {children}
      </ModalShell>
    </>
  );
}
