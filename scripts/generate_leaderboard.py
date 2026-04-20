#!/usr/bin/env python3
"""Generate the HEARTH Contributors Leaderboard (standalone, no external deps)."""

from pathlib import Path
import re
from collections import Counter


HUNT_DIRS = ["Flames", "Embers", "Alchemy"]


def find_hunt_files():
    """Find all hunt markdown files across hunt directories."""
    files = []
    for d in HUNT_DIRS:
        p = Path(d)
        if p.is_dir():
            files.extend(sorted(p.glob("*.md")))
    return files


def split_table_row(row):
    """Split a markdown table row on unescaped pipes, ignoring \\| inside cells."""
    cells = []
    current = []
    i = 0
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


def extract_submitter(cell):
    """Extract contributor name from a markdown link or plain text."""
    # [Name](url) pattern
    m = re.match(r'\[([^\]]+)\]', cell)
    if m:
        return m.group(1).strip()
    return cell.strip()


def generate_leaderboard():
    """Scans all hunts, counts contributions, and generates Contributors.md."""
    all_hunts = find_hunt_files()
    contributors = []

    for hunt_file in all_hunts:
        try:
            content = hunt_file.read_text()
            lines = content.splitlines()

            # Find the table header line that contains "Submitter"
            header_line_index = -1
            submitter_index = -1

            for i, line in enumerate(lines):
                if '|' in line and 'Submitter' in line:
                    columns = split_table_row(line)
                    for ci, col in enumerate(columns):
                        clean_col = re.sub(r'\*\*|\*', '', col).strip()
                        if "Submitter" in clean_col:
                            submitter_index = ci
                            break
                    if submitter_index >= 0:
                        header_line_index = i
                        break

            if header_line_index < 0 or submitter_index < 0:
                continue

            # Data row is 2 lines after header (skip separator)
            data_row_index = header_line_index + 2
            if data_row_index >= len(lines):
                continue

            data_row = lines[data_row_index]
            if not data_row.strip() or '|' not in data_row:
                continue

            data_cells = split_table_row(data_row)
            if submitter_index >= len(data_cells):
                continue

            name = extract_submitter(data_cells[submitter_index])
            if name and name != "hearth-auto-intel":
                contributors.append(name)
        except Exception as e:
            print(f"Could not process {hunt_file}: {e}")

    counts = Counter(contributors)
    sorted_contribs = sorted(counts.items(), key=lambda x: x[1], reverse=True)

    # Build markdown
    lines = [
        "# 🔥 HEARTH Contributors Leaderboard 🔥\n",
        "",
        "Everyone listed below has submitted ideas that have been added to HEARTH. "
        "This list is automatically generated and updated monthly. "
        "Thank you for stoking the fire that warms our community!\n",
        "",
        "| Rank | Contributor | Hunts Submitted |",
        "|------|-------------|-----------------|",
    ]
    for rank, (name, count) in enumerate(sorted_contribs, 1):
        lines.append(f"| {rank} | {name} | {count} |")

    out = Path("Keepers/Contributors.md")
    out.parent.mkdir(exist_ok=True)
    out.write_text("\n".join(lines) + "\n")
    print(f"✅ Generated Contributors.md ({len(sorted_contribs)} contributors)")


if __name__ == "__main__":
    generate_leaderboard()
