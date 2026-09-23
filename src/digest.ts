import type { Hunt, HuntCategory } from "./types/Hunt";
import {
  buildDigest,
  isoWeekKey,
  listWeeks,
  parseWeekKey,
  weekRange,
  type Digest,
  type DigestSource,
  type WeekKey,
} from "./lib/digest";

const CATEGORIES: HuntCategory[] = ["Flames", "Embers", "Alchemy"];
const MAX_CHIPS = 3;
const HOSTS_SHOWN = 8;

async function init(): Promise<void> {
  const root = document.getElementById("digest-root");
  if (!root) return;

  let hunts: Hunt[];
  try {
    // no-cache: data files live at fixed paths, so revalidate to avoid stale data after a deploy.
    const res = await fetch("/hunts-data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for /hunts-data.json`);
    hunts = (await res.json()) as Hunt[];
  } catch (err) {
    console.error("[digest] load failed", err);
    replace(
      root,
      text("p", "error", "Could not load the digest — try refreshing."),
    );
    return;
  }

  const weeks = listWeeks(hunts);
  if (weeks.length === 0) {
    replace(root, text("p", "empty", "No dated hunts yet."));
    return;
  }

  const requested = parseWeekKey(
    new URLSearchParams(window.location.search).get("week"),
  );
  const latest = weeks[weeks.length - 1];
  const weekKey = requested ?? latest;
  const digest = buildDigest(hunts, weekKey);

  document.title = `HEARTH — Digest · ${formatRange(weekKey)}`;
  replace(
    root,
    renderWeekNav(weekKey, weeks, latest),
    ...(digest.hunts.length === 0 ? [renderEmptyWeek()] : renderDigest(digest)),
  );
}

function renderWeekNav(
  weekKey: WeekKey,
  weeks: WeekKey[],
  latest: WeekKey,
): HTMLElement {
  const nav = el("nav", "week-nav");
  nav.setAttribute("aria-label", "Choose a week");

  // Weeks without hunts are skipped: prev/next jump to the nearest week that has some.
  const prev = [...weeks].reverse().find((w) => w < weekKey);
  const next = weeks.find((w) => w > weekKey);

  nav.appendChild(weekLink("← Older", prev));
  const label = el("div", "week-label");
  label.textContent =
    weekKey === isoWeekKey(new Date())
      ? "This week"
      : `Week ${Number(weekKey.slice(-2))}`;
  label.appendChild(text("small", "", formatRange(weekKey)));
  nav.appendChild(label);
  nav.appendChild(weekLink("Newer →", next));

  if (weekKey !== latest) {
    const jump = weekLink("Latest", latest);
    jump.classList.add("latest");
    nav.appendChild(jump);
  }
  return nav;
}

function weekLink(label: string, week: WeekKey | undefined): HTMLAnchorElement {
  const a = el("a", "btn") as HTMLAnchorElement;
  a.textContent = label;
  if (week) {
    a.href = `digest.html?week=${encodeURIComponent(week)}`;
  } else {
    a.setAttribute("aria-disabled", "true");
    a.tabIndex = -1;
  }
  return a;
}

function renderEmptyWeek(): HTMLElement {
  const p = el("p", "empty");
  p.appendChild(document.createTextNode("No new hunts landed this week. "));
  const a = el("a", "") as HTMLAnchorElement;
  a.href = "submit.html";
  a.textContent = "Submit one →";
  p.appendChild(a);
  return p;
}

function renderDigest(d: Digest): HTMLElement[] {
  const stats = el("div", "stats");
  stats.appendChild(
    stat(d.hunts.length, d.hunts.length === 1 ? "new hunt" : "new hunts"),
  );
  for (const c of CATEGORIES) {
    if (d.byCategory[c] > 0) stats.appendChild(stat(d.byCategory[c], c));
  }
  stats.appendChild(
    stat(
      d.gapsClosed.length,
      d.gapsClosed.length === 1 ? "gap closed" : "gaps closed",
    ),
  );
  stats.appendChild(
    stat(
      d.contributors.length,
      d.contributors.length === 1 ? "contributor" : "contributors",
    ),
  );

  const grid = el("div", "digest-grid");
  grid.appendChild(renderHunts(d.hunts));
  const side = el("div", "side");
  if (d.gapsClosed.length > 0) side.appendChild(renderGaps(d));
  if (d.contributors.length > 0) side.appendChild(renderContributors(d));
  if (d.sources.length > 0) side.appendChild(renderSources(d.sources));
  grid.appendChild(side);

  return [stats, grid];
}

function renderHunts(hunts: Hunt[]): HTMLElement {
  const card = el("section", "card");
  card.appendChild(text("div", "card-kicker", "New hunts"));
  for (const category of CATEGORIES) {
    const group = hunts.filter((h) => h.category === category);
    if (group.length === 0) continue;
    const section = el("div", "cat-group");
    const head = text("h2", "cat-head", category);
    head.appendChild(text("span", "", String(group.length)));
    section.appendChild(head);
    for (const h of group) section.appendChild(renderHuntRow(h));
    card.appendChild(section);
  }
  return card;
}

function renderHuntRow(hunt: Hunt): HTMLAnchorElement {
  const row = el("a", "hunt-row") as HTMLAnchorElement;
  row.href = `index.html?hunt=${encodeURIComponent(hunt.id)}`;
  row.appendChild(text("span", "hunt-id", hunt.id));
  row.appendChild(text("span", "hunt-title", hunt.title));
  const chips = el("span", "chips");
  const techniques = hunt.techniques ?? [];
  for (const t of techniques.slice(0, MAX_CHIPS))
    chips.appendChild(text("span", "chip", t));
  if (techniques.length > MAX_CHIPS) {
    chips.appendChild(
      text("span", "chip more", `+${techniques.length - MAX_CHIPS}`),
    );
  }
  row.appendChild(chips);
  return row;
}

function renderGaps(d: Digest): HTMLElement {
  const card = el("section", "card");
  card.appendChild(
    text("div", "card-kicker", `Gaps closed · ${d.gapsClosed.length}`),
  );
  card.appendChild(
    text(
      "p",
      "card-hint",
      "ATT&CK techniques that got their first-ever HEARTH hunt this week.",
    ),
  );
  const list = el("div", "gap-list");
  for (const g of d.gapsClosed) {
    const a = el("a", "") as HTMLAnchorElement;
    a.href = `coverage-heatmap.html?view=technique&t=${encodeURIComponent(g.techniqueId)}`;
    a.textContent = g.techniqueId;
    a.title = `First covered by ${g.huntIds.join(", ")}`;
    list.appendChild(a);
  }
  card.appendChild(list);
  return card;
}

function renderContributors(d: Digest): HTMLElement {
  const card = el("section", "card");
  card.appendChild(text("div", "card-kicker", "Thanks to"));
  const list = el("ul", "people");
  for (const c of d.contributors) {
    const li = el("li", "");
    if (c.link) {
      const a = el("a", "") as HTMLAnchorElement;
      a.href = c.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = c.name;
      li.appendChild(a);
    } else {
      li.appendChild(text("span", "", c.name));
    }
    li.appendChild(
      text("span", "n", `${c.count} ${c.count === 1 ? "hunt" : "hunts"}`),
    );
    list.appendChild(li);
  }
  card.appendChild(list);
  return card;
}

function renderSources(sources: DigestSource[]): HTMLElement {
  const byHost = new Map<string, DigestSource[]>();
  for (const s of sources) {
    const host = s.host.replace(/^www\./, "");
    byHost.set(host, [...(byHost.get(host) ?? []), s]);
  }
  const hosts = [...byHost.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  );

  const card = el("section", "card");
  card.appendChild(text("div", "card-kicker", `Sources · ${sources.length}`));
  card.appendChild(
    text(
      "p",
      "card-hint",
      "The threat intel behind this week's hunts, grouped by site.",
    ),
  );

  const hidden: HTMLElement[] = [];
  hosts.forEach(([host, items], i) => {
    const details = el("details", "src-host");
    const summary = el("summary", "");
    summary.appendChild(text("span", "host", host));
    summary.appendChild(text("span", "n", String(items.length)));
    details.appendChild(summary);
    const ul = el("ul", "");
    for (const s of items) {
      const li = el("li", "");
      const a = el("a", "") as HTMLAnchorElement;
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = s.title;
      li.appendChild(a);
      ul.appendChild(li);
    }
    details.appendChild(ul);
    if (i >= HOSTS_SHOWN) {
      details.hidden = true;
      hidden.push(details);
    }
    card.appendChild(details);
  });

  if (hidden.length > 0) {
    const btn = el("button", "show-all") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = `Show ${hidden.length} more sites`;
    btn.addEventListener("click", () => {
      hidden.forEach((h) => (h.hidden = false));
      btn.remove();
    });
    card.appendChild(btn);
  }
  return card;
}

function formatRange(weekKey: WeekKey): string {
  const { start, end } = weekRange(weekKey);
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const left = fmt(start, { month: "short", day: "numeric" });
  const right = fmt(
    end,
    sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
  );
  return `${left} – ${right}, ${end.getUTCFullYear()}`;
}

function stat(n: number, label: string): HTMLSpanElement {
  const span = el("span", "") as HTMLSpanElement;
  span.appendChild(text("strong", "", String(n)));
  span.appendChild(document.createTextNode(label));
  return span;
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function text(tag: string, className: string, content: string): HTMLElement {
  const node = el(tag, className);
  node.textContent = content;
  return node;
}

function replace(root: HTMLElement, ...children: HTMLElement[]): void {
  while (root.firstChild) root.removeChild(root.firstChild);
  for (const c of children) root.appendChild(c);
}

init();
