#!/usr/bin/env python3
"""
Standalone script to rebuild hunts-data.js from markdown files.
No external dependencies — pure stdlib.
"""
import json
import re
from pathlib import Path


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


def parse_submitter(raw):
    """Extract name and link from markdown link syntax, then normalize."""
    # Try markdown link first
    match = re.match(r'\[([^\]]+)\]\(([^)]+)\)', raw)
    if match:
        name, link = match.group(1), match.group(2)
        # Check if the extracted name has a canonical override
        if name in SUBMITTER_MAP:
            override = SUBMITTER_MAP[name]
            if override is None:
                return None
            return override
        return {"name": name, "link": link}

    stripped = raw.strip()
    if stripped in SUBMITTER_MAP:
        override = SUBMITTER_MAP[stripped]
        if override is None:
            return None
        return override
    return {"name": stripped, "link": ""}


def parse_tags(raw):
    """Extract tags from #tag format."""
    return [t.strip().lstrip('#').replace('-', '_') for t in re.findall(r'#[\w\-\.]+', raw)]


def extract_section(content, header):
    """Extract content under a ## header."""
    pattern = rf'^## {header}\s*\n(.*?)(?=^## |\Z)'
    match = re.search(pattern, content, re.MULTILINE | re.DOTALL)
    return match.group(1).strip() if match else ""


def parse_hunt_file(path, category):
    """Parse a single hunt markdown file."""
    content = path.read_text(encoding='utf-8')
    hunt_id = path.stem

    if hunt_id.lower() == 'secret':
        return None

    lines = content.split('\n')

    # Find table data row (skip header + separator)
    table_start = None
    for i, line in enumerate(lines):
        if '|' in line and ('Hunt #' in line or 'Hunt#' in line or 'Idea' in line):
            table_start = i
            break

    if table_start is None:
        # Try finding any table-like structure
        for i, line in enumerate(lines):
            if line.startswith('|') and '---' not in line:
                table_start = i
                break

    cells = ['', '', '', '', '', '']
    if table_start is not None:
        data_row_idx = table_start + 2
        if data_row_idx < len(lines):
            raw_cells = [c.strip() for c in lines[data_row_idx].split('|') if c.strip()]
            for j, c in enumerate(raw_cells[:6]):
                cells[j] = c

    title = re.sub(r'\*\*', '', cells[1]).strip() if cells[1] else ""
    # Fallback: use first non-header, non-empty line
    if not title:
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('|'):
                title = line
                break

    return {
        "id": cells[0].strip() or hunt_id,
        "category": category,
        "title": title,
        "tactic": re.sub(r'\*\*', '', cells[2]).strip(),
        "notes": re.sub(r'\*\*', '', cells[3]).strip(),
        "tags": parse_tags(cells[4]),
        "submitter": parse_submitter(cells[5]) or {"name": "Anonymous", "link": ""},
        "why": extract_section(content, 'Why'),
        "references": extract_section(content, 'References'),
        "file_path": f"{category}/{path.name}"
    }


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
