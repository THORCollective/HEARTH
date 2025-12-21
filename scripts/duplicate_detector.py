#!/usr/bin/env python3
"""
Unified duplicate detection system for HEARTH threat hunting hypotheses.

This module consolidates the functionality from duplicate_detection.py and
duplicate_detection_improved.py into a single, well-structured implementation
using the Strategy pattern for different detection methods.

Architecture:
    - DuplicateDetector: Main class coordinating duplicate detection
    - Detection Strategies: Pluggable detection methods (DB-based, AI-based, Enhanced similarity)
    - Result Types: Structured result objects for different detection methods
"""

import os
import re
import sqlite3
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from abc import ABC, abstractmethod
from enum import Enum

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

from dotenv import load_dotenv

from similarity_detector import get_similarity_detector
from hypothesis_deduplicator import get_hypothesis_deduplicator
from logger_config import get_logger
from config_manager import get_config

load_dotenv()
logger = get_logger()
config = get_config().config

# Database configuration
DATABASE_PATH = os.getenv("HEARTH_DB_PATH", "database/hunts.db")


class DetectionMethod(Enum):
    """Enumeration of available detection methods."""
    DATABASE = "database"
    AI_ANALYSIS = "ai_analysis"
    ENHANCED_SIMILARITY = "enhanced_similarity"
    EXACT_MATCH = "exact_match"


@dataclass
class HuntInfo:
    """Structured representation of hunt information."""
    filepath: str
    filename: str
    hypothesis: str
    tactic: str
    technique: str = ""
    tags: List[str] = None
    content: str = ""

    def __post_init__(self):
        if self.tags is None:
            self.tags = []


