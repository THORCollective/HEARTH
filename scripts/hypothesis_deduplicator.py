#!/usr/bin/env python3
"""
TTP-aware hypothesis deduplicator for ensuring diverse hunt generation.
"""

from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
from pathlib import Path
import time
import json

from logger_config import get_logger
from config_manager import get_config
from ttp_diversity_checker import get_ttp_diversity_checker, TTProverlap

logger = get_logger()
config = get_config().config


@dataclass
class DeduplicationResult:
    """Enhanced deduplication result with TTP analysis."""
    is_duplicate: bool
    similarity_threshold: float
    max_similarity_score: float
    similar_hunts_count: int
    similar_hunts: List[Dict[str, Any]]
    recommendation: str
    detailed_report: str
    ttp_overlap: Optional[TTProverlap] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = {
            'is_duplicate': self.is_duplicate,
            'similarity_threshold': self.similarity_threshold,
            'max_similarity_score': self.max_similarity_score,
            'similar_hunts_count': self.similar_hunts_count,
            'similar_hunts': self.similar_hunts,
            'recommendation': self.recommendation,
            'detailed_report': self.detailed_report
        }
        
        if self.ttp_overlap:
            result['ttp_overlap'] = {
                'overlap_score': self.ttp_overlap.overlap_score,
                'tactic_match': self.ttp_overlap.tactic_match,
                'technique_overlap': self.ttp_overlap.technique_overlap,
                'explanation': self.ttp_overlap.explanation
            }
        
        return result


