#!/usr/bin/env python3
"""
Unit tests for the unified duplicate_detector module.

Tests cover:
- HuntExtractor functionality
- All detection strategies (Exact, Enhanced, AI)
- DuplicateDetector main class
- Edge cases and error handling
"""

import unittest
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'scripts'))

from duplicate_detector import (
    DuplicateDetector,
    HuntExtractor,
    ExactMatchStrategy,
    EnhancedSimilarityStrategy,
    AIAnalysisStrategy,
    HuntInfo,
    DetectionMethod,
    DuplicateDetectionResult
)


class TestHuntExtractor(unittest.TestCase):
    """Test hunt information extraction from markdown content."""

    def setUp(self):
        self.extractor = HuntExtractor()

    def test_extract_basic_hunt_info(self):
        """Test extraction of basic hunt information."""
        content = """
Detect adversaries using PowerShell to download malicious payloads.

| Hunt # | Idea / Hypothesis | Tactic | Technique | Tags | Submitter |
|--------|-------------------|--------|-----------|------|-----------|
| | Detect adversaries using PowerShell to download malicious payloads. | Execution | T1059.001 | #execution #powershell | test-user |

## Why
This is a common attack technique.
"""
        hunt_info = self.extractor.extract_from_content(content, "test.md")

        self.assertIsNotNone(hunt_info)
        self.assertEqual(hunt_info.filename, "test.md")
        self.assertEqual(hunt_info.hypothesis, "Detect adversaries using PowerShell to download malicious payloads.")
        self.assertEqual(hunt_info.tactic, "Execution")
        self.assertEqual(hunt_info.technique, "T1059.001")
        self.assertIn("#execution", hunt_info.tags)
        self.assertIn("#powershell", hunt_info.tags)

    def test_extract_with_missing_table(self):
        """Test extraction when table is missing."""
        content = """
Detect credential dumping activities in memory.

This is a hunt hypothesis without a proper table structure.
"""
        hunt_info = self.extractor.extract_from_content(content, "test.md")

        self.assertIsNotNone(hunt_info)
        self.assertEqual(hunt_info.hypothesis, "Detect credential dumping activities in memory.")
        self.assertEqual(hunt_info.tactic, "")  # No tactic without table
        self.assertEqual(hunt_info.technique, "")

    def test_extract_empty_content(self):
        """Test extraction from empty content."""
        hunt_info = self.extractor.extract_from_content("", "test.md")

        self.assertIsNotNone(hunt_info)
        self.assertEqual(hunt_info.hypothesis, "")

    def test_extract_with_special_characters(self):
        """Test extraction with special characters in hypothesis."""
        content = """
Detect "unusual" network traffic & suspicious DNS queries (e.g., C2 beaconing).

| Hunt # | Idea / Hypothesis | Tactic | Technique | Tags | Submitter |
|--------|-------------------|--------|-----------|------|-----------|
| | Detect unusual network traffic | Command and Control | T1071 | #c2 | test |
"""
        hunt_info = self.extractor.extract_from_content(content, "test.md")

        self.assertIsNotNone(hunt_info)
        self.assertIn("unusual", hunt_info.hypothesis.lower())


class TestExactMatchStrategy(unittest.TestCase):
    """Test exact match detection strategy."""

    def setUp(self):
        self.strategy = ExactMatchStrategy(threshold=0.95)

    def test_exact_match_detection(self):
        """Test detection of exact matches."""
        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Detect PowerShell malicious downloads",
            tactic="Execution",
            technique="T1059.001",
            tags=["#execution"]
        )

        existing_hunts = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Detect PowerShell malicious downloads",  # Exact match
                tactic="Execution",
                technique="T1059.001",
                tags=["#execution"]
            )
        ]

        result = self.strategy.detect(new_hunt, existing_hunts)

        self.assertTrue(result.is_duplicate)
        self.assertEqual(result.method_used, DetectionMethod.EXACT_MATCH)
        self.assertGreaterEqual(result.max_similarity_score, 0.95)
        self.assertEqual(result.similar_hunts_count, 1)

    def test_near_exact_match_detection(self):
        """Test detection of near-exact matches."""
        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Detect PowerShell downloading malicious payloads",
            tactic="Execution"
        )

        existing_hunts = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Detect PowerShell malicious downloads",  # Very similar
                tactic="Execution"
            )
        ]

        result = self.strategy.detect(new_hunt, existing_hunts)

        # Should detect high similarity
        self.assertGreater(result.max_similarity_score, 0.6)

    def test_no_match_detection(self):
        """Test when no matches are found."""
        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Detect credential dumping from LSASS memory",
            tactic="Credential Access"
        )

        existing_hunts = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Detect registry persistence mechanisms",
                tactic="Persistence"
            )
        ]

        result = self.strategy.detect(new_hunt, existing_hunts)

        self.assertFalse(result.is_duplicate)
        self.assertLess(result.max_similarity_score, 0.95)

    def test_empty_existing_hunts(self):
        """Test with no existing hunts."""
        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Some hypothesis",
            tactic="Execution"
        )

        result = self.strategy.detect(new_hunt, [])

        self.assertFalse(result.is_duplicate)
        self.assertEqual(result.similar_hunts_count, 0)


