import { formatarBytes } from "@/lib/format";

// Verde -> amarelo -> laranja -> vermelho conforme a percentagem usada. A
// barra desenha-se com o gradiente todo, e uma tampa da cor do fundo cobre
// a parte ainda não usada — assim a cor no bordo da barra preenchida reflete
// sempre o nível de utilização atual.
const GRADIENTE_UTILIZACAO = "linear-gradient(to right, #3E7A4D 0%, #D9A620 50%, #C4791E 80%, #B0402F 100%)";

function BarraUtilizacao({ pct }: { pct: number }) {
  return (
    <div className="relative w-full h-1.5 bg-[#EDEBE2] rounded-full overflow-hidden">
      <div className="absolute inset-0 rounded-full" style={{ backgroundImage: GRADIENTE_UTILIZACAO }} />
      <div className="absolute inset-y-0 right-0 bg-[#EDEBE2]" style={{ width: `${100 - pct}%` }} />
    </div>
  );
}

export function PlanoUtilizacaoCard({
  plano,
  numClientes,
  limiteClientes,
  numFiscais,
  limiteFiscais,
  bytesUsados,
  limiteBytes,
}: {
  plano: string | null;
  numClientes: number;
  limiteClientes: number | null;
  numFiscais: number;
  limiteFiscais: number | null;
  bytesUsados: number;
  limiteBytes: number | null;
}) {
  const pctClientes = limiteClientes ? Math.min(100, Math.round((numClientes / limiteClientes) * 100)) : null;
  const pctFiscais = limiteFiscais ? Math.min(100, Math.round((numFiscais / limiteFiscais) * 100)) : null;
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
              {pctClientes != null ? ` · ${pctClientes}%` : ""}
            </span>
          </div>
          {pctClientes != null && <BarraUtilizacao pct={pctClientes} />}
        </div>
        <div>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-[#4A4740]">Fiscais</span>
            <span className="text-[#8A8578]">
              {numFiscais}
              {limiteFiscais != null ? ` / ${limiteFiscais}` : " (sem limite)"}
              {pctFiscais != null ? ` · ${pctFiscais}%` : ""}
            </span>
          </div>
          {pctFiscais != null && <BarraUtilizacao pct={pctFiscais} />}
        </div>
        <div>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-[#4A4740]">Armazenamento</span>
            <span className="text-[#8A8578]">
              {formatarBytes(bytesUsados)}
              {limiteBytes != null ? ` / ${formatarBytes(limiteBytes)}` : " (sem limite)"}
              {pctArmazenamento != null ? ` · ${pctArmazenamento}%` : ""}
            </span>
          </div>
          {pctArmazenamento != null && <BarraUtilizacao pct={pctArmazenamento} />}
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
