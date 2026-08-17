"use server";

import { createClient } from "@/lib/supabase/server";

export type ResultadoPesquisa = {
  obras: { id: string; nome: string; local: string; cliente_nome: string }[];
  ncs: { id: string; codigo: string | null; descricao: string; obra_id: string }[];
  documentos: { id: string; nome_ficheiro: string; obra_id: string }[];
  visitas: { id: string; data: string; notas: string | null; obra_id: string }[];
};

const VAZIO: ResultadoPesquisa = { obras: [], ncs: [], documentos: [], visitas: [] };

export async function pesquisarGlobal(query: string): Promise<ResultadoPesquisa> {
  const termo = query.trim();
  if (termo.length < 2) return VAZIO;

  try {
    const supabase = await createClient();
    const like = `%${termo}%`;

    const [{ data: obras }, { data: ncs }, { data: documentos }, { data: visitas }] = await Promise.all([
      supabase.from("obras").select("id, nome, local, cliente_nome").or(`nome.ilike.${like},cliente_nome.ilike.${like},local.ilike.${like}`).limit(5),
      supabase.from("nao_conformidades").select("id, codigo, descricao, obra_id").or(`descricao.ilike.${like},codigo.ilike.${like}`).limit(5),
      supabase.from("documentos").select("id, nome_ficheiro, obra_id").ilike("nome_ficheiro", like).limit(5),
      supabase.from("visitas").select("id, data, notas, obra_id").ilike("notas", like).limit(5),
    ]);

    return {
      obras: obras ?? [],
      ncs: ncs ?? [],
      documentos: documentos ?? [],
      visitas: visitas ?? [],
    };
  } catch (err) {
    console.error("pesquisarGlobal falhou", err);
    return VAZIO;
  }
}
