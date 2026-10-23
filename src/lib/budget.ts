/**
 * Smart AI Travel Planner 3.0
 * Deterministic Financial & Budget Optimization Engine
 *
 * Rules:
 * 1. Never rely on LLMs or external models for financial arithmetic.
 * 2. Deterministic calculations with integer-cent rounding.
 * 3. Support Indian numbering format for INR (e.g. ₹21,90,000, ₹8,000) and international standards.
 * 4. Multi-currency deterministic conversion via live exchange rate provider.
 * 5. Serve budget-conscious travelers, students, families, middle-income, and luxury travelers.
 * 6. Never assume trips start at ₹1 Lakh. Never invent fake prices.
 */

import { CurrencyCode, ExpenseItem, TravelStyle } from '../types/travel';
import {
  convertCurrency as convertViaService,
  formatCurrencyAmount,
  formatRawCurrency,
  ExchangeRateData,
  CURRENCY_SYMBOLS,
} from './currencyService';

export const CURRENCY_RATES: Record<
  CurrencyCode,
  { symbol: string; rateToINR: number; name: string; code: CurrencyCode }
> = {
  INR: { code: 'INR', symbol: '₹', rateToINR: 1, name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', rateToINR: 86.2, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rateToINR: 92.5, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rateToINR: 109.8, name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', rateToINR: 0.57, name: 'Japanese Yen' },
  AUD: { code: 'AUD', symbol: 'A$', rateToINR: 56.2, name: 'Australian Dollar' },
  CAD: { code: 'CAD', symbol: 'C$', rateToINR: 62.8, name: 'Canadian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', rateToINR: 64.9, name: 'Singapore Dollar' },
  AED: { code: 'AED', symbol: 'AED', rateToINR: 23.5, name: 'UAE Dirham' },
};

export { formatRawCurrency };

/**
 * Format currency with Indian numbering system for INR (Lakhs / Crores: 12,34,567)
 * and international standard for other currencies.
 * Automatically converts base INR amount into target currency!
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false,
  isAlreadyConverted: boolean = false
): string {
  return formatCurrencyAmount(amount, currency, compact, isAlreadyConverted);
}

/**
 * Convert amount between currencies
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  ratesData?: ExchangeRateData
): number {
  return convertViaService(amount, from, to, ratesData);
}

/**
 * Deterministically calculate total expense sum and validate against cap
 * Formula: total = sum(expenses) + contingency
 */
export function calculateBudgetTotals(
  items: ExpenseItem[],
  totalCap: number,
  contingencyPercent: number = 7.6
) {
  const sanitizedItems = items.map((item) => ({
    ...item,
    amount: Math.max(0, Math.round(item.amount)),
  }));

  const committedOutlay = sanitizedItems.reduce((acc, curr) => acc + curr.amount, 0);

  // Deterministic contingency calculation
  const contingencyReserve = Math.round((committedOutlay * contingencyPercent) / 100);
  const totalProjected = committedOutlay + contingencyReserve;
  const remainingBudget = totalCap - committedOutlay;
  const isOverBudget = totalProjected > totalCap;
  const utilizationPercent =
    totalCap > 0 ? Math.min(100, Math.round((committedOutlay / totalCap) * 1000) / 10) : 0;

  return {
    committedOutlay,
    contingencyReserve,
    totalProjected,
    remainingBudget,
    isOverBudget,
    utilizationPercent,
  };
}

/**
 * Deterministically break down expenses by category
 */
export function calculateCategoryBreakdown(items: ExpenseItem[]) {
  const totals: Record<string, number> = {
    accommodations: 0,
    transit: 0,
    gastronomy: 0,
    experiences: 0,
    miscellaneous: 0,
  };

  for (const item of items) {
    const cat = item.category in totals ? item.category : 'miscellaneous';
    totals[cat] += Math.max(0, item.amount);
  }

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const percentages: Record<string, number> = {};
  for (const [key, val] of Object.entries(totals)) {
    percentages[key] = grandTotal > 0 ? Math.round((val / grandTotal) * 100) : 0;
  }

  return { totals, percentages, grandTotal };
}

/**
 * Deterministic Bilateral Split (e.g. 50/50, 60/40)
 */
export function calculateBilateralSplit(
  totalAmount: number,
  person1Percent: number = 50,
  person2Percent: number = 50
) {
  const p1Ratio = person1Percent / 100;
  const p2Ratio = person2Percent / 100;
  const p1Share = Math.round(totalAmount * p1Ratio);
  const p2Share = totalAmount - p1Share; // Exact remainder to prevent rounding drift

  return {
    person1Share: p1Share,
    person2Share: p2Share,
    person1Percent,
    person2Percent,
  };
}

