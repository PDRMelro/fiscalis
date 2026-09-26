-- =========================================================================
-- Fiscalis — corrige o trigger de proteção de campos de `profiles` para não
-- desfazer alterações feitas pela service_role (ex: aprovarPedido, que
-- promove um perfil a administrador de uma empresa).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0026_tenant_valor_pago.sql)
--
-- Bug: proteger_campos_profile() reset role/tenant_id/etc para os valores
-- antigos sempre que "not is_admin()". Quando quem faz o UPDATE é a
-- service_role (sem sessão de utilizador), auth.uid() é NULL e is_admin()
-- devolve false — logo o trigger desfazia silenciosamente a promoção a
-- admin feita por aprovarPedido, deixando o perfil preso como "client"
-- sem tenant. A service_role já ignora RLS por completo, por isso confiar
-- nela aqui (só quando auth.uid() é NULL) não abre nenhuma brecha nova.
-- =========================================================================

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
    new.created_at := old.created_at;
  end if;
  return new;
end; $$;
