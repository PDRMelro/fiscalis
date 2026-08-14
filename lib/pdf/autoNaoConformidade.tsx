import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { NaoConformidadeRow, ObraRow, PerfilFiscalRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10.5, fontFamily: "Helvetica", color: "#1F1D19" },
  logo: { height: 26, marginBottom: 16 },
  titulo: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#14283A" },
  subtitulo: { fontSize: 10.5, color: "#8A8578", marginBottom: 16 },
  campo: { marginBottom: 9 },
  rotulo: { fontSize: 9, color: "#8A8578", marginBottom: 1, textTransform: "uppercase", letterSpacing: 0.5 },
  valor: { fontSize: 11, lineHeight: 1.5 },
  linha2: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  secao: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#14283A", marginTop: 14, marginBottom: 6 },
  fotosGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  foto: { width: 150, height: 110, objectFit: "cover", borderRadius: 3 },
  assinaturas: { flexDirection: "row", gap: 40, marginTop: 48 },
  assinatura: { flex: 1, borderTopWidth: 1, borderTopColor: "#1F1D19", paddingTop: 4 },
  assinaturaRotulo: { fontSize: 9, color: "#8A8578" },
  rodape: { position: "absolute", bottom: 30, left: 48, right: 48, fontSize: 8.5, color: "#8A8578" },
});

function formatarDataPdf(data: string | null) {
  if (!data) return "—";
  const d = new Date(data + (data.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("pt-PT");
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
  fotos: string[]; // data URIs
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Image src={LOGO_SRC} style={styles.logo} />
        <Text style={styles.titulo}>Auto de Não Conformidade {nc.codigo}</Text>
        <Text style={styles.subtitulo}>
          {obra.nome} · {obra.local} · Cliente: {obra.cliente_nome}
        </Text>

        <View style={styles.linha2}>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Data de deteção</Text>
            <Text style={styles.valor}>{formatarDataPdf(nc.data_deteccao)}</Text>
          </View>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Especialidade</Text>
            <Text style={styles.valor}>{nc.especialidade || "—"}</Text>
          </View>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Severidade</Text>
            <Text style={styles.valor}>{nc.severidade}</Text>
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={styles.rotulo}>Localização / zona na obra</Text>
          <Text style={styles.valor}>{nc.local_zona || "—"}</Text>
        </View>

        <Text style={styles.secao}>Descrição da não conformidade</Text>
        <Text style={styles.valor}>{nc.descricao}</Text>

        {nc.requisito_incumprido && (
          <>
            <Text style={styles.secao}>Requisito / norma não cumprido</Text>
            <Text style={styles.valor}>{nc.requisito_incumprido}</Text>
          </>
        )}

        {nc.acao_corretiva && (
          <>
            <Text style={styles.secao}>Ação corretiva proposta</Text>
            <Text style={styles.valor}>{nc.acao_corretiva}</Text>
          </>
        )}

        <View style={styles.linha2}>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Responsável pela correção</Text>
            <Text style={styles.valor}>{nc.responsavel || "—"}</Text>
          </View>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Prazo de resolução</Text>
            <Text style={styles.valor}>{formatarDataPdf(nc.prazo)}</Text>
          </View>
          <View style={[styles.col, styles.campo]}>
            <Text style={styles.rotulo}>Estado</Text>
            <Text style={styles.valor}>{nc.estado}</Text>
          </View>
        </View>

        {fotos.length > 0 && (
          <>
            <Text style={styles.secao}>Registo fotográfico</Text>
            <View style={styles.fotosGrid}>
              {fotos.map((f, i) => (
                <Image key={i} src={f} style={styles.foto} />
              ))}
            </View>
          </>
        )}

        <View style={styles.assinaturas}>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaRotulo}>{perfil.nome} — Diretor de Fiscalização de Obra</Text>
          </View>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaRotulo}>Empreiteiro / Responsável pela correção</Text>
          </View>
        </View>

        <Text style={styles.rodape}>
          Auto gerado automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>
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
