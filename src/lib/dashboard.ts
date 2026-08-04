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
