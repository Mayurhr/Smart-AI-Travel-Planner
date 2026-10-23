/**
 * Smart AI Travel Planner 3.0
 * Live Currency Conversion Engine (Frankfurter API + Caching)
 *
 * Implements:
 * - Real live exchange rate retrieval via Frankfurter Open API
 * - Explicit source and target currency direction
 * - In-memory and persistent caching with expiration and timestamps
 * - Robust error handling with honest status labels
 * - Standard en-IN formatting for INR and international standard for foreign currencies
 */

import { CurrencyCode } from '../types/travel';

export interface ExchangeRateData {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  timestamp: number;
  lastUpdatedStr: string;
  source: 'live' | 'cached' | 'fallback';
}

const CACHE_KEY = 'aetheris_currency_rates_cache_v3';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Fallback baseline rates based on actual market benchmarks (with clear label)
export const BASELINE_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.0116, // 1 INR = ~0.0116 USD (86.2 INR/USD)
  EUR: 0.0108, // 1 INR = ~0.0108 EUR (92.5 INR/EUR)
  GBP: 0.0091, // 1 INR = ~0.0091 GBP (109.8 INR/GBP)
  JPY: 1.76,   // 1 INR = ~1.76 JPY (0.57 INR/JPY)
  AUD: 0.0178, // 1 INR = ~0.0178 AUD (56.2 INR/AUD)
  CAD: 0.0159, // 1 INR = ~0.0159 CAD (62.8 INR/CAD)
  SGD: 0.0154, // 1 INR = ~0.0154 SGD (64.9 INR/SGD)
  AED: 0.0425, // 1 INR = ~0.0425 AED (23.5 INR/AED)
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'AED ',
};

let memoryCache: ExchangeRateData | null = null;

/**
 * Fetch live exchange rates with INR as base from Frankfurter API
 */
export async function fetchLiveExchangeRates(): Promise<ExchangeRateData> {
  // Check memory cache first
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache;
  }

  // Check localStorage cache
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed: ExchangeRateData = JSON.parse(stored);
        if (now - parsed.timestamp < CACHE_TTL_MS) {
          memoryCache = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // ignore
  }

  // Fetch live rates from Frankfurter API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=INR,EUR,GBP,JPY,AUD,CAD,SGD',
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const inrPerUsd = data.rates?.INR || 86.5;
      const eurPerUsd = data.rates?.EUR || 0.92;
      const gbpPerUsd = data.rates?.GBP || 0.79;
      const jpyPerUsd = data.rates?.JPY || 152.0;
      const audPerUsd = data.rates?.AUD || 1.54;
      const cadPerUsd = data.rates?.CAD || 1.39;
      const sgdPerUsd = data.rates?.SGD || 1.34;
      const aedPerUsd = 3.6725; // pegged to USD

      // Calculate rates relative to 1 INR:
      const rates: Record<CurrencyCode, number> = {
        INR: 1,
        USD: Number((1 / inrPerUsd).toFixed(6)),
        EUR: Number((eurPerUsd / inrPerUsd).toFixed(6)),
        GBP: Number((gbpPerUsd / inrPerUsd).toFixed(6)),
        JPY: Number((jpyPerUsd / inrPerUsd).toFixed(4)),
        AUD: Number((audPerUsd / inrPerUsd).toFixed(6)),
        CAD: Number((cadPerUsd / inrPerUsd).toFixed(6)),
        SGD: Number((sgdPerUsd / inrPerUsd).toFixed(6)),
        AED: Number((aedPerUsd / inrPerUsd).toFixed(6)),
      };

      const result: ExchangeRateData = {
        base: 'INR',
        rates,
        timestamp: now,
        lastUpdatedStr: new Date(data.date || now).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        source: 'live',
      };

      memoryCache = result;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(result));
        } catch {
          // ignore
        }
      }

      return result;
    }
  } catch (err) {
    console.warn('[Currency] Live rates fetch failed, checking cache or baseline:', err);
  }

  // Fallback to cached if expired, otherwise baseline
  if (memoryCache) {
    return { ...memoryCache, source: 'cached' };
  }

  const fallback: ExchangeRateData = {
    base: 'INR',
    rates: BASELINE_RATES,
    timestamp: now,
    lastUpdatedStr: 'Market Baseline (Offline)',
    source: 'fallback',
  };

  memoryCache = fallback;
  return fallback;
}

/**
 * Get direct conversion multiplier between any two supported currencies
 */
export function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode,
  ratesData?: ExchangeRateData
): number {
  if (from === to) return 1;

  const rates = ratesData?.rates || memoryCache?.rates || BASELINE_RATES;
  const fromRateToINR = rates[from] || 1; // 1 INR in `from` currency
  const toRateToINR = rates[to] || 1; // 1 INR in `to` currency

  return toRateToINR / fromRateToINR;
}

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  ratesData?: ExchangeRateData
): number {
  if (isNaN(amount) || amount === 0) return 0;
  if (from === to) return Math.round(amount);

  const rate = getExchangeRate(from, to, ratesData);
  const converted = amount * rate;
  return to === 'INR' || to === 'JPY' ? Math.round(converted) : Number(converted.toFixed(2));
}

/**
 * Format an amount that has ALREADY been converted into target currency
 */
export function formatRawCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  const sym = CURRENCY_SYMBOLS[currency] || '₹';
  const val = currency === 'INR' || currency === 'JPY' ? Math.round(amount) : Number(amount.toFixed(2));

  if (currency === 'INR') {
    if (compact) {
      if (Math.abs(val) >= 10000000) {
        return `${sym}${(val / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(val) >= 100000) {
        return `${sym}${(val / 100000).toFixed(2)} L`;
      }
      if (Math.abs(val) >= 1000) {
        return `${sym}${(val / 1000).toFixed(1)}k`;
      }
    }

    // Indian comma separation (e.g. 1,23,456)
    const isNeg = val < 0;
    const absStr = Math.abs(Math.round(val)).toString();
    if (absStr.length <= 3) {
      return `${isNeg ? '-' : ''}${sym}${absStr}`;
    }
    const last3 = absStr.substring(absStr.length - 3);
    const rest = absStr.substring(0, absStr.length - 3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    return `${isNeg ? '-' : ''}${sym}${formatted}`;
  }

  if (compact) {
    if (Math.abs(val) >= 1000000) {
      return `${sym}${(val / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1000) {
      return `${sym}${(val / 1000).toFixed(1)}k`;
    }
  }

  const isWhole = currency === 'JPY' || Number.isInteger(val);
  const formattedVal = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  });

  return `${val < 0 ? '-' : ''}${sym}${formattedVal}`;
}

/**
 * Format currency: Automatically converts base INR amount into target currency
 * and applies proper locale formatting!
 */
export function formatCurrencyAmount(
  amountInINR: number,
  targetCurrency: CurrencyCode = 'INR',
  compact: boolean = false,
  isAlreadyConverted: boolean = false
): string {
  if (isAlreadyConverted || targetCurrency === 'INR') {
    return formatRawCurrency(amountInINR, targetCurrency, compact);
  }

  const converted = convertCurrency(amountInINR, 'INR', targetCurrency);
  return formatRawCurrency(converted, targetCurrency, compact);
}
