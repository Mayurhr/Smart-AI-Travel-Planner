/**
 * Smart AI Travel Planner 3.0
 * Bento Grid Overview Dashboard
 *
 * Implements:
 * 1. Responsive Bento Grid architecture (12-column modular hierarchy).
 * 2. Glassmorphism: Frosted glass floating controls, action bars, and subtle borders.
 * 3. Swiss Design: Clear typography, consistent grids, high data readability, tabular numerals.
 * 4. Neumorphism: Soft raised/inset shadows on selected toggles and icon buttons.
 * 5. AOS: Staggered scroll animations (fade-up, fade-right, zoom-in) respecting reduced motion.
 * 6. Dynamic data binding: Real trip origin/destination, real Google Map route, calculated budget,
 *    live weather, real destination photos, and saved trips switcher.
 */

import React, { useState } from 'react';
import { TripPlan, CurrencyCode } from '../../types/travel';
import { formatCurrency, calculateCategoryBreakdown } from '../../lib/budget';
import { generateGoogleFlightsUrl, generateBookingDotComUrl } from '../../lib/bookingLinks';
import { GoogleOverviewRouteMap } from '../maps/GoogleOverviewRouteMap';
import { RealPlacePhoto } from '../RealPlacePhoto';

interface DashboardPageProps {
  trip: TripPlan;
  currency: CurrencyCode;
  onNavigateToChat?: () => void;
  onNavigateToItinerary?: () => void;
  onNavigateToFlights?: () => void;
  onNavigateToHotels?: () => void;
  onNavigateToBudget?: () => void;
  onNavigate?: (page: string) => void;
  onOpenQuickPlan?: () => void;
  onApplyDynamicSwap?: (message: string) => void;
  allTrips?: TripPlan[];
  onSelectTrip?: (tripId: string) => void;
}

