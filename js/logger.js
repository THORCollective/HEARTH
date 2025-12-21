/**
 * HEARTH Logging Module
 * Provides structured logging with environment-aware log levels
 */

/**
 * Log levels in order of severity
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

/**
 * Logger class for structured logging with environment detection
 */
class Logger {
  /**
   * Create a new Logger instance
   * @param {string} name - Logger name (typically the module name)
   */
  constructor(name = 'HEARTH') {
    this.name = name;
    this.level = this._detectLogLevel();
  }

  /**
   * Detect appropriate log level based on environment
   * @private
   * @returns {number} Log level
   */
  _detectLogLevel() {
    // Check for explicit log level setting (e.g., for testing)
    if (typeof window !== 'undefined' && window.HEARTH_LOG_LEVEL !== undefined) {
      const level = window.HEARTH_LOG_LEVEL.toUpperCase();
      return LogLevel[level] !== undefined ? LogLevel[level] : LogLevel.INFO;
    }

    // Check if running in development mode
    // Development indicators:
    // - localhost or 127.0.0.1
    // - file:// protocol (local file)
    // - presence of ?debug query parameter
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const urlParams = new URLSearchParams(window.location.search);

      const isLocalhost = hostname === 'localhost' ||
                         hostname === '127.0.0.1' ||
                         hostname === '';
      const isFileProtocol = protocol === 'file:';
      const hasDebugParam = urlParams.has('debug');

      if (isLocalhost || isFileProtocol || hasDebugParam) {
        return LogLevel.DEBUG;
      }
    }

    // Default to INFO level for production
    return LogLevel.INFO;
  }

  /**
   * Check if a log level is enabled
   * @private
   * @param {number} level - Log level to check
   * @returns {boolean} True if level is enabled
   */
  _isLevelEnabled(level) {
    return level >= this.level;
  }

  /**
   * Format a log message with timestamp and level
   * @private
   * @param {string} level - Log level name
   * @param {string} message - Log message
   * @returns {string} Formatted message
   */
  _formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.name}] ${message}`;
  }

  /**
   * Log a debug message
   * Debug messages are only shown in development environments
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments to log
   *
   * @example
   * logger.debug('Processing hunt data', huntCount);
   */
  debug(message, ...args) {
    if (!this._isLevelEnabled(LogLevel.DEBUG)) {
      return;
    }
    // In development, use console.log for debug messages
    // eslint-disable-next-line no-console
    console.log(this._formatMessage('DEBUG', message), ...args);
  }

  /**
   * Log an info message
   * Info messages are shown in all environments
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments to log
   *
   * @example
   * logger.info('Application initialized successfully');
   */
  info(message, ...args) {
    if (!this._isLevelEnabled(LogLevel.INFO)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.info(this._formatMessage('INFO', message), ...args);
  }

  /**
   * Log a warning message
   * Warning messages are shown in all environments
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments to log
   *
   * @example
   * logger.warn('Unable to load filter presets', error);
   */
  warn(message, ...args) {
    if (!this._isLevelEnabled(LogLevel.WARN)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.warn(this._formatMessage('WARN', message), ...args);
  }

  /**
   * Log an error message
   * Error messages are always shown
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments to log
   *
   * @example
   * logger.error('Error generating notebook', error);
   */
  error(message, ...args) {
    if (!this._isLevelEnabled(LogLevel.ERROR)) {
      return;
    }
    // eslint-disable-next-line no-console
    console.error(this._formatMessage('ERROR', message), ...args);
  }

  /**
   * Set the log level dynamically
   * @param {string} level - Log level name (DEBUG, INFO, WARN, ERROR)
   *
   * @example
   * logger.setLevel('DEBUG'); // Enable debug logging
   * logger.setLevel('ERROR'); // Only show errors
   */
  setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (LogLevel[upperLevel] !== undefined) {
      this.level = LogLevel[upperLevel];
    } else {
      this.warn(`Invalid log level: ${level}. Using INFO.`);
      this.level = LogLevel.INFO;
    }
  }

  /**
   * Get current log level name
   * @returns {string} Current log level name
   */
  getLevel() {
    return Object.keys(LogLevel).find(key => LogLevel[key] === this.level) || 'INFO';
  }
}

/**
 * Create a logger instance for a specific module
 * @param {string} name - Module name
 * @returns {Logger} Logger instance
 *
 * @example
 * import { getLogger } from './js/logger.js';
 * const logger = getLogger('HuntFilter');
 * logger.info('Filter initialized');
 */
export function getLogger(name) {
  return new Logger(name);
}

/**
 * Default logger instance for general use
 * @type {Logger}
 */
export const logger = new Logger();

// Export LogLevel for testing purposes
export { LogLevel };
