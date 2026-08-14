-- =========================================================================
-- Fiscalis — tipo de interveniente (com campos condicionais) + permissão
-- do cliente para ver a lista de intervenientes.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001, 0002, 0003 e 0004)
-- =========================================================================

alter table public.intervenientes
  add column if not exists tipo text check (tipo in ('Direção de Obra', 'Construtora', 'Arquitetura', 'Outro')),
  add column if not exists empresa text,
  add column if not exists cedula_profissional text,
  add column if not exists colegio text;

comment on column public.intervenientes.tipo is
  'Dispara os campos certos na interface: Construtora -> empresa; Direção de Obra/Arquitetura -> cédula.';

-- -------------------------------------------------------------------------
-- Permissão nova: o cliente só pode VER a lista de intervenientes — quem
-- adiciona/edita é sempre o administrador. Por omissão fica ligada (à
-- semelhança de relatórios/NCs/documentos), com o interruptor disponível
-- na página Clientes para desligar caso a caso.
-- -------------------------------------------------------------------------
alter table public.profiles
  add column if not exists pode_ver_intervenientes boolean not null default true;

create or replace function public.pode_ver_intervenientes()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce((select pode_ver_intervenientes from public.profiles where id = auth.uid() and ativo), false);
$$;

grant execute on function public.pode_ver_intervenientes() to authenticated;

create policy "client_read_own_obra_intervenientes" on public.intervenientes
  for select using (obra_id = public.my_obra_id() and public.pode_ver_intervenientes());
