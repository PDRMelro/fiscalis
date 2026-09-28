alter table public.tenants
  add column if not exists limite_fiscais integer;

comment on column public.tenants.limite_fiscais is
  'Número máximo de fiscais (role=fiscal, ativos) que este tenant pode ter. NULL = sem limite.';
