"""Flag prompt-injection-like text in hunt files changed by a pull request.

Hunt text is served to users' AI tools by the HEARTH MCP server, so a hunt
that hides instructions, or addresses an AI assistant directly, needs a
maintainer to look at it before merge. This check never edits anything: it
annotates the lines and fails until a maintainer adds the
``injection-reviewed`` label (which re-runs the workflow).

Some hunts are legitimately about these techniques (H186 covers right-to-left
override filenames), which is why a finding asks for review rather than
blocking outright.

Usage:
    python scripts/check_hunt_injection.py            # files changed vs origin/main
    python scripts/check_hunt_injection.py --all      # every hunt (for tuning)
    python scripts/check_hunt_injection.py FILE ...   # specific files
Env:
    INJECTION_REVIEWED=true   maintainer label present: report, but pass
    BASE_REF=origin/main      branch to diff against
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

HUNT_DIRS = ("Incoming", "Flames", "Embers", "Alchemy")
LABEL = "injection-reviewed"

# Characters a reader can't see: zero-width, bidi controls, BOM, C0/C1
# controls other than tab/newline/CR, and Unicode tag characters / variation
# selectors supplement (used to spell hidden sentences).
HIDDEN = re.compile(
    r"[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u00ad\u061c\u180e"
    r"\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff"
    r"\U000e0000-\U000e007f\U000e0100-\U000e01ef]"
)

_I = re.IGNORECASE
PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    (
        "tells the reader to ignore earlier instructions",
        re.compile(
            r"\b(ignore|disregard|forget|override)\b\W+(?:\w+\W+){0,3}?"
            r"(previous|prior|above|earlier|preceding|system|all)\W+"
            r"(?:\w+\W+){0,2}?(instructions?|prompts?|rules|directions|guidelines)\b",
            _I,
        ),
    ),
    (
        "addresses an AI assistant directly",
        re.compile(
            r"\b(you are now|from now on,? you|pretend (?:to be|you are)|"
            r"as an? (?:\w+ ){0,2}?(?:ai|llm|language model|assistant|agent)\b,? you|"
            r"(?:dear|attention|note to( the)?) (?:ai|llm|assistant|model|agent|claude|chatgpt|copilot))\b",
            _I,
        ),
    ),
    (
        "mentions the system prompt or new instructions",
        re.compile(
            r"\b(system prompt|developer message|new instructions|hidden instructions)\b",
            _I,
        ),
    ),
    (
        "chat or role markup",
        re.compile(
            r"(<\|(?:im_start|im_end|system|user|assistant|endoftext)\|>|\[/?INST\]|<<SYS>>|"
            r"</?(?:system|assistant|instructions?)>|^\s*(?:system|assistant)\s*:)",
            _I | re.MULTILINE,
        ),
    ),
    (
        "asks to hide something from the user",
        re.compile(
            r"\b(do not|don't|never) (tell|inform|mention|reveal|show)\b.{0,20}\b(user|human|analyst)\b|"
            r"\bwithout (telling|asking|informing|notifying) the (user|human|analyst)\b",
            _I,
        ),
    ),
    (
        "asks the reader to call a tool or send data",
        re.compile(
            r"\b(call|invoke|use) the [\w-]+ (tool|function)\b|"
            r"\b(send|post|upload|exfiltrate) (?:\w+ ){0,3}(it|this|them|the (?:results?|data|conversation|context)) to https?://",
            _I,
        ),
    ),
    (
        "markdown image that sends data to a URL",
        re.compile(r"!\[[^\]]*\]\(https?://[^)\s]*[?&][^)\s]*=[^)\s]*\)", _I),
    ),
]


@dataclass
class Finding:
    path: str
    line: int
    reason: str
    excerpt: str


def scan_text(path: str, text: str) -> list[Finding]:
    findings: list[Finding] = []
    for n, line in enumerate(text.splitlines(), 1):
        hidden = sorted({f"U+{ord(c):04X}" for c in HIDDEN.findall(line)})
        if hidden:
            findings.append(
                Finding(path, n, "hidden characters " + ", ".join(hidden[:5]), "")
            )
        for reason, pat in PATTERNS:
            m = pat.search(line)
            if m:
                findings.append(Finding(path, n, reason, m.group(0)[:80]))
    return findings


def changed_hunt_files(base: str) -> list[Path]:
    out = subprocess.run(
        [
            "git",
            "diff",
            "--name-only",
            "--diff-filter=AM",
            f"{base}...HEAD",
            "--",
            *HUNT_DIRS,
        ],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return [
        Path(p)
        for p in out.splitlines()
        if p.endswith(".md") and Path(p).name.lower() != "readme.md"
    ]


def all_hunt_files() -> list[Path]:
    return [
        p
        for d in HUNT_DIRS
        for p in sorted(Path(d).glob("*.md"))
        if p.name.lower() != "readme.md"
    ]


def _escape_data(s: str) -> str:
    """GitHub workflow-command message escaping, so hunt text can't start a new command."""
    return s.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")


def _escape_property(s: str) -> str:
    return _escape_data(s).replace(":", "%3A").replace(",", "%2C")


def main(argv: list[str]) -> int:
    if argv[:1] == ["--all"]:
        files = all_hunt_files()
    elif argv:
        files = [Path(a) for a in argv]
    else:
        files = changed_hunt_files(os.environ.get("BASE_REF") or "origin/main")

    findings = [
        f for p in files for f in scan_text(str(p), p.read_text(encoding="utf-8"))
    ]
    reviewed = os.environ.get("INJECTION_REVIEWED", "").lower() == "true"
    level = "warning" if reviewed else "error"
    in_actions = os.environ.get("GITHUB_ACTIONS") == "true"

    for f in findings:
        msg = f.reason + (f": {f.excerpt!r}" if f.excerpt else "")
        if in_actions:
            print(
                f"::{level} file={_escape_property(f.path)},line={f.line},title=Possible prompt injection::{_escape_data(msg)}"
            )
        else:
            print(f"{f.path}:{f.line}: {msg}")

    print(f"Scanned {len(files)} hunt file(s): {len(findings)} finding(s).")
    if findings and not reviewed:
        print(
            f"\nThese hunts contain text that could steer an AI assistant reading them through the "
            f"HEARTH MCP server. A maintainer should read the flagged lines and, if they are fine "
            f"(for example a hunt that is about prompt injection), add the '{LABEL}' label. "
            f"After new commits, remove and re-add the label: approval doesn't carry over."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
