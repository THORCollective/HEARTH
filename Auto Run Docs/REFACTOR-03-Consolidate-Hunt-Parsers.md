# Phase 03: Consolidate Hunt Parsers

This phase merges multiple hunt parser implementations into a single, well-structured module.

## Current State
- `scripts/parse_hunts.py` (190 lines)
- `scripts/hunt_parser.py`
- `scripts/hunt_parser_utils.py`
- `scripts/simple_hunt_parser.py`
- Multiple implementations with unclear responsibilities

## Tasks

### Analysis
- [x] Read all hunt parser files to understand their purposes
- [x] Identify which parser is used in production workflows
- [x] Map out all parsing functions and their unique features
- [x] Check dependencies - what imports these parsers?

**Analysis Notes:**
- `parse_hunts.py` (190 lines): Simple production parser used by `update-hunts.yml`, generates `hunts-data.js`
- `hunt_parser.py` (340+ lines): Object-oriented parser with HuntData dataclass, validators, exporters (JSON/JS), used by tests and leaderboard
- `hunt_parser_utils.py` (189 lines): Shared utilities used by both parsers - table parsing, submitter extraction, tag parsing
- `simple_hunt_parser.py` (30 lines): Test file only, imports logger/config for testing, not used in production

**Dependencies:**
- Production: `parse_hunts.py` → `hunt_parser_utils.py`
- Leaderboard: `generate_leaderboard.py` → `hunt_parser_utils.py`
- Tests: `test_runner.py` → `hunt_parser.py` → `hunt_parser_utils.py`
- Both main parsers share `hunt_parser_utils.py`

**Recommendation:**
- Keep `hunt_parser.py` as the unified implementation (already well-structured with OOP, validation, error handling)
- Migrate `parse_hunts.py` usage to `hunt_parser.py`
- Keep `hunt_parser_utils.py` as shared utilities
- Delete `simple_hunt_parser.py` (test-only file)

### Design
- [ ] Design unified `HuntParser` class with clear API
- [ ] Plan adapter pattern for different input formats (markdown, JSON, HTML)
- [ ] Define clear data structures for parsed hunt objects

### Implementation
- [ ] Create new `scripts/hunt_parser.py` with unified implementation
- [ ] Implement `HuntParser` class with main `parse()` method
- [ ] Add support for markdown parsing (primary format)
- [ ] Add support for JSON parsing (if needed)
- [ ] Migrate utility functions to `HuntParserUtils` helper class
- [ ] Add comprehensive docstrings and type hints

### Testing
- [ ] Create `tests/unit/test_hunt_parser.py` with unit tests
- [ ] Test parsing of valid hunt markdown files
- [ ] Test parsing of malformed inputs
- [ ] Test extraction of metadata (ID, title, MITRE techniques, etc.)
- [ ] Test edge cases (missing fields, invalid formatting)
- [ ] Verify all tests pass

### Migration
- [ ] Update scripts that import old parsers to use new unified parser
- [ ] Update GitHub Actions workflows if needed
- [ ] Delete old parser files after migration is complete

### Cleanup
- [ ] Commit changes with message: "refactor: consolidate hunt parsers into single module"
