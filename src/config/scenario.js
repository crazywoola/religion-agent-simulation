import { GLOBAL_SOCIAL_BASELINE } from '../../data/world-context.js';
import {
  DEFAULT_SCENARIO,
  SIMULATION_CONFIG,
  SIMULATION_SCENARIOS
} from '../../data/simulation-config.js';
import { clamp } from '../utils/math.js';

export { DEFAULT_SCENARIO };

export function normalizeScenario(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_SCENARIO;
  }
  return Object.hasOwn(SIMULATION_SCENARIOS, input) ? input : DEFAULT_SCENARIO;
}

export function listAvailableScenarios() {
  return Object.values(SIMULATION_SCENARIOS).map((item) => ({
    id: item.id,
    signalOverrides: item.signalOverrides
  }));
}

export function buildScenarioSignalTarget(scenarioId) {
  const scenario =
    SIMULATION_SCENARIOS[normalizeScenario(scenarioId)] || SIMULATION_SCENARIOS[DEFAULT_SCENARIO];
  const target = { ...GLOBAL_SOCIAL_BASELINE };
  for (const [key, value] of Object.entries(scenario.signalOverrides || {})) {
    target[key] = clamp((target[key] ?? 0.55) + Number(value || 0), 0.2, 0.95);
  }
  return target;
}

export function blendSignalsToScenario(
  current,
  scenarioId,
  rate = SIMULATION_CONFIG.scenarioBlendRate
) {
  const target = buildScenarioSignalTarget(scenarioId);
  const next = {};
  for (const [key, value] of Object.entries(target)) {
    const currentValue = clamp(Number(current?.[key] ?? GLOBAL_SOCIAL_BASELINE[key] ?? 0.55), 0.2, 0.95);
    next[key] = clamp(currentValue * (1 - rate) + value * rate, 0.2, 0.95);
  }
  return next;
}
