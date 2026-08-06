"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { FaMoon, FaSun } from "react-icons/fa6";

export function ThemeToggle() {
  const t = useTranslations("ThemeToggle");
  const { resolvedTheme, setTheme } = useTheme();

  // resolvedTheme is undefined until next-themes settles the value on the
  // client, which sidesteps a hydration mismatch without extra local state.
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("toLight") : t("toDark")}
      className="flex h-11 w-11 items-center justify-center text-white transition-colors hover:text-koura-accent dark:hover:text-[#D4AF37]"
    >
      {resolvedTheme ? isDark ? <FaSun className="text-lg drop-shadow-md" /> : <FaMoon className="text-lg drop-shadow-md" /> : null}
    </button>
  );
}
