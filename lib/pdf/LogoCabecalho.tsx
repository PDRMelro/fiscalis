import { Image, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { LOGO_SRC } from "@/lib/branding";

const NAVY = "#14283A";
const GOLD = "#C9A050";

/**
 * Logótipo no cabeçalho dos PDFs. Com o símbolo da Fiscalis (empresa sem
 * logótipo próprio) junta-lhe à direita "FISCALIS / ENGENHARIA", como na
 * placa de obra; o logótipo de outra empresa aparece sozinho, tal como é.
 */
export function LogoCabecalho({
  logoEmpresaUrl,
  altura,
  style,
}: {
  logoEmpresaUrl?: string | null;
  altura: number;
  style?: Style;
}) {
  if (logoEmpresaUrl) {
    return <Image src={logoEmpresaUrl} style={[{ height: altura }, style ?? {}]} />;
  }

  return (
    <View style={[{ flexDirection: "row", alignItems: "center" }, style ?? {}]}>
      <Image src={LOGO_SRC} style={{ height: altura }} />
      <View style={{ marginLeft: altura * 0.25, alignItems: "center" }}>
        <Text
          style={{ fontSize: altura * 0.52, fontFamily: "Helvetica-Bold", color: NAVY, letterSpacing: altura * 0.03 }}
        >
          FISCALIS
        </Text>
        <Text
          style={{
            fontSize: altura * 0.2,
            fontFamily: "Helvetica-Bold",
            color: GOLD,
            letterSpacing: altura * 0.13,
            marginTop: altura * 0.04,
          }}
        >
          ENGENHARIA
        </Text>
      </View>
    </View>
  );
}
