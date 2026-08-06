"use client";

import { useMemo, useState } from "react";
import { FaArrowLeft, FaCity, FaIdCard, FaLeaf, FaMagnifyingGlass, FaStore } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { StaggerGroup, StaggerItem } from "@/components/shared/RevealOnScroll";
import { TiltCard } from "@/components/shared/TiltCard";
import type { ServiceCategory } from "@/types/content";

const ICONS = [FaCity, FaStore, FaIdCard, FaLeaf];
// Icon foreground colors are chosen for contrast, not just brand match: a
// gold-on-white or bright-green-on-white icon reads under 2.2:1 (WCAG
// requires 3:1+ for graphical objects), so those two accents use the dark
// neutral text color instead — the tinted background/border still carries
// the per-category color cue.
const ACCENTS = [
  "border-koura-primary/20 bg-koura-primary/5 text-koura-primary group-hover:bg-koura-primary group-hover:text-white dark:group-hover:text-black",
  "border-koura-secondary/20 bg-koura-secondary/5 text-koura-text group-hover:bg-koura-secondary group-hover:text-koura-text dark:text-white dark:group-hover:text-black",
  "border-koura-accent/20 bg-koura-accent/5 text-koura-primary group-hover:bg-koura-primary group-hover:text-white dark:group-hover:text-black",
  "border-[#25D366]/20 bg-[#25D366]/5 text-koura-text group-hover:bg-[#25D366] group-hover:text-koura-text dark:text-white dark:group-hover:text-black",
];
const HOVER_BORDER = [
  "hover:border-koura-primary",
  "hover:border-koura-secondary",
  "hover:border-koura-accent",
  "hover:border-[#25D366]",
];

export function ServiceCategorySearch({
  categories,
  labels,
}: {
  categories: ServiceCategory[];
  labels: { searchPh: string; searchBtn: string; searchEmpty: string; explore: string };
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
    );
  }, [categories, query]);

  return (
    <>
      <div className="group relative mx-auto max-w-3xl">
        <div className="absolute inset-0 rounded-full bg-koura-primary/20 blur-xl transition-colors duration-300 group-hover:bg-koura-primary/30 dark:bg-[#D4AF37]/20 dark:group-hover:bg-[#D4AF37]/30" />
        <div className="relative flex items-center rounded-full border border-white/50 bg-white/80 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:ring-2 focus-within:ring-koura-primary focus-within:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:focus-within:ring-[#D4AF37] dark:focus-within:ring-offset-black">
          <FaMagnifyingGlass className="ms-4 text-xl text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPh}
            className="w-full border-none bg-transparent px-4 py-3 font-medium text-koura-text placeholder-gray-500 outline-none dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="button"
            className="rounded-full bg-koura-primary px-8 py-3 font-bold text-white shadow-md transition-transform duration-300 hover:scale-105 dark:bg-[#D4AF37] dark:text-black"
          >
            {labels.searchBtn}
          </button>
        </div>
      </div>

      <section className="relative z-20 container mx-auto px-4 py-20 sm:px-6 lg:px-8 xl:px-12">
        {filtered.length === 0 ? (
          <p className="text-center font-medium text-gray-500 dark:text-gray-400">{labels.searchEmpty}</p>
        ) : (
          <StaggerGroup className="grid grid-cols-1 gap-8 [perspective:1000px] md:grid-cols-2 lg:grid-cols-4">
            {filtered.map((cat) => {
              const originalIndex = categories.indexOf(cat);
              const Icon = ICONS[originalIndex];
              return (
                <StaggerItem key={cat.title}>
                  <TiltCard
                    max={10}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-8 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-white/5 dark:shadow-2xl ${HOVER_BORDER[originalIndex]}`}
                  >
                    <div className="mb-8">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-4xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:text-white ${ACCENTS[originalIndex]}`}>
                        <Icon />
                      </div>
                    </div>
                    <Link href="/citizen-services" className="mb-4 text-2xl font-black text-koura-text transition-colors dark:text-white">
                      {cat.title}
                    </Link>
                    <p className="text-sm leading-relaxed font-medium text-gray-500 dark:text-gray-400">{cat.desc}</p>
                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-koura-primary opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 dark:text-[#D4AF37]">
                      <span>{labels.explore}</span>
                      <FaArrowLeft className="rtl:rotate-180" />
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </section>
    </>
  );
}
