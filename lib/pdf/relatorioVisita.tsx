import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { NaoConformidadeRow, ObraRow, VisitaRow } from "@/lib/supabase/types";
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

export function RelatorioVisitaDoc({
  codigo,
  obra,
  visita,
  ncs,
  fotos,
  nomeFiscal,
}: {
  codigo: string;
  obra: ObraRow;
  visita: VisitaRow;
  ncs: NaoConformidadeRow[];
  fotos: string[]; // data URIs, usadas só no anexo
  nomeFiscal: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={LOGO_SRC} style={styles.logo} />
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>RELATÓRIO DE FISCALIZAÇÃO</Text>
            <Text style={styles.subtitulo}>VISITA DE OBRA</Text>
          </View>
        </View>

        <Text style={styles.seccao}>1. Identificação</Text>
        <View style={styles.tabela}>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Nº Relatório</Text>
              <Text style={styles.celulaValor}>{codigo}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Obra</Text>
              <Text style={styles.celulaValor}>{obra.nome}</Text>
            </View>
          </View>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Local</Text>
              <Text style={styles.celulaValor}>{obra.local || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Cliente</Text>
              <Text style={styles.celulaValor}>{obra.cliente_nome || "—"}</Text>
            </View>
          </View>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Data da visita</Text>
              <Text style={styles.celulaValor}>{formatarDataPdf(visita.data)}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Hora</Text>
              <Text style={styles.celulaValor}>{visita.hora || "—"}</Text>
            </View>
          </View>
          <View style={styles.linhaUltima}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Especialidades</Text>
              <Text style={styles.celulaValor}>{visita.especialidades || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Engenheiro fiscal</Text>
              <Text style={styles.celulaValor}>{nomeFiscal || "—"}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>2. Observações da visita</Text>
        <View style={styles.caixa}>
          <Text style={styles.caixaTexto}>{visita.notas || "Sem observações registadas."}</Text>
        </View>

        <Text style={styles.seccao}>3. Não conformidades identificadas</Text>
        {ncs.length === 0 ? (
          <View style={styles.caixa}>
            <Text style={styles.caixaTexto}>Sem não conformidades associadas a esta visita.</Text>
          </View>
        ) : (
          <View style={styles.tabela}>
            <View style={styles.linha}>
              <View style={[styles.celula, { flex: 0.7 }]}>
                <Text style={styles.celulaRotulo}>Ref.</Text>
              </View>
              <View style={[styles.celula, { flex: 2.6 }]}>
                <Text style={styles.celulaRotulo}>Descrição</Text>
              </View>
              <View style={[styles.celula, { flex: 1 }]}>
                <Text style={styles.celulaRotulo}>Severidade</Text>
              </View>
              <View style={[styles.celulaUltima, { flex: 1 }]}>
                <Text style={styles.celulaRotulo}>Estado</Text>
              </View>
            </View>
            {ncs.map((n, i) => (
              <View key={n.id} style={i === ncs.length - 1 ? styles.linhaUltima : styles.linha}>
                <View style={[styles.celula, { flex: 0.7 }]}>
                  <Text style={styles.celulaValor}>{n.codigo ?? "—"}</Text>
                </View>
                <View style={[styles.celula, { flex: 2.6 }]}>
                  <Text style={styles.celulaValor}>{n.descricao}</Text>
                </View>
                <View style={[styles.celula, { flex: 1 }]}>
                  <Text style={styles.celulaValor}>{n.severidade}</Text>
                </View>
                <View style={[styles.celulaUltima, { flex: 1 }]}>
                  <Text style={styles.celulaValor}>{n.estado}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.seccao}>4. Registo fotográfico</Text>
        <View style={styles.caixa}>
          <Text style={styles.caixaTexto}>
            {fotos.length > 0
              ? `${fotos.length} fotografia(s) associada(s) a esta visita — ver anexo.`
              : "Sem fotografias associadas a esta visita."}
          </Text>
        </View>

        <Text style={styles.seccao}>5. Assinaturas</Text>
        <View style={styles.assinaturas}>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Fiscalização</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>{nomeFiscal} · Data: ___/___/______</Text>
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
            <Text style={styles.assinaturaTitulo}>Dono da Obra (quando aplicável)</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>Data: ___/___/______</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rodape}>
          Relatório gerado automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>

      {fotos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.anexoTitulo}>Anexo — Registo fotográfico</Text>
          <Text style={styles.anexoSubtitulo}>
            Relatório {codigo} · {obra.nome}
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

export async function gerarPdfRelatorioVisita(
  codigo: string,
  obra: ObraRow,
  visita: VisitaRow,
  ncs: NaoConformidadeRow[],
  fotos: string[],
  nomeFiscal: string
) {
  return renderToBuffer(
    <RelatorioVisitaDoc codigo={codigo} obra={obra} visita={visita} ncs={ncs} fotos={fotos} nomeFiscal={nomeFiscal} />
  );
}
