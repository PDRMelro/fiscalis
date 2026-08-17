import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function VisitasPage() {
  let dados: unknown = null;
  let erroCarregar: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("visitas_resumo").select("*").order("data", { ascending: false });
    if (error) throw new Error(error.message);
    dados = data;
  } catch (err) {
    console.error("VisitasPage (debug) falhou", err);
    erroCarregar = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
  }

  return (
    <>
      <PageHeader title="Visitas (modo de diagnóstico)" subtitle="Versão temporária só para apanhar o erro" />

      {erroCarregar && (
        <div className="bg-white border border-[#F0CFC6] rounded-xl p-4 mb-4 text-[12px] text-[#B0402F] whitespace-pre-wrap">
          {erroCarregar}
        </div>
      )}

      <pre className="bg-white border border-[#E4E1D6] rounded-xl p-4 text-[11px] overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(dados, null, 2)}
      </pre>
    </>
  );
}
