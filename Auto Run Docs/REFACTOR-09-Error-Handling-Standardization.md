# Phase 09: Error Handling Standardization

This phase standardizes error handling across the codebase with a consistent error hierarchy and propagation strategy.

## Current State
- `scripts/exceptions.py` exists (64 lines) with custom exceptions
- Inconsistent error handling across scripts
- Mix of generic exceptions and custom errors

## Tasks

### Review Existing Error Handling
- [x] Read `scripts/exceptions.py` to understand current custom exceptions
- [x] Audit error handling patterns across Python scripts
- [x] Audit error handling patterns across JavaScript files
- [x] Identify common error scenarios

**Audit Summary:**
- **Python**: Custom exceptions defined but only 40% adoption rate. Generic `Exception` catches dominate. `validators.py` is best example. Critical gaps in database error handling and AI API error handling.
- **JavaScript**: No custom error classes. Minimal try/catch usage. XSS vulnerabilities in `hunt-renderer.js` and `modal-manager.js`. `notebook-generator.js` is best example with comprehensive error handling.
- **Common Error Scenarios**:
  1. AI API failures (rate limits, auth, timeouts) - both Python & JS
  2. File I/O errors (permissions, encoding, not found) - Python
  3. Database errors (connection, query, locks) - Python
  4. Parsing errors (JSON, markdown, malformed data) - both
  5. Validation errors (missing fields, invalid formats) - both
  6. Network errors (timeouts, connection failures) - both
  7. XSS vulnerabilities (unsafe HTML insertion) - JS
  8. Silent failures (no user feedback) - JS
  9. Missing error context (stack traces, parameters) - both
  10. Inconsistent error propagation (raise vs return) - both

### Enhance Python Exception Hierarchy
- [x] Expand `scripts/exceptions.py` with comprehensive error classes:
  - `HearthError` (base exception) ✓
  - `ParsingError` (hunt parsing failures) ✓
  - `MarkdownParsingError` (markdown parsing) ✓
  - `JSONParsingError` (JSON parsing) ✓
  - `ValidationError` (validation failures) ✓
  - `APIError` (AI API failures) ✓
  - `AIAnalysisError` (AI analysis failures) ✓
  - `DatabaseError` (SQLite errors) ✓
  - `DuplicateError` (duplicate detection errors) ✓
  - `MITREError` (MITRE ATT&CK errors) ✓
  - `FileProcessingError` (file I/O errors) ✓
  - `ConfigurationError` (config errors) ✓
  - `NetworkError` (network failures) ✓
  - `DataExportError` (export failures) ✓
- [x] Add meaningful error messages
- [x] Add error codes for programmatic handling (HE-1xxx through HE-9xxx ranges)
- [x] Add contextual information (file paths, line numbers, etc.)

**Implementation Notes:**
- Created comprehensive exception hierarchy with 14 exception classes
- Implemented error code system with ranges (HE-1xxx for parsing, HE-2xxx for validation, etc.)
- Each exception captures relevant context (file paths, line numbers, operation types, etc.)
- All exceptions include detailed docstrings explaining when to use them
- Created comprehensive test suite with 60 passing tests in `tests/unit/test_exceptions.py`
- Tests cover error codes, context information, message formatting, and inheritance hierarchy

### Create JavaScript Error Classes
- [x] Create `js/errors.js` module
- [x] Define error hierarchy:
  - `HearthError` (base class)
  - `FilterError` (filtering failures)
  - `RenderError` (rendering failures)
  - `APIError` (API request failures)
  - `ValidationError` (input validation)
  - `ParsingError` (parsing failures)
  - `NetworkError` (network failures)
- [x] Add error codes and messages

