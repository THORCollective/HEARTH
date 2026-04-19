#!/usr/bin/env python3
"""
HEARTH CTI Pipeline — Fetch, Filter, Gap-Check

Fetches new articles from CTI RSS feeds, filters for behavioral threat
intelligence, extracts MITRE ATT&CK technique IDs, and checks for gaps
against the existing HEARTH hunt database. Outputs a JSON manifest of
gaps that need hunt generation.

No Claude/LLM calls — this is pure Python. The manifest is consumed
by a Claude Code skill that generates the actual hunt markdown.
"""

import json
import re
import sys
import hashlib
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

try:
    from readability import Document
    READABILITY_AVAILABLE = True
except ImportError:
    READABILITY_AVAILABLE = False

REPO_ROOT = Path(__file__).resolve().parent.parent
HUNTS_DATA = REPO_ROOT / "public" / "hunts-data.json"
STATE_FILE = REPO_ROOT / ".hearth" / "cti-pipeline-state.json"
MANIFEST_FILE = REPO_ROOT / ".hearth" / "cti-pipeline-manifest.json"

FEEDS = [
    {
        "name": "The DFIR Report",
        "url": "https://thedfirreport.com/feed/",
        "type": "rss",
    },
    {
        "name": "CISA Cybersecurity Advisories",
        "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        "type": "rss",
    },
]

TECHNIQUE_RE = re.compile(r"T\d{4}(?:\.\d{3})?")

BEHAVIORAL_KEYWORDS = [
    "lateral movement", "privilege escalation", "credential",
    "persistence", "command and control", "exfiltration",
    "defense evasion", "initial access", "execution",
    "discovery", "collection", "impact", "ransomware",
    "cobalt strike", "mimikatz", "powershell", "psexec",
    "lsass", "ntds", "wmi", "rdp", "brute force",
    "phishing", "exploit", "beacon", "c2", "backdoor",
    "scheduled task", "service creation", "dll", "injection",
    "token", "kerberos", "dcsync", "bloodhound",
]

SKIP_KEYWORDS = [
    "patch tuesday", "firmware update", "end of life",
    "vulnerability disclosure only", "no exploitation observed",
]


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"processed_urls": [], "last_run": None}


def save_state(state):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    state["last_run"] = datetime.now().isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


def load_existing_techniques():
    if not HUNTS_DATA.exists():
        print(f"WARNING: {HUNTS_DATA} not found, gap check will be skipped")
        return set()

    hunts = json.loads(HUNTS_DATA.read_text())
    techniques = set()
    for hunt in hunts:
        for tag in hunt.get("tags", []):
            normalized = tag.lstrip("#").replace("_", ".")
            if TECHNIQUE_RE.match(normalized):
                techniques.add(normalized)
    return techniques


def fetch_feed(feed):
    print(f"  Fetching {feed['name']}...")
    try:
        resp = requests.get(feed["url"], timeout=30, headers={
            "User-Agent": "HEARTH-CTI-Pipeline/1.0"
        })
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ERROR fetching {feed['name']}: {e}")
        return []

    articles = []
    try:
        root = ET.fromstring(resp.content)
    except ET.ParseError as e:
        print(f"  ERROR parsing {feed['name']} XML: {e}")
        return []

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    items = root.findall(".//item")
    if not items:
        items = root.findall(".//atom:entry", ns)

    for item in items:
        title_el = item.find("title")
        if title_el is None:
            title_el = item.find("atom:title", ns)
        link_el = item.find("link")
        if link_el is None:
            link_el = item.find("atom:link", ns)
        pub_el = item.find("pubDate")
        if pub_el is None:
            pub_el = item.find("atom:published", ns)
        desc_el = item.find("description")
        if desc_el is None:
            desc_el = item.find("atom:summary", ns)

        title = title_el.text.strip() if title_el is not None and title_el.text else ""
        if link_el is not None:
            link = link_el.get("href") or (link_el.text.strip() if link_el.text else "")
        else:
            link = ""
        pub_date = pub_el.text.strip() if pub_el is not None and pub_el.text else ""
        description = desc_el.text.strip() if desc_el is not None and desc_el.text else ""

        if link:
            articles.append({
                "title": title,
                "url": link,
                "pub_date": pub_date,
                "description": description,
                "source": feed["name"],
            })

    print(f"  Found {len(articles)} articles from {feed['name']}")
    return articles


