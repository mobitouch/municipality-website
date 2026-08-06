"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { FaMoon, FaSun } from "react-icons/fa6";

export function ThemeToggle({ variant = "topbar" }: { variant?: "topbar" | "inline" }) {
  const t = useTranslations("ThemeToggle");
  const { resolvedTheme, setTheme } = useTheme();

  // resolvedTheme is undefined until next-themes settles the value on the
  // client, which sidesteps a hydration mismatch without extra local state.
  const isDark = resolvedTheme === "dark";

  const colorClass =
    variant === "topbar"
      ? "text-white hover:text-koura-accent dark:hover:text-[#D4AF37]"
      : "text-koura-text hover:text-koura-primary dark:text-gray-200 dark:hover:text-[#D4AF37]";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("toLight") : t("toDark")}
      className={`flex h-11 w-11 items-center justify-center transition-colors ${colorClass}`}
    >
      {resolvedTheme ? isDark ? <FaSun className="text-lg drop-shadow-md" /> : <FaMoon className="text-lg drop-shadow-md" /> : null}
    </button>
  );
}
