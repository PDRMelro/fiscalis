-- =========================================================================
-- Fiscalis — adiciona "Coordenador de Segurança" aos tipos de interveniente
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0008)
-- =========================================================================

alter table public.intervenientes
  drop constraint if exists intervenientes_tipo_check;

alter table public.intervenientes
  add constraint intervenientes_tipo_check
  check (tipo in ('Direção de Obra', 'Construtora', 'Arquitetura', 'Coordenador de Segurança', 'Outro'));
