#!/usr/bin/env python3
"""
HEARTH Hunt Database Builder

Builds and maintains a SQLite database index of all hunt files for fast querying.
The markdown files remain the source of truth - this is just an index.

Usage:
    python scripts/build_hunt_database.py [--rebuild]

    --rebuild: Drop and rebuild the entire database from scratch
"""

import sqlite3
import json
import re
from pathlib import Path
from datetime import datetime
import sys
import hashlib


def get_file_hash(filepath):
    """Calculate MD5 hash of file content to detect changes."""
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


def extract_hunt_info(content, filepath):
    """
    Extracts key information from a hunt markdown file.

    Returns dict with:
        - hunt_id: e.g., "H-2025-001"
        - hypothesis: First non-header, non-table line
        - tactic: Extracted from the hunt table
        - tags: List of hashtags
        - technique: MITRE technique ID if present
    """
    lines = content.splitlines()

    # Extract hunt ID from title (first line starting with #)
    hunt_id = ""
    for line in lines:
        if line.startswith('# '):
            hunt_id = line.replace('# ', '').strip()
            break

    # Extract hypothesis (first substantial line that's not a header or table)
    hypothesis = ""
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith('#') and not stripped.startswith('|') and len(stripped) > 20:
            hypothesis = stripped
            break

    # Extract tactic from the hunt table
    tactic = ""
    technique = ""
    in_table = False

    for i, line in enumerate(lines):
        if '|' in line and ('Hunt #' in line or 'Idea' in line):
            in_table = True
            continue

        if in_table and '|' in line:
            # Skip the separator line (|---|---|)
            if '---' in line:
                continue

            # Parse the data row
            cells = [c.strip() for c in line.split('|') if c.strip()]
            if len(cells) >= 3:
                # Typically: Hunt #, Hypothesis, Tactic, Notes, Tags, Submitter
                potential_tactic = cells[2] if len(cells) > 2 else ""
                if potential_tactic and potential_tactic.lower() not in ['tactic', '']:
                    tactic = potential_tactic

                # Extract technique from notes or tags
                notes = cells[3] if len(cells) > 3 else ""
                tags_cell = cells[4] if len(cells) > 4 else ""

                # Look for T#### pattern
                technique_match = re.search(r'T\d{4}(?:\.\d{3})?', notes + ' ' + tags_cell)
                if technique_match:
                    technique = technique_match.group(0)

                break

    # Extract all hashtags
    tags = []
    for line in lines:
        tag_matches = re.findall(r'#[\w-]+', line)
        tags.extend(tag_matches)
    tags = list(set(tags))  # Remove duplicates

    # Extract submitter from table
    submitter = ""
    for i, line in enumerate(lines):
        if '|' in line and 'Submitter' in line:
            # Next non-separator row should have submitter
            for j in range(i+1, min(i+3, len(lines))):
                if '|' in lines[j] and '---' not in lines[j]:
                    cells = [c.strip() for c in lines[j].split('|') if c.strip()]
                    if len(cells) >= 6:
                        submitter = cells[5]
                        # Extract name from markdown link [name](url)
                        link_match = re.search(r'\[(.*?)\]', submitter)
                        if link_match:
                            submitter = link_match.group(1)
                    break
            break

    return {
        'hunt_id': hunt_id,
        'hypothesis': hypothesis,
        'tactic': tactic,
        'technique': technique,
        'tags': tags,
        'submitter': submitter
    }


