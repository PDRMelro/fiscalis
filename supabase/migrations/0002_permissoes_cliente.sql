-- =========================================================================
-- Fiscalis — permissões por cliente
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001_init.sql, que já deve ter corrido com sucesso)
-- =========================================================================

alter table public.profiles
  add column if not exists ativo boolean not null default true,
  add column if not exists pode_ver_relatorios boolean not null default true,
  add column if not exists pode_ver_nc boolean not null default true,
  add column if not exists pode_ver_documentos boolean not null default true,
  add column if not exists pode_ver_financeiro boolean not null default false;

comment on column public.profiles.ativo is
  'Interruptor geral: desligar suspende o acesso do cliente sem apagar a conta.';
comment on column public.profiles.pode_ver_financeiro is
  'Por omissão false — orçamentos e faturação ficam escondidos até o admin autorizar por cliente.';

-- -------------------------------------------------------------------------
-- my_obra_id() passa a devolver null se a conta estiver inativa, o que já
-- bloqueia automaticamente obras/áreas/visitas/fotos para essa conta
-- (todas essas policies comparam obra_id = my_obra_id()).
-- -------------------------------------------------------------------------
create or replace function public.my_obra_id()
returns uuid language sql security definer set search_path = public stable as $$
  select obra_id from public.profiles where id = auth.uid() and ativo;
$$;

-- -------------------------------------------------------------------------
-- Helpers de visibilidade granular (um por permissão configurável)
-- -------------------------------------------------------------------------
create or replace function public.pode_ver_relatorios()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select pode_ver_relatorios from public.profiles where id = auth.uid() and ativo), false);
$$;

create or replace function public.pode_ver_nc()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select pode_ver_nc from public.profiles where id = auth.uid() and ativo), false);
$$;

create or replace function public.pode_ver_documentos_cliente()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select pode_ver_documentos from public.profiles where id = auth.uid() and ativo), false);
$$;

create or replace function public.pode_ver_financeiro()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select pode_ver_financeiro from public.profiles where id = auth.uid() and ativo), false);
$$;

grant execute on function public.pode_ver_relatorios() to authenticated;
grant execute on function public.pode_ver_nc() to authenticated;
grant execute on function public.pode_ver_documentos_cliente() to authenticated;
grant execute on function public.pode_ver_financeiro() to authenticated;

-- -------------------------------------------------------------------------
-- Aplicar os toggles às policies de leitura já existentes
-- -------------------------------------------------------------------------
alter policy "client_read_own_obra_relatorios" on public.relatorios
  using (obra_id = public.my_obra_id() and public.pode_ver_relatorios());

alter policy "client_read_own_obra_nc" on public.nao_conformidades
  using (obra_id = public.my_obra_id() and public.pode_ver_nc());

alter policy "client_read_own_obra_documentos" on public.documentos
  using (obra_id = public.my_obra_id() and public.pode_ver_documentos_cliente());

alter policy "client_read_own_obra_relatorios_storage" on storage.objects
  using (
    bucket_id = 'relatorios'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
    and public.pode_ver_relatorios()
  );

alter policy "client_read_own_obra_documentos_storage" on storage.objects
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
    and public.pode_ver_documentos_cliente()
  );

-- -------------------------------------------------------------------------
-- Novo: orçamentos e faturação passam a poder ser mostrados ao cliente,
-- mas só se o admin ligar "pode_ver_financeiro" (por omissão está desligado
-- — antes desta migração estes dados eram sempre invisíveis ao cliente).
-- -------------------------------------------------------------------------
create policy "client_read_own_obra_orcamentos" on public.orcamentos
  for select using (obra_id = public.my_obra_id() and public.pode_ver_financeiro());

create policy "client_read_own_obra_faturacao" on public.faturacao_autos
  for select using (obra_id = public.my_obra_id() and public.pode_ver_financeiro());
