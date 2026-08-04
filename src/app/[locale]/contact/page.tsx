import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaEnvelope, FaLocationDot, FaPhone } from "react-icons/fa6";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { TiltCard } from "@/components/shared/TiltCard";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const tNav = await getTranslations("Nav");

  return (
    <div className="pb-24">
      <section className="px-4 pt-32 pb-16">
        <RevealOnScroll once className="container mx-auto text-center">
          <h1 className="mb-6 text-4xl font-black text-koura-primary md:text-6xl dark:text-[#D4AF37] dark:drop-shadow-[0_0_20px_rgba(212,175,53,0.4)]">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl font-medium text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
        </RevealOnScroll>
      </section>

      <section className="relative z-20 container mx-auto px-4">
        <div className="mb-16 flex flex-col gap-12 lg:flex-row">
          <RevealOnScroll y={0} className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur-xl transition-colors md:p-12 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_40px_rgba(212,175,53,0.1)]">
              <h2 className="mb-8 text-2xl font-bold text-koura-text dark:text-white">{t("formTitle")}</h2>
              <ContactForm />
            </div>
          </RevealOnScroll>

          <div className="flex w-full flex-col justify-center gap-6 lg:w-1/2">
            <RevealOnScroll delay={0.1}>
              <TiltCard max={5} className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#111]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-koura-primary/10 text-3xl text-koura-primary dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
                  <FaPhone />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-gray-500 dark:text-gray-400">{t("infoPhone")}</h3>
                  <p className="text-xl font-black text-koura-text dark:text-white" dir="ltr">{tNav("phone")}</p>
                </div>
              </TiltCard>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <TiltCard max={5} className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#111]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-koura-secondary/10 text-3xl text-koura-secondary dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
                  <FaEnvelope />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-gray-500 dark:text-gray-400">{t("infoEmail")}</h3>
                  <p className="text-xl font-black text-koura-text dark:text-white" dir="ltr">{tNav("email")}</p>
                </div>
              </TiltCard>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <TiltCard max={5} className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#111]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366]/10 text-3xl text-[#25D366] dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
                  <FaLocationDot />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-bold text-gray-500 dark:text-gray-400">{t("infoAddress")}</h3>
                  <p className="text-lg font-bold text-koura-text dark:text-white">{t("addressText")}</p>
                </div>
              </TiltCard>
            </RevealOnScroll>
          </div>
        </div>

        <RevealOnScroll className="relative h-96 overflow-hidden rounded-[3rem] border border-gray-200 bg-white/80 p-4 shadow-2xl backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
          <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-gray-200 dark:bg-[#111]">
            <iframe
              title="Amioun Municipality location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13180.207914800318!2d35.8078693!3d34.2982881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1521fc47c5040e3b%3A0xcb44de3f90b8fce0!2sAmioun!5e0!3m2!1sen!2slb!4v1700000000000!5m2!1sen!2slb"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(20%) contrast(1.2)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="dark:opacity-80 dark:invert dark:hue-rotate-180"
            />
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
