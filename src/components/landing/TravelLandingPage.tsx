/**
 * Smart AI Travel Planner 3.0
 * TravelLandingPage — "Travel Around the World" landing page
 *
 * Integrates the standalone landing page from travel_around_world_extracted
 * into the main application as the activePage === 'landing' route.
 *
 * Features:
 * - Scroll-driven paper airplane / 3D earth canvas background (AirplaneCanvas)
 * - Dark immersive design (#0b1528) that coexists with the main app's light shell
 * - Full navigation: packages, pricing, how-to-book, stats
 * - Sign In modal + Booking modal
 * - Bridge: "Complete Reservation" success → "Open AI Trip Planner" fires onStartPlanning
 */

import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { AirplaneCanvas } from './AirplaneCanvas';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { FeatureBadges } from './FeatureBadges';
import { PopularPackages } from './PopularPackages';
import { PricingDetails } from './PricingDetails';
import { HowToBook } from './HowToBook';
import { StatsAndTestimonial } from './StatsAndTestimonial';
import { LandingBookingModal } from './LandingBookingModal';
import { LandingSignInModal } from './LandingSignInModal';
import { TravelPackage, PricingPlan, LandingSearchState } from '../../types/landingTypes';

export interface PlannerInitialData {
  destination?: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
}

interface TravelLandingPageProps {
  /** Called when user clicks "Plan Trip" or searches from the landing hero */
  onStartPlanning: (initialData?: PlannerInitialData) => void;
}

export const TravelLandingPage: React.FC<TravelLandingPageProps> = ({ onStartPlanning }) => {
  const [bgMode, setBgMode] = useState<'airplane' | 'earth'>('airplane');
  const [activeNav, setActiveNav] = useState('home');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [signedInUser, setSignedInUser] = useState<string | null>(null);

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    if (navId === 'plan' || navId === 'planner') {
      onStartPlanning();
    } else if (navId === 'packages' || navId === 'destinations') {
      document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'bookings') {
      document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (navId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlanTrip = () => {
    // Directly go to plan the trip section in AETHERIS AI without scrolling to popular packages or pricing
    onStartPlanning();
  };

  const handleSearch = (criteria: LandingSearchState) => {
    // When user plans in the home page section and presses search, directly go to plan the trip section with the criteria prefilled!
    onStartPlanning({
      origin: criteria.from,
      destination: criteria.to,
      startDate: criteria.departDate,
      endDate: criteria.returnDate,
      travelers: criteria.travelers,
    });
  };

  return (
    <div
      className="min-h-screen text-slate-800 antialiased selection:bg-blue-500 selection:text-white flex flex-col font-sans relative"
      style={{ background: 'transparent' }}
    >
      {/* Fixed fullscreen scroll-driven canvas background */}
      <AirplaneCanvas mode={bgMode} />

      {/* Page content — z-10 over the canvas */}
      <main className="flex-1 relative z-10">
        {/* Hero section: dark gradient overlay + navbar + hero content */}
        <div className="bg-gradient-to-b from-[#0b1528]/85 via-[#0b1528]/40 to-transparent">
          <LandingNavbar
            activeNav={activeNav}
            onNavClick={handleNavClick}
            onSignInClick={() => setIsSignInOpen(true)}
            onPlanTrip={handlePlanTrip}
            theme={bgMode}
            onThemeChange={(m) => setBgMode(m)}
          />
          <LandingHero
            onPlanTrip={handlePlanTrip}
            onSearch={handleSearch}
          />
        </div>

        {/* Feature Badges */}
        <FeatureBadges />

        {/* Popular Packages */}
        <PopularPackages
          onSelectPackage={(pkg) => setSelectedPackage(pkg)}
          onViewAll={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* Pricing Details */}
        <PricingDetails
          onSelectPlan={(plan) => setSelectedPlan(plan)}
        />

        {/* How To Book */}
        <HowToBook />

        {/* Stats & Testimonial Footer */}
        <StatsAndTestimonial />
      </main>

      {/* Booking Modal */}
      <LandingBookingModal
        packageItem={selectedPackage}
        pricingPlan={selectedPlan}
        onClose={() => { setSelectedPackage(null); setSelectedPlan(null); }}
        onStartPlanning={(destination) => {
          setSelectedPackage(null);
          setSelectedPlan(null);
          onStartPlanning({ destination });
        }}
      />

      {/* Sign In Modal */}
      <LandingSignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={(email) => setSignedInUser(email)}
      />

      {/* Signed In Toast */}
      {signedInUser && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium">Logged in as {signedInUser}</span>
          <button
            onClick={() => setSignedInUser(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
