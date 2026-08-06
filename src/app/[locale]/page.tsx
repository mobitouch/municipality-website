import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  FaArrowLeft,
  FaArrowTrendUp,
  FaArrowUpRightFromSquare,
  FaCloudSun,
  FaCommentDots,
  FaCreditCard,
  FaFolderOpen,
  FaLandmark,
  FaMap,
} from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { RevealOnScroll, StaggerGroup, StaggerItem } from "@/components/shared/RevealOnScroll";
import { StatCounter } from "@/components/shared/StatCounter";
import type { HomeCard } from "@/types/content";

const CARD_ICONS = [FaFolderOpen, FaCreditCard, FaCommentDots, FaMap];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return { title: tNav("home"), description: t("metaDescription") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const cards = t.raw("cards") as HomeCard[];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-black py-24">
        <HeroSlideshow />

        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 xl:px-12">
          <RevealOnScroll once className="relative max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-black/50 p-8 shadow-2xl backdrop-blur-xl md:p-14 dark:bg-black/65">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-1.5 text-xs font-bold tracking-widest text-white backdrop-blur-md">
              <FaLandmark className="text-koura-secondary" />
              <span>{t("heroBadge")}</span>
            </div>

            <h2 className="mb-6 text-4xl leading-tight font-black text-white drop-shadow-md md:text-6xl">
              {t("heroTitle1")}
              <br />
              <span className="mt-2 inline-block text-koura-secondary">{t("heroTitle2")}</span>
            </h2>

            <p className="mb-8 max-w-xl text-base leading-relaxed font-medium text-white/90 drop-shadow-sm md:text-lg">
              {t("heroDesc")}
            </p>

            <Link
              href="/citizen-services"
              className="hover-lift-gold inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-koura-primary px-8 py-4 font-bold text-white shadow-lg transition-colors duration-300 hover:bg-[#1E3A21]"
            >
              <span>{t("heroBtn")}</span>
              <FaArrowLeft className="rtl:rotate-180" />
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Amioun in Numbers */}
      <section className="relative z-20 bg-koura-bg py-24 dark:bg-[#070A07]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <SectionHeadingInline title={t("dashTitle")} />

          <StaggerGroup className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StaggerItem className="hover-lift-gold flex items-center gap-6 rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-[#121A12]/80">
              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-koura-primary transition-all duration-1000 ease-out dark:text-koura-secondary"
                    strokeDasharray="85, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-koura-text dark:text-white">
                  <StatCounter value={t.raw("statCompletedValue") as number} />
                </div>
              </div>
              <div>
                <h4 className="mb-1 text-lg font-bold text-koura-text dark:text-white">{t("statCompletedTitle")}</h4>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("statCompletedDesc")}</p>
              </div>
            </StaggerItem>

            <StaggerItem className="hover-lift-gold flex items-center gap-6 rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-[#121A12]/80">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-koura-primary/10 text-3xl text-koura-primary dark:bg-white/10 dark:text-white">
                <FaCloudSun />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h4 className="text-3xl font-black tracking-tighter text-koura-text dark:text-white" dir="ltr">
                    {t("statWeatherValue")}°
                  </h4>
                  <span className="text-lg font-bold text-koura-text dark:text-white">C</span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{t("statWeatherDesc")}</p>
              </div>
            </StaggerItem>

            <StaggerItem className="hover-lift-gold flex flex-col justify-center rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-[#121A12]/80">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h4 className="mb-1 text-lg font-bold text-koura-text dark:text-white">{t("statComplaintsTitle")}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-koura-primary dark:text-koura-secondary">
                      <StatCounter value={t.raw("statComplaintsValue") as number} suffix="%" />
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-koura-primary/10 px-2 py-0.5 text-xs font-bold text-koura-primary dark:text-white">
                      <FaArrowTrendUp /> <span>{t("statComplaintsTag")}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex h-8 w-full items-end gap-1.5">
                {[40, 55, 70, 85, 100].map((h) => (
                  <div key={h} className="w-full rounded-t-sm bg-koura-primary" style={{ height: `${h}%`, opacity: h / 100 }} />
                ))}
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* Services Preview */}
      <section className="relative z-20 container mx-auto px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
        <StaggerGroup className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <StaggerItem key={card.href}>
                <Link
                  href={card.href}
                  className="glass-ui hover-lift-gold group flex h-full flex-col rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#D4AF37] hover:shadow-md dark:border-white/10 dark:bg-[#121A12]/80"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-koura-primary text-2xl text-white transition-colors duration-300 group-hover:bg-koura-secondary group-hover:text-black">
                      <Icon />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors group-hover:text-koura-primary dark:bg-white/10 dark:group-hover:text-[#D4AF37]">
                      <FaArrowUpRightFromSquare className="text-sm" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-koura-text dark:text-white">{card.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed font-medium text-gray-500 dark:text-gray-400">
                    {card.desc}
                  </p>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>
    </div>
  );
}

function SectionHeadingInline({ title }: { title: string }) {
  return (
    <RevealOnScroll className="mb-14 text-center">
      <h2 className="text-3xl font-extrabold text-koura-text dark:text-white">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-koura-secondary" />
    </RevealOnScroll>
  );
}
