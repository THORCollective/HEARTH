#!/usr/bin/env python3
"""
Simple test for TTP context building without dependencies.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))


def test_context_building():
    """Test TTP context building manually."""
    print("🧪 Testing TTP Context Building (Simplified)")
    print("=" * 50)

    try:
        from hypothesis_deduplicator import get_hypothesis_deduplicator

        print("\n1. Building TTP context manually...")
        deduplicator = get_hypothesis_deduplicator()
        deduplicator.clear_generation_history()

        # Simulate what would happen if we loaded existing hunts
        existing_hunts = [
            ("Threat actors are using Chisel for SOCKS proxy tunneling", "Command and Control"),
            ("Adversaries use PowerShell for malicious downloads", "Execution"),
            ("Attackers create scheduled tasks for persistence", "Persistence"),
            ("Malicious actors perform credential dumping", "Credential Access"),
            ("Threat actors use WMI for lateral movement", "Lateral Movement")
        ]

        print("   Adding existing hunts to TTP context...")
        for i, (hypothesis, tactic) in enumerate(existing_hunts, 1):
            result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)
            print(f"   {i}. {hypothesis[:40]}... ({tactic}) -> {'Added' if not result.is_duplicate else 'Duplicate'}")

        # Show context statistics
        stats = deduplicator.ttp_checker.get_stats()
        print("\n   📊 Context Statistics:")
        print(f"   - Total hunts: {stats['total_attempts']}")
        print(f"   - Unique tactics: {stats['unique_tactics']}")
        print(f"   - Unique techniques: {stats['unique_techniques']}")
        print(f"   - Tactics covered: {', '.join(stats['tactics_used'])}")

        print("\n2. Testing new Chisel hypothesis against context...")
        new_chisel = "Threat actors are using the open-source Chisel utility to create tunnels that bypass network security controls"

        result = deduplicator.check_hypothesis_uniqueness(new_chisel, "Command and Control")

        print(f"   📝 New hypothesis: {new_chisel[:60]}...")
        print("   🎯 Tactic: Command and Control")
        print(f"   🔍 Result: {'REJECTED' if result.is_duplicate else 'APPROVED'}")
        print(f"   📊 TTP Overlap: {result.max_similarity_score:.1%}")
        print(f"   💬 Recommendation: {result.recommendation}")

        if result.ttp_overlap:
            print(f"   🔍 Analysis: {result.ttp_overlap.explanation}")

        print("\n3. Evaluation:")
        if result.is_duplicate and result.max_similarity_score > 0.5:
            print("   ✅ SUCCESS: New Chisel hypothesis correctly rejected!")
            print("   - Context provides comparison baseline")
            print("   - Significant TTP overlap detected")
            print("   - Similar TTPs prevented")

            print("\n🎯 This is exactly what should happen in GitHub Actions:")
            print("   1. Load existing hunts from Flames/ directory")
            print(f"   2. Build TTP context from {stats['total_attempts']} previous hunts")
            print(f"   3. Detect {result.max_similarity_score:.1%} overlap with existing Chisel hunt")
            print("   4. Reject regeneration attempt")
            print("   5. Force AI to generate different TTP approach")

            return True
        else:
            print("   ❌ ISSUE: Should have detected significant overlap")
            print("   Expected: >50% overlap with rejection")
            print(f"   Actual: {result.max_similarity_score:.1%} overlap, {'rejected' if result.is_duplicate else 'approved'}")
            return False

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_context_building()
    print(f"\n{'🎉 Context building works correctly!' if success else '⚠️ Issues detected with context building'}")
