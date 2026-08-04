import { NextRequest, NextResponse } from "next/server";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_TOTAL_FILES_SIZE,
  reportIssueSchema,
  type ReportIssueType,
} from "@/lib/validation";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/escapeHtml";
import { forwardToDashboard } from "@/lib/dashboard";

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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`report-issue:${ip}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
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
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot field filled in => likely a bot. Pretend success, do nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true, trackingCode: generateTrackingCode() });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  let totalSize = 0;
  for (const file of files) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "file_type" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }
    totalSize += file.size;
  }
  if (totalSize > MAX_TOTAL_FILES_SIZE) {
    return NextResponse.json({ error: "file_too_large" }, { status: 400 });
  }

  const { name, phone, type, description, lat, lng } = parsed.data;
  const locationLine = lat !== undefined && lng !== undefined ? `${lat}, ${lng}` : "-";
  const attachmentNote =
    files.length > 0
      ? `\n\n📎 ${files.length} file(s) attached — sent to the municipality inbox by email.`
      : "";

  // Two independent delivery channels: the staff dashboard (primary — shows
  // up live for municipal staff, with the real location pin) and email
  // (secondary/best-effort, and the only channel that carries the photo
  // attachments — the dashboard's data model doesn't support file uploads).
  const dashboardResult = await forwardToDashboard({
    citizenName: name,
    phone,
    category: DASHBOARD_CATEGORY[type],
    location: lat !== undefined && lng !== undefined ? `${lat}, ${lng}` : "",
    description: description + attachmentNote,
    source: "website",
  });

  const trackingCode = dashboardResult.referenceNumber ?? generateTrackingCode();

  let emailOk = false;
  if (isMailConfigured()) {
    try {
      const attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
        })),
      );

      await sendMail({
        subject: `New complaint (${type}) — ${trackingCode}`,
        text: `Name: ${name}\nPhone: ${phone}\nType: ${type}\nLocation: ${locationLine}\nTracking: ${trackingCode}\n\n${description}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Phone:</strong> ${escapeHtml(phone)}</p><p><strong>Type:</strong> ${escapeHtml(type)}</p><p><strong>Location:</strong> ${escapeHtml(locationLine)}</p><p><strong>Tracking code:</strong> ${trackingCode}</p><p>${escapeHtml(description).replace(/\n/g, "<br/>")}</p>`,
        attachments,
      });
      emailOk = true;
    } catch (error) {
      console.error("report-issue mail send failed", error);
    }
  }

  if (dashboardResult.ok || emailOk) {
    return NextResponse.json({ ok: true, trackingCode });
  }

  return NextResponse.json({ error: "mail_not_configured" }, { status: 503 });
}
