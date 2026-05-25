#!/usr/bin/env python3
"""Build a slim MITRE ATT&CK matrix JSON for the Coverage Heatmap page.

Reads data/enterprise-attack.json (downloaded from mitre/cti) and writes
public/mitre-matrix.json with just the tactics + techniques the frontend needs.
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
        })

    order = _tactic_order(objects)
    tactics.sort(key=lambda t: order.get(t["shortname"], 999))

    def tech_key(t: dict) -> tuple:
        first_tactic = t["tactic_shortnames"][0] if t["tactic_shortnames"] else ""
        return (order.get(first_tactic, 999), t["id"])

    techniques.sort(key=tech_key)

    payload = {"tactics": tactics, "techniques": techniques}
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")

    size_kb = TARGET.stat().st_size / 1024
    print(f"Wrote {TARGET} — {len(tactics)} tactics, {len(techniques)} techniques, {size_kb:.1f} KB")
    return 0


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
