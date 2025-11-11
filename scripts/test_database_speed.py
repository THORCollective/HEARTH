#!/usr/bin/env python3
"""
Simple performance test for database vs file-based retrieval.
No dependencies needed.
"""

import time
import sqlite3
import json
from pathlib import Path
import re


def get_hunts_from_database():
    """Get hunts from database."""
    conn = sqlite3.connect('database/hunts.db')
    conn.row_factory = sqlite3.Row

    cursor = conn.execute('''
        SELECT filename, hunt_id, hypothesis, tactic, technique, tags, file_path
        FROM hunts
        ORDER BY created_date DESC
    ''')

    hunts = []
    for row in cursor:
        hunts.append({
            'filepath': row['file_path'],
            'filename': row['filename'],
            'hypothesis': row['hypothesis'],
            'tactic': row['tactic'],
            'technique': row['technique'],
            'tags': json.loads(row['tags']) if row['tags'] else [],
        })

    conn.close()
    return hunts


def get_hunts_from_files():
    """Get hunts by reading all markdown files."""
    hunt_directories = ["Flames", "Embers", "Alchemy"]
    hunts = []

    for directory_name in hunt_directories:
        directory_path = Path(directory_name)
        if not directory_path.exists():
            continue

        for hunt_file in directory_path.glob("*.md"):
            try:
                content = hunt_file.read_text()
                lines = content.splitlines()

                # Extract hypothesis
                hypothesis = ""
                for line in lines:
                    stripped = line.strip()
                    if stripped and not stripped.startswith('#') and not stripped.startswith('|') and len(stripped) > 20:
                        hypothesis = stripped
                        break

                # Extract tactic from table
                tactic = ""
                for i, line in enumerate(lines):
                    if '|' in line and ('Tactic' in line or 'Hunt #' in line):
                        if i + 2 < len(lines):
                            data_row = lines[i + 2]
                            if '|' in data_row and '---' not in data_row:
                                cells = [c.strip() for c in data_row.split('|') if c.strip()]
                                if len(cells) >= 3:
                                    tactic = cells[2]
                        break

                hunts.append({
                    'filepath': str(hunt_file),
                    'filename': hunt_file.name,
                    'hypothesis': hypothesis,
                    'tactic': tactic,
                })

            except Exception as e:
                print(f"Error reading {hunt_file}: {e}")
                continue

    return hunts


def main():
    print("🔍 HEARTH Database Performance Test\n")

    # Test 1: Database retrieval
    print("1️⃣  DATABASE QUERY (using SQLite)")
    start = time.time()
    db_hunts = get_hunts_from_database()
    db_time = time.time() - start
    print(f"   Retrieved {len(db_hunts)} hunts")
    print(f"   Time: {db_time*1000:.2f}ms\n")

    # Test 2: File-based retrieval
    print("2️⃣  FILE-BASED SCAN (reading all .md files)")
    start = time.time()
    file_hunts = get_hunts_from_files()
    file_time = time.time() - start
    print(f"   Retrieved {len(file_hunts)} hunts")
    print(f"   Time: {file_time*1000:.2f}ms\n")

    # Results
    speedup = file_time / db_time if db_time > 0 else 0
    improvement = ((file_time - db_time) / file_time * 100) if file_time > 0 else 0

    print("📊 PERFORMANCE RESULTS")
    print(f"   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"   Database:   {db_time*1000:>8.2f}ms")
    print(f"   File-based: {file_time*1000:>8.2f}ms")
    print(f"   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"   Speedup:    {speedup:>8.1f}x faster")
    print(f"   Improvement: {improvement:>7.1f}% reduction\n")

    # Test 3: Filtered query
    print("3️⃣  FILTERED QUERY (Defense Evasion only)")
    conn = sqlite3.connect('database/hunts.db')

    start = time.time()
    cursor = conn.execute("SELECT * FROM hunts WHERE tactic = 'Defense Evasion'")
    filtered = cursor.fetchall()
    query_time = time.time() - start
    conn.close()

    print(f"   Found {len(filtered)} Defense Evasion hunts")
    print(f"   Query time: {query_time*1000:.2f}ms")

    # Compare to filtering in-memory
    start = time.time()
    file_filtered = [h for h in file_hunts if h.get('tactic') == 'Defense Evasion']
    filter_time = time.time() - start

    print(f"   In-memory filter time: {filter_time*1000:.2f}ms")
    print(f"   Database is {filter_time/query_time:.1f}x faster for filtered queries\n")

    print("✨ SUMMARY")
    print(f"   The SQLite database makes duplicate detection {speedup:.0f}x faster!")
    print(f"   In GitHub Actions, this means:")
    print(f"     • Workflows complete ~{file_time - db_time:.1f}s faster")
    print(f"     • Lower GitHub Actions costs")
    print(f"     • Faster feedback for contributors")


if __name__ == '__main__':
    main()
