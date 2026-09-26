"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { error: null };

export async function definirPasswordConvite(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (!email || !token) return { error: "Este link parece incompleto. Pede um novo à Fiscalis." };
  if (password.length < 6) return { error: "A palavra-passe deve ter pelo menos 6 caracteres." };
  if (password !== confirmar) return { error: "As palavras-passe não coincidem." };

  const supabase = await createClient();

  const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: "invite" });
  if (otpError) return { error: "Este link já não é válido ou expirou. Pede um novo à Fiscalis." };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: "Não foi possível definir a palavra-passe. Tenta outra vez." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single();
    if (profile?.tenant_id) {
      await supabase
        .from("tenants")
        .update({ password_definida_em: new Date().toISOString() })
        .eq("id", profile.tenant_id)
        .is("password_definida_em", null);
    }
  }

  redirect("/dashboard");
}
