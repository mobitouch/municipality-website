import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { isMailConfigured, sendMail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/escapeHtml";

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

  if (!isMailConfigured()) {
    return NextResponse.json({ error: "mail_not_configured" }, { status: 503 });
  }

  const { name, contact, message } = parsed.data;

  try {
    await sendMail({
      subject: `New contact form message from ${name}`,
      replyTo: contact.includes("@") ? contact : undefined,
      text: `Name: ${name}\nContact: ${contact}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Contact:</strong> ${escapeHtml(contact)}</p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("contact mail send failed", error);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
