/**
 * Custom error classes for HEARTH JavaScript operations.
 *
 * Error Code Conventions:
 * - HE-1xxx: Parsing errors
 * - HE-2xxx: Validation errors
 * - HE-3xxx: API errors
 * - HE-5xxx: Filtering errors
 * - HE-6xxx: Rendering errors
 * - HE-9xxx: Network errors
 *
 * @module errors
 */

/**
 * Base error class for all HEARTH JavaScript errors.
 * All custom HEARTH errors inherit from this base class.
 * Provides error code, message, and contextual information.
 *
 * @class HearthError
 * @extends Error
 */
export class HearthError extends Error {
  /**
   * Creates a new HearthError instance
   *
   * @param {string} message - Human-readable error description
   * @param {string} [errorCode='HE-0000'] - Standardized error code for programmatic handling
   * @param {Object} [context={}] - Additional contextual information
   */
  constructor(message, errorCode = 'HE-0000', context = {}) {
    const errorMsg = `[${errorCode}] ${message}`;
    super(errorMsg);

    this.name = this.constructor.name;
    this.errorCode = errorCode;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get formatted error message including context
   *
   * @returns {string} Formatted error message
   */
  toString() {
    let msg = `${this.name}: [${this.errorCode}] ${this.message}`;
    if (Object.keys(this.context).length > 0) {
      msg += ` | Context: ${JSON.stringify(this.context)}`;
    }
    return msg;
  }

  /**
   * Get error object as JSON
   *
   * @returns {Object} Error object with all properties
   */
  toJSON() {
    return {
      name: this.name,
      errorCode: this.errorCode,
      message: this.message,
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Error thrown when parsing operations fail.
 * Use for JSON parsing, markdown parsing, or any structured data parsing failures.
 *
 * @class ParsingError
 * @extends HearthError
 */
export class ParsingError extends HearthError {
  /**
   * Creates a new ParsingError instance
   *
   * @param {string} message - Description of parsing failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.source] - Source being parsed (e.g., 'JSON', 'Markdown', 'HTML')
   * @param {string} [options.content] - Sample of content that failed to parse
   * @param {number} [options.line] - Line number where parsing failed
   * @param {number} [options.column] - Column number where parsing failed
   * @param {string} [options.errorCode='HE-1000'] - Specific parsing error code (HE-1xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.source) context.source = options.source;
    if (options.content) context.content = options.content.substring(0, 100); // Truncate long content
    if (options.line !== undefined) context.line = options.line;
    if (options.column !== undefined) context.column = options.column;

    super(message, options.errorCode || 'HE-1000', context);
  }
}

/**
 * Error thrown when input validation fails.
 * Use for field validation, format validation, or constraint validation failures.
 *
 * @class ValidationError
 * @extends HearthError
 */
export class ValidationError extends HearthError {
  /**
   * Creates a new ValidationError instance
   *
   * @param {string} message - Description of validation failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.field] - Name of field that failed validation
   * @param {*} [options.value] - Invalid value provided
   * @param {string} [options.expected] - Expected format or value
   * @param {string} [options.errorCode='HE-2000'] - Specific validation error code (HE-2xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.field) context.field = options.field;
    if (options.value !== undefined) context.value = String(options.value);
    if (options.expected) context.expected = options.expected;

    super(message, options.errorCode || 'HE-2000', context);
  }
}

/**
 * Error thrown when API operations fail.
 * Use for API request failures, authentication errors, rate limiting, or timeouts.
 *
 * @class APIError
 * @extends HearthError
 */
export class APIError extends HearthError {
  /**
   * Creates a new APIError instance
   *
   * @param {string} message - Description of API failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.endpoint] - API endpoint that failed
   * @param {number} [options.statusCode] - HTTP status code
   * @param {string} [options.method] - HTTP method (GET, POST, etc.)
   * @param {number} [options.retryAfter] - Seconds to wait before retry (for rate limits)
   * @param {string} [options.errorCode='HE-3000'] - Specific API error code (HE-3xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.endpoint) context.endpoint = options.endpoint;
    if (options.statusCode) context.statusCode = options.statusCode;
    if (options.method) context.method = options.method;
    if (options.retryAfter) context.retryAfter = options.retryAfter;

    super(message, options.errorCode || 'HE-3000', context);
  }
}

/**
 * Error thrown when filtering operations fail.
 * Use for filter parsing errors, invalid filter criteria, or filter execution failures.
 *
 * @class FilterError
 * @extends HearthError
 */
export class FilterError extends HearthError {
  /**
   * Creates a new FilterError instance
   *
   * @param {string} message - Description of filtering failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.filterType] - Type of filter that failed (e.g., 'tactic', 'tag', 'search')
   * @param {*} [options.filterValue] - Filter value that caused the error
   * @param {string} [options.operation] - Operation being performed
   * @param {string} [options.errorCode='HE-5000'] - Specific filter error code (HE-5xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.filterType) context.filterType = options.filterType;
    if (options.filterValue !== undefined) context.filterValue = String(options.filterValue);
    if (options.operation) context.operation = options.operation;

    super(message, options.errorCode || 'HE-5000', context);
  }
}

/**
 * Error thrown when rendering operations fail.
 * Use for DOM rendering errors, template errors, or display failures.
 *
 * @class RenderError
 * @extends HearthError
 */
export class RenderError extends HearthError {
  /**
   * Creates a new RenderError instance
   *
   * @param {string} message - Description of rendering failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.component] - Component or element being rendered
   * @param {string} [options.huntId] - Hunt ID being rendered (if applicable)
   * @param {string} [options.operation] - Rendering operation (e.g., 'card', 'modal', 'filter')
   * @param {string} [options.errorCode='HE-6000'] - Specific render error code (HE-6xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.component) context.component = options.component;
    if (options.huntId) context.huntId = options.huntId;
    if (options.operation) context.operation = options.operation;

    super(message, options.errorCode || 'HE-6000', context);
  }
}

/**
 * Error thrown when network operations fail.
 * Use for connection timeouts, DNS failures, or network unavailability.
 *
 * @class NetworkError
 * @extends HearthError
 */
export class NetworkError extends HearthError {
  /**
   * Creates a new NetworkError instance
   *
   * @param {string} message - Description of network failure
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.url] - URL that failed to connect
   * @param {number} [options.timeout] - Timeout value in milliseconds
   * @param {string} [options.method] - HTTP method
   * @param {string} [options.errorCode='HE-9000'] - Specific network error code (HE-9xxx)
   */
  constructor(message, options = {}) {
    const context = {};
    if (options.url) context.url = options.url;
    if (options.timeout) context.timeout = options.timeout;
    if (options.method) context.method = options.method;

    super(message, options.errorCode || 'HE-9000', context);
  }
}

/**
 * Helper function to display user-friendly error messages.
 * Extracts the core message without error codes for display purposes.
 *
 * @param {Error} error - Error object to format
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof HearthError) {
    // Return message without error code for user display
    return error.message.replace(/^\[HE-\d+\]\s*/, '');
  }
  return error.message || 'An unexpected error occurred';
}

/**
 * Helper function to log errors with full context.
 * Logs error details including stack trace and context for debugging.
 *
 * @param {Error} error - Error object to log
 * @param {string} [level='error'] - Log level ('error', 'warn', 'info')
 */
export function logError(error, level = 'error') {
  const logFn = console[level] || console.error;

  if (error instanceof HearthError) {
    logFn(`${error.name}:`, {
      errorCode: error.errorCode,
      message: error.message,
      context: error.context,
      stack: error.stack
    });
  } else {
    logFn('Error:', error);
  }
}
