"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = ["/images/hero-1.gif", "/images/hero-2.jpg", "/images/hero-3.jpg"];

/**
 * Each slide is shown long enough to actually be looked at. At the previous
 * 2000ms the 1000ms crossfade meant the hero was mid-transition half the time —
 * visually restless, and a continuous compositing cost on mobile.
 */
const SLIDE_MS = 6000;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let id: ReturnType<typeof setInterval> | undefined;

    // Re-evaluated on change, not just at mount, so turning the OS setting on
    // stops the rotation immediately instead of at the next reload.
    const sync = () => {
      clearInterval(id);
      if (motion.matches) return;
      id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    };

    sync();
    motion.addEventListener("change", sync);
    return () => {
      clearInterval(id);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          // No `unoptimized` escape hatch for the .gif: that flag exists to
          // preserve animation, and hero-1.gif is a single-frame image. Leaving
          // it on shipped the raw 170KB file as the LCP element instead of a
          // ~20KB responsive WebP.
          sizes="100vw"
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 0.9 : 0 }}
        />
      ))}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/35 to-black/75" />
    </div>
  );
}
