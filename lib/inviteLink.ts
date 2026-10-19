const SITE_URL = "https://www.fiscalis-engenharia.pt";

/** Link para /definir-password, usado tanto para novas empresas como para novos fiscais. */
export function construirLinkConvite(email: string, otp: string | undefined, tipo: "invite" | "recovery"): string {
  return `${SITE_URL}/definir-password?email=${encodeURIComponent(email)}&token=${otp ?? ""}&tipo=${tipo}`;
}

/** Link para /portal/signup com o código da obra (e, se houver, nome/email) já preenchidos. */
export function construirLinkRegistoCliente(codigoAcesso: string, nome?: string | null, email?: string | null): string {
  const params = new URLSearchParams({ codigo: codigoAcesso });
  if (nome) params.set("nome", nome);
  if (email) params.set("email", email);
  return `${SITE_URL}/portal/signup?${params.toString()}`;
}
