"""Current ATT&CK Enterprise vocabulary for hunt `tactics` and `techniques`.

The source of truth is public/mitre-matrix.json, the same file the site
renders and refresh-actor-graph.yml rebuilds monthly from ATT&CK. So when
ATT&CK changes (e.g. v19 splitting Defense Evasion into Stealth and Defense
Impairment), validation follows the next refresh with no code change.

- `attack_errors` rejects anything not in the current matrix (schema check).
- `normalize_attack_fields` fixes what generators commonly emit before a
  draft is written; anything it can't map safely is left for validation to
  reject rather than guessed.
"""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path

MATRIX_PATH = Path(__file__).resolve().parent.parent / "public" / "mitre-matrix.json"

# Not a tactic, but an honest scope for hunts spanning all of them (e.g. an ML
# alert-triage model). Kept explicit so it's a deliberate choice.
SCOPE_VALUES = ("Multiple",)

# ATT&CK v19 split Defense Evasion; which half applies depends on technique.
_SPLIT_TACTICS = {"defense evasion": ("Stealth", "Defense Impairment")}

_TECH_ID_RE = re.compile(r"T\d{4}(?:\.\d{3})?")


@lru_cache(maxsize=1)
def _matrix() -> dict:
    return json.loads(MATRIX_PATH.read_text(encoding="utf-8"))


def current_tactics() -> list[str]:
    """Tactic names in ATT&CK matrix order."""
    return [t["name"] for t in _matrix()["tactics"]]


def _techniques() -> dict[str, dict]:
    return {t["id"]: t for t in _matrix()["techniques"]}


def _technique_tactics(technique_ids: list[str]) -> list[str]:
    names = {t["shortname"]: t["name"] for t in _matrix()["tactics"]}
    techs = _techniques()
    out: list[str] = []
    for tid in technique_ids:
        for short in techs.get(tid, {}).get("tactic_shortnames", []):
            if names.get(short) and names[short] not in out:
                out.append(names[short])
    return out


def attack_errors(data: dict) -> list[str]:
    """Errors for tactics/techniques that aren't current ATT&CK Enterprise."""
    errors: list[str] = []
    tactics = current_tactics()
    for value in data.get("tactics") or []:
        if value not in tactics and value not in SCOPE_VALUES:
            hint = ""
            split = _SPLIT_TACTICS.get(str(value).strip().lower())
            if split:
                hint = f" (split in ATT&CK v19: use {' and/or '.join(split)})"
            errors.append(
                f"tactics: {value!r} is not a current ATT&CK tactic{hint}. "
                f"Use one of: {', '.join(tactics)}"
            )
    techs = _techniques()
    deprecated = _matrix().get("deprecated", {})
    for tid in data.get("techniques") or []:
        if tid in techs:
            continue
        old = deprecated.get(tid)
        if old and old.get("revoked_by"):
            errors.append(
                f"techniques: {tid} ({old.get('name')}) was revoked in ATT&CK; "
                f"use {old['revoked_by']} instead"
            )
        elif old:
            errors.append(
                f"techniques: {tid} ({old.get('name')}) is deprecated in ATT&CK"
            )
        else:
            errors.append(f"techniques: {tid} is not an ATT&CK Enterprise technique")
    return errors


def normalize_attack_fields(data: dict) -> dict:
    """Return a copy with tactics/techniques mapped to current ATT&CK values.

    Handles "Execution (T1059)"-style tactics (ID moves to techniques),
    case differences, revoked technique IDs, and Defense Evasion when the
    hunt's own techniques decide it. Anything else is left unchanged.
    """
    out = dict(data)
    techs = _techniques()
    deprecated = _matrix().get("deprecated", {})
    by_lower = {t.lower(): t for t in current_tactics()}

    techniques: list[str] = []
    for tid in data.get("techniques") or []:
        new = (deprecated.get(tid) or {}).get("revoked_by") or tid
        if new not in techniques:
            techniques.append(new)

    tactics: list[str] = []
    pending_split: list[str] = []
    for raw in data.get("tactics") or []:
        for tid in _TECH_ID_RE.findall(str(raw)):
            if tid in techs and tid not in techniques:
                techniques.append(tid)
        base = re.sub(r"\([^)]*\)?", "", str(raw)).strip()
        key = base.lower()
        if key in by_lower:
            tactics.append(by_lower[key])
        elif key in _SPLIT_TACTICS:
            pending_split.append(base)
        else:
            tactics.append(raw)

    # Resolve Defense Evasion from techniques; if they don't decide it, keep
    # the original so validation rejects it instead of guessing.
    if pending_split:
        covered = _technique_tactics(techniques)
        for base in pending_split:
            mapped = [t for t in _SPLIT_TACTICS[base.lower()] if t in covered]
            tactics.extend(mapped or [base])

    deduped: list[str] = []
    for t in tactics:
        if t not in deduped:
            deduped.append(t)
    if "tactics" in data:
        out["tactics"] = deduped
    if techniques or "techniques" in data:
        out["techniques"] = techniques
    return out
