/**
 * Smart AI Travel Planner 3.0
 * Settings & Preferences Page
 */

import React from 'react';
import { CurrencyCode } from '../../types/travel';
import { CURRENCY_RATES, formatCurrency } from '../../lib/budget';

interface SettingsPageProps {
  currency: CurrencyCode;
  onCurrencyChange: (newCurrency: CurrencyCode) => void;
  onResetData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currency,
  onCurrencyChange,
  onResetData,
}) => {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="pb-6 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED]">
            Preferences & Autonomous Parameters
          </span>
        </div>
        <h1 className="font-serif-heading text-3xl font-bold text-[#0F172A] mt-1">
          Platform Configuration & Financial Currency
        </h1>
        <p className="text-xs text-[#64748B]">
          Configure currency conversion matrices, autonomous agent execution frequencies, and client dossier parameters.
        </p>
      </div>

      {/* Currency Settings Section */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">
              Primary Financial Currency (FX Engine)
            </h2>
            <p className="text-xs text-[#64748B]">
              All deterministic budget calculations, flight quotes, and luxury sanctuary prices dynamically render in this currency.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0891B2] text-xs font-mono font-bold">
            Active: {currency}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => {
            const isSelected = c === currency;
            const meta = CURRENCY_RATES[c];
            return (
              <div
                key={c}
                onClick={() => onCurrencyChange(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#EFF6FF] border-[#0891B2] ring-2 ring-[#0891B2]/20 shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-mono text-[#0F172A]">
                    {meta.symbol}
                  </span>
                  <span className="text-xs font-bold text-[#0891B2]">{meta.code}</span>
                </div>
                <strong className="text-xs text-[#0F172A] block mt-2">
                  {meta.name}
                </strong>
                <span className="text-[10px] font-mono text-[#64748B] block mt-1">
                  1 {c} = {meta.rateToINR} INR
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Currency Benchmark */}
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-xs text-[#0F172A] block">
              Sample Benchmark Conversion:
            </strong>
            <span className="text-[11px] text-[#64748B]">
              Standard Villa Treville suite night (Base: ₹3,70,000 INR)
            </span>
          </div>
          <div className="font-serif-heading text-xl font-bold font-mono text-[#0891B2]">
            {formatCurrency(370000, currency)}
          </div>
        </div>
      </div>

      {/* Autonomous Agent Configuration */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
        <h2 className="text-sm font-bold text-[#0F172A] pb-4 border-b border-[#E2E8F0]">
          Autonomous Multi-Agent Telemetry & Alerts
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'Dynamic Routing Swaps (Weather Contingency)',
              desc: 'Allow autonomous swap of marine transfers to private chauffeured road transfers when swell exceeds 1.2m.',
              defaultChecked: true,
            },
            {
              title: 'Aviation Slot Auto-Arbitrage',
              desc: 'Continuously poll Eurocontrol FBO corridors for faster charter slots and fuel-efficient altitudes.',
              defaultChecked: true,
            },
            {
              title: 'Sommelier & Michelin Table Ingestion',
              desc: 'Automatically flag rare cellar releases or cancelled VIP tables at 3-Star venues.',
              defaultChecked: true,
            },
            {
              title: 'Strict Deterministic Budget Enforcement',
              desc: 'Block any automated reservation adjustment that exceeds the committed contingency reserve.',
              defaultChecked: true,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between gap-4"
            >
              <div>
                <strong className="text-xs text-[#0F172A] block">{item.title}</strong>
                <span className="text-[11px] text-[#64748B] block mt-0.5">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                defaultChecked={item.defaultChecked}
                className="w-5 h-5 accent-[#0891B2] rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Data Management & Factory Reset */}
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xs p-6 sm:p-8 space-y-4">
        <h2 className="text-sm font-bold text-rose-700">
          Reset Application State
        </h2>
        <p className="text-xs text-[#64748B]">
          Reset all stored itineraries, custom expenses, and uploaded OCR documents back to the initial master curated Amalfi expedition.
        </p>

        <button
          type="button"
          onClick={onResetData}
          className="px-5 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase tracking-wider transition-all"
        >
          Reset to Factory Curated Expeditions
        </button>
      </div>
    </div>
  );
};
