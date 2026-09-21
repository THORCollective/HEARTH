"""
Build public/actor-mentions.json.

For each MITRE-mapped threat actor in public/context-graph-data.json, find the
hunts in public/hunts-data.json whose prose (title / why / notes / references)
mentions the actor's display name or any alias.

Matching rules:
  - case-insensitive
  - word-boundary (\\b...\\b) — so "APT29" doesn't match inside "APT299"
  - minimum search-term length: MIN_ALIAS_LEN characters
  - per-actor alias denylist suppresses individual (actor_id, alias) pairs
    that produce false positives (loaded from scripts/actor_alias_denylist.json)

Output shape:
  {
    "min_alias_len": 4,
    "mentions": {
      "actor:G0016": ["H012", "H034"],
      ...
    }
  }
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Iterable

MIN_ALIAS_LEN = 4
REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONTEXT_GRAPH = REPO_ROOT / "public" / "context-graph-data.json"
DEFAULT_HUNTS = REPO_ROOT / "public" / "hunts-data.json"
DEFAULT_DENYLIST = REPO_ROOT / "scripts" / "actor_alias_denylist.json"
DEFAULT_OUTPUT = REPO_ROOT / "public" / "actor-mentions.json"


def load_actors(context_graph: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract threat_actor nodes from a context-graph-data.json dict."""
    return [n for n in context_graph.get("nodes", []) if n.get("type") == "threat_actor"]


def load_denylist(path: Path) -> dict[str, set[str]]:
    """Load (actor_id -> set of lowercased aliases to skip) from JSON."""
    if not path.exists():
        return {}
    raw = json.loads(path.read_text())
    return {
        actor_id: {alias.lower() for alias in aliases}
        for actor_id, aliases in raw.get("denylist", {}).items()
    }


def search_terms_for(actor: dict[str, Any], denylist: dict[str, set[str]]) -> list[str]:
    """
    Resolve the list of name/alias strings we'll search hunt prose for.
    Filters out short terms and denylisted aliases. Deduplicates case-insensitively.
    """
    actor_id = actor.get("id", "")
    skip = denylist.get(actor_id, set())

    candidates: list[str] = []
    label = actor.get("label")
    if isinstance(label, str):
        candidates.append(label)
    aliases = actor.get("aliases") or []
    for a in aliases:
        if isinstance(a, str):
            candidates.append(a)

    seen: set[str] = set()
    out: list[str] = []
    for term in candidates:
        t = term.strip()
        if len(t) < MIN_ALIAS_LEN:
            continue
        if t.lower() in skip:
            continue
        if t.lower() in seen:
            continue
        seen.add(t.lower())
        out.append(t)
    return out


def hunt_searchable_text(hunt: dict[str, Any]) -> str:
    """Concatenate the hunt fields we want to scan for actor mentions."""
    parts: list[str] = []
    for key in ("title", "why", "notes", "references"):
        val = hunt.get(key)
        if isinstance(val, str):
            parts.append(val)
    return "\n".join(parts)


def find_mentions(
    actors: list[dict[str, Any]],
    hunts: list[dict[str, Any]],
    denylist: dict[str, set[str]],
) -> dict[str, list[str]]:
    """
    Return {actor_id: [hunt_id, ...]} for actors with at least one mention.
    Hunt IDs preserve the input hunt order; duplicates removed.
    """
    # Precompute lowercased hunt text once.
    hunt_text: list[tuple[str, str]] = [
        (h.get("id", ""), hunt_searchable_text(h).lower()) for h in hunts
    ]

    out: dict[str, list[str]] = {}
    for actor in actors:
        actor_id = actor.get("id", "")
        if not actor_id:
            continue
        terms = search_terms_for(actor, denylist)
        if not terms:
            continue
        # Build one alternation regex per actor for efficiency.
        pattern = re.compile(
            r"\b(?:" + "|".join(re.escape(t.lower()) for t in terms) + r")\b"
        )
        matched: list[str] = []
        seen: set[str] = set()
        for hunt_id, text in hunt_text:
            if not hunt_id or hunt_id in seen:
                continue
            if pattern.search(text):
                matched.append(hunt_id)
                seen.add(hunt_id)
        if matched:
            out[actor_id] = matched
    return out


def build(
    context_graph_path: Path = DEFAULT_CONTEXT_GRAPH,
    hunts_path: Path = DEFAULT_HUNTS,
    denylist_path: Path = DEFAULT_DENYLIST,
    output_path: Path = DEFAULT_OUTPUT,
) -> dict[str, Any]:
    """Run the full pipeline. Writes output_path and returns the written dict."""
    context_graph = json.loads(context_graph_path.read_text())
    hunts = json.loads(hunts_path.read_text())
    denylist = load_denylist(denylist_path)

    actors = load_actors(context_graph)
    mentions = find_mentions(actors, hunts, denylist)

    # No `generated_at`: this file is a build artifact committed to the repo, so a
    # timestamp makes two rebuilds of identical input differ by one line. That is not
    # merely churn — the CI rebuild commits these files and rebases on a push race, so
    # a guaranteed-differing line meant a guaranteed rebase conflict whenever two
    # merges landed close together, which silently left the committed index stale.
    # Same rationale as scripts/fetch_activity.cjs. Recency comes from git history.
    payload = {
        "min_alias_len": MIN_ALIAS_LEN,
        "mentions": mentions,
    }
    output_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    return payload


if __name__ == "__main__":
    written = build()
    print(
        f"Wrote {DEFAULT_OUTPUT.relative_to(REPO_ROOT)} "
        f"with {len(written['mentions'])} actors having mentions."
    )
