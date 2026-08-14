-- =========================================================================
-- Fiscalis — formulário completo de Não Conformidade, fotos e PDF (Auto)
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001 até 0006)
-- =========================================================================

alter table public.nao_conformidades
  add column if not exists data_deteccao date not null default current_date,
  add column if not exists local_zona text,
  add column if not exists especialidade text,
  add column if not exists requisito_incumprido text,
  add column if not exists acao_corretiva text,
  add column if not exists pdf_path text;

-- -------------------------------------------------------------------------
-- Fotos anexadas a uma não conformidade
-- -------------------------------------------------------------------------
create table public.nc_fotos (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid not null references public.nao_conformidades(id) on delete cascade,
  storage_path text not null,
  nome_ficheiro text not null,
  created_at timestamptz not null default now()
);

alter table public.nc_fotos enable row level security;

create policy "admin_full_nc_fotos" on public.nc_fotos
  for all using (public.is_admin()) with check (public.is_admin());

create policy "client_read_own_obra_nc_fotos" on public.nc_fotos
  for select using (
    exists (
      select 1 from public.nao_conformidades n
      where n.id = nc_id and n.obra_id = public.my_obra_id() and public.pode_ver_nc()
    )
  );

-- -------------------------------------------------------------------------
-- Storage: bucket privado para fotos + o PDF gerado do Auto de Não
-- Conformidade, caminho {obra_id}/{nc_id}/{ficheiro}.
-- -------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('nc-anexos', 'nc-anexos', false)
on conflict (id) do nothing;

create policy "admin_full_nc_anexos_storage" on storage.objects
  for all using (bucket_id = 'nc-anexos' and public.is_admin())
  with check (bucket_id = 'nc-anexos' and public.is_admin());

create policy "client_read_own_obra_nc_anexos_storage" on storage.objects
  for select using (
    bucket_id = 'nc-anexos'
    and (storage.foldername(name))[1]::uuid = public.my_obra_id()
    and public.pode_ver_nc()
  );
