-- =========================================================================
-- Fiscalis — propostas passam a ter condições de pagamento (uma % na
-- adjudicação e outra % numa data a definir, cada uma com a sua data), o
-- IBAN para pagamento e a indicação se os valores têm IVA ou não.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0038)
-- =========================================================================

alter table public.propostas
  add column if not exists pagamento_adjudicacao_pct numeric(5,2)
    check (pagamento_adjudicacao_pct between 0 and 100),
  add column if not exists pagamento_adjudicacao_data date,
  add column if not exists pagamento_segunda_pct numeric(5,2)
    check (pagamento_segunda_pct between 0 and 100),
  add column if not exists pagamento_segunda_data date,
  add column if not exists iban text,
  add column if not exists com_iva boolean not null default true;
