# Smart AI Travel Planner 3.0 — Real Destination Photography (Unsplash API)

Smart AI Travel Planner 3.0 features an official integration with the **Unsplash API**, delivering authentic, high-resolution travel photography across all destinations, itinerary stops, landmark recommendations, saved trips, and interactive maps.

All synthetic AI image generation, cartoon illustrations, and vector SVGs have been completely removed in favor of verified, real-world travel photography.

---

## 1. Unsplash API Integration Overview

- **Source:** Official Unsplash API (`https://api.unsplash.com`)
- **Authentication:** Public authentication using HTTP `Authorization: Client-ID <UNSPLASH_ACCESS_KEY>` header
- **Hotlinking:** Compliant with Unsplash's hotlinking policy, serving images directly from `images.unsplash.com` CDN
- **Attribution:** Compliant with Unsplash attribution guidelines, linking to the photographer's profile and Unsplash with required UTM parameters (`utm_source=aetheris_travel_planner&utm_medium=referral`)
- **Download Tracking:** Fires download/view tracking to `download_location` endpoints via server proxy (`/api/unsplash/track-download`)

---

## 2. Environment Setup

Create or update your `.env` file based on `.env.example`:

```env
# Unsplash API Credentials
UNSPLASH_ACCESS_KEY=your_access_key
UNSPLASH_SECRET_KEY=your_secret_key
UNSPLASH_APPLICATION_ID=your_application_id

# Google AI & Gemini API (For itinerary intelligence & concierge)
GEMINI_API_KEY=your_gemini_api_key

# Google Maps Platform (Optional for interactive maps)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### How to obtain Unsplash API Keys:
1. Go to the [Unsplash Developer Portal](https://unsplash.com/developers).
2. Log in or create a free Unsplash account.
3. Click **"New Application"** and accept the API Terms of Use.
4. Name your application (e.g. `Smart AI Travel Planner`).
5. Copy your **Access Key**, **Secret Key**, and **Application ID** into your `.env` file.
6. **Note on Rate Limits:**
   - **Demo Mode:** 50 requests per hour (sufficient for development and testing).
   - **Production Approval:** Once ready, submit your app on the Unsplash dashboard for production approval to unlock 5,000 requests per hour.

---

## 3. Server Architecture & Security

To guarantee that your **Secret Key** and **Access Key** are never exposed to browser clients, search requests are mediated by the Express backend:

- `GET /api/unsplash/search?placeName={attraction}&destination={city, country}`:
  - Validates input parameters.
  - Queries `https://api.unsplash.com/search/photos` with server-side authorization.
  - Implements multi-level query fallbacks:
    1. Exact landmark with city (`"Mysore Palace Mysuru"`)
    2. Landmark name (`"Mysore Palace"`)
    3. Destination landmark (`"Mysuru landmark India"`)
  - Caches results in-memory with a 2-hour TTL.
  - Deduplicates concurrent in-flight requests.
- `POST /api/unsplash/track-download`:
  - Triggers Unsplash download tracking per API terms without exposing keys.

---

## 4. Fallback & Error Handling Pipeline

When searching for destination imagery:
1. **Curated High-Res Unsplash Archive:** Curated landmarks (e.g. Mysore Palace, Chamundi Hill, Devaraja Market, Brindavan Gardens, Amalfi Coast, Kyoto Arashiyama, Finnish Lapland, Goa, etc.) load instantly.
2. **Dynamic Unsplash Search:** Any custom or generated destination queries the Unsplash API live.
3. **Pre-Validation:** Images are verified via browser preloading before being marked as loaded.
4. **Graceful Fallbacks:**
   - **No Matching Photos:** Displays a neutral placeholder with the attraction name, destination, and a **Retry** button.
   - **Service Unavailable:** If `UNSPLASH_ACCESS_KEY` is not yet configured or an API error occurs, displays a clear status and configuration hint with a **Retry** button.
   - **Zero AI Illustrations:** No cartoon buildings, SVGs, or AI generation fallbacks are ever displayed.

---

## 5. Development & Testing Commands

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run TypeScript type check & linter
npm run lint

# Production build
npm run build
```
