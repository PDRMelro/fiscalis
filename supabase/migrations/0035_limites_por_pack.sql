-- =========================================================================
-- Fiscalis — limites por pack contratado (nº de clientes e espaço de
-- armazenamento), com bloqueio automático quando ultrapassado.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0034_eliminar_mensagens.sql)
-- =========================================================================

alter table public.tenants
  add column if not exists limite_clientes integer,
  add column if not exists limite_armazenamento_bytes bigint;

comment on column public.tenants.limite_clientes is
  'Nº máximo de clientes (role=client) que este tenant pode ter. NULL = sem limite (ex: tenant da Fiscalis).';
comment on column public.tenants.limite_armazenamento_bytes is
  'Espaço máximo de armazenamento (bytes) para este tenant, em todos os buckets. NULL = sem limite.';

-- -------------------------------------------------------------------------
-- Resolve o tenant_id "dono" de um objeto de storage, a partir do bucket e
-- do caminho — mesma lógica já usada em armazenamento_por_tenant().
-- -------------------------------------------------------------------------
create or replace function public.tenant_do_objeto(p_bucket_id text, p_name text)
returns uuid language plpgsql security definer set search_path = public stable as $$
declare
  v_primeiro text;
begin
  v_primeiro := (storage.foldername(p_name))[1];
  if v_primeiro !~ '^[0-9a-fA-F-]{36}$' then
    return null;
  end if;

  if p_bucket_id in ('visita-fotos', 'documentos', 'relatorios', 'nc-anexos') then
    return (select tenant_id from public.obras where id = v_primeiro::uuid);
  elsif p_bucket_id in ('perfil-fiscal', 'propostas', 'tenant-branding') then
    return v_primeiro::uuid;
  end if;

  return null;
end;
$$;

-- -------------------------------------------------------------------------
-- Espaço já usado por um único tenant (bytes), em todos os buckets. Versão
-- interna, sem verificação de posse — só chamada por outras funções
-- security definer desta migração (o trigger de quota precisa de conseguir
-- somar o uso de qualquer tenant, independentemente de quem fez o upload:
-- ex. um cliente, cujo profiles.tenant_id é null). Não é concedida a
-- authenticated/anon, por isso não é chamável diretamente a partir da app.
-- -------------------------------------------------------------------------
create or replace function public.bytes_usados_por_tenant_interno(p_tenant_id uuid)
returns bigint language sql security definer set search_path = public stable as $$
  select coalesce(sum(sz), 0)::bigint
  from (
    select coalesce((o.metadata->>'size')::bigint, 0) as sz
    from storage.objects o
    join public.obras ob
      on (storage.foldername(o.name))[1] ~ '^[0-9a-fA-F-]{36}$'
      and ob.id = ((storage.foldername(o.name))[1])::uuid
    where o.bucket_id in ('visita-fotos', 'documentos', 'relatorios', 'nc-anexos')
      and ob.tenant_id = p_tenant_id

    union all

    select coalesce((o.metadata->>'size')::bigint, 0) as sz
    from storage.objects o
    where o.bucket_id in ('perfil-fiscal', 'propostas', 'tenant-branding')
      and (storage.foldername(o.name))[1] ~ '^[0-9a-fA-F-]{36}$'
      and ((storage.foldername(o.name))[1])::uuid = p_tenant_id
  ) x;
$$;

-- -------------------------------------------------------------------------
-- Versão pública, para a app consultar o uso do PRÓPRIO tenant (ex: cartão
-- de plano/utilização em Configurações). Só o próprio tenant (qualquer
-- role) ou o super admin podem consultar — sem isto, qualquer conta
-- autenticada podia passar o tenant_id de outra empresa e ver o espaço
-- ocupado dela.
-- -------------------------------------------------------------------------
create or replace function public.bytes_usados_por_tenant(p_tenant_id uuid)
returns bigint language plpgsql security definer set search_path = public stable as $$
begin
  if p_tenant_id is distinct from public.my_tenant_id() and not public.is_super_admin() then
    return 0;
  end if;

  return public.bytes_usados_por_tenant_interno(p_tenant_id);
end;
$$;

grant execute on function public.bytes_usados_por_tenant(uuid) to authenticated;

-- -------------------------------------------------------------------------
-- "Porteiro": recusa gravar um novo ficheiro se isso ultrapassar o limite
-- de armazenamento do tenant. Corre para qualquer upload, seja qual for o
-- sítio da app que o despoletou — não há como contornar isto por engano.
-- -------------------------------------------------------------------------
create or replace function public.verificar_limite_armazenamento()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tenant_id uuid;
  v_limite bigint;
  v_usado bigint;
  v_tamanho bigint;
begin
  v_tenant_id := public.tenant_do_objeto(new.bucket_id, new.name);
  if v_tenant_id is null then
    return new;
  end if;

  select limite_armazenamento_bytes into v_limite from public.tenants where id = v_tenant_id;
  if v_limite is null then
    return new;
  end if;

  v_tamanho := coalesce((new.metadata->>'size')::bigint, 0);
  v_usado := public.bytes_usados_por_tenant_interno(v_tenant_id);

  if v_usado + v_tamanho > v_limite then
    raise exception 'Limite de armazenamento do teu plano atingido. Contacta a Fiscalis para aumentares o plano, ou descarrega ficheiros antigos para o teu computador e apaga-os da plataforma para libertar espaço.';
  end if;

  return new;
end;
$$;

drop trigger if exists verificar_limite_armazenamento_trigger on storage.objects;
create trigger verificar_limite_armazenamento_trigger
  before insert on storage.objects
  for each row execute function public.verificar_limite_armazenamento();

-- -------------------------------------------------------------------------
-- Bloqueia o auto-registo de um cliente novo se a empresa já estiver no
-- limite de clientes do seu pack. Chamado a partir do registo (sem sessão
-- ainda), por isso está aberto a "anon" tal como resolve_obra_por_codigo já
-- estava.
-- -------------------------------------------------------------------------
create or replace function public.pode_registar_cliente(p_obra_id uuid)
returns boolean language plpgsql security definer set search_path = public stable as $$
declare
  v_tenant_id uuid;
  v_limite integer;
  v_atual integer;
begin
  select tenant_id into v_tenant_id from public.obras where id = p_obra_id;
  if v_tenant_id is null then
    return false;
  end if;

  select limite_clientes into v_limite from public.tenants where id = v_tenant_id;
  if v_limite is null then
    return true;
  end if;

  select count(*) into v_atual from public.profiles where tenant_id = v_tenant_id and role = 'client';
  return v_atual < v_limite;
end;
$$;

grant execute on function public.pode_registar_cliente(uuid) to anon, authenticated;

-- =========================================================================
-- Verificação manual depois de correr:
--   select bytes_usados_por_tenant(id), limite_armazenamento_bytes, limite_clientes
--   from public.tenants;
-- =========================================================================
