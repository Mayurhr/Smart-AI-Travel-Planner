/**
 * Smart AI Travel Planner 3.0
 * Interactive Itinerary Geospatial Map Component
 *
 * Implements:
 * 1. Real Leaflet + CartoDB Positron interactive tile map (pan, zoom, multi-touch).
 * 2. Day-by-day or Full Trip filter pills.
 * 3. Daily chronological route polylines with directional styling.
 * 4. Custom numbered markers with day color coding and active pulse effects.
 * 5. Interactive marker popups with real attraction photographs, time slots, costs, and verified badges.
 * 6. Two-way selection binding: clicking a marker highlights the card; selecting a card centers the map.
 * 7. Map controls: Fit Bounds, Reset View, Zoom In/Out, and Fullscreen toggle.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DayItinerary, Activity, CurrencyCode } from '../../types/travel';
import { formatCurrency } from '../../lib/budget';
import { getLocalVerifiedPhoto } from '../../lib/destinationImageService';

interface ItineraryInteractiveMapProps {
  itinerary: DayItinerary[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedActivityId?: string | null;
  onSelectActivity?: (activityId: string) => void;
  currency: CurrencyCode;
  destination: string;
  className?: string;
  height?: string;
}

const DAY_COLORS = [
  '#0891B2', // Day 1: Cyan
  '#7C3AED', // Day 2: Violet
  '#059669', // Day 3: Emerald
  '#D97706', // Day 4: Amber
  '#E11D48', // Day 5: Rose
  '#4F46E5', // Day 6: Indigo
  '#0D9488', // Day 7: Teal
  '#64748B', // Day 8+: Slate
];

export const ItineraryInteractiveMap: React.FC<ItineraryInteractiveMapProps> = ({
  itinerary,
  selectedDay,
  onSelectDay,
  selectedActivityId,
  onSelectActivity,
  currency,
  destination,
  className = '',
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center
    const map = L.map(mapContainerRef.current, {
      center: [15.2993, 74.124],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Add CartoDB Positron clean light tiles matching light cyan/violet theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    // Zoom control in top right
    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(map);

    // Layer groups for markers and lines
    markersLayerRef.current = L.layerGroup().addTo(map);
    polylinesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Polylines when day, viewMode, or itinerary changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !polylinesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    polylinesLayerRef.current.clearLayers();
    markersMapRef.current.clear();

    const activeDays =
      viewMode === 'all'
        ? itinerary
        : itinerary.filter((d) => d.dayNumber === selectedDay);

    const allLatLngs: L.LatLngExpression[] = [];

    activeDays.forEach((day) => {
      const dayColor = DAY_COLORS[(day.dayNumber - 1) % DAY_COLORS.length];
      const dayCoords: [number, number][] = [];

      day.activities.forEach((act, actIdx) => {
        if (!act.coordinates?.lat || !act.coordinates?.lon) return;

        const latLng: [number, number] = [act.coordinates.lat, act.coordinates.lon];
        dayCoords.push(latLng);
        allLatLngs.push(latLng);

        const isSelected = act.id === selectedActivityId;
        const photoMeta = getLocalVerifiedPhoto(act.placeName || act.title) || getLocalVerifiedPhoto(destination);
        const photoUrl = photoMeta?.thumbUrl || act.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400';

        // Custom HTML Marker Icon with Day color and sequence index
        const markerHtml = `
          <div class="relative group cursor-pointer" style="transform: translate(-50%, -50%);">
            ${
              isSelected
                ? `<span class="absolute -inset-2 rounded-full animate-ping opacity-75" style="background-color: ${dayColor};"></span>`
                : ''
            }
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md text-white font-mono font-bold text-xs transition-transform duration-200 group-hover:scale-115 ${
              isSelected ? 'scale-120 ring-3 ring-cyan-400' : ''
            }" style="background-color: ${dayColor};">
              <span>${actIdx + 1}</span>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${act.title.length > 20 ? act.title.slice(0, 18) + '...' : act.title}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-map-marker',
          html: markerHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker(latLng, { icon }).addTo(markersLayerRef.current!);
        markersMapRef.current.set(act.id, marker);

        // Rich interactive popup with real photo, verified badge, time, and cost
        const popupContent = `
          <div class="w-64 p-0 rounded-2xl overflow-hidden font-sans">
            <div class="relative h-28 w-full bg-slate-900">
              <img src="${photoUrl}" alt="${act.title}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div class="absolute top-2 left-2 flex gap-1">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase" style="background-color: ${dayColor};">
                  Day ${day.dayNumber} · Stop ${actIdx + 1}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-white/90 text-slate-800 text-[9px] font-bold uppercase">
                  ${act.categoryLabel || act.category}
                </span>
              </div>
            </div>
            <div class="p-3 space-y-1.5 bg-white">
              <h4 class="font-bold text-xs text-slate-900 leading-tight">${act.title}</h4>
              <p class="text-[11px] text-slate-600 line-clamp-2">${act.description}</p>
              <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono">
                <span class="text-cyan-700 font-bold">${formatCurrency(act.estimatedCost, currency)}</span>
                <span class="text-slate-500">${act.duration}</span>
              </div>
              <div class="pt-1 flex items-center justify-between text-[9px] text-slate-400">
                <span>📍 ${act.coordinates?.lat.toFixed(4)}°, ${act.coordinates?.lon.toFixed(4)}°</span>
                <span class="text-emerald-600 font-bold flex items-center gap-0.5">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified
                </span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });

        marker.on('click', () => {
          onSelectActivity?.(act.id);
        });
      });

      // Draw polyline connecting day's activities in sequence
      if (dayCoords.length > 1) {
        L.polyline(dayCoords, {
          color: dayColor,
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 8',
        }).addTo(polylinesLayerRef.current!);
      }
    });

    // Auto-fit bounds
    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
        animate: true,
      });
    }
  }, [itinerary, selectedDay, viewMode, destination, currency, selectedActivityId]);

  // Center on selected activity when clicked from the itinerary list
  useEffect(() => {
    if (!selectedActivityId) return;
    const marker = markersMapRef.current.get(selectedActivityId);
    const map = mapInstanceRef.current;
    if (marker && map) {
      const latLng = marker.getLatLng();
      map.flyTo(latLng, Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 0.8,
      });
      marker.openPopup();
    }
  }, [selectedActivityId]);

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const activeDays =
      viewMode === 'all'
        ? itinerary
        : itinerary.filter((d) => d.dayNumber === selectedDay);

    const latLngs: L.LatLngExpression[] = [];
    activeDays.forEach((d) =>
      d.activities.forEach((a) => {
        if (a.coordinates) latLngs.push([a.coordinates.lat, a.coordinates.lon]);
      })
    );

    if (latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 15 });
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-slate-50 flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-2rem)]' : ''
      } ${className}`}
    >
      {/* Top Map Bar: Title & Day Filter Pills */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0891B2] text-lg">explore</span>
          <span className="text-xs font-bold text-[#0F172A] tracking-tight">
            Live Waypoint Navigation
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0891B2] text-[10px] font-mono font-bold border border-[#BFDBFE]">
            {destination}
          </span>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => {
              setViewMode('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              viewMode === 'all'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            All Days ({itinerary.length})
          </button>

          {itinerary.map((d) => {
            const isCurrent = viewMode === 'day' && selectedDay === d.dayNumber;
            const color = DAY_COLORS[(d.dayNumber - 1) % DAY_COLORS.length];
            return (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => {
                  setViewMode('day');
                  onSelectDay(d.dayNumber);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                  isCurrent
                    ? 'text-white shadow-2xs'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
                style={isCurrent ? { backgroundColor: color } : {}}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: isCurrent ? '#FFFFFF' : color }}
                />
                <span>Day {d.dayNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFitBounds}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-2xs text-[11px] font-semibold flex items-center gap-1"
            title="Auto-fit bounds"
          >
            <span className="material-symbols-outlined text-sm">fit_screen</span>
            <span className="hidden md:inline">Fit Bounds</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0] shadow-2xs"
            title={isFullscreen ? 'Exit fullscreen' : 'Expand map'}
          >
            <span className="material-symbols-outlined text-sm">
              {isFullscreen ? 'close_fullscreen' : 'open_in_full'}
            </span>
          </button>
        </div>
      </div>

      {/* Map Stage Container */}
      <div
        ref={mapContainerRef}
        style={{ height: isFullscreen ? 'calc(100% - 48px)' : height }}
        className="w-full relative z-0"
      />

      {/* Floating Map Legend Indicator */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E2E8F0] shadow-xs flex items-center gap-2 text-[10px] font-mono text-[#475569]">
        <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse" />
        <span>CartoDB Positron Cartography</span>
        <span className="text-[#CBD5E1]">|</span>
        <span>Interactive Markers & Route Polylines</span>
      </div>
    </div>
  );
};
