import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { NaoConformidadeRow, ObraRow, PerfilFiscalRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const NAVY = "#14283A";
const GOLD = "#C9A050";
const GRAY = "#8A8578";
const BORDER = "#DEDBD2";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 8.5, fontFamily: "Helvetica", color: "#1F1D19" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 10,
  },
  logo: { height: 34 },
  tituloBox: { alignItems: "flex-end" },
  titulo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 1 },
  subtitulo: { fontSize: 9, color: GOLD, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },

  seccao: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 9, marginBottom: 3 },

  tabela: { borderWidth: 1, borderColor: BORDER, borderRadius: 2 },
  linha: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  linhaUltima: { flexDirection: "row" },
  celula: { flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: BORDER },
  celulaUltima: { flex: 1, padding: 5 },
  celulaRotulo: { fontSize: 7, color: GRAY, textTransform: "uppercase", marginBottom: 1 },
  celulaValor: { fontSize: 9 },

  caixa: { borderWidth: 1, borderColor: BORDER, borderRadius: 2, padding: 6, minHeight: 32 },
  caixaTexto: { fontSize: 9, lineHeight: 1.4 },
  ajuda: { fontSize: 7, color: GRAY },

  duasColunas: { flexDirection: "row", gap: 10 },
  coluna: { flex: 1 },

  checkboxLinha: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  checkbox: { width: 8, height: 8, borderWidth: 1, borderColor: NAVY },
  checkboxMarcado: { backgroundColor: NAVY },
  checkboxTexto: { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  checkboxDescricao: { fontSize: 7, color: GRAY },

  assinaturas: { flexDirection: "row", gap: 8, marginTop: 14 },
  assinatura: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 6,
    minHeight: 46,
    justifyContent: "space-between",
  },
  assinaturaTitulo: { fontSize: 7, fontFamily: "Helvetica-Bold", color: NAVY, textTransform: "uppercase" },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: "#1F1D19", marginTop: 20 },
  assinaturaData: { fontSize: 6.5, color: GRAY, marginTop: 3 },

  rodape: { position: "absolute", bottom: 18, left: 36, right: 36, fontSize: 7, color: GRAY, textAlign: "center" },

  anexoTitulo: { fontSize: 15, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  anexoSubtitulo: { fontSize: 9, color: GRAY, marginBottom: 14 },
  fotosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  fotoBox: { width: "47%", marginBottom: 12 },
  foto: { width: "100%", height: 220, objectFit: "cover", borderRadius: 3, borderWidth: 1, borderColor: BORDER },
  fotoLegenda: { fontSize: 7.5, color: GRAY, marginTop: 3 },
});

