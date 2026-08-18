-- =========================================================================
-- Fiscalis — alinha as não conformidades com o modelo oficial em papel:
-- novos campos (frente/fase, contrato, origem, evidências, verificação da
-- correção, encerramento) e novos valores de classificação/estado.
-- Cola este ficheiro no Supabase Dashboard > SQL Editor > Run.
-- (segue-se ao 0015)
-- =========================================================================

alter table public.nao_conformidades
  add column if not exists frente_fase text,
  add column if not exists contrato_numero text,
  add column if not exists origem text,
  add column if not exists evidencias text,
  add column if not exists classificacao_justificacao text,
  add column if not exists data_verificacao date,
  add column if not exists resultado_verificacao text,
  add column if not exists evidencias_verificacao text,
  add column if not exists observacoes_recomendacoes text;

-- Severidade: Alta/Média/Baixa -> Crítica/Maior/Menor (nomenclatura do modelo oficial)
alter table public.nao_conformidades drop constraint if exists nao_conformidades_severidade_check;
update public.nao_conformidades set severidade = case severidade
  when 'Alta' then 'Crítica'
  when 'Média' then 'Maior'
  when 'Baixa' then 'Menor'
  else severidade
end;
alter table public.nao_conformidades
  add constraint nao_conformidades_severidade_check check (severidade in ('Crítica', 'Maior', 'Menor'));

-- Estado: Aberta/Em correção/Fechada -> Aberta/Em correção/Corrigida/Encerrada
alter table public.nao_conformidades drop constraint if exists nao_conformidades_estado_check;
update public.nao_conformidades set estado = 'Encerrada' where estado = 'Fechada';
alter table public.nao_conformidades
  add constraint nao_conformidades_estado_check check (estado in ('Aberta', 'Em correção', 'Corrigida', 'Encerrada'));

alter table public.nao_conformidades
  add constraint nao_conformidades_resultado_verificacao_check
  check (resultado_verificacao is null or resultado_verificacao in ('Conforme', 'Não conforme'));
