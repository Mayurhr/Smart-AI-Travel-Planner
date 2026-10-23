/**
 * Smart AI Travel Planner 3.0
 * Google Maps Functional Itinerary Geospatial Map
 *
 * Implements:
 * 1. `@vis.gl/react-google-maps` with `APIProvider`, `<Map>`, `<AdvancedMarker>`, and `<InfoWindow>`.
 * 2. Mandatory attribution: `internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}`.
 * 3. Day-by-day filter pills & all-day view.
 * 4. Active activity synchronization (two-way selection).
 * 5. Multi-modal route toggles: Driving, Walking, Transit.
 * 6. Turn-by-turn navigation via official Google Maps directions URLs (zero API key needed).
 * 7. Graceful handling of missing coordinates.
 * 8. Zero-key fallback UI banner if Google Maps key is missing or invalid.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import { DayItinerary, Activity, CurrencyCode } from '../../types/travel';
import { formatCurrency } from '../../lib/budget';
import { resolveCoordinates } from '../../lib/geocoding';
import {
  getGoogleMapsApiKey,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsPlaceSearchUrl,
  GoogleTravelMode,
  MapCoordinate,
} from '../../lib/googleMapsService';
import { RealPlacePhoto } from '../RealPlacePhoto';

interface GoogleItineraryMapProps {
  itinerary: DayItinerary[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  selectedActivityId?: string | null;
  onSelectActivity?: (activityId: string) => void;
  currency: CurrencyCode;
  destination: string;
  origin?: string;
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

interface WaypointItem {
  activity: Activity;
  dayNumber: number;
  sequenceNumber: number;
  coords: MapCoordinate;
  color: string;
}

// Sub-component to manage map bounds and camera
const MapViewController: React.FC<{
  points: MapCoordinate[];
  activePoint?: MapCoordinate | null;
}> = ({ points, activePoint }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (activePoint) {
      map.panTo(activePoint);
      if ((map.getZoom() ?? 0) < 13) {
        map.setZoom(14);
      }
      return;
    }

    if (points.length === 0) return;

    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(13);
      return;
    }

    if (typeof google !== 'undefined' && google.maps && google.maps.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      points.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });
    }
  }, [map, points, activePoint]);

  return null;
};

export const GoogleItineraryMap: React.FC<GoogleItineraryMapProps> = ({
  itinerary,
  selectedDay,
  onSelectDay,
  selectedActivityId,
  onSelectActivity,
  currency,
  destination,
  origin,
  className = '',
  height = '460px',
}) => {
  const apiKey = getGoogleMapsApiKey();
  const isKeyConfigured = Boolean(apiKey && apiKey.length > 10);

  const [viewFilter, setViewFilter] = useState<'day' | 'all'>('day');
  const [travelMode, setTravelMode] = useState<GoogleTravelMode>('driving');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Sync external selectedActivityId
  useEffect(() => {
    if (selectedActivityId) {
      setActiveMarkerId(selectedActivityId);
    }
  }, [selectedActivityId]);

  // Extract waypoints with valid coordinates
  const waypoints = useMemo<WaypointItem[]>(() => {
    const list: WaypointItem[] = [];
    const daysToInclude =
      viewFilter === 'all'
        ? itinerary
        : itinerary.filter((d) => d.dayNumber === selectedDay);

    daysToInclude.forEach((dayData) => {
      const dayColor = DAY_COLORS[(dayData.dayNumber - 1) % DAY_COLORS.length];
      dayData.activities.forEach((act, actIdx) => {
        let coords: MapCoordinate | null = null;
        if (act.coordinates && act.coordinates.lat && act.coordinates.lon) {
          coords = { lat: act.coordinates.lat, lng: act.coordinates.lon };
        } else {
          const resolved = resolveCoordinates(act.placeName || destination);
          if (resolved) {
            coords = { lat: resolved.lat, lng: resolved.lon };
          }
        }

        // If coordinates found, include in map
        if (coords) {
          list.push({
            activity: act,
            dayNumber: dayData.dayNumber,
            sequenceNumber: actIdx + 1,
            coords,
            color: dayColor,
          });
        }
      });
    });

    return list;
  }, [itinerary, selectedDay, viewFilter, destination]);

  // Extract coordinates for polylines and bounding
  const pointCoordinates = useMemo(
    () => waypoints.map((w) => w.coords),
    [waypoints]
  );

  const activeWaypoint = useMemo(
    () => waypoints.find((w) => w.activity.id === activeMarkerId),
    [waypoints, activeMarkerId]
  );

  // Fallback default center
  const defaultCenter = useMemo(() => {
    if (pointCoordinates.length > 0) return pointCoordinates[0];
    const destHub = resolveCoordinates(destination);
    if (destHub) return { lat: destHub.lat, lng: destHub.lon };
    return { lat: 15.2993, lng: 74.124 }; // Goa default
  }, [pointCoordinates, destination]);

  // Generate Google Maps Directions Turn-by-Turn URL (Zero-key fallback and direct navigation)
  const googleMapsDirectionsUrl = useMemo(() => {
    if (waypoints.length < 2) {
      if (waypoints.length === 1) {
        return buildGoogleMapsPlaceSearchUrl(
          waypoints[0].activity.placeName || destination,
          waypoints[0].coords
        );
      }
      return buildGoogleMapsDirectionsUrl(origin || 'Current Location', destination, {
        travelMode,
      });
    }

    const firstPt = waypoints[0].coords;
    const lastPt = waypoints[waypoints.length - 1].coords;
    const midWaypoints = waypoints.slice(1, -1).map((w) => w.coords);

    return buildGoogleMapsDirectionsUrl(firstPt, lastPt, {
      travelMode,
      waypoints: midWaypoints,
    });
  }, [waypoints, origin, destination, travelMode]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm flex flex-col ${className}`}
      style={{ minHeight: height }}
    >
      {/* Top Map Header & Controls */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0891B2] to-[#7C3AED] flex items-center justify-center text-white shadow-2xs">
            <span className="material-symbols-outlined text-base">map</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0F172A]">Google Maps Geospatial Navigator</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">
              {waypoints.length} verified stops · {destination}
            </p>
          </div>
        </div>

        {/* View & Travel Mode Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Day / All Filter */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-[#CBD5E1]">
            <button
              type="button"
              onClick={() => setViewFilter('day')}
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                viewFilter === 'day'
                  ? 'bg-white text-[#0F172A] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Day {selectedDay}
            </button>
            <button
              type="button"
              onClick={() => setViewFilter('all')}
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                viewFilter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All Days ({itinerary.length})
            </button>
          </div>

          {/* Travel Mode Toggle */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-[#CBD5E1]">
            <button
              type="button"
              onClick={() => setTravelMode('driving')}
              title="Driving Mode"
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                travelMode === 'driving'
                  ? 'bg-white text-[#0891B2] shadow-2xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">directions_car</span>
              <span className="hidden sm:inline">Drive</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('transit')}
              title="Public Transit"
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                travelMode === 'transit'
                  ? 'bg-white text-[#7C3AED] shadow-2xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">directions_transit</span>
              <span className="hidden sm:inline">Transit</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('walking')}
              title="Walking Tour"
              className={`px-2 py-1 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all ${
                travelMode === 'walking'
                  ? 'bg-white text-[#059669] shadow-2xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <span className="material-symbols-outlined text-xs">directions_walk</span>
              <span className="hidden sm:inline">Walk</span>
            </button>
          </div>

          {/* Direct "Open in Google Maps" Zero-Key Action */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-[10px] font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 shadow-2xs transition-colors"
            title="Open live turn-by-turn route directions in Google Maps"
          >
            <span className="material-symbols-outlined text-xs text-blue-600">open_in_new</span>
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full" style={{ height: height }}>
        {isKeyConfigured && !mapError ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={12}
              mapId="DEMO_MAP_ID"
              gestureHandling="greedy"
              fullscreenControl={false}
              streetViewControl={false}
              mapTypeControl={true}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
            >
              <MapViewController
                points={pointCoordinates}
                activePoint={activeWaypoint ? activeWaypoint.coords : null}
              />

              {/* Polylines connecting consecutive stops */}
              {pointCoordinates.length > 1 && (
                <Polyline
                  path={pointCoordinates}
                  strokeColor={
                    travelMode === 'walking'
                      ? '#059669'
                      : travelMode === 'transit'
                      ? '#7C3AED'
                      : '#0891B2'
                  }
                  strokeOpacity={0.85}
                  strokeWeight={4}
                />
              )}

              {/* Numbered Waypoint Markers */}
              {waypoints.map((wp) => {
                const isSelected = wp.activity.id === activeMarkerId;
                return (
                  <AdvancedMarker
                    key={wp.activity.id}
                    position={wp.coords}
                    title={`${wp.sequenceNumber}. ${wp.activity.placeName || wp.activity.title}`}
                    onClick={() => {
                      setActiveMarkerId(wp.activity.id);
                      if (onSelectActivity) onSelectActivity(wp.activity.id);
                      if (wp.dayNumber !== selectedDay) {
                        onSelectDay(wp.dayNumber);
                      }
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
                        isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-20'
                      }`}
                    >
                      {/* Pulse Ring when selected */}
                      {isSelected && (
                        <span
                          className="absolute -inset-2 rounded-full animate-ping opacity-75"
                          style={{ backgroundColor: wp.color }}
                        />
                      )}

                      {/* Numbered Marker Badge */}
                      <div
                        className="w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white ring-1 ring-black/10"
                        style={{ backgroundColor: wp.color }}
                      >
                        {wp.sequenceNumber}
                      </div>

                      {/* Day Label Tag */}
                      <span className="absolute -bottom-3.5 bg-black/80 backdrop-blur-xs text-[8px] font-bold text-white px-1 py-0.2 rounded shadow-2xs whitespace-nowrap">
                        D{wp.dayNumber}
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* Active Marker InfoWindow */}
              {activeWaypoint && (
                <InfoWindow
                  position={activeWaypoint.coords}
                  onCloseClick={() => setActiveMarkerId(null)}
                >
                  <div className="p-2 max-w-[240px] text-[#0F172A] space-y-2">
                    <div className="flex items-center justify-between gap-1 text-[10px] text-[#64748B]">
                      <span
                        className="font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: activeWaypoint.color }}
                      >
                        Day {activeWaypoint.dayNumber} · Stop #{activeWaypoint.sequenceNumber}
                      </span>
                      <span>{activeWaypoint.activity.timeSlot}</span>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-2xs border border-[#E2E8F0]">
                      <RealPlacePhoto
                        placeName={activeWaypoint.activity.placeName || activeWaypoint.activity.title}
                        destination={destination}
                        aspectRatio="16/9"
                        showAttribution={false}
                      />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold line-clamp-1">
                        {activeWaypoint.activity.placeName || activeWaypoint.activity.title}
                      </h4>
                      <p className="text-[10px] text-[#64748B] line-clamp-2 mt-0.5">
                        {activeWaypoint.activity.description}
                      </p>
                    </div>

                    <div className="pt-1 border-t border-[#E2E8F0] flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#0891B2]">
                        {formatCurrency(activeWaypoint.activity.estimatedCost, currency)}
                      </span>
                      <a
                        href={buildGoogleMapsPlaceSearchUrl(
                          activeWaypoint.activity.placeName || activeWaypoint.activity.title,
                          activeWaypoint.coords
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                      >
                        <span>Navigate</span>
                        <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Graceful Zero-Key Fallback UI */
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-2xs">
              <span className="material-symbols-outlined text-2xl">pin_drop</span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">Google Maps Directions Ready</h3>
            <p className="text-xs text-[#64748B] max-w-md mt-1 mb-4">
              Explore your {destination} itinerary stops, transfer points, and route sequence with zero-key Google Maps direction links.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">directions</span>
                <span>Open Day {selectedDay} in Google Maps</span>
              </a>
              <button
                type="button"
                onClick={() => setMapError(null)}
                className="px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Retry Map Initialization
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Waypoint Quick-Bar */}
      <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[11px] overflow-x-auto gap-2">
        <span className="text-[#64748B] font-medium whitespace-nowrap">
          {viewFilter === 'day' ? `Day ${selectedDay} Sequence:` : `All Days Route:`}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {waypoints.map((wp) => (
            <button
              key={`bar-${wp.activity.id}`}
              type="button"
              onClick={() => {
                setActiveMarkerId(wp.activity.id);
                if (onSelectActivity) onSelectActivity(wp.activity.id);
                if (wp.dayNumber !== selectedDay) onSelectDay(wp.dayNumber);
              }}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all border ${
                wp.activity.id === activeMarkerId
                  ? 'bg-white text-[#0F172A] border-[#0891B2] shadow-2xs'
                  : 'bg-white/60 text-[#64748B] border-[#E2E8F0] hover:bg-white'
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: wp.color }}
              />
              {wp.activity.placeName || wp.activity.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
