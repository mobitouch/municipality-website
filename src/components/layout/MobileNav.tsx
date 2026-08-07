"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav() {
  const tNav = useTranslations("Nav");
  const tMenu = useTranslations("MobileNav");
  const [open, setOpen] = useState(false);
  // `document` only exists in the browser, so the portal target is unavailable
  // until hydration completes.
  const mounted = useHydrated();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  /**
   * Lock scrolling on both <html> and <body>: the layout puts `overflow-x:
   * hidden` on body, which makes body itself a scroll container on some mobile
   * browsers, so locking body alone still let the page move behind the drawer.
   * The scrollbar width is compensated with padding so desktop content does not
   * shift sideways when the drawer opens.
   */
  useEffect(() => {
    if (!open) return;

    const { documentElement: html, body } = document;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPadding: body.style.paddingInlineEnd,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingInlineEnd = `${scrollbarWidth}px`;

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.paddingInlineEnd = previous.bodyPadding;
    };
  }, [open]);

  // Escape to close, Tab cycles inside the drawer while it is modal.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  /**
   * Move focus into the drawer on open and back to the trigger on close. The
   * `wasOpen` ref keeps the close branch from firing on the initial render,
   * which would otherwise yank focus to the burger on every page load.
   */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = open;
  }, [open]);

  // `end-0` puts the panel on the right in LTR and on the left in RTL, so the
  // slide-in has to come from the matching edge.
  const isRtl = useLocale() === "ar";
  const offscreenX = isRtl ? "-100%" : "100%";

  const drawer = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={tMenu("open")}
            id={panelId}
            tabIndex={-1}
            initial={{ x: offscreenX }}
            animate={{ x: 0 }}
            exit={{ x: offscreenX }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="fixed inset-y-0 end-0 flex h-[100dvh] w-[320px] max-w-[88vw] flex-col overflow-y-auto overscroll-contain border-s border-gray-200 bg-white shadow-2xl outline-none [padding-bottom:env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-[#0c120c]"
          >
            <div className="flex min-h-full flex-col justify-between gap-8 p-5 sm:p-6">
              <div>
                <div className="mb-6 flex items-center justify-between gap-3 border-b border-gray-200 pb-5 dark:border-white/10">
                  <Link
                    href="/"
                    onClick={close}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Image
                      src="/images/logo.jpeg"
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-koura-primary dark:text-white">
                        {tNav("brandName")}
                      </h2>
                      <span className="block truncate text-[10px] font-bold tracking-widest text-koura-primary uppercase dark:text-[#D4AF37]">
                        {tNav("brandSub")}
                      </span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={tMenu("close")}
                    className="-me-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-white/10"
                  >
                    <FaXmark className="text-xl" />
                  </button>
                </div>

                <nav className="space-y-1 text-sm font-bold">
                  {NAV_ITEMS.map(({ href, key, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={close}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-koura-text transition-colors hover:bg-koura-primary/10 hover:text-koura-primary dark:text-gray-200 dark:hover:bg-white/5 dark:hover:text-[#D4AF37]"
                    >
                      <Icon className="w-5 shrink-0 text-koura-primary dark:text-[#D4AF37]" />
                      <span className="truncate">{tNav(key)}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-5 dark:border-white/10">
                <div className="flex items-center gap-2 md:hidden">
                  <ThemeToggle variant="inline" />
                  <LanguageSwitcher variant="inline" className="flex-1" onSelect={close} />
                </div>
                <div
                  dir="ltr"
                  className="text-center text-xs font-medium break-words text-gray-500"
                >
                  {tNav("phone")} | {tNav("email")}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tMenu("open")}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="-me-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-transparent text-2xl text-koura-primary transition-colors hover:border-gray-200 hover:bg-koura-bg xl:hidden dark:text-[#D4AF37] dark:hover:border-white/10 dark:hover:bg-white/5"
      >
        <FaBars />
      </button>

      {/*
        The drawer is portaled to <body> on purpose. It used to render inside
        <header>, which carries `backdrop-blur-md` — a backdrop-filter makes an
        element a containing block for `position: fixed` descendants, so the
        overlay's `inset-0` resolved to the ~80px header box instead of the
        viewport and the menu appeared as a clipped sliver.
      */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
