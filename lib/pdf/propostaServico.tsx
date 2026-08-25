import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { PropostaRow, PerfilFiscalRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const NAVY = "#14283A";
const GOLD = "#C9A050";
const GRAY = "#8A8578";
const BORDER = "#DEDBD2";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1F1D19" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 10,
  },
  logo: { height: 34 },
  tituloBox: { alignItems: "flex-end" },
  titulo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 1 },
  subtitulo: { fontSize: 9, color: GOLD, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  codigo: { fontSize: 8, color: GRAY, marginTop: 2 },

  seccao: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 12, marginBottom: 4 },

  tabela: { borderWidth: 1, borderColor: BORDER, borderRadius: 2 },
  linha: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  linhaUltima: { flexDirection: "row" },
  celula: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: BORDER },
  celulaUltima: { flex: 1, padding: 6 },
  celulaRotulo: { fontSize: 7, color: GRAY, textTransform: "uppercase", marginBottom: 1 },
  celulaValor: { fontSize: 9.5 },

  texto: { fontSize: 9.5, lineHeight: 1.5 },

  precoBox: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 3,
    backgroundColor: "#FBF7EE",
    padding: 12,
  },
  precoLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  precoLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 },
  precoFrequencia: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 2 },
  precoValor: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY },
  precoExtra: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8D9B5",
  },
  precoExtraTexto: { fontSize: 9, color: "#1F1D19" },
  precoExtraValor: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY },
  precoIva: { fontSize: 7, color: GRAY, marginTop: 2 },

  assinaturas: { flexDirection: "row", gap: 12, marginTop: 22 },
  assinatura: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 8,
    minHeight: 60,
    justifyContent: "space-between",
  },
  assinaturaTitulo: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: NAVY, textTransform: "uppercase" },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: "#1F1D19", marginTop: 28 },
  assinaturaData: { fontSize: 7, color: GRAY, marginTop: 4 },

  rodape: { position: "absolute", bottom: 18, left: 36, right: 36, fontSize: 7, color: GRAY, textAlign: "center" },
});

const FREQUENCIA_LABEL: Record<string, string> = {
  semanal: "Semanal — 1 visita por semana",
  quinzenal: "Quinzenal — 1 visita a cada 15 dias",
  mensal: "Mensal — 1 visita por mês",
};

function formatarEuro(valor: number | null) {
  if (valor === null) return "—";
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function formatarDataPdf(data: string | null) {
  if (!data) return "—";
  const d = new Date(data + (data.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("pt-PT");
}

export function PropostaServicoDoc({ proposta, perfil }: { proposta: PropostaRow; perfil: PerfilFiscalRow }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={LOGO_SRC} style={styles.logo} />
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>PROPOSTA DE SERVIÇO</Text>
            <Text style={styles.subtitulo}>FISCALIZAÇÃO DE OBRA</Text>
            {proposta.codigo && <Text style={styles.codigo}>{proposta.codigo}</Text>}
          </View>
        </View>

        <Text style={styles.seccao}>1. Cliente</Text>
        <View style={styles.tabela}>
          <View style={styles.linha}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Nome</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_nome}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>NIF / Contribuinte</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_nif || "—"}</Text>
            </View>
          </View>
          <View style={styles.linhaUltima}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Morada fiscal</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_morada_fiscal || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Data da proposta</Text>
              <Text style={styles.celulaValor}>{formatarDataPdf(proposta.enviada_em)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>2. Obra</Text>
        <View style={styles.tabela}>
          <View style={styles.linhaUltima}>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>Morada da obra</Text>
              <Text style={styles.celulaValor}>{proposta.local}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Tipo de obra</Text>
              <Text style={styles.celulaValor}>{proposta.tipo_obra}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>3. Objeto da proposta</Text>
        <Text style={styles.texto}>
          Prestação de serviços de fiscalização de obra, incluindo visitas periódicas ao local, registo fotográfico
          e escrito de cada visita, identificação e acompanhamento de não conformidades até à sua correção, emissão
          de relatório de visita, e acesso a um portal próprio onde o cliente acompanha em permanência o progresso,
          os relatórios e as não conformidades da sua obra.
        </Text>

        <Text style={styles.seccao}>4. Condições comerciais</Text>
        <View style={styles.precoBox}>
          <View style={styles.precoLinha}>
            <View>
              <Text style={styles.precoLabel}>Periodicidade das visitas</Text>
              <Text style={styles.precoFrequencia}>
                {proposta.frequencia_visitas ? FREQUENCIA_LABEL[proposta.frequencia_visitas] : "—"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.precoLabel}>Valor fixo anual</Text>
              <Text style={styles.precoValor}>{formatarEuro(proposta.valor_anual)}</Text>
              <Text style={styles.precoIva}>+ IVA à taxa legal em vigor</Text>
            </View>
          </View>
          <View style={styles.precoExtra}>
            <Text style={styles.precoExtraTexto}>Valor por cada visita adicional, fora da periodicidade acima</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.precoExtraValor}>{formatarEuro(proposta.valor_visita_extra)}</Text>
              <Text style={styles.precoIva}>+ IVA à taxa legal em vigor</Text>
            </View>
          </View>
        </View>

        <Text style={styles.seccao}>5. Validade</Text>
        <Text style={styles.texto}>
          Salvo indicação em contrário, esta proposta é válida por 30 dias a contar da data indicada acima.
        </Text>

        <Text style={styles.seccao}>6. Aceitação</Text>
        <View style={styles.assinaturas}>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Fiscalização</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>
                {perfil.nome} · {perfil.qualificacao} · Data: ___/___/______
              </Text>
            </View>
          </View>
          <View style={styles.assinatura}>
            <Text style={styles.assinaturaTitulo}>Cliente — aceitação da proposta</Text>
            <View>
              <View style={styles.assinaturaLinha} />
              <Text style={styles.assinaturaData}>{proposta.cliente_nome} · Data: ___/___/______</Text>
            </View>
          </View>
        </View>

        <Text style={styles.rodape}>
          Proposta gerada automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>
    </Document>
  );
}

export async function gerarPdfPropostaServico(proposta: PropostaRow, perfil: PerfilFiscalRow) {
  return renderToBuffer(<PropostaServicoDoc proposta={proposta} perfil={perfil} />);
}
