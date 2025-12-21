# HEARTH Logging Guide

This guide explains HEARTH's logging infrastructure and how to use it effectively for development and troubleshooting.

## Overview

HEARTH uses a structured logging system across both Python backend scripts and JavaScript frontend code. The logging infrastructure provides:

- **Environment-aware log levels**: Automatically adjusts verbosity based on environment
- **Consistent formatting**: Standardized log output across all components
- **Multiple outputs**: Console output for real-time monitoring, file output for historical analysis
- **Performance**: Debug logs are automatically disabled in production to reduce overhead

---

## Python Logging

### Architecture

Python scripts use a centralized logger defined in `scripts/logger_config.py`. This singleton logger ensures consistent configuration across all backend operations.

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **DEBUG** | Detailed diagnostic information for troubleshooting | Variable values, loop iterations, intermediate calculations |
| **INFO** | Confirmation that things are working as expected | "Hunt processed successfully", "Database updated" |
| **WARNING** | Something unexpected happened, but the application continues | "Deprecated field used", "Missing optional parameter" |
| **ERROR** | A serious problem that prevented a function from executing | "Failed to parse CTI content", "Database query failed" |
| **CRITICAL** | A severe error that may cause the application to abort | "Cannot connect to database", "Required API key missing" |

### Usage in Python Scripts

```python
from scripts.logger_config import get_logger

# Get logger instance
logger = get_logger()

# Log at different levels
logger.debug("Processing hunt with ID: %s", hunt_id)
logger.info("Successfully generated hunt from CTI")
logger.warning("Hunt title exceeds recommended length: %d characters", len(title))
logger.error("Failed to validate MITRE technique: %s", technique_id)

# Log exceptions with full traceback
try:
    process_hunt(data)
except Exception as e:
    logger.exception("Unexpected error processing hunt")
```

### Configuration

The Python logger can be configured using the `LOG_LEVEL` environment variable:

```bash
# Development: Show all logs including DEBUG
export LOG_LEVEL=DEBUG

# Production: Show INFO and above (default)
export LOG_LEVEL=INFO

# Troubleshooting: Show only warnings and errors
export LOG_LEVEL=WARNING
```

**Default behavior:**
- **Console output**: Respects `LOG_LEVEL` environment variable (defaults to INFO)
- **File output**: Always logs DEBUG and above to `logs/hearth_YYYYMMDD.log`

### Log Output Formats

**Console format:**
```
2025-12-20 14:30:45 - hearth - INFO - Hunt processed successfully
```

**File format (includes file and line number):**
```
2025-12-20 14:30:45 - hearth - INFO - process_hunt_submission.py:127 - Hunt processed successfully
```

---

## JavaScript Logging

### Architecture

Frontend code uses a module-based logger defined in `js/logger.js`. This logger automatically detects the execution environment and adjusts log levels accordingly.

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **DEBUG** | Detailed diagnostic information (development only) | "Loaded 150 hunt records", "Filter state updated" |
| **INFO** | General informational messages | "Hunt database loaded", "Search query executed" |
| **WARN** | Recoverable issues or deprecation notices | "Failed to load preset, using defaults", "Browser feature not supported" |
| **ERROR** | Errors that impact functionality | "Failed to generate notebook", "Invalid hunt data" |

### Usage in JavaScript

```javascript
// Import logger for your module
import { getLogger } from './js/logger.js';
const logger = getLogger('HuntFilter');

// Log at different levels
logger.debug('Filter criteria:', filterState);
logger.info('Hunt database loaded successfully');
logger.warn('Unable to load saved presets, using defaults');
logger.error('Error generating notebook:', error);

// For backward compatibility, you can also use the default logger
import { logger } from './js/logger.js';
logger.info('Application initialized');
```

### Environment Detection

The JavaScript logger automatically detects the environment and sets appropriate log levels:

| Environment | Log Level | How Detected |
|-------------|-----------|--------------|
| **Development** | DEBUG | `localhost`, `127.0.0.1`, `file://` protocol, or `?debug` query parameter |
| **Production** | INFO | GitHub Pages or other production domains |

### Manual Log Level Control

You can override the automatic log level detection:

```javascript
// Set globally before any loggers are created
window.HEARTH_LOG_LEVEL = 'DEBUG';

// Or dynamically change log level
logger.setLevel('DEBUG');

// Check current log level
console.log(logger.getLevel()); // Returns: 'DEBUG'
```

**URL parameter for quick debugging:**
```
https://thorcollective.github.io/HEARTH/?debug
```
Adding `?debug` to any URL enables DEBUG level logging for that session.

---

## GitHub Actions Logging

### GitHub Actions Log Commands

GitHub Actions workflows use special logging commands for better integration with the Actions UI:

| Command | Purpose | Example |
|---------|---------|---------|
| `::debug::` | Debug information (only visible when debug logging is enabled) | `echo "::debug::Processing hunt $HUNT_ID"` |
| `::notice::` | Informational messages highlighted in the UI | `echo "::notice::Hunt generation completed"` |
| `::warning::` | Non-fatal issues that need attention | `echo "::warning::Hunt title is very long"` |
| `::error::` | Errors that should be investigated | `echo "::error::Failed to validate MITRE technique"` |

### Grouping Logs

Use log groups to organize related output:

```yaml
- name: Process CTI Submission
  run: |
    echo "::group::Extracting CTI content"
    python scripts/extract_content.py "$URL"
    echo "::endgroup::"

    echo "::group::Generating hunt hypothesis"
    python scripts/generate_from_cti.py "$URL"
    echo "::endgroup::"
```

### GitHub Script Actions

When using `actions/github-script@v7`, use the `core` object:

