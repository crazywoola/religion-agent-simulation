import {
  INITIAL_FOLLOWERS_PER_RELIGION,
  RELIGION_DOCTRINES
} from '../../data/religion-doctrines.js';
import { WORLD_REGIONS } from '../../data/world-context.js';
import {
  DEFAULT_SCENARIO,
  SIMULATION_CONFIG
} from '../../data/simulation-config.js';
import { listAvailableProviders } from '../ai/providers.js';
import { DEFAULT_LOCALE, normalizeLocale } from '../config/runtime.js';
import {
  buildScenarioSignalTarget,
  blendSignalsToScenario,
  listAvailableScenarios,
  normalizeScenario
} from '../config/scenario.js';
import {
  localActionText,
  localJudgmentText,
  localizedJudgmentReasonLabel,
  localizedReasonLabel,
  localizedStrategyChannel
} from '../domain/localization.js';
import {
  normalizeClassics,
  normalizeGovernance,
  normalizeMetric,
  normalizeTraits
} from '../domain/normalization.js';
import {
  CHANNEL_SIGNAL_KEYS,
  CHANNEL_TRAIT_KEYS,
  STRATEGY_CHANNELS,
  normalizeChannelWeights
} from '../domain/strategy.js';
import { normalizeInteger } from '../utils/common.js';
import { allocateByScore, clamp, randomIn } from '../utils/math.js';

const WORLD_REGION_INDEX = new Map(WORLD_REGIONS.map((region) => [region.id, region]));

class ReligionSimulation {
  constructor(openaiClient) {
    this.openaiClient = openaiClient;
    this.config = SIMULATION_CONFIG;
    this.state = null;
    this.totalFollowers = RELIGION_DOCTRINES.length * INITIAL_FOLLOWERS_PER_RELIGION;
  }

  buildSeedAgents() {
    return RELIGION_DOCTRINES.map((seed) => {
      const metrics = normalizeMetric(seed.metrics);
      const traits = normalizeTraits(seed.traits);
      const governanceFallback = {
        orthodoxy: 0.24 + traits.identityBond * 0.45 + traits.ritualDepth * 0.16,
        antiProselytization: 0.2 + traits.identityBond * 0.38 + metrics.retention * 0.22,
        tribunalCapacity: 0.18 + traits.institutionCapacity * 0.58 + metrics.zeal * 0.16,
        dueProcess: 0.28 + traits.intellectualDialog * 0.44 + traits.communityService * 0.18
      };

      return {
        id: seed.id,
        name: seed.name,
        color: seed.color,
        isSecular: seed.isSecular || false,
        exitBarrier: clamp(Number(seed.exitBarrier || 0), 0, 0.95),
        doctrine: seed.doctrine,
        doctrineLong: seed.doctrineLong,
        classics: normalizeClassics(seed.classics, []),
        style: seed.style,
        metrics,
        traits,
        governance: normalizeGovernance(seed.governance, governanceFallback),
        passive: seed.passive || null,
        regionalAffinity: seed.regionalAffinity
      };
    });
  }

  ensureBossState(state) {
    if (!state.bossCrisis) {
      state.bossCrisis = {
        active: false,
        phase: 0,
        totalPhases: 3,
        phaseDuration: 3,
        roundsLeft: 0,
        failedStages: 0,
        cooldown: 7,
        objective: '',
        log: [],
        startedRound: null,
        lastOutcome: null
      };
    }
    return state.bossCrisis;
  }

  assignDominantRegionToAgents(agents, regions) {
    const bestRegion = new Map();
    for (const region of regions || []) {
      for (const item of region.distribution || []) {
        const prev = bestRegion.get(item.id);
        if (!prev || item.followers > prev.followers) {
          bestRegion.set(item.id, {
            regionId: region.id,
            regionName: region.name,
            followers: item.followers
          });
        }
      }
    }
    for (const agent of agents) {
      const hit = bestRegion.get(agent.id);
      if (hit) {
        agent.dominantRegionId = hit.regionId;
        agent.dominantRegionName = hit.regionName;
        agent.dominantRegionFollowers = hit.followers;
      } else if (!agent.dominantRegionId) {
        agent.dominantRegionId = 'global_online';
      }
    }
  }

  regionMobilityFactor(fromRegionId, toRegionId, socialSignals) {
    if (!fromRegionId || !toRegionId || fromRegionId === toRegionId) {
      return 1.05;
    }
    const from = WORLD_REGION_INDEX.get(fromRegionId);
    const to = WORLD_REGION_INDEX.get(toRegionId);
    if (!from || !to) {
      return 0.92;
    }
    const dx = Number(from.position?.x || 0) - Number(to.position?.x || 0);
    const dz = Number(from.position?.z || 0) - Number(to.position?.z || 0);
    const distance = Math.sqrt(dx * dx + dz * dz);
    const distanceCost = clamp(distance / 30, 0, 1.2);
    const regGap = Math.abs((from.factors?.stateRegulation || 0.5) - (to.factors?.stateRegulation || 0.5));
    const legalGap = Math.abs((from.factors?.legalPluralism || 0.5) - (to.factors?.legalPluralism || 0.5));
    const identityGap = Math.abs((from.factors?.identityPolitics || 0.5) - (to.factors?.identityPolitics || 0.5));
    const migration = clamp(Number(socialSignals?.migration || 0.55), 0.05, 0.98);
    const digitalization = clamp(Number(socialSignals?.digitalization || 0.55), 0.05, 0.98);
    const friction =
      distanceCost * 0.34 +
      regGap * 0.24 +
      legalGap * 0.2 +
      identityGap * 0.14 +
      (1 - migration) * 0.12 +
      (1 - digitalization) * 0.08;
    return clamp(1.2 - friction, 0.58, 1.24);
  }

  initializeRegionControl(regions) {
    return this.refreshRegionControl([], regions);
  }

  refreshRegionControl(previousControl = [], regions = []) {
    const prevByRegion = new Map(
      (previousControl || []).map((item) => [item.regionId, item])
    );
    return regions.map((region) => {
      const top = region.distribution?.[0] || { id: null, share: 0, name: '' };
      const second = region.distribution?.[1] || { share: 0 };
      const lead = clamp((top.share || 0) - (second.share || 0), 0, 1);
      const targetControl = clamp(
        0.26 + (top.share || 0) * 0.86 - (region.competitionIndex || 0) * 0.18,
        0.08,
        1
      );
      const prev = prevByRegion.get(region.id);
      if (!prev) {
        return {
          regionId: region.id,
          ownerId: top.id,
          ownerName: top.name,
          control: clamp(targetControl, 0.18, 0.9),
          streak: 1,
          contested: region.competitionIndex > 0.72
        };
      }

      let ownerId = prev.ownerId;
      let ownerName = prev.ownerName || top.name;
      let control = prev.control;
      let streak = prev.streak;

      if (prev.ownerId === top.id) {
        control = clamp(prev.control * 0.66 + targetControl * 0.34 + lead * 0.2, 0.06, 1);
        streak = prev.streak + 1;
      } else {
        const decayed = clamp(prev.control * 0.62 - (region.competitionIndex || 0) * 0.12, 0.04, 1);
        if (decayed < 0.28 || (top.share || 0) > 0.53) {
          ownerId = top.id;
          ownerName = top.name;
          control = clamp(0.24 + (top.share || 0) * 0.5, 0.08, 0.92);
          streak = 1;
        } else {
          control = decayed;
          streak = Math.max(0, prev.streak - 1);
        }
      }

      return {
        regionId: region.id,
        ownerId,
        ownerName,
        control,
        streak,
        contested: region.competitionIndex > 0.72 || lead < 0.07
      };
    });
  }

  applyTerritoryBonuses(agents, regions, regionControl = []) {
    const regionById = new Map((regions || []).map((region) => [region.id, region]));
    const controlScoreByOwner = new Map();
    for (const control of regionControl || []) {
      const region = regionById.get(control.regionId);
      if (!region || !control.ownerId) {
        continue;
      }
      const weight = clamp(Number(region.populationWeight || 0), 0.01, 1);
      const stability = clamp(1 - Number(region.competitionIndex || 0) * 0.4, 0.52, 1);
      const score = clamp(Number(control.control || 0), 0, 1) * weight * stability;
      controlScoreByOwner.set(control.ownerId, (controlScoreByOwner.get(control.ownerId) || 0) + score);
    }

    for (const agent of agents) {
      const territoryScore = clamp(controlScoreByOwner.get(agent.id) || 0, 0, 1.6);
      agent.territoryBonus = {
        territoryScore,
        retentionBoost: clamp(territoryScore * 0.12, 0, 0.08),
        outreachBoost: clamp(territoryScore * 0.09, 0, 0.07),
        defenseBoost: clamp(territoryScore * 0.14, 0, 0.11)
      };
    }
  }

  bossPhaseShock(phase) {
    const shocks = {
      1: { socialFragmentation: 0.06, economicStress: 0.05, migration: 0.03 },
      2: { mediaPolarization: 0.06, stateRegulation: 0.05, identityPolitics: 0.05 },
      3: { meaningSearch: 0.07, socialFragmentation: 0.05, institutionalTrust: -0.05 }
    };
    return shocks[phase] ?? shocks[3];
  }

  bossPhaseObjectiveText(phase) {
    const objectives = {
      1: 'Reduce social fragmentation while preserving institutional trust',
      2: 'Stabilize contested regions and avoid extreme polarization',
      3: 'Contain judgment pressure and recover pluralistic balance'
    };
    return objectives[phase] ?? objectives[3];
  }

