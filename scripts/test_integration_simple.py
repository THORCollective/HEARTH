#!/usr/bin/env python3
"""
Simple test to validate TTP diversity integration is properly set up.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))


def test_integration_setup():
    """Test that TTP diversity system is properly integrated."""
    print("🔗 Testing TTP Diversity Integration Setup")
    print("=" * 60)

    # Test 1: Check if TTP diversity system can be imported
    print("\n1. Testing TTP diversity system import...")
    try:
        from hypothesis_deduplicator import get_hypothesis_deduplicator
        print("   ✅ TTP diversity system available")
        ttp_available = True
    except ImportError as e:
        print(f"   ❌ TTP diversity system not available: {e}")
        ttp_available = False

    # Test 2: Check if generation script has TTP integration
    print("\n2. Testing generation script integration...")
    try:
        # Read the generation script to check for TTP integration
        gen_script_path = Path(__file__).parent / "generate_from_cti.py"
        if gen_script_path.exists():
            content = gen_script_path.read_text()

            checks = [
                ("TTP_DIVERSITY_AVAILABLE", "TTP diversity availability check"),
                ("get_hypothesis_deduplicator", "TTP deduplicator import"),
                ("generate_hunt_content_with_ttp_diversity", "TTP-aware generation function"),
                ("check_hypothesis_uniqueness", "TTP diversity checking"),
                ("ttp_result.is_duplicate", "TTP duplicate detection")
            ]

            integration_score = 0
            for check, description in checks:
                if check in content:
                    print(f"   ✅ {description}")
                    integration_score += 1
                else:
                    print(f"   ❌ Missing: {description}")

            print(f"\n   Integration Score: {integration_score}/{len(checks)} ({integration_score /len(checks):.1%})")

            if integration_score == len(checks):
                print("   🎉 Full TTP diversity integration detected!")
                integration_complete = True
            else:
                print("   ⚠️ Partial or missing TTP integration")
                integration_complete = False
        else:
            print("   ❌ Generation script not found")
            integration_complete = False
    except Exception as e:
        print(f"   ❌ Error checking integration: {e}")
        integration_complete = False

    # Test 3: Verify TTP diversity workflow
    if ttp_available:
        print("\n3. Testing TTP diversity workflow...")
        try:
            deduplicator = get_hypothesis_deduplicator()

            # Test with Chisel hypotheses
            hyp1 = "Threat actors are using Chisel to create SOCKS proxies on compromised hosts to bypass network controls and conceal C2 traffic."
            hyp2 = "Adversaries are using the Chisel tunneling utility to establish SOCKS proxies on infected systems, bypassing firewalls to hide C2 communications."

            deduplicator.clear_generation_history()

            result1 = deduplicator.check_hypothesis_uniqueness(hyp1, "Command and Control")
            result2 = deduplicator.check_hypothesis_uniqueness(hyp2, "Command and Control")

            print(f"   First hypothesis: {'APPROVED' if not result1.is_duplicate else 'REJECTED'} ({result1.max_similarity_score:.1%} overlap)")
            print(f"   Second hypothesis: {'APPROVED' if not result2.is_duplicate else 'REJECTED'} ({result2.max_similarity_score:.1%} overlap)")

            if not result1.is_duplicate and result2.is_duplicate and result2.max_similarity_score > 0.6:
                print("   ✅ TTP diversity workflow working correctly")
                workflow_working = True
            else:
                print("   ❌ TTP diversity workflow not working as expected")
                print("       Expected: First approved, second rejected with >60% overlap")
                print(f"       Actual: First {'approved' if not result1.is_duplicate else 'rejected'}, second {'rejected' if result2.is_duplicate else 'approved'} with {result2.max_similarity_score:.1%} overlap")
                workflow_working = False

        except Exception as e:
            print(f"   ❌ Error testing workflow: {e}")
            workflow_working = False
    else:
        print("\n3. Skipping workflow test (TTP system unavailable)")
        workflow_working = False

    # Final assessment
    print("\n" + "=" * 60)
    print("🏆 INTEGRATION ASSESSMENT:")

    if ttp_available and integration_complete and workflow_working:
        print("✅ SUCCESS: TTP diversity system is fully integrated!")
        print("   • TTP diversity system available and working")
        print("   • Generation script has complete TTP integration")
        print("   • Workflow correctly prevents similar TTPs")
        print("\n🎯 Result: Chisel hypotheses will be properly deduplicated")
        return True
    else:
        print("❌ ISSUES DETECTED:")
        if not ttp_available:
            print("   • TTP diversity system not available")
        if not integration_complete:
            print("   • Generation script missing TTP integration")
        if not workflow_working:
            print("   • TTP diversity workflow not working")
        print("\n⚠️ Result: Similar TTPs may still be generated")
        return False


if __name__ == "__main__":
    success = test_integration_setup()
    sys.exit(0 if success else 1)
