import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { PropostaRow, PerfilFiscalRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const NAVY = "#14283A";
const GOLD = "#C9A050";
const GRAY = "#8A8578";
const BORDER = "#DEDBD2";

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 34, paddingHorizontal: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1F1D19" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 8,
  },
  logo: { height: 30 },
  tituloBox: { alignItems: "flex-end" },
  titulo: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: 1 },
  subtitulo: { fontSize: 9, color: GOLD, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  codigo: { fontSize: 8, color: GRAY, marginTop: 2 },

  seccao: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 12, marginBottom: 4 },

  tabela: { borderWidth: 1, borderColor: BORDER, borderRadius: 2 },
  linha: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  linhaUltima: { flexDirection: "row" },
  celula: { flex: 1, paddingVertical: 4, paddingHorizontal: 6, borderRightWidth: 1, borderRightColor: BORDER },
  celulaUltima: { flex: 1, paddingVertical: 4, paddingHorizontal: 6 },
  celulaRotulo: { fontSize: 7, color: GRAY, textTransform: "uppercase", marginBottom: 1 },
  celulaValor: { fontSize: 9.5 },

  texto: { fontSize: 9, lineHeight: 1.4 },
  nota: { fontSize: 8, color: GRAY, marginTop: 5 },

  precoBox: {
    borderWidth: 1.5,
    borderColor: GOLD,
    borderRadius: 3,
    backgroundColor: "#FBF7EE",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  precoLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  precoLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 0.5 },
  precoFrequencia: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 2 },
  precoValor: { fontSize: 19, fontFamily: "Helvetica-Bold", color: NAVY },
  precoExtra: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E8D9B5",
  },
  precoExtraTexto: { fontSize: 9, color: "#1F1D19" },
  precoExtraValor: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY },
  precoIva: { fontSize: 7, color: GRAY, marginTop: 2 },

  declaracao: {
    borderLeftWidth: 2,
    borderLeftColor: GOLD,
    backgroundColor: "#FBF7EE",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  declaracaoTexto: { fontSize: 8.5, lineHeight: 1.4 },
  assinaturas: { flexDirection: "row", gap: 12, marginTop: 12 },
  assinatura: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    padding: 8,
    minHeight: 70,
    justifyContent: "space-between",
  },
  assinaturaTitulo: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: NAVY, textTransform: "uppercase" },
  assinaturaLinha: { borderTopWidth: 1, borderTopColor: "#1F1D19", marginTop: 34 },
  assinaturaData: { fontSize: 7, color: GRAY, marginTop: 4 },

  rodape: { position: "absolute", bottom: 14, left: 36, right: 36, fontSize: 7, color: GRAY, textAlign: "center" },
});

const FREQUENCIA_LABEL: Record<string, string> = {
  semanal: "Semanal — 1 visita por semana",
  quinzenal: "Quinzenal — 1 visita a cada 15 dias",
  mensal: "Mensal — 1 visita por mês",
};

const SUBTITULO_TIPO: Record<string, string> = {
  fiscalizacao: "FISCALIZAÇÃO DE OBRA",
  consultoria: "CONSULTORIA DE CONSTRUÇÃO CIVIL",
};

const OBJETO_FISCALIZACAO =
  "Prestação de serviços de fiscalização de obra, incluindo visitas periódicas ao local, registo fotográfico " +
  "e escrito de cada visita, identificação e acompanhamento de não conformidades até à sua correção, emissão " +
  "de relatório de visita, e acesso a um portal próprio onde o cliente acompanha em permanência o progresso, " +
  "os relatórios e as não conformidades da sua obra.";

