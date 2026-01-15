#!/usr/bin/env python3
"""
Simple test for similarity detection components.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from similarity_detector import HypothesisSimilarityDetector
    print("✅ similarity_detector imported successfully")
except Exception as e:
    print(f"❌ Error importing similarity_detector: {e}")

try:
    from hypothesis_deduplicator import get_hypothesis_deduplicator
    print("✅ hypothesis_deduplicator imported successfully")
except Exception as e:
    print(f"❌ Error importing hypothesis_deduplicator: {e}")

try:
    from hunt_regeneration_workflow import HuntRegenerationWorkflow
    print("✅ hunt_regeneration_workflow imported successfully")
except Exception as e:
    print(f"❌ Error importing hunt_regeneration_workflow: {e}")

# Test basic functionality
try:
    detector = HypothesisSimilarityDetector()

    hunt1 = {
        "title": "Adversaries use PowerShell to execute malicious commands",
        "tactic": "Execution"
    }
    hunt2 = {
        "title": "Threat actors leverage PowerShell for malicious command execution",
        "tactic": "Execution"
    }

    score = detector.calculate_similarity(hunt1, hunt2)
    print(f"✅ Similarity calculation successful: {score.overall_score:.2%}")

except Exception as e:
    print(f"❌ Error in similarity calculation: {e}")

print("Test completed")
