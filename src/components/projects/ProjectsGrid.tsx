"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProjectItem, ProjectStatus } from "@/types/content";

type Filter = "all" | ProjectStatus;

export function ProjectsGrid({
  items,
  labels,
}: {
  items: ProjectItem[];
  labels: {
    filterAll: string;
    filterDone: string;
    filterProg: string;
    statusDone: string;
    statusProg: string;
    noResults: string;
  };
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((p) => p.status === filter)),
    [items, filter],
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: labels.filterAll },
    { value: "done", label: labels.filterDone },
    { value: "progress", label: labels.filterProg },
  ];

  return (
    <div>
      <div className="mb-16 flex flex-wrap justify-center gap-4">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-6 py-2 font-bold transition-colors ${
              filter === f.value
                ? "bg-koura-primary text-white shadow-lg dark:bg-[#D4AF37] dark:text-black"
                : "border border-gray-200 bg-white text-gray-600 hover:border-koura-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-[#D4AF37]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center font-medium text-gray-500 dark:text-gray-400">{labels.noResults}</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 [perspective:1000px] md:grid-cols-2 lg:grid-cols-3">
          {/* Two things keep the photo and its caption on the same rectangle:
              the aspect ratio lives on the card itself (the caption is
              positioned against the card, so an inner wrapper shorter than it
              strands the white text on blank background), and `items-start`
              above stops the grid stretching cards to the tallest one in the
              row, which would override that ratio again. */}
          {filtered.map((project, i) => (
            <motion.div
              key={project.title}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ aspectRatio: project.aspect.replace("/", " / ") }}
              className={`group relative cursor-pointer overflow-hidden rounded-3xl bg-gray-200 shadow-xl dark:bg-[#111] dark:shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${
                project.aspect === "4/5" ? "lg:mt-12" : ""
              }`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white">
                <span
                  className={`mb-3 inline-block w-max rounded-full px-3 py-1 text-xs font-black ${
                    project.status === "done" ? "bg-white text-black" : "bg-[#D4AF37] text-black"
                  }`}
                >
                  {project.status === "done" ? labels.statusDone : `${labels.statusProg} ${project.progress}%`}
                </span>
                <h3 className="mb-2 text-2xl font-black">{project.title}</h3>
                <p className="line-clamp-2 text-sm font-medium text-gray-300 transition-all duration-300 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  {project.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
