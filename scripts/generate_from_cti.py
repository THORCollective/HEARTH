import os
from pathlib import Path
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from datetime import datetime
from logger_config import get_logger
from config_manager import get_config

logger = get_logger()

# Add Anthropic (Claude) support
try:
    import anthropic
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False

# Import TTP diversity system
try:
    from hypothesis_deduplicator import get_hypothesis_deduplicator
    TTP_DIVERSITY_AVAILABLE = True
except ImportError:
    logger.warning("TTP diversity system not available. Skipping TTP diversity checks.")
    TTP_DIVERSITY_AVAILABLE = False

# Import MITRE ATT&CK data
try:
    from mitre_attack import get_mitre_attack
    MITRE_AVAILABLE = True
except ImportError:
    logger.warning("MITRE ATT&CK data not available. Using fallback tactic matching.")
    MITRE_AVAILABLE = False

# Import unified duplicate detection module
try:
    from duplicate_detector import check_duplicates_for_new_submission
    DUPLICATE_DETECTION_AVAILABLE = True
except ImportError:
    logger.warning("Duplicate detection module not available.")
    DUPLICATE_DETECTION_AVAILABLE = False

load_dotenv()

# AI provider selection
AI_PROVIDER = os.getenv("AI_PROVIDER", "claude").lower()

# Claude model configuration - use environment variable or default to latest
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5-20250929")

if AI_PROVIDER == "claude":
    if not CLAUDE_AVAILABLE:
        raise ImportError("Anthropic (Claude) client not installed. Please install 'anthropic' Python package.")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set in environment.")
    anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
else:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CTI_INPUT_DIR = Path(".hearth/intel-drops/")
OUTPUT_DIR    = Path("Flames/")
PROCESSED_DIR = Path(".hearth/processed-intel-drops/")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# Cache monitoring statistics (accumulated across all API calls)
cache_stats = {
    "total_calls": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "input_tokens": 0,
    "cache_read_tokens": 0,
    "cache_creation_tokens": 0,
    "output_tokens": 0,
    "total_cost_usd": 0.0
}


def get_cache_control():
    """
    Get cache control object based on configuration settings.

    Returns:
        dict or None: Cache control object if caching is enabled, None otherwise
    """
    config = get_config().config

    if not config.enable_prompt_caching:
        return None

    cache_control = {"type": "ephemeral"}

    # Add TTL if configured for 1 hour (5 minutes is default and doesn't need to be specified)
    if config.cache_ttl == "1h":
        cache_control["ttl"] = "1h"

    return cache_control


def log_cache_usage(response, operation_name: str):
    """
    Log cache usage statistics from an Anthropic API response.

    Args:
        response: Anthropic API response object with usage stats
        operation_name: Human-readable name for the operation (e.g., "chunk summarization", "hunt generation")
    """
    if not hasattr(response, 'usage'):
        return

    usage = response.usage
    cache_stats["total_calls"] += 1

    # Track token usage
    input_tokens = getattr(usage, 'input_tokens', 0)
    cache_read_tokens = getattr(usage, 'cache_read_input_tokens', 0)
    cache_creation_tokens = getattr(usage, 'cache_creation_input_tokens', 0)
    output_tokens = getattr(usage, 'output_tokens', 0)

    cache_stats["input_tokens"] += input_tokens
    cache_stats["cache_read_tokens"] += cache_read_tokens
    cache_stats["cache_creation_tokens"] += cache_creation_tokens
    cache_stats["output_tokens"] += output_tokens

    # Determine if this was a cache hit or miss
    if cache_read_tokens > 0:
        cache_stats["cache_hits"] += 1
        cache_status = "HIT"
    elif cache_creation_tokens > 0:
        cache_stats["cache_misses"] += 1
        cache_status = "MISS (cache created)"
    else:
        cache_status = "N/A (no cacheable content)"

    # Calculate cost for this call (Claude Sonnet 4.5 pricing as of 2025)
    # Input: $3 per million tokens
    # Cache writes: $3.75 per million tokens (25% more than base)
    # Cache reads: $0.30 per million tokens (90% discount)
    # Output: $15 per million tokens
    input_cost = (input_tokens / 1_000_000) * 3.00
    cache_write_cost = (cache_creation_tokens / 1_000_000) * 3.75
    cache_read_cost = (cache_read_tokens / 1_000_000) * 0.30
    output_cost = (output_tokens / 1_000_000) * 15.00
    call_cost = input_cost + cache_write_cost + cache_read_cost + output_cost

    cache_stats["total_cost_usd"] += call_cost

    # Calculate savings if cache was used
    savings_info = ""
    if cache_read_tokens > 0:
        # What it would have cost without caching
        uncached_cost = (cache_read_tokens / 1_000_000) * 3.00
        savings = uncached_cost - cache_read_cost
        savings_pct = (savings / uncached_cost * 100) if uncached_cost > 0 else 0
        savings_info = f" | Saved: ${savings:.4f} ({savings_pct:.1f}%)"

    logger.info(
        f"Cache {cache_status} for {operation_name} | "
        f"Tokens: {input_tokens} input, {cache_read_tokens} cached read, "
        f"{cache_creation_tokens} cache write, {output_tokens} output | "
        f"Cost: ${call_cost:.4f}{savings_info}"
    )


