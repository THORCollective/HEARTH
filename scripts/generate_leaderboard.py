#!/usr/bin/env python3
"""Generate the HEARTH Contributors Leaderboard (standalone, no external deps)."""

from pathlib import Path
import re
from collections import Counter


HUNT_DIRS = ["Flames", "Embers", "Alchemy"]
SKIP_NAMES = {"hearth-auto-intel"}
NO_RESPONSE_RE = re.compile(r'^[_*()\s]*no\s+response[_*()\s]*$', re.IGNORECASE)


def find_hunt_files():
    files = []
    for d in HUNT_DIRS:
        p = Path(d)
        if p.is_dir():
            files.extend(sorted(p.glob("*.md")))
    return files


def normalize_name(raw):
    """Strip markdown link syntax, leading @, and reject no-response placeholders."""
    m = re.match(r'\[([^\]]+)\]', raw)
    name = m.group(1).strip() if m else raw.strip()
    name = name.lstrip('@')
    if not name or NO_RESPONSE_RE.match(name):
        return None
    return name


def submitter_from_frontmatter(lines):
    """Parse YAML frontmatter (no external deps) and return submitter name."""
    if not lines or lines[0].strip() != '---':
        return None
    in_submitter_block = False
    for line in lines[1:]:
        if line.strip() == '---':
            break
        if re.match(r'^submitter\s*:', line):
            # Inline: submitter: Name  (plain string)
            value = line.split(':', 1)[1].strip().strip('"').strip("'")
            if value:
                return normalize_name(value)
            in_submitter_block = True
            continue
        if in_submitter_block:
            m = re.match(r'^\s+name\s*:\s*(.+)', line)
            if m:
                return normalize_name(m.group(1).strip().strip('"').strip("'"))
            # Stop if we hit another top-level key
            if re.match(r'^\S', line):
                break
    return None


def split_table_row(row):
    """Split a markdown table row on unescaped pipes."""
    cells, current, i = [], [], 0
    while i < len(row):
        if row[i] == '\\' and i + 1 < len(row) and row[i + 1] == '|':
            current.append('|')
            i += 2
        elif row[i] == '|':
            cells.append(''.join(current).strip())
            current = []
            i += 1
        else:
            current.append(row[i])
            i += 1
    cells.append(''.join(current).strip())
    return [c for c in cells if c]


def submitter_from_table(lines):
    """Parse the legacy markdown table format and return submitter name."""
    for i, line in enumerate(lines):
        if '|' not in line or 'Submitter' not in line:
            continue
        columns = split_table_row(line)
        submitter_index = next(
            (ci for ci, col in enumerate(columns)
             if 'Submitter' in re.sub(r'\*\*|\*', '', col)),
            -1,
        )
        if submitter_index < 0:
            continue
        is_last_col = submitter_index == len(columns) - 1
        data_row_index = i + 2
        if data_row_index >= len(lines):
            break
        data_row = lines[data_row_index]
        if not data_row.strip() or '|' not in data_row:
            break
        data_cells = split_table_row(data_row)
        # If Submitter is the last column, always use the last cell — unescaped
        # pipes in earlier columns can shift the index but the submitter is last.
        if is_last_col:
            return normalize_name(data_cells[-1])
        if submitter_index >= len(data_cells):
            break
        return normalize_name(data_cells[submitter_index])
    return None


def generate_leaderboard():
    all_hunts = find_hunt_files()
    contributors = []

    for hunt_file in all_hunts:
        try:
            lines = hunt_file.read_text().splitlines()
            name = submitter_from_frontmatter(lines) or submitter_from_table(lines)
            if name and name not in SKIP_NAMES:
                contributors.append(name)
        except Exception as e:
            print(f"Could not process {hunt_file}: {e}")

    counts = Counter(contributors)
    sorted_contribs = sorted(counts.items(), key=lambda x: x[1], reverse=True)

    output_lines = [
        "# \U0001f525 HEARTH Contributors Leaderboard \U0001f525\n",
        "",
        "Everyone listed below has submitted ideas that have been added to HEARTH. "
        "This list is automatically generated and updated monthly. "
        "Thank you for stoking the fire that warms our community!\n",
        "",
        "| Rank | Contributor | Hunts Submitted |",
        "|------|-------------|-----------------|",
    ]
    for rank, (name, count) in enumerate(sorted_contribs, 1):
        output_lines.append(f"| {rank} | {name} | {count} |")

    out = Path("Keepers/Contributors.md")
    out.parent.mkdir(exist_ok=True)
    out.write_text("\n".join(output_lines) + "\n")
    print(f"✅ Generated Contributors.md ({len(sorted_contribs)} contributors)")


if __name__ == "__main__":
    generate_leaderboard()
