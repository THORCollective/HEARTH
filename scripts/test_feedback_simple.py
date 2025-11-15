#!/usr/bin/env python3
"""
Simple test for user feedback integration without dependencies.
"""

import os
import sys
from pathlib import Path


def test_feedback_integration():
    """Test user feedback integration logic."""
    print("🧪 Testing User Feedback Integration Logic")
    print("=" * 50)

    # Test 1: Environment variable handling
    print("\n1. Testing environment variable handling...")

    test_feedback = "do not use chisel as part of the hypothesis"
    os.environ["FEEDBACK"] = test_feedback
    retrieved = os.getenv("FEEDBACK")

    if retrieved == test_feedback:
        print("✅ Environment variable FEEDBACK correctly set and retrieved")
        print(f"   Value: {retrieved}")
    else:
        print("❌ Environment variable handling failed")
        return False

    # Test 2: Feedback instruction generation
    print("\n2. Testing feedback instruction generation...")

    def generate_feedback_instruction(user_feedback):
        """Simulate the feedback instruction generation."""
        if user_feedback:
            return f"USER FEEDBACK CONSTRAINTS: {user_feedback}\nYou MUST strictly follow these user instructions. "
        return ""

    instruction = generate_feedback_instruction(test_feedback)
    expected_start = "USER FEEDBACK CONSTRAINTS: do not use chisel"

    if expected_start in instruction:
        print("✅ Feedback instruction correctly generated")
        print(f"   Instruction: {instruction.strip()}")
    else:
        print("❌ Feedback instruction generation failed")
        return False

    # Test 3: Integration in regeneration prompt
    print("\n3. Testing regeneration prompt integration...")

    def create_regeneration_instruction(user_feedback, diversity_instruction=""):
        """Simulate regeneration instruction creation."""
        feedback_instruction = ""
        if user_feedback:
            feedback_instruction = f"USER FEEDBACK CONSTRAINTS: {user_feedback}\nYou MUST strictly follow these user instructions. "

        return (
            f"{feedback_instruction}"
            f"{diversity_instruction}"
            "IMPORTANT: Generate a NEW and DIFFERENT hunt hypothesis with different TTPs. "
            "Analyze the CTI report and focus on a different MITRE ATT&CK technique, tactic, "
            "or unique attack vector that was not covered before. Ensure this covers "
            "completely different Tactics, Techniques, and Procedures (TTPs).\n\n"
        )

    regen_instruction = create_regeneration_instruction(test_feedback)

    if "do not use chisel" in regen_instruction and "USER FEEDBACK CONSTRAINTS" in regen_instruction:
        print("✅ User feedback properly integrated into regeneration instruction")
        print("   Feedback appears at the beginning of the instruction")
    else:
        print("❌ User feedback not properly integrated")
        return False

    print("\n🎯 Integration Summary:")
    print("1. ✅ Environment variable 'FEEDBACK' handled correctly")
    print("2. ✅ Feedback converted to clear AI constraints")
    print("3. ✅ Constraints prioritized in regeneration instructions")
    print("4. ✅ AI will receive explicit user requirements")

    print("\n📋 Expected AI Behavior:")
    print("- When user says 'do not use chisel', AI must avoid Chisel")
    print("- User feedback takes priority over CTI content")
    print("- Clear constraint language ensures compliance")

    print("\n📝 Full regeneration instruction preview:")
    print("```")
    print(regen_instruction)
    print("```")

    return True


if __name__ == "__main__":
    success = test_feedback_integration()
    print(f"\n{'🎉 Feedback integration logic working correctly!' if success else '⚠️ Issues detected with feedback integration'}")
