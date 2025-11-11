#!/bin/bash
# Quick test script for HEARTH
# Usage: ./test-quick.sh

set -e

echo "🧪 HEARTH Quick Test"
echo "==================="

# Check if in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Not in virtual environment. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✅ Virtual environment created and activated"
else
    echo "✅ Using existing virtual environment: $VIRTUAL_ENV"
fi

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "❌ No .env file found!"
    echo ""
    echo "Create a .env file with:"
    cat << 'EOF'
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
GITHUB_TOKEN=your_github_token_here
EOF
    echo ""
    exit 1
fi

echo "✅ .env file found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"

# Test 1: CTI Extraction
echo ""
echo "1️⃣  Testing CTI extraction..."
python3 << 'PYTHON'
import sys
sys.path.insert(0, '.github/scripts')
from process_issue import get_cti_content

url = "https://thedfirreport.com/2025/09/29/from-a-single-click-how-lunar-spider-enabled-a-near-two-month-intrusion/"

print(f"   Fetching: {url}")
content = get_cti_content(url)

if content.startswith("Error"):
    print(f"   ❌ FAILED: {content[:100]}...")
    sys.exit(1)
else:
    words = len(content.split())
    print(f"   ✅ SUCCESS - Downloaded {words:,} words")
PYTHON

# Test 2: Database
echo ""
echo "2️⃣  Testing database..."
if [ ! -f database/hunts.db ]; then
    echo "   Building database..."
    python scripts/build_hunt_database.py --quiet
fi

count=$(sqlite3 database/hunts.db "SELECT COUNT(*) FROM hunts;" 2>/dev/null || echo "0")
if [ "$count" -gt 0 ]; then
    echo "   ✅ Database has $count hunts"
else
    echo "   ⚠️  Database is empty or not accessible"
fi

# Test 3: Performance
echo ""
echo "3️⃣  Testing database performance..."
if [ -f scripts/test_database_speed.py ]; then
    python scripts/test_database_speed.py | grep -E "(SUCCESS|faster|Database:|File-based:)"
else
    echo "   ⚠️  Performance test not available"
fi

echo ""
echo "✅ All quick tests passed!"
echo ""
echo "Next steps:"
echo "  - Run full integration test: ./test-full-submission.sh"
echo "  - See docs/TESTING_GUIDE.md for more tests"
