import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaFileSignature, FaFingerprint, FaMicrochip, FaSatelliteDish, FaWallet } from "react-icons/fa6";
import { RevealOnScroll, StaggerGroup, StaggerItem } from "@/components/shared/RevealOnScroll";
import { StatCounter } from "@/components/shared/StatCounter";
import { TiltCard } from "@/components/shared/TiltCard";
import type { DigitalCard, DigitalStat } from "@/types/content";

const CARD_ICONS = [FaFingerprint, FaFileSignature, FaSatelliteDish, FaWallet];
const CARD_ACCENTS = [
  "bg-koura-primary/10 text-koura-primary group-hover:bg-koura-primary group-hover:text-white",
  "bg-koura-secondary/10 text-koura-secondary group-hover:bg-koura-secondary group-hover:text-white",
  "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white",
  "bg-koura-accent/20 text-koura-primary group-hover:bg-koura-primary group-hover:text-white",
];
const CARD_HOVER_BORDER = [
  "hover:border-koura-primary",
  "hover:border-koura-secondary",
  "hover:border-red-500",
  "hover:border-koura-accent",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Digital" });
  const tNav = await getTranslations({ locale, namespace: "Nav" });
  return { title: tNav("digital"), description: t("metaDescription") };
}

export default async function DigitalMunicipalityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Digital");
  const cards = t.raw("cards") as DigitalCard[];
  const stats = t.raw("stats") as DigitalStat[];

  return (
    <div>
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 origin-bottom bg-[linear-gradient(rgba(74,102,53,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(74,102,53,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 [transform:perspective(500px)_rotateX(60deg)] dark:bg-[linear-gradient(rgba(212,175,53,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,53,0.05)_1px,transparent_1px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-koura-bg to-koura-bg dark:from-[#D4AF37]/10 dark:via-[#050505]/80 dark:to-[#050505]" />
        </div>

        <RevealOnScroll once className="relative z-10 container mx-auto px-4 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-koura-primary/30 bg-koura-primary/10 px-4 py-1 text-xs font-bold tracking-widest text-koura-primary shadow-sm dark:border-[#D4AF37]/30 dark:bg-[#D4AF37]/10 dark:text-[#D4AF37] dark:shadow-[0_0_15px_rgba(212,175,53,0.2)]">
            <FaMicrochip />
            {t("badge")}
          </span>
          <h1 className="mb-6 text-6xl font-black text-koura-text md:text-8xl dark:text-white dark:drop-shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            {t("title1")} <span className="text-koura-primary dark:text-[#D4AF37]">{t("title2")}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-gray-600 md:text-2xl dark:text-gray-400">
            {t("desc")}
          </p>
        </RevealOnScroll>
      </section>

      <section className="relative z-20 container mx-auto px-4 py-20">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-8 w-2 rounded-full bg-koura-primary shadow-sm dark:bg-[#D4AF37] dark:shadow-[0_0_10px_rgba(212,175,53,1)]" />
          <h2 className="text-3xl font-bold text-koura-text dark:text-white">{t("sectionTitle")}</h2>
        </div>

        <StaggerGroup className="grid grid-cols-1 gap-6 [perspective:1000px] md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <StaggerItem key={card.title} className="h-full">
                <TiltCard
                  max={5}
                  className={`group flex h-full cursor-pointer flex-col rounded-3xl border border-transparent bg-white p-8 shadow-xl transition-all duration-300 dark:bg-white/5 ${CARD_HOVER_BORDER[i]}`}
                >
                  <div className="mb-8 flex items-start justify-center">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-colors duration-300 ${CARD_ACCENTS[i]}`}>
                      <Icon />
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-black text-koura-text dark:text-white">{card.title}</h3>
                  <p className="flex-1 text-center text-sm leading-relaxed font-medium text-gray-500 dark:text-gray-400">
                    {card.desc}
                  </p>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <section className="container mx-auto px-4 pb-32">
        <RevealOnScroll className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-10 shadow-xl backdrop-blur-xl transition-all duration-300 md:p-16 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-koura-primary/5 blur-[100px] dark:bg-[#D4AF37]/5" />

          <div className="relative z-10 mb-12 text-center">
            <h3 className="mb-3 text-sm font-bold tracking-widest text-koura-primary uppercase dark:text-[#D4AF37]">
              {t("statsSubtitle")}
            </h3>
            <h2 className="text-4xl font-bold text-koura-text dark:text-white">{t("statsTitle")}</h2>
          </div>

          <div className="relative z-10 grid grid-cols-1 gap-10 text-center md:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`p-6 ${i === 1 ? "border-y border-gray-200 md:border-x md:border-y-0 dark:border-white/10" : ""}`}
              >
                <div className="mb-4 flex items-center justify-center gap-1 text-5xl font-black text-koura-primary dark:text-[#D4AF37] dark:drop-shadow-[0_0_10px_rgba(212,175,53,0.5)]">
                  <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-lg font-bold text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
