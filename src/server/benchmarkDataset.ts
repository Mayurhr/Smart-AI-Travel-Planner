/**
 * Smart AI Travel Planner 3.0 — Academic Research Benchmark Dataset
 * Fixed, Reproducible Test Scenarios for Single-Agent vs Multi-Agent Comparative Evaluation
 */

import { TripGenerationInput } from './agents/multiAgentBaseline';

export interface BenchmarkScenario {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'simple_domestic' | 'multi_day_luxury' | 'strict_budget' | 'multimodal_transit' | 'missing_preferences' | 'resilience_fallback' | 'dedup_stress' | 'group_family' | 'malformed_input';
  input: TripGenerationInput;
  expectedDays: number;
  expectedTravelers: number;
  expectedBudgetCap: number;
  evaluationCriteria: string[];
}

export const BENCHMARK_SCENARIOS: BenchmarkScenario[] = [
  {
    id: 'tc-01-domestic',
    code: 'TC-01',
    name: 'Simple 2-Day Domestic Weekend',
    description: 'Short weekend trip across regional corridor with standard budget pacing and light sightseeing.',
    category: 'simple_domestic',
    input: {
      origin: 'Shivamogga, India',
      destination: 'Goa, India',
      durationDays: 2,
      travelersCount: 2,
      style: 'budget',
      tripType: 'round_trip',
      maxBudget: 12000,
      currency: 'INR',
      interests: ['Beaches', 'Seafood', 'Coastal Forts'],
    },
    expectedDays: 2,
    expectedTravelers: 2,
    expectedBudgetCap: 12000,
    evaluationCriteria: [
      'Low orchestration overhead',
      'Accurate regional distance calculation (~350 km)',
      'Budget feasibility within ₹12,000 cap',
    ],
  },
  {
    id: 'tc-02-luxury-multiday',
    code: 'TC-02',
    name: 'Multi-Day Long-Haul Coastal Odyssey',
    description: 'Week-long comprehensive journey requiring multi-modal coordination, luxury boutique lodging, and scenic marine activities.',
    category: 'multi_day_luxury',
    input: {
      origin: 'Zurich, Switzerland',
      destination: 'Positano, Amalfi Coast, Italy',
      durationDays: 7,
      travelersCount: 2,
      style: 'luxury',
      tripType: 'round_trip',
      maxBudget: 280000,
      currency: 'INR',
      interests: ['Scenic Coastlines', 'Historic Villas', 'Gastronomy', 'Riva Boat Tours'],
    },
    expectedDays: 7,
    expectedTravelers: 2,
    expectedBudgetCap: 280000,
    evaluationCriteria: [
      'Parallel co-routine scaling across 7 days',
      'International transit corridor evaluation',
      'High-tier boutique sanctuary curation',
    ],
  },
  {
    id: 'tc-03-strict-budget',
    code: 'TC-03',
    name: 'Strict Budget-Constrained Trip',
    description: 'High financial pressure test with very tight ₹5,000 cap. Verifies deterministic arithmetic and honest deficit detection without hallucination.',
    category: 'strict_budget',
    input: {
      origin: 'Bengaluru, India',
      destination: 'Mysuru, India',
      durationDays: 3,
      travelersCount: 2,
      style: 'budget',
      tripType: 'round_trip',
      maxBudget: 5000,
      currency: 'INR',
      interests: ['Mysore Palace', 'Local Markets', 'Heritage Walk'],
    },
    expectedDays: 3,
    expectedTravelers: 2,
    expectedBudgetCap: 5000,
    evaluationCriteria: [
      'Deterministic arithmetic without floating point drift',
      'Realistic cost floor enforcement (Rail/Bus + Homestay)',
      'Accurate deficit/surplus advisory output',
    ],
  },
  {
    id: 'tc-04-multimodal-transit',
    code: 'TC-04',
    name: 'Multi-Modal Corridors & Flight Arbitrage',
    description: 'Round-trip transit corridor requiring independent outbound and return flight/rail/bus comparison.',
    category: 'multimodal_transit',
    input: {
      origin: 'Delhi, India',
      destination: 'Jaipur, India',
      durationDays: 4,
      travelersCount: 2,
      style: 'balanced',
      tripType: 'round_trip',
      maxBudget: 25000,
      currency: 'INR',
      cabinClass: 'economy',
      interests: ['Amer Fort', 'Hawa Mahal', 'Local Bazaars', 'Rajasthani Thali'],
    },
    expectedDays: 4,
    expectedTravelers: 2,
    expectedBudgetCap: 25000,
    evaluationCriteria: [
      'Independent outbound & return transit booking links',
      'Commercial flight vs rail/bus comparison',
      'Zero cross-leg origin/destination confusion',
    ],
  },
  {
    id: 'tc-05-edge-preferences',
    code: 'TC-05',
    name: 'Edge Case: Incomplete & Ambiguous Input',
    description: 'Robustness check with missing origin, unspecified budget, and no explicit style. Evaluates graceful default attribution.',
    category: 'missing_preferences',
    input: {
      destination: 'Goa, India',
      // Origin omitted intentionally
      // Duration omitted intentionally
      // Budget omitted intentionally
    },
    expectedDays: 4,
    expectedTravelers: 2,
    expectedBudgetCap: 12000,
    evaluationCriteria: [
      'Robust fallback attribution without process crash',
      'Default duration (4 days) and traveler count (2) applied',
      'Valid structured TripPlan returned',
    ],
  },
  {
    id: 'tc-06-resilience-fallback',
    code: 'TC-06',
    name: 'Resilience & Offline Cache Fallback',
    description: 'Tests autonomous fallback when external models or gateways experience latency or disconnection.',
    category: 'resilience_fallback',
    input: {
      origin: 'Shivamogga, India',
      destination: 'Goa, India',
      durationDays: 3,
      travelersCount: 2,
      style: 'budget',
      maxBudget: 15000,
      currency: 'INR',
      interests: ['Nature', 'Beaches'],
    },
    expectedDays: 3,
    expectedTravelers: 2,
    expectedBudgetCap: 15000,
    evaluationCriteria: [
      'Recovery from network or LLM timeout',
      'Curated offline knowledge base lookup',
      '100% completion rate without uncaught exceptions',
    ],
  },
  {
    id: 'tc-07-dedup-stress',
    code: 'TC-07',
    name: 'High-Density Deduplication Challenge',
    description: 'Multi-day itinerary with many candidate sights prone to repetition. Tests hash-set duplicate removal algorithm.',
    category: 'dedup_stress',
    input: {
      origin: 'Bengaluru, India',
      destination: 'Goa, India',
      durationDays: 6,
      travelersCount: 2,
      style: 'balanced',
      tripType: 'round_trip',
      maxBudget: 45000,
      currency: 'INR',
      interests: ['Fort Aguada', 'Anjuna', 'Baga', 'Old Goa', 'Dudhsagar'],
    },
    expectedDays: 6,
    expectedTravelers: 2,
    expectedBudgetCap: 45000,
    evaluationCriteria: [
      '100% unique attractions across all 6 days (0 duplicate place names)',
      'Chronological date continuity',
      'Balanced distribution of morning and twilight slots',
    ],
  },
  {
    id: 'tc-08-group-family',
    code: 'TC-08',
    name: 'Group / Family Multi-Guest Itinerary',
    description: 'Larger traveling party (6 guests) requiring multi-room accommodation allocation and scaled dining/transit budgets.',
    category: 'group_family',
    input: {
      origin: 'Zurich, Switzerland',
      destination: 'Paris, France',
      durationDays: 5,
      travelersCount: 6,
      style: 'family',
      tripType: 'round_trip',
      maxBudget: 220000,
      currency: 'INR',
      interests: ['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise', 'Montmartre'],
    },
    expectedDays: 5,
    expectedTravelers: 6,
    expectedBudgetCap: 220000,
    evaluationCriteria: [
      'Multi-room accommodation arithmetic (3 rooms for 6 guests)',
      'Budget scaling per-traveler outlay',
      'Family-friendly pacing and activity selection',
    ],
  },
  {
    id: 'tc-09-multidestination',
    code: 'TC-09',
    name: 'Multi-Destination Regional Route & Inter-City Transit',
    description: 'Complex multi-hop journey connecting Rome, Florence, and Venice with high-speed rail transfers and inter-city hotel rotations.',
    category: 'multimodal_transit',
    input: {
      origin: 'Rome, Italy',
      destination: 'Florence & Venice, Italy',
      durationDays: 6,
      travelersCount: 2,
      style: 'balanced',
      tripType: 'round_trip',
      maxBudget: 180000,
      currency: 'INR',
      interests: ['Colosseum', 'Uffizi Gallery', 'Grand Canal', 'Tuscan Gastronomy'],
    },
    expectedDays: 6,
    expectedTravelers: 2,
    expectedBudgetCap: 180000,
    evaluationCriteria: [
      'Inter-city rail transfer coordination across 3 regional hubs',
      'Geographic sequence validation (Rome -> Florence -> Venice)',
      'Budget reconciliation across multiple accommodation legs',
    ],
  },
  {
    id: 'tc-10-malformed-input',
    code: 'TC-10',
    name: 'Malformed, Out-of-Bounds & Empty Input',
    description: 'Empty destination string, negative budget cap (-5000), and invalid duration (0 days). Evaluates sanitization, defensive default normalization, and resilient recovery without system failure.',
    category: 'malformed_input',
    input: {
      destination: '',
      origin: '',
      durationDays: 0,
      travelersCount: -1,
      maxBudget: -5000,
      currency: 'INR',
    },
    expectedDays: 4,
    expectedTravelers: 2,
    expectedBudgetCap: 12000,
    evaluationCriteria: [
      'Defensive input sanitization and boundary correction',
      'Fallback to valid default destination and origin',
      'Graceful error recovery without unhandled exception or process termination',
    ],
  },
];
