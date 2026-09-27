-- =========================================================================
-- Fiscalis — corrige a abertura de uma conversa: faltava uma forma de ler
-- o nome da OUTRA pessoa quando ela não está na tua própria empresa (ex:
-- um admin a abrir a conversa com o super admin). pode_conversar() já
-- confirmava que a conversa é permitida, mas a leitura do nome ia direto à
-- tabela "profiles", que nega por RLS quando a pessoa não é da tua empresa
-- nem tu és super admin — por isso a conversa nunca abria.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0032_mensagens.sql)
-- =========================================================================

create or replace function public.pessoa_conversa(p_id uuid)
returns table (id uuid, nome text)
language plpgsql security definer set search_path = public stable as $$
begin
  if not public.pode_conversar(p_id) then
    return;
  end if;

  return query select p.id, p.nome from public.profiles p where p.id = p_id;
end;
$$;

grant execute on function public.pessoa_conversa(uuid) to authenticated;
