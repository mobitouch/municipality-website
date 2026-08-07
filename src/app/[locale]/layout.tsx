import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { AccessibilityDrawer } from "@/components/shared/AccessibilityDrawer";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/siteUrl";
import "../globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf7" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: isAr ? "%s | بلدية أميون" : "%s | Amioun Municipality",
      default: isAr
        ? "بلدية أميون | Amioun Municipality"
        : "Amioun Municipality",
    },
    description: isAr
      ? "البوابة الرقمية الرسمية لبلدية أميون: خدمات المواطنين، المشاريع، الأخبار، وتقديم الشكاوى إلكترونياً."
      : "The official digital portal of Amioun Municipality: citizen services, projects, news, and online complaints.",
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
        fr: "/fr",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={tajawal.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-koura-bg font-sans text-koura-text antialiased transition-colors duration-300 selection:bg-koura-primary selection:text-white dark:bg-[#050505] dark:text-white">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
            <AccessibilityDrawer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
