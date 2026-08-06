import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import type { ProjectItem } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <div className="pb-24">
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-koura-primary/10 via-koura-bg to-koura-bg dark:from-[#D4AF37]/5 dark:via-[#050505] dark:to-[#050505]" />
        <RevealOnScroll once className="relative z-10 mt-20 container mx-auto px-4 text-center sm:px-6 lg:px-8 xl:px-12">
          <h1 className="mb-6 text-4xl font-black text-koura-primary md:text-6xl dark:text-[#D4AF37] dark:drop-shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </RevealOnScroll>
      </section>

      <section className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <ProjectsGrid
          items={items}
          labels={{
            filterAll: t("filterAll"),
            filterDone: t("filterDone"),
            filterProg: t("filterProg"),
            statusDone: t("statusDone"),
            statusProg: t("statusProg"),
            noResults: t("noResults"),
          }}
        />
      </section>
    </div>
  );
}