def log_cache_summary():
    """Log cumulative cache statistics for the entire session."""
    if cache_stats["total_calls"] == 0:
        return

    hit_rate = (cache_stats["cache_hits"] / cache_stats["total_calls"] * 100) if cache_stats["total_calls"] > 0 else 0

    # Calculate total savings from caching
    total_cached_tokens = cache_stats["cache_read_tokens"]
    if total_cached_tokens > 0:
        # What it would have cost without caching (at base input rate)
        uncached_cost = (total_cached_tokens / 1_000_000) * 3.00
        # What it actually cost (at cache read rate)
        cached_cost = (total_cached_tokens / 1_000_000) * 0.30
        total_savings = uncached_cost - cached_cost
        savings_pct = (total_savings / (cache_stats["total_cost_usd"] + total_savings) * 100) if cache_stats["total_cost_usd"] > 0 else 0
    else:
        total_savings = 0.0
        savings_pct = 0.0

    logger.info("=" * 80)
    logger.info("CACHE PERFORMANCE SUMMARY")
    logger.info("=" * 80)
    logger.info(f"Total API calls: {cache_stats['total_calls']}")
    logger.info(f"Cache hits: {cache_stats['cache_hits']} | Cache misses: {cache_stats['cache_misses']}")
    logger.info(f"Cache hit rate: {hit_rate:.1f}%")
    logger.info(f"Total tokens - Input: {cache_stats['input_tokens']:,} | "
                f"Cache read: {cache_stats['cache_read_tokens']:,} | "
                f"Cache write: {cache_stats['cache_creation_tokens']:,} | "
                f"Output: {cache_stats['output_tokens']:,}")
    logger.info(f"Total cost: ${cache_stats['total_cost_usd']:.4f}")
    if total_savings > 0:
        logger.info(f"Total savings from caching: ${total_savings:.4f} ({savings_pct:.1f}% reduction)")
    logger.info("=" * 80)


def extract_technique_and_tactic(content: str) -> tuple:
    """
    Extract technique ID and tactic from generated hunt content.
    Uses MITRE ATT&CK data for validation and accurate tactic mapping.

    Returns:
        tuple: (technique_id, tactic, confidence_score)
    """
    import re

    # Try to extract technique ID from content
    technique_pattern = r'T\d{4}(?:\.\d{3})?'
    techniques_found = re.findall(technique_pattern, content)

    if techniques_found and MITRE_AVAILABLE:
        # Validate using MITRE data
        mitre = get_mitre_attack()
        for tech_id in techniques_found:
            tech_data = mitre.validate_technique(tech_id)
            if tech_data:
                tactic = mitre.get_technique_tactic(tech_id)
                if tactic:
                    logger.info(f"Validated technique {tech_id}: {tech_data['name']}")
                    logger.info(f"MITRE tactic: {tactic}")
                    return (tech_id, tactic, 1.0)  # 100% confidence from MITRE

    # Fallback: Extract from table in generated content
    lines = content.split('\n')
    for line in lines:
        if '|' in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 4:
                potential_tactic = parts[2].strip() if len(parts) > 2 and parts[2].strip() else None
                if potential_tactic and potential_tactic.lower() != "tactic":
                    # Validate tactic name if MITRE available
                    if MITRE_AVAILABLE:
                        mitre = get_mitre_attack()
                        # Normalize tactic name
                        for mitre_tactic in mitre.tactics.keys():
                            if mitre_tactic.lower() == potential_tactic.lower():
                                return (None, mitre_tactic, 0.8)  # 80% confidence from table
                    return (None, potential_tactic, 0.7)  # 70% confidence from table

    # Final fallback: Keyword-based inference (low confidence)
    hypothesis = content.split('\n')[0].strip()
    hypothesis_lower = hypothesis.lower()

    if any(word in hypothesis_lower for word in ['tunnel', 'proxy', 'socks', 'c2', 'command', 'control', 'communication']):
        return (None, "Command And Control", 0.3)
    elif any(word in hypothesis_lower for word in ['download', 'execute', 'run', 'launch', 'powershell', 'cmd']):
        return (None, "Execution", 0.3)
    elif any(word in hypothesis_lower for word in ['persist', 'startup', 'service', 'registry', 'scheduled']):
        return (None, "Persistence", 0.3)
    elif any(word in hypothesis_lower for word in ['credential', 'password', 'token', 'hash', 'mimikatz']):
        return (None, "Credential Access", 0.3)
    else:
        return (None, "Command And Control", 0.2)  # Default fallback


