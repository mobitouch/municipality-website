import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/siteUrl";

const ROUTES = [
  "",
  "/about",
  "/contact",
  "/projects",
  "/news",
  "/citizen-services",
  "/report-issue",
  "/digital-municipality",
  "/track",
];

const BASE_URL = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${BASE_URL}/${l}${route}`]),
        ),
      },
    })),
  );
}