class TestEnhancedSimilarityStrategy(unittest.TestCase):
    """Test enhanced similarity detection strategy."""

    def setUp(self):
        self.strategy = EnhancedSimilarityStrategy(threshold=0.7)

    @patch('duplicate_detector.get_similarity_detector')
    def test_enhanced_similarity_detection(self, mock_get_detector):
        """Test enhanced similarity detection with mocked detector."""
        # Mock similarity detector
        mock_detector = Mock()
        mock_similarity_score = Mock()
        mock_similarity_score.overall_score = 0.85
        mock_similarity_score.lexical_score = 0.8
        mock_similarity_score.semantic_score = 0.9
        mock_similarity_score.structural_score = 0.85
        mock_similarity_score.confidence = 0.9

        mock_detector.find_similar_hunts.return_value = [
            (
                {
                    'hypothesis': 'Existing hunt',
                    'tactic': 'Execution',
                    'filepath': 'existing.md',
                    'filename': 'existing.md'
                },
                mock_similarity_score
            )
        ]
        mock_get_detector.return_value = mock_detector

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="New hunt hypothesis",
            tactic="Execution"
        )

        existing_hunts = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Existing hunt",
                tactic="Execution"
            )
        ]

        result = self.strategy.detect(new_hunt, existing_hunts)

        self.assertTrue(result.is_duplicate)
        self.assertEqual(result.method_used, DetectionMethod.ENHANCED_SIMILARITY)
        self.assertGreater(result.max_similarity_score, 0.7)
        self.assertEqual(result.similar_hunts_count, 1)

    @patch('duplicate_detector.get_similarity_detector')
    def test_enhanced_similarity_no_matches(self, mock_get_detector):
        """Test enhanced similarity with no matches."""
        mock_detector = Mock()
        mock_detector.find_similar_hunts.return_value = []
        mock_get_detector.return_value = mock_detector

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Unique hypothesis",
            tactic="Discovery"
        )

        result = self.strategy.detect(new_hunt, [])

        self.assertFalse(result.is_duplicate)
        self.assertEqual(result.similar_hunts_count, 0)

    @patch('duplicate_detector.get_similarity_detector')
    def test_enhanced_similarity_error_handling(self, mock_get_detector):
        """Test error handling in enhanced similarity."""
        mock_detector = Mock()
        mock_detector.find_similar_hunts.side_effect = Exception("Test error")
        mock_get_detector.return_value = mock_detector

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Test hypothesis",
            tactic="Execution"
        )

        result = self.strategy.detect(new_hunt, [])

        # Should return error result, not raise exception
        self.assertFalse(result.is_duplicate)
        self.assertEqual(result.confidence, 0.0)
        self.assertIn("ERROR", result.recommendation)


