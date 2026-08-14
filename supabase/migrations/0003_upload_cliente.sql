-- =========================================================================
-- Fiscalis — permitir ao cliente enviar documentos pelo Portal do Cliente
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001_init.sql e 0002_permissoes_cliente.sql)
-- =========================================================================

-- O cliente só pode inserir documentos na sua própria obra, sempre como
-- "recebido" (o cliente envia para o fiscal, nunca o contrário), e só se
-- o admin tiver autorizado a permissão pode_ver_documentos para esta conta.
create policy "client_insert_own_obra_documentos" on public.documentos
  for insert
  with check (
    obra_id = public.my_obra_id()
    and direcao = 'recebido'
    and public.pode_ver_documentos_cliente()
  );

create policy "client_insert_own_obra_documentos_storage" on storage.objects
  for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
    and public.pode_ver_documentos_cliente()
  );
