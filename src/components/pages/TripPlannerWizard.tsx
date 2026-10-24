/**
 * Smart AI Travel Planner 3.0
 * Multi-Step AI Trip Planner Wizard
 *
 * Implements:
 * - Real debounced autocomplete for Departure & Destination
 * - Flexible budget support (from ₹3,000 low-cost regional trips to luxury)
 * - Dynamic duration calculation from dates
 * - Real-time deterministic budget feasibility preview
 * - Inclusive travel styles, accommodations, and transport modes
 */

import React, { useState, useEffect, useRef } from 'react';
import { CurrencyCode, TravelStyle, TripPlan, TripType, CabinClass } from '../../types/travel';
import { generateTrip, generateTripSingleAgent } from '../../lib/api';
import { formatCurrency, calculateFeasiblePlan } from '../../lib/budget';
import { searchLocations, NormalizedLocation } from '../../lib/geocoding';

interface TripPlannerWizardProps {
  initialDestination?: string;
  initialOrigin?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialTravelers?: number;
  currency: CurrencyCode;
  onTripGenerated: (newTrip: TripPlan) => void;
  onCancel: () => void;
}

const INCLUSIVE_INTERESTS = [
  'Beaches & Coastal Walks',
  'Ancient Temples & Heritage',
  'Local Street Food & Night Markets',
  'Waterfalls & Nature Trails',
  'Wildlife Sanctuaries',
  'Scenic Rail & Road Journeys',
  'Museums & Cultural Gallerias',
  'Adventure Sports & Kayaking',
  'Photography & Viewpoints',
  'Wellness & Ayurvedic Spas',
  'Fine Dining & Cafes',
  'Relaxed Hill Station Leisure',
];