def create_database_schema(conn):
    """Create the database schema if it doesn't exist."""
    conn.execute('''
        CREATE TABLE IF NOT EXISTS hunts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT UNIQUE NOT NULL,
            hunt_id TEXT NOT NULL,
            hypothesis TEXT NOT NULL,
            tactic TEXT,
            technique TEXT,
            tags TEXT,
            submitter TEXT,
            file_path TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            created_date TEXT,
            last_modified TEXT,

            UNIQUE(filename)
        )
    ''')

    # Create indexes for fast lookups
    conn.execute('CREATE INDEX IF NOT EXISTS idx_tactic ON hunts(tactic)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_technique ON hunts(technique)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_hunt_id ON hunts(hunt_id)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_created_date ON hunts(created_date)')

    # Create metadata table for tracking database state
    conn.execute('''
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')

    conn.commit()


def get_git_dates(filepath):
    """Get creation and last modified dates from git history."""
    import subprocess

    try:
        # Get first commit date (creation)
        result = subprocess.run(
            ['git', 'log', '--follow', '--format=%aI', '--reverse', '--', str(filepath)],
            capture_output=True,
            text=True,
            timeout=5
        )
        dates = result.stdout.strip().split('\n')
        created_date = dates[0] if dates and dates[0] else None

        # Get last commit date (modification)
        result = subprocess.run(
            ['git', 'log', '-1', '--format=%aI', '--', str(filepath)],
            capture_output=True,
            text=True,
            timeout=5
        )
        last_modified = result.stdout.strip() or None

        return created_date, last_modified
    except (subprocess.TimeoutExpired, subprocess.SubprocessError, FileNotFoundError):
        # Fallback to file system dates
        stat = Path(filepath).stat()
        return datetime.fromtimestamp(stat.st_ctime).isoformat(), \
               datetime.fromtimestamp(stat.st_mtime).isoformat()


def scan_and_update_hunts(conn, hunt_directories, verbose=True):
    """
    Scan hunt directories and update the database.
    Only processes new or modified files.
    """
    processed = 0
    added = 0
    updated = 0
    skipped = 0
    errors = 0

    for directory_name in hunt_directories:
        directory_path = Path(directory_name)
        if not directory_path.exists():
            if verbose:
                print(f"⚠️  Directory {directory_name} not found, skipping...")
            continue

        hunt_files = list(directory_path.glob("*.md"))
        if verbose:
            print(f"📁 Scanning {directory_name}/ ({len(hunt_files)} files)...")

        for hunt_file in hunt_files:
            try:
                # Calculate current file hash
                current_hash = get_file_hash(hunt_file)

                # Check if file exists in database
                cursor = conn.execute(
                    'SELECT id, file_hash FROM hunts WHERE filename = ?',
                    (hunt_file.name,)
                )
                existing = cursor.fetchone()

                if existing:
                    # File exists - check if it's been modified
                    db_id, db_hash = existing
                    if db_hash == current_hash:
                        skipped += 1
                        continue  # No changes, skip

                    # File modified - update it
                    if verbose:
                        print(f"  🔄 Updating {hunt_file.name}...")

                    content = hunt_file.read_text()
                    hunt_info = extract_hunt_info(content, str(hunt_file))

                    created_date, last_modified = get_git_dates(hunt_file)

                    conn.execute('''
                        UPDATE hunts
                        SET hunt_id = ?, hypothesis = ?, tactic = ?, technique = ?,
                            tags = ?, submitter = ?, file_path = ?, file_hash = ?,
                            last_modified = ?
                        WHERE id = ?
                    ''', (
                        hunt_info['hunt_id'],
                        hunt_info['hypothesis'],
                        hunt_info['tactic'],
                        hunt_info['technique'],
                        json.dumps(hunt_info['tags']),
                        hunt_info['submitter'],
                        str(hunt_file),
                        current_hash,
                        last_modified,
                        db_id
                    ))

                    updated += 1
                else:
                    # New file - insert it
                    if verbose:
                        print(f"  ✅ Adding {hunt_file.name}...")

                    content = hunt_file.read_text()
                    hunt_info = extract_hunt_info(content, str(hunt_file))

                    created_date, last_modified = get_git_dates(hunt_file)

                    conn.execute('''
                        INSERT INTO hunts
                        (filename, hunt_id, hypothesis, tactic, technique, tags, submitter,
                         file_path, file_hash, created_date, last_modified)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        hunt_file.name,
                        hunt_info['hunt_id'],
                        hunt_info['hypothesis'],
                        hunt_info['tactic'],
                        hunt_info['technique'],
                        json.dumps(hunt_info['tags']),
                        hunt_info['submitter'],
                        str(hunt_file),
                        current_hash,
                        created_date,
                        last_modified
                    ))

                    added += 1

                processed += 1

            except Exception as e:
                errors += 1
                if verbose:
                    print(f"  ❌ Error processing {hunt_file.name}: {e}")
                continue

    # Clean up deleted files
    cursor = conn.execute('SELECT filename, file_path FROM hunts')
    all_db_files = cursor.fetchall()
    deleted = 0

    for filename, filepath in all_db_files:
        if not Path(filepath).exists():
            if verbose:
                print(f"  🗑️  Removing deleted file: {filename}")
            conn.execute('DELETE FROM hunts WHERE filename = ?', (filename,))
            deleted += 1

    conn.commit()

    # Update metadata
    conn.execute('''
        INSERT OR REPLACE INTO metadata (key, value)
        VALUES ('last_updated', ?)
    ''', (datetime.now().isoformat(),))
    conn.commit()

    return {
        'processed': processed,
        'added': added,
        'updated': updated,
        'skipped': skipped,
        'deleted': deleted,
        'errors': errors
    }


