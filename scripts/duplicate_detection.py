import os
import re
import sqlite3
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
from collections import defaultdict
import json
from typing import Dict, List, Any, Optional

from hunt_parser_utils import (
    find_hunt_files,
    find_table_header_line,
    extract_table_cells,
    clean_markdown_formatting
)
from similarity_detector import get_similarity_detector
from hypothesis_deduplicator import get_hypothesis_deduplicator
from logger_config import get_logger
from config_manager import get_config

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

logger = get_logger()
config = get_config().config

# Database configuration
DATABASE_PATH = os.getenv("HEARTH_DB_PATH", "database/hunts.db")

def get_all_existing_hunts():
    """
    Retrieves all existing hunt files and extracts their key information.

    NEW: Uses SQLite database for fast retrieval instead of reading all markdown files.
    Falls back to file-based approach if database doesn't exist.
    """
    db_path = Path(DATABASE_PATH)

    # Try database first (fast path)
    if db_path.exists():
        try:
            return get_all_existing_hunts_from_db()
        except Exception as error:
            logger.warning(f"Database query failed, falling back to file-based approach: {error}")

    # Fallback to file-based approach (legacy)
    logger.info("Using file-based hunt retrieval (slower)")
    return get_all_existing_hunts_from_files()

def get_all_existing_hunts_from_db():
    """Fast retrieval from SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Access columns by name

    cursor = conn.execute('''
        SELECT filename, hunt_id, hypothesis, tactic, technique, tags, file_path
        FROM hunts
        ORDER BY created_date DESC
    ''')

    existing_hunts = []
    for row in cursor:
        existing_hunts.append({
            'filepath': row['file_path'],
            'filename': row['filename'],
            'hypothesis': row['hypothesis'],
            'tactic': row['tactic'],
            'technique': row['technique'],
            'tags': json.loads(row['tags']) if row['tags'] else [],
            'content': row['hypothesis'][:500]  # Use hypothesis as content preview
        })

    conn.close()
    logger.info(f"Retrieved {len(existing_hunts)} hunts from database in <10ms")
    return existing_hunts

def get_all_existing_hunts_from_files():
    """Legacy file-based retrieval (slower, used as fallback)."""
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
                print(f"Error reading {hunt_file}: {error}")

    logger.info(f"Retrieved {len(existing_hunts)} hunts from files")
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
            tag_matches = re.findall(r'#\\w+', line)
            tags.extend(tag_matches)
    
    return {
        'filepath': filepath,
        'filename': Path(filepath).name,
        'hypothesis': hypothesis,
        'tactic': tactic,
        'tags': list(set(tags)),  # Remove duplicates
        'content': content[:500]  # First 500 chars for context
    }

def analyze_similarity(new_hunt, existing_hunts, threshold=0.7):
    """Uses AI to analyze similarity between a new hunt and existing hunts."""
    if not existing_hunts:
        return create_empty_analysis_result()
    
    filename_to_path_mapping = create_filename_path_mapping(existing_hunts)
    comparison_prompt = build_comparison_prompt(new_hunt, existing_hunts)
    
    try:
        ai_response = get_ai_similarity_analysis(comparison_prompt)
        return process_ai_response(ai_response, filename_to_path_mapping)
    except Exception as error:
        print(f"Error in AI analysis: {error}")
        return create_error_analysis_result(error)

def create_empty_analysis_result():
    """Create an empty analysis result structure."""
    return {
        "comparisons": [],
        "overall_assessment": "No existing hunts to compare against",
        "recommendation": "APPROVE"
    }

def create_filename_path_mapping(existing_hunts):
    """Create a mapping from filename to full path."""
    return {hunt['filename']: hunt['filepath'] for hunt in existing_hunts}

def build_comparison_prompt(new_hunt, existing_hunts):
    """Build the AI comparison prompt."""
    new_hunt_details = extract_new_hunt_details(new_hunt)
    existing_hunts_summary = create_existing_hunts_summary(existing_hunts)
    
    return f"""
You are analyzing a new threat hunt submission to check for potential duplicates or high similarity with existing hunts.

