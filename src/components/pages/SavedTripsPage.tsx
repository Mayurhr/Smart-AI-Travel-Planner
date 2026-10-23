/**
 * Smart AI Travel Planner 3.0
 * Saved Trips & Expedition Library Page
 */

import React from 'react';
import { TripPlan, CurrencyCode } from '../../types/travel';
import { formatCurrency } from '../../lib/budget';
import { RealPlacePhoto } from '../RealPlacePhoto';

interface SavedTripsPageProps {
  trips: TripPlan[];
  activeTripId: string;
  currency: CurrencyCode;
  onSelectTrip: (tripId: string) => void;
  onOpenPlanner: () => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsPage: React.FC<SavedTripsPageProps> = ({
  trips,
  activeTripId,
  currency,
  onSelectTrip,
  onOpenPlanner,
  onDeleteTrip,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0891B2]">
              Expedition Registry & Archives
            </span>
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-1">
            Saved Journeys & Expeditions
          </h1>
          <p className="text-xs text-[#64748B]">
            Manage your autonomous itineraries, synchronized dossiers, and archived travel plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenPlanner}
            className="px-5 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Plan New Odyssey</span>
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((t, idx) => {
          const isActive = t.id === activeTripId;
          return (
            <div
              key={t.id}
              data-aos="fade-up"
              data-aos-duration="600"
              data-aos-delay={(idx % 3) * 100}
              className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-md'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
              }`}
            >
              {/* Card Banner Image */}
              <div className="h-44 relative overflow-hidden bg-slate-900 group">
                <RealPlacePhoto
                  placeName={t.destination}
                  destination={t.destination}
                  aspectRatio="h-full"
                  className="w-full h-full"
                  alt={t.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">
                    {t.durationDays} Days • {t.travelersCount} Guests
                  </span>
                  {isActive && (
                    <span className="px-2.5 py-1 rounded-full bg-[#0891B2] text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                      Active Odyssey
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase font-mono text-[#7DD3FC] tracking-wider block">
                    {t.destination}
                  </span>
                  <h3 className="font-serif-heading text-lg font-bold truncate">
                    {t.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Departure Hub:</span>
                    <strong className="text-[#0F172A]">{t.origin}</strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Dates:</span>
                    <strong className="text-[#0F172A] font-mono">
                      {t.startDate} → {t.endDate}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Allocated Capital:</span>
                    <strong className="text-[#0891B2] font-mono font-bold">
                      {formatCurrency(t.budget.maxBudget ?? t.budget.totalCap, currency)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Travel Style:</span>
                    <span className="capitalize font-semibold text-[#7C3AED]">
                      {t.style}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTrip(t.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-[#EFF6FF] text-[#0891B2] border border-[#BFDBFE]'
                        : 'bg-[#0891B2] hover:bg-[#0e7490] text-white shadow-2xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isActive ? 'check' : 'folder_open'}
                    </span>
                    <span>{isActive ? 'Currently Active' : 'Load Dossier'}</span>
                  </button>

                  {trips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteTrip(t.id)}
                      title="Delete Journey"
                      className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-200"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
