import Link from "next/link";
import { formatarData } from "@/lib/format";
import type { VisitaResumoRow } from "@/lib/supabase/types";

export function VisitasTab({ visitas }: { visitas: VisitaResumoRow[] }) {
  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl overflow-hidden max-w-2xl">
      {visitas.length === 0 ? (
        <div className="p-8 text-center text-[13px] text-[#8A8578]">
          Ainda sem visitas registadas nesta obra.{" "}
          <Link href="/visitas/nova" className="text-[#14283A] underline underline-offset-2">
            Registar uma visita
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[#8A8578] border-b border-[#EDEBE2]">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Notas / especialidades verificadas</th>
                  <th className="px-5 py-3 font-medium">Fotos</th>
                  <th className="px-5 py-3 font-medium">NC abertas</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((v) => (
                  <tr key={v.id} className="border-b border-[#F2F0E8] last:border-0">
                    <td className="px-5 py-3 font-mono text-[#14283A]">{formatarData(v.data)}</td>
                    <td className="px-5 py-3 text-[#4A4740]">{v.especialidades || v.notas || "—"}</td>
                    <td className="px-5 py-3 text-[#8A8578]">{v.fotos}</td>
                    <td className="px-5 py-3 text-[#8A8578]">{v.nc_abertas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-[#F2F0E8]">
            {visitas.map((v) => (
              <div key={v.id} className="p-4 space-y-1.5">
                <p className="font-mono text-[13px] text-[#14283A]">{formatarData(v.data)}</p>
                <p className="text-[13px] text-[#4A4740]">{v.especialidades || v.notas || "—"}</p>
                <p className="text-[12px] text-[#8A8578]">
                  {v.fotos} foto(s) · {v.nc_abertas} NC aberta(s)
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
