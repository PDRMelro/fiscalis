-- =========================================================================
-- Fiscalis — marca se o cliente já viu a visita guiada do portal
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0013)
-- =========================================================================

alter table public.profiles
  add column if not exists tour_concluido boolean not null default false;
