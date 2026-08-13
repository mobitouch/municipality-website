"use client";

import { useTranslations } from "next-intl";
import { FaTelegram } from "react-icons/fa6";

// TODO: replace with the municipality's actual Telegram channel/chat link.
const TELEGRAM_URL = "https://t.me/";

export function TelegramButton() {
  const t = useTranslations("Telegram");

  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("label")}
      className="fixed bottom-24 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#26A5E4] text-3xl text-white shadow-lg transition-colors hover:bg-[#1c8bc4]"
    >
      <FaTelegram />
    </a>
  );
}
