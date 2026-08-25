import { ImageResponse } from "next/og";
import { LOGO_SRC_DARK } from "@/lib/branding";

export const alt = "Fiscalis — Plataforma e Serviço de Fiscalização de Obra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#14283A",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 620,
            background: "radial-gradient(circle, rgba(201,160,80,0.35) 0%, rgba(201,160,80,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 96,
            paddingRight: 96,
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC_DARK} alt="" width={64} height={75} />
            <span
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: 10,
                color: "#F3EEDD",
              }}
            >
              FISCALIS
            </span>
          </div>
          <div style={{ display: "flex", width: 120, height: 3, background: "#C9A050", marginTop: 36, marginBottom: 36 }} />
          <div style={{ display: "flex", fontSize: 42, color: "#F3EEDD", maxWidth: 820 }}>
            Fiscalização de obra, a sério.
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#C9A050", marginTop: 18, letterSpacing: 1 }}>
            Plataforma para empresas · Serviço independente em Aveiro e Porto
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