def get_next_hunt_id():
    """Scans the Flames/ directory to find the next available hunt ID."""
    flames_dir = Path("Flames/")
    flames_dir.mkdir(exist_ok=True)
    max_id = 0
    hunt_pattern = re.compile(r"H-\d{4}-(\d{3,})\.md")
    for f in flames_dir.glob("H-*.md"):
        match = hunt_pattern.match(f.name)
        if match:
            current_id = int(match.group(1))
            if current_id > max_id:
                max_id = current_id
    return max_id + 1


SYSTEM_PROMPT = """You are a threat hunter generating HEARTH markdown files.
Each file MUST focus on exactly ONE MITRE ATT&CK technique - no exceptions.
You MUST scope the hypothesis to be as narrow and specific as possible.
CRITICAL: Do NOT list or enumerate techniques at the start of the markdown file.
The markdown MUST start directly with the hypothesis text, not a heading.

When selecting which technique to focus on from multiple TTPs, prioritize based on:
1. Actionability - Choose the TTP that is most observable in logs/telemetry
2. Impact - Prioritize TTPs that directly lead to adversary objectives
3. Uniqueness - Prefer TTPs that are more distinctive of the specific threat
4. Detection Gap - Consider TTPs that are commonly missed by security tools

All hypotheses must:
- Focus on a single, specific MITRE ATT&CK technique only
- Be behaviorally specific to that one TTP
- Include EXACTLY these four parts:
  1. Actor type (e.g., "Threat actors", "Adversaries", "Attackers")
  2. Precise behavior (specific commands, tools, or methods being used)
  3. Immediate tactical goal (what the technique directly achieves)
  4. Specific target (exact systems, services, or data affected)
- Use firm language (e.g., "Threat actors are…", "Adversaries are…")
- Avoid actor names in the hypothesis (they go in the Why section)
- Do not include MITRE technique numbers in the hypothesis
- The output MUST begin directly with the hypothesis text. DO NOT include a title or markdown heading.
- If it's a vulnerability, do not use the CVE name or state it's a known vulnerability but rather the technique name

Examples of BAD (too broad) hypotheses:
❌ "Threat actors are using PowerShell to execute malicious code"
❌ "Adversaries are exploiting vulnerabilities in web applications"
❌ "Attackers are using valid credentials to access systems"

Examples of GOOD (narrow) hypotheses:
✅ "Threat actors are using PowerShell's Invoke-WebRequest cmdlet to download encrypted payloads from Discord CDN to evade network detection"
✅ "Adversaries are modifying Windows Registry Run keys in HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run to maintain persistence across system reboots"
✅ "Attackers are creating scheduled tasks with random 8-character alphanumeric names to execute Base64-encoded PowerShell commands at system startup"
"""

# Static template instructions (cacheable across all requests)
TEMPLATE_INSTRUCTIONS = """Instructions:
1.  Read the CTI Report.
2.  Select the single most actionable MITRE ATT&CK technique from the report.
3.  Write a specific, narrow, and actionable hunt hypothesis based on that technique.
4.  Write a "Why" section explaining the importance of the hunt.
5.  Write a "References" section with a link to the chosen MITRE technique and the source CTI.
6.  The output MUST be only the content for the hunt, starting with the hypothesis. DO NOT include a title or the metadata table.

Your output should look like this:

[Your extremely specific hypothesis]

| Hunt #       | Idea / Hypothesis                                                      | Tactic         | Notes                                                                              | Tags                           | Submitter           |
|--------------|-------------------------------------------------------------------------|----------------|------------------------------------------------------------------------------------|--------------------------------|---------------------|
| [Leave blank] | [Same hypothesis]                                                      | [MITRE Tactic] | Based on ATT&CK technique [Txxxx]. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH). | #[tactic] #[technique] #[tag] | [SUBMITTER_CREDIT] |

## Why
- [Why this behavior is important to detect]
- [Tactical impact of success]
- [Links to larger campaigns]

## References
- [MITRE ATT&CK link]
- [Source CTI Report]([CTI_SOURCE_URL])
"""

