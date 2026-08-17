-- =========================================================================
-- Fiscalis — regista a última visita do cliente ao portal (para o banner
-- de novidades: relatórios, NC, documentos e visitas desde então).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0012)
-- =========================================================================

alter table public.profiles
  add column if not exists portal_visto_em timestamptz;
