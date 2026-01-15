/**
 * Number formatting utilities
 */

const numberFormatter = new Intl.NumberFormat('en-US');

/**
 * Format number with thousand separators
 * @param num Number to format
 * @returns Formatted string (e.g., "1,234")
 */
export function formatNumber(num: number): string {
  return numberFormatter.format(num);
}
