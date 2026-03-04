export const WORLD_REGIONS = [
  {
    id: 'north_america',
    name: '北美',
    label: { en: 'North America', 'zh-CN': '北美', ja: '北米' },
    description: {
      en: 'High digitalization and legal pluralism, but deep media polarization and identity fragmentation. Protestant and secular traditions dominate.',
      'zh-CN': '数字化与法律多元程度高，但媒体极化与身份碎片化严重。新教与世俗传统占主导。',
      ja: 'デジタル化と法的多元性が高いが、メディア分極化とアイデンティティの断片化が深刻。プロテスタントと世俗の伝統が優勢。'
    },
    position: { x: -18, z: 7 },
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
    label: { en: 'Latin America', 'zh-CN': '拉美', ja: '中南米' },
    description: {
      en: 'Strong traditional values and economic stress. Catholic heritage is challenged by Protestant growth and rising secularism in urban areas.',
      'zh-CN': '传统价值观浓厚，经济压力大。天主教遗产受到新教增长和城市世俗主义的挑战。',
      ja: '伝統的価値観が根強く経済ストレスが大きい。カトリックの伝統がプロテスタントの成長と都市部の世俗主義に挑まれている。'
    },
    position: { x: -13, z: -8 },
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
    label: { en: 'Europe', 'zh-CN': '欧洲', ja: 'ヨーロッパ' },
    description: {
      en: 'The most secularized major region with high institutional trust and legal pluralism. Migration-driven religious diversity creates new tensions.',
      'zh-CN': '最世俗化的主要区域，制度信任和法律多元程度高。移民驱动的宗教多样性带来新的紧张。',
      ja: '最も世俗化された主要地域で、制度信頼と法的多元性が高い。移民による宗教的多様性が新たな緊張を生む。'
    },
    position: { x: 2.5, z: 8.5 },
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
    label: { en: 'Middle East / Africa', 'zh-CN': '中东/非洲', ja: '中東・アフリカ' },
    description: {
      en: 'High traditionalism, strong identity politics, and significant state regulation. Islam dominates; youth pressure and economic stress are major drivers.',
      'zh-CN': '传统主义浓厚，身份政治强烈，国家监管显著。伊斯兰教占主导；青年压力与经济压力是主要驱动力。',
      ja: '伝統主義が強く、アイデンティティ政治と国家規制が顕著。イスラム教が優勢で、若年層圧力と経済ストレスが主要な駆動力。'
    },
    position: { x: 8, z: 0.5 },
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
    label: { en: 'South Asia', 'zh-CN': '南亚', ja: '南アジア' },
    description: {
      en: 'Deep spiritual seeking with strong traditionalism. Hinduism and Islam compete intensely; identity politics and media polarization are high.',
      'zh-CN': '深层精神追求与强烈传统主义交织。印度教与伊斯兰教激烈竞争；身份政治与媒体极化程度高。',
      ja: '深い精神的探求と強い伝統主義。ヒンドゥー教とイスラム教が激しく競合し、アイデンティティ政治とメディア分極化が高い。'
    },
    position: { x: 12.5, z: -1.5 },
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
    label: { en: 'East Asia', 'zh-CN': '东亚', ja: '東アジア' },
    description: {
      en: 'Highest digitalization with moderate secularization. Buddhism, Taoism, and Shinto coexist; state regulation balances with institutional trust.',
      'zh-CN': '数字化程度最高，世俗化适中。佛教、道教与神道共存；国家监管与制度信任并行。',
      ja: 'デジタル化が最も高く世俗化は中程度。仏教・道教・神道が共存し、国家規制と制度信頼がバランス。'
    },
    position: { x: 17.5, z: 5.5 },
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
    label: { en: 'Online Communities', 'zh-CN': '线上社群', ja: 'オンラインコミュニティ' },
    description: {
      en: 'A borderless digital space with extreme digitalization, low regulation, and high media polarization. Pastafarianism and secular movements thrive here.',
      'zh-CN': '无国界的数字空间，极端数字化，低监管，高媒体极化。飞天面条神教与世俗运动在此蓬勃发展。',
      ja: '国境なきデジタル空間。極端なデジタル化、低規制、高メディア分極化。空飛ぶスパゲッティ教と世俗運動が盛ん。'
    },
    position: { x: 3.5, z: -12.5 },
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
