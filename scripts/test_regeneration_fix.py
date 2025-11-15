#!/usr/bin/env python3
"""
Test the regeneration fix with TTP context loading.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))


def test_regeneration_with_context():
    """Test regeneration with TTP context from existing hunts."""
    print("🧪 Testing Regeneration with TTP Context Loading")
    print("=" * 60)

    try:
        from hypothesis_deduplicator import get_hypothesis_deduplicator
        from generate_from_cti import _load_existing_hunts_for_ttp_context

        print("\n1. Testing TTP context loading...")
        deduplicator = get_hypothesis_deduplicator()
        deduplicator.clear_generation_history()

        # Simulate existing hunt data
        existing_hypotheses = [
            ("Threat actors are using Chisel for SOCKS proxy tunneling to bypass network controls", "Command and Control"),
            ("Adversaries are using PowerShell Invoke-WebRequest to download malicious payloads", "Execution"),
            ("Malicious actors create scheduled tasks for persistence across system reboots", "Persistence")
        ]

        print("   Simulating existing hunt context...")
        for hyp, tactic in existing_hypotheses:
            deduplicator.check_hypothesis_uniqueness(hyp, tactic)

        # Check context
        stats = deduplicator.ttp_checker.get_stats()
        print(f"   📊 Context built: {stats['total_attempts']} hunts, {stats['unique_tactics']} tactics")
        print(f"   🎯 Tactics: {', '.join(stats['tactics_used'])}")

        print("\n2. Testing new Chisel hypothesis against context...")
        chisel_hypothesis = "Threat actors are using the open-source Chisel utility to create tunnels that bypass network security controls"

        result = deduplicator.check_hypothesis_uniqueness(chisel_hypothesis, "Command and Control")

        print(f"   📝 New hypothesis: {chisel_hypothesis[:60]}...")
        print(f"   🔍 Result: {'REJECTED' if result.is_duplicate else 'APPROVED'}")
        print(f"   📊 TTP Overlap: {result.max_similarity_score:.1%}")
        print(f"   💬 Recommendation: {result.recommendation}")

        if result.ttp_overlap:
            print(f"   🔍 Analysis: {result.ttp_overlap.explanation}")

        # Expected: Should be rejected due to high overlap with existing Chisel hypothesis
        if result.is_duplicate and result.max_similarity_score > 0.6:
            print("\n✅ SUCCESS: System correctly rejects similar Chisel hypothesis!")
            print("   - Loads existing hunt context")
            print("   - Detects high TTP overlap")
            print("   - Prevents similar TTPs from being generated")
            return True
        else:
            print("\n❌ ISSUE: System should have rejected the similar hypothesis")
            print("   Expected: >60% overlap and rejection")
            print(f"   Actual: {result.max_similarity_score:.1%} overlap, {'rejected' if result.is_duplicate else 'approved'}")
            return False

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_regeneration_with_context()
    print(f"\n{'🎉 Test passed!' if success else '⚠️ Test failed!'}")
