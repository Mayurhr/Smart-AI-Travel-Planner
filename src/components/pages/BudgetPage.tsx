/**
 * Smart AI Travel Planner 3.0
 * Budget Planner Page (Discretionary Capital & Expense Architecture)
 *
 * Implements:
 * - Dynamic data binding to active trip budget and items
 * - True deterministic calculations with Indian numbering for INR
 * - Category ledger with interactive filtering
 * - Functional modal to record new expenses
 * - Dynamic bilateral split based on actual travelers count
 * - Export audit statement in JSON format
 */

import React, { useState } from 'react';
import { TripPlan, CurrencyCode, ExpenseItem } from '../../types/travel';
import {
  formatCurrency,
  convertCurrency,
  calculateBudgetTotals,
  calculateCategoryBreakdown,
  CURRENCY_RATES,
} from '../../lib/budget';

interface BudgetPageProps {
  trip: TripPlan;
  currency: CurrencyCode;
  onUpdateTrip?: (updated: TripPlan) => void;
  onUpdateItems?: (newItems: ExpenseItem[]) => void;
  onNavigate?: (page: string) => void;
}

export const BudgetPage: React.FC<BudgetPageProps> = ({
  trip,
  currency,
  onUpdateTrip,
  onUpdateItems,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubDetail, setNewSubDetail] = useState('');
  const [newCategory, setNewCategory] = useState<'accommodations' | 'transit' | 'gastronomy' | 'experiences' | 'miscellaneous'>('gastronomy');
  const [newAmount, setNewAmount] = useState<number>(500);
  
  // Interactive Swiss Design Currency Converter State
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcFrom, setCalcFrom] = useState<CurrencyCode>(currency);
  const [calcTo, setCalcTo] = useState<CurrencyCode>(currency === 'INR' ? 'USD' : 'INR');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || newAmount <= 0) return;

    const newItem: ExpenseItem = {
      id: `exp-user-${Date.now()}`,
      entityName: newTitle.trim(),
      subDetail: newSubDetail.trim() || 'Custom recorded expense',
      dateRange: 'On-Ground',
      category: newCategory,
      paymentMethod: 'Self-Funded',
      status: 'settled',
      amount: Math.round(newAmount),
    };

    const updatedItems = [newItem, ...(trip.budget.items || [])];
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    } else if (onUpdateTrip) {
      const math = calculateBudgetTotals(updatedItems, trip.budget.totalCap);
      onUpdateTrip({
        ...trip,
        budget: {
          ...trip.budget,
          items: updatedItems,
          committedOutlay: math.committedOutlay,
          contingencyReserve: math.contingencyReserve,
        },
      });
    }

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSubDetail('');
    setNewAmount(500);
    showToast(`Expense "${newItem.entityName}" recorded successfully.`);
  };

  const totalCap = trip.budget.totalCap || trip.budget.committedOutlay;
  const committed = trip.budget.committedOutlay;
  const contingency = trip.budget.contingencyReserve;
  const remaining = Math.max(0, totalCap - committed);
  const isOverBudget = committed > totalCap;
  const shortfall = Math.max(0, committed - totalCap);

  const totalCapConverted = convertCurrency(totalCap, 'INR', currency);
  const committedConverted = convertCurrency(committed, 'INR', currency);
  const contingencyConverted = convertCurrency(contingency, 'INR', currency);
  const remainingConverted = convertCurrency(remaining, 'INR', currency);

  const travelers = Math.max(1, trip.travelersCount);
  const costPerPerson = Math.round(committed / travelers);

  const items = trip.budget.items || [];
  const filteredItems =
    filterCategory === 'all'
      ? items
      : items.filter((item) => item.category === filterCategory);

  const { totals, percentages } = calculateCategoryBreakdown(items);

  const dailyAvg = Math.round(committed / Math.max(1, trip.durationDays));

  const exportAuditJSON = () => {
    const auditData = {
      tripTitle: trip.title,
      destination: trip.destination,
      origin: trip.origin,
      dates: `${trip.startDate} to ${trip.endDate}`,
      travelersCount: trip.travelersCount,
      budget: {
        totalCap,
        committedOutlay: committed,
        contingencyReserve: contingency,
        remaining,
        currency,
        items,
      },
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Budget_Audit_${trip.destination.split(',')[0]}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Audit statement downloaded in JSON format.');
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-24 right-8 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-lg border border-[#334155] flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <span className="material-symbols-outlined text-sm text-[#0891B2]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#0891B2] text-[10px] font-bold uppercase tracking-wider border border-[#BFDBFE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0891B2] animate-pulse" />
              {trip.destination} · {trip.startDate} to {trip.endDate}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F3FF] text-[#7C3AED] text-[10px] font-bold uppercase tracking-wider border border-[#DDD6FE]">
              <span className="material-symbols-outlined text-xs">shield_with_heart</span>
              Deterministic Treasury Engine Active
            </span>
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl text-[#0F172A] font-bold tracking-tight">
            Budget & Capital Allocation
          </h1>
          <p className="text-xs md:text-sm text-[#64748B]">
            Transparent expense tracking and optimization for {travelers} traveler{travelers > 1 ? 's' : ''}.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Record Expense</span>
          </button>
          <button
            onClick={exportAuditJSON}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-[#0F172A] border border-[#CBD5E1] text-xs font-semibold hover:bg-[#F8FAFC] shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export Audit JSON</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending Limit */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Total Spending Limit
            </span>
            <span className="material-symbols-outlined text-[#0891B2] text-base">account_balance</span>
          </div>
          <div className="font-serif-heading text-2xl font-bold font-mono text-[#0F172A] pt-1">
            {formatCurrency(totalCapConverted, currency)}
          </div>
          <div className="text-[11px] text-[#64748B]">
            Defined maximum allocation
          </div>
        </div>

        {/* Committed Outlay */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Committed Outlay
            </span>
            <span className="material-symbols-outlined text-[#7C3AED] text-base">receipt_long</span>
          </div>
          <div className="font-serif-heading text-2xl font-bold font-mono text-[#0F172A] pt-1">
            {formatCurrency(committedConverted, currency)}
          </div>
          <div className="text-[11px] text-[#64748B]">
            ~{formatCurrency(convertCurrency(costPerPerson, 'INR', currency), currency)} / traveler
          </div>
        </div>

        {/* Contingency Buffer */}
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Contingency Reserve
            </span>
            <span className="material-symbols-outlined text-[#059669] text-base">health_and_safety</span>
          </div>
          <div className="font-serif-heading text-2xl font-bold font-mono text-[#059669] pt-1">
            {formatCurrency(contingencyConverted, currency)}
          </div>
          <div className="text-[11px] text-[#64748B]">
            7.6% safety reserve
          </div>
        </div>

        {/* Remaining Surplus or Shortfall */}
        <div
          className={`rounded-3xl p-5 border shadow-xs space-y-1 ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold uppercase tracking-wider text-[10px] ${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isOverBudget ? 'Budget Shortfall' : 'Surplus Remaining'}
            </span>
            <span className={`material-symbols-outlined text-base ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isOverBudget ? 'warning' : 'savings'}
            </span>
          </div>
          <div className={`font-serif-heading text-2xl font-bold font-mono pt-1 ${isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
            {isOverBudget
              ? `-${formatCurrency(convertCurrency(shortfall, 'INR', currency), currency)}`
              : formatCurrency(remainingConverted, currency)}
          </div>
          <div className={`text-[11px] ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isOverBudget ? 'Exceeds target limit' : 'Unspent capital buffer'}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Ledger & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Expense Ledger (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-6">
            {/* Ledger Header & Category Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Category Distribution Ledger
                </h2>
                <span className="text-xs text-[#64748B]">
                  {items.length} Tracked Item{items.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {['all', 'accommodations', 'transit', 'gastronomy', 'experiences'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                      filterCategory === cat
                        ? 'bg-[#0891B2] text-white shadow-2xs'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0891B2] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {item.entityName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-white text-[#0891B2] border border-[#BFDBFE]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      {item.subDetail} · <span className="font-mono">{item.dateRange}</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-serif-heading text-base font-bold font-mono text-[#0F172A] block">
                      {formatCurrency(convertCurrency(item.amount, 'INR', currency), currency)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Allocation Breakdown & Bilateral Split (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Breakdown Progress */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Cost Breakdown by Pillar
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[#64748B] mb-1">
                  <span>Transit & Travel</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {formatCurrency(convertCurrency(totals.transit, 'INR', currency), currency)} ({percentages.transit}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0891B2] h-full rounded-full" style={{ width: `${percentages.transit}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#64748B] mb-1">
                  <span>Accommodations</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {formatCurrency(convertCurrency(totals.accommodations, 'INR', currency), currency)} ({percentages.accommodations}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${percentages.accommodations}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#64748B] mb-1">
                  <span>Food & Dining</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {formatCurrency(convertCurrency(totals.gastronomy, 'INR', currency), currency)} ({percentages.gastronomy}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#059669] h-full rounded-full" style={{ width: `${percentages.gastronomy}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#64748B] mb-1">
                  <span>Experiences & Sights</span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {formatCurrency(convertCurrency(totals.experiences, 'INR', currency), currency)} ({percentages.experiences}%)
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full rounded-full" style={{ width: `${percentages.experiences}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex justify-between text-xs text-[#64748B]">
              <span>Daily Spend Velocity:</span>
              <strong className="text-[#0F172A] font-mono">
                {formatCurrency(convertCurrency(dailyAvg, 'INR', currency), currency)} / day
              </strong>
            </div>
          </div>

          {/* Equal Group Split */}
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-[#0F172A]">
              Group Share Breakdown ({travelers} Guests)
            </h3>

            <div className="space-y-2">
              {Array.from({ length: travelers }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0891B2] text-white flex items-center justify-center font-bold text-[11px]">
                      T{idx + 1}
                    </div>
                    <div>
                      <strong className="text-[#0F172A] block">Traveler {idx + 1}</strong>
                      <span className="text-[10px] text-[#64748B]">Equal Share ({(100 / travelers).toFixed(1)}%)</span>
                    </div>
                  </div>
                  <strong className="font-mono text-[#0F172A]">
                    {formatCurrency(convertCurrency(costPerPerson, 'INR', currency), currency)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SWISS DESIGN: LIVE CURRENCY CONVERTER & FX MATRIX ================= */}
      <section
        data-aos="fade-up"
        data-aos-duration="600"
        className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#0891B2]">
                Financial Precision & Arbitrage
              </span>
            </div>
            <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#0F172A]">
              Currency Converter & Sovereign FX Matrix
            </h2>
            <p className="text-xs text-[#64748B]">
              Deterministic conversions across 9 major world currencies with integer-cent accuracy and verified exchange benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#0891B2] text-xs font-mono font-bold">
              Base: {currency}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] text-[10px] font-mono">
              Deterministic Math
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Calculator (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Convert Capital Amount
              </span>
              <button
                type="button"
                onClick={() => {
                  const temp = calcFrom;
                  setCalcFrom(calcTo);
                  setCalcTo(temp);
                }}
                className="p-1.5 rounded-lg neu-raised text-[#0891B2] hover:text-[#0e7490] transition-all flex items-center gap-1 text-xs font-semibold"
                title="Swap Currencies"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                <span>Invert</span>
              </button>
            </div>

            {/* Input Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between">
                <span>Amount to Convert</span>
                <span className="font-mono text-[10px] text-[#0891B2]">
                  {CURRENCY_RATES[calcFrom].name}
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-sm font-bold font-mono text-[#64748B]">
                  {CURRENCY_RATES[calcFrom].symbol}
                </span>
                <input
                  type="number"
                  min={1}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-base font-bold font-mono text-[#0F172A] focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/20"
                />
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value as CurrencyCode)}
                  aria-label="Source Currency"
                  className="absolute right-2 text-xs font-bold font-mono bg-[#EFF6FF] text-[#0891B2] border border-[#BFDBFE] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] mr-1">
                Presets:
              </span>
              {[100, 500, 1000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCalcAmount(val)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                    calcAmount === val
                      ? 'bg-[#0891B2] text-white shadow-2xs'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]'
                  }`}
                >
                  +{val}
                </button>
              ))}
            </div>

            {/* Target Currency Select */}
            <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
              <label className="text-[11px] font-semibold text-[#64748B] flex items-center justify-between">
                <span>Destination Currency</span>
                <span className="font-mono text-[10px] text-[#7C3AED]">
                  {CURRENCY_RATES[calcTo].name}
                </span>
              </label>
              <select
                value={calcTo}
                onChange={(e) => setCalcTo(e.target.value as CurrencyCode)}
                aria-label="Destination Currency"
                className="w-full p-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold font-mono text-[#0F172A] focus:outline-none focus:border-[#7C3AED]"
              >
                {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c} — {CURRENCY_RATES[c].name} ({CURRENCY_RATES[c].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Converted Output Display */}
            {(() => {
              const inINR = calcAmount * CURRENCY_RATES[calcFrom].rateToINR;
              const convertedVal = inINR / CURRENCY_RATES[calcTo].rateToINR;
              const unitRate = CURRENCY_RATES[calcFrom].rateToINR / CURRENCY_RATES[calcTo].rateToINR;
              return (
                <div className="p-4 rounded-xl bg-white border border-[#BFDBFE] shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Exact Calculated Valuation
                  </span>
                  <div className="font-serif-heading text-2xl sm:text-3xl font-bold font-mono text-[#0891B2] tracking-tight">
                    {formatCurrency(convertedVal, calcTo, false, true)}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[11px] text-[#64748B]">
                    <span>Exchange Ratio:</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      1 {calcFrom} = {unitRate.toFixed(4)} {calcTo}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Cross-Currency Comparison Table (7 cols) */}
          <div className="lg:col-span-7 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                  9-Currency Cross-Arbitrage Matrix
                </h3>
                <span className="text-[11px] text-[#64748B]">
                  Equivalents for {CURRENCY_RATES[calcFrom].symbol}1,000 {calcFrom}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#0891B2] font-semibold bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                Live Provider Benchmarks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9]/60 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="py-2.5 px-4">Currency</th>
                    <th className="py-2.5 px-4 font-mono">Rate to 1 {calcFrom}</th>
                    <th className="py-2.5 px-4 font-mono text-right">1,000 {calcFrom} Equivalent</th>
                    <th className="py-2.5 px-4 text-center">Daily Budget Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] font-mono">
                  {(Object.keys(CURRENCY_RATES) as CurrencyCode[]).map((target) => {
                    const isBase = target === calcFrom;
                    const inINR = 1000 * CURRENCY_RATES[calcFrom].rateToINR;
                    const converted1k = inINR / CURRENCY_RATES[target].rateToINR;
                    const unitRate = CURRENCY_RATES[calcFrom].rateToINR / CURRENCY_RATES[target].rateToINR;
                    const dailyBudgetConverted = convertCurrency(dailyAvg, 'INR', target);

                    return (
                      <tr
                        key={target}
                        onClick={() => setCalcTo(target)}
                        className={`cursor-pointer transition-colors ${
                          isBase
                            ? 'bg-[#EFF6FF]/70 font-semibold'
                            : 'hover:bg-white bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-sans font-medium text-[#0F172A] flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center font-mono font-bold text-xs text-[#0891B2] shadow-2xs">
                            {CURRENCY_RATES[target].symbol}
                          </span>
                          <div>
                            <span className="font-bold">{target}</span>
                            <span className="text-[10px] text-[#64748B] block font-sans">
                              {CURRENCY_RATES[target].name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[#64748B]">
                          {unitRate < 0.01 ? unitRate.toFixed(5) : unitRate.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-[#0F172A]">
                          {formatCurrency(converted1k, target, false, true)}
                        </td>
                        <td className="py-2.5 px-4 text-center text-[#7C3AED] font-semibold text-[11px]">
                          {formatCurrency(dailyBudgetConverted, target)} / day
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-serif-heading text-lg font-bold text-[#0F172A]">
                Record New Trip Expense
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Scuba diving pass, Dinner at beach shack"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                >
                  <option value="gastronomy">Food & Gastronomy</option>
                  <option value="transit">Transit & Transport</option>
                  <option value="accommodations">Accommodations</option>
                  <option value="experiences">Experiences & Activities</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Amount (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Optional Details
                </label>
                <input
                  type="text"
                  value={newSubDetail}
                  onChange={(e) => setNewSubDetail(e.target.value)}
                  placeholder="e.g. 2 Tickets, paid via UPI"
                  className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-[#0891B2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0891B2] hover:bg-[#0e7490] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