**Implementation Notes:**
- Created comprehensive JavaScript error hierarchy with 7 error classes
- Each class follows the same pattern as Python exceptions with error codes (HE-1xxx through HE-9xxx)
- Added helper functions: `getUserFriendlyMessage()` and `logError()` for consistent error handling
- All error classes include detailed JSDoc documentation
- Implemented comprehensive test suite with 30 passing tests in `tests/unit/test_errors_js.mjs`
- Tests cover error codes, context information, inheritance, and helper functions
- Updated `package.json` to `"type": "module"` to support ES6 imports

### Standardize Python Error Handling
- [x] Update `generate_from_cti.py` to use custom exceptions
- [x] Update parsers to throw `ParsingError` with context
- [x] Update validators to throw `ValidationError`
- [x] Update MITRE integration to throw `MITREError`
- [ ] Update database operations to throw `DatabaseError`
- [ ] Add try/except blocks with proper error propagation

**Implementation Notes (generate_from_cti.py):**
- Replaced generic `ImportError` and `ValueError` with `ConfigurationError` for missing dependencies and API keys (HE-8001, HE-8002)
- Replaced generic `Exception` catches in AI operations with `AIAnalysisError` for chunk summarization, final summary generation, and hunt content generation
- Replaced generic exceptions in file operations with `FileProcessingError` for PDF reading (HE-7002), text file reading (HE-7003), and missing CTI files (HE-7004)
- Added proper exception re-raising to avoid wrapping custom exceptions multiple times
- All error handlers now include contextual information (file paths, operation types, causes)
- Verified syntax correctness and exception imports

**Implementation Notes (Parsers):**
- Updated `hunt_parser_utils.py`:
  - Enhanced `find_hunt_files()` to raise `FileProcessingError` with operation context for directory scanning errors
  - Added error handling to `clean_markdown_formatting()` to raise `MarkdownParsingError` on AttributeError/TypeError
  - Added error handling to `extract_submitter_info()` to raise `MarkdownParsingError` on regex/parsing errors
  - Enhanced `extract_content_section()` with validation and proper `MarkdownParsingError` raising
  - Added error handling to `parse_tag_list()` to raise `MarkdownParsingError` on parsing failures
- Updated `hunt_parser.py`:
  - Modified `parse_hunt_file()` to re-raise custom exceptions and wrap unexpected errors in `MarkdownParsingError`
  - Enhanced `_extract_table_data()` to raise `MarkdownParsingError` when table header missing or insufficient cells
  - Updated `_extract_content_sections()` to properly propagate custom exceptions
  - Removed `_get_empty_table_data()` method (no longer needed with exception-based error handling)
  - Enhanced `process_all_hunts()` to track and log parsing errors while continuing to process remaining files
  - Added `parse_errors` list to collect errors during batch processing with summary logging
  - Added import for `ValidationError` to handle validation exceptions properly
- Updated test suite (`test_hunt_parser.py`):
  - Modified `test_parse_hunt_file_with_error` to expect `MarkdownParsingError` instead of `None`
  - Updated `test_extract_table_data_no_table` to expect `MarkdownParsingError` exception
  - Added `test_extract_table_data_insufficient_cells` to test insufficient cell error handling
  - Updated `test_process_all_hunts_with_errors` to use `MarkdownParsingError` in mock
- All parser error tests passing; parser works correctly with production data (78 hunt files processed successfully)

