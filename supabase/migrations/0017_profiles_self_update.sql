-- =========================================================================
-- Fiscalis — permite ao cliente atualizar o seu próprio perfil (nome,
-- tour_concluido, portal_visto_em). Não existia nenhuma policy de UPDATE
-- para o cliente em "profiles", pelo que estes updates falhavam em
-- silêncio (RLS bloqueia sem devolver erro) — por isso a visita guiada
-- reaparecia sempre, o nome em "A minha conta" não gravava, e o banner
-- de "novidades desde a última visita" nunca chegava a aparecer.
--
-- Como o admin também atualiza este perfil (ex: permissões do cliente em
-- /clientes) usando o mesmo papel "authenticated" do Postgres, não dá para
-- restringir por coluna via GRANT sem quebrar isso — em vez disso, um
-- trigger repõe os campos sensíveis ao valor antigo sempre que quem edita
-- não é admin, para o cliente nunca conseguir alterar role/obra_id/
-- permissões através deste caminho.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0016)
-- =========================================================================

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
    new.created_at := old.created_at;
  end if;
  return new;
end; $$;

drop trigger if exists proteger_campos_profile_trigger on public.profiles;
create trigger proteger_campos_profile_trigger
  before update on public.profiles
  for each row execute function public.proteger_campos_profile();

drop policy if exists "self_update_profile" on public.profiles;
create policy "self_update_profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
