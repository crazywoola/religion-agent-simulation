import { clamp } from '../utils/math.js';

export function normalizeMetric(metrics = {}) {
  return {
    zeal: clamp(Number(metrics.zeal || 0.55), 0.2, 0.95),
    persuasion: clamp(Number(metrics.persuasion || 0.55), 0.2, 0.95),
    openness: clamp(Number(metrics.openness || 0.45), 0.05, 0.95),
    retention: clamp(Number(metrics.retention || 0.72), 0.2, 0.98)
  };
}

export function normalizeTraits(traits = {}) {
  return {
    communityService: clamp(Number(traits.communityService || 0.55), 0.1, 0.98),
    digitalMission: clamp(Number(traits.digitalMission || 0.55), 0.1, 0.98),
    ritualDepth: clamp(Number(traits.ritualDepth || 0.55), 0.1, 0.98),
    intellectualDialog: clamp(Number(traits.intellectualDialog || 0.55), 0.1, 0.98),
    youthAppeal: clamp(Number(traits.youthAppeal || 0.55), 0.1, 0.98),
    identityBond: clamp(Number(traits.identityBond || 0.55), 0.1, 0.98),
    institutionCapacity: clamp(Number(traits.institutionCapacity || 0.55), 0.1, 0.98)
  };
}

export function normalizeGovernance(governance = {}, fallback = {}) {
  return {
    orthodoxy: clamp(Number(governance.orthodoxy ?? fallback.orthodoxy ?? 0.55), 0.05, 0.98),
    antiProselytization: clamp(
      Number(governance.antiProselytization ?? fallback.antiProselytization ?? 0.55),
      0.05,
      0.98
    ),
    tribunalCapacity: clamp(
      Number(governance.tribunalCapacity ?? fallback.tribunalCapacity ?? 0.55),
      0.05,
      0.98
    ),
    dueProcess: clamp(Number(governance.dueProcess ?? fallback.dueProcess ?? 0.55), 0.05, 0.98)
  };
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
