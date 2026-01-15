#!/usr/bin/env python3
"""
Comprehensive testing framework for HEARTH similarity detection system.
"""

import unittest
import tempfile
import json
import time
from pathlib import Path
from typing import List, Dict, Any
from unittest.mock import Mock, patch, MagicMock

import sys
sys.path.insert(0, str(Path(__file__).parent))

from similarity_detector import (
    HypothesisSimilarityDetector, SimilarityScore, TextPreprocessor,
    LexicalSimilarity, SemanticSimilarity, StructuralSimilarity
)
from hypothesis_deduplicator import HypothesisDeduplicator, DeduplicationResult
from hunt_regeneration_workflow import (
    HuntRegenerationWorkflow, RegenerationRequest, RegenerationResult,
    create_regeneration_request
)
from logger_config import get_logger

logger = get_logger()


class TestTextPreprocessor(unittest.TestCase):
    """Test text preprocessing functionality."""

    def setUp(self):
        self.preprocessor = TextPreprocessor()

    def test_normalize_text(self):
        """Test text normalization."""
        # Basic normalization
        text = "  THREAT ACTORS   are using  malicious software  "
        normalized = self.preprocessor.normalize_text(text)
        expected = "adversary are using malware"
        self.assertEqual(normalized, expected)

        # Term normalization
        text = "Attackers leverage command and control infrastructure"
        normalized = self.preprocessor.normalize_text(text)
        self.assertIn("adversary", normalized)
        self.assertIn("c2", normalized)

    def test_extract_keywords(self):
        """Test keyword extraction."""
        text = "Adversaries use PowerShell to execute malicious commands"
        keywords = self.preprocessor.extract_keywords(text)

        self.assertIn("adversary", keywords)
        self.assertIn("powershell", keywords)
        self.assertIn("execute", keywords)
        self.assertIn("malicious", keywords)
        self.assertIn("commands", keywords)

        # Should not include stop words
        self.assertNotIn("use", keywords)
        self.assertNotIn("to", keywords)

    def test_extract_phrases(self):
        """Test phrase extraction."""
        text = "Threat actors use living off the land techniques"
        phrases = self.preprocessor.extract_phrases(text, 3)

        # Should extract meaningful 3-word phrases
        self.assertTrue(any("living" in phrase for phrase in phrases))
        self.assertTrue(any("land" in phrase for phrase in phrases))


class TestLexicalSimilarity(unittest.TestCase):
    """Test lexical similarity calculations."""

    def setUp(self):
        self.preprocessor = TextPreprocessor()
        self.lexical = LexicalSimilarity(self.preprocessor)

    def test_jaccard_similarity(self):
        """Test Jaccard similarity calculation."""
        text1 = "Adversaries use PowerShell to execute commands"
        text2 = "Threat actors leverage PowerShell for command execution"

        similarity = self.lexical.jaccard_similarity(text1, text2)
        self.assertGreater(similarity, 0.3)  # Should have some overlap
        self.assertLess(similarity, 1.0)     # Should not be identical

        # Identical texts
        identical = self.lexical.jaccard_similarity(text1, text1)
        self.assertEqual(identical, 1.0)

        # Completely different texts
        different = self.lexical.jaccard_similarity(
            "PowerShell command execution",
            "Network traffic analysis"
        )
        self.assertLess(different, 0.3)

    def test_cosine_similarity(self):
        """Test cosine similarity calculation."""
        text1 = "PowerShell script execution detection"
        text2 = "Detecting PowerShell script execution"

        similarity = self.lexical.cosine_similarity(text1, text2)
        self.assertGreater(similarity, 0.5)  # High similarity

    def test_levenshtein_similarity(self):
        """Test Levenshtein distance similarity."""
        text1 = "PowerShell command execution"
        text2 = "PowerShell commands execution"  # Minor difference

        similarity = self.lexical.levenshtein_similarity(text1, text2)
        self.assertGreater(similarity, 0.8)  # Should be very similar


