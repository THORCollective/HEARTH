# Intel Submission Pipeline Refactor Design

**Date**: 2026-01-16
**Status**: Design Complete - Ready for Implementation
**Author**: Sydney (with Claude Sonnet 4.5)

## Executive Summary

Refactor the CTI submission automation from a monolithic script into a 5-stage pipeline with comprehensive error recovery, semantic deduplication, and human-in-the-loop approval.

**Problems Solved:**
- ✅ Reliability issues (workflow failures, content extraction problems)
- ✅ Missing features (better deduplication, review workflow, error recovery)
- ✅ Content extraction failures (especially Medium/Substack paywalls)
- ✅ Poor error recovery (no checkpoints, lost work on failure)

**Key Improvements:**
- 5-stage pipeline: Extract → Validate → Generate → Review → Commit
- State management via GitHub issue comments
- Semantic deduplication using embeddings
- Human approval via issue reactions before PR creation
- Comprehensive error recovery with checkpoints and retries
- Multi-hunt generation with options for human selection

---

## Table of Contents

1. [Current System Overview](#current-system-overview)
2. [Proposed Architecture](#proposed-architecture)
3. [Stage 1: Extract](#stage-1-extract)
4. [Stage 2: Validate](#stage-2-validate)
5. [Stage 3: Generate](#stage-3-generate)
6. [Stage 4: Review](#stage-4-review)
7. [Stage 5: Commit](#stage-5-commit)
8. [State Management](#state-management)
9. [Error Handling](#error-handling)
10. [Workflow Coordination](#workflow-coordination)
11. [Implementation Plan](#implementation-plan)

---

## Current System Overview

### Existing Components

**Scripts:**
- `scripts/generate_from_cti.py` - Monolithic CTI processor (~500+ lines)
- `scripts/process_hunt_submission.py` - Manual hunt formatter

**GitHub Actions:**
- `.github/workflows/issue-generate-hunts.yml` - Triggers on `intel-submission` label
- Runs single script end-to-end
- Limited error recovery (5 regeneration attempts max)

**Current Flow:**
```
Issue labeled → Extract content → Generate hunt → Commit directly to main
```

### Pain Points

1. **Reliability Issues:**
   - Multiple failure points in single monolithic script
   - No checkpoints - failure means complete restart
   - Silent failures from optional imports (`try/except` blocks)

2. **Content Extraction:**
   - Medium/Substack paywalls block extraction
   - PDF extraction inconsistent
   - No fallback strategies

3. **Missing Features:**
   - No human review before committing
   - Basic keyword deduplication (many false positives)
   - No way to resume from failure

4. **Error Recovery:**
   - Lost work on failure (re-extract, re-generate everything)
   - Poor error messages ("failed, try regenerate label")
   - No partial success handling

---

## Proposed Architecture

### Pipeline Stages

Replace monolithic script with 5 discrete stages:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Stage 1  │───▶│ Stage 2  │───▶│ Stage 3  │───▶│ Stage 4  │───▶│ Stage 5  │
│ Extract  │    │ Validate │    │ Generate │    │ Review   │    │ Commit   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │          Human approval       │
     ▼               ▼               ▼          (👍 reaction)        ▼
  Content       Quality check   AI generation   Wait for user    Create PR
  extraction    + dedup         + MITRE val     decision         with final ID
```

Each stage:
- ✅ Independent execution (can retry individually)
- ✅ Saves state before transitioning
- ✅ Has specific error handling
- ✅ Can be manually skipped if needed

### Key Principles

1. **State-driven progression** - Pipeline state stored in issue body
2. **Fail gracefully** - Save work, post clear errors, allow recovery
3. **Human checkpoints** - Review before committing
4. **Smart deduplication** - Semantic matching, not just keywords
5. **Multiple options** - Generate 2-3 hunt variations for selection

---

## Stage 1: Extract

**Purpose**: Pull content from CTI source (PDF, URL, or pasted text)

### Inputs
- Issue fields: `cti-source` (URL), `cti-content` (pasted text), `category` (dropdown)

### Extraction Strategy (Priority Order)

1. **User-pasted content** (highest priority)
   - If `cti-content` field has actual content → use directly
   - Skip all extraction, proceed to validation

2. **Medium/Substack URLs**
   - Use **Playwright** with stealth mode
   - Bypass paywalls using browser automation
   - Extract full article including all sections

3. **PDF URLs**
   - Download PDF to `.hearth/intel-drops/`
   - Extract text with PyPDF2
   - Handle multi-column layouts

4. **Generic URLs**
   - Try BeautifulSoup4 first (fast)
   - Fallback to Playwright if JS-heavy site

### Quality Checks

- Minimum 500 characters
- Contains security keywords (threat, attack, TTP, APT, malware, etc.)
- Not just error page HTML

### Output State

```json
{
  "stage": "validate",
  "status": "pending",
  "extract": {
    "content": "...(full extracted text)...",
    "source_url": "https://medium.com/...",
    "source_type": "medium",
    "method": "playwright",
    "char_count": 5420,
    "timestamp": "2026-01-16T12:00:00Z"
  }
}
```

### Error Handling

- **Retry**: 3 attempts with exponential backoff (5s, 15s, 45s)
- **Checkpoint**: Save URL and attempts
- **On failure**: Post error comment with:
  - What failed (paywall, PDF corruption, network timeout)
  - Content preview if partial extraction succeeded
  - Suggested fixes (paste content manually, different URL)

### Script Location
`scripts/pipeline/stage_extract.py`

---

## Stage 2: Validate

**Purpose**: Check content quality and detect duplicates using semantic matching

### Inputs
- State from Stage 1: `extracted_content`

### Validation Checks

1. **Content Quality**
   - Has threat intelligence markers (TTPs, IOCs, threat actors)
   - Contains actionable hunting ideas
   - Security-related (not marketing fluff)

2. **Semantic Deduplication** (NEW)

   **Old approach**: Keyword matching
   ```python
   # Simple string overlap - many false positives
   if "kerberoasting" in new_hunt and "kerberoasting" in existing_hunt:
       flag_duplicate()
   ```

   **New approach**: Embedding-based similarity
   ```python
   # Generate embeddings
   new_embedding = get_embedding(extracted_content)

   # Compare against cached embeddings of all existing hunts
   for hunt in existing_hunts:
       similarity = cosine_similarity(new_embedding, hunt.embedding)
       if similarity > 0.85:
           flag_duplicate(hunt.id, similarity)
   ```

   **Similarity thresholds:**
   - `> 0.85` = Duplicate - Stop pipeline, add `possible-duplicate` label, wait for human decision
   - `0.75 - 0.85` = Borderline - Post warning, continue anyway
   - `< 0.75` = Unique - Pass validation

   **Example catches:**
   ```
   Hunt A: "Detect Kerberoasting via event logs"
   Hunt B: "Monitor for Kerberos TGS requests indicating kerberoasting attacks"
   Similarity: 0.88 → Flagged as duplicate ✓
   ```

3. **Duplicate Handling**
   - If duplicate: Post comment with similarity score and closest match
   - Add `possible-duplicate` label
   - Stop pipeline - wait for maintainer to remove label (override) or close issue

### Output State

```json
{
  "stage": "generate",
  "status": "pending",
  "validation": {
    "quality_score": 0.92,
    "has_ttps": true,
    "has_actionable_content": true,
    "duplicate_check": {
      "is_duplicate": false,
      "closest_match": "H042",
      "similarity": 0.78,
      "method": "embedding"
    }
  },
  "timestamp": "2026-01-16T12:01:30Z"
}
```

### Error Handling

- **If embeddings API fails**: Fall back to keyword-based deduplication (current method)
- **If validation fails**: Post clear error ("Content too short", "Not security-related")
- **No retries**: Validation is deterministic, retrying won't help

### Script Location
`scripts/pipeline/stage_validate.py`

### Dependencies
- Embeddings API (Claude or OpenAI)
- Pre-computed embeddings cache: `.hearth/cache/hunt_embeddings.json`

---

## Stage 3: Generate

**Purpose**: Use AI to create well-formatted HEARTH hunts from validated CTI

### Inputs
- State from Stage 2: `extracted_content`, `validation_results`

### Generation Approach

**Two-step process** (better quality than single prompt):

1. **Step 1: Extract Elements**
   ```
   AI Prompt: "From this CTI, identify:
   - Threat actors mentioned
   - TTPs and techniques
   - Detection opportunities
   - MITRE ATT&CK techniques"

   Output: Structured elements
   ```

   **Checkpoint saved**: `extracted_elements`

2. **Step 2: Format Hunt**
   ```
   AI Prompt: "Using these elements, create a HEARTH hunt:
   - Use official HEARTH markdown template
   - Include Why section
   - Add implementation notes
   - Reference MITRE techniques"

   Output: Formatted markdown hunt
   ```

   **Checkpoint saved**: `draft_hunts`

### Multi-Hunt Generation (NEW)

Generate **2-3 hunt variations** from the same CTI:

**Example from APT29 WMI article:**
- Option 1: Focus on persistence detection (T1047)
- Option 2: Focus on lateral movement (T1021.006)
- Option 3: Focus on reconnaissance (T1047 + T1087)

Each with different:
- Detection angle
- MITRE technique
- Tactic focus

### MITRE ATT&CK Validation

```python
# Extract technique IDs from generated hunts
techniques = extract_technique_ids(hunt_content)  # ["T1047", "T1021.006"]

# Validate against MITRE data
for tech_id in techniques:
    tech_data = mitre.validate_technique(tech_id)
    if tech_data:
        tactic = mitre.get_technique_tactic(tech_id)
        # Auto-populate tactic field
```

If no valid technique found: Prompt AI to suggest one

### Hunt ID Placeholder

Use temporary IDs during generation:
- `H_PENDING_1`, `H_PENDING_2`, `H_PENDING_3`
- Final ID assigned in Stage 5 (avoids conflicts)

### Output State

```json
{
  "stage": "review",
  "status": "awaiting_approval",
  "generate": {
    "checkpoints": {
      "extracted_elements": {...},
      "draft_hunts": [...]
    },
    "generated_hunts": [
      {
        "option": 1,
        "title": "Detect APT29 WMI Persistence",
        "technique": "T1047",
        "tactic": "Persistence",
        "content": "...(full markdown)..."
      },
      {
        "option": 2,
        "title": "Monitor APT29 Lateral Movement via WMI",
        "technique": "T1021.006",
        "tactic": "Lateral Movement",
        "content": "...(full markdown)..."
      }
    ]
  },
  "timestamp": "2026-01-16T12:03:45Z"
}
```

### Error Handling

- **AI API timeout**: Retry 3x with backoff
- **Low quality output**: Retry with different temperature
- **Checkpoints**: Resume from last successful step
  - If element extraction succeeds but formatting fails → skip re-extraction
- **On final failure**: Save draft hunts to issue comment for manual review

### Script Location
`scripts/pipeline/stage_generate.py`

---

## Stage 4: Review

**Purpose**: Human-in-the-loop approval before committing to repository

### Workflow

1. **Bot posts draft hunts as issue comment**

   ```markdown
   ## 🔥 Generated Hunt Draft(s)

   I've processed the CTI and generated 2 hunt ideas below.
   React with 👍 on the hunt you want to approve, or 👎 to reject all.

   ---

   ### Option 1: Detect APT29 WMI Persistence
   **Category:** Flames (H_PENDING)
   **Tactic:** Persistence | **Technique:** T1047

   <details>
   <summary>📄 View full hunt markdown</summary>

   ```markdown
   [Full generated hunt content here...]
   ```
   </details>

   React: 👍 to approve this hunt

   ---

   ### Option 2: Monitor APT29 Lateral Movement via WMI
   **Category:** Flames (H_PENDING)
   **Tactic:** Lateral Movement | **Technique:** T1021.006

   <details>
   <summary>📄 View full hunt markdown</summary>

   ```markdown
   [Full generated hunt content here...]
   ```
   </details>

   React: 👍 to approve this hunt

   ---

   💡 **What happens next?**
   - React 👍 on ONE hunt option above to approve it
   - React 👎 on this comment to reject all and regenerate
   - Or add the `regenerate` label to try again with different prompting
   ```

2. **Pipeline pauses** - Waiting for reaction event

3. **Approval handling**

   **Trigger**: `on: issue_comment: types: [reaction_created]`

   **Action**:
   - Detect which option got 👍 (parse comment structure)
   - Update state: `"selected_option": 1`
   - Continue to Stage 5

4. **Rejection handling**

   **Trigger**: 👎 reaction on comment

   **Action**:
   - Post: "Hunt rejected. Add `regenerate` label to retry."
   - Stop pipeline
   - State remains at "review" stage

5. **Regeneration**

   **Trigger**: `regenerate` label added

   **Action**:
   - Go back to Stage 3 with different AI parameters
   - Track attempts (max 5 as in current system)
   - Increment attempt counter in state

### Output State

**Awaiting approval:**
```json
{
  "stage": "review",
  "status": "awaiting_approval",
  "review": {
    "comment_id": 123456789,
    "options_count": 2,
    "awaiting_reaction": true
  }
}
```

**After approval:**
```json
{
  "stage": "commit",
  "status": "pending",
  "review": {
    "selected_option": 1,
    "approved_by": "sydneypdx",
    "approved_at": "2026-01-16T12:10:00Z"
  }
}
```

### Timeout Handling

- **After 7 days**: Post reminder comment
- **After 14 days**: Auto-close issue with "Stale - no approval received"

### Script Location
`scripts/pipeline/stage_review.py`

---

## Stage 5: Commit

**Purpose**: Create PR with approved hunt using final hunt ID

### Workflow

1. **Read approved hunt from state**
   - Get `selected_option` from Stage 4
   - Retrieve corresponding hunt content

2. **Assign final hunt ID** (at PR creation time)

   **Why now?** Prevents ID conflicts when multiple hunts approved in parallel

   ```python
   # Read category from issue (default: Flames)
   category = read_category_from_issue() or "Flames"

   # Determine prefix and directory
   prefix, directory = {
       "Flames": ("H", "Flames/"),
       "Embers": ("E", "Embers/"),
       "Alchemy": ("M", "Alchemy/")
   }[category]

   # Scan directory for highest existing ID
   existing_ids = glob(f"{directory}{prefix}*.md")
   highest = max([int(f.stem[1:]) for f in existing_ids])

   # Assign next ID
   new_id = f"{prefix}{highest + 1:03d}"  # e.g., H062, E015, M008

   # Replace placeholder in hunt content
   hunt_content = hunt_content.replace("H_PENDING", new_id)
   ```

3. **Create feature branch**
   ```bash
   git checkout -b hunt/H062-apt29-wmi-persistence
   ```

4. **Write hunt file**
   ```python
   file_path = f"{directory}/{new_id}.md"
   write_file(file_path, hunt_content)
   validate_markdown(file_path)  # Final check
   ```

5. **Move source CTI to processed**
   ```python
   # If PDF was downloaded
   if source_pdf:
       move(
           ".hearth/intel-drops/report.pdf",
           f".hearth/processed-intel-drops/{new_id}-original.pdf"
       )
   ```

6. **Create commit**
   ```bash
   git add Flames/H062.md
   git commit -m "feat: Add H062 - Detect APT29 WMI Persistence

   Generated from CTI submission in issue #123
   Category: Flames
   Tactic: Persistence
   Technique: T1047

   Co-authored-by: @submitter-username"
   ```

7. **Create Pull Request**

   **Title**: `🔥 New Hunt: H062 - Detect APT29 WMI Persistence`

   **Body**:
   ```markdown
   ## 🔥 New Hunt: H062 - Detect APT29 WMI Persistence

   **Submitted by:** @sydneypdx (closes #123)
   **Category:** Flames
   **MITRE Tactic:** Persistence
   **MITRE Technique:** T1047 - Windows Management Instrumentation

   ### Summary
   This hunt detects APT29's use of WMI for persistence mechanisms...

   ### Generated from CTI
   - **Source:** https://medium.com/threat-intel/apt29-analysis
   - **Extraction method:** Playwright (bypassed paywall)
   - **Validation:** Passed semantic dedup (closest match: H042, similarity: 78%)
   - **AI Generation:** Claude Sonnet 4.5
   - **Human approval:** @sydneypdx approved Option 1 of 2

   ### Checklist
   - [x] Hunt ID assigned (H062)
   - [x] MITRE technique validated
   - [x] No duplicates detected
   - [x] Approved by maintainer
   - [ ] Final review before merge

   ---
   🤖 Auto-generated by HEARTH Intel Pipeline
   ```

   **Labels**: `auto-generated`, `intel-submission`, `flames`, `needs-review`

8. **Link back to original issue**
   ```markdown
   ✅ Hunt approved! Created PR #456

   View the pull request: https://github.com/THORCollective/HEARTH/pull/456

   The hunt will be merged to main after final review.
   ```

9. **Close or keep issue open**
   - Option A: Auto-close issue (PR link remains)
   - Option B: Keep open until PR merges

### Output State

```json
{
  "stage": "commit",
  "status": "completed",
  "pr": {
    "number": 456,
    "url": "https://github.com/THORCollective/HEARTH/pull/456",
    "branch": "hunt/H062-apt29-wmi-persistence",
    "hunt_id": "H062",
    "category": "Flames",
    "file_path": "Flames/H062.md"
  },
  "timestamp": "2026-01-16T12:15:00Z"
}
```

### Error Handling

- **Hunt ID collision detected**: Re-scan directory, try next ID
- **PR creation fails**: Save hunt content to issue comment (manual recovery)
- **File write fails**: Retry 3x, then post error with full markdown
- **Branch already exists**: Add timestamp suffix (`hunt/H062-apt29-1642348800`)

### Script Location
`scripts/pipeline/stage_commit.py`

---

## State Management

### Storage Method

**State stored as hidden HTML comment in issue body:**

```html
<!-- HEARTH-PIPELINE-STATE
{
  "version": "1.0",
  "stage": "review",
  "status": "awaiting_approval",
  "created_at": "2026-01-16T12:00:00Z",
  "updated_at": "2026-01-16T12:05:00Z",
  "extract": {...},
  "validation": {...},
  "generate": {...},
  "review": {...}
}
-->
```

**Why in issue body?**
- ✅ Survives workflow cancellations (not lost like job artifacts)
- ✅ Easy to inspect (view issue source in browser)
- ✅ Self-contained (everything in one place)
- ✅ No expiration (GitHub artifacts expire after 90 days)
- ✅ Can manually edit to fix/skip stages

### State Operations

**Read state:**
```python
def read_state_from_issue(issue_number):
    issue_body = github.get_issue_body(issue_number)
    match = re.search(r'<!-- HEARTH-PIPELINE-STATE\n(.+?)\n-->', issue_body, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    return {"stage": "extract", "status": "pending"}  # Default initial state
```

**Update state:**
```python
def update_state(issue_number, updates):
    current_state = read_state_from_issue(issue_number)
    current_state.update(updates)
    current_state["updated_at"] = datetime.now().isoformat()

    # Replace state comment in issue body
    new_comment = f"<!-- HEARTH-PIPELINE-STATE\n{json.dumps(current_state, indent=2)}\n-->"
    issue_body = github.get_issue_body(issue_number)

    if "HEARTH-PIPELINE-STATE" in issue_body:
        # Replace existing state
        new_body = re.sub(r'<!-- HEARTH-PIPELINE-STATE.+?-->', new_comment, issue_body, flags=re.DOTALL)
    else:
        # Append state to end of issue body
        new_body = issue_body + "\n\n" + new_comment

    github.update_issue_body(issue_number, new_body)
```

### State Transitions

```
Initial state (on label add):
{
  "stage": "extract",
  "status": "pending"
}

After Stage 1 completes:
{
  "stage": "validate",
  "status": "pending",
  "extract": {
    "content": "...",
    "source_url": "...",
    ...
  }
}

After Stage 2 completes:
{
  "stage": "generate",
  "status": "pending",
  "extract": {...},
  "validation": {...}
}

After Stage 3 completes:
{
  "stage": "review",
  "status": "awaiting_approval",
  "extract": {...},
  "validation": {...},
  "generate": {
    "generated_hunts": [...]
  }
}

After human approval:
{
  "stage": "commit",
  "status": "pending",
  "extract": {...},
  "validation": {...},
  "generate": {...},
  "review": {
    "selected_option": 1,
    "approved_by": "..."
  }
}

After Stage 5 completes:
{
  "stage": "commit",
  "status": "completed",
  "extract": {...},
  "validation": {...},
  "generate": {...},
  "review": {...},
  "pr": {
    "number": 456,
    ...
  }
}
```

### Manual State Editing

Maintainers can manually edit state for recovery:

1. View issue source (Edit issue → see HTML comment)
2. Modify JSON (change stage, clear errors, etc.)
3. Save issue
4. Re-trigger workflow (remove/add label)

**Example use cases:**
- Skip validation stage (change `"stage": "validate"` → `"stage": "generate"`)
- Reset to start (delete entire state comment)
- Fix extracted content (edit `extract.content` field)

---

## Error Handling

### Retry Strategy

**Automatic retries with exponential backoff:**

```python
def retry_with_backoff(func, max_attempts=3, base_delay=5):
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts:
                raise

            delay = base_delay * (3 ** (attempt - 1))  # 5s, 15s, 45s
            logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {delay}s...")
            time.sleep(delay)
```

**What gets retried:**
- ✅ API calls (Claude, OpenAI, embeddings)
- ✅ HTTP requests (content fetching, Playwright)
- ✅ File I/O operations

**What doesn't get retried:**
- ❌ Validation failures (deterministic, won't change)
- ❌ User input errors (missing fields, invalid format)
- ❌ Logic errors (duplicate detected, hunt too short)

### Checkpoint System

**Save progress at key points:**

```python
# Stage 3 example with checkpoints

def generate_hunts(content):
    state = read_state_from_issue()

    # Checkpoint 1: Extract elements
    if "checkpoint_1_elements" not in state:
        elements = extract_ttp_elements(content)  # AI call
        update_state({
            "checkpoint_1_elements": elements
        })
    else:
        elements = state["checkpoint_1_elements"]  # Resume

    # Checkpoint 2: Generate drafts
    if "checkpoint_2_drafts" not in state:
        drafts = format_hunts(elements)  # AI call
        update_state({
            "checkpoint_2_drafts": drafts
        })
    else:
        drafts = state["checkpoint_2_drafts"]  # Resume

    # Final step
    validated = validate_hunts(drafts)
    update_state({
        "stage": "review",
        "generated_hunts": validated
    })
```

**Recovery scenario:**
```
Run 1: Extract elements ✓ → Checkpoint saved → Format hunts → AI timeout ❌
Run 2: Resume → Skip extraction (use checkpoint) → Retry formatting ✓
```

### Partial Success Handling

**Save successful work even if later steps fail:**

```python
try:
    # Stage 1
    content = extract_content(url)
    update_state({
        "extract_status": "completed",
        "extracted_content": content  # SAVED ✓
    })

    # Stage 2 (might fail)
    validation = validate_content(content)

except ValidationError as e:
    # Content is saved, won't re-extract on retry
    update_state({
        "validation_status": "failed",
        "validation_error": str(e)
    })
    post_error_comment(...)
```

### Error Comment Template

**Clear, actionable error messages:**

```markdown
## ❌ Pipeline Failed: Stage 2 (Validate)

**Error:** Content validation failed
**Reason:** Extracted content is too short (245 characters, minimum 500 required)

### Extracted Content Preview:
```
[First 200 chars of what was extracted...]
```

### What Happened:
1. ✅ Content extraction succeeded (Playwright, Medium article)
2. ❌ Quality validation failed (content too short)

### How to Fix:
- **Option 1:** Check if the source URL is correct
- **Option 2:** Try pasting the full article content in the `cti-content` field
- **Option 3:** Add the `regenerate` label to retry extraction with different settings

### Recovery:
Your extracted content is saved in the pipeline state. Once you fix the issue, re-trigger by adding the `intel-submission` label again.

---
🤖 Error from stage_validate.py | Attempt 1/5
```

### Recovery Triggers

**Multiple ways to recover:**

1. **Automatic retry** (same stage)
   - Built into each stage script
   - Try operation → fail → wait → retry with backoff

2. **Manual re-trigger** (restart current stage)
   - Remove `intel-submission` label
   - Re-add label
   - Pipeline reads state → resumes from current stage

3. **Stage skip** (move to next stage manually)
   - Edit state comment: `"stage": "validate"` → `"stage": "generate"`
   - Re-trigger workflow
   - Skips problematic stage

4. **Full reset** (start over)
   - Delete state comment from issue body
   - Re-add `intel-submission` label
   - Pipeline starts fresh from Stage 1

### Failure Scenarios Matrix

| Failure Type | Retry? | Checkpoint? | Recovery Action |
|--------------|--------|-------------|-----------------|
| PDF download timeout | Yes (3x) | Yes (save URL) | Post error with manual download link |
| Paywall blocks extraction | Yes (try different method) | Yes (save attempts) | Suggest paste content manually |
| AI API rate limit | Yes (60s delay) | Yes (save prompt) | Wait and auto-retry |
| Duplicate detected (85%+) | No | Yes (save check result) | Stop, ask human override |
| Invalid MITRE technique | No | Yes (save hunt) | Continue with fallback, flag for review |
| PR creation fails | Yes (new branch name) | Yes (save hunt file) | Retry with timestamped branch |
| Network timeout | Yes (3x) | Yes | Exponential backoff retry |
| Validation fails | No | Yes | Post clear error, wait for fix |

---

## Workflow Coordination

### GitHub Actions Structure

```yaml
# .github/workflows/intel-pipeline.yml

name: Intel Submission Pipeline

on:
  issues:
    types: [labeled, unlabeled]
  issue_comment:
    types: [created]
  workflow_dispatch:
    inputs:
      issue_number:
        description: 'Issue number to process'
        required: true
      force_stage:
        description: 'Force specific stage (extract/validate/generate/review/commit)'
        required: false

jobs:
  determine_stage:
    runs-on: ubuntu-latest
    outputs:
      should_run: ${{ steps.check.outputs.should_run }}
      current_stage: ${{ steps.check.outputs.stage }}
      issue_number: ${{ steps.check.outputs.issue_number }}
    steps:
      - name: Check trigger and read state
        id: check
        uses: actions/github-script@v7
        with:
          script: |
            // Determine if we should run based on trigger
            let shouldRun = false;
            let issueNumber = null;

            // Trigger 1: intel-submission label added
            if (context.payload.action === 'labeled' &&
                context.payload.label.name === 'intel-submission') {
              shouldRun = true;
              issueNumber = context.payload.issue.number;
            }

            // Trigger 2: Reaction added (for approval)
            if (context.eventName === 'issue_comment' &&
                context.payload.action === 'created') {
              // Check if this is an approval reaction
              shouldRun = true;
              issueNumber = context.payload.issue.number;
            }

            if (!shouldRun) {
              core.setOutput('should_run', 'false');
              return;
            }

            // Read pipeline state from issue body
            const issue = await github.rest.issues.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issueNumber
            });

            const stateMatch = issue.data.body.match(/<!-- HEARTH-PIPELINE-STATE\n(.+?)\n-->/s);
            let stage = 'extract';  // Default

            if (stateMatch) {
              const state = JSON.parse(stateMatch[1]);
              stage = state.stage;
            }

            core.setOutput('should_run', 'true');
            core.setOutput('stage', stage);
            core.setOutput('issue_number', issueNumber);

  stage_extract:
    needs: determine_stage
    if: needs.determine_stage.outputs.should_run == 'true' &&
        needs.determine_stage.outputs.current_stage == 'extract'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          playwright install chromium
      - name: Run Stage 1 - Extract
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/pipeline/stage_extract.py \
            --issue ${{ needs.determine_stage.outputs.issue_number }}

  stage_validate:
    needs: determine_stage
    if: needs.determine_stage.outputs.should_run == 'true' &&
        needs.determine_stage.outputs.current_stage == 'validate'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Stage 2 - Validate
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/pipeline/stage_validate.py \
            --issue ${{ needs.determine_stage.outputs.issue_number }}

  stage_generate:
    needs: determine_stage
    if: needs.determine_stage.outputs.should_run == 'true' &&
        needs.determine_stage.outputs.current_stage == 'generate'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Stage 3 - Generate
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/pipeline/stage_generate.py \
            --issue ${{ needs.determine_stage.outputs.issue_number }}

  stage_review:
    needs: determine_stage
    if: needs.determine_stage.outputs.should_run == 'true' &&
        needs.determine_stage.outputs.current_stage == 'review'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Stage 4 - Review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/pipeline/stage_review.py \
            --issue ${{ needs.determine_stage.outputs.issue_number }}

  stage_commit:
    needs: determine_stage
    if: needs.determine_stage.outputs.should_run == 'true' &&
        needs.determine_stage.outputs.current_stage == 'commit'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run Stage 5 - Commit
        env:
          GITHUB_TOKEN: ${{ secrets.HEARTH_TOKEN }}
        run: |
          python scripts/pipeline/stage_commit.py \
            --issue ${{ needs.determine_stage.outputs.issue_number }}
```

### Stage Script Template

```python
#!/usr/bin/env python3
"""
Stage X: [Stage Name]
Purpose: [Brief description]
"""

import argparse
import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.pipeline.utils.state import read_state, update_state
from scripts.pipeline.utils.github import post_comment, add_label
from scripts.pipeline.utils.retry import retry_with_backoff
from hearth.utils.logging import get_logger

logger = get_logger()


def run_stage(issue_number: int):
    """
    Run Stage X processing.

    Args:
        issue_number: GitHub issue number
    """
    logger.info(f"Starting Stage X for issue #{issue_number}")

    # 1. Read current state
    state = read_state(issue_number)

    # 2. Validate we're in correct stage
    if state.get("stage") != "stage_x":
        logger.info("Not in stage_x, skipping")
        return

    if state.get("status") == "completed":
        logger.info("Stage already completed, skipping")
        return

    # 3. Mark as in-progress
    update_state(issue_number, {
        "stage": "stage_x",
        "status": "in_progress",
        "started_at": datetime.now().isoformat()
    })

    try:
        # 4. Do the work (with retries if applicable)
        result = retry_with_backoff(
            lambda: do_stage_work(state),
            max_attempts=3
        )

        # 5. Mark complete and transition to next stage
        update_state(issue_number, {
            "stage": "next_stage",
            "status": "pending",
            "stage_x_result": result,
            "completed_at": datetime.now().isoformat()
        })

        logger.info(f"Stage X completed successfully")

    except Exception as e:
        logger.error(f"Stage X failed: {e}", exc_info=True)

        # Save error state
        update_state(issue_number, {
            "status": "failed",
            "error": str(e),
            "failed_at": datetime.now().isoformat()
        })

        # Post error comment
        post_error_comment(issue_number, e, state)

        raise


def do_stage_work(state):
    """
    Actual stage processing logic.

    Args:
        state: Current pipeline state

    Returns:
        Stage result data
    """
    # Implementation here
    pass


def post_error_comment(issue_number, error, state):
    """Post helpful error comment to issue."""
    comment = f"""## ❌ Pipeline Failed: Stage X

**Error:** {error}

### What Happened:
[Explanation of what failed]

### How to Fix:
- **Option 1:** [Fix suggestion]
- **Option 2:** [Alternative fix]

### Recovery:
Re-trigger by removing and re-adding the `intel-submission` label.

---
🤖 Error from stage_x.py
"""
    post_comment(issue_number, comment)


def main():
    parser = argparse.ArgumentParser(description="Run Stage X")
    parser.add_argument("--issue", type=int, required=True, help="Issue number")
    args = parser.parse_args()

    run_stage(args.issue)


if __name__ == "__main__":
    main()
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal**: Set up pipeline infrastructure

**Tasks**:
1. Create directory structure:
   ```
   scripts/pipeline/
   ├── __init__.py
   ├── stage_extract.py
   ├── stage_validate.py
   ├── stage_generate.py
   ├── stage_review.py
   ├── stage_commit.py
   └── utils/
       ├── __init__.py
       ├── state.py          # State read/write functions
       ├── github.py         # GitHub API helpers
       ├── retry.py          # Retry logic
       └── content.py        # Content extraction utilities
   ```

2. Implement state management:
   - `read_state()` - Parse state from issue body
   - `update_state()` - Update state comment
   - Unit tests for state operations

3. Create GitHub Actions workflow:
   - `intel-pipeline.yml` with stage routing
   - Trigger on labels and reactions
   - Test with manual `workflow_dispatch`

4. Update issue template:
   - Add "Hunt Category" dropdown (Flames/Embers/Alchemy)
   - Default to Flames
   - Keep existing fields

**Deliverables**:
- ✅ Pipeline directory structure
- ✅ State management utilities tested
- ✅ GitHub Actions workflow skeleton
- ✅ Updated issue template

### Phase 2: Core Stages (Week 2)

**Goal**: Implement Stages 1, 2, 3

**Tasks**:
1. **Stage 1: Extract**
   - Playwright setup for paywall bypass
   - Content extraction strategies (paste > Playwright > BeautifulSoup > PDF)
   - Quality checks
   - Error handling and retries

2. **Stage 2: Validate**
   - Embeddings API integration (Claude or OpenAI)
   - Pre-compute embeddings for existing hunts
   - Semantic similarity comparison
   - Duplicate detection logic

3. **Stage 3: Generate**
   - Two-step AI generation (extract elements → format hunt)
   - Multi-hunt generation (2-3 options)
   - MITRE validation
   - Checkpoint system

**Deliverables**:
- ✅ Stages 1-3 implemented and tested
- ✅ Embeddings cache built
- ✅ MITRE validation working
- ✅ Error handling tested

### Phase 3: Review & Commit (Week 3)

**Goal**: Implement Stages 4 and 5

**Tasks**:
1. **Stage 4: Review**
   - Draft hunt posting logic
   - Reaction detection
   - Approval/rejection handling
   - Regeneration support

2. **Stage 5: Commit**
   - Hunt ID assignment at PR time
   - Category-based directory routing
   - PR creation with detailed body
   - Issue linking and closure

**Deliverables**:
- ✅ Stage 4 & 5 implemented
- ✅ End-to-end pipeline tested
- ✅ PR creation working

### Phase 4: Testing & Migration (Week 4)

**Goal**: Test thoroughly and migrate from old system

**Tasks**:
1. Integration testing:
   - Test full pipeline with real CTI sources
   - Test error recovery scenarios
   - Test duplicate detection accuracy

2. Documentation:
   - Update README with new pipeline explanation
   - Add troubleshooting guide
   - Document state management for maintainers

3. Migration:
   - Keep old workflow as fallback initially
   - Run new pipeline in parallel for 1 week
   - Monitor for issues
   - Deprecate old workflow after validation

4. Monitoring:
   - Track success/failure rates
   - Monitor API costs (embeddings)
   - Measure time to process submissions

**Deliverables**:
- ✅ Full integration tests passing
- ✅ Documentation complete
- ✅ Old workflow deprecated
- ✅ Monitoring in place

### Success Metrics

After implementation, measure:

1. **Reliability**:
   - Target: >90% success rate (vs current unknown rate)
   - Metric: Successful PR creations / total submissions

2. **Recovery Rate**:
   - Target: >80% of failures recover without manual intervention
   - Metric: Auto-recovered failures / total failures

3. **Duplicate Detection**:
   - Target: <10% false positive rate
   - Metric: Incorrectly flagged duplicates / total duplicate flags

4. **Time to Approval**:
   - Target: <24 hours median time from submission to PR
   - Metric: PR created timestamp - issue created timestamp

5. **Human Satisfaction**:
   - Target: >80% of generated hunts approved without regeneration
   - Metric: First approval / (first approval + regenerations)

---

## Appendices

### A. Issue Template Updates

Add to `.github/ISSUE_TEMPLATE/cti_submission.yml`:

```yaml
- type: dropdown
  id: hunt-category
  attributes:
    label: "Hunt Category"
    description: "Select the maturity level for this hunt"
    options:
      - "Flames (Default - New/Unvalidated hunts)"
      - "Embers (Partially validated)"
      - "Alchemy (Fully validated/Production-ready)"
    default: 0
  validations:
    required: false
```

### B. Dependencies

Add to `requirements.txt`:

```
# Existing dependencies
anthropic>=0.18.0
openai>=1.0.0
requests>=2.31.0
beautifulsoup4>=4.12.0
PyPDF2>=3.0.0
python-dotenv>=1.0.0

# New dependencies for pipeline
playwright>=1.40.0
numpy>=1.24.0  # For embeddings
scikit-learn>=1.3.0  # For cosine similarity
```

### C. Environment Variables

Add to GitHub Secrets:

```
ANTHROPIC_API_KEY - Claude API key
HEARTH_TOKEN - GitHub token with repo and PR permissions
```

### D. File Structure After Implementation

```
HEARTH/
├── .github/
│   ├── workflows/
│   │   ├── intel-pipeline.yml (NEW)
│   │   └── issue-generate-hunts.yml (DEPRECATED)
│   └── ISSUE_TEMPLATE/
│       └── cti_submission.yml (UPDATED)
├── scripts/
│   ├── pipeline/ (NEW)
│   │   ├── stage_extract.py
│   │   ├── stage_validate.py
│   │   ├── stage_generate.py
│   │   ├── stage_review.py
│   │   ├── stage_commit.py
│   │   └── utils/
│   │       ├── state.py
│   │       ├── github.py
│   │       ├── retry.py
│   │       └── content.py
│   ├── generate_from_cti.py (DEPRECATED)
│   └── process_hunt_submission.py (KEEP - for manual submissions)
├── .hearth/
│   ├── cache/
│   │   └── hunt_embeddings.json (NEW)
│   ├── intel-drops/
│   └── processed-intel-drops/
└── docs/
    └── plans/
        └── 2026-01-16-intel-pipeline-refactor-design.md (THIS DOC)
```

---

## Conclusion

This design transforms the CTI submission automation from a fragile monolithic script into a robust, recoverable pipeline with human oversight.

**Key Wins**:
- ✅ Reliability through stage isolation and checkpoints
- ✅ Better deduplication with semantic embeddings
- ✅ Human review before committing hunts
- ✅ Comprehensive error recovery
- ✅ Multi-hunt generation for better quality

**Next Steps**:
1. Review and approve this design
2. Create implementation plan in superpowers:writing-plans
3. Set up git worktree for isolated development
4. Begin Phase 1 implementation

---

**Questions or feedback?** Comment on the issue or PR where this design was proposed.
