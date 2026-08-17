"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { TourOnboarding, type PassoTour } from "@/components/portal/TourOnboarding";

export function PortalTourController({
  passos,
  nome,
  tourConcluido,
}: {
  passos: PassoTour[];
  nome: string;
  tourConcluido: boolean;
}) {
  const [mostrar, setMostrar] = useState(!tourConcluido);

  return (
    <>
      <button
        type="button"
        onClick={() => setMostrar(true)}
        className="text-[11px] text-[#9FB0BF] hover:text-white flex items-center gap-1"
      >
        <HelpCircle size={13} /> Como funciona
      </button>

      {mostrar && <TourOnboarding passos={passos} nome={nome} onClose={() => setMostrar(false)} />}
    </>
  );
}
