import type { Hunt } from './types/Hunt';
import {
  analyzeActor,
  buildActorIndex,
  computeAllCoverage,
  topMatchedActors,
  type ActorMentionsData,
  type ContextGraphData,
} from './lib/actor-matching';

const BOTS = new Set(['HEARTH Bot']);

let allHunts: Hunt[] = [];
let activeCategory = '';
let searchQuery = '';

async function renderActorPreview(): Promise<void> {
  const pane = document.getElementById('actor-preview-pane');
  const body = document.getElementById('actor-preview-body');
  const ti = document.getElementById('actor-preview-ti');
  if (!pane || !body || !ti) return;

  const [graph, mentions] = await Promise.all([
    fetch('/context-graph-data.json').then((r) => r.json() as Promise<ContextGraphData>),
    fetch('/actor-mentions.json').then((r) => r.json() as Promise<ActorMentionsData>),
  ]);

  const index = buildActorIndex(graph);
  const allCoverage = computeAllCoverage(allHunts, mentions, index);

  // Pick a featured actor from the top-matched list — bias toward variety
  // across reloads while staying within the high-value set so the preview
  // always looks impressive.
  const top = topMatchedActors(allCoverage, 6);
  if (top.length === 0) return;
  const pick = top[Math.floor(Math.random() * top.length)].actor;

  const result = analyzeActor(pick.id, allHunts, mentions, index);
  if (!result) return;

  // Top 4 tactics by techniques the actor employs — densest signal in the
  // smallest amount of space.
  const tacticRows = result.tacticCoverage
    .filter((t) => t.techniquesUsed > 0)
    .sort((a, b) => b.techniquesUsed - a.techniquesUsed)
    .slice(0, 4);
  const totalActiveTactics = result.tacticCoverage.filter((t) => t.techniquesUsed > 0).length;
  const hiddenTactics = Math.max(0, totalActiveTactics - tacticRows.length);

  const groupId = pick.id.replace('actor:', '');
  ti.textContent = `actors / ${groupId.toLowerCase()}`;

  const aliasChips = pick.aliases
    .slice(0, 3)
    .map((a) => `<span class="alias">${escapeHtml(a)}</span>`)
    .join('');

  const tacticRowsHtml = tacticRows
    .map((t) => {
      const pct = t.techniquesUsed === 0 ? 0 : (t.techniquesCovered / t.techniquesUsed) * 100;
      return `<div class="row">
        <span class="name">${escapeHtml(t.tactic)}</span>
        <span class="bar"><i style="width:${pct.toFixed(0)}%"></i></span>
        <span class="nums">${t.techniquesCovered}/${t.techniquesUsed}</span>
      </div>`;
    })
    .join('');

  const coveredTechs = result.coverage.actorTechniqueCount - result.coverage.gapTechniqueCount;

  body.innerHTML = `
    <div class="h-id">live · ${escapeHtml(groupId)} · sampled from ${top.length} top-matched actors</div>
    <h3 class="actor-preview-name">${escapeHtml(pick.label)}</h3>
    ${aliasChips ? `<div class="actor-preview-aliases">${aliasChips}</div>` : ''}
    <div class="actor-preview-stats">
      <div class="s">
        <span class="n">${result.coverage.matchedHuntCount}</span>
        <span class="l">Matched hunts</span>
      </div>
      <div class="s">
        <span class="n">${coveredTechs}<em>/${result.coverage.actorTechniqueCount}</em></span>
        <span class="l">Techniques covered</span>
      </div>
    </div>
    <div class="actor-preview-tactics">${tacticRowsHtml}</div>
    ${hiddenTactics > 0 ? `<div class="actor-preview-more">+ ${hiddenTactics} more tactic${hiddenTactics === 1 ? '' : 's'} →</div>` : ''}
    <div class="actor-preview-cta">
      <a href="actors.html?actor=${encodeURIComponent(groupId)}">Open full coverage for ${escapeHtml(pick.label)} →</a>
    </div>
  `;

  pane.style.display = 'flex';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function init() {
  buildEmbersGlyph();
  setupChips();

  try {
    const res = await fetch('/hunts-data.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allHunts = await res.json();
  } catch (err) {
    console.error('[HEARTH] Failed to load hunt data:', err);
    return;
  }

  try { updateStats(); } catch (err) { console.error('[HEARTH] updateStats:', err); }
  try { updateCategoryCounts(); } catch (err) { console.error('[HEARTH] updateCategoryCounts:', err); }
  try { buildTicker(); } catch (err) { console.error('[HEARTH] buildTicker:', err); }
  try { renderActivityFeed(); } catch (err) { console.error('[HEARTH] renderActivityFeed:', err); }
  try { renderLeaderboard(); } catch (err) { console.error('[HEARTH] renderLeaderboard:', err); }
  try { renderLibrary(); } catch (err) { console.error('[HEARTH] renderLibrary:', err); }
  setupSearch();

  // Best-effort: hydrate the actors teaser preview card with live coverage data.
  // If any of these fetches fail, the teaser still renders the static left pane.
  renderActorPreview().catch((err) =>
    console.error('[HEARTH] renderActorPreview:', err),
  );
}

// ----- Embers glyph -----

function buildEmbersGlyph() {
  const grid = document.getElementById('embersGrid');
  if (!grid) return;
  const lit = new Set([8, 9, 10, 15, 16, 17, 22, 23, 24]);
  const dim = new Set([7, 11, 14, 18, 21, 25, 29, 30, 31]);
  for (let i = 0; i < 35; i++) {
    const c = document.createElement('i');
    if (lit.has(i)) c.classList.add('lit');
    else if (dim.has(i)) c.classList.add('dim');
    grid.appendChild(c);
  }
}

// ----- Stats -----

function updateStats() {
  const total = allHunts.length;
  const contributors = new Set(
    allHunts.filter(h => !BOTS.has(h.submitter.name)).map(h => h.submitter.name)
  ).size;
  const techniques = new Set<string>(
    allHunts.flatMap(h => h.tags.filter(t => /^T\d{4}/.test(t)))
  ).size;

  const totalEl = document.getElementById('stat-total');
  if (totalEl) totalEl.innerHTML = `${total}<em>+</em>`;
  setText('stat-contributors', String(contributors));
  setText('stat-techniques', String(techniques));
  setText('topbar-pill', `${total} hunts indexed`);
  setText('contributors-blurb', String(contributors));
}

// ----- Category counts + footer text -----

function updateCategoryCounts() {
  const cats = (['Flames', 'Embers', 'Alchemy'] as const);
  for (const cat of cats) {
    const subset = allHunts.filter(h => h.category === cat);
    const count = subset.length;
    const tactics = new Set(
      subset.flatMap(h =>
        h.tactic.split(',').map(t => t.trim().replace(/\s*\([^)]*\)/g, '').trim())
      )
    ).size;

    const key = cat.toLowerCase();

    if (cat === 'Flames') {
      const el = document.getElementById('count-flames');
      if (el) {
        const rounded = Math.floor(count / 10) * 10;
        el.innerHTML = `${rounded}<span class="dim">+</span>`;
      }
      setText('flames-foot', `${count} hypotheses · ${tactics} tactics`);
    } else if (cat === 'Embers') {
      setText('count-embers', String(count));
      setText('embers-foot', `${count} explorations · ${tactics} tactics`);
    } else {
      setText('count-alchemy', String(count));
      setText('alchemy-foot', `${count} methods · ${tactics} tactics`);
    }

    void key; // suppress unused-variable lint
  }
}

// ----- ATT&CK ticker -----

function buildTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  const seen = new Set<string>();
  const items: string[] = [];
  allHunts.forEach(h => {
    h.tags.forEach(t => {
      if (/^T\d{4}/.test(t) && !seen.has(t)) {
        seen.add(t);
        items.push(t.replace('_', '.'));
      }
    });
  });

  if (items.length === 0) return;

  const chunk = items.slice(0, Math.min(items.length, 20));
  const html = chunk.flatMap(t => [
    `<span><b>${esc(t)}</b></span>`,
    `<span class="dot">&#9679;</span>`
  ]).join('');

  track.innerHTML = html + html; // doubled for seamless loop
}

