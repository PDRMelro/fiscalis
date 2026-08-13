-- =========================================================================
-- Fiscalis — schema inicial
-- Cola este ficheiro inteiro no Supabase Dashboard > SQL Editor > Run.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Helpers partilhados
-- -------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create or replace function public.gen_codigo_acesso()
returns text language sql as $$
  select upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$;

-- -------------------------------------------------------------------------
-- obras
-- -------------------------------------------------------------------------
create table public.obras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cliente_nome text not null,
  local text not null,
  inicio date,
  estado text not null default 'Em curso' check (estado in ('Em curso','Concluída','Suspensa')),
  progresso smallint not null default 0 check (progresso between 0 and 100),
  honorario_mensal numeric(12,2),
  codigo_acesso text not null unique default public.gen_codigo_acesso(),
  termo_descricao_obra text,
  termo_freguesia text,
  termo_processo text,
  termo_requerimento text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_obras_updated_at before update on public.obras
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- -------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','client')),
  obra_id uuid references public.obras(id) on delete set null,
  nome text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- obra_areas (separador "Geral" — agora com obra_id, era global no protótipo)
-- -------------------------------------------------------------------------
create table public.obra_areas (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  area text not null,
  progresso smallint not null default 0 check (progresso between 0 and 100),
  estado text not null default 'Pendente'
    check (estado in ('Concluído','Em andamento','Atenção','Atrasado','Pendente')),
  ordem smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (obra_id, area)
);
create trigger trg_obra_areas_updated_at before update on public.obra_areas
  for each row execute function public.set_updated_at();

create or replace function public.recalc_obra_progresso()
returns trigger language plpgsql as $$
declare v_obra_id uuid := coalesce(new.obra_id, old.obra_id);
begin
  update public.obras
  set progresso = coalesce((select round(avg(progresso)) from public.obra_areas where obra_id = v_obra_id), 0)
  where id = v_obra_id;
  return null;
end; $$;
create trigger trg_recalc_progresso
  after insert or update or delete on public.obra_areas
  for each row execute function public.recalc_obra_progresso();

-- -------------------------------------------------------------------------
-- visitas / visita_fotos
-- -------------------------------------------------------------------------
create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  data date not null,
  notas text,
  especialidades text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.visita_fotos (
  id uuid primary key default gen_random_uuid(),
  visita_id uuid not null references public.visitas(id) on delete cascade,
  storage_path text not null,
  nome_ficheiro text not null,
  created_at timestamptz not null default now()
);

create view public.visitas_resumo
  with (security_invoker = on) as
select v.*, o.nome as obra_nome,
  (select count(*) from public.nao_conformidades n where n.visita_id = v.id and n.estado = 'Aberta') as nc_abertas,
  (select count(*) from public.visita_fotos f where f.visita_id = v.id) as fotos
from public.visitas v join public.obras o on o.id = v.obra_id;

