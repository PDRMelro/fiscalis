-- =========================================================================
-- Fiscalis — aparência do painel por tenant (logo já existia via logo_path;
-- acrescenta as cores da barra lateral e de destaque, escolhidas pelo
-- próprio administrador em Configurações).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0023_multi_tenant.sql)
-- =========================================================================

alter table public.tenants
  add column if not exists cor_fundo_barra text,
  add column if not exists cor_destaque text;

comment on column public.tenants.cor_fundo_barra is
  'Cor de fundo da barra lateral do painel (hex, ex: #14283A). NULL = usa a cor por omissão da Fiscalis.';
comment on column public.tenants.cor_destaque is
  'Cor de destaque do painel (links ativos, sublinhados, letras) (hex, ex: #C9A050). NULL = usa a cor por omissão da Fiscalis.';
