export const WORLD_REGIONS = [
  {
    id: 'north_america',
    name: '北美',
    position: { x: -14, z: 4 },
    populationWeight: 0.16,
    factors: {
      digitalization: 0.89,
      traditionalism: 0.43,
      economicStress: 0.48,
      migration: 0.68,
      institutionalTrust: 0.49,
      identityPolitics: 0.72,
      youthPressure: 0.46,
      meaningSearch: 0.58,
      secularization: 0.71,
      legalPluralism: 0.78,
      mediaPolarization: 0.74,
      stateRegulation: 0.39
    }
  },
  {
    id: 'latin_america',
    name: '拉美',
    position: { x: -9, z: -8 },
    populationWeight: 0.15,
    factors: {
      digitalization: 0.73,
      traditionalism: 0.69,
      economicStress: 0.71,
      migration: 0.62,
      institutionalTrust: 0.38,
      identityPolitics: 0.61,
      youthPressure: 0.64,
      meaningSearch: 0.7,
      secularization: 0.46,
      legalPluralism: 0.61,
      mediaPolarization: 0.68,
      stateRegulation: 0.44
    }
  },
  {
    id: 'europe',
    name: '欧洲',
    position: { x: 1, z: 7 },
    populationWeight: 0.14,
    factors: {
      digitalization: 0.9,
      traditionalism: 0.34,
      economicStress: 0.39,
      migration: 0.67,
      institutionalTrust: 0.62,
      identityPolitics: 0.59,
      youthPressure: 0.42,
      meaningSearch: 0.46,
      secularization: 0.82,
      legalPluralism: 0.84,
      mediaPolarization: 0.57,
      stateRegulation: 0.37
    }
  },
  {
    id: 'middle_east_africa',
    name: '中东/非洲',
    position: { x: 9, z: 1 },
    populationWeight: 0.19,
    factors: {
      digitalization: 0.59,
      traditionalism: 0.85,
      economicStress: 0.76,
      migration: 0.54,
      institutionalTrust: 0.44,
      identityPolitics: 0.83,
      youthPressure: 0.79,
      meaningSearch: 0.81,
      secularization: 0.28,
      legalPluralism: 0.34,
      mediaPolarization: 0.73,
      stateRegulation: 0.71
    }
  },
  {
    id: 'south_asia',
    name: '南亚',
    position: { x: 13, z: -2 },
    populationWeight: 0.17,
    factors: {
      digitalization: 0.66,
      traditionalism: 0.82,
      economicStress: 0.68,
      migration: 0.47,
      institutionalTrust: 0.41,
      identityPolitics: 0.75,
      youthPressure: 0.72,
      meaningSearch: 0.84,
      secularization: 0.31,
      legalPluralism: 0.39,
      mediaPolarization: 0.77,
      stateRegulation: 0.66
    }
  },
  {
    id: 'east_asia',
    name: '东亚',
    position: { x: 18, z: 4 },
    populationWeight: 0.14,
    factors: {
      digitalization: 0.92,
      traditionalism: 0.56,
      economicStress: 0.52,
      migration: 0.44,
      institutionalTrust: 0.58,
      identityPolitics: 0.49,
      youthPressure: 0.47,
      meaningSearch: 0.62,
      secularization: 0.63,
      legalPluralism: 0.59,
      mediaPolarization: 0.56,
      stateRegulation: 0.53
    }
  },
  {
    id: 'global_online',
    name: '线上社群',
    position: { x: 2, z: -13 },
    populationWeight: 0.05,
    factors: {
      digitalization: 0.99,
      traditionalism: 0.23,
      economicStress: 0.47,
      migration: 0.88,
      institutionalTrust: 0.3,
      identityPolitics: 0.67,
      youthPressure: 0.66,
      meaningSearch: 0.54,
      secularization: 0.76,
      legalPluralism: 0.67,
      mediaPolarization: 0.86,
      stateRegulation: 0.22
    }
  }
];

export const GLOBAL_SOCIAL_BASELINE = {
  digitalization: 0.78,
  economicStress: 0.57,
  migration: 0.57,
  institutionalTrust: 0.46,
  identityPolitics: 0.66,
  youthPressure: 0.59,
  meaningSearch: 0.64,
  socialFragmentation: 0.62,
  secularization: 0.57,
  legalPluralism: 0.6,
  mediaPolarization: 0.7,
  stateRegulation: 0.49
};
