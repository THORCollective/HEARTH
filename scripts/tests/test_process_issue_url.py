"""Tests for parsing the source URL out of a CTI submission issue body.

Regression guard for issue #395. A submitter pasted
``ox.security/blog/research-clickfix-phishing-npm-packages/`` with no scheme.
The parser required ``https?://``, so it matched nothing and process_issue.py
returned before making a single HTTP request — and the workflow then told the
submitter "the website is blocking automated access" and asked them to hand-copy
the article. The page in fact returned HTTP 200. A scheme-less URL is normal
(browsers and curl both accept it) and must be accepted and normalised.
"""

from __future__ import annotations

import ast
import re
import types
from pathlib import Path

import pytest

_PROCESS_ISSUE = (
    Path(__file__).resolve().parents[2] / ".github" / "scripts" / "process_issue.py"
)


def _load_url_helper():
    """Exec only the URL-parsing helper out of process_issue.py.

    The module imports requests/bs4/pypdf/docx at import time, and this test job
    does not install all of them. Pulling just the two names we exercise keeps
    the test honest — it runs the code that will actually ship — without
    dragging in that dependency surface.
    """
    tree = ast.parse(_PROCESS_ISSUE.read_text(encoding="utf-8"))
    wanted = {"SOURCE_URL_RE", "parse_source_url"}
    keep = [
        node
        for node in tree.body
        if (
            isinstance(node, ast.Assign)
            and any(getattr(t, "id", None) in wanted for t in node.targets)
        )
        or (isinstance(node, ast.FunctionDef) and node.name in wanted)
    ]
    assert keep, "parse_source_url/SOURCE_URL_RE not found in process_issue.py"
    module = types.ModuleType("process_issue_url_subset")
    module.re = re
    exec(compile(ast.Module(body=keep, type_ignores=[]), "<subset>", "exec"), module.__dict__)
    return module.parse_source_url


parse_source_url = _load_url_helper()


def _body(link: str) -> str:
    return f"### Link to Original Source\n\n{link}\n\n### Your Name / Handle\n\nSomeone"


@pytest.mark.parametrize(
    "link,expected",
    [
        # The exact issue #395 submission.
        (
            "ox.security/blog/research-clickfix-phishing-npm-packages/",
            "https://ox.security/blog/research-clickfix-phishing-npm-packages/",
        ),
        # Already-absolute URLs must pass through byte-for-byte.
        ("https://www.stepsecurity.io/blog/x", "https://www.stepsecurity.io/blog/x"),
        # http:// is not silently upgraded — that would change the request.
        ("http://example.com/a", "http://example.com/a"),
        # Markdown autolinking can wrap the value in angle brackets.
        ("<https://example.com/a>", "https://example.com/a"),
        ("example.com", "https://example.com"),
        ("sub.domain.co.uk/path/to/post", "https://sub.domain.co.uk/path/to/post"),
    ],
)
def test_parses_and_normalises(link, expected):
    assert parse_source_url(_body(link)) == expected


@pytest.mark.parametrize(
    "body",
    [
        _body("_No response_"),          # the form's empty-field placeholder
        "### Your Name / Handle\n\nSomeone",  # section absent entirely
        "",
    ],
)
def test_returns_none_when_unparseable(body):
    assert parse_source_url(body) is None


def test_none_body_does_not_raise():
    assert parse_source_url(None) is None
