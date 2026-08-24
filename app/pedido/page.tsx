import { LOGO_SRC } from "@/lib/branding";
import { PedidoForm } from "@/components/pedido/PedidoForm";

export const metadata = { title: "Pedir contacto — Fiscalis" };

const TITULOS: Record<string, { titulo: string; texto: string }> = {
  demonstracao: {
    titulo: "Pedir uma demonstração",
    texto: "Conta-me um pouco sobre a tua empresa e mostro-te o dashboard do engenheiro fiscal e o portal do cliente com uma obra a sério.",
  },
  orcamento: {
    titulo: "Pedir um orçamento",
    texto: "Conta-me em que fase está a tua obra, onde é (Aveiro, Porto ou perto), e o que precisas de acompanhar.",
  },
};

export default async function PedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo: tipoParam } = await searchParams;
  const tipo = tipoParam === "orcamento" ? "orcamento" : "demonstracao";
  const { titulo, texto } = TITULOS[tipo];

  return (
    <div className="min-h-screen w-full bg-[#F5F4EF] py-10 px-6" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-md mx-auto bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-6 flex items-center gap-2">
          <img src={LOGO_SRC} alt="Fiscalis" className="h-8 w-auto" />
          <span className="text-white text-[14px] font-medium">Fiscalis Engenharia</span>
        </div>
        <div className="p-6">
          <h1 className="text-[17px] font-semibold text-[#14283A] mb-1">{titulo}</h1>
          <p className="text-[13px] text-[#8A8578] mb-5">{texto}</p>
          <PedidoForm tipo={tipo} />
        </div>
      </div>
    </div>
  );
}
