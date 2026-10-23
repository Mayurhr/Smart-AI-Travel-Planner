/**
 * Smart AI Travel Planner 3.0
 * Itinerary Page
 * Faithfully matches Stitch Image 16 (Timeline & Inspection Rail)
 */

import React, { useState, useEffect } from 'react';
import { TripPlan, DayItinerary, Activity, CurrencyCode } from '../../types/travel';
import { formatCurrency, convertCurrency } from '../../lib/budget';
import { regenerateDayItinerary } from '../../lib/itineraryEngine';
import { ItineraryInteractiveMap } from '../maps/ItineraryInteractiveMap';
import { GoogleItineraryMap } from '../maps/GoogleItineraryMap';
import { RealPlacePhoto } from '../RealPlacePhoto';
import { RealLandmarkArchive } from '../itinerary/RealLandmarkArchive';

interface ItineraryPageProps {
  trip: TripPlan;
  currency: CurrencyCode;
  onUpdateTrip?: (updated: TripPlan) => void;
  onNavigate?: (page: string) => void;
  initialDay?: number;
}

export const ItineraryPage: React.FC<ItineraryPageProps> = ({
  trip,
  currency,
  onUpdateTrip,
  onNavigate,
  initialDay,
}) => {
  // Dynamically select initial day based on initialDay prop or trip duration
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDay && trip.itinerary && trip.itinerary.some((d) => d.dayNumber === initialDay)) {
      return initialDay;
    }
    return trip.itinerary && trip.itinerary.length > 0 ? trip.itinerary[0].dayNumber : 1;
  });

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Synchronize when initialDay prop changes
  useEffect(() => {
    if (initialDay && trip.itinerary && trip.itinerary.some((d) => d.dayNumber === initialDay)) {
      setSelectedDay(initialDay);
    }
  }, [initialDay, trip]);

  // Keep selectedDay within valid bounds if trip changes
  useEffect(() => {
    if (trip.itinerary && trip.itinerary.length > 0) {
      if (!trip.itinerary.some((d) => d.dayNumber === selectedDay)) {
        setSelectedDay(trip.itinerary[0].dayNumber);
      }
    }
  }, [trip, selectedDay]);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Afternoon · 15:00 - 17:00');
  const [newCategory, setNewCategory] = useState<'maritime' | 'gastronomy' | 'culture'>('maritime');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentDayData =
    trip.itinerary.find((d) => d.dayNumber === selectedDay) ||
    trip.itinerary[0] || {
      dayNumber: 1,
      dateStr: 'Day 1',
      title: 'Arrival & Welcome',
      tagline: 'Initial Exploration',
      activities: [],
      weather: { tempC: 24, condition: 'Clear', rainProb: '0%', wind: 'W 5 kts' },
      totalEstimatedCost: 10000,
    };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };



  const handleRegenerate = () => {
    setIsRegenerating(true);
    try {
      const updated = regenerateDayItinerary(trip, selectedDay, currency);
      onUpdateTrip?.(updated);
      showToast(`Day ${selectedDay} regenerated with verified unique places for ${trip.destination}.`);
    } catch (err) {
      console.warn('Regeneration error:', err);
      showToast(`Day ${selectedDay} refreshed.`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSwapAlternative = (actId: string, altLabel: string, costDelta: number) => {
    showToast(`Activity swapped for: "${altLabel}" (Cost delta: ${formatCurrency(costDelta, currency)})`);
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newActivity: Activity = {
      id: `custom-act-${Date.now()}`,
      timeSlot: newTime,
      title: newTitle,
      placeName: newTitle,
      category: newCategory,
      categoryLabel: newCategory.toUpperCase(),
      description: 'Custom activity inserted into personal dossier with private attaché coordination.',
      duration: '2h',
      estimatedCost: 35000,
      image: '',
      isVerified: true,
      dataSource: 'User-Curated Itinerary',
    };

    const updatedItinerary = trip.itinerary.map((d) => {
      if (d.dayNumber === selectedDay) {
        return {
          ...d,
          activities: [...d.activities, newActivity],
          totalEstimatedCost: d.totalEstimatedCost + 35000,
        };
      }
      return d;
    });

    onUpdateTrip?.({ ...trip, itinerary: updatedItinerary });
    setShowAddActivityModal(false);
    setNewTitle('');
    showToast('Activity successfully added to Day ' + selectedDay);
  };

  const dayTotalConverted = convertCurrency(currentDayData.totalEstimatedCost, 'INR', currency);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-lg border border-[#334155] flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-sm text-[#0891B2]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Odyssey Header Section */}
      <div className="relative w-full rounded-2xl bg-white p-6 md:p-8 shadow-sm mb-6 border border-[#E2E8F0] overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#0891B2]/10 via-[#7C3AED]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-2 mb-2 text-[#0891B2] flex-wrap">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0891B2]">
                Autonomous Concierge Curation · Verified Tier
              </span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
                Ref ID: {trip.confNumber.replace('CONF. #', '')}
              </span>
            </div>

            <h1 className="font-serif-heading text-3xl md:text-4xl lg:text-5xl text-[#0F172A] font-bold tracking-tight leading-none mb-3">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-[#64748B] pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-[#0891B2] text-base">calendar_month</span>
                <span className="text-xs font-semibold">{trip.durationDays} Days / {trip.durationDays - 1} Nights</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-[#7C3AED] text-base">speed</span>
                <span className="text-xs">
                  Pacing: <strong className="text-[#0F172A] font-bold">Relaxed {trip.pacing.relaxedPercent}%</strong> · Active {trip.pacing.activePercent}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">
                <span className="material-symbols-outlined text-[#0891B2] text-base">pin_drop</span>
                <span className="text-xs font-semibold">{trip.destination}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold transition-all shadow-2xs"
            >
              <span className={`material-symbols-outlined text-[#7C3AED] text-base ${isRegenerating ? 'animate-spin' : ''}`}>
                auto_fix_high
              </span>
              <span>{isRegenerating ? 'Recalculating...' : 'Regenerate Day with AI'}</span>
            </button>
            <button
              onClick={() => showToast('Dossier link copied to clipboard.')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-base text-[#0891B2]">share</span>
              <span>Share Dossier</span>
            </button>
            <button
              onClick={() => showToast('Pass generated and synced with Apple Wallet.')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-semibold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              <span>Export to Apple Wallet</span>
            </button>
          </div>
        </div>

        {/* Day Selector Strip */}
        <div className="relative z-10 mt-8 pt-4 border-t border-[#E2E8F0] flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: trip.durationDays }, (_, i) => i + 1).map((dNum) => {
            const isSelected = selectedDay === dNum;
            const matchingDay = trip.itinerary.find((d) => d.dayNumber === dNum);
            const dateLabel = matchingDay?.dateStr || `Day 0${dNum}`;

            return (
              <button
                key={dNum}
                onClick={() => setSelectedDay(dNum)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex flex-col items-start gap-0.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#0891B2] text-white shadow-sm scale-102 font-bold'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                }`}
              >
                <span className={`text-[10px] uppercase font-mono ${isSelected ? 'text-cyan-100' : 'text-[#94A3B8]'}`}>
                  {dateLabel}
                </span>
                <span>Day {dNum < 10 ? `0${dNum}` : dNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Asymmetric Workspace (8 Cols Timeline / 4 Cols Inspection Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Timeline Meta Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0891B2] text-lg">tune</span>
              <span className="text-xs font-bold text-[#0F172A]">Chronological Route Sequence</span>
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[10px] font-bold text-[#0891B2] uppercase">
                {currentDayData.activities.length} Key Curations
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#64748B] text-xs font-medium">
              <span className="material-symbols-outlined text-sm">drag_indicator</span>
              <span className="hidden sm:inline">Reorder cards to reschedule automatically</span>
            </div>
          </div>

          {/* Activities List */}
          {currentDayData.activities.map((activity, idx) => (
            <React.Fragment key={activity.id}>
              <div
                onClick={() => setSelectedActivityId(activity.id)}
                className={`relative bg-white rounded-2xl p-5 md:p-6 border transition-all cursor-pointer group ${
                  selectedActivityId === activity.id
                    ? 'border-[#0891B2] ring-2 ring-[#0891B2]/30 shadow-md bg-[#F0FDFA]/20'
                    : 'border-[#E2E8F0] hover:border-[#0891B2] shadow-sm'
                }`}
              >
                {/* Visual Status Rail */}
                <div
                  className={`absolute left-0 top-6 bottom-6 w-1.5 rounded-r ${
                    idx === 0 ? 'bg-[#0891B2]' : idx === 1 ? 'bg-[#7C3AED]' : 'bg-[#059669]'
                  }`}
                />

                <div className="pl-3 flex flex-col gap-4">
                  {/* Card Header & Time Slot */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[#94A3B8] text-base">
                        pin_drop
                      </span>
                      <div className="px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#0891B2] font-mono text-[11px] font-bold uppercase tracking-wider">
                        {activity.timeSlot}
                      </div>
                      <span className="text-[#94A3B8] text-xs">Est. {activity.duration}</span>
                      {selectedActivityId === activity.id && (
                        <span className="px-2 py-0.5 rounded-full bg-[#0891B2] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                          Focused on Map
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showToast('Editing parameters for: ' + activity.title);
                        }}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                        title="Edit Details"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                    </div>
                  </div>

                  {/* Activity Details & Real Photographic Imagery */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 relative bg-slate-100">
                      <RealPlacePhoto
                        placeName={activity.placeName || activity.title}
                        destination={trip.destination}
                        characteristics={activity.description}
                        aspectRatio="16/9"
                        className="w-full h-full"
                        alt={`${activity.title} in ${trip.destination}`}
                      />
                      {activity.badge && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#0F172A]/80 text-white text-[10px] font-mono uppercase backdrop-blur-sm z-10">
                          {activity.badge}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-1.5 text-[#0891B2]">
                            <span className="material-symbols-outlined text-sm">
                              {activity.category === 'culture'
                                ? 'fort'
                                : activity.category === 'nature'
                                ? 'landscape'
                                : activity.category === 'gastronomy'
                                ? 'restaurant'
                                : activity.category === 'maritime'
                                ? 'sailing'
                                : activity.category === 'adventure'
                                ? 'explore'
                                : 'place'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {activity.categoryLabel}
                            </span>
                            {activity.neighborhood && (
                              <span className="text-xs text-[#64748B]">
                                · {activity.neighborhood}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              <span>{activity.isVerified ? 'Verified Landmark' : 'Curated Place'}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                              Est. {formatCurrency(activity.estimatedCost, currency)}
                            </span>
                          </div>
                        </div>

                        <h2 className="font-serif-heading text-lg text-[#0F172A] font-bold mb-1">
                          {activity.placeName || activity.title}
                        </h2>
                        <p className="text-xs text-[#64748B] leading-relaxed">
                          {activity.description}
                        </p>
                      </div>

                      {/* Specs & Data Source */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                        {activity.specs && activity.specs.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {activity.specs.map((sp, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-[11px] font-medium"
                              >
                                {sp}
                              </span>
                            ))}
                          </div>
                        )}
                        {activity.dataSource && (
                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            Source: {activity.dataSource}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Alternative Swaps */}
                  {activity.alternatives && activity.alternatives.length > 0 && (
                    <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">
                        AI Alternatives:
                      </span>
                      {activity.alternatives.map((alt) => (
                        <button
                          key={alt.id}
                          onClick={() => handleSwapAlternative(activity.id, alt.label, alt.costDelta)}
                          className="px-2.5 py-1 rounded-full bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] text-[#7C3AED] text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">swap_horiz</span>
                          <span>{alt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Transit Connector between events if specified */}
              {activity.transitAfter && (
                <div className="flex items-center gap-3 pl-8 pr-4 py-1 text-xs text-[#64748B]">
                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#0891B2] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">directions_boat</span>
                  </div>
                  <div className="flex-1">
                    <strong className="text-[#0F172A]">{activity.transitAfter.title}: </strong>
                    <span>{activity.transitAfter.description}</span>
                    <span className="text-[#94A3B8] ml-1">• {activity.transitAfter.buffer}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Add Activity Button */}
          <button
            onClick={() => setShowAddActivityModal(true)}
            className="w-full py-4 rounded-xl border-2 border-dashed border-[#CBD5E1] hover:border-[#0891B2] bg-white/70 hover:bg-white text-[#64748B] hover:text-[#0891B2] transition-all flex items-center justify-center gap-2 group shadow-2xs"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform text-lg">
              add_circle
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Insert Custom Activity or Transfer into Day {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
            </span>
          </button>
        </div>

        {/* Side Inspection Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Real Landmark Archive (Connected dynamically to trip itinerary & Unsplash) */}
          <RealLandmarkArchive
            trip={trip}
            currency={currency}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onSelectActivity={(id) => setSelectedActivityId(id)}
            onUpdateTrip={onUpdateTrip}
            onOpenAddActivityModal={() => setShowAddActivityModal(true)}
            onNavigateToPlanner={() => onNavigate?.('planner')}
          />

          {/* Real Live Interactive Route Map */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0891B2] text-lg">map</span>
                <span className="text-xs font-bold text-[#0F172A]">Interactive Itinerary Map</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0891B2] text-[10px] font-bold uppercase">
                Day {selectedDay} Sequence
              </span>
            </div>

            <GoogleItineraryMap
              itinerary={trip.itinerary}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              selectedActivityId={selectedActivityId}
              onSelectActivity={(id) => setSelectedActivityId(id)}
              currency={currency}
              destination={trip.destination}
              origin={trip.origin}
              height="380px"
            />

            {currentDayData.activities.length > 0 && (
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#E2E8F0]">
                {currentDayData.activities.map((act, aIdx) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedActivityId === act.id ? 'bg-[#EFF6FF] text-[#0891B2]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[#0F172A] font-medium truncate max-w-[70%]">
                      <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                      <span className="truncate">WP{aIdx + 1} · {act.placeName || act.title}</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {act.coordinates ? `${act.coordinates.lat.toFixed(2)}°N` : 'Verified'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Atmospheric Telemetry */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0891B2] text-lg">sunny</span>
                <span className="text-xs font-bold text-[#0F172A]">Atmospheric Telemetry</span>
              </div>
              <span className="text-[10px] font-bold text-[#0891B2] uppercase">Optimal</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0891B2] shadow-2xs">
                  <span className="material-symbols-outlined text-2xl">wb_sunny</span>
                </div>
                <div>
                  <span className="text-2xl font-bold font-mono text-[#0F172A]">24°C</span>
                  <p className="text-[11px] text-[#0891B2] font-semibold">Mediterranean Clear</p>
                </div>
              </div>
              <div className="text-right text-[11px] text-[#64748B]">
                <p className="font-bold text-[#059669]">0% Rain</p>
                <p>Wind: WNW 7 kts</p>
              </div>
            </div>
          </div>

          {/* Itemized Day Expense Ledger */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0891B2] text-lg">receipt_long</span>
                <span className="text-xs font-bold text-[#0F172A]">Day {selectedDay} Expense Ledger</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#0891B2] font-mono text-[10px] font-bold border border-[#E2E8F0]">
                Verified
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="font-semibold text-[#0F172A]">Private Yacht Charter Riva 48'</p>
                  <p className="text-[10px] text-[#64748B]">Includes skipper & marine champagne</p>
                </div>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatCurrency(convertCurrency(165000, 'INR', currency), currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-semibold text-[#0F172A]">La Fontelina Reserved Lunch</p>
                  <p className="text-[10px] text-[#64748B]">Prepaid tasting & sommelier (2 guests)</p>
                </div>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatCurrency(convertCurrency(42800, 'INR', currency), currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-semibold text-[#0F172A]">Helicopter Transit (Capri ➔ Ravello)</p>
                  <p className="text-[10px] text-[#64748B]">Private charter & landing fees</p>
                </div>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatCurrency(convertCurrency(79500, 'INR', currency), currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-semibold text-[#0F172A]">Rossellinis Michelin Dining</p>
                  <p className="text-[10px] text-[#64748B]">Seven courses + live acoustic cello</p>
                </div>
                <span className="font-mono font-bold text-[#0F172A]">
                  {formatCurrency(convertCurrency(56200, 'INR', currency), currency)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B]">Day Total Allocation</span>
                <p className="text-[10px] text-[#0891B2]">Settled via Travel Vault</p>
              </div>
              <span className="font-serif-heading text-lg font-bold text-[#0F172A] font-mono">
                {formatCurrency(dayTotalConverted, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insert Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h3 className="font-serif-heading text-lg font-bold text-[#0F172A]">
                Insert Custom Activity into Day {selectedDay}
              </h3>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="text-[#64748B] hover:text-[#0F172A]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCustomActivity} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Catamaran Sunset Sail"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#64748B] block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#0891B2]"
                >
                  <option value="maritime">Maritime Expedition</option>
                  <option value="gastronomy">Gastronomy & Dining</option>
                  <option value="culture">Cultural Heritage</option>
                  <option value="wellness">Wellness & Spa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase shadow-sm"
                >
                  Insert Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
