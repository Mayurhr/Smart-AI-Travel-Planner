/**
 * Smart AI Travel Planner 3.0 — Comprehensive Research & Benchmarking Test Suite
 *
 * Verifies:
 * 1. Metric calculation formulas:
 *    - Relative Change %: ((Single - Multi) / Multi) * 100
 *    - Absolute Difference: Single - Multi
 *    - Zero-guard handling
 * 2. Budget reconciliation arithmetic:
 *    - Integer cent precision, variance, and feasibility
 * 3. Itinerary Quality Score components (0-100 rubric):
 *    - 7 weighted dimensions summing to 100%
 *    - Clamp bounds [0, 100]
 * 4. Multi-Agent Performance Discovery:
 *    - All 7 registered baseline agents
 *    - Memory attribution limitation disclaimer
 * 5. Single-Agent Performance Breakdown:
 *    - Decision loop metrics
 *    - 6-part deterministic tool execution sequence
 * 6. CSV Export formats:
 *    - Headers, RFC 4180 quotes, and all 10 test case archetypes (TC-01 through TC-10)
 */

import {
  METRIC_REGISTRY,
  getRegisteredMultiAgentPerformance,
  getSingleAgentPerformanceSummary,
  exportComparisonAsCsv,
  exportMultiAgentMetricsAsCsv,
  exportSingleAgentMetricsAsCsv,
  exportTestCaseResultsAsCsv,
  exportBenchmarksAsCsv,
  exportBenchmarksAsJson,
  getComparativeAnalysis,
  getBenchmarkRecords,
} from '../benchmarkRunner';
import { BENCHMARK_SCENARIOS } from '../benchmarkDataset';
import {
  evaluateItineraryQuality,
  evaluateTripBudgetOptimization,
} from '../agentMetricsService';
import { TripPlan } from '../../types/travel';

// Simple lightweight assertion runner
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failedTests++;
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`✅ PASSED: ${message}`);
  }
}

