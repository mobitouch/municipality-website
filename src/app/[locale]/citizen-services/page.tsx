import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaCheck } from "react-icons/fa6";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { ServiceCategorySearch } from "@/components/citizen-services/ServiceCategorySearch";
import type { GuideStep, ServiceCategory } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CitizenServices" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function CitizenServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("CitizenServices");
  const categories = t.raw("categories") as ServiceCategory[];
  const steps = t.raw("steps") as GuideStep[];

  return (
    <div>
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-koura-bg/80 via-koura-bg/90 to-koura-bg dark:from-[#050505]/80 dark:via-[#050505]/95 dark:to-[#050505]" />

        <RevealOnScroll once className="relative z-10 mt-20 container mx-auto px-4 text-center sm:px-6 lg:px-8 xl:px-12">
          <h1 className="mb-6 text-5xl font-black text-koura-primary md:text-7xl dark:text-[#D4AF37] dark:drop-shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            {t("title")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed font-medium text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>

          <ServiceCategorySearch
            categories={categories}
            labels={{
              searchPh: t("searchPh"),
              searchBtn: t("searchBtn"),
              searchEmpty: t("searchEmpty"),
              explore: t("explore"),
            }}
          />
        </RevealOnScroll>
      </section>

      <section className="container mx-auto px-4 pb-32 sm:px-6 lg:px-8 xl:px-12">
        <RevealOnScroll className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-10 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-16 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="relative z-10 mb-16 text-center">
            <h2 className="text-3xl font-bold text-koura-text md:text-4xl dark:text-white">{t("guideTitle")}</h2>
            <p className="mt-4 font-medium text-gray-500 dark:text-gray-400">{t("guideSubtitle")}</p>
          </div>

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-0">
            <div className="absolute top-1/2 end-10 start-10 hidden h-1 -translate-y-1/2 rounded-full bg-gray-200 md:block dark:bg-white/10" />

            {steps.map((step, i) => (
              <div key={step.title} className="group relative z-10 flex w-full flex-col items-center text-center md:w-1/4">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-100 bg-white text-2xl text-gray-400 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:border-koura-primary group-hover:text-koura-primary dark:border-white/10 dark:bg-[#111] dark:text-gray-500 dark:group-hover:border-[#D4AF37] dark:group-hover:text-[#D4AF37]">
                  {i === steps.length - 1 ? <FaCheck /> : i + 1}
                </div>
                <h4 className="mb-2 text-xl font-bold text-koura-text dark:text-white">{step.title}</h4>
                <p className="px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
