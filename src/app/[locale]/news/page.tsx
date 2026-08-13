import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaRegCalendar, FaRegClock } from "react-icons/fa6";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import type { NewsArticle } from "@/types/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "News" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("News");
  const featured = t.raw("featured") as NewsArticle;
  const items = t.raw("items") as NewsArticle[];
  const dateFormatter = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="pb-24">
      <section className="border-b border-gray-200 px-4 pt-32 pb-16 sm:px-6 lg:px-8 xl:px-12 dark:border-white/10">
        <RevealOnScroll once className="container mx-auto text-center">
          <h1 className="mb-6 text-4xl font-black text-koura-primary md:text-6xl dark:text-[#D4AF37]">{t("title")}</h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
        </RevealOnScroll>
      </section>

      <section className="relative z-20 container mx-auto mt-16 px-4 sm:px-6 lg:px-8 xl:px-12">
        <RevealOnScroll once className="group mb-16 flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-colors duration-300 lg:flex-row dark:border-white/10 dark:bg-white/5">
          <div className="relative h-64 w-full overflow-hidden lg:h-auto lg:w-1/2">
            <Image
              src={featured.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-6 end-6 rounded-full bg-koura-primary px-4 py-2 text-sm font-bold text-white shadow-lg dark:bg-[#D4AF37] dark:text-black">
              {t("featuredBadge")}
            </div>
          </div>
          <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-12">
            <div className="mb-4 flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <FaRegCalendar /> <span dir="ltr">{dateFormatter.format(new Date(featured.date))}</span>
              </span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1">
                <FaRegClock /> <span>{t("readTime", { minutes: featured.readMinutes ?? 3 })}</span>
              </span>
            </div>
            <h2 className="mb-4 text-3xl font-black text-koura-text lg:text-4xl dark:text-white">{featured.title}</h2>
            <p className="mb-8 leading-relaxed font-medium text-gray-600 dark:text-gray-400">{featured.desc}</p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 0.08} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-grow flex-col p-6">
                <div className="mb-3 text-xs font-bold text-koura-primary dark:text-[#D4AF37]">{item.category}</div>
                <h3 className="mb-3 text-xl font-bold text-koura-text transition-colors group-hover:text-koura-primary dark:text-white dark:group-hover:text-[#D4AF37]">
                  {item.title}
                </h3>
                <p className="mb-6 flex-grow text-sm font-medium text-gray-500 dark:text-gray-400">{item.desc}</p>
                <div className="mt-auto flex items-center border-t border-gray-100 pt-4 dark:border-white/10">
                  <span className="text-xs font-medium text-gray-400" dir="ltr">
                    {dateFormatter.format(new Date(item.date))}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
