import React, { useState } from 'react';
import { User, Menu, X, Sparkles } from 'lucide-react';
import { PaperPlaneLogo } from './OrigamiIcons';

interface LandingNavbarProps {
  onSignInClick: () => void;
  activeNav: string;
  onNavClick: (item: string) => void;
  onPlanTrip?: () => void;
  theme?: 'airplane' | 'earth';
  onThemeChange?: (theme: 'airplane' | 'earth') => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onSignInClick,
  activeNav,
  onNavClick,
  onPlanTrip,
  theme = 'airplane',
  onThemeChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Packages', id: 'packages' },
    { label: 'Destinations', id: 'destinations' },
    { label: 'Bookings', id: 'bookings' },
    { label: 'About Us', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <nav className="w-full relative z-30 pt-4 pb-2 px-6 sm:px-10 max-w-7xl mx-auto flex items-center justify-between">
      {/* Brand Logo */}
      <div
        onClick={() => onNavClick('home')}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="transform -rotate-6 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
          <PaperPlaneLogo className="w-10 h-10 drop-shadow-md" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-extrabold text-2xl tracking-wider leading-none">
            TRAVEL
          </span>
          <span className="text-blue-100/90 text-[10px] font-semibold tracking-[0.25em] uppercase leading-tight mt-0.5">
            AROUND THE WORLD
          </span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8 lg:gap-10">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              className="relative text-sm font-medium transition-colors cursor-pointer py-1 text-white hover:text-blue-100"
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Side: Theme Switcher & Action Buttons */}
      <div className="hidden md:flex items-center gap-3">
        {onThemeChange && (
          <div className="bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 flex items-center gap-1 text-xs">
            <button
              id="theme-btn-airplane"
              aria-label="Switch to Paper Airplane background"
              onClick={() => onThemeChange('airplane')}
              className={`px-3 py-1 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                theme === 'airplane'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="Paper Airplane Sky Flight"
            >
              <span>✈️</span>
              <span>Airplane</span>
            </button>
            <button
              id="theme-btn-earth"
              aria-label="Switch to 3D Earth background"
              onClick={() => onThemeChange('earth')}
              className={`px-3 py-1 rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                theme === 'earth'
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-300'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              title="3D Earth Orbit"
            >
              <span>🌍</span>
              <span>Earth</span>
            </button>
          </div>
        )}

        {onPlanTrip && (
          <button
            onClick={onPlanTrip}
            className="bg-blue-600 hover:bg-blue-500 text-white active:scale-95 transition-all duration-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-900/30 ring-1 ring-white/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Trip</span>
          </button>
        )}

        <button
          onClick={onSignInClick}
          className="border border-white/70 hover:border-white text-white hover:bg-white/10 active:scale-95 transition-all duration-200 px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span>Sign In</span>
          <User className="w-4 h-4 opacity-90" />
        </button>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-100 z-50 flex flex-col gap-4 text-slate-800 md:hidden">
          {onThemeChange && (
            <div className="bg-slate-100 p-1.5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold px-2">Theme:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onThemeChange('airplane')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                    theme === 'airplane' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>✈️</span> Plane
                </button>
                <button
                  onClick={() => onThemeChange('earth')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 ${
                    theme === 'earth' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🌍</span> Earth
                </button>
              </div>
            </div>
          )}

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavClick(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left text-base font-medium py-2 px-3 rounded-lg transition ${
                activeNav === item.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {onPlanTrip && (
              <button
                onClick={() => {
                  onPlanTrip();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan Trip with AI</span>
              </button>
            )}
            <button
              onClick={() => {
                onSignInClick();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 rounded-full flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Sign In</span>
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
