import { formatarBytes } from "@/lib/format";

function corBarra(pct: number): string {
  if (pct >= 100) return "#B0402F";
  if (pct >= 80) return "#C4791E";
  return "#14283A";
}

export function PlanoUtilizacaoCard({
  plano,
  numClientes,
  limiteClientes,
  bytesUsados,
  limiteBytes,
}: {
  plano: string | null;
  numClientes: number;
  limiteClientes: number | null;
  bytesUsados: number;
  limiteBytes: number | null;
}) {
  const pctClientes = limiteClientes ? Math.min(100, Math.round((numClientes / limiteClientes) * 100)) : null;
  const pctArmazenamento = limiteBytes ? Math.min(100, Math.round((bytesUsados / limiteBytes) * 100)) : null;
  const avisoArmazenamento = pctArmazenamento != null && pctArmazenamento >= 80;

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mb-8">
      <p className="text-[13px] font-medium text-[#4A4740] mb-1">O teu plano</p>
      <p className="text-[11px] text-[#8A8578] mb-4">{plano ?? "Sem plano definido"}</p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-[#4A4740]">Clientes</span>
            <span className="text-[#8A8578]">
              {numClientes}
              {limiteClientes != null ? ` / ${limiteClientes}` : " (sem limite)"}
            </span>
          </div>
          {pctClientes != null && (
            <div className="w-full h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pctClientes}%`, backgroundColor: corBarra(pctClientes) }} />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-[#4A4740]">Armazenamento</span>
            <span className="text-[#8A8578]">
              {formatarBytes(bytesUsados)}
              {limiteBytes != null ? ` / ${formatarBytes(limiteBytes)}` : " (sem limite)"}
            </span>
          </div>
          {pctArmazenamento != null && (
            <div className="w-full h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${pctArmazenamento}%`, backgroundColor: corBarra(pctArmazenamento) }}
              />
            </div>
          )}
        </div>
      </div>

      {avisoArmazenamento && (
        <p className="text-[11px] text-[#B0402F] mt-3 bg-[#FBEAE6] border border-[#E8B9AC] rounded-lg px-3 py-2">
          Estás perto (ou já no limite) do armazenamento do teu plano. Considera descarregar ficheiros antigos
          (fotos, relatórios, documentos) para o teu computador e apagá-los da plataforma para libertar espaço, ou
          contacta a Fiscalis para aumentar o plano.
        </p>
      )}
    </div>
  );
}