-- -------------------------------------------------------------------------
-- nao_conformidades
-- -------------------------------------------------------------------------
create sequence public.nc_codigo_seq;
create table public.nao_conformidades (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  obra_id uuid not null references public.obras(id) on delete cascade,
  visita_id uuid references public.visitas(id) on delete set null,
  descricao text not null,
  severidade text not null check (severidade in ('Alta','Média','Baixa')),
  responsavel text,
  prazo date,
  estado text not null default 'Aberta' check (estado in ('Aberta','Em correção','Fechada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.set_nc_codigo()
returns trigger language plpgsql as $$
begin
  if new.codigo is null then
    new.codigo := 'NC-' || lpad(nextval('public.nc_codigo_seq')::text, 3, '0');
  end if;
  return new;
end; $$;
create trigger trg_nc_codigo before insert on public.nao_conformidades
  for each row execute function public.set_nc_codigo();
create trigger trg_nc_updated_at before update on public.nao_conformidades
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- propostas
-- -------------------------------------------------------------------------
create sequence public.prop_codigo_seq;
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  cliente_nome text not null,
  local text not null,
  tipo_obra text not null,
  estado text not null default 'aguarda adjudicação'
    check (estado in ('aguarda adjudicação','adjudicada','recusada')),
  enviada_em date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.set_prop_codigo()
returns trigger language plpgsql as $$
begin
  if new.codigo is null then
    new.codigo := 'PROP-' || lpad(nextval('public.prop_codigo_seq')::text, 3, '0');
  end if;
  return new;
end; $$;
create trigger trg_prop_codigo before insert on public.propostas
  for each row execute function public.set_prop_codigo();
create trigger trg_prop_updated_at before update on public.propostas
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- documentos (recebido | enviado — cobre também o Termo de Responsabilidade)
-- -------------------------------------------------------------------------
create table public.documentos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  direcao text not null check (direcao in ('recebido','enviado')),
  categoria text,
  tipo text,
  nome_ficheiro text not null,
  storage_path text not null,
  tamanho_bytes bigint,
  gerado_automaticamente boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- relatorios
-- -------------------------------------------------------------------------
create sequence public.rel_codigo_seq;
create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  obra_id uuid not null references public.obras(id) on delete cascade,
  visita_id uuid references public.visitas(id) on delete set null,
  data date not null default current_date,
  storage_path text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create or replace function public.set_rel_codigo()
returns trigger language plpgsql as $$
begin
  if new.codigo is null then
    new.codigo := 'REL-' || lpad(nextval('public.rel_codigo_seq')::text, 3, '0')
                  || '-' || to_char(now(), 'MM');
  end if;
  return new;
end; $$;
create trigger trg_rel_codigo before insert on public.relatorios
  for each row execute function public.set_rel_codigo();

-- -------------------------------------------------------------------------
-- orcamentos / faturacao_autos / intervenientes
-- -------------------------------------------------------------------------
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  servico text not null,
  fornecedor text not null,
  valor_orcamentado numeric(12,2) not null default 0,
  valor_executado numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orc_updated_at before update on public.orcamentos
  for each row execute function public.set_updated_at();

create table public.faturacao_autos (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  numero text not null,
  data date not null,
  valor numeric(12,2) not null,
  estado text not null default 'Pendente' check (estado in ('Pago','Pendente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_autos_updated_at before update on public.faturacao_autos
  for each row execute function public.set_updated_at();

create table public.intervenientes (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references public.obras(id) on delete cascade,
  papel text not null,
  nome text not null,
  contacto text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_interv_updated_at before update on public.intervenientes
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- checklist_config (template global, gerido pelo admin)
-- -------------------------------------------------------------------------
create table public.checklist_config (
  id uuid primary key default gen_random_uuid(),
  especialidade text not null,
  item text not null,
  ordem smallint not null default 0,
  created_at timestamptz not null default now()
);
insert into public.checklist_config (especialidade, item, ordem) values
  ('Estrutura', 'Armaduras conforme projeto de execução', 1),
  ('Estrutura', 'Recobrimentos mínimos respeitados', 2),
  ('Águas e esgotos', 'Inclinações de tubagem conformes', 3),
  ('Eletricidade', 'Secção de condutores conforme projeto', 4),
  ('Segurança', 'Proteções coletivas instaladas', 5),
  ('Acabamentos', 'Materiais aplicados conforme caderno de encargos', 6);

-- -------------------------------------------------------------------------
-- perfil_fiscal (singleton — substitui a constante ENGENHEIRO_FIXO)
-- -------------------------------------------------------------------------
create table public.perfil_fiscal (
  id boolean primary key default true check (id),
  nome text not null,
  qualificacao text not null,
  morada_fiscal text not null,
  nif text not null,
  cartao_cidadao text not null,
  cedula_profissional text not null,
  updated_at timestamptz not null default now()
);
create trigger trg_perfil_updated_at before update on public.perfil_fiscal
  for each row execute function public.set_updated_at();

insert into public.perfil_fiscal (id, nome, qualificacao, morada_fiscal, nif, cartao_cidadao, cedula_profissional)
values (true, 'Pedro Melro', 'Engenheiro Civil', 'Morada por definir', '000000000', '00000000', '00000');

-- =========================================================================
-- Funções de autorização
-- =========================================================================
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_obra_id()
returns uuid language sql security definer set search_path = public stable as $$
  select obra_id from public.profiles where id = auth.uid();
$$;

-- usada no ecrã de registo do cliente, antes de haver sessão, para resolver
-- o código de acesso da obra sem expor a tabela obras publicamente
create or replace function public.resolve_obra_por_codigo(p_codigo text)
returns table(obra_id uuid, obra_nome text)
language sql security definer set search_path = public stable as $$
  select id, nome from public.obras where codigo_acesso = upper(p_codigo);
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_obra_id() to authenticated;
grant execute on function public.resolve_obra_por_codigo(text) to anon, authenticated;

-- =========================================================================
-- Trigger de criação de profile ao registar (auth.users)
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, obra_id, nome, email)
  values (
    new.id, 'client',
    (new.raw_user_meta_data->>'obra_id')::uuid,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.profiles enable row level security;
create policy "admin_full_profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "self_read_profile" on public.profiles
  for select using (id = auth.uid());

alter table public.obras enable row level security;
create policy "admin_full_obras" on public.obras
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra" on public.obras
  for select using (id = public.my_obra_id());

alter table public.obra_areas enable row level security;
create policy "admin_full_obra_areas" on public.obra_areas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_areas" on public.obra_areas
  for select using (obra_id = public.my_obra_id());

alter table public.visitas enable row level security;
create policy "admin_full_visitas" on public.visitas
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_visitas" on public.visitas
  for select using (obra_id = public.my_obra_id());

alter table public.visita_fotos enable row level security;
create policy "admin_full_visita_fotos" on public.visita_fotos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_fotos" on public.visita_fotos
  for select using (
    exists (select 1 from public.visitas v where v.id = visita_id and v.obra_id = public.my_obra_id())
  );

alter table public.nao_conformidades enable row level security;
create policy "admin_full_nc" on public.nao_conformidades
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_nc" on public.nao_conformidades
  for select using (obra_id = public.my_obra_id());

alter table public.documentos enable row level security;
create policy "admin_full_documentos" on public.documentos
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_documentos" on public.documentos
  for select using (obra_id = public.my_obra_id());

alter table public.relatorios enable row level security;
create policy "admin_full_relatorios" on public.relatorios
  for all using (public.is_admin()) with check (public.is_admin());
create policy "client_read_own_obra_relatorios" on public.relatorios
  for select using (obra_id = public.my_obra_id());

-- tabelas só-admin (sem policy de cliente -> RLS nega por omissão)
alter table public.propostas enable row level security;
create policy "admin_full_propostas" on public.propostas
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.orcamentos enable row level security;
create policy "admin_full_orcamentos" on public.orcamentos
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.faturacao_autos enable row level security;
create policy "admin_full_faturacao_autos" on public.faturacao_autos
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.intervenientes enable row level security;
create policy "admin_full_intervenientes" on public.intervenientes
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.checklist_config enable row level security;
create policy "admin_full_checklist_config" on public.checklist_config
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.perfil_fiscal enable row level security;
create policy "admin_full_perfil_fiscal" on public.perfil_fiscal
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================================
-- Storage: buckets privados + policies
-- =========================================================================
insert into storage.buckets (id, name, public) values
  ('visita-fotos', 'visita-fotos', false),
  ('documentos', 'documentos', false),
  ('relatorios', 'relatorios', false)
on conflict (id) do nothing;

create policy "admin_full_visita_fotos_storage" on storage.objects
  for all using (bucket_id = 'visita-fotos' and public.is_admin())
  with check (bucket_id = 'visita-fotos' and public.is_admin());
create policy "client_read_own_obra_visita_fotos_storage" on storage.objects
  for select using (
    bucket_id = 'visita-fotos'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
  );

create policy "admin_full_documentos_storage" on storage.objects
  for all using (bucket_id = 'documentos' and public.is_admin())
  with check (bucket_id = 'documentos' and public.is_admin());
create policy "client_read_own_obra_documentos_storage" on storage.objects
  for select using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
  );

create policy "admin_full_relatorios_storage" on storage.objects
  for all using (bucket_id = 'relatorios' and public.is_admin())
  with check (bucket_id = 'relatorios' and public.is_admin());
create policy "client_read_own_obra_relatorios_storage" on storage.objects
  for select using (
    bucket_id = 'relatorios'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
  );
