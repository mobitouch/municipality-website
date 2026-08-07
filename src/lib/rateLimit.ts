export interface RateLimitRule {
  /** Sliding window length in milliseconds. */
  windowMs: number;
  /** Requests allowed per key per window. */
  max: number;
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the window resets. Only meaningful when `ok` is false. */
  retryAfter: number;
}

/**
 * Per-route limits. The complaint form is the expensive one — it parses
 * multipart bodies and base64-encodes attachments for SMTP — so it gets the
 * tightest allowance. Tracking is a cheap read, but is also the endpoint an
 * attacker would use to enumerate reference numbers, so it stays capped.
 */
export const RATE_LIMITS = {
  "report-issue": { windowMs: 10 * 60_000, max: 3 },
  contact: { windowMs: 10 * 60_000, max: 5 },
  track: { windowMs: 60_000, max: 12 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitScope = keyof typeof RATE_LIMITS;

/**
 * Hard ceiling on tracked keys. Without one, the map was an unbounded
 * attacker-controlled allocation: every distinct spoofed IP added an entry
 * that was never removed, so memory grew until the process was OOM-killed.
 */
const MAX_KEYS = 20_000;
const SWEEP_INTERVAL_MS = 60_000;

interface Entry {
  count: number;
  resetAt: number;
}

const hits = new Map<string, Entry>();
let lastSweep = Date.now();

function sweep(now: number) {
  lastSweep = now;
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }

  // Still over budget after dropping expired windows (a burst of distinct
  // live keys). Map iterates in insertion order, so this evicts the oldest.
  if (hits.size > MAX_KEYS) {
    const excess = hits.size - MAX_KEYS;
    let removed = 0;
    for (const key of hits.keys()) {
      hits.delete(key);
      if (++removed >= excess) break;
    }
  }
}

/**
 * Fixed-window rate limit held in this process's memory.
 *
 * Deliberately not backed by Redis: the site runs as a single Node process on
 * shared hosting, so a local map is accurate here and adds no network hop on
 * the hot path. If the app is ever scaled to multiple instances this becomes
 * per-instance and the effective limit multiplies by the instance count —
 * swap the map for a shared store at that point.
 */
export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = Date.now();
  if (now - lastSweep > SWEEP_INTERVAL_MS || hits.size > MAX_KEYS) sweep(now);

  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { ok: true, limit: rule.max, remaining: rule.max - 1, retryAfter: 0 };
  }

  if (entry.count >= rule.max) {
    return {
      ok: false,
      limit: rule.max,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { ok: true, limit: rule.max, remaining: rule.max - entry.count, retryAfter: 0 };
}

/** Standard rate-limit headers, attached to every response from a limited route. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
  };
  if (!result.ok) headers["Retry-After"] = String(result.retryAfter);
  return headers;
}
