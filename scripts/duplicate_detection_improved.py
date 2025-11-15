#!/usr/bin/env python3
"""
Improved duplicate detection using similarity algorithms.
"""

import os
import re
from pathlib import Path
from typing import Dict, Any

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

from similarity_detector import get_similarity_detector
from logger_config import get_logger
from config_manager import get_config

logger = get_logger()
config = get_config().config

# Only create OpenAI client if available and API key exists
client = None
if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_all_existing_hunts():
    """Retrieves all existing hunt files and extracts their key information."""
    hunt_directories = ["Flames", "Embers", "Alchemy"]
    existing_hunts = []

    for directory_name in hunt_directories:
        directory_path = Path(directory_name)
        if not directory_path.exists():
            continue

        hunt_files = directory_path.glob("*.md")
        for hunt_file in hunt_files:
            try:
                content = hunt_file.read_text()
                hunt_information = extract_hunt_info(content, str(hunt_file))
                if hunt_information:
                    existing_hunts.append(hunt_information)
            except Exception as error:
                logger.warning(f"Error reading {hunt_file}: {error}")

    return existing_hunts


def extract_hunt_info(content, filepath):
    """Extracts key information from a hunt file for comparison."""
    lines = content.splitlines()

    # Extract hypothesis (first non-empty line)
    hypothesis = ""
    for line in lines:
        if line.strip() and not line.startswith('|') and not line.startswith('#'):
            hypothesis = line.strip()
            break

    # Extract tactic from the table
    tactic = ""
    for line in lines:
        if '|' in line and ('Tactic' in line or 'Technique' in line):
            # Find the data row
            line_index = lines.index(line)
            if line_index + 2 < len(lines):
                data_row = lines[line_index + 2]
                if '|' in data_row:
                    cells = [c.strip() for c in data_row.split('|') if c.strip()]
                    if len(cells) >= 3:  # Assuming tactic is in the 3rd column
                        tactic = cells[2]
            break

    # Extract tags
    tags = []
    for line in lines:
        if '#' in line and any(tag in line.lower() for tag in ['#t', '#persistence', '#execution', '#defense-evasion', '#discovery', '#lateral-movement', '#collection', '#command-and-control', '#exfiltration', '#impact']):
            tag_matches = re.findall(r'#\w+', line)
            tags.extend(tag_matches)

    return {
        'filepath': filepath,
        'filename': Path(filepath).name,
        'hypothesis': hypothesis,
        'tactic': tactic,
        'tags': list(set(tags)),  # Remove duplicates
        'content': content[:500]  # First 500 chars for context
    }


def check_duplicates_with_enhanced_similarity(new_hunt_info: Dict[str, Any]) -> str:
    """Enhanced duplicate detection using similarity algorithms."""
    try:
        logger.info("Using enhanced similarity detection")

        # Get similarity detector
        similarity_detector = get_similarity_detector()

        # Load existing hunts
        existing_hunts = get_all_existing_hunts()
        logger.info(f"Checking against {len(existing_hunts)} existing hunts")

        if not existing_hunts:
            return "✅ **Enhanced Duplicate Check Complete**\n\nNo existing hunts found to compare against. This appears to be a unique submission."

        # Check hypothesis uniqueness
        hypothesis = new_hunt_info.get('hypothesis', '')
        tactic = new_hunt_info.get('tactic', '')
        tags = new_hunt_info.get('tags', [])

        logger.info(f"Checking: {hypothesis[:100]}...")

        # Create hunt object for new hypothesis
        new_hunt = {
            'title': hypothesis,
            'hypothesis': hypothesis,
            'tactic': tactic,
            'tags': tags
        }

        # Find similar hunts using similarity detector
        threshold = getattr(config, 'similarity_threshold', 0.5)
        similar_hunts = similarity_detector.find_similar_hunts(new_hunt, existing_hunts, threshold)

        logger.info(f"Found {len(similar_hunts)} similar hunts above {threshold:.1%} threshold")

        # Generate enhanced comment
        comment = generate_enhanced_duplicate_comment(similar_hunts, new_hunt_info, threshold)

        return comment

    except Exception as error:
        logger.error(f"Error in enhanced similarity detection: {error}")
        # Fall back to basic analysis
        return f"⚠️ **Enhanced Duplicate Check Failed**\n\nError: {error}\n\nPlease review manually for potential duplicates."


