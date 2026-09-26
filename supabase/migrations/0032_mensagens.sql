-- =========================================================================
-- Fiscalis — mensagens internas (super admin ↔ admins, super admin ↔ os
-- seus próprios fiscais, admin ↔ os fiscais da sua empresa).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0031_armazenamento_por_tenant.sql)
-- =========================================================================

create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  remetente_id uuid not null references public.profiles(id) on delete cascade,
  destinatario_id uuid not null references public.profiles(id) on delete cascade,
  corpo text not null,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

comment on table public.mensagens is
  'Mensagens internas entre super admin/admins/fiscais. Sem tempo real — atualiza ao abrir/enviar.';

create index mensagens_remetente_idx on public.mensagens (remetente_id);
create index mensagens_destinatario_idx on public.mensagens (destinatario_id);

-- -------------------------------------------------------------------------
-- Quem pode falar com quem:
--   super admin <-> qualquer admin de empresa
--   super admin <-> os seus próprios fiscais (mesmo tenant do super admin)
--   admin normal <-> os fiscais da sua própria empresa
-- -------------------------------------------------------------------------
create or replace function public.pode_conversar(p_outro_id uuid)
returns boolean language plpgsql security definer set search_path = public stable as $$
declare
  eu record;
  outro record;
begin
  if p_outro_id = auth.uid() then
    return false;
  end if;

  select role, tenant_id, is_super_admin into eu from public.profiles where id = auth.uid();
  select role, tenant_id, is_super_admin into outro from public.profiles where id = p_outro_id;
  if eu is null or outro is null then
    return false;
  end if;

  if eu.is_super_admin then
    return outro.role = 'admin' or (outro.role = 'fiscal' and outro.tenant_id = eu.tenant_id);
  end if;

  if outro.is_super_admin then
    return eu.role = 'admin' or (eu.role = 'fiscal' and eu.tenant_id = outro.tenant_id);
  end if;

  if eu.role = 'admin' and outro.role = 'fiscal' and eu.tenant_id = outro.tenant_id then
    return true;
  end if;
  if eu.role = 'fiscal' and outro.role = 'admin' and eu.tenant_id = outro.tenant_id then
    return true;
  end if;

  return false;
end;
$$;

-- Lista de contactos possíveis para o utilizador autenticado, com o mesmo
-- critério de pode_conversar() — evita ter de alargar as policies de
-- leitura de "profiles" só para isto.
create or replace function public.pessoas_para_conversar()
returns table (id uuid, nome text, role text, nome_empresa text)
language plpgsql security definer set search_path = public stable as $$
declare
  eu record;
begin
  select p.role, p.tenant_id, p.is_super_admin into eu from public.profiles p where p.id = auth.uid();
  if eu is null then
    return;
  end if;

  if eu.is_super_admin then
    return query
    select p.id, p.nome, p.role, t.nome_empresa
    from public.profiles p
    left join public.tenants t on t.id = p.tenant_id
    where (p.role = 'admin' and not p.is_super_admin)
       or (p.role = 'fiscal' and p.tenant_id = eu.tenant_id)
    order by p.role, p.nome;
  elsif eu.role = 'admin' then
    return query
    select p.id, p.nome, p.role, t.nome_empresa
    from public.profiles p
    left join public.tenants t on t.id = p.tenant_id
    where (p.role = 'fiscal' and p.tenant_id = eu.tenant_id)
       or (p.role = 'admin' and p.is_super_admin)
    order by p.role desc, p.nome;
  elsif eu.role = 'fiscal' then
    return query
    select p.id, p.nome, p.role, t.nome_empresa
    from public.profiles p
    left join public.tenants t on t.id = p.tenant_id
    where p.role = 'admin' and p.tenant_id = eu.tenant_id
    order by p.nome;
  end if;
end;
$$;

grant execute on function public.pode_conversar(uuid) to authenticated;
grant execute on function public.pessoas_para_conversar() to authenticated;

-- Impede que quem recebe uma mensagem altere o que não seja o "lida"
-- (ou que quem quer que seja mude o remetente/destinatário depois de criada).
create or replace function public.proteger_campos_mensagem()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.remetente_id := old.remetente_id;
  new.destinatario_id := old.destinatario_id;
  new.corpo := old.corpo;
  new.criado_em := old.criado_em;
  return new;
end; $$;

create trigger proteger_campos_mensagem_trigger
  before update on public.mensagens
  for each row execute function public.proteger_campos_mensagem();

alter table public.mensagens enable row level security;

create policy "mensagens_insert" on public.mensagens
  for insert
  with check (remetente_id = auth.uid() and public.pode_conversar(destinatario_id));

create policy "mensagens_select" on public.mensagens
  for select
  using (remetente_id = auth.uid() or destinatario_id = auth.uid());

create policy "mensagens_update_lida" on public.mensagens
  for update
  using (destinatario_id = auth.uid())
  with check (destinatario_id = auth.uid());

-- =========================================================================
-- Verificação manual depois de correr:
--   select count(*) from public.mensagens; -- 0
-- =========================================================================