// Curated landmarks for destination recommendations based on destination query
function getDestinationRecommendations(destination: string) {
  const norm = destination.toLowerCase();
  if (norm.includes('goa')) {
    return [
      { name: 'Fort Aguada Lighthouse', type: 'Heritage & Coast', duration: '2-3 hrs', highlight: 'Portuguese 17th Century Fort' },
      { name: 'Basilica of Bom Jesus', type: 'UNESCO World Heritage', duration: '1-2 hrs', highlight: 'Baroque Architecture' },
      { name: 'Dudhsagar Waterfalls', type: 'Nature Cataract', duration: 'Half-Day', highlight: 'Tiered Mountain Falls' },
      { name: 'Chapora Fort Ramparts', type: 'Sunset Vista', duration: '1.5 hrs', highlight: 'Vagator Coastal Panorama' },
    ];
  }
  if (norm.includes('mysore') || norm.includes('mysuru')) {
    return [
      { name: 'Mysore Palace', type: 'Royal Heritage', duration: '3 hrs', highlight: 'Indo-Saracenic Architecture' },
      { name: 'Chamundi Hill', type: 'Spiritual Vista', duration: '2 hrs', highlight: 'Panoramic Valley View' },
      { name: 'Devaraja Market', type: 'Century Bazaar', duration: '1.5 hrs', highlight: 'Spices & Sandalwood' },
      { name: 'Brindavan Gardens', type: 'Botanical & Terraces', duration: '2 hrs', highlight: 'Illuminated Fountains' },
    ];
  }
  if (norm.includes('amalfi') || norm.includes('positano') || norm.includes('capri')) {
    return [
      { name: 'Positano Cliffside', type: 'Coastal Panorama', duration: '3 hrs', highlight: 'Pastel Cascades' },
      { name: 'Amalfi Cathedral', type: 'Norman-Arab Heritage', duration: '1.5 hrs', highlight: 'Piazza del Duomo' },
      { name: 'Villa Rufolo Gardens', type: 'Ravello Belvedere', duration: '2 hrs', highlight: 'Wagnerian Terraces' },
      { name: 'Capri Faraglioni', type: 'Maritime Landmark', duration: 'Half-Day', highlight: 'Limestone Sea Stacks' },
    ];
  }
  if (norm.includes('tokyo') || norm.includes('japan')) {
    return [
      { name: 'Senso-ji Temple', type: 'Asakusa Historic', duration: '2 hrs', highlight: 'Tokyo Ancient Buddhist Shrine' },
      { name: 'Tokyo Skytree', type: 'Modern Observation', duration: '2 hrs', highlight: 'Panoramic Skyline' },
      { name: 'Meiji Jingu Shrine', type: 'Sacred Forest', duration: '2 hrs', highlight: 'Tranquil Shinto Sanctuary' },
      { name: 'Shibuya Crossing', type: 'Urban Landmark', duration: '1 hr', highlight: 'Iconic Pedestrian Matrix' },
    ];
  }
  // Universal curated fallback landmarks
  return [
    { name: `${destination.split(',')[0]} Historic Center`, type: 'Heritage & Culture', duration: '2-3 hrs', highlight: 'Old Town Architecture' },
    { name: `${destination.split(',')[0]} Scenic Lookout`, type: 'Landscape Vista', duration: '1-2 hrs', highlight: 'Panoramic Viewpoint' },
    { name: `${destination.split(',')[0]} Local Market`, type: 'Gastronomy & Crafts', duration: '1.5 hrs', highlight: 'Regional Flavors' },
    { name: `${destination.split(',')[0]} Coastal Promenade`, type: 'Leisure & Nature', duration: '2 hrs', highlight: 'Open Air Walkway' },
  ];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  trip,
  currency,
  onNavigateToChat,
  onNavigateToItinerary,
  onNavigateToFlights,
  onNavigateToHotels,
  onNavigateToBudget,
  onNavigate,
  onOpenQuickPlan,
  onApplyDynamicSwap,
  allTrips = [],
  onSelectTrip,
}) => {
  const [activeCenterView, setActiveCenterView] = useState<'map' | 'timeline'>('map');
  const [quickAlert, setQuickAlert] = useState<string | null>(null);

  const handleQuickAction = (msg: string) => {
    setQuickAlert(msg);
    onApplyDynamicSwap?.(msg);
    setTimeout(() => setQuickAlert(null), 4000);
  };

  // Financial calculations
  const allocated = trip.budget.committedOutlay;
  const totalCap = trip.budget.totalCap || allocated;
  const utilizationPercent = Math.min(100, Math.round((allocated / totalCap) * 100));
  const remainingBudget = Math.max(0, totalCap - allocated);
  const { percentages } = calculateCategoryBreakdown(trip.budget.items || []);

  // Itinerary milestones
  const day1 = trip.itinerary && trip.itinerary[0];
  const day2 = trip.itinerary && trip.itinerary[1];

  // Flights / commercial transport
  const selectedFlight = trip.selectedFlight || (trip.flights && trip.flights[0]);
  const selectedRoute = trip.selectedRoute || (trip.multiModalRoutes && trip.multiModalRoutes[0]);
  const stay = trip.sanctuaries && trip.sanctuaries[0];

  // Weather telemetry
  const weather = trip.weather;

  // Recommendations
  const recommendations = getDestinationRecommendations(trip.destination);

  // Other saved trips (excluding current)
  const otherTrips = allTrips.filter((t) => t.id !== trip.id);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Alert Banner if action triggered */}
      {quickAlert && (
        <div
          data-aos="fade-down"
          data-aos-duration="400"
          className="p-3.5 glass-control rounded-2xl flex items-center justify-between border-cyan-200 text-cyan-900 shadow-sm"
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <span className="material-symbols-outlined text-cyan-600 text-base">check_circle</span>
            <span>{quickAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setQuickAlert(null)}
            className="text-[11px] text-[#64748B] hover:text-[#0F172A] font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================= QUICK ACTIONS BAR (Glassmorphism & Neumorphic Buttons) ================= */}
      <section
        data-aos="fade-down"
        data-aos-duration="500"
        className="glass-panel rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0891B2] to-[#7C3AED] flex items-center justify-center text-white shadow-2xs shrink-0">
            <span className="material-symbols-outlined text-lg">explore</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Autonomous Travel Console
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Active: <strong className="text-[#0891B2]">{trip.destination}</strong> ({trip.durationDays} Days · {trip.travelersCount} Guests)
            </p>
          </div>
        </div>

        {/* Quick Actions Cluster */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => (onOpenQuickPlan ? onOpenQuickPlan() : onNavigate?.('planner'))}
            className="px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            title="Create a new custom travel plan with multi-agent AI"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Plan New Trip</span>
          </button>

          <button
            type="button"
            onClick={() => (onNavigateToFlights ? onNavigateToFlights() : onNavigate?.('flights'))}
            className="px-3 py-2 rounded-xl neu-raised text-[#0F172A] hover:text-[#0891B2] text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Compare commercial flights and transit routes"
          >
            <span className="material-symbols-outlined text-sm text-[#0891B2]">flight</span>
            <span>Flights & Routes</span>
          </button>

          <button
            type="button"
            onClick={() => (onNavigateToChat ? onNavigateToChat() : onNavigate?.('chat'))}
            className="px-3 py-2 rounded-xl neu-raised text-[#0F172A] hover:text-[#7C3AED] text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Open conversational concierge"
          >
            <span className="material-symbols-outlined text-sm text-[#7C3AED]">smart_toy</span>
            <span>AI Concierge</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('globe')}
            className="p-2 rounded-xl neu-raised text-[#64748B] hover:text-[#0891B2] transition-all"
            title="Open 3D Earth Explorer"
            aria-label="3D Earth Explorer"
          >
            <span className="material-symbols-outlined text-base block">public</span>
          </button>
        </div>
      </section>

      {/* ================= BENTO GRID ROW 1: HERO TRIP CARD (8 COLS) + WEATHER WIDGET (4 COLS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cell 1: Upcoming Trip Hero Card (lg:col-span-8) */}
        <article
          data-aos="fade-up"
          data-aos-duration="600"
          className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between group relative"
        >
          {/* Hero Photograph with Real Place Component */}
          <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900">
            <RealPlacePhoto
              placeName={trip.destination}
              destination={trip.destination}
              aspectRatio="h-full"
              className="w-full h-full"
              alt={`Scenic view of ${trip.destination}`}
            />
            {/* Scrim Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/30 to-transparent pointer-events-none" />

            {/* Top Pills */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full glass-control text-[#0F172A] font-mono text-xs uppercase font-bold tracking-wider">
                  {trip.confNumber}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0891B2]/90 text-white text-xs font-semibold capitalize backdrop-blur-xs">
                  {trip.style} Odyssey
                </span>
              </div>
              <span className="px-3 py-1 rounded-full glass-control text-emerald-800 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Confirmed</span>
              </span>
            </div>

            {/* Bottom Header Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-cyan-300 font-bold">
                  {trip.origin.split(',')[0]} ➔ {trip.destination.split(',')[0]}
                </p>
                <h1 className="font-serif-heading text-xl sm:text-2xl md:text-3xl font-bold leading-tight drop-shadow-xs">
                  {trip.title}
                </h1>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  {trip.startDate} to {trip.endDate} · {trip.durationDays} Days · {trip.travelersCount} Traveler{trip.travelersCount > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => (onNavigateToItinerary ? onNavigateToItinerary() : onNavigate?.('itinerary'))}
                  className="px-4 py-2 rounded-xl bg-white text-[#0F172A] hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Explore Itinerary</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card Footer Bar: Pacing, Transit, Stays Telemetry */}
          <div className="p-4 bg-white border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Origin Hub</span>
              <strong className="text-[#0F172A] font-bold block truncate">{trip.origin}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Destination</span>
              <strong className="text-[#0891B2] font-bold block truncate">{trip.destination}</strong>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Rhythm Pacing</span>
              <span className="font-bold text-[#0F172A]">
                {trip.pacing?.relaxedPercent || 65}% Relaxed / {trip.pacing?.activePercent || 35}% Active
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] uppercase tracking-wider font-semibold">Total Budget Cap</span>
              <span className="font-bold text-[#0891B2] tabular-nums font-mono">
                {formatCurrency(totalCap, currency)}
              </span>
            </div>
          </div>
        </article>

        {/* Cell 2: Live Weather & Microclimate Bento Card (lg:col-span-4) */}
        <article
          data-aos="fade-up"
          data-aos-delay="100"
          data-aos-duration="600"
          className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <span className="material-symbols-outlined text-base">sunny</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Microclimate Telemetry
                </h3>
                <span className="text-[10px] text-[#64748B] truncate block max-w-[140px]">
                  {weather?.location || trip.destination}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {weather?.tempC || 26}°C
            </span>
          </div>

          {/* Condition Display */}
          <div className="p-3.5 bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] rounded-2xl border border-[#BFDBFE]/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">
                {weather?.condition || 'Clear & Coastal'}
              </span>
              <span className="text-[10px] font-mono text-[#0891B2] font-semibold">
                UV: {weather?.uvIndex || 6.8}
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              {weather?.advisoryText || 'Calm atmospheric conditions. Favorable for open-air excursions and transit.'}
            </p>
          </div>

          {/* Atmospheric Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[9px] text-[#64748B] block uppercase tracking-wider">Wind</span>
              <span className="font-bold text-[#0F172A] font-mono text-[11px]">
                {weather?.windSpeedKts || 7} kts
              </span>
            </div>
            <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[9px] text-[#64748B] block uppercase tracking-wider">Visibility</span>
              <span className="font-bold text-[#0F172A] font-mono text-[11px]">
                {weather?.visibilityKm || 18} km
              </span>
            </div>
            <div className="p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <span className="text-[9px] text-[#64748B] block uppercase tracking-wider">Golden Hr</span>
              <span className="font-bold text-[#0F172A] font-mono text-[11px]">
                {weather?.goldenHour?.split('—')[0]?.trim() || '18:45'}
              </span>
            </div>
          </div>

          {/* Packing checklist snippet */}
          {weather?.packingChecklist?.[0] && (
            <div className="pt-2 border-t border-[#E2E8F0] text-[11px]">
              <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
                Suggested Gear ({weather.packingChecklist[0].category}):
              </span>
              <div className="flex flex-wrap gap-1">
                {weather.packingChecklist[0].items.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#F1F5F9] text-[#0F172A] text-[10px] font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* ================= BENTO GRID ROW 2: GOOGLE MAPS CORRIDOR (8 COLS) + BUDGET MATRIX (4 COLS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cell 3: Interactive Google Maps Route Corridor (lg:col-span-8) */}
        <article
          data-aos="fade-up"
          data-aos-delay="150"
          data-aos-duration="600"
          className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-4 space-y-3"
        >
          {/* Header Switcher between Route Map & Timeline */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0891B2] text-lg">map</span>
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Geospatial Travel Corridor & Route Visualizer
                </h3>
                <p className="text-[10px] text-[#64748B]">
                  Powered by Google Maps Platform · Verified Coordinates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCenterView('map')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeCenterView === 'map'
                    ? 'neu-selected-cyan font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Google Map
              </button>
              <button
                type="button"
                onClick={() => setActiveCenterView('timeline')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeCenterView === 'timeline'
                    ? 'neu-selected-cyan font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Day 1 Milestone
              </button>
              <button
                type="button"
                onClick={() => (onNavigateToItinerary ? onNavigateToItinerary() : onNavigate?.('itinerary'))}
                className="px-2.5 py-1 text-xs text-[#0891B2] hover:underline font-semibold flex items-center gap-0.5"
              >
                <span>Full Day Map</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Conditional Map or Timeline view */}
          {activeCenterView === 'map' ? (
            <GoogleOverviewRouteMap
              trip={trip}
              currency={currency}
              height="420px"
              onExploreTransit={onNavigateToFlights ? onNavigateToFlights : () => onNavigate?.('flights')}
            />
          ) : (
            day1 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0891B2]">
                      Day 01 · {day1.weather?.condition || 'Arrival'}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F172A]">{day1.title}</h4>
                    <p className="text-xs text-[#64748B]">{day1.tagline}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0891B2]">
                    Est. {formatCurrency(day1.totalEstimatedCost, currency)}
                  </span>
                </div>

                <div className="space-y-2">
                  {day1.activities.slice(0, 3).map((act, aIdx) => (
                    <div
                      key={act.id}
                      className="p-3 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0891B2] text-white text-[10px] font-bold flex items-center justify-center">
                          {aIdx + 1}
                        </span>
                        <div>
                          <strong className="text-[#0F172A] block">{act.placeName || act.title}</strong>
                          <span className="text-[10px] text-[#64748B]">{act.timeSlot}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[#0891B2] font-semibold">
                        {formatCurrency(act.estimatedCost, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </article>

        {/* Cell 4: Budget Matrix Bento Card (lg:col-span-4) */}
        <article
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="600"
          onClick={() => (onNavigateToBudget ? onNavigateToBudget() : onNavigate?.('budget'))}
          className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm cursor-pointer hover:border-[#0891B2] transition-all space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0891B2] text-base">
                account_balance_wallet
              </span>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Capital Allocation Matrix
              </h3>
            </div>
            <span className="font-mono text-[10px] text-[#0891B2] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE]">
              {utilizationPercent}% Committed
            </span>
          </div>

          {/* Primary Budget Figures */}
          <div className="space-y-1">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">
              Committed Outlay
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
              {formatCurrency(allocated, currency)}
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
              <span>Budget Cap:</span>
              <span className="font-mono tabular-nums font-semibold text-[#0F172A]">
                {formatCurrency(totalCap, currency)}
              </span>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-[#F1F5F9] h-2.5 rounded-full overflow-hidden flex border border-[#E2E8F0]">
              <div
                className="h-full bg-[#0891B2]"
                style={{ width: `${percentages.transit || 25}%` }}
                title={`Transit: ${percentages.transit || 25}%`}
              />
              <div
                className="h-full bg-[#7C3AED]"
                style={{ width: `${percentages.accommodations || 40}%` }}
                title={`Stays: ${percentages.accommodations || 40}%`}
              />
              <div
                className="h-full bg-[#059669]"
                style={{ width: `${percentages.gastronomy || 20}%` }}
                title={`Dining: ${percentages.gastronomy || 20}%`}
              />
              <div
                className="h-full bg-[#F59E0B]"
                style={{ width: `${percentages.experiences || 15}%` }}
                title={`Experiences: ${percentages.experiences || 15}%`}
              />
            </div>

            {/* Category Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                <span className="text-[#64748B]">Transit ({percentages.transit || 25}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                <span className="text-[#64748B]">Stays ({percentages.accommodations || 40}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[#64748B]">Dining ({percentages.gastronomy || 20}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[#64748B]">Activities ({percentages.experiences || 15}%)</span>
              </div>
            </div>
          </div>

          {/* Remaining Balance Callout */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-emerald-800 font-semibold block uppercase tracking-wider">
                Unallocated Buffer
              </span>
              <strong className="font-mono tabular-nums text-emerald-900 text-sm">
                {formatCurrency(remainingBudget, currency)}
              </strong>
            </div>
            <span className="material-symbols-outlined text-emerald-700 text-xl">savings</span>
          </div>

          <button
            type="button"
            className="w-full py-2 rounded-xl neu-raised text-[#0891B2] hover:text-[#0e7490] font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <span>Open Detailed Budget & Arbitrage</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </article>
      </div>

      {/* ================= BENTO GRID ROW 3: UPCOMING ITINERARY (7 COLS) + REAL PHOTO RECOMMENDATIONS (5 COLS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cell 5: Upcoming Itinerary Deck (lg:col-span-7) */}
        <article
          data-aos="fade-up"
          data-aos-delay="250"
          data-aos-duration="600"
          className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7C3AED] text-base">calendar_month</span>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Upcoming Itinerary Highlights
              </h3>
            </div>
            <button
              type="button"
              onClick={() => (onNavigateToItinerary ? onNavigateToItinerary() : onNavigate?.('itinerary'))}
              className="text-xs text-[#0891B2] hover:underline font-semibold flex items-center gap-1"
            >
              <span>{trip.itinerary?.length || trip.durationDays} Days Schedule</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          {/* Day 1 & Day 2 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {day1 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E2E8F0] flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#0891B2] font-mono font-bold text-[10px]">
                    DAY 01
                  </span>
                  <span className="text-[#64748B] text-[10px]">{day1.dateStr}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">{day1.title}</h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">{day1.tagline}</p>
                </div>
                <div className="h-24 rounded-xl overflow-hidden relative">
                  <RealPlacePhoto
                    placeName={day1.activities[0]?.placeName || day1.activities[0]?.title || trip.destination}
                    destination={trip.destination}
                    aspectRatio="h-full"
                    showAttribution={false}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#0891B2] font-semibold">
                  {day1.activities.length} activities scheduled
                </span>
              </div>
            )}

            {day2 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#E2E8F0] flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-[#F5F3FF] text-[#7C3AED] font-mono font-bold text-[10px]">
                    DAY 02
                  </span>
                  <span className="text-[#64748B] text-[10px]">{day2.dateStr}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">{day2.title}</h4>
                  <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5">{day2.tagline}</p>
                </div>
                <div className="h-24 rounded-xl overflow-hidden relative">
                  <RealPlacePhoto
                    placeName={day2.activities[0]?.placeName || day2.activities[0]?.title || trip.destination}
                    destination={trip.destination}
                    aspectRatio="h-full"
                    showAttribution={false}
                  />
                </div>
                <span className="text-[10px] font-mono text-[#7C3AED] font-semibold">
                  {day2.activities.length} activities scheduled
                </span>
              </div>
            )}
          </div>
        </article>

        {/* Cell 6: Curated Destination Recommendations with Real Photos (lg:col-span-5) */}
        <article
          data-aos="fade-up"
          data-aos-delay="300"
          data-aos-duration="600"
          className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-3.5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0891B2] text-base">photo_camera</span>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Real Destination Landmarks
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#0891B2] font-semibold">
              {trip.destination.split(',')[0]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recommendations.slice(0, 4).map((rec, rIdx) => (
              <div
                key={rIdx}
                className="group rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between hover:border-[#0891B2] transition-all"
              >
                <div className="h-20 w-full overflow-hidden relative">
                  <RealPlacePhoto
                    placeName={rec.name}
                    destination={trip.destination}
                    characteristics={rec.highlight}
                    aspectRatio="h-full"
                    showAttribution={false}
                  />
                </div>
                <div className="p-2 space-y-0.5">
                  <strong className="text-[11px] text-[#0F172A] line-clamp-1 block font-bold">
                    {rec.name}
                  </strong>
                  <span className="text-[10px] text-[#0891B2] font-semibold block">
                    {rec.type}
                  </span>
                  <span className="text-[9px] text-[#64748B] block truncate">
                    {rec.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* ================= BENTO GRID ROW 4: TRANSIT MANIFEST (6 COLS) + SAVED TRIPS LIBRARY (6 COLS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cell 7: Transit & Commercial Route Manifest (lg:col-span-6) */}
        <article
          data-aos="fade-up"
          data-aos-delay="350"
          data-aos-duration="600"
          onClick={() => (onNavigateToFlights ? onNavigateToFlights() : onNavigate?.('flights'))}
          className="lg:col-span-6 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm cursor-pointer hover:border-[#0891B2] transition-all space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0891B2] text-base">flight_takeoff</span>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Transit & Route Corridor
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#0891B2] border border-[#BFDBFE]">
              {selectedFlight?.airlineName || selectedFlight?.operator || selectedRoute?.title || 'Commercial Transit'}
            </span>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <p className="font-serif-heading text-lg font-bold text-[#0F172A]">
                {selectedFlight?.originIata || trip.origin.split(',')[0]}
              </p>
              <span className="text-[11px] text-[#64748B]">
                {selectedFlight?.departureTime || trip.startDate}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] text-[#0891B2] font-bold">
                {selectedFlight?.duration || selectedRoute?.totalDuration || 'Direct Corridor'}
              </span>
              <div className="w-20 h-0.5 bg-gradient-to-r from-[#7C3AED] via-[#0891B2] to-[#7C3AED] my-1 flex items-center justify-center">
                <span className="material-symbols-outlined text-[10px] text-[#0F172A] bg-[#F8FAFC] px-0.5">
                  east
                </span>
              </div>
              <span className="text-[10px] text-[#64748B]">
                {selectedFlight?.flightNumber || 'Commercial Flight'}
              </span>
            </div>

            <div className="text-right">
              <p className="font-serif-heading text-lg font-bold text-[#0F172A]">
                {selectedFlight?.destinationIata || trip.destination.split(',')[0]}
              </p>
              <span className="text-[11px] text-[#64748B]">
                {selectedFlight?.arrivalTime || trip.endDate}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#64748B]">Total Fare:</span>
            <strong className="font-mono text-[#0891B2] text-sm font-bold">
              {selectedFlight ? formatCurrency(selectedFlight.price, currency) : 'Verified Transit Rates'}
            </strong>
          </div>
        </article>

        {/* Cell 8: Saved Expeditions & Recent Trips (lg:col-span-6) */}
        <article
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="600"
          className="lg:col-span-6 bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7C3AED] text-base">bookmark</span>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Saved Trips Library ({allTrips.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('saved')}
              className="text-xs text-[#0891B2] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Manage All</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2">
            {allTrips.slice(0, 3).map((t) => {
              const isCurrent = t.id === trip.id;
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTrip?.(t.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#EFF6FF] border-[#BFDBFE] shadow-2xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      <RealPlacePhoto
                        placeName={t.destination}
                        destination={t.destination}
                        aspectRatio="h-full"
                        showAttribution={false}
                      />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs text-[#0F172A] block truncate">{t.title}</strong>
                      <span className="text-[10px] text-[#64748B] block truncate">
                        {t.destination} · {t.durationDays} Days · {t.startDate}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 font-mono ${
                      isCurrent
                        ? 'bg-[#0891B2] text-white'
                        : 'neu-raised text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    {isCurrent ? 'Active' : 'Switch'}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
};
