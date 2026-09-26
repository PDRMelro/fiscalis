import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import { PageHeader } from "@/components/ui/PageHeader";

function iniciaisDe(nome: string): string {
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function MensagensPage() {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) redirect("/login");

  const { data: pessoas } = await supabase.rpc("pessoas_para_conversar");

  const contactos = await Promise.all(
    (pessoas ?? []).map(async (pessoa) => {
      const [{ data: ultima }, { count: naoLidas }] = await Promise.all([
        supabase
          .from("mensagens")
          .select("corpo, criado_em, remetente_id")
          .or(
            `and(remetente_id.eq.${user.id},destinatario_id.eq.${pessoa.id}),and(remetente_id.eq.${pessoa.id},destinatario_id.eq.${user.id})`
          )
          .order("criado_em", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("mensagens")
          .select("id", { count: "exact", head: true })
          .eq("destinatario_id", user.id)
          .eq("remetente_id", pessoa.id)
          .eq("lida", false),
      ]);
      return { ...pessoa, ultimaMensagem: ultima, naoLidas: naoLidas ?? 0 };
    })
  );

  return (
    <>
      <PageHeader title="Mensagens" subtitle="Conversas internas" />
      <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-2xl overflow-hidden">
        {contactos.length === 0 && (
          <p className="text-[13px] text-[#8A8578] px-4 py-6 text-center">Sem ninguém disponível para conversar.</p>
        )}
        {contactos.map((c) => (
          <Link
            key={c.id}
            href={`/mensagens/${c.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#F2F0E8] last:border-0 hover:bg-[#F9F8F4]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#14283A] text-white flex items-center justify-center text-[12px] font-medium shrink-0">
                {iniciaisDe(c.nome)}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[13px] truncate ${c.naoLidas > 0 ? "font-semibold text-[#1F1D19]" : "font-medium text-[#1F1D19]"}`}
                >
                  {c.nome}
                </p>
                <p className="text-[11px] text-[#8A8578] truncate">
                  {c.nome_empresa ?? (c.role === "admin" ? "Administrador" : "Fiscal")}
                  {c.ultimaMensagem && ` · ${c.ultimaMensagem.corpo}`}
                </p>
              </div>
            </div>
            {c.naoLidas > 0 && (
              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B0402F] text-white text-[10px] font-medium flex items-center justify-center">
                {c.naoLidas}
              </span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