**Implementation Notes (Validators):**
- Enhanced `validators.py` with specific error codes for each validation scenario:
  - HE-2001: Hunt ID is empty or not a string
  - HE-2002: Hunt ID format is invalid (doesn't match pattern)
  - HE-2003: Tactics must be string or list
  - HE-2004: Tags must be string or list
  - HE-2005: URL is empty or not a string
  - HE-2006: URL missing scheme or netloc
  - HE-2007: URL scheme must be http or https
  - HE-2008: File path is empty
  - HE-2009: File does not exist
  - HE-2010: Hunt data must be a dictionary
  - HE-2011: Required field is missing or empty
  - HE-2099: Generic validation error (for unexpected errors)
- Fixed regex bug in `validate_tags()`: changed `r'#?\\w+'` to `r'#?\w+'` to correctly parse tags
- All validation methods now include proper error codes and contextual information
- Created comprehensive test suite with 42 passing tests in `tests/unit/test_validators.py`:
  - Tests for all validation methods (hunt_id, tactics, tags, url, file_path, hunt_data)
  - Tests for error code uniqueness and proper HE-2xxx range
  - Tests for edge cases and error conditions
  - Tests for context information in exceptions
- All validators already used `ValidationError` exceptions; enhancement focused on adding specific error codes
- Validators work correctly with production data and all tests pass

**Implementation Notes (MITRE Integration):**
- Updated `scripts/mitre_attack.py` to use `MITREError` exceptions with specific error codes (HE-6xxx range):
  - HE-6001: MITRE ATT&CK data file not found
  - HE-6002: Failed to parse MITRE ATT&CK JSON data
  - HE-6003: Failed to load MITRE ATT&CK data (generic load error)
  - HE-6004: Failed to process MITRE ATT&CK data (processing error)
  - HE-6005: Technique ID must be a string (type validation)
  - HE-6006: Search query must be a string (type validation)
  - HE-6007: Search query cannot be empty (value validation)
  - HE-6008: Tactic must be a string (type validation)
  - HE-6009: Tactic cannot be empty (value validation)
  - HE-6010: Description must be a string for inference (type validation)
  - HE-6011: Description cannot be empty for inference (value validation)
- Replaced `FileNotFoundError` in `_load_data()` with `MITREError` (HE-6001) with operation context
- Added comprehensive error handling for JSON parsing and data processing in `_load_data()`
- Added input validation to `validate_technique()`, `search_techniques_by_name()`, `get_techniques_by_tactic()`, and `infer_technique_from_description()`
- All error messages include contextual information (technique IDs, tactics, operations, etc.)
- Created comprehensive test suite with 20 passing tests in `tests/unit/test_mitre_attack.py`:
  - Tests for all error scenarios (missing file, invalid JSON, type errors, empty values)
  - Tests for error code uniqueness and proper HE-6xxx range
  - Tests for context information in exceptions
  - Tests for functional behavior with valid data
- Manual integration testing confirms MITRE module works correctly with production data (45MB enterprise-attack.json)
- All error handling maintains backward compatibility (invalid formats return None, only truly exceptional cases raise exceptions)

### Standardize JavaScript Error Handling
- [ ] Update hunt filtering to use custom errors
- [ ] Update rendering code to use custom errors
- [ ] Add try/catch blocks with proper error propagation
- [ ] Display user-friendly error messages

### Add Error Recovery
- [ ] Implement retry logic for transient errors (API failures)
- [ ] Add fallback mechanisms where appropriate
- [ ] Implement graceful degradation

### Improve Error Messages
- [ ] Ensure all error messages are clear and actionable
- [ ] Include context (what was being attempted)
- [ ] Suggest fixes when possible
- [ ] Avoid technical jargon in user-facing messages

### Add Error Logging
- [ ] Log all errors with full stack traces
- [ ] Include relevant context in logs
- [ ] Use appropriate log levels (ERROR for errors, WARNING for recoverable issues)

### Update GitHub Actions Error Handling
- [ ] Review workflow error handling
- [ ] Use proper exit codes
- [ ] Add error annotations for GitHub UI
- [ ] Implement proper failure notifications

### Testing
- [ ] Create tests for error scenarios
- [ ] Test error propagation
- [ ] Test error messages
- [ ] Test recovery mechanisms
- [ ] Verify errors are logged correctly

### Documentation
- [ ] Document error hierarchy and when to use each error type
- [ ] Document error codes
- [ ] Add error handling examples to developer documentation
- [ ] Update README with troubleshooting section

### Cleanup
- [ ] Commit changes with message: "refactor: standardize error handling with custom exception hierarchy"
