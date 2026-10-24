/**
 * Smart AI Travel Planner 3.0
 * Multi-Agent Orchestrator
 *
 * Preserves the original multi-agent baseline implementation in ./multiAgentBaseline.ts
 * and exposes standard orchestrateTripPlan interface.
 */

import {
  TripGenerationInput,
  executeMultiAgentBaseline,
  MultiAgentExecutionTrace,
} from './multiAgentBaseline';
import { TripPlan } from '../../types/travel';

export type {
  TripGenerationInput,
  MultiAgentExecutionTrace,
};
export {
  executeMultiAgentBaseline,
};

/**
 * Standard Multi-Agent Trip Plan Synthesis
 */
export async function orchestrateTripPlan(input: TripGenerationInput): Promise<TripPlan> {
  const trace = await executeMultiAgentBaseline(input);
  return trace.trip;
}
