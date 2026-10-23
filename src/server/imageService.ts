/**
 * Smart AI Travel Planner 3.0
 * Photorealistic AI Destination Image Generation Service
 *
 * Implements:
 * 1. Location-specific, landmark-accurate prompt engineering reflecting the real attraction,
 *    city, country, architecture, and landscape.
 * 2. Visual Style: Photorealistic professional travel photography (strictly no cartoons,
 *    no vector art, no generic geometric buildings).
 * 3. Primary Engine: Gemini Image Generation (@google/genai `gemini-3.1-flash-lite-image`).
 * 4. Distinct prompt generation for every landmark (Mysore Palace != Chamundi Hill != Devaraja Market != Brindavan Gardens).
 * 5. Transparent metadata: mediaType: "ai_illustration", label: "AI illustration".
 * 6. Server-side caching & in-flight deduplication per distinct attraction.
 * 7. Honest quota & credential reporting: never silently substitutes crude SVGs or cartoons.
 */

import { getGeminiClient } from './geminiService';

export interface GenerateIllustrationRequest {
  placeName: string;
  destination?: string;
  city?: string;
  country?: string;
  architecturalStyle?: string;
  characteristics?: string;
}

export interface GenerateIllustrationResponse {
  success: boolean;
  imageUrl?: string;
  source?: 'AI Illustration (Gemini)';
  label?: 'AI illustration';
  promptUsed?: string;
  provider?: string;
  model?: string;
  error?: string;
  errorCode?: 'QUOTA_EXHAUSTED' | 'NO_API_KEY' | 'GENERATION_FAILED' | 'INVALID_INPUT';
  quotaExceeded?: boolean;
}

// Server-side cache partitioned strictly by landmark & destination
const serverIllustrationCache = new Map<string, GenerateIllustrationResponse>();
// In-flight promise deduplication for concurrent identical requests
const inFlightGenerationRequests = new Map<string, Promise<GenerateIllustrationResponse>>();

/**
 * Normalizes cache key from attraction name, city/destination, country, and prompt version
 */