export const TripPlannerWizard: React.FC<TripPlannerWizardProps> = ({
  initialDestination = 'Goa, India',
  initialOrigin = 'Shivamogga, India',
  initialStartDate,
  initialEndDate,
  initialTravelers = 2,
  currency,
  onTripGenerated,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const [destination, setDestination] = useState(initialDestination);
  const [origin, setOrigin] = useState(initialOrigin);

  // Trip Mode (Round-Trip default per requirements)
  const [tripType, setTripType] = useState<TripType>('round_trip');
  const [cabinClass, setCabinClass] = useState<CabinClass>('economy');

  // Autocomplete states for destination
  const [destSuggestions, setDestSuggestions] = useState<NormalizedLocation[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const destDropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete states for origin
  const [origSuggestions, setOrigSuggestions] = useState<NormalizedLocation[]>([]);
  const [isSearchingOrig, setIsSearchingOrig] = useState(false);
  const [showOrigDropdown, setShowOrigDropdown] = useState(false);
  const origDropdownRef = useRef<HTMLDivElement>(null);

  // Dates & Duration
  const defaultStart = initialStartDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const defaultEnd = initialEndDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  // Travelers & Style
  const [travelers, setTravelers] = useState<number>(initialTravelers);
  const [style, setStyle] = useState<TravelStyle>('budget');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Beaches & Coastal Walks',
    'Local Street Food & Night Markets',
    'Ancient Temples & Heritage',
  ]);

  // Synchronize with external incoming initial props (e.g. from Landing Search widget)
  useEffect(() => {
    if (initialDestination) setDestination(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    if (initialOrigin) setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    if (initialStartDate) setStartDate(initialStartDate);
  }, [initialStartDate]);

  useEffect(() => {
    if (initialEndDate) setEndDate(initialEndDate);
  }, [initialEndDate]);

  useEffect(() => {
    if (initialTravelers) setTravelers(initialTravelers);
  }, [initialTravelers]);

  // Preferences
  const [accommodationType, setAccommodationType] = useState('Clean Boutique Homestay / Guesthouse');
  const [transitPreference, setTransitPreference] = useState('Train / Intercity AC Bus (Economical)');
  const [dietary, setDietary] = useState('Vegetarian options preferred, local delicacies');

  // Budget
  const [maxBudget, setMaxBudget] = useState<number>(8000); // Realistic default (e.g. ₹8,000 for Shivamogga to Goa)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [planningEngine, setPlanningEngine] = useState<'multi_agent' | 'single_agent'>('multi_agent');

  // Synthesis states with dynamic stage progress
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStage, setSynthesisStage] = useState('Initializing Journey Planning Engine...');
  const [stage1Progress, setStage1Progress] = useState(0);
  const [stage2Progress, setStage2Progress] = useState(0);
  const [stage3Progress, setStage3Progress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate dynamic duration in days
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const durationDays = tripType === 'one_way'
    ? 4
    : Math.max(1, Math.round((endD.getTime() - startD.getTime()) / 86400000));

  // Debounced search for destination
  useEffect(() => {
    if (!destination || destination.length < 2) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDest(true);
      const results = await searchLocations(destination);
      setDestSuggestions(results);
      setIsSearchingDest(false);
      setShowDestDropdown(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [destination]);

  // Debounced search for origin
  useEffect(() => {
    if (!origin || origin.length < 2) {
      setOrigSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingOrig(true);
      const results = await searchLocations(origin);
      setOrigSuggestions(results);
      setIsSearchingOrig(false);
      setShowOrigDropdown(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [origin]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
      if (origDropdownRef.current && !origDropdownRef.current.contains(e.target as Node)) {
        setShowOrigDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Feasibility Calculation Preview
  const feasibilityPreview = calculateFeasiblePlan({
    origin,
    destination,
    durationDays,
    travelersCount: travelers,
    userBudget: maxBudget,
    travelStyle: style,
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!destination.trim()) {
        setValidationError('Please specify your destination.');
        return;
      }
      if (!origin.trim()) {
        setValidationError('Please specify your departure city or hub.');
        return;
      }
      if (tripType === 'round_trip' && new Date(endDate) <= new Date(startDate)) {
        setValidationError('Return date must be strictly after departure date for a round trip.');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setValidationError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setValidationError(null);
    setStage1Progress(20);
    setStage2Progress(0);
    setStage3Progress(0);

    const isSingle = planningEngine === 'single_agent';

    setSynthesisStage(
      isSingle
        ? `Single-Agent Core: Initializing unified sequential loop for ${origin} ➔ ${destination}...`
        : `Orchestrator: Arbitrating ${tripType === 'round_trip' ? 'Round-Trip' : 'One-Way'} corridor ${origin} ➔ ${destination}...`
    );

    // Live progress increments
    const t1 = setTimeout(() => {
      setStage1Progress(75);
      setSynthesisStage(
        isSingle
          ? 'Single-Agent: Invoking Geocoding & Transit tools sequentially...'
          : 'Transport Agent: Synthesizing Outbound & Return transport corridors...'
      );
    }, 450);

    const t2 = setTimeout(() => {
      setStage1Progress(100);
      setStage2Progress(45);
      setSynthesisStage(
        isSingle
          ? 'Single-Agent: Querying Weather & Sanctuary Lodging tools...'
          : 'Budget Engine: Deterministic arithmetic & bilateral split allocations...'
      );
    }, 1000);

    const t3 = setTimeout(() => {
      setStage2Progress(100);
      setStage3Progress(40);
      setSynthesisStage(
        isSingle
          ? `Single-Agent: Holistic generative synthesis & deterministic arithmetic audit...`
          : `Itinerary Agent: Curating authenticated ${destination} sights & activities...`
      );
    }, 1600);

    const t4 = setTimeout(() => {
      setStage3Progress(85);
      setSynthesisStage('Finalizing complete round-trip itinerary & verified photo archives...');
    }, 2200);

    // Failsafe timer so modal NEVER stays stuck
    const failsafe = setTimeout(() => {
      setIsSynthesizing(false);
      setValidationError('Synthesis took longer than expected. Please retry or adjust parameters.');
    }, 19000);

    try {
      const inputPayload = {
        destination,
        origin,
        tripType,
        cabinClass,
        preferredTransport: transitPreference,
        startDate,
        endDate: tripType === 'round_trip' ? endDate : undefined,
        durationDays,
        travelersCount: travelers,
        style,
        interests: selectedInterests,
        maxBudget,
        currency: selectedCurrency,
        dietaryOrAccessibility: dietary,
      };

      let generated: TripPlan;

      if (isSingle) {
        const res = await generateTripSingleAgent(inputPayload);
        generated = res.trip;
      } else {
        generated = await generateTrip(inputPayload);
      }

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(failsafe);

      // Instantly bring all bars to 100% on actual completion
      setStage1Progress(100);
      setStage2Progress(100);
      setStage3Progress(100);
      setSynthesisStage('Synthesis Complete! Transitioning to your journey dashboard...');

      setTimeout(() => {
        setIsSynthesizing(false);
        onTripGenerated(generated);
      }, 400);
    } catch (err) {
      console.error('Synthesis error:', err);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(failsafe);
      setIsSynthesizing(false);
      setValidationError('Failed to generate trip. Please verify your inputs and retry.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full py-6 px-4 animate-fade-in">
      {/* Wizard Card Container */}
      <div data-aos="fade-up" data-aos-duration="600" className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-10 space-y-8 relative">
        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0891B2]">
                Step {step} of 4
              </span>
            </div>
            <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-[#0F172A] mt-1">
              {step === 1 && 'Where & When are you traveling?'}
              {step === 2 && 'Travel Style & Interests'}
              {step === 3 && 'Transit & Stay Preferences'}
              {step === 4 && 'Budget & Feasibility Review'}
            </h2>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[#0891B2]'
                    : s < step
                    ? 'w-4 bg-[#059669]'
                    : 'w-4 bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: DESTINATION, ORIGIN & DATES */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Trip Type Selector (Round-Trip default) */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                Trip Journey Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripType('round_trip')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    tripType === 'round_trip'
                      ? 'bg-[#EFF6FF] border-[#0891B2] ring-2 ring-[#0891B2]/20 text-[#0F172A]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:border-[#94A3B8]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      tripType === 'round_trip' ? 'bg-[#0891B2] text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">sync_alt</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs font-bold text-[#0F172A]">Round Trip</strong>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Both Outbound & Return corridors planned independently to starting origin.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTripType('one_way')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    tripType === 'one_way'
                      ? 'bg-[#EFF6FF] border-[#0891B2] ring-2 ring-[#0891B2]/20 text-[#0F172A]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#64748B] hover:border-[#94A3B8]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      tripType === 'one_way' ? 'bg-[#0891B2] text-white shadow-2xs' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#0F172A] block">One-Way Journey</strong>
                    <span className="text-[11px] text-[#64748B] block mt-0.5">
                      Outbound travel only. Return leg not scheduled.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Search with Autocomplete */}
              <div className="space-y-1.5 relative" ref={origDropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Departure City / Origin Hub
                </label>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex items-center gap-2 focus-within:border-[#0891B2] focus-within:ring-2 focus-within:ring-[#0891B2]/20 transition-all">
                  <span className="material-symbols-outlined text-[#7C3AED] text-lg">flight_takeoff</span>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    onFocus={() => setShowOrigDropdown(true)}
                    placeholder="e.g. Bengaluru, Shivamogga, Mumbai"
                    className="w-full bg-transparent text-sm font-semibold text-[#0F172A] focus:outline-none border-none p-0"
                  />
                  {isSearchingOrig && <span className="material-symbols-outlined text-xs animate-spin text-[#94A3B8]">sync</span>}
                </div>

                {/* Origin Suggestions Dropdown */}
                {showOrigDropdown && origSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-30 max-h-56 overflow-y-auto divide-y divide-[#F1F5F9]">
                    {origSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setOrigin(loc.displayName);
                          setShowOrigDropdown(false);
                        }}
                        className="w-full text-left p-3 hover:bg-[#EFF6FF] text-xs transition-colors flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-[#0F172A] block">{loc.city}</strong>
                          <span className="text-[11px] text-[#64748B]">{loc.displayName}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-[#475569]">
                          {loc.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Search with Autocomplete */}
              <div className="space-y-1.5 relative" ref={destDropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Target Destination / Region
                </label>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex items-center gap-2 focus-within:border-[#0891B2] focus-within:ring-2 focus-within:ring-[#0891B2]/20 transition-all">
                  <span className="material-symbols-outlined text-[#0891B2] text-lg">pin_drop</span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="e.g. Goa, Mysuru, Jaipur, Paris"
                    className="w-full bg-transparent text-sm font-semibold text-[#0F172A] focus:outline-none border-none p-0"
                  />
                  {isSearchingDest && <span className="material-symbols-outlined text-xs animate-spin text-[#94A3B8]">sync</span>}
                </div>

                {/* Destination Suggestions Dropdown */}
                {showDestDropdown && destSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-30 max-h-56 overflow-y-auto divide-y divide-[#F1F5F9]">
                    {destSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDestination(loc.displayName);
                          setShowDestDropdown(false);
                        }}
                        className="w-full text-left p-3 hover:bg-[#EFF6FF] text-xs transition-colors flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-[#0F172A] block">{loc.city}</strong>
                          <span className="text-[11px] text-[#64748B]">{loc.displayName}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {loc.country}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates & Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Return Date
                  </label>
                  {tripType === 'one_way' && (
                    <span className="text-[10px] text-amber-600 font-bold uppercase">One-Way</span>
                  )}
                </div>
                {tripType === 'round_trip' ? (
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#94A3B8] italic">
                    N/A · One-Way Journey
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Travelers ({durationDays} Days)
                </label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1]">
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] font-bold text-sm text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9]"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-[#0F172A]">{travelers} Guests</span>
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] font-bold text-sm text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Destination Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase text-[#64748B] block">
                Popular Verified Routes:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { orig: 'Shivamogga, India', dest: 'Goa, India', label: 'Shivamogga ➔ Goa (Coastal / 3D)' },
                  { orig: 'Bengaluru, India', dest: 'Mysuru, India', label: 'Bengaluru ➔ Mysuru (Royal Heritage)' },
                  { orig: 'New Delhi, India', dest: 'Jaipur, India', label: 'Delhi ➔ Jaipur (Pink City Weekend)' },
                  { orig: 'Mumbai, India', dest: 'Kochi, Kerala, India', label: 'Mumbai ➔ Kerala Backwaters' },
                ].map((route, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setOrigin(route.orig);
                      setDestination(route.dest);
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#0F172A] border border-[#CBD5E1] transition-all"
                  >
                    {route.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TRAVEL STYLE & INTERESTS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Travel Style & Budget Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'budget', label: 'Smart Budget', desc: 'Buses/Trains, clean homestays, local eateries', icon: 'savings' },
                  { id: 'balanced', label: 'Comfort Balanced', desc: '3-star hotels, AC transport, top attractions', icon: 'balance' },
                  { id: 'family', label: 'Family Enclave', desc: 'Spacious suites, kid-friendly spots, direct cabs', icon: 'family_restroom' },
                  { id: 'adventure', label: 'Active Explorer', desc: 'Trekking, coastal walks, outdoor trails', icon: 'explore' },
                  { id: 'relaxed', label: 'Relaxed Leisure', desc: 'Scenic stays, wellness, unrushed mornings', icon: 'spa' },
                  { id: 'luxury', label: 'Luxury Retreat', desc: '5-star resorts, private transfers, fine dining', icon: 'diamond' },
                ].map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setStyle(st.id as TravelStyle)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      style === st.id
                        ? 'bg-[#EFF6FF] border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[#0891B2] text-xl mb-1 block">
                      {st.icon}
                    </span>
                    <strong className="text-xs text-[#0F172A] block">{st.label}</strong>
                    <span className="text-[11px] text-[#64748B] mt-0.5 block leading-tight">{st.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Curated Interest Focus
              </label>
              <div className="flex flex-wrap gap-2">
                {INCLUSIVE_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#0891B2] text-white shadow-2xs'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SANCTUARY & TRANSIT */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Preferred Accommodation
              </label>
              <select
                value={accommodationType}
                onChange={(e) => setAccommodationType(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
              >
                <option value="Clean Boutique Homestay / Guesthouse">
                  Clean Boutique Homestay / Guesthouse (Best value, host hospitality)
                </option>
                <option value="Comfort 3-Star Boutique Hotel">
                  Comfort 3-Star Boutique Hotel (Central, AC, breakfast included)
                </option>
                <option value="Hostel Private Double Room">
                  Hostel Private Double Room (Social vibe, low-cost)
                </option>
                <option value="4-Star Resort / Serviced Apartment">
                  4-Star Resort / Serviced Apartment (Pool, spacious rooms)
                </option>
                <option value="5-Star Heritage Sanctuary / Villa">
                  5-Star Heritage Sanctuary / Villa (Ultra premium, private amenities)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Preferred Mode of Transit
              </label>
              <select
                value={transitPreference}
                onChange={(e) => setTransitPreference(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
              >
                <option value="Train / Intercity AC Bus (Economical)">
                  Train / Intercity AC Bus (Best value for short/medium distances)
                </option>
                <option value="Commercial Economy Flight">
                  Commercial Economy Flight (Fastest for long distances)
                </option>
                <option value="Private Cab / Self-Drive Rental">
                  Private Cab / Self-Drive Rental (Flexible pacing & door-to-door)
                </option>
                <option value="Premium Direct Flight">
                  Premium Direct Flight (Maximum comfort & priority check-in)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Flight & Transit Cabin Tier
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
              >
                <option value="economy">Economy Class (Standard smart tariff)</option>
                <option value="premium_economy">Premium Economy (Extra legroom & 20kg baggage)</option>
                <option value="business">Business Class (Priority boarding, lounge & meals)</option>
                <option value="first">First Class (VIP private suite)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Dietary & Accessibility Preferences
              </label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="e.g. Pure Vegetarian, Jain options, Halal, Wheelchair accessible"
                className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
              />
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET & FEASIBILITY REVIEW */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Budget Input & Presets */}
            <div className="p-6 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#0891B2]">
                    Total Spending Budget Limit
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-[#0F172A]">
                      {formatCurrency(maxBudget, selectedCurrency)}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      (~{formatCurrency(Math.round(maxBudget / travelers), selectedCurrency)} / person)
                    </span>
                  </div>
                </div>

                {/* Direct Number Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#64748B]">Set exact amount:</span>
                  <input
                    type="number"
                    min={2000}
                    max={25000000}
                    step={1000}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value) || 0)}
                    className="w-36 p-2 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold font-mono text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                  />
                </div>
              </div>

              {/* Quick Budget Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase text-[#64748B] block">
                  Quick Budget Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '₹8,000 (Low-Cost Regional)', amount: 8000 },
                    { label: '₹15,000 (Budget Explorer)', amount: 15000 },
                    { label: '₹35,000 (Comfort Couple)', amount: 35000 },
                    { label: '₹75,000 (Family Vacation)', amount: 75000 },
                    { label: '₹2,50,000 (Premium Luxury)', amount: 250000 },
                  ].map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMaxBudget(preset.amount)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        maxBudget === preset.amount
                          ? 'bg-[#0891B2] text-white shadow-2xs'
                          : 'bg-white text-[#475569] border border-[#CBD5E1] hover:border-[#0891B2]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Feasibility & Cost Assessment Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                feasibilityPreview.isFeasible
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-lg">
                  {feasibilityPreview.isFeasible ? 'check_circle' : 'warning'}
                </span>
                <strong className="text-xs font-bold uppercase tracking-wider">
                  {feasibilityPreview.isFeasible
                    ? 'Budget Feasibility Confirmed'
                    : 'Budget Shortfall Advisory'}
                </strong>
              </div>

              <p className="text-xs leading-relaxed">
                {feasibilityPreview.feasibilityExplanation}
              </p>

              {/* Cost breakdown summary */}
              <div className="mt-3 pt-3 border-t border-black/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Min. Realistic:</span>
                  <strong className="font-mono">{formatCurrency(feasibilityPreview.minimumFeasibleCost, selectedCurrency)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Recommended:</span>
                  <strong className="font-mono">{formatCurrency(feasibilityPreview.recommendedPlanCost, selectedCurrency)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">
                    {feasibilityPreview.isFeasible ? 'Surplus Remaining:' : 'Deficit / Shortfall:'}
                  </span>
                  <strong className={`font-mono ${feasibilityPreview.isFeasible ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {feasibilityPreview.isFeasible
                      ? formatCurrency(feasibilityPreview.remainingBudget, selectedCurrency)
                      : `-${formatCurrency(feasibilityPreview.shortfall, selectedCurrency)}`}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Cost / Person:</span>
                  <strong className="font-mono">{formatCurrency(feasibilityPreview.costPerPerson, selectedCurrency)}</strong>
                </div>
              </div>

              {!feasibilityPreview.isFeasible && feasibilityPreview.suggestedAlternatives.length > 0 && (
                <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] space-y-1">
                  <span className="font-bold block">Recommended Adjustments:</span>
                  {feasibilityPreview.suggestedAlternatives.map((alt, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-amber-800">
                      <span className="w-1 h-1 rounded-full bg-amber-600" />
                      <span>{alt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Architecture Engine Selector */}
            <div className="p-4 rounded-xl bg-white border border-[#CBD5E1] space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#0891B2]">precision_manufacturing</span>
                  Planning Architecture Engine (Research Benchmark)
                </label>
                <span className="text-[10px] font-mono text-[#64748B]">Independent Executables</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlanningEngine('multi_agent')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    planningEngine === 'multi_agent'
                      ? 'bg-[#EFF6FF] border-[#0891B2] shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#0891B2]">hub</span>
                      Multi-Agent Swarm (Baseline)
                    </strong>
                    {planningEngine === 'multi_agent' && (
                      <span className="material-symbols-outlined text-sm text-[#0891B2]">check_circle</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-tight">
                    Coordinates specialized agents with parallel transit, weather, and stay co-routines.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanningEngine('single_agent')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    planningEngine === 'single_agent'
                      ? 'bg-[#F5F3FF] border-[#7C3AED] shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#7C3AED]">psychology</span>
                      Single-Agent Engine (Experiment)
                    </strong>
                    {planningEngine === 'single_agent' && (
                      <span className="material-symbols-outlined text-sm text-[#7C3AED]">check_circle</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-tight">
                    Single autonomous agent with unified reasoning loop and sequential tool dispatches.
                  </p>
                </button>
              </div>
            </div>

            {/* Review Summary */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
              <strong className="text-[#0F172A] block uppercase tracking-wider text-[11px]">
                Final Synthesis Configuration:
              </strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#64748B]">
                <div>Origin: <strong className="text-[#0F172A]">{origin}</strong></div>
                <div>Destination: <strong className="text-[#0F172A]">{destination}</strong></div>
                <div>Dates: <strong className="text-[#0F172A]">{startDate} → {endDate}</strong></div>
                <div>Duration: <strong className="text-[#0F172A]">{durationDays} Days</strong></div>
                <div>Travelers: <strong className="text-[#0F172A]">{travelers} Guests</strong></div>
                <div>Architecture: <strong className="text-[#0891B2] capitalize">{planningEngine === 'single_agent' ? 'Single-Agent' : 'Multi-Agent'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E2E8F0]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSynthesizing}
              className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-semibold uppercase tracking-wider border border-[#E2E8F0] transition-all"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="px-6 py-3 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 transition-all disabled:opacity-75"
            >
              <span className={`material-symbols-outlined text-base ${isSynthesizing ? 'animate-spin' : ''}`}>
                {isSynthesizing ? 'sync' : 'auto_awesome'}
              </span>
              <span>{isSynthesizing ? 'Synthesizing Plan...' : 'Synthesize Journey Plan'}</span>
            </button>
          )}
        </div>

        {/* Multi-Agent Synthesis Overlay Modal */}
        {isSynthesizing && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#E2E8F0] text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0891B2] via-[#7C3AED] to-[#0891B2] flex items-center justify-center text-white mx-auto shadow-md animate-pulse">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif-heading text-xl font-bold text-[#0F172A]">
                  Autonomous Journey Synthesis
                </h3>
                <p className="text-xs text-[#0891B2] font-mono font-semibold min-h-[32px] flex items-center justify-center">
                  {synthesisStage}
                </p>
              </div>

              <div className="space-y-3 text-left text-xs font-medium">
                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>1. Route & Spatial Arbitration</span>
                    <span className="text-[#0891B2] font-bold font-mono">{stage1Progress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0891B2] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${stage1Progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>2. Deterministic Feasibility & Budget</span>
                    <span className="text-[#059669] font-bold font-mono">{stage2Progress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#059669] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${stage2Progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#64748B] mb-1">
                    <span>3. Itinerary & Verified Sights</span>
                    <span className="text-[#7C3AED] font-bold font-mono">{stage3Progress}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#7C3AED] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${stage3Progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSynthesizing(false)}
                  className="text-[11px] text-[#94A3B8] hover:text-[#0F172A] uppercase tracking-wider font-semibold transition-colors"
                >
                  Cancel / Close Synthesis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
