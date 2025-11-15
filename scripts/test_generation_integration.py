#!/usr/bin/env python3
"""
Test the integrated TTP diversity system in hunt generation.
"""

import sys
import os
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from generate_from_cti import generate_hunt_content_with_ttp_diversity


def test_generation_integration():
    """Test TTP diversity integration in hunt generation."""
    print("🧪 Testing TTP Diversity Integration in Hunt Generation")
    print("=" * 70)

    # Mock CTI content about Chisel tunneling
    mock_cti = """
    Threat Intelligence Report: Advanced Tunneling Campaign
    
    Threat actors are increasingly using Chisel, an open-source tunneling utility,
    to establish covert communication channels. The tool creates SOCKS proxies on
    compromised hosts, allowing adversaries to bypass network security controls
    such as firewalls and intrusion detection systems.
    
    Technical Details:
    - Tool: Chisel (github.com/jpillora/chisel)
    - Technique: SOCKS proxy creation (MITRE T1090.001)
    - Tactic: Command and Control
    - Purpose: Bypass network controls, conceal C2 traffic
    - Targets: Windows and Linux systems
    
    Attack Flow:
    1. Initial compromise via phishing
    2. Download and install Chisel binary
    3. Establish SOCKS proxy tunnel
    4. Route C2 traffic through tunnel
    5. Maintain persistent access
    
    Indicators:
    - Chisel binary execution
    - Network connections to tunneling infrastructure
    - SOCKS proxy traffic patterns
    """

    print("\n🎯 Testing multiple generation attempts for TTP diversity:")
    print("-" * 70)

    # Test multiple generations to see TTP diversity in action
    for attempt in range(3):
        print(f"\n🔄 Generation Attempt {attempt + 1}:")

        content = generate_hunt_content_with_ttp_diversity(
            cti_text=mock_cti,
            cti_source_url="https://example.com/threat-report",
            submitter_credit="test-user",
            is_regeneration=(attempt > 0),
            max_attempts=3
        )

        if content:
            # Extract hypothesis
            lines = content.split('\n')
            hypothesis = lines[0].strip() if lines else "No hypothesis found"
            if hypothesis.startswith('#'):
                hypothesis = hypothesis.lstrip('#').strip()

            print(f"   📝 Generated: {hypothesis[:80]}...")

            # Look for tactic in content
            tactic = "Unknown"
            for line in lines:
                if '|' in line and any(t in line.lower() for t in ['command', 'execution', 'persistence']):
                    parts = [p.strip() for p in line.split('|')]
                    if len(parts) >= 4:
                        tactic = parts[2] if parts[2] else "Unknown"
                        break

            print(f"   🎯 Tactic: {tactic}")
            print("   ✅ Generation successful")
        else:
            print("   ❌ Generation failed")

    print("\n" + "=" * 70)
    print("🏆 Integration test complete!")
    print("\nExpected behavior:")
    print("- First attempt should generate Chisel/tunneling hypothesis")
    print("- Subsequent attempts should be rejected or use different TTPs")
    print("- System should enforce TTP diversity during generation")


if __name__ == "__main__":
    test_generation_integration()