// ----- Activity feed -----

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;

  const sorted = byIdDesc(allHunts);
  const recent = sorted.slice(0, 5);
  const catTagClass = (h: Hunt) =>
    ({ Flames: 'flame', Embers: 'ember', Alchemy: 'alch' } as Record<string, string>)[h.category] ?? 'flame';

  // Illustrative recency labels — we don't have real timestamps
  const labels = ['2m', '14m', '38m', '1h', '3h'];
  const verbs = ['Merged', 'New hunt', 'PR merged', 'Updated', 'Merged'];

  feed.innerHTML = recent.map((h, i) => {
    const title = h.title.length > 48 ? h.title.slice(0, 48) + '…' : h.title;
    return `<div class="feed-item">
  <span class="when">${labels[i]}</span>
  <span class="who">${esc(verbs[i])} · <span>${esc(title)}</span></span>
  <span class="tag ${catTagClass(h)}">${esc(h.category)}</span>
</div>`;
  }).join('');
}

// ----- Leaderboard -----

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-rows');
  if (!container) return;

  const counts = new Map<string, { name: string; link: string; count: number }>();
  allHunts.forEach(h => {
    const { name, link } = h.submitter;
    if (BOTS.has(name)) return;
    const existing = counts.get(name);
    if (existing) {
      existing.count++;
    } else {
      counts.set(name, { name, link, count: 1 });
    }
  });

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const max = ranked[0]?.count ?? 1;

  container.innerHTML = ranked.map((c, i) => {
    const handle = extractHandle(c.link);
    const initials = getInitials(c.name);
    const pct = Math.round((c.count / max) * 100);
    const rank = String(i + 1).padStart(2, '0');
    const handleHtml = handle
      ? `<span class="dim mono">${esc(handle)}</span>`
      : '';
    return `<div class="leader-row">
  <div class="rank">${rank}</div>
  <div class="who"><div class="avatar">${esc(initials)}</div><div class="n">${esc(c.name)} ${handleHtml}</div></div>
  <div class="h">${c.count}</div>
  <div class="bar"><i style="width:${pct}%"></i></div>
</div>`;
  }).join('');
}

