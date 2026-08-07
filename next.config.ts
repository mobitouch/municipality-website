import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * `script-src` keeps `'unsafe-inline'` rather than moving to a per-request
 * nonce. A nonce has to be generated in middleware and threaded through the
 * response, which forces every page out of static rendering and onto the
 * server — the opposite of what this app needs on a shared CPU-capped plan.
 * The directives that block the highest-impact attacks (`object-src`,
 * `base-uri`, `form-action`, `frame-ancestors`) are still strict, and there
 * is no user-generated HTML rendered anywhere on the site.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind and framer-motion both write inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // OpenStreetMap serves the map tiles; unpkg serves Leaflet's marker icons;
  // the other two are the remote sources allowed in `images` below.
  "img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com https://images.unsplash.com https://ui-avatars.com",
  // next/font self-hosts the Tajawal files at build time, so no font CDN.
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    // The map picker works by clicking the map, not by reading device
    // location, so every powerful feature can be switched off.
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/api/**" },
    ],

    // Every distinct (width, quality) pair is a separate sharp re-encode, and
    // `/_next/image` is reachable by anyone. Left at the defaults that is 15
    // widths x unlimited qualities per source image — enough permutations for
    // a single client to keep the CPU pinned. Narrowing both to the sizes the
    // layouts actually request caps the total work the endpoint can be made
    // to do, and a long cache TTL means each one is computed about once.
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
    qualities: [75],
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400, // 31 days
    maximumDiskCacheSize: 300_000_000,

    // Source images on this site are photos well under 8MB; a lower ceiling
    // protects a memory-constrained container from a large upstream fetch.
    maximumResponseBody: 8_000_000,
    // Redirects from an allowed host are followed without re-checking
    // remotePatterns, so an open redirect upstream would become an SSRF.
    maximumRedirects: 0,
    dangerouslyAllowSVG: false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Form endpoints are per-submission and must never be stored by a
        // browser or an intermediary cache.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // Next already serves /_next/static as immutable; only the files in
        // public/ need a cache policy set here. A day of freshness with a
        // week of stale-while-revalidate keeps repeat visitors — and the
        // ~1MB of hero imagery — off the server.
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
