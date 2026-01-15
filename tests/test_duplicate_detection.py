#!/usr/bin/env python3
"""
Test the duplicate detection functionality.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from duplicate_detection import check_duplicates_for_new_submission

# Test with a sample hunt that might be similar to existing ones
test_content = """
Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------| 
| | Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection. | Defense Evasion | Based on ATT&CK technique T1071.001. | #defense-evasion #execution | test-user |

## Why
- This technique is commonly used by threat actors to evade detection
- Discord CDN is often trusted and may bypass security controls

## References
- [MITRE ATT&CK T1071.001](https://attack.mitre.org/techniques/T1071/001/)
- [Source CTI Report](https://example.com)
"""

print("🔍 Testing Duplicate Detection System")
print("=" * 60)

print("\nTest Hunt Content:")
print("Title: Threat actors using PowerShell's Invoke-WebRequest cmdlet...")
print("Tactic: Defense Evasion")
print("Tags: #defense-evasion #execution")

print("\n" + "-" * 60)
print("Running duplicate detection...")

try:
    result = check_duplicates_for_new_submission(test_content, "test-hunt.md")
    print("\n📋 DUPLICATE DETECTION RESULT:")
    print("=" * 60)
    print(result)

    # Analyze the result
    if "no similar" in result.lower() or "unique" in result.lower():
        print("\n✅ Result: No duplicates detected")
    elif "similar" in result.lower() or "duplicate" in result.lower():
        print("\n⚠️ Result: Similar hunts found")
    else:
        print("\n❓ Result: Unclear")

except Exception as error:
    print(f"\n❌ Error testing duplicate detection: {error}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Test completed")
