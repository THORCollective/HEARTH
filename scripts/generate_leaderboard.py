from pathlib import Path
import re
from collections import Counter
from hunt_parser_utils import (
    find_hunt_files,
    extract_submitter_info
)


def extract_contributor_name(cell_content):
    """Extracts the contributor's name from a markdown link or plain text."""
    submitter_info = extract_submitter_info(cell_content)
    return submitter_info['name'] if submitter_info['name'] else cell_content.strip()

# Using shared utility function - no need to redefine


def generate_leaderboard():
    """Scans all hunts, counts contributions, and generates a new Contributors.md file."""
    all_hunts = find_hunt_files()
    contributors = []

    for hunt_file in all_hunts:
        try:
            content = hunt_file.read_text()
            lines = content.splitlines()

            # Find the table header line that contains "Submitter"
            header_line = None
            header_line_index = -1

            for i, line in enumerate(lines):
                if '|' in line and 'Submitter' in line:
                    header_line = line
                    header_line_index = i
                    break

            if not header_line:
                continue

            # Parse the header to find the submitter column index
            columns = [c.strip() for c in header_line.split('|') if c.strip()]
            submitter_index = -1
            for i, col in enumerate(columns):
                # Remove markdown formatting and check for "Submitter"
                clean_col = re.sub(r'\*\*|\*', '', col).strip()
                if "Submitter" in clean_col:
                    submitter_index = i
                    break

            if submitter_index == -1:
                continue

            # Find the data row (skip the separator line)
            data_row_index = header_line_index + 2
            if data_row_index >= len(lines):
                continue

            data_row = lines[data_row_index]
            if not data_row.strip() or '|' not in data_row:
                continue

            data_cells = [c.strip() for c in data_row.split('|') if c.strip()]
            if submitter_index >= len(data_cells):
                continue

            submitter_cell = data_cells[submitter_index]

            contributor_name = extract_contributor_name(submitter_cell)
            if contributor_name and contributor_name != "hearth-auto-intel":
                contributors.append(contributor_name)
        except Exception as e:
            print(f"Could not process file {hunt_file}: {e}")

    contribution_counts = Counter(contributors)
    sorted_contributors = sorted(contribution_counts.items(), key=lambda contributor_data: contributor_data[1], reverse=True)

    markdown_content = build_leaderboard_markdown(sorted_contributors)
    save_leaderboard_file(markdown_content)
    print("✅ Successfully generated new Contributors.md")


def build_leaderboard_markdown(sorted_contributors):
    """Build the markdown content for the leaderboard."""
    header = "# 🔥 HEARTH Contributors Leaderboard 🔥\n\n"
    description = "Everyone listed below has submitted ideas that have been added to HEARTH. This list is automatically generated and updated monthly. Thank you for stoking the fire that warms our community!\n\n"
    table_header = "| Rank | Contributor | Hunts Submitted |\n|------|-------------|-----------------|\n"

    table_rows = ""
    for rank, (contributor_name, hunt_count) in enumerate(sorted_contributors, 1):
        table_rows += f"| {rank} | {contributor_name} | {hunt_count} |\n"

    return header + description + table_header + table_rows


def save_leaderboard_file(markdown_content):
    """Save the leaderboard content to file."""
    leaderboard_file_path = Path("Keepers/Contributors.md")
    leaderboard_file_path.write_text(markdown_content)


if __name__ == "__main__":
    generate_leaderboard()
