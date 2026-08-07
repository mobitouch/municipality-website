import { NextRequest } from "next/server";
import { MAX_JSON_BODY_SIZE, contactSchema } from "@/lib/validation";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/escapeHtml";
import { forwardToDashboard } from "@/lib/dashboard";
import { guardRequest, isGuardFailure, json } from "@/lib/apiGuards";
import { submissionGate } from "@/lib/concurrency";
import { isEmailAddress } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

export async function POST(request: NextRequest) {
  const guard = guardRequest(request, "contact", MAX_JSON_BODY_SIZE);
  if (isGuardFailure(guard)) return guard.response;
  const { headers } = guard;

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "invalid" }, { status: 400, headers });
  }

  // Honeypot field filled in => likely a bot. Pretend success, do nothing —
  // before taking a concurrency slot, so bot traffic can't crowd out real
  // submissions.
  if (parsed.data.company) {
    return json({ ok: true }, { headers });
  }

  // Shares the submission gate with the complaint form: both end in an
  // outbound SMTP send, and the point is to cap total outbound work.
  const release = await submissionGate.acquire();
  if (!release) {
    return json({ error: "busy" }, { status: 503, headers: { ...headers, "Retry-After": "30" } });
  }

  try {
    const { name, contact, message } = parsed.data;
    const isEmail = isEmailAddress(contact);

    // Two independent delivery channels: the staff dashboard (primary — shows
    // up live for municipal staff) and email (secondary/best-effort). Success
    // if either works; only error out if both do. Values go verbatim —
    // spreadsheet formula injection is handled at the point of serialisation,
    // in the dashboard's CSV export.
    const dashboardResult = await forwardToDashboard({
      citizenName: name,
      phone: isEmail ? "" : contact,
      category: "General Inquiry",
      description: `Contact info provided: ${contact}\n\n${message}`,
      source: "website",
    });

    let emailOk = false;
    if (isMailConfigured()) {
      try {
        await sendMail({
          subject: `New contact form message from ${name}`,
          // Only ever reply-to a value that validated as an email address.
          // This lands in a mail header, so free text here would be a header
          // injection vector.
          replyTo: isEmail ? contact : undefined,
          text: `Name: ${name}\nContact: ${contact}\n\n${message}`,
          html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Contact:</strong> ${escapeHtml(contact)}</p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
        });
        emailOk = true;
      } catch (error) {
        console.error("contact mail send failed", error);
      }
    }

    if (dashboardResult.ok || emailOk) {
      return json({ ok: true }, { headers });
    }

    return json({ error: "mail_not_configured" }, { status: 503, headers });
  } catch (error) {
    console.error("contact failed", error);
    return json({ error: "server_error" }, { status: 500, headers });
  } finally {
    release();
  }
}
