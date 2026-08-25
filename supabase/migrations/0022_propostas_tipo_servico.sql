-- =========================================================================
-- Fiscalis — propostas passam a poder ser de dois tipos: fiscalização de
-- obra (já existente, com periodicidade de visitas) ou consultoria de
-- construção civil (novo, com um valor fixo único pelo serviço).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0021)
-- =========================================================================

alter table public.propostas
  add column if not exists tipo_servico text not null default 'fiscalizacao'
    check (tipo_servico in ('fiscalizacao','consultoria')),
  add column if not exists valor_servico numeric(10,2),
  add column if not exists descricao_servico text;
