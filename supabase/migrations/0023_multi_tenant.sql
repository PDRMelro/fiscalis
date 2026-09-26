-- =========================================================================
-- Fiscalis — conversão para multi-tenant (várias empresas na mesma app)
-- Cola este ficheiro inteiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0022_propostas_tipo_servico.sql)
--
-- ANTES DE CORRER: confirma que tens um backup recente (Database > Backups,
-- ou exporta manualmente as tabelas perfil_fiscal/profiles/obras em CSV).
--
-- O que esta migration faz, por ordem:
--   1. Cria a tabela `tenants` (uma linha = uma empresa cliente da Fiscalis).
--   2. Acrescenta as colunas novas (ainda sem obrigatoriedade) a profiles,
--      obras, checklist_config, propostas e perfil_fiscal.
--   3. Cria as funções is_super_admin() / my_tenant_id() / obra_tenant_id().
--   4. Cria o tenant "Fiscalis Engenharia" e atribui-o a tudo o que já
--      existe, e marca a(s) conta(s) admin atuais como super admin.
--   5. Fecha as colunas novas com NOT NULL / defaults / unique, agora que
--      já têm valor em todas as linhas existentes.
--   6. Reescreve as policies "admin_full_*" (tabelas e storage) para
--      passarem a respeitar o tenant, em vez de verem tudo.
--   7. Cria o bucket `tenant-branding` para os logos.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. Tabela `tenants` (ainda sem RLS/policies — precisam de funções que só
-- existem depois da secção 3, por isso ficam para a secção 3-B)
-- -------------------------------------------------------------------------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome_empresa text not null,
  logo_path text,
  plano text,
  ativo_ate date,
  cancelado_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on column public.tenants.ativo_ate is
  'Data acordada de validade do acesso. NULL = sem validade (caso do tenant da própria Fiscalis).';
comment on column public.tenants.cancelado_em is
  'Preenchido = acesso cortado manualmente, independente de ativo_ate. NULL = não cancelado.';

-- -------------------------------------------------------------------------
-- 2. Colunas novas (sem NOT NULL ainda — só depois do backfill na secção 4)
-- -------------------------------------------------------------------------
alter table public.profiles
  add column if not exists tenant_id uuid references public.tenants(id),
  add column if not exists is_super_admin boolean not null default false;

alter table public.obras
  add column if not exists tenant_id uuid references public.tenants(id);

alter table public.checklist_config
  add column if not exists tenant_id uuid references public.tenants(id);

alter table public.propostas
  add column if not exists tenant_id uuid references public.tenants(id);

-- perfil_fiscal era um singleton forçado (id boolean primary key default
-- true check(id)) — passa a ter um id uuid normal, um por tenant.
alter table public.perfil_fiscal
  add column if not exists tenant_id uuid references public.tenants(id),
  add column if not exists id_novo uuid not null default gen_random_uuid();

-- -------------------------------------------------------------------------
-- 3. Funções de autorização multi-tenant
-- -------------------------------------------------------------------------
create or replace function public.is_super_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin' and is_super_admin
  );
$$;

create or replace function public.my_tenant_id()
returns uuid language sql security definer set search_path = public stable as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.obra_tenant_id(p_obra_id uuid)
returns uuid language sql security definer set search_path = public stable as $$
  select tenant_id from public.obras where id = p_obra_id;
$$;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.my_tenant_id() to authenticated;
grant execute on function public.obra_tenant_id(uuid) to authenticated;

-- Agora que existe my_tenant_id(), pode servir de default a novas linhas —
-- um admin normal nunca precisa de saber o próprio tenant_id.
alter table public.obras alter column tenant_id set default public.my_tenant_id();
alter table public.checklist_config alter column tenant_id set default public.my_tenant_id();
alter table public.propostas alter column tenant_id set default public.my_tenant_id();
alter table public.perfil_fiscal alter column tenant_id set default public.my_tenant_id();

-- -------------------------------------------------------------------------
-- 3-B. RLS da tabela `tenants` (só agora, com as funções já a existir)
-- -------------------------------------------------------------------------
alter table public.tenants enable row level security;

-- Só o super admin gere tenants livremente (criar, ver todos, cancelar,
-- mudar plano/validade). Um admin normal só vê e edita o PRÓPRIO tenant —
-- e mesmo aí, só o nome/logo (ver trigger proteger_campos_tenant mais
-- abaixo, que impede um admin normal de alterar plano/ativo_ate/cancelado_em
-- do seu próprio tenant, exatamente como já acontece em profiles).
create policy "super_admin_full_tenants" on public.tenants
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Só select+update (nunca insert/delete) — um admin normal não pode criar
-- nem apagar tenants, só editar o seu próprio (e, mesmo assim, apenas os
-- campos que a trigger abaixo não protege).
create policy "admin_read_own_tenant" on public.tenants
  for select using (id = public.my_tenant_id());

