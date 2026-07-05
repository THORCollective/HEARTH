#!/usr/bin/env python3
"""Build a slim MITRE ATT&CK matrix JSON for the Coverage Heatmap page.

Reads data/enterprise-attack.json (downloaded from mitre/cti) and writes
public/mitre-matrix.json with the tactics + techniques the frontend needs, plus:
  - `platforms` on each technique (for local OS validation by the CTI pipeline)
  - a top-level `deprecated` map of retired ID → replacement (revoked-by)
Both are additive; existing consumers that read `tactics`/`techniques` are unaffected.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "enterprise-attack.json"
TARGET = ROOT / "public" / "mitre-matrix.json"
DESC_MAX_CHARS = 200


def main() -> int:
    if not SOURCE.exists():
        print(f"ERROR: {SOURCE} not found. See plan pre-flight.", file=sys.stderr)
        return 1

    bundle = json.loads(SOURCE.read_text())
    objects = bundle.get("objects", [])

    tactics: list[dict] = []
    techniques: list[dict] = []

    for obj in objects:
        if obj.get("type") != "x-mitre-tactic" or obj.get("revoked") or obj.get("x_mitre_deprecated"):
            continue
        tactics.append({
            "id": _ext_id(obj),
            "shortname": obj.get("x_mitre_shortname", ""),
            "name": obj.get("name", ""),
        })

    for obj in objects:
        if obj.get("type") != "attack-pattern" or obj.get("revoked") or obj.get("x_mitre_deprecated"):
            continue
        ext_id = _ext_id(obj)
        if not ext_id:
            continue
        parent = ext_id.split(".")[0] if "." in ext_id else None
        tactic_shortnames = [
            p.get("phase_name", "")
            for p in obj.get("kill_chain_phases", [])
            if p.get("kill_chain_name") == "mitre-attack"
        ]
        desc = (obj.get("description") or "").strip()
        if len(desc) > DESC_MAX_CHARS:
            desc = desc[:DESC_MAX_CHARS].rsplit(" ", 1)[0] + "…"
        techniques.append({
            "id": ext_id,
            "name": obj.get("name", ""),
            "parent": parent,
            "tactic_shortnames": tactic_shortnames,
            "description": desc,
            "url": _ext_url(obj),
            "is_subtechnique": bool(obj.get("x_mitre_is_subtechnique")),
            # Platforms let downstream consumers (e.g. the CTI pipeline's hunt
            # generator) validate a technique's OS locally instead of WebFetching
            # its ATT&CK page. Empty list if ATT&CK doesn't scope the technique.
            "platforms": obj.get("x_mitre_platforms", []),
        })

    # Deprecated/revoked redirect map. Active techniques above deliberately exclude
    # these, but the CTI pipeline needs them: a CTI report may cite an ID that ATT&CK
    # has since retired (e.g. T1158 → T1564.001), and the generator should follow the
    # redirect rather than WebFetch to discover it. Keyed by the retired ID; value
    # carries the replacement (revoked-by) when ATT&CK provides one.
    deprecated = _build_deprecated_map(objects)

    order = _tactic_order(objects)
    tactics.sort(key=lambda t: order.get(t["shortname"], 999))

    def tech_key(t: dict) -> tuple:
        first_tactic = t["tactic_shortnames"][0] if t["tactic_shortnames"] else ""
        return (order.get(first_tactic, 999), t["id"])

    techniques.sort(key=tech_key)

    payload = {"tactics": tactics, "techniques": techniques, "deprecated": deprecated}
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    size_kb = TARGET.stat().st_size / 1024
    print(f"Wrote {TARGET} — {len(tactics)} tactics, {len(techniques)} techniques, "
          f"{len(deprecated)} deprecated, {size_kb:.1f} KB")
    return 0


def _build_deprecated_map(objects: list[dict]) -> dict[str, dict]:
    """Map each retired (revoked or deprecated) technique ID to its replacement.

    `revoked_by` resolves the STIX `revoked-by` relationship to the successor's
    external technique ID (or None when ATT&CK deprecated a technique without a
    direct replacement). Lets consumers follow a retired ID → current ID locally
    instead of discovering the redirect via a live ATT&CK page fetch.
    """
    stix_to_ext = {
        o["id"]: _ext_id(o)
        for o in objects
        if o.get("type") == "attack-pattern" and _ext_id(o)
    }
    revoked_by = {
        r["source_ref"]: r["target_ref"]
        for r in objects
        if r.get("type") == "relationship" and r.get("relationship_type") == "revoked-by"
    }
    deprecated: dict[str, dict] = {}
    for obj in objects:
        if obj.get("type") != "attack-pattern":
            continue
        if not (obj.get("revoked") or obj.get("x_mitre_deprecated")):
            continue
        ext_id = _ext_id(obj)
        if not ext_id:
            continue
        successor = stix_to_ext.get(revoked_by.get(obj["id"], ""), "") or None
        deprecated[ext_id] = {
            "name": obj.get("name", ""),
            "revoked": bool(obj.get("revoked")),
            "revoked_by": successor,
        }
    return deprecated


def _ext_id(obj: dict) -> str:
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack":
            return ref.get("external_id", "")
    return ""


def _ext_url(obj: dict) -> str:
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack":
            return ref.get("url", "")
    return ""


def _tactic_order(objects: list[dict]) -> dict[str, int]:
    """Pull the canonical tactic order from the x-mitre-matrix object."""
    for obj in objects:
        if obj.get("type") != "x-mitre-matrix":
            continue
        tactic_refs = obj.get("tactic_refs", [])
        id_to_shortname = {
            o["id"]: o.get("x_mitre_shortname", "")
            for o in objects
            if o.get("type") == "x-mitre-tactic"
        }
        return {id_to_shortname[ref]: i for i, ref in enumerate(tactic_refs) if ref in id_to_shortname}
    return {}


if __name__ == "__main__":
    sys.exit(main())
