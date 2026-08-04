"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = ["/images/hero-1.gif", "/images/hero-2.jpg", "/images/hero-3.jpg"];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 2000);
    return () => clearInterval(id);
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
          unoptimized={src.endsWith(".gif")}
          sizes="100vw"
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 0.9 : 0 }}
        />
      ))}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/35 to-black/75" />
    </div>
  );
}
