-- =========================================================================
-- Fiscalis — corrige a view visitas_resumo: "fotos" e "nc_abertas" vinham
-- como bigint (count(*) do Postgres), que nem o JavaScript/React nem o
-- JSON.stringify sabem representar sem dar erro. Passa a vir sempre int.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0014)
-- =========================================================================

drop view if exists public.visitas_resumo;

create view public.visitas_resumo
  with (security_invoker = on) as
select v.*, o.nome as obra_nome,
  (select count(*)::int from public.nao_conformidades n where n.visita_id = v.id and n.estado = 'Aberta') as nc_abertas,
  (select count(*)::int from public.visita_fotos f where f.visita_id = v.id) as fotos
from public.visitas v join public.obras o on o.id = v.obra_id;
