/**
 * Escapes a string for interpolation into HTML.
 *
 * Covers the five characters that matter in element content and quoted
 * attribute values, plus the backtick — which old IE treated as an attribute
 * delimiter and which costs nothing to encode. `&` must be replaced first, or
 * it would double-encode the entities the later replacements introduce.
 *
 * This is output encoding, not input filtering: it belongs at the point a
 * value is written into HTML (the mail bodies), and is deliberately separate
 * from the normalisation in `sanitize.ts`.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}
