#!/usr/bin/env python3
"""
Advanced similarity detection system for HEARTH hunt hypotheses.
Prevents generation of duplicate or near-duplicate hunt ideas.
"""

import re
import math
import hashlib
from typing import List, Dict, Set, Tuple, Optional, Any
from dataclasses import dataclass
from collections import Counter
from difflib import SequenceMatcher
from pathlib import Path

from logger_config import get_logger
from config_manager import get_config
from validators import HuntValidator
from exceptions import ValidationError
from cache_manager import cached

logger = get_logger()
config = get_config().config


@dataclass
class SimilarityScore:
    """Represents a similarity score with breakdown by method."""

    overall_score: float
    lexical_score: float
    semantic_score: float
    structural_score: float
    keyword_overlap: float
    confidence: float

    def is_similar(self, threshold: float = 0.7) -> bool:
        """Check if similarity exceeds threshold."""
        return self.overall_score >= threshold

    def get_details(self) -> Dict[str, float]:
        """Get detailed breakdown of similarity scores."""
        return {
            'overall': self.overall_score,
            'lexical': self.lexical_score,
            'semantic': self.semantic_score,
            'structural': self.structural_score,
            'keyword_overlap': self.keyword_overlap,
            'confidence': self.confidence
        }


class TextPreprocessor:
    """Preprocesses text for similarity analysis."""

    # Common threat hunting terms that should be normalized
    THREAT_TERMS = {
        'adversary': ['adversaries', 'attacker', 'attackers', 'threat actor', 'threat actors'],
        'malware': ['malicious software', 'malicious code', 'malicious payload'],
        'c2': ['command and control', 'command-and-control', 'c&c'],
        'persistence': ['maintain access', 'persistent access'],
        'privilege escalation': ['elevate privileges', 'gain elevated access'],
        'lateral movement': ['move laterally', 'pivot'],
        'reconnaissance': ['recon', 'discovery', 'enumeration'],
        'exfiltration': ['data theft', 'steal data', 'extract data'],
        'defense evasion': ['evade detection', 'bypass security']
    }

    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
            'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'can', 'that', 'this', 'these',
            'those', 'they', 'them', 'their', 'there', 'where', 'when', 'why',
            'how', 'what', 'which', 'who', 'whom', 'whose'
        }

    def normalize_text(self, text: str) -> str:
        """Normalize text for better comparison."""
        if not text:
            return ""

        # Convert to lowercase
        text = text.lower().strip()

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        # Normalize threat hunting terminology
        for canonical, variants in self.THREAT_TERMS.items():
            for variant in variants:
                text = text.replace(variant, canonical)

        # Remove common prefixes/suffixes
        text = re.sub(r'^(threat actors?|adversaries|attackers?)\s+(are\s+)?', '', text)
        text = re.sub(r'\s+(to\s+)?(gain|achieve|maintain|establish)\s+.*$', '', text)

        return text.strip()

    def extract_keywords(self, text: str) -> Set[str]:
        """Extract meaningful keywords from text."""
        normalized = self.normalize_text(text)

        # Split into words and filter
        words = re.findall(r'\b[a-zA-Z]{3,}\b', normalized)

        # Remove stop words and short words
        keywords = {
            word for word in words
            if word not in self.stop_words and len(word) >= 3
        }

        return keywords

    def extract_phrases(self, text: str, length: int = 3) -> Set[str]:
        """Extract n-gram phrases from text."""
        normalized = self.normalize_text(text)
        words = normalized.split()

        phrases = set()
        for i in range(len(words) - length + 1):
            phrase = ' '.join(words[i:i + length])
            if not any(stop in phrase for stop in self.stop_words):
                phrases.add(phrase)

        return phrases


class LexicalSimilarity:
    """Calculates lexical similarity between texts."""

    def __init__(self, preprocessor: TextPreprocessor):
        self.preprocessor = preprocessor

    def jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calculate Jaccard similarity based on word overlap."""
        try:
            words1 = self.preprocessor.extract_keywords(text1)
            words2 = self.preprocessor.extract_keywords(text2)

            if not words1 and not words2:
                return 1.0  # Both empty
            if not words1 or not words2:
                return 0.0  # One empty

            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))

            return intersection / union if union > 0 else 0.0

        except Exception as error:
            logger.warning(f"Error calculating Jaccard similarity: {error}")
            return 0.0

    def cosine_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity using TF-IDF vectors."""
        try:
            words1 = self.preprocessor.extract_keywords(text1)
            words2 = self.preprocessor.extract_keywords(text2)

            if not words1 and not words2:
                return 1.0
            if not words1 or not words2:
                return 0.0

            # Create vocabulary
            vocab = words1.union(words2)

            # Create frequency vectors
            vec1 = [1 if word in words1 else 0 for word in vocab]
            vec2 = [1 if word in words2 else 0 for word in vocab]

            # Calculate cosine similarity
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            magnitude1 = math.sqrt(sum(a * a for a in vec1))
            magnitude2 = math.sqrt(sum(b * b for b in vec2))

            if magnitude1 == 0 or magnitude2 == 0:
                return 0.0

            return dot_product / (magnitude1 * magnitude2)

        except Exception as error:
            logger.warning(f"Error calculating cosine similarity: {error}")
            return 0.0

    def levenshtein_similarity(self, text1: str, text2: str) -> float:
        """Calculate normalized Levenshtein distance similarity."""
        try:
            norm1 = self.preprocessor.normalize_text(text1)
            norm2 = self.preprocessor.normalize_text(text2)

            if norm1 == norm2:
                return 1.0

            # Use difflib for efficiency
            similarity = SequenceMatcher(None, norm1, norm2).ratio()
            return similarity

        except Exception as error:
            logger.warning(f"Error calculating Levenshtein similarity: {error}")
            return 0.0

    def phrase_overlap(self, text1: str, text2: str) -> float:
        """Calculate similarity based on phrase overlap."""
        try:
            phrases1 = self.preprocessor.extract_phrases(text1, 3)
            phrases2 = self.preprocessor.extract_phrases(text2, 3)

            if not phrases1 and not phrases2:
                return 1.0
            if not phrases1 or not phrases2:
                return 0.0

            intersection = len(phrases1.intersection(phrases2))
            union = len(phrases1.union(phrases2))

            return intersection / union if union > 0 else 0.0

        except Exception as error:
            logger.warning(f"Error calculating phrase overlap: {error}")
            return 0.0


