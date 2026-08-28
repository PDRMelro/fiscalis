"use server";

import nodemailer from "nodemailer";

export type ResultadoPedido = { error: string | null };

const ROTULO_TIPO: Record<string, string> = {
  demonstracao: "Pedido de demonstração da plataforma",
  orcamento: "Pedido de orçamento de fiscalização",
};

export async function enviarPedido(_prev: ResultadoPedido, formData: FormData): Promise<ResultadoPedido> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "demonstracao");

  if (!nome || !email) return { error: "Preenche pelo menos o nome e o email." };

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.error("enviarPedido: GMAIL_USER/GMAIL_APP_PASSWORD não configurados");
    return { error: "O envio de pedidos ainda não está configurado. Tenta contactar diretamente por email." };
  }

  const assunto = ROTULO_TIPO[tipo] ?? "Novo pedido de contacto";

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });

    await transporter.sendMail({
      from: `"Fiscalis — Site" <${gmailUser}>`,
      to: gmailUser,
      replyTo: email,
      subject: `${assunto} — ${nome}`,
      text: [
        `Nome: ${nome}`,
        `Email: ${email}`,
        telefone ? `Telefone: ${telefone}` : null,
        "",
        mensagem || "(sem mensagem adicional)",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return { error: null };
  } catch (err) {
    console.error("enviarPedido falhou", err);
    return { error: "Não foi possível enviar o pedido agora. Tenta outra vez ou escreve diretamente para geral@fiscalis-engenharia.pt." };
  }
}
