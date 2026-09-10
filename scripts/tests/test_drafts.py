"""Tests for turning generator output into an ID-less draft.

Both generators emit legacy table markdown from an AI prompt. Rather than
rewriting those prompts, drafts.py re-parses that output and re-emits it as
frontmatter, so these drive the real shape the prompts ask the model for.
"""

import pytest

from scripts.drafts import draft_from_legacy_markdown, slugify
from scripts.hunt_parser import parse_draft_file

GENERATED = """Threat actors are using PowerShell's Invoke-WebRequest cmdlet to \
download encrypted payloads from Discord CDN to evade network detection.

| Hunt #       | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------------|-------------------|--------|-------|------|-----------|
| [Leave blank] | Threat actors are using PowerShell's Invoke-WebRequest cmdlet \
to download encrypted payloads from Discord CDN. | Command and Control | Look for \
Invoke-WebRequest to discord CDN domains. | #commandandcontrol #T1105 #powershell | \
[th3CyF0x](https://x.com/th3cyf0x) |

## Why
- Discord CDN is trusted infrastructure and often allowlisted.

## References
- https://attack.mitre.org/techniques/T1105/
"""


def test_generated_output_becomes_a_valid_draft(tmp_path):
    name, text = draft_from_legacy_markdown(GENERATED, "Flames")
    path = tmp_path / name
    path.write_text(text, encoding="utf-8")

    # The real gate: it must survive the same validation CI runs on Incoming/.
    draft = parse_draft_file(path)
    assert "id" not in draft
    assert draft["category"] == "Flames"
    assert draft["tactics"] == ["Command and Control"]
    assert "powershell" in draft["tags"]
    assert draft["submitter"]["name"] == "th3CyF0x"


def test_draft_declares_no_id_and_drops_the_table():
    _, text = draft_from_legacy_markdown(GENERATED, "Flames")
    assert "id:" not in text.split("---")[1]
    assert "[Leave blank]" not in text
    assert "| Hunt #" not in text


def test_prose_sections_survive():
    _, text = draft_from_legacy_markdown(GENERATED, "Flames")
    assert "## Why" in text
    assert "Discord CDN is trusted infrastructure" in text
    assert "## References" in text


def test_filename_is_a_slug_not_a_hunt_id():
    name, _ = draft_from_legacy_markdown(GENERATED, "Flames")
    assert name.endswith(".md")
    assert "powershell" in name
    # An HNNN-looking name would be rejected by parse_draft_file and would trip
    # find_stray_hunts.
    assert not name[0].isupper()


def test_category_is_honoured():
    _, text = draft_from_legacy_markdown(GENERATED, "Embers")
    assert "category: Embers" in text


@pytest.mark.parametrize(
    "text,expected",
    [
        ("Threat actors are using PowerShell", "threat-actors-using-powershell"),
        ("  Multiple   spaces  ", "multiple-spaces"),
        ("!!!", "hunt"),
        ("", "hunt"),
    ],
)
def test_slugify(text, expected):
    assert slugify(text) == expected


def test_slugify_never_produces_a_hunt_id():
    # find_stray_hunts exits 1 on an [HBM]NNN.md outside a category directory.
    assert slugify("H294") == "h294-draft"
    assert slugify("B045") == "b045-draft"
