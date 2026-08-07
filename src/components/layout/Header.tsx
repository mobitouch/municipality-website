import Image from "next/image";
import { useTranslations } from "next-intl";
import { FaEnvelope, FaPhone } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/digital-municipality", key: "digital" },
  { href: "/citizen-services", key: "services" },
  { href: "/report-issue", key: "complaints" },
  { href: "/track", key: "track" },
  { href: "/projects", key: "projects" },
  { href: "/news", key: "news" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-[#050505]/80">
      <div className="on-primary-surface hidden bg-koura-primary px-4 py-1 text-xs text-white transition-colors duration-300 sm:px-6 lg:px-8 xl:px-12 md:block">
        <div className="container mx-auto flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-6 font-medium text-white/90">
            <span className="flex items-center gap-2">
              <FaPhone />
              <span dir="ltr">{t("phone")}</span>
            </span>
            <span className="flex items-center gap-2">
              <FaEnvelope />
              <span dir="ltr">{t("email")}</span>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <div className="h-4 w-px bg-white/30" />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container mx-auto flex w-full items-center justify-between gap-3 px-4 py-1.5 sm:gap-6 sm:px-6 sm:py-2 lg:px-8 xl:px-12">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5 sm:gap-4">
          <Image
            src="/images/logo.jpeg"
            alt={t("brandName")}
            width={56}
            height={56}
            priority
            className="h-11 w-11 shrink-0 rounded-full border border-gray-100 object-cover shadow-sm transition-shadow sm:h-14 sm:w-14 dark:border-[#D4AF37]/30 dark:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
          />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-tight text-koura-primary sm:text-xl lg:text-2xl dark:text-white">
              {t("brandName")}
            </h1>
            <span className="mt-0.5 block truncate text-[9px] font-bold tracking-widest text-koura-primary uppercase sm:text-[11px] dark:text-[#D4AF37]">
              {t("brandSub")}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-[14px] font-bold tracking-wide text-koura-text xl:flex dark:text-gray-300">
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-koura-primary dark:hover:text-[#D4AF37]"
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