# Legacy template for OpenAI (non-cached)
USER_TEMPLATE = """{regeneration_instruction}CTI REPORT:

{cti_text}

---

Instructions:
1.  Read the CTI Report.
2.  Select the single most actionable MITRE ATT&CK technique from the report.
3.  Write a specific, narrow, and actionable hunt hypothesis based on that technique.
4.  Write a "Why" section explaining the importance of the hunt.
5.  Write a "References" section with a link to the chosen MITRE technique and the source CTI.
6.  The output MUST be only the content for the hunt, starting with the hypothesis. DO NOT include a title or the metadata table.

Your output should look like this:

[Your extremely specific hypothesis]

| Hunt #       | Idea / Hypothesis                                                      | Tactic         | Notes                                                                              | Tags                           | Submitter           |
|--------------|-------------------------------------------------------------------------|----------------|------------------------------------------------------------------------------------|--------------------------------|---------------------|
| [Leave blank] | [Same hypothesis]                                                      | [MITRE Tactic] | Based on ATT&CK technique [Txxxx]. Generated by [hearth-auto-intel](https://github.com/THORCollective/HEARTH). | #[tactic] #[technique] #[tag] | {submitter_credit} |

## Why
- [Why this behavior is important to detect]
- [Tactical impact of success]
- [Links to larger campaigns]

## References
- [MITRE ATT&CK link]
- [Source CTI Report]({cti_source_url})
"""


def summarize_cti_with_map_reduce(text, model="gpt-4", max_tokens=128000):
    """
    Summarizes long text by splitting it into chunks, summarizing each, 
    and then creating a final summary of the summaries.
    This is a 'map-reduce' approach to handle large contexts.
    """
    # Estimate token count (very rough approximation)
    text_token_count = len(text) / 4

    if text_token_count < max_tokens * 0.7:  # If text is well within the limit
        logger.info("CTI content is within the context window. No summarization needed.")
        return text

    logger.warning(f"CTI content is too long ({int(text_token_count)} tokens). Starting map-reduce summarization.")

    # 1. Map: Split the document into overlapping chunks
    chunk_size = int(max_tokens * 0.6)  # Use 60% of the model's context for each chunk
    overlap = int(chunk_size * 0.1)  # 10% overlap

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    logger.info(f"Split CTI into {len(chunks)} chunks.")

    # 2. Summarize each chunk
    chunk_summaries = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Summarizing chunk {i +1}/{len(chunks)}...")
        try:
            if AI_PROVIDER == "claude":
                # Claude prompt format with prompt caching
                instruction_text = (
                    "This is one part of a larger threat intelligence report. "
                    "Extract the key actionable intelligence from this section. "
                    "Focus on specific tools, techniques, vulnerabilities, and adversary procedures. "
                    "Your output will be combined with others, so be concise and clear."
                )
                # Build system message with optional caching
                system_msg = {"type": "text", "text": instruction_text}
                cache_control = get_cache_control()
                if cache_control:
                    system_msg["cache_control"] = cache_control

                response = anthropic_client.messages.create(
                    model=CLAUDE_MODEL,
                    max_tokens=1024,
                    temperature=0.2,
                    system=[system_msg],
                    messages=[{
                        "role": "user",
                        "content": f"--- CHUNK {i +1}/{len(chunks)} ---\n\n{chunk}"
                    }]
                )
                log_cache_usage(response, f"chunk summarization {i+1}/{len(chunks)}")
                summary = response.content[0].text.strip()
            else:
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content":
                        "This is one part of a larger threat intelligence report. "
                        "Extract the key actionable intelligence from this section. "
                        "Focus on specific tools, techniques, vulnerabilities, and adversary procedures. "
                        "Your output will be combined with others, so be concise and clear.\n\n"
                        f"--- CHUNK {i +1}/{len(chunks)} ---\n\n{chunk}"
                    }],
                    temperature=0.2,
                )
                summary = response.choices[0].message.content.strip()
            chunk_summaries.append(summary)
        except Exception as e:
            logger.error(f"Error summarizing chunk {i +1}: {e}")
            # If a chunk fails, we just add a note and continue
            chunk_summaries.append(f"[Could not summarize chunk {i +1}]")

    # 3. Reduce: Create a final summary from the individual summaries
    logger.info("Creating final summary of all chunks...")
    combined_summary = "\n\n---\n\n".join(chunk_summaries)

    try:
        if AI_PROVIDER == "claude":
            instruction_text = (
                "The following are summaries of different parts of a long threat intelligence report. "
                "Synthesize them into a single, coherent, and actionable report. "
                "Remove redundancy and create a clear narrative of the adversary's actions. "
                "The final output should be a comprehensive summary that can be used to generate a threat hunt."
            )
            # Build system message with optional caching
            system_msg = {"type": "text", "text": instruction_text}
            cache_control = get_cache_control()
            if cache_control:
                system_msg["cache_control"] = cache_control

            final_response = anthropic_client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=2048,
                temperature=0.2,
                system=[system_msg],
                messages=[{
                    "role": "user",
                    "content": f"--- COMBINED SUMMARIES ---\n\n{combined_summary}"
                }]
            )
            log_cache_usage(final_response, "final CTI synthesis")
            return final_response.content[0].text.strip()
        else:
            final_response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content":
                    "The following are summaries of different parts of a long threat intelligence report. "
                    "Synthesize them into a single, coherent, and actionable report. "
                    "Remove redundancy and create a clear narrative of the adversary's actions. "
                    "The final output should be a comprehensive summary that can be used to generate a threat hunt.\n\n"
                    f"--- COMBINED SUMMARIES ---\n\n{combined_summary}"
                }],
                temperature=0.2,
            )
            return final_response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error creating final summary: {e}")
        # Fallback: return the combined summaries if the final step fails
        return f"WARNING: Final summarization failed. Combined summaries provided below:\n\n{combined_summary}"


