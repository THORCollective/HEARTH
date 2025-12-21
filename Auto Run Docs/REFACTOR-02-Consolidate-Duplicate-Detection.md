# Phase 02: Consolidate Duplicate Detection Logic

This phase merges two duplicate detection implementations into a single, well-structured module.

## Current State
- `scripts/duplicate_detection.py` (528 lines)
- `scripts/duplicate_detection_improved.py` (261 lines)
- Overlapping functionality, unclear which to use

## Tasks

### Analysis
- [x] Read and compare `scripts/duplicate_detection.py` and `scripts/duplicate_detection_improved.py`
- [x] Identify overlapping functions and unique features in each file
- [x] Determine which implementation has better performance/accuracy
- [x] Check which file is actually used in GitHub Actions workflows

**Analysis Results:**
- `duplicate_detection.py` (528 lines): Database-backed with fallback, dual-mode (AI + Enhanced similarity), comprehensive
- `duplicate_detection_improved.py` (261 lines): File-based only, enhanced similarity only, simpler
- **Overlapping:** `get_all_existing_hunts()`, `extract_hunt_info()`, `check_duplicates_for_new_submission()`, `check_duplicates_with_enhanced_similarity()`, `generate_enhanced_duplicate_comment()`
- **Unique to main:** Database support, AI-based detection, `hypothesis_deduplicator` integration
- **Unique to improved:** Graceful OpenAI degradation, simpler direct similarity scoring
- **Performance winner:** `duplicate_detection.py` (database support = 10ms vs slower file-based)
- **Actually used:** `duplicate_detection.py` (imported by `generate_from_cti.py` and test files)
- **Recommendation:** Keep `duplicate_detection.py` as base, deprecate `duplicate_detection_improved.py`

### Consolidation
- [ ] Create new `scripts/duplicate_detector.py` with unified implementation
- [ ] Implement `DuplicateDetector` class with clear interface
- [ ] Use strategy pattern for different detection methods (exact, fuzzy, semantic)
- [ ] Migrate best features from both implementations
- [ ] Add comprehensive docstrings and type hints

### Testing
- [ ] Create `tests/unit/test_duplicate_detector.py` with unit tests
- [ ] Test exact match detection
- [ ] Test fuzzy matching with various thresholds
- [ ] Test edge cases (empty inputs, identical hunts, near-duplicates)
- [ ] Verify all tests pass

### Migration
- [ ] Update GitHub Actions workflows to use new `duplicate_detector.py`
- [ ] Update any scripts that import old duplicate detection modules
- [ ] Delete old `duplicate_detection.py` and `duplicate_detection_improved.py`

### Cleanup
- [ ] Commit changes with message: "refactor: consolidate duplicate detection into single module"