def generate_enhanced_duplicate_comment(similar_hunts, new_hunt_info: Dict[str, Any], threshold: float) -> str:
    """Generate enhanced GitHub comment using similarity detection results."""
    try:
        if not similar_hunts:
            comment = "✅ **Enhanced Duplicate Check Complete**\n\n"
            comment += "No significantly similar existing hunts found. This appears to be a unique submission.\n\n"
            comment += "**Analysis Details:**\n"
            comment += f"- Similarity threshold: {threshold:.1%}\n"
            comment += "- Hunts analyzed: Multiple directories (Flames, Embers, Alchemy)\n\n"
        else:
            comment = f"⚠️ **Enhanced Duplicate Check - {len(similar_hunts)} Similar Hunt(s) Found**\n\n"
            comment += "**Similarity Analysis:**\n"
            comment += f"- Threshold: {threshold:.1%}\n\n"

            # Sort by similarity and show top matches
            similar_hunts.sort(key=lambda x: x[1].overall_score, reverse=True)

            comment += "**Similar Existing Hunts:**\n\n"

            for i, (hunt, score) in enumerate(similar_hunts[:3], 1):  # Top 3
                similarity_pct = score.overall_score * 100

                # Color code based on similarity
                if similarity_pct >= 80:
                    emoji = "🔴"
                    status = "HIGH SIMILARITY"
                elif similarity_pct >= 60:
                    emoji = "🟡"
                    status = "MODERATE SIMILARITY"
                else:
                    emoji = "🟢"
                    status = "LOW SIMILARITY"

                filename = hunt.get('filename', 'Unknown')
                filepath = hunt.get('filepath', '')

                # Create GitHub file link if possible
                repo_url = f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{os.getenv('GITHUB_REPOSITORY')}"
                branch = os.getenv('GITHUB_REF_NAME', 'main')

                if filepath:
                    file_url = f"{repo_url}/blob/{branch}/{filepath}"
                    comment += f"{emoji} **[{filename}]({file_url})** (Similarity: {similarity_pct:.1f}%)\n"
                else:
                    comment += f"{emoji} **{filename}** (Similarity: {similarity_pct:.1f}%)\n"

                comment += f"   - **Status:** {status}\n"
                comment += f"   - **Lexical:** {score.lexical_score:.1%}, **Semantic:** {score.semantic_score:.1%}, **Structural:** {score.structural_score:.1%}\n"
                comment += f"   - **Tactic Match:** {hunt.get('tactic', 'Unknown')}\n\n"

        # Add recommendation
        max_similarity = max([score.overall_score for _, score in similar_hunts], default=0.0)

        if max_similarity >= 0.8:
            comment += "🚫 **Recommendation:** High similarity detected - please review for potential duplication before approval.\n\n"
        elif max_similarity >= 0.6:
            comment += "⚠️ **Recommendation:** Moderate similarity detected - consider modifications to differentiate from existing hunts.\n\n"
        elif max_similarity >= 0.4:
            comment += "⚡ **Recommendation:** Some similarity detected but likely acceptable - review recommended.\n\n"
        else:
            comment += "✅ **Recommendation:** This hunt appears unique and can be approved.\n\n"

        # Add methodology note
        comment += "---\n"
        comment += "*This analysis was performed using enhanced similarity detection with multiple algorithms:*\n"
        comment += "- Lexical similarity (Jaccard, Cosine, Levenshtein)\n"
        comment += "- Semantic similarity (Concept mapping, MITRE ATT&CK tactics)\n"
        comment += "- Structural similarity (Sentence patterns, Length analysis)\n"
        comment += "- Keyword overlap analysis\n\n"

        comment += "*Please review manually before making final decisions.*"

        return comment

    except Exception as error:
        logger.error(f"Error generating enhanced comment: {error}")
        return f"❌ Error generating similarity analysis comment: {error}"


def check_duplicates_for_new_submission(new_hunt_content, new_hunt_filename):
    """Main function to check for duplicates in a new submission."""
    logger.info("🔍 Starting enhanced duplicate detection...")

    try:
        # Extract info from new hunt
        new_hunt_info = extract_hunt_info(new_hunt_content, new_hunt_filename)
        if not new_hunt_info:
            return "❌ Could not extract hunt information from submission."

        logger.info(f"Extracted hunt info: {new_hunt_info.get('hypothesis', '')[:100]}...")

        # Use enhanced similarity detection
        return check_duplicates_with_enhanced_similarity(new_hunt_info)

    except Exception as error:
        logger.error(f"Error in duplicate detection: {error}")
        return f"❌ Duplicate detection failed: {error}"


if __name__ == "__main__":
    # Test with a sample hunt
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

    result = check_duplicates_for_new_submission(test_content, "test-hunt.md")
    print(result)