  evaluateBossPhase(state, phase) {
    const signals = state.socialSignals || {};
    const regions = state.regions || [];
    const stableRegions = regions.filter((region) => Number(region.competitionIndex || 0) < 0.68).length;
    const contestedRegions = regions.filter((region) => Number(region.competitionIndex || 0) > 0.76).length;
    const metrics = state.roundMetrics || {};

    if (phase === 1) {
      const passed = signals.socialFragmentation < 0.74 && signals.institutionalTrust > 0.36;
      return {
        passed,
        note: passed ? 'Fragmentation pressure moderated' : 'Fragmentation remained too high',
        reward: { socialFragmentation: -0.03, institutionalTrust: 0.03 },
        penalty: { socialFragmentation: 0.05, institutionalTrust: -0.04 }
      };
    }
    if (phase === 2) {
      const passed = stableRegions >= 4 && contestedRegions <= 2 && signals.mediaPolarization < 0.8;
      return {
        passed,
        note: passed ? 'Regional fronts stabilized' : 'Regional contestation escalated',
        reward: { mediaPolarization: -0.03, legalPluralism: 0.03, identityPolitics: -0.02 },
        penalty: { mediaPolarization: 0.05, identityPolitics: 0.05, stateRegulation: 0.04 }
      };
    }
    const passed =
      Number(metrics.judgmentRatio || 0) < 0.5 &&
      signals.legalPluralism > 0.44 &&
      signals.socialFragmentation < 0.78;
    return {
      passed,
      note: passed ? 'System contained crisis spillover' : 'Crisis spillover breached governance limits',
      reward: { legalPluralism: 0.04, institutionalTrust: 0.03, socialFragmentation: -0.04 },
      penalty: { legalPluralism: -0.05, stateRegulation: 0.04, socialFragmentation: 0.05 }
    };
  }

  bossPhaseProgress(state, phase) {
    const signals = state.socialSignals || {};
    const regions = state.regions || [];
    const stableRegions = regions.filter((r) => Number(r.competitionIndex || 0) < 0.68).length;
    const contestedRegions = regions.filter((r) => Number(r.competitionIndex || 0) > 0.76).length;
    const metrics = state.roundMetrics || {};

    if (phase === 1) {
      return {
        conditions: [
          { key: 'socialFragmentation', target: '< 0.74', current: +(signals.socialFragmentation || 0).toFixed(3), met: signals.socialFragmentation < 0.74 },
          { key: 'institutionalTrust', target: '> 0.36', current: +(signals.institutionalTrust || 0).toFixed(3), met: signals.institutionalTrust > 0.36 }
        ]
      };
    }
    if (phase === 2) {
      return {
        conditions: [
          { key: 'stableRegions', target: '>= 4', current: stableRegions, met: stableRegions >= 4 },
          { key: 'contestedRegions', target: '<= 2', current: contestedRegions, met: contestedRegions <= 2 },
          { key: 'mediaPolarization', target: '< 0.80', current: +(signals.mediaPolarization || 0).toFixed(3), met: signals.mediaPolarization < 0.8 }
        ]
      };
    }
    return {
      conditions: [
        { key: 'judgmentRatio', target: '< 0.50', current: +(metrics.judgmentRatio || 0).toFixed(3), met: Number(metrics.judgmentRatio || 0) < 0.5 },
        { key: 'legalPluralism', target: '> 0.44', current: +(signals.legalPluralism || 0).toFixed(3), met: signals.legalPluralism > 0.44 },
        { key: 'socialFragmentation', target: '< 0.78', current: +(signals.socialFragmentation || 0).toFixed(3), met: signals.socialFragmentation < 0.78 }
      ]
    };
  }

  triggerBossCrisis(state) {
    const boss = this.ensureBossState(state);
    boss.active = true;
    boss.phase = 1;
    boss.roundsLeft = boss.phaseDuration;
    boss.failedStages = 0;
    boss.startedRound = state.round;
    boss.objective = this.bossPhaseObjectiveText(1);
    boss.log = [];
    boss.lastOutcome = null;

    const existing = state.activeEvents.find((event) => event.id === 'global_crisis');
    if (!existing) {
      state.activeEvents.push({
        id: 'global_crisis',
        startRound: state.round,
        duration: boss.totalPhases * boss.phaseDuration,
        roundsLeft: boss.totalPhases * boss.phaseDuration,
        shock: this.bossPhaseShock(1),
        boss: true
      });
      state.eventHistory.push({
        id: 'global_crisis',
        round: state.round,
        shock: this.bossPhaseShock(1)
      });
      if (state.eventHistory.length > 80) {
        state.eventHistory = state.eventHistory.slice(-80);
      }
    }
  }

  updateBossCrisis(state) {
    const boss = this.ensureBossState(state);
    if (!boss.active) {
      boss.cooldown = Math.max(0, Number(boss.cooldown || 0) - 1);
      if (boss.cooldown <= 0 && state.round >= 6 && state.round % 9 === 0 && Math.random() < 0.46) {
        this.triggerBossCrisis(state);
      }
      return;
    }

    const crisisEvent = state.activeEvents.find((event) => event.id === 'global_crisis');
    if (crisisEvent) {
      crisisEvent.shock = this.bossPhaseShock(boss.phase);
      crisisEvent.duration = boss.totalPhases * boss.phaseDuration;
      crisisEvent.roundsLeft = Math.max(
        1,
        (boss.totalPhases - boss.phase) * boss.phaseDuration + boss.roundsLeft
      );
    }
    boss.objective = this.bossPhaseObjectiveText(boss.phase);
    boss.roundsLeft = Math.max(0, boss.roundsLeft - 1);

    if (boss.roundsLeft > 0) {
      return;
    }

    const phaseResult = this.evaluateBossPhase(state, boss.phase);
    const patch = phaseResult.passed ? phaseResult.reward : phaseResult.penalty;
    if (!phaseResult.passed) {
      boss.failedStages += 1;
    }
    for (const [key, delta] of Object.entries(patch || {})) {
      if (key in state.socialSignals) {
        state.socialSignals[key] = clamp(Number(state.socialSignals[key] || 0.55) + Number(delta || 0), 0.1, 0.98);
      }
    }
    boss.log.unshift({
      round: state.round,
      phase: boss.phase,
      passed: phaseResult.passed,
      note: phaseResult.note
    });
    boss.log = boss.log.slice(0, 12);

    if (boss.phase >= boss.totalPhases) {
      boss.active = false;
      boss.lastOutcome = boss.failedStages === 0 ? 'victory' : boss.failedStages <= 1 ? 'contained' : 'breach';
      boss.cooldown = 9 + boss.failedStages * 2;
      state.activeEvents = state.activeEvents.filter((event) => event.id !== 'global_crisis');
      return;
    }
    boss.phase += 1;
    boss.roundsLeft = boss.phaseDuration;
    boss.objective = this.bossPhaseObjectiveText(boss.phase);
  }

  // Random event system: fires events probabilistically every N rounds, applying short-term social signal perturbations
  applyEvents(state) {
    const cfg = this.config.events;
    this._decayActiveEvents(state);
    const fired = [];
    if (cfg?.enabled && state.round % cfg.checkEveryNRounds === 0) {
      for (const eventDef of cfg.pool) {
        if (fired.length >= cfg.maxPerCheck) break;
        if (Math.random() < eventDef.prob) {
          const ev = {
            id: eventDef.id,
            startRound: state.round,
            duration: eventDef.duration,
            roundsLeft: eventDef.duration,
            shock: { ...eventDef.shock }
          };
          state.activeEvents.push(ev);
          state.eventHistory.push({
            id: eventDef.id,
            round: state.round,
            shock: ev.shock
          });
          if (state.eventHistory.length > 80) {
            state.eventHistory = state.eventHistory.slice(-80);
          }
          fired.push(ev);
        }
      }
    }

    this._applyEventReligionCoupling(state, fired);
    this._applyActiveEventShocks(state);
    return fired;
  }

  _applyEventReligionCoupling(state, firedEvents) {
    const EVENT_TRAIT_MAP = {
      digital_revival:  { trait: 'digitalMission', boost: 0.06 },
      youth_awakening:  { trait: 'youthAppeal',    boost: 0.05 },
      religious_scandal: { trait: 'communityService', boost: 0.04 },
      climate_anxiety:  { trait: 'communityService', boost: 0.04 },
      ai_doctrine_leak: { trait: 'digitalMission', boost: 0.04 },
      algorithmic_echo_burst: { trait: 'digitalMission', boost: 0.03 },
      interfaith_education_reform: { trait: 'intellectualDialog', boost: 0.05 },
      grassroots_relief_network: { trait: 'communityService', boost: 0.05 },
      polarization_spike: { trait: 'identityBond', boost: 0.04 }
    };
    for (const ev of firedEvents) {
      const mapping = EVENT_TRAIT_MAP[ev.id];
      if (!mapping) continue;
      for (const agent of state.agents) {
        const traitValue = clamp(Number(agent.traits?.[mapping.trait] || 0), 0, 1);
        if (traitValue > 0.5) {
          const bonus = mapping.boost * (traitValue - 0.5) * 2;
          if (!agent.territoryBonus) agent.territoryBonus = {};
          agent.territoryBonus.outreachBoost = clamp(
            Number(agent.territoryBonus.outreachBoost || 0) + bonus, 0, 0.15
          );
        }
      }
    }
  }

  applyReligionPassives(state) {
    const sorted = [...state.agents].sort((a, b) => b.followers - a.followers);
    const dominantId = sorted[0]?.id;
    for (const agent of state.agents) {
      if (!agent.passive || !agent.passive.signal) continue;
      const share = agent.followers / Math.max(1, this.totalFollowers);
      if (share < 0.08) continue;
      const strength = agent.id === dominantId ? 1.5 : 1;
      const key = agent.passive.signal;
      if (key in state.socialSignals) {
        state.socialSignals[key] = clamp(
          Number(state.socialSignals[key] || 0.5) + agent.passive.effect * strength * share * 8,
          0.1,
          0.98
        );
      }
    }
  }

