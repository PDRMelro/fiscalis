-- =========================================================================
-- Fiscalis — propostas passam a poder gerar um PDF real de proposta de
-- serviço (frequência de visitas + valor anual + valor da visita extra),
-- ligado opcionalmente a uma obra já existente para poder ser enviado ao
-- cliente (mesmo padrão das não conformidades: bucket próprio para o PDF do
-- lado do fiscal, cópia para o bucket/tabela "documentos" quando enviado).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0019)
-- =========================================================================

alter table public.propostas
  add column if not exists obra_id uuid references public.obras(id) on delete set null,
  add column if not exists frequencia_visitas text
    check (frequencia_visitas in ('semanal','quinzenal','mensal')),
  add column if not exists valor_anual numeric(10,2),
  add column if not exists valor_visita_extra numeric(10,2),
  add column if not exists pdf_path text;

insert into storage.buckets (id, name, public) values ('propostas', 'propostas', false)
  on conflict (id) do nothing;

drop policy if exists "admin_full_propostas_storage" on storage.objects;
create policy "admin_full_propostas_storage" on storage.objects
  for all using (bucket_id = 'propostas' and public.is_admin())
  with check (bucket_id = 'propostas' and public.is_admin());
