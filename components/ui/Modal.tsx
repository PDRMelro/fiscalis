"use client";

import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function ModalTrigger({
  label,
  icon: Icon,
  children,
  variant = "primary",
}: {
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  children: (close: () => void) => ReactNode;
  variant?: "primary" | "secondary";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-[#8A8578] hover:text-[#14283A]"
            >
              <X size={16} />
            </button>
            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}