@dataclass
class DuplicateDetectionResult:
    """
    Unified result structure for duplicate detection.

    Attributes:
        is_duplicate: Whether duplicates were found above threshold
        method_used: Which detection method was used
        max_similarity_score: Highest similarity score found (0.0-1.0)
        similar_hunts_count: Number of similar hunts found
        similar_hunts: List of similar hunt details
        recommendation: Action recommendation (APPROVE, REVIEW, REJECT)
        detailed_report: Human-readable detailed analysis
        confidence: Confidence level in the detection (0.0-1.0)
    """
    is_duplicate: bool
    method_used: DetectionMethod
    max_similarity_score: float
    similar_hunts_count: int
    similar_hunts: List[Dict[str, Any]]
    recommendation: str
    detailed_report: str
    confidence: float = 0.9

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for serialization."""
        return {
            'is_duplicate': self.is_duplicate,
            'method_used': self.method_used.value,
            'max_similarity_score': self.max_similarity_score,
            'similar_hunts_count': self.similar_hunts_count,
            'similar_hunts': self.similar_hunts,
            'recommendation': self.recommendation,
            'detailed_report': self.detailed_report,
            'confidence': self.confidence
        }


class HuntExtractor:
    """Extracts hunt information from various sources."""

    @staticmethod
    def extract_from_content(content: str, filepath: str) -> Optional[HuntInfo]:
        """
        Extract hunt information from markdown content.

        Args:
            content: Markdown content of hunt file
            filepath: Path to the hunt file

        Returns:
            HuntInfo object or None if extraction fails
        """
        try:
            lines = content.splitlines()

            # Extract hypothesis (first non-empty line)
            hypothesis = ""
            for line in lines:
                line_stripped = line.strip()
                if line_stripped and not line.startswith('|') and not line.startswith('#'):
                    hypothesis = line_stripped
                    break

            # Extract tactic and technique from the table
            tactic = ""
            technique = ""
            for i, line in enumerate(lines):
                if '|' in line and ('Tactic' in line or 'Technique' in line):
                    # Find the data row (skip separator line)
                    if i + 2 < len(lines):
                        data_row = lines[i + 2]
                        if '|' in data_row:
                            cells = [c.strip() for c in data_row.split('|') if c.strip()]
                            if len(cells) >= 3:
                                tactic = cells[2] if len(cells) > 2 else ""
                            if len(cells) >= 4:
                                technique = cells[3] if len(cells) > 3 else ""
                    break

            # Extract tags
            tags = []
            for line in lines:
                if '#' in line:
                    # Look for hashtags
                    tag_matches = re.findall(r'#[\w-]+', line)
                    tags.extend(tag_matches)

            return HuntInfo(
                filepath=filepath,
                filename=Path(filepath).name,
                hypothesis=hypothesis,
                tactic=tactic,
                technique=technique,
                tags=list(set(tags)),  # Remove duplicates
                content=content[:500]  # First 500 chars for context
            )

        except Exception as error:
            logger.warning(f"Error extracting hunt info from {filepath}: {error}")
            return None


class DetectionStrategy(ABC):
    """Abstract base class for duplicate detection strategies."""

    @abstractmethod
    def detect(self, new_hunt: HuntInfo, existing_hunts: List[HuntInfo]) -> DuplicateDetectionResult:
        """
        Detect duplicates using this strategy.

        Args:
            new_hunt: New hunt to check
            existing_hunts: List of existing hunts to compare against

        Returns:
            DuplicateDetectionResult with findings
        """
        pass

    @abstractmethod
    def get_method_name(self) -> DetectionMethod:
        """Return the detection method name."""
        pass


class ExactMatchStrategy(DetectionStrategy):
    """
    Strategy for detecting exact or near-exact matches.

    This is the fastest method, useful for catching obvious duplicates.
    """

    def __init__(self, threshold: float = 0.95):
        self.threshold = threshold

    def get_method_name(self) -> DetectionMethod:
        return DetectionMethod.EXACT_MATCH

    def detect(self, new_hunt: HuntInfo, existing_hunts: List[HuntInfo]) -> DuplicateDetectionResult:
        """Detect exact or near-exact matches."""
        similar_hunts = []
        max_score = 0.0

        new_hyp_normalized = self._normalize_text(new_hunt.hypothesis)

        for existing in existing_hunts:
            existing_hyp_normalized = self._normalize_text(existing.hypothesis)

            # Calculate exact match score
            if new_hyp_normalized == existing_hyp_normalized:
                score = 1.0
            elif new_hyp_normalized in existing_hyp_normalized or existing_hyp_normalized in new_hyp_normalized:
                score = 0.9
            else:
                # Check word-by-word overlap
                new_words = set(new_hyp_normalized.split())
                existing_words = set(existing_hyp_normalized.split())

                if not new_words or not existing_words:
                    continue

                intersection = len(new_words.intersection(existing_words))
                union = len(new_words.union(existing_words))
                score = intersection / union if union > 0 else 0.0

            if score >= self.threshold:
                similar_hunts.append({
                    'filepath': existing.filepath,
                    'filename': existing.filename,
                    'hypothesis': existing.hypothesis,
                    'tactic': existing.tactic,
                    'similarity_score': score * 100,
                    'match_type': 'exact' if score >= 0.99 else 'near-exact'
                })
                max_score = max(max_score, score)

        # Sort by similarity score
        similar_hunts.sort(key=lambda x: x['similarity_score'], reverse=True)

        is_duplicate = max_score >= self.threshold
        recommendation = self._generate_recommendation(max_score)
        detailed_report = self._generate_report(new_hunt, similar_hunts, max_score)

        return DuplicateDetectionResult(
            is_duplicate=is_duplicate,
            method_used=self.get_method_name(),
            max_similarity_score=max_score,
            similar_hunts_count=len(similar_hunts),
            similar_hunts=similar_hunts[:5],  # Top 5
            recommendation=recommendation,
            detailed_report=detailed_report,
            confidence=0.95
        )

    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\w\s]', '', text)
        return text

    def _generate_recommendation(self, max_score: float) -> str:
        """Generate recommendation based on score."""
        if max_score >= 0.99:
            return "REJECT: Exact duplicate found"
        elif max_score >= 0.95:
            return "REVIEW: Near-exact match found"
        else:
            return "APPROVE: No exact matches"

    def _generate_report(self, new_hunt: HuntInfo, similar_hunts: List[Dict], max_score: float) -> str:
        """Generate detailed report."""
        if not similar_hunts:
            return "No exact or near-exact matches found."

        report = f"Found {len(similar_hunts)} exact/near-exact match(es):\n\n"
        for hunt in similar_hunts[:3]:
            report += f"- {hunt['filename']}: {hunt['similarity_score']:.1f}% match ({hunt['match_type']})\n"

        return report


class EnhancedSimilarityStrategy(DetectionStrategy):
    """
    Strategy using enhanced similarity detection with multiple algorithms.

    Combines:
    - Lexical similarity (Jaccard, Cosine, Levenshtein)
    - Semantic similarity (concept mapping, MITRE ATT&CK tactics)
    - Structural similarity (sentence patterns, length)
    - Keyword overlap analysis
    """

    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold
        self.similarity_detector = get_similarity_detector()

    def get_method_name(self) -> DetectionMethod:
        return DetectionMethod.ENHANCED_SIMILARITY

    def detect(self, new_hunt: HuntInfo, existing_hunts: List[HuntInfo]) -> DuplicateDetectionResult:
        """Detect duplicates using enhanced similarity algorithms."""
        try:
            # Convert HuntInfo objects to dicts for similarity detector
            new_hunt_dict = {
                'title': new_hunt.hypothesis,
                'hypothesis': new_hunt.hypothesis,
                'tactic': new_hunt.tactic,
                'tags': new_hunt.tags
            }

            existing_hunts_dicts = [
                {
                    'title': h.hypothesis,
                    'hypothesis': h.hypothesis,
                    'tactic': h.tactic,
                    'tags': h.tags,
                    'filepath': h.filepath,
                    'filename': h.filename
                }
                for h in existing_hunts
            ]

            # Find similar hunts using similarity detector
            similar_results = self.similarity_detector.find_similar_hunts(
                new_hunt_dict,
                existing_hunts_dicts,
                self.threshold
            )

            # Convert results to standard format
            similar_hunts = []
            max_score = 0.0

            for hunt_dict, similarity_score in similar_results:
                score_value = similarity_score.overall_score
                similar_hunts.append({
                    'filepath': hunt_dict.get('filepath', ''),
                    'filename': hunt_dict.get('filename', 'Unknown'),
                    'hypothesis': hunt_dict.get('hypothesis', ''),
                    'tactic': hunt_dict.get('tactic', ''),
                    'similarity_score': score_value * 100,
                    'lexical_score': similarity_score.lexical_score,
                    'semantic_score': similarity_score.semantic_score,
                    'structural_score': similarity_score.structural_score,
                    'confidence': similarity_score.confidence
                })
                max_score = max(max_score, score_value)

            is_duplicate = max_score >= self.threshold
            recommendation = self._generate_recommendation(max_score)
            detailed_report = self._generate_report(new_hunt, similar_hunts, max_score)

            # Average confidence from similarity scores
            avg_confidence = (
                sum(h.get('confidence', 0.8) for h in similar_hunts) / len(similar_hunts)
                if similar_hunts else 0.8
            )

            return DuplicateDetectionResult(
                is_duplicate=is_duplicate,
                method_used=self.get_method_name(),
                max_similarity_score=max_score,
                similar_hunts_count=len(similar_hunts),
                similar_hunts=similar_hunts[:5],
                recommendation=recommendation,
                detailed_report=detailed_report,
                confidence=avg_confidence
            )

        except Exception as error:
            logger.error(f"Error in enhanced similarity detection: {error}")
            # Return empty result on error
            return DuplicateDetectionResult(
                is_duplicate=False,
                method_used=self.get_method_name(),
                max_similarity_score=0.0,
                similar_hunts_count=0,
                similar_hunts=[],
                recommendation="ERROR: Detection failed",
                detailed_report=f"Enhanced similarity detection failed: {error}",
                confidence=0.0
            )

    def _generate_recommendation(self, max_score: float) -> str:
        """Generate recommendation based on score."""
        if max_score >= 0.8:
            return "REVIEW: High similarity detected"
        elif max_score >= 0.6:
            return "REVIEW: Moderate similarity detected"
        else:
            return "APPROVE: Low similarity - appears unique"

    def _generate_report(self, new_hunt: HuntInfo, similar_hunts: List[Dict], max_score: float) -> str:
        """Generate detailed report."""
        if not similar_hunts:
            return "Enhanced similarity analysis found no significant matches."

        report = f"Enhanced Similarity Analysis Results:\n"
        report += f"Found {len(similar_hunts)} similar hunt(s) above {self.threshold:.0%} threshold\n\n"

        for i, hunt in enumerate(similar_hunts[:3], 1):
            report += f"{i}. {hunt['filename']} ({hunt['similarity_score']:.1f}%)\n"
            report += f"   Lexical: {hunt.get('lexical_score', 0):.1%} | "
            report += f"Semantic: {hunt.get('semantic_score', 0):.1%} | "
            report += f"Structural: {hunt.get('structural_score', 0):.1%}\n"

        return report


class AIAnalysisStrategy(DetectionStrategy):
    """
    Strategy using AI (GPT-4/Claude) for semantic duplicate detection.

    This method provides the most nuanced analysis but is slower and
    requires API access.
    """

    def __init__(self, threshold: float = 0.7):
        self.threshold = threshold
        self.client = None

        if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
            self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def get_method_name(self) -> DetectionMethod:
        return DetectionMethod.AI_ANALYSIS

    def detect(self, new_hunt: HuntInfo, existing_hunts: List[HuntInfo]) -> DuplicateDetectionResult:
        """Detect duplicates using AI analysis."""
        if not self.client:
            logger.warning("AI analysis unavailable - no API key configured")
            return self._create_error_result("AI analysis unavailable - no API key")

        try:
            # Limit to 10 most recent hunts for performance
            hunts_to_compare = existing_hunts[:10]

            prompt = self._build_comparison_prompt(new_hunt, hunts_to_compare)
            response = self._get_ai_response(prompt)
            result = self._parse_ai_response(response, hunts_to_compare)

            return result

        except Exception as error:
            logger.error(f"Error in AI analysis: {error}")
            return self._create_error_result(f"AI analysis failed: {error}")

    def _build_comparison_prompt(self, new_hunt: HuntInfo, existing_hunts: List[HuntInfo]) -> str:
        """Build the AI comparison prompt."""
        hunts_summary = "\n".join([
            f"Hunt {i+1} ({h.filename}):\n"
            f"- Hypothesis: {h.hypothesis}\n"
            f"- Tactic: {h.tactic}\n"
            for i, h in enumerate(existing_hunts)
        ])

        return f"""
