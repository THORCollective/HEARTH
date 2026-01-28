#!/usr/bin/env python3
"""
Fetch security intel from RSS feeds and other security sources.

This script fetches security intelligence from various sources and outputs
structured CTI files for hunt generation. It simulates the SECUpdates skill
output format while pulling from real security RSS feeds.

Sources:
- CISA Known Exploited Vulnerabilities
- The Hacker News RSS
- tldrsec RSS (if available)

Usage:
    python fetch_secupdates_intel.py [--dry-run] [--max-items N] [--output-dir DIR]
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

# Configuration
DEFAULT_OUTPUT_DIR = Path(".hearth/intel-drops/")
USER_AGENT = "HEARTH-Intel-Fetcher/1.0 (https://github.com/THORCollective/HEARTH)"
REQUEST_TIMEOUT = 30
RATE_LIMIT_DELAY = 2  # seconds between requests


class IntelItem:
    """Represents a single intelligence item."""

    def __init__(
        self,
        title: str,
        content: str,
        source: str,
        source_url: str,
        published: Optional[datetime] = None,
        item_type: str = "article",
        cve_ids: Optional[list] = None,
        techniques: Optional[list] = None,
    ):
        self.title = title
        self.content = content
        self.source = source
        self.source_url = source_url
        self.published = published or datetime.now()
        self.item_type = item_type
        self.cve_ids = cve_ids or []
        self.techniques = techniques or []

    @property
    def content_hash(self) -> str:
        """Generate a hash of the content for deduplication."""
        content_to_hash = f"{self.title}|{self.source_url}"
        return hashlib.sha256(content_to_hash.encode()).hexdigest()[:16]

    def is_hunt_worthy(self) -> bool:
        """
        Determine if this item is worth generating a hunt for.
        Filters for actionable security intelligence.
        """
        # Keywords that indicate actionable threat intel
        hunt_keywords = [
            # Attack types
            "exploit", "vulnerability", "attack", "malware", "ransomware",
            "phishing", "zero-day", "0-day", "apt", "threat actor",
            # Techniques
            "lateral movement", "persistence", "privilege escalation",
            "credential", "exfiltration", "c2", "command and control",
            "beacon", "cobalt strike", "mimikatz", "powershell",
            # CVE patterns
            "cve-", "actively exploited", "in the wild",
            # TTPs
            "mitre", "att&ck", "technique", "tactic",
            # Campaign/group names
            "campaign", "operation", "group", "actor",
        ]

        # Combine title and content for keyword check
        text_to_check = f"{self.title} {self.content}".lower()

        # Check for hunt-worthy keywords
        keyword_match = any(keyword in text_to_check for keyword in hunt_keywords)

        # Check for CVE references
        has_cve = bool(self.cve_ids) or bool(re.search(r"CVE-\d{4}-\d+", text_to_check, re.IGNORECASE))

        # Check for MITRE technique references
        has_technique = bool(self.techniques) or bool(re.search(r"T\d{4}(?:\.\d{3})?", text_to_check))

        # Must have at least one indicator of actionable intel
        return keyword_match or has_cve or has_technique

    def to_cti_format(self) -> str:
        """Convert to CTI file format for hunt generation."""
        output = []
        output.append(f"# {self.title}")
        output.append("")
        output.append(f"**Source:** {self.source}")
        output.append(f"**URL:** {self.source_url}")
        output.append(f"**Published:** {self.published.isoformat()}")
        output.append(f"**Type:** {self.item_type}")

        if self.cve_ids:
            output.append(f"**CVEs:** {', '.join(self.cve_ids)}")

        if self.techniques:
            output.append(f"**MITRE Techniques:** {', '.join(self.techniques)}")

        output.append("")
        output.append("## Content")
        output.append("")
        output.append(self.content)

        return "\n".join(output)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "title": self.title,
            "source": self.source,
            "source_url": self.source_url,
            "published": self.published.isoformat(),
            "item_type": self.item_type,
            "cve_ids": self.cve_ids,
            "techniques": self.techniques,
            "content_hash": self.content_hash,
        }


def fetch_with_retry(url: str, max_retries: int = 3) -> Optional[requests.Response]:
    """Fetch URL with retry logic and rate limiting."""
    headers = {"User-Agent": USER_AGENT}

    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            print(f"  Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(RATE_LIMIT_DELAY * (attempt + 1))

    return None


def fetch_cisa_kev() -> list[IntelItem]:
    """
    Fetch CISA Known Exploited Vulnerabilities.
    Returns recent KEV entries that are actionable for threat hunting.
    """
    print("Fetching CISA KEV catalog...")
    items = []

    kev_url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
    response = fetch_with_retry(kev_url)

    if not response:
        print("  Failed to fetch CISA KEV")
        return items

    try:
        data = response.json()
        vulnerabilities = data.get("vulnerabilities", [])

        # Get vulnerabilities added in the last 7 days
        cutoff_date = datetime.now() - timedelta(days=7)

        for vuln in vulnerabilities:
            date_added_str = vuln.get("dateAdded", "")
            try:
                date_added = datetime.strptime(date_added_str, "%Y-%m-%d")
            except ValueError:
                continue

            if date_added < cutoff_date:
                continue

            cve_id = vuln.get("cveID", "")
            vendor = vuln.get("vendorProject", "")
            product = vuln.get("product", "")
            vuln_name = vuln.get("vulnerabilityName", "")
            description = vuln.get("shortDescription", "")
            action = vuln.get("requiredAction", "")
            notes = vuln.get("notes", "")

            content = f"""## Vulnerability Details

