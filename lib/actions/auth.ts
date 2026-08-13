"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { error: null };

export async function adminLogin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email ou palavra-passe incorretos." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso de administrador." };
  }

  redirect("/dashboard");
}

export async function adminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function clientSignUp(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  const codigoAcesso = String(formData.get("codigoAcesso") ?? "").trim();

  if (!nome || !email || !password || !codigoAcesso) return { error: "Preenche todos os campos." };
  if (password !== confirmar) return { error: "As palavras-passe não coincidem." };
  if (password.length < 6) return { error: "A palavra-passe deve ter pelo menos 6 caracteres." };

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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/portal/confirmar?email=${encodeURIComponent(email)}`);
    }
    return { error: "Email ou palavra-passe incorretos." };
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

  redirect("/portal");
}

export async function clientLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}