def cleanup_hunt_body(ai_content):
    """
    Cleans the AI's raw output to ensure it starts with the hypothesis
    and removes any prepended conversational text or extra headers.
    """
    lines = ai_content.splitlines()

    # Find the first line that looks like a real hypothesis.
    # It should be a non-empty line that doesn't start with a known non-content keyword.
    first_content_index = -1
    for i, line in enumerate(lines):
        stripped_line = line.strip()
        if not stripped_line:
            continue

        # These are keywords we want to strip out if they appear before the hypothesis.
        is_unwanted_prefix = any(
            stripped_line.lower().startswith(prefix) for prefix in
            ['cti report:', 'hypothesis:', '---', 'instructions:', 'your output should']
        )

        if not is_unwanted_prefix:
            first_content_index = i
            break

    if first_content_index == -1:
        logger.warning("Could not find the start of the hypothesis. Returning raw content.")
        return ai_content

    # The hypothesis might have a "Hypothesis:" label. Let's remove that specifically.
    first_line = lines[first_content_index]
    if "hypothesis:" in first_line.lower():
        lines[first_content_index] = first_line.split(':', 1)[-1].strip()

    return "\n".join(lines[first_content_index:]).strip()


def generate_hunt_content_with_ttp_diversity(cti_text, cti_source_url, submitter_credit, is_regeneration=False, max_attempts=5, user_feedback=None):
    """Generate hunt content with TTP diversity enforcement."""
    try:
        logger.info("Starting CTI summarization...")
        summary = summarize_cti_with_map_reduce(cti_text)
        logger.info("CTI summarization complete.")

        # Initialize TTP diversity checker
        if TTP_DIVERSITY_AVAILABLE:
            logger.info("Using TTP diversity system for generation")
            deduplicator = get_hypothesis_deduplicator()

            # Load existing hunts to build TTP context for this session
            if is_regeneration:
                logger.info("Loading existing hunts to build TTP diversity context...")
                _load_existing_hunts_for_ttp_context(deduplicator)
        else:
            logger.warning("TTP diversity system unavailable, using basic generation")
            return generate_hunt_content_basic(summary, cti_source_url, submitter_credit, is_regeneration, user_feedback)

        # Attempt generation with TTP diversity
        for attempt in range(max_attempts):
            logger.info(f"Generation attempt {attempt + 1}/{max_attempts}")

            regeneration_instruction = ""
            temperature = 0.2 + (attempt * 0.1)  # Increase temperature with attempts

            if is_regeneration or attempt > 0:
                diversity_instruction = ""
                if attempt > 0:
                    # Get TTP diversity suggestions
                    stats = deduplicator.ttp_checker.get_stats()
                    used_tactics = stats.get('tactics_used', [])
                    if used_tactics:
                        diversity_instruction = f"CRITICAL: Previous attempts used these tactics: {', '.join(used_tactics)}. You MUST use a completely different MITRE ATT&CK tactic and technique. "

                # Add user feedback constraints
                feedback_instruction = ""
                if user_feedback:
                    feedback_instruction = f"USER FEEDBACK CONSTRAINTS: {user_feedback}\nYou MUST strictly follow these user instructions. "

                regeneration_instruction = (
                    f"{feedback_instruction}"
                    f"{diversity_instruction}"
                    "IMPORTANT: Generate a NEW and DIFFERENT hunt hypothesis with different TTPs. "
                    "Analyze the CTI report and focus on a different MITRE ATT&CK technique, tactic, "
                    "or unique attack vector that was not covered before. Ensure this covers "
                    "completely different Tactics, Techniques, and Procedures (TTPs).\n\n"
                )
                temperature = min(0.7, temperature)

            # Generate content
            hunt_content = None
            if AI_PROVIDER == "claude":
                # Use prompt caching for both SYSTEM_PROMPT and TEMPLATE_INSTRUCTIONS
                # Cache blocks are placed at the end of their respective sections
                # Keep template fully static for maximum cache reuse across all requests

                # Build user message content with caching
                user_content = []

                # Add regeneration instruction if present (dynamic, not cached)
                if regeneration_instruction:
                    user_content.append({
                        "type": "text",
                        "text": regeneration_instruction
                    })

                # Add CTI report content (dynamic, not cached)
                user_content.append({
                    "type": "text",
                    "text": f"CTI REPORT:\n\n{summary}"
                })

                # Add separator
                user_content.append({
                    "type": "text",
                    "text": "\n---\n"
                })

                # Add cached template instructions (completely static)
                template_msg = {"type": "text", "text": TEMPLATE_INSTRUCTIONS}
                cache_control = get_cache_control()
                if cache_control:
                    template_msg["cache_control"] = cache_control
                user_content.append(template_msg)

                # Add dynamic values after the cached template (not cached)
                user_content.append({
                    "type": "text",
                    "text": f"\nFor this hunt, use:\n- Submitter: {submitter_credit}\n- Source URL: {cti_source_url}"
                })

                # Build system message with optional caching
                system_msg = {"type": "text", "text": SYSTEM_PROMPT}
                if cache_control:
                    system_msg["cache_control"] = cache_control

                response = anthropic_client.messages.create(
                    model=CLAUDE_MODEL,
                    max_tokens=1200,
                    temperature=temperature,
                    system=[system_msg],
                    messages=[{
                        "role": "user",
                        "content": user_content
                    }]
                )
                log_cache_usage(response, "hunt generation (with TTP diversity)")
                hunt_content = response.content[0].text.strip()
            else:
                # OpenAI fallback (no caching support)
                prompt = USER_TEMPLATE.format(
                    regeneration_instruction=regeneration_instruction,
                    cti_text=summary,
                    cti_source_url=cti_source_url,
                    submitter_credit=submitter_credit
                )
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[{"role": "system", "content": SYSTEM_PROMPT},
                             {"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=800
                )
                hunt_content = response.choices[0].message.content.strip()

            if not hunt_content:
                logger.error(f"Attempt {attempt + 1} failed: No content generated")
                continue

            # Extract hypothesis for TTP diversity check
            cleaned_content = cleanup_hunt_body(hunt_content)
            hypothesis = cleaned_content.split('\n')[0].strip()
            if hypothesis.startswith('#'):
                hypothesis = hypothesis.lstrip('#').strip()

            # Extract technique ID and tactic using MITRE ATT&CK data
            technique_id, tactic, confidence = extract_technique_and_tactic(cleaned_content)

            logger.info(f"Generated hypothesis: {hypothesis[:80]}...")
            logger.info(f"Detected tactic: {tactic} (confidence: {confidence:.0%})")
            if technique_id:
                logger.info(f"   Technique: {technique_id}")

            # Check TTP diversity
            ttp_result = deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)

            if not ttp_result.is_duplicate:
                logger.info(f"TTP diversity achieved on attempt {attempt + 1}")
                logger.info(f"   TTP overlap: {ttp_result.max_similarity_score:.1%}")
                logger.info(f"   Recommendation: {ttp_result.recommendation}")
                return hunt_content
            else:
                logger.error(f"Attempt {attempt + 1} rejected: TTP overlap {ttp_result.max_similarity_score:.1%}")
                logger.error(f"   Reason: {ttp_result.recommendation}")
                if ttp_result.ttp_overlap:
                    logger.error(f"   Analysis: {ttp_result.ttp_overlap.explanation}")
                continue

        logger.warning(f"All {max_attempts} attempts had similar TTPs. Using last attempt with warning.")
        return hunt_content

    except Exception as e:
        logger.error(f"Error in TTP-diverse generation: {str(e)}")
        return None