class TestSemanticSimilarity(unittest.TestCase):
    """Test semantic similarity calculations."""

    def setUp(self):
        self.preprocessor = TextPreprocessor()
        self.semantic = SemanticSimilarity(self.preprocessor)

    def test_concept_similarity(self):
        """Test concept-based similarity."""
        text1 = "Adversaries establish persistence using registry keys"
        text2 = "Threat actors maintain access through registry modifications"

        similarity = self.semantic.concept_similarity(text1, text2)
        self.assertGreater(similarity, 0.3)  # Should recognize persistence concept

    def test_tactic_similarity(self):
        """Test MITRE ATT&CK tactic similarity."""
        hunt1 = {"tactic": "Persistence, Defense Evasion"}
        hunt2 = {"tactic": "Persistence, Privilege Escalation"}

        similarity = self.semantic.tactic_similarity(hunt1, hunt2)
        self.assertGreater(similarity, 0.3)  # Share "Persistence"

        # Different tactics
        hunt3 = {"tactic": "Collection"}
        similarity_diff = self.semantic.tactic_similarity(hunt1, hunt3)
        self.assertEqual(similarity_diff, 0.0)  # No overlap


class TestStructuralSimilarity(unittest.TestCase):
    """Test structural similarity calculations."""

    def setUp(self):
        self.preprocessor = TextPreprocessor()
        self.structural = StructuralSimilarity(self.preprocessor)

    def test_sentence_structure_similarity(self):
        """Test sentence structure comparison."""
        text1 = "Adversaries use tool.exe to access system files"
        text2 = "Threat actors use script.py to modify network settings"

        similarity = self.structural.sentence_structure_similarity(text1, text2)
        self.assertGreater(similarity, 0.5)  # Similar structure

    def test_length_similarity(self):
        """Test length-based similarity."""
        text1 = "Short text"
        text2 = "Another short text"

        similarity = self.structural.length_similarity(text1, text2)
        self.assertGreater(similarity, 0.5)  # Similar lengths


class TestHypothesisSimilarityDetector(unittest.TestCase):
    """Test the main similarity detector."""

    def setUp(self):
        self.detector = HypothesisSimilarityDetector()

    def test_calculate_similarity_high(self):
        """Test high similarity detection."""
        hunt1 = {
            "title": "Adversaries use PowerShell to execute malicious commands",
            "tactic": "Execution"
        }
        hunt2 = {
            "title": "Threat actors leverage PowerShell for malicious command execution",
            "tactic": "Execution"
        }

        score = self.detector.calculate_similarity(hunt1, hunt2)

        self.assertIsInstance(score, SimilarityScore)
        self.assertGreater(score.overall_score, 0.6)  # Should be high similarity
        self.assertGreater(score.confidence, 0.3)     # Should have reasonable confidence

    def test_calculate_similarity_low(self):
        """Test low similarity detection."""
        hunt1 = {
            "title": "PowerShell command execution detection",
            "tactic": "Execution"
        }
        hunt2 = {
            "title": "DNS tunneling for data exfiltration",
            "tactic": "Exfiltration"
        }

        score = self.detector.calculate_similarity(hunt1, hunt2)

        self.assertLess(score.overall_score, 0.4)  # Should be low similarity

    def test_find_similar_hunts(self):
        """Test finding similar hunts from a dataset."""
        new_hunt = {
            "title": "Detect PowerShell script execution",
            "tactic": "Execution"
        }

        existing_hunts = [
            {"id": "H001", "title": "PowerShell command execution detection", "tactic": "Execution"},
            {"id": "H002", "title": "DNS tunneling detection", "tactic": "Exfiltration"},
            {"id": "H003", "title": "PowerShell script analysis", "tactic": "Execution"}
        ]

        similar_hunts = self.detector.find_similar_hunts(new_hunt, existing_hunts, threshold=0.3)

        # Should find at least the PowerShell-related hunts
        self.assertGreater(len(similar_hunts), 0)

        # Results should be sorted by similarity (highest first)
        if len(similar_hunts) > 1:
            self.assertGreaterEqual(similar_hunts[0][1].overall_score, similar_hunts[1][1].overall_score)