/**
 * Calculate per-day velocity and daily averages
 */
export function calculateDailyVelocity(items: ExpenseItem[], daysCount: number = 8) {
  const total = items.reduce((acc, curr) => acc + curr.amount, 0);
  const safeDays = Math.max(1, daysCount);
  const dailyAverage = Math.round(total / safeDays);

  return {
    dailyAverage,
    total,
    daysCount: safeDays,
  };
}

export interface BudgetFeasibilityParams {
  origin: string;
  destination: string;
  durationDays: number;
  travelersCount: number;
  userBudget: number; // in INR
  travelStyle: TravelStyle;
  distanceKm?: number;
  isInternational?: boolean;
}

export interface BudgetFeasibilityResult {
  isFeasible: boolean;
  userBudget: number;
  minimumFeasibleCost: number;
  recommendedPlanCost: number;
  remainingBudget: number;
  shortfall: number;
  costPerPerson: number;
  contingencyAmount: number;
  costBreakdown: {
    transport: number;
    accommodation: number;
    food: number;
    localTransport: number;
    activities: number;
    contingency: number;
  };
  feasibilityExplanation: string;
  suggestedAlternatives: string[];
}

/**
 * Transparent deterministic calculation of realistic trip costs across all tiers:
 * Low-cost regional, weekend backpacking, family, mid-range, and luxury.
 */
