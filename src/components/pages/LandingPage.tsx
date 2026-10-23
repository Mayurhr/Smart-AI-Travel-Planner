/**
 * Smart AI Travel Planner 3.0
 * Landing Showcase Page
 * Faithfully reproduces the Stitch visual design system (Image 6)
 */

import React, { useState } from 'react';
import { Earth3D } from '../Earth3D';
import { CurrencyCode } from '../../types/travel';
import { formatCurrency, convertCurrency } from '../../lib/budget';
import { RealPlacePhoto } from '../RealPlacePhoto';

interface LandingPageProps {
  onStartPlanning: (destination?: string) => void;
  onExploreRoute?: (destination: string) => void;
  onNavigate?: (page: string) => void;
  currency: CurrencyCode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onExploreRoute,
  currency,
}) => {
  const [destinationInput, setDestinationInput] = useState('Amalfi Coast & Capri, Italy');
  const [datesInput, setDatesInput] = useState('Oct 14 — Oct 22');
  const [guestsInput, setGuestsInput] = useState('2 Guests · 1 Suite');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      onStartPlanning(destinationInput);
    }, 800);
  };

  const amalfiCost = convertCurrency(2190000, 'INR', currency);
  const kyotoCost = convertCurrency(1780000, 'INR', currency);
  const laplandCost = convertCurrency(1650000, 'INR', currency);

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      {/* 1. AIRY LIGHT HERO SECTION WITH 3D EARTH HERO STAGE */}
      <section className="relative w-full flex flex-col justify-between pt-8 pb-16 overflow-hidden bg-gradient-to-b from-[#EFF6FF]/70 via-[#F8FAFC] to-[#F8FAFC]">
        {/* Soft Atmospheric Radial Background Gradients */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[#0891B2]/5 rounded-full blur-[140px]" />
        <div className="pointer-events-none absolute top-48 right-10 w-[600px] h-[600px] bg-[#7C3AED]/5 rounded-full blur-[140px]" />

        {/* Central Hero Typography & CTAs */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 md:px-8 text-center flex flex-col items-center gap-4 mt-2">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0891B2] animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#0891B2] font-bold">
              Neural Cartography Engine 4.8
            </span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
            <span className="text-[11px] tracking-wider uppercase text-[#0F172A] font-semibold">
              1,480+ Private Sanctuaries
            </span>
          </div>

          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] text-[#0F172A] font-normal leading-[1.08] tracking-tight max-w-4xl">
            Your Next Adventure, <br />
            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#0891B2] via-[#7C3AED] to-[#0F172A]">
              Intelligently Designed.
            </span>
          </h1>

          <p className="text-base md:text-lg text-[#64748B] max-w-2xl font-normal leading-relaxed">
            Autonomous travel syntheses tailored to your pace, climate comfort, and architectural taste. Real-time microclimate vectors synced with private charter slots.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
            <button
              onClick={() => onStartPlanning(destinationInput)}
              className="px-6 py-3 rounded-xl bg-[#7C3AED] text-white text-xs uppercase tracking-widest font-semibold shadow-sm hover:bg-[#6D28D9] hover:shadow-md transition-all flex items-center gap-2"
            >
              <span>Plan My Journey</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <a
              href="#expeditions"
              className="px-6 py-3 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#EFF6FF] hover:border-[#0891B2]/40 text-xs uppercase tracking-widest font-semibold shadow-2xs transition-all flex items-center gap-2"
            >
              <span>Explore Destinations</span>
            </a>
          </div>
        </div>

        {/* 3D EARTH HERO STAGE */}
        <div className="relative w-full max-w-6xl mx-auto px-4 mt-6">
          <Earth3D
            height="540px"
            onSelectWaypoint={(wp) => setDestinationInput(wp)}
          />

          {/* Floating Trip Planner Search Card */}
          <div
            data-aos="fade-up"
            data-aos-duration="600"
            className="relative z-20 max-w-5xl w-full mx-auto -mt-10"
            id="search-panel"
          >
            <div className="p-4 rounded-2xl glass-panel shadow-md">
              <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Field 1: Destination */}
                <div className="md:col-span-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0891B2]/50 transition-all flex flex-col justify-center">
                  <label className="text-[11px] uppercase tracking-widest text-[#0891B2] font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">explore</span>
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="Where to? (e.g. Amalfi, Kyoto, Lapland)"
                    className="w-full bg-transparent p-0 text-sm font-semibold text-[#0F172A] focus:outline-none caret-[#0891B2] truncate mt-1 border-none"
                  />
                </div>

                {/* Field 2: Dates */}
                <div className="md:col-span-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#7C3AED]/40 transition-all flex flex-col justify-center">
                  <label className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#7C3AED]">calendar_month</span>
                    Travel Dates
                  </label>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#0F172A] mt-1">
                    <input
                      type="text"
                      value={datesInput}
                      onChange={(e) => setDatesInput(e.target.value)}
                      className="bg-transparent text-sm font-semibold text-[#0F172A] p-0 w-32 focus:outline-none border-none"
                    />
                    <span className="text-[11px] text-[#0891B2] font-mono font-medium">8 Days</span>
                  </div>
                </div>

                {/* Field 3: Travelers */}
                <div className="md:col-span-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0891B2]/40 transition-all flex flex-col justify-center">
                  <label className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#0891B2]">group</span>
                    Travelers
                  </label>
                  <input
                    type="text"
                    value={guestsInput}
                    onChange={(e) => setGuestsInput(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-[#0F172A] p-0 focus:outline-none truncate mt-1 border-none"
                  />
                </div>

                {/* Field 4: CTA Button */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSynthesizing}
                    className="w-full h-[52px] rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-300 disabled:opacity-75"
                  >
                    <span>{isSynthesizing ? 'Synthesizing Grid...' : 'Plan My Journey'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </form>

              {/* Quick Coordinates Chips */}
              <div className="pt-3 px-1 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                <span className="text-[11px] uppercase tracking-wider text-[#64748B] mr-1 font-semibold">
                  Trending Coordinates:
                </span>
                <button
                  onClick={() => setDestinationInput('Amalfi Coast & Positano, Italy')}
                  className="px-2.5 py-1 rounded-lg neu-raised text-[#0891B2] font-medium transition-all"
                >
                  Amalfi Coast, IT
                </button>
                <button
                  onClick={() => setDestinationInput('Kyoto Bamboo Grove & Arashiyama, Japan')}
                  className="px-2.5 py-1 rounded-lg neu-raised text-[#7C3AED] font-medium transition-all"
                >
                  Kyoto Bamboo Grove, JP
                </button>
                <button
                  onClick={() => setDestinationInput('Finnish Lapland Aurora Domes, Finland')}
                  className="px-2.5 py-1 rounded-lg neu-raised text-[#0891B2] font-medium transition-all"
                >
                  Lapland Glass Domes, FI
                </button>
                <button
                  onClick={() => setDestinationInput('St. Moritz Heli-Ski Chalet, Switzerland')}
                  className="px-2.5 py-1 rounded-lg neu-raised text-[#64748B] font-medium transition-all"
                >
                  St. Moritz, CH
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TELEMETRY METRIC STRIP */}
      <section
        data-aos="fade-up"
        data-aos-duration="600"
        className="w-full px-4 md:px-8 py-8 border-y border-[#E2E8F0] bg-white"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
          <div className="flex flex-col gap-1 border-r border-[#CBD5E1] last:border-none pr-4">
            <span className="font-serif-heading text-3xl font-semibold text-[#0F172A]">1,480+</span>
            <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-bold">
              Private Sanctuaries Indexed
            </span>
          </div>
          <div className="flex flex-col gap-1 border-r border-[#CBD5E1] last:border-none pr-4">
            <span className="font-serif-heading text-3xl font-semibold text-[#0891B2]">0.42s</span>
            <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-bold">
              Optimal Weather Compute
            </span>
          </div>
          <div className="flex flex-col gap-1 border-r border-[#CBD5E1] last:border-none pr-4">
            <span className="font-serif-heading text-3xl font-semibold text-[#7C3AED]">100%</span>
            <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-bold">
              Sovereign Discretion
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif-heading text-3xl font-semibold text-[#0F172A]">42 Min</span>
            <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-bold">
              Dynamic Reroute Response
            </span>
          </div>
        </div>
      </section>

      {/* 3. PRECISION-CURATED JOURNEYS */}
      <section className="w-full px-4 md:px-8 py-20 bg-[#F8FAFC]" id="expeditions">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[#0891B2] text-xs uppercase tracking-[0.2em] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2]" />
                Portfolio Selection · Cycle 2025
              </div>
              <h2 className="font-serif-heading text-3xl md:text-4xl text-[#0F172A] font-semibold">
                Precision-Curated Journeys
              </h2>
              <p className="text-sm md:text-base text-[#64748B]">
                Every coordinate is vetted continuously by real-time micro-climate indicators, exclusivity ratings, and private aviation connectivity.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">
                Telemetry Filter:
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#0891B2] text-xs uppercase tracking-wider font-bold shadow-2xs">
                Autonomous Mode Active
              </span>
            </div>
          </div>

          {/* Expeditions Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Positano Cliffside Haven */}
            <article className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm hover:border-[#0891B2]/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                <RealPlacePhoto
                  placeName="Positano"
                  destination="Amalfi Coast, Italy"
                  aspectRatio="4/3"
                  className="w-full h-full"
                  alt="Positano Cliffside Haven overlooking Tyrrhenian Sea"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs uppercase tracking-widest text-[#0891B2] font-bold shadow-2xs">
                    98% AI Match
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs text-[#0F172A] font-semibold shadow-2xs">
                    Amalfi Coast, Italy
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Private Yacht
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Cliffside Villa
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Michelin Cellars
                    </span>
                  </div>
                  <h3 className="font-serif-heading text-xl text-[#0F172A] group-hover:text-[#0891B2] transition-colors font-bold">
                    Positano Cliffside Haven
                  </h3>
                  <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
                    Private terraced estate nestled above the Tyrrhenian Sea. Includes Riva Dolceriva day cruiser with skipper, private sommelier, and reserved sunset moorings at Capri Faraglioni.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">Pacing Architecture</span>
                      <span className="text-[#0891B2] font-mono font-medium">Low Friction · High Sensory</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden flex">
                      <div className="bg-[#0891B2] w-2/5 h-full" />
                      <div className="bg-[#7C3AED] w-2/5 h-full" />
                      <div className="bg-[#94A3B8] w-1/5 h-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#64748B] pt-0.5">
                      <span>Day 1-2: Coastal Anchor</span>
                      <span>Day 3-4: Capri Grottos</span>
                      <span>Day 5: Ravello Heights</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">
                        Synthesized Allocation
                      </span>
                      <span className="font-serif-heading text-xl text-[#0F172A] font-bold font-mono">
                        {formatCurrency(amalfiCost, currency)}{' '}
                        <span className="text-xs font-normal text-[#64748B]">/ charter</span>
                      </span>
                    </div>
                    <button
                      onClick={() => (onExploreRoute ? onExploreRoute('Amalfi Coast & Capri, Italy') : onStartPlanning('Amalfi Coast & Capri, Italy'))}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-[#0891B2] hover:text-white text-[#0F172A] border border-[#E2E8F0] text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs"
                    >
                      Explore Route
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2: Kyoto Zen Sanctuary */}
            <article className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm hover:border-[#7C3AED]/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                <RealPlacePhoto
                  placeName="Kyoto"
                  destination="Kyoto, Japan"
                  aspectRatio="4/3"
                  className="w-full h-full"
                  alt="Arashiyama Sagano Bamboo Grove in Kyoto"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs uppercase tracking-widest text-[#7C3AED] font-bold shadow-2xs">
                    96% AI Match
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs text-[#0F172A] font-semibold shadow-2xs">
                    Kyoto, Japan
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[11px] uppercase tracking-wider text-[#7C3AED] font-semibold">
                      Arashiyama Reserve
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[11px] uppercase tracking-wider text-[#7C3AED] font-semibold">
                      Tea Pavilion
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[11px] uppercase tracking-wider text-[#7C3AED] font-semibold">
                      Private Onsen
                    </span>
                  </div>
                  <h3 className="font-serif-heading text-xl text-[#0F172A] group-hover:text-[#7C3AED] transition-colors font-bold">
                    Kyoto Zen Sanctuary
                  </h3>
                  <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
                    Exclusive private access to historical 400-year-old mountain temples closed to public corridors. Bespoke kaiseki courses orchestrated by 3-star Michelin masters at your cedar villa.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">Pacing Architecture</span>
                      <span className="text-[#7C3AED] font-mono font-medium">Contemplative · High Solitude</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden flex">
                      <div className="bg-[#7C3AED] w-1/2 h-full" />
                      <div className="bg-[#0891B2] w-1/4 h-full" />
                      <div className="bg-[#94A3B8] w-1/4 h-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#64748B] pt-0.5">
                      <span>Day 1-3: Bamboo Seclusion</span>
                      <span>Day 4-5: Master Quarters</span>
                      <span>Day 6-7: Onsen Haven</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">
                        Synthesized Allocation
                      </span>
                      <span className="font-serif-heading text-xl text-[#0F172A] font-bold font-mono">
                        {formatCurrency(kyotoCost, currency)}{' '}
                        <span className="text-xs font-normal text-[#64748B]">/ journey</span>
                      </span>
                    </div>
                    <button
                      onClick={() => (onExploreRoute ? onExploreRoute('Kyoto & Arashiyama, Japan') : onStartPlanning('Kyoto & Arashiyama, Japan'))}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-[#7C3AED] hover:text-white text-[#0F172A] border border-[#E2E8F0] text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs"
                    >
                      Explore Route
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Card 3: Arctic Starlight Glass Domes */}
            <article className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-sm hover:border-[#0891B2]/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                <RealPlacePhoto
                  placeName="Lapland"
                  destination="Levi, Lapland, Finland"
                  aspectRatio="4/3"
                  className="w-full h-full"
                  alt="Aurora Borealis over Snowbound Levi in Finnish Lapland"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs uppercase tracking-widest text-[#0891B2] font-bold shadow-2xs">
                    99% AI Match
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] text-xs text-[#0F172A] font-semibold shadow-2xs">
                    Lapland, Finland
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Northern Lights
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Geothermal Spa
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] uppercase tracking-wider text-[#0891B2] font-semibold">
                      Aurora Alerts
                    </span>
                  </div>
                  <h3 className="font-serif-heading text-xl text-[#0F172A] group-hover:text-[#0891B2] transition-colors font-bold">
                    Arctic Starlight Glass Domes
                  </h3>
                  <p className="text-xs md:text-sm text-[#64748B] leading-relaxed">
                    Heated geodesic glass sanctuaries under the boreal night sky. Powered by our Aurora-forecast neural monitor, triggering wake alarms solely when solar radiance hits peak intensity.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span className="font-semibold text-[#0F172A]">Pacing Architecture</span>
                      <span className="text-[#0891B2] font-mono font-medium">Nocturnal · Arctic Immersion</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-2 overflow-hidden flex">
                      <div className="bg-[#0891B2] w-3/5 h-full" />
                      <div className="bg-[#7C3AED] w-1/5 h-full" />
                      <div className="bg-[#94A3B8] w-1/5 h-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#64748B] pt-0.5">
                      <span>Day 1-2: Arctic Arrival</span>
                      <span>Day 3-4: Glass Dome Aurora</span>
                      <span>Day 5: Geothermal Glade</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">
                        Synthesized Allocation
                      </span>
                      <span className="font-serif-heading text-xl text-[#0F172A] font-bold font-mono">
                        {formatCurrency(laplandCost, currency)}{' '}
                        <span className="text-xs font-normal text-[#64748B]">/ expedition</span>
                      </span>
                    </div>
                    <button
                      onClick={() => (onExploreRoute ? onExploreRoute('Levi Arctic Sanctuary, Finland') : onStartPlanning('Levi Arctic Sanctuary, Finland'))}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-[#0891B2] hover:text-white text-[#0F172A] border border-[#E2E8F0] text-xs uppercase tracking-wider font-semibold transition-all shadow-2xs"
                    >
                      Explore Route
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 4. SENSORY INTELLIGENCE MATRIX (4 PILLARS) */}
      <section className="w-full px-4 md:px-8 py-20 bg-[#EFF6FF] border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase tracking-[0.2em] text-[#0891B2] font-bold">
                Operational Superiority
              </span>
              <h2 className="font-serif-heading text-3xl md:text-4xl text-[#0F172A] font-semibold">
                The Sensory Intelligence Matrix
              </h2>
              <p className="text-sm md:text-base text-[#64748B]">
                Unlike legacy travel agencies, Aetheris recalculates vectors across 14,000 real-world variable feeds every second to protect your serenity.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#64748B] text-xs px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-2xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
              Dynamic Neural Calibration Always Engaged
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#0891B2]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2]">
                  <span className="material-symbols-outlined text-2xl">wb_twilight</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#0891B2] font-bold">Pillar 01</span>
                  <h3 className="font-serif-heading text-lg text-[#0F172A] font-bold">Microclimate Predictions</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    High-resolution micro-climate modeling maps golden-hour visibility, wave swell heights, and air clarity up to 90 days in advance.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm text-[#0891B2]">verified</span>
                <span>Sub-degree microclimate fidelity</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#7C3AED]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
                  <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#7C3AED] font-bold">Pillar 02</span>
                  <h3 className="font-serif-heading text-lg text-[#0F172A] font-bold">Private Charter Sync</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Seamless tarmac-to-villa handoffs. Direct charter slots synced with VIP customs corridors and helicopter transfers without luggage latency.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm text-[#7C3AED]">verified</span>
                <span>Global FBO terminal clearance</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#0891B2]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2]">
                  <span className="material-symbols-outlined text-2xl">architecture</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#0891B2] font-bold">Pillar 03</span>
                  <h3 className="font-serif-heading text-lg text-[#0F172A] font-bold">Off-Market Stays</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Off-market estates, cliff-embedded modernist compounds, and heritage royal pavilions impossible to book via public directories.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm text-[#0891B2]">verified</span>
                <span>100% verified sound isolation</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:border-[#7C3AED]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
                  <span className="material-symbols-outlined text-2xl">swap_calls</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs uppercase tracking-wider text-[#7C3AED] font-bold">Pillar 04</span>
                  <h3 className="font-serif-heading text-lg text-[#0F172A] font-bold">Dynamic Re-routing Buffers</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    If rain approaches your Amalfi sail or cloud cover obscures Kyoto’s temple view, Aetheris swaps activities instantly with zero friction.
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-sm text-[#7C3AED]">verified</span>
                <span>Predictive contingency buffers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL PRESS & TESTIMONIALS */}
      <section className="w-full px-4 md:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#64748B] font-bold">
              Global Editorial Acclaim
            </span>
            <h2 className="font-serif-heading text-3xl md:text-4xl text-[#0F172A] font-semibold">
              The Distinction of Absolute Ease
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[#7C3AED] font-bold">
                    Condé Nast Traveler
                  </span>
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="font-serif-heading text-xl md:text-2xl text-[#0F172A] leading-snug font-normal italic">
                  “Aetheris AI accomplishes what no human concierge can: synthesizing the subtle nuances of human whim into flawless, mathematically frictionless reality across the most exclusive coordinates on Earth.”
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-full bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#7C3AED] font-serif font-bold text-lg">
                  C
                </div>
                <div>
                  <span className="block text-sm text-[#0F172A] font-bold">Editorial Innovation Honors</span>
                  <span className="block text-xs text-[#64748B]">Annual Haute-Voyage Index 2025</span>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[#0891B2] font-bold">
                    Robb Report
                  </span>
                  <div className="flex text-amber-400 text-sm">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="font-serif-heading text-xl md:text-2xl text-[#0F172A] leading-snug font-normal italic">
                  “The end of travel logistics as we knew it. Our Positano villa and Riva speedboats were recalibrated mid-flight when coastal breezes shifted — seamlessly and silently before we had even landed in Naples.”
                </blockquote>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E2E8F0]">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#0891B2] font-serif font-bold text-lg">
                  R
                </div>
                <div>
                  <span className="block text-sm text-[#0F172A] font-bold">Private Aviation & Yachting Quarterly</span>
                  <span className="block text-xs text-[#64748B]">Apex Experience Rating 99.8 / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BOTTOM INVITATION CTA */}
      <section className="w-full px-4 md:px-8 py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto rounded-3xl p-8 md:p-12 lg:p-16 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] border border-[#E2E8F0] shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#0891B2] text-xs uppercase tracking-widest font-bold shadow-2xs">
                Invitation to Discretionary Travel
              </span>
              <h2 className="font-serif-heading text-3xl md:text-4xl lg:text-5xl text-[#0F172A] font-semibold leading-tight">
                Begin Your Computational Synthesis Today.
              </h2>
              <p className="text-base md:text-lg text-[#64748B] max-w-xl leading-relaxed">
                Access the private Aetheris travel planner dashboard. Query 1,480+ secured sanctuaries, book private air connections, and generate minute-by-minute itineraries with one gesture.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => onStartPlanning('Amalfi Coast & Positano, Italy')}
                className="w-full text-center px-6 py-4 rounded-xl bg-[#7C3AED] text-white text-xs uppercase tracking-widest font-bold shadow-sm hover:bg-[#6D28D9] hover:shadow-md transition-all"
              >
                Launch Planner Dashboard
              </button>
              <div className="text-center pt-2">
                <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-mono font-medium">
                  End-to-end encrypted · Concierge tier 24/7
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
