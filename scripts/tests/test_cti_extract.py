from scripts.cti_extract import extract_readable_text


def test_extracts_article_text(fixtures_dir):
    html = (fixtures_dir / "cti_article.html").read_text(encoding="utf-8")
    text = extract_readable_text(html)
    assert "unauthenticated HTTP GET requests" in text
    assert "patched version" in text


def test_bytes_input_does_not_crash(fixtures_dir):
    # Regression for #312: passing bytes used to crash readability's encoding
    # sniffer ("cannot use a string pattern on a bytes-like object"), silently
    # disabling this extraction path.
    raw = (fixtures_dir / "cti_article.html").read_bytes()
    text = extract_readable_text(raw)
    assert "unauthenticated HTTP GET requests" in text
    assert text == extract_readable_text(raw.decode("utf-8"))


def test_strips_nav_and_footer_chrome(fixtures_dir):
    html = (fixtures_dir / "cti_article.html").read_text(encoding="utf-8")
    text = extract_readable_text(html)
    assert "Sign in to your account dashboard" not in text
    assert "All rights reserved" not in text