You are analyzing a new threat hunt submission to check for potential duplicates or high similarity with existing hunts.

NEW HUNT SUBMISSION:
- Hypothesis: {new_hunt.hypothesis}
- Tactic: {new_hunt.tactic}
- Tags: {', '.join(new_hunt.tags)}

EXISTING HUNTS TO COMPARE AGAINST:
{hunts_summary}

TASK: Analyze the similarity between the new hunt and each existing hunt. Consider:
1. Conceptual similarity (same core technique or behavior)
2. Technical similarity (same tools, commands, or methods)
3. Target similarity (same systems, services, or data)
4. Tactical similarity (same MITRE ATT&CK technique)

For each existing hunt, provide:
- Similarity score (0-100, where 100 is identical)
- Brief explanation of why they are/aren't similar
- Recommendation: "DUPLICATE", "SIMILAR", or "UNIQUE"

Respond in JSON format:
{{
    "comparisons": [
        {{
            "hunt_filename": "filename.md",
            "similarity_score": 85,
            "explanation": "Both focus on the same PowerShell technique...",
            "recommendation": "SIMILAR"
        }}
    ],
    "overall_assessment": "This hunt appears to be...",
    "recommendation": "APPROVE" or "FLAG_FOR_REVIEW"
}}

Only include hunts with similarity scores above 50.
"""

    def _get_ai_response(self, prompt: str) -> str:
        """Get AI analysis response."""
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a threat hunting expert analyzing hunt submissions for duplicates and similarities. Be thorough but fair in your assessment."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2000
        )
        return response.choices[0].message.content.strip()

    def _parse_ai_response(self, response: str, existing_hunts: List[HuntInfo]) -> DuplicateDetectionResult:
        """Parse and process AI response."""
        try:
            analysis = json.loads(response)

            # Create filename to hunt mapping
            filename_map = {h.filename: h for h in existing_hunts}

            similar_hunts = []
            max_score = 0.0

            for comp in analysis.get('comparisons', []):
                filename = comp.get('hunt_filename', '')
                score = comp.get('similarity_score', 0) / 100.0  # Convert to 0-1

                hunt = filename_map.get(filename)
                if hunt:
                    similar_hunts.append({
                        'filepath': hunt.filepath,
                        'filename': hunt.filename,
                        'hypothesis': hunt.hypothesis,
                        'tactic': hunt.tactic,
                        'similarity_score': score * 100,
                        'explanation': comp.get('explanation', ''),
                        'ai_recommendation': comp.get('recommendation', 'UNKNOWN')
                    })
                    max_score = max(max_score, score)

            # Sort by similarity score
            similar_hunts.sort(key=lambda x: x['similarity_score'], reverse=True)

            is_duplicate = max_score >= self.threshold
            overall_rec = analysis.get('recommendation', 'FLAG_FOR_REVIEW')
            recommendation = "APPROVE" if overall_rec == "APPROVE" else "REVIEW: Potential duplicates found"

            detailed_report = analysis.get('overall_assessment', 'AI analysis completed')

            return DuplicateDetectionResult(
                is_duplicate=is_duplicate,
                method_used=self.get_method_name(),
                max_similarity_score=max_score,
                similar_hunts_count=len(similar_hunts),
                similar_hunts=similar_hunts[:5],
                recommendation=recommendation,
                detailed_report=detailed_report,
                confidence=0.85
            )

        except json.JSONDecodeError as error:
            logger.error(f"Failed to parse AI response: {error}")
            return self._create_error_result("Failed to parse AI analysis")

    def _create_error_result(self, error_msg: str) -> DuplicateDetectionResult:
        """Create error result."""
        return DuplicateDetectionResult(
            is_duplicate=False,
            method_used=self.get_method_name(),
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="ERROR: Detection failed",
            detailed_report=error_msg,
            confidence=0.0
        )


class DuplicateDetector:
    """
    Main duplicate detection coordinator.

    This class provides a unified interface for duplicate detection,
    automatically selecting the best strategy based on configuration
    and availability.

    Usage:
        detector = DuplicateDetector()
        result = detector.check_for_duplicates(new_hunt_content, "new_hunt.md")
        print(result.recommendation)
    """

    def __init__(self, preferred_method: Optional[DetectionMethod] = None):
        """
        Initialize duplicate detector.

        Args:
            preferred_method: Preferred detection method (auto-selected if None)
        """
        self.extractor = HuntExtractor()
        self.preferred_method = preferred_method

        # Initialize available strategies
        self.strategies = {
            DetectionMethod.EXACT_MATCH: ExactMatchStrategy(threshold=0.95),
            DetectionMethod.ENHANCED_SIMILARITY: EnhancedSimilarityStrategy(
                threshold=getattr(config, 'similarity_threshold', 0.7)
            ),
            DetectionMethod.AI_ANALYSIS: AIAnalysisStrategy(threshold=0.7)
        }

    def check_for_duplicates(self, new_hunt_content: str, filename: str = "new_hunt.md") -> DuplicateDetectionResult:
        """
        Check for duplicate hunts.

        Args:
            new_hunt_content: Markdown content of new hunt
            filename: Filename for the new hunt

        Returns:
            DuplicateDetectionResult with findings
        """
        logger.info(f"🔍 Starting duplicate detection for {filename}")

        try:
            # Extract hunt information
            new_hunt = self.extractor.extract_from_content(new_hunt_content, filename)
            if not new_hunt or not new_hunt.hypothesis:
                return self._create_extraction_error_result()

            # Load existing hunts
            existing_hunts = self._load_existing_hunts()
            logger.info(f"📚 Loaded {len(existing_hunts)} existing hunts for comparison")

            if not existing_hunts:
                return self._create_no_hunts_result()

            # Select and run detection strategy
            strategy = self._select_strategy()
            logger.info(f"Using detection method: {strategy.get_method_name().value}")

            result = strategy.detect(new_hunt, existing_hunts)

            logger.info(
                f"✅ Detection complete: {result.similar_hunts_count} similar hunts found "
                f"(max similarity: {result.max_similarity_score:.1%})"
            )

            return result

        except Exception as error:
            logger.error(f"Error in duplicate detection: {error}")
            return self._create_general_error_result(error)

    def generate_github_comment(self, result: DuplicateDetectionResult) -> str:
        """
        Generate GitHub comment from detection result.

        Args:
            result: Detection result

        Returns:
            Formatted markdown comment
        """
        if not result.similar_hunts:
            comment = "✅ **Duplicate Check Complete**\n\n"
            comment += "No similar existing hunts found. This appears to be a unique submission.\n\n"
            comment += f"**Method:** {result.method_used.value}\n"
            comment += f"**Confidence:** {result.confidence:.0%}\n"
            return comment

        # Build header
        if result.is_duplicate:
            comment = f"⚠️ **Duplicate Check - {result.similar_hunts_count} Similar Hunt(s) Found**\n\n"
        else:
            comment = f"✅ **Duplicate Check - {result.similar_hunts_count} Somewhat Similar Hunt(s)**\n\n"

        comment += f"**Detection Method:** {result.method_used.value}\n"
        comment += f"**Max Similarity:** {result.max_similarity_score:.1%}\n"
        comment += f"**Confidence:** {result.confidence:.0%}\n\n"

        # Add similar hunts list
        comment += "**Similar Existing Hunts:**\n\n"
        comment += self._format_similar_hunts_for_github(result.similar_hunts)

        # Add recommendation
        comment += f"\n**🤖 Recommendation:** {result.recommendation}\n\n"

        # Add detailed report if available
        if result.detailed_report:
            comment += "**Details:**\n"
            comment += result.detailed_report + "\n\n"

        # Add footer
        comment += "---\n"
        comment += f"*Analysis performed using {result.method_used.value} method. "
        comment += "Please review manually before making final decisions.*"

        return comment

    def _load_existing_hunts(self) -> List[HuntInfo]:
        """Load existing hunts from database or files."""
        db_path = Path(DATABASE_PATH)

        # Try database first (fast path)
        if db_path.exists():
            try:
                return self._load_hunts_from_db()
            except Exception as error:
                logger.warning(f"Database query failed, falling back to files: {error}")

        # Fallback to file-based loading
        return self._load_hunts_from_files()

    def _load_hunts_from_db(self) -> List[HuntInfo]:
        """Load hunts from SQLite database (fast)."""
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row

        cursor = conn.execute('''
            SELECT filename, hunt_id, hypothesis, tactic, technique, tags, file_path
            FROM hunts
            ORDER BY created_date DESC
        ''')

        hunts = []
        for row in cursor:
            hunts.append(HuntInfo(
                filepath=row['file_path'],
                filename=row['filename'],
                hypothesis=row['hypothesis'] or '',
                tactic=row['tactic'] or '',
                technique=row['technique'] or '',
                tags=json.loads(row['tags']) if row['tags'] else [],
                content=row['hypothesis'][:500] if row['hypothesis'] else ''
            ))

        conn.close()
        logger.info(f"Retrieved {len(hunts)} hunts from database in <10ms")
        return hunts

    def _load_hunts_from_files(self) -> List[HuntInfo]:
        """Load hunts from markdown files (slower, fallback)."""
        hunt_directories = ["Flames", "Embers", "Alchemy"]
        hunts = []

        for directory_name in hunt_directories:
            directory_path = Path(directory_name)
            if not directory_path.exists():
                continue

            for hunt_file in directory_path.glob("*.md"):
                try:
                    content = hunt_file.read_text()
                    hunt_info = self.extractor.extract_from_content(content, str(hunt_file))
                    if hunt_info:
                        hunts.append(hunt_info)
                except Exception as error:
                    logger.warning(f"Error reading {hunt_file}: {error}")

        logger.info(f"Retrieved {len(hunts)} hunts from files")
        return hunts

    def _select_strategy(self) -> DetectionStrategy:
        """Select the best detection strategy."""
        # Use preferred method if specified
        if self.preferred_method:
            return self.strategies[self.preferred_method]

        # Auto-select based on configuration
        if getattr(config, 'enable_similarity_checking', True):
            return self.strategies[DetectionMethod.ENHANCED_SIMILARITY]
        elif getattr(config, 'enable_ai_duplicate_detection', False):
            return self.strategies[DetectionMethod.AI_ANALYSIS]
        else:
            return self.strategies[DetectionMethod.EXACT_MATCH]

    def _format_similar_hunts_for_github(self, similar_hunts: List[Dict[str, Any]]) -> str:
        """Format similar hunts list for GitHub comment."""
        if not similar_hunts:
            return "No similar hunts found.\n"

        formatted = ""
        repo_url = f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{os.getenv('GITHUB_REPOSITORY')}"
        branch = os.getenv('GITHUB_REF_NAME', 'main')

        for i, hunt in enumerate(similar_hunts[:5], 1):
            similarity_score = hunt.get('similarity_score', 0)
            filename = hunt.get('filename', 'Unknown')
            filepath = hunt.get('filepath', '')
            hypothesis = hunt.get('hypothesis', 'No hypothesis available')
            tactic = hunt.get('tactic', 'Unknown')

            # Determine emoji and level
            if similarity_score >= 80:
                emoji = "🔴"
                level = "HIGH"
            elif similarity_score >= 60:
                emoji = "🟡"
                level = "MODERATE"
            else:
                emoji = "🟢"
                level = "LOW"

            # Create file link
            if filepath:
                file_url = f"{repo_url}/blob/{branch}/{filepath}"
                hunt_link = f"[{filename}]({file_url})"
            else:
                hunt_link = filename

            formatted += f"{emoji} **{hunt_link}** ({similarity_score:.1f}% - {level})\n"
            formatted += f"   - **Tactic:** {tactic}\n"
            formatted += f"   - **Hypothesis:** {hypothesis[:100]}{'...' if len(hypothesis) > 100 else ''}\n"

            # Add explanation if available (from AI analysis)
            if 'explanation' in hunt:
                formatted += f"   - **Analysis:** {hunt['explanation']}\n"

            formatted += "\n"

        return formatted

    def _create_extraction_error_result(self) -> DuplicateDetectionResult:
        """Create result for extraction errors."""
        return DuplicateDetectionResult(
            is_duplicate=False,
            method_used=DetectionMethod.EXACT_MATCH,
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="ERROR: Could not extract hunt information",
            detailed_report="Failed to extract hunt information from submission",
            confidence=0.0
        )

    def _create_no_hunts_result(self) -> DuplicateDetectionResult:
        """Create result when no existing hunts found."""
        return DuplicateDetectionResult(
            is_duplicate=False,
            method_used=DetectionMethod.EXACT_MATCH,
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="APPROVE: No existing hunts to compare",
            detailed_report="No existing hunts found in database",
            confidence=1.0
        )

    def _create_general_error_result(self, error: Exception) -> DuplicateDetectionResult:
        """Create result for general errors."""
        return DuplicateDetectionResult(
            is_duplicate=False,
            method_used=DetectionMethod.EXACT_MATCH,
            max_similarity_score=0.0,
            similar_hunts_count=0,
            similar_hunts=[],
            recommendation="ERROR: Detection failed",
            detailed_report=f"Duplicate detection failed: {error}",
            confidence=0.0
        )


# Convenience functions for backward compatibility

def check_duplicates_for_new_submission(new_hunt_content: str, new_hunt_filename: str = "new_hunt.md") -> str:
    """
    Main function to check for duplicates in a new submission.

    This function provides backward compatibility with the old duplicate_detection.py interface.

    Args:
        new_hunt_content: Markdown content of the new hunt
        new_hunt_filename: Filename of the new hunt

    Returns:
        Formatted GitHub comment string
    """
    detector = DuplicateDetector()
    result = detector.check_for_duplicates(new_hunt_content, new_hunt_filename)
    return detector.generate_github_comment(result)


def get_all_existing_hunts() -> List[Dict[str, Any]]:
    """
    Get all existing hunts (backward compatibility function).

    Returns:
        List of hunt dictionaries
    """
    detector = DuplicateDetector()
    hunts = detector._load_existing_hunts()

    # Convert HuntInfo objects to dicts for backward compatibility
    return [
        {
            'filepath': h.filepath,
            'filename': h.filename,
            'hypothesis': h.hypothesis,
            'tactic': h.tactic,
            'tags': h.tags,
            'content': h.content
        }
        for h in hunts
    ]


def extract_hunt_info(content: str, filepath: str) -> Optional[Dict[str, Any]]:
    """
    Extract hunt information from content (backward compatibility function).

    Args:
        content: Markdown content
        filepath: File path

    Returns:
        Dict with hunt information or None
    """
    hunt_info = HuntExtractor.extract_from_content(content, filepath)
    if not hunt_info:
        return None

    return {
        'filepath': hunt_info.filepath,
        'filename': hunt_info.filename,
        'hypothesis': hunt_info.hypothesis,
        'tactic': hunt_info.tactic,
        'tags': hunt_info.tags,
        'content': hunt_info.content
    }


if __name__ == "__main__":
    # Test the duplicate detector
    test_content = """
Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection.

| Hunt # | Idea / Hypothesis | Tactic | Notes | Tags | Submitter |
|--------|-------------------|--------|-------|------|-----------|
| | Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection. | Defense Evasion | Based on ATT&CK technique T1071.001. | #defense-evasion #execution | test-user |

## Why
- This technique is commonly used by threat actors to evade detection
- Discord CDN is often trusted and may bypass security controls

## References
- [MITRE ATT&CK T1071.001](https://attack.mitre.org/techniques/T1071/001/)
- [Source CTI Report](https://example.com)
"""

    detector = DuplicateDetector()
    result = detector.check_for_duplicates(test_content, "test-hunt.md")

    print("=" * 80)
    print("DUPLICATE DETECTION TEST")
    print("=" * 80)
    print(f"\nMethod: {result.method_used.value}")
    print(f"Is Duplicate: {result.is_duplicate}")
    print(f"Max Similarity: {result.max_similarity_score:.1%}")
    print(f"Similar Hunts: {result.similar_hunts_count}")
    print(f"Recommendation: {result.recommendation}")
    print(f"Confidence: {result.confidence:.0%}")
    print("\nGitHub Comment:\n")
    print(detector.generate_github_comment(result))
