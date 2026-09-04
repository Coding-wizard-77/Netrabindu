import { describe, it, expect } from 'vitest';
import { formatToIST, formatRelativeTime } from '../../src/utils/date';

describe('Date & Time IST Conversion', () => {
  it('should convert UTC ISO string into formatted IST string with IST suffix', () => {
    const utcDate = '2026-09-04T00:00:00.000Z';
    const result = formatToIST(utcDate, 'HH:mm');
    expect(result).toBe('05:30 IST');
  });

  it('should handle null or invalid date inputs gracefully', () => {
    expect(formatToIST(null)).toBe('--');
    expect(formatToIST(undefined)).toBe('--');
    expect(formatToIST('invalid-date')).toBe('--');
  });
});
