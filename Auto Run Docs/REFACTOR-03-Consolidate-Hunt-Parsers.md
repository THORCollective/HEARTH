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
- [ ] Read all hunt parser files to understand their purposes
- [ ] Identify which parser is used in production workflows
- [ ] Map out all parsing functions and their unique features
- [ ] Check dependencies - what imports these parsers?

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
