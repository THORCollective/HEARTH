#!/usr/bin/env python3
"""
Fixed test for TTP diversity system.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from hypothesis_deduplicator import get_hypothesis_deduplicator
from ttp_diversity_checker import get_ttp_diversity_checker


def test_ttp_diversity_properly():
    """Test TTP diversity with proper history tracking."""
    print("🎯 TESTING TTP DIVERSITY SYSTEM (FIXED)")
    print("=" * 60)

    # Clear any existing history
    deduplicator = get_hypothesis_deduplicator()
    deduplicator.clear_generation_history()

    test_hypotheses = [
        ("Adversaries use PowerShell Invoke-WebRequest to download payloads", "Execution"),
        ("Threat actors leverage PowerShell for remote command execution", "Execution"),  # Should be rejected
        ("Attackers use CertUtil to download malicious files", "Execution"),
        ("Malicious actors create scheduled tasks for persistence", "Persistence"),
        ("Threat actors use WMI for lateral movement", "Lateral Movement"),
        ("Adversaries perform credential dumping with Mimikatz", "Credential Access"),
        ("Attackers use DNS tunneling for C2 communication", "Command and Control")
    ]

    print(f"\nTesting {len(test_hypotheses)} hypotheses for TTP diversity:")
    print("-" * 60)

    approved = []
    rejected = []

    for i, (hypothesis, tactic) in enumerate(test_hypotheses, 1):
        print(f"\n{i}. Testing: {hypothesis}")
        print(f"   Tactic: {tactic}")

        result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)

        if result.is_duplicate:
            print(f"   ❌ REJECTED - Overlap: {result.max_similarity_score:.1%}")
            print(f"   📝 {result.recommendation}")
            rejected.append((hypothesis, tactic, result.max_similarity_score))
        else:
            print(f"   ✅ APPROVED - Overlap: {result.max_similarity_score:.1%}")
            print(f"   📝 {result.recommendation}")
            approved.append((hypothesis, tactic, result.max_similarity_score))

    # Get final statistics
    ttp_checker = get_ttp_diversity_checker()
    stats = ttp_checker.get_stats()

    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS:")
    print(f"✅ Approved: {len(approved)}/{len(test_hypotheses)} ({len(approved) /len(test_hypotheses):.1%})")
    print(f"❌ Rejected: {len(rejected)}/{len(test_hypotheses)} ({len(rejected) /len(test_hypotheses):.1%})")

    print("\n🎯 TTP DIVERSITY ACHIEVED:")
    print(f"- Total Attempts Tracked: {stats.get('total_attempts', 0)}")
    print(f"- Unique Tactics: {stats.get('unique_tactics', 0)}")
    print(f"- Unique Techniques: {stats.get('unique_techniques', 0)}")
    print(f"- Unique Tools: {stats.get('unique_tools', 0)}")
    print(f"- Tactics Used: {', '.join(stats.get('tactics_used', []))}")

    print("\n📋 APPROVED HYPOTHESES:")
    for i, (hyp, tac, score) in enumerate(approved, 1):
        print(f"  {i}. {hyp[:50]}... ({tac}, {score:.1%} overlap)")

    print("\n🚫 REJECTED HYPOTHESES:")
    for i, (hyp, tac, score) in enumerate(rejected, 1):
        print(f"  {i}. {hyp[:50]}... ({tac}, {score:.1%} overlap)")

    # Evaluate success
    expected_unique_tactics = len(set(tac for _, tac, _ in approved))
    actual_unique_tactics = stats.get('unique_tactics', 0)

    print("\n🏆 EVALUATION:")
    print(f"- Expected unique tactics from approved: {expected_unique_tactics}")
    print(f"- Actual unique tactics tracked: {actual_unique_tactics}")

    if actual_unique_tactics >= 4 and len(rejected) >= 1:
        print("✅ SUCCESS: System properly enforces TTP diversity!")
        print("   - Rejects similar TTPs")
        print("   - Tracks diverse tactics correctly")
        return True
    else:
        print("❌ ISSUE: System needs improvement")
        print(f"   - Only {actual_unique_tactics} unique tactics tracked")
        print(f"   - Only {len(rejected)} rejections")
        return False


if __name__ == "__main__":
    test_ttp_diversity_properly()
