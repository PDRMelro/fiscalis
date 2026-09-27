"use client";

import { useActionState, useState } from "react";
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
import { formatarBytes, corUtilizacao } from "@/lib/format";
import { PACKS_TENANT } from "@/lib/tenantPacks";
import type { TenantPedidoRow, TenantRow } from "@/lib/supabase/types";

type TenantComContagens = TenantRow & { numClientes: number; numObras: number; bytesArmazenados: number };

const initialAprovacao: ResultadoAprovacao = { error: null };
const initialLink: ResultadoLink = { error: null, link: null };

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT");
}

function PedidoCard({ pedido }: { pedido: TenantPedidoRow }) {
  const [state, formAction, pending] = useActionState(aprovarPedido, initialAprovacao);
  const [pack, setPack] = useState<"base" | "pro" | "personalizado">("base");

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
          <label className="text-[10px] text-[#8A8578] block mb-0.5">Pack</label>
          <select
            name="pack"
            value={pack}
            onChange={(e) => setPack(e.target.value as typeof pack)}
            className="px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px] bg-white"
          >
            <option value="base">
              {PACKS_TENANT.base.nome} ({PACKS_TENANT.base.limiteClientes} clientes, {formatarBytes(PACKS_TENANT.base.limiteArmazenamentoBytes)})
            </option>
            <option value="pro">
              {PACKS_TENANT.pro.nome} ({PACKS_TENANT.pro.limiteClientes} clientes, {formatarBytes(PACKS_TENANT.pro.limiteArmazenamentoBytes)})
            </option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
        {pack === "personalizado" && (
          <>
            <div>
              <label className="text-[10px] text-[#8A8578] block mb-0.5">Nome do plano</label>
              <input
                name="planoPersonalizado"
                placeholder="Ex: 5 anos"
                autoComplete="off"
                className="w-28 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8A8578] block mb-0.5">Limite clientes</label>
              <input
                name="limiteClientes"
                type="number"
                min="0"
                placeholder="sem limite"
                autoComplete="off"
                className="w-24 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#8A8578] block mb-0.5">Limite espaço (MB)</label>
              <input
                name="limiteArmazenamentoMb"
                type="number"
                min="0"
                placeholder="sem limite"
                autoComplete="off"
                className="w-24 px-2 py-1.5 rounded-md border border-[#DEDBD2] text-[12px]"
              />
            </div>
          </>
        )}
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

function corUso(usado: number, limite: number | null): string {
  if (limite == null) return "text-[#4A4740]";
  const pct = usado / limite;
  if (pct >= 1) return "text-[#B0402F] font-medium";
  if (pct >= 0.8) return "text-[#C4791E] font-medium";
  return "text-[#4A4740]";
}

function GraficoArmazenamento({ usado, limite }: { usado: number; limite: number | null }) {
  const tamanho = 40;
  const raio = 16;
  const circunferencia = 2 * Math.PI * raio;

  if (limite == null) {
    return (
      <div
        className="shrink-0 rounded-full border-2 border-[#EDEBE2] flex items-center justify-center"
        style={{ width: tamanho, height: tamanho }}
        title="Sem limite de armazenamento"
      >
        <span className="text-[8px] text-[#8A8578]">—</span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((usado / limite) * 100));
  const cor = corUtilizacao(pct);
  const offset = circunferencia * (1 - pct / 100);

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }} title={`${pct}% do armazenamento usado`}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={raio} fill="none" stroke="#EDEBE2" strokeWidth="4" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth="4"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-medium" style={{ color: cor }}>
          {pct}%
        </span>
      </div>
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
      <p className={`text-[12px] w-24 ${corUso(tenant.numClientes, tenant.limite_clientes)}`}>
        {tenant.numClientes}
        {tenant.limite_clientes != null ? ` / ${tenant.limite_clientes}` : ""} clientes
      </p>
      <p className="text-[12px] text-[#4A4740] w-16">{tenant.numObras} obras</p>
      <p className={`text-[12px] w-36 ${corUso(tenant.bytesArmazenados, tenant.limite_armazenamento_bytes)}`}>
        {formatarBytes(tenant.bytesArmazenados)}
        {tenant.limite_armazenamento_bytes != null ? ` / ${formatarBytes(tenant.limite_armazenamento_bytes)}` : ""}
      </p>
      <GraficoArmazenamento usado={tenant.bytesArmazenados} limite={tenant.limite_armazenamento_bytes} />
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
  totalBytesArmazenados,
}: {
  pedidos: TenantPedidoRow[];
  tenants: TenantComContagens[];
  totalBytesArmazenados: number;
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

      <div className="flex items-center justify-between mb-2 max-w-4xl">
        <p className="text-[13px] font-medium text-[#4A4740]">Empresas</p>
        <p className="text-[11px] text-[#8A8578]">
          Armazenamento total: <span className="font-medium text-[#4A4740]">{formatarBytes(totalBytesArmazenados)}</span>
        </p>
      </div>
      <div className="bg-white border border-[#E4E1D6] rounded-xl max-w-4xl overflow-x-auto">
        {tenants.map((tenant) => (
          <TenantLinha key={tenant.id} tenant={tenant} />
        ))}
      </div>
    </>
  );
}
