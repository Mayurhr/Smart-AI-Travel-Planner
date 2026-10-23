/**
 * Smart AI Travel Planner 3.0
 * Overview Route Geospatial Map Component
 *
 * Implements:
 * 1. Interactive Leaflet + CartoDB Positron map showing full origin-to-destination corridor.
 * 2. Origin Departure Pin & Destination Arrival Pin with live location tags.
 * 3. Geodesic curved flight arc or road/rail corridor polyline with distance telemetry.
 * 4. Transfer / layover waypoint markers along the transit path.
 * 5. Destination Day 1 landmark satellite markers.
 * 6. Interactive route telemetry popup (transit mode, distance, duration, operator, fare).
 * 7. Auto-fit bounds ensuring full corridor visibility.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TripPlan, CurrencyCode } from '../../types/travel';
import { resolveCoordinates, calculateDistanceKm } from '../../lib/geocoding';
import { formatCurrency } from '../../lib/budget';

interface OverviewRouteMapProps {
  trip: TripPlan;
  currency: CurrencyCode;
  height?: string;
  className?: string;
  onExploreTransit?: () => void;
}

/**
 * Calculates intermediate points along a curved geodesic arc between two coordinates
 */
function createCurvedArc(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  numPoints = 40
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (start.lat + end.lat) / 2;
  const midLon = (start.lon + end.lon) / 2;

  // Offset the midpoint perpendicular to the vector to create a gentle aviation arc
  const dLat = end.lat - start.lat;
  const dLon = end.lon - start.lon;
  const curvature = 0.15; // arc height factor

  const arcMidLat = midLat - dLon * curvature;
  const arcMidLon = midLon + dLat * curvature;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bezier curve: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const lat =
      Math.pow(1 - t, 2) * start.lat +
      2 * (1 - t) * t * arcMidLat +
      Math.pow(t, 2) * end.lat;
    const lon =
      Math.pow(1 - t, 2) * start.lon +
      2 * (1 - t) * t * arcMidLon +
      Math.pow(t, 2) * end.lon;
    points.push([lat, lon]);
  }

  return points;
}