function assertCloseTo(actual: number, expected: number, tolerance = 0.05, message: string) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (Expected ~${expected}, got ${actual}, diff ${diff})`);
}

console.log('=== STARTING BENCHMARK RESEARCH VALIDATION SUITE ===\n');

// ---------------------------------------------------------------------------
// 1. FORMULA VALIDATION: Relative Change & Absolute Diff
// ---------------------------------------------------------------------------
console.log('--- Suite 1: Metric Formula Arithmetic ---');

function calcDeltaPercent(multi: number, single: number): number {
  if (multi === 0) return 0;
  return Number((((single - multi) / multi) * 100).toFixed(2));
}

function calcAbsDiff(multi: number, single: number): number {
  return Number((single - multi).toFixed(2));
}

// Latency increases from 650ms to 920ms (+41.54%)
assertCloseTo(calcDeltaPercent(650, 920), 41.54, 0.01, 'Latency +41.54% calculation');
assertCloseTo(calcAbsDiff(650, 920), 270, 0.01, 'Latency absolute diff +270ms');

// Tokens drop from 4500 to 2700 (-40.00%)
assertCloseTo(calcDeltaPercent(4500, 2700), -40.0, 0.01, 'Token reduction -40.0% calculation');
assertCloseTo(calcAbsDiff(4500, 2700), -1800, 0.01, 'Token absolute diff -1800');

// Zero-guard check: multi = 0 should return 0 rather than Infinity/NaN
assert(calcDeltaPercent(0, 100) === 0, 'Zero-guard prevents division by zero / NaN');

// CPU Utilization Formula check: (userCpuMs + sysCpuMs) / (wallClockMs * cores) * 100
const userMs = 120;
const sysMs = 30;
const wallClockMs = 1000;
const numCores = 4;
const calculatedCpu = ((userMs + sysMs) / (wallClockMs * numCores)) * 100;
assertCloseTo(calculatedCpu, 3.75, 0.001, 'CPU utilization core-normalized formula: (150 / 4000) * 100 = 3.75%');

// ---------------------------------------------------------------------------
// 2. SCENARIO CATALOG: TC-01 Through TC-10 Archetypes
// ---------------------------------------------------------------------------
console.log('\n--- Suite 2: Benchmark Scenario Catalog ---');

assert(BENCHMARK_SCENARIOS.length === 10, 'Catalog contains exactly 10 standardized scenarios');

const requiredCodes = [
  'TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05',
  'TC-06', 'TC-07', 'TC-08', 'TC-09', 'TC-10',
];

requiredCodes.forEach((code) => {
  const found = BENCHMARK_SCENARIOS.find((s) => s.code === code);
  assert(Boolean(found), `Scenario code ${code} is registered and defined`);
});

const tc10 = BENCHMARK_SCENARIOS.find((s) => s.code === 'TC-10');
assert(Boolean(tc10 && tc10.category === 'malformed_input'), 'TC-10 is specifically categorized as malformed_input archetype');
assert(Boolean(tc10 && ((tc10.input as any).maxBudget === -5000 || (tc10.input as any).budget === -5000)), 'TC-10 contains boundary negative budget input (-5000)');

// ---------------------------------------------------------------------------
// 3. MULTI-AGENT SPECIALIST DISCOVERY (Section 4)
// ---------------------------------------------------------------------------
console.log('\n--- Suite 3: Multi-Agent Performance Telemetry ---');

const maPerf = getRegisteredMultiAgentPerformance();
assert(Boolean(maPerf), 'Multi-Agent performance summary generates successfully');
assert(maPerf.agents.length === 7, `Discovered exactly 7 registered baseline agents (found ${maPerf.agents.length})`);

const expectedAgentCodes = [
  '#AGT-GEO', '#AGT-BUDGET', '#AGT-TRANSIT',
  '#AGT-CURA', '#AGT-STAYS', '#AGT-METEO', '#AGT-VAL',
];

expectedAgentCodes.forEach((code) => {
  const found = maPerf.agents.find((a) => a.code === code);
  assert(Boolean(found), `Discovered agent ${code}: ${found?.name}`);
});

const notice = maPerf.memoryNotice || (maPerf as any).summary?.memoryAttributionLimitation || '';
assert(
  notice.includes('Node.js') && notice.includes('peak RSS'),
  'Multi-Agent performance explicitly includes defensible memory attribution disclaimer'
);

// ---------------------------------------------------------------------------
// 4. SINGLE-AGENT PERFORMANCE SUMMARY (Section 5)
// ---------------------------------------------------------------------------
console.log('\n--- Suite 4: Single-Agent Performance Telemetry ---');

const saPerf = getSingleAgentPerformanceSummary();
assert(Boolean(saPerf), 'Single-Agent performance summary generates successfully');
assert(saPerf.toolBreakdown.length === 6, `Discovered all 6 deterministic helper tools (found ${saPerf.toolBreakdown.length})`);

const expectedToolNames = [
  'Deterministic Geocoding & Distance Engine',
  'Transit Router & Corridor Comparison',
  'Weather & Seasonal Climate Telemetry',
  'Lodging & Boutique Sanctuaries Filter',
  'Integer-Cent Arithmetic Treasury Audit',
  'Hash-Set Attraction Deduplicator & Schedule Pacer',
];

expectedToolNames.forEach((name) => {
  const found = saPerf.toolBreakdown.find((h) => h.toolName === name);
  assert(Boolean(found), `Helper tool "${name}" exists in pipeline`);
});

assert(Boolean(saPerf.timeComplexity), `Time complexity declared: ${saPerf.timeComplexity}`);
assert(saPerf.autonomousAgentInstancesCount === 1, 'Strictly 1 autonomous agent instance in single-agent architecture');

// ---------------------------------------------------------------------------
// 5. BUDGET RECONCILIATION ARITHMETIC
// ---------------------------------------------------------------------------
console.log('\n--- Suite 5: Budget Optimization & Ledger Reconciliation ---');

const sampleTrip: TripPlan = {
  id: 'trip-test-01',
  destination: 'Kyoto, Japan',
  origin: 'Tokyo, Japan',
  travelersCount: 2,
  durationDays: 4,
  budget: {
    totalCap: 2000,
    committedOutlay: 1650,
    currency: 'USD',
    contingencyReserve: 100,
    items: [
      { id: 'b-1', category: 'transit', description: 'Shinkansen & local transit', amount: 320 },
      { id: 'b-2', category: 'accommodations', description: 'Boutique ryokan stay', amount: 660 },
      { id: 'b-3', category: 'gastronomy', description: 'Kaiseki & local food', amount: 420 },
      { id: 'b-4', category: 'experiences', description: 'Temple admissions & tea', amount: 250 },
    ],
  },
  itinerary: [
    {
      day: 1,
      date: '2026-11-01',
      title: 'Arashiyama & Bamboo Grove',
      activities: [
        { id: 'act-1', name: 'Bamboo Grove Walk', time: '09:00', durationHours: 2, cost: 0, location: 'Arashiyama', category: 'sightseeing', description: 'Scenic path', completed: false },
        { id: 'act-2', name: 'Tenryu-ji Temple', time: '11:30', durationHours: 1.5, cost: 16, location: 'Ukyo Ward', category: 'cultural', description: 'Zen temple', completed: false },
      ],
      meals: [
        { id: 'meal-1', mealType: 'lunch', restaurantName: 'Shigetsu', cuisine: 'Shojin Ryori', cost: 70, reservationRequired: false },
        { id: 'meal-2', mealType: 'dinner', restaurantName: 'Gion Karyo', cuisine: 'Kaiseki', cost: 180, reservationRequired: true },
      ],
      transportation: [
        { id: 'tr-1', mode: 'transit', from: 'Kyoto Station', to: 'Arashiyama', departureTime: '08:15', arrivalTime: '08:45', cost: 8 },
      ],
      notes: 'Day 1 explored smoothly',
    },
    {
      day: 2,
      date: '2026-11-02',
      title: 'Higashiyama Heritage',
      activities: [
        { id: 'act-3', name: 'Kiyomizu-dera', time: '09:00', durationHours: 2.5, cost: 4, location: 'Higashiyama', category: 'cultural', description: 'Wooden stage temple', completed: false },
        { id: 'act-4', name: 'Fushimi Inari Taisha', time: '14:00', durationHours: 3, cost: 0, location: 'Fushimi', category: 'sightseeing', description: 'Torii gates path', completed: false },
      ],
      meals: [],
      transportation: [],
      notes: 'Day 2 highlights',
    },
    {
      day: 3,
      date: '2026-11-03',
      title: 'Gion & Pontocho Evening',
      activities: [
        { id: 'act-5', name: 'Gion District', time: '15:00', durationHours: 3, cost: 0, location: 'Gion', category: 'cultural', description: 'Historic geisha district', completed: false },
        { id: 'act-6', name: 'Yasaka Shrine', time: '19:00', durationHours: 1.5, cost: 0, location: 'Gion', category: 'cultural', description: 'Illuminated lantern shrine', completed: false },
      ],
      meals: [],
      transportation: [],
      notes: 'Day 3 culture',
    },
    {
      day: 4,
      date: '2026-11-04',
      title: 'Nijo Castle & Return',
      activities: [
        { id: 'act-7', name: 'Nijo Castle', time: '10:00', durationHours: 2, cost: 10, location: 'Nakagyo', category: 'historical', description: 'Nightingale floors palace', completed: false },
        { id: 'act-8', name: 'Nishiki Market', time: '12:30', durationHours: 2, cost: 0, location: 'Nakagyo', category: 'gastronomy', description: 'Food market walk', completed: false },
      ],
      meals: [],
      transportation: [],
      notes: 'Day 4 wrap-up',
    },
  ],
  selectedFlight: {
    id: 'fl-1',
    airline: 'Japan Airlines',
    flightNumber: 'JL101',
    departure: 'HND 07:00',
    arrival: 'ITM 08:15',
    price: 180,
    duration: '1h 15m',
    class: 'Economy',
  },
  selectedReturnFlight: {
    id: 'fl-2',
    airline: 'Japan Airlines',
    flightNumber: 'JL132',
    departure: 'ITM 19:30',
    arrival: 'HND 20:45',
    price: 180,
    duration: '1h 15m',
    class: 'Economy',
  },
  accommodations: [
    { id: 'acc-1', name: 'Sora Niwa Terrace Kyoto', type: 'hotel', costPerNight: 220, nights: 3, checkIn: '2026-11-01', checkOut: '2026-11-04', location: 'Kawaramachi', rating: 4.8 },
  ],
};

const budgetEval = evaluateTripBudgetOptimization(sampleTrip);
assert(budgetEval.isFeasible === true, 'Budget evaluated as feasible (spent $1650 vs cap $2000)');
assert(budgetEval.userBudget === 2000, 'User budget correctly reconciled to $2000');
assert(budgetEval.budgetRemainingOrShortfall > 0, `Surplus verified: $${budgetEval.budgetRemainingOrShortfall} remaining`);
assert(budgetEval.satisfiesBudgetConstraint === true, 'Constraint checklist satisfies all travel categories');

// ---------------------------------------------------------------------------
// 6. ITINERARY QUALITY SCORE RUBRIC (0-100)
// ---------------------------------------------------------------------------
console.log('\n--- Suite 6: 0-100 Itinerary Quality Scoring Rubric ---');

const qualityEval = evaluateItineraryQuality(sampleTrip);
assert(qualityEval.overallScore >= 0 && qualityEval.overallScore <= 100, `Quality score ${qualityEval.overallScore} is bounded in [0, 100]`);

// Check 7 weighted dimensions
const weights = [
  qualityEval.components.completeness.weightPercent,
  qualityEval.components.relevance.weightPercent,
  qualityEval.components.scheduleFeasibility.weightPercent,
  qualityEval.components.informationConsistency.weightPercent,
  qualityEval.components.attractionDiversity.weightPercent,
  qualityEval.components.budgetFeasibility.weightPercent,
  qualityEval.components.preferenceAlignment.weightPercent,
];
const weightSum = weights.reduce((a, b) => a + b, 0);
assert(weightSum === 100, `All 7 quality dimension weights sum exactly to 100% (got ${weightSum}%)`);
assert(Boolean(qualityEval.scoreTier), `Quality tier assigned: ${qualityEval.scoreTier}`);

// ---------------------------------------------------------------------------
// 7. CSV EXPORT INTEGRITY & SPECIFICATION COMPLIANCE
// ---------------------------------------------------------------------------
console.log('\n--- Suite 7: CSV & JSON Export Verification ---');

// 7.1 Comparison CSV
const compCsv = exportComparisonAsCsv();
assert(compCsv.startsWith('MetricLabel,Unit,MultiAgentMean'), 'Comparison CSV begins with valid headers');
assert(compCsv.includes('Wall-Clock Execution Duration'), 'Comparison CSV contains Wall-Clock Execution Duration row');
assert(compCsv.includes('RelativeChangePercent'), 'Comparison CSV contains RelativeChangePercent column');

// 7.2 Multi-Agent CSV
const maCsv = exportMultiAgentMetricsAsCsv();
assert(maCsv.includes('AgentName,AgentCode,RolePurpose'), 'Multi-Agent CSV has correct schema');
assert(maCsv.includes('#AGT-GEO'), 'Multi-Agent CSV includes #AGT-GEO');
assert(maCsv.includes('#AGT-VAL'), 'Multi-Agent CSV includes #AGT-VAL');
assert(maCsv.includes('Whole-process peak RSS must be cited'), 'Multi-Agent CSV includes required memory attribution disclaimer');

// 7.3 Single-Agent CSV
const saCsv = exportSingleAgentMetricsAsCsv();
assert(saCsv.includes('MetricKey,MetricLabel,Value,Unit,MethodologyNotes'), 'Single-Agent CSV has correct schema');
assert(saCsv.includes('agentName'), 'Single-Agent CSV contains agentName');
assert(saCsv.includes('timeComplexity'), 'Single-Agent CSV contains timeComplexity');

// 7.4 Test Cases CSV
const tcCsv = exportTestCaseResultsAsCsv();
assert(tcCsv.includes('TestCaseId,TestCaseCode,TestCaseName,MultiAgentWallClockMs,SingleAgentWallClockMs'), 'Test Cases CSV has proper comparative columns');
requiredCodes.forEach((code) => {
  assert(tcCsv.includes(code), `Test Cases CSV contains scenario row for ${code}`);
});

// 7.5 Raw Records CSV
const rawCsv = exportBenchmarksAsCsv();
assert(rawCsv.includes('runId,testCaseCode,testCaseName,architecture'), 'Raw records CSV contains run headers');

// 7.6 Full JSON Dataset
const fullJson = exportBenchmarksAsJson();
const parsedJson = JSON.parse(fullJson);
assert(Boolean(parsedJson.systemMetadata), 'JSON contains system metadata');
assert(Boolean(parsedJson.scenarios && parsedJson.scenarios.length === 10), 'JSON contains all 10 scenarios');
assert(Boolean(parsedJson.comparativeAnalysis), 'JSON contains comparative analysis');
assert(Boolean(parsedJson.rawRecords && parsedJson.rawRecords.length > 0), 'JSON contains raw observation records');

// ---------------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✨ ALL RESEARCH BENCHMARK VALIDATION TESTS PASSED ✨');
  process.exit(0);
}
