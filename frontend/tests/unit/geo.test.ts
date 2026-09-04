import { describe, it, expect } from 'vitest';
import { calculateHaversineDistanceKm } from '../../src/utils/geo';

describe('GIS Geo Math', () => {
  it('should correctly compute distance between two GPS coordinates', () => {
    const ahmedabad = { lat: 23.0225, lon: 72.5714 };
    const gandhinagar = { lat: 23.2156, lon: 72.6369 };
    const dist = calculateHaversineDistanceKm(ahmedabad, gandhinagar);
    expect(dist).toBeGreaterThan(20);
    expect(dist).toBeLessThan(30);
  });
});
