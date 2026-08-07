import type { NextRequest } from "next/server";

/**
 * Number of reverse proxies that sit in front of this app and *append* to
 * `x-forwarded-for`. On Hostinger's Node.js hosting that is 1 (their edge
 * proxy). Behind an extra CDN (Cloudflare et al.) it becomes 2.
 */
const TRUSTED_PROXY_HOPS = (() => {
  const raw = Number(process.env.TRUSTED_PROXY_HOPS);
  return Number.isInteger(raw) && raw >= 0 && raw <= 8 ? raw : 1;
})();

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

function isIpish(value: string): boolean {
  if (!value || value.length > 45) return false;
  if (IPV4.test(value)) return value.split(".").every((o) => Number(o) <= 255);
  // Loose IPv6 check — hex groups and colons only. We never resolve or
  // connect to this value, we only use it as a rate-limit bucket key, so a
  // shape check is enough to keep junk out of the key space.
  return /^[0-9a-fA-F:.]+$/.test(value) && value.includes(":");
}

/**
 * Resolves the client IP to use as a rate-limit bucket.
 *
 * `x-forwarded-for` is a client-writable header: anything the browser sends
 * arrives *before* what the proxies append. Reading `parts[0]` — the previous
 * behaviour — meant any attacker could rotate a fake leftmost IP per request
 * and bypass rate limiting entirely. We instead count in from the right,
 * skipping the hops we actually trust, so the value is one a trusted proxy
 * wrote.
 *
 * Returns `null` when no trustworthy value is available; callers should treat
 * that as its own (shared, stricter) bucket rather than as a free pass.
 */
export function getClientIp(request: NextRequest): string | null {
  const override = process.env.CLIENT_IP_HEADER;
  if (override) {
    const value = request.headers.get(override)?.trim();
    return value && isIpish(value) ? value : null;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      // Strip an IPv6 bracket/port form like "[::1]:1234" and IPv4 ":port".
      .map((p) => p.replace(/^\[(.+)\]:\d+$/, "$1").replace(/^(\d[\d.]+):\d+$/, "$1"))
      .filter(Boolean);

    const index = parts.length - TRUSTED_PROXY_HOPS;
    const candidate = parts[index] ?? parts[parts.length - 1];
    if (candidate && isIpish(candidate)) return candidate;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isIpish(realIp)) return realIp;

  return null;
}

/**
 * Bucket key for rate limiting. Requests we can't attribute to an IP all
 * share one bucket named `unknown`, which is deliberately restrictive: an
 * anonymising client gets the same allowance as everyone else anonymising.
 */
export function getRateLimitKey(request: NextRequest, scope: string): string {
  return `${scope}:${getClientIp(request) ?? "unknown"}`;
}