class TestHypothesisDeduplicator(unittest.TestCase):
    """Test hypothesis deduplication functionality."""

    def setUp(self):
        self.deduplicator = HypothesisDeduplicator(similarity_threshold=0.7)

    @patch('hypothesis_deduplicator.find_hunt_files')
    @patch('hypothesis_deduplicator.HuntFileReader')
    def test_check_hypothesis_uniqueness(self, mock_reader, mock_find_files):
        """Test hypothesis uniqueness checking."""
        # Mock existing hunts
        mock_hunt_data = Mock()
        mock_hunt_data.to_dict.return_value = {
            "id": "H001",
            "title": "Existing PowerShell detection hunt",
            "tactic": "Execution",
            "tags": ["powershell", "execution"]
        }

        mock_reader_instance = Mock()
        mock_reader_instance.parse_hunt_file.return_value = mock_hunt_data
        mock_reader.return_value = mock_reader_instance

        mock_find_files.return_value = [Path("test/H001.md")]

        # Test new hypothesis
        new_hypothesis = "Detect PowerShell script execution patterns"
        result = self.deduplicator.check_hypothesis_uniqueness(new_hypothesis, "Execution", ["powershell"])

        self.assertIsInstance(result, DeduplicationResult)
        self.assertIsInstance(result.is_duplicate, bool)
        self.assertIsInstance(result.similarity_threshold, float)

    def test_generation_statistics(self):
        """Test generation statistics calculation."""
        # Add some mock generation attempts
        from hypothesis_deduplicator import GenerationAttempt

        self.deduplicator.generation_history = [
            GenerationAttempt("test1", time.time(), "hypothesis1", "Execution", ["tag1"], [0.5], True),
            GenerationAttempt("test2", time.time(), "hypothesis2", "Persistence", ["tag2"], [0.8], False, "Too similar"),
            GenerationAttempt("test3", time.time(), "hypothesis3", "Collection", ["tag3"], [0.3], True)
        ]

        stats = self.deduplicator.get_generation_statistics()

        self.assertEqual(stats["total_attempts"], 3)
        self.assertEqual(stats["approved_attempts"], 2)
        self.assertAlmostEqual(stats["approval_rate"], 2 /3, places=2)


class TestHuntRegenerationWorkflow(unittest.TestCase):
    """Test hunt regeneration workflow."""

    def setUp(self):
        # Mock AI generator to avoid API calls
        self.workflow = HuntRegenerationWorkflow()
        self.workflow.ai_generator = Mock()

    def test_create_regeneration_request(self):
        """Test regeneration request creation."""
        request = create_regeneration_request(
            "Generate a unique threat hunting hypothesis",
            tactic="Execution",
            max_attempts=3
        )

        self.assertIsInstance(request, RegenerationRequest)
        self.assertEqual(request.tactic, "Execution")
        self.assertEqual(request.max_attempts, 3)
        self.assertIn("Generate a unique", request.base_prompt)

    def test_regeneration_workflow_mock(self):
        """Test regeneration workflow with mocked AI."""
        # Mock AI responses
        self.workflow.ai_generator.generate_hypothesis.side_effect = [
            {
                "hypothesis": "First attempt - very similar to existing",
                "tactic": "Execution",
                "tags": ["test1"]
            },
            {
                "hypothesis": "Second attempt - unique and different approach",
                "tactic": "Defense Evasion",
                "tags": ["test2", "unique"]
            }
        ]

        # Mock deduplicator to simulate similarity detection
        with patch.object(self.workflow.deduplicator, 'check_hypothesis_uniqueness') as mock_check:
            # First attempt: too similar
            # Second attempt: unique
            mock_check.side_effect = [
                DeduplicationResult(True, 0.7, 0.85, 1, [], "REJECT: Too similar", "High similarity"),
                DeduplicationResult(False, 0.7, 0.3, 0, [], "APPROVE: Unique", "No similar hunts")
            ]

            request = create_regeneration_request("Test prompt", max_attempts=2)

            # Mock the generation history to avoid actual AI calls
            with patch.object(self.workflow.deduplicator, 'generate_unique_hypothesis') as mock_generate:
                mock_generate.return_value = (
                    "Second attempt - unique and different approach",
                    DeduplicationResult(False, 0.7, 0.3, 0, [], "APPROVE: Unique", "No similar hunts")
                )

                result = self.workflow.regenerate_hypothesis(request)

                self.assertIsInstance(result, RegenerationResult)
                self.assertTrue(result.success)
                self.assertIn("unique and different", result.hypothesis)


