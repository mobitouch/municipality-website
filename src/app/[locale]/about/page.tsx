import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaBuildingColumns, FaLandmark, FaLaptopCode } from "react-icons/fa6";
import { RevealOnScroll, StaggerGroup, StaggerItem } from "@/components/shared/RevealOnScroll";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { TiltCard } from "@/components/shared/TiltCard";
import type { CouncilMember, TimelineItem } from "@/types/content";

const TIMELINE_ICONS = [FaLandmark, FaBuildingColumns, FaLaptopCode];
// dotIcon is chosen per dotBg for contrast: white reads fine on the dark
// primary green, but fails WCAG (~2:1) on the lighter gold/bright-green
// dots, so those use the dark neutral text color instead. Headings stay on
// koura-primary throughout — gold/bright-green text on a white card also
// falls under the 4.5:1 minimum for body-sized text.
const TIMELINE_STYLES = [
  { dotBg: "bg-koura-primary", dotIcon: "text-white" },
  { dotBg: "bg-koura-secondary", dotIcon: "text-koura-text" },
  { dotBg: "bg-[#25D366]", dotIcon: "text-koura-text" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const timeline = t.raw("timeline") as TimelineItem[];
  const members = t.raw("members") as CouncilMember[];

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/hero-1.gif" alt="" fill unoptimized className="object-cover opacity-30 dark:opacity-20" />
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

      {/* Timeline */}
      <section className="relative z-20 container mx-auto px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeading title={t("historyTitle")} />

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute top-0 bottom-0 left-1/2 hidden w-1 -translate-x-1/2 rounded-full bg-gray-200 md:block dark:bg-white/10" />

          {timeline.map((item, i) => {
            const Icon = TIMELINE_ICONS[i];
            const { dotBg, dotIcon } = TIMELINE_STYLES[i];
            const alignEnd = i % 2 === 0;
            return (
              <RevealOnScroll
                key={item.title}
                y={40}
                className={`mb-16 flex flex-col items-center justify-between last:mb-0 md:flex-row ${
                  alignEnd ? "" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex w-full justify-center md:w-5/12 ${alignEnd ? "md:justify-end" : "md:justify-start"}`}>
                  <div className="rounded-3xl border border-white/50 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl transition-colors md:text-start dark:border-white/10 dark:bg-white/5">
                    <h3 className="mb-2 text-xl font-bold text-koura-primary dark:text-[#D4AF37]">{item.title}</h3>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
                <div
                  className={`z-10 my-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-lg md:my-0 dark:border-[#050505] dark:bg-[#D4AF37] dark:text-black ${dotBg} ${dotIcon}`}
                >
                  <Icon />
                </div>
                <div className="hidden w-5/12 md:block" />
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* Council */}
      <section className="relative z-20 container mx-auto px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
        <SectionHeading title={t("councilTitle")} subtitle={t("councilDesc")} />

        <StaggerGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <StaggerItem key={member.name}>
              <TiltCard max={10} className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-lg transition-colors duration-300 dark:border-white/10 dark:bg-[#111]">
                <Image
                  src={`https://ui-avatars.com/api/?name=${member.avatarSeed}&background=${member.avatarBg}&color=${member.avatarBg === "ddd" ? "333" : "fff"}&size=128`}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-koura-bg object-cover shadow-md dark:border-black"
                />
                <h3 className="text-lg font-bold text-koura-text dark:text-white">{member.name}</h3>
                <p className="mt-1 text-sm font-bold text-koura-primary dark:text-[#D4AF37]">{member.role}</p>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </div>
  );
}
