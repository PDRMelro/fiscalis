-- =========================================================================
-- Fiscalis — quanto espaço de armazenamento cada empresa está a ocupar,
-- para o super admin ver no painel de Empresas.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0030_fiscal_le_logo_tenant.sql)
--
-- Soma o tamanho (bytes) de todos os ficheiros de cada tenant, em todos os
-- buckets: os ligados a obra (visita-fotos, documentos, relatorios,
-- nc-anexos — o 1º segmento do caminho é o obra_id, resolve-se o tenant
-- através da obra) e os ligados diretamente ao tenant (perfil-fiscal,
-- propostas, tenant-branding — o 1º segmento já é o tenant_id).
-- Só devolve alguma coisa quando chamada pelo super admin.
-- =========================================================================

create or replace function public.armazenamento_por_tenant()
returns table (tenant_id uuid, bytes bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_super_admin() then
    return;
  end if;

  return query
  select x.tid, sum(x.sz)::bigint
  from (
    select ob.tenant_id as tid, coalesce((o.metadata->>'size')::bigint, 0) as sz
    from storage.objects o
    join public.obras ob
      on (storage.foldername(o.name))[1] ~ '^[0-9a-fA-F-]{36}$'
      and ob.id = ((storage.foldername(o.name))[1])::uuid
    where o.bucket_id in ('visita-fotos', 'documentos', 'relatorios', 'nc-anexos')

    union all

    select ((storage.foldername(o.name))[1])::uuid as tid, coalesce((o.metadata->>'size')::bigint, 0) as sz
    from storage.objects o
    where o.bucket_id in ('perfil-fiscal', 'propostas', 'tenant-branding')
      and (storage.foldername(o.name))[1] ~ '^[0-9a-fA-F-]{36}$'
  ) x
  group by x.tid;
end;
$$;

grant execute on function public.armazenamento_por_tenant() to authenticated;

-- =========================================================================
-- Verificação manual depois de correr (autenticado como super admin, no
-- SQL Editor isto corre como "postgres" e não como um utilizador da app,
-- por isso is_super_admin() aqui dá false e a função devolve 0 linhas —
-- isso é esperado; o teste real é a partir da app, em /empresas):
--   select * from public.armazenamento_por_tenant();
-- =========================================================================
