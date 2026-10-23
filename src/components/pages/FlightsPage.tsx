/**
 * Smart AI Travel Planner 3.0
 * Flights & Routes Navigator — Complete Round-Trip & One-Way Multi-Modal Intelligence
 *
 * Implements:
 * 1. Clearly Separated Primary Sections:
 *    - Outbound Journey (Origin ➔ Destination, Departure Date)
 *    - Return Journey (Destination ➔ Origin, Return Date)
 *    - Round-Trip Summary (Consolidated Door-to-Door Outlay & Details)
 * 2. Independent Outbound & Return Selection:
 *    - Selecting/changing outbound does NOT overwrite return
 *    - Selecting/changing return does NOT overwrite outbound
 * 3. Separate Route Searches & Real Deep Booking Links:
 *    - Outbound Google Flights & Skyscanner links with Departure Date
 *    - Return Google Flights & Skyscanner links with Return Date and Reversed Origin/Destination
 * 4. Transparent Round-Trip Total Calculation:
 *    - Total Transport Cost = Selected Outbound Cost + Selected Return Cost
 *    - Independent breakdown of base fare, taxes, and passenger share
 *    - Master Trip Budget integration (itemized outbound & return transit)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  TripPlan,
  CurrencyCode,
  FlightOption,
  MultiModalRoute,
  CabinClass,
  ExpenseItem,
  TripType,
} from '../../types/travel';
import { formatCurrency, calculateBudgetTotals } from '../../lib/budget';
import {
  generateGoogleFlightsUrl,
  generateSkyscannerUrl,
  generateRedBusUrl,
  generateTrainSearchUrl,
} from '../../lib/bookingLinks';
import {
  synthesizeMultiModalRoutes,
  checkDirectFlightFeasibility,
} from '../../lib/routePlanner';
import {
  searchCommercialFlights,
  filterAndSortFlights,
  FlightSortOption,
  resolveAirport,
} from '../../lib/flightProvider';

interface FlightsPageProps {
  trip: TripPlan;
  currency: CurrencyCode;
  onOpenFlightChat?: () => void;
  onNavigate?: (page: string) => void;
  onUpdateTrip?: (updated: TripPlan) => void;
}

export const FlightsPage: React.FC<FlightsPageProps> = ({
  trip,
  currency,
  onNavigate,
  onUpdateTrip,
}) => {
  const isRoundTrip = (trip.tripType || 'round_trip') === 'round_trip';

  // Primary Journey Section Tab
  const [journeySection, setJourneySection] = useState<'outbound' | 'return' | 'summary'>('outbound');

  // Sub-filter tabs (Mode filter)
  const [activeModeTab, setActiveModeTab] = useState<'all' | 'flights' | 'multimodal' | 'trains' | 'buses'>('all');

  // Independent Selection States (Persisted from trip)
  const [selectedOutboundFlightId, setSelectedOutboundFlightId] = useState<string | null>(
    trip.selectedOutboundFlightId || trip.selectedFlightId || null
  );
  const [selectedOutboundRouteId, setSelectedOutboundRouteId] = useState<string | null>(
    trip.selectedRouteId || null
  );

  const [selectedReturnFlightId, setSelectedReturnFlightId] = useState<string | null>(
    trip.selectedReturnFlightId || null
  );
  const [selectedReturnRouteId, setSelectedReturnRouteId] = useState<string | null>(
    trip.selectedReturnRouteId || null
  );

  // Flight Filters & Sorting (Shared filter preferences)
  const [cabinClass, setCabinClass] = useState<CabinClass>(trip.cabinClass || 'economy');
  const [maxStops, setMaxStops] = useState<'all' | '0' | '1'>('all');
  const [selectedAirline, setSelectedAirline] = useState<string>('all');
  const [depTimeWindow, setDepTimeWindow] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [sortBy, setSortBy] = useState<FlightSortOption>('price_low');

  // Fare breakdown toggle per flight card
  const [expandedFareFlightId, setExpandedFareFlightId] = useState<string | null>(null);

  // Toast message
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string } | null>(null);

  const showToast = (title: string, desc: string) => {
    setToastMsg({ title, desc });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync internal states if parent trip updates
  useEffect(() => {
    if (trip.selectedOutboundFlightId) setSelectedOutboundFlightId(trip.selectedOutboundFlightId);
    if (trip.selectedFlightId && !trip.selectedOutboundFlightId) setSelectedOutboundFlightId(trip.selectedFlightId);
    if (trip.selectedReturnFlightId) setSelectedReturnFlightId(trip.selectedReturnFlightId);
    if (trip.selectedRouteId) setSelectedOutboundRouteId(trip.selectedRouteId);
    if (trip.selectedReturnRouteId) setSelectedReturnRouteId(trip.selectedReturnRouteId);
  }, [trip]);

  // =========================================================================
  // CORRIDOR & FEASIBILITY ANALYSIS
  // =========================================================================
  const directFlightFeasibilityOutbound = useMemo(() => {
    return checkDirectFlightFeasibility(trip.origin, trip.destination, 350);
  }, [trip.origin, trip.destination]);

  const directFlightFeasibilityReturn = useMemo(() => {
    return checkDirectFlightFeasibility(trip.destination, trip.origin, 350);
  }, [trip.destination, trip.origin]);

  // =========================================================================
  // 1. OUTBOUND JOURNEY DATA
  // =========================================================================
  const outboundMultiModalRoutes = useMemo(() => {
    if (trip.multiModalRoutes && trip.multiModalRoutes.length > 0) {
      return trip.multiModalRoutes;
    }
    return synthesizeMultiModalRoutes({
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: trip.travelersCount,
      distanceKm: 350,
      direction: 'outbound',
    });
  }, [trip.origin, trip.destination, trip.startDate, trip.endDate, trip.travelersCount, trip.multiModalRoutes]);

  const activeSelectedOutboundRoute = useMemo(() => {
    return outboundMultiModalRoutes.find((r) => r.id === selectedOutboundRouteId) || trip.selectedRoute || null;
  }, [outboundMultiModalRoutes, selectedOutboundRouteId, trip.selectedRoute]);

  const rawOutboundFlights = useMemo(() => {
    if (trip.outboundJourney?.availableOptions && trip.outboundJourney.availableOptions.length > 0) {
      return trip.outboundJourney.availableOptions;
    }
    return searchCommercialFlights({
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: trip.travelersCount,
      cabinClass,
      selectedRoute: activeSelectedOutboundRoute || undefined,
      direction: 'outbound',
    });
  }, [trip.origin, trip.destination, trip.startDate, trip.endDate, trip.travelersCount, cabinClass, activeSelectedOutboundRoute, trip.outboundJourney]);

  const displayedOutboundFlights = useMemo(() => {
    return filterAndSortFlights(rawOutboundFlights, {
      maxStops,
      cabinClass,
      selectedAirline,
      depTimeWindow,
      sortBy,
    });
  }, [rawOutboundFlights, maxStops, cabinClass, selectedAirline, depTimeWindow, sortBy]);

  const activeSelectedOutboundFlight = useMemo(() => {
    if (selectedOutboundFlightId) {
      const found = rawOutboundFlights.find((f) => f.id === selectedOutboundFlightId);
      if (found) return found;
      if (trip.selectedOutboundFlight?.id === selectedOutboundFlightId) return trip.selectedOutboundFlight;
      if (trip.selectedFlight?.id === selectedOutboundFlightId) return trip.selectedFlight;
    }
    return rawOutboundFlights[0] || null;
  }, [selectedOutboundFlightId, rawOutboundFlights, trip.selectedOutboundFlight, trip.selectedFlight]);

  // Outbound Deep Search Context
  const outboundBookingCtx = {
    origin: trip.origin,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.startDate,
    travelers: trip.travelersCount,
  };
  const outboundGfUrl = generateGoogleFlightsUrl(outboundBookingCtx);
  const outboundSkyUrl = generateSkyscannerUrl(outboundBookingCtx);
  const outboundRedBusUrl = generateRedBusUrl(outboundBookingCtx);
  const trainUrl = generateTrainSearchUrl();

  // =========================================================================
  // 2. RETURN JOURNEY DATA (Destination ➔ Origin on endDate)
  // =========================================================================
  const returnMultiModalRoutes = useMemo(() => {
    if (trip.returnMultiModalRoutes && trip.returnMultiModalRoutes.length > 0) {
      return trip.returnMultiModalRoutes;
    }
    return synthesizeMultiModalRoutes({
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: trip.travelersCount,
      distanceKm: 350,
      direction: 'return',
    });
  }, [trip.origin, trip.destination, trip.startDate, trip.endDate, trip.travelersCount, trip.returnMultiModalRoutes]);

  const activeSelectedReturnRoute = useMemo(() => {
    return returnMultiModalRoutes.find((r) => r.id === selectedReturnRouteId) || trip.selectedReturnRoute || null;
  }, [returnMultiModalRoutes, selectedReturnRouteId, trip.selectedReturnRoute]);

  const rawReturnFlights = useMemo(() => {
    if (trip.returnJourney?.availableOptions && trip.returnJourney.availableOptions.length > 0) {
      return trip.returnJourney.availableOptions;
    }
    return searchCommercialFlights({
      origin: trip.origin,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelersCount: trip.travelersCount,
      cabinClass,
      selectedRoute: activeSelectedReturnRoute || undefined,
      direction: 'return',
    });
  }, [trip.origin, trip.destination, trip.startDate, trip.endDate, trip.travelersCount, cabinClass, activeSelectedReturnRoute, trip.returnJourney]);

  const displayedReturnFlights = useMemo(() => {
    return filterAndSortFlights(rawReturnFlights, {
      maxStops,
      cabinClass,
      selectedAirline,
      depTimeWindow,
      sortBy,
    });
  }, [rawReturnFlights, maxStops, cabinClass, selectedAirline, depTimeWindow, sortBy]);

  const activeSelectedReturnFlight = useMemo(() => {
    if (selectedReturnFlightId) {
      const found = rawReturnFlights.find((f) => f.id === selectedReturnFlightId);
      if (found) return found;
      if (trip.selectedReturnFlight?.id === selectedReturnFlightId) return trip.selectedReturnFlight;
    }
    return rawReturnFlights[0] || null;
  }, [selectedReturnFlightId, rawReturnFlights, trip.selectedReturnFlight]);

  // Return Deep Search Context (Reversed Origin & Destination, on Return Date!)
  const returnBookingCtx = {
    origin: trip.destination,
    destination: trip.origin,
    startDate: trip.endDate,
    endDate: trip.endDate,
    travelers: trip.travelersCount,
  };
  const returnGfUrl = generateGoogleFlightsUrl(returnBookingCtx);
  const returnSkyUrl = generateSkyscannerUrl(returnBookingCtx);
  const returnRedBusUrl = generateRedBusUrl(returnBookingCtx);

  // Distinct airlines across active tab
  const currentRawFlights = journeySection === 'return' ? rawReturnFlights : rawOutboundFlights;
  const availableAirlines = useMemo(() => {
    const set = new Set<string>();
    currentRawFlights.forEach((f) => {
      if (f.airlineName) set.add(f.airlineName);
    });
    return Array.from(set);
  }, [currentRawFlights]);

  // =========================================================================
  // 3. TRANSPARENT ROUND-TRIP TOTAL CALCULATIONS
  // =========================================================================
  const outboundFlightPrice = activeSelectedOutboundFlight
    ? (activeSelectedOutboundFlight.totalPrice || activeSelectedOutboundFlight.price)
    : 0;
  const outboundRoutePrice = activeSelectedOutboundRoute ? activeSelectedOutboundRoute.totalCostINR : 0;
  const effectiveOutboundCost = outboundFlightPrice || outboundRoutePrice;

  const returnFlightPrice = activeSelectedReturnFlight
    ? (activeSelectedReturnFlight.totalPrice || activeSelectedReturnFlight.price)
    : 0;
  const returnRoutePrice = activeSelectedReturnRoute ? activeSelectedReturnRoute.totalCostINR : 0;
  const effectiveReturnCost = isRoundTrip ? (returnFlightPrice || returnRoutePrice) : 0;

  const totalRoundTripTransportCost = effectiveOutboundCost + effectiveReturnCost;
  const costPerPersonTransport = Math.round(totalRoundTripTransportCost / Math.max(1, trip.travelersCount));

  // =========================================================================
  // HANDLERS: INDEPENDENT SELECTION & BUDGET INTEGRATION
  // =========================================================================

  // Handle Outbound Flight Selection
  const handleSelectOutboundFlight = (flight: FlightOption) => {
    const isSame = selectedOutboundFlightId === flight.id;
    const newFlightId = isSame ? null : flight.id;
    const newFlight = isSame ? null : flight;

    setSelectedOutboundFlightId(newFlightId);

    // Update master trip budget items: Update or insert exp-transit-outbound
    const existingItems = trip.budget.items ? [...trip.budget.items] : [];
    const outboundItemIdx = existingItems.findIndex(
      (it) => it.id === 'exp-transit-outbound' || (it.category === 'transit' && !it.entityName.toLowerCase().includes('return'))
    );

    const outboundExpense: ExpenseItem = {
      id: outboundItemIdx >= 0 ? existingItems[outboundItemIdx].id : 'exp-transit-outbound',
      entityName: newFlight
        ? `Outbound Flight: ${newFlight.airlineName || newFlight.operator} (${newFlight.flightNumber || 'Direct'})`
        : `Outbound Transit: ${trip.origin.split(',')[0]} ➔ ${trip.destination.split(',')[0]}`,
      subDetail: newFlight
        ? `${newFlight.originIata} ➔ ${newFlight.destinationIata} · ${newFlight.departureTime} (${trip.travelersCount} Travelers)`
        : 'Self-Booked Transit',
      dateRange: trip.startDate,
      category: 'transit',
      paymentMethod: 'Commercial Carrier',
      status: 'authorized',
      amount: newFlight ? (newFlight.totalPrice || newFlight.price) : 0,
    };

    if (outboundItemIdx >= 0) {
      existingItems[outboundItemIdx] = outboundExpense;
    } else {
      existingItems.unshift(outboundExpense);
    }

    const math = calculateBudgetTotals(existingItems, trip.budget.totalCap);

    const updatedTrip: TripPlan = {
      ...trip,
      selectedOutboundFlightId: newFlight?.id,
      selectedOutboundFlight: newFlight || undefined,
      selectedFlightId: newFlight?.id,
      selectedFlight: newFlight || undefined,
      budget: {
        ...trip.budget,
        items: existingItems,
        committedOutlay: math.committedOutlay,
        contingencyReserve: math.contingencyReserve,
      },
      outboundJourney: {
        direction: 'outbound',
        origin: trip.origin,
        destination: trip.destination,
        travelDate: trip.startDate,
        availableOptions: rawOutboundFlights,
        selectedOptionId: newFlight?.id,
        selectedOption: newFlight || undefined,
        bookingUrl: outboundGfUrl,
      },
    };

    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    if (newFlight) {
      showToast(
        'Outbound Flight Committed',
        `${newFlight.airlineName} ${newFlight.flightNumber} selected for ${trip.startDate} (${formatCurrency(newFlight.totalPrice || newFlight.price, currency)}). Return selection preserved.`
      );
    } else {
      showToast('Outbound Deselected', 'Cleared outbound flight selection.');
    }
  };

  // Handle Return Flight Selection
  const handleSelectReturnFlight = (flight: FlightOption) => {
    const isSame = selectedReturnFlightId === flight.id;
    const newFlightId = isSame ? null : flight.id;
    const newFlight = isSame ? null : flight;

    setSelectedReturnFlightId(newFlightId);

    // Update master trip budget items: Update or insert exp-transit-return
    const existingItems = trip.budget.items ? [...trip.budget.items] : [];
    const returnItemIdx = existingItems.findIndex(
      (it) => it.id === 'exp-transit-return' || (it.category === 'transit' && it.entityName.toLowerCase().includes('return'))
    );

    const returnExpense: ExpenseItem = {
      id: returnItemIdx >= 0 ? existingItems[returnItemIdx].id : 'exp-transit-return',
      entityName: newFlight
        ? `Return Flight: ${newFlight.airlineName || newFlight.operator} (${newFlight.flightNumber || 'Direct'})`
        : `Return Transit: ${trip.destination.split(',')[0]} ➔ ${trip.origin.split(',')[0]}`,
      subDetail: newFlight
        ? `${newFlight.originIata} ➔ ${newFlight.destinationIata} · ${newFlight.departureTime} (${trip.travelersCount} Travelers)`
        : 'Self-Booked Return Transit',
      dateRange: trip.endDate,
      category: 'transit',
      paymentMethod: 'Commercial Carrier',
      status: 'authorized',
      amount: newFlight ? (newFlight.totalPrice || newFlight.price) : 0,
    };

    if (returnItemIdx >= 0) {
      existingItems[returnItemIdx] = returnExpense;
    } else {
      existingItems.push(returnExpense);
    }

    const math = calculateBudgetTotals(existingItems, trip.budget.totalCap);

    const updatedTrip: TripPlan = {
      ...trip,
      selectedReturnFlightId: newFlight?.id,
      selectedReturnFlight: newFlight || undefined,
      budget: {
        ...trip.budget,
        items: existingItems,
        committedOutlay: math.committedOutlay,
        contingencyReserve: math.contingencyReserve,
      },
      returnJourney: {
        direction: 'return',
        origin: trip.destination,
        destination: trip.origin,
        travelDate: trip.endDate,
        availableOptions: rawReturnFlights,
        selectedOptionId: newFlight?.id,
        selectedOption: newFlight || undefined,
        bookingUrl: returnGfUrl,
      },
    };

    if (onUpdateTrip) onUpdateTrip(updatedTrip);

    if (newFlight) {
      showToast(
        'Return Flight Committed',
        `${newFlight.airlineName} ${newFlight.flightNumber} selected for ${trip.endDate} (${formatCurrency(newFlight.totalPrice || newFlight.price, currency)}). Outbound selection preserved.`
      );
    } else {
      showToast('Return Deselected', 'Cleared return flight selection.');
    }
  };

  // Handle Outbound Corridor Route Selection
  const handleSelectOutboundRoute = (route: MultiModalRoute) => {
    const isSame = selectedOutboundRouteId === route.id;
    const newRouteId = isSame ? null : route.id;
    setSelectedOutboundRouteId(newRouteId);

    if (onUpdateTrip) {
      onUpdateTrip({
        ...trip,
        selectedRouteId: newRouteId || undefined,
        selectedRoute: isSame ? undefined : route,
      });
    }
    showToast(isSame ? 'Outbound Route Deselected' : 'Outbound Route Committed', route.title);
  };

  // Handle Return Corridor Route Selection
  const handleSelectReturnRoute = (route: MultiModalRoute) => {
    const isSame = selectedReturnRouteId === route.id;
    const newRouteId = isSame ? null : route.id;
    setSelectedReturnRouteId(newRouteId);

    if (onUpdateTrip) {
      onUpdateTrip({
        ...trip,
        selectedReturnRouteId: newRouteId || undefined,
        selectedReturnRoute: isSame ? undefined : route,
      });
    }
    showToast(isSame ? 'Return Route Deselected' : 'Return Route Committed', route.title);
  };

  return (
    <div className="flex flex-col w-full pb-28 space-y-6 animate-fade-in relative">
      {/* Toast Notification Stream */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#334155] flex items-start gap-3 text-xs max-w-sm animate-fade-in">
          <div className="w-6 h-6 rounded-lg bg-[#0891B2] flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-sm text-white">check</span>
          </div>
          <div className="flex-1 min-w-0">
            <strong className="block text-[#38BDF8] font-bold text-xs">{toastMsg.title}</strong>
            <p className="text-[#94A3B8] text-[11px] leading-snug mt-0.5">{toastMsg.desc}</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#0891B2] text-[10px] uppercase font-bold tracking-wider border border-[#BFDBFE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse" />
              {isRoundTrip ? 'Round-Trip Route Planning Active' : 'One-Way Journey Active'}
            </span>
            <span className="text-[#64748B] font-medium">
              {trip.origin.split(',')[0]} ⇄ {trip.destination.split(',')[0]}
            </span>
            <span className="text-[#94A3B8]">·</span>
            <span className="text-[#0F172A] font-semibold">
              {trip.startDate} {isRoundTrip ? `➔ ${trip.endDate}` : ''}
            </span>
          </div>

          <h1 className="font-serif-heading text-2xl sm:text-3xl text-[#0F172A] font-bold tracking-tight">
            Flights & Multi-Modal Route Navigator
          </h1>
          <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
            Plan both directions independently. Compare verified commercial flights with transparent fare breakdowns and multi-modal transfer corridors with live booking search links.
          </p>
        </div>

        {/* Live Search Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={journeySection === 'return' ? returnGfUrl : outboundGfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">flight</span>
            <span>Google Flights</span>
          </a>
          <a
            href={journeySection === 'return' ? returnSkyUrl : outboundSkyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">travel_explore</span>
            <span>Skyscanner</span>
          </a>
          <a
            href={journeySection === 'return' ? returnRedBusUrl : outboundRedBusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">directions_bus</span>
            <span>RedBus</span>
          </a>
          <a
            href={trainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">train</span>
            <span>IRCTC Trains</span>
          </a>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3 PRIMARY SECTION TABS: OUTBOUND, RETURN & SUMMARY (Requirement A.5) */}
      {/* ========================================================================= */}
      <nav aria-label="Journey Direction Tabs" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Outbound Tab */}
        <button
          type="button"
          onClick={() => setJourneySection('outbound')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            journeySection === 'outbound'
              ? 'bg-[#EFF6FF] border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0891B2] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">flight_takeoff</span>
              <span>1. Outbound Journey</span>
            </span>
            {activeSelectedOutboundFlight && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Flight Selected" />
            )}
          </div>
          <strong className="text-sm text-[#0F172A] block font-semibold">
            {trip.origin.split(',')[0]} ➔ {trip.destination.split(',')[0]}
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
            <span>Departure: {trip.startDate}</span>
            <span className="font-mono font-bold text-[#0F172A]">
              {effectiveOutboundCost > 0 ? formatCurrency(effectiveOutboundCost, currency) : 'Select leg'}
            </span>
          </div>
        </button>

        {/* Return Tab */}
        <button
          type="button"
          onClick={() => setJourneySection('return')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            journeySection === 'return'
              ? 'bg-[#EFF6FF] border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">flight_land</span>
              <span>2. Return Journey</span>
            </span>
            {isRoundTrip && activeSelectedReturnFlight && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Return Flight Selected" />
            )}
            {!isRoundTrip && (
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                One-Way
              </span>
            )}
          </div>
          <strong className="text-sm text-[#0F172A] block font-semibold">
            {trip.destination.split(',')[0]} ➔ {trip.origin.split(',')[0]}
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
            <span>Return: {trip.endDate || 'Not scheduled'}</span>
            <span className="font-mono font-bold text-[#0F172A]">
              {isRoundTrip
                ? (effectiveReturnCost > 0 ? formatCurrency(effectiveReturnCost, currency) : 'Select leg')
                : 'N/A'}
            </span>
          </div>
        </button>

        {/* Round-Trip Summary Tab */}
        <button
          type="button"
          onClick={() => setJourneySection('summary')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            journeySection === 'summary'
              ? 'bg-[#F0FDF4] border-[#059669] ring-2 ring-[#059669]/20 shadow-xs'
              : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">receipt_long</span>
              <span>3. Round-Trip Summary</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#059669] px-2 py-0.5 rounded bg-emerald-100">
              Consolidated
            </span>
          </div>
          <strong className="text-sm text-[#0F172A] block font-semibold">
            Total Transport Outlay
          </strong>
          <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
            <span>{trip.travelersCount} Travelers Total</span>
            <span className="font-mono font-bold text-[#059669]">
              {formatCurrency(totalRoundTripTransportCost, currency)}
            </span>
          </div>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 3. ROUND-TRIP SUMMARY VIEW */}
      {/* ========================================================================= */}
      {journeySection === 'summary' && (
        <section aria-label="Round-Trip Summary Breakdown" className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#059669]">
                  Verified Booking Matrix
                </span>
                <h2 className="font-serif-heading text-2xl font-bold text-[#0F172A] mt-1">
                  Complete Round-Trip Transport Breakdown
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 uppercase block">Total Door-to-Door Outlay</span>
                <strong className="text-2xl font-mono font-bold text-[#059669]">
                  {formatCurrency(totalRoundTripTransportCost, currency)}
                </strong>
                <span className="text-[11px] text-gray-500 block">
                  ~{formatCurrency(costPerPersonTransport, currency)} per traveler
                </span>
              </div>
            </div>

            {/* Side-by-Side Cards: Outbound & Return */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outbound Card */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0891B2] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">flight_takeoff</span>
                    <span>Outbound Leg</span>
                  </span>
                  <span className="text-xs font-semibold text-[#0F172A]">{trip.startDate}</span>
                </div>

                <div className="space-y-1">
                  <strong className="text-base text-[#0F172A] block">
                    {trip.origin.split(',')[0]} ➔ {trip.destination.split(',')[0]}
                  </strong>
                  <span className="text-xs text-[#64748B] block">
                    {activeSelectedOutboundFlight
                      ? `${activeSelectedOutboundFlight.airlineName} ${activeSelectedOutboundFlight.flightNumber} · ${activeSelectedOutboundFlight.departureTime} departure`
                      : activeSelectedOutboundRoute?.title || 'No flight committed'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-[#64748B]">Outbound Total:</span>
                  <strong className="font-mono text-sm text-[#0F172A]">
                    {formatCurrency(effectiveOutboundCost, currency)}
                  </strong>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setJourneySection('outbound')}
                    className="flex-1 py-2 text-xs font-bold uppercase rounded-xl border border-[#CBD5E1] text-[#0F172A] hover:bg-white text-center transition-all"
                  >
                    Change Outbound
                  </button>
                  <a
                    href={outboundGfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-bold uppercase rounded-xl bg-[#0891B2] text-white hover:bg-[#0e7490] flex items-center gap-1 transition-all"
                  >
                    <span>Search Google</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Return Card */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">flight_land</span>
                    <span>Return Leg</span>
                  </span>
                  <span className="text-xs font-semibold text-[#0F172A]">{trip.endDate || 'Not set'}</span>
                </div>

                <div className="space-y-1">
                  <strong className="text-base text-[#0F172A] block">
                    {trip.destination.split(',')[0]} ➔ {trip.origin.split(',')[0]}
                  </strong>
                  <span className="text-xs text-[#64748B] block">
                    {isRoundTrip
                      ? (activeSelectedReturnFlight
                          ? `${activeSelectedReturnFlight.airlineName} ${activeSelectedReturnFlight.flightNumber} · ${activeSelectedReturnFlight.departureTime} departure`
                          : activeSelectedReturnRoute?.title || 'No return flight committed')
                      : 'One-Way Journey · Return leg not scheduled.'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-[#64748B]">Return Total:</span>
                  <strong className="font-mono text-sm text-[#0F172A]">
                    {isRoundTrip ? formatCurrency(effectiveReturnCost, currency) : 'N/A'}
                  </strong>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setJourneySection('return')}
                    className="flex-1 py-2 text-xs font-bold uppercase rounded-xl border border-[#CBD5E1] text-[#0F172A] hover:bg-white text-center transition-all"
                  >
                    Change Return
                  </button>
                  {isRoundTrip && (
                    <a
                      href={returnGfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-bold uppercase rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] flex items-center gap-1 transition-all"
                    >
                      <span>Search Google</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#1E293B]">
                <strong className="block text-sm font-semibold text-[#0891B2]">
                  Round-Trip Transport Committed to Trip Budget
                </strong>
                <span>
                  Both legs are saved to your master budget plan ({formatCurrency(totalRoundTripTransportCost, currency)} total outlay).
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate?.('budget')}
                  className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  View In Budget
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.('itinerary')}
                  className="px-5 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                >
                  <span>Go to Itinerary</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 1 & 2. OUTBOUND / RETURN DIRECTION DETAIL VIEW */}
      {/* ========================================================================= */}
      {journeySection !== 'summary' && (
        <div className="space-y-6">
          {/* Active Direction Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              journeySection === 'outbound'
                ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                : 'bg-[#FAF5FF] border-[#E9D5FF]'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 ${
                  journeySection === 'outbound' ? 'bg-[#0891B2]' : 'bg-[#7C3AED]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {journeySection === 'outbound' ? 'flight_takeoff' : 'flight_land'}
                </span>
              </div>
              <div>
                <strong className="text-[#0F172A] block font-semibold text-sm">
                  {journeySection === 'outbound'
                    ? `Outbound Leg: ${trip.origin.split(',')[0]} ➔ ${trip.destination.split(',')[0]}`
                    : `Return Leg: ${trip.destination.split(',')[0]} ➔ ${trip.origin.split(',')[0]}`}
                </strong>
                <span className="text-[#64748B] block text-xs mt-0.5 leading-relaxed">
                  Date: <strong className="text-[#0F172A] font-semibold">{journeySection === 'outbound' ? trip.startDate : trip.endDate}</strong> · {trip.travelersCount} Travelers
                  {journeySection === 'outbound'
                    ? ` · ${directFlightFeasibilityOutbound.reason}`
                    : ` · ${directFlightFeasibilityReturn.reason}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={journeySection === 'outbound' ? outboundGfUrl : returnGfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-1"
              >
                <span>Live Google Search</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Mode Tabs (Commercial Flights, Multi-Leg, Buses, Trains) */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl self-start overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveModeTab('all')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeModeTab === 'all'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All Transit Options ({(journeySection === 'outbound' ? outboundMultiModalRoutes.length + displayedOutboundFlights.length : returnMultiModalRoutes.length + displayedReturnFlights.length)})
              </button>
              <button
                onClick={() => setActiveModeTab('flights')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeModeTab === 'flights'
                    ? 'bg-white text-[#7C3AED] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">flight</span>
                <span>Commercial Flights ({(journeySection === 'outbound' ? displayedOutboundFlights.length : displayedReturnFlights.length)})</span>
              </button>
              <button
                onClick={() => setActiveModeTab('multimodal')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeModeTab === 'multimodal'
                    ? 'bg-white text-[#0891B2] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">alt_route</span>
                <span>Multi-Modal Corridors</span>
              </button>
              <button
                onClick={() => setActiveModeTab('trains')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeModeTab === 'trains'
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">train</span>
                <span>Scenic Rail</span>
              </button>
              <button
                onClick={() => setActiveModeTab('buses')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeModeTab === 'buses'
                    ? 'bg-white text-[#059669] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span className="material-symbols-outlined text-xs">directions_bus</span>
                <span>Sleeper Coaches</span>
              </button>
            </div>

            {/* Cabin Class Switcher */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl self-start sm:self-auto">
              {(['economy', 'premium_economy', 'business', 'first'] as CabinClass[]).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setCabinClass(cls)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg transition-all ${
                    cabinClass === cls
                      ? 'bg-white text-[#7C3AED] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {cls.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Filter and Sort Control Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] text-[11px] font-medium">Stops:</span>
                <select
                  value={maxStops}
                  onChange={(e) => setMaxStops(e.target.value as any)}
                  className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="all">Any Stops</option>
                  <option value="0">Non-Stop Only</option>
                  <option value="1">1 Stop Max</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] text-[11px] font-medium">Airline:</span>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="all">All Airlines ({availableAirlines.length})</option>
                  {availableAirlines.map((al) => (
                    <option key={al} value={al}>
                      {al}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#64748B] text-[11px] font-medium">Departure:</span>
                <select
                  value={depTimeWindow}
                  onChange={(e) => setDepTimeWindow(e.target.value as any)}
                  className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="all">Any Time</option>
                  <option value="morning">Morning (05:00 - 12:00)</option>
                  <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                  <option value="evening">Evening (17:00+)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#64748B] text-[11px] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as FlightSortOption)}
                className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] rounded-lg px-2.5 py-1 text-xs font-semibold focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="price_low">Lowest Price</option>
                <option value="duration_short">Shortest Duration</option>
                <option value="stops_fewest">Fewest Stops</option>
                <option value="dep_earliest">Earliest Departure</option>
                <option value="dep_latest">Latest Departure</option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COMMERCIAL FLIGHT RESULTS LIST */}
          {/* ========================================================================= */}
          {(activeModeTab === 'all' || activeModeTab === 'flights') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#7C3AED]">flight</span>
                  <span>
                    Commercial Scheduled Flights ({journeySection === 'outbound' ? displayedOutboundFlights.length : displayedReturnFlights.length} Options)
                  </span>
                </h3>
                <span className="text-[11px] text-[#64748B]">
                  Direction: <strong className="text-[#0F172A]">{journeySection === 'outbound' ? 'Outbound Leg' : 'Return Leg'}</strong>
                </span>
              </div>

              {(journeySection === 'outbound' ? displayedOutboundFlights : displayedReturnFlights).map((flight) => {
                const isSelected =
                  journeySection === 'outbound'
                    ? selectedOutboundFlightId === flight.id
                    : selectedReturnFlightId === flight.id;
                const isFareExpanded = expandedFareFlightId === flight.id;

                return (
                  <article
                    key={flight.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-md'
                        : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-xs'
                    }`}
                  >
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Top Row: Airline, Logo, Flight # & Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2] shrink-0 font-bold">
                            <span className="material-symbols-outlined text-xl">flight</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-bold text-[#0F172A]">
                                {flight.airlineName || flight.operator}
                              </strong>
                              <span className="text-xs text-[#64748B] font-mono">
                                ({flight.flightNumber || 'Scheduled'})
                              </span>
                            </div>
                            <span className="text-[11px] text-[#64748B] block mt-0.5">
                              {flight.aircraftModel} · {flight.cabinClass ? flight.cabinClass.toUpperCase() : 'ECONOMY'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                              flight.stopsCount === 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {flight.stopsCount === 0 ? 'Non-Stop' : `${flight.stopsCount} Stop`}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-[#475569]">
                            {flight.duration}
                          </span>
                        </div>
                      </div>

                      {/* Flight Route & Timetable Line */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center py-3 border-y border-[#F1F5F9]">
                        <div>
                          <strong className="text-xl font-bold font-mono text-[#0F172A] block">
                            {flight.departureTime}
                          </strong>
                          <span className="text-xs font-semibold text-[#0F172A] block mt-0.5">
                            {flight.originIata} · {flight.originName}
                          </span>
                          <span className="text-[11px] text-[#64748B] block">{flight.originDetail}</span>
                        </div>

                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                            {flight.stopsCount === 0 ? 'Direct Non-Stop' : 'Connecting Flight'}
                          </span>
                          <div className="flex items-center justify-center gap-2 text-[#94A3B8]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                            <div className="w-24 sm:w-32 h-0.5 bg-[#E2E8F0] relative">
                              <span className="material-symbols-outlined text-xs absolute -top-1.5 left-1/2 -translate-x-1/2 text-[#0891B2]">
                                flight
                              </span>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium block">
                            {flight.departureDate || (journeySection === 'outbound' ? trip.startDate : trip.endDate)}
                          </span>
                        </div>

                        <div className="sm:text-right">
                          <strong className="text-xl font-bold font-mono text-[#0F172A] block">
                            {flight.arrivalTime}
                          </strong>
                          <span className="text-xs font-semibold text-[#0F172A] block mt-0.5">
                            {flight.destinationIata} · {flight.destinationName}
                          </span>
                          <span className="text-[11px] text-[#64748B] block">{flight.destinationDetail}</span>
                        </div>
                      </div>

                      {/* Pricing, Breakdown Toggle & Select Button */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <strong className="text-xl font-bold font-mono text-[#0F172A]">
                              {formatCurrency(flight.totalPrice || flight.price, currency)}
                            </strong>
                            <span className="text-xs text-[#64748B]">
                              ({trip.travelersCount} Travelers Total)
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748B] block">
                            {formatCurrency(flight.pricePerPerson || Math.round((flight.totalPrice || flight.price) / trip.travelersCount), currency)} / passenger (Taxes included)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedFareFlightId(isFareExpanded ? null : flight.id)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors"
                          >
                            {isFareExpanded ? 'Hide Breakdown' : 'Fare Breakdown'}
                          </button>

                          {flight.bookingUrl && (
                            <a
                              href={flight.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl text-xs font-bold text-[#0891B2] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-colors flex items-center gap-1"
                            >
                              <span>Check Live Rate</span>
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              journeySection === 'outbound'
                                ? handleSelectOutboundFlight(flight)
                                : handleSelectReturnFlight(flight)
                            }
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-[#0891B2] hover:bg-[#0e7490] text-white shadow-xs'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isSelected ? 'check_circle' : 'add_circle'}
                            </span>
                            <span>{isSelected ? 'Selected' : `Select for ${journeySection === 'outbound' ? 'Outbound' : 'Return'}`}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Fare Breakdown Drawer */}
                      {isFareExpanded && flight.fareBreakdown && (
                        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs space-y-2 animate-fade-in">
                          <strong className="text-[#0F172A] block uppercase tracking-wider text-[11px]">
                            Transparent Fare Breakdown ({flight.airlineName})
                          </strong>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200">
                            <div>
                              <span className="text-[10px] text-gray-500 block">Base Airfare:</span>
                              <strong className="font-mono">{formatCurrency(flight.fareBreakdown.baseFare, currency)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block">Govt Taxes & Fees:</span>
                              <strong className="font-mono">{formatCurrency(flight.fareBreakdown.taxesAndFees, currency)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block">Airport Charges:</span>
                              <strong className="font-mono">{formatCurrency(flight.fareBreakdown.airportCharges, currency)}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 block">Carrier Fuel Surcharge:</span>
                              <strong className="font-mono">{formatCurrency(flight.fareBreakdown.carrierFees, currency)}</strong>
                            </div>
                          </div>
                          <div className="pt-2 text-[11px] text-gray-500 flex justify-between">
                            <span>Baggage: 15kg check-in + 7kg cabin included</span>
                            <span className="italic">{flight.fareBreakdown.lastUpdated}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MULTI-MODAL DOOR-TO-DOOR CORRIDORS */}
          {/* ========================================================================= */}
          {(activeModeTab === 'all' || activeModeTab === 'multimodal' || activeModeTab === 'trains' || activeModeTab === 'buses') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#0891B2]">alt_route</span>
                  <span>
                    Multi-Modal Door-to-Door Transfer Corridors ({journeySection === 'outbound' ? outboundMultiModalRoutes.length : returnMultiModalRoutes.length} Corridors)
                  </span>
                </h3>
              </div>

              {(journeySection === 'outbound' ? outboundMultiModalRoutes : returnMultiModalRoutes)
                .filter((route) => {
                  if (activeModeTab === 'trains') return route.modeCategory === 'direct_train';
                  if (activeModeTab === 'buses') return route.modeCategory === 'sleeper_bus';
                  return true;
                })
                .map((route) => {
                  const isSelected =
                    journeySection === 'outbound'
                      ? selectedOutboundRouteId === route.id
                      : selectedReturnRouteId === route.id;

                  return (
                    <article
                      key={route.id}
                      className={`bg-white rounded-3xl border p-5 sm:p-6 space-y-4 transition-all ${
                        isSelected
                          ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-md'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-[#0891B2]">
                              {route.modeCategory === 'direct_train'
                                ? 'train'
                                : route.modeCategory === 'sleeper_bus'
                                ? 'directions_bus'
                                : 'alt_route'}
                            </span>
                            <strong className="text-sm font-bold text-[#0F172A]">{route.title}</strong>
                            {route.recommendationTag && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                {route.recommendationTag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mt-1">{route.summary}</p>
                        </div>

                        <div className="text-right">
                          <strong className="text-lg font-bold font-mono text-[#0F172A] block">
                            {formatCurrency(route.totalCostINR, currency)}
                          </strong>
                          <span className="text-[11px] text-[#64748B] block">
                            Duration: {route.totalDuration}
                          </span>
                        </div>
                      </div>

                      {/* Legs Overview */}
                      <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
                        {route.legs.map((leg, lIdx) => (
                          <div
                            key={lIdx}
                            className="p-2.5 rounded-xl bg-[#F8FAFC] flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-[#0891B2]">
                                {leg.modeIcon}
                              </span>
                              <span className="font-semibold text-[#0F172A]">{leg.operator}</span>
                              <span className="text-gray-400">·</span>
                              <span className="text-gray-600">
                                {leg.from} ➔ {leg.to} ({leg.duration})
                              </span>
                            </div>
                            <strong className="font-mono text-gray-700">
                              {formatCurrency(leg.cost, currency)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {route.carbonBadge}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            journeySection === 'outbound'
                              ? handleSelectOutboundRoute(route)
                              : handleSelectReturnRoute(route)
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {isSelected ? 'Corridor Selected' : 'Select This Corridor'}
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STICKY BOTTOM CONFIRMATION DOCK */}
      {/* ========================================================================= */}
      {(effectiveOutboundCost > 0 || effectiveReturnCost > 0) && (
        <aside
          aria-label="Trip Selection Summary Dock"
          className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md text-white border-t border-[#334155] p-3 sm:p-4 shadow-2xl transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0891B2] flex items-center justify-center shrink-0 text-white">
                <span className="material-symbols-outlined text-xl">sync_alt</span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Round-Trip Plan Synchronized
                  </span>
                  <span className="text-xs font-bold text-white">
                    Outbound: {activeSelectedOutboundFlight ? `${activeSelectedOutboundFlight.airlineName}` : 'Selected'} · Return: {isRoundTrip ? (activeSelectedReturnFlight ? `${activeSelectedReturnFlight.airlineName}` : 'Selected') : 'One-Way'}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Total Combined Outlay: <strong className="text-white font-mono">{formatCurrency(totalRoundTripTransportCost, currency)}</strong> ({trip.travelersCount} Guests)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setJourneySection('summary')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
              >
                View Breakdown
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('budget')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/20"
              >
                Review Budget
              </button>
              <button
                type="button"
                onClick={() => onNavigate?.('itinerary')}
                className="px-4 py-2 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
              >
                <span>Continue to Itinerary</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
