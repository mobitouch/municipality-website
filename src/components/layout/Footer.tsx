import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaFacebookF, FaInstagram, FaLocationDot, FaPhone, FaXTwitter } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";

const QUICK_LINKS = [
  { href: "/", key: "home" },
  { href: "/digital-municipality", key: "digital" },
  { href: "/citizen-services", key: "services" },
  { href: "/report-issue", key: "complaints" },
  { href: "/projects", key: "projects" },
  { href: "/news", key: "news" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

const SOCIAL_LINKS = [
  { href: "#", label: "Facebook", icon: FaFacebookF },
  { href: "#", label: "X", icon: FaXTwitter },
  { href: "#", label: "Instagram", icon: FaInstagram },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t-4 border-koura-primary bg-[#2C3325] pt-20 pb-10 text-white transition-colors dark:border-t dark:border-white/10 dark:bg-black">
      <div className="pointer-events-none absolute top-0 end-0 h-64 w-64 rounded-full bg-koura-primary/20 blur-[80px] dark:bg-[#D4AF37]/10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/images/logo.jpeg"
                alt={tNav("brandName")}
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl bg-white object-cover p-0.5 shadow-sm dark:border dark:border-[#D4AF37]/30 dark:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
              />
              <h2 className="text-section-title tracking-tight text-white dark:drop-shadow-[0_0_10px_rgba(212,175,53,0.3)]">
                {tNav("brandName")}
              </h2>
            </div>
            <p className="mb-8 max-w-sm border-e-2 border-koura-primary/50 pe-3 text-sm leading-relaxed font-medium text-gray-400 dark:border-[#D4AF37]/50">
              {t("desc")}
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:bg-koura-primary hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-black"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="relative mb-8 inline-block border-b border-white/10 pb-3 text-xl font-bold text-white">
              {t("linksTitle")}
              <span className="absolute bottom-0 end-0 h-0.5 w-1/2 bg-koura-primary dark:bg-[#D4AF37]" />
            </h3>
            {/* `min-h-11` gives each link a touch-sized hit area; the tighter
                `space-y` keeps the visual rhythm close to the old text-only list. */}
            <div className="grid grid-cols-2 gap-4">
              {[QUICK_LINKS.slice(0, 4), QUICK_LINKS.slice(4)].map((group, i) => (
                <ul key={i} className="space-y-1 text-sm font-bold text-gray-400">
                  {group.map(({ href, key }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex min-h-11 items-center transition-colors hover:text-koura-accent dark:hover:text-[#D4AF37]"
                      >
                        {tNav(key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h3 className="relative mb-8 inline-block border-b border-white/10 pb-3 text-xl font-bold text-white">
              {t("contactTitle")}
              <span className="absolute bottom-0 end-0 h-0.5 w-1/2 bg-koura-primary dark:bg-[#D4AF37]" />
            </h3>
            <ul className="space-y-5 text-sm font-medium text-gray-300">
              <li className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-koura-accent dark:text-[#D4AF37]">
                  <FaLocationDot />
                </div>
                <span className="mt-1 leading-relaxed">{t("address")}</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-koura-accent dark:text-[#D4AF37]">
                  <FaPhone />
                </div>
                <span dir="ltr" className="font-bold tracking-wider">{tNav("phone")}</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-koura-accent dark:text-[#D4AF37]">
                  <FaEnvelope />
                </div>
                <span dir="ltr" className="font-medium">{tNav("email")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-8 text-xs font-medium text-gray-500 md:flex-row md:gap-4">
          <p className="text-center">{t("copyright", { year })}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6">
            {[t("privacy"), t("terms"), t("accessibility")].map((label) => (
              <a
                key={label}
                href="#"
                className="flex min-h-11 items-center transition-colors hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
