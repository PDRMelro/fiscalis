-- =========================================================================
-- Fiscalis — valor (em euros) acordado/pago por cada empresa.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0025_tenant_pedidos.sql)
-- =========================================================================

alter table public.tenants
  add column if not exists valor_pago numeric(10, 2);

comment on column public.tenants.valor_pago is
  'Valor em euros acordado/pago por esta empresa pelo acesso à plataforma. NULL = não definido.';
