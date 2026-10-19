-- =========================================================================
-- Fiscalis — a obra guarda os dados do dono de obra (quem a vai acompanhar
-- no portal), para lhe poder enviar o link de registo já com o código de
-- acesso da obra, o nome e o email preenchidos.
-- Remove também as colunas equivalentes que chegaram a ser criadas nas
-- propostas (o acesso ao portal só faz sentido depois da adjudicação).
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0037)
-- =========================================================================

alter table public.obras
  add column if not exists dono_obra_nome text,
  add column if not exists dono_obra_email text,
  add column if not exists dono_obra_telefone text;

alter table public.propostas
  drop column if exists dono_obra_nome,
  drop column if exists dono_obra_email,
  drop column if exists dono_obra_telefone;