def generate_hunt_content_basic(cti_text, cti_source_url, submitter_credit, is_regeneration=False, user_feedback=None):
    """Basic hunt content generation without TTP diversity (fallback)."""
    try:
        regeneration_instruction = ""
        temperature = 0.2
        if is_regeneration:
            logger.info("This is a regeneration. Requesting a new hypothesis.")

            # Add user feedback constraints
            feedback_instruction = ""
            if user_feedback:
                feedback_instruction = f"USER FEEDBACK CONSTRAINTS: {user_feedback}\nYou MUST strictly follow these user instructions. "

            regeneration_instruction = (
                f"{feedback_instruction}"
                "IMPORTANT: The previous attempt to generate a hunt from this CTI was not satisfactory. "
                "Your task is to generate a NEW and DIFFERENT hunt hypothesis. "
                "Analyze the CTI report again and focus on a different technique, a more specific behavior, "
                "or a unique, actionable aspect that was missed before. Do not repeat the previous hypothesis.\n\n"
            )
            temperature = 0.7

        if AI_PROVIDER == "claude":
            # Use prompt caching for both SYSTEM_PROMPT and TEMPLATE_INSTRUCTIONS
            # Keep template fully static for maximum cache reuse across all requests

            # Build user message content with caching
            user_content = []

            # Add regeneration instruction if present (dynamic, not cached)
            if regeneration_instruction:
                user_content.append({
                    "type": "text",
                    "text": regeneration_instruction
                })

            # Add CTI report content (dynamic, not cached)
            user_content.append({
                "type": "text",
                "text": f"CTI REPORT:\n\n{cti_text}"
            })

            # Add separator
            user_content.append({
                "type": "text",
                "text": "\n---\n"
            })

            # Add cached template instructions (completely static)
            template_msg = {"type": "text", "text": TEMPLATE_INSTRUCTIONS}
            cache_control = get_cache_control()
            if cache_control:
                template_msg["cache_control"] = cache_control
            user_content.append(template_msg)

            # Add dynamic values after the cached template (not cached)
            user_content.append({
                "type": "text",
                "text": f"\nFor this hunt, use:\n- Submitter: {submitter_credit}\n- Source URL: {cti_source_url}"
            })

            # Build system message with optional caching
            system_msg = {"type": "text", "text": SYSTEM_PROMPT}
            if cache_control:
                system_msg["cache_control"] = cache_control

            response = anthropic_client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=1200,
                temperature=temperature,
                system=[system_msg],
                messages=[{
                    "role": "user",
                    "content": user_content
                }]
            )
            log_cache_usage(response, "hunt generation (basic)")
            return response.content[0].text.strip()
        else:
            # OpenAI fallback (no caching support)
            prompt = USER_TEMPLATE.format(
                regeneration_instruction=regeneration_instruction,
                cti_text=cti_text,
                cti_source_url=cti_source_url,
                submitter_credit=submitter_credit
            )
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "system", "content": SYSTEM_PROMPT},
                         {"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=800
            )
            return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating hunt content: {str(e)}")
        return None

