-- =========================================================================
-- Fiscalis — ordem manual dos intervenientes (subir/descer na lista)
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001, 0002, 0003, 0004 e 0005)
-- =========================================================================

alter table public.intervenientes
  add column if not exists ordem smallint not null default 0;
