import Link from "next/link";
import { LOGO_SRC_DARK } from "@/lib/branding";

export const metadata = { title: "Política de Proteção de Dados — Fiscalis" };

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen w-full bg-[#F5F4EF] py-10 px-6" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto bg-white border border-[#E4E1D6] rounded-xl overflow-hidden">
        <div className="bg-[#14283A] px-6 py-6 flex items-center gap-2">
          <img src={LOGO_SRC_DARK} alt="Fiscalis" className="h-8 w-auto" />
          <span className="text-white text-[14px] font-medium">Política de Proteção de Dados</span>
        </div>

        <div className="p-6 space-y-4 text-[13px] text-[#4A4740] leading-relaxed">
          <p className="text-[12px] text-[#8A8578]">Última atualização: 14 de agosto de 2026.</p>

          <div>
            <p className="font-semibold text-[#14283A] mb-1">1. Que dados recolhemos</p>
            <p>
              Ao criares uma conta de cliente na plataforma Fiscalis, recolhemos o teu nome, endereço de email e
              palavra-passe (guardada de forma encriptada, nunca em texto simples). Ao usares a plataforma, também
              ficam associados à tua conta os dados da obra a que estás ligado — relatórios, não conformidades,
              documentos e, quando autorizado explicitamente pelo administrador, dados financeiros da obra
              (orçamentos e faturação).
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#14283A] mb-1">2. Para que usamos os teus dados</p>
            <p>
              Exclusivamente para te dar acesso ao acompanhamento da fiscalização da tua obra: mostrar-te o
              progresso, relatórios, não conformidades e documentos associados. Não vendemos nem partilhamos os
              teus dados com terceiros para fins de marketing.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#14283A] mb-1">3. Quem tem acesso</p>
            <p>
              Só tu e o administrador da plataforma (o engenheiro fiscal responsável pela tua obra) têm acesso aos
              teus dados. O acesso é tecnicamente reforçado por regras de segurança na base de dados — mesmo que
              outra conta de cliente tentasse aceder diretamente, as regras impedem-no de ver dados de obras que
              não são a sua.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#14283A] mb-1">4. Quanto tempo guardamos os dados</p>
            <p>
              Os teus dados ficam guardados enquanto a tua conta estiver ativa. Podes pedir a eliminação da tua
              conta e dos dados associados a qualquer momento, contactando o administrador da plataforma.
            </p>
          </div>

          <div>
            <p className="font-semibold text-[#14283A] mb-1">5. Os teus direitos</p>
            <p>
              Podes a qualquer momento pedir para consultar, corrigir ou apagar os teus dados pessoais, contactando
              diretamente o engenheiro fiscal responsável pela tua obra.
            </p>
          </div>

          <p className="text-[11px] text-[#8A8578] bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-3">
            Este texto descreve, de forma simples e direta, os dados que a plataforma efetivamente recolhe e como
            são usados. Não substitui aconselhamento jurídico — recomenda-se revisão por um profissional antes de
            considerar esta política juridicamente vinculativa (RGPD).
          </p>

          <Link href="/portal/signup" className="inline-block text-[13px] text-[#14283A] underline underline-offset-2">
            ← Voltar ao registo
          </Link>
        </div>
      </div>
    </div>
  );
}
