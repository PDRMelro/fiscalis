"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EstadoArea, EstadoObra, EstadoAuto } from "@/lib/supabase/types";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function num(formData: FormData, key: string) {
  const v = formData.get(key);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function criarObra(formData: FormData) {
  const supabase = await createClient();
  const nome = str(formData, "nome");
  const cliente_nome = str(formData, "cliente_nome");
  const local = str(formData, "local");
  const inicio = str(formData, "inicio");
  const honorario = str(formData, "honorario_mensal");

  const { data, error } = await supabase
    .from("obras")
    .insert({
      nome,
      cliente_nome,
      local,
      inicio: inicio || null,
      honorario_mensal: honorario ? Number(honorario) : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/obras");
  redirect(`/obras/${data.id}`);
}

export async function eliminarObra(obraId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("obras").delete().eq("id", obraId);
  if (error) throw new Error(error.message);
  revalidatePath("/obras");
  redirect("/obras");
}

export async function atualizarObra(obraId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("obras")
    .update({
      nome: str(formData, "nome"),
      cliente_nome: str(formData, "cliente_nome"),
      local: str(formData, "local"),
      inicio: str(formData, "inicio") || null,
      estado: str(formData, "estado") as EstadoObra,
      termo_descricao_obra: str(formData, "termo_descricao_obra") || null,
      termo_freguesia: str(formData, "termo_freguesia") || null,
      termo_processo: str(formData, "termo_processo") || null,
      termo_requerimento: str(formData, "termo_requerimento") || null,
    })
    .eq("id", obraId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

// --- Áreas (separador "Geral") -------------------------------------------

export async function adicionarArea(obraId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("obra_areas").insert({
    obra_id: obraId,
    area: str(formData, "area"),
    progresso: num(formData, "progresso"),
    estado: str(formData, "estado") as EstadoArea,
    ordem: num(formData, "ordem"),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function atualizarArea(obraId: string, areaId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("obra_areas")
    .update({
      progresso: num(formData, "progresso"),
      estado: str(formData, "estado") as EstadoArea,
    })
    .eq("id", areaId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function eliminarArea(obraId: string, areaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("obra_areas").delete().eq("id", areaId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

// --- Orçamentos -------------------------------------------------------------

export async function adicionarOrcamento(obraId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("orcamentos").insert({
    obra_id: obraId,
    servico: str(formData, "servico"),
    fornecedor: str(formData, "fornecedor"),
    valor_orcamentado: num(formData, "valor_orcamentado"),
    valor_executado: num(formData, "valor_executado"),
    taxa_iva: num(formData, "taxa_iva") || 23,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function atualizarOrcamento(obraId: string, orcamentoId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orcamentos")
    .update({
      valor_executado: num(formData, "valor_executado"),
      taxa_iva: num(formData, "taxa_iva") || 23,
    })
    .eq("id", orcamentoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function eliminarOrcamento(obraId: string, orcamentoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orcamentos").delete().eq("id", orcamentoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

// --- Faturação (autos) -------------------------------------------------------

export async function adicionarAuto(obraId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("faturacao_autos").insert({
    obra_id: obraId,
    numero: str(formData, "numero"),
    data: str(formData, "data"),
    valor: num(formData, "valor"),
    estado: str(formData, "estado") as EstadoAuto,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function alternarEstadoAuto(obraId: string, autoId: string, novoEstado: "Pago" | "Pendente") {
  const supabase = await createClient();
  const { error } = await supabase.from("faturacao_autos").update({ estado: novoEstado }).eq("id", autoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function eliminarAuto(obraId: string, autoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("faturacao_autos").delete().eq("id", autoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

// --- Intervenientes ------------------------------------------------------

export async function adicionarInterveniente(obraId: string, formData: FormData) {
  const supabase = await createClient();
  const tipo = str(formData, "tipo");
  const { error } = await supabase.from("intervenientes").insert({
    obra_id: obraId,
    papel: str(formData, "papel"),
    nome: str(formData, "nome"),
    contacto: str(formData, "contacto") || null,
    tipo: (tipo || null) as never,
    empresa: str(formData, "empresa") || null,
    cedula_profissional: str(formData, "cedula_profissional") || null,
    colegio: str(formData, "colegio") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}

export async function eliminarInterveniente(obraId: string, intervenienteId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("intervenientes").delete().eq("id", intervenienteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/obras/${obraId}`);
}
