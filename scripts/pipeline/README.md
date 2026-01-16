# Intel Submission Pipeline

5-stage pipeline for processing CTI submissions into HEARTH hunts with human-in-the-loop approval.

## Architecture

```
Extract → Validate → Generate → Review → Commit
   ↓          ↓          ↓         ↓        ↓
Content   Quality   AI Hunt   Human    Create PR
fetch     check     creation  approval  with final ID
```

## Pipeline Stages

1. **Extract** (`stage_extract.py`) - Pull content from CTI source (PDF, URL, pasted text)
2. **Validate** (`stage_validate.py`) - Quality checks + semantic deduplication
3. **Generate** (`stage_generate.py`) - AI-powered hunt creation with MITRE validation
4. **Review** (`stage_review.py`) - Human approval via issue reactions
5. **Commit** (`stage_commit.py`) - Create PR with assigned hunt ID

## State Management

State is stored as HTML comment in GitHub issue body:

```html
<!-- HEARTH-PIPELINE-STATE
{
  "version": "1.0",
  "stage": "validate",
  "status": "completed",
  "extract": {...},
  "validation": {...}
}
-->
```

**State transitions:**
- Each stage reads state → does work → updates state → triggers next stage
- State persists across workflow runs (survives GitHub Actions timeouts)
- Can be manually edited for recovery

## Utilities

**`utils/state.py`**
- `read_state(issue_body)` - Parse state from issue
- `update_state(issue_body, updates)` - Merge updates and save

**`utils/github.py`**
- `get_issue(repo, number)` - Get issue object
- `update_issue_body(repo, number, body)` - Update issue
- `post_comment(repo, number, text)` - Post comment
- `add_label(repo, number, label)` - Add label

**`utils/retry.py`**
- `retry_with_backoff(func, max_attempts, base_delay)` - Exponential backoff retry

## Testing

Run all pipeline tests:

```bash
python -m pytest tests/pipeline/ -v
```

Test specific utility:

```bash
python -m pytest tests/pipeline/utils/test_state.py -v
```

## Running Stages Locally

```bash
# Stage 1: Extract
python scripts/pipeline/stage_extract.py --repo owner/repo --issue 123

# Stage 2: Validate
python scripts/pipeline/stage_validate.py --repo owner/repo --issue 123

# ... etc
```

## Error Handling

**Automatic retries:** API calls retry 3x with exponential backoff (5s, 15s, 45s)

**Checkpoints:** Stages save progress at key points - can resume from checkpoint

**Error comments:** Clear error messages posted to issue with recovery instructions

**Recovery:** Remove and re-add `intel-submission` label to retry current stage

## Development

See `stage_template.py` for reference implementation of a pipeline stage.

All stages follow this pattern:
1. Read current state
2. Validate we're in correct stage
3. Mark in-progress
4. Do work (with retries)
5. Update state and transition to next stage
6. On error: save error state, post comment, raise

## Design Document

See `docs/plans/2026-01-16-intel-pipeline-refactor-design.md` for complete architecture.
