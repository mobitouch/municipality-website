import { NextRequest } from "next/server";
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
  MAX_REQUEST_BODY_SIZE,
  MAX_TOTAL_FILES_SIZE,
  isServiceableLocation,
  reportIssueSchema,
  type ReportIssueType,
} from "@/lib/validation";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/escapeHtml";
import { forwardToDashboard } from "@/lib/dashboard";
import { guardRequest, isGuardFailure, json } from "@/lib/apiGuards";
import { submissionGate } from "@/lib/concurrency";
import {
  SNIFF_BYTES,
  isAllowedType,
  matchesDeclaredType,
  safeAttachmentName,
} from "@/lib/fileGuards";

// Handles multipart uploads and talks to SMTP — needs the Node runtime, and
// must never be prerendered or cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function generateTrackingCode() {
  return `AM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
}

// Maps the website's complaint type to a category the dashboard recognizes
// (dashboard/lib/constants.ts CATEGORIES) so it lands with the right
// suggested department and shows up in the right filter.
const DASHBOARD_CATEGORY: Record<ReportIssueType, string> = {
  roads: "Roads & Potholes",
  lighting: "Street Lighting",
  health: "Health & Environment",
  other: "General Inquiry",
};

export async function POST(request: NextRequest) {
  // Same-origin, body-size and rate-limit checks, all before a byte of the
  // body is read. Ordering matters: parsing a 15MB multipart body only to
  // then reject it is exactly the work we're trying to avoid.
  const guard = guardRequest(request, "report-issue", MAX_REQUEST_BODY_SIZE);
  if (isGuardFailure(guard)) return guard.response;
  const { headers } = guard;

  // Admission control. Everything past this point is CPU-bound on the single
  // event loop, so we cap how much of it runs at once and shed the rest.
  const release = await submissionGate.acquire();
  if (!release) {
    return json({ error: "busy" }, { status: 503, headers: { ...headers, "Retry-After": "30" } });
  }

  try {
    return await handleSubmission(request, headers);
  } catch (error) {
    console.error("report-issue failed", error);
    return json({ error: "server_error" }, { status: 500, headers });
  } finally {
    release();
  }
}

async function handleSubmission(request: NextRequest, headers: Record<string, string>) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return json({ error: "invalid" }, { status: 400, headers });
  }

  const parsed = reportIssueSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    type: formData.get("type") ?? "",
    description: formData.get("description") ?? "",
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
    company: formData.get("company") || "",
  });

  if (!parsed.success) {
    return json({ error: "invalid" }, { status: 400, headers });
  }

  // Honeypot field filled in => likely a bot. Pretend success, do nothing.
  if (parsed.data.company) {
    return json({ ok: true, trackingCode: generateTrackingCode() }, { headers });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > MAX_FILE_COUNT) {
    return json({ error: "too_many_files" }, { status: 400, headers });
  }

  let totalSize = 0;
  for (const file of files) {
    if (!isAllowedType(file.type)) {
      return json({ error: "file_type" }, { status: 400, headers });
    }
    if (file.size > MAX_FILE_SIZE) {
      return json({ error: "file_too_large" }, { status: 400, headers });
    }
    totalSize += file.size;
  }
  if (totalSize > MAX_TOTAL_FILES_SIZE) {
    return json({ error: "file_too_large" }, { status: 400, headers });
  }

  // Verify each file really is what its Content-Type claims. Reading only the
  // first few bytes keeps this cheap; the full buffer is materialised later,
  // and only if we're actually going to send it.
  for (const file of files) {
    const head = new Uint8Array(await file.slice(0, SNIFF_BYTES).arrayBuffer());
    if (!matchesDeclaredType(head, file.type)) {
      return json({ error: "file_type" }, { status: 400, headers });
    }
  }

  const { name, phone, type, description, lat, lng } = parsed.data;

  const hasLocation =
    lat !== undefined && lng !== undefined && isServiceableLocation(lat, lng);
  // Round to ~1m. The full float precision the browser sends is noise, and
  // trimming it keeps a citizen's exact coordinates out of the record.
  const locationLine = hasLocation ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "-";
  const attachmentNote =
    files.length > 0
      ? `\n\n📎 ${files.length} file(s) attached — sent to the municipality inbox by email.`
      : "";

  // Two independent delivery channels: the staff dashboard (primary — shows
  // up live for municipal staff, with the real location pin) and email
  // (secondary/best-effort, and the only channel that carries the photo
  // attachments — the dashboard's data model doesn't support file uploads).
  // Sent verbatim. Spreadsheet formula injection is handled where the data is
  // actually serialised into a spreadsheet — the dashboard's CSV export
  // (dashboard/lib/format.ts) — rather than here, so the stored value stays
  // exactly what the citizen wrote and displays cleanly in the staff UI.
  const dashboardResult = await forwardToDashboard({
    citizenName: name,
    phone,
    category: DASHBOARD_CATEGORY[type],
    location: hasLocation ? locationLine : "",
    description: description + attachmentNote,
    source: "website",
  });

  const trackingCode = dashboardResult.referenceNumber ?? generateTrackingCode();

  let emailOk = false;
  if (isMailConfigured()) {
    try {
      // Buffered one at a time rather than with Promise.all: concurrent
      // arrayBuffer() calls would hold every attachment in memory at once,
      // and the SMTP send that follows is serial anyway.
      const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
      for (const [index, file] of files.entries()) {
        attachments.push({
          filename: safeAttachmentName(file.name, file.type, index),
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
        });
      }

      await sendMail({
        subject: `New complaint (${type}) — ${trackingCode}`,
        text: `Name: ${name}\nPhone: ${phone}\nType: ${type}\nLocation: ${locationLine}\nTracking: ${trackingCode}\n\n${description}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Type:</strong> ${escapeHtml(type)}</p><p><strong>Location:</strong> ${escapeHtml(locationLine)}</p><p><strong>Tracking code:</strong> ${escapeHtml(trackingCode)}</p><p>${escapeHtml(description).replace(/\n/g, "<br/>")}</p>`,
        attachments,
      });
      emailOk = true;
    } catch (error) {
      console.error("report-issue mail send failed", error);
    }
  }

  if (dashboardResult.ok || emailOk) {
    return json({ ok: true, trackingCode }, { headers });
  }

  return json({ error: "mail_not_configured" }, { status: 503, headers });
}