**CVE:** {cve_id}
**Vendor/Project:** {vendor}
**Product:** {product}
**Vulnerability Name:** {vuln_name}

## Description

{description}

## Required Action

{action}

## Notes

{notes}

## Why This Matters for Threat Hunting

This vulnerability has been added to CISA's Known Exploited Vulnerabilities catalog,
indicating it is being actively exploited in the wild. Organizations should:
1. Identify systems running affected {vendor} {product} software
2. Hunt for indicators of exploitation attempts
3. Look for post-exploitation activity on potentially compromised systems
"""

            item = IntelItem(
                title=f"CISA KEV: {cve_id} - {vuln_name}",
                content=content,
                source="CISA Known Exploited Vulnerabilities",
                source_url=f"https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
                published=date_added,
                item_type="vulnerability",
                cve_ids=[cve_id],
            )
            items.append(item)

        print(f"  Found {len(items)} recent KEV entries")

    except (json.JSONDecodeError, KeyError) as e:
        print(f"  Error parsing CISA KEV: {e}")

    return items


def fetch_hacker_news_rss() -> list[IntelItem]:
    """
    Fetch The Hacker News RSS feed.
    Returns recent security news items.
    """
    print("Fetching The Hacker News RSS...")
    items = []

    rss_url = "https://feeds.feedburner.com/TheHackersNews"
    response = fetch_with_retry(rss_url)

    if not response:
        print("  Failed to fetch The Hacker News RSS")
        return items

    try:
        soup = BeautifulSoup(response.content, "xml")
        entries = soup.find_all("item")

        # Get articles from the last 3 days
        cutoff_date = datetime.now() - timedelta(days=3)

        for entry in entries[:20]:  # Limit to recent 20 entries
            title = entry.find("title")
            title_text = title.get_text() if title else "Unknown"

            link = entry.find("link")
            link_text = link.get_text() if link else ""

            pub_date = entry.find("pubDate")
            published = datetime.now()
            if pub_date:
                try:
                    # Parse RSS date format
                    pub_date_text = pub_date.get_text()
                    published = datetime.strptime(
                        pub_date_text, "%a, %d %b %Y %H:%M:%S %z"
                    ).replace(tzinfo=None)
                except ValueError:
                    pass

            if published < cutoff_date:
                continue

            description = entry.find("description")
            desc_text = description.get_text() if description else ""

            # Clean up HTML from description
            desc_soup = BeautifulSoup(desc_text, "html.parser")
            clean_desc = desc_soup.get_text(separator="\n")

            # Extract CVEs if present
            cve_ids = re.findall(r"CVE-\d{4}-\d+", f"{title_text} {clean_desc}", re.IGNORECASE)
            cve_ids = list(set(cve_ids))

            # Extract MITRE techniques if present
            techniques = re.findall(r"T\d{4}(?:\.\d{3})?", f"{title_text} {clean_desc}")
            techniques = list(set(techniques))

            item = IntelItem(
                title=title_text,
                content=clean_desc,
                source="The Hacker News",
                source_url=link_text,
                published=published,
                item_type="article",
                cve_ids=cve_ids,
                techniques=techniques,
            )
            items.append(item)

        print(f"  Found {len(items)} recent articles")

    except Exception as e:
        print(f"  Error parsing The Hacker News RSS: {e}")

    return items


def fetch_tldrsec_rss() -> list[IntelItem]:
    """
    Fetch tldrsec RSS feed.
    Returns recent security newsletter items.
    """
    print("Fetching tldrsec RSS...")
    items = []

    # tldrsec uses Substack
    rss_url = "https://tldrsec.com/feed"
    response = fetch_with_retry(rss_url)

    if not response:
        print("  Failed to fetch tldrsec RSS (may be unavailable)")
        return items

    try:
        soup = BeautifulSoup(response.content, "xml")
        entries = soup.find_all("item")

        # Get articles from the last 7 days
        cutoff_date = datetime.now() - timedelta(days=7)

        for entry in entries[:10]:  # Limit to recent 10 entries
            title = entry.find("title")
            title_text = title.get_text() if title else "Unknown"

            link = entry.find("link")
            link_text = link.get_text() if link else ""

            pub_date = entry.find("pubDate")
            published = datetime.now()
            if pub_date:
                try:
                    pub_date_text = pub_date.get_text()
                    published = datetime.strptime(
                        pub_date_text, "%a, %d %b %Y %H:%M:%S %z"
                    ).replace(tzinfo=None)
                except ValueError:
                    pass

            if published < cutoff_date:
                continue

            # Get content from content:encoded or description
            content_elem = entry.find("content:encoded") or entry.find("description")
            content_text = content_elem.get_text() if content_elem else ""

            # Clean up HTML
            content_soup = BeautifulSoup(content_text, "html.parser")
            clean_content = content_soup.get_text(separator="\n")

            # Extract CVEs if present
            cve_ids = re.findall(r"CVE-\d{4}-\d+", f"{title_text} {clean_content}", re.IGNORECASE)
            cve_ids = list(set(cve_ids))

            # Extract MITRE techniques if present
            techniques = re.findall(r"T\d{4}(?:\.\d{3})?", f"{title_text} {clean_content}")
            techniques = list(set(techniques))

            item = IntelItem(
                title=title_text,
                content=clean_content[:5000],  # Limit content size
                source="tldrsec",
                source_url=link_text,
                published=published,
                item_type="newsletter",
                cve_ids=cve_ids,
                techniques=techniques,
            )
            items.append(item)

        print(f"  Found {len(items)} recent newsletters")

    except Exception as e:
        print(f"  Error parsing tldrsec RSS: {e}")

    return items


def load_state(state_file: Path) -> dict:
    """Load the autonomous state file."""
    if state_file.exists():
        try:
            with open(state_file) as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load state file: {e}")

    return {
        "last_run": None,
        "processed_items": [],
    }


def is_already_processed(item: IntelItem, state: dict) -> bool:
    """Check if an item has already been processed."""
    processed_hashes = {p.get("hash") for p in state.get("processed_items", [])}
    return item.content_hash in processed_hashes


def main():
    parser = argparse.ArgumentParser(
        description="Fetch security intel from RSS feeds and security sources"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be fetched without writing files",
    )
    parser.add_argument(
        "--max-items",
        type=int,
        default=10,
        help="Maximum number of items to output (default: 10)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory to output CTI files",
    )
    parser.add_argument(
        "--state-file",
        type=Path,
        default=Path(".hearth/autonomous-state.json"),
        help="Path to the state file for deduplication",
    )
    parser.add_argument(
        "--skip-dedup",
        action="store_true",
        help="Skip deduplication check against state file",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("HEARTH Security Intel Fetcher")
    print(f"Time: {datetime.now().isoformat()}")
    print("=" * 60)

    # Load state for deduplication
    state = {} if args.skip_dedup else load_state(args.state_file)

    # Fetch from all sources
    all_items: list[IntelItem] = []

    # CISA KEV
    time.sleep(RATE_LIMIT_DELAY)
    all_items.extend(fetch_cisa_kev())

    # The Hacker News
    time.sleep(RATE_LIMIT_DELAY)
    all_items.extend(fetch_hacker_news_rss())

    # tldrsec
    time.sleep(RATE_LIMIT_DELAY)
    all_items.extend(fetch_tldrsec_rss())

    print(f"\nTotal items fetched: {len(all_items)}")

    # Filter for hunt-worthy items
    hunt_worthy = [item for item in all_items if item.is_hunt_worthy()]
    print(f"Hunt-worthy items: {len(hunt_worthy)}")

    # Filter out already processed items
    if not args.skip_dedup:
        new_items = [item for item in hunt_worthy if not is_already_processed(item, state)]
        print(f"New items (not previously processed): {len(new_items)}")
    else:
        new_items = hunt_worthy

    # Limit to max items
    items_to_output = new_items[: args.max_items]
    print(f"Items to output (max {args.max_items}): {len(items_to_output)}")

    if args.dry_run:
        print("\n[DRY RUN] Would output the following items:")
        for item in items_to_output:
            print(f"  - {item.source}: {item.title[:60]}...")
            print(f"    Hash: {item.content_hash}")
            print(f"    URL: {item.source_url}")
        return 0

    # Create output directory
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # Output CTI files
    output_files = []
    for i, item in enumerate(items_to_output, 1):
        # Generate filename
        safe_title = re.sub(r"[^\w\s-]", "", item.title)[:50].strip().replace(" ", "-")
        filename = f"{item.content_hash}-{safe_title}.txt"
        filepath = args.output_dir / filename

        # Write CTI file
        with open(filepath, "w") as f:
            f.write(item.to_cti_format())

        output_files.append({
            "filepath": str(filepath),
            "item": item.to_dict(),
        })
        print(f"  [{i}/{len(items_to_output)}] Wrote: {filepath.name}")

    # Output summary
    summary = {
        "fetch_time": datetime.now().isoformat(),
        "total_fetched": len(all_items),
        "hunt_worthy": len(hunt_worthy),
        "new_items": len(new_items),
        "output_count": len(items_to_output),
        "output_files": output_files,
    }

    summary_file = args.output_dir / "fetch_summary.json"
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nSummary written to: {summary_file}")
    print(f"Total files output: {len(output_files)}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