  _applyActiveEventShocks(state) {
    for (const ev of state.activeEvents) {
      for (const [key, delta] of Object.entries(ev.shock)) {
        if (key in state.socialSignals) {
          const remaining = Math.max(0.1, Number(ev.roundsLeft || 1) / Math.max(1, Number(ev.duration || 1)));
          state.socialSignals[key] = clamp(
            (state.socialSignals[key] || 0.5) + delta * remaining,
            0.1,
            0.98
          );
        }
      }
    }
  }

  _decayActiveEvents(state) {
    for (const ev of state.activeEvents) {
      if (ev.id === 'global_crisis') {
        continue;
      }
      ev.roundsLeft = Math.max(0, ev.roundsLeft - 1);
    }
    state.activeEvents = state.activeEvents.filter((ev) => ev.id === 'global_crisis' || ev.roundsLeft > 0);
  }

  driftSocialSignals(current) {
    const next = {};
    for (const [key, value] of Object.entries(current)) {
      let jitter = 0.025;
      if (key === 'socialFragmentation') {
        jitter = 0.017;
      } else if (
        key === 'legalPluralism' ||
        key === 'secularization' ||
        key === 'stateRegulation'
      ) {
        jitter = 0.014;
      }
      next[key] = clamp(value + randomIn(-jitter, jitter), 0.2, 0.95);
    }
    return next;
  }

  getSignalPressureValue(socialSignals, channel) {
    const key = CHANNEL_SIGNAL_KEYS[channel];
    const raw = clamp(Number(socialSignals?.[key] || 0.55), 0.05, 0.98);
    if (channel === 'intellectual') {
      return clamp(1 - raw, 0.05, 0.95);
    }
    return raw;
  }

  getChannelTrait(agent, channel) {
    const key = CHANNEL_TRAIT_KEYS[channel];
    return clamp(Number(agent?.traits?.[key] || 0.55), 0.05, 0.98);
  }

  buildInitialStrategy(agent) {
    const rawChannels = {};
    for (const channel of STRATEGY_CHANNELS) {
      const trait = this.getChannelTrait(agent, channel);
      const zealBoost = agent.metrics.zeal * 0.16;
      const persuasionBoost = agent.metrics.persuasion * 0.13;
      const opennessBoost =
        channel === 'digital' || channel === 'youth' ? agent.metrics.openness * 0.12 : 0;
      const retentionBoost =
        channel === 'identity' || channel === 'institution' ? agent.metrics.retention * 0.08 : 0;
      rawChannels[channel] = trait * (0.68 + zealBoost + persuasionBoost) + opennessBoost + retentionBoost;
    }

    return {
      channels: normalizeChannelWeights(rawChannels),
      tempo: clamp(
        0.4 + agent.metrics.zeal * 0.32 + agent.metrics.persuasion * 0.2,
        0.16,
        0.97
      ),
      adaptation: clamp(
        0.22 + agent.metrics.openness * 0.4 + (1 - agent.metrics.retention) * 0.22,
        0.1,
        0.84
      ),
      defensiveFocus: clamp(
        0.2 + agent.metrics.retention * 0.44 + agent.traits.identityBond * 0.24,
        0.1,
        0.95
      ),
      fatigue: clamp((1 - agent.metrics.retention) * 0.22, 0.03, 0.34),
      momentum: clamp(
        0.24 +
          agent.metrics.persuasion * 0.33 +
          agent.traits.communityService * 0.2 +
          agent.traits.digitalMission * 0.12,
        0.12,
        0.88
      ),
      credibility: clamp(
        0.18 +
          agent.traits.institutionCapacity * 0.4 +
          agent.traits.communityService * 0.29 +
          agent.metrics.retention * 0.17,
        0.12,
        0.96
      ),
      inertia: clamp(
        0.24 + agent.traits.institutionCapacity * 0.34 + agent.metrics.retention * 0.24,
        0.18,
        0.92
      ),
      riskTolerance: clamp(
        0.16 + agent.metrics.openness * 0.44 + (1 - agent.metrics.retention) * 0.24,
        0.08,
        0.88
      ),
      cohesion: clamp(
        0.2 +
          agent.traits.identityBond * 0.35 +
          agent.traits.ritualDepth * 0.2 +
          agent.metrics.retention * 0.18,
        0.12,
        0.97
      ),
      recentOutcome: 0
    };
  }

  strategyFocusSummary(strategy) {
    if (!strategy?.channels) {
      return [];
    }
    return Object.entries(strategy.channels)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
  }

  adaptAgentStrategies(agents, socialSignals) {
    for (const agent of agents) {
      const strategy = agent.strategy || this.buildInitialStrategy(agent);
      strategy.inertia = clamp(Number(strategy.inertia ?? 0.46), 0.18, 0.94);
      strategy.riskTolerance = clamp(Number(strategy.riskTolerance ?? 0.42), 0.06, 0.9);
      strategy.cohesion = clamp(Number(strategy.cohesion ?? 0.52), 0.1, 0.99);
      strategy.recentOutcome = clamp(Number(strategy.recentOutcome ?? 0), -0.08, 0.08);

      const outcomeRate = clamp((agent.followers > 0 ? agent.delta / agent.followers : 0) || 0, -0.06, 0.06);
      const smoothedOutcome = clamp(strategy.recentOutcome * 0.64 + outcomeRate * 0.36, -0.06, 0.06);
      strategy.recentOutcome = smoothedOutcome;
      const stress = Math.max(0, -smoothedOutcome);
      const success = Math.max(0, smoothedOutcome);

      const targetChannels = {};
      for (const channel of STRATEGY_CHANNELS) {
        const trait = this.getChannelTrait(agent, channel);
        const pressure = this.getSignalPressureValue(socialSignals, channel);
        const pressurePriority = pressure * (0.45 + trait * 0.55);
        const defensiveBias =
          channel === 'identity' || channel === 'institution'
            ? 1 + stress * (1.15 + strategy.cohesion * 0.35)
            : 1;
        const growthBias =
          channel === 'digital' || channel === 'youth'
            ? 1 + success * (0.65 + strategy.riskTolerance * 0.55)
            : 1;
        const cultureBias =
          channel === 'identity'
            ? 0.86 + socialSignals.mediaPolarization * 0.32
            : channel === 'intellectual'
              ? 0.84 + socialSignals.legalPluralism * 0.3
              : channel === 'ritual'
                ? 0.8 + (1 - socialSignals.secularization) * 0.35
                : channel === 'institution'
                  ? 0.84 + socialSignals.stateRegulation * 0.28
                  : 1;
        const cohesionBias =
          channel === 'identity' || channel === 'institution'
            ? 0.9 + strategy.cohesion * 0.34
            : 0.9 + (1 - strategy.cohesion) * 0.26;
        const riskBias =
          channel === 'digital' || channel === 'youth'
            ? 0.82 + strategy.riskTolerance * 0.42
            : 1 - strategy.riskTolerance * 0.08;
        targetChannels[channel] =
          pressurePriority * defensiveBias * growthBias * cultureBias * cohesionBias * riskBias;
      }

      const normalizedTarget = normalizeChannelWeights(targetChannels);
      const learningRate = clamp(
        strategy.adaptation *
          (0.24 + stress * 1.35 + success * 0.62) *
          (1 - strategy.inertia * 0.52),
        0.012,
        0.19
      );
      const blended = {};
      for (const channel of STRATEGY_CHANNELS) {
        blended[channel] =
          (strategy.channels[channel] || 0) * (1 - learningRate) +
          normalizedTarget[channel] * learningRate;
      }
      strategy.channels = normalizeChannelWeights(blended);

      const outreachLoad = clamp((agent.transferOut || 0) / Math.max(1, agent.followers), 0, 0.15);
      strategy.fatigue = clamp(
        strategy.fatigue +
          outreachLoad * (0.24 + strategy.tempo * 0.24) -
          success * 1.28 +
          stress * 0.28 -
          strategy.cohesion * 0.03 -
          0.01,
        0.02,
        0.64
      );
      strategy.momentum = clamp(
        strategy.momentum +
          success * 1.12 -
          stress * 0.74 -
          strategy.fatigue * 0.06 +
          (strategy.riskTolerance - 0.42) * 0.03 +
          0.012,
        0.08,
        0.98
      );
      strategy.defensiveFocus = clamp(
        strategy.defensiveFocus + stress * 0.16 + strategy.cohesion * 0.04 - success * 0.08,
        0.07,
        0.96
      );
      strategy.credibility = clamp(
        strategy.credibility +
          success * 0.44 -
          stress * 0.28 +
          (agent.traits.communityService * 0.02 + agent.traits.institutionCapacity * 0.02),
        0.1,
        0.99
      );
      strategy.tempo = clamp(
        strategy.tempo +
          (strategy.momentum - strategy.fatigue) * 0.046 +
          success * (0.09 + strategy.riskTolerance * 0.05) -
          stress * (0.06 + strategy.inertia * 0.03),
        0.14,
        0.99
      );
      strategy.riskTolerance = clamp(
        strategy.riskTolerance +
          success * 0.16 -
          stress * 0.12 +
          (agent.metrics.openness - 0.5) * 0.05,
        0.06,
        0.9
      );
      strategy.inertia = clamp(
        strategy.inertia +
          stress * 0.08 -
          success * 0.06 +
          agent.traits.institutionCapacity * 0.01 -
          strategy.adaptation * 0.01,
        0.18,
        0.94
      );
      strategy.cohesion = clamp(
        strategy.cohesion +
          strategy.defensiveFocus * 0.06 +
          stress * 0.1 -
          success * 0.08 +
          agent.metrics.retention * 0.02 -
          (1 - socialSignals.legalPluralism) * 0.02,
        0.1,
        0.99
      );

      agent.strategy = strategy;
    }
  }

