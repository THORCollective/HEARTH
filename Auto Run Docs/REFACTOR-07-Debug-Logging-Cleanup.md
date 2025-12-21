# Phase 07: Debug Logging Cleanup

This phase removes or replaces debug logging statements with proper logging infrastructure.

## Current State
- 644 occurrences of `console.log` and `print()` statements
- Many appear to be debugging code left in production
- No consistent logging strategy

## Tasks

### Python Logging Setup
- [x] Verify `scripts/logger_config.py` is properly configured
- [x] Ensure logger is using appropriate levels (DEBUG, INFO, WARNING, ERROR)
- [x] Add environment variable to control log level (default: INFO for production)
  - Added LOG_LEVEL environment variable support (defaults to INFO)
  - Logger now supports DEBUG, INFO, WARNING, ERROR, and CRITICAL levels
  - Console handler respects environment variable setting
  - File handler always logs DEBUG and above for complete records

### Python Scripts - Replace Debug Prints
- [x] Search for all `print()` statements in `scripts/` directory
- [x] Categorize prints by purpose (debug, info, warning, error)
- [x] Replace debug prints with `logger.debug()`
- [x] Replace info prints with `logger.info()`
- [x] Replace warning prints with `logger.warning()`
- [x] Replace error prints with `logger.error()`
- [x] Remove prints that are purely for debugging
  - Replaced print() statements in 9 Python scripts
  - Files updated: build_hunt_database.py, hunt_parser.py, process_hunt_submission.py, duplicate_detector.py, hypothesis_deduplicator.py, generate_leaderboard.py, mitre_attack.py, generate_from_cti.py, ttp_diversity_checker.py
  - Categorized and replaced ~100+ print() statements with appropriate logger levels
  - Removed emojis from log messages for cleaner output
  - Preserved print() statements that write to files (GitHub Actions output)

### JavaScript Logging Setup
- [x] Create `js/logger.js` module for structured logging
- [x] Implement log levels (debug, info, warn, error)
- [x] Add environment detection (dev vs production)
- [x] Disable debug logs in production
  - Created comprehensive logger module at js/logger.js
  - Implements DEBUG, INFO, WARN, and ERROR log levels
  - Auto-detects environment: localhost/file protocol = DEBUG mode, production = INFO mode
  - Supports manual override via window.HEARTH_LOG_LEVEL or ?debug query parameter
  - Provides getLogger(name) factory function for module-specific loggers
  - Includes timestamp and module name in all log messages
  - Debug logs automatically disabled in production environments

### JavaScript - Replace Console Logs
- [x] Search for all `console.log()` statements in JavaScript files
- [x] Categorize logs by purpose (debug, info, warn, error)
- [x] Replace with appropriate logger methods
- [x] Remove logs that are purely for debugging
- [x] Keep essential error logging with `logger.error()`
  - Replaced console statements in 4 JavaScript files
  - Files updated: js/utils.js (1 error), chat-widget.js (3 warnings), js/preset-manager.js (2 warnings), js/notebook-generator.js (3 statements: 1 error, 2 warnings)
  - Converted chat-widget.js to ES6 module for consistency with codebase standards
  - Updated index.html and test-chat-widget.html to load chat-widget.js as a module
  - All user-facing console statements now use the logger infrastructure
  - Logger implementation in js/logger.js correctly uses console methods internally

### GitHub Actions Workflows
- [x] Review logging in workflow files
- [x] Ensure proper use of GitHub Actions logging (::debug, ::notice, ::warning, ::error)
- [x] Add log groups for better organization
  - Updated 8 workflow files with proper GitHub Actions logging commands
  - Files updated: issue-generate-hunts.yml, pr-from-approval.yml, update-hunt-database.yml, tests.yml, update_leaderboard.yml, generate-notebook.yml, process-manual-issue.yml
  - Replaced echo statements with ::notice::, ::debug::, ::warning::, ::error:: commands
  - Replaced console.log in github-script actions with core.info(), core.debug(), core.error()
  - Added ::group:: and ::endgroup:: commands to organize output into collapsible sections
  - Improved error handling with proper error logging in JavaScript actions
  - Added contextual debug messages for better troubleshooting
  - All workflows now follow GitHub Actions logging best practices

### Testing
- [x] Verify essential information is still logged
- [x] Test that debug logs don't appear in production
- [x] Verify error logging still works correctly
- [x] Check log output format is readable
  - All logging tests passed successfully
  - Python logger: Properly respects LOG_LEVEL environment variable (defaults to INFO)
  - JavaScript logger: Environment-aware (DEBUG on localhost, INFO in production)
  - Debug logs correctly suppressed in production (INFO level)
  - Error logging includes full tracebacks when using logger.exception()
  - Log format is readable and consistent:
    - Console: `YYYY-MM-DD HH:MM:SS - logger_name - LEVEL - message`
    - File: `YYYY-MM-DD HH:MM:SS - logger_name - LEVEL - filename:line - message`
  - Test results documented in Auto Run Docs/Working/LOGGING_TEST_RESULTS.md
  - Created test scripts:
    - test_logging.py (Python logger tests)
    - test_logging.html (JavaScript logger tests)
    - test_error_logging.py (Error logging verification)

### Documentation
- [x] Document logging strategy in README or docs
- [x] Document how to enable debug logging for development
- [x] Document log levels and when to use each
  - Created comprehensive logging guide at docs/LOGGING.md
  - Documents Python, JavaScript, and GitHub Actions logging
  - Includes environment detection, log levels, best practices, and troubleshooting
  - Added reference to logging guide in README.md
  - Added LOG_LEVEL environment variable to Configuration section

### Cleanup
- [ ] Commit changes with message: "refactor: replace debug logging with proper logging infrastructure"