# Alias for backward compatibility


def generate_hunt_content(cti_text, cti_source_url, submitter_credit, is_regeneration=False, user_feedback=None):
    """Generate hunt content (with TTP diversity if available)."""
    return generate_hunt_content_with_ttp_diversity(cti_text, cti_source_url, submitter_credit, is_regeneration, user_feedback=user_feedback)


def _load_existing_hunts_for_ttp_context(deduplicator):
    """Load existing hunt hypotheses to build TTP diversity context."""
    try:
        from pathlib import Path

        flames_dir = Path("Flames/")
        if not flames_dir.exists():
            logger.info("   No Flames directory found, starting with empty TTP context")
            return

        hunt_files = list(flames_dir.glob("H-*.md"))
        if not hunt_files:
            logger.info("   No existing hunt files found, starting with empty TTP context")
            return

        # Load recent hunts (last 10) to build context without overloading
        recent_hunts = sorted(hunt_files, key=lambda x: x.stat().st_mtime, reverse=True)[:10]

        loaded_count = 0
        for hunt_file in recent_hunts:
            try:
                content = hunt_file.read_text()

                # Extract hypothesis (first line after title)
                lines = content.split('\n')
                hypothesis = None
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#') and not line.startswith('|') and len(line) > 20:
                        hypothesis = line
                        break

                if not hypothesis:
                    continue

                # Extract tactic from table
                tactic = "Unknown"
                for line in lines:
                    if '|' in line and any(word in line.lower() for word in ['execution', 'persistence', 'command', 'defense']):
                        parts = [p.strip() for p in line.split('|')]
                        if len(parts) >= 4:
                            potential_tactic = parts[2].strip() if len(parts) > 2 and parts[2].strip() else None
                            if potential_tactic and potential_tactic.lower() not in ['tactic', '']:
                                tactic = potential_tactic
                                break

                # Add to TTP context (but don't return result to avoid spam)
                deduplicator.check_hypothesis_uniqueness(hypothesis, tactic)
                loaded_count += 1

            except Exception as e:
                logger.warning(f"   Could not load {hunt_file.name}: {e}")
                continue

        logger.info(f"   Loaded {loaded_count} existing hunts for TTP context")

        # Show current TTP diversity stats
        stats = deduplicator.ttp_checker.get_stats()
        if stats.get('total_attempts', 0) > 0:
            logger.info(f"   TTP Context: {stats['unique_tactics']} tactics, {stats['unique_techniques']} techniques")
            logger.info(f"   Tactics in context: {', '.join(stats.get('tactics_used', [])[:5])}")

    except Exception as e:
        logger.warning(f"   Error loading existing hunts: {e}")


def read_file_content(file_path):
    """Read content from either PDF or text file."""
    if file_path.suffix.lower() == '.pdf':
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {str(e)}")
            return None
    else:
        try:
            return file_path.read_text()
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {str(e)}")
            return None