class TTProvAwareDeduplicator:
    """TTP-aware deduplicator that ensures diverse hunt hypotheses."""
    
    def __init__(self, similarity_threshold: float = 0.75):
        self.similarity_threshold = similarity_threshold
        self.ttp_checker = get_ttp_diversity_checker()  # Use global instance
        logger.info("TTP-aware hypothesis deduplicator initialized")
    
    def check_hypothesis_uniqueness(self, new_hypothesis: str, tactic: str = "", 
                                  tags: List[str] = None) -> DeduplicationResult:
        """Check if hypothesis has diverse TTPs from previous attempts."""
        logger.info(f"Checking TTP diversity for: {new_hypothesis[:50]}...")
        
        # Load and compare against existing hunt files
        similar_hunts = self._find_similar_existing_hunts(new_hypothesis, tactic)
        
        # Check TTP diversity against previous generation attempts
        ttp_overlap = self.ttp_checker.check_ttp_diversity(new_hypothesis, tactic)
        
        logger.info(f"TTP overlap score: {ttp_overlap.overlap_score:.2%}")
        
        # Determine if it's too similar based on TTP overlap or existing hunts
        max_similarity_score = ttp_overlap.overlap_score
        is_too_similar = ttp_overlap.is_too_similar(threshold=0.5)  # 50% TTP overlap threshold (more sensitive)
        
        # Also check similarity against existing hunt files
        if similar_hunts:
            max_file_similarity = max(hunt.get('similarity_score', 0) for hunt in similar_hunts) / 100.0
            if max_file_similarity > max_similarity_score:
                max_similarity_score = max_file_similarity
                is_too_similar = max_file_similarity > 0.6  # 60% threshold for file similarity
        
        # Generate recommendation based on TTP analysis
        recommendation = self._generate_ttp_recommendation(ttp_overlap, is_too_similar)
        
        # Generate detailed report
        detailed_report = self._generate_ttp_report(ttp_overlap, new_hypothesis, tactic)
        
        result = DeduplicationResult(
            is_duplicate=is_too_similar,
            similarity_threshold=0.5,  # TTP overlap threshold (more sensitive)
            max_similarity_score=max_similarity_score,
            similar_hunts_count=len([h for h in similar_hunts if h.get('similarity_score', 0) > 50]),
            similar_hunts=similar_hunts,
            recommendation=recommendation,
            detailed_report=detailed_report,
            ttp_overlap=ttp_overlap
        )
        
        logger.info(f"TTP diversity check: {'SIMILAR TTPs' if is_too_similar else 'DIVERSE TTPs'}")
        logger.info(f"Found {len(similar_hunts)} similar existing hunts")
        return result
    
    def generate_unique_hypothesis(self, generation_prompt: str, max_attempts: int = 5,
                                 ai_generator_func: callable = None) -> Tuple[str, DeduplicationResult]:
        """Generate hypothesis with diverse TTPs using iterative refinement."""
        logger.info(f"Starting TTP-diverse hypothesis generation with {max_attempts} max attempts")
        
        if not ai_generator_func:
            # Fallback generation with TTP diversity
            hypothesis = self._generate_diverse_fallback_hypothesis()
            dedup_result = self.check_hypothesis_uniqueness(hypothesis)
            return hypothesis, dedup_result
        
        for attempt in range(max_attempts):
            logger.info(f"TTP diversity attempt {attempt + 1}/{max_attempts}")
            
            try:
                # Enhance prompt for TTP diversity
                enhanced_prompt = self._enhance_prompt_for_ttp_diversity(generation_prompt, attempt)
                
                # Generate hypothesis using AI
                generated_data = ai_generator_func(enhanced_prompt, attempt)
                hypothesis = generated_data.get('hypothesis', '')
                tactic = generated_data.get('tactic', '')
                tags = generated_data.get('tags', [])
                
                if not hypothesis:
                    logger.warning(f"Empty hypothesis generated on attempt {attempt + 1}")
                    continue
                
                # Check TTP diversity
                dedup_result = self.check_hypothesis_uniqueness(hypothesis, tactic, tags)
                
                # If TTPs are diverse enough, return it
                if not dedup_result.is_duplicate:
                    logger.info(f"Diverse TTPs achieved on attempt {attempt + 1}")
                    return hypothesis, dedup_result
                
                # Log why it was rejected
                logger.warning(f"Attempt {attempt + 1} rejected: TTP overlap {dedup_result.max_similarity_score:.2%}")
                
            except Exception as ai_error:
                logger.error(f"AI generation failed on attempt {attempt + 1}: {ai_error}")
                continue
        
        # All attempts exhausted - return best attempt with warning
        logger.error(f"Failed to generate diverse TTPs after {max_attempts} attempts")
        
        # Generate fallback with completely different approach
        fallback_hypothesis = self._generate_diverse_fallback_hypothesis()
        final_result = self.check_hypothesis_uniqueness(fallback_hypothesis)
        
        return fallback_hypothesis, final_result
    
    def _enhance_prompt_for_ttp_diversity(self, base_prompt: str, attempt_number: int) -> str:
        """Enhance prompt to encourage TTP diversity."""
        try:
            # Get TTP diversity suggestions
            ttp_stats = self.ttp_checker.get_stats()
            
            diversity_instructions = [
                "",  # First attempt - no modification
                "Focus on a completely different MITRE ATT&CK tactic than previous attempts.",
                "Use different tools, techniques, and attack vectors not covered before.",
                "Target different systems or platforms (Windows vs Linux vs Cloud vs Network).",
                "Focus on advanced or novel attack techniques rarely seen."
            ]
            
            instruction = diversity_instructions[min(attempt_number, len(diversity_instructions) - 1)]
            
            # Add specific TTP diversity guidance
            ttp_guidance = ""
            if ttp_stats.get('total_attempts', 0) > 0:
                used_tactics = ttp_stats.get('tactics_used', [])
                if used_tactics:
                    ttp_guidance = f"\n\nIMPORTANT: Previous attempts used these tactics: {', '.join(used_tactics)}. Use a COMPLETELY DIFFERENT tactic and technique."
            
            enhanced_prompt = f"""{base_prompt}

{instruction}

{ttp_guidance}

Requirements for TTP Diversity:
- Use a different MITRE ATT&CK tactic if possible
- Focus on different tools/malware than previous attempts  
- Target different systems, services, or platforms
- Use different detection data sources
- Describe a fundamentally different attack approach

Generate a hypothesis that covers completely different Tactics, Techniques, and Procedures (TTPs) from any previous attempts."""
            
            return enhanced_prompt
            
        except Exception as error:
            logger.warning(f"Error enhancing prompt for TTP diversity: {error}")
            return base_prompt
    
    def _generate_diverse_fallback_hypothesis(self) -> str:
        """Generate a fallback hypothesis with diverse TTPs."""
        ttp_stats = self.ttp_checker.get_stats()
        used_tactics = set(ttp_stats.get('tactics_used', []))
        
        # Choose a different tactic
        available_tactics = {
            'initial access': 'phishing emails with malicious attachments',
            'persistence': 'registry modification for persistence',
            'privilege escalation': 'exploiting vulnerable services for privilege escalation',
            'defense evasion': 'process hollowing to evade detection',
            'credential access': 'credential dumping from memory',
            'discovery': 'network enumeration and service discovery',
            'lateral movement': 'lateral movement via remote services',
            'collection': 'sensitive data collection from file shares',
            'command and control': 'DNS tunneling for command and control',
            'exfiltration': 'data exfiltration via encrypted channels',
            'impact': 'data destruction and system disruption'
        }
        
        # Find unused tactic
        for tactic, description in available_tactics.items():
            if tactic not in used_tactics:
                return f"Detect adversaries using {description} to compromise enterprise networks"
        
        # If all tactics used, use a complex multi-stage attack
        return "Detect multi-stage attacks combining social engineering, zero-day exploits, and advanced persistence mechanisms"
    
    def _generate_ttp_recommendation(self, ttp_overlap: TTProverlap, is_too_similar: bool) -> str:
        """Generate recommendation based on TTP analysis."""
        if not is_too_similar:
            return "APPROVE: TTPs are sufficiently diverse from previous attempts"
        
        if ttp_overlap.overlap_score >= 0.8:
            return "REJECT: Very high TTP overlap - use completely different tactics and techniques"
        elif ttp_overlap.overlap_score >= 0.6:
            return "MODIFY: Significant TTP overlap - modify to use different techniques or tools"
        else:
            return "REVIEW: Some TTP overlap detected - minor modifications may be sufficient"
    
    def _generate_ttp_report(self, ttp_overlap: TTProverlap, hypothesis: str, tactic: str) -> str:
        """Generate detailed TTP analysis report."""
        try:
            report = f"**TTP Diversity Analysis**\n\n"
            report += f"**Hypothesis:** {hypothesis[:100]}...\n"
            report += f"**Tactic:** {tactic}\n\n"
            
            report += f"**TTP Overlap Analysis:**\n"
            report += f"- Overall TTP Overlap: {ttp_overlap.overlap_score:.1%}\n"
            report += f"- Tactic Match: {'Yes' if ttp_overlap.tactic_match else 'No'}\n"
            report += f"- Technique Overlap: {ttp_overlap.technique_overlap:.1%}\n"
            report += f"- Procedure Overlap: {ttp_overlap.procedure_overlap:.1%}\n"
            report += f"- Tool Overlap: {ttp_overlap.tool_overlap:.1%}\n"
            report += f"- Target Overlap: {ttp_overlap.target_overlap:.1%}\n\n"
            
            report += f"**Analysis:** {ttp_overlap.explanation}\n\n"
            
            # Add generation stats
            ttp_stats = self.ttp_checker.get_stats()
            if ttp_stats.get('total_attempts', 0) > 0:
                report += f"**Generation Statistics:**\n"
                report += f"- Total Attempts: {ttp_stats['total_attempts']}\n"
                report += f"- Unique Tactics: {ttp_stats['unique_tactics']}\n"
                report += f"- Unique Techniques: {ttp_stats['unique_techniques']}\n"
                report += f"- Tactics Used: {', '.join(ttp_stats['tactics_used'])}\n\n"
            
            if ttp_overlap.is_too_similar():
                suggestions = self.ttp_checker.get_diversity_suggestions(
                    self.ttp_checker.extractor.extract_ttps(hypothesis, tactic)
                )
                if suggestions:
                    report += f"**Diversity Suggestions:** {'; '.join(suggestions)}\n\n"
            
            return report
            
        except Exception as error:
            logger.warning(f"Error generating TTP report: {error}")
            return f"TTP analysis completed with overlap score: {ttp_overlap.overlap_score:.1%}"
    
    def _find_similar_existing_hunts(self, new_hypothesis: str, tactic: str = "") -> List[Dict[str, Any]]:
        """Find similar existing hunt files and calculate similarity scores."""
        try:
            from pathlib import Path
            import re
            
            similar_hunts = []
            hunt_directories = ["Flames", "Embers", "Alchemy"]
            
            for directory_name in hunt_directories:
                directory_path = Path(directory_name)
                if not directory_path.exists():
                    continue
                    
                hunt_files = list(directory_path.glob("*.md"))
                for hunt_file in hunt_files:
                    try:
                        content = hunt_file.read_text()
                        hunt_info = self._extract_hunt_info_from_content(content, str(hunt_file))
                        
                        if hunt_info and hunt_info['hypothesis']:
                            # Calculate similarity score
                            similarity_score = self._calculate_hypothesis_similarity(
                                new_hypothesis, hunt_info['hypothesis'], tactic, hunt_info['tactic']
                            )
                            
                            hunt_info['similarity_score'] = similarity_score
                            similar_hunts.append(hunt_info)
                            
                    except Exception as e:
                        logger.warning(f"Error processing hunt file {hunt_file}: {e}")
                        continue
            
            # Sort by similarity score (highest first) and return top 10
            similar_hunts.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
            return similar_hunts[:10]
            
        except Exception as e:
            logger.error(f"Error finding similar hunts: {e}")
            return []
    
    def _extract_hunt_info_from_content(self, content: str, filepath: str) -> Dict[str, Any]:
        """Extract hunt information from file content."""
        lines = content.splitlines()
        
        # Extract hypothesis (first non-empty line that's not a header or table)
        hypothesis = ""
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and not line.startswith('|') and len(line) > 20:
                hypothesis = line
                break
        
        # Extract tactic from table
        tactic = "Unknown"
        for i, line in enumerate(lines):
            if '|' in line and any(word in line.lower() for word in ['tactic', 'technique']):
                # Look for data row after header
                for j in range(i + 1, min(i + 3, len(lines))):
                    if j < len(lines) and '|' in lines[j] and not lines[j].strip().startswith('|--'):
                        parts = [p.strip() for p in lines[j].split('|') if p.strip()]
                        if len(parts) >= 3:
                            potential_tactic = parts[2] if len(parts) > 2 else ""
                            if potential_tactic and potential_tactic.lower() not in ['tactic', '']:
                                tactic = potential_tactic
                                break
                break
        
        return {
            'filepath': filepath,
            'filename': Path(filepath).name,
            'hypothesis': hypothesis,
            'tactic': tactic,
            'content': content[:200]  # First 200 chars for context
        }
    
    def _calculate_hypothesis_similarity(self, hyp1: str, hyp2: str, tactic1: str = "", tactic2: str = "") -> float:
        """Calculate similarity score between two hypotheses."""
        try:
            # Basic text similarity (simple approach)
            hyp1_lower = hyp1.lower()
            hyp2_lower = hyp2.lower()
            
            # Jaccard similarity on words
            words1 = set(hyp1_lower.split())
            words2 = set(hyp2_lower.split())
            
            if not words1 and not words2:
                return 0.0
            if not words1 or not words2:
                return 0.0
            
            intersection = words1.intersection(words2)
            union = words1.union(words2)
            jaccard_similarity = len(intersection) / len(union) if union else 0.0
            
            # Tactic bonus
            tactic_bonus = 0.2 if tactic1.lower() == tactic2.lower() and tactic1.strip() else 0.0
            
            # Check for key technique words
            technique_words = ['powershell', 'chisel', 'mimikatz', 'scheduled', 'registry', 'wmi', 'cmd', 'proxy', 'tunnel']
            common_techniques = sum(1 for word in technique_words if word in hyp1_lower and word in hyp2_lower)
            technique_bonus = min(0.3, common_techniques * 0.1)
            
            # Combined score (0-100 scale)
            similarity = (jaccard_similarity + tactic_bonus + technique_bonus) * 100
            return min(100.0, similarity)
            
        except Exception as e:
            logger.warning(f"Error calculating similarity: {e}")
            return 0.0

    def clear_generation_history(self):
        """Clear TTP generation history."""
        self.ttp_checker.clear_history()
        logger.info("TTP generation history cleared")


