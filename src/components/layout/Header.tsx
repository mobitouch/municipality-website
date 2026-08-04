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
  { href: "/projects", key: "projects" },
  { href: "/news", key: "news" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-white/10 dark:bg-[#050505]/80">
      <div className="hidden bg-koura-primary px-4 py-2 text-xs text-white transition-colors duration-300 md:block">
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

      <div className="container mx-auto flex w-full items-center justify-between gap-6 px-4 py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-4">
          <Image
            src="/images/logo.jpeg"
            alt={t("brandName")}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full border border-gray-100 object-cover shadow-sm transition-shadow dark:border-[#D4AF37]/30 dark:shadow-[0_0_15px_rgba(212,175,53,0.3)]"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-koura-primary dark:text-white">
              {t("brandName")}
            </h1>
            <span className="mt-0.5 block text-[11px] font-bold tracking-widest text-koura-secondary uppercase dark:text-[#D4AF37]">
              {t("brandSub")}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-[14px] font-bold tracking-wide text-koura-text lg:flex dark:text-gray-300">
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