NEW HUNT SUBMISSION:
- Hypothesis: {new_hunt_details['hypothesis']}
- Tactic: {new_hunt_details['tactic']}
- Tags: {', '.join(new_hunt_details['tags'])}

EXISTING HUNTS TO COMPARE AGAINST:
{existing_hunts_summary}

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

def extract_new_hunt_details(new_hunt):
    """Extract details from new hunt for comparison."""
    return {
        'hypothesis': new_hunt.get('hypothesis', ''),
        'tactic': new_hunt.get('tactic', ''),
        'tags': new_hunt.get('tags', [])
    }

def create_existing_hunts_summary(existing_hunts):
    """Create a summary of existing hunts for comparison."""
    summary_parts = []
    # Limit to 10 most recent for performance
    for index, hunt in enumerate(existing_hunts[:10]):
        hunt_summary = f"""
Hunt {index + 1} ({hunt['filename']}):
- Hypothesis: {hunt['hypothesis']}
- Tactic: {hunt['tactic']}
- Tags: {', '.join(hunt['tags'])}
"""
        summary_parts.append(hunt_summary)
    
    return chr(10).join(summary_parts)

def get_ai_similarity_analysis(comparison_prompt):
    """Get AI analysis response."""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a threat hunting expert analyzing hunt submissions for duplicates and similarities. Be thorough but fair in your assessment."},
            {"role": "user", "content": comparison_prompt}
        ],
        temperature=0.2,
        max_tokens=2000
    )
    return response.choices[0].message.content.strip()

def process_ai_response(ai_response, filename_to_path_mapping):
    """Process and parse AI response."""
    try:
        analysis_result = json.loads(ai_response)
        augment_analysis_with_file_paths(analysis_result, filename_to_path_mapping)
        return analysis_result
    except json.JSONDecodeError:
        return create_parse_error_result()

def augment_analysis_with_file_paths(analysis_result, filename_to_path_mapping):
    """Add file paths to analysis comparisons."""
    for comparison in analysis_result.get('comparisons', []):
        filename = comparison.get('hunt_filename')
        if filename in filename_to_path_mapping:
            comparison['hunt_filepath'] = filename_to_path_mapping[filename]

def create_parse_error_result():
    """Create result for JSON parsing errors."""
    return {
        "comparisons": [],
        "overall_assessment": "Could not parse AI analysis",
        "recommendation": "FLAG_FOR_REVIEW"
    }

def create_error_analysis_result(error):
    """Create result for analysis errors."""
    return {
        "comparisons": [],
        "overall_assessment": f"Error during analysis: {error}",
        "recommendation": "FLAG_FOR_REVIEW"
    }

def generate_duplicate_comment(analysis, new_hunt_info):
    """Generates a GitHub comment about potential duplicates."""
    comparisons = analysis.get('comparisons', [])
    if not comparisons:
        return "✅ **Duplicate Check Complete**\n\nNo similar existing hunts found. This appears to be a unique submission."

    # Sort by score (highest first) and limit to the top 5
    sorted_comparisons = sorted(comparisons, key=lambda x: x.get('similarity_score', 0), reverse=True)[:5]
    
    # The title is now handled by the workflow, so we start the comment content here.
    comment = f"**Overall Assessment:** {analysis.get('overall_assessment', 'Analysis completed')}\n\n"
    comment += "**Similar Existing Hunts:**\n\n"
    
    # Construct the base URL for file links from GitHub environment variables
    repo_url = f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{os.getenv('GITHUB_REPOSITORY')}"
    branch = os.getenv('GITHUB_REF_NAME', 'main')

    for comp in sorted_comparisons:
        score = comp.get('similarity_score', 0)
        explanation = comp.get('explanation', 'No explanation provided')
        recommendation = comp.get('recommendation', 'UNKNOWN')
        
        filepath = comp.get('hunt_filepath')
        filename = comp.get('hunt_filename', 'Unknown')

        # Color code based on similarity
        if score >= 80:
            emoji = "🔴"
            status = "HIGH SIMILARITY"
        elif score >= 60:
            emoji = "🟡"
            status = "MODERATE SIMILARITY"
        else:
            emoji = "🟢"
            status = "LOW SIMILARITY"
        
        # Create a link if the filepath is available, otherwise just show the filename
        if filepath:
            file_url = f"{repo_url}/blob/{branch}/{filepath}"
            comment += f"{emoji} **[{filename}]({file_url})** (Similarity: {score}%)\n"
        else:
            comment += f"{emoji} **{filename}** (Similarity: {score}%)\n"

        comment += f"   - **Status:** {status} ({recommendation})\n"
        comment += f"   - **Explanation:** {explanation}\n\n"
    
    # Add recommendation
    overall_rec = analysis.get('recommendation', 'FLAG_FOR_REVIEW')
    if overall_rec == 'APPROVE':
        comment += "✅ **Recommendation:** This hunt appears unique and can be approved.\n\n"
    else:
        comment += "⚠️ **Recommendation:** Please review for potential duplication before approval.\n\n"
    
    comment += "---\n*This analysis was performed by AI duplicate detection. Please review manually before making final decisions.*"
    
    # Replace all escaped newlines with real newlines for GitHub markdown
    return comment.replace('\\n', '\n')

