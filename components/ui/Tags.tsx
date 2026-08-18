import type { EstadoArea, EstadoNC, Severidade } from "@/lib/supabase/types";

export function EstadoDot({ estado }: { estado: EstadoNC }) {
  const map: Record<EstadoNC, string> = {
    Aberta: "#B0402F",
    "Em correção": "#C4791E",
    Corrigida: "#2E5C8A",
    Encerrada: "#2C6B45",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: map[estado] }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: map[estado] }} />
      {estado}
    </span>
  );
}

export function AreaEstadoTag({ estado }: { estado: EstadoArea }) {
  const map: Record<EstadoArea, { bg: string; fg: string }> = {
    Concluído: { bg: "#E3EEE6", fg: "#2C6B45" },
    "Em andamento": { bg: "#EAF0F7", fg: "#2E5C8A" },
    Atenção: { bg: "#FBEAD9", fg: "#8A4A17" },
    Atrasado: { bg: "#FBE3E1", fg: "#B0402F" },
    Pendente: { bg: "#EDEBE2", fg: "#8A8578" },
  };
  const s = map[estado] ?? map.Pendente;
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: s.bg, color: s.fg }}>
      {estado}
    </span>
  );
}

export function SeveridadeTag({ nivel }: { nivel: Severidade }) {
  const map: Record<Severidade, { bg: string; fg: string }> = {
    Crítica: { bg: "#FBE3E1", fg: "#B0402F" },
    Maior: { bg: "#FBEAD9", fg: "#8A4A17" },
    Menor: { bg: "#EDEBE2", fg: "#8A8578" },
  };
  const s = map[nivel] ?? map.Menor;
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: s.bg, color: s.fg }}>
      {nivel}
    </span>
  );
}

export function EstadoAutoTag({ estado }: { estado: "Pago" | "Pendente" }) {
  const map = {
    Pago: { bg: "#E3EEE6", fg: "#2C6B45" },
    Pendente: { bg: "#FBEAD9", fg: "#8A4A17" },
  };
  const s = map[estado];
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: s.bg, color: s.fg }}>
      {estado}
    </span>
  );
}

export function EstadoPropostaTag({ estado }: { estado: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    "aguarda adjudicação": { bg: "#FBEAD9", fg: "#8A4A17" },
    adjudicada: { bg: "#E3EEE6", fg: "#2C6B45" },
    recusada: { bg: "#FBE3E1", fg: "#B0402F" },
  };
  const s = map[estado] ?? map["aguarda adjudicação"];
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: s.bg, color: s.fg }}>
      {estado}
    </span>
  );
}
