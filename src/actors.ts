import type { Hunt } from './types/Hunt';
import type { Actor } from './types/Actor';
import {
  analyzeActor,
  biggestGapActors,
  buildActorIndex,
  computeAllCoverage,
  resolveActor,
  topMatchedActors,
  type ActorIndex,
  type ActorLeaderRow,
  type ActorMentionsData,
  type ContextGraphData,
} from './lib/actor-matching';
import { mountActorSearch } from './components/ActorSearch';
import { renderActorHeader } from './components/ActorHeader';
import { renderCoverageStrip, renderTacticHeatmap } from './components/ActorCoverage';
import { renderMatchedHunts } from './components/MatchedHuntsList';
import { renderGapList } from './components/GapList';

// Curated pool of well-known group names. Each page load we shuffle this and
// pick the first few for the suggested chips, so visitors see different actors
// surfaced over time without drifting into obscure groups.
const POPULAR_ACTOR_NAMES = [
  'APT29', 'APT28', 'APT41', 'APT38', 'APT10', 'APT33', 'APT34',
  'Volt Typhoon', 'Salt Typhoon', 'Lazarus Group', 'Sandworm Team',
  'FIN7', 'FIN8', 'Scattered Spider', 'Wizard Spider', 'Mustang Panda',
  'Kimsuky', 'Turla', 'OilRig', 'MuddyWater', 'TA505', 'Magic Hound',
  'Dragonfly', 'Cobalt Group', 'Andariel', 'BlackTech',
];

// Well-known aliases — used by the typewriter to demonstrate that alias lookup
// works ("Cozy Bear" resolves to APT29, etc.). Mixed in with the names list.
const POPULAR_ACTOR_ALIASES = [
  'Cozy Bear', 'Fancy Bear', 'Bluenoroff', 'Midnight Blizzard',
  'Voodoo Bear', 'Berserk Bear', 'BeagleBoyz', 'Hafnium',
];

const SUGGESTED_CHIP_COUNT = 5;
const TYPEWRITER_EXAMPLE_COUNT = 7;

interface LoadedData {
  hunts: Hunt[];
  graph: ContextGraphData;
  mentions: ActorMentionsData;
}

interface PageState {
  data: LoadedData;
  index: ActorIndex;
}

async function init() {
  const data = await loadAll();
  if (!data) return;

  const index = buildActorIndex(data.graph);
  const state: PageState = { data, index };
  (window as unknown as { __state: PageState }).__state = state;

  renderTopbarPill(state);
  renderMetaStrip(state);
  renderSuggested(state);

  const urlActor = parseUrlActor();
  const urlQuery = parseUrlQuery();

  mountActorSearch('#actor-search', {
    index,
    initialQuery: urlActor ? '' : urlQuery ?? '',
    onSelect: (actor) => navigateToActor(actor),
    placeholderExamples: pickPlaceholderExamples(index),
  });

  if (urlActor) {
    const actor = index.actorById.get(`actor:${urlActor.toUpperCase()}`);
    if (actor) {
      renderActor(state, actor);
    } else {
      renderNotFound(urlActor);
    }
  } else if (urlQuery) {
    const matches = resolveActor(urlQuery, index, 1);
    if (matches.length > 0) {
      const id = matches[0].actor.id.replace('actor:', '');
      history.replaceState(null, '', `?actor=${encodeURIComponent(id)}`);
      renderActor(state, matches[0].actor);
    } else {
      renderNotFound(urlQuery);
    }
  } else {
    renderShowcase(state);
  }

  window.addEventListener('popstate', () => {
    const a = parseUrlActor();
    if (a) {
      const actor = index.actorById.get(`actor:${a.toUpperCase()}`);
      if (actor) {
        renderActor(state, actor);
        return;
      }
    }
    clearContent();
  });
}