function formatarEuro(valor: number | null) {
  if (valor === null) return "—";
  return valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function formatarPercentagem(valor: number | null) {
  return `${(valor ?? 0).toLocaleString("pt-PT", { maximumFractionDigits: 2 })}%`;
}

/** IBAN em grupos de 4 caracteres, como aparece nos documentos bancários. */
function formatarIban(iban: string) {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

function formatarDataPdf(data: string | null) {
  if (!data) return "—";
  const d = new Date(data + (data.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("pt-PT");
}

/** Texto que o cliente assina na aceitação, para a proposta assinada valer como contrato. */
const DECLARACAO_ACEITACAO =
  "O cliente declara ter lido e aceitar integralmente a presente proposta, adjudicando a prestação dos serviços " +
  "nela descritos, conforme condições comerciais e de pagamento acima indicadas. Com a assinatura deste " +
  "documento, ambas as partes comprometem-se a cumprir o aqui acordado, valendo o mesmo como contrato de " +
  "prestação de serviços entre as partes.";

export function PropostaServicoDoc({
  proposta,
  perfil,
  logoEmpresaUrl,
}: {
  proposta: PropostaRow;
  perfil: PerfilFiscalRow;
  logoEmpresaUrl?: string | null;
}) {
  const empresa = proposta.cliente_tipo === "empresa";
  const textoIva = proposta.com_iva ? "+ IVA à taxa legal em vigor" : "Sem IVA";
  const valorBase =
    proposta.tipo_servico === "consultoria"
      ? proposta.valor_servico
      : proposta.modalidade_visitas === "pack"
        ? proposta.valor_pack
        : proposta.valor_anual;
  const prestacoes = [
    { pct: proposta.pagamento_adjudicacao_pct, data: proposta.pagamento_adjudicacao_data, quando: "Na adjudicação" },
    { pct: proposta.pagamento_segunda_pct, data: proposta.pagamento_segunda_data, quando: "Restante pagamento" },
  ].filter((p) => p.pct !== null);
  const temPagamento = prestacoes.length > 0 || !!proposta.iban;
  // A aceitação muda de número consoante haja ou não a secção de condições de pagamento.
  const numeroAceitacao = temPagamento ? 6 : 5;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoEmpresaUrl || LOGO_SRC} style={styles.logo} />
          <View style={styles.tituloBox}>
            <Text style={styles.titulo}>PROPOSTA DE SERVIÇO</Text>
            <Text style={styles.subtitulo}>{SUBTITULO_TIPO[proposta.tipo_servico]}</Text>
            {proposta.codigo && <Text style={styles.codigo}>{proposta.codigo}</Text>}
          </View>
        </View>

        <Text style={styles.seccao}>1. Cliente</Text>
        <View style={styles.tabela}>
          <View style={styles.linha}>
            <View style={[styles.celula, { flex: 2 }]}>
              <Text style={styles.celulaRotulo}>{empresa ? "Empresa" : "Nome"}</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_nome}</Text>
            </View>
            <View style={styles.celula}>
              <Text style={styles.celulaRotulo}>{empresa ? "NIPC" : "NIF / Contribuinte"}</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_nif || "—"}</Text>
            </View>
            <View style={styles.celulaUltima}>
              <Text style={styles.celulaRotulo}>Data da proposta</Text>
              <Text style={styles.celulaValor}>{formatarDataPdf(proposta.enviada_em)}</Text>
            </View>
          </View>
          <View style={styles.linhaUltima}>
            <View style={empresa ? [styles.celula, { flex: 2 }] : [styles.celulaUltima, { flex: 2 }]}>
              <Text style={styles.celulaRotulo}>{empresa ? "Sede / morada fiscal" : "Morada fiscal"}</Text>
              <Text style={styles.celulaValor}>{proposta.cliente_morada_fiscal || "—"}</Text>
            </View>
            {empresa && (
              <View style={[styles.celulaUltima, { flex: 2 }]}>
                <Text style={styles.celulaRotulo}>Alvará n.º</Text>
                <Text style={styles.celulaValor}>{proposta.cliente_alvara || "—"}</Text>
              </View>
            )}
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
          {proposta.tipo_servico === "consultoria"
            ? proposta.descricao_servico || "Prestação de serviços de consultoria de construção civil."
            : OBJETO_FISCALIZACAO}
        </Text>

        <Text style={styles.seccao}>4. Condições comerciais</Text>
        {proposta.tipo_servico === "consultoria" ? (
          <View style={styles.precoBox}>
            <View style={styles.precoLinha}>
              <View>
                <Text style={styles.precoLabel}>Serviço</Text>
                <Text style={styles.precoFrequencia}>Consultoria de construção civil</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.precoLabel}>Valor do serviço</Text>
                <Text style={styles.precoValor}>{formatarEuro(proposta.valor_servico)}</Text>
                <Text style={styles.precoIva}>{textoIva}</Text>
              </View>
            </View>
          </View>
        ) : proposta.modalidade_visitas === "pack" ? (
          <View style={styles.precoBox}>
            <View style={styles.precoLinha}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.precoLabel}>Pack de visitas</Text>
                <Text style={styles.precoFrequencia}>
                  {plural(proposta.pack_num_visitas ?? 0, "visita", "visitas")} durante o prazo da obra
                </Text>
                <Text style={{ fontSize: 8.5, color: GRAY, marginTop: 3 }}>
                  Prazo estimado da obra: {plural(proposta.prazo_obra_meses ?? 0, "mês", "meses")}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.precoLabel}>Valor do pack</Text>
                <Text style={styles.precoValor}>{formatarEuro(proposta.valor_pack)}</Text>
                <Text style={styles.precoIva}>{textoIva}</Text>
              </View>
            </View>
            <View style={styles.precoExtra}>
              <Text style={[styles.precoExtraTexto, { flex: 1, paddingRight: 12 }]}>
                Valor por cada visita adicional, para além das{" "}
                {plural(proposta.pack_num_visitas ?? 0, "visita incluída", "visitas incluídas")} no pack, quando
                solicitada pelo cliente
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.precoExtraValor}>{formatarEuro(proposta.valor_visita_extra)}</Text>
                <Text style={styles.precoIva}>{textoIva}</Text>
              </View>
            </View>
          </View>
        ) : (
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
                <Text style={styles.precoIva}>{textoIva}</Text>
              </View>
            </View>
            <View style={styles.precoExtra}>
              <Text style={styles.precoExtraTexto}>Valor por cada visita adicional, fora da periodicidade acima</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.precoExtraValor}>{formatarEuro(proposta.valor_visita_extra)}</Text>
                <Text style={styles.precoIva}>{textoIva}</Text>
              </View>
            </View>
          </View>
        )}

        {temPagamento && (
          <>
            <Text style={styles.seccao}>5. Condições de pagamento</Text>
            {prestacoes.length > 0 && (
              <View style={styles.tabela}>
                <View style={styles.linhaUltima}>
                  {prestacoes.map((p, i) => (
                    <View key={p.quando} style={i === prestacoes.length - 1 ? styles.celulaUltima : styles.celula}>
                      <Text style={styles.celulaRotulo}>
                        {p.quando} · {formatarDataPdf(p.data)}
                      </Text>
                      <Text style={styles.celulaValor}>
                        {formatarPercentagem(p.pct)}
                        {valorBase !== null
                          ? ` — ${formatarEuro((valorBase * (p.pct ?? 0)) / 100)} ${proposta.com_iva ? "+ IVA" : "(sem IVA)"}`
                          : ""}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {proposta.iban && (
              <Text style={[styles.texto, { marginTop: 5 }]}>
                Pagamento por transferência bancária para o IBAN{" "}
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{formatarIban(proposta.iban)}</Text>
              </Text>
            )}
          </>
        )}

        <Text style={styles.nota}>
          Salvo indicação em contrário, esta proposta é válida por 30 dias a contar da data da proposta.
        </Text>

        <View wrap={false}>
        <Text style={styles.seccao}>{numeroAceitacao}. Aceitação</Text>
        <View style={styles.declaracao}>
          <Text style={styles.declaracaoTexto}>{DECLARACAO_ACEITACAO}</Text>
        </View>
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
        </View>

        <Text style={styles.rodape} fixed>
          Proposta gerada automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>
    </Document>
  );
}

export async function gerarPdfPropostaServico(
  proposta: PropostaRow,
  perfil: PerfilFiscalRow,
  logoEmpresaUrl?: string | null
) {
  return renderToBuffer(
    <PropostaServicoDoc proposta={proposta} perfil={perfil} logoEmpresaUrl={logoEmpresaUrl} />
  );
}
