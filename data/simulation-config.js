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
  version: '2026.03.03',
  scenarioBlendRate: 0.16,
  explainability: {
    topFactors: 3
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
