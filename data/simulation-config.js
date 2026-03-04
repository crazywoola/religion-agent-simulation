export const DEFAULT_SCENARIO = 'balanced';

export const SIMULATION_SCENARIOS = {
  balanced: {
    id: 'balanced',
    signalOverrides: {}
  },
  high_regulation: {
    id: 'high_regulation',
    signalOverrides: {
      stateRegulation: 0.16,
      legalPluralism: -0.14,
      mediaPolarization: 0.08,
      socialFragmentation: 0.06
    }
  },
  high_secularization: {
    id: 'high_secularization',
    signalOverrides: {
      secularization: 0.2,
      meaningSearch: -0.1,
      legalPluralism: 0.06,
      stateRegulation: -0.04
    }
  },
  high_polarization: {
    id: 'high_polarization',
    signalOverrides: {
      mediaPolarization: 0.18,
      identityPolitics: 0.12,
      socialFragmentation: 0.1,
      legalPluralism: -0.06
    }
  }
};

export const SIMULATION_CONFIG = {
  version: '2026.03.04',
  scenarioBlendRate: 0.16,
  explainability: {
    topFactors: 3
  },
  // exitBarrier: coefficient affecting churn rate in computeAgentOutBudget
  exitBarrierWeight: 0.68,
  // secularBuff: extra attractiveness multiplier for secularism when secularization signal is high
  secularBuff: 1.55,
  // Random event system
  events: {
    enabled: true,
    checkEveryNRounds: 3,      // check every N rounds
    maxPerCheck: 2,            // max events triggered per check
    decayPerRound: 0.18,       // signal shock decay rate per round
    pool: [
      {
        id: 'religious_scandal',
        prob: 0.13,
        shock: { institutionalTrust: -0.13, secularization: 0.09, mediaPolarization: 0.07 },
        duration: 4
      },
      {
        id: 'digital_revival',
        prob: 0.11,
        shock: { digitalization: 0.11, meaningSearch: 0.07, youthPressure: 0.06 },
        duration: 3
      },
      {
        id: 'political_persecution',
        prob: 0.09,
        shock: { stateRegulation: 0.16, legalPluralism: -0.12, identityPolitics: 0.08 },
        duration: 5
      },
      {
        id: 'migration_wave',
        prob: 0.14,
        shock: { migration: 0.18, socialFragmentation: 0.09, economicStress: 0.06 },
        duration: 4
      },
      {
        id: 'economic_crisis',
        prob: 0.10,
        shock: { economicStress: 0.20, meaningSearch: 0.12, institutionalTrust: -0.08 },
        duration: 6
      },
      {
        id: 'youth_awakening',
        prob: 0.10,
        shock: { youthPressure: 0.14, meaningSearch: 0.09, digitalization: 0.05 },
        duration: 3
      },
      {
        id: 'polarization_spike',
        prob: 0.12,
        shock: { mediaPolarization: 0.17, identityPolitics: 0.12, legalPluralism: -0.07 },
        duration: 5
      },
      {
        id: 'pluralism_wave',
        prob: 0.08,
        shock: { legalPluralism: 0.14, secularization: 0.07, stateRegulation: -0.06 },
        duration: 4
      },
      {
        id: 'climate_anxiety',
        prob: 0.09,
        shock: { meaningSearch: 0.15, youthPressure: 0.10, socialFragmentation: 0.07 },
        duration: 4
      },
      {
        id: 'institutional_reform',
        prob: 0.07,
        shock: { institutionalTrust: 0.14, stateRegulation: -0.08, legalPluralism: 0.09 },
        duration: 5
      },
      {
        id: 'ai_doctrine_leak',
        prob: 0.08,
        shock: { mediaPolarization: 0.09, digitalization: 0.08, institutionalTrust: -0.07 },
        duration: 4
      },
      {
        id: 'grassroots_relief_network',
        prob: 0.07,
        shock: { institutionalTrust: 0.1, economicStress: -0.07, socialFragmentation: -0.06 },
        duration: 4
      },
      {
        id: 'interfaith_education_reform',
        prob: 0.06,
        shock: { legalPluralism: 0.11, youthPressure: -0.04, meaningSearch: 0.06 },
        duration: 5
      },
      {
        id: 'algorithmic_echo_burst',
        prob: 0.08,
        shock: { digitalization: 0.09, mediaPolarization: 0.1, identityPolitics: 0.06 },
        duration: 3
      }
    ]
  },
  transfer: {
    churn: {
      base: 0.0016,
      lowRetention: 0.015,
      openness: 0.009,
      mismatch: 0.011,
      socialFragmentation: 0.004,
      migration: 0.004,
      stateRegulation: -0.0035,
      legalPluralism: 0.0024,
      mediaPolarization: 0.003,
      secularization: 0.0035,
      defensiveFocus: -0.0048,
      fatigue: 0.002
    }
  },
  judgment: {
    regime: {
      antiPluralism: 0.34,
      stateRegulation: 0.32,
      identityPolitics: 0.2,
      mediaPolarization: 0.14
    },
    enforcement: {
      tribunalCapacity: 0.42,
      institutionCapacity: 0.32,
      orthodoxy: 0.26
    },
    missionaryPush: {
      zeal: 0.35,
      persuasion: 0.31,
      digitalMission: 0.15,
      digitalization: 0.1,
      migration: 0.09
    },
    rate: {
      base: 0.3,
      antiProselytization: 0.42,
      orthodoxy: 0.24,
      pushBase: 0.7,
      pushFactor: 0.46,
      dueProcessBrake: 0.42,
      randomMin: 0.86,
      randomMax: 1.08,
      maxRate: 0.8,
      maxBlockShare: 0.82
    }
  }
};