  channelOutreachStrength(agent, socialSignals) {
    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    let total = 0;
    for (const channel of STRATEGY_CHANNELS) {
      const pressure = this.getSignalPressureValue(socialSignals, channel);
      const trait = this.getChannelTrait(agent, channel);
      const channelWeight = Number(strategy.channels[channel] || 0);
      total += channelWeight * trait * (0.36 + pressure * 0.64);
    }
    return clamp(total, 0.08, 1.3);
  }

  doctrineDistance(source, target) {
    const src = source.traits;
    const tgt = target.traits;
    const distance =
      Math.abs(src.identityBond - tgt.identityBond) * 0.3 +
      Math.abs(src.ritualDepth - tgt.ritualDepth) * 0.25 +
      Math.abs(src.intellectualDialog - tgt.intellectualDialog) * 0.18 +
      Math.abs(src.communityService - tgt.communityService) * 0.16 +
      Math.abs(src.digitalMission - tgt.digitalMission) * 0.11;
    return clamp(distance, 0, 1);
  }

  regionalOverlap(source, target) {
    let overlap = 0;
    let span = 0;
    for (const region of WORLD_REGIONS) {
      const regionId = region.id;
      const src = clamp(Number(source.regionalAffinity?.[regionId] || 0.3), 0.01, 1);
      const tgt = clamp(Number(target.regionalAffinity?.[regionId] || 0.3), 0.01, 1);
      overlap += Math.min(src, tgt);
      span += Math.max(src, tgt);
    }
    if (span <= 0) {
      return 0.5;
    }
    return clamp(overlap / span, 0.05, 1);
  }

  targetSusceptibility(target, socialSignals) {
    const strategy = target.strategy || this.buildInitialStrategy(target);
    const lock =
      target.metrics.retention * 0.34 +
      target.traits.identityBond * 0.2 +
      target.traits.ritualDepth * 0.12 +
      target.traits.institutionCapacity * 0.15 +
      strategy.defensiveFocus * 0.19;
    const susceptibility =
      (1 - lock) * 0.58 +
      target.metrics.openness * 0.26 +
      socialSignals.socialFragmentation * 0.1 +
      socialSignals.migration * 0.06 +
      socialSignals.secularization * 0.06 +
      socialSignals.mediaPolarization * 0.04 +
      socialSignals.legalPluralism * 0.05 -
      socialSignals.stateRegulation * 0.08;
    return clamp(susceptibility, 0.03, 0.95);
  }

  estimateSocialMismatch(agent, socialSignals) {
    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    let mismatch = 0;
    for (const channel of STRATEGY_CHANNELS) {
      const pressure = this.getSignalPressureValue(socialSignals, channel);
      const trait = this.getChannelTrait(agent, channel);
      const weight = 0.45 + Number(strategy.channels[channel] || 0);
      mismatch += Math.max(0, pressure - trait) * weight;
    }
    return clamp(mismatch / STRATEGY_CHANNELS.length, 0, 1);
  }

  computeAgentOutBudget(agent, socialSignals) {
    const minReserve = 700;
    const available = Math.max(0, agent.followers - minReserve);
    if (available <= 0) {
      return 0;
    }

    const strategy = agent.strategy || this.buildInitialStrategy(agent);
    const territoryBonus = agent.territoryBonus || {};
    const mismatch = this.estimateSocialMismatch(agent, socialSignals);
    const churn = this.config.transfer.churn;
    const churnRate =
      churn.base +
      (1 - agent.metrics.retention) * churn.lowRetention +
      agent.metrics.openness * churn.openness +
      mismatch * churn.mismatch +
      socialSignals.socialFragmentation * churn.socialFragmentation +
      socialSignals.migration * churn.migration +
      socialSignals.stateRegulation * churn.stateRegulation +
      socialSignals.legalPluralism * churn.legalPluralism +
      socialSignals.mediaPolarization * churn.mediaPolarization +
      socialSignals.secularization * churn.secularization +
      strategy.defensiveFocus * churn.defensiveFocus +
      strategy.fatigue * churn.fatigue;

    // Underdog bonus: religions below 15% share churn less, scaling with how far below they are
    const shareRatio = agent.followers / Math.max(1, this.totalFollowers);
    const underdogChurnReduction = shareRatio < 0.15 ? clamp((0.15 - shareRatio) * 1.8, 0, 0.25) : 0;

    // exitBarrier reduces follower churn rate (higher barrier = harder to leave = less churn)
    const barrierReduction =
      1 - clamp(Number(agent.exitBarrier || 0), 0, 0.9) * (this.config.exitBarrierWeight || 0.68) - underdogChurnReduction;
    const inertiaBrake = 1 - clamp(Number(strategy.inertia || 0), 0.1, 0.94) * 0.18;
    const cohesionBrake = 1 - clamp(Number(strategy.cohesion || 0), 0.1, 0.99) * 0.22;
    const governance = agent.governance || normalizeGovernance();
    const governanceBrake =
      1 -
      clamp(
        governance.orthodoxy * 0.08 + governance.antiProselytization * 0.14 + governance.tribunalCapacity * 0.06,
        0,
        0.28
      );
    const boundedRate = clamp(
      churnRate *
        barrierReduction *
        inertiaBrake *
        cohesionBrake *
        governanceBrake *
        (1 - clamp(Number(territoryBonus.retentionBoost || 0), 0, 0.2)),
      0.001,
      0.048
    );
    const outBudgetRaw = Math.floor(agent.followers * boundedRate * randomIn(0.9, 1.1));
    const cap = Math.floor(
      agent.followers *
        (0.041 +
          agent.metrics.openness * 0.017 +
          Number(strategy.riskTolerance || 0.4) * 0.005 +
          Number(territoryBonus.outreachBoost || 0) * 0.03)
    );
    return clamp(outBudgetRaw, 0, Math.min(available, cap));
  }

  pairTransferCap(fromAgent, toAgent) {
    const fromStrategy = fromAgent.strategy || this.buildInitialStrategy(fromAgent);
    const toStrategy = toAgent.strategy || this.buildInitialStrategy(toAgent);
    const compatibility = clamp(
      1 - this.doctrineDistance(fromAgent, toAgent) * 0.62 + this.regionalOverlap(fromAgent, toAgent) * 0.24,
      0.2,
      1.08
    );
    const opennessFactor = 0.72 + toAgent.metrics.openness * 0.7;
    const resistance =
      toAgent.metrics.retention * 0.38 +
      toStrategy.defensiveFocus * 0.28 +
      toAgent.traits.identityBond * 0.18;
    const conversionWindow = clamp(1 - resistance, 0.16, 0.98);
    const tempoFactor = clamp(0.74 + fromStrategy.tempo * 0.42 - fromStrategy.fatigue * 0.22, 0.4, 1.2);

    const base = fromAgent.followers * 0.023;
    const dynamicCap = Math.floor(base * compatibility * opennessFactor * conversionWindow * tempoFactor);
    const hardCap = Math.floor(fromAgent.followers * 0.042);
    return clamp(dynamicCap, 8, Math.max(8, hardCap));
  }

