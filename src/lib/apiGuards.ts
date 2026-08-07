import { NextResponse, type NextRequest } from "next/server";
import { getRateLimitKey } from "@/lib/clientIp";
import {
  RATE_LIMITS,
  checkRateLimit,
  rateLimitHeaders,
  type RateLimitScope,
} from "@/lib/rateLimit";

/**
 * Form endpoints must never be cached by the CDN, the browser, or Next's own
 * router cache — each response is specific to one submission.
 */
const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Content-Type": "application/json; charset=utf-8",
} as const;

export function json(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): NextResponse {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: { ...NO_STORE, ...init.headers },
  });
}

export type BodySizeVerdict = "ok" | "too_large" | "invalid";

/**
 * Inspects the declared body size before any of it is read.
 *
 * A missing or unparseable Content-Length counts as invalid rather than
 * allowed: every legitimate client on these forms sends one, and accepting a
 * chunked body of unknown length would defeat the point of the check.
 */
export function checkBodySize(request: NextRequest, max: number): BodySizeVerdict {
  const declared = Number(request.headers.get("content-length"));
  if (!Number.isFinite(declared) || declared <= 0) return "invalid";
  return declared <= max ? "ok" : "too_large";
}

/**
 * Blocks cross-site form posts. These endpoints are same-origin only, and the
 * browser sets `Sec-Fetch-Site` on every fetch without letting page script
 * touch it, so it is a reliable CSRF signal. Requests without the header (old
 * clients, curl) fall back to an Origin check against the request host.
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";

  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === (request.headers.get("host") ?? "");
  } catch {
    return false;
  }
}

export interface GuardFailure {
  response: NextResponse;
}

export interface GuardSuccess {
  /** Headers to merge into the eventual success response. */
  headers: Record<string, string>;
}

/**
 * The checks every form endpoint runs first, in cost order: cheap header
 * inspection before rate limiting, rate limiting before any body is read.
 * Returns a ready-made rejection, or the headers to carry onto the response.
 */
export function guardRequest(
  request: NextRequest,
  scope: RateLimitScope,
  maxBodySize: number,
): GuardFailure | GuardSuccess {
  if (!isSameOriginRequest(request)) {
    return { response: json({ error: "invalid" }, { status: 403 }) };
  }

  const bodySize = checkBodySize(request, maxBodySize);
  if (bodySize === "too_large") {
    return { response: json({ error: "too_large" }, { status: 413 }) };
  }
  if (bodySize === "invalid") {
    return { response: json({ error: "invalid" }, { status: 400 }) };
  }

  const result = checkRateLimit(getRateLimitKey(request, scope), RATE_LIMITS[scope]);
  const headers = rateLimitHeaders(result);

  if (!result.ok) {
    return { response: json({ error: "rate_limited" }, { status: 429, headers }) };
  }

  return { headers };
}

export function isGuardFailure(
  result: GuardFailure | GuardSuccess,
): result is GuardFailure {
  return "response" in result;
}
