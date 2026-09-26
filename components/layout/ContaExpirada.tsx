import { LOGO_SRC_DARK } from "@/lib/branding";

export function ContaExpirada({
  nomeEmpresa,
  motivo,
  logout,
}: {
  nomeEmpresa: string;
  motivo: string;
  logout: () => Promise<void>;
}) {
  return (
    <div
      className="min-h-screen w-full bg-[#14283A] flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center gap-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-12 w-auto" />
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl text-center">
          <h1 className="text-[17px] font-semibold text-[#14283A] mb-2">Acesso suspenso</h1>
          <p className="text-[13px] text-[#4A4740] mb-1">{nomeEmpresa}</p>
          <p className="text-[13px] text-[#8A8578] mb-6">{motivo}</p>
          <form action={logout}>
            <button type="submit" className="text-[13px] text-[#B0402F] underline underline-offset-2">
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
