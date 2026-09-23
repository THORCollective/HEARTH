import type { Hunt, HuntCategory } from "../types/Hunt";

/** ISO week key, e.g. "2026-W39". Weeks run Monday–Sunday, bucketed in UTC. */
export type WeekKey = string;

export interface DigestSource {
  url: string;
  title: string;
  host: string;
}

export interface DigestContributor {
  name: string;
  /** Only http(s) links survive; anything else becomes null. */
  link: string | null;
  count: number;
}

export interface GapClosed {
  techniqueId: string;
  /** This week's hunts covering the technique, oldest first. */
  huntIds: string[];
}

export interface Digest {
  weekKey: WeekKey;
  /** Newest first. */
  hunts: Hunt[];
  byCategory: Record<HuntCategory, number>;
  /** Techniques whose first-ever dated hunt landed this week. */
  gapsClosed: GapClosed[];
  sources: DigestSource[];
  contributors: DigestContributor[];
}

const WEEK_KEY_RE = /^(\d{4})-W(\d{2})$/;
const DAY_MS = 86_400_000;

export function isoWeekKey(date: Date): WeekKey {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // Shift to the Thursday of this week; its year is the ISO year.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const week = Math.ceil(
    ((d.getTime() - Date.UTC(year, 0, 1)) / DAY_MS + 1) / 7,
  );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Returns the key if it names a real ISO week, else null. Safe on URL input. */
export function parseWeekKey(raw: string | null): WeekKey | null {
  if (!raw) return null;
  const m = WEEK_KEY_RE.exec(raw);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  // Dec 28 always falls in the year's last ISO week.
  const lastWeek = Number(
    isoWeekKey(new Date(Date.UTC(year, 11, 28))).slice(-2),
  );
  if (week < 1 || week > lastWeek) return null;
  return raw;
}

/** Monday and Sunday (00:00 UTC) of the given week. */
export function weekRange(key: WeekKey): { start: Date; end: Date } {
  const [year, week] = key.split("-W").map(Number);
  const jan4 = Date.UTC(year, 0, 4);
  const week1Monday = jan4 - ((new Date(jan4).getUTCDay() || 7) - 1) * DAY_MS;
  const start = new Date(week1Monday + (week - 1) * 7 * DAY_MS);
  return { start, end: new Date(start.getTime() + 6 * DAY_MS) };
}

function createdTime(hunt: Hunt): number | null {
  if (!hunt.created) return null;
  const t = Date.parse(hunt.created);
  return Number.isNaN(t) ? null : t;
}

/** Weeks that have at least one dated hunt, oldest first. */
export function listWeeks(hunts: Hunt[]): WeekKey[] {
  const weeks = new Set<WeekKey>();
  for (const h of hunts) {
    const t = createdTime(h);
    if (t !== null) weeks.add(isoWeekKey(new Date(t)));
  }
  return [...weeks].sort();
}

export interface WeekSummary {
  weekKey: WeekKey;
  count: number;
  /** "this week", "last week", or e.g. "in the week of Sep 7". */
  when: string;
}

/**
 * The most recent week with hunts, for a home-page teaser. Falls back to the
 * latest non-empty week so a quiet week never reads "0 new".
 */
export function latestWeekSummary(hunts: Hunt[], now = new Date()): WeekSummary | null {
  const weeks = listWeeks(hunts);
  const weekKey = weeks[weeks.length - 1];
  if (!weekKey) return null;

  let count = 0;
  for (const h of hunts) {
    const t = createdTime(h);
    if (t !== null && isoWeekKey(new Date(t)) === weekKey) count += 1;
  }

  const thisWeek = isoWeekKey(now);
  const lastWeek = isoWeekKey(new Date(weekRange(thisWeek).start.getTime() - DAY_MS));
  const when =
    weekKey === thisWeek
      ? "this week"
      : weekKey === lastWeek
        ? "last week"
        : `in the week of ${weekRange(weekKey).start.toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" })}`;
  return { weekKey, count, when };
}

const MD_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL_RE = /https?:\/\/[^\s)\]<>"']+/g;

