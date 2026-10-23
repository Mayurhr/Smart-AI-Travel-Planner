/**
 * Smart AI Travel Planner 3.0
 * Real Landmark Archive Component
 *
 * Implements:
 * 1. Dynamic discovery of unique landmarks directly from the active trip's saved itinerary.
 * 2. Official Unsplash API photo pipeline with verified photographer attribution and UTM tracking.
 * 3. Robust error handling: loading skeletons, neutral placeholders with Retry buttons, zero AI generation.
 * 4. Active synchronization: automatically reflects additions, removals, and day updates.
 * 5. Interactive controls:
 *    - View landmark details (category, schedule, estimated cost, photographer credit)
 *    - Open on map
 *    - Jump to itinerary day
 *    - Add landmark to another day
 *    - Remove landmark from itinerary with confirmation dialog
 * 6. Useful empty state with call-to-action when no attractions are scheduled.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TripPlan, Activity, CurrencyCode } from '../../types/travel';
import { formatCurrency } from '../../lib/budget';
import {
  UnsplashPhotoMetadata,
  fetchUnsplashPhoto,
  clearUnsplashCache,
  getLocalCuratedPhoto,
} from '../../lib/unsplashImageService';

export interface UniqueLandmarkRecord {
  id: string;
  placeName: string;
  destination: string;
  city: string;
  country: string;
  days: number[];
  timeSlots: string[];
  category: string;
  categoryLabel: string;
  description: string;
  coordinates?: { lat: number; lon: number };
  estimatedCostTotal: number;
  activityIds: string[];
  isVerified?: boolean;
}

interface RealLandmarkArchiveProps {
  trip: TripPlan;
  currency: CurrencyCode;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onSelectActivity?: (activityId: string) => void;
  onUpdateTrip?: (updated: TripPlan) => void;
  onOpenAddActivityModal?: () => void;
  onNavigateToPlanner?: () => void;
}

export const RealLandmarkArchive: React.FC<RealLandmarkArchiveProps> = ({
  trip,
  currency,
  onSelectDay,
  onSelectActivity,
  onUpdateTrip,
  onOpenAddActivityModal,
  onNavigateToPlanner,
}) => {
  // 1. Discover unique landmarks from the itinerary
  const landmarks: UniqueLandmarkRecord[] = useMemo(() => {
    if (!trip || !trip.itinerary || trip.itinerary.length === 0) {
      return [];
    }

    const map = new Map<string, UniqueLandmarkRecord>();
    const destParts = (trip.destination || '').split(',').map((s) => s.trim());
    const city = destParts[0] || trip.destination || '';
    const country = destParts.length > 1 ? destParts[destParts.length - 1] : '';

    trip.itinerary.forEach((day) => {
      day.activities.forEach((act) => {
        const rawName = (act.placeName || act.title || '').trim();
        if (!rawName) return;

        // Normalize key to deduplicate identical places across days
        const normKey = rawName.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!normKey) return;

        if (map.has(normKey)) {
          const existing = map.get(normKey)!;
          if (!existing.days.includes(day.dayNumber)) {
            existing.days.push(day.dayNumber);
            existing.days.sort((a, b) => a - b);
          }
          if (act.timeSlot && !existing.timeSlots.includes(act.timeSlot)) {
            existing.timeSlots.push(act.timeSlot);
          }
          if (!existing.activityIds.includes(act.id)) {
            existing.activityIds.push(act.id);
          }
          existing.estimatedCostTotal += act.estimatedCost || 0;
        } else {
          map.set(normKey, {
            id: `lm-${normKey.replace(/\s+/g, '-')}`,
            placeName: rawName,
            destination: trip.destination,
            city,
            country,
            days: [day.dayNumber],
            timeSlots: act.timeSlot ? [act.timeSlot] : [],
            category: act.category || 'culture',
            categoryLabel: act.categoryLabel || 'HISTORIC ATTRACTION',
            description: act.description || `Popular attraction in ${trip.destination}.`,
            coordinates: act.coordinates,
            estimatedCostTotal: act.estimatedCost || 0,
            activityIds: [act.id],
            isVerified: act.isVerified ?? true,
          });
        }
      });
    });

    return Array.from(map.values());
  }, [trip]);

  // Selected landmark for detail modal
  const [activeLandmark, setActiveLandmark] = useState<UniqueLandmarkRecord | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Photo cache per landmark id
  const [photos, setPhotos] = useState<Record<string, { photo: UnsplashPhotoMetadata | null; loading: boolean; error?: string }>>({});

  // Removal confirmation dialog state
  const [pendingRemoval, setPendingRemoval] = useState<UniqueLandmarkRecord | null>(null);
  const [addToDayTarget, setAddToDayTarget] = useState<number>(1);
  const [showAddToDayModal, setShowAddToDayModal] = useState<UniqueLandmarkRecord | null>(null);

  // Keep carousel index in bounds
  useEffect(() => {
    if (landmarks.length > 0 && photoIndex >= landmarks.length) {
      setPhotoIndex(0);
    }
  }, [landmarks.length, photoIndex]);

  // 2. Fetch Unsplash photos for each discovered landmark
  const loadPhotoForLandmark = useCallback(
    async (lm: UniqueLandmarkRecord, forceRetry = false) => {
      if (forceRetry) {
        clearUnsplashCache(lm.placeName, lm.destination);
      }

      setPhotos((prev) => ({
        ...prev,
        [lm.id]: { photo: prev[lm.id]?.photo || null, loading: true },
      }));

      // Check instant curated first
      const instant = getLocalCuratedPhoto(lm.placeName);
      if (instant && !forceRetry) {
        setPhotos((prev) => ({
          ...prev,
          [lm.id]: { photo: instant, loading: false },
        }));
        return;
      }

      try {
        const result = await fetchUnsplashPhoto(lm.placeName, lm.destination, lm.city, lm.country);
        if (result.status === 'loaded' && result.photo) {
          setPhotos((prev) => ({
            ...prev,
            [lm.id]: { photo: result.photo, loading: false },
          }));
        } else {
          setPhotos((prev) => ({
            ...prev,
            [lm.id]: {
              photo: null,
              loading: false,
              error: result.error || 'No matching Unsplash photograph found',
            },
          }));
        }
      } catch (err: any) {
        setPhotos((prev) => ({
          ...prev,
          [lm.id]: {
            photo: null,
            loading: false,
            error: err?.message || 'Failed to connect to Unsplash',
          },
        }));
      }
    },
    []
  );

  useEffect(() => {
    landmarks.forEach((lm) => {
      if (!photos[lm.id]) {
        loadPhotoForLandmark(lm);
      }
    });
  }, [landmarks, photos, loadPhotoForLandmark]);

  // Actions
  const handleRemoveConfirmed = () => {
    if (!pendingRemoval || !onUpdateTrip) return;

    // Filter out all activities belonging to this landmark across all days
    const removeIds = new Set(pendingRemoval.activityIds);
    const updatedItinerary = trip.itinerary.map((day) => {
      const remainingActs = day.activities.filter((act) => !removeIds.has(act.id));
      const dayTotal = remainingActs.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);
      return {
        ...day,
        activities: remainingActs,
        totalEstimatedCost: dayTotal,
      };
    });

    // Recalculate trip budget
    const allActivities = updatedItinerary.flatMap((d) => d.activities);
    const newCommitted = allActivities.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);

    const updatedTrip: TripPlan = {
      ...trip,
      itinerary: updatedItinerary,
      budget: {
        ...trip.budget,
        committedOutlay: newCommitted,
        items: trip.budget.items.filter((item) => !removeIds.has(item.id)),
      },
    };

    onUpdateTrip(updatedTrip);
    setPendingRemoval(null);
    if (activeLandmark?.id === pendingRemoval.id) {
      setActiveLandmark(null);
    }
  };

  const handleAddLandmarkToDay = () => {
    if (!showAddToDayModal || !onUpdateTrip) return;

    const targetDayNum = Number(addToDayTarget);
    const targetDay = trip.itinerary.find((d) => d.dayNumber === targetDayNum);
    if (!targetDay) return;

    // Create a new activity instance for this day
    const newActivity: Activity = {
      id: `act-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      placeName: showAddToDayModal.placeName,
      destination: trip.destination,
      dayNumber: targetDayNum,
      timeSlot: 'Afternoon · 14:00 - 16:30',
      title: showAddToDayModal.placeName,
      category: (showAddToDayModal.category as any) || 'culture',
      categoryLabel: showAddToDayModal.categoryLabel || 'VISIT',
      description: showAddToDayModal.description,
      duration: '2h',
      estimatedCost: Math.round(showAddToDayModal.estimatedCostTotal / Math.max(1, showAddToDayModal.days.length)) || 500,
      image: photos[showAddToDayModal.id]?.photo?.url || '',
      coordinates: showAddToDayModal.coordinates,
      isVerified: true,
    };

    const updatedItinerary = trip.itinerary.map((day) => {
      if (day.dayNumber !== targetDayNum) return day;
      const newActs = [...day.activities, newActivity];
      const dayTotal = newActs.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);
      return {
        ...day,
        activities: newActs,
        totalEstimatedCost: dayTotal,
      };
    });

    const allActivities = updatedItinerary.flatMap((d) => d.activities);
    const newCommitted = allActivities.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);

    const updatedTrip: TripPlan = {
      ...trip,
      itinerary: updatedItinerary,
      budget: {
        ...trip.budget,
        committedOutlay: newCommitted,
      },
    };

    onUpdateTrip(updatedTrip);
    setShowAddToDayModal(null);
  };

  // Active item in carousel
  const currentLandmark = landmarks[photoIndex];
  const currentPhotoState = currentLandmark ? photos[currentLandmark.id] : null;

  // ================= 3. EMPTY STATE =================
  if (landmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2]">
          <span className="material-symbols-outlined text-2xl">photo_library</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Real Landmark Archive</h4>
          <p className="text-xs text-[#64748B] max-w-sm mt-1">
            No attractions are scheduled in this itinerary yet. Add destinations to your days to automatically curate verified Unsplash travel photography.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-2">
          {onOpenAddActivityModal && (
            <button
              type="button"
              onClick={onOpenAddActivityModal}
              className="px-4 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add First Attraction</span>
            </button>
          )}
          {onNavigateToPlanner && (
            <button
              type="button"
              onClick={onNavigateToPlanner}
              className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <span>Plan an Odyssey</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================= 4. POPULATED ARCHIVE VIEW =================
  return (
    <div id="landmark-archive" className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0891B2] text-lg">photo_camera</span>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Real Landmark Archive
            </h3>
            <span className="text-[10px] text-[#64748B]">
              {landmarks.length} Unique Attraction{landmarks.length > 1 ? 's' : ''} in {trip.destination}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#0891B2] uppercase font-bold bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
          {photoIndex + 1} of {landmarks.length}
        </span>
      </div>

      {/* Main Spotlight Card */}
      {currentLandmark && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden group bg-slate-900 shadow-inner">
          {/* SKELETON STATE */}
          {currentPhotoState?.loading && (
            <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-4 text-center z-10 animate-pulse text-white">
              <span className="material-symbols-outlined text-2xl text-cyan-400 animate-spin mb-2">
                progress_activity
              </span>
              <span className="text-xs font-bold">{currentLandmark.placeName}</span>
              <span className="text-[10px] text-slate-400 mt-1">
                Searching Unsplash photograph...
              </span>
            </div>
          )}

          {/* LOADED PHOTO */}
          {!currentPhotoState?.loading && currentPhotoState?.photo && (
            <img
              src={currentPhotoState.photo.url}
              alt={currentPhotoState.photo.altDescription || currentLandmark.placeName}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            />
          )}

          {/* FALLBACK PLACEHOLDER (NO PHOTO OR ERROR) */}
          {!currentPhotoState?.loading && !currentPhotoState?.photo && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
              <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">
                image_not_supported
              </span>
              <span className="text-sm font-bold max-w-[85%] truncate">
                {currentLandmark.placeName}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {currentLandmark.destination}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[80%] line-clamp-1">
                {currentPhotoState?.error || 'No matching Unsplash photo found'}
              </p>
              <button
                type="button"
                onClick={() => loadPhotoForLandmark(currentLandmark, true)}
                className="mt-3 px-3 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                <span>Retry Search</span>
              </button>
            </div>
          )}

          {/* Gradient Overlay & Metadata */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/30 to-transparent flex flex-col justify-end p-4 text-white pointer-events-none">
            {/* Top pill badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
              <div className="flex flex-wrap gap-1">
                {currentLandmark.days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onSelectDay(d)}
                    className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-[#0891B2] backdrop-blur-md text-[10px] font-mono font-bold text-white transition-colors cursor-pointer"
                    title={`Jump to Day ${d}`}
                  >
                    Day {d < 10 ? `0${d}` : d}
                  </button>
                ))}
              </div>

              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30 text-[10px] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">photo_camera</span>
                <span>Unsplash</span>
              </span>
            </div>

            {/* Bottom Details */}
            <div className="pointer-events-auto">
              <h4 className="font-serif-heading text-base font-bold leading-tight">
                {currentLandmark.placeName}
              </h4>
              <p className="text-[11px] text-cyan-200 mt-0.5 line-clamp-1">
                {currentLandmark.categoryLabel} · {currentLandmark.city}
              </p>

              {/* Attribution */}
              {currentPhotoState?.photo && (
                <div className="text-[10px] text-slate-300 mt-1 truncate">
                  Photo by{' '}
                  <a
                    href={currentPhotoState.photo.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-300 underline underline-offset-2 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {currentPhotoState.photo.photographer}
                  </a>{' '}
                  on{' '}
                  <a
                    href={currentPhotoState.photo.photoPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-300 underline underline-offset-2 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Unsplash
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Left/Right Carousel Controls */}
          <button
            type="button"
            onClick={() => setPhotoIndex((prev) => (prev - 1 + landmarks.length) % landmarks.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
            title="Previous landmark"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => setPhotoIndex((prev) => (prev + 1) % landmarks.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-md transition-all cursor-pointer z-10"
            title="Next landmark"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      )}

      {/* Quick Action Bar for Current Landmark */}
      {currentLandmark && (
        <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveLandmark(currentLandmark)}
            className="flex-1 py-1.5 px-2 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#0891B2] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
          >
            <span className="material-symbols-outlined text-xs">info</span>
            <span>View Details</span>
          </button>

          {currentLandmark.coordinates && onSelectActivity && currentLandmark.activityIds[0] && (
            <button
              type="button"
              onClick={() => onSelectActivity(currentLandmark.activityIds[0])}
              className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
              title="Locate on interactive map"
            >
              <span className="material-symbols-outlined text-xs">explore</span>
              <span>Map</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddToDayModal(currentLandmark)}
            className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Add this landmark to another day"
          >
            <span className="material-symbols-outlined text-xs">add</span>
            <span>Add to Day</span>
          </button>

          <button
            type="button"
            onClick={() => setPendingRemoval(currentLandmark)}
            className="py-1.5 px-2 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer text-[11px]"
            title="Remove from itinerary"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
          </button>
        </div>
      )}

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 pt-1">
        {landmarks.map((lm, idx) => {
          const p = photos[lm.id]?.photo;
          return (
            <div
              key={lm.id}
              onClick={() => setPhotoIndex(idx)}
              className={`h-12 rounded-lg overflow-hidden cursor-pointer relative transition-all bg-slate-200 ${
                photoIndex === idx
                  ? 'ring-2 ring-[#0891B2] scale-102 opacity-100'
                  : 'opacity-65 hover:opacity-100'
              }`}
              title={lm.placeName}
            >
              {p?.thumbUrl ? (
                <img src={p.thumbUrl} alt={lm.placeName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-300 text-slate-600 text-[10px] font-bold p-1 text-center line-clamp-1">
                  {lm.placeName.slice(0, 10)}
                </div>
              )}
              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-mono px-1 truncate text-center">
                Day {lm.days.join(',')}
              </span>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL: LANDMARK DETAILS ================= */}
      {activeLandmark && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E2E8F0] animate-scale-up">
            {/* Header Photo */}
            <div className="relative h-48 w-full bg-slate-900">
              {photos[activeLandmark.id]?.photo?.url ? (
                <img
                  src={photos[activeLandmark.id]?.photo?.url}
                  alt={activeLandmark.placeName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center">
                  <span className="material-symbols-outlined text-3xl mb-1">landscape</span>
                  <span className="text-xs font-bold text-white">{activeLandmark.placeName}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-white">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                    {activeLandmark.categoryLabel}
                  </span>
                  <h3 className="font-serif-heading text-lg font-bold">{activeLandmark.placeName}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveLandmark(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <strong className="text-[#0F172A] block mb-1">About Attraction</strong>
                <p className="text-[#64748B] leading-relaxed">{activeLandmark.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold uppercase">Location</span>
                  <span className="text-[#0F172A] font-bold">{activeLandmark.city}, {activeLandmark.country}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block font-semibold uppercase">Est. Outlay</span>
                  <span className="text-[#0891B2] font-mono font-bold">
                    {formatCurrency(activeLandmark.estimatedCostTotal, currency)}
                  </span>
                </div>
              </div>

              {/* Itinerary Schedule */}
              <div>
                <strong className="text-[#0F172A] block mb-1">Scheduled Itinerary Days</strong>
                <div className="flex flex-wrap gap-2">
                  {activeLandmark.days.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        onSelectDay(d);
                        setActiveLandmark(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#0891B2] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      <span>Jump to Day {d}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attribution */}
              {photos[activeLandmark.id]?.photo && (
                <div className="pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B] flex items-center justify-between">
                  <span>
                    Photo by{' '}
                    <a
                      href={photos[activeLandmark.id]?.photo?.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0891B2] hover:underline font-semibold"
                    >
                      {photos[activeLandmark.id]?.photo?.photographer}
                    </a>{' '}
                    on{' '}
                    <a
                      href={photos[activeLandmark.id]?.photo?.photoPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0891B2] hover:underline font-semibold"
                    >
                      Unsplash
                    </a>
                  </span>
                  <span className="font-mono font-bold text-[#0891B2]">UNSPLASH VERIFIED</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLandmark(null);
                    setPendingRemoval(activeLandmark);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition-colors"
                >
                  Remove from Trip
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLandmark(null)}
                  className="px-4 py-2 rounded-xl bg-[#0891B2] text-white font-bold cursor-pointer hover:bg-[#0e7490] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM REMOVAL ================= */}
      {pendingRemoval && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <h4 className="font-serif-heading text-base font-bold text-[#0F172A]">
              Remove "{pendingRemoval.placeName}"?
            </h4>
            <p className="text-xs text-[#64748B]">
              This attraction will be removed from Day {pendingRemoval.days.join(', ')} of your itinerary, and your budget will be recalculated.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingRemoval(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold cursor-pointer transition-colors"
              >
                Keep Attraction
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirmed}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD LANDMARK TO DAY ================= */}
      {showAddToDayModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-heading text-sm font-bold text-[#0F172A]">
                Add to Itinerary Day
              </h4>
              <button
                type="button"
                onClick={() => setShowAddToDayModal(null)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Add <strong>{showAddToDayModal.placeName}</strong> to another day in your {trip.destination} odyssey:
            </p>

            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Select Destination Day:
              </label>
              <select
                value={addToDayTarget}
                onChange={(e) => setAddToDayTarget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-semibold text-[#0F172A]"
              >
                {trip.itinerary.map((d) => (
                  <option key={d.dayNumber} value={d.dayNumber}>
                    Day {d.dayNumber} — {d.title} ({d.dateStr})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddToDayModal(null)}
                className="px-3 py-2 rounded-xl text-[#64748B] hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLandmarkToDay}
                className="px-4 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