class TestAIAnalysisStrategy(unittest.TestCase):
    """Test AI analysis detection strategy."""

    def setUp(self):
        self.strategy = AIAnalysisStrategy(threshold=0.7)

    @patch('duplicate_detector.OPENAI_AVAILABLE', True)
    @patch('duplicate_detector.OpenAI')
    def test_ai_analysis_with_duplicates(self, mock_openai_class):
        """Test AI analysis detecting duplicates."""
        # Mock OpenAI client
        mock_client = Mock()
        mock_response = Mock()
        mock_message = Mock()
        mock_message.content = '''
{
    "comparisons": [
        {
            "hunt_filename": "existing.md",
            "similarity_score": 85,
            "explanation": "Both hunts focus on PowerShell malicious downloads",
            "recommendation": "SIMILAR"
        }
    ],
    "overall_assessment": "Hunts are very similar in approach",
    "recommendation": "FLAG_FOR_REVIEW"
}
'''
        mock_response.choices = [Mock(message=mock_message)]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        # Reinitialize strategy with mocked client
        self.strategy.client = mock_client

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Detect PowerShell downloads",
            tactic="Execution"
        )

        existing_hunts = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Detect PowerShell malicious activity",
                tactic="Execution"
            )
        ]

        result = self.strategy.detect(new_hunt, existing_hunts)

        self.assertTrue(result.is_duplicate)
        self.assertEqual(result.method_used, DetectionMethod.AI_ANALYSIS)
        self.assertGreater(result.max_similarity_score, 0.7)

    def test_ai_analysis_without_api_key(self):
        """Test AI analysis when no API key is configured."""
        strategy = AIAnalysisStrategy(threshold=0.7)
        strategy.client = None  # Simulate no API key

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Test hypothesis",
            tactic="Execution"
        )

        result = strategy.detect(new_hunt, [])

        self.assertFalse(result.is_duplicate)
        self.assertIn("unavailable", result.detailed_report.lower())

    @patch('duplicate_detector.OPENAI_AVAILABLE', True)
    @patch('duplicate_detector.OpenAI')
    def test_ai_analysis_invalid_json_response(self, mock_openai_class):
        """Test AI analysis with invalid JSON response."""
        mock_client = Mock()
        mock_response = Mock()
        mock_message = Mock()
        mock_message.content = "This is not valid JSON"
        mock_response.choices = [Mock(message=mock_message)]
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai_class.return_value = mock_client

        self.strategy.client = mock_client

        new_hunt = HuntInfo(
            filepath="new.md",
            filename="new.md",
            hypothesis="Test",
            tactic="Execution"
        )

        result = self.strategy.detect(new_hunt, [])

        self.assertFalse(result.is_duplicate)
        self.assertIn("parse", result.detailed_report.lower())


class TestDuplicateDetector(unittest.TestCase):
    """Test main DuplicateDetector class."""

    def setUp(self):
        self.detector = DuplicateDetector()

    def test_initialization(self):
        """Test detector initialization."""
        self.assertIsNotNone(self.detector.extractor)
        self.assertIsNotNone(self.detector.strategies)
        self.assertIn(DetectionMethod.EXACT_MATCH, self.detector.strategies)
        self.assertIn(DetectionMethod.ENHANCED_SIMILARITY, self.detector.strategies)

    @patch.object(DuplicateDetector, '_load_existing_hunts')
    def test_check_for_duplicates_with_matches(self, mock_load):
        """Test duplicate checking with matches found."""
        mock_load.return_value = [
            HuntInfo(
                filepath="existing.md",
                filename="existing.md",
                hypothesis="Detect PowerShell malicious downloads",
                tactic="Execution"
            )
        ]

        content = """
Detect PowerShell malicious downloads

| Hunt # | Idea / Hypothesis | Tactic | Technique | Tags | Submitter |
|--------|-------------------|--------|-----------|------|-----------|
| | Detect PowerShell malicious downloads | Execution | T1059 | #execution | test |
"""

        result = self.detector.check_for_duplicates(content, "new.md")

        self.assertIsInstance(result, DuplicateDetectionResult)
        self.assertGreater(result.max_similarity_score, 0.0)

    @patch.object(DuplicateDetector, '_load_existing_hunts')
    def test_check_for_duplicates_no_existing_hunts(self, mock_load):
        """Test duplicate checking with no existing hunts."""
        mock_load.return_value = []

        content = "Test hypothesis"

        result = self.detector.check_for_duplicates(content, "new.md")

        self.assertFalse(result.is_duplicate)
        self.assertEqual(result.similar_hunts_count, 0)
        self.assertIn("APPROVE", result.recommendation)

    def test_check_for_duplicates_invalid_content(self):
        """Test duplicate checking with invalid content."""
        result = self.detector.check_for_duplicates("", "new.md")

        self.assertFalse(result.is_duplicate)
        self.assertIn("ERROR", result.recommendation)

    def test_generate_github_comment_no_duplicates(self):
        """Test GitHub comment generation with no duplicates."""
        result = DuplicateDetectionResult(
            is_duplicate=False,
            method_used=DetectionMethod.EXACT_MATCH,
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="APPROVE",
            detailed_report="No duplicates found",
            confidence=0.9
        )

        comment = self.detector.generate_github_comment(result)

        self.assertIn("✅", comment)
        self.assertIn("unique", comment.lower())
        self.assertIn("exact_match", comment)

    def test_generate_github_comment_with_duplicates(self):
        """Test GitHub comment generation with duplicates found."""
        result = DuplicateDetectionResult(
            is_duplicate=True,
            method_used=DetectionMethod.ENHANCED_SIMILARITY,
            max_similarity_score=0.85,
            similar_hunts_count=2,
            similar_hunts=[
                {
                    'filename': 'hunt1.md',
                    'filepath': 'Flames/hunt1.md',
                    'hypothesis': 'Similar hunt 1',
                    'tactic': 'Execution',
                    'similarity_score': 85.0
                },
                {
                    'filename': 'hunt2.md',
                    'filepath': 'Flames/hunt2.md',
                    'hypothesis': 'Similar hunt 2',
                    'tactic': 'Execution',
                    'similarity_score': 72.0
                }
            ],
            recommendation="REVIEW: High similarity",
            detailed_report="Found similar hunts",
            confidence=0.9
        )

        comment = self.detector.generate_github_comment(result)

        self.assertIn("⚠️", comment)
        self.assertIn("2 Similar", comment)
        self.assertIn("hunt1.md", comment)
        self.assertIn("hunt2.md", comment)
        self.assertIn("85.0%", comment)

    @patch('duplicate_detector.Path')
    @patch('duplicate_detector.sqlite3')
    def test_load_hunts_from_db(self, mock_sqlite, mock_path):
        """Test loading hunts from database."""
        # Mock database connection
        mock_conn = Mock()
        mock_cursor = [
            {
                'file_path': 'Flames/hunt1.md',
                'filename': 'hunt1.md',
                'hypothesis': 'Test hypothesis 1',
                'tactic': 'Execution',
                'technique': 'T1059',
                'tags': '["#execution"]'
            }
        ]
        mock_conn.execute.return_value = mock_cursor
        mock_sqlite.connect.return_value = mock_conn

        # Mock Path.exists() to return True for database
        mock_path_instance = Mock()
        mock_path_instance.exists.return_value = True
        mock_path.return_value = mock_path_instance

        hunts = self.detector._load_hunts_from_db()

        self.assertGreater(len(hunts), 0)
        self.assertIsInstance(hunts[0], HuntInfo)

    def test_select_strategy_default(self):
        """Test strategy selection with default config."""
        strategy = self.detector._select_strategy()

        self.assertIsInstance(strategy, (ExactMatchStrategy, EnhancedSimilarityStrategy))

    def test_select_strategy_with_preferred(self):
        """Test strategy selection with preferred method."""
        detector = DuplicateDetector(preferred_method=DetectionMethod.EXACT_MATCH)
        strategy = detector._select_strategy()

        self.assertIsInstance(strategy, ExactMatchStrategy)


