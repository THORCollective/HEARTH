from __future__ import annotations

import json
from pathlib import Path

import pytest

from scripts.build_actor_mentions import (
    MIN_ALIAS_LEN,
    build,
    find_mentions,
    load_actors,
    load_denylist,
    search_terms_for,
)


def _actor(id: str, label: str, aliases: list[str] | None = None) -> dict:
    return {
        "id": id,
        "type": "threat_actor",
        "label": label,
        "aliases": aliases or [],
    }


def _hunt(id: str, **fields: str) -> dict:
    return {"id": id, **fields}


def test_load_actors_filters_to_threat_actor_nodes():
    cg = {
        "nodes": [
            {"id": "T1059", "type": "technique"},
            _actor("actor:G0001", "Foo"),
            {"id": "H001", "type": "hypothesis"},
            _actor("actor:G0002", "Bar"),
        ]
    }
    actors = load_actors(cg)
    assert [a["id"] for a in actors] == ["actor:G0001", "actor:G0002"]


def test_search_terms_filters_short_and_denylisted():
    actor = _actor("actor:G0001", "APT", aliases=["Cozy Bear", "ABC", "Midnight Blizzard"])
    denylist = {"actor:G0001": {"midnight blizzard"}}
    terms = search_terms_for(actor, denylist)
    # "APT" and "ABC" dropped for length; "Midnight Blizzard" dropped for denylist
    assert terms == ["Cozy Bear"]


def test_search_terms_dedupes_case_insensitive():
    actor = _actor("actor:G0001", "Lazarus Group", aliases=["lazarus group", "LAZARUS GROUP"])
    terms = search_terms_for(actor, {})
    assert terms == ["Lazarus Group"]


def test_min_alias_len_constant_is_four():
    # The spec calls out the 4-char minimum explicitly. Guard against drift.
    assert MIN_ALIAS_LEN == 4


def test_load_denylist_handles_missing_file(tmp_path):
    assert load_denylist(tmp_path / "nope.json") == {}


def test_load_denylist_lowercases_aliases(tmp_path):
    f = tmp_path / "denylist.json"
    f.write_text(json.dumps({"denylist": {"actor:G0001": ["Dragonfly", "MUSTANG"]}}))
    out = load_denylist(f)
    assert out == {"actor:G0001": {"dragonfly", "mustang"}}


def test_find_mentions_word_boundary():
    actors = [_actor("actor:G0001", "APT29", aliases=["Cozy Bear"])]
    hunts = [
        _hunt("H001", why="Linked to APT29 operations."),
        _hunt("H002", why="This is not APT299 even though APT29 is a substring."),
        _hunt("H003", why="The bear is cozy bear today."),
        _hunt("H004", why="Unrelated."),
    ]
    out = find_mentions(actors, hunts, {})
    # H001 (label match) + H002 (also matches APT29 because word boundary stops at digit boundary? no — \b is between word & non-word; APT299 has no \b between 9 and 9)
    # Actually \bAPT29\b in "APT299" does NOT match because there's no word boundary after the 9.
    # H001: label match yes. H002: no match (APT29 buried in APT299, word boundary fails).
    # Wait — H002 also contains "APT29 is a substring" with a space after, that's a clean match.
    assert "H001" in out["actor:G0001"]
    assert "H002" in out["actor:G0001"]  # the trailing "APT29 is" portion matches
    assert "H003" in out["actor:G0001"]  # cozy bear (case-insensitive)
    assert "H004" not in out["actor:G0001"]


def test_find_mentions_rejects_substring_only():
    actors = [_actor("actor:G0001", "APT29")]
    hunts = [
        _hunt("H001", why="APT299 is something else entirely."),
        _hunt("H002", why="ZAPT29 is also not the same."),
    ]
    out = find_mentions(actors, hunts, {})
    assert out == {}


def test_find_mentions_scans_all_text_fields():
    actors = [_actor("actor:G0001", "Volt Typhoon")]
    hunts = [
        _hunt("H001", title="Hunt for Volt Typhoon TTPs"),
        _hunt("H002", notes="See also: Volt Typhoon."),
        _hunt("H003", references="https://example.com/volt-typhoon-report"),
        # references uses a hyphen — word boundary should still match "Volt Typhoon" in title/why/notes,
        # not in URL slugs. So this hunt below should NOT match unless we change scope.
        _hunt("H004", references="https://example.com/volt%20typhoon-report"),
    ]
    out = find_mentions(actors, hunts, {})
    # H001 and H002 match cleanly; H003 has "volt-typhoon" — hyphen is a word boundary,
    # but "volt" and "typhoon" are split by '-', so "Volt Typhoon" (with space) won't match.
    assert "H001" in out["actor:G0001"]
    assert "H002" in out["actor:G0001"]
    assert "H003" not in out["actor:G0001"]
    assert "H004" not in out["actor:G0001"]


def test_find_mentions_dedupes_per_actor():
    actors = [_actor("actor:G0001", "APT29", aliases=["Cozy Bear", "Nobelium"])]
    hunts = [
        _hunt("H001", title="APT29 details", why="Also known as Cozy Bear and Nobelium."),
    ]
    out = find_mentions(actors, hunts, {})
    assert out["actor:G0001"] == ["H001"]


def test_find_mentions_excludes_actors_with_no_matches():
    actors = [
        _actor("actor:G0001", "APT29"),
        _actor("actor:G0002", "Unrelated Group"),
    ]
    hunts = [_hunt("H001", why="APT29 operations.")]
    out = find_mentions(actors, hunts, {})
    assert "actor:G0001" in out
    assert "actor:G0002" not in out


def test_build_writes_output_and_returns_payload(tmp_path):
    cg = {
        "nodes": [
            _actor("actor:G0001", "APT29", aliases=["Cozy Bear"]),
            {"id": "T1059", "type": "technique"},
        ]
    }
    hunts = [
        _hunt("H001", why="APT29 was here."),
        _hunt("H002", why="Nothing to see."),
    ]
    cg_path = tmp_path / "context-graph-data.json"
    hunts_path = tmp_path / "hunts-data.json"
    out_path = tmp_path / "actor-mentions.json"
    cg_path.write_text(json.dumps(cg))
    hunts_path.write_text(json.dumps(hunts))

    payload = build(cg_path, hunts_path, tmp_path / "missing-denylist.json", out_path)

    assert payload["mentions"] == {"actor:G0001": ["H001"]}
    on_disk = json.loads(out_path.read_text())
    assert on_disk["mentions"] == {"actor:G0001": ["H001"]}
    assert on_disk["min_alias_len"] == MIN_ALIAS_LEN
    assert on_disk["generated_at"].endswith("Z")


def test_build_applies_denylist(tmp_path):
    cg = {"nodes": [_actor("actor:G0035", "Dragonfly")]}
    hunts = [_hunt("H001", why="A dragonfly landed on the keyboard.")]
    denylist = {"denylist": {"actor:G0035": ["Dragonfly"]}}

    cg_path = tmp_path / "cg.json"
    hunts_path = tmp_path / "h.json"
    deny_path = tmp_path / "deny.json"
    out_path = tmp_path / "out.json"
    cg_path.write_text(json.dumps(cg))
    hunts_path.write_text(json.dumps(hunts))
    deny_path.write_text(json.dumps(denylist))

    payload = build(cg_path, hunts_path, deny_path, out_path)
    assert payload["mentions"] == {}
