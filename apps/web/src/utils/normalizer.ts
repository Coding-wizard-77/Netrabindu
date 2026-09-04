/**
 * Normalizes vehicle registration plates for India (e.g., GJ 01 AB 1234 -> GJ01AB1234)
 */
export function normalizeLicensePlate(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Formats normalized plate to human-readable standard format (e.g., GJ01AB1234 -> GJ 01 AB 1234)
 */
export function formatLicensePlateDisplay(normalized: string): string {
  if (!normalized || normalized.length < 4) return normalized;
  const match = normalized.match(/^([A-Z]{2})(\d{2})([A-Z]{1,3})?(\d{4})$/);
  if (match) {
    const [, state, rto, series, num] = match;
    return `${state} ${rto}${series ? ' ' + series : ''} ${num}`;
  }
  return normalized;
}

export function truncateText(text: string, maxLen = 30): string {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}