def generate_enhanced_duplicate_comment(dedup_result, new_hunt_info: Dict[str, Any]) -> str:
    """Generate enhanced GitHub comment using similarity detection results."""
    try:
        # Start with similarity analysis results
        if not dedup_result.is_duplicate:
            comment = "✅ **Enhanced Duplicate Check Complete**\n\n"
            comment += "No significantly similar existing hunts found. This appears to be a unique submission.\n\n"
            comment += f"**Analysis Details:**\n"
            comment += f"- Similarity threshold: {dedup_result.similarity_threshold:.1%}\n"
            comment += f"- Highest similarity score: {dedup_result.max_similarity_score:.1%}\n"
            comment += f"- Hunts analyzed: {len(dedup_result.similar_hunts)}\n\n"
            
            # Show top 3 similar hunts even if below threshold
            if dedup_result.similar_hunts:
                comment += "**Top Similar Hunts (Below Threshold):**\n\n"
                comment += format_similar_hunts_list(dedup_result.similar_hunts[:3])
        else:
            comment = f"⚠️ **Enhanced Duplicate Check - {dedup_result.similar_hunts_count} Similar Hunt(s) Found**\n\n"
            comment += f"**Similarity Analysis:**\n"
            comment += f"- Threshold: {dedup_result.similarity_threshold:.1%}\n"
            comment += f"- Highest similarity: {dedup_result.max_similarity_score:.1%}\n\n"
            
            # Show top 3 similar hunts with details
            if dedup_result.similar_hunts:
                comment += "**Top 3 Most Similar Existing Hunts:**\n\n"
                comment += format_similar_hunts_list(dedup_result.similar_hunts[:3])
            
            # Add detailed report if available
            if hasattr(dedup_result, 'detailed_report') and dedup_result.detailed_report:
                comment += "\n**Detailed Analysis:**\n"
                comment += dedup_result.detailed_report + "\n\n"
        
        # Add recommendation
        comment += f"**🤖 Recommendation:** {dedup_result.recommendation}\n\n"
        
        # Add methodology note
        comment += "---\n"
        comment += "*This analysis was performed using enhanced similarity detection with multiple algorithms:*\n"
        comment += "- TTP-aware similarity (Tactics, Techniques, Procedures)\n" 
        comment += "- Lexical similarity (Jaccard, Cosine, Levenshtein)\n"
        comment += "- Semantic similarity (Concept mapping, MITRE ATT&CK tactics)\n"
        comment += "- Structural similarity (Sentence patterns, Length analysis)\n"
        comment += "- Keyword overlap analysis\n\n"
        
        comment += "*Please review manually before making final decisions.*"
        
        return comment
        
    except Exception as error:
        logger.error(f"Error generating enhanced comment: {error}")
        return f"❌ Error generating similarity analysis comment: {error}"

