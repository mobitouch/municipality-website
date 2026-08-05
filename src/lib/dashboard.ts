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
  const baseUrl = process.env.DASHBOARD_API_URL;
  const apiKey = process.env.DASHBOARD_API_KEY;

  if (!baseUrl || !apiKey) {
    return { ok: false };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("dashboard forward rejected", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }

    const data = (await res.json().catch(() => null)) as { request?: { referenceNumber?: string } } | null;
    return { ok: true, referenceNumber: data?.request?.referenceNumber };
  } catch (error) {
    console.error("dashboard forward failed", error);
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
  const baseUrl = process.env.DASHBOARD_API_URL;
  const apiKey = process.env.DASHBOARD_API_KEY;

  if (!baseUrl || !apiKey) return null;

  try {
    const url = new URL(`${baseUrl.replace(/\/+$/, "")}/api/track`);
    url.searchParams.set("reference", reference);
    url.searchParams.set("contact", contact);

    const res = await fetch(url, {
      headers: { "x-api-key": apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as { status?: DashboardTrackingStatus } | null;
    return data?.status ?? null;
  } catch (error) {
    console.error("dashboard tracking lookup failed", error);
    return null;
  }
}
