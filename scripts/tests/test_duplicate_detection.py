import scripts.duplicate_detection as dd
from scripts.duplicate_detection import (
    _build_prompt,
    _emoji_for_score,
    _parse_response,
    _resolve_filepath,
    check_duplicates_for_new_submission,
    extract_hunt_info,
    format_comment,
)

HUNT_MD = """# H999

Threat actors are abusing the Snowflake GET command to exfiltrate compressed
archives from internal stages.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| H999 | Threat actors abuse Snowflake GET. | Exfiltration | ATT&CK T1567.002. | #exfiltration #T1567_002 | tester |
"""


# --- extract_hunt_info -------------------------------------------------------


def test_extracts_hypothesis_tactic_and_tags():
    info = extract_hunt_info(HUNT_MD, "H999.md", "Flames/H999.md")
    assert info["hypothesis"].startswith("Threat actors are abusing")
    assert info["tactic"] == "Exfiltration"
    assert info["tags"] == ["#T1567_002", "#exfiltration"]
    assert info["filepath"] == "Flames/H999.md"


def test_returns_none_when_no_hypothesis():
    # A file of only headings and tables has no prose line to use as the
    # hypothesis. Returning None is what makes the caller fall back to
    # "manual review recommended" instead of sending an empty prompt.
    assert extract_hunt_info("# Title\n\n| a | b |\n", "X.md", "X.md") is None


def test_ignores_headings_and_table_rows_when_finding_hypothesis():
    content = "# Heading\n\n| table | row |\n\nThe actual hypothesis line.\n"
    assert (
        extract_hunt_info(content, "X.md", "X.md")["hypothesis"]
        == "The actual hypothesis line."
    )


def test_tags_are_deduplicated_and_sorted():
    content = "Hypothesis here.\n\n#zeta #alpha #zeta #alpha\n"
    assert extract_hunt_info(content, "X.md", "X.md")["tags"] == ["#alpha", "#zeta"]


def test_missing_tactic_does_not_crash():
    # Hunts without the standard table still need to be comparable; tactic
    # just comes back empty and is rendered as "Unknown" in the prompt.
    info = extract_hunt_info("A hypothesis with no table.\n", "X.md", "X.md")
    assert info["tactic"] == ""


# --- _parse_response ---------------------------------------------------------


def test_parses_plain_json():
    raw = '{"top_matches": [{"filename": "H1.md", "score": 90, "explanation": "x"}]}'
    assert _parse_response(raw)[0]["filename"] == "H1.md"


def test_parses_json_wrapped_in_code_fences():
    # The prompt says "no code fences", but models add them anyway. Before this
    # was tolerated, a fenced response silently produced zero matches.
    raw = '```json\n{"top_matches": [{"filename": "H1.md", "score": 90}]}\n```'
    assert _parse_response(raw)[0]["score"] == 90


def test_parses_json_embedded_in_prose():
    raw = 'Here you go:\n{"top_matches": [{"filename": "H2.md", "score": 55}]}\nHope that helps.'
    assert _parse_response(raw)[0]["filename"] == "H2.md"


def test_returns_empty_list_on_unparseable_response():
    assert _parse_response("I could not complete that request.") == []


def test_returns_empty_list_when_top_matches_is_not_a_list():
    assert _parse_response('{"top_matches": "H1.md"}') == []


def test_returns_empty_list_when_payload_is_not_an_object():
    assert _parse_response('["H1.md", "H2.md"]') == []


# --- score thresholds --------------------------------------------------------


def test_threshold_values_are_pinned():
    # Asserted as literals, not via the constants. These cutoffs decide whether
    # a maintainer is told to review before approving, so moving one is a
    # product decision that should have to change this test too.
    assert (dd.HIGH_SIMILARITY, dd.MODERATE_SIMILARITY) == (80, 60)


def test_emoji_thresholds_are_inclusive_at_the_boundary():
    assert _emoji_for_score(80) == "🔴"
    assert _emoji_for_score(79) == "🟡"
    assert _emoji_for_score(60) == "🟡"
    assert _emoji_for_score(59) == "🟢"


# --- format_comment ----------------------------------------------------------


EXISTING = [
    {
        "filename": "H1.md",
        "filepath": "Flames/H1.md",
        "hypothesis": "h",
        "tactic": "t",
        "tags": [],
    },
]


def test_formats_matches_with_links_and_scores():
    out = format_comment(
        [{"filename": "H1.md", "score": 87, "explanation": "Both hunt X."}], EXISTING
    )
    assert "[H1.md](Flames/H1.md)" in out
    assert "87% similar" in out
    assert "Both hunt X." in out


def test_high_score_footer_asks_for_review():
    out = format_comment(
        [{"filename": "H1.md", "score": 95, "explanation": "e"}], EXISTING
    )
    assert "before approving" in out


def test_low_score_footer_reports_unique():
    out = format_comment(
        [{"filename": "H1.md", "score": 10, "explanation": "e"}], EXISTING
    )
    assert "appears unique" in out


def test_empty_matches_recommends_manual_review():
    assert "manual review recommended" in format_comment([], EXISTING)


def test_non_numeric_score_degrades_to_zero_instead_of_crashing():
    # A model returning "high" instead of 87 must not take down the whole
    # drafting workflow — the comment still renders, scored 0.
    out = format_comment(
        [{"filename": "H1.md", "score": "high", "explanation": "e"}], EXISTING
    )
    assert "0% similar" in out


