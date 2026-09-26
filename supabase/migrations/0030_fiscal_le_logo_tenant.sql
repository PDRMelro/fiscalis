-- =========================================================================
-- Fiscalis — permite a um fiscal ler o logótipo da sua empresa, para
-- aparecer nos PDFs que ele gera (relatórios, autos de NC).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0029_fiscais.sql)
--
-- Bug: o bucket "tenant-branding" só tinha uma policy para admins
-- (admin_full_tenant_branding_storage). Quando um FISCAL gera um relatório
-- ou um auto de não conformidade, o código tenta ler o logótipo da empresa
-- para o mostrar ao lado do símbolo da Fiscalis — mas is_admin() é falso
-- para um fiscal, por isso a leitura era sempre bloqueada em silêncio
-- (sem erro visível), e o logótipo nunca aparecia nesses PDFs.
-- =========================================================================

create policy "fiscal_read_tenant_branding_storage" on storage.objects
  for select using (
    bucket_id = 'tenant-branding' and public.is_fiscal() and (storage.foldername(name))[1]::uuid = public.my_tenant_id()
  );
