#!/usr/bin/env python3
"""
Script to parse HEARTH hunt markdown files and generate JSON data for the web interface.
"""

import json
from pathlib import Path
from hearth.utils.markdown import (
    find_table_header_line,
    clean_markdown_formatting,
    extract_submitter_info,
    extract_content_section,
    parse_tag_list
)


def parse_markdown_file(file_path, category):
    """Parse a single markdown hunt file and extract relevant data."""
    try:
        content = read_file_content(file_path)
        hunt_id = file_path.stem

        if hunt_id.lower() == 'secret':
            return None

        table_data = extract_table_data(content)
        sections = extract_content_sections(content)
        submitter_info = extract_submitter_info(table_data.get('submitter', ''))

        return build_hunt_object(
            hunt_id=table_data.get('hunt_id', hunt_id),
            category=category,
            table_data=table_data,
            sections=sections,
            submitter_info=submitter_info,
            file_path=file_path
        )
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return None


def read_file_content(file_path):
    """Read and return file content."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()


def extract_table_data(content):
    """Extract data from markdown table."""
    lines = content.split('\n')
    table_start_index = find_table_header_line(lines)

    if table_start_index is None:
        return get_empty_table_data()

    return parse_table_row(lines, table_start_index)

# Using shared utility function from hunt_parser_utils


def parse_table_row(lines, table_start_index):
    """Parse the data row from the table."""
    data_row_index = table_start_index + 2

    if data_row_index >= len(lines):
        return get_empty_table_data()

    data_row = lines[data_row_index]
    cells = [cell.strip() for cell in data_row.split('|') if cell.strip()]

    if len(cells) >= 6:
        return {
            'hunt_id': clean_markdown_formatting(cells[0]),
            'idea': clean_markdown_formatting(cells[1]),
            'tactic': clean_markdown_formatting(cells[2]),
            'notes': clean_markdown_formatting(cells[3]),
            'tags': clean_markdown_formatting(cells[4]),
            'submitter': clean_markdown_formatting(cells[5])
        }

    return get_empty_table_data()


def get_empty_table_data():
    """Return empty table data structure."""
    return {
        'hunt_id': '',
        'idea': '',
        'tactic': '',
        'notes': '',
        'tags': '',
        'submitter': ''
    }


def clean_markdown_formatting(text):
    """Remove markdown formatting from text."""
    return text.replace('**', '').strip()


def extract_content_sections(content):
    """Extract Why and References sections from content."""
    why_section = extract_content_section(content, 'Why')
    references_section = extract_content_section(content, 'References')

    return {
        'why': why_section,
        'references': references_section
    }

# Using shared utility functions


def build_hunt_object(hunt_id, category, table_data, sections, submitter_info, file_path):
    """Build the final hunt object."""
    return {
        "id": hunt_id,
        "category": category,
        "title": table_data['idea'],
        "tactic": table_data['tactic'],
        "notes": table_data['notes'],
        "tags": parse_tag_list(table_data['tags']),
        "submitter": submitter_info,
        "why": sections['why'],
        "references": sections['references'],
        "file_path": str(file_path.relative_to(Path(__file__).parent.parent))
    }


def main():
    """Main function to parse all hunt files and generate JSON."""
    base_dir = Path(__file__).parent.parent
    categories = ['Flames', 'Embers', 'Alchemy']

    all_hunts = []

    for category in categories:
        category_dir = base_dir / category
        if category_dir.exists():
            print(f"Processing {category}...")

            for md_file in category_dir.glob('*.md'):
                hunt_data = parse_markdown_file(md_file, category)
                if hunt_data:
                    all_hunts.append(hunt_data)
                    print(f"  Parsed {hunt_data['id']}")

    # Sort hunts by ID
    all_hunts.sort(key=lambda x: x['id'])

    # Generate JSON file
    output_file = base_dir / 'public' / 'hunts-data.json'

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_hunts, f, indent=2, ensure_ascii=False)

    print(f"\nGenerated {output_file} with {len(all_hunts)} hunts")

    # Print statistics
    print("\nStatistics:")
    for category in categories:
        count = len([h for h in all_hunts if h['category'] == category])
        print(f"  {category}: {count} hunts")

    # Print unique tactics
    tactics = set()
    for hunt in all_hunts:
        if hunt['tactic']:
            tactics.update([t.strip() for t in hunt['tactic'].split(',')])

    print(f"\nUnique tactics: {len(tactics)}")
    for tactic in sorted(tactics):
        print(f"  - {tactic}")

    # Print unique tags
    all_tags = set()
    for hunt in all_hunts:
        all_tags.update(hunt['tags'])

    print(f"\nUnique tags: {len(all_tags)}")
    for tag in sorted(all_tags):
        print(f"  - #{tag}")


if __name__ == "__main__":
    main()
