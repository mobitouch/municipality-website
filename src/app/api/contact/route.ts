import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/escapeHtml";
import { forwardToDashboard } from "@/lib/dashboard";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`contact:${ip}`)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot field filled in => likely a bot. Pretend success, do nothing.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  const { name, contact, message } = parsed.data;
  const isEmail = contact.includes("@");

  // Two independent delivery channels: the staff dashboard (primary — shows
  // up live for municipal staff) and email (secondary/best-effort). Success
  // if either works; only error out if both do.
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
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "mail_not_configured" }, { status: 503 });
}