class TestBackwardCompatibility(unittest.TestCase):
    """Test backward compatibility functions."""

    @patch.object(DuplicateDetector, 'check_for_duplicates')
    @patch.object(DuplicateDetector, 'generate_github_comment')
    def test_check_duplicates_for_new_submission(self, mock_comment, mock_check):
        """Test backward compatibility wrapper function."""
        from duplicate_detector import check_duplicates_for_new_submission

        mock_result = DuplicateDetectionResult(
            is_duplicate=False,
            method_used=DetectionMethod.EXACT_MATCH,
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="APPROVE",
            detailed_report="Test",
            confidence=0.9
        )
        mock_check.return_value = mock_result
        mock_comment.return_value = "Test comment"

        result = check_duplicates_for_new_submission("test content", "test.md")

        self.assertEqual(result, "Test comment")
        mock_check.assert_called_once()

    @patch.object(DuplicateDetector, '_load_existing_hunts')
    def test_get_all_existing_hunts(self, mock_load):
        """Test backward compatibility for get_all_existing_hunts."""
        from duplicate_detector import get_all_existing_hunts

        mock_load.return_value = [
            HuntInfo(
                filepath="test.md",
                filename="test.md",
                hypothesis="Test",
                tactic="Execution",
                tags=["#test"]
            )
        ]

        hunts = get_all_existing_hunts()

        self.assertIsInstance(hunts, list)
        self.assertIsInstance(hunts[0], dict)
        self.assertIn('hypothesis', hunts[0])

    def test_extract_hunt_info_function(self):
        """Test backward compatibility for extract_hunt_info."""
        from duplicate_detector import extract_hunt_info

        content = "Test hypothesis"
        result = extract_hunt_info(content, "test.md")

        self.assertIsInstance(result, dict)
        self.assertIn('hypothesis', result)


def run_tests():
    """Run all tests."""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
