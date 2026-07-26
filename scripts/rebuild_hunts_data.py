#!/usr/bin/env python3
"""
Standalone script to rebuild hunts-data.js from markdown files.
No external dependencies — pure stdlib.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

# A hunt markdown file: H### (Flames), B### (Embers), M### (Alchemy).
HUNT_FILE_RE = re.compile(r"^[HBM]\d+\.md$")

# Directories that legitimately contain no hunts; skipped when scanning for
# hunt files that have been filed outside a category directory.
NON_HUNT_DIRS = {".git", ".github", "node_modules", ".venv", "public", "scripts", "assets", "docs"}

_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)


def git_created_date(file_path):
    """Return the ISO 8601 date a hunt file first landed in git history.

    Uses --follow so files that were moved/renamed (e.g. the Embers
    reorganization) report their original creation date, not the move date.
    Returns None when history is unavailable — a shallow clone (no
    fetch-depth: 0) or an uncommitted file — so the frontend can degrade
    gracefully rather than show a wrong time.
    """
    try:
        out = subprocess.run(
            [
                "git",
                "log",
                "--follow",
                "--diff-filter=A",
                "--format=%aI",
                "-1",
                "--",
                file_path,
            ],
            cwd=_REPO_ROOT,
            capture_output=True,
            text=True,
            check=False,
        ).stdout.strip()
    except OSError:
        return None
    return out or None


# Canonical submitter names — coalesce duplicates and add links
SUBMITTER_MAP = {
    # Jinx variants
    "Jinx (THOR Collective)": {"name": "Jinx (THOR Collective)", "link": ""},
    "Jinx (automated)": {"name": "Jinx (THOR Collective)", "link": ""},
    # Bot submissions
    "hearth-auto-intel": {
        "name": "HEARTH Bot",
        "link": "https://github.com/THORCollective/HEARTH",
    },
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
        # Merge techniques into tags so HuntFinder's /^T\d{4}/ filter finds them.
        # Techniques live in a separate frontmatter field but the frontend only
        # checks hunt.tags, so we combine both here without duplicates.
        "tags": list(
            dict.fromkeys(parsed.get("tags", []) + parsed.get("techniques", []))
        ),
        "techniques": parsed.get("techniques", []),
        "severity": parsed.get("severity"),
        "status": parsed.get("status", "current"),
        "related_hunt_ids": parsed.get("related_hunt_ids", []),
        "submitter": submitter,
        "why": parsed["why"],
        "references": parsed["references"],
        "file_path": parsed["file_path"],
        # Real creation timestamp from git, used by the home page activity feed.
        "created": git_created_date(parsed["file_path"]),
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


def find_stray_hunts(base, categories):
    """Hunt files sitting outside the canonical category directories.

    These are invisible to this indexer, so they never reach hunts-data.json —
    and anything deriving the next free hunt ID from that index will hand out a
    number that is already taken. This is exactly how H240 came to be used
    twice: one hunt was filed under `Command and Control/` (a MITRE tactic, not
    a HEARTH category), so it was never indexed and its ID looked free.
    """
    stray = []
    for path in sorted(base.rglob("*.md")):
        if not HUNT_FILE_RE.match(path.name):
            continue
        rel = path.relative_to(base)
        top = rel.parts[0]
        if top in categories or top in NON_HUNT_DIRS or top.startswith("."):
            continue
        stray.append(rel)
    return stray


def main():
    base = Path(__file__).parent.parent
    categories = {"Flames": "Flames", "Embers": "Embers", "Alchemy": "Alchemy"}

    stray = find_stray_hunts(base, categories)
    if stray:
        print("ERROR: hunt files found outside the category directories:", file=sys.stderr)
        for rel in stray:
            print(f"  {rel}", file=sys.stderr)
        print(
            "\nThese never get indexed, so their IDs look free and get reissued.\n"
            f"Move each into one of: {', '.join(sorted(categories))} "
            "(and set its `category:` frontmatter to match).",
            file=sys.stderr,
        )
        sys.exit(1)

    all_hunts = []
    id_sources = {}
    for dirname, cat_name in categories.items():
        cat_dir = base / dirname
        if not cat_dir.exists():
            continue
        for md in sorted(cat_dir.glob("*.md")):
            hunt = parse_hunt_file(md, cat_name)
            if hunt:
                all_hunts.append(hunt)
                id_sources.setdefault(hunt["id"], []).append(str(md.relative_to(base)))
                print(f"  Parsed {hunt['id']}")

    # Two hunts claiming one ID means whichever sorts last silently wins in the
    # index, and the site renders one of them under the other's number.
    duplicates = {hid: paths for hid, paths in id_sources.items() if len(paths) > 1}
    if duplicates:
        print("ERROR: duplicate hunt IDs:", file=sys.stderr)
        for hid, paths in sorted(duplicates.items()):
            print(f"  {hid}: {', '.join(paths)}", file=sys.stderr)
        print("\nRenumber one of each pair to the next free ID.", file=sys.stderr)
        sys.exit(1)

    all_hunts.sort(key=lambda x: x["id"])

    # Write JS version
    js_path = base / "hunts-data.js"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("// Auto-generated hunt data from markdown files\n")
        f.write("const HUNTS_DATA = ")
        json.dump(all_hunts, f, indent=2, ensure_ascii=False)
        f.write(";\n")

    # Write JSON version
    json_path = base / "public" / "hunts-data.json"
    json_path.parent.mkdir(exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_hunts, f, indent=2, ensure_ascii=False)

    print(f"\nGenerated {len(all_hunts)} hunts")
    for cat in categories:
        count = len([h for h in all_hunts if h["category"] == cat])
        print(f"  {cat}: {count}")

    # Refresh the actor-mentions index so the Actors page stays in sync with hunt prose.
    # Failure here is non-fatal — the page falls back to technique-only matching if the
    # mentions file is stale or missing.
    try:
        from scripts.build_actor_mentions import build as build_actor_mentions

        result = build_actor_mentions()
        print(f"  Refreshed actor-mentions.json ({len(result['mentions'])} actors)")
    except Exception as exc:  # noqa: BLE001 — non-fatal best-effort refresh
        print(f"  ! actor-mentions refresh failed: {exc}")


if __name__ == "__main__":
    main()
