"""Extract clean article text from raw HTML for the CTI fetch pipeline.

Used by ``.github/scripts/process_issue.py`` to turn a fetched or browser
rendered page into plain paragraphs for hunt generation. Prefers ``readability``
to strip nav/footer chrome and falls back to a plain tag sweep when it is
unavailable or fails.
"""

from __future__ import annotations

from bs4 import BeautifulSoup

_BLOCK_TAGS = ["p", "h1", "h2", "h3", "h4", "li", "blockquote"]


def extract_readable_text(html, min_paragraph_len: int = 20) -> str:
    """Return article text from ``html`` as blank-line-separated paragraphs.

    Accepts ``str`` or ``bytes``. ``bytes`` is decoded to ``str`` first:
    passing bytes straight to ``readability`` trips a str/bytes regex crash in
    its encoding sniffer (``cannot use a string pattern on a bytes-like
    object``), which silently disabled this extraction path — see issue #312.
    """
    if isinstance(html, bytes):
        html = html.decode("utf-8", errors="ignore")

    # readability isolates the main article; tolerate its absence or failure
    # and fall back to parsing the page as-is.
    try:
        from readability import Document

        html = Document(html).summary()
    except Exception:
        pass

    soup = BeautifulSoup(html, "html.parser")
    for junk in soup(["script", "style", "meta", "noscript"]):
        junk.decompose()
    paragraphs = [
        el.get_text(strip=True)
        for el in soup.find_all(_BLOCK_TAGS)
        if len(el.get_text(strip=True)) > min_paragraph_len
    ]
    return "\n\n".join(paragraphs)
