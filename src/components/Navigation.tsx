/**
 * Smart AI Travel Planner 3.0
 * Unified Navigation System (Sidebar + Sticky Operational Header)
 *
 * Collision-Free Architecture:
 * 1. Sidebar supports desktop collapse (w-72 <-> w-20) and mobile overlay drawer with backdrop.
 * 2. Sticky top header resides inside the content column — eliminating navbar overlap with page content.
 * 3. Responsive at 320px, 375px, 768px, 1024px, and 1440px with min-w-0 and truncation.
 * 4. Full 9-currency selector with live symbols.
 */

import React, { useState } from 'react';
import { CurrencyCode, TripPlan } from '../types/travel';
import { CURRENCY_RATES } from '../lib/budget';

export type ActivePage =
  | 'landing'
  | 'dashboard'
  | 'planner'
  | 'itinerary'
  | 'globe'
  | 'flights'
  | 'hotels'
  | 'budget'
  | 'weather'
  | 'chat'
  | 'documents'
  | 'agents'
  | 'saved'
  | 'settings';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  activeTrip: TripPlan;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onOpenQuickPlan: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'SGD',
  'AED',
];

export const Navigation: React.FC<NavigationProps> = ({
  activePage,
  onNavigate,
  activeTrip,
  currency,
  onCurrencyChange,
  onOpenQuickPlan,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const handleSyncLive = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navItemClass = (page: ActivePage) => {
    const isActive = activePage === page;
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] shadow-2xs'
        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
    }`;
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-label="Close mobile menu"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white z-50 flex flex-col justify-between border-r border-[#E2E8F0] shadow-sm transition-all duration-300 ${
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-72'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-[#E2E8F0] shrink-0">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNavClick('landing')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] via-[#0891B2] to-[#7C3AED] flex items-center justify-center p-0.5 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <span className="font-serif-heading text-lg font-bold bg-gradient-to-r from-[#7C3AED] to-[#0891B2] bg-clip-text text-transparent">
                    Æ
                  </span>
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-serif-heading text-sm font-bold tracking-[0.16em] text-[#0F172A] uppercase truncate">
                    AETHERIS AI
                  </span>
                  <span className="text-[10px] text-[#0891B2] font-semibold tracking-widest uppercase">
                    Quantum OS 3.0
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onToggleSidebar}
              className="hidden lg:flex p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              <span className="material-symbols-outlined text-lg">
                {sidebarCollapsed ? 'menu' : 'menu_open'}
              </span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A]"
              aria-label="Close Sidebar"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Quick Plan CTA Button */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => {
                onOpenQuickPlan();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base group-hover:rotate-12 transition-transform">
                  auto_awesome
                </span>
                {!sidebarCollapsed && <span>Plan a Trip</span>}
              </div>
              {!sidebarCollapsed && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  AI Wizard
                </span>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-2 space-y-4 flex-1">
            {/* Core Section */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Core
                </div>
              )}
              <div onClick={() => handleNavClick('dashboard')} className={navItemClass('dashboard')}>
                <span className="material-symbols-outlined text-lg">grid_view</span>
                {!sidebarCollapsed && <span>Overview</span>}
              </div>
              <div onClick={() => handleNavClick('itinerary')} className={navItemClass('itinerary')}>
                <span className="material-symbols-outlined text-lg">route</span>
                {!sidebarCollapsed && <span>My Itineraries</span>}
              </div>
            </div>

            {/* Discovery & Search */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Discovery & Search
                </div>
              )}
              <div onClick={() => handleNavClick('landing')} className={navItemClass('landing')}>
                <span className="material-symbols-outlined text-lg">travel_explore</span>
                {!sidebarCollapsed && <span>Explore Showcase</span>}
              </div>
              <div onClick={() => handleNavClick('globe')} className={navItemClass('globe')}>
                <span className="material-symbols-outlined text-lg">public</span>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>3D Globe Explorer</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EFF6FF] text-[#0891B2] font-bold">
                      Live
                    </span>
                  </div>
                )}
              </div>
              <div onClick={() => handleNavClick('flights')} className={navItemClass('flights')}>
                <span className="material-symbols-outlined text-lg">flight</span>
                {!sidebarCollapsed && <span>Flights & Routes</span>}
              </div>
              <div onClick={() => handleNavClick('hotels')} className={navItemClass('hotels')}>
                <span className="material-symbols-outlined text-lg">hotel</span>
                {!sidebarCollapsed && <span>Hotels & Stays</span>}
              </div>
            </div>

            {/* Intelligence & Finance */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Intelligence & Finance
                </div>
              )}
              <div onClick={() => handleNavClick('chat')} className={navItemClass('chat')}>
                <span className="material-symbols-outlined text-lg text-[#7C3AED]">smart_toy</span>
                {!sidebarCollapsed && <span>AI Travel Assistant</span>}
              </div>
              <div onClick={() => handleNavClick('agents')} className={navItemClass('agents')}>
                <span className="material-symbols-outlined text-lg text-[#0891B2]">hub</span>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Agent Center</span>
                    <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                  </div>
                )}
              </div>
              <div onClick={() => handleNavClick('budget')} className={navItemClass('budget')}>
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                {!sidebarCollapsed && <span>Budget Planner</span>}
              </div>
              <div onClick={() => handleNavClick('weather')} className={navItemClass('weather')}>
                <span className="material-symbols-outlined text-lg">wb_twilight</span>
                {!sidebarCollapsed && <span>Weather & Safety</span>}
              </div>
            </div>

            {/* Personal Dossiers */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Personal Dossiers
                </div>
              )}
              <div onClick={() => handleNavClick('documents')} className={navItemClass('documents')}>
                <span className="material-symbols-outlined text-lg">document_scanner</span>
                {!sidebarCollapsed && <span>Documents & OCR</span>}
              </div>
              <div onClick={() => handleNavClick('saved')} className={navItemClass('saved')}>
                <span className="material-symbols-outlined text-lg">bookmark</span>
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Saved Trips</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                      3
                    </span>
                  </div>
                )}
              </div>
              <div onClick={() => handleNavClick('settings')} className={navItemClass('settings')}>
                <span className="material-symbols-outlined text-lg">settings</span>
                {!sidebarCollapsed && <span>Settings</span>}
              </div>
            </div>
          </nav>

          {/* Sidebar Bottom Status Badge */}
          {!sidebarCollapsed && (
            <div className="p-3.5 m-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0891B2] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0891B2]" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0891B2]">
                    Aetheris-v3.0 Engine
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono font-semibold">LIVE</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Multi-agent routing & deduplicated itinerary matrix verified.
              </p>
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#7C3AED] via-[#0891B2] to-[#7C3AED] w-[100%] rounded-full" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* STICKY TOP OPERATIONAL BAR (Resides within content column to eliminate overlaps) */}
      <header className="sticky top-0 z-30 h-20 glass-nav px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs w-full">
        {/* Left: Mobile Drawer Trigger & Current Odyssey Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl neu-raised text-[#0F172A] hover:bg-[#F1F5F9] shrink-0"
            aria-label="Open mobile navigation"
          >
            <span className="material-symbols-outlined text-lg block">menu</span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] text-[#0891B2] font-mono text-[10px] uppercase font-bold tracking-wider">
                {activeTrip.confNumber}
              </span>
              <span className="text-[#CBD5E1] hidden sm:inline">·</span>
              <span className="hidden sm:inline font-medium">
                {activeTrip.durationDays} Days / {Math.max(1, activeTrip.durationDays - 1)} Nights
              </span>
              <span className="text-[#CBD5E1] hidden md:inline">·</span>
              <span className="hidden md:inline font-medium">
                {activeTrip.travelersCount} Traveler{activeTrip.travelersCount > 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="font-serif-heading text-sm sm:text-base md:text-lg text-[#0F172A] font-bold tracking-tight truncate">
              {activeTrip.title}
            </h1>
          </div>
        </div>

        {/* Right: Telemetry, Currency & Action CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Rhythm Pacing Gauge */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">
                Rhythm Pacing
              </span>
              <span className="text-xs text-[#0F172A] font-semibold font-mono">
                Relaxed {activeTrip.pacing.relaxedPercent}% · Active {activeTrip.pacing.activePercent}%
              </span>
            </div>
            <div className="w-7 h-7 relative flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E2E8F0]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#0891B2]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${activeTrip.pacing.relaxedPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-[8px] font-bold text-[#0891B2] font-mono">
                {activeTrip.pacing.relaxedPercent}
              </span>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl neu-raised text-xs font-semibold text-[#0F172A] transition-all"
              title="Select Base Currency"
            >
              <span className="text-[#0891B2] font-mono font-bold">
                {CURRENCY_RATES[currency]?.symbol || '₹'}
              </span>
              <span>{currency}</span>
              <span className="material-symbols-outlined text-sm text-[#64748B]">expand_more</span>
            </button>

            {currencyDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setCurrencyDropdownOpen(false)}
                  aria-label="Close currency dropdown"
                />
                <div className="absolute right-0 top-full mt-2 w-44 glass-modal rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 z-50 max-h-72 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Select Currency
                </div>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onCurrencyChange(c);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currency === c
                        ? 'neu-selected-cyan font-bold'
                        : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold w-6 text-[#0891B2]">
                        {CURRENCY_RATES[c]?.symbol}
                      </span>
                      <span>{c}</span>
                    </div>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      {CURRENCY_RATES[c]?.name?.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          </div>

          {/* Sync Live Button */}
          <button
            onClick={handleSyncLive}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised text-[#0891B2] hover:text-[#0e7490] font-semibold text-xs uppercase tracking-wider transition-all"
            title="Synchronize live rates and weather"
          >
            <span
              className={`material-symbols-outlined text-sm ${
                syncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span className="hidden sm:inline">Sync Live</span>
          </button>

          {/* Dispatch Concierge CTA */}
          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
            title="Open AI Concierge Chat"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            <span className="hidden md:inline">Concierge</span>
          </button>

          {/* Profile Monogram */}
          <div
            onClick={() => onNavigate('settings')}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] p-0.5 ring-2 ring-[#7C3AED]/40 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
            title="Julian Vance · Private Explorer"
          >
            <img
              alt="Member Profile"
              className="w-full h-full rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2nUstK7yvPsbp2zUGKxwNPXcTQyYySvwWGuyRwsyof25CwVzPj7huQ58ApZc74twU3FM3WbOGX13pF6wR6qBz5gsewxL7NJ_V7aiAkqRUaFCecSPKGtfyqpLIIB1Hx1d3KuCMfNjxY1YnOHg5g60N1X7CSQyGYyqQQ8sZB67IsetTOhyKCRNcX_Jw6ndxHqTCtKDxbrDZMSwqsoDA3v7JjiSiAUtxJQ3SvLg5-JepabqSXJm59QNTKQ"
            />
          </div>
        </div>
      </header>
    </>
  );
};
