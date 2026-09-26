-- =========================================================================
-- Fiscalis — cor das letras da barra lateral, independente da cor de
-- destaque (que continua só para os itens ativos do menu).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0027_fix_protecao_perfil_service_role.sql)
-- =========================================================================

alter table public.tenants
  add column if not exists cor_texto text;

comment on column public.tenants.cor_texto is
  'Cor do texto geral da barra lateral (nome da empresa, itens de menu inativos) (hex, ex: #FFFFFF). NULL = usa a cor por omissão da Fiscalis.';
