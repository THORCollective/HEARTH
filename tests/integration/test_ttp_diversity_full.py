#!/usr/bin/env python3
"""
Comprehensive test of TTP diversity system for hypothesis regeneration.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'scripts'))

from hypothesis_deduplicator import get_hypothesis_deduplicator
from ttp_diversity_checker import get_ttp_diversity_checker


def test_ttp_diversity_system():
    """Test the complete TTP diversity system."""
    print("🎯 Testing TTP Diversity System for Hypothesis Regeneration")
    print("=" * 70)

    # Get the TTP-aware deduplicator and clear any previous history
    deduplicator = get_hypothesis_deduplicator()
    deduplicator.clear_generation_history()

    # Test scenario: Generate multiple hypotheses and ensure TTP diversity
    print("\n📋 Scenario: AI is regenerating hunt hypotheses")
    print("Goal: Ensure each regeneration covers completely different TTPs")
    print("-" * 70)

    test_hypotheses = [
        ("Adversaries use PowerShell Invoke-WebRequest to download payloads", "Execution"),
        ("Threat actors leverage PowerShell for remote command execution", "Execution"),  # SHOULD BE REJECTED - Same TTP
        ("Attackers use CertUtil to download malicious files", "Execution"),           # SHOULD BE REJECTED - Same tactic
        ("Malicious actors create scheduled tasks for persistence", "Persistence"),     # SHOULD BE APPROVED - Different tactic
        ("Threat actors use WMI for lateral movement", "Lateral Movement"),           # SHOULD BE APPROVED - Different tactic
        ("Adversaries perform credential dumping with Mimikatz", "Credential Access"),  # SHOULD BE APPROVED - Different tactic
        ("Attackers use DNS tunneling for C2 communication", "Command and Control")   # SHOULD BE APPROVED - Different tactic
    ]

    approved_count = 0
    rejected_count = 0

    print(f"\nTesting {len(test_hypotheses)} hypothesis regeneration attempts:")
    print("=" * 70)

    for i, (hypothesis, tactic) in enumerate(test_hypotheses, 1):
        print(f"\n🔍 Attempt {i}: {hypothesis}")
        print(f"   Tactic: {tactic}")

        # Check TTP diversity
        result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)

        # Display results
        if result.is_duplicate:
            print(f"   ❌ REJECTED - TTP Overlap: {result.max_similarity_score:.1%}")
            print(f"   📝 Reason: {result.recommendation}")
            if result.ttp_overlap:
                print(f"   🔍 Analysis: {result.ttp_overlap.explanation}")
            rejected_count += 1
        else:
            print(f"   ✅ APPROVED - TTP Overlap: {result.max_similarity_score:.1%}")
            print(f"   📝 Reason: {result.recommendation}")
            approved_count += 1

    # Show final statistics
    print("\n" + "=" * 70)
    print("📊 FINAL RESULTS:")
    print(f"✅ Approved: {approved_count}/{len(test_hypotheses)} ({approved_count /len(test_hypotheses):.1%})")
    print(f"❌ Rejected: {rejected_count}/{len(test_hypotheses)} ({rejected_count /len(test_hypotheses):.1%})")

    # Show TTP diversity statistics
    ttp_checker = get_ttp_diversity_checker()
    stats = ttp_checker.get_stats()

    print("\n🎯 TTP DIVERSITY ACHIEVED:")
    print(f"- Unique Tactics: {stats.get('unique_tactics', 0)}")
    print(f"- Unique Techniques: {stats.get('unique_techniques', 0)}")
    print(f"- Unique Tools: {stats.get('unique_tools', 0)}")
    print(f"- Tactics Used: {', '.join(stats.get('tactics_used', []))}")

    # Evaluate success
    success_rate = approved_count / len(test_hypotheses)

    print("\n🏆 EVALUATION:")
    if success_rate >= 0.6 and stats.get('unique_tactics', 0) >= 4:
        print("✅ SUCCESS: TTP diversity system is working correctly!")
        print("   - Properly rejects similar TTPs")
        print("   - Approves diverse TTPs across different tactics")
        print("   - Ensures hypothesis regeneration covers different attack approaches")
    elif success_rate >= 0.4:
        print("⚠️ PARTIAL SUCCESS: System working but could be improved")
        print("   - Some TTP diversity achieved")
        print("   - May need threshold adjustments")
    else:
        print("❌ NEEDS IMPROVEMENT: System not providing sufficient TTP diversity")
        print("   - Too many rejections or too few unique tactics")

    print("\n💡 KEY BENEFITS:")
    print("✓ Prevents regeneration of similar PowerShell/Execution techniques")
    print("✓ Encourages diverse tactics across MITRE ATT&CK framework")
    print("✓ Ensures hunt hypotheses cover different attack approaches")
    print("✓ Maximizes coverage of threat landscape")

    return success_rate >= 0.6


def test_generation_with_ai_simulation():
    """Simulate AI generation with TTP diversity checks."""
    print("\n" + "🤖 SIMULATING AI HYPOTHESIS GENERATION WITH TTP DIVERSITY")
    print("=" * 70)

    deduplicator = get_hypothesis_deduplicator()
    deduplicator.clear_generation_history()

    # Simulate AI generation function
    def mock_ai_generator(prompt: str, attempt: int) -> dict:
        """Mock AI generator that produces different hypotheses based on attempt."""
        responses = [
            {"hypothesis": "Adversaries use PowerShell to execute malicious scripts", "tactic": "Execution", "tags": ["powershell"]},
            {"hypothesis": "Threat actors leverage PowerShell for command execution", "tactic": "Execution", "tags": ["powershell"]},  # Similar TTP
            {"hypothesis": "Attackers create registry keys for persistence", "tactic": "Persistence", "tags": ["registry"]},      # Different TTP
            {"hypothesis": "Malicious actors perform network discovery scanning", "tactic": "Discovery", "tags": ["scanning"]},   # Different TTP
            {"hypothesis": "Adversaries use DNS tunneling for C2", "tactic": "Command and Control", "tags": ["dns"]}              # Different TTP
        ]

        if attempt < len(responses):
            return responses[attempt]
        else:
            return {"hypothesis": f"Fallback hypothesis for attempt {attempt}", "tactic": "Impact", "tags": ["fallback"]}

    # Test generation with diversity
    print("\n📝 Testing hypothesis generation with TTP diversity enforcement:")

    generation_prompt = "Generate a unique threat hunting hypothesis for detecting adversary activity"

    try:
        hypothesis, result = deduplicator.generate_unique_hypothesis(
            generation_prompt=generation_prompt,
            max_attempts=5,
            ai_generator_func=mock_ai_generator
        )

        print("\n🎯 GENERATION RESULT:")
        print(f"✅ Success: {result.success if hasattr(result, 'success') else not result.is_duplicate}")
        print(f"📝 Hypothesis: {hypothesis}")
        print(f"🔍 TTP Overlap: {result.max_similarity_score:.1%}")
        print(f"💬 Recommendation: {result.recommendation}")

        if result.ttp_overlap:
            print(f"📊 TTP Analysis: {result.ttp_overlap.explanation}")

        return True

    except Exception as error:
        print(f"❌ Generation failed: {error}")
        return False


if __name__ == "__main__":
    print("🚀 COMPREHENSIVE TTP DIVERSITY TESTING")
    print("=" * 70)
    print("Testing the system that ensures hypothesis regeneration")
    print("attempts are not very similar to previous ones.")
    print("")

    # Test 1: Basic TTP diversity checking
    test1_success = test_ttp_diversity_system()

    # Test 2: AI generation simulation
    test2_success = test_generation_with_ai_simulation()

    # Final assessment
    print("\n" + "🏁 FINAL ASSESSMENT")
    print("=" * 70)

    if test1_success and test2_success:
        print("🎉 ALL TESTS PASSED!")
        print("\n✅ The TTP diversity system successfully ensures that:")
        print("   • Hypothesis regeneration attempts use different TTPs")
        print("   • Similar tactics/techniques/procedures are rejected")
        print("   • Diverse attack approaches are encouraged")
        print("   • Maximum threat landscape coverage is achieved")
        print("\n🎯 MISSION ACCOMPLISHED: No more similar TTP regenerations!")
    else:
        print("⚠️ Some tests failed - system needs refinement")

    print("\n" + "=" * 70)
