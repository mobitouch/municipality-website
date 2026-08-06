"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FaCircleHalfStroke,
  FaLink,
  FaMinus,
  FaPlus,
  FaUniversalAccess,
  FaWheelchair,
  FaXmark,
} from "react-icons/fa6";

const MIN_SIZE = 12;
const MAX_SIZE = 24;
const DEFAULT_SIZE = 16;
const STEP = 2;

export function AccessibilityDrawer() {
  const t = useTranslations("A11y");
  const [open, setOpen] = useState(false);
  const [textSize, setTextSize] = useState(DEFAULT_SIZE);
  const [highContrast, setHighContrast] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize =
      textSize === DEFAULT_SIZE ? "" : `${textSize}px`;
  }, [textSize]);

  useEffect(() => {
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.body.classList.toggle("highlight-links", highlightLinks);
  }, [highlightLinks]);

  return (
    <div className="fixed top-1/2 right-0 z-[100] -translate-y-1/2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        className={`relative flex items-center justify-center rounded-l-xl bg-koura-primary p-3 text-white shadow-[-5px_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:pr-4 dark:bg-[#D4AF37] dark:text-black ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <FaWheelchair className="text-2xl" />
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%", y: "-50%", opacity: 0 }}
            animate={{ x: 0, y: "-50%", opacity: 1 }}
            exit={{ x: "100%", y: "-50%", opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute right-0 top-1/2 max-h-[calc(100dvh-2rem)] w-80 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-l-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/90"
          >
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-xl font-black text-koura-text dark:text-white">
                <FaUniversalAccess className="text-koura-primary dark:text-[#D4AF37]" />
                {t("title")}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <span className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t("textSize")}
                </span>
                <div className="flex items-center gap-2 rounded-xl bg-gray-100 p-1 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setTextSize((s) => Math.min(MAX_SIZE, s + STEP))}
                    aria-label={t("increase")}
                    className="flex h-11 flex-1 items-center justify-center rounded-lg font-bold text-koura-text transition-colors hover:bg-white dark:text-white dark:hover:bg-white/10"
                  >
                    <FaPlus />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSize(DEFAULT_SIZE)}
                    className="flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-bold text-koura-text transition-colors hover:bg-white dark:text-white dark:hover:bg-white/10"
                  >
                    {t("default")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextSize((s) => Math.max(MIN_SIZE, s - STEP))}
                    aria-label={t("decrease")}
                    className="flex h-11 flex-1 items-center justify-center rounded-lg font-bold text-koura-text transition-colors hover:bg-white dark:text-white dark:hover:bg-white/10"
                  >
                    <FaMinus />
                  </button>
                </div>
              </div>

              <ToggleRow
                icon={<FaCircleHalfStroke />}
                iconWrapClass="bg-black text-yellow-400 border border-white/20"
                label={t("contrast")}
                checked={highContrast}
                onChange={setHighContrast}
              />
              <ToggleRow
                icon={<FaLink />}
                iconWrapClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                label={t("links")}
                checked={highlightLinks}
                onChange={setHighlightLinks}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleRow({
  icon,
  iconWrapClass,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  iconWrapClass: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="-mx-2 flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
      <span className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}>
          {icon}
        </span>
        {label}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="peer h-6 w-11 rounded-full bg-gray-300 transition-all peer-checked:bg-koura-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-koura-primary after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full dark:bg-gray-700 dark:peer-checked:bg-[#D4AF37]" />
      </span>
    </label>
  );
}
