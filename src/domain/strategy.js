import { clamp } from '../utils/math.js';

export const STRATEGY_CHANNELS = [
  'digital',
  'service',
  'ritual',
  'intellectual',
  'youth',
  'identity',
  'institution'
];

export const CHANNEL_SIGNAL_KEYS = {
  digital: 'digitalization',
  service: 'economicStress',
  ritual: 'meaningSearch',
  intellectual: 'socialFragmentation',
  youth: 'youthPressure',
  identity: 'identityPolitics',
  institution: 'institutionalTrust'
};

export const CHANNEL_TRAIT_KEYS = {
  digital: 'digitalMission',
  service: 'communityService',
  ritual: 'ritualDepth',
  intellectual: 'intellectualDialog',
  youth: 'youthAppeal',
  identity: 'identityBond',
  institution: 'institutionCapacity'
};

export function normalizeChannelWeights(rawWeights = {}, minWeight = 0.035) {
  const weights = {};
  let total = 0;

  for (const channel of STRATEGY_CHANNELS) {
    const value = clamp(Number(rawWeights[channel] ?? 0), 0, 2.5);
    const bounded = Math.max(minWeight, value);
    weights[channel] = bounded;
    total += bounded;
  }

  if (total <= 0) {
    const uniform = 1 / STRATEGY_CHANNELS.length;
    for (const channel of STRATEGY_CHANNELS) {
      weights[channel] = uniform;
    }
    return weights;
  }

  for (const channel of STRATEGY_CHANNELS) {
    weights[channel] = weights[channel] / total;
  }
  return weights;
}
