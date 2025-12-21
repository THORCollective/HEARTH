/**
 * HEARTH Utility Functions
 * Shared utility functions used across the HEARTH application
 */

import { getLogger } from './logger.js';

const logger = getLogger('Utils');

/**
 * Number formatter for consistent number display
 * @type {Intl.NumberFormat}
 */
const numberFormatter = new Intl.NumberFormat('en-US');

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 *
 * @example
 * formatNumber(1234567) // Returns "1,234,567"
 * formatNumber(42) // Returns "42"
 */
export function formatNumber(value) {
  return numberFormatter.format(typeof value === 'number' ? value : 0);
}

/**
 * Extract unique values from hunt data for a specific field
 * Uses caching for performance optimization
 *
 * @param {Array<Object>} huntsData - Array of hunt objects
 * @param {string} fieldName - Name of the field to extract unique values from
 * @param {Map} cache - Optional cache Map for storing results
 * @returns {Array<string>} Sorted array of unique values
 *
 * @example
 * const tactics = getUniqueValues(hunts, 'tactic')
 * const tags = getUniqueValues(hunts, 'tags')
 * const categories = getUniqueValues(hunts, 'category')
 */
export function getUniqueValues(huntsData, fieldName, cache = null) {
  // Use cache for expensive operations
  const cacheKey = `unique_${fieldName}`;
  if (cache && cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const uniqueValues = new Set();
  huntsData.forEach(hunt => {
    switch (fieldName) {
    case 'tags':
      (hunt.tags || []).forEach(tag => uniqueValues.add(tag));
      break;
    case 'tactic':
      if (hunt.tactic) {
        hunt.tactic.split(',').map(tactic => tactic.trim()).forEach(tactic => {
          if (tactic) {
            uniqueValues.add(tactic);
          }
        });
      }
      break;
    default:
      if (hunt[fieldName]) {
        uniqueValues.add(hunt[fieldName]);
      }
    }
  });

  const result = Array.from(uniqueValues).filter(Boolean).sort();
  if (cache) {
    cache.set(cacheKey, result);
  }
  return result;
}

/**
 * Configuration for tactic grouping
 * @type {Array<{label: string, keywords: Array<string>}>}
 */
export const tacticGroupConfig = [
  { label: 'Recon & Prep', keywords: ['reconnaissance', 'resource development'] },
  { label: 'Initial Access', keywords: ['initial access'] },
  { label: 'Execution', keywords: ['execution'] },
  { label: 'Persistence', keywords: ['persistence'] },
  { label: 'Privilege Escalation', keywords: ['privilege escalation'] },
  { label: 'Defense Evasion', keywords: ['defense evasion'] },
  { label: 'Credential Access', keywords: ['credential access'] },
  { label: 'Discovery', keywords: ['discovery'] },
  { label: 'Lateral Movement', keywords: ['lateral movement'] },
  { label: 'Collection', keywords: ['collection'] },
  { label: 'Command & Control', keywords: ['command and control'] },
  { label: 'Exfiltration & Impact', keywords: ['exfiltration', 'impact'] },
  { label: 'Additional tactics', keywords: [] }
];

/**
 * Resolve which tactic group a tactic belongs to
 * @param {string} tactic - The tactic to resolve
 * @param {Array<Object>} config - Optional custom tactic group configuration
 * @returns {string} The tactic group label
 *
 * @example
 * resolveTacticGroup('Initial Access') // Returns "Initial Access"
 * resolveTacticGroup('Command and Control') // Returns "Command & Control"
 */
export function resolveTacticGroup(tactic, config = tacticGroupConfig) {
  const normalized = (tactic || '').toLowerCase();
  const entry = config.find(group =>
    group.keywords.some(keyword => normalized.includes(keyword))
  );
  return entry ? entry.label : 'Additional tactics';
}

/**
 * Group tactics by their category using the tactic group configuration
 * @param {Array<string>} tactics - Array of tactic strings
 * @param {Array<Object>} config - Optional custom tactic group configuration
 * @returns {Map<string, Array<string>>} Map of group labels to arrays of tactics
 *
 * @example
 * const grouped = groupTactics(['Initial Access', 'Execution', 'Persistence'])
 * // Returns Map with grouped tactics by category
 */
export function groupTactics(tactics, config = tacticGroupConfig) {
  const groups = new Map();
  const defaultLabel = 'Additional tactics';

  tactics.forEach(tactic => {
    const label = resolveTacticGroup(tactic, config) || defaultLabel;
    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label).push(tactic);
  });

  groups.forEach(values => values.sort((a, b) => a.localeCompare(b)));

  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

/**
 * Extract tactics from a hunt object
 * @param {Object} hunt - Hunt object
 * @returns {Array<string>} Array of tactic strings
 *
 * @example
 * const tactics = getHuntTactics(hunt)
 * // Returns ['Initial Access', 'Execution']
 */
export function getHuntTactics(hunt) {
  if (!hunt || !hunt.tactic) {
    return [];
  }
  return hunt.tactic
    .split(',')
    .map(tactic => tactic.trim())
    .filter(Boolean);
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 *
 * @example
 * const debouncedSearch = debounce(searchFunction, 300)
 * debouncedSearch() // Will only execute after 300ms of no calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 *
 * @example
 * const throttledResize = throttle(handleResize, 100)
 * window.addEventListener('resize', throttledResize)
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Get current timestamp using best available timer
 * @returns {number} Current timestamp in milliseconds
 *
 * @example
 * const start = getNow()
 * // ... do work ...
 * const duration = getNow() - start
 */
export function getNow() {
  return (typeof performance !== 'undefined' && typeof performance.now === 'function')
    ? performance.now()
    : Date.now();
}

/**
 * Validate required DOM elements
 * @param {Object<string, HTMLElement>} elements - Object mapping element names to DOM elements
 * @throws {Error} If any required elements are missing
 *
 * @example
 * validateElements({
 *   searchInput: document.getElementById('search'),
 *   resultsDiv: document.getElementById('results')
 * })
 */
export function validateElements(elements) {
  const missingElements = Object.entries(elements)
    .filter(([name, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    logger.error('Missing required elements:', missingElements);
    throw new Error(`Required DOM elements not found: ${missingElements.join(', ')}`);
  }
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 *
 * @example
 * const safe = sanitizeHtml('<script>alert("xss")</script>')
 * // Returns '&lt;script&gt;alert("xss")&lt;/script&gt;'
 */
export function sanitizeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create a download link for a blob
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 * @returns {string} Object URL for the blob
 *
 * @example
 * const blob = new Blob(['content'], { type: 'text/plain' })
 * const url = createDownloadUrl(blob, 'file.txt')
 */
export function createDownloadUrl(blob, filename) {
  return URL.createObjectURL(blob);
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 *
 * @example
 * const cloned = deepClone({ a: 1, b: { c: 2 } })
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Set) {
    return new Set([...obj].map(item => deepClone(item)));
  }

  if (obj instanceof Map) {
    return new Map([...obj].map(([key, value]) => [deepClone(key), deepClone(value)]));
  }

  if (obj instanceof Object) {
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  }
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 *
 * @example
 * isEmpty(null) // true
 * isEmpty('') // true
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('hello') // false
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}