  sourcePullScore(source, target, socialSignals) {
    const sourceStrategy = source.strategy || this.buildInitialStrategy(source);
    const targetStrategy = target.strategy || this.buildInitialStrategy(target);
    const sourceTerritoryBonus = source.territoryBonus || {};
    const targetTerritoryBonus = target.territoryBonus || {};
    const sourceGovernance = source.governance || normalizeGovernance();
    const targetGovernance = target.governance || normalizeGovernance();
    const outreachStrength = this.channelOutreachStrength(source, socialSignals);
    const susceptibility = this.targetSusceptibility(target, socialSignals);
    const distance = this.doctrineDistance(source, target);
    const overlap = this.regionalOverlap(source, target);

    const bridge = clamp(
      0.28 +
        (1 - distance) * 0.46 +
        overlap * 0.16 +
        (source.metrics.openness + target.metrics.openness) * 0.12,
      0.06,
      1.08
    );

    const networkEffect = clamp(0.42 + Math.sqrt(source.followers / this.totalFollowers), 0.4, 1.18);
    const momentum = clamp(
      0.58 +
        sourceStrategy.momentum * 0.24 +
        sourceStrategy.credibility * 0.18 +
        sourceStrategy.tempo * 0.12 -
        sourceStrategy.fatigue * 0.18,
      0.25,
      1.25
    );
    const recentInboundPressure = clamp(
      (source.transferIn || 0) / Math.max(1, source.followers),
      0,
      0.14
    );
    const recentOutboundShock = clamp(
      (target.transferOut || 0) / Math.max(1, target.followers),
      0,
      0.18
    );
    const saturationPenalty = clamp(1 - recentInboundPressure * 0.9, 0.72, 1);
    const defensivePenalty = target.topTo?.name === source.name ? 0.86 : 1;
    const shockWindow = clamp(0.9 + recentOutboundShock * 0.52, 0.9, 1.08);
    const discourseWindow = clamp(
      0.76 + socialSignals.legalPluralism * 0.24 + (1 - socialSignals.mediaPolarization) * 0.1,
      0.62,
      1.16
    );
    const secularWindow = clamp(
      0.82 +
        socialSignals.secularization *
          (source.metrics.openness * 0.16 + source.traits.intellectualDialog * 0.14) +
        (1 - socialSignals.secularization) * source.traits.ritualDepth * 0.08,
      0.72,
      1.22
    );
    const regulationPenalty = clamp(
      1 -
        socialSignals.stateRegulation *
          (0.24 +
            sourceGovernance.antiProselytization * 0.2 +
            targetGovernance.antiProselytization * 0.23),
      0.55,
      1
    );

    // Secularism gains an extra attractiveness bonus in highly secularized environments
    const secularBuff = source.isSecular
      ? clamp(socialSignals.secularization * (this.config.secularBuff || 1.55), 0.6, 1.9)
      : 1;
    const sourceStability = clamp(
      0.84 +
        sourceStrategy.credibility * 0.16 +
        (1 - sourceStrategy.fatigue) * 0.08 -
        sourceStrategy.inertia * 0.07,
      0.72,
      1.18
    );
    const targetCohesionPenalty = clamp(
      1 - (targetStrategy.cohesion * 0.16 + targetStrategy.inertia * 0.08),
      0.62,
      1
    );
    const mobilityFactor = this.regionMobilityFactor(
      source.dominantRegionId,
      target.dominantRegionId,
      socialSignals
    );
    const territoryAdvantage = clamp(
      0.92 + Number(sourceTerritoryBonus.outreachBoost || 0) * 2.2,
      0.88,
      1.2
    );
    const targetTerritoryDefense = clamp(
      1 - Number(targetTerritoryBonus.defenseBoost || 0) * 1.6,
      0.72,
      1
    );

    // Underdog bonus: religions below 12% share get a pull score boost
    const sourceShare = source.followers / Math.max(1, this.totalFollowers);
    const underdogPullBoost = sourceShare < 0.12
      ? clamp(1 + (0.12 - sourceShare) * 3.5, 1, 1.35)
      : 1;

    return (
      outreachStrength *
      susceptibility *
      bridge *
      networkEffect *
      momentum *
      saturationPenalty *
      defensivePenalty *
      discourseWindow *
      secularWindow *
      regulationPenalty *
      shockWindow *
      secularBuff *
      sourceStability *
      targetCohesionPenalty *
      mobilityFactor *
      territoryAdvantage *
      targetTerritoryDefense *
      underdogPullBoost *
      randomIn(0.93, 1.07)
    );
  }

  transferReasonDetail(source, target, socialSignals, locale = DEFAULT_LOCALE) {
    const strategy = source.strategy || this.buildInitialStrategy(source);
    const reasons = [
      {
        key: 'digital_spread',
        value:
          source.traits.digitalMission *
          socialSignals.digitalization *
          (0.55 + (strategy.channels.digital || 0))
      },
      {
        key: 'community_service',
        value:
          source.traits.communityService *
          socialSignals.economicStress *
          (0.55 + (strategy.channels.service || 0))
      },
      {
        key: 'identity_shift',
        value:
          source.traits.identityBond *
          socialSignals.identityPolitics *
          (0.55 + (strategy.channels.identity || 0)) *
          (0.72 + target.metrics.openness * 0.55)
      },
      {
        key: 'meaning_search',
        value:
          source.traits.ritualDepth *
          socialSignals.meaningSearch *
          (0.55 + (strategy.channels.ritual || 0))
      },
      {
        key: 'youth_resonance',
        value:
          source.traits.youthAppeal *
          socialSignals.youthPressure *
          (0.55 + (strategy.channels.youth || 0))
      },
      {
        key: 'institutional_pull',
        value:
          source.traits.institutionCapacity *
          socialSignals.institutionalTrust *
          (0.55 + (strategy.channels.institution || 0))
      },
      {
        key: 'secular_shift',
        value:
          source.traits.intellectualDialog *
          socialSignals.secularization *
          (0.55 + (strategy.channels.intellectual || 0))
      },
      {
        key: 'polarization_alignment',
        value:
          source.traits.identityBond *
          socialSignals.mediaPolarization *
          (0.55 + (strategy.channels.identity || 0))
      },
      {
        key: 'pluralism_dialogue',
        value:
          source.traits.intellectualDialog *
          socialSignals.legalPluralism *
          (0.55 + (strategy.channels.intellectual || 0))
      }
    ].sort((a, b) => b.value - a.value);

    const topFactors = reasons.slice(0, this.config.explainability.topFactors).map((item) => ({
      key: item.key,
      label: localizedReasonLabel(item.key, locale),
      score: Number(item.value.toFixed(4))
    }));
    return {
      reason: localizedReasonLabel(reasons[0].key, locale),
      reasonFactors: topFactors
    };
  }

  computeTransferPlan(agents, socialSignals, locale = DEFAULT_LOCALE) {
    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    const events = [];

    for (const target of agents) {
      const outBudget = this.computeAgentOutBudget(target, socialSignals);
      if (outBudget <= 0) {
        continue;
      }

      const candidates = agents
        .filter((source) => source.id !== target.id)
        .map((source) => ({
          source,
          score: this.sourcePullScore(source, target, socialSignals)
        }))
        .filter((item) => item.score > 0.0001);

      if (candidates.length === 0) {
        continue;
      }

      const allocations = allocateByScore(
        outBudget,
        candidates.map((item) => ({ key: item.source.id, score: item.score }))
      );

      for (const item of candidates) {
        const amount = clamp(
          allocations.get(item.source.id) || 0,
          0,
          this.pairTransferCap(target, item.source)
        );
        if (amount <= 0) {
          continue;
        }

        const reasonDetail = this.transferReasonDetail(
          item.source,
          target,
          socialSignals,
          locale
        );

        deltas.set(target.id, deltas.get(target.id) - amount);
        deltas.set(item.source.id, deltas.get(item.source.id) + amount);
        events.push({
          fromId: target.id,
          fromName: target.name,
          toId: item.source.id,
          toName: item.source.name,
          amount,
          reason: reasonDetail.reason,
          reasonFactors: reasonDetail.reasonFactors
        });
      }
    }

    events.sort((a, b) => b.amount - a.amount);
    return { deltas, events };
  }

  buildOutBudgets(agents, socialSignals) {
    const budgets = new Map();
    for (const agent of agents) {
      budgets.set(agent.id, this.computeAgentOutBudget(agent, socialSignals));
    }
    return budgets;
  }

  computeTransferPlanFromStructure(
    agents,
    socialSignals,
    aiLinks,
    fallbackEvents,
    locale = DEFAULT_LOCALE
  ) {
    const budgets = this.buildOutBudgets(agents, socialSignals);
    const agentById = new Map(agents.map((a) => [a.id, a]));
    const nameToAgent = new Map(agents.map((a) => [a.name, a]));
    const merged = new Map();
    let aiAppliedAmount = 0;

    const addEvent = (fromAgent, toAgent, requestedAmount, reason, reasonFactors, sourceTag) => {
      if (!fromAgent || !toAgent || fromAgent.id === toAgent.id) {
        return 0;
      }
      const left = budgets.get(fromAgent.id) || 0;
      if (left <= 0) {
        return 0;
      }

      const pairCap = this.pairTransferCap(fromAgent, toAgent);
      const amount = clamp(normalizeInteger(requestedAmount, 0), 0, Math.min(left, pairCap));
      if (amount <= 0) {
        return 0;
      }

      budgets.set(fromAgent.id, left - amount);
      const key = `${fromAgent.id}->${toAgent.id}`;
      const hit = merged.get(key);
      if (hit) {
        hit.amount += amount;
        if (sourceTag === 'ai') {
          hit.source = 'ai';
          hit.reason = reason || hit.reason;
          hit.reasonFactors = Array.isArray(reasonFactors) ? reasonFactors : [];
        }
      } else {
        merged.set(key, {
          fromId: fromAgent.id,
          fromName: fromAgent.name,
          toId: toAgent.id,
          toName: toAgent.name,
          amount,
          reason: reason || localizedReasonLabel('digital_spread', locale),
          reasonFactors: Array.isArray(reasonFactors) ? reasonFactors : [],
          source: sourceTag
        });
      }

      if (sourceTag === 'ai') {
        aiAppliedAmount += amount;
      }
      return amount;
    };

    if (Array.isArray(aiLinks)) {
      const sortedAi = [...aiLinks].sort((a, b) => b.amount - a.amount);
      for (const link of sortedAi) {
        const fromAgent = nameToAgent.get(link.from);
        const toAgent = nameToAgent.get(link.to);
        addEvent(fromAgent, toAgent, link.amount, link.reason, [], 'ai');
      }
    }

    for (const event of fallbackEvents) {
      const fromAgent = agentById.get(event.fromId);
      const toAgent = agentById.get(event.toId);
      addEvent(fromAgent, toAgent, event.amount, event.reason, event.reasonFactors, 'rule');
    }

    const events = [...merged.values()].sort((a, b) => b.amount - a.amount);
    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    for (const event of events) {
      deltas.set(event.fromId, (deltas.get(event.fromId) || 0) - event.amount);
      deltas.set(event.toId, (deltas.get(event.toId) || 0) + event.amount);
    }

    let engine = 'rule';
    if (aiAppliedAmount > 0 && events.some((e) => e.source === 'rule')) {
      engine = 'hybrid';
    } else if (aiAppliedAmount > 0) {
      engine = 'ai';
    }

    return { deltas, events, engine, aiAppliedAmount };
  }

