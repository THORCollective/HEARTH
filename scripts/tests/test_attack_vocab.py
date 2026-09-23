"""New hunts must use current ATT&CK Enterprise tactics and techniques.

Validation reads public/mitre-matrix.json (refreshed monthly from ATT&CK by
refresh-actor-graph.yml), so "current" tracks the matrix the site renders.
"""

import pytest
from scripts.attack_vocab import (
    attack_errors,
    current_tactics,
    normalize_attack_fields,
)

from scripts.hunt_schema import validate_draft, validate_hunt


def _hunt(**overrides) -> dict:
    hunt = {
        "id": "H001",
        "category": "Flames",
        "hypothesis": "An adversary is brute forcing the VPN admin account.",
        "tactics": ["Credential Access"],
        "techniques": ["T1110"],
        "tags": ["bruteforce"],
        "submitter": {"name": "Sydney Marrone", "link": ""},
    }
    hunt.update(overrides)
    return hunt


def test_current_tactics_come_from_the_matrix():
    tactics = current_tactics()
    assert "Stealth" in tactics and "Defense Impairment" in tactics
    assert "Defense Evasion" not in tactics  # split in ATT&CK v19
    assert len(tactics) == 15


def test_current_values_pass():
    assert attack_errors(_hunt()) == []
    assert validate_hunt(_hunt()) == []


@pytest.mark.parametrize(
    "tactic",
    ["Defense Evasion", "Execution (T1059)", "Valid Accounts", "credential access", ""],
)
def test_non_current_tactic_rejected(tactic):
    errors = validate_hunt(_hunt(tactics=[tactic]))
    assert any("tactic" in e and "ATT&CK" in e for e in errors), errors


def test_multiple_is_allowed_as_an_explicit_scope():
    # An ML model that triages across every tactic (M026) says so honestly.
    assert attack_errors(_hunt(tactics=["Multiple"])) == []


def test_revoked_technique_rejected_with_its_replacement():
    errors = validate_hunt(_hunt(techniques=["T1562.001"]))
    assert any("T1562.001" in e and "T1685" in e for e in errors), errors


@pytest.mark.parametrize("technique", ["T9999", "T0847"])  # unknown; ICS-only
def test_technique_not_in_enterprise_rejected(technique):
    errors = validate_hunt(_hunt(techniques=[technique]))
    assert any(technique in e for e in errors), errors


def test_drafts_are_checked_too():
    draft = _hunt(tactics=["Defense Evasion"])
    del draft["id"]
    assert any("Defense Evasion" in e for e in validate_draft(draft))


def test_normalize_fixes_what_generators_emit():
    fixed = normalize_attack_fields(
        {
            "tactics": ["Execution (T1059)", "Credential Access", "execution"],
            "techniques": ["T1562.001", "T1110"],
        }
    )
    # "(T1059)" moves into techniques; revoked T1562.001 -> T1685; deduped.
    assert fixed["tactics"] == ["Execution", "Credential Access"]
    assert fixed["techniques"] == ["T1685", "T1110", "T1059"]


def test_normalize_maps_defense_evasion_by_technique():
    fixed = normalize_attack_fields(
        {"tactics": ["Defense Evasion"], "techniques": ["T1027", "T1685"]}
    )
    assert fixed["tactics"] == ["Stealth", "Defense Impairment"]


def test_normalize_leaves_unmappable_values_for_validation_to_reject():
    # No technique says which half of Defense Evasion applies: don't guess.
    fixed = normalize_attack_fields(
        {"tactics": ["Defense Evasion"], "techniques": ["T1110"]}
    )
    assert fixed["tactics"] == ["Defense Evasion"]
    assert attack_errors({**_hunt(), **fixed})


def test_issue_form_tactic_dropdown_matches_the_matrix():
    # The manual submission form's options must be exactly the current tactics;
    # anything else would pass the form and then fail CI.
    import yaml
    from pathlib import Path

    form = yaml.safe_load(
        (Path(__file__).resolve().parents[2] / ".github/ISSUE_TEMPLATE/hunt_template.yaml").read_text()
    )
    field = next(f for f in form["body"] if f.get("id") == "tactic")
    assert field["type"] == "dropdown"
    assert field["attributes"]["options"] == current_tactics()


def test_multi_select_issue_answer_becomes_a_valid_draft(tmp_path):
    # GitHub renders a multi-select dropdown answer as "A, B", and
    # process_hunt_submission.py puts that string in the table's Tactic cell.
    # (Not imported here: it needs an AI API key at import time.)
    from scripts.drafts import draft_from_legacy_markdown
    from scripts.hunt_parser import parse_draft_file

    answer = "Stealth, Defense Impairment"
    md = (
        "An adversary tampers with EDR.\n\n"
        "| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        f"| [Leave blank] | An adversary tampers with EDR. | {answer} | n | #edr #T1685 | Sam |\n\n"
        "## Why\n- x\n\n## References\n- y\n"
    )
    name, text = draft_from_legacy_markdown(md, "Flames")
    (tmp_path / name).write_text(text, encoding="utf-8")
    assert parse_draft_file(tmp_path / name)["tactics"] == ["Stealth", "Defense Impairment"]


def _legacy_hunt(tmp_path, tactic, tags="#t #T1110"):
    f = tmp_path / "H990.md"
    f.write_text(
        "# H990\n\n"
        "| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |\n"
        "|---|---|---|---|---|---|\n"
        f"| H990 | A hypothesis here | {tactic} | n | {tags} | Anonymous |\n",
        encoding="utf-8",
    )
    return f


def test_legacy_table_hunt_is_checked_too(tmp_path):
    # A hunt file added directly (not via Incoming/) can still use the legacy
    # table format, which skips schema validation. It must not skip this check.
    from scripts.hunt_parser import HuntValidationError, parse_hunt_file

    with pytest.raises(HuntValidationError, match="Defense Evasion"):
        parse_hunt_file(_legacy_hunt(tmp_path, "Defense Evasion"), "Flames")
    with pytest.raises(HuntValidationError, match="T1562.001"):
        parse_hunt_file(_legacy_hunt(tmp_path, "Credential Access", "#t #T1562.001"), "Flames")


def test_valid_legacy_table_hunt_still_parses(tmp_path):
    from scripts.hunt_parser import parse_hunt_file

    hunt = parse_hunt_file(_legacy_hunt(tmp_path, "Stealth, Credential Access"), "Flames")
    assert hunt["tactics"] == ["Stealth", "Credential Access"]
