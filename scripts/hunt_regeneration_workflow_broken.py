#!/usr/bin/env python3
"""
Hunt regeneration workflow with built-in similarity checking.
Ensures generated hypotheses are unique and diverse.
"""

import json
import time
import os
from typing import Dict, List, Any, Optional, Callable, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

from logger_config import get_logger
from config_manager import get_config
from hypothesis_deduplicator import get_hypothesis_deduplicator, DeduplicationResult
from similarity_detector import get_similarity_detector
from validators import HuntValidator
from exceptions import AIAnalysisError, ValidationError
from cache_manager import cached

logger = get_logger()
config = get_config().config


@dataclass
class RegenerationRequest:
    """Request for hunt hypothesis regeneration."""

    request_id: str
    timestamp: float
    base_prompt: str
    tactic: Optional[str] = None
    target_category: str = "Flames"
    max_attempts: int = 5
    similarity_threshold: float = 0.75
    additional_constraints: List[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


@dataclass
class RegenerationResult:
    """Result of hunt hypothesis regeneration."""

    success: bool
    hypothesis: str
    tactic: str
    tags: List[str]
    attempts_made: int
    final_similarity_score: float
    deduplication_result: Dict[str, Any]
    generation_time_seconds: float
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)


class AIHypothesisGenerator:
    """AI-powered hypothesis generator with diversity controls."""

    def __init__(self):
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library not available. Install with: pip install openai")

        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        if not self.client.api_key:
            raise ValueError("OpenAI API key not found. Set OPENAI_API_KEY environment variable.")

    def generate_hypothesis(self, prompt: str, attempt_number: int = 0) -> Dict[str, Any]:
        \"\"\"Generate a single hypothesis using AI.\"\"\"\n        try:\n            # Enhance prompt based on attempt number\n            enhanced_prompt = self._enhance_prompt_for_attempt(prompt, attempt_number)\n            \n            response = self.client.chat.completions.create(\n                model=config.openai_model,\n                messages=[\n                    {\n                        \"role\": \"system\",\n                        \"content\": \"You are a cybersecurity expert specializing in threat hunting. Generate unique and actionable hunt hypotheses that focus on detecting real adversary behavior. Respond in JSON format.\"\n                    },\n                    {\n                        \"role\": \"user\",\n                        \"content\": enhanced_prompt\n                    }\n                ],\n                temperature=min(0.3 + (attempt_number * 0.1), 0.9),  # Increase randomness with attempts\n                max_tokens=config.ai_max_tokens,\n                response_format={\"type\": \"json_object\"}\n            )\n            \n            result = json.loads(response.choices[0].message.content)\n            \n            # Validate required fields\n            required_fields = ['hypothesis', 'tactic', 'tags']\n            for field in required_fields:\n                if field not in result:\n                    result[field] = self._generate_default_value(field)\n            \n            # Clean and validate the result\n            return self._clean_ai_result(result)\n            \n        except Exception as error:\n            logger.error(f\"AI hypothesis generation failed: {error}\")\n            raise AIAnalysisError(f\"Failed to generate hypothesis: {error}\")\n    \n    def _enhance_prompt_for_attempt(self, base_prompt: str, attempt_number: int) -> str:\n        \"\"\"Enhance prompt to encourage diversity on subsequent attempts.\"\"\"\n        diversity_additions = [\n            \"\",  # First attempt - no modification\n            \"Focus on a different attack vector or technique not commonly covered.\",\n            \"Consider emerging or novel attack patterns that defenders might miss.\",\n            \"Think about attacks targeting different technologies or platforms.\",\n            \"Explore sophisticated evasion techniques or advanced persistent threats.\"\n        ]\n        \n        enhancement = diversity_additions[min(attempt_number, len(diversity_additions) - 1)]\n        \n        enhanced = f\"\"\"{base_prompt}\n\n{enhancement if enhancement else ''}\n\nRespond with a JSON object containing:\n{{\n  \"hypothesis\": \"A clear, actionable threat hunt hypothesis\",\n  \"tactic\": \"Primary MITRE ATT&CK tactic\",\n  \"tags\": [\"relevant\", \"tags\", \"for\", \"categorization\"]\n}}\n\nEnsure the hypothesis is specific, actionable, and focused on detecting real adversary behavior.\"\"\"\n        \n        return enhanced\n    \n    def _generate_default_value(self, field: str) -> Any:\n        \"\"\"Generate default values for missing fields.\"\"\"\n        defaults = {\n            'hypothesis': 'Generated hypothesis placeholder',\n            'tactic': 'Execution',\n            'tags': ['generated', 'placeholder']\n        }\n        return defaults.get(field, '')\n    \n    def _clean_ai_result(self, result: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Clean and validate AI-generated result.\"\"\"\n        cleaned = {}\n        \n        # Clean hypothesis\n        hypothesis = str(result.get('hypothesis', '')).strip()\n        if len(hypothesis) < 10:\n            raise ValidationError('hypothesis', hypothesis, 'Hypothesis too short')\n        cleaned['hypothesis'] = hypothesis\n        \n        # Clean tactic\n        tactic = str(result.get('tactic', 'Execution')).strip()\n        cleaned['tactic'] = tactic\n        \n        # Clean tags\n        tags = result.get('tags', [])\n        if isinstance(tags, str):\n            tags = [t.strip() for t in tags.split(',') if t.strip()]\n        elif not isinstance(tags, list):\n            tags = ['ai-generated']\n        \n        cleaned['tags'] = [str(tag).strip().lower() for tag in tags if str(tag).strip()]\n        \n        return cleaned\n\n\nclass HuntRegenerationWorkflow:\n    \"\"\"Main workflow for regenerating unique hunt hypotheses.\"\"\"\n    \n    def __init__(self):\n        self.deduplicator = get_hypothesis_deduplicator()\n        self.similarity_detector = get_similarity_detector()\n        self.validator = HuntValidator()\n        \n        # Initialize AI generator if available\n        try:\n            self.ai_generator = AIHypothesisGenerator()\n        except (ImportError, ValueError) as error:\n            logger.warning(f\"AI generator not available: {error}\")\n            self.ai_generator = None\n    \n    def regenerate_hypothesis(self, request: RegenerationRequest) -> RegenerationResult:\n        \"\"\"Regenerate a unique hunt hypothesis based on request.\"\"\"\n        start_time = time.time()\n        \n        try:\n            logger.info(f\"Starting hypothesis regeneration: {request.request_id}\")\n            \n            if not self.ai_generator:\n                raise AIAnalysisError(\"AI generator not available\")\n            \n            # Use deduplicator's generate_unique_hypothesis method\n            hypothesis, dedup_result = self.deduplicator.generate_unique_hypothesis(\n                generation_prompt=request.base_prompt,\n                max_attempts=request.max_attempts,\n                ai_generator_func=self.ai_generator.generate_hypothesis\n            )\n            \n            # Extract additional data from the last generation attempt\n            last_attempt = self.deduplicator.generation_history[-1] if self.deduplicator.generation_history else None\n            tactic = last_attempt.tactic if last_attempt else \"\"\n            tags = last_attempt.tags if last_attempt else []\n            \n            generation_time = time.time() - start_time\n            \n            result = RegenerationResult(\n                success=not dedup_result.is_duplicate,\n                hypothesis=hypothesis,\n                tactic=tactic,\n                tags=tags,\n                attempts_made=len([a for a in self.deduplicator.generation_history[-request.max_attempts:] if a]),\n                final_similarity_score=dedup_result.max_similarity_score,\n                deduplication_result=dedup_result.to_dict(),\n                generation_time_seconds=generation_time\n            )\n            \n            logger.info(f\"Regeneration completed: {result.success} after {result.attempts_made} attempts\")\n            return result\n            \n        except Exception as error:\n            generation_time = time.time() - start_time\n            logger.error(f\"Regeneration failed: {error}\")\n            \n            return RegenerationResult(\n                success=False,\n                hypothesis=\"\",\n                tactic=\"\",\n                tags=[],\n                attempts_made=0,\n                final_similarity_score=0.0,\n                deduplication_result={},\n                generation_time_seconds=generation_time,\n                error_message=str(error)\n            )\n    \n    def batch_regenerate(self, requests: List[RegenerationRequest]) -> List[RegenerationResult]:\n        \"\"\"Process multiple regeneration requests.\"\"\"\n        results = []\n        \n        logger.info(f\"Processing {len(requests)} regeneration requests\")\n        \n        for i, request in enumerate(requests, 1):\n            logger.info(f\"Processing request {i}/{len(requests)}: {request.request_id}\")\n            \n            try:\n                result = self.regenerate_hypothesis(request)\n                results.append(result)\n                \n                # Brief pause between requests to avoid rate limiting\n                if i < len(requests):\n                    time.sleep(1)\n                    \n            except Exception as error:\n                logger.error(f\"Failed to process request {request.request_id}: {error}\")\n                error_result = RegenerationResult(\n                    success=False,\n                    hypothesis=\"\",\n                    tactic=\"\",\n                    tags=[],\n                    attempts_made=0,\n                    final_similarity_score=0.0,\n                    deduplication_result={},\n                    generation_time_seconds=0.0,\n                    error_message=str(error)\n                )\n                results.append(error_result)\n        \n        logger.info(f\"Batch processing complete: {sum(1 for r in results if r.success)}/{len(results)} successful\")\n        return results\n    \n    def generate_diversity_report(self, results: List[RegenerationResult]) -> Dict[str, Any]:\n        \"\"\"Generate a report on the diversity of generated hypotheses.\"\"\"\n        try:\n            if not results:\n                return {\"error\": \"No results to analyze\"}\n            \n            successful_results = [r for r in results if r.success]\n            \n            if not successful_results:\n                return {\"error\": \"No successful generations to analyze\"}\n            \n            # Analyze diversity\n            hypotheses = [r.hypothesis for r in successful_results]\n            tactics = [r.tactic for r in successful_results]\n            all_tags = [tag for r in successful_results for tag in r.tags]\n            \n            # Calculate pairwise similarities\n            similarities = []\n            for i in range(len(hypotheses)):\n                for j in range(i + 1, len(hypotheses)):\n                    hunt1 = {'title': hypotheses[i], 'tactic': tactics[i]}\n                    hunt2 = {'title': hypotheses[j], 'tactic': tactics[j]}\n                    score = self.similarity_detector.calculate_similarity(hunt1, hunt2)\n                    similarities.append(score.overall_score)\n            \n            avg_similarity = sum(similarities) / len(similarities) if similarities else 0.0\n            \n            return {\n                \"total_requests\": len(results),\n                \"successful_generations\": len(successful_results),\n                \"success_rate\": len(successful_results) / len(results),\n                \"average_attempts_per_success\": sum(r.attempts_made for r in successful_results) / len(successful_results),\n                \"average_inter_hypothesis_similarity\": avg_similarity,\n                \"unique_tactics\": len(set(tactics)),\n                \"unique_tags\": len(set(all_tags)),\n                \"average_generation_time\": sum(r.generation_time_seconds for r in successful_results) / len(successful_results)\n            }\n            \n        except Exception as error:\n            logger.error(f\"Error generating diversity report: {error}\")\n            return {\"error\": str(error)}\n\n\ndef create_regeneration_request(base_prompt: str, **kwargs) -> RegenerationRequest:\n    \"\"\"Create a regeneration request with default values.\"\"\"\n    return RegenerationRequest(\n        request_id=f\"regen_{int(time.time())}_{hash(base_prompt) % 10000}\",\n        timestamp=time.time(),\n        base_prompt=base_prompt,\n        tactic=kwargs.get('tactic'),\n        target_category=kwargs.get('target_category', 'Flames'),\n        max_attempts=kwargs.get('max_attempts', config.max_generation_attempts),\n        similarity_threshold=kwargs.get('similarity_threshold', config.hypothesis_similarity_threshold),\n        additional_constraints=kwargs.get('additional_constraints', [])\n    )\n\n\ndef get_regeneration_workflow() -> HuntRegenerationWorkflow:\n    \"\"\"Get configured regeneration workflow instance.\"\"\"\n    return HuntRegenerationWorkflow()\n\n\nif __name__ == \"__main__\":\n    # Example usage\n    workflow = get_regeneration_workflow()\n    \n    # Create a test request\n    test_request = create_regeneration_request(\n        \"Generate a unique threat hunting hypothesis focused on detecting advanced persistent threats in cloud environments.\",\n        tactic=\"Defense Evasion\",\n        max_attempts=3\n    )\n    \n    # Generate hypothesis\n    result = workflow.regenerate_hypothesis(test_request)\n    \n    print(f\"Success: {result.success}\")\n    if result.success:\n        print(f\"Hypothesis: {result.hypothesis}\")\n        print(f\"Similarity Score: {result.final_similarity_score:.2%}\")\n        print(f\"Attempts: {result.attempts_made}\")\n    else:\n        print(f\"Error: {result.error_message}\")