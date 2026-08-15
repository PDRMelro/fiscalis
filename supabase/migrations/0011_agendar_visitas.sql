-- =========================================================================
-- Fiscalis — agendar visitas com antecedência (estado Agendada/Realizada)
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0010)
-- =========================================================================

alter table public.visitas
  add column if not exists estado text not null default 'Realizada' check (estado in ('Agendada', 'Realizada')),
  add column if not exists hora time;
