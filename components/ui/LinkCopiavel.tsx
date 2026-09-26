"use client";

import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";

export function LinkCopiavel({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mt-2 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-2.5 flex items-center gap-2">
      <input
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-[#DEDBD2] text-[11px] text-[#1F1D19] bg-white font-mono"
      />
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(link).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          });
        }}
        className="shrink-0 px-2.5 py-1.5 rounded-md bg-[#14283A] text-white text-[11px] font-medium flex items-center gap-1"
      >
        {copiado ? <CheckCheck size={13} /> : <Copy size={13} />}
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
