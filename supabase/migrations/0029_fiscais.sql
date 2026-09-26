-- =========================================================================
-- Fiscalis — fiscais dentro de cada empresa.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0028_tenant_cor_texto.sql)
--
-- Introduz um terceiro papel, 'fiscal', que pertence a um tenant (como um
-- admin) mas só vê/mexe nas obras da sua empresa que lhe forem atribuídas —
-- exceto o "fiscal principal", que vê todas as obras da empresa, tal como
-- um admin veria (mas sem acesso a clientes/propostas/financeiro/
-- documentos/configurações/empresas).
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. profiles: novo papel + flag de "fiscal principal"
-- -------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'client', 'fiscal'));

alter table public.profiles
  add column if not exists fiscal_principal boolean not null default false,
  add column if not exists qualificacao text,
  add column if not exists cedula_profissional text;

comment on column public.profiles.fiscal_principal is
  'Só relevante quando role = ''fiscal''. true = vê todas as obras da empresa (não só as atribuídas).';
comment on column public.profiles.qualificacao is
  'Ex: "Eng.º Civil". Só usado para perfis de fiscal, informativo.';
comment on column public.profiles.cedula_profissional is
  'Nº de cédula profissional do fiscal (ex: Ordem dos Engenheiros), informativo.';

-- -------------------------------------------------------------------------
-- 2. Tabela de atribuição de obras a fiscais "associados" (o fiscal
-- principal não precisa de linhas aqui — já vê tudo).
-- -------------------------------------------------------------------------
create table public.obra_fiscais (
  obra_id uuid not null references public.obras(id) on delete cascade,
  fiscal_id uuid not null references public.profiles(id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (obra_id, fiscal_id)
);

comment on table public.obra_fiscais is
  'Atribuição de obras a fiscais associados (não-principais). Um fiscal principal vê todas as obras do seu tenant sem precisar de linhas aqui.';

-- -------------------------------------------------------------------------
-- 3. Funções auxiliares (mesmo padrão de is_admin()/my_tenant_id()).
-- -------------------------------------------------------------------------
create or replace function public.is_fiscal()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select role = 'fiscal' and ativo from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_fiscal_principal()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select role = 'fiscal' and ativo and fiscal_principal from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.fiscal_pode_ver_obra(p_obra_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select public.is_fiscal()
    and public.obra_tenant_id(p_obra_id) = public.my_tenant_id()
    and (
      public.is_fiscal_principal()
      or exists (
        select 1 from public.obra_fiscais f
        where f.obra_id = p_obra_id and f.fiscal_id = auth.uid()
      )
    );
$$;

grant execute on function public.is_fiscal() to authenticated;
grant execute on function public.is_fiscal_principal() to authenticated;
grant execute on function public.fiscal_pode_ver_obra(uuid) to authenticated;

-- -------------------------------------------------------------------------
-- 4. proteger_campos_profile(): impedir que um fiscal se auto-promova a
-- principal (mesma proteção que já existe para role/tenant_id/etc).
-- -------------------------------------------------------------------------
create or replace function public.proteger_campos_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
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
    new.fiscal_principal := old.fiscal_principal;
    new.created_at := old.created_at;
  end if;
  return new;
end; $$;

-- -------------------------------------------------------------------------
-- 5. RLS: policies novas para fiscais (além das admin_full_*/client_*
-- já existentes — não mexem em nada disso).
-- -------------------------------------------------------------------------
alter table public.obra_fiscais enable row level security;
create policy "admin_full_obra_fiscais" on public.obra_fiscais
  for all using (
    public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id())
  )
  with check (
    public.is_super_admin() or (public.is_admin() and public.obra_tenant_id(obra_id) = public.my_tenant_id())
  );

create policy "fiscal_read_obras" on public.obras
  for select using (public.fiscal_pode_ver_obra(id));

create policy "fiscal_full_obra_areas" on public.obra_areas
  for all using (public.fiscal_pode_ver_obra(obra_id)) with check (public.fiscal_pode_ver_obra(obra_id));

create policy "fiscal_full_visitas" on public.visitas
  for all using (public.fiscal_pode_ver_obra(obra_id)) with check (public.fiscal_pode_ver_obra(obra_id));

create policy "fiscal_full_visita_fotos" on public.visita_fotos
  for all using (
    exists (select 1 from public.visitas v where v.id = visita_id and public.fiscal_pode_ver_obra(v.obra_id))
  )
  with check (
    exists (select 1 from public.visitas v where v.id = visita_id and public.fiscal_pode_ver_obra(v.obra_id))
  );

create policy "fiscal_full_nc" on public.nao_conformidades
  for all using (public.fiscal_pode_ver_obra(obra_id)) with check (public.fiscal_pode_ver_obra(obra_id));

create policy "fiscal_full_nc_fotos" on public.nc_fotos
  for all using (
    exists (select 1 from public.nao_conformidades n where n.id = nc_id and public.fiscal_pode_ver_obra(n.obra_id))
  )
  with check (
    exists (select 1 from public.nao_conformidades n where n.id = nc_id and public.fiscal_pode_ver_obra(n.obra_id))
  );

create policy "fiscal_full_relatorios" on public.relatorios
  for all using (public.fiscal_pode_ver_obra(obra_id)) with check (public.fiscal_pode_ver_obra(obra_id));

create policy "fiscal_read_checklist_config" on public.checklist_config
  for select using (public.is_fiscal() and tenant_id = public.my_tenant_id());

-- Storage: mesmos 3 buckets operacionais (visita-fotos, nc-anexos,
-- relatorios) — não documentos/perfil-fiscal/propostas/tenant-branding.
create policy "fiscal_full_visita_fotos_storage" on storage.objects
  for all using (
    bucket_id = 'visita-fotos' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'visita-fotos' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  );

create policy "fiscal_full_nc_anexos_storage" on storage.objects
  for all using (
    bucket_id = 'nc-anexos' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'nc-anexos' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  );

create policy "fiscal_full_relatorios_storage" on storage.objects
  for all using (
    bucket_id = 'relatorios' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'relatorios' and public.fiscal_pode_ver_obra((storage.foldername(name))[1]::uuid)
  );

-- =========================================================================
-- Verificação manual depois de correr:
--   select conname from pg_constraint where conname = 'profiles_role_check'; -- 1 linha
--   select count(*) from public.obra_fiscais; -- 0
--   select public.is_fiscal(); -- false (não autenticado/és admin)
-- =========================================================================
