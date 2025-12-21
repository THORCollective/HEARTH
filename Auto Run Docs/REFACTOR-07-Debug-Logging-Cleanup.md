# Phase 07: Debug Logging Cleanup

This phase removes or replaces debug logging statements with proper logging infrastructure.

## Current State
- 644 occurrences of `console.log` and `print()` statements
- Many appear to be debugging code left in production
- No consistent logging strategy

## Tasks

### Python Logging Setup
- [ ] Verify `scripts/logger_config.py` is properly configured
- [ ] Ensure logger is using appropriate levels (DEBUG, INFO, WARNING, ERROR)
- [ ] Add environment variable to control log level (default: INFO for production)

### Python Scripts - Replace Debug Prints
- [ ] Search for all `print()` statements in `scripts/` directory
- [ ] Categorize prints by purpose (debug, info, warning, error)
- [ ] Replace debug prints with `logger.debug()`
- [ ] Replace info prints with `logger.info()`
- [ ] Replace warning prints with `logger.warning()`
- [ ] Replace error prints with `logger.error()`
- [ ] Remove prints that are purely for debugging

### JavaScript Logging Setup
- [ ] Create `js/logger.js` module for structured logging
- [ ] Implement log levels (debug, info, warn, error)
- [ ] Add environment detection (dev vs production)
- [ ] Disable debug logs in production

### JavaScript - Replace Console Logs
- [ ] Search for all `console.log()` statements in JavaScript files
- [ ] Categorize logs by purpose (debug, info, warn, error)
- [ ] Replace with appropriate logger methods
- [ ] Remove logs that are purely for debugging
- [ ] Keep essential error logging with `logger.error()`

### GitHub Actions Workflows
- [ ] Review logging in workflow files
- [ ] Ensure proper use of GitHub Actions logging (::debug, ::notice, ::warning, ::error)
- [ ] Add log groups for better organization

### Testing
- [ ] Verify essential information is still logged
- [ ] Test that debug logs don't appear in production
- [ ] Verify error logging still works correctly
- [ ] Check log output format is readable

### Documentation
- [ ] Document logging strategy in README or docs
- [ ] Document how to enable debug logging for development
- [ ] Document log levels and when to use each

### Cleanup
- [ ] Commit changes with message: "refactor: replace debug logging with proper logging infrastructure"