def format_similar_hunts_list(similar_hunts: List[Dict[str, Any]]) -> str:
    """Format the list of similar hunts for display."""
    if not similar_hunts:
        return "No similar hunts found.\n\n"
    
    formatted_list = ""
    repo_url = f"{os.getenv('GITHUB_SERVER_URL', 'https://github.com')}/{os.getenv('GITHUB_REPOSITORY')}"
    branch = os.getenv('GITHUB_REF_NAME', 'main')
    
    for i, hunt in enumerate(similar_hunts, 1):
        similarity_score = hunt.get('similarity_score', 0)
        filename = hunt.get('filename', 'Unknown')
        filepath = hunt.get('filepath', '')
        hypothesis = hunt.get('hypothesis', 'No hypothesis available')
        tactic = hunt.get('tactic', 'Unknown')
        
        # Determine similarity level and emoji
        if similarity_score >= 80:
            emoji = "🔴"
            level = "HIGH"
        elif similarity_score >= 60:
            emoji = "🟡" 
            level = "MODERATE"
        else:
            emoji = "🟢"
            level = "LOW"
        
        # Create file link if possible
        if filepath:
            file_url = f"{repo_url}/blob/{branch}/{filepath}"
            hunt_link = f"[{filename}]({file_url})"
        else:
            hunt_link = filename
        
        formatted_list += f"{emoji} **{hunt_link}** ({similarity_score:.1f}% similarity - {level})\n"
        formatted_list += f"   - **Tactic:** {tactic}\n"
        formatted_list += f"   - **Hypothesis:** {hypothesis[:100]}{'...' if len(hypothesis) > 100 else ''}\n\n"
    
    return formatted_list

def check_duplicates_for_new_submission(new_hunt_content, new_hunt_filename):
    """Main function to check for duplicates in a new submission."""
    logger.info("🔍 Starting enhanced duplicate detection...")
    
    try:
        # Extract info from new hunt
        new_hunt_info = extract_hunt_info(new_hunt_content, new_hunt_filename)
        if not new_hunt_info:
            return "❌ Could not extract hunt information from submission."
        
        # Use enhanced similarity detection if enabled
        if config.enable_similarity_checking:
            return check_duplicates_with_enhanced_similarity(new_hunt_info)
        else:
            # Fall back to original AI-based method
            return check_duplicates_with_ai_analysis(new_hunt_info)
            
    except Exception as error:
        logger.error(f"Error in duplicate detection: {error}")
        return f"❌ Duplicate detection failed: {error}"

def check_duplicates_with_enhanced_similarity(new_hunt_info: Dict[str, Any]) -> str:
    """Enhanced duplicate detection using similarity algorithms."""
    try:
        logger.info("Using enhanced similarity detection")
        
        # Get similarity detector and deduplicator
        similarity_detector = get_similarity_detector()
        deduplicator = get_hypothesis_deduplicator()
        
        # Check hypothesis uniqueness
        hypothesis = new_hunt_info.get('hypothesis', '')
        tactic = new_hunt_info.get('tactic', '')
        tags = new_hunt_info.get('tags', [])
        
        dedup_result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic, tags)
        
        # Generate enhanced comment
        comment = generate_enhanced_duplicate_comment(dedup_result, new_hunt_info)
        
        return comment
        
    except Exception as error:
        logger.error(f"Error in enhanced similarity detection: {error}")
        # Fall back to AI analysis
        return check_duplicates_with_ai_analysis(new_hunt_info)

def check_duplicates_with_ai_analysis(new_hunt_info: Dict[str, Any]) -> str:
    """Original AI-based duplicate detection method."""
    logger.info("Using AI-based duplicate detection")
    
    # Get existing hunts
    existing_hunts = get_all_existing_hunts()
    logger.info(f"📚 Found {len(existing_hunts)} existing hunts to compare against.")
    
    # Perform AI analysis
    analysis = analyze_similarity(new_hunt_info, existing_hunts)
    
    # Generate comment
    comment = generate_duplicate_comment(analysis, new_hunt_info)
    
    return comment

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