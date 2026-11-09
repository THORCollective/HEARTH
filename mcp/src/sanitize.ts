/**
 * Serve-time cleanup of community-written hunt text before it reaches a
 * user's AI tool. Hidden characters are made visible rather than deleted, so
 * a hunt that is legitimately about them (H186: right-to-left override
 * filenames) still reads correctly, but nothing is invisible to the reader.
 */

// Invisible or layout-changing characters: C0/C1 controls (except tab, LF,
// CR), soft hyphen, Arabic letter mark, Mongolian vowel separator,
// zero-width and directional marks, bidi embeddings/overrides/isolates, word
// joiner and invisible operators, and the BOM.
const INVISIBLE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/gu;

// Unicode tag characters and variation selectors supplement can spell out
// whole hidden sentences ("ASCII smuggling"). Runs are replaced, not shown.
const SMUGGLED = /[\u{E0000}-\u{E007F}\u{E0100}-\u{E01EF}]+/gu;

export const SHORT_MAX = 2_000;
export const LONG_MAX = 20_000;

/** Fields that legitimately hold long prose or queries. */
const LONG_FIELDS = new Set([
  "why",
  "notes",
  "references",
  "false_positive_notes",
  "query",
  "description",
]);

function codepoint(c: string): string {
  return `<U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}>`;
}

export function cleanText(text: string, max: number = SHORT_MAX): string {
  const visible = text
    .normalize("NFC")
    .replace(SMUGGLED, "[hidden characters removed]")
    .replace(INVISIBLE, codepoint);
  const chars = [...visible];
  return chars.length > max
    ? chars.slice(0, max).join("") + " …[truncated]"
    : visible;
}

/** Clean every string in a hunt, capping long prose fields at LONG_MAX. */
export function cleanDeep<T>(value: T, key = ""): T {
  if (typeof value === "string")
    return cleanText(value, LONG_FIELDS.has(key) ? LONG_MAX : SHORT_MAX) as T;
  if (Array.isArray(value)) return value.map((v) => cleanDeep(v, key)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, cleanDeep(v, k)]),
    ) as T;
  return value;
}
