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

export interface AlgorithmComparisonRecord {
  domain: string;
  task: string;
  multiAgentAlgorithm: string;
  multiAgentSourceFile: string;
  multiAgentTimeComplexity: string;
  multiAgentSpaceComplexity: string;
  singleAgentAlgorithm: string;
  singleAgentSourceFile: string;
  singleAgentTimeComplexity: string;
  singleAgentSpaceComplexity: string;
  inputVariables: string;
  bestCaseExplanation: string;
  worstCaseExplanation: string;
  structuralDifferenceNotes: string;
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
  lineItemTotals?: {
    transport: number;
    accommodation: number;
    dining: number;
    activities: number;
    contingencyReserve: number;
    arithmeticSum: number;
    reportedTotal: number;
    arithmeticDiscrepancy: number;
    reconcilesCleanly: boolean;
  };
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

export interface MultiAgentSpecificMetrics {
  autonomousAgentsInvokedCount: number;
  agentInvocationsCount: number;
  individualAgentDurations: { agentName: string; durationMs: number; isParallel: boolean }[];
  sumOfMeasuredAgentDurationsMs: number;
  parallelOverlapMs: number;
  concurrencyRatio: number;
  sequentialStagesCount: number;
  parallelStagesCount: number;
  orchestrationOverheadMs: number;
  orchestrationOverheadMethod: string;
  interAgentMessagesCount: number;
  criticalPathDurationMs: number;
  failedAgentRunsCount: number;
  agentRecoveryAttemptsCount: number;
}

export interface SingleAgentSpecificMetrics {
  autonomousAgentInstancesCount: number;
  agentExecutionLoopIterationsCount: number;
  modelRequestsCount: number;
  toolCallsCount: number;
  toolCallsDurationMs: number;
  cumulativeSingleAgentDurationMs: number;
  promptTokensCount: number;
  outputTokensCount: number;
  totalTokensCount: number;
  estimatedInferenceCostUsd: number;
  validationPassesCount: number;
  validationRetriesCount: number;
  timeSpentWaitingForToolsMs: number;
  toolDurationsBreakdown: { toolName: string; durationMs: number }[];
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
  multiAgentSpecific?: MultiAgentSpecificMetrics;
  singleAgentSpecific?: SingleAgentSpecificMetrics;
}

export type ArchitectureMode = 'multi_agent' | 'single_agent' | 'side_by_side';

export interface MetricRegistryItem {
  key: string;
  label: string;
  category: 'timing' | 'compute' | 'memory' | 'tokens_cost' | 'network' | 'quality' | 'budget' | 'reliability' | 'architecture_specific';
  definition: string;
  unit: string;
  measurementMethod: string;
  aggregationMethod: 'mean' | 'median' | 'p95' | 'sum' | 'ratio';
  applicability: 'both' | 'multi_agent_only' | 'single_agent_only';
  lowerIsBetter: boolean;
  notApplicableReason?: string;
}

export interface BenchmarkRecord {
  runId: string;
  testCaseId: string;
  testCaseCode: string;
  testCaseName: string;
  architecture: 'multi_agent' | 'single_agent';
  timestamp: string;
  status: 'completed' | 'failed';
  inputParameters: any;
  wallClockDurationMs: number;
  timeToFirstResponseMs: number;
  ttfrDefinition: string;
  criticalPathDurationMs: number;
  sumOfAgentDurationsMs: number;
  stageTimings: {
    name: string;
    durationMs: number;
    isParallel: boolean;
    criticalPath: boolean;
  }[];
  cpuUtilizationPercent: number;
  userCpuMs: number;
  systemCpuMs: number;
  coreCount: number;
  baselineRssMb: number;
  peakRssMb: number;
  heapUsedMb: number;
  heapTotalMb: number;
  modelRequestsCount: number;
  toolCallsCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  costPricingModel: string;
  networkLatency: NetworkLatencyReport;
  retriesCount: number;
  failuresCount: number;
  recoveriesCount: number;
  semanticAssertionsPassed: number;
  semanticAssertionsTotal: number;
  validationPassed: boolean;
  qualityScore: number;
  qualityTier: string;
  qualityBreakdown: {
    completeness: number;
    relevance: number;
    scheduleFeasibility: number;
    informationConsistency: number;
    attractionDiversity: number;
    budgetFeasibility: number;
    preferenceAlignment: number;
  };
  budgetFeasible: boolean;
  userBudget: number;
  committedCost: number;
  budgetUtilizationPercent: number;
  uniqueAttractionsCount: number;
  duplicateAttractionsCount: number;
  multiAgentSpecific?: MultiAgentSpecificMetrics;
  singleAgentSpecific?: SingleAgentSpecificMetrics;
  tripSummary: {
    id: string;
    title: string;
    days: number;
    travelers: number;
  };
  notes?: string;
}

export interface ComparativeMetricSummary {
  metricKey: string;
  metricLabel: string;
  unit: string;
  category?: string;
  sampleCountMulti: number;
  sampleCountSingle: number;
  multiMean: number;
  singleMean: number;
  multiMedian: number;
  singleMedian: number;
  multiStdDev: number;
  singleStdDev: number;
  multiP95: number;
  singleP95: number;
  absoluteDifference: number;
  relativeChangePercent: number;
  confidenceInterval95?: {
    lower: number;
    upper: number;
  };
  interpretation: string;
  isApplicableToBoth: boolean;
  applicabilityNote?: string;
}

export interface ArchitectureComparisonAnalysis {
  sampleSize: number;
  pairedRunsCount: number;
  lastExecutedAt: string;
  metrics: ComparativeMetricSummary[];
  multiAgentSpecificSummary: {
    avgAgentsInvoked: number;
    avgInvocations: number;
    avgParallelOverlapMs: number;
    avgConcurrencyRatio: number;
    avgOrchestrationOverheadMs: number;
    avgInterAgentMessages: number;
  };
  singleAgentSpecificSummary: {
    avgDecisionLoops: number;
    avgToolCallsCount: number;
    avgToolCallsDurationMs: number;
    avgPromptTokens: number;
    avgOutputTokens: number;
    avgToolWaitTimeMs: number;
  };
  multiAgentPros: string[];
  singleAgentPros: string[];
  academicSummary: string;
}

export interface BenchmarkScenario {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  input: any;
  expectedDays: number;
  expectedTravelers: number;
  expectedBudgetCap: number;
  evaluationCriteria: string[];
}