def get_hypothesis_deduplicator(similarity_threshold: float = None) -> TTProvAwareDeduplicator:
    """Get TTP-aware hypothesis deduplicator instance."""
    threshold = similarity_threshold or getattr(config, 'hypothesis_similarity_threshold', 0.75)
    return TTProvAwareDeduplicator(threshold)


if __name__ == "__main__":
    # Test the TTP-aware deduplicator
    deduplicator = TTProvAwareDeduplicator()
    
    test_hypotheses = [
        ("Adversaries use PowerShell to download malicious payloads", "Execution"),
        ("Threat actors leverage PowerShell for remote command execution", "Execution"),  # Similar TTP
        ("Attackers use scheduled tasks for persistence", "Persistence"),  # Different TTP
        ("Malicious actors perform network scanning for discovery", "Discovery")  # Different TTP
    ]
    
    print("Testing TTP-Aware Hypothesis Deduplicator")
    print("=" * 60)
    
    for i, (hypothesis, tactic) in enumerate(test_hypotheses, 1):
        print(f"\nTest {i}: {hypothesis}")
        print(f"Tactic: {tactic}")
        
        result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)
        
        print(f"Is Duplicate: {result.is_duplicate}")
        print(f"TTP Overlap: {result.max_similarity_score:.1%}")
        print(f"Recommendation: {result.recommendation}")
        
        if result.ttp_overlap:
            print(f"TTP Analysis: {result.ttp_overlap.explanation}")
    
    print(f"\nFinal TTP Stats: {deduplicator.ttp_checker.get_stats()}")