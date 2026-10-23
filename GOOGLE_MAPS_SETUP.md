# Google Maps Platform Integration & Setup Guide

Smart AI Travel Planner 3.0 integrates official **Google Maps Platform** services:
- **Maps JavaScript API** (via `@vis.gl/react-google-maps`) for interactive maps, custom pins, and viewports.
- **Routes API** for multi-modal route corridors, geodesic travel arcs, and live turn-by-turn routing.
- **Google Maps Navigation URLs** (`https://www.google.com/maps/dir/?api=1...`) for zero-key native navigation and mobile routing.

---

## 1. Quick Start (AI Studio Auto-Provisioned Key)

If you are running inside Google AI Studio, a Google Maps Demo Key is automatically provisioned and injected as `VITE_GOOGLE_MAPS_API_KEY`. No manual configuration is required for immediate testing.

---

## 2. Production Setup (Bring Your Own Key)

To use your own Google Cloud project in production:

### Step A: Create a Cloud Project & Enable APIs
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your project.
3. Enable the following APIs from **APIs & Services > Library**:
   - **Maps JavaScript API** (Required for in-app interactive map rendering)
   - **Routes API** (Required for path and transit computation)
   - **Places API (New)** (Optional, for location intelligence and autocomplete)
   - **Geocoding API** (Optional, for coordinate resolution)

### Step B: Create and Restrict the Client (Browser) API Key
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > API key**.
3. Under **Key restrictions**:
   - **Application restrictions**: Select **Websites (HTTP referrers)**.
   - Add your domains (e.g. `http://localhost:*`, `https://your-domain.run.app/*`).
   - **API restrictions**: Restrict key to **Maps JavaScript API**, **Routes API**, and **Places API (New)**.
4. Copy the API key and set it in your `.env`:
   ```bash
   VITE_GOOGLE_MAPS_API_KEY="AIzaSy..."
   ```

### Step C: Optional Server-Side API Key
If executing server-side route optimization or geocoding in `server.ts`:
1. Create a second API key in the Google Cloud Console.
2. Restrict it by **IP address** (your server's outbound IP) rather than HTTP referrers.
3. Restrict APIs to **Routes API** and **Geocoding API**.
4. Set in your `.env` (never expose this key to the browser):
   ```bash
   GOOGLE_MAPS_SERVER_KEY="AIzaSy..."
   ```

---

## 3. Zero-Key Fallback Experience

If `VITE_GOOGLE_MAPS_API_KEY` is not configured or fails:
- The app gracefully notifies the user with a setup guidance banner.
- Users can click **"Open in Google Maps"** on any itinerary stop or route corridor. This generates official Google Maps URL schemes (`https://www.google.com/maps/dir/?api=1&origin=...&destination=...&travelmode=...`) requiring zero API keys, providing instant directions and mobile navigation.
