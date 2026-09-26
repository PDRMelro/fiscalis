-- =========================================================================
-- Fiscalis — pedidos públicos de acesso de novas empresas.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0024_tenant_aparencia.sql)
--
-- Uma empresa interessada preenche um formulário público (sem login) que
-- cria uma linha aqui, em estado 'pendente'. Só o super admin (o Pedro) vê
-- estes pedidos e decide aprovar ou rejeitar. Aprovar cria de facto a
-- empresa (tabela `tenants`) e a conta de administrador — isso é o próximo
-- passo, ainda por construir. Esta migration só prepara a base de dados.
-- =========================================================================

create table public.tenant_pedidos (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  nome_responsavel text not null,
  email text not null,
  telefone text,
  mensagem text,
  estado text not null default 'pendente' check (estado in ('pendente', 'aprovado', 'rejeitado')),
  tenant_id uuid references public.tenants(id),
  criado_em timestamptz not null default now(),
  decidido_em timestamptz
);

comment on table public.tenant_pedidos is
  'Pedidos públicos de acesso de novas empresas, antes de existir tenant/conta. Aprovação manual pelo super admin.';
comment on column public.tenant_pedidos.tenant_id is
  'Preenchido quando o pedido é aprovado e a empresa é criada. NULL enquanto pendente ou se rejeitado.';
comment on column public.tenant_pedidos.decidido_em is
  'Data em que o super admin aprovou ou rejeitou o pedido. NULL enquanto pendente.';

-- Marca em `tenants` o momento em que o administrador dessa empresa define
-- a sua palavra-passe pela primeira vez (conta efetivamente ativada).
alter table public.tenants
  add column if not exists password_definida_em timestamptz;

comment on column public.tenants.password_definida_em is
  'Preenchida quando o administrador desta empresa define a password pela primeira vez. NULL = convite ainda não usado.';

alter table public.tenant_pedidos enable row level security;

-- Qualquer visitante (sem sessão) pode criar um pedido, através do
-- formulário público — mas só pode criar um pedido "limpo": pendente,
-- ainda sem tenant associado nem decisão tomada.
create policy "public_insert_tenant_pedidos" on public.tenant_pedidos
  for insert
  to anon, authenticated
  with check (estado = 'pendente' and tenant_id is null and decidido_em is null);

grant insert on public.tenant_pedidos to anon;

-- Só o super admin pode ver, aprovar, rejeitar ou apagar pedidos.
create policy "super_admin_full_tenant_pedidos" on public.tenant_pedidos
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- =========================================================================
-- Verificação manual depois de correr:
--   select count(*) from public.tenant_pedidos;               -- 0
--   select column_name from information_schema.columns
--     where table_name = 'tenants' and column_name = 'password_definida_em'; -- 1 linha
-- =========================================================================
