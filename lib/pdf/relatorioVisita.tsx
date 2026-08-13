import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { NaoConformidadeRow, ObraRow, VisitaRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1F1D19" },
  logo: { height: 26, marginBottom: 16 },
  titulo: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#14283A" },
  subtitulo: { fontSize: 11, color: "#8A8578", marginBottom: 18 },
  secao: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#14283A", marginTop: 16, marginBottom: 6 },
  paragrafo: { lineHeight: 1.6, textAlign: "justify" },
  linha: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#EDEBE2" },
  rodape: { position: "absolute", bottom: 40, left: 48, right: 48, fontSize: 9, color: "#8A8578" },
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
  numFotos,
}: {
  codigo: string;
  obra: ObraRow;
  visita: VisitaRow;
  ncs: NaoConformidadeRow[];
  numFotos: number;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={LOGO_SRC} style={styles.logo} />
        <Text style={styles.titulo}>Relatório de Fiscalização {codigo}</Text>
        <Text style={styles.subtitulo}>
          {obra.nome} · {obra.local} · Visita de {formatarDataPdf(visita.data)}
        </Text>

        <Text style={styles.secao}>Observações da visita</Text>
        <Text style={styles.paragrafo}>{visita.notas || "Sem observações registadas."}</Text>

        <Text style={styles.secao}>Registo fotográfico</Text>
        <Text style={styles.paragrafo}>{numFotos} fotografia(s) associada(s) a esta visita.</Text>

        <Text style={styles.secao}>Não conformidades identificadas</Text>
        {ncs.length === 0 && <Text style={styles.paragrafo}>Sem não conformidades associadas a esta visita.</Text>}
        {ncs.map((n) => (
          <View key={n.id} style={styles.linha}>
            <Text>
              {n.codigo} — {n.descricao}
            </Text>
            <Text>
              {n.severidade} · {n.estado}
            </Text>
          </View>
        ))}

        <Text style={styles.rodape}>
          Relatório gerado automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>
    </Document>
  );
}

export async function gerarPdfRelatorioVisita(
  codigo: string,
  obra: ObraRow,
  visita: VisitaRow,
  ncs: NaoConformidadeRow[],
  numFotos: number
) {
  return renderToBuffer(<RelatorioVisitaDoc codigo={codigo} obra={obra} visita={visita} ncs={ncs} numFotos={numFotos} />);
}