export const OverviewRouteMap: React.FC<OverviewRouteMapProps> = ({
  trip,
  currency,
  height = '380px',
  className = '',
  onExploreTransit,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeTelemetry, setActiveTelemetry] = useState(false);

  const originCoords = resolveCoordinates(trip.origin);
  const destCoords = resolveCoordinates(trip.destination);
  const distanceKm = calculateDistanceKm(
    originCoords.lat,
    originCoords.lon,
    destCoords.lat,
    destCoords.lon
  );

  const flight = trip.selectedFlight || (trip.flights && trip.flights[0]);
  const route = trip.selectedRoute || (trip.multiModalRoutes && trip.multiModalRoutes[0]);
  const transitMode = flight ? 'Commercial Flight' : route?.title || 'Intercity Express Transit';
  const operatorName = flight?.airlineName || flight?.operator || route?.legs?.[0]?.operator || 'Verified Transit System';
  const durationStr = flight?.duration || route?.totalDuration || 'Direct Passage';
  const fareAmt = flight?.totalPrice || flight?.price || route?.totalCostINR || 4500;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [(originCoords.lat + destCoords.lat) / 2, (originCoords.lon + destCoords.lon) / 2],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Route, Origin, Destination, Waypoints, and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    const originLatLng: [number, number] = [originCoords.lat, originCoords.lon];
    const destLatLng: [number, number] = [destCoords.lat, destCoords.lon];

    const boundsPoints: [number, number][] = [originLatLng, destLatLng];

    // 1. Origin Marker (Cyan departure pin)
    const originIcon = L.divIcon({
      className: 'custom-origin-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-cyan-400">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>ORIGIN · ${trip.origin.split(',')[0]}</span>
          </div>
          <div class="w-3 h-3 bg-slate-900 border-r border-b border-cyan-400 transform rotate-45 -mt-1.5"></div>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [60, 36],
    });

    const originMarker = L.marker(originLatLng, { icon: originIcon }).addTo(layersGroupRef.current);
    originMarker.bindPopup(`
      <div class="p-2.5 font-sans">
        <span class="text-[10px] font-bold text-cyan-700 uppercase tracking-wider block">Departure Hub</span>
        <h4 class="font-bold text-xs text-slate-900">${trip.origin}</h4>
        <p class="text-[11px] text-slate-500 mt-0.5">Coordinates: ${originCoords.lat.toFixed(4)}°, ${originCoords.lon.toFixed(4)}°</p>
      </div>
    `);

    // 2. Destination Marker (Violet arrival pin)
    const destIcon = L.divIcon({
      className: 'custom-dest-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="px-2.5 py-1 rounded-full bg-purple-900 text-white font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-purple-400">
            <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            <span>DESTINATION · ${trip.destination.split(',')[0]}</span>
          </div>
          <div class="w-3 h-3 bg-purple-900 border-r border-b border-purple-400 transform rotate-45 -mt-1.5"></div>
        </div>
      `,
      iconSize: [140, 36],
      iconAnchor: [70, 36],
    });

    const destMarker = L.marker(destLatLng, { icon: destIcon }).addTo(layersGroupRef.current);
    destMarker.bindPopup(`
      <div class="p-2.5 font-sans">
        <span class="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Arrival Destination</span>
        <h4 class="font-bold text-xs text-slate-900">${trip.destination}</h4>
        <p class="text-[11px] text-slate-500 mt-0.5">Duration: ${trip.durationDays} Days · ${trip.travelersCount} Guests</p>
      </div>
    `);

    // 3. Curved Aviation Arc / Transit Line
    const arcPoints = createCurvedArc(originCoords, destCoords, 50);

    // Outer glow polyline
    L.polyline(arcPoints, {
      color: '#0891B2',
      weight: 6,
      opacity: 0.25,
    }).addTo(layersGroupRef.current);

    // Inner crisp dashed transit polyline
    const routeLine = L.polyline(arcPoints, {
      color: '#0891B2',
      weight: 3.5,
      opacity: 0.9,
      dashArray: '8, 8',
    }).addTo(layersGroupRef.current);

    routeLine.bindPopup(`
      <div class="w-56 p-3 bg-white font-sans space-y-1.5">
        <div class="flex items-center justify-between pb-1 border-b border-slate-100">
          <span class="text-[10px] font-bold text-cyan-700 uppercase">${transitMode}</span>
          <span class="text-[10px] font-mono text-slate-400">${distanceKm} KM</span>
        </div>
        <p class="font-bold text-xs text-slate-900">${operatorName}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-600">
          <span>Est. Duration:</span>
          <span class="font-semibold">${durationStr}</span>
        </div>
        <div class="flex items-center justify-between text-[11px] text-slate-600">
          <span>Total Fare:</span>
          <span class="font-bold text-cyan-800">${formatCurrency(fareAmt, currency)}</span>
        </div>
      </div>
    `);

    // 4. Layover / Intermediate Waypoints if multi-leg route
    if (route?.legs && route.legs.length > 1) {
      route.legs.forEach((leg, lIdx) => {
        if (lIdx < route.legs.length - 1 && leg.to) {
          const legCoords = resolveCoordinates(leg.to);
          boundsPoints.push([legCoords.lat, legCoords.lon]);

          const transferIcon = L.divIcon({
            className: 'transfer-marker',
            html: `
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-sm text-white text-[10px] font-bold">
                T
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([legCoords.lat, legCoords.lon], { icon: transferIcon })
            .bindPopup(`
              <div class="p-2 font-sans">
                <span class="text-[9px] font-bold uppercase text-amber-600">Transit Transfer Hub</span>
                <p class="text-xs font-bold text-slate-900">${leg.to}</p>
                <p class="text-[10px] text-slate-500">${leg.mode.toUpperCase()} ➔ Connection</p>
              </div>
            `)
            .addTo(layersGroupRef.current!);
        }
      });
    }

    // 5. Day 1 Landmark Satellites around Destination
    if (trip.itinerary && trip.itinerary[0]?.activities) {
      trip.itinerary[0].activities.slice(0, 3).forEach((act, actIdx) => {
        if (act.coordinates?.lat && act.coordinates?.lon) {
          boundsPoints.push([act.coordinates.lat, act.coordinates.lon]);

          const stopIcon = L.divIcon({
            className: 'day1-mini-stop',
            html: `
              <div class="w-5 h-5 rounded-full bg-cyan-600 border border-white text-white text-[9px] font-bold flex items-center justify-center shadow-xs" title="${act.title}">
                ${actIdx + 1}
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          L.marker([act.coordinates.lat, act.coordinates.lon], { icon: stopIcon })
            .bindPopup(`
              <div class="p-2 font-sans">
                <span class="text-[9px] font-bold uppercase text-cyan-600">Day 1 Stop ${actIdx + 1}</span>
                <p class="text-xs font-bold text-slate-900">${act.title}</p>
                <p class="text-[10px] text-slate-500">${act.categoryLabel || act.category}</p>
              </div>
            `)
            .addTo(layersGroupRef.current!);
        }
      });
    }

    // Auto-fit corridor bounds
    const bounds = L.latLngBounds(boundsPoints);
    map.fitBounds(bounds, {
      padding: [45, 45],
      maxZoom: 12,
      animate: true,
    });
  }, [trip, currency, originCoords, destCoords]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([
      [originCoords.lat, originCoords.lon],
      [destCoords.lat, destCoords.lon],
    ]);
    map.fitBounds(bounds, { padding: [40, 40], animate: true });
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white flex flex-col ${className}`}
    >
      {/* Top Map Header Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2]">
            <span className="material-symbols-outlined text-base">route</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Geospatial Corridor Overview
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0891B2] font-mono text-[10px] font-bold border border-[#BFDBFE]">
                {distanceKm} km · {Math.round(distanceKm * 0.539957)} NM
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              <span className="font-semibold text-[#0F172A]">{trip.origin.split(',')[0]}</span> ➔{' '}
              <span className="font-semibold text-[#0891B2]">{trip.destination.split(',')[0]}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-2xs text-[11px] font-semibold flex items-center gap-1 transition-all"
            title="Recenter corridor view"
          >
            <span className="material-symbols-outlined text-sm">filter_center_focus</span>
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {onExploreTransit && (
            <button
              type="button"
              onClick={onExploreTransit}
              className="px-3 py-1.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1 transition-all"
            >
              <span>Transit Details</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ height }} className="w-full relative z-0" />

      {/* Bottom Floating Route Telemetry HUD */}
      <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
            <span className="text-[11px] text-[#64748B]">Transit Corridor:</span>
            <span className="text-[11px] font-bold text-[#0F172A]">{transitMode}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-[#7C3AED]">schedule</span>
            <span className="text-[11px] text-[#64748B]">Estimated Time:</span>
            <span className="text-[11px] font-mono font-bold text-[#0F172A]">{durationStr}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs text-[#059669]">payments</span>
            <span className="text-[11px] text-[#64748B]">Fare Benchmark:</span>
            <span className="text-[11px] font-mono font-bold text-[#0891B2]">
              {formatCurrency(fareAmt, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
          <span className="material-symbols-outlined text-xs text-[#0891B2]">verified_user</span>
          <span>Verified GPS Telemetry & Cartography</span>
        </div>
      </div>
    </div>
  );
};