async function loadAll(): Promise<LoadedData | null> {
  try {
    const [hunts, graph, mentions] = await Promise.all([
      fetchJson<Hunt[]>('/hunts-data.json'),
      fetchJson<ContextGraphData>('/context-graph-data.json'),
      fetchJson<ActorMentionsData>('/actor-mentions.json'),
    ]);
    return { hunts, graph, mentions };
  } catch (err) {
    console.error('[HEARTH/actors] Failed to load data:', err);
    showError('Could not load actor data — try refreshing.');
    return null;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function pickPlaceholderExamples(index: ActorIndex): string[] {
  const pool = [...POPULAR_ACTOR_NAMES, ...POPULAR_ACTOR_ALIASES].filter((slug) =>
    resolveActor(slug, index, 1).length > 0,
  );
  return shuffle(pool).slice(0, TYPEWRITER_EXAMPLE_COUNT);
}

function pickSuggestedActors(index: ActorIndex): Actor[] {
  const resolved: Actor[] = [];
  const seen = new Set<string>();
  for (const slug of shuffle(POPULAR_ACTOR_NAMES)) {
    const match = resolveActor(slug, index, 1)[0];
    if (!match) continue;
    if (seen.has(match.actor.id)) continue;
    seen.add(match.actor.id);
    resolved.push(match.actor);
    if (resolved.length >= SUGGESTED_CHIP_COUNT) break;
  }
  return resolved;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function parseUrlActor(): string | null {
  return new URLSearchParams(window.location.search).get('actor');
}

function parseUrlQuery(): string | null {
  return new URLSearchParams(window.location.search).get('q');
}

function navigateToActor(actor: Actor) {
  const id = actor.id.replace('actor:', '');
  history.pushState(null, '', `?actor=${encodeURIComponent(id)}`);
  const state = (window as unknown as { __state: PageState }).__state;
  if (state) renderActor(state, actor);
}

function renderTopbarPill(state: PageState) {
  const el = document.getElementById('topbar-pill');
  if (!el) return;
  el.textContent = `${state.index.actors.length} actors`;
}

function renderMetaStrip(state: PageState) {
  const el = document.getElementById('meta-strip');
  if (!el) return;
  const totalActors = state.index.actors.length;
  const actorsWithTechniques = state.index.actorTechniques.size;
  const covered = new Set<string>([
    ...state.index.actorTechniques.keys(),
    ...Object.keys(state.data.mentions.mentions ?? {}),
  ]);
  el.innerHTML = `<b>${totalActors}</b> actors mapped · <b>${actorsWithTechniques}</b> with MITRE technique links · <b>${covered.size}</b> potentially covered by HEARTH`;
}

function renderShowcase(state: PageState) {
  const root = document.getElementById('showcase');
  if (!root) return;
  const allCoverage = computeAllCoverage(
    state.data.hunts,
    state.data.mentions,
    state.index,
  );
  const best = topMatchedActors(allCoverage, 5);
  const gaps = biggestGapActors(allCoverage, 5);
  if (best.length === 0 && gaps.length === 0) return;

  const bestMax = best.length > 0 ? best[0].coverage.matchedHuntCount : 1;
  const gapsMax = gaps.length > 0 ? gaps[0].coverage.gapTechniqueCount : 1;

  const bestEl = document.getElementById('board-best');
  const gapsEl = document.getElementById('board-gaps');
  if (bestEl) {
    bestEl.innerHTML = best
      .map((row, i) => rowForBest(row, bestMax, i === 0))
      .join('');
  }
  if (gapsEl) {
    gapsEl.innerHTML = gaps
      .map((row, i) => rowForGap(row, gapsMax, i === 0))
      .join('');
  }
  root.hidden = false;
}

function rowForBest(row: ActorLeaderRow, max: number, isTop: boolean): string {
  const id = row.actor.id.replace('actor:', '');
  const tcount = row.coverage.actorTechniqueCount;
  const pct = max === 0 ? 0 : Math.max(8, (row.coverage.matchedHuntCount / max) * 100);
  return `<li${isTop ? ' class="top-rank"' : ''}>
    <a class="actor-name" href="?actor=${encodeURIComponent(id)}">
      <strong>${escapeHtml(row.actor.label)}</strong>
      <span class="small">${tcount} ${tcount === 1 ? 'technique' : 'techniques'} mapped</span>
    </a>
    <span class="bar-cell"><span class="track"></span><span class="fill" style="width:${pct.toFixed(1)}%"></span></span>
    <span class="metric">${row.coverage.matchedHuntCount}<span class="den">${row.coverage.matchedHuntCount === 1 ? 'hunt' : 'hunts'}</span></span>
  </li>`;
}

function rowForGap(row: ActorLeaderRow, max: number, isTop: boolean): string {
  const id = row.actor.id.replace('actor:', '');
  const pct = max === 0 ? 0 : Math.max(8, (row.coverage.gapTechniqueCount / max) * 100);
  return `<li${isTop ? ' class="top-rank"' : ''}>
    <a class="actor-name" href="?actor=${encodeURIComponent(id)}">
      <strong>${escapeHtml(row.actor.label)}</strong>
      <span class="small">${row.coverage.coveragePercent}% covered · ${row.coverage.matchedHuntCount} ${row.coverage.matchedHuntCount === 1 ? 'hunt' : 'hunts'}</span>
    </a>
    <span class="bar-cell"><span class="track"></span><span class="fill gap" style="width:${pct.toFixed(1)}%"></span></span>
    <span class="metric">${row.coverage.gapTechniqueCount}<span class="den">${row.coverage.gapTechniqueCount === 1 ? 'technique' : 'techniques'}</span></span>
  </li>`;
}

function renderSuggested(state: PageState) {
  const el = document.getElementById('suggested-actors');
  if (!el) return;
  const actors = pickSuggestedActors(state.index);
  if (actors.length === 0) return;
  const links = actors
    .map((a) => {
      const id = a.id.replace('actor:', '');
      return `<a href="?actor=${encodeURIComponent(id)}">${escapeHtml(a.label)}</a>`;
    })
    .join('');
  el.innerHTML = `<span class="label">Try</span>${links}`;
}

function renderActor(state: PageState, actor: Actor) {
  const content = document.getElementById('actor-content');
  if (!content) return;
  const result = analyzeActor(actor.id, state.data.hunts, state.data.mentions, state.index);
  if (!result) {
    renderNotFound(actor.label);
    return;
  }
  content.innerHTML = `
    <section class="result">
      ${renderActorHeader(result.actor)}
      ${renderCoverageStrip(result.coverage)}
      ${renderTacticHeatmap(result.tacticCoverage)}
      ${renderMatchedHunts(result.actor.label, result.matchedHunts)}
      ${renderGapList(result.gap)}
    </section>
  `;
  document.title = `${result.actor.label} — HEARTH coverage`;
  content.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderNotFound(query: string) {
  const content = document.getElementById('actor-content');
  if (!content) return;
  content.innerHTML = `
    <section class="result">
      <div class="notfound">
        <h3>We don't have <em>${escapeHtml(query)}</em> mapped in HEARTH yet.</h3>
        <p>Actors are sourced from MITRE ATT&amp;CK's group catalog. If this is a new or unmapped group, you can still contribute hunts targeting their TTPs — the page will start surfacing matches as soon as a hunt references the actor or shares one of their techniques.</p>
        <div class="ctas">
          <a class="btn primary" href="submit.html">Submit a hunt →</a>
          <a class="btn" href="actors.html">Browse all actors</a>
        </div>
      </div>
    </section>
  `;
  document.title = `Not found — HEARTH actor coverage`;
}

function clearContent() {
  const content = document.getElementById('actor-content');
  if (content) content.innerHTML = '';
  document.title = 'HEARTH — Threat actor coverage';
}

function showError(message: string) {
  const content = document.getElementById('actor-content');
  if (!content) return;
  content.innerHTML = `<div class="error-banner">${escapeHtml(message)}</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