```javascript
steps:
  - name: Process issue
    uses: actions/github-script@v7
    with:
      script: |
        core.info('Processing issue #' + context.issue.number);
        core.debug('Issue data: ' + JSON.stringify(context.payload.issue));
        core.warning('This is a test submission');
        core.error('Failed to process: ' + error.message);
```

### Enabling Debug Logging in Actions

To see debug logs in GitHub Actions:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add a repository variable: `ACTIONS_STEP_DEBUG` = `true`

Or enable for a single workflow run by re-running with debug logging enabled.

---

## Development Guide

### Enabling Debug Logging Locally

**Python scripts:**
```bash
# Set environment variable before running
export LOG_LEVEL=DEBUG
python scripts/generate_from_cti.py "https://example.com/article"

# Or inline for a single command
LOG_LEVEL=DEBUG python scripts/process_hunt_submission.py
```

**JavaScript (frontend):**
```bash
# Open local file with debug parameter
open index.html?debug

# Or set in browser console
window.HEARTH_LOG_LEVEL = 'DEBUG';
location.reload();
```

**GitHub Actions:**
```bash
# Enable debug logging in workflows
gh variable set ACTIONS_STEP_DEBUG --body "true"

# Or re-run a workflow with debug logging
gh run rerun <run-id> --debug
```

### Log Files

Python logs are written to `logs/hearth_YYYYMMDD.log` with a new file created each day. These files:
- Include DEBUG level and above (regardless of console log level)
- Include file name and line number for each log entry
- Are automatically created in the `logs/` directory
- Are excluded from git via `.gitignore`

**Viewing recent logs:**
```bash
# View today's log file
tail -f logs/hearth_$(date +%Y%m%d).log

# Search logs for errors
grep ERROR logs/hearth_*.log

# View last 100 lines
tail -n 100 logs/hearth_$(date +%Y%m%d).log
```

### Best Practices

1. **Use appropriate log levels**: Don't log everything as ERROR. Follow the guidelines above.

2. **Include context**: Log relevant information that helps troubleshoot issues.
   ```python
   # Good
   logger.error("Failed to parse hunt file: %s", filename)

   # Bad
   logger.error("Parse failed")
   ```

3. **Use structured logging**: Include variable values as separate arguments.
   ```python
   # Good
   logger.info("Processed %d hunts in %.2f seconds", count, duration)

   # Bad
   logger.info(f"Processed {count} hunts in {duration} seconds")
   ```

4. **Don't log sensitive data**: Never log API keys, tokens, or user credentials.
   ```python
   # Good
   logger.debug("API request successful")

   # Bad
   logger.debug("API key: %s", api_key)
   ```

5. **Use exception logging for errors**: Capture full tracebacks.
   ```python
   # Good
   try:
       process_data()
   except Exception:
       logger.exception("Failed to process data")

   # Bad
   except Exception as e:
       logger.error(str(e))
   ```

6. **Avoid logging in loops**: Log summaries instead.
   ```python
   # Good
   logger.info("Processing %d hunts...", len(hunts))
   for hunt in hunts:
       process(hunt)
   logger.info("Successfully processed %d hunts", success_count)

   # Bad
   for hunt in hunts:
       logger.info("Processing hunt %s", hunt.id)
       process(hunt)
   ```

---

## Troubleshooting

### Issue: Debug logs not appearing

**Python:**
- Check that `LOG_LEVEL=DEBUG` is set in your environment
- Verify the logger is imported correctly: `from scripts.logger_config import get_logger`
- Check that you're calling the logger methods, not print statements

**JavaScript:**
- Verify you're running on localhost or with `?debug` parameter
- Check browser console for any errors loading the logger module
- Try setting `window.HEARTH_LOG_LEVEL = 'DEBUG'` manually

### Issue: Too many logs in production

**Python:**
- Ensure `LOG_LEVEL` is not set to DEBUG in production
- Default level is INFO, which filters out debug messages

**JavaScript:**
- The logger auto-detects production and sets INFO level
- Debug logs are automatically suppressed on production domains

### Issue: Logs not written to file

**Python:**
- Check that the `logs/` directory exists and is writable
- Verify the script has permission to create files
- Look for any errors in console output about log file creation

### Issue: GitHub Actions logs not showing

- Enable debug logging: Set `ACTIONS_STEP_DEBUG` variable to `true`
- Check that you're using the correct log command syntax: `::debug::`, `::notice::`, etc.
- For github-script actions, ensure you're using `core.info()`, not `console.log()`

---

## Migration from console.log and print()

If you're updating old code, here's how to migrate:

### Python Migration

```python
# Before
print("Processing hunt...")
print(f"Hunt ID: {hunt_id}")

# After
from scripts.logger_config import get_logger
logger = get_logger()
logger.info("Processing hunt with ID: %s", hunt_id)
```

### JavaScript Migration

```javascript
// Before
console.log("Hunt loaded");
console.error("Failed to load", error);

// After
import { getLogger } from './js/logger.js';
const logger = getLogger('HuntLoader');
logger.info("Hunt loaded");
logger.error("Failed to load", error);
```

### GitHub Actions Migration

```yaml
# Before
- run: echo "Processing complete"

# After
- run: echo "::notice::Processing complete"
```

---

## Related Documentation

- [Python Logger Implementation](../scripts/logger_config.py)
- [JavaScript Logger Implementation](../js/logger.js)
- [Testing Guide](TESTING_GUIDE.md) - Includes logging verification tests
- [GitHub Actions Documentation](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions)

---

For questions or issues with logging, please [open an issue](https://github.com/THORCollective/HEARTH/issues/new) on GitHub.