function formatarDataPdf(data: string | null) {
  if (!data) return "—";
  const d = new Date(data + (data.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("pt-PT");
}

function Checkbox({ marcado, texto, descricao }: { marcado: boolean; texto: string; descricao?: string }) {
  return (
    <View style={styles.checkboxLinha}>
      <View style={[styles.checkbox, marcado ? styles.checkboxMarcado : undefined]} />
      <Text style={styles.checkboxTexto}>{texto}</Text>
      {descricao && <Text style={styles.checkboxDescricao}>{descricao}</Text>}
    </View>
  );
}

export function AutoNaoConformidadeDoc({
  nc,
  obra,
  perfil,
  fotos,
}: {
  nc: NaoConformidadeRow;
  obra: ObraRow;
  perfil: PerfilFiscalRow;
  fotos: string[]; // data URIs, usadas só no anexo
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={LOGO_SRC} style={styles.logo} />
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>NÃO CONFORMIDADE</Text>
            <Text style={styles.subtitulo}>REGISTO DE NÃO CONFORMIDADE</Text>
          </View>
        </View>

        <Text style={styles.seccao}>1. Identificação</Text>
        <View style={styles.tabela}>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Nº NC</Text>
              <Text style={styles.celulaValor}>{nc.codigo ?? "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Localização</Text>
              <Text style={styles.celulaValor}>{nc.local_zona || "—"}</Text>
            </View>
          </View>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Obra</Text>
              <Text style={styles.celulaValor}>{obra.nome}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Frente / fase</Text>
              <Text style={styles.celulaValor}>{nc.frente_fase || "—"}</Text>
            </View>
          </View>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Contrato n.º</Text>
              <Text style={styles.celulaValor}>{nc.contrato_numero || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Empreiteiro / subempreiteiro</Text>
              <Text style={styles.celulaValor}>{nc.responsavel || "—"}</Text>
            </View>
          </View>
          <View style={styles.linhaUltima}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Especialidade</Text>
              <Text style={styles.celulaValor}>{nc.especialidade || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Origem</Text>
              <Text style={styles.celulaValor}>{nc.origem || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>2. Descrição da não conformidade</Text>
        <View style={styles.caixa}>
          <Text style={styles.caixaTexto}>{nc.descricao}</Text>
        </View>

        <View style={styles.duasColunas}>
          <View style={styles.coluna}>
            <Text style={styles.seccao}>3. Requisito não cumprido</Text>
            <View style={styles.caixa}>
              <Text style={styles.caixaTexto}>{nc.requisito_incumprido || "—"}</Text>
            </View>
          </View>
          <View style={styles.coluna}>
            <Text style={styles.seccao}>4. Evidências</Text>
            <View style={styles.caixa}>
              <Text style={styles.caixaTexto}>{nc.evidencias || "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.duasColunas}>
          <View style={styles.coluna}>
            <Text style={styles.seccao}>5. Classificação</Text>
            <View style={styles.caixa}>
              <Checkbox
                marcado={nc.severidade === "Crítica"}
                texto="CRÍTICA"
                descricao="risco elevado para segurança, integridade ou funcionalidade"
              />
              <Checkbox
                marcado={nc.severidade === "Maior"}
                texto="MAIOR"
                descricao="impacto significativo na qualidade ou desempenho"
              />
              <Checkbox marcado={nc.severidade === "Menor"} texto="MENOR" descricao="impacto reduzido" />
              {nc.classificacao_justificacao && (
                <Text style={[styles.caixaTexto, { marginTop: 4 }]}>Justificação: {nc.classificacao_justificacao}</Text>
              )}
            </View>
          </View>
          <View style={styles.coluna}>
            <Text style={styles.seccao}>6. Ação corretiva</Text>
            <View style={styles.caixa}>
              <Text style={styles.caixaTexto}>{nc.acao_corretiva || "—"}</Text>
              <Text style={[styles.ajuda, { marginTop: 6 }]}>Prazo para correção: {formatarDataPdf(nc.prazo)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>7. Verificação da correção</Text>
        <View style={styles.tabela}>
          <View style={styles.linhaUltima}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Verificação efetuada</Text>
              <Text style={styles.celulaValor}>{formatarDataPdf(nc.data_verificacao)}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Resultado</Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 2 }}>
                <Checkbox marcado={nc.resultado_verificacao === "Conforme"} texto="CONFORME" />
                <Checkbox marcado={nc.resultado_verificacao === "Não conforme"} texto="NÃO CONFORME" />
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.caixa, { marginTop: 4 }]}>
          <Text style={styles.celulaRotulo}>Evidências da verificação</Text>
          <Text style={styles.caixaTexto}>{nc.evidencias_verificacao || "—"}</Text>
        </View>

        <Text style={styles.seccao}>8. Encerramento</Text>
        <View style={styles.caixa}>
          <Text style={styles.celulaRotulo}>Estado</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 2, marginBottom: 6 }}>
            <Checkbox marcado={nc.estado === "Aberta"} texto="ABERTA" />
            <Checkbox marcado={nc.estado === "Em correção"} texto="EM CORREÇÃO" />
            <Checkbox marcado={nc.estado === "Corrigida"} texto="CORRIGIDA" />
            <Checkbox marcado={nc.estado === "Encerrada"} texto="ENCERRADA" />
          </View>
          <Text style={styles.celulaRotulo}>Observações / recomendações</Text>
          <Text style={styles.caixaTexto}>{nc.observacoes_recomendacoes || "—"}</Text>
        </View>

        <Text style={styles.seccao}>9. Assinaturas</Text>
        <View style={styles.assinaturas}>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Fiscalização</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>{perfil.nome} · Data: ___/___/______</Text>
            </View>
          </View>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Empreiteiro / Subempreiteiro</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>Data: ___/___/______</Text>
            </View>
          </View>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Projetista (quando aplicável)</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>Data: ___/___/______</Text>
            </View>
          </View>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Dono da Obra (quando aplicável)</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>Data: ___/___/______</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rodape}>
          Auto gerado automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>

      {fotos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.anexoTitulo}>Anexo — Registo fotográfico</Text>
          <Text style={styles.anexoSubtitulo}>
            Não conformidade {nc.codigo} · {obra.nome}
          </Text>
          <View style={styles.fotosGrid}>
            {fotos.map((f, i) => (
              <View key={i} style={styles.fotoBox}>
                <Image src={f} style={styles.foto} />
                <Text style={styles.fotoLegenda}>Foto {i + 1}</Text>
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
}

export async function gerarPdfAutoNaoConformidade(
  nc: NaoConformidadeRow,
  obra: ObraRow,
  perfil: PerfilFiscalRow,
  fotos: string[]
) {
  return renderToBuffer(<AutoNaoConformidadeDoc nc={nc} obra={obra} perfil={perfil} fotos={fotos} />);
}
