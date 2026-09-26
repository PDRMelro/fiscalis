const SITE_URL = "https://www.fiscalis-engenharia.pt";

/** Link para /definir-password, usado tanto para novas empresas como para novos fiscais. */
export function construirLinkConvite(email: string, otp: string | undefined, tipo: "invite" | "recovery"): string {
  return `${SITE_URL}/definir-password?email=${encodeURIComponent(email)}&token=${otp ?? ""}&tipo=${tipo}`;
}
