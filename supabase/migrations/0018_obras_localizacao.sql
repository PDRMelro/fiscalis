-- =========================================================================
-- Fiscalis — localização exata da obra (latitude/longitude), definida ao
-- clicar num mapa (Leaflet/OpenStreetMap) no criar/editar obra, e usada
-- para mostrar todas as obras num mapa na página de Obras.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0017)
-- =========================================================================

alter table public.obras
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
