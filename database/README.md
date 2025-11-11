# HEARTH Hunt Database

This directory contains the SQLite database index for fast hunt queries.

## Overview

The `hunts.db` file is an **automatically-maintained index** of all hunt files in the repository. It enables:
- ⚡ **2.7x faster** duplicate detection
- 🔍 Fast filtered queries by tactic, technique, or tags
- 📊 Quick statistics and analytics
- 🤖 Reduced GitHub Actions runtime

**Important**: The markdown files in `Flames/`, `Embers/`, and `Alchemy/` remain the **source of truth**. This database is just an index for performance.

## Database Schema

```sql
CREATE TABLE hunts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,        -- e.g., "H-2025-001.md"
    hunt_id TEXT NOT NULL,                -- e.g., "H-2025-001"
    hypothesis TEXT NOT NULL,             -- The hunt hypothesis
    tactic TEXT,                          -- MITRE ATT&CK tactic
    technique TEXT,                       -- MITRE technique ID (e.g., "T1071.001")
    tags TEXT,                            -- JSON array of hashtags
    submitter TEXT,                       -- Contributor name
    file_path TEXT NOT NULL,              -- Full path to .md file
    file_hash TEXT NOT NULL,              -- MD5 hash for change detection
    created_date TEXT,                    -- ISO timestamp from git
    last_modified TEXT                    -- ISO timestamp from git
);
```

## Automatic Updates

The database is automatically updated by the [update-hunt-database.yml](../.github/workflows/update-hunt-database.yml) workflow whenever:
- A hunt file is added to `Flames/`, `Embers/`, or `Alchemy/`
- A hunt file is modified
- A hunt file is deleted

No manual intervention is required.

## Manual Operations

### Rebuild Database from Scratch

```bash
python scripts/build_hunt_database.py --rebuild
```

### Update Database Manually

```bash
python scripts/build_hunt_database.py
```

### Query the Database

```bash
# Count all hunts
sqlite3 database/hunts.db "SELECT COUNT(*) FROM hunts"

# List all Defense Evasion hunts
sqlite3 database/hunts.db "SELECT hunt_id, hypothesis FROM hunts WHERE tactic = 'Defense Evasion'"

# Get statistics
sqlite3 database/hunts.db "SELECT tactic, COUNT(*) as count FROM hunts GROUP BY tactic ORDER BY count DESC"

# Find hunts by technique
sqlite3 database/hunts.db "SELECT * FROM hunts WHERE technique LIKE 'T1071%'"
```

## Performance

Performance test results (on 69 hunts):

| Operation | File-based | Database | Speedup |
|-----------|-----------|----------|---------|
| Get all hunts | 7.77ms | 2.90ms | **2.7x faster** |
| Filtered query | N/A | 0.14ms | **Near instant** |
| Full duplicate check | ~15s | ~0.5s | **30x faster** |

In GitHub Actions with slower I/O, speedup is even more dramatic (estimated **50-100x** for full duplicate detection).

## File Size

- Current size: **72KB** for 69 hunts
- Expected growth: ~1KB per hunt
- At 1000 hunts: ~1MB (still very manageable)

## Troubleshooting

### Database out of sync

If the database seems out of sync with the markdown files:

```bash
# Rebuild from scratch
python scripts/build_hunt_database.py --rebuild
```

### Database doesn't exist

The system automatically falls back to file-based retrieval if the database doesn't exist. To create it:

```bash
python scripts/build_hunt_database.py
```

### Merge conflicts

If you get a merge conflict on `hunts.db`:
1. Accept either version (doesn't matter which)
2. Run `python scripts/build_hunt_database.py --rebuild`
3. Commit the rebuilt database

## Architecture Decisions

### Why SQLite?

- ✅ Zero-config (no server needed)
- ✅ Version-controllable (single file)
- ✅ Fast for read-heavy workloads
- ✅ No external dependencies in GitHub Actions
- ✅ Perfect for <10K records

### Why not a remote database?

- ❌ Would require secrets management
- ❌ Adds latency
- ❌ Requires external infrastructure
- ❌ Not needed for this workload

### Why commit the database?

- ✅ Works in GitHub Actions without rebuild
- ✅ Instant availability for contributors
- ✅ Version history is preserved
- ✅ No cold-start penalty

## Future Enhancements

Possible future improvements:
- [ ] Add semantic embeddings for better duplicate detection
- [ ] Full-text search index
- [ ] Materialized views for common queries
- [ ] Export to JSON for website consumption
- [ ] Integration with MITRE ATT&CK Navigator

## Questions?

See the main [HEARTH README](../README.md) or open an issue.
