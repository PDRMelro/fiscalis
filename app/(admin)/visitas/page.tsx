import { createClient } from "@/lib/supabase/server";

export default async function VisitasPage() {
  let dados: unknown = null;
  let erroCarregar: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("visitas_resumo").select("*").order("data", { ascending: false });
    if (error) throw new Error(error.message);
    dados = data;
  } catch (err) {
    console.error("VisitasPage (debug 2) falhou", err);
    erroCarregar = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
  }

  return (
    <div>
      <p>Teste 2 — com dados.</p>
      {erroCarregar ? (
        <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>{erroCarregar}</pre>
      ) : (
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(dados, null, 2)}</pre>
      )}
    </div>
  );
}
