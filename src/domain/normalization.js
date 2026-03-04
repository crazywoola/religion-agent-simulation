import { clamp } from '../utils/math.js';

export function normalizeMetric(metrics = {}) {
  return {
    zeal: clamp(Number(metrics.zeal || 0.55), 0.2, 0.95),
    persuasion: clamp(Number(metrics.persuasion || 0.55), 0.2, 0.95),
    openness: clamp(Number(metrics.openness || 0.45), 0.05, 0.95),
    retention: clamp(Number(metrics.retention || 0.72), 0.2, 0.98)
  };
}

const TRAIT_KEYS = ['communityService', 'digitalMission', 'ritualDepth', 'intellectualDialog', 'youthAppeal', 'identityBond', 'institutionCapacity'];

export function normalizeTraits(traits = {}) {
  const result = {};
  for (const key of TRAIT_KEYS) {
    result[key] = clamp(Number(traits[key] || 0.55), 0.1, 0.98);
  }
  return result;
}

const GOVERNANCE_KEYS = ['orthodoxy', 'antiProselytization', 'tribunalCapacity', 'dueProcess'];

export function normalizeGovernance(governance = {}, fallback = {}) {
  const result = {};
  for (const key of GOVERNANCE_KEYS) {
    result[key] = clamp(Number(governance[key] ?? fallback[key] ?? 0.55), 0.05, 0.98);
  }
  return result;
}

export function normalizeClassics(classics, fallback = []) {
  if (!Array.isArray(classics)) {
    return fallback;
  }
  const clean = classics
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
  return clean.length ? clean : fallback;
}

export function normalizeLongDescription(text, fallback = '') {
  if (typeof text !== 'string') {
    return fallback;
  }
  const clean = text.trim();
  if (clean.length < 40) {
    return fallback;
  }
  return clean;
}
