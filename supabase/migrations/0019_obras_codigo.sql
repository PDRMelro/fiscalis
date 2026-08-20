-- =========================================================================
-- Fiscalis — código sequencial por obra (ex: OBRA-001), para identificar
-- cada obra de forma curta no mapa (marcador) e nas listas/cartões — mesmo
-- padrão já usado em não conformidades, propostas e relatórios.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0018)
-- =========================================================================

alter table public.obras add column if not exists codigo text unique;

create sequence if not exists public.obra_codigo_seq;

create or replace function public.set_obra_codigo()
returns trigger language plpgsql as $$
begin
  if new.codigo is null then
    new.codigo := 'OBRA-' || lpad(nextval('public.obra_codigo_seq')::text, 3, '0');
  end if;
  return new;
end; $$;

drop trigger if exists trg_obra_codigo on public.obras;
create trigger trg_obra_codigo before insert on public.obras
  for each row execute function public.set_obra_codigo();

-- Atribui código às obras já existentes, por ordem de criação.
with numeradas as (
  select id, row_number() over (order by created_at) as rn
  from public.obras
  where codigo is null
)
update public.obras o
set codigo = 'OBRA-' || lpad(numeradas.rn::text, 3, '0')
from numeradas
where o.id = numeradas.id;

-- Avança a sequence para não colidir com os códigos já atribuídos acima.
select setval('public.obra_codigo_seq', (select count(*) from public.obras where codigo is not null), true);
