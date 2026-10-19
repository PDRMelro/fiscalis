-- =========================================================================
-- Fiscalis — quando a proposta é para uma empresa, guarda também os dados
-- do dono de obra (quem vai acompanhar a obra no portal), para lhe poder
-- enviar o link de registo já com o código de acesso da obra preenchido.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0037)
-- =========================================================================

alter table public.propostas
  add column if not exists dono_obra_nome text,
  add column if not exists dono_obra_email text,
  add column if not exists dono_obra_telefone text;
