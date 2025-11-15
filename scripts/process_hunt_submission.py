import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are an expert threat hunter, and your task is to reformat a manually submitted hunt idea into the official HEARTH markdown format.
You will be given the raw components of a hunt from a GitHub issue.
Your job is to assemble these into a complete and perfectly formatted markdown file.
CRITICAL: The final output must be ONLY the markdown content, starting directly with the hypothesis text. Do not include the title or any other conversational text.
The 'Tactic' and 'Submitter' fields in the final table should be taken directly from the user's input.
The 'Idea / Hypothesis' field in the table should be the same as the main hypothesis text.
"""

USER_TEMPLATE = """A user has submitted the following hunt details from the '🔥 HEARTH - Hunt Submission Form'. Please format them into a HEARTH markdown file.

---
**Hunt Type:** {hunt_type}
**Hypothesis:** {hypothesis}
**Tactic:** {tactic}
**Implementation Notes:** {notes}
**Tags:** {tags}
**Why it's important:** {why}
**References:** {references}
**Submitter:** {submitter}
---

Instructions:
1.  Use the Hypothesis as the main "Idea / Hypothesis" in the table and as the first line of the file.
2.  For the `Notes` column in the table, write a brief, one-sentence summary of the 'Implementation Notes' provided.
3.  Create a new `## Implementation Notes` section after the `## Why` section and place the full, original 'Implementation Notes' there.
4.  Populate all other fields and sections using the provided data.
5.  The final output MUST start with the hypothesis text, followed by the markdown table and the other sections.

The final markdown file content should look like this:

[The user's hypothesis]

| Hunt #       | Idea / Hypothesis          | Tactic    | Notes                             | Tags      | Submitter |
|--------------|----------------------------|-----------|-----------------------------------|-----------|-----------|
| [Leave blank] | [The user's hypothesis]    | {tactic}  | [A one-sentence summary of notes] | {tags}    | {submitter} |

## Why
{why}

## Implementation Notes
{notes}

## References
{references}
"""


def parse_issue_body(body):
    """Parses the structured data from the HEARTH Hunt Submission Form issue."""
    details = {}
    sections = body.split('###')[1:]
    for section in sections:
        try:
            lines = section.strip().split('\n')
            header = lines[0].strip().lower()
            content = "\n".join(lines[1:]).strip()

            if "hunt type" in header:
                details['hunt_type'] = content
            elif "hunt idea / hypothesis" in header:
                details['hypothesis'] = content
            elif "mitre att&ck tactic" in header:
                details['tactic'] = content
            elif "implementation notes" in header:
                details['notes'] = content
            elif "search tags" in header:
                details['tags'] = content
            elif "value and impact" in header:
                details['why'] = content
            elif "knowledge base" in header:
                details['references'] = content
            elif "hearth crafter" in header:
                details['submitter'] = content
        except IndexError:
            continue  # Ignore malformed sections
    return details


def generate_hunt_file(details):
    """Generates the hunt file content using the AI."""
    prompt = USER_TEMPLATE.format(
        hunt_type=details.get('hunt_type', 'Flames'),
        hypothesis=details.get('hypothesis', ''),
        tactic=details.get('tactic', ''),
        notes=details.get('notes', 'N/A'),
        tags=details.get('tags', ''),
        why=details.get('why', ''),
        references=details.get('references', ''),
        submitter=details.get('submitter', 'A Helpful Contributor')
    )

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=1200
    )
    return response.choices[0].message.content.strip()


def get_next_hunt_id(hunt_type_prefix, hunt_dir):
    """Determines the next hunt ID for a given type."""
    hunt_files = list(Path(hunt_dir).glob(f"{hunt_type_prefix}*.md"))
    next_hunt_num = 1
    if hunt_files:
        hunt_numbers = [int(f.stem.split('-')[-1]) for f in hunt_files if f.stem.split('-')[-1].isdigit()]
        if hunt_numbers:
            next_hunt_num = max(hunt_numbers) + 1
    return next_hunt_num


if __name__ == "__main__":
    issue_body = os.getenv("ISSUE_BODY")
    if not issue_body:
        raise ValueError("ISSUE_BODY environment variable not set.")

    # 1. Parse details from issue
    hunt_details = parse_issue_body(issue_body)

    # 2. Determine hunt type, prefix, and directory
    hunt_type = hunt_details.get('hunt_type', 'Flames').lower()
    if 'flames' in hunt_type:
        prefix, directory = 'H', 'Flames'
    elif 'embers' in hunt_type:
        prefix, directory = 'B', 'Embers'
    elif 'alchemy' in hunt_type:
        prefix, directory = 'A', 'Alchemy'
    else:
        prefix, directory = 'H', 'Flames'  # Default to Flames

    Path(directory).mkdir(exist_ok=True)

    # 3. Determine next hunt ID
    next_id = get_next_hunt_id(prefix, directory)
    year = datetime.now().year
    hunt_id = f"{prefix}-{year}-{next_id:03d}"
    out_md_path = Path(f"{directory}/{hunt_id}.md")

    # 4. Generate the core content
    hunt_content = generate_hunt_file(hunt_details)

    # 5. Assemble the final file
    final_content = f"# {hunt_id}\n\n"
    final_content += hunt_content.replace("| [Leave blank] |", f"| {hunt_id}    |")

    # 6. Save the file
    with open(out_md_path, "w") as f:
        f.write(final_content)
    print(f"✅ Successfully wrote hunt to {out_md_path}")

    # 7. Set output for the workflow
    if 'GITHUB_OUTPUT' in os.environ:
        with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
            print(f'HUNT_FILE_PATH={out_md_path}', file=f)
            print(f'HUNT_ID={hunt_id}', file=f)
