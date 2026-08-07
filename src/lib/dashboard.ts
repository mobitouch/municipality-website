export interface DashboardRequestPayload {
  citizenName: string;
  phone?: string;
  category: string;
  location?: string;
  description: string;
  priority?: "Low" | "Normal" | "High" | "Urgent";
  source: "website";
}

export interface DashboardForwardResult {
  ok: boolean;
  referenceNumber?: string;
}

export interface DashboardTrackingEvent {
  action: string;
  detail: string;
  timestamp: string;
}

export interface DashboardTrackingStatus {
  referenceNumber: string;
  kind: "request" | "complaint";
  category: string;
  departmentName: string | null;
  status: string;
  priority: string;
  dateSubmitted: string;
  updatedAt: string;
  resolvedAt: string | null;
  timeline: DashboardTrackingEvent[];
}

const TIMEOUT_MS = 6_000;
/** Cap on a dashboard response we'll buffer, so a runaway peer can't OOM us. */
const MAX_RESPONSE_BYTES = 256 * 1024;

/**
 * Circuit breaker for the dashboard.
 *
 * When the dashboard is down, every submission used to sit through the full
 * timeout before falling back to email. Under load that turns one dead
 * dependency into a queue of stalled requests holding concurrency slots — the
 * failure mode behind the "couldn't submit" errors during a CPU spike. After
 * a run of failures we stop calling it for a cooldown and fail instantly, so
 * the email channel takes over without the wait.
 */
const FAILURE_THRESHOLD = 3;
const COOLDOWN_MS = 60_000;

let consecutiveFailures = 0;
let openUntil = 0;

function circuitOpen(): boolean {
  if (Date.now() < openUntil) return true;
  if (openUntil !== 0) {
    // Cooldown elapsed — allow one probe through.
    openUntil = 0;
    consecutiveFailures = 0;
  }
  return false;
}

function recordFailure() {
  consecutiveFailures += 1;
  if (consecutiveFailures >= FAILURE_THRESHOLD) {
    openUntil = Date.now() + COOLDOWN_MS;
  }
}

function recordSuccess() {
  consecutiveFailures = 0;
  openUntil = 0;
}

function getConfig(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = process.env.DASHBOARD_API_URL;
  const apiKey = process.env.DASHBOARD_API_KEY;
  if (!baseUrl || !apiKey) return null;

  // The dashboard holds citizens' personal details; refuse to ship them, or
  // the shared secret, over plaintext HTTP. Localhost is exempt so the two
  // apps can be developed side by side.
  try {
    const url = new URL(baseUrl);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !isLocal) {
      console.error("DASHBOARD_API_URL must use https");
      return null;
    }
  } catch {
    console.error("DASHBOARD_API_URL is not a valid URL");
    return null;
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function readJson(res: Response): Promise<unknown> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) return null;

  const text = await res.text().catch(() => "");
  if (text.length > MAX_RESPONSE_BYTES) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Forwards a form submission to the staff dashboard's own /api/requests
 * endpoint (a separate Next.js app) so it shows up live for municipal staff.
 * Server-to-server only — never called from the browser, so the shared
 * secret never leaves this server and there's no CORS concern.
 *
 * No-ops (returns { ok: false }) if DASHBOARD_API_URL/DASHBOARD_API_KEY
 * aren't set, and never throws — this is a best-effort second delivery
 * channel alongside email, not a hard dependency.
 */
export async function forwardToDashboard(
  payload: DashboardRequestPayload,
): Promise<DashboardForwardResult> {
  const config = getConfig();
  if (!config) return { ok: false };
  if (circuitOpen()) return { ok: false };

  try {
    const res = await fetch(`${config.baseUrl}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      redirect: "error",
    });

    if (!res.ok) {
      // Status only — the body can echo back the citizen's submission, and
      // logs on shared hosting aren't a place for personal data.
      console.error("dashboard forward rejected", res.status);
      recordFailure();
      return { ok: false };
    }

    recordSuccess();
    const data = (await readJson(res)) as { request?: { referenceNumber?: string } } | null;
    const reference = data?.request?.referenceNumber;
    return {
      ok: true,
      referenceNumber: typeof reference === "string" ? reference : undefined,
    };
  } catch (error) {
    console.error("dashboard forward failed", error instanceof Error ? error.message : error);
    recordFailure();
    return { ok: false };
  }
}

/**
 * Looks up a citizen's complaint/request status on the dashboard by
 * reference number + the phone or email on file. Returns null both when
 * the dashboard integration isn't configured and when the dashboard says
 * "not found" — callers can't distinguish those, which is fine since both
 * cases should just tell the citizen the tracker is unavailable/no match.
 */
export async function lookupTrackingStatus(
  reference: string,
  contact: string,
): Promise<DashboardTrackingStatus | null> {
  const config = getConfig();
  if (!config) return null;
  if (circuitOpen()) return null;

  try {
    const url = new URL(`${config.baseUrl}/api/track`);
    url.searchParams.set("reference", reference);
    url.searchParams.set("contact", contact);

    const res = await fetch(url, {
      headers: { "x-api-key": config.apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      redirect: "error",
    });

    // A 404 is a normal answer, not a dependency failure — it must not count
    // toward tripping the breaker.
    if (res.status === 404) {
      recordSuccess();
      return null;
    }

    if (!res.ok) {
      recordFailure();
      return null;
    }

    recordSuccess();
    const data = (await readJson(res)) as { status?: DashboardTrackingStatus } | null;
    return data?.status ?? null;
  } catch (error) {
    console.error("dashboard tracking lookup failed", error instanceof Error ? error.message : error);
    recordFailure();
    return null;
  }
}
