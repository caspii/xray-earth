import { useMemo } from 'react';
import { WORLD_DATABASE, POI } from '../constants/worldDatabase';
import { calculateDistance, calculateAngularSeparation } from '../utils/coordinates';
import { UserLocation } from './useLocation';
import { Orientation } from './useOrientation';

const MAX_VISIBLE = 15;
const MIN_ANGULAR_SEPARATION = 10; // degrees

export interface ScoredPOI extends POI {
  score: number;
  distance: number;
  isHorizon: boolean;    // Close city on horizon
  isAntipodal: boolean;  // Far city through Earth
}

/**
 * Calculate visibility score for a POI based on user location
 */
function calculateVisibilityScore(
  poi: POI,
  userLocation: UserLocation,
  orientation: Orientation
): { score: number; distance: number; isHorizon: boolean; isAntipodal: boolean } {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);

  let score = 0;
  let isHorizon = false;
  let isAntipodal = false;

  // Horizon cities (close, within 500km) - what's nearby on the horizon
  if (distance < 500) {
    score += (1 - distance / 500) * 50; // Up to 50 points for very close cities
    isHorizon = true;
  }

  // Antipodal cities (far, over 10,000km - "through the Earth")
  // Earth's diameter is ~12,742km, so >10,000km means roughly opposite side
  if (distance > 10000) {
    const antipodeFactor = Math.min((distance - 10000) / 10000, 1); // 0-1 scale
    const populationFactor = poi.population ? Math.log10(poi.population) / 8 : 0.3;
    score += antipodeFactor * populationFactor * 100; // Up to 100 points for large antipodal cities
    isAntipodal = true;
  }

  // Medium distance cities get lower priority (not horizon, not antipodal)
  // But still show major cities
  if (distance >= 500 && distance <= 10000) {
    if (poi.population && poi.population > 10000000) {
      // Major cities (10M+) get some visibility
      score += (poi.population / 40000000) * 20; // Up to 20 points
    }
  }

  // Boost landmarks and natural wonders slightly
  if (poi.type === 'landmark' || poi.type === 'natural') {
    score += 10;
  }

  // Calculate if POI is in the viewing direction
  // This is simplified - we use the orientation to determine rough viewing hemisphere
  const viewLat = -orientation.beta * (180 / Math.PI); // Convert pitch to latitude offset
  const viewLng = orientation.alpha * (180 / Math.PI); // Convert yaw to longitude offset

  // Approximate the center of view
  const viewCenterLat = userLocation.lat + viewLat * 0.5;
  const viewCenterLng = userLocation.lng + viewLng * 0.5;

  const angularDistFromView = calculateAngularSeparation(
    { lat: viewCenterLat, lng: viewCenterLng },
    { lat: poi.lat, lng: poi.lng }
  );

  // Boost for being in current view direction (within 60° of center)
  if (angularDistFromView < 60) {
    score *= 1 + (1 - angularDistFromView / 60); // Up to 2x multiplier
  }

  // Penalty for being behind the user (more than 120° away from view)
  if (angularDistFromView > 120) {
    score *= 0.3;
  }

  return { score, distance, isHorizon, isAntipodal };
}

/**
 * Hook to get the visible POIs based on user location and view direction
 */
export function useVisiblePOIs(
  userLocation: UserLocation | null,
  orientation: Orientation
): ScoredPOI[] {
  return useMemo(() => {
    if (!userLocation) return [];

    // Score all POIs
    const scored: ScoredPOI[] = WORLD_DATABASE.map(poi => {
      const { score, distance, isHorizon, isAntipodal } = calculateVisibilityScore(
        poi,
        userLocation,
        orientation
      );
      return {
        ...poi,
        score,
        distance,
        isHorizon,
        isAntipodal,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Select top POIs while respecting minimum angular separation
    const selected: ScoredPOI[] = [];
    for (const poi of scored) {
      if (selected.length >= MAX_VISIBLE) break;

      // Check angular separation from already selected POIs
      const tooClose = selected.some(
        s => calculateAngularSeparation(poi, s) < MIN_ANGULAR_SEPARATION
      );

      if (!tooClose && poi.score > 0) {
        selected.push(poi);
      }
    }

    return selected;
  }, [userLocation, orientation]);
}
