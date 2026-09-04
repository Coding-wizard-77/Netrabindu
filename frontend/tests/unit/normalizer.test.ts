import { describe, it, expect } from 'vitest';
import { normalizeLicensePlate, formatLicensePlateDisplay } from '../../src/utils/normalizer';

describe('License Plate Normalizer', () => {
  it('should remove spaces, special characters, and lowercase characters', () => {
    expect(normalizeLicensePlate('gj 01 ab 1234')).toBe('GJ01AB1234');
    expect(normalizeLicensePlate('GJ-01-AB-1234')).toBe('GJ01AB1234');
    expect(normalizeLicensePlate('  GJ 01 AB 1234  ')).toBe('GJ01AB1234');
    expect(normalizeLicensePlate('gj.01/ab#1234')).toBe('GJ01AB1234');
  });

  it('should format standard Indian plate strings for readable display', () => {
    expect(formatLicensePlateDisplay('GJ01AB1234')).toBe('GJ 01 AB 1234');
    expect(formatLicensePlateDisplay('GJ27C5678')).toBe('GJ 27 C 5678');
  });
});