if __name__ == "__main__":
    existing_hunt_path = os.getenv("EXISTING_HUNT_FILE")
    is_regeneration = bool(existing_hunt_path)

    if existing_hunt_path:
        out_md_path = Path(existing_hunt_path)
        hunt_id = out_md_path.stem
        logger.info(f"Regenerating hunt for {hunt_id} at {out_md_path}")
    else:
        # Determine the next hunt number
        hunt_files = list(Path(".").glob("Flames/H*.md"))
        if hunt_files:
            # Filter files that have the expected format and extract numbers
            hunt_numbers = []
            for f in hunt_files:
                parts = f.stem.split('-')
                if len(parts) >= 3 and parts[-1].isdigit():
                    hunt_numbers.append(int(parts[-1]))

            if hunt_numbers:
                next_hunt_num = max(hunt_numbers) + 1
            else:
                next_hunt_num = 1
        else:
            next_hunt_num = 1

        year = datetime.now().year
        hunt_id = f"H-{year}-{next_hunt_num:03d}"
        out_md_path = Path(f"Flames/{hunt_id}.md")
        logger.info(f"Generating new hunt: {hunt_id}")

    cti_source_url = os.getenv("CTI_SOURCE_URL")
    if not cti_source_url:
        # For programmatic submissions, this URL is still required for the references section.
        logger.warning("CTI_SOURCE_URL not found, reference link will be empty.")
        cti_source_url = ""

    # SECURELY get CTI content from the file prepared by the workflow
    cti_files = list(CTI_INPUT_DIR.glob("*"))
    if not cti_files:
        raise FileNotFoundError(f"❌ No CTI file found in the input directory '{CTI_INPUT_DIR}'.")

    cti_file_path = cti_files[0]
    logger.info(f"Processing CTI file: {cti_file_path}")
    cti_content = read_file_content(cti_file_path)

    # Get submitter info
    submitter_name = os.getenv("SUBMITTER_NAME", "hearth-auto-intel")
    profile_link = os.getenv("PROFILE_LINK")
    if profile_link:
        submitter_credit = f"[{submitter_name}]({profile_link})"
    else:
        submitter_credit = submitter_name

    if cti_content:
        # Get user feedback from environment
        user_feedback = os.getenv("FEEDBACK")

        # 1. Generate the core hunt content from the AI
        hunt_body = generate_hunt_content(
            cti_content,
            cti_source_url,
            submitter_credit,
            is_regeneration=is_regeneration,
            user_feedback=user_feedback
        )

        if hunt_body:
            # 2. Clean up the AI's output
            cleaned_body = cleanup_hunt_body(hunt_body)

            # 3. Extract the hypothesis (first line of cleaned content)
            hypothesis = cleaned_body.split('\n')[0].strip()
            if hypothesis.startswith('#'):
                # Remove markdown headers
                hypothesis = hypothesis.lstrip('#').strip()

            # 4. Construct the final markdown content
            final_content = f"# {hunt_id}\n\n"
            final_content += cleaned_body.replace("| [Leave blank] |", f"| {hunt_id}    |")

            # 5. Save the hunt file
            with open(out_md_path, "w") as f:
                f.write(final_content)
            logger.info(f"Successfully wrote hunt to {out_md_path}")

            # 6. Set the output for the GitHub Action
            if 'GITHUB_OUTPUT' in os.environ:
                with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
                    print(f'HUNT_FILE_PATH={out_md_path}', file=f)
                    print(f'HUNT_ID={hunt_id}', file=f)
                    print('HYPOTHESIS<<EOF', file=f)
                    print(hypothesis, file=f)
                    print('EOF', file=f)

            # 7. Run TTP diversity analysis and legacy duplicate detection
            diversity_analysis = "TTP diversity system used during generation"
            if TTP_DIVERSITY_AVAILABLE:
                logger.info("Getting TTP diversity statistics...")
                deduplicator = get_hypothesis_deduplicator()
                stats = deduplicator.ttp_checker.get_stats()
                diversity_analysis = f"""TTP Diversity Analysis:
- Total unique hypotheses in session: {stats.get('total_attempts', 0)}
- Unique tactics covered: {stats.get('unique_tactics', 0)}
- Unique techniques covered: {stats.get('unique_techniques', 0)}
- Tactics used: {', '.join(stats.get('tactics_used', []))}
- Generated with TTP diversity enforcement to prevent similar TTPs"""

            if DUPLICATE_DETECTION_AVAILABLE:
                logger.info("Running legacy duplicate detection...")
                duplicate_analysis = check_duplicates_for_new_submission(final_content, out_md_path.name)
                logger.info("Legacy duplicate detection complete.")
            else:
                duplicate_analysis = "⚠️ Legacy duplicate detection not available."

            # Add analysis results to GitHub output
            if 'GITHUB_OUTPUT' in os.environ:
                with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
                    print('TTP_DIVERSITY_ANALYSIS<<EOF', file=f)
                    print(diversity_analysis, file=f)
                    print('EOF', file=f)
                    print('DUPLICATE_ANALYSIS<<EOF', file=f)
                    print(duplicate_analysis, file=f)
                    print('EOF', file=f)
        else:
            logger.error("Could not generate hunt content. Skipping file creation.")
    else:
        logger.error("Could not retrieve CTI content. Skipping hunt generation.")

    # Log cache performance summary if Claude was used
    if AI_PROVIDER == "claude":
        log_cache_summary()
