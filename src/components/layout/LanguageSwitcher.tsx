"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FaChevronDown, FaGlobe } from "react-icons/fa6";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Click-controlled dropdown (not CSS group-hover): the legacy header opened this
 * menu via `group-hover`, which left a dead zone between the trigger and the
 * panel (the `mt-2` gap wasn't part of the hoverable box), so moving the mouse
 * down to the menu closed it before it could be clicked. A controlled open
 * state removes hover timing from the equation entirely and works identically
 * on touch devices.
 */
export function LanguageSwitcher({
  variant = "topbar",
  className = "",
  onSelect,
}: {
  variant?: "topbar" | "inline";
  className?: string;
  /** Lets the mobile drawer close itself once a language is picked. */
  onSelect?: () => void;
}) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectLocale(nextLocale: (typeof routing.locales)[number]) {
    setOpen(false);
    onSelect?.();
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  /**
   * Inside the mobile drawer the control is a segmented group, not a dropdown.
   * The dropdown anchors itself with `top-full`, and in the drawer the trigger
   * sits ~50px from the bottom of the screen, so all three options opened below
   * the fold — unreachable without discovering that the drawer scrolls. A
   * segmented control shows every language up front and switches in one tap,
   * with nothing that can be clipped by the drawer's scroll container.
   */
  if (variant === "inline") {
    return (
      <div
        role="group"
        aria-label={t("label")}
        className={`flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-white/5 ${className}`}
      >
        {routing.locales.map((l) => {
          const active = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => selectLocale(l)}
              // The visible text is the short code, so the accessible name
              // carries the full language name.
              aria-label={t(l)}
              aria-current={active ? "true" : undefined}
              className={`min-h-11 flex-1 rounded-lg text-sm font-bold tracking-wide transition-colors ${
                active
                  ? "bg-koura-primary text-white shadow-sm dark:bg-[#D4AF37] dark:text-black"
                  : "text-koura-text hover:bg-white dark:text-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {l.toUpperCase()}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-bold tracking-wide text-white/90 transition-colors hover:text-koura-accent dark:hover:text-[#D4AF37]"
      >
        <FaGlobe className="text-koura-accent dark:text-[#D4AF37]" />
        <span>{t(locale)}</span>
        <FaChevronDown
          className={`text-[10px] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full end-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-[0_10px_25px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-[#111] dark:shadow-[0_10px_25px_rgba(212,175,53,0.1)]"
          >
            {routing.locales.map((l) => (
              <button
                key={l}
                type="button"
                role="menuitem"
                onClick={() => selectLocale(l)}
                className="flex min-h-11 w-full items-center gap-2 px-4 text-start text-sm font-bold text-koura-text transition-colors hover:bg-koura-bg hover:text-koura-primary dark:text-white dark:hover:bg-white/5 dark:hover:text-[#D4AF37]"
              >
                <span
                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                    l === locale
                      ? "bg-koura-primary dark:bg-[#D4AF37]"
                      : "border border-gray-300 bg-transparent"
                  }`}
                />
                {t(l)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