/** Non-MITRE http(s) links from a hunt's markdown references, in order, deduped. */
export function extractSources(references: string): DigestSource[] {
  const found: { url: string; title: string }[] = [];
  const withoutMd = references.replace(
    MD_LINK_RE,
    (_, title: string, url: string) => {
      found.push({ url, title: title.trim() });
      return " ";
    },
  );
  for (const m of withoutMd.matchAll(BARE_URL_RE)) {
    found.push({ url: m[0].replace(/[.,;:]+$/, ""), title: "" });
  }

  const seen = new Set<string>();
  const out: DigestSource[] = [];
  for (const { url, title } of found) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") continue;
    if (parsed.hostname === "attack.mitre.org") continue;
    if (seen.has(parsed.href) || seen.has(url)) continue;
    seen.add(url);
    out.push({ url, title: title || parsed.hostname, host: parsed.hostname });
  }
  return out;
}

/**
 * Display group for a reference link: the site, except GitHub, which is split
 * by owner/repo since one host covers unrelated projects (Sigma, Atomic Red Team...).
 */
export function sourceGroup(source: DigestSource): string {
  const host = source.host.replace(/^www\./, "");
  if (host !== "github.com") return host;
  const [owner, repo] = new URL(source.url).pathname.split("/").filter(Boolean);
  return owner && repo ? `github.com/${owner}/${repo}` : host;
}

function safeLink(link: string | undefined): string | null {
  if (!link) return null;
  try {
    const u = new URL(link);
    return u.protocol === "https:" || u.protocol === "http:" ? link : null;
  } catch {
    return null;
  }
}

export function buildDigest(allHunts: Hunt[], weekKey: WeekKey): Digest {
  const dated = allHunts
    .map((h) => ({ h, t: createdTime(h) }))
    .filter((x): x is { h: Hunt; t: number } => x.t !== null);
  const inWeek = dated
    .filter((x) => isoWeekKey(new Date(x.t)) === weekKey)
    .sort((a, b) => b.t - a.t);
  const hunts = inWeek.map((x) => x.h);

  const byCategory: Record<HuntCategory, number> = {
    Flames: 0,
    Embers: 0,
    Alchemy: 0,
  };
  for (const h of hunts) {
    if (h.category in byCategory) byCategory[h.category] += 1;
  }

  // A technique counts as newly covered only if its earliest hunt is this week.
  // Undated hunts could be older than anything, so they rule a technique out.
  const firstSeen = new Map<string, number>();
  for (const h of allHunts) {
    const t = createdTime(h) ?? -Infinity;
    for (const tech of h.techniques ?? []) {
      const prev = firstSeen.get(tech);
      if (prev === undefined || t < prev) firstSeen.set(tech, t);
    }
  }
  const chronological = [...inWeek].reverse();
  const gapsClosed: GapClosed[] = [];
  for (const [tech, t] of firstSeen) {
    if (t === -Infinity || isoWeekKey(new Date(t)) !== weekKey) continue;
    gapsClosed.push({
      techniqueId: tech,
      huntIds: chronological
        .filter((x) => x.h.techniques?.includes(tech))
        .map((x) => x.h.id),
    });
  }
  gapsClosed.sort((a, b) => a.techniqueId.localeCompare(b.techniqueId));

  const sources: DigestSource[] = [];
  const seenUrls = new Set<string>();
  for (const h of hunts) {
    for (const s of extractSources(h.references ?? "")) {
      if (seenUrls.has(s.url)) continue;
      seenUrls.add(s.url);
      sources.push(s);
    }
  }

  const byName = new Map<string, DigestContributor>();
  for (const h of hunts) {
    // Issue-form submissions can leave a literal "(_No response_)" placeholder.
    const name = h.submitter?.name?.replace(/\s*\(?_No response_\)?/g, "").trim();
    if (!name) continue;
    const existing = byName.get(name);
    if (existing) {
      existing.count += 1;
      existing.link ??= safeLink(h.submitter.link);
    } else {
      byName.set(name, { name, link: safeLink(h.submitter.link), count: 1 });
    }
  }
  const contributors = [...byName.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  return { weekKey, hunts, byCategory, gapsClosed, sources, contributors };
}
