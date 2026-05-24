import type { Actor } from '../types/Actor';

export function renderActorHeader(actor: Actor): string {
  const aliasChips = actor.aliases
    .map((a) => `<span class="alias">${escapeHtml(a)}</span>`)
    .join('');

  const groupId = actor.id.replace('actor:', '');
  const mitreUrl = `https://attack.mitre.org/groups/${groupId}/`;
  const desc = stripBracketLinks(actor.description ?? '');

  const externalRefs = (actor.external_references ?? [])
    .filter((ref) => ref.source !== 'mitre-attack')
    .slice(0, 3)
    .map((ref) => `<a href="${escapeAttr(ref.url)}" target="_blank" rel="noopener">${escapeHtml(ref.source)} ↗</a>`)
    .join('');

  return `
    <div class="actor-header">
      <div>
        <span class="eyebrow">Threat actor · ${escapeHtml(groupId)}</span>
        <h2>${escapeHtml(actor.label)}</h2>
        ${aliasChips ? `<div class="aliases">${aliasChips}</div>` : ''}
        ${desc ? `<p class="desc">${escapeHtml(desc)}</p>` : ''}
      </div>
      <div class="links">
        <a href="${mitreUrl}" target="_blank" rel="noopener">MITRE ATT&amp;CK ${escapeHtml(groupId)} ↗</a>
        ${externalRefs}
      </div>
    </div>
  `;
}

function stripBracketLinks(s: string): string {
  // Convert "[Foo](http://...)" → "Foo" so the description reads cleanly.
  return s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
