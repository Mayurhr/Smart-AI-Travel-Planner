/**
 * Smart AI Travel Planner 3.0
 * Weather, Marine Conditions & Safety Intelligence Page
 */

import React, { useState } from 'react';
import { TripPlan, WeatherTelemetry } from '../../types/travel';

interface WeatherSafetyPageProps {
  trip: TripPlan;
}

export const WeatherSafetyPage: React.FC<WeatherSafetyPageProps> = ({ trip }) => {
  const [packingList, setPackingList] = useState([
    { id: '1', category: 'Apparel & Formalwear', item: 'Linen shirts & tailored trousers (Capri dress code)', packed: true },
    { id: '2', category: 'Apparel & Formalwear', item: 'Light evening cashmere wrap for cliffside dining', packed: true },
    { id: '3', category: 'Apparel & Formalwear', item: 'Deck shoes with non-marking soles for yacht charters', packed: false },
    { id: '4', category: 'Marine & Sun Defense', item: 'Reef-safe SPF 50+ mineral sunscreen', packed: true },
    { id: '5', category: 'Marine & Sun Defense', item: 'Polarized UV400 sunglasses & floating strap', packed: false },
    { id: '6', category: 'Marine & Sun Defense', item: 'Waterproof dry bag (20L) for sea cave excursions', packed: false },
    { id: '7', category: 'Electronics & Optics', item: 'Universal Type C/F European power adapters', packed: true },
    { id: '8', category: 'Electronics & Optics', item: 'High-capacity 25,000mAh magnetic battery pack', packed: true },
    { id: '9', category: 'Electronics & Optics', item: 'Mirrorless camera with wide-angle 24-70mm lens', packed: false },
    { id: '10', category: 'Medical & Documents', item: 'Physical passport + digital biometrics backup', packed: true },
    { id: '11', category: 'Medical & Documents', item: 'Motion-sickness relief (seasickness bands/patches)', packed: false },
    { id: '12', category: 'Medical & Documents', item: 'Comprehensive travel health insurance card', packed: true },
  ]);

  const [newItemText, setNewItemText] = useState('');
  const [newCategory, setNewCategory] = useState('Apparel & Formalwear');

  const togglePacked = (id: string) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setPackingList((prev) => [
      ...prev,
      {
        id: `pack-${Date.now()}`,
        category: newCategory,
        item: newItemText.trim(),
        packed: false,
      },
    ]);
    setNewItemText('');
  };

  const packedCount = packingList.filter((p) => p.packed).length;
  const packedPercent = Math.round((packedCount / packingList.length) * 100);

  const weather = trip.weather;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E2E8F0] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#059669]">
              Marine & Geospatial Surveillance
            </span>
            <span className="text-xs text-[#94A3B8]">•</span>
            <span className="text-xs font-mono text-[#64748B]">Buoy Sensor Array #MED-994</span>
          </div>
          <h1 className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-1">
            Weather, Marine & Safety Command
          </h1>
          <p className="text-xs text-[#64748B]">
            Real-time microclimate vectors, sea swell heights, UV index radar, and active consular safety zones for {trip.destination}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Advisory Level 1: Normal Caution</span>
          </div>
        </div>
      </div>

      {/* KPI Weather Telemetry Grid */}
      <div
        data-aos="fade-up"
        data-aos-duration="600"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Ambient Microclimate
            </span>
            <span className="material-symbols-outlined text-[#0891B2] text-xl">thermostat</span>
          </div>
          <div className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-2">
            {weather?.tempC !== undefined ? `${weather.tempC}°C` : '24°C'}
          </div>
          <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1">
            <span>{weather?.condition || 'Clear & Crisp Mediterranean Sky'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Marine Swell & Sea State
            </span>
            <span className="material-symbols-outlined text-[#0284C7] text-xl">waves</span>
          </div>
          <div className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-2">
            {weather?.swellMeters !== undefined ? `${weather.swellMeters}m Swell` : '0.4m Light Swell'}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Optimal for 68ft+ Yacht Charters
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              UV Index & Solar Radiation
            </span>
            <span className="material-symbols-outlined text-[#F59E0B] text-xl">wb_sunny</span>
          </div>
          <div className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-2">
            {weather?.uvIndex !== undefined ? `UV ${weather.uvIndex}` : 'UV 4.8'}
          </div>
          <div className="text-xs text-amber-600 font-semibold mt-1">
            Moderate • Sun protection required 11:00 - 15:30
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Air Quality & Visibility
            </span>
            <span className="material-symbols-outlined text-[#10B981] text-xl">air</span>
          </div>
          <div className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-2">
            {weather?.visibilityKm !== undefined ? `${weather.visibilityKm} km Vis` : '28 km Clear'}
          </div>
          <div className="text-xs text-[#64748B] mt-1 font-mono">
            Optical Horizon: &gt; 28 NM
          </div>
        </div>
      </div>

      {/* Main 2-Column Deck: Safety & Packing Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Safety Protocols & Medical Access (7 cols) */}
        <div data-aos="fade-up" data-aos-duration="600" className="lg:col-span-7 space-y-6">
          {/* Safety Protocols Card */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">shield</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Geospatial Safety & Consular Coordination
                  </h2>
                  <span className="text-[11px] text-[#64748B]">
                    Active monitoring across Naples, Sorrento, Amalfi, and Capri
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Clear Status
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0891B2] text-sm">local_hospital</span>
                  <span className="text-xs font-bold text-[#0F172A]">Medical Facilities</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Ospedale Castiglione di Ravello (14 mins via private transfer). Helipad equipped for emergency aeromedical transit to Naples International.
                </p>
                <div className="text-[10px] font-mono font-semibold text-[#0891B2]">
                  Emergency: 118 (National Medical Dispatch)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#7C3AED] text-sm">policy</span>
                  <span className="text-xs font-bold text-[#0F172A]">Law Enforcement & Security</span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Carabinieri Command Positano & Guardia Costiera Amalfi. Marine VHF Channel 16 monitored 24/7 for maritime distress.
                </p>
                <div className="text-[10px] font-mono font-semibold text-[#7C3AED]">
                  Police: 112 (EU General Emergency)
                </div>
              </div>
            </div>

            {/* Travel Advisories Bullet points */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Intelligent Ground Advisories
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    title: 'Coastal Road Congestion (SS163)',
                    desc: 'Heavy traffic between 11:00 and 16:30 on the Amalfi Drive. Agent has scheduled private Riva boat transfers to avoid vehicular bottlenecks.',
                    type: 'info',
                  },
                  {
                    title: 'Cobblestone & Cliff Elevation',
                    desc: 'Positano pedestrian walkways feature significant steps. Porters have been pre-dispatched for luggage transit directly from private jetty to villa.',
                    type: 'tips',
                  },
                  {
                    title: 'VHF Maritime Channel 16',
                    desc: 'Direct communication link open with Capri Port Authority for pre-cleared berth slips at Marina Grande.',
                    type: 'verified',
                  },
                ].map((adv, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-[#0891B2] text-base mt-0.5">
                      info
                    </span>
                    <div>
                      <strong className="text-xs text-[#0F172A] block">{adv.title}</strong>
                      <span className="text-[11px] text-[#64748B] leading-tight block mt-0.5">
                        {adv.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Microclimate Forecast Table */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Microclimate 7-Day Trend Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Day</th>
                    <th className="py-2.5">Condition</th>
                    <th className="py-2.5">Temp Range</th>
                    <th className="py-2.5">Precip %</th>
                    <th className="py-2.5">Swell</th>
                    <th className="py-2.5">Wind</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#0F172A]">
                  {[
                    { day: 'Day 1 (Oct 14)', cond: 'Sunny / Crisp', temp: '15°C - 23°C', rain: '5%', swell: '0.4m', wind: '8 kts SW' },
                    { day: 'Day 2 (Oct 15)', cond: 'Clear Sky', temp: '16°C - 24°C', rain: '0%', swell: '0.3m', wind: '6 kts W' },
                    { day: 'Day 3 (Oct 16)', cond: 'Mediterranean Sun', temp: '16°C - 24°C', rain: '10%', swell: '0.5m', wind: '9 kts S' },
                    { day: 'Day 4 (Oct 17)', cond: 'Partly Cloudy', temp: '14°C - 22°C', rain: '15%', swell: '0.6m', wind: '11 kts NW' },
                    { day: 'Day 5 (Oct 18)', cond: 'Coastal Breeze', temp: '15°C - 23°C', rain: '5%', swell: '0.4m', wind: '7 kts SW' },
                    { day: 'Day 6 (Oct 19)', cond: 'Sunny', temp: '17°C - 25°C', rain: '0%', swell: '0.3m', wind: '5 kts W' },
                    { day: 'Day 7 (Oct 20)', cond: 'Passing Mist', temp: '14°C - 21°C', rain: '20%', swell: '0.7m', wind: '12 kts SE' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 font-semibold text-[#0F172A]">{row.day}</td>
                      <td className="py-2.5 flex items-center gap-1.5 text-[#0891B2]">
                        <span className="material-symbols-outlined text-sm">wb_sunny</span>
                        <span>{row.cond}</span>
                      </td>
                      <td className="py-2.5 font-mono">{row.temp}</td>
                      <td className="py-2.5 font-mono">{row.rain}</td>
                      <td className="py-2.5 font-mono">{row.swell}</td>
                      <td className="py-2.5 font-mono">{row.wind}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Intelligent Packing Checklist (5 cols) */}
        <div data-aos="fade-left" data-aos-duration="600" className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">luggage</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Intelligent Packing Matrix
                  </h2>
                  <span className="text-[11px] text-[#64748B]">
                    Dynamically aligned with microclimate & yacht dress codes
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#7C3AED]">
                {packedCount}/{packingList.length} ({packedPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#0891B2] to-[#7C3AED] h-full rounded-full transition-all duration-300"
                  style={{ width: `${packedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#64748B]">
                <span>Status: {packedPercent === 100 ? 'Fully Packed & Ready' : 'In Progress'}</span>
                <span>{packingList.length - packedCount} items remaining</span>
              </div>
            </div>

            {/* Checklist items by category */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {packingList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePacked(item.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    item.packed
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-75'
                      : 'bg-white border-[#CBD5E1] hover:border-[#0891B2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        item.packed
                          ? 'bg-[#059669] text-white'
                          : 'border border-[#94A3B8] bg-white'
                      }`}
                    >
                      {item.packed && (
                        <span className="material-symbols-outlined text-xs">check</span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-xs font-medium block ${
                          item.packed
                            ? 'line-through text-[#94A3B8]'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {item.item}
                      </span>
                      <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAddItem} className="pt-4 border-t border-[#E2E8F0] space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                Add Custom Equipment or Item
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="e.g. Scuba certification card..."
                  className="flex-1 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
