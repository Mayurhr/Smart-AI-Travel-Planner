/**
 * Smart AI Travel Planner 3.0
 * Comprehensive Agent Center Evaluation & Observability Types
 */

import { CurrencyCode, TravelStyle } from './travel';

export interface AlgorithmComplexityReport {
  algorithmId: string;
  name: string;
  category: 'itinerary' | 'budget' | 'transport' | 'spatial' | 'validation';
  sourceFile: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityClassification: 'Code Inspection & Algorithmic Analysis' | 'Theoretical Estimate';
  inputSizeLabel: string;
  inputSizeValue: number | string;
  explanation: string;
  auxiliarySpaceExplanation: string;
  externalCallsLatencyMs?: number;
}

export interface PeakRamTelemetry {
  baselineRssMb: number;
  peakRssMb: number;
  heapTotalMb: number;
  heapUsedMb: number;
  afterCompletionRssMb: number;
  externalMb: number;
  arrayBuffersMb: number;
  measurementDurationMs: number;
  samplingMethod: 'Continuous Process Profiling (Max Observed Sample)' | 'Single Snapshot';
  scope: string;
}

export interface CpuTelemetry {
  cpuUtilizationPercent: number | null;
  status: 'measured' | 'unavailable';
  measurementWindowMs: number;
  processScope: string;
  workflowBeingMeasured: string;
  userCpuMs: number;
  systemCpuMs: number;
  coreCount: number;
  unavailableReason?: string;
}

export interface NetworkServicePing {
  serviceName: string;
  endpoint: string;
  serviceType: 'Internal API' | 'External Provider' | 'Data Gateway';
  latencyMs: number;
  httpStatus: number;
  success: boolean;
  timestamp: string;
  method: 'HTTP GET' | 'HTTP HEAD' | 'In-Process Loopback';
  protocol: 'HTTP Application Latency (Not ICMP Ping)';
  p50Ms: number;
  p95Ms: number;
  samplesCount: number;
  history: number[];
  errorMessage?: string;
}

export interface NetworkLatencyReport {
  measuredAt: string;
  services: NetworkServicePing[];
  overallAvgLatencyMs: number;
  protocolNotice: string;
}

export interface QualityComponentScore {
  name: string;
  weightPercent: number;
  score: number;
  maxScore: number;
  evidence: string;
  deductions: string[];
}

export interface ItineraryQualityScoreReport {
  overallScore: number;
  scoreTier: 'Exceptional (90-100)' | 'Good (75-89)' | 'Moderate (60-74)' | 'Needs Attention (<60)';
  formulaDocumentation: string;
  components: {
    completeness: QualityComponentScore;
    relevance: QualityComponentScore;
    scheduleFeasibility: QualityComponentScore;
    informationConsistency: QualityComponentScore;
    attractionDiversity: QualityComponentScore;
    budgetFeasibility: QualityComponentScore;
    preferenceAlignment: QualityComponentScore;
  };
  missingOrUnverifiedInformation: string[];
  actionableImprovementSuggestions: string[];
}

export interface BudgetOptimizationEvaluation {
  userBudget: number;
  currency: CurrencyCode;
  estimatedTripTotal: number;
  budgetRemainingOrShortfall: number;
  budgetUtilizationPercent: number;
  costPerTraveler: number;
  travelersCount: number;
  isFeasible: boolean;
  satisfiesBudgetConstraint: boolean;
  feasibilityStatusText: string;
  baselineComparison?: {
    baselineTripCost: number;
    costDifference: number;
    percentSaved: number;
    detailsChanged: string;
  };
  constraintsChecklist: {
    transportAllocated: boolean;
    accommodationAllocated: boolean;
    diningAllocated: boolean;
    attractionsAllocated: boolean;
    contingencyReserveAllocated: boolean;
  };
  limitationsAndNotes: string[];
}

export interface OperationalMetrics {
  timeToFirstResponseMs: number;
  ttfrDefinition: string;
  throughputPerMinute: number;
  throughputWindowLabel: string;
  totalWorkflowsCount: number;
  informationConsistencyPercent: number;
  consistencyDenominator: string;
  consistencyChecks: {
    datesConsistent: boolean;
    destinationsMatch: boolean;
    transportCorridorsAligned: boolean;
    budgetItemsSumMatchesCommitted: boolean;
    currencyUniform: boolean;
    travelersCountConsistent: boolean;
  };
  failureRecoveryRatePercent: number;
  failureRecoveryDenominator: string;
  recoveryLog: {
    totalOperations: number;
    failedOperations: number;
    successfulRecoveries: number;
    fallbacksTriggered: number;
  };
}

export interface AgentExecutionTiming {
  agentId: string;
  agentCode: string;
  name: string;
  role: string;
  status: 'completed' | 'running' | 'failed' | 'not_executed';
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  retries: number;
  inputSize: string;
  isParallel: boolean;
  criticalPath: boolean;
  icon: string;
  recentActivity: string;
}

export interface WorkflowEvaluationData {
  workflowId: string;
  workflowName: string;
  destination: string;
  origin: string;
  style: TravelStyle;
  travelersCount: number;
  timestamp: string;
  wallClockDurationMs: number;
  criticalPathDurationMs: number;
  sumOfAgentDurationsMs: number;
  agents: AgentExecutionTiming[];
  algorithmsComplexity: AlgorithmComplexityReport[];
  cpuUtilization: CpuTelemetry;
  peakRamUsage: PeakRamTelemetry;
  networkLatency: NetworkLatencyReport;
  budgetOptimization: BudgetOptimizationEvaluation;
  itineraryQuality: ItineraryQualityScoreReport;
  operationalMetrics: OperationalMetrics;
}
