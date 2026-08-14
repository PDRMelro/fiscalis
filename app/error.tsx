"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen w-full bg-[#F5F4EF] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white border border-[#E4E1D6] rounded-xl p-6 text-center">
        <p className="text-[15px] font-semibold text-[#14283A] mb-1">Algo correu mal</p>
        <p className="text-[13px] text-[#8A8578] mb-4">
          Pode ter sido um problema temporário de ligação. Tenta outra vez daqui a um instante.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