class SemanticSimilarity:
    """Calculates semantic similarity between hunt hypotheses."""

    def __init__(self, preprocessor: TextPreprocessor):
        self.preprocessor = preprocessor

        # Threat hunting concept groups for semantic analysis
        self.concept_groups = {
            'persistence': {'persistence', 'maintain', 'establish', 'backdoor', 'foothold'},
            'execution': {'execute', 'run', 'launch', 'invoke', 'trigger'},
            'defense_evasion': {'evade', 'bypass', 'hide', 'obfuscate', 'mask'},
            'credential_access': {'credentials', 'passwords', 'tokens', 'authentication'},
            'discovery': {'enumerate', 'scan', 'probe', 'reconnaissance', 'survey'},
            'lateral_movement': {'pivot', 'move', 'spread', 'propagate'},
            'collection': {'collect', 'gather', 'harvest', 'capture'},
            'command_control': {'c2', 'command', 'control', 'communication'},
            'exfiltration': {'exfiltrate', 'steal', 'extract', 'transfer'},
            'impact': {'damage', 'destroy', 'disrupt', 'modify', 'delete'}
        }

    def concept_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity based on threat hunting concepts."""
        try:
            words1 = self.preprocessor.extract_keywords(text1)
            words2 = self.preprocessor.extract_keywords(text2)

            concepts1 = self._words_to_concepts(words1)
            concepts2 = self._words_to_concepts(words2)

            if not concepts1 and not concepts2:
                return 1.0
            if not concepts1 or not concepts2:
                return 0.0

            intersection = len(concepts1.intersection(concepts2))
            union = len(concepts1.union(concepts2))

            return intersection / union if union > 0 else 0.0

        except Exception as error:
            logger.warning(f"Error calculating concept similarity: {error}")
            return 0.0

    def _words_to_concepts(self, words: Set[str]) -> Set[str]:
        """Map words to threat hunting concepts."""
        concepts = set()

        for word in words:
            for concept, concept_words in self.concept_groups.items():
                if word in concept_words or any(cw in word for cw in concept_words):
                    concepts.add(concept)

        return concepts

    def tactic_similarity(self, hunt1: Dict, hunt2: Dict) -> float:
        """Calculate similarity based on MITRE ATT&CK tactics."""
        try:
            tactics1 = set()
            tactics2 = set()

            if hunt1.get('tactic'):
                tactics1 = {t.strip().lower() for t in hunt1['tactic'].split(',') if t.strip()}

            if hunt2.get('tactic'):
                tactics2 = {t.strip().lower() for t in hunt2['tactic'].split(',') if t.strip()}

            if not tactics1 and not tactics2:
                return 1.0
            if not tactics1 or not tactics2:
                return 0.0

            intersection = len(tactics1.intersection(tactics2))
            union = len(tactics1.union(tactics2))

            return intersection / union if union > 0 else 0.0

        except Exception as error:
            logger.warning(f"Error calculating tactic similarity: {error}")
            return 0.0


class StructuralSimilarity:
    """Analyzes structural similarity of hunt descriptions."""

    def __init__(self, preprocessor: TextPreprocessor):
        self.preprocessor = preprocessor

    def sentence_structure_similarity(self, text1: str, text2: str) -> float:
        """Compare sentence structures."""
        try:
            # Extract sentence patterns
            pattern1 = self._extract_sentence_pattern(text1)
            pattern2 = self._extract_sentence_pattern(text2)

            if pattern1 == pattern2:
                return 1.0

            # Calculate pattern similarity
            similarity = SequenceMatcher(None, pattern1, pattern2).ratio()
            return similarity

        except Exception as error:
            logger.warning(f"Error calculating sentence structure similarity: {error}")
            return 0.0

    def _extract_sentence_pattern(self, text: str) -> str:
        """Extract structural pattern from sentence."""
        # Simplified pattern extraction
        normalized = self.preprocessor.normalize_text(text)

        # Replace specific terms with categories
        pattern = normalized
        pattern = re.sub(r'\b(powershell|cmd|bash|python|javascript)\b', 'TOOL', pattern)
        pattern = re.sub(r'\b(file|registry|process|network|service)\b', 'OBJECT', pattern)
        pattern = re.sub(r'\b(create|modify|delete|execute|access)\b', 'ACTION', pattern)
        pattern = re.sub(r'\b\w+\.(exe|dll|bat|ps1|sh)\b', 'EXECUTABLE', pattern)

        return pattern

    def length_similarity(self, text1: str, text2: str) -> float:
        """Compare text lengths (shorter texts more likely to be similar)."""
        try:
            len1 = len(text1.split())
            len2 = len(text2.split())

            if len1 == 0 and len2 == 0:
                return 1.0

            max_len = max(len1, len2)
            min_len = min(len1, len2)

            return min_len / max_len if max_len > 0 else 0.0

        except Exception as error:
            logger.warning(f"Error calculating length similarity: {error}")
            return 0.0


class HypothesisSimilarityDetector:
    """Main class for detecting similar hunt hypotheses."""

    def __init__(self):
        self.preprocessor = TextPreprocessor()
        self.lexical = LexicalSimilarity(self.preprocessor)
        self.semantic = SemanticSimilarity(self.preprocessor)
        self.structural = StructuralSimilarity(self.preprocessor)

        # Configurable weights for different similarity aspects
        self.weights = {
            'lexical': 0.4,
            'semantic': 0.3,
            'structural': 0.2,
            'keyword_overlap': 0.1
        }

    def calculate_similarity(self, hunt1: Dict[str, Any], hunt2: Dict[str, Any]) -> SimilarityScore:
        """Calculate comprehensive similarity between two hunts."""
        try:
            text1 = hunt1.get('title', '') or hunt1.get('hypothesis', '')
            text2 = hunt2.get('title', '') or hunt2.get('hypothesis', '')

            if not text1 or not text2:
                return SimilarityScore(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

            # Calculate different types of similarity
            lexical_score = self._calculate_lexical_similarity(text1, text2)
            semantic_score = self._calculate_semantic_similarity(text1, text2, hunt1, hunt2)
            structural_score = self._calculate_structural_similarity(text1, text2)
            keyword_overlap = self._calculate_keyword_overlap(text1, text2)

            # Calculate weighted overall score
            overall_score = (
                lexical_score * self.weights['lexical'] +
                semantic_score * self.weights['semantic'] +
                structural_score * self.weights['structural'] +
                keyword_overlap * self.weights['keyword_overlap']
            )

            # Calculate confidence based on text length and complexity
            confidence = self._calculate_confidence(text1, text2)

            return SimilarityScore(
                overall_score=overall_score,
                lexical_score=lexical_score,
                semantic_score=semantic_score,
                structural_score=structural_score,
                keyword_overlap=keyword_overlap,
                confidence=confidence
            )

        except Exception as error:
            logger.error(f"Error calculating similarity: {error}")
            return SimilarityScore(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    def _calculate_lexical_similarity(self, text1: str, text2: str) -> float:
        """Calculate average lexical similarity."""
        try:
            jaccard = self.lexical.jaccard_similarity(text1, text2)
            cosine = self.lexical.cosine_similarity(text1, text2)
            levenshtein = self.lexical.levenshtein_similarity(text1, text2)
            phrase = self.lexical.phrase_overlap(text1, text2)

            return (jaccard + cosine + levenshtein + phrase) / 4

        except Exception as error:
            logger.warning(f"Error in lexical similarity calculation: {error}")
            return 0.0

    def _calculate_semantic_similarity(self, text1: str, text2: str, hunt1: Dict, hunt2: Dict) -> float:
        """Calculate semantic similarity."""
        try:
            concept = self.semantic.concept_similarity(text1, text2)
            tactic = self.semantic.tactic_similarity(hunt1, hunt2)

            return (concept + tactic) / 2

        except Exception as error:
            logger.warning(f"Error in semantic similarity calculation: {error}")
            return 0.0

    def _calculate_structural_similarity(self, text1: str, text2: str) -> float:
        """Calculate structural similarity."""
        try:
            sentence = self.structural.sentence_structure_similarity(text1, text2)
            length = self.structural.length_similarity(text1, text2)

            return (sentence + length) / 2

        except Exception as error:
            logger.warning(f"Error in structural similarity calculation: {error}")
            return 0.0

    def _calculate_keyword_overlap(self, text1: str, text2: str) -> float:
        """Calculate keyword overlap."""
        try:
            return self.lexical.jaccard_similarity(text1, text2)

        except Exception as error:
            logger.warning(f"Error in keyword overlap calculation: {error}")
            return 0.0

    def _calculate_confidence(self, text1: str, text2: str) -> float:
        """Calculate confidence in similarity score."""
        try:
            # Longer texts give more confident similarity scores
            words1 = len(text1.split())
            words2 = len(text2.split())
            avg_length = (words1 + words2) / 2

            # Confidence increases with text length but caps at 1.0
            confidence = min(avg_length / 20, 1.0)  # Normalize to 20-word average

            return confidence

        except Exception as error:
            logger.warning(f"Error calculating confidence: {error}")
            return 0.5

    @cached(ttl=1800)  # Cache for 30 minutes
    def find_similar_hunts(self, new_hunt: Dict[str, Any], existing_hunts: List[Dict[str, Any]],
                          threshold: float = 0.7) -> List[Tuple[Dict, SimilarityScore]]:
        """Find hunts similar to the new hunt above threshold."""
        try:
            similar_hunts = []

            for existing_hunt in existing_hunts:
                similarity = self.calculate_similarity(new_hunt, existing_hunt)

                if similarity.is_similar(threshold):
                    similar_hunts.append((existing_hunt, similarity))

            # Sort by similarity score (highest first)
            similar_hunts.sort(key=lambda x: x[1].overall_score, reverse=True)

            logger.info(f"Found {len(similar_hunts)} similar hunts above threshold {threshold}")
            return similar_hunts

        except Exception as error:
            logger.error(f"Error finding similar hunts: {error}")
            return []

    def generate_similarity_report(self, new_hunt: Dict[str, Any],
                                 similar_hunts: List[Tuple[Dict, SimilarityScore]]) -> str:
        """Generate a detailed similarity report."""
        try:
            if not similar_hunts:
                return "✅ No similar hunts found. This hypothesis appears to be unique."

            report = f"⚠️ **Found {len(similar_hunts)} potentially similar hunt(s):**\\n\\n"

            for i, (hunt, score) in enumerate(similar_hunts[:5], 1):  # Limit to top 5
                hunt_id = hunt.get('id', 'Unknown')
                hunt_title = hunt.get('title', hunt.get('hypothesis', 'No title'))

                report += f"**{i}. {hunt_id}** (Similarity: {score.overall_score:.1%})\\n"
                report += f"   *{hunt_title[:100]}{'...' if len(hunt_title) > 100 else ''}*\\n"
                report += f"   - Lexical: {score.lexical_score:.1%}"
                report += f" | Semantic: {score.semantic_score:.1%}"
                report += f" | Structural: {score.structural_score:.1%}\\n\\n"

            report += "**Recommendation:** Review these similar hunts before proceeding with generation."

            return report

        except Exception as error:
            logger.error(f"Error generating similarity report: {error}")
            return "❌ Error generating similarity report."


def get_similarity_detector() -> HypothesisSimilarityDetector:
    """Get singleton instance of similarity detector."""
    return HypothesisSimilarityDetector()
