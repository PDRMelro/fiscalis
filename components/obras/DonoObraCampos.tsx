import type { ObraRow } from "@/lib/supabase/types";

const INPUT = "w-full px-3 py-2 rounded-lg border border-[#DEDBD2] text-[13px] bg-white";
const LABEL = "text-[12px] font-medium text-[#4A4740] block mb-1";

export function DonoObraCampos({ obra }: { obra?: ObraRow }) {
  return (
    <div className="pt-2 border-t border-[#EDEBE2]">
      <p className="text-[12px] font-medium text-[#4A4740]">Dono de obra (acesso ao portal)</p>
      <p className="text-[11px] text-[#8A8578] mb-2">
        Quem vai acompanhar a obra no portal. Na página da obra aparece um link de registo já com estes dados.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={LABEL}>Nome</label>
          <input name="dono_obra_nome" defaultValue={obra?.dono_obra_nome ?? ""} autoComplete="off" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input
            name="dono_obra_email"
            type="email"
            defaultValue={obra?.dono_obra_email ?? ""}
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Telefone</label>
          <input
            name="dono_obra_telefone"
            type="tel"
            defaultValue={obra?.dono_obra_telefone ?? ""}
            autoComplete="off"
            className={INPUT}
          />
        </div>
      </div>
    </div>
  );
}
