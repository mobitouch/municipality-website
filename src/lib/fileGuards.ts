import { ALLOWED_FILE_TYPES } from "@/lib/validation";

/**
 * Leading bytes that must be present for each accepted type. The `type` on an
 * uploaded File is just the Content-Type the browser (or a script) put in the
 * multipart part — it is fully attacker-controlled, so on its own it proves
 * nothing. Checking the actual magic bytes means a renamed executable or a
 * polyglot can't ride into the municipality's inbox labelled `image/png`.
 */
const SIGNATURES: Record<string, { offset: number; bytes: number[] }[]> = {
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  // RIFF....WEBP
  "image/webp": [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  ],
  "application/pdf": [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }],
};

/** Enough to cover the longest signature plus its offset. */
export const SNIFF_BYTES = 16;

export function matchesDeclaredType(head: Uint8Array, declaredType: string): boolean {
  const signatures = SIGNATURES[declaredType];
  if (!signatures) return false;

  return signatures.every(({ offset, bytes }) =>
    bytes.every((byte, i) => head[offset + i] === byte),
  );
}

export function isAllowedType(type: string): boolean {
  return ALLOWED_FILE_TYPES.includes(type);
}

const EXTENSION_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * Rebuilds a safe attachment filename from scratch rather than sanitising the
 * one supplied. The uploaded name reaches a mail client and possibly a
 * recipient's disk, so path separators, traversal sequences, control
 * characters, bidi overrides and double extensions all have to go — and the
 * only part worth preserving is a short, plain stem.
 *
 * The character class keeps letters (Arabic included), digits, spaces, dashes
 * and underscores. Everything dangerous falls outside it: `/` and `\` aren't
 * letters, and control/bidi characters are Unicode categories Cc/Cf, which
 * `\p{L}`/`\p{N}` don't cover. The extension is then derived from the
 * *verified* content type, never from the supplied name.
 */
export function safeAttachmentName(originalName: string, type: string, index: number): string {
  const stem = originalName
    .replace(/\.[^.]*$/, "")
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .trim()
    .slice(0, 48);

  const extension = EXTENSION_FOR_TYPE[type] ?? "bin";
  return `${stem || `attachment-${index + 1}`}.${extension}`;
}
