/**
 * Format number with thousands separator and decimal point
 * Uses comma for thousands (,) and dot for decimals (.)
 *
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: auto-detect, max 2)
 * @returns {string} Formatted number
 *
 * Examples:
 * formatNumber(1234567) => "1,234,567"
 * formatNumber(1234567.5) => "1,234,567.5"
 * formatNumber(1234567.89) => "1,234,567.89"
 * formatNumber(1234567.123) => "1,234,567.12"
 */
export function formatNumber(num, decimals = null) {
  if (num === null || num === undefined || num === '') return '0';

  const number = parseFloat(num);
  if (isNaN(number)) return '0';

  // Auto-detect decimals if not specified
  let finalNumber;
  if (decimals === null) {
    // Keep original decimals but limit to 2 decimal places
    const hasDecimals = number % 1 !== 0;
    if (hasDecimals) {
      // Round to 2 decimal places and remove trailing zeros
      finalNumber = Math.round(number * 100) / 100;
    } else {
      finalNumber = number;
    }
  } else {
    finalNumber = decimals > 0 ? parseFloat(number.toFixed(decimals)) : Math.round(number);
  }

  // Convert to string and split into integer and decimal parts
  const parts = finalNumber.toString().split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousands separator (comma)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine with decimal part if exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Format currency with "د.ع" suffix
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: auto-detect)
 * @returns {string} Formatted currency
 */
export function formatCurrency(num, decimals = null) {
  return `${formatNumber(num, decimals)} د.ع`;
}