def fetch_article_content(url):
    try:
        resp = requests.get(url, timeout=30, headers={
            "User-Agent": "HEARTH-CTI-Pipeline/1.0",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Encoding": "gzip, deflate",
        })
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"    ERROR fetching article content: {e}")
        return ""

    raw_html = resp.text

    if READABILITY_AVAILABLE:
        try:
            doc = Document(raw_html)
            soup = BeautifulSoup(doc.summary(), "html.parser")
            readable_text = soup.get_text(separator="\n", strip=True)
        except Exception:
            readable_text = ""
    else:
        readable_text = ""

    soup = BeautifulSoup(raw_html, "html.parser")
    for tag in soup(["script", "style", "nav"]):
        tag.decompose()
    full_text = soup.get_text(separator="\n", strip=True)

    if len(TECHNIQUE_RE.findall(full_text)) > len(TECHNIQUE_RE.findall(readable_text)):
        return full_text
    return readable_text or full_text


def passes_heuristic_filter(article, content):
    text = (article["title"] + " " + article.get("description", "") + " " + content).lower()

    for kw in SKIP_KEYWORDS:
        if kw in text:
            print(f"    SKIP: matched skip keyword '{kw}'")
            return False

    techniques = TECHNIQUE_RE.findall(text.upper())
    behavioral_hits = sum(1 for kw in BEHAVIORAL_KEYWORDS if kw in text)

    if len(techniques) >= 2 and behavioral_hits >= 3:
        print(f"    PASS: {len(techniques)} techniques, {behavioral_hits} behavioral keywords")
        return True

    if len(techniques) >= 5:
        print(f"    PASS: {len(techniques)} techniques (keyword threshold waived)")
        return True

    print(f"    SKIP: only {len(techniques)} techniques, {behavioral_hits} behavioral keywords")
    return False


def extract_techniques(content):
    return sorted(set(TECHNIQUE_RE.findall(content.upper())))


def find_gaps(article_techniques, existing_techniques):
    gaps = []
    for tech in article_techniques:
        normalized = tech.replace(".", "_")
        dotted = tech
        if dotted not in existing_techniques and normalized not in existing_techniques:
            alt_normalized = tech.replace("_", ".")
            if alt_normalized not in existing_techniques:
                gaps.append(tech)
    return gaps


def run_pipeline(max_articles=None, feed_filter=None):
    print("=" * 60)
    print("HEARTH CTI Pipeline")
    print(f"Run: {datetime.now().isoformat()}")
    print("=" * 60)

    state = load_state()
    existing_techniques = load_existing_techniques()
    print(f"\nExisting HEARTH techniques: {len(existing_techniques)}")

    all_articles = []
    for feed in FEEDS:
        if feed_filter and feed["name"] != feed_filter:
            continue
        all_articles.extend(fetch_feed(feed))

    new_articles = [a for a in all_articles if a["url"] not in state["processed_urls"]]
    print(f"\nNew articles (not previously processed): {len(new_articles)}")

    if max_articles:
        new_articles = new_articles[:max_articles]

    manifest = {"run_date": datetime.now().isoformat(), "articles": []}

    for i, article in enumerate(new_articles):
        print(f"\n--- [{i+1}/{len(new_articles)}] {article['title']} ---")
        print(f"    URL: {article['url']}")

        content = fetch_article_content(article["url"])
        if not content or len(content) < 500:
            print(f"    SKIP: insufficient content ({len(content)} chars)")
            state["processed_urls"].append(article["url"])
            continue

        if not passes_heuristic_filter(article, content):
            state["processed_urls"].append(article["url"])
            continue

        techniques = extract_techniques(content)
        print(f"    Techniques found: {techniques}")

        gaps = find_gaps(techniques, existing_techniques)
        print(f"    Gaps (not in HEARTH): {gaps}")

        if gaps:
            content_hash = hashlib.md5(content.encode()).hexdigest()[:12]
            manifest["articles"].append({
                "title": article["title"],
                "url": article["url"],
                "source": article["source"],
                "pub_date": article["pub_date"],
                "techniques_found": techniques,
                "gaps": gaps,
                "content_hash": content_hash,
            })
        else:
            print("    No gaps — all techniques already covered")

        state["processed_urls"].append(article["url"])

    MANIFEST_FILE.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2))
    save_state(state)

    total_gaps = sum(len(a["gaps"]) for a in manifest["articles"])
    print(f"\n{'=' * 60}")
    print(f"Pipeline complete.")
    print(f"Articles with gaps: {len(manifest['articles'])}")
    print(f"Total technique gaps: {total_gaps}")
    print(f"Manifest written to: {MANIFEST_FILE}")
    print(f"{'=' * 60}")

    return total_gaps > 0


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="HEARTH CTI Pipeline")
    parser.add_argument("--max", type=int, help="Max articles to process")
    parser.add_argument("--feed", type=str, help="Only process this feed")
    parser.add_argument("--reset", action="store_true", help="Reset processed state")
    args = parser.parse_args()

    if args.reset:
        if STATE_FILE.exists():
            STATE_FILE.unlink()
            print("State reset.")

    has_gaps = run_pipeline(max_articles=args.max, feed_filter=args.feed)
    sys.exit(0 if has_gaps else 1)
