-- =========================================================================
-- Fiscalis — dados fiscais do cliente na proposta (NIF/contribuinte e morada
-- fiscal), separados da morada da obra já existente (coluna "local").
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0020)
-- =========================================================================

alter table public.propostas
  add column if not exists cliente_nif text,
  add column if not exists cliente_morada_fiscal text;
