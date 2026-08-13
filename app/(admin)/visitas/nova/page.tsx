import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { FotoPicker } from "@/components/visitas/FotoPicker";
import { criarVisita } from "@/lib/actions/visitas";

export default async function NovaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ obraId?: string }>;
}) {
  const { obraId } = await searchParams;
  const supabase = await createClient();
  const { data: obras } = await supabase.from("obras").select("id, nome").order("nome");

  return (
    <>
      <PageHeader title="Nova visita" subtitle="Regista a visita e carrega as fotos tiradas em obra" />
      <form action={criarVisita} encType="multipart/form-data" className="bg-white border border-[#E4E1D6] rounded-xl p-5 max-w-xl">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Obra</label>
            <select
              name="obra_id"
              required
              defaultValue={obraId ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
            >
              <option value="" disabled>
                Escolhe a obra
              </option>
              {(obras ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Data da visita</label>
            <input
              name="data"
              type="date"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A]"
            />
          </div>
        </div>

        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Notas da visita</label>
        <textarea
          name="notas"
          rows={3}
          placeholder="Especialidades verificadas, observações..."
          className="w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white focus:outline-none focus:border-[#14283A] resize-none mb-4"
        />

        <label className="text-[12px] font-medium text-[#4A4740] block mb-1">Registo fotográfico</label>
        <FotoPicker />

        <div className="flex gap-2 mt-5">
          <button type="submit" className="px-4 py-2.5 rounded-lg bg-[#14283A] text-white text-[13px] font-medium">
            Guardar visita
          </button>
          <a href="/visitas" className="px-4 py-2.5 rounded-lg text-[13px] text-[#8A8578]">
            Cancelar
          </a>
        </div>
      </form>
    </>
  );
}
