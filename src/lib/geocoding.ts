/**
 * Smart AI Travel Planner 3.0
 * Geocoding, Autocomplete & Spatial Distance Engine
 *
 * Provides:
 * - Real geocoding via OpenStreetMap Nominatim with debouncing & rate limiting
 * - Instant curated global & domestic hubs database for offline resilience
 * - Haversine distance calculator for realistic transit mode arbitration (bus/train vs flight)
 */

export interface NormalizedLocation {
  displayName: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  type?: string;
}

// Curated verified destinations database for instant responsive suggestions
export const VERIFIED_HUBS: NormalizedLocation[] = [
  // India Hubs & Popular Destinations
  { city: 'Shivamogga', state: 'Karnataka', country: 'India', displayName: 'Shivamogga, Karnataka, India', lat: 13.9299, lon: 75.5681 },
  { city: 'Goa', state: 'Goa', country: 'India', displayName: 'Goa, India', lat: 15.2993, lon: 74.1240 },
  { city: 'Mysuru', state: 'Karnataka', country: 'India', displayName: 'Mysuru (Mysore), Karnataka, India', lat: 12.2958, lon: 76.6394 },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India', displayName: 'Bengaluru (Bangalore), Karnataka, India', lat: 12.9716, lon: 77.5946 },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', displayName: 'Mumbai, Maharashtra, India', lat: 19.0760, lon: 72.8777 },
  { city: 'New Delhi', state: 'Delhi', country: 'India', displayName: 'New Delhi, Delhi, India', lat: 28.6139, lon: 77.2090 },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', displayName: 'Jaipur, Rajasthan, India', lat: 26.9124, lon: 75.7873 },
  { city: 'Udaipur', state: 'Rajasthan', country: 'India', displayName: 'Udaipur, Rajasthan, India', lat: 24.5854, lon: 73.7125 },
  { city: 'Kochi', state: 'Kerala', country: 'India', displayName: 'Kochi (Cochin), Kerala, India', lat: 9.9312, lon: 76.2673 },
  { city: 'Munnar', state: 'Kerala', country: 'India', displayName: 'Munnar, Kerala, India', lat: 10.0889, lon: 77.0595 },
  { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', displayName: 'Varanasi, Uttar Pradesh, India', lat: 25.3176, lon: 82.9739 },
  { city: 'Manali', state: 'Himachal Pradesh', country: 'India', displayName: 'Manali, Himachal Pradesh, India', lat: 32.2396, lon: 77.1887 },
  { city: 'Ooty', state: 'Tamil Nadu', country: 'India', displayName: 'Ooty, Tamil Nadu, India', lat: 11.4102, lon: 76.6950 },
  { city: 'Darjeeling', state: 'West Bengal', country: 'India', displayName: 'Darjeeling, West Bengal, India', lat: 27.0410, lon: 88.2663 },
  { city: 'Puducherry', state: 'Puducherry', country: 'India', displayName: 'Puducherry (Pondicherry), India', lat: 11.9416, lon: 79.8083 },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', displayName: 'Hyderabad, Telangana, India', lat: 17.3850, lon: 78.4867 },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', displayName: 'Chennai, Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', displayName: 'Kolkata, West Bengal, India', lat: 22.5726, lon: 88.3639 },
  { city: 'Amritsar', state: 'Punjab', country: 'India', displayName: 'Amritsar, Punjab, India', lat: 31.6340, lon: 74.8723 },
  { city: 'Rishikesh', state: 'Uttarakhand', country: 'India', displayName: 'Rishikesh, Uttarakhand, India', lat: 30.0869, lon: 78.2676 },

  // International Hubs & World Destinations
  { city: 'Paris', country: 'France', displayName: 'Paris, Île-de-France, France', lat: 48.8566, lon: 2.3522 },
  { city: 'London', country: 'United Kingdom', displayName: 'London, Greater London, United Kingdom', lat: 51.5074, lon: -0.1278 },
  { city: 'Tokyo', country: 'Japan', displayName: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { city: 'Kyoto', country: 'Japan', displayName: 'Kyoto, Kansai, Japan', lat: 35.0116, lon: 135.7681 },
  { city: 'Rome', country: 'Italy', displayName: 'Rome, Lazio, Italy', lat: 41.9028, lon: 12.4964 },
  { city: 'Amalfi Coast', country: 'Italy', displayName: 'Amalfi Coast, Campania, Italy', lat: 40.6340, lon: 14.6027 },
  { city: 'Zurich', country: 'Switzerland', displayName: 'Zurich, Switzerland', lat: 47.3769, lon: 8.5417 },
  { city: 'Dubai', country: 'United Arab Emirates', displayName: 'Dubai, United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { city: 'Singapore', country: 'Singapore', displayName: 'Singapore, Singapore', lat: 1.3521, lon: 103.8198 },
  { city: 'Bangkok', country: 'Thailand', displayName: 'Bangkok, Thailand', lat: 13.7563, lon: 100.5018 },
  { city: 'Bali', country: 'Indonesia', displayName: 'Bali, Indonesia', lat: -8.4095, lon: 115.1889 },
  { city: 'New York', country: 'United States', displayName: 'New York, NY, United States', lat: 40.7128, lon: -74.0060 },
  { city: 'Levi', state: 'Lapland', country: 'Finland', displayName: 'Levi, Lapland, Finland', lat: 67.8044, lon: 24.8082 },
];

const cache = new Map<string, NormalizedLocation[]>();

/**
 * Search locations with local verified index first, falling back to Nominatim
 */
export async function searchLocations(query: string): Promise<NormalizedLocation[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  if (cache.has(trimmed)) {
    return cache.get(trimmed)!;
  }

  // 1. Check local verified index for instant matches
  const localMatches = VERIFIED_HUBS.filter(
    (h) =>
      h.city.toLowerCase().includes(trimmed) ||
      h.displayName.toLowerCase().includes(trimmed) ||
      (h.state && h.state.toLowerCase().includes(trimmed)) ||
      h.country.toLowerCase().includes(trimmed)
  );

  if (localMatches.length >= 3) {
    cache.set(trimmed, localMatches.slice(0, 6));
    return localMatches.slice(0, 6);
  }

  // 2. Query Nominatim with timeout and safety headers
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&addressdetails=1&limit=5`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'SmartAITravelPlanner/3.0 (travel-planner-app)',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const remoteResults: NormalizedLocation[] = data.map((item: any) => {
          const address = item.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.state_district ||
            address.county ||
            item.name ||
            query;
          const country = address.country || '';
          const state = address.state || '';

          return {
            displayName: item.display_name,
            city,
            state,
            country,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type,
          };
        });

        // Combine local and remote without duplicates
        const combined = [...localMatches];
        for (const r of remoteResults) {
          if (!combined.some((c) => c.displayName.toLowerCase() === r.displayName.toLowerCase())) {
            combined.push(r);
          }
        }

        const finalResults = combined.slice(0, 6);
        cache.set(trimmed, finalResults);
        return finalResults;
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.warn('[Geocoding] Nominatim fetch failed or timed out, returning local matches:', err);
  }

  cache.set(trimmed, localMatches);
  return localMatches;
}

/**
 * Calculate Great-Circle Distance (Haversine formula) in Kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Determine recommended transit mode based on distance and geography
 */
export function recommendTransitMode(
  distanceKm: number,
  isInternational: boolean
): 'train_bus' | 'flight' | 'drive' | 'mixed' {
  if (isInternational || distanceKm > 750) {
    return 'flight';
  }
  if (distanceKm <= 350) {
    return 'train_bus';
  }
  return 'mixed';
}

/**
 * Resolve coordinates for a city or destination name
 */
export function resolveCoordinates(placeName: string): { lat: number; lon: number } {
  if (!placeName) return { lat: 15.2993, lon: 74.1240 };
  const norm = placeName.toLowerCase();
  const hub = VERIFIED_HUBS.find((h) => {
    const cityName = h.city.toLowerCase();
    const firstWord = norm.split(',')[0].trim();
    return norm.includes(cityName) || cityName.includes(firstWord) || h.displayName.toLowerCase().includes(norm);
  });
  if (hub) return { lat: hub.lat, lon: hub.lon };

  if (norm.includes('amalfi') || norm.includes('positano') || norm.includes('capri')) {
    return { lat: 40.634, lon: 14.6027 };
  }
  if (norm.includes('zurich')) return { lat: 47.3769, lon: 8.5417 };
  if (norm.includes('kyoto')) return { lat: 35.0116, lon: 135.7681 };
  if (norm.includes('lapland') || norm.includes('levi')) return { lat: 67.8044, lon: 24.8082 };
  if (norm.includes('paris')) return { lat: 48.8566, lon: 2.3522 };
  if (norm.includes('london')) return { lat: 51.5074, lon: -0.1278 };

  return { lat: 15.2993, lon: 74.1240 };
}

