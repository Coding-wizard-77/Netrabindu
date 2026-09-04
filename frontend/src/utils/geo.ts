import { LocationPoint } from '../types';

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
export function calculateHaversineDistanceKm(p1: LocationPoint, p2: LocationPoint): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Gujarat Center Coordinates default
 */
export const GUJARAT_CENTER: [number, number] = [23.0225, 72.5714]; // Ahmedabad center
