import { ImageResponse } from "next/og";
import { LOGO_SRC_DARK } from "@/lib/branding";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14283A",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_SRC_DARK} alt="" width={120} height={141} />
      </div>
    ),
    { ...size }
  );
}