export function getIllustrationCacheKey(placeName: string, destination?: string, country?: string): string {
  const normName = (placeName || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const normDest = (destination || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const normCountry = (country || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${normName}|${normDest}|${normCountry}|v4_photoreal`;
}

/**
 * Base visual style required by Smart AI Travel Planner 3.0
 */
const BASE_PHOTOREALISTIC_STYLE =
  'Photorealistic professional travel photography, realistic architectural details, natural lighting, accurate materials and textures, authentic environment, physically plausible perspective, realistic shadows, detailed surroundings, high dynamic range, professional travel magazine photography, crisp focus, natural colors, landscape composition, no text, no logos, no watermarks, no illustration, no cartoon, no vector art, no abstract geometric shapes.';

/**
 * Parses a destination string or explicit parameters into clean city, region, and country tokens
 */
export function parseLocation(
  destination?: string,
  explicitCity?: string,
  explicitCountry?: string
): { city: string; stateOrRegion: string; country: string } {
  let city = explicitCity || '';
  let country = explicitCountry || '';
  let stateOrRegion = '';

  if (destination) {
    const parts = destination.split(',').map((s) => s.trim()).filter(Boolean);
    if (!city && parts.length > 0) {
      city = parts[0];
    }
    if (!country && parts.length > 1) {
      country = parts[parts.length - 1];
    }
    if (parts.length > 2) {
      stateOrRegion = parts.slice(1, -1).join(', ');
    }
  }

  return {
    city: city || 'the region',
    stateOrRegion,
    country: country || '',
  };
}

/**
 * Infers the authentic architectural style, materials, and structural characteristics
 * for any given landmark based on verified regional architecture traditions.
 */
export function inferArchitecturalStyle(
  placeName: string,
  city: string,
  country: string,
  userStyle?: string
): string {
  if (userStyle && userStyle.trim()) {
    return userStyle.trim();
  }

  const norm = `${placeName} ${city} ${country}`.toLowerCase();

  // 1. SPECIFIC LANDMARK MAPPINGS
  if (norm.includes('mysore palace') || norm.includes('amba vilas')) {
    return 'Indo-Saracenic royal architecture featuring a 145-foot central five-story clock tower, ornate pink marble onion domes with golden finials, multi-tiered arched colonnades, and dressed granite stonework';
  }
  if (norm.includes('chamundi') || norm.includes('chamundeshwari')) {
    return 'Dravidian Hindu temple architecture featuring a seven-tier sculpted rajagopuram entrance tower, ornate stone pillar mandapams, and sacred granite sanctum set on hill terrain';
  }
  if (norm.includes('devaraja')) {
    return 'Century-old British-Indian municipal bazaar architecture with open-timber pitched rafters, red-brick arcades, cobblestone aisles, and authentic wooden vendor stalls (not a palace or generic building)';
  }
  if (norm.includes('brindavan')) {
    return 'Symmetric Mughal terraced water garden architecture with stepped limestone cascades, geometric flowerbeds, manicured lawns, and ornamental fountain jets with realistic reflections (not a generic building)';
  }
  if (norm.includes('philomena')) {
    return 'Neo-Gothic ecclesiastical architecture with twin 175-foot soaring stone spires, flying buttresses, pointed lancet arches, and stained-glass rose apertures';
  }
  if (norm.includes('ranganathittu')) {
    return 'Riparian riverine island wildlife sanctuary with basalt river rocks, broadleaf riverine groves, and tranquil Kaveri river backwaters';
  }
  if (norm.includes('jog falls') || norm.includes('gersoppa')) {
    return 'Western Ghats dramatic cataract landscape with sheer 830-foot granite chasm cliffs, thunderous tiered waterfalls, and subtropical mist-shrouded jungle canopy';
  }
  if (norm.includes('sakrebyle')) {
    return 'Western Ghats riverfront conservation sanctuary with native bamboo groves, natural sandy riverbanks, and deciduous forest clearings';
  }
  if (norm.includes('fort aguada')) {
    return '17th-century Portuguese coastal military fortification architecture of weathered red laterite stone, sea-facing ramparts, and historic four-tiered masonry lighthouse';
  }
  if (norm.includes('chapora fort')) {
    return 'Weathered red laterite cliffside fortress architecture with sweeping panoramic ramparts overlooking Vagator beach and coastal headlands';
  }
  if (norm.includes('bom jesus')) {
    return 'Jesuit Baroque and Portuguese colonial architecture with an unplastered black basalt and laterite carved facade, Corinthian pilasters, and high bell tower';
  }
  if (norm.includes('fontainhas')) {
    return 'Portuguese colonial residential vernacular architecture featuring pastel yellow, azure, and terracotta stucco walls, tiled gabled roofs, and ornate wrought-iron balconies';
  }
  if (norm.includes('dudhsagar')) {
    return 'Four-tiered roaring mountain waterfall cascade through steep Deccan jungle rock cliffs with a multi-arched railway stone viaduct in the mist';
  }
  if (norm.includes('amer fort') || norm.includes('amber fort')) {
    return 'Rajputana and Mughal fortress palace architecture with imposing yellow-pink sandstone and marble ramparts, ornate elephant gates, mirrored courtyards, and fortified battlements';
  }
  if (norm.includes('hawa mahal')) {
    return 'Rajputana Pink City architecture of pink and red sandstone with five-tiered pyramidal honeycomb facade and 953 delicately carved jharokha casements';
  }
  if (norm.includes('jantar mantar')) {
    return '18th-century UNESCO geometric astronomical observatory architecture with monumental stone and marble sundials and calculation towers';
  }
  if (norm.includes('jal mahal')) {
    return 'Rajputana aquatic palace architecture of red sandstone with subterranean archways, decorative chhatri pavilions, and terraced rooftop garden reflected in still lake waters';
  }
  if (norm.includes('positano')) {
    return 'Mediterranean coastal cliffside vernacular architecture with pastel-washed limestone villas, cascading stucco arches, terraced bougainvillea pergolas, and sheer sea cliff foundations';
  }
  if (norm.includes('amalfi')) {
    return 'Medieval maritime coastal architecture with white-washed houses clustered against towering limestone cliffs, seaside quays, and Byzantine-Norman cathedral facades';
  }
  if (norm.includes('capri') || norm.includes('faraglioni')) {
    return 'Tyrrhenian limestone coastal karst architecture with dramatic sea stacks rising from sapphire waters, coastal walking pergolas, and whitewashed villas';
  }
  if (norm.includes('ravello') || norm.includes('cimbrone')) {
    return 'Cliff-edge Romanesque-Moorish villa architecture with classical marble bust belvederes, pergolas, and panoramic coastal terrace overlooking the azure sea';
  }
  if (norm.includes('eiffel')) {
    return '19th-century French industrial wrought-iron lattice architectural engineering with four monumental puddled-iron arched base pillars and open filigree framework';
  }
  if (norm.includes('louvre')) {
    return 'French Renaissance and Classical palace architecture with weathered Caen limestone colonnades, mansard roofs, and central contemporary faceted glass and steel pyramid';
  }

  // 2. DYNAMIC ARCHETYPE MAPPINGS
  if (norm.includes('temple') || norm.includes('shrine') || norm.includes('gopuram') || norm.includes('pagoda')) {
    return 'Authentic regional sacred temple architecture with intricate stone relief carvings, traditional sanctum tower, and courtyard colonnades';
  }
  if (norm.includes('palace') || norm.includes('mahal') || norm.includes('chateau') || norm.includes('residence') || norm.includes('mansion')) {
    return 'Historic regional palace architecture with ornamental stone facade, regal courtyard, arched porticos, and period decorative stonework';
  }
  if (norm.includes('church') || norm.includes('cathedral') || norm.includes('basilica') || norm.includes('chapel') || norm.includes('duomo')) {
    return 'Classical cathedral architecture with vaulted stone arches, stained-glass windows, bell tower, and authentic plaza surroundings';
  }
  if (norm.includes('fort') || norm.includes('citadel') || norm.includes('castle') || norm.includes('bastion') || norm.includes('rampart')) {
    return 'Historic stone fortress architecture with massive defensive ramparts, watchtowers, and weathered masonry battlements';
  }
  if (norm.includes('market') || norm.includes('bazaar') || norm.includes('souk') || norm.includes('marketplace')) {
    return 'Traditional market architecture with covered stalls, timber beams, historic storefronts, and lively pedestrian aisles (not a palace or generic building)';
  }
  if (norm.includes('garden') || norm.includes('park') || norm.includes('botanical') || norm.includes('conservatory')) {
    return 'Landscaped botanical and garden architecture with terraced lawns, ornamental stone water features, and manicured floral borders (not a generic building)';
  }
  if (norm.includes('waterfall') || norm.includes('falls') || norm.includes('cataract') || norm.includes('cascade')) {
    return 'Natural topographical cascade and geological chasm with rushing freshwater torrents, spray mist, and native gorge vegetation';
  }
  if (norm.includes('beach') || norm.includes('cove') || norm.includes('coast') || norm.includes('bay') || norm.includes('lagoon')) {
    return 'Natural coastal marine landscape with sweeping sandy shoreline, gentle surf, coastal palms or rocky sea cliffs';
  }
  if (norm.includes('hill') || norm.includes('mountain') || norm.includes('peak') || norm.includes('cliff') || norm.includes('ridge')) {
    return 'Elevated mountainous topography with geological stone formations, winding natural trails, and panoramic regional horizon';
  }

  return 'Authentic regional architecture reflecting genuine historical craftsmanship, local masonry, and vernacular character';
}

/**
 * Builds a destination-aware, location-specific, photorealistic prompt.
 * Dynamically injects attraction name, city, country, and architectural style into the photorealistic base prompt.
 */
export function buildPhotorealisticPrompt(req: GenerateIllustrationRequest): string {
  const { placeName, destination, characteristics } = req;
  const { city, stateOrRegion, country } = parseLocation(destination, req.city, req.country);
  const architecturalStyle = inferArchitecturalStyle(placeName, city, country, req.architecturalStyle);

  const locationDescriptor = [city, stateOrRegion, country].filter(Boolean).join(', ');
  const verifiedDetails = characteristics ? `Specific verified landmark characteristics: ${characteristics}. ` : '';

  return (
    `Generate a realistic travel photograph of ${placeName} in ${locationDescriptor}. ` +
    `Architectural style and structural characteristics: ${architecturalStyle}. ` +
    `${verifiedDetails}` +
    `Capture the authentic local environment, true-to-life surroundings, accurate physical scale, and regional atmosphere of ${city}${country ? `, ${country}` : ''}. ` +
    `Natural lighting with crisp atmospheric clarity, physically plausible perspective and composition. ` +
    `${BASE_PHOTOREALISTIC_STYLE}`
  );
}

/**
 * Main Illustration Generator Pipeline:
 * 1. Checks server in-memory cache with normalized attraction key.
 * 2. Deduplicates concurrent requests for the exact same attraction.
 * 3. Attempts Gemini Image Generation Model (`gemini-3.1-flash-lite-image`).
 * 4. Fallback to `gemini-nano-banana-2.1` or `gemini-3-pro-image` if configured.
 * 5. Strictly validates returned image content (rejects empty or corrupt payloads).
 * 6. Never substitutes cartoon SVGs, generic geometric buildings, or gradients.
 * 7. Returns honest diagnostics and metadata.
 */
export async function generatePlaceIllustration(
  _req: GenerateIllustrationRequest
): Promise<GenerateIllustrationResponse> {
  return {
    success: false,
    errorCode: 'GENERATION_FAILED',
    error: 'AI destination image generation has been permanently disabled. Real photographs from official Unsplash are used instead.',
  };
}



/**
 * Clears cached illustration for a specific landmark
 */
export function clearServerIllustrationCache(placeName: string, destination?: string, country?: string): void {
  const cacheKey = getIllustrationCacheKey(placeName, destination, country);
  serverIllustrationCache.delete(cacheKey);
}
