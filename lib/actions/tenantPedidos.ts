"use server";

import { createClient } from "@/lib/supabase/server";

export type ResultadoPedido = { error: string | null; sucesso: boolean };

export async function criarPedidoTenant(_prev: ResultadoPedido, formData: FormData): Promise<ResultadoPedido> {
  const nomeEmpresa = String(formData.get("nomeEmpresa") ?? "").trim();
  const nomeResponsavel = String(formData.get("nomeResponsavel") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const aceitouPolitica = formData.get("aceitouPolitica") === "on";

  if (!nomeEmpresa || !nomeResponsavel || !email) {
    return { error: "Preenche os campos obrigatórios.", sucesso: false };
  }
  if (!aceitouPolitica) {
    return { error: "Tens de aceitar a Política de Proteção de Dados para enviar o pedido.", sucesso: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tenant_pedidos").insert({
    nome_empresa: nomeEmpresa,
    nome_responsavel: nomeResponsavel,
    email,
    telefone: telefone || null,
    mensagem: mensagem || null,
  });

  if (error) {
    console.error("criarPedidoTenant falhou", error);
    return { error: "Não foi possível enviar o pedido. Tenta outra vez.", sucesso: false };
  }

  return { error: null, sucesso: true };
}
