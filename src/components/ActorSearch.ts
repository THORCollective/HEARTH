import type { Actor } from '../types/Actor';
import type { ActorIndex } from '../lib/actor-matching';
import { resolveActor } from '../lib/actor-matching';

interface ActorSearchOptions {
  index: ActorIndex;
  initialQuery?: string;
  onSelect: (actor: Actor) => void;
  /** Names to cycle through in a typewriter-style placeholder animation. */
  placeholderExamples?: string[];
}

export function mountActorSearch(
  rootSelector: string,
  options: ActorSearchOptions,
): void {
  const root = document.querySelector<HTMLDivElement>(rootSelector);
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('input');
  const results = root.querySelector<HTMLDivElement>('.results');
  if (!input || !results) return;

  if (options.initialQuery) input.value = options.initialQuery;

  let cursor = -1;

  const render = (matches: ReturnType<typeof resolveActor>) => {
    cursor = -1;
    // Clear children safely instead of innerHTML.
    while (results.firstChild) results.removeChild(results.firstChild);
    if (matches.length === 0) {
      results.classList.remove('open');
      return;
    }
    matches.forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'results-item';
      item.dataset.index = String(i);
      item.dataset.id = m.actor.id.replace('actor:', '');

      const lbl = document.createElement('span');
      lbl.className = 'lbl';
      lbl.textContent = m.actor.label;
      item.appendChild(lbl);

      if (m.actor.aliases.length > 0) {
        const als = document.createElement('span');
        als.className = 'als';
        const preview = m.actor.aliases.slice(0, 3).join(' · ');
        als.textContent = m.actor.aliases.length > 3 ? `${preview} …` : preview;
        item.appendChild(als);
      }

      const idEl = document.createElement('span');
      idEl.className = 'id';
      idEl.textContent = m.actor.id.replace('actor:', '');
      item.appendChild(idEl);

      results.appendChild(item);
    });
    results.classList.add('open');
  };

  const close = () => {
    results.classList.remove('open');
    cursor = -1;
  };

  const onQuery = () => {
    const q = input.value.trim();
    if (!q) {
      close();
      return;
    }
    render(resolveActor(q, options.index, 8));
  };

  const selectById = (rawId: string) => {
    const actor = options.index.actorById.get(`actor:${rawId}`);
    if (actor) {
      input.value = actor.label;
      close();
      options.onSelect(actor);
    }
  };

  const updateCursor = (items: HTMLDivElement[]) => {
    items.forEach((el, i) => el.classList.toggle('cursor', i === cursor));
    if (items[cursor]) items[cursor].scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('input', onQuery);
  input.addEventListener('focus', onQuery);
  input.addEventListener('blur', () => setTimeout(close, 150));
  input.addEventListener('keydown', (e) => {
    const items = Array.from(results.querySelectorAll<HTMLDivElement>('.results-item'));
    if (items.length === 0 && e.key !== 'Enter') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      cursor = (cursor + 1) % items.length;
      updateCursor(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cursor = (cursor - 1 + items.length) % items.length;
      updateCursor(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = cursor >= 0 ? cursor : 0;
      if (items[idx]) {
        const id = items[idx].dataset.id;
        if (id) selectById(id);
      } else {
        const q = input.value.trim();
        if (!q) return;
        const matches = resolveActor(q, options.index, 1);
        if (matches[0]) options.onSelect(matches[0].actor);
      }
    } else if (e.key === 'Escape') {
      close();
      input.blur();
    }
  });

  results.addEventListener('mousedown', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLDivElement>('.results-item');
    if (!target) return;
    const id = target.dataset.id;
    if (id) selectById(id);
  });

  // Typewriter placeholder cycling — only runs while the input is empty and unfocused.
  if (options.placeholderExamples && options.placeholderExamples.length > 0) {
    startPlaceholderCycle(input, options.placeholderExamples);
  }
}

/**
 * Cycles through example names by typing them into the input's placeholder
 * one character at a time. Stops whenever the user focuses the field or types,
 * resumes when both conditions are clear again. The placeholder inherits the
 * input's `::placeholder` color, so the text reads as a faint hint, not as
 * something the user typed.
 */
function startPlaceholderCycle(input: HTMLInputElement, examples: string[]): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const TYPE_MS = 70;
  const DELETE_MS = 35;
  const HOLD_MS = 1500;
  const RESUME_DELAY_MS = 1200;

  const cursor = '|';
  const STATIC_HINT = 'Name or alias…';

  // Set the initial frame immediately so the static placeholder never flashes.
  input.placeholder = cursor;

  let i = 0;
  let charIndex = 0;
  let phase: 'typing' | 'holding' | 'deleting' = 'typing';
  let timer: number | undefined;
  let paused = false;

  const tick = () => {
    if (paused) return;
    if (input.value.length > 0 || document.activeElement === input) {
      pause();
      return;
    }

    const example = examples[i % examples.length];
    if (phase === 'typing') {
      charIndex += 1;
      input.placeholder = `${example.slice(0, charIndex)}${cursor}`;
      if (charIndex >= example.length) {
        phase = 'holding';
        timer = window.setTimeout(tick, HOLD_MS);
        return;
      }
      timer = window.setTimeout(tick, TYPE_MS);
    } else if (phase === 'holding') {
      phase = 'deleting';
      timer = window.setTimeout(tick, DELETE_MS);
    } else {
      charIndex -= 1;
      input.placeholder = `${example.slice(0, Math.max(0, charIndex))}${cursor}`;
      if (charIndex <= 0) {
        phase = 'typing';
        i += 1;
        timer = window.setTimeout(tick, TYPE_MS * 2);
        return;
      }
      timer = window.setTimeout(tick, DELETE_MS);
    }
  };

  const pause = () => {
    paused = true;
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
    // Replace the frozen mid-word frame with a clean static hint so the field
    // reads as ready-for-input the moment the user focuses it.
    input.placeholder = STATIC_HINT;
  };

  const resume = () => {
    if (!paused) return;
    if (input.value.length > 0 || document.activeElement === input) return;
    paused = false;
    // Reset to a clean re-entry into the cycle.
    charIndex = 0;
    phase = 'typing';
    timer = window.setTimeout(tick, RESUME_DELAY_MS);
  };

  input.addEventListener('focus', pause);
  input.addEventListener('input', pause);
  input.addEventListener('blur', () => {
    // Wait briefly so a click into the suggestions list doesn't immediately resume.
    window.setTimeout(resume, RESUME_DELAY_MS);
  });

  // Kick off the first tick.
  timer = window.setTimeout(tick, 400);
}
