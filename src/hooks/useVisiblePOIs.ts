import { useMemo, useRef } from 'react';
import { WORLD_DATABASE, POI } from '../constants/worldDatabase';
import { calculateDistance, calculateAngularSeparation } from '../utils/coordinates';
import { UserLocation } from './useLocation';
import { Orientation } from './useOrientation';

const MAX_VISIBLE = 15;
const MIN_ANGULAR_SEPARATION = 10; // degrees
const STICKINESS_BOOST = 200; // Large boost to keep visible POIs from disappearing
const VIEW_ANGLE_FOR_STICKINESS = 90; // POIs within this angle of view center get stickiness
const MIN_DISTANCE_KM = 20; // Hide POIs closer than this (user is in this city)
const HORIZON_RANGE_KM = 2000; // Expanded horizon range to show more nearby cities
const SAME_COUNTRY_BOOST = 40; // Boost for POIs in the same country as the user

export interface ScoredPOI extends POI {
  score: number;
  distance: number;
  isHorizon: boolean;    // Close city on horizon
  isAntipodal: boolean;  // Far city through Earth
}

/**
 * Find the user's country based on nearest city
 */
function findUserCountry(userLocation: UserLocation): string | null {
  let nearestCity: POI | null = null;
  let nearestDistance = Infinity;

  for (const poi of WORLD_DATABASE) {
    if (poi.type === 'city') {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestCity = poi;
      }
    }
  }

  return nearestCity?.country ?? null;
}

/**
 * Calculate the angular distance from the view center for a POI
 */
function calculateAngularDistFromView(
  poi: POI,
  userLocation: UserLocation,
  orientation: Orientation
): number {
  const viewLat = -orientation.beta * (180 / Math.PI);
  const viewLng = orientation.alpha * (180 / Math.PI);
  const viewCenterLat = userLocation.lat + viewLat * 0.5;
  const viewCenterLng = userLocation.lng + viewLng * 0.5;

  return calculateAngularSeparation(
    { lat: viewCenterLat, lng: viewCenterLng },
    { lat: poi.lat, lng: poi.lng }
  );
}

/**
 * Calculate visibility score for a POI based on user location
 */
function calculateVisibilityScore(
  poi: POI,
  userLocation: UserLocation,
  orientation: Orientation,
  previouslySelectedIds: Set<string>,
  userCountry: string | null
): { score: number; distance: number; isHorizon: boolean; isAntipodal: boolean; angularDistFromView: number } {
  const distance = calculateDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);

  // Hide POIs that are at the user's location
  if (distance < MIN_DISTANCE_KM) {
    return { score: 0, distance, isHorizon: false, isAntipodal: false, angularDistFromView: 0 };
  }

  let score = 0;
  let isHorizon = false;
  let isAntipodal = false;

  // Horizon cities (close, within expanded range) - what's nearby on the horizon
  if (distance < HORIZON_RANGE_KM) {
    score += (1 - distance / HORIZON_RANGE_KM) * 50; // Up to 50 points for very close cities
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
  if (distance >= HORIZON_RANGE_KM && distance <= 10000) {
    if (poi.population && poi.population > 10000000) {
      // Major cities (10M+) get some visibility
      score += (poi.population / 40000000) * 20; // Up to 20 points
    }
  }

  // Boost for POIs in the same country as the user
  if (userCountry && poi.country === userCountry) {
    score += SAME_COUNTRY_BOOST;
  }

  // Boost landmarks and natural wonders slightly
  if (poi.type === 'landmark' || poi.type === 'natural') {
    score += 10;
  }

  const angularDistFromView = calculateAngularDistFromView(poi, userLocation, orientation);

  // Boost for being in current view direction (within 60° of center)
  if (angularDistFromView < 60) {
    score *= 1 + (1 - angularDistFromView / 60); // Up to 2x multiplier
  }

  // Penalty for being behind the user (more than 120° away from view)
  if (angularDistFromView > 120) {
    score *= 0.3;
  }

  // STICKINESS: Boost POIs that were previously selected and are still in view
  // This prevents POIs from disappearing while the user is looking at them
  if (previouslySelectedIds.has(poi.id) && angularDistFromView < VIEW_ANGLE_FOR_STICKINESS) {
    score += STICKINESS_BOOST;
  }

  return { score, distance, isHorizon, isAntipodal, angularDistFromView };
}

/**
 * Hook to get the visible POIs based on user location and view direction
 */
export function useVisiblePOIs(
  userLocation: UserLocation | null,
  orientation: Orientation
): ScoredPOI[] {
  // Track previously selected POI IDs for stickiness
  const previouslySelectedRef = useRef<Set<string>>(new Set());

  return useMemo(() => {
    if (!userLocation) return [];

    const previouslySelectedIds = previouslySelectedRef.current;
    const userCountry = findUserCountry(userLocation);

    // Score all POIs
    const scored: ScoredPOI[] = WORLD_DATABASE.map(poi => {
      const { score, distance, isHorizon, isAntipodal } = calculateVisibilityScore(
        poi,
        userLocation,
        orientation,
        previouslySelectedIds,
        userCountry
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

    // Update the previously selected set for next render
    previouslySelectedRef.current = new Set(selected.map(p => p.id));

    return selected;
  }, [userLocation, orientation]);
}
