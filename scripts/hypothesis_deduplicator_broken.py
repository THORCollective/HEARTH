#!/usr/bin/env python3
"""
Hypothesis deduplication service for HEARTH hunt generation.
Integrates with AI generation workflows to prevent duplicate hypotheses.
"""

import json
import time
from typing import List, Dict, Any, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from pathlib import Path

from logger_config import get_logger
from config_manager import get_config
from similarity_detector import HypothesisSimilarityDetector, SimilarityScore
from hunt_parser_utils import find_hunt_files
from hunt_parser import HuntData, HuntFileReader
from cache_manager import get_cache_manager, cached
from exceptions import ValidationError, AIAnalysisError

logger = get_logger()
config = get_config().config


@dataclass
class DeduplicationResult:
    """Result of hypothesis deduplication check."""

    is_duplicate: bool
    similarity_threshold: float
    max_similarity_score: float
    similar_hunts_count: int
    similar_hunts: List[Dict[str, Any]]
    recommendation: str
    detailed_report: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


@dataclass
class GenerationAttempt:
    """Tracks a hypothesis generation attempt."""

    attempt_id: str
    timestamp: float
    hypothesis: str
    tactic: str
    tags: List[str]
    similarity_scores: List[float]
    is_approved: bool
    rejection_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


class HypothesisDeduplicator:
    """Main service for preventing duplicate hypothesis generation."""

    def __init__(self, similarity_threshold: float = 0.75):
        self.similarity_detector = HypothesisSimilarityDetector()
        self.cache = get_cache_manager()
        self.similarity_threshold = similarity_threshold

        # Track generation attempts
        self.generation_history: List[GenerationAttempt] = []
        self.load_generation_history()

    def check_hypothesis_uniqueness(self, new_hypothesis: str, tactic: str = "",
                                  tags: List[str] = None) -> DeduplicationResult:
        """Check if a new hypothesis is sufficiently unique."""
        try:
            logger.info(f"Checking uniqueness for hypothesis: {new_hypothesis[:100]}...")

            # Load existing hunts
            existing_hunts = self._load_existing_hunts()

            # Create hunt object for new hypothesis
            new_hunt = {
                'title': new_hypothesis,
                'hypothesis': new_hypothesis,
                'tactic': tactic,
                'tags': tags or []
            }

            # Find similar hunts
            similar_hunts = self.similarity_detector.find_similar_hunts(
                new_hunt, existing_hunts, self.similarity_threshold
            )

            # Determine if it's a duplicate
            is_duplicate = len(similar_hunts) > 0
            max_similarity = max([score.overall_score for _, score in similar_hunts], default=0.0)

            # Generate recommendation
            recommendation = self._generate_recommendation(is_duplicate, max_similarity, similar_hunts)

            # Generate detailed report
            detailed_report = self.similarity_detector.generate_similarity_report(new_hunt, similar_hunts)

            result = DeduplicationResult(
                is_duplicate=is_duplicate,
                similarity_threshold=self.similarity_threshold,
                max_similarity_score=max_similarity,
                similar_hunts_count=len(similar_hunts),
                similar_hunts=[hunt for hunt, _ in similar_hunts[:3]],  # Top 3
                recommendation=recommendation,
                detailed_report=detailed_report
            )

            logger.info(f"Uniqueness check complete: {'DUPLICATE' if is_duplicate else 'UNIQUE'}")
            return result

        except Exception as error:
            logger.error(f"Error checking hypothesis uniqueness: {error}")
            raise ValidationError("hypothesis", new_hypothesis, f"Uniqueness check failed: {error}")

    def generate_unique_hypothesis(self, generation_prompt: str, max_attempts: int = 5,
                                 ai_generator_func: callable = None) -> Tuple[str, DeduplicationResult]:
        """Generate a unique hypothesis using iterative refinement."""
        try:
            if not ai_generator_func:
                raise AIAnalysisError("AI generator function is required for hypothesis generation")

            logger.info(f"Starting unique hypothesis generation with {max_attempts} max attempts")

            for attempt in range(max_attempts):
                logger.info(f"Generation attempt {attempt + 1}/{max_attempts}")

                # Generate hypothesis using AI
                try:
                    generated_data = ai_generator_func(generation_prompt, attempt)
                    hypothesis = generated_data.get('hypothesis', '')
                    tactic = generated_data.get('tactic', '')
                    tags = generated_data.get('tags', [])

                    if not hypothesis:
                        logger.warning(f"Empty hypothesis generated on attempt {attempt + 1}")
                        continue

                except Exception as ai_error:
                    logger.error(f"AI generation failed on attempt {attempt + 1}: {ai_error}")
                    continue

                # Check uniqueness
                dedup_result = self.check_hypothesis_uniqueness(hypothesis, tactic, tags)

                # Record attempt
                attempt_record = GenerationAttempt(
                    attempt_id=f"gen_{int(time.time())}_{attempt}",
                    timestamp=time.time(),
                    hypothesis=hypothesis,
                    tactic=tactic,
                    tags=tags,
                    similarity_scores=[score.overall_score for _, score in
                                     self.similarity_detector.find_similar_hunts(
                                         {'title': hypothesis, 'tactic': tactic, 'tags': tags},
                                         self._load_existing_hunts(),
                                         0.5  # Lower threshold for tracking
                                     )],
                    is_approved=not dedup_result.is_duplicate,
                    rejection_reason="High similarity to existing hunts" if dedup_result.is_duplicate else None
                )\n                \n                self.generation_history.append(attempt_record)\n                \n                # If unique enough, return it\n                if not dedup_result.is_duplicate:\n                    logger.info(f\"Unique hypothesis generated on attempt {attempt + 1}\")\n                    self.save_generation_history()\n                    return hypothesis, dedup_result\n                \n                # Log why it was rejected\n                logger.warning(f\"Attempt {attempt + 1} rejected: similarity {dedup_result.max_similarity_score:.2%} > {self.similarity_threshold:.2%}\")\n                \n                # Modify prompt for next attempt to encourage more diversity\n                generation_prompt = self._enhance_prompt_for_diversity(generation_prompt, attempt, dedup_result)\n            \n            # All attempts exhausted\n            logger.error(f\"Failed to generate unique hypothesis after {max_attempts} attempts\")\n            self.save_generation_history()\n            \n            # Return the least similar attempt\n            best_attempt = min(self.generation_history[-max_attempts:], \n                             key=lambda x: max(x.similarity_scores) if x.similarity_scores else 1.0)\n            \n            final_result = self.check_hypothesis_uniqueness(best_attempt.hypothesis, \n                                                           best_attempt.tactic, \n                                                           best_attempt.tags)\n            \n            return best_attempt.hypothesis, final_result\n            \n        except Exception as error:\n            logger.error(f\"Error in unique hypothesis generation: {error}\")\n            raise AIAnalysisError(f\"Hypothesis generation failed: {error}\")\n    \n    def _load_existing_hunts(self) -> List[Dict[str, Any]]:\n        \"\"\"Load all existing hunts for comparison.\"\"\"\n        try:\n            # Check cache first\n            cache_key = \"existing_hunts_for_deduplication\"\n            cached_hunts = self.cache.get(cache_key, ttl=3600)  # 1 hour cache\n            \n            if cached_hunts is not None:\n                logger.debug(\"Loaded existing hunts from cache\")\n                return cached_hunts\n            \n            # Load from files\n            hunt_files = find_hunt_files()\n            reader = HuntFileReader()\n            existing_hunts = []\n            \n            for hunt_file in hunt_files:\n                try:\n                    category = hunt_file.parent.name\n                    hunt_data = reader.parse_hunt_file(hunt_file, category)\n                    \n                    if hunt_data:\n                        hunt_dict = hunt_data.to_dict()\n                        existing_hunts.append(hunt_dict)\n                        \n                except Exception as file_error:\n                    logger.warning(f\"Error loading hunt file {hunt_file}: {file_error}\")\n                    continue\n            \n            # Cache the results\n            self.cache.set(cache_key, existing_hunts)\n            \n            logger.info(f\"Loaded {len(existing_hunts)} existing hunts for comparison\")\n            return existing_hunts\n            \n        except Exception as error:\n            logger.error(f\"Error loading existing hunts: {error}\")\n            return []\n    \n    def _generate_recommendation(self, is_duplicate: bool, max_similarity: float, \n                               similar_hunts: List[Tuple[Dict, SimilarityScore]]) -> str:\n        \"\"\"Generate recommendation based on similarity analysis.\"\"\"\n        try:\n            if not is_duplicate:\n                return \"APPROVE: Hypothesis appears unique and can be used.\"\n            \n            if max_similarity >= 0.9:\n                return \"REJECT: Very high similarity to existing hunts. Consider a completely different approach.\"\n            elif max_similarity >= 0.8:\n                return \"MODIFY: High similarity detected. Suggest significant modifications to differentiate.\"\n            elif max_similarity >= 0.7:\n                return \"REVIEW: Moderate similarity detected. Minor modifications may be sufficient.\"\n            else:\n                return \"CAUTION: Some similarity detected but may be acceptable with review.\"\n                \n        except Exception as error:\n            logger.warning(f\"Error generating recommendation: {error}\")\n            return \"REVIEW: Unable to generate specific recommendation due to analysis error.\"\n    \n    def _enhance_prompt_for_diversity(self, original_prompt: str, attempt_number: int, \n                                    dedup_result: DeduplicationResult) -> str:\n        \"\"\"Enhance the generation prompt to encourage more diversity.\"\"\"\n        try:\n            diversity_instructions = [\n                \"Focus on a different aspect of the attack lifecycle.\",\n                \"Consider alternative attack vectors or techniques.\",\n                \"Explore different technologies or platforms.\",\n                \"Think about novel or emerging threat patterns.\",\n                \"Consider defensive evasion techniques not previously covered.\"\n            ]\n            \n            # Add diversity instruction based on attempt number\n            instruction = diversity_instructions[min(attempt_number, len(diversity_instructions) - 1)]\n            \n            enhanced_prompt = f\"\"\"{original_prompt}\n\nIMPORTANT: Previous attempt was too similar to existing hunts. {instruction}\n\nAvoid these patterns found in existing similar hunts:\n{self._extract_patterns_from_similar_hunts(dedup_result.similar_hunts)}\n\nGenerate a substantially different hypothesis that covers new ground.\"\"\"\n            \n            return enhanced_prompt\n            \n        except Exception as error:\n            logger.warning(f\"Error enhancing prompt: {error}\")\n            return original_prompt\n    \n    def _extract_patterns_from_similar_hunts(self, similar_hunts: List[Dict[str, Any]]) -> str:\n        \"\"\"Extract common patterns from similar hunts to avoid.\"\"\"\n        try:\n            if not similar_hunts:\n                return \"No specific patterns to avoid.\"\n            \n            patterns = []\n            for hunt in similar_hunts[:3]:  # Top 3 similar hunts\n                title = hunt.get('title', '')\n                tactic = hunt.get('tactic', '')\n                if title:\n                    patterns.append(f\"- Similar to: '{title[:80]}...' (Tactic: {tactic})\")\n            \n            return \"\\n\".join(patterns) if patterns else \"No specific patterns identified.\"\n            \n        except Exception as error:\n            logger.warning(f\"Error extracting patterns: {error}\")\n            return \"Unable to extract patterns from similar hunts.\"\n    \n    def load_generation_history(self) -> None:\n        \"\"\"Load generation history from cache or file.\"\"\"\n        try:\n            # Try to load from cache first\n            cache_key = \"hypothesis_generation_history\"\n            cached_history = self.cache.get(cache_key, ttl=86400)  # 24 hour cache\n            \n            if cached_history:\n                self.generation_history = [GenerationAttempt(**attempt) for attempt in cached_history]\n                logger.debug(f\"Loaded {len(self.generation_history)} generation attempts from cache\")\n                return\n            \n            # Try to load from file\n            history_file = Path(config.base_directory) / \"generation_history.json\"\n            if history_file.exists():\n                with open(history_file, 'r') as f:\n                    history_data = json.load(f)\n                self.generation_history = [GenerationAttempt(**attempt) for attempt in history_data]\n                logger.info(f\"Loaded {len(self.generation_history)} generation attempts from file\")\n            \n        except Exception as error:\n            logger.warning(f\"Error loading generation history: {error}\")\n            self.generation_history = []\n    \n    def save_generation_history(self) -> None:\n        \"\"\"Save generation history to cache and file.\"\"\"\n        try:\n            history_data = [attempt.to_dict() for attempt in self.generation_history]\n            \n            # Save to cache\n            cache_key = \"hypothesis_generation_history\"\n            self.cache.set(cache_key, history_data)\n            \n            # Save to file (backup)\n            history_file = Path(config.base_directory) / \"generation_history.json\"\n            with open(history_file, 'w') as f:\n                json.dump(history_data, f, indent=2)\n            \n            logger.debug(f\"Saved {len(self.generation_history)} generation attempts\")\n            \n        except Exception as error:\n            logger.warning(f\"Error saving generation history: {error}\")\n    \n    def get_generation_statistics(self) -> Dict[str, Any]:\n        \"\"\"Get statistics about hypothesis generation attempts.\"\"\"\n        try:\n            if not self.generation_history:\n                return {\"total_attempts\": 0, \"approval_rate\": 0.0}\n            \n            total_attempts = len(self.generation_history)\n            approved_attempts = len([a for a in self.generation_history if a.is_approved])\n            approval_rate = approved_attempts / total_attempts if total_attempts > 0 else 0.0\n            \n            # Calculate average similarity scores\n            all_scores = []\n            for attempt in self.generation_history:\n                all_scores.extend(attempt.similarity_scores)\n            \n            avg_similarity = sum(all_scores) / len(all_scores) if all_scores else 0.0\n            \n            return {\n                \"total_attempts\": total_attempts,\n                \"approved_attempts\": approved_attempts,\n                \"approval_rate\": approval_rate,\n                \"average_similarity\": avg_similarity,\n                \"similarity_threshold\": self.similarity_threshold\n            }\n            \n        except Exception as error:\n            logger.error(f\"Error generating statistics: {error}\")\n            return {\"error\": str(error)}\n    \n    def clear_generation_history(self, older_than_days: int = 30) -> int:\n        \"\"\"Clear old generation history entries.\"\"\"\n        try:\n            cutoff_time = time.time() - (older_than_days * 24 * 60 * 60)\n            \n            original_count = len(self.generation_history)\n            self.generation_history = [\n                attempt for attempt in self.generation_history \n                if attempt.timestamp > cutoff_time\n            ]\n            \n            removed_count = original_count - len(self.generation_history)\n            \n            if removed_count > 0:\n                self.save_generation_history()\n                logger.info(f\"Cleared {removed_count} old generation history entries\")\n            \n            return removed_count\n            \n        except Exception as error:\n            logger.error(f\"Error clearing generation history: {error}\")\n            return 0\n\n\ndef get_hypothesis_deduplicator(similarity_threshold: float = None) -> HypothesisDeduplicator:\n    \"\"\"Get configured hypothesis deduplicator instance.\"\"\"\n    threshold = similarity_threshold or getattr(config, 'hypothesis_similarity_threshold', 0.75)\n    return HypothesisDeduplicator(threshold)
