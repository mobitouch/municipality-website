import { z } from "zod";

const honeypot = z
  .string()
  .max(0, "honeypot")
  .optional()
  .or(z.literal(""));

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(4000),
  company: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const reportIssueTypes = ["roads", "health", "lighting", "other"] as const;
export type ReportIssueType = (typeof reportIssueTypes)[number];

export const reportIssueSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  type: z.enum(reportIssueTypes),
  description: z.string().trim().min(10).max(4000),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  company: honeypot,
});

export type ReportIssueInput = z.infer<typeof reportIssueSchema>;

export const trackSchema = z.object({
  reference: z.string().trim().min(3).max(40),
  contact: z.string().trim().min(3).max(160),
});

export type TrackInput = z.infer<typeof trackSchema>;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_TOTAL_FILES_SIZE = 15 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
