import { z } from "zod";
import {
  digitCount,
  isEmailAddress,
  sanitizeLine,
  sanitizeMultiline,
  sanitizePhone,
  sanitizeReference,
} from "@/lib/sanitize";

/**
 * Every field sanitises *before* it validates, via `.transform().pipe()`.
 *
 * The ordering is the point: length and content rules are applied to the
 * cleaned value, so a submission padded with zero-width characters can't slip
 * past a `min()` on junk, and a `max()` can't be satisfied by text that grows
 * back once normalised. Because these schemas are what the browser form and
 * the API route both parse with, the same cleaning runs on both sides — and
 * the server's pass is authoritative regardless of what the client sent.
 */

const MAX = {
  name: 120,
  phone: 30,
  contact: 160,
  message: 4000,
  description: 4000,
  reference: 40,
} as const;

/** Letters (any script), digits, spaces and the punctuation found in real names. */
const NAME_PATTERN = /^[\p{L}\p{M}\p{N} '’\-.,()]+$/u;

const nameField = z
  .string()
  .transform((value) => sanitizeLine(value, MAX.name))
  .pipe(
    z
      .string()
      .min(2, "name")
      .max(MAX.name, "name")
      .regex(NAME_PATTERN, "name"),
  );

const phoneField = z
  .string()
  .transform((value) => sanitizePhone(value, MAX.phone))
  .pipe(
    z
      .string()
      .max(MAX.phone, "phone")
      .refine((value) => digitCount(value) >= 6 && digitCount(value) <= 15, "phone"),
  );

const messageField = (max: number) =>
  z
    .string()
    .transform((value) => sanitizeMultiline(value, max))
    .pipe(z.string().min(10, "message").max(max, "message"));

/**
 * Free-text "how to reach you" — an email address or a phone number, since the
 * contact form accepts either. Validated as one or the other rather than left
 * as arbitrary text, because this value is used as the mail `Reply-To`.
 */
const contactField = z
  .string()
  .transform((value) => sanitizeLine(value, MAX.contact))
  .pipe(
    z
      .string()
      .min(3, "contact")
      .max(MAX.contact, "contact")
      .refine(
        (value) => isEmailAddress(value) || digitCount(value) >= 6,
        "contact",
      ),
  );

/**
 * Honeypot: a field hidden from real users that bots fill in anyway.
 *
 * It accepts any short string on purpose. Rejecting a filled honeypot at the
 * schema level — which is what `max(0)` used to do here — returned a hard 400
 * and made the route's "silently pretend it worked" branch unreachable, so
 * bots learned immediately that they had been spotted. Letting the value
 * through lets the route decide, and keeps a browser autofilling the field
 * from hard-failing a real citizen's complaint.
 */
const honeypot = z
  .string()
  .max(200)
  .optional()
  .transform((value) => (value ?? "").trim());

export const contactSchema = z.object({
  name: nameField,
  contact: contactField,
  message: messageField(MAX.message),
  company: honeypot,
});

/**
 * Each schema has two types, because the fields transform.
 *
 * `*FormValues` is what the browser form holds while the citizen is typing —
 * the raw input. `*Input` is what comes out of a successful parse: sanitised,
 * validated, and what both the submit handler and the API route work with.
 * React Hook Form needs the first, everything downstream needs the second.
 */
export type ContactFormValues = z.input<typeof contactSchema>;
export type ContactInput = z.output<typeof contactSchema>;

export const reportIssueTypes = ["roads", "health", "lighting", "other"] as const;
export type ReportIssueType = (typeof reportIssueTypes)[number];

export const reportIssueSchema = z.object({
  name: nameField,
  phone: phoneField,
  type: z.enum(reportIssueTypes),
  description: messageField(MAX.description),
  // Kept permissive here on purpose. A pin outside the municipality is
  // dropped by the route rather than rejected — losing a citizen's whole
  // complaint over a mis-click on a pannable map would be the wrong trade.
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  company: honeypot,
});

export type ReportIssueFormValues = z.input<typeof reportIssueSchema>;
export type ReportIssueInput = z.output<typeof reportIssueSchema>;

export const trackSchema = z.object({
  reference: z
    .string()
    .transform((value) => sanitizeReference(value, MAX.reference))
    .pipe(z.string().min(3, "reference").max(MAX.reference, "reference")),
  contact: contactField,
});

export type TrackFormValues = z.input<typeof trackSchema>;
export type TrackInput = z.output<typeof trackSchema>;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_TOTAL_FILES_SIZE = 15 * 1024 * 1024;
export const MAX_FILE_COUNT = 5;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/**
 * Ceiling on the raw request body, checked against Content-Length *before*
 * the multipart body is parsed. The per-file and total-size checks below can
 * only run after `formData()` has already buffered everything into memory, so
 * without this an unbounded upload becomes an unbounded allocation. The slack
 * over MAX_TOTAL_FILES_SIZE covers multipart boundaries, part headers, and
 * the text fields.
 */
export const MAX_REQUEST_BODY_SIZE = MAX_TOTAL_FILES_SIZE + 1024 * 1024;

/** Ceiling for the small JSON bodies the contact and track routes accept. */
export const MAX_JSON_BODY_SIZE = 64 * 1024;

/**
 * Bounding box for Lebanon. A pin outside it is a mis-click on a pannable map
 * or noise aimed at the staff dispatch view; either way it isn't somewhere
 * Amioun's crews are going, so the coordinates are dropped and the complaint
 * is forwarded without a location.
 */
export function isServiceableLocation(lat: number, lng: number): boolean {
  return lat >= 33 && lat <= 34.75 && lng >= 35 && lng <= 36.7;
}