  judgmentReasonDetail(fromAgent, toAgent, socialSignals, locale = DEFAULT_LOCALE) {
    const governance = fromAgent.governance || normalizeGovernance();
    const scores = [
      {
        key: 'orthodoxy_enforcement',
        value:
          governance.orthodoxy * 0.52 +
          fromAgent.traits.ritualDepth * 0.2 +
          fromAgent.traits.identityBond * 0.28
      },
      {
        key: 'anti_proselytization_guard',
        value:
          governance.antiProselytization * 0.56 +
          toAgent.metrics.zeal * 0.24 +
          toAgent.metrics.persuasion * 0.2
      },
      {
        key: 'identity_conflict',
        value:
          fromAgent.traits.identityBond * 0.52 +
          socialSignals.identityPolitics * 0.34 +
          socialSignals.mediaPolarization * 0.14
      },
      {
        key: 'legal_restriction',
        value:
          socialSignals.stateRegulation * 0.56 +
          (1 - socialSignals.legalPluralism) * 0.44
      }
    ].sort((a, b) => b.value - a.value);
    const topFactors = scores.slice(0, this.config.explainability.topFactors).map((item) => ({
      key: item.key,
      label: localizedJudgmentReasonLabel(item.key, locale),
      score: Number(item.value.toFixed(4))
    }));
    return {
      reasonKey: scores[0].key,
      reason: localizedJudgmentReasonLabel(scores[0].key, locale),
      factors: topFactors
    };
  }

  applyReligiousJudgment(agents, events, socialSignals, round, locale = DEFAULT_LOCALE) {
    const moderatedEvents = [];
    const records = [];
    const agentById = new Map(agents.map((agent) => [agent.id, agent]));
    const judgmentCfg = this.config.judgment;

    for (const event of events) {
      const fromAgent = agentById.get(event.fromId);
      const toAgent = agentById.get(event.toId);
      if (!fromAgent || !toAgent) {
        continue;
      }

      // Secularism has no religious tribunal and does not impose judgment on others; other religions also cannot block secularization through religious means
      if (fromAgent.isSecular || toAgent.isSecular) {
        moderatedEvents.push({ ...event, judgmentBlocked: 0 });
        continue;
      }

      const governance = fromAgent.governance || normalizeGovernance();
      const regimePressure = clamp(
        (1 - socialSignals.legalPluralism) * judgmentCfg.regime.antiPluralism +
          socialSignals.stateRegulation * judgmentCfg.regime.stateRegulation +
          socialSignals.identityPolitics * judgmentCfg.regime.identityPolitics +
          socialSignals.mediaPolarization * judgmentCfg.regime.mediaPolarization,
        0.04,
        0.96
      );
      const enforcementCapacity = clamp(
        governance.tribunalCapacity * judgmentCfg.enforcement.tribunalCapacity +
          fromAgent.traits.institutionCapacity * judgmentCfg.enforcement.institutionCapacity +
          governance.orthodoxy * judgmentCfg.enforcement.orthodoxy,
        0.08,
        0.98
      );
      const missionaryPush = clamp(
        toAgent.metrics.zeal * judgmentCfg.missionaryPush.zeal +
          toAgent.metrics.persuasion * judgmentCfg.missionaryPush.persuasion +
          toAgent.traits.digitalMission * judgmentCfg.missionaryPush.digitalMission +
          socialSignals.digitalization * judgmentCfg.missionaryPush.digitalization +
          socialSignals.migration * judgmentCfg.missionaryPush.migration,
        0.06,
        1.08
      );
      const dueProcessBrake = clamp(
        1 - governance.dueProcess * judgmentCfg.rate.dueProcessBrake,
        0.26,
        0.94
      );
      const judgmentRate = clamp(
        regimePressure *
          enforcementCapacity *
          (judgmentCfg.rate.base +
            governance.antiProselytization * judgmentCfg.rate.antiProselytization +
            governance.orthodoxy * judgmentCfg.rate.orthodoxy) *
          (judgmentCfg.rate.pushBase + missionaryPush * judgmentCfg.rate.pushFactor) *
          dueProcessBrake *
          randomIn(judgmentCfg.rate.randomMin, judgmentCfg.rate.randomMax),
        0,
        judgmentCfg.rate.maxRate
      );
      const blocked = clamp(
        Math.floor(event.amount * judgmentRate),
        0,
        Math.floor(event.amount * judgmentCfg.rate.maxBlockShare)
      );
      const remaining = event.amount - blocked;

      if (remaining > 0) {
        moderatedEvents.push({
          ...event,
          amount: remaining,
          judgmentBlocked: blocked
        });
      }

      if (blocked > 0) {
        const reasonDetail = this.judgmentReasonDetail(fromAgent, toAgent, socialSignals, locale);
        records.push({
          round,
          religionId: fromAgent.id,
          religionName: fromAgent.name,
          targetReligionId: toAgent.id,
          targetReligionName: toAgent.name,
          attempted: event.amount,
          blocked,
          severity: blocked / Math.max(1, event.amount),
          reasonKey: reasonDetail.reasonKey,
          reason: reasonDetail.reason,
          factors: reasonDetail.factors
        });
      }
    }

    moderatedEvents.sort((a, b) => b.amount - a.amount);
    records.sort((a, b) => b.blocked - a.blocked);

    const deltas = new Map(agents.map((agent) => [agent.id, 0]));
    for (const event of moderatedEvents) {
      deltas.set(event.fromId, (deltas.get(event.fromId) || 0) - event.amount);
      deltas.set(event.toId, (deltas.get(event.toId) || 0) + event.amount);
    }

    return { events: moderatedEvents, deltas, records };
  }

  reconcileInvariant(agents) {
    let total = agents.reduce((sum, agent) => sum + agent.followers, 0);
    let diff = this.totalFollowers - total;

    if (diff === 0) {
      return;
    }

    if (diff > 0) {
      const richest = [...agents].sort((a, b) => b.followers - a.followers)[0];
      richest.followers += diff;
      return;
    }

    const sorted = [...agents].sort((a, b) => b.followers - a.followers);
    for (const agent of sorted) {
      if (diff === 0) {
        break;
      }
      const canLose = Math.max(0, agent.followers - 500);
      if (canLose <= 0) {
        continue;
      }
      const take = Math.min(canLose, Math.abs(diff));
      agent.followers -= take;
      diff += take;
    }
  }

  summarizeTransfers(events, agents) {
    const inflow = new Map(agents.map((a) => [a.id, 0]));
    const outflow = new Map(agents.map((a) => [a.id, 0]));
    const inFrom = new Map(agents.map((a) => [a.id, new Map()]));
    const outTo = new Map(agents.map((a) => [a.id, new Map()]));

    for (const event of events) {
      inflow.set(event.toId, inflow.get(event.toId) + event.amount);
      outflow.set(event.fromId, outflow.get(event.fromId) + event.amount);

      const fromMap = inFrom.get(event.toId);
      fromMap.set(event.fromName, (fromMap.get(event.fromName) || 0) + event.amount);

      const toMap = outTo.get(event.fromId);
      toMap.set(event.toName, (toMap.get(event.toName) || 0) + event.amount);
    }

    const byReligion = new Map();
    for (const agent of agents) {
      const fromMap = inFrom.get(agent.id);
      const toMap = outTo.get(agent.id);

      const topFrom = [...fromMap.entries()].sort((a, b) => b[1] - a[1])[0] || null;
      const topTo = [...toMap.entries()].sort((a, b) => b[1] - a[1])[0] || null;

      byReligion.set(agent.id, {
        inflow: inflow.get(agent.id),
        outflow: outflow.get(agent.id),
        net: inflow.get(agent.id) - outflow.get(agent.id),
        topFrom: topFrom ? { name: topFrom[0], amount: topFrom[1] } : null,
        topTo: topTo ? { name: topTo[0], amount: topTo[1] } : null
      });
    }

    const topPairs = events.slice(0, 12).map((event) => ({
      fromId: event.fromId,
      from: event.fromName,
      toId: event.toId,
      to: event.toName,
      amount: event.amount,
      reason: event.reason,
      reasonFactors: Array.isArray(event.reasonFactors) ? event.reasonFactors : [],
      source: event.source || 'rule'
    }));

    return { byReligion, topPairs };
  }

  computeRegionalVolatility(regions) {
    if (!Array.isArray(regions) || regions.length === 0) {
      return 0;
    }
    const values = regions.map((region) => clamp(Number(region.competitionIndex || 0), 0, 1));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return Math.sqrt(variance);
  }

  buildRoundMetrics(agents, transferEvents, judgmentRecords, regions) {
    const totalFlow = transferEvents.reduce((sum, event) => sum + Number(event.amount || 0), 0);
    const blockedByJudgment = judgmentRecords.reduce(
      (sum, record) => sum + Number(record.blocked || 0),
      0
    );
    const positiveNet = agents.reduce((sum, agent) => sum + Math.max(0, Number(agent.delta || 0)), 0);
    const attemptedFlow = totalFlow + blockedByJudgment;
    return {
      totalFlow,
      blockedByJudgment,
      judgmentRatio: attemptedFlow > 0 ? blockedByJudgment / attemptedFlow : 0,
      netConversionEfficiency: totalFlow > 0 ? positiveNet / totalFlow : 0,
      regionalVolatility: this.computeRegionalVolatility(regions)
    };
  }

