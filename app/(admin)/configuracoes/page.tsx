import { Trash2, ShieldCheck, WifiOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { atualizarPerfilFiscal } from "@/lib/actions/perfilFiscal";
import { adicionarItemChecklist, eliminarItemChecklist } from "@/lib/actions/checklist";

const ESPECIALIDADES = ["Estrutura", "Águas e esgotos", "Eletricidade", "Segurança", "Acabamentos", "Térmica e acústica"];

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const [{ data: perfil }, { data: checklist }] = await Promise.all([
    supabase.from("perfil_fiscal").select("*").eq("id", true).single(),
    supabase.from("checklist_config").select("*").order("ordem", { ascending: true }),
  ]);

  const iniciais = (perfil?.nome ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <PageHeader title="Configurações" subtitle="Dados do diretor de fiscalização e preferências da app" />

      <form action={atualizarPerfilFiscal} className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-[#14283A] text-white flex items-center justify-center text-[16px] font-medium shrink-0">
            {iniciais || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-[#1F1D19] truncate">{perfil?.nome}</p>
            <p className="text-[12px] text-[#8A8578]">
              {perfil?.qualificacao} · Cédula Profissional n.º {perfil?.cedula_profissional}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Nome</label>
            <input name="nome" defaultValue={perfil?.nome} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Qualificação</label>
            <input name="qualificacao" defaultValue={perfil?.qualificacao} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div className="col-span-2">
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Morada fiscal</label>
            <input name="morada_fiscal" defaultValue={perfil?.morada_fiscal} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">NIF</label>
            <input name="nif" defaultValue={perfil?.nif} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cartão de Cidadão</label>
            <input name="cartao_cidadao" defaultValue={perfil?.cartao_cidadao} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
          <div className="col-span-2">
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Cédula profissional</label>
            <input name="cedula_profissional" defaultValue={perfil?.cedula_profissional} required className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px]" />
          </div>
        </div>
        <p className="text-[11px] text-[#8A8578] mt-2">
          Estes dados preenchem automaticamente o Termo de Responsabilidade gerado em cada obra.
        </p>
        <button type="submit" className="mt-3 px-4 py-2 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
          Guardar
        </button>
      </form>

      <p className="text-[13px] font-medium text-[#4A4740] mb-2">Checklist de visita (configurável)</p>
      <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-xl mb-3 divide-y divide-[#F2F0E8]">
        {(checklist ?? []).map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <span className="text-[11px] text-[#8A8578] font-mono mr-2">{c.especialidade}</span>
              <span className="text-[13px] text-[#1F1D19]">{c.item}</span>
            </div>
            <form action={eliminarItemChecklist.bind(null, c.id)}>
              <button type="submit" className="text-[#B0402F] shrink-0">
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        ))}
        {(!checklist || checklist.length === 0) && (
          <p className="px-4 py-4 text-[13px] text-[#8A8578]">Ainda sem itens de checklist.</p>
        )}
      </div>
      <form action={adicionarItemChecklist} className="flex gap-2 max-w-xl mb-8">
        <select name="especialidade" defaultValue="Estrutura" className="px-2 py-2 rounded-lg border border-[#DEDBD2] text-[12px] bg-white">
          {ESPECIALIDADES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <input name="item" required placeholder="Novo item de verificação" className="flex-1 px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white" />
        <button type="submit" className="px-3 py-2 rounded-lg bg-[#14283A] text-white text-[12px] font-medium">
          Adicionar
        </button>
      </form>

      <p className="text-[13px] font-medium text-[#4A4740] mb-2">Em preparação</p>
      <div className="max-w-xl space-y-2">
        <div className="flex items-start gap-2 bg-white border border-[#E4E1D6] rounded-lg px-3 py-2.5">
          <ShieldCheck size={15} className="text-[#8A8578] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#4A4740]">
            <span className="font-medium text-[#1F1D19]">Assinatura digital real</span> — ligar o Termo de
            Responsabilidade e os relatórios à Chave Móvel Digital / Cartão de Cidadão.
          </p>
        </div>
        <div className="flex items-start gap-2 bg-white border border-[#E4E1D6] rounded-lg px-3 py-2.5">
          <WifiOff size={15} className="text-[#8A8578] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#4A4740]">
            <span className="font-medium text-[#1F1D19]">Modo offline em obra</span> — preencher checklists e
            tirar fotos sem rede, com sincronização automática ao voltar à cobertura.
          </p>
        </div>
      </div>
    </>
  );
}
