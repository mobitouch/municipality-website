import nodemailer from "nodemailer";

import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_TO,
  );
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const secure = process.env.SMTP_SECURE === "true";

  const created: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    // Reuse one authenticated connection across submissions. Without pooling
    // every message paid for a fresh TCP connect plus a TLS handshake —
    // asymmetric crypto is genuinely expensive, and on a shared plan that
    // handshake is a visible CPU spike on each complaint.
    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    // Nodemailer has no default socket timeout, so a silent or slow SMTP
    // server would hold the request (and its concurrency slot) open until the
    // platform killed it. These bound every stage of the conversation.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,

    // Refuse to talk to a server whose certificate doesn't validate, and
    // require a modern TLS floor. Both are nodemailer's defaults; pinning
    // them means a future config change can't silently downgrade delivery of
    // citizens' personal details to an unverified peer.
    requireTLS: !secure,
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
  });

  transporter = created;
  return created;
}

/**
 * Header values must not contain CR/LF: a newline in a subject or address is
 * how header injection smuggles in extra recipients. Nodemailer encodes most
 * of this, but stripping at the boundary keeps it true regardless of version.
 */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendMail(options: {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: process.env.MAIL_FROM ?? process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    replyTo: options.replyTo ? headerSafe(options.replyTo) : undefined,
    subject: headerSafe(options.subject),
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });
}
