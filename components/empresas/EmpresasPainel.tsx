"use client";

import { useActionState } from "react";
import { Check, X, Ban, RotateCcw, Link2, Trash2 } from "lucide-react";
import {
  aprovarPedido,
  rejeitarPedido,
  cancelarAcessoTenant,
  reativarAcessoTenant,
  eliminarTenant,
  gerarLinkConvite,
  type ResultadoAprovacao,
  type ResultadoLink,
} from "@/lib/actions/tenants";
import { LinkCopiavel } from "@/components/ui/LinkCopiavel";
import type { TenantPedidoRow, TenantRow } from "@/lib/supabase/types";

type TenantComContagens = TenantRow & { numClientes: number; numObras: number };

const initialAprovacao: ResultadoAprovacao = { error: null };
const initialLink: ResultadoLink = { error: null, link: null };

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT");
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

      <form action={formAction} className="flex flex-wrap items-end gap-2 mt-3">
        <input type="hidden" name="pedidoId" value={pedido.id} />
        <div>
          <label className="text-[10px] text-[#8A8578] block mb-0.5">Plano</label>
          <input
            name="plano"
            placeholder="Ex: 5 anos"
            autoComplete="off"
            className="w-32 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#8A8578] block mb-0.5">Válido até</label>
          <input name="ativoAte" type="date" autoComplete="off" className="px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]" />
        </div>
        <div>
          <label className="text-[10px] text-[#8A8578] block mb-0.5">Valor pago (€)</label>
          <input
            name="valorPago"
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex: 2500"
            autoComplete="off"
            className="w-24 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
          />
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

function LinkConviteBotao({ tenantId }: { tenantId: string }) {
  const [state, formAction, pending] = useActionState(gerarLinkConvite, initialLink);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="tenantId" value={tenantId} />
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] font-medium text-[#14283A] flex items-center gap-1 disabled:opacity-60"
        >
          <Link2 size={12} /> {pending ? "A gerar..." : state.link ? "Gerar novo link" : "Gerar link de convite"}
        </button>
      </form>
      {state.error && <p className="text-[11px] text-[#B0402F] mt-1">{state.error}</p>}
      {state.link && <LinkCopiavel link={state.link} />}
    </div>
  );
}

function EliminarTenantBotao({ tenantId, nomeEmpresa }: { tenantId: string; nomeEmpresa: string }) {
  const [state, formAction, pending] = useActionState(eliminarTenant, initialAprovacao);

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="tenantId" value={tenantId} />
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (!confirm(`Eliminar definitivamente "${nomeEmpresa}"? Esta ação não pode ser desfeita.`)) {
              e.preventDefault();
            }
          }}
          className="text-[11px] font-medium text-[#B0402F] flex items-center gap-1 disabled:opacity-60"
        >
          <Trash2 size={12} /> {pending ? "A eliminar..." : "Eliminar"}
        </button>
      </form>
      {state.error && <p className="text-[11px] text-[#B0402F] mt-1 max-w-[220px]">{state.error}</p>}
    </div>
  );
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
      <p className="text-[12px] text-[#4A4740] w-24">
        {tenant.valor_pago != null
          ? tenant.valor_pago.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
          : "sem valor"}
      </p>
      <p className="text-[12px] text-[#4A4740] w-20">{tenant.numClientes} clientes</p>
      <p className="text-[12px] text-[#4A4740] w-16">{tenant.numObras} obras</p>
      <div className="w-full sm:w-auto sm:min-w-[180px]">
        {ehFiscalis ? null : tenant.password_definida_em ? (
          <p className="text-[11px] text-[#8A8578]">Ativado em {formatarData(tenant.password_definida_em)}</p>
        ) : (
          <LinkConviteBotao tenantId={tenant.id} />
        )}
      </div>
      {!ehFiscalis && (
        <div className="flex items-center gap-3">
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
          {tenant.cancelado_em && <EliminarTenantBotao tenantId={tenant.id} nomeEmpresa={tenant.nome_empresa} />}
        </div>
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
