-- =========================================================================
-- Fiscalis — seguro de responsabilidade civil do fiscal (Configurações)
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0007)
-- =========================================================================

alter table public.perfil_fiscal
  add column if not exists seguro_rc_path text,
  add column if not exists seguro_rc_nome_ficheiro text;