// ----- Library table -----

function setupChips() {
  document.querySelectorAll<HTMLElement>('.chip').forEach(ch => {
    ch.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      ch.classList.add('on');
      activeCategory = ch.dataset.cat ?? '';
      renderLibrary();
    });
  });
}

function setupSearch() {
  const input = document.querySelector<HTMLInputElement>('.search input');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    renderLibrary();
  });
}

function renderLibrary() {
  const container = document.getElementById('lib-rows');
  if (!container) return;

  let filtered = allHunts;
  if (activeCategory) filtered = filtered.filter(h => h.category === activeCategory);
  if (searchQuery) {
    filtered = filtered.filter(h =>
      h.title.toLowerCase().includes(searchQuery) ||
      h.tactic.toLowerCase().includes(searchQuery) ||
      h.tags.some(t => t.toLowerCase().includes(searchQuery))
    );
  }

  const sorted = byIdDesc(filtered);
  const shown = sorted.slice(0, 6);

  if (shown.length === 0) {
    container.innerHTML = `<div style="padding:24px 22px;font-family:var(--mono);font-size:13px;color:var(--fg-dim)">No hunts matched.</div>`;
    updateLibFooter(0, filtered.length);
    return;
  }

  container.innerHTML = shown.map(h => {
    const catClass = ({ Flames: 'f', Embers: 'e', Alchemy: 'a' } as Record<string, string>)[h.category] ?? 'f';
    const techTag = (h.tags.find(t => /^T\d{4}/.test(t)) ?? '—').replace('_', '.');
    const tactic = h.tactic.split(',')[0].trim().replace(/\s*\([^)]*\)/g, '').trim();
    const handle = extractHandle(h.submitter.link) ?? h.submitter.name;

    return `<div class="lib-row" role="button" tabindex="0"
  onclick="window.location.href='index.html'"
  onkeydown="if(event.key==='Enter')window.location.href='index.html'">
  <div class="name">${esc(h.title)}</div>
  <div class="cell c3"><span class="badge ${catClass}">${esc(h.category)}</span></div>
  <div class="cell c4">${esc(techTag)}</div>
  <div class="cell c5">${esc(tactic)}</div>
  <div class="cell">${esc(handle)}</div>
  <div class="arrow">&#8594;</div>
</div>`;
  }).join('');

  updateLibFooter(shown.length, filtered.length);
}

function updateLibFooter(shown: number, filteredTotal: number) {
  const el = document.getElementById('lib-foot-text');
  if (!el) return;
  const grand = allHunts.length;
  if (filteredTotal === grand) {
    el.innerHTML = `Showing ${shown} of ${grand} &middot; <a href="index.html">Open the full library &#8594;</a>`;
  } else {
    el.innerHTML = `Showing ${shown} of ${filteredTotal} filtered &middot; <a href="index.html">Open the full library &#8594;</a>`;
  }
}

// ----- Helpers -----

function byIdDesc(hunts: Hunt[]): Hunt[] {
  return [...hunts].sort((a, b) => {
    const na = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const nb = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return nb - na;
  });
}

function extractHandle(link: string): string | null {
  if (!link) return null;
  const m = link.match(/(?:x\.com|twitter\.com|bsky\.app\/profile)\/([^/?]+)/);
  return m ? `@${m[1]}` : null;
}

function getInitials(name: string): string {
  const clean = name.replace(/\s*\([^)]*\)/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function setText(id: string, text: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