  regionFitScore(agent, region, socialSignals) {
    const traits = agent.traits;
    const metrics = agent.metrics;
    const governance = agent.governance || normalizeGovernance();
    const factors = region.factors;
    const affinity = clamp(Number(agent.regionalAffinity?.[region.id] || 0.3), 0.02, 1);
    const affinityAnchor = Math.pow(affinity, 1.7);

    const ritualDemand =
      factors.meaningSearch * 0.42 + (1 - factors.secularization) * 0.34 + factors.traditionalism * 0.24;
    const institutionalDemand =
      factors.institutionalTrust * 0.42 +
      factors.stateRegulation * 0.23 +
      (1 - factors.mediaPolarization) * 0.15;
    const mobilityDemand =
      factors.migration * 0.5 + socialSignals.migration * 0.3 + factors.digitalization * 0.2;

    const communityFit = traits.communityService * (0.42 + factors.economicStress * 0.44);
    const missionFit = traits.digitalMission * (0.34 + factors.digitalization * 0.5);
    const ritualFit = traits.ritualDepth * (0.28 + ritualDemand * 0.58);
    const discourseFit =
      traits.intellectualDialog *
      (0.24 + factors.legalPluralism * 0.36 + (1 - socialSignals.socialFragmentation) * 0.24);
    const youthFit = traits.youthAppeal * (0.28 + factors.youthPressure * 0.42);
    const identityFit = traits.identityBond * (0.28 + factors.identityPolitics * 0.42);
    const institutionalFit =
      traits.institutionCapacity * (0.26 + institutionalDemand * 0.56) +
      governance.tribunalCapacity * 0.08;
    const secularFit = agent.isSecular
      ? 0.82 + factors.secularization * 0.34 + factors.legalPluralism * 0.12
      : 1 - factors.secularization * 0.06;
    const resistancePenalty = clamp(
      (1 - affinity) * 0.16 +
        governance.antiProselytization * 0.06 * (1 - factors.legalPluralism) +
        governance.orthodoxy * 0.05 * factors.stateRegulation,
      0,
      0.32
    );

    const score =
      affinityAnchor * 0.48 +
      communityFit * 0.08 +
      missionFit * 0.08 +
      ritualFit * 0.09 +
      discourseFit * 0.07 +
      youthFit * 0.06 +
      identityFit * 0.07 +
      institutionalFit * 0.07 +
      metrics.retention * 0.03 +
      metrics.persuasion * 0.03 +
      mobilityDemand * metrics.openness * 0.07;

    return clamp(score * secularFit * (1 - resistancePenalty), 0.001, 3.2);
  }

  buildRegionalLandscape(agents, socialSignals, previousRegions = []) {
    const totalFollowers = agents.reduce((sum, agent) => sum + agent.followers, 0);
    const previousShareByRegion = new Map();
    for (const region of previousRegions || []) {
      const shares = new Map();
      for (const item of region.distribution || []) {
        shares.set(item.id, clamp(Number(item.share || 0), 0, 1));
      }
      previousShareByRegion.set(region.id, shares);
    }

    return WORLD_REGIONS.map((region) => {
      const regionTotal = Math.max(1200, Math.round(totalFollowers * region.populationWeight));
      const previousShares = previousShareByRegion.get(region.id) || new Map();
      const scores = agents.map((agent) => {
        const globalShare = clamp(agent.followers / Math.max(1, totalFollowers), 0.0001, 1);
        const fit = this.regionFitScore(agent, region, socialSignals);
        const affinity = clamp(Number(agent.regionalAffinity?.[region.id] || 0.3), 0.02, 1);
        const anchor = Math.pow(affinity, 2.15);
        const previousShare = clamp(Number(previousShares.get(agent.id) || 0), 0, 1);
        const inertia = previousShare > 0 ? 0.76 + Math.sqrt(previousShare) * 0.92 : 0.62 + anchor * 0.52;
        const diaspora = 0.84 + socialSignals.migration * (0.14 + Math.sqrt(globalShare) * 0.36);
        const baseMix = globalShare * 0.3 + anchor * 0.47 + fit * 0.23;
        const minorityFloor = 0.004 + anchor * 0.02;
        const score = Math.max(0.0001, baseMix * inertia * diaspora + minorityFloor);
        return {
          id: agent.id,
          name: agent.name,
          color: agent.color,
          score
        };
      });

      const allocations = allocateByScore(
        regionTotal,
        scores.map((item) => ({ key: item.id, score: item.score }))
      );

      const distribution = scores
        .map((item) => {
          const followers = allocations.get(item.id) || 0;
          return {
            id: item.id,
            name: item.name,
            color: item.color,
            followers,
            share: followers / regionTotal
          };
        })
        .sort((a, b) => b.followers - a.followers);

      const dominant = distribution[0];
      const second = distribution[1];
      const competitionIndex = clamp(1 - (dominant.share - second.share), 0, 1);

      return {
        id: region.id,
        name: region.name,
        position: region.position,
        populationWeight: region.populationWeight,
        totalFollowers: regionTotal,
        competitionIndex,
        dominantReligionId: dominant.id,
        dominantReligionName: dominant.name,
        distribution
      };
    });
  }

  findDominantRegionByReligion(regions) {
    const result = new Map();
    for (const region of regions) {
      for (const item of region.distribution) {
        const hit = result.get(item.id);
        if (!hit || item.followers > hit.followers) {
          result.set(item.id, {
            regionId: region.id,
            regionName: region.name,
            position: region.position,
            followers: item.followers
          });
        }
      }
    }
    return result;
  }

  buildStructureOutput(round, topTransfers, regions, transferEngine, socialSignals = {}) {
    const dominantRegionByReligion = this.findDominantRegionByReligion(regions);
    const maxAmount = Math.max(...topTransfers.map((item) => item.amount), 1);

    const antLinks = topTransfers
      .slice(0, 12)
      .map((item, index) => {
        const fromRegion = dominantRegionByReligion.get(item.fromId);
        const toRegion = dominantRegionByReligion.get(item.toId);
        if (!fromRegion || !toRegion) {
          return null;
        }

        const intensity = clamp(item.amount / maxAmount, 0.12, 1);
        const curve = (index % 2 === 0 ? 1 : -1) * (0.6 + intensity * 1.2);
        const mobility = this.regionMobilityFactor(fromRegion.regionId, toRegion.regionId, socialSignals);
        const friction = clamp(1.26 - mobility, 0.04, 0.78);
        const routeType = friction > 0.5 ? 'high_friction' : friction > 0.3 ? 'medium_friction' : 'low_friction';
        return {
          id: `${round}-${index}-${item.fromId}-${item.toId}`,
          fromReligionId: item.fromId,
          fromReligionName: item.from,
          toReligionId: item.toId,
          toReligionName: item.to,
          fromRegionId: fromRegion.regionId,
          fromRegionName: fromRegion.regionName,
          toRegionId: toRegion.regionId,
          toRegionName: toRegion.regionName,
          amount: item.amount,
          reason: item.reason,
          source: item.source || 'rule',
          intensity,
          speed: (0.18 + intensity * 0.65) * (1 - friction * 0.42),
          ants: 3 + Math.round(intensity * 5 + (1 - friction) * 2),
          curve,
          friction,
          mobility,
          routeType,
          fromPosition: fromRegion.position,
          toPosition: toRegion.position
        };
      })
      .filter(Boolean);

    return {
      round,
      transferEngine,
      antLinks
    };
  }

  async start({
    useAI = true,
    useOpenAI,
    provider,
    locale = DEFAULT_LOCALE,
    scenario = DEFAULT_SCENARIO
  } = {}) {
    const aiEnabled = useOpenAI !== undefined ? useOpenAI !== false : useAI !== false;
    this.openaiClient.setProvider(provider || this.openaiClient.provider);
    this.openaiClient.setEnabled(aiEnabled);
    const resolvedLocale = normalizeLocale(locale);
    const resolvedScenario = normalizeScenario(scenario);
    const initPrefix =
      resolvedLocale === 'zh-CN'
        ? '初始化：'
        : resolvedLocale === 'ja'
          ? '初期化：'
          : 'Initialized: ';
    const initialActionTemplate =
      resolvedLocale === 'zh-CN'
        ? '{name}建立传播策略，并围绕核心教义组织社群。'
        : resolvedLocale === 'ja'
          ? '{name}は布教戦略を策定し、教義の核に沿ってコミュニティ活動を開始した。'
          : '{name} established a mission strategy aligned with its core doctrines.';

    const seeds = this.buildSeedAgents();
    const generated = await this.openaiClient.generateProfiles(seeds);

    const agents = generated.map((item) => {
      const strategy = this.buildInitialStrategy(item);
      return {
        ...item,
        strategy,
        strategyFocus: this.strategyFocusSummary(strategy),
        followers: INITIAL_FOLLOWERS_PER_RELIGION,
        delta: 0,
        transferIn: 0,
        transferOut: 0,
        topFrom: null,
        topTo: null,
        history: [INITIAL_FOLLOWERS_PER_RELIGION],
        lastAction: initialActionTemplate.replace('{name}', item.name)
      };
    });

    const startedAt = new Date().toISOString();
    const socialSignals = buildScenarioSignalTarget(resolvedScenario);
    const regions = this.buildRegionalLandscape(agents, socialSignals);
    this.assignDominantRegionToAgents(agents, regions);
    const regionControl = this.initializeRegionControl(regions);
    this.applyTerritoryBonuses(agents, regions, regionControl);
    const transferEngine = 'rule';
    const structureOutput = this.buildStructureOutput(0, [], regions, transferEngine, socialSignals);
    const roundMetrics = this.buildRoundMetrics(agents, [], [], regions);

    this.state = {
      round: 0,
      startedAt,
      updatedAt: startedAt,
      locale: resolvedLocale,
      scenario: resolvedScenario,
      socialSignals,
      agents,
      regions,
      transferEngine,
      structureOutput,
      roundMetrics,
      topTransfers: [],
      judgmentRecords: [],
      activeEvents: [],
      eventHistory: [],
      regionControl,
      bossCrisis: {
        active: false,
        phase: 0,
        totalPhases: 3,
        phaseDuration: 3,
        roundsLeft: 0,
        failedStages: 0,
        cooldown: 7,
        objective: '',
        log: [],
        startedRound: null,
        lastOutcome: null
      },
      manualSignalOverrides: {},
      logs: agents.map((agent) => ({
        type: 'mission',
        round: 0,
        time: startedAt,
        religionId: agent.id,
        name: agent.name,
        action: `${initPrefix}${agent.style}`,
        delta: 0,
        transferIn: 0,
        transferOut: 0,
        followers: agent.followers
      }))
    };

    return this.snapshot();
  }

