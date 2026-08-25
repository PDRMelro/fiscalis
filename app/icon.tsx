import { ImageResponse } from "next/og";
import { LOGO_SRC_DARK } from "@/lib/branding";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
        <img src={LOGO_SRC_DARK} alt="" width={22} height={26} />
      </div>
    ),
    { ...size }
  );
}
