"use client";

import { useTranslations } from "next-intl";
import { FaWhatsapp } from "react-icons/fa6";

export function WhatsAppButton() {
  const t = useTranslations("WhatsApp");

  return (
    <a
      href="https://wa.me/9616123456"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="whatsapp-pulse fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-3xl text-white shadow-lg transition-colors hover:bg-[#128C7E]"
    >
      <FaWhatsapp />
    </a>
  );
}
