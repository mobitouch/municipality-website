import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-7xl font-black text-koura-primary dark:text-[#D4AF37]">{t("title")}</p>
      <p className="max-w-md text-lg font-medium text-gray-600 dark:text-gray-400">{t("description")}</p>
      <Link
        href="/"
        className="rounded-xl bg-koura-primary px-6 py-3 font-bold text-white shadow-md transition-transform hover:scale-105 dark:bg-[#D4AF37] dark:text-black"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
