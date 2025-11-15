#!/usr/bin/env python3
"""
Performance test comparing database vs file-based hunt retrieval.
"""

import time
import sys
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent))

from duplicate_detection import get_all_existing_hunts_from_db, get_all_existing_hunts_from_files


def test_database_performance():
    """Test database retrieval speed."""
    print("🔍 Testing Database Performance\n")

    # Test database retrieval
    print("1️⃣  Testing DATABASE retrieval (fast path)...")
    start_time = time.time()
    db_hunts = get_all_existing_hunts_from_db()
    db_time = time.time() - start_time
    print(f"   ✅ Retrieved {len(db_hunts)} hunts in {db_time *1000:.2f}ms")

    # Test file-based retrieval
    print("\n2️⃣  Testing FILE-BASED retrieval (legacy)...")
    start_time = time.time()
    file_hunts = get_all_existing_hunts_from_files()
    file_time = time.time() - start_time
    print(f"   ✅ Retrieved {len(file_hunts)} hunts in {file_time *1000:.2f}ms")

    # Calculate improvement
    speedup = file_time / db_time
    improvement = ((file_time - db_time) / file_time) * 100

    print("\n📊 Performance Results:")
    print(f"   Database time: {db_time *1000:.2f}ms")
    print(f"   File-based time: {file_time *1000:.2f}ms")
    print(f"   Speedup: {speedup:.1f}x faster")
    print(f"   Improvement: {improvement:.1f}% reduction in time")

    # Verify data consistency
    print("\n🔬 Data Consistency Check:")
    print(f"   Database hunts: {len(db_hunts)}")
    print(f"   File-based hunts: {len(file_hunts)}")

    if len(db_hunts) == len(file_hunts):
        print("   ✅ Hunt counts match!")
    else:
        print(f"   ⚠️  Hunt counts differ by {abs(len(db_hunts) - len(file_hunts))}")

    # Test a specific query (filtered by tactic)
    print("\n3️⃣  Testing FILTERED query (Defense Evasion hunts)...")
    import sqlite3
    conn = sqlite3.connect('database/hunts.db')

    start_time = time.time()
    cursor = conn.execute("SELECT * FROM hunts WHERE tactic = 'Defense Evasion'")
    filtered_hunts = cursor.fetchall()
    filtered_time = time.time() - start_time
    conn.close()

    print(f"   ✅ Found {len(filtered_hunts)} Defense Evasion hunts in {filtered_time *1000:.2f}ms")

    # Compare to file-based filtering
    start_time = time.time()
    file_filtered = [h for h in file_hunts if h.get('tactic') == 'Defense Evasion']
    file_filtered_time = time.time() - start_time

    print(f"   File-based filtering: {file_filtered_time *1000:.2f}ms")
    print(f"   Database filtering: {filtered_time *1000:.2f}ms")
    print(f"   Filtered query speedup: {file_filtered_time /filtered_time:.1f}x faster")

    print("\n✨ Summary:")
    print(f"   The database is {speedup:.1f}x faster than file-based approach")
    print(f"   Filtered queries are even faster ({file_filtered_time /filtered_time:.1f}x)")
    print("   This will significantly speed up duplicate detection in GitHub Actions!")


if __name__ == '__main__':
    test_database_performance()
