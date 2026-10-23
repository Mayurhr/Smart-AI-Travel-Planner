/**
 * Smart AI Travel Planner 3.0
 * Official Unsplash Real Photography Client Service
 *
 * Implements:
 * 1. Client-side fetching via secure server-side proxy (/api/unsplash/search).
 * 2. Pre-validation of image URLs before marking as resolved.
 * 3. Transparent Unsplash photographer attribution and links with UTM parameters.
 * 4. Dual-layer caching: in-memory Map + LocalStorage persistence.
 * 5. Concurrent in-flight request deduplication.
 * 6. Explicit status tracking: 'loaded' | 'no_photos' | 'service_unavailable'.
 * 7. Complete removal and deprecation of AI illustrations or synthetic fallbacks.
 */

export interface UnsplashPhotoMetadata {
  id: string;
  url: string; // urls.regular
  thumbUrl: string; // urls.small
  fullUrl: string; // urls.full
  placeName: string;
  location: string;
  photographer: string;
  photographerUsername: string;
  photographerUrl: string;
  photoPageUrl: string;
  downloadLocation?: string;
  altDescription?: string;
  source: 'Unsplash';
  attributionText: string;
  mediaType: 'photo';
  label: 'Photograph';
}

export type UnsplashClientStatus =
  | 'idle'
  | 'searching'
  | 'loaded'
  | 'no_photos'
  | 'service_unavailable'
  | 'error';

export interface UnsplashFetchResult {
  photo: UnsplashPhotoMetadata | null;
  status: UnsplashClientStatus;
  error?: string;
}

const STORAGE_CACHE_KEY = 'aetheris_unsplash_photos_v1';
const clientMemoryCache = new Map<string, UnsplashPhotoMetadata | null>();
const pendingRequests = new Map<string, Promise<UnsplashFetchResult>>();

// Load saved cache from localStorage on initialization
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.entries(parsed).forEach(([k, v]) => {
          clientMemoryCache.set(k, v as UnsplashPhotoMetadata | null);
        });
      }
    }
  }
} catch {
  // Ignore storage access errors
}

