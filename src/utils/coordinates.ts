import * as THREE from 'three';

const EARTH_RADIUS_KM = 6371;

/**
 * Convert latitude/longitude to 3D Cartesian coordinates for Three.js
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Calculate the great-circle distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate the angular distance between two points on the sphere
 * Returns angle in degrees
 */
export function calculateAngularDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const distance = calculateDistance(lat1, lng1, lat2, lng2);
  // Convert km to degrees (Earth's circumference is ~40075 km)
  return (distance / 40075) * 360;
}

/**
 * Calculate the angular separation between two POIs as seen from the center
 * Used to prevent label overlap
 */
export function calculateAngularSeparation(
  poi1: { lat: number; lng: number },
  poi2: { lat: number; lng: number }
): number {
  return calculateAngularDistance(poi1.lat, poi1.lng, poi2.lat, poi2.lng);
}

/**
 * Calculate the antipodal point (opposite side of Earth)
 */
export function getAntipodalPoint(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: -lat,
    lng: lng > 0 ? lng - 180 : lng + 180,
  };
}

/**
 * Check if a point is roughly antipodal to another (within tolerance)
 */
export function isAntipodal(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  toleranceKm: number = 2000
): boolean {
  const antipode = getAntipodalPoint(lat1, lng1);
  const distanceToAntipode = calculateDistance(antipode.lat, antipode.lng, lat2, lng2);
  return distanceToAntipode < toleranceKm;
}

/**
 * Calculate bearing from point 1 to point 2
 * Returns bearing in degrees (0-360, where 0 is North)
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = Math.atan2(y, x);
  bearing = toDegrees(bearing);
  return (bearing + 360) % 360;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  } else if (km < 10) {
    return `${km.toFixed(1)} km`;
  } else {
    // Use comma formatting for large numbers
    return `${Math.round(km).toLocaleString()} km`;
  }
}

// Helper functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