create policy "admin_update_own_tenant" on public.tenants
  for update using (id = public.my_tenant_id()) with check (id = public.my_tenant_id());

create or replace function public.proteger_campos_tenant()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    new.plano := old.plano;
    new.ativo_ate := old.ativo_ate;
    new.cancelado_em := old.cancelado_em;
    new.criado_em := old.criado_em;
  end if;
  return new;
end; $$;

create trigger proteger_campos_tenant_trigger
  before update on public.tenants
  for each row execute function public.proteger_campos_tenant();

-- -------------------------------------------------------------------------
-- 4. Backfill: cria o tenant da Fiscalis e atribui-o a tudo o que já existe
-- -------------------------------------------------------------------------
do $$
declare
  v_tenant_fiscalis uuid;
begin
  insert into public.tenants (nome_empresa, plano, ativo_ate)
  values ('Fiscalis Engenharia', 'Fundador', null)
  returning id into v_tenant_fiscalis;

  update public.profiles set tenant_id = v_tenant_fiscalis where tenant_id is null;
  update public.profiles set is_super_admin = true where role = 'admin';
  update public.obras set tenant_id = v_tenant_fiscalis where tenant_id is null;
  update public.checklist_config set tenant_id = v_tenant_fiscalis where tenant_id is null;
  update public.propostas set tenant_id = v_tenant_fiscalis where tenant_id is null;
  update public.perfil_fiscal set tenant_id = v_tenant_fiscalis where tenant_id is null;
end $$;

-- -------------------------------------------------------------------------
-- 5. Fechar as colunas com NOT NULL / unique, agora que têm valor
-- -------------------------------------------------------------------------
alter table public.obras alter column tenant_id set not null;
alter table public.checklist_config alter column tenant_id set not null;
alter table public.propostas alter column tenant_id set not null;
alter table public.perfil_fiscal alter column tenant_id set not null;
alter table public.perfil_fiscal add constraint perfil_fiscal_tenant_id_key unique (tenant_id);

-- Troca o id boolean pelo id uuid novo (nenhuma outra tabela referencia
-- perfil_fiscal.id, por isso é seguro trocar a PK diretamente).
alter table public.perfil_fiscal drop constraint perfil_fiscal_pkey;
alter table public.perfil_fiscal drop column id;
alter table public.perfil_fiscal rename column id_novo to id;
alter table public.perfil_fiscal add primary key (id);

-- -------------------------------------------------------------------------
-- Proteger tenant_id/is_super_admin no self-update do próprio perfil —
-- o mesmo trigger que já impede um cliente de se auto-promover a admin
-- (migration 0017) passa a proteger também os campos novos.
-- -------------------------------------------------------------------------
create or replace function public.proteger_campos_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.obra_id := old.obra_id;
    new.email := old.email;
    new.ativo := old.ativo;
    new.pode_ver_relatorios := old.pode_ver_relatorios;
    new.pode_ver_nc := old.pode_ver_nc;
    new.pode_ver_documentos := old.pode_ver_documentos;
    new.pode_ver_financeiro := old.pode_ver_financeiro;
    new.pode_ver_intervenientes := old.pode_ver_intervenientes;
    new.tenant_id := old.tenant_id;
    new.is_super_admin := old.is_super_admin;
    new.created_at := old.created_at;
  end if;
  return new;
end; $$;

-- -------------------------------------------------------------------------
-- 6. Reescrever as policies "admin_full_*" para respeitarem o tenant
-- -------------------------------------------------------------------------

-- profiles / obras / checklist_config / propostas / perfil_fiscal já têm
-- tenant_id na própria linha.
alter policy "admin_full_profiles" on public.profiles
  using (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()));

alter policy "admin_full_obras" on public.obras
  using (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()));

alter policy "admin_full_checklist_config" on public.checklist_config
  using (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()));

alter policy "admin_full_propostas" on public.propostas
  using (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()));

alter policy "admin_full_perfil_fiscal" on public.perfil_fiscal
  using (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and tenant_id = public.my_tenant_id()));

-- Tabelas filhas de obra: posse verificada por transitividade via obra_id.
alter policy "admin_full_obra_areas" on public.obra_areas
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_visitas" on public.visitas
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_nc" on public.nao_conformidades
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_documentos" on public.documentos
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_relatorios" on public.relatorios
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_orcamentos" on public.orcamentos
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_faturacao_autos" on public.faturacao_autos
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

alter policy "admin_full_intervenientes" on public.intervenientes
  using (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()))
  with check (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id()));

