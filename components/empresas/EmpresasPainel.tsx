"use client";

import { useActionState, useState } from "react";
import { Check, X, Copy, CheckCheck, Ban, RotateCcw } from "lucide-react";
import {
  aprovarPedido,
  rejeitarPedido,
  cancelarAcessoTenant,
  reativarAcessoTenant,
  type ResultadoAprovacao,
} from "@/lib/actions/tenants";
import type { TenantPedidoRow, TenantRow } from "@/lib/supabase/types";

type TenantComContagens = TenantRow & { numClientes: number; numObras: number };

const initialAprovacao: ResultadoAprovacao = { error: null, link: null };

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT");
}

function CaixaLink({ link }: { link: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="mt-3 bg-[#F5F4EF] border border-[#E4E1D6] rounded-lg p-3">
      <p className="text-[11px] text-[#4A4740] mb-1.5">
        Empresa criada. Envia este link a quem vai gerir a conta para definir a palavra-passe:
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-[#DEDBD2] text-[11px] text-[#1F1D19] bg-white font-mono"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link).then(() => {
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            });
          }}
          className="shrink-0 px-2.5 py-1.5 rounded-md bg-[#14283A] text-white text-[11px] font-medium flex items-center gap-1"
        >
          {copiado ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

function PedidoCard({ pedido }: { pedido: TenantPedidoRow }) {
  const [state, formAction, pending] = useActionState(aprovarPedido, initialAprovacao);

  return (
    <div className="bg-white border border-[#E4E1D6] rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="text-[13px] font-medium text-[#1F1D19]">{pedido.nome_empresa}</p>
          <p className="text-[12px] text-[#4A4740]">{pedido.nome_responsavel}</p>
        </div>
        <p className="text-[10px] text-[#8A8578] whitespace-nowrap">Pedido: {formatarData(pedido.criado_em)}</p>
      </div>
      <p className="text-[12px] text-[#8A8578]">
        {pedido.email}
        {pedido.telefone ? ` · ${pedido.telefone}` : ""}
      </p>
      {pedido.mensagem && (
        <p className="text-[12px] text-[#4A4740] mt-1.5 italic">&ldquo;{pedido.mensagem}&rdquo;</p>
      )}

      {!state.link ? (
        <form action={formAction} className="flex flex-wrap items-end gap-2 mt-3">
          <input type="hidden" name="pedidoId" value={pedido.id} />
          <div>
            <label className="text-[10px] text-[#8A8578] block mb-0.5">Plano</label>
            <input
              name="plano"
              placeholder="Ex: 5 anos"
              className="w-32 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[#8A8578] block mb-0.5">Válido até</label>
            <input name="ativoAte" type="date" className="px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-3 py-1.5 rounded-md bg-[#3E7A4D] text-white text-[12px] font-medium flex items-center gap-1 disabled:opacity-60"
          >
            <Check size={13} /> {pending ? "A aprovar..." : "Aprovar"}
          </button>
          <button
            type="submit"
            formAction={rejeitarPedido.bind(null, pedido.id)}
            disabled={pending}
            className="px-3 py-1.5 rounded-md border border-[#E4B8AC] text-[#B0402F] text-[12px] font-medium flex items-center gap-1 disabled:opacity-60"
          >
            <X size={13} /> Rejeitar
          </button>
          {state.error && <p className="text-[11px] text-[#B0402F] w-full">{state.error}</p>}
        </form>
      ) : (
        <CaixaLink link={state.link} />
      )}
    </div>
  );
}

function estadoTenant(tenant: TenantRow): { texto: string; cor: string } {
  if (tenant.cancelado_em) return { texto: "Cancelado", cor: "text-[#B0402F] bg-[#FBEAE6] border-[#E8B9AC]" };
  if (tenant.ativo_ate && tenant.ativo_ate < new Date().toISOString().slice(0, 10)) {
    return { texto: "Expirado", cor: "text-[#B0402F] bg-[#FBEAE6] border-[#E8B9AC]" };
  }
  return { texto: "Ativo", cor: "text-[#3E7A4D] bg-[#E9F3EB] border-[#BEDCC4]" };
}

function TenantLinha({ tenant }: { tenant: TenantComContagens }) {
  const estado = estadoTenant(tenant);
  const ehFiscalis = tenant.ativo_ate === null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#F2F0E8] last:border-0">
      <div className="min-w-[160px]">
        <p className="text-[13px] font-medium text-[#1F1D19]">{tenant.nome_empresa}</p>
        <p className="text-[11px] text-[#8A8578]">{tenant.plano ?? "sem plano definido"}</p>
      </div>
      <span className={`text-[10px] font-medium border rounded px-1.5 py-0.5 ${estado.cor}`}>{estado.texto}</span>
      <p className="text-[12px] text-[#4A4740] w-28">Válido até: {formatarData(tenant.ativo_ate)}</p>
      <p className="text-[12px] text-[#4A4740] w-20">{tenant.numClientes} clientes</p>
      <p className="text-[12px] text-[#4A4740] w-16">{tenant.numObras} obras</p>
      <p className="text-[11px] text-[#8A8578] w-36">
        {tenant.password_definida_em ? `Ativado em ${formatarData(tenant.password_definida_em)}` : "Convite pendente"}
      </p>
      {!ehFiscalis && (
        <form action={(tenant.cancelado_em ? reativarAcessoTenant : cancelarAcessoTenant).bind(null, tenant.id)}>
          <button
            type="submit"
            className={`text-[11px] font-medium flex items-center gap-1 ${
              tenant.cancelado_em ? "text-[#3E7A4D]" : "text-[#B0402F]"
            }`}
          >
            {tenant.cancelado_em ? <RotateCcw size={12} /> : <Ban size={12} />}
            {tenant.cancelado_em ? "Reativar" : "Cancelar acesso"}
          </button>
        </form>
      )}
    </div>
  );
}

export function EmpresasPainel({
  pedidos,
  tenants,
}: {
  pedidos: TenantPedidoRow[];
  tenants: TenantComContagens[];
}) {
  return (
    <>
      <p className="text-[13px] font-medium text-[#4A4740] mb-2">
        Pedidos pendentes {pedidos.length > 0 && `(${pedidos.length})`}
      </p>
      <div className="space-y-3 mb-8 max-w-2xl">
        {pedidos.length === 0 && (
          <p className="text-[13px] text-[#8A8578] bg-white border border-[#E4E1D6] rounded-xl px-4 py-4">
            Sem pedidos pendentes.
          </p>
        )}
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} />
        ))}
      </div>

      <p className="text-[13px] font-medium text-[#4A4740] mb-2">Empresas</p>
      <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-4xl overflow-x-auto">
        {tenants.map((tenant) => (
          <TenantLinha key={tenant.id} tenant={tenant} />
        ))}
      </div>
    </>
  );
}
