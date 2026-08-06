"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FaBars,
  FaBuildingColumns,
  FaCircleExclamation,
  FaFolderOpen,
  FaHouse,
  FaLaptopCode,
  FaMagnifyingGlass,
  FaMapLocationDot,
  FaNewspaper,
  FaPhoneVolume,
  FaXmark,
} from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", key: "home", icon: FaHouse },
  { href: "/digital-municipality", key: "digital", icon: FaLaptopCode },
  { href: "/citizen-services", key: "services", icon: FaFolderOpen },
  { href: "/report-issue", key: "complaints", icon: FaCircleExclamation },
  { href: "/track", key: "track", icon: FaMagnifyingGlass },
  { href: "/projects", key: "projects", icon: FaMapLocationDot },
  { href: "/news", key: "news", icon: FaNewspaper },
  { href: "/about", key: "about", icon: FaBuildingColumns },
  { href: "/contact", key: "contact", icon: FaPhoneVolume },
] as const;

export function MobileNav() {
  const tNav = useTranslations("Nav");
  const tMenu = useTranslations("MobileNav");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tMenu("open")}
        className="rounded-lg border border-transparent p-2 text-2xl text-koura-primary transition-colors hover:border-gray-200 hover:bg-koura-bg xl:hidden dark:text-[#D4AF37] dark:hover:border-white/10 dark:hover:bg-white/5"
      >
        <FaBars />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 end-0 z-[120] flex h-full w-[300px] max-w-[85vw] flex-col justify-between overflow-y-auto border-s border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0c120c]"
            >
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-6 dark:border-white/10">
                  <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <Image
                      src="/images/logo.jpeg"
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover shadow-sm"
                    />
                    <div>
                      <h2 className="text-lg font-black text-koura-primary dark:text-white">
                        {tNav("brandName")}
                      </h2>
                      <span className="block text-[10px] font-bold tracking-widest text-koura-primary uppercase dark:text-[#D4AF37]">
                        {tNav("brandSub")}
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={tMenu("close")}
                    className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10"
                  >
                    <FaXmark className="text-xl" />
                  </button>
                </div>

                <nav className="space-y-2 text-sm font-bold">
                  {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-koura-text transition-colors hover:bg-koura-primary/10 hover:text-koura-primary dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-[#D4AF37]"
                    >
                      <Icon className="w-5 text-koura-primary dark:text-[#D4AF37]" />
                      <span>{tNav(key)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-white/10">
                <div className="flex items-center justify-center gap-4 md:hidden">
                  <ThemeToggle variant="inline" />
                  <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />
                  <LanguageSwitcher variant="inline" />
                </div>
                <div dir="ltr" className="text-center text-xs font-medium text-gray-500">
                  {tNav("phone")} | {tNav("email")}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