def print_statistics(conn):
    """Print database statistics."""
    cursor = conn.execute('SELECT COUNT(*) FROM hunts')
    total = cursor.fetchone()[0]

    cursor = conn.execute('SELECT COUNT(DISTINCT tactic) FROM hunts WHERE tactic IS NOT NULL')
    unique_tactics = cursor.fetchone()[0]

    cursor = conn.execute('SELECT COUNT(DISTINCT technique) FROM hunts WHERE technique IS NOT NULL')
    unique_techniques = cursor.fetchone()[0]

    cursor = conn.execute('SELECT tactic, COUNT(*) as count FROM hunts WHERE tactic IS NOT NULL GROUP BY tactic ORDER BY count DESC LIMIT 5')
    top_tactics = cursor.fetchall()

    cursor = conn.execute('SELECT value FROM metadata WHERE key = "last_updated"')
    last_updated = cursor.fetchone()
    last_updated = last_updated[0] if last_updated else "Never"

    print(f"\n📊 Database Statistics:")
    print(f"   Total hunts: {total}")
    print(f"   Unique tactics: {unique_tactics}")
    print(f"   Unique techniques: {unique_techniques}")
    print(f"   Last updated: {last_updated}")

    if top_tactics:
        print(f"\n🔥 Top Tactics:")
        for tactic, count in top_tactics:
            print(f"   {tactic}: {count} hunts")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Build and maintain HEARTH hunt database')
    parser.add_argument('--rebuild', action='store_true', help='Drop and rebuild entire database')
    parser.add_argument('--quiet', action='store_true', help='Suppress output except errors')
    parser.add_argument('--db-path', default='database/hunts.db', help='Path to database file')
    args = parser.parse_args()

    verbose = not args.quiet

    # Ensure database directory exists
    db_path = Path(args.db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    # Rebuild if requested
    if args.rebuild and db_path.exists():
        if verbose:
            print("🔄 Rebuilding database from scratch...")
        db_path.unlink()

    # Connect to database
    conn = sqlite3.connect(str(db_path))

    if verbose:
        print(f"🗄️  HEARTH Hunt Database Builder")
        print(f"   Database: {db_path}")
        print()

    # Create schema
    create_database_schema(conn)

    # Scan and update hunts
    hunt_directories = ['Flames', 'Embers', 'Alchemy']
    stats = scan_and_update_hunts(conn, hunt_directories, verbose=verbose)

    if verbose:
        print(f"\n✨ Update complete!")
        print(f"   Processed: {stats['processed']} files")
        print(f"   Added: {stats['added']} new hunts")
        print(f"   Updated: {stats['updated']} modified hunts")
        print(f"   Skipped: {stats['skipped']} unchanged hunts")
        print(f"   Deleted: {stats['deleted']} removed hunts")
        if stats['errors'] > 0:
            print(f"   ⚠️  Errors: {stats['errors']} files failed")

        print_statistics(conn)
    else:
        # In quiet mode, only output JSON for GitHub Actions
        import json
        print(json.dumps(stats))

    conn.close()

    if stats['errors'] > 0:
        sys.exit(1)  # Exit with error code if any files failed


if __name__ == '__main__':
    main()
