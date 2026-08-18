// Tipos escritos à mão a partir de supabase/migrations/0001_init.sql
// (sem service_role/CLI disponível para gerar automaticamente com `supabase gen types`).
//
// Nota: usamos `type` (não `interface`) para os Row/Table shapes — só type
// aliases de objeto recebem a assinatura de índice implícita que o
// supabase-js exige para satisfazer `Record<string, GenericTable>`.

export type Role = "admin" | "client";
export type EstadoObra = "Em curso" | "Concluída" | "Suspensa";
export type EstadoArea = "Concluído" | "Em andamento" | "Atenção" | "Atrasado" | "Pendente";
export type Severidade = "Crítica" | "Maior" | "Menor";
export type EstadoNC = "Aberta" | "Em correção" | "Corrigida" | "Encerrada";
export type ResultadoVerificacao = "Conforme" | "Não conforme";
export type EstadoProposta = "aguarda adjudicação" | "adjudicada" | "recusada";
export type DirecaoDocumento = "recebido" | "enviado";
export type EstadoAuto = "Pago" | "Pendente";

export type ProfileRow = {
  id: string;
  role: Role;
  obra_id: string | null;
  nome: string;
  email: string;
  ativo: boolean;
  pode_ver_relatorios: boolean;
  pode_ver_nc: boolean;
  pode_ver_documentos: boolean;
  pode_ver_financeiro: boolean;
  pode_ver_intervenientes: boolean;
  portal_visto_em: string | null;
  tour_concluido: boolean;
  created_at: string;
};

export type ObraRow = {
  id: string;
  nome: string;
  cliente_nome: string;
  local: string;
  inicio: string | null;
  estado: EstadoObra;
  progresso: number;
  honorario_mensal: number | null;
  codigo_acesso: string;
  termo_descricao_obra: string | null;
  termo_freguesia: string | null;
  termo_processo: string | null;
  termo_requerimento: string | null;
  created_at: string;
  updated_at: string;
};

export type ObraAreaRow = {
  id: string;
  obra_id: string;
  area: string;
  progresso: number;
  estado: EstadoArea;
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type EstadoVisita = "Agendada" | "Realizada";

export type VisitaRow = {
  id: string;
  obra_id: string;
  data: string;
  hora: string | null;
  notas: string | null;
  especialidades: string | null;
  estado: EstadoVisita;
  created_by: string | null;
  created_at: string;
};

export type VisitaResumoRow = VisitaRow & {
  obra_nome: string;
  nc_abertas: number;
  fotos: number;
};

export type VisitaFotoRow = {
  id: string;
  visita_id: string;
  storage_path: string;
  nome_ficheiro: string;
  created_at: string;
};

export type NaoConformidadeRow = {
  id: string;
  codigo: string | null;
  obra_id: string;
  visita_id: string | null;
  data_deteccao: string;
  local_zona: string | null;
  frente_fase: string | null;
  contrato_numero: string | null;
  especialidade: string | null;
  origem: string | null;
  descricao: string;
  requisito_incumprido: string | null;
  evidencias: string | null;
  acao_corretiva: string | null;
  severidade: Severidade;
  classificacao_justificacao: string | null;
  responsavel: string | null;
  prazo: string | null;
  data_verificacao: string | null;
  resultado_verificacao: ResultadoVerificacao | null;
  evidencias_verificacao: string | null;
  observacoes_recomendacoes: string | null;
  estado: EstadoNC;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
};

export type NcFotoRow = {
  id: string;
  nc_id: string;
  storage_path: string;
  nome_ficheiro: string;
  created_at: string;
};

export type PropostaRow = {
  id: string;
  codigo: string | null;
  cliente_nome: string;
  local: string;
  tipo_obra: string;
  estado: EstadoProposta;
  enviada_em: string;
  created_at: string;
  updated_at: string;
};

export type DocumentoRow = {
  id: string;
  obra_id: string;
  orcamento_id: string | null;
  direcao: DirecaoDocumento;
  categoria: string | null;
  tipo: string | null;
  nome_ficheiro: string;
  storage_path: string;
  tamanho_bytes: number | null;
  gerado_automaticamente: boolean;
  created_by: string | null;
  created_at: string;
};

export type RelatorioRow = {
  id: string;
  codigo: string | null;
  obra_id: string;
  visita_id: string | null;
  data: string;
  storage_path: string | null;
  created_by: string | null;
  created_at: string;
};

export type OrcamentoRow = {
  id: string;
  obra_id: string;
  servico: string;
  fornecedor: string;
  valor_orcamentado: number;
  valor_executado: number;
  taxa_iva: number;
  created_at: string;
  updated_at: string;
};

export type FaturacaoAutoRow = {
  id: string;
  obra_id: string;
  numero: string;
  data: string;
  valor: number;
  estado: EstadoAuto;
  created_at: string;
  updated_at: string;
};

export type TipoInterveniente =
  | "Direção de Obra"
  | "Construtora"
  | "Arquitetura"
  | "Coordenador de Segurança"
  | "Outro";

export type IntervenienteRow = {
  id: string;
  obra_id: string;
  papel: string;
  nome: string;
  contacto: string | null;
  tipo: TipoInterveniente | null;
  empresa: string | null;
  cedula_profissional: string | null;
  colegio: string | null;
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type ChecklistConfigRow = {
  id: string;
  especialidade: string;
  item: string;
  ordem: number;
  created_at: string;
};

export type PerfilFiscalRow = {
  id: boolean;
  nome: string;
  qualificacao: string;
  morada_fiscal: string;
  nif: string;
  cartao_cidadao: string;
  cedula_profissional: string;
  seguro_rc_path: string | null;
  seguro_rc_nome_ficheiro: string | null;
  updated_at: string;
};

type TableDef<Row extends Record<string, unknown>, RequiredInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "id" | "role">;
      obras: TableDef<ObraRow, "nome" | "cliente_nome" | "local">;
      obra_areas: TableDef<ObraAreaRow, "obra_id" | "area">;
      visitas: TableDef<VisitaRow, "obra_id" | "data">;
      visita_fotos: TableDef<VisitaFotoRow, "visita_id" | "storage_path" | "nome_ficheiro">;
      nao_conformidades: TableDef<NaoConformidadeRow, "obra_id" | "descricao" | "severidade">;
      nc_fotos: TableDef<NcFotoRow, "nc_id" | "storage_path" | "nome_ficheiro">;
      propostas: TableDef<PropostaRow, "cliente_nome" | "local" | "tipo_obra">;
      documentos: TableDef<DocumentoRow, "obra_id" | "direcao" | "nome_ficheiro" | "storage_path">;
      relatorios: TableDef<RelatorioRow, "obra_id">;
      orcamentos: TableDef<OrcamentoRow, "obra_id" | "servico" | "fornecedor">;
      faturacao_autos: TableDef<FaturacaoAutoRow, "obra_id" | "numero" | "data" | "valor">;
      intervenientes: TableDef<IntervenienteRow, "obra_id" | "papel" | "nome">;
      checklist_config: TableDef<ChecklistConfigRow, "especialidade" | "item">;
      perfil_fiscal: TableDef<PerfilFiscalRow, never>;
    };
    Views: {
      visitas_resumo: {
        Row: VisitaResumoRow;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      my_obra_id: { Args: Record<string, never>; Returns: string | null };
      resolve_obra_por_codigo: {
        Args: { p_codigo: string };
        Returns: { obra_id: string; obra_nome: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
