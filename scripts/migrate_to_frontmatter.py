"""
Migrate hunt markdown files from the legacy 6-cell table format to YAML
frontmatter. Idempotent: re-running on an already-migrated file is a no-op.

Usage:
    python scripts/migrate_to_frontmatter.py [--dry-run] [--path PATH]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Bootstrap sys.path so this script works from any CWD.
_REPO_ROOT = str(Path(__file__).resolve().parent.parent)
if _REPO_ROOT not in sys.path:
    sys.path.insert(0, _REPO_ROOT)

import frontmatter

from scripts.hunt_parser import _parse_legacy_table
from scripts.hunt_schema import validate_hunt


CATEGORY_DIRS = ("Flames", "Embers", "Alchemy")
SKIP_FILENAMES = {"secret.md"}  # Easter egg / non-hunt files

_TABLE_BLOCK_RE = re.compile(
    r"^\|.*Hunt\s*#.*\n\|.*\n\|.*\n", re.MULTILINE
)


def _build_body(raw: str) -> str:
    """Strip leading HTML comments, the H1, the legacy table, and intro paragraph; keep the rest."""
    no_html_comment = re.sub(r"^<!--.*?-->\s*\n", "", raw, count=1, flags=re.DOTALL)
    no_table = _TABLE_BLOCK_RE.sub("", no_html_comment, count=1)
    no_h1 = re.sub(r"^# .+\n+", "", no_table, count=1)
    no_intro = re.sub(r"^[^\n#].*?\n+(?=## )", "", no_h1, count=1, flags=re.DOTALL)
    return no_intro.strip() + "\n"


def migrate_file(path: Path, category: str, dry_run: bool) -> bool:
    """Convert a single file. Returns True if a change was (or would be) made."""
    if path.name in SKIP_FILENAMES:
        return False

    raw = path.read_text(encoding="utf-8")
    post = frontmatter.loads(raw)
    if post.metadata:
        return False  # already migrated

    parsed = _parse_legacy_table(raw, hunt_id=path.stem, category=category)
    metadata = {
        "id": parsed["id"],
        "category": category,
        "hypothesis": parsed["hypothesis"],
        "tactics": parsed["tactics"],
        "tags": parsed["tags"],
        "submitter": parsed["submitter"],
    }
    if parsed.get("techniques"):
        metadata["techniques"] = parsed["techniques"]
    if parsed.get("notes"):
        metadata["notes"] = parsed["notes"]

    errors = validate_hunt(metadata)
    if errors:
        raise ValueError(
            f"{path.name}: cannot migrate, validation failed:\n  " + "\n  ".join(errors)
        )

    body = _build_body(raw)
    new_post = frontmatter.Post(content=body, **metadata)
    output = frontmatter.dumps(new_post) + "\n"

    if dry_run:
        return True
    path.write_text(output, encoding="utf-8")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--path", type=Path, help="Single file (overrides directory scan)")
    args = parser.parse_args()

    targets: list[tuple[Path, str]] = []
    if args.path:
        targets.append((args.path, args.path.parent.name))
    else:
        for d in CATEGORY_DIRS:
            for f in sorted(Path(d).glob("*.md")):
                targets.append((f, d))

    changed = 0
    skipped = 0
    failed = 0
    for path, category in targets:
        try:
            if migrate_file(path, category, dry_run=args.dry_run):
                action = "WOULD MIGRATE" if args.dry_run else "migrated"
                print(f"  {action}: {path}")
                changed += 1
            else:
                skipped += 1
        except Exception as exc:
            print(f"  FAIL: {path}: {exc}", file=sys.stderr)
            failed += 1

    print(f"\nTotals: changed={changed} skipped={skipped} failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