-- Tabelas "netas" de obra (ligam-se por visita_id/nc_id, não por obra_id direto).
alter policy "admin_full_visita_fotos" on public.visita_fotos
  using (
    public.is_super_admin() or (public.is_admin() and exists (
      select 1 from public.visitas v where v.id = visita_id
      and public.obra_tenant_id(v.obra_id) = public.my_tenant_id()
    ))
  )
  with check (
    public.is_super_admin() or (public.is_admin() and exists (
      select 1 from public.visitas v where v.id = visita_id
      and public.obra_tenant_id(v.obra_id) = public.my_tenant_id()
    ))
  );

alter policy "admin_full_nc_fotos" on public.nc_fotos
  using (
    public.is_super_admin() or (public.is_admin() and exists (
      select 1 from public.nao_conformidades n where n.id = nc_id
      and public.obra_tenant_id(n.obra_id) = public.my_tenant_id()
    ))
  )
  with check (
    public.is_super_admin() or (public.is_admin() and exists (
      select 1 from public.nao_conformidades n where n.id = nc_id
      and public.obra_tenant_id(n.obra_id) = public.my_tenant_id()
    ))
  );

-- -------------------------------------------------------------------------
-- 7. Storage: bucket novo para logos + policies tenant-aware
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('tenant-branding', 'tenant-branding', false)
  on conflict (id) do nothing;

create policy "admin_full_tenant_branding_storage" on storage.objects
  for all using (
    bucket_id = 'tenant-branding'
    and (public.is_super_admin() or (public.is_admin() and (storage.foldername(name))[1]::uuid = public.my_tenant_id()))
  )
  with check (
    bucket_id = 'tenant-branding'
    and (public.is_super_admin() or (public.is_admin() and (storage.foldername(name))[1]::uuid = public.my_tenant_id()))
  );

-- Buckets já existentes ligados a obra: o path já é {obra_id}/..., só a
-- policy de admin muda (a de cliente mantém-se, não depende de tenant).
alter policy "admin_full_visita_fotos_storage" on storage.objects
  using (bucket_id = 'visita-fotos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())))
  with check (bucket_id = 'visita-fotos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())));

alter policy "admin_full_documentos_storage" on storage.objects
  using (bucket_id = 'documentos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())))
  with check (bucket_id = 'documentos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())));

alter policy "admin_full_relatorios_storage" on storage.objects
  using (bucket_id = 'relatorios' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())))
  with check (bucket_id = 'relatorios' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())));

alter policy "admin_full_nc_anexos_storage" on storage.objects
  using (bucket_id = 'nc-anexos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())))
  with check (bucket_id = 'nc-anexos' and (public.is_super_admin() or (public.is_admin() and public.obra_tenant_id((storage.foldername(name))[1]::uuid) = public.my_tenant_id())));

-- Buckets sem obra: passam a exigir {tenant_id}/... como 1º segmento do
-- path (mudança de convenção — o código que faz upload tem de passar a
-- gerar o path assim; ver lib/actions/perfilFiscal.ts e tenant.ts).
--
-- Ficheiros já existentes (ex: seguro-rc/{uuid}-nome, de antes desta
-- migration) não têm um uuid no 1º segmento — um cast direto para uuid
-- rebentaria com erro em vez de simplesmente negar acesso. Por isso a
-- condição só faz o cast depois de confirmar por regex que parece um uuid;
-- caso contrário só o super admin (que já tem sempre acesso) consegue lá
-- chegar, até o código passar a gerar sempre paths com tenant_id.
alter policy "admin_full_perfil_fiscal_storage" on storage.objects
  using (
    bucket_id = 'perfil-fiscal' and (
      public.is_super_admin() or (
        public.is_admin()
        and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        and (storage.foldername(name))[1]::uuid = public.my_tenant_id()
      )
    )
  )
  with check (
    bucket_id = 'perfil-fiscal' and (
      public.is_super_admin() or (
        public.is_admin()
        and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        and (storage.foldername(name))[1]::uuid = public.my_tenant_id()
      )
    )
  );

alter policy "admin_full_propostas_storage" on storage.objects
  using (
    bucket_id = 'propostas' and (
      public.is_super_admin() or (
        public.is_admin()
        and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        and (storage.foldername(name))[1]::uuid = public.my_tenant_id()
      )
    )
  )
  with check (
    bucket_id = 'propostas' and (
      public.is_super_admin() or (
        public.is_admin()
        and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
        and (storage.foldername(name))[1]::uuid = public.my_tenant_id()
      )
    )
  );

-- -------------------------------------------------------------------------
-- Verificação a correr manualmente logo a seguir (não faz parte da
-- migration, é só para conferir no SQL Editor):
--
--   select count(*) from public.obras where tenant_id is null;         -- 0
--   select count(*) from public.perfil_fiscal;                          -- 1
--   select nome_empresa, ativo_ate from public.tenants;                 -- "Fiscalis Engenharia" | null
--   select email, is_super_admin from public.profiles where role='admin'; -- true na tua conta
-- =========================================================================
