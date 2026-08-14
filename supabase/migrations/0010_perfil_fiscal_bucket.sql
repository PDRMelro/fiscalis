-- =========================================================================
-- Fiscalis — bucket próprio para ficheiros do perfil fiscal (ex: seguro RC)
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0009)
--
-- O bucket "documentos" é sempre lido a partir de {obra_id}/... pelas
-- políticas do cliente, que convertem a primeira pasta do caminho para
-- uuid. Ficheiros do perfil fiscal não pertencem a nenhuma obra, por isso
-- precisam de um bucket próprio (só admin, sem policy de cliente).
-- =========================================================================

insert into storage.buckets (id, name, public) values
  ('perfil-fiscal', 'perfil-fiscal', false)
on conflict (id) do nothing;

create policy "admin_full_perfil_fiscal_storage" on storage.objects
  for all using (bucket_id = 'perfil-fiscal' and public.is_admin())
  with check (bucket_id = 'perfil-fiscal' and public.is_admin());
