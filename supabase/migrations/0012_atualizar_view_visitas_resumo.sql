-- =========================================================================
-- Fiscalis — atualiza a view visitas_resumo para incluir estado/hora
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0011)
--
-- Uma view criada com "select v.*" fixa a lista de colunas no momento em
-- que é criada — colunas adicionadas à tabela depois (estado, hora, da
-- migração 0011) não aparecem sozinhas na view. É preciso recriá-la.
-- =========================================================================

create or replace view public.visitas_resumo
  with (security_invoker = on) as
select v.*, o.nome as obra_nome,
  (select count(*) from public.nao_conformidades n where n.visita_id = v.id and n.estado = 'Aberta') as nc_abertas,
  (select count(*) from public.visita_fotos f where f.visita_id = v.id) as fotos
from public.visitas v join public.obras o on o.id = v.obra_id;