def test_entries_without_filename_are_dropped():
    matches = [
        {"score": 90, "explanation": "no filename"},
        {"filename": "H1.md", "score": 50, "explanation": "e"},
    ]
    out = format_comment(matches, EXISTING)
    assert "H1.md" in out
    assert "no filename" not in out


def test_all_invalid_entries_recommends_manual_review():
    assert "manual review recommended" in format_comment(
        [{"score": 90}, "not a dict"], EXISTING
    )


def test_output_is_capped_at_top_n():
    matches = [
        {"filename": f"H{i}.md", "score": 50, "explanation": "e"} for i in range(10)
    ]
    out = format_comment(matches, EXISTING)
    assert out.count("% similar") == dd.TOP_N


def test_missing_explanation_gets_placeholder():
    out = format_comment([{"filename": "H1.md", "score": 50}], EXISTING)
    assert "No explanation provided." in out


def test_unknown_filename_falls_back_to_bare_name():
    # Claude occasionally invents a filename. It should still render rather
    # than raising, just without a working repo link.
    assert _resolve_filepath("H404.md", EXISTING) == "H404.md"


# --- _build_prompt -----------------------------------------------------------


def test_prompt_includes_submission_and_every_candidate():
    new = {"hypothesis": "New hypothesis", "tactic": "Execution", "tags": ["#a"]}
    existing = [
        {"filename": "H1.md", "hypothesis": "First", "tactic": "Exfiltration"},
        {"filename": "H2.md", "hypothesis": "Second", "tactic": ""},
    ]
    prompt = _build_prompt(new, existing)
    assert "New hypothesis" in prompt
    assert "H1.md | Exfiltration | First" in prompt
    assert "H2.md | Unknown | Second" in prompt


def test_prompt_truncates_long_hypotheses():
    # Every existing hunt goes into one prompt, so an unbounded hypothesis
    # would let a single pathological file blow the context budget.
    existing = [{"filename": "H1.md", "hypothesis": "x" * 500, "tactic": "T"}]
    assert "x" * 201 not in _build_prompt({"hypothesis": "n"}, existing)


def test_prompt_flattens_newlines_in_candidate_hypotheses():
    # One candidate per line is what makes the listing parseable; an embedded
    # newline would split a single hunt across two lines.
    existing = [
        {"filename": "H1.md", "hypothesis": "line one\nline two", "tactic": "T"}
    ]
    assert "line one line two" in _build_prompt({"hypothesis": "n"}, existing)


# --- check_duplicates_for_new_submission -------------------------------------


def test_unparseable_submission_short_circuits_before_calling_claude(monkeypatch):
    def boom(*args, **kwargs):
        raise AssertionError("Claude must not be called for an unparseable submission")

    monkeypatch.setattr(dd, "rank_with_claude", boom)
    assert "Could not extract hypothesis" in check_duplicates_for_new_submission(
        "# Only a heading\n", "X.md"
    )


def test_claude_failure_degrades_to_manual_review(monkeypatch):
    # An API outage must not fail the drafting workflow — the hunt still gets
    # drafted, just without duplicate analysis.
    monkeypatch.setattr(dd, "load_existing_hunts", lambda: EXISTING)

    def boom(*args, **kwargs):
        raise RuntimeError("API down")

    monkeypatch.setattr(dd, "rank_with_claude", boom)
    assert "manual review recommended" in check_duplicates_for_new_submission(
        HUNT_MD, "H999.md"
    )


def test_submission_is_excluded_from_its_own_comparison_set(monkeypatch):
    # On regeneration the hunt file already exists on disk, so without this
    # filter every re-roll would report itself as a 100% duplicate.
    seen = {}

    monkeypatch.setattr(
        dd,
        "load_existing_hunts",
        lambda: [
            {
                "filename": "H999.md",
                "filepath": "Flames/H999.md",
                "hypothesis": "self",
                "tactic": "T",
                "tags": [],
            },
            {
                "filename": "H1.md",
                "filepath": "Flames/H1.md",
                "hypothesis": "other",
                "tactic": "T",
                "tags": [],
            },
        ],
    )

    def capture(new_hunt, existing):
        seen["filenames"] = [h["filename"] for h in existing]
        return []

    monkeypatch.setattr(dd, "rank_with_claude", capture)
    check_duplicates_for_new_submission(HUNT_MD, "H999.md")
    assert seen["filenames"] == ["H1.md"]


def test_empty_corpus_reports_first_submission(monkeypatch):
    monkeypatch.setattr(dd, "load_existing_hunts", list)
    assert "first submission" in check_duplicates_for_new_submission(HUNT_MD, "H999.md")


def test_happy_path_renders_ranked_comment(monkeypatch):
    monkeypatch.setattr(dd, "load_existing_hunts", lambda: EXISTING)
    monkeypatch.setattr(
        dd,
        "rank_with_claude",
        lambda new, existing: [
            {"filename": "H1.md", "score": 91, "explanation": "Near duplicate."}
        ],
    )
    out = check_duplicates_for_new_submission(HUNT_MD, "H999.md")
    assert "🔴" in out
    assert "[H1.md](Flames/H1.md)" in out
    assert "before approving" in out
