# HEARTH Testing Guide

This guide covers how to test HEARTH locally and validate changes before deploying to production.

## Table of Contents

1. [Automated Test Suite](#automated-test-suite)
2. [Local Development Setup](#local-development-setup)
3. [Testing CTI Extraction](#testing-cti-extraction)
4. [Testing Hunt Generation](#testing-hunt-generation)
5. [Testing Database Operations](#testing-database-operations)
6. [Testing GitHub Actions Locally](#testing-github-actions-locally)
7. [Integration Testing](#integration-testing)

---

## Automated Test Suite

Start here. Most of this guide covers manual end-to-end checks against live APIs, but the parser, schema, and hunt-ID logic have real unit tests — run those first, since they're fast and need no API keys.

```bash
pip install -r requirements.txt
python -m pytest scripts/tests -q
```

70 tests, roughly a second. Run from the repo root: `pythonpath = ["."]` in `pyproject.toml` is what makes `scripts.*` importable.

| Test file                          | Covers                                                      |
| :--------------------------------- | :---------------------------------------------------------- |
| `test_hunt_parser.py`              | Markdown parsing, both frontmatter and legacy table formats |
| `test_hunt_schema.py`              | Frontmatter schema validation                               |
| `test_hunt_ids.py`                 | Hunt ID parsing and allocation                              |
| `test_check_hunt_id_collisions.py` | PR collision detection                                      |
| `test_cti_extract.py`              | Article text extraction from raw HTML                       |
| `test_migrate_to_frontmatter.py`   | Legacy-format migration, including idempotency              |
| `test_build_actor_mentions.py`     | Actor mention extraction                                    |

Shared fixtures live in `scripts/tests/fixtures/`, exposed through the `fixtures_dir` fixture in `conftest.py`.

**CI runs this suite on every pull request**, via `validate-hunt-schema.yml`. That workflow carries no path filter — deliberately, so it can be a required status check — and runs the hunt-ID collision check and per-file schema validation before `pytest scripts/tests/ -v`.

`ci.yml` is a separate guard for the Node side: build, type-check, and vitest, plus a flake8 pass over `scripts/` and `.github/scripts/` limited to syntax errors and undefined names (`--select=E9,F63,F7,F82`).

Some legacy-format hunt files still exist, so a passing run emits `DeprecationWarning`s from the parser. That's expected.

---

## Local Development Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/THORCollective/HEARTH.git
cd HEARTH

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Create `.env` File

Create a `.env` file in the project root:

```bash
# AI Provider Configuration
AI_PROVIDER=claude  # or 'openai'
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-5

# Optional: OpenAI (if using OpenAI provider)
OPENAI_API_KEY=your_openai_key_here

# GitHub (for testing issue updates)
GITHUB_TOKEN=your_github_token_here
```

**Get your API keys**:

- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys
- GitHub: https://github.com/settings/tokens

---

## Testing CTI Extraction

### Test 1: Basic Web Scraping

Test the CTI extraction with various compression types:

```bash
# Test with The DFIR Report (Zstandard compression)
python3 << 'EOF'
import sys
sys.path.insert(0, '.github/scripts')
from process_issue import get_cti_content

# Test URL
url = "https://thedfirreport.com/2025/09/29/from-a-single-click-how-lunar-spider-enabled-a-near-two-month-intrusion/"

print(f"🔍 Testing CTI extraction from: {url}\n")
content = get_cti_content(url)

if content.startswith("Error"):
    print(f"❌ FAILED: {content}")
else:
    print(f"✅ SUCCESS!")
    print(f"   Content length: {len(content):,} characters")
    print(f"   Word count: {len(content.split()):,} words")
    print(f"\n   First 500 characters:")
    print(f"   {content[:500]}...")
EOF
```

**Expected output**:

```
Content-Type: text/html; charset=utf-8
Content-Encoding: zstd
Response length: 201,493 bytes
✅ SUCCESS!
   Content length: 185,234 characters
   Word count: 28,456 words

   First 500 characters:
   From a Single Click: How Lunar Spider Enabled a Near Two-Month Intrusion...
```

### Test 2: Different Compression Types

```bash
# Test different sites with various compression
python3 << 'EOF'
from process_issue import get_cti_content

test_urls = [
    ("Brotli", "https://example-with-brotli.com/article"),
    ("Gzip", "https://example-with-gzip.com/article"),
    ("None", "https://example-no-compression.com/article"),
]

for compression_type, url in test_urls:
    print(f"\n🧪 Testing {compression_type} compression...")
    content = get_cti_content(url)

    if content.startswith("Error"):
        print(f"   ❌ {content[:100]}...")
    else:
        print(f"   ✅ Success - {len(content.split())} words")
EOF
```

### Test 3: Error Handling

```bash
# Test 404 error handling
python3 << 'EOF'
from process_issue import get_cti_content

# Test invalid URL
url = "https://thedfirreport.com/2025/01/06/invalid-article/"
content = get_cti_content(url)

if "Error: URL not found (404)" in content:
    print("✅ 404 error handling works correctly")
    print(f"   Error message: {content[:150]}...")
else:
    print("❌ 404 error not detected properly")
EOF
```

---

## Testing Hunt Generation

### Test 1: Generate Hunt from Local CTI File

```bash
# Create test CTI content
mkdir -p .hearth/intel-drops
cat > .hearth/intel-drops/test-cti.txt << 'EOF'
# Test Threat Intelligence Report

Threat actors associated with APT28 were observed using a new technique to
evade detection by disabling Windows Defender through registry modifications.
The attackers used PowerShell to modify HKLM\SOFTWARE\Policies\Microsoft\Windows Defender
setting DisableAntiSpyware to 1.

This technique is associated with MITRE ATT&CK T1562.001 - Impair Defenses:
Disable or Modify Tools.

The attack was observed targeting government organizations in Eastern Europe.
EOF

# Run hunt generation
python scripts/generate_from_cti.py

# Check output
ls -lh Flames/H-*.md | tail -5
```

**Expected output**:

```
✅ Hunt generated successfully!
   File: Flames/H-2025-073.md
   Hypothesis: Threat actors are modifying Windows Defender registry keys...
```

### Test 2: Test with Different AI Providers

```bash
# Test with Claude
AI_PROVIDER=claude python scripts/generate_from_cti.py

# Test with OpenAI (if configured)
AI_PROVIDER=openai python scripts/generate_from_cti.py
```

### Test 3: Verify Generated Hunt Format

```bash
# Check that generated hunt follows HEARTH format
python3 << 'EOF'
import re
from pathlib import Path

# Get latest hunt file
flames_dir = Path("Flames")
hunt_files = sorted(flames_dir.glob("H-*.md"))
latest_hunt = hunt_files[-1] if hunt_files else None

if latest_hunt:
    content = latest_hunt.read_text()

    # Validation checks
    checks = {
        "Has hypothesis (non-heading start)": not content.strip().startswith('#'),
        "Has hunt table": '| Hunt # |' in content or '| Idea |' in content,
        "Has data sources": '## Data Sources' in content,
        "Has hunt steps": '## Hunt Steps' in content,
        "Has references": '## References' in content,
    }

    print(f"📝 Validating: {latest_hunt.name}\n")
    for check, passed in checks.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {check}")

    if all(checks.values()):
        print(f"\n✅ Hunt format validation PASSED")
    else:
        print(f"\n❌ Hunt format validation FAILED")
else:
    print("❌ No hunt files found")
EOF
```

---

## Testing Database Operations

### Test 1: Build Database from Scratch

```bash
# Build database
python scripts/build_hunt_database.py --rebuild

# Verify database was created
ls -lh database/hunts.db

# Check database contents
sqlite3 database/hunts.db "SELECT COUNT(*) as total_hunts FROM hunts;"
sqlite3 database/hunts.db "SELECT tactic, COUNT(*) as count FROM hunts GROUP BY tactic ORDER BY count DESC LIMIT 5;"
```

**Expected output**:

```
🗄️  HEARTH Hunt Database Builder
   Database: database/hunts.db

📁 Scanning Flames/ (69 files)...
  ✅ Adding H-2025-001.md...
  ✅ Adding H-2025-002.md...
  ...

✨ Update complete!
   Processed: 69 files
   Added: 69 new hunts

📊 Database Statistics:
   Total hunts: 69
   Unique tactics: 12

total_hunts
69
```

### Test 2: Test Database Performance

Nothing in the pipeline reads this index at runtime — `duplicate_detection.py` walks the hunt directories directly. The index is built by `update-hunt-database.yml` and used for reporting. The check that matters is still whether it's current.

```bash
python3 - <<'EOF'
import sqlite3, pathlib
con = sqlite3.connect("database/hunts.db")
indexed = {r[0] for r in con.execute("SELECT filename FROM hunts")}
files = {p.name for d in ("Flames", "Embers", "Alchemy") for p in pathlib.Path(d).glob("*.md")}
missing = sorted(files - indexed - {"secret.md"})
print(f"indexed: {len(indexed)}\nfiles:   {len(files)}")
print("✅ current" if not missing else f"⚠️  stale — rebuild, missing: {missing}")
EOF
```

If it reports stale, rebuild:

```bash
python scripts/build_hunt_database.py --rebuild
```

`database/hunts.db` is gitignored — it's a local build artifact, so your copy drifts as you pull new hunts. In production `update-hunt-database.yml` rebuilds it on every merge that touches a hunt file.

> `Flames/secret.md` is a challenge-coin puzzle page, not a hunt, so the parser skips it. A current index therefore holds one row fewer than the file count.

### Test 3: Test Duplicate Detection

```bash
# Test duplicate detection with database
python3 << 'EOF'
from scripts.duplicate_detection import check_duplicates_for_new_submission

# Test hypothesis
test_hypothesis = "Threat actors are using PowerShell to disable Windows Defender by modifying registry keys to evade detection on enterprise workstations."

print("🔍 Testing duplicate detection...\n")
result = check_duplicates_for_new_submission(test_hypothesis)

print(f"Duplicate found: {result['is_duplicate']}")
if result['is_duplicate']:
    print(f"Similar to: {result['similar_hunts'][0]['filename']}")
    print(f"Similarity score: {result['similar_hunts'][0]['similarity']:.2%}")
EOF
```

---

## Testing GitHub Actions Locally

### Using Act (GitHub Actions Local Runner)

```bash
# Install act (macOS)
brew install act

# Or on Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Test CTI Processing Workflow

```bash
# Create test event payload
cat > test-event.json << 'EOF'
{
  "issue": {
    "number": 999,
    "body": "### CTI Content\n\n*(This will be processed automatically by our system. Please leave this section as is.)*\n\n### Link to Original Source\n\nhttps://thedfirreport.com/2025/09/29/from-a-single-click-how-lunar-spider-enabled-a-near-two-month-intrusion/\n\n### Your Name / Handle\n\nTest User\n\n### Link to Profile (Optional)\n\nhttps://github.com/testuser"
  }
}
EOF

# Test the workflow locally
act issues -e test-event.json -W .github/workflows/process-cti-issue.yml \
  -s ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --container-architecture linux/amd64
```

### Test Hunt Generation Workflow

```bash
# Create test event for intel-submission label
cat > hunt-gen-event.json << 'EOF'
{
  "issue": {
    "number": 999,
    "body": "..."
  },
  "label": {
    "name": "intel-submission"
  }
}
EOF

# Run locally
act issues -e hunt-gen-event.json -W .github/workflows/issue-generate-hunts.yml \
  -s ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -s HEARTH_TOKEN="$GITHUB_TOKEN"
```

---

## Integration Testing

### End-to-End Test: Complete Submission Flow

```bash
#!/bin/bash
# test-full-submission.sh

set -e

echo "🧪 HEARTH Integration Test"
echo "=========================="

# 1. Setup
echo -e "\n1️⃣  Setting up test environment..."
mkdir -p .hearth/intel-drops
rm -f .hearth/intel-drops/test-*.txt

# 2. Test CTI extraction
echo -e "\n2️⃣  Testing CTI extraction..."
python3 << 'PYTHON'
from process_issue import get_cti_content, save_cti_content_to_file

url = "https://thedfirreport.com/2025/09/29/from-a-single-click-how-lunar-spider-enabled-a-near-two-month-intrusion/"
content = get_cti_content(url)

if content.startswith("Error"):
    print(f"❌ CTI extraction failed: {content}")
    exit(1)

file_path = save_cti_content_to_file(content, "test-999")
if file_path:
    print(f"✅ CTI saved to: {file_path}")
else:
    print("❌ Failed to save CTI content")
    exit(1)
PYTHON

# 3. Test database update
echo -e "\n3️⃣  Testing database rebuild..."
python scripts/build_hunt_database.py --quiet

# 4. Test hunt generation
echo -e "\n4️⃣  Testing hunt generation..."
# Move test CTI to input directory
mv .hearth/intel-drops/issue-test-999-cti.txt .hearth/intel-drops/test-cti.txt
python scripts/generate_from_cti.py

# 5. Verify output
echo -e "\n5️⃣  Verifying generated hunt..."
LATEST_HUNT=$(ls -t Flames/H-*.md | head -1)
if [ -f "$LATEST_HUNT" ]; then
    echo "✅ Hunt generated: $LATEST_HUNT"
    echo "   Preview:"
    head -20 "$LATEST_HUNT"
else
    echo "❌ No hunt file found"
    exit 1
fi

# 6. Test duplicate detection
echo -e "\n6️⃣  Testing duplicate detection..."
python3 << 'PYTHON'
from scripts.duplicate_detection import check_duplicates_for_new_submission

hypothesis = "Threat actors are using malicious JavaScript files disguised as tax forms to deliver Brute Ratel malware via MSI installers."

result = check_duplicates_for_new_submission(hypothesis)
print(f"✅ Duplicate detection completed")
print(f"   Is duplicate: {result['is_duplicate']}")
PYTHON

echo -e "\n✅ All integration tests passed!"
```

Run the test:

```bash
chmod +x test-full-submission.sh
./test-full-submission.sh
```

---

## Testing Checklist

Before submitting a PR or deploying changes:

### CTI Extraction

- [ ] Test with Brotli compression site
- [ ] Test with Zstandard compression site
- [ ] Test with standard Gzip compression
- [ ] Test 404 error handling
- [ ] Test JavaScript-rendered content
- [ ] Test PDF file extraction
- [ ] Test DOCX file extraction

### Hunt Generation

- [ ] Generate hunt with Claude
- [ ] Generate hunt with OpenAI (if applicable)
- [ ] Verify hunt format (no title heading)
- [ ] Verify MITRE technique extraction
- [ ] Verify tactic classification
- [ ] Test regeneration with feedback

### Database Operations

- [ ] Build database from scratch
- [ ] Update database with new hunt
- [ ] Test performance improvement vs file-based
- [ ] Verify database auto-updates on file changes

### GitHub Actions

- [ ] Test workflows locally with `act`
- [ ] Verify secrets are properly configured
- [ ] Test duplicate detection in CI
- [ ] Verify PR creation works

### Documentation

- [ ] README updates are accurate
- [ ] Code examples work as documented
- [ ] Links to documentation are valid

---

## Common Issues and Solutions

### Issue: "ModuleNotFoundError: No module named 'anthropic'"

```bash
# Ensure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: "ANTHROPIC_API_KEY not set"

```bash
# Check .env file exists
ls -la .env

# Load environment variables
export $(cat .env | xargs)

# Or use dotenv
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('ANTHROPIC_API_KEY'))"
```

### Issue: "Database file not found"

```bash
# Build database manually
python scripts/build_hunt_database.py --rebuild
```

### Issue: "GitHub Actions workflow fails locally with act"

```bash
# Use larger Docker runner
act -P ubuntu-latest=catthehacker/ubuntu:act-latest

# Or specify secrets inline
act -s ANTHROPIC_API_KEY=sk-... -s GITHUB_TOKEN=ghp_...
```

---

## Automated Testing — Status

**Done:**

- [x] Unit tests for CTI extraction — `scripts/tests/test_cti_extract.py`
- [x] Automated format validation — `test_hunt_schema.py`, plus `validate-hunt-schema.yml` in CI
- [x] Integration tests in CI — `validate-hunt-schema.yml` runs pytest on every PR
- [x] Regression tests for duplicate detection — `scripts/tests/test_duplicate_detection.py`, 31 tests, no API calls

**Still open:**

- [ ] Performance benchmarking in CI. Deferred: the obvious target was the SQLite index, but nothing in the pipeline reads it at runtime, so there is currently no hot path worth gating on.

---

## Questions?

For testing questions or issues:

1. Check [GitHub Issues](https://github.com/THORCollective/HEARTH/issues)
2. Review [Optimization Guide](OPTIMIZATION_GUIDE.md)
3. Open a new issue with `[Testing]` prefix

---

**Happy Testing!** 🔥