  ensureState() {
    if (!this.state) {
      throw new Error('Simulation has not started. Call /api/simulation/start first.');
    }
    return this.state;
  }

  async tick({ locale, scenario } = {}) {
    const state = this.ensureState();
    state.round += 1;
    if (locale) {
      state.locale = normalizeLocale(locale);
    }
    if (scenario) {
      state.scenario = normalizeScenario(scenario);
    }
    state.scenario = normalizeScenario(state.scenario || DEFAULT_SCENARIO);
    const activeLocale = normalizeLocale(state.locale || DEFAULT_LOCALE);
    state.socialSignals = blendSignalsToScenario(state.socialSignals, state.scenario);
    state.socialSignals = this.driftSocialSignals(state.socialSignals);

    // Apply manual signal overrides (set by user via sliders, effective for one round then naturally decays)
    if (state.manualSignalOverrides && Object.keys(state.manualSignalOverrides).length > 0) {
      for (const [key, val] of Object.entries(state.manualSignalOverrides)) {
        if (key in state.socialSignals) {
          state.socialSignals[key] = clamp(Number(val), 0.1, 0.98);
        }
      }
      state.manualSignalOverrides = {};
    }

    const prevRegionOwners = new Map(
      (state.regionControl || []).map((rc) => [rc.regionId, rc.ownerId])
    );
    this.assignDominantRegionToAgents(state.agents, state.regions);
    state.regionControl = this.refreshRegionControl(state.regionControl || [], state.regions || []);
    this.applyTerritoryBonuses(state.agents, state.regions, state.regionControl);
    this.updateBossCrisis(state);
    const firedEvents = this.applyEvents(state);
    this.adaptAgentStrategies(state.agents, state.socialSignals);
    this.applyReligionPassives(state);
    for (const agent of state.agents) {
      agent.strategyFocus = this.strategyFocusSummary(agent.strategy);
    }

    const rulePlan = this.computeTransferPlan(state.agents, state.socialSignals, activeLocale);
    const aiLinks = await this.openaiClient.generateTransferStructure(
      state.round,
      state.agents,
      state.socialSignals,
      rulePlan.events,
      activeLocale
    );
    const structurePlan = this.computeTransferPlanFromStructure(
      state.agents,
      state.socialSignals,
      aiLinks,
      rulePlan.events,
      activeLocale
    );
    state.transferEngine = structurePlan.engine;
    const judgedPlan = this.applyReligiousJudgment(
      state.agents,
      structurePlan.events,
      state.socialSignals,
      state.round,
      activeLocale
    );
    state.judgmentRecords.push(...judgedPlan.records);
    if (state.judgmentRecords.length > 520) {
      state.judgmentRecords = state.judgmentRecords.slice(-520);
    }

    for (const agent of state.agents) {
      agent.delta = judgedPlan.deltas.get(agent.id) || 0;
      agent.followers += agent.delta;
    }

    this.reconcileInvariant(state.agents);

    const transferSummary = this.summarizeTransfers(judgedPlan.events, state.agents);
    state.topTransfers = transferSummary.topPairs;

    for (const agent of state.agents) {
      const summary = transferSummary.byReligion.get(agent.id);
      agent.transferIn = summary.inflow;
      agent.transferOut = summary.outflow;
      agent.topFrom = summary.topFrom;
      agent.topTo = summary.topTo;
      agent.delta = summary.net;
      agent.history.push(agent.followers);
      if (agent.history.length > 120) {
        agent.history.shift();
      }
    }

    const actionMap = await this.openaiClient.generateRoundActions(
      state.round,
      state.agents,
      state.socialSignals,
      state.topTransfers,
      activeLocale
    );

    const now = new Date().toISOString();
    for (const record of judgedPlan.records.slice(0, 18)) {
      state.logs.push({
        type: 'judgment',
        round: state.round,
        time: now,
        religionId: record.religionId,
        name: record.religionName,
        action: localJudgmentText(record, activeLocale),
        delta: 0,
        transferIn: 0,
        transferOut: record.blocked,
        followers: state.agents.find((agent) => agent.id === record.religionId)?.followers || 0,
        judgment: record
      });
    }

    for (const agent of state.agents) {
      const action =
        actionMap?.get(agent.name) || localActionText(agent, { net: agent.delta }, activeLocale);
      agent.lastAction = action;
      const topCorridorForAgent = state.topTransfers.find(
        (t) => t.toId === agent.id || t.fromId === agent.id
      );
      const topReason = topCorridorForAgent?.reason || '';
      state.logs.push({
        type: 'mission',
        round: state.round,
        time: now,
        religionId: agent.id,
        name: agent.name,
        action: topReason ? `${action} [${topReason}]` : action,
        delta: agent.delta,
        transferIn: agent.transferIn,
        transferOut: agent.transferOut,
        followers: agent.followers
      });
    }

    for (const ev of firedEvents) {
      state.logs.push({
        type: 'event',
        round: state.round,
        time: now,
        name: ev.id,
        action: '',
        shockData: ev.shock || {},
        delta: 0, transferIn: 0, transferOut: 0
      });
    }

    const dominant = [...state.agents].sort((a, b) => b.followers - a.followers)[0];
    if (dominant?.passive) {
      state.logs.push({
        type: 'passive',
        round: state.round,
        time: now,
        religionId: dominant.id,
        name: dominant.name,
        action: `${dominant.passive.label?.en || dominant.passive.signal}: ${dominant.passive.effect > 0 ? '+' : ''}${(dominant.passive.effect * 100).toFixed(1)}%`,
        delta: 0, transferIn: 0, transferOut: 0
      });
    }

    if (state.logs.length > 520) {
      state.logs = state.logs.slice(-520);
    }

    state.regions = this.buildRegionalLandscape(state.agents, state.socialSignals, state.regions);
    state.regionControl = this.refreshRegionControl(state.regionControl || [], state.regions || []);

    for (const rc of state.regionControl) {
      const prevOwner = prevRegionOwners.get(rc.regionId);
      if (prevOwner && prevOwner !== rc.ownerId) {
        state.logs.push({
          type: 'territory',
          round: state.round,
          time: now,
          religionId: rc.ownerId,
          name: rc.ownerName,
          action: `${rc.regionId}: ${prevOwner} → ${rc.ownerId}`,
          delta: 0, transferIn: 0, transferOut: 0
        });
      }
    }
    this.assignDominantRegionToAgents(state.agents, state.regions);
    this.applyTerritoryBonuses(state.agents, state.regions, state.regionControl);
    state.structureOutput = this.buildStructureOutput(
      state.round,
      state.topTransfers,
      state.regions,
      state.transferEngine,
      state.socialSignals
    );
    state.roundMetrics = this.buildRoundMetrics(
      state.agents,
      judgedPlan.events,
      judgedPlan.records,
      state.regions
    );
    state.updatedAt = now;
    return this.snapshot();
  }

  snapshot() {
    const state = this.ensureState();
    const totalFollowers = state.agents.reduce((sum, agent) => sum + agent.followers, 0);

    return {
      round: state.round,
      startedAt: state.startedAt,
      updatedAt: state.updatedAt,
      locale: state.locale || DEFAULT_LOCALE,
      scenario: normalizeScenario(state.scenario || DEFAULT_SCENARIO),
      availableScenarios: listAvailableScenarios(),
      availableProviders: listAvailableProviders(),
      configVersion: this.config.version,
      useAI: this.openaiClient.enabled,
      useOpenAI: this.openaiClient.enabled,
      provider: this.openaiClient.provider,
      providerLabel: this.openaiClient.providerLabel,
      totalFollowers,
      invariantOk: totalFollowers === this.totalFollowers,
      targetTotalFollowers: this.totalFollowers,
      socialSignals: state.socialSignals,
      transferEngine: state.transferEngine,
      religions: state.agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        color: agent.color,
        isSecular: agent.isSecular || false,
        exitBarrier: agent.exitBarrier || 0,
        doctrine: agent.doctrine,
        doctrineLong: agent.doctrineLong,
        classics: agent.classics,
        style: agent.style,
        followers: agent.followers,
        delta: agent.delta,
        transferIn: agent.transferIn,
        transferOut: agent.transferOut,
        topFrom: agent.topFrom,
        topTo: agent.topTo,
        strategyFocus: agent.strategyFocus,
        strategy: agent.strategy,
        metrics: agent.metrics,
        traits: agent.traits,
        governance: agent.governance,
        passive: agent.passive || null,
        territoryBonus: agent.territoryBonus || {},
        dominantRegionId: agent.dominantRegionId || null,
        lastAction: agent.lastAction,
        history: agent.history
      })),
      regions: state.regions,
      regionControl: state.regionControl || [],
      topTransfers: state.topTransfers,
      judgmentRecords: state.judgmentRecords.slice(-100),
      roundMetrics: state.roundMetrics,
      structureOutput: state.structureOutput,
      logs: state.logs.slice(-200),
      activeEvents: state.activeEvents || [],
      eventHistory: (state.eventHistory || []).slice(-40),
      bossCrisis: state.bossCrisis
        ? {
            ...state.bossCrisis,
            phaseProgress: state.bossCrisis.active
              ? this.bossPhaseProgress(state, state.bossCrisis.phase)
              : null
          }
        : null
    };
  }
}


export { ReligionSimulation };