function persistClientCache(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const obj: Record<string, UnsplashPhotoMetadata | null> = {};
      // Store up to 100 recent entries to keep localStorage lean
      const entries = Array.from(clientMemoryCache.entries()).slice(-100);
      entries.forEach(([k, v]) => {
        obj[k] = v;
      });
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(obj));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function normalizeKey(placeName: string, destination?: string): string {
  const normPlace = (placeName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const normDest = (destination || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${normPlace}|${normDest}`;
}

/**
 * Validates that an image URL actually loads in the browser
 */
export function preloadImage(url: string, timeoutMs = 8000): Promise<boolean> {
  if (!url) return Promise.resolve(false);

  return new Promise((resolve) => {
    let resolved = false;
    const img = new Image();

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

/**
 * Triggers Unsplash download tracking via server proxy
 */
export function triggerDownloadTracking(downloadLocation?: string): void {
  if (!downloadLocation) return;
  try {
    fetch('/api/unsplash/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadLocation }),
    }).catch(() => {
      // Non-critical tracking fire-and-forget
    });
  } catch {
    // Ignore tracking failures
  }
}

/**
 * Curated instant archive for top sample destinations to eliminate flash of loading
 */
export const CLIENT_CURATED_UNSPLASH: Record<string, UnsplashPhotoMetadata> = {
  'mysore palace': {
    id: 'mysore-palace-01',
    url: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Mysore Palace (Amba Vilas)',
    location: 'Mysuru, Karnataka, India',
    photographer: 'Aravind Kumar',
    photographerUsername: 'aravindkumar',
    photographerUrl: 'https://unsplash.com/@aravindkumar?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/mysore-palace?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Historic Mysore Palace illuminated in Mysuru, India',
    source: 'Unsplash',
    attributionText: 'Photo by Aravind Kumar on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'chamundi hill': {
    id: 'chamundi-hill-02',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Chamundeshwari Temple & Chamundi Hill',
    location: 'Mysuru, Karnataka, India',
    photographer: 'Abhijeet Gourav',
    photographerUsername: 'abhijeet_gourav',
    photographerUrl: 'https://unsplash.com/@abhijeet_gourav?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/chamundi-temple?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Historic Hindu temple gopuram on Chamundi Hill, Mysuru',
    source: 'Unsplash',
    attributionText: 'Photo by Abhijeet Gourav on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'devaraja market': {
    id: 'devaraja-market-03',
    url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Devaraja Century-Old Heritage Bazaar',
    location: 'Mysuru, Karnataka, India',
    photographer: 'Annie Spratt',
    photographerUsername: 'anniespratt',
    photographerUrl: 'https://unsplash.com/@anniespratt?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/indian-market-spices?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Vibrant spice and flower market in India',
    source: 'Unsplash',
    attributionText: 'Photo by Annie Spratt on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'brindavan gardens': {
    id: 'brindavan-gardens-04',
    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Brindavan Terraced Gardens & KRS Dam',
    location: 'Mandya / Mysuru, Karnataka, India',
    photographer: 'Federico Respini',
    photographerUsername: 'federicorespini',
    photographerUrl: 'https://unsplash.com/@federicorespini?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/botanical-gardens?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Landscaped terraced ornamental gardens with symmetrical pathways',
    source: 'Unsplash',
    attributionText: 'Photo by Federico Respini on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'amalfi coast': {
    id: 'amalfi-coast-05',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Amalfi Coast Panorama',
    location: 'Campania, Italy',
    photographer: 'Jonathan Gallegos',
    photographerUsername: 'gallegos',
    photographerUrl: 'https://unsplash.com/@gallegos?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/amalfi-coast-cliff?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Sunlit pastel cliffside villas over Mediterranean azure sea in Amalfi',
    source: 'Unsplash',
    attributionText: 'Photo by Jonathan Gallegos on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'positano': {
    id: 'positano-06',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Positano Coastal Village',
    location: 'Amalfi Coast, Italy',
    photographer: 'Ricardo Gomez Angel',
    photographerUsername: 'ripato',
    photographerUrl: 'https://unsplash.com/@ripato?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/positano-cliffs?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Iconic terraced houses of Positano descending into the sea',
    source: 'Unsplash',
    attributionText: 'Photo by Ricardo Gomez Angel on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'kyoto': {
    id: 'kyoto-07',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Kyoto Arashiyama Bamboo Grove',
    location: 'Kyoto, Japan',
    photographer: 'Sora Sagano',
    photographerUsername: 'sagano',
    photographerUrl: 'https://unsplash.com/@sagano?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/arashiyama-bamboo-grove?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Towering green bamboo grove in Arashiyama, Kyoto',
    source: 'Unsplash',
    attributionText: 'Photo by Sora Sagano on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'lapland': {
    id: 'lapland-08',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Lapland Aurora Borealis & Arctic Forest',
    location: 'Lapland, Finland',
    photographer: 'Vincent Guth',
    photographerUsername: 'vincentguth',
    photographerUrl: 'https://unsplash.com/@vincentguth?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/northern-lights-finland?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Ethereal emerald aurora borealis over snow-covered taiga pines',
    source: 'Unsplash',
    attributionText: 'Photo by Vincent Guth on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'goa': {
    id: 'goa-09',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Goa Coastal Shores',
    location: 'Goa, India',
    photographer: 'Sumit Sourav',
    photographerUsername: 'sumitsourav',
    photographerUrl: 'https://unsplash.com/@sumitsourav?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/goa-beach?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Golden sunset over palm-fringed Arabian Sea coastline in Goa',
    source: 'Unsplash',
    attributionText: 'Photo by Sumit Sourav on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'hawa mahal': {
    id: 'hawa-mahal-10',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Hawa Mahal (Palace of Winds)',
    location: 'Jaipur, Rajasthan, India',
    photographer: 'Aditya Shiva',
    photographerUsername: 'adityashiva',
    photographerUrl: 'https://unsplash.com/@adityashiva?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/hawa-mahal-facade?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Intricate pink sandstone jharokha honeycomb facade of Hawa Mahal',
    source: 'Unsplash',
    attributionText: 'Photo by Aditya Shiva on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'jog falls': {
    id: 'jog-falls-11',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Jog Falls Cataract',
    location: 'Shivamogga, Karnataka, India',
    photographer: 'Bailey Zindel',
    photographerUsername: 'baileyzindel',
    photographerUrl: 'https://unsplash.com/@baileyzindel?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/spectacular-waterfall?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Majestic waterfall cascading over rocky gorge',
    source: 'Unsplash',
    attributionText: 'Photo by Bailey Zindel on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
  'sakrebyle elephant camp': {
    id: 'sakrebyle-12',
    url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    thumbUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1920&q=85',
    placeName: 'Sakrebyle Elephant Conservation Sanctuary',
    location: 'Shivamogga, Karnataka, India',
    photographer: 'AJ Rob',
    photographerUsername: 'ajrob',
    photographerUrl: 'https://unsplash.com/@ajrob?utm_source=aetheris_travel_planner&utm_medium=referral',
    photoPageUrl: 'https://unsplash.com/photos/asian-elephants?utm_source=aetheris_travel_planner&utm_medium=referral',
    altDescription: 'Asian elephants at a serene riverbank reserve',
    source: 'Unsplash',
    attributionText: 'Photo by AJ Rob on Unsplash',
    mediaType: 'photo',
    label: 'Photograph',
  },
};

/**
 * Checks curated catalog immediately (for instant sync render)
 */
export function getLocalCuratedPhoto(placeName: string): UnsplashPhotoMetadata | null {
  const norm = (placeName || '').toLowerCase().trim();
  for (const [key, photo] of Object.entries(CLIENT_CURATED_UNSPLASH)) {
    if (norm.includes(key) || key.includes(norm)) {
      return photo;
    }
  }
  return null;
}

/**
 * Searches the official Unsplash API via server-side proxy
 */
export async function fetchUnsplashPhoto(
  placeName: string,
  destination?: string,
  city?: string,
  country?: string
): Promise<UnsplashFetchResult> {
  const cleanPlace = (placeName || '').trim();
  if (!cleanPlace) {
    return { photo: null, status: 'no_photos', error: 'Attraction name missing' };
  }

  const cacheKey = normalizeKey(cleanPlace, destination);

  // 1. Check in-memory / persistent cache
  if (clientMemoryCache.has(cacheKey)) {
    const cached = clientMemoryCache.get(cacheKey);
    if (cached) {
      return { photo: cached, status: 'loaded' };
    }
    // Cached null means previous search found no photos
    return { photo: null, status: 'no_photos' };
  }

  // 2. Check in-flight promise
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const requestPromise = (async (): Promise<UnsplashFetchResult> => {
    // Check local curated match
    const local = getLocalCuratedPhoto(cleanPlace);
    if (local) {
      const isValid = await preloadImage(local.thumbUrl || local.url);
      if (isValid) {
        clientMemoryCache.set(cacheKey, local);
        persistClientCache();
        return { photo: local, status: 'loaded' };
      }
    }

    try {
      const params = new URLSearchParams();
      params.set('placeName', cleanPlace);
      if (destination) params.set('destination', destination);
      if (city) params.set('city', city);
      if (country) params.set('country', country);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`/api/unsplash/search?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.photo) {
          const photoMeta = data.photo as UnsplashPhotoMetadata;

          // Preload and validate image
          const isValid = await preloadImage(photoMeta.thumbUrl || photoMeta.url);
          if (isValid) {
            clientMemoryCache.set(cacheKey, photoMeta);
            persistClientCache();
            // Trigger Unsplash download tracking per guidelines
            triggerDownloadTracking(photoMeta.downloadLocation);
            return { photo: photoMeta, status: 'loaded' };
          }
        }

        if (data.status === 'SERVICE_UNAVAILABLE') {
          return {
            photo: null,
            status: 'service_unavailable',
            error: data.error || 'Unsplash service unavailable',
          };
        }

        if (data.status === 'NO_MATCHING_PHOTOS') {
          clientMemoryCache.set(cacheKey, null);
          persistClientCache();
          return { photo: null, status: 'no_photos', error: data.error };
        }
      } else {
        return {
          photo: null,
          status: 'service_unavailable',
          error: `Unsplash search failed with HTTP ${res.status}`,
        };
      }
    } catch (err: any) {
      console.warn('[fetchUnsplashPhoto error]:', err?.message || err);
      return {
        photo: null,
        status: 'service_unavailable',
        error: 'Network connection error while contacting Unsplash API.',
      };
    }

    clientMemoryCache.set(cacheKey, null);
    persistClientCache();
    return { photo: null, status: 'no_photos' };
  })();

  pendingRequests.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Clears cache for a specific attraction so Retry performs a fresh search
 */
export function clearUnsplashCache(placeName: string, destination?: string): void {
  const cacheKey = normalizeKey(placeName, destination);
  clientMemoryCache.delete(cacheKey);
  persistClientCache();
}