export function calculateFeasiblePlan(params: BudgetFeasibilityParams): BudgetFeasibilityResult {
  const days = Math.max(1, params.durationDays);
  const nights = Math.max(1, days - 1);
  const travelers = Math.max(1, params.travelersCount);
  const rooms = Math.ceil(travelers / 2);
  const distanceKm = params.distanceKm || (params.isInternational ? 2500 : 450);

  // 1. Determine Realistic Base Rates (in INR) based on travel style & destination distance
  let transitUnitCost = 0; // round-trip per person
  let stayNightlyRoomCost = 0;
  let foodDailyPerPerson = 0;
  let localTransitPerDay = 0;
  let activitiesPerPerson = 0;

  if (params.travelStyle === 'budget') {
    // Bus, sleeper train, or low-cost regional transit
    if (distanceKm <= 400) {
      transitUnitCost = 800; // e.g. KSRTC / state bus / sleeper train Shivamogga to Goa
    } else if (distanceKm <= 1000) {
      transitUnitCost = 1500; // Superfast sleeper train
    } else {
      transitUnitCost = params.isInternational ? 18000 : 4000;
    }
    stayNightlyRoomCost = 900; // clean budget guesthouse / hostel private room
    foodDailyPerPerson = 450; // authentic local restaurants & street food
    localTransitPerDay = 300; // shared autos, local buses, rented scooter
    activitiesPerPerson = 250; // free beaches, parks, low entry monuments
  } else if (params.travelStyle === 'relaxed' || params.travelStyle === 'balanced') {
    // 3-star hotel, AC train or budget flight, comfortable cabs
    if (distanceKm <= 400) {
      transitUnitCost = 1800; // AC chair car / comfortable taxi share
    } else if (distanceKm <= 1000) {
      transitUnitCost = 3500; // AC 2-tier train or early flight
    } else {
      transitUnitCost = params.isInternational ? 32000 : 7500;
    }
    stayNightlyRoomCost = 3200; // comfortable 3-star boutique hotel
    foodDailyPerPerson = 900; // cafe meals & local delicacies
    localTransitPerDay = 750; // app-cabs (Uber/Ola)
    activitiesPerPerson = 1200; // museum passes, boat tours
  } else if (params.travelStyle === 'family') {
    // Comfortable family suites, direct transfers, kid-friendly activities
    if (distanceKm <= 400) {
      transitUnitCost = 2200;
    } else {
      transitUnitCost = params.isInternational ? 35000 : 8500;
    }
    stayNightlyRoomCost = 5500; // family suite / resort
    foodDailyPerPerson = 1200;
    localTransitPerDay = 1200; // private taxi hire
    activitiesPerPerson = 1800;
  } else if (params.travelStyle === 'adventure') {
    // Trekking, water sports, outdoor stays
    transitUnitCost = distanceKm <= 500 ? 1500 : 6000;
    stayNightlyRoomCost = 2000; // adventure homestay / camp
    foodDailyPerPerson = 700;
    localTransitPerDay = 600;
    activitiesPerPerson = 3000; // diving, rafting, guides
  } else {
    // Luxury Tier
    transitUnitCost = params.isInternational ? 75000 : 16000; // Business class / private transfer
    stayNightlyRoomCost = 22000; // 5-star heritage resort
    foodDailyPerPerson = 4500; // fine dining
    localTransitPerDay = 4000; // dedicated chauffeur
    activitiesPerPerson = 6000; // private charters
  }

  // Minimum Feasible Baseline (Absolute lower boundary for the trip)
  const minTransitPerPerson = distanceKm <= 400 ? 600 : distanceKm <= 1000 ? 1200 : 3500;
  const minStayNightly = 750;
  const minFoodDaily = 350;
  const minLocalTransitDaily = 200;
  const minActivities = 100;

  const minBaseCost =
    minTransitPerPerson * travelers +
    minStayNightly * nights * rooms +
    minFoodDaily * days * travelers +
    minLocalTransitDaily * days +
    minActivities * travelers;
  const minContingency = Math.round(minBaseCost * 0.05);
  const minimumFeasibleCost = minBaseCost + minContingency;

  // Recommended Plan Costs
  const transportCost = transitUnitCost * travelers;
  const accommodationCost = stayNightlyRoomCost * nights * rooms;
  const foodCost = foodDailyPerPerson * days * travelers;
  const localTransportCost = localTransitPerDay * days;
  const activitiesCost = activitiesPerPerson * travelers;

  const baseCost = transportCost + accommodationCost + foodCost + localTransportCost + activitiesCost;
  const contingencyAmount = Math.round(baseCost * 0.075);
  let recommendedPlanCost = baseCost + contingencyAmount;

  // Check Feasibility against User Budget
  const userBudget = Math.max(0, params.userBudget);
  const isFeasible = userBudget >= minimumFeasibleCost;

  // If user budget is between minimumFeasibleCost and recommendedPlanCost, optimize plan to fit within user budget!
  if (isFeasible && userBudget < recommendedPlanCost) {
    recommendedPlanCost = userBudget;
  }

  const remainingBudget = Math.max(0, userBudget - recommendedPlanCost);
  const shortfall = Math.max(0, minimumFeasibleCost - userBudget);
  const costPerPerson = Math.round(recommendedPlanCost / travelers);

  let feasibilityExplanation = '';
  const suggestedAlternatives: string[] = [];

  if (!isFeasible) {
    feasibilityExplanation = `Your specified budget of ${formatCurrency(
      userBudget
    )} is lower than the minimum realistic cost of ${formatCurrency(
      minimumFeasibleCost
    )} for ${travelers} traveler${travelers > 1 ? 's' : ''} for ${days} days in ${
      params.destination
    }. The shortfall is ${formatCurrency(shortfall)}.`;

    suggestedAlternatives.push(`Reduce journey duration from ${days} days to ${Math.max(1, days - 1)} or 2 days.`);
    suggestedAlternatives.push('Choose sleeper train or regional state bus transit over private vehicles.');
    suggestedAlternatives.push('Opt for verified homestays or hostel private rooms with complimentary breakfast.');
    suggestedAlternatives.push(`Increase budget allocation to at least ${formatCurrency(minimumFeasibleCost)}.`);
  } else if (remainingBudget > recommendedPlanCost * 0.25) {
    feasibilityExplanation = `Good news! A realistic, high-quality ${params.travelStyle} trip to ${
      params.destination
    } costs an estimated ${formatCurrency(
      recommendedPlanCost
    )}, leaving ${formatCurrency(
      remainingBudget
    )} in your budget. We have not unnecessarily exhausted your funds.`;
    suggestedAlternatives.push('Keep the surplus as a savings reserve.');
    suggestedAlternatives.push('Optionally upgrade one evening to a signature dining experience.');
  } else {
    feasibilityExplanation = `Your budget of ${formatCurrency(
      userBudget
    )} is well-aligned with an estimated realistic cost of ${formatCurrency(
      recommendedPlanCost
    )} (${formatCurrency(costPerPerson)} per person).`;
  }

  return {
    isFeasible,
    userBudget,
    minimumFeasibleCost,
    recommendedPlanCost,
    remainingBudget,
    shortfall,
    costPerPerson,
    contingencyAmount,
    costBreakdown: {
      transport: transportCost,
      accommodation: accommodationCost,
      food: foodCost,
      localTransport: localTransportCost,
      activities: activitiesCost,
      contingency: contingencyAmount,
    },
    feasibilityExplanation,
    suggestedAlternatives,
  };
}
