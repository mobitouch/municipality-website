"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      {/*
        The `prefers-reduced-motion` block in globals.css only neutralises CSS
        animations and transitions. Every framer-motion animation on the site —
        the mobile drawer slide, the scroll reveals, the card tilts — is driven
        by JS transforms that the media query cannot reach. `reducedMotion="user"`
        makes those respect the same OS setting, skipping transforms while
        keeping opacity fades so content still appears.
      */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
