"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { FaMoon, FaSun } from "react-icons/fa6";
import { useHydrated } from "@/lib/useHydrated";

export function ThemeToggle({ variant = "topbar" }: { variant?: "topbar" | "inline" }) {
  const t = useTranslations("ThemeToggle");
  const { resolvedTheme, setTheme } = useTheme();

  /**
   * `resolvedTheme` is undefined during SSR but already resolved on the very
   * first client render (next-themes reads the DOM class in a state
   * initialiser), so branching on it directly rendered a different icon and
   * aria-label than the server did. React treated that as a hydration mismatch
   * and threw away the whole client tree, which left the rest of the page —
   * the mobile menu included — inert. Gating on hydration guarantees the first
   * client render is byte-identical to the server's.
   */
  const mounted = useHydrated();

  const isDark = resolvedTheme === "dark";
  const showDarkIcon = mounted && isDark;

  const colorClass =
    variant === "topbar"
      ? "text-white hover:text-koura-accent dark:hover:text-[#D4AF37]"
      : "text-koura-text hover:text-koura-primary dark:text-gray-200 dark:hover:text-[#D4AF37]";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      // Until the theme is known the control still needs a stable, meaningful
      // name for screen readers, so fall back to the generic label.
      aria-label={mounted ? (isDark ? t("toLight") : t("toDark")) : t("label")}
      className={`flex h-11 w-11 shrink-0 items-center justify-center transition-colors ${colorClass}`}
    >
      {mounted ? (
        showDarkIcon ? (
          <FaSun className="text-lg drop-shadow-md" />
        ) : (
          <FaMoon className="text-lg drop-shadow-md" />
        )
      ) : (
        // Placeholder keeps the button the same size before the theme resolves,
        // so the header does not shift once the icon appears.
        <span className="block h-[1em] w-[1em] text-lg" aria-hidden="true" />
      )}
    </button>
  );
}
