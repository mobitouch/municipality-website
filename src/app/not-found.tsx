import Link from "next/link";
import "./globals.css";

/**
 * Rendered only when the [locale] segment itself doesn't match a supported
 * locale (e.g. /xx/...), which happens before the locale layout — and
 * therefore next-intl's translations — are available. Kept static and
 * trilingual rather than picking one language arbitrarily.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-koura-bg px-4 text-center font-sans text-koura-text dark:bg-[#050505] dark:text-white">
        <p className="text-7xl font-black text-koura-primary dark:text-[#D4AF37]">404</p>
        <div className="space-y-1">
          <p className="text-lg font-bold">الصفحة غير موجودة</p>
          <p className="text-lg font-bold">Page not found</p>
          <p className="text-lg font-bold">Page introuvable</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/ar" className="rounded-xl bg-koura-primary px-6 py-2 font-bold text-white dark:bg-[#D4AF37] dark:text-black">
            العربية
          </Link>
          <Link href="/en" className="rounded-xl border-2 border-koura-primary px-6 py-2 font-bold text-koura-primary dark:border-[#D4AF37] dark:text-[#D4AF37]">
            English
          </Link>
          <Link href="/fr" className="rounded-xl border-2 border-koura-primary px-6 py-2 font-bold text-koura-primary dark:border-[#D4AF37] dark:text-[#D4AF37]">
            Français
          </Link>
        </div>
      </body>
    </html>
  );
}
