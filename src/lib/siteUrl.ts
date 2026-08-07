/**
 * Canonical public origin of this site.
 *
 * The domain used to be hardcoded separately in the sitemap, robots.txt and
 * the layout's `metadataBase`. Deploying anywhere other than amioun.gov.lb —
 * the Hostinger preview domain, a staging host — silently published canonical
 * links, hreflang alternates, sitemap entries and Open Graph image URLs all
 * pointing at a site that wasn't the one being served, which search engines act
 * on. Setting `NEXT_PUBLIC_SITE_URL` at build time keeps all three in step.
 *
 * Falls back to the production domain so an unset variable still yields the
 * correct result for the real deployment.
 */
const FALLBACK = "https://amioun.gov.lb";

function resolve(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return FALLBACK;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return FALLBACK;
    // Normalise to a bare origin: callers append their own paths.
    return url.origin;
  } catch {
    return FALLBACK;
  }
}

export const SITE_URL = resolve();
