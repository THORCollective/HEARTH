#!/usr/bin/env python3
"""
Standalone script to rebuild hunts-data.js from markdown files.
No external dependencies — pure stdlib.
"""
import json
import re
import sys
from pathlib import Path

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)


# Canonical submitter names — coalesce duplicates and add links
SUBMITTER_MAP = {
    # Jinx variants
    "Jinx (THOR Collective)": {"name": "Jinx (THOR Collective)", "link": ""},
    "Jinx (automated)": {"name": "Jinx (THOR Collective)", "link": ""},
    # Bot submissions
    "hearth-auto-intel": {"name": "HEARTH Bot", "link": "https://github.com/THORCollective/HEARTH"},
    # p-o-s-t variants
    "p-o-s-t": {"name": "p-o-s-t", "link": "https://github.com/p-o-s-t"},
    "@p-o-s-t": {"name": "p-o-s-t", "link": "https://github.com/p-o-s-t"},
    # Azrara variants
    "Azrara": {"name": "Azrara", "link": "https://www.linkedin.com/in/azrara/"},
    # tsof-smoky
    "@tsof-smoky": {"name": "tsof-smoky", "link": ""},
    # samuel-lucas6
    "@samuel-lucas6": {"name": "samuel-lucas6", "link": ""},
    # Cleanup
    "_(No response)_": {"name": "Anonymous", "link": ""},
    "**Submitter**": None,  # Header row — skip
}


def parse_hunt_file(path, category):
    """Delegate to scripts.hunt_parser; reshape for frontend consumption."""
    from scripts.hunt_parser import parse_hunt_file as _parse

    parsed = _parse(path, category)
    if parsed["id"].lower() == "secret":
        return None

    submitter = parse_submitter_from_dict(parsed["submitter"])
    return {
        "id": parsed["id"],
        "category": category,
        "title": parsed.get("title") or parsed["hypothesis"],
        "tactic": ", ".join(parsed.get("tactics", [])),
        "notes": parsed.get("notes", ""),
        "tags": parsed.get("tags", []),
        "techniques": parsed.get("techniques", []),
        "severity": parsed.get("severity"),
        "status": parsed.get("status", "current"),
        "related_hunt_ids": parsed.get("related_hunt_ids", []),
        "submitter": submitter,
        "why": parsed["why"],
        "references": parsed["references"],
        "file_path": parsed["file_path"],
    }


def parse_submitter_from_dict(submitter):
    """Apply SUBMITTER_MAP normalization to a {name, link} dict."""
    name = submitter.get("name", "").strip()
    if name in SUBMITTER_MAP:
        override = SUBMITTER_MAP[name]
        if override is None:
            return {"name": "Anonymous", "link": ""}
        return override
    return {"name": name or "Anonymous", "link": submitter.get("link", "")}


def main():
    base = Path(__file__).parent.parent
    categories = {
        'Flames': 'Flames',
        'Embers': 'Embers',
        'Alchemy': 'Alchemy'
    }

    all_hunts = []
    for dirname, cat_name in categories.items():
        cat_dir = base / dirname
        if not cat_dir.exists():
            continue
        for md in sorted(cat_dir.glob('*.md')):
            hunt = parse_hunt_file(md, cat_name)
            if hunt:
                all_hunts.append(hunt)
                print(f"  Parsed {hunt['id']}")

    all_hunts.sort(key=lambda x: x['id'])

    # Write JS version
    js_path = base / 'hunts-data.js'
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write('// Auto-generated hunt data from markdown files\n')
        f.write('const HUNTS_DATA = ')
        json.dump(all_hunts, f, indent=2, ensure_ascii=False)
        f.write(';\n')

    # Write JSON version
    json_path = base / 'public' / 'hunts-data.json'
    json_path.parent.mkdir(exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_hunts, f, indent=2, ensure_ascii=False)

    print(f"\nGenerated {len(all_hunts)} hunts")
    for cat in categories:
        count = len([h for h in all_hunts if h['category'] == cat])
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
