import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { ReportIssueForm } from "@/components/forms/ReportIssueForm";
import type { ComplaintTypeOption } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ReportIssue" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function ReportIssuePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ReportIssue");
  const typeOptions = t.raw("typeOptions") as ComplaintTypeOption[];

  return (
    <div className="pb-20">
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-1.gif" alt="" fill unoptimized className="object-cover opacity-20 dark:opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-koura-bg/80 via-koura-bg/90 to-koura-bg dark:from-[#050505]/80 dark:via-[#050505]/95 dark:to-[#050505]" />
        </div>

        <RevealOnScroll once className="relative z-10 mt-20 container mx-auto px-4 text-center sm:px-6 lg:px-8 xl:px-12">
          <h1 className="mb-6 text-4xl font-black text-koura-primary md:text-6xl dark:text-[#D4AF37] dark:drop-shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </RevealOnScroll>
      </section>

      <section className="relative z-20 container mx-auto mt-10 px-4 sm:px-6 lg:px-8 xl:px-12">
        <RevealOnScroll y={0} className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-xl backdrop-blur-xl transition-colors duration-300 sm:p-8 md:p-12 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h3 className="mb-8 text-2xl font-bold text-koura-text dark:text-white">{t("formTitle")}</h3>
          <ReportIssueForm typeOptions={typeOptions} />
        </RevealOnScroll>
      </section>
    </div>
  );
}
