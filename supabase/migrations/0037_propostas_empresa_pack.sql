-- =========================================================================
-- Fiscalis — propostas passam a distinguir cliente particular de empresa
-- (com n.º de alvará para empresas) e, na fiscalização, a permitir um pack
-- de X visitas para o prazo total estimado da obra, em alternativa à avença
-- anual por periodicidade. As visitas para além do pack usam o valor por
-- visita extra já existente (valor_visita_extra).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0036)
-- =========================================================================

alter table public.propostas
  add column if not exists cliente_tipo text not null default 'particular'
    check (cliente_tipo in ('particular','empresa')),
  add column if not exists cliente_alvara text,
  add column if not exists modalidade_visitas text not null default 'periodica'
    check (modalidade_visitas in ('periodica','pack')),
  add column if not exists pack_num_visitas integer check (pack_num_visitas > 0),
  add column if not exists prazo_obra_meses integer check (prazo_obra_meses > 0),
  add column if not exists valor_pack numeric(10,2);
