/**
 * Smart AI Travel Planner 3.0
 * Google Maps Platform Shared Service
 *
 * Implements:
 * 1. Safe access to client API key via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
 * 2. Zero-key Google Maps Directions & Search URL generators (universal fallback).
 * 3. Waypoint coordinate resolution and bounding box calculations.
 * 4. Travel mode normalization (DRIVING, WALKING, TRANSIT, BICYCLING).
 */

import { resolveCoordinates, VERIFIED_HUBS } from './geocoding';

export type GoogleTravelMode = 'driving' | 'walking' | 'transit' | 'bicycling';

export interface MapCoordinate {
  lat: number;
  lng: number;
}

export interface MapWaypoint {
  id: string;
  title: string;
  description?: string;
  category?: string;
  time?: string;
  dayNumber?: number;
  sequenceNumber: number;
  location: string;
  coords: MapCoordinate;
  color?: string;
  googleMapsUrl: string;
}

/**
 * Returns the browser-restricted Google Maps API key from environment
 */
export function getGoogleMapsApiKey(): string {
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!envKey || envKey === 'YOUR_BROWSER_RESTRICTED_GOOGLE_MAPS_KEY') {
    return '';
  }
  return envKey.trim();
}

/**
 * Checks whether a valid Google Maps API Key is provisioned
 */
export function isGoogleMapsConfigured(): boolean {
  const key = getGoogleMapsApiKey();
  return Boolean(key && key.length > 10);
}

/**
 * Generates an official zero-key Google Maps Directions URL
 * Universal fallback requiring no API key
 */
export function buildGoogleMapsDirectionsUrl(
  origin: string | MapCoordinate,
  destination: string | MapCoordinate,
  options?: {
    travelMode?: GoogleTravelMode;
    waypoints?: Array<string | MapCoordinate>;
  }
): string {
  const formatPoint = (pt: string | MapCoordinate): string => {
    if (typeof pt === 'string') return encodeURIComponent(pt);
    return `${pt.lat},${pt.lng}`;
  };

  const originStr = formatPoint(origin);
  const destStr = formatPoint(destination);
  const mode = options?.travelMode || 'driving';

  let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}&travelmode=${mode}`;

  if (options?.waypoints && options.waypoints.length > 0) {
    const waypointsStr = options.waypoints.map(formatPoint).join('%7C');
    url += `&waypoints=${waypointsStr}`;
  }

  return url;
}

/**
 * Generates an official zero-key Google Maps Place Search URL
 */
export function buildGoogleMapsPlaceSearchUrl(
  placeName: string,
  coords?: MapCoordinate
): string {
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}&query_place_id=${encodeURIComponent(placeName)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`;
}

/**
 * Computes bounding box and center coordinate for a set of points
 */
export function calculateMapCenterAndBounds(points: MapCoordinate[]): {
  center: MapCoordinate;
  bounds: { north: number; south: number; east: number; west: number };
  zoom: number;
} {
  if (points.length === 0) {
    return {
      center: { lat: 15.2993, lng: 74.124 },
      bounds: { north: 16, south: 14, east: 75, west: 73 },
      zoom: 10,
    };
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  points.forEach((p) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const center: MapCoordinate = {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };

  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  let zoom = 12;
  if (maxDiff > 30) zoom = 3;
  else if (maxDiff > 15) zoom = 4;
  else if (maxDiff > 6) zoom = 6;
  else if (maxDiff > 2) zoom = 8;
  else if (maxDiff > 0.8) zoom = 10;
  else if (maxDiff > 0.2) zoom = 12;
  else zoom = 14;

  return {
    center,
    bounds: { north: maxLat, south: minLat, east: maxLng, west: minLng },
    zoom,
  };
}
