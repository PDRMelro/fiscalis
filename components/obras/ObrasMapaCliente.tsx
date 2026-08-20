"use client";

import dynamic from "next/dynamic";
import type { ObraRow } from "@/lib/supabase/types";

const ObrasMapa = dynamic(() => import("@/components/obras/ObrasMapa").then((m) => m.ObrasMapa), {
  ssr: false,
  loading: () => <div className="h-[240px] sm:h-[320px] md:h-[380px] rounded-xl border border-[#E4E1D6] bg-[#F5F4EF] mb-4" />,
});

export function ObrasMapaCliente({ obras }: { obras: ObraRow[] }) {
  return <ObrasMapa obras={obras} />;
}
