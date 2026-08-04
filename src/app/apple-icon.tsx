import { ImageResponse } from "next/og";

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
          background: "#2C5530",
          color: "#D4AF37",
          fontSize: 96,
          fontWeight: 900,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