class TestIntegratedSimilaritySystem(unittest.TestCase):
    """Integration tests for the complete similarity system."""

    def test_end_to_end_similarity_detection(self):
        """Test complete similarity detection pipeline."""
        # Create sample hunt data
        hunts = [
            {
                "id": "H001",
                "title": "PowerShell script execution detection using event logs",
                "tactic": "Execution",
                "tags": ["powershell", "script", "execution"]
            },
            {
                "id": "H002",
                "title": "DNS tunneling for command and control communications",
                "tactic": "Command and Control",
                "tags": ["dns", "tunneling", "c2"]
            },
            {
                "id": "H003",
                "title": "Registry persistence mechanisms used by malware",
                "tactic": "Persistence",
                "tags": ["registry", "persistence", "malware"]
            }
        ]

        # Test new hunt similar to existing
        new_hunt_similar = {
            "title": "Detecting PowerShell script execution through Windows event monitoring",
            "tactic": "Execution",
            "tags": ["powershell", "windows", "monitoring"]
        }

        detector = HypothesisSimilarityDetector()
        similar_hunts = detector.find_similar_hunts(new_hunt_similar, hunts, threshold=0.3)

        # Should find H001 as similar
        self.assertGreater(len(similar_hunts), 0)
        similar_ids = [hunt["id"] for hunt, _ in similar_hunts]
        self.assertIn("H001", similar_ids)

        # Test completely different hunt
        new_hunt_different = {
            "title": "Blockchain transaction analysis for cryptocurrency theft detection",
            "tactic": "Collection",
            "tags": ["blockchain", "cryptocurrency", "analysis"]
        }

        different_hunts = detector.find_similar_hunts(new_hunt_different, hunts, threshold=0.5)

        # Should find no similar hunts
        self.assertEqual(len(different_hunts), 0)


def run_similarity_tests():
    """Run all similarity detection tests."""
    test_classes = [
        TestTextPreprocessor,
        TestLexicalSimilarity,
        TestSemanticSimilarity,
        TestStructuralSimilarity,
        TestHypothesisSimilarityDetector,
        TestHypothesisDeduplicator,
        TestHuntRegenerationWorkflow,
        TestIntegratedSimilaritySystem
    ]

    runner = unittest.TextTestRunner(verbosity=2)
    all_passed = True

    for test_class in test_classes:
        print(f"\\n{'=' *60}")
        print(f"Running {test_class.__name__}")
        print('=' *60)

        suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
        result = runner.run(suite)

        if not result.wasSuccessful():
            all_passed = False

    print(f"\\n{'=' *60}")
    if all_passed:
        print("✅ ALL SIMILARITY DETECTION TESTS PASSED")
        return 0
    else:
        print("❌ SOME SIMILARITY DETECTION TESTS FAILED")
        return 1


if __name__ == '__main__':
    import sys
    sys.exit(run_similarity_tests())
