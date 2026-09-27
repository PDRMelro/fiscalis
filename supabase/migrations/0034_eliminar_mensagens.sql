-- =========================================================================
-- Fiscalis — permite eliminar mensagens (para dar para apagar uma
-- conversa inteira). Não existia nenhuma policy de DELETE em "mensagens",
-- por isso isto estava sempre bloqueado por omissão.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0033_pessoa_conversa.sql)
-- =========================================================================

create policy "mensagens_delete" on public.mensagens
  for delete
  using (remetente_id = auth.uid() or destinatario_id = auth.uid());
