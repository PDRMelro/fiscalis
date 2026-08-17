"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getUserSafe } from "@/lib/supabase/getUserSafe";
import type { AuthError } from "@supabase/supabase-js";

export type ActionResult = { error: string } | { error: null };

const COOKIE_LEMBRAR = "fiscalis-lembrar";

function mensagemErroLogin(error: AuthError): string {
  if (error.code === "over_request_rate_limit" || error.status === 429) {
    return "Demasiadas tentativas seguidas — espera cerca de um minuto e tenta outra vez.";
  }
  if (error.code === "invalid_credentials") {
    return "Email ou palavra-passe incorretos.";
  }
  // Erro inesperado (rede, configuração, etc.) — mostra a mensagem real em vez
  // de a esconder, para não parecer sempre "password errada" quando não é.
  return `Não foi possível entrar: ${error.message}`;
}

/** Grava a preferência "manter-me ligado" para o proxy.ts respeitar em cada refresh de sessão seguinte. */
async function gravarPreferenciaLembrar(manterLigado: boolean) {
  const cookieStore = await cookies();
  if (manterLigado) {
    cookieStore.delete(COOKIE_LEMBRAR);
  } else {
    // Cookie de sessão do próprio browser (sem maxAge) — desaparece sozinho
    // ao fechar o browser, e enquanto existir diz ao proxy.ts para manter
    // os cookies de autenticação também como "só desta sessão".
    cookieStore.set(COOKIE_LEMBRAR, "0", { path: "/", httpOnly: true, sameSite: "lax" });
  }
}

export async function adminLogin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const manterLigado = formData.get("manterLigado") === "on";

  const supabase = await createClient({ esquecerAoFechar: !manterLigado });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mensagemErroLogin(error) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso de administrador." };
  }

  await gravarPreferenciaLembrar(manterLigado);
  redirect("/dashboard");
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(COOKIE_LEMBRAR);
  redirect("/login");
}

export async function clientSignUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  const codigoAcesso = String(formData.get("codigoAcesso") ?? "").trim();
  const aceitouPolitica = formData.get("aceitouPolitica") === "on";

  if (!nome || !email || !password || !codigoAcesso) return { error: "Preenche todos os campos." };
  if (password !== confirmar) return { error: "As palavras-passe não coincidem." };
  if (password.length < 6) return { error: "A palavra-passe deve ter pelo menos 6 caracteres." };
  if (!aceitouPolitica) return { error: "Tens de aceitar a Política de Proteção de Dados para criar conta." };

  const supabase = await createClient();

  const { data: obra, error: obraError } = await supabase
    .rpc("resolve_obra_por_codigo", { p_codigo: codigoAcesso })
    .maybeSingle();

  if (obraError || !obra) return { error: "Código de acesso da obra inválido." };

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, obra_id: obra.obra_id } },
  });

  if (signUpError) {
    return {
      error: signUpError.message.includes("already registered")
        ? "Já existe uma conta com este email."
        : "Não foi possível criar a conta. Tenta novamente.",
    };
  }

  redirect(`/portal/confirmar?email=${encodeURIComponent(email)}`);
}

export async function clientVerifyOtp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!email || !token) return { error: "Introduz o código enviado por email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
  if (error) return { error: "Código inválido ou expirado." };

  redirect("/portal");
}

export async function clientResendOtp(email: string) {
  const supabase = await createClient();
  await supabase.auth.resend({ type: "signup", email });
}

export async function clientLogin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const manterLigado = formData.get("manterLigado") === "on";

  const supabase = await createClient({ esquecerAoFechar: !manterLigado });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/portal/confirmar?email=${encodeURIComponent(email)}`);
    }
    return { error: mensagemErroLogin(error) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "client") {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao portal do cliente." };
  }

  await gravarPreferenciaLembrar(manterLigado);
  redirect("/portal");
}

export async function clientLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(COOKIE_LEMBRAR);
  redirect("/portal/login");
}

export async function concluirTourCliente() {
  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return;
  await supabase.from("profiles").update({ tour_concluido: true }).eq("id", user.id);
}

export async function atualizarNomeCliente(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { error: "O nome não pode ficar vazio." };

  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user) return { error: "A tua sessão expirou. Volta a entrar." };

  const { error } = await supabase.from("profiles").update({ nome }).eq("id", user.id);
  if (error) return { error: "Não foi possível guardar. Tenta outra vez." };

  revalidatePath("/portal");
  return { error: null };
}

export async function atualizarPasswordCliente(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const passwordAtual = String(formData.get("passwordAtual") ?? "");
  const novaPassword = String(formData.get("novaPassword") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (!passwordAtual || !novaPassword) return { error: "Preenche todos os campos." };
  if (novaPassword !== confirmar) return { error: "As palavras-passe novas não coincidem." };
  if (novaPassword.length < 6) return { error: "A nova palavra-passe deve ter pelo menos 6 caracteres." };

  const supabase = await createClient();
  const user = await getUserSafe(supabase);
  if (!user?.email) return { error: "A tua sessão expirou. Volta a entrar." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwordAtual });
  if (verifyError) return { error: "A palavra-passe atual está incorreta." };

  const { error } = await supabase.auth.updateUser({ password: novaPassword });
  if (error) return { error: "Não foi possível mudar a palavra-passe. Tenta outra vez." };

  return { error: null };
}
