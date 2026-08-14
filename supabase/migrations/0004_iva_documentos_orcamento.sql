-- =========================================================================
-- Fiscalis — IVA por orçamento + documentos anexados a cada orçamento
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0001, 0002 e 0003)
-- =========================================================================

alter table public.orcamentos
  add column if not exists taxa_iva numeric(5,2) not null default 23;

comment on column public.orcamentos.taxa_iva is
  'Percentagem de IVA aplicável a este orçamento (ex: 23 normal, 6 reabilitação urbana).';

alter table public.documentos
  add column if not exists orcamento_id uuid references public.orcamentos(id) on delete cascade;

-- -------------------------------------------------------------------------
-- Cliente passa a poder anexar documentos a um orçamento específico, mas só
-- se conseguir ver esse orçamento (pode_ver_financeiro) além de já poder
-- enviar documentos em geral (pode_ver_documentos), e só à sua própria obra.
-- -------------------------------------------------------------------------
alter policy "client_insert_own_obra_documentos" on public.documentos
  with check (
    obra_id = public.my_obra_id()
    and direcao = 'recebido'
    and public.pode_ver_documentos_cliente()
    and (
      orcamento_id is null
      or (
        public.pode_ver_financeiro()
        and exists (
          select 1 from public.orcamentos o
          where o.id = orcamento_id and o.obra_id = public.my_obra_id()
        )
      )
    )
  );

-- -------------------------------------------------------------------------
-- E, do lado da leitura, um documento ligado a um orçamento só pode ser
-- visto pelo cliente se também tiver pode_ver_financeiro — senão dava para
-- ver documentos financeiros (ex: orçamento de um fornecedor) só por ter
-- a permissão geral de "Documentos" ligada, sem ter a de "Financeiro".
-- -------------------------------------------------------------------------
alter policy "client_read_own_obra_documentos" on public.documentos
  using (
    obra_id = public.my_obra_id()
    and public.pode_ver_documentos_cliente()
    and (orcamento_id is null or public.pode_ver_financeiro())
  );
