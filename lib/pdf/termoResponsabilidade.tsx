import { Document, Page, Text, View, StyleSheet, renderToBuffer, Image } from "@react-pdf/renderer";
import type { ObraRow, PerfilFiscalRow } from "@/lib/supabase/types";
import { LOGO_SRC } from "@/lib/branding";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: "Helvetica", color: "#1F1D19" },
  logo: { height: 28, marginBottom: 16 },
  titulo: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", textDecoration: "underline" },
  subtitulo: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 18 },
  paragrafo: { lineHeight: 1.6, marginBottom: 10, textAlign: "justify" },
  rodape: { position: "absolute", bottom: 40, left: 48, right: 48, fontSize: 9, color: "#8A8578" },
});

export function TermoResponsabilidadeDoc({
  obra,
  perfil,
}: {
  obra: ObraRow;
  perfil: PerfilFiscalRow;
}) {
  const descricaoObra = obra.termo_descricao_obra || "[descrição da obra]";
  const freguesia = obra.termo_freguesia || "[freguesia]";
  const processo = obra.termo_processo || "[n.º do processo]";
  const requerimento = obra.termo_requerimento || "[n.º do requerimento]";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={LOGO_SRC} style={styles.logo} />
        <Text style={styles.titulo}>TERMO DE RESPONSABILIDADE</Text>
        <Text style={styles.subtitulo}>DO DIRETOR DE FISCALIZAÇÃO DE OBRA</Text>

        <Text style={styles.paragrafo}>
          {perfil.nome}, {perfil.qualificacao}, com morada fiscal na {perfil.morada_fiscal}, contribuinte
          fiscal n.º {perfil.nif}, com o cartão de cidadão n.º {perfil.cartao_cidadao}, inscrito na Ordem
          dos Engenheiros sob a cédula profissional n.º {perfil.cedula_profissional}, declara, na qualidade
          de Diretor de Fiscalização de Obra, que assume a responsabilidade pela verificação da execução da
          obra em conformidade com o projeto aprovado.
        </Text>

        <Text style={styles.paragrafo}>
          A presente declaração respeita à obra de {descricaoObra}, localizada na {obra.local}, freguesia de{" "}
          {freguesia}, cujo licenciamento foi requerido por {obra.cliente_nome}, no âmbito do Processo n.º{" "}
          {processo} e Requerimento n.º {requerimento}.
        </Text>

        <Text style={styles.rodape}>
          Documento gerado automaticamente pela plataforma Fiscalis em {new Date().toLocaleDateString("pt-PT")}.
        </Text>
      </Page>
    </Document>
  );
}

export async function gerarPdfTermoResponsabilidade(obra: ObraRow, perfil: PerfilFiscalRow) {
  return renderToBuffer(<TermoResponsabilidadeDoc obra={obra} perfil={perfil} />);
}
