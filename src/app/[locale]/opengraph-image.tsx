import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Nav" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2C5530 0%, #1A381E 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#D4AF37",
            color: "#1A381E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            fontWeight: 900,
            marginBottom: 32,
          }}
        >
          A
        </div>
        <div style={{ fontSize: 72, fontWeight: 900 }}>{t("brandName")}</div>
        <div style={{ fontSize: 32, color: "#D4AF37", marginTop: 20, letterSpacing: 4 }}>
          {t("brandSub").toUpperCase()}
        </div>
      </div>
    ),
    size,
  );
}
