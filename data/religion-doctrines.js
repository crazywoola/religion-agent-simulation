export const INITIAL_FOLLOWERS_PER_RELIGION = 10000;

// Doctrine and propagation rules: used to simulate assimilation efficiency, retention, social adaptation, and regional affinity.
// exitBarrier: 0-1, represents the social/institutional/psychological cost for followers to leave (higher = harder to leave)
export const RELIGION_DOCTRINES = [
  {
    id: 'buddhism',
    name: '佛教',
    color: '#f4a261',
    exitBarrier: 0.22,
    doctrine: '强调慈悲、缘起与减轻痛苦，注重个体修行与内在觉察。',
    doctrineLong:
      '佛教关注“苦、集、灭、道”的实践路径，强调通过戒、定、慧减少贪嗔痴并提升觉察力。在现代社会中，它常以禅修、心理支持、慈善与跨文化交流的形式进入公共生活，吸引寻求内在平衡与伦理实践的人群。',
    classics: ['《巴利三藏》', '《金刚经》', '《心经》', '《法华经》'],
    style: '以禅修、心理关怀、公益实践和跨文化对话吸引信众。',
    metrics: { zeal: 0.56, persuasion: 0.5, openness: 0.57, retention: 0.73 },
    traits: {
      communityService: 0.74,
      digitalMission: 0.58,
      ritualDepth: 0.72,
      intellectualDialog: 0.81,
      youthAppeal: 0.64,
      identityBond: 0.54,
      institutionCapacity: 0.66
    },
    governance: {
      orthodoxy: 0.42,
      antiProselytization: 0.44,
      tribunalCapacity: 0.48,
      dueProcess: 0.81
    },
    passive: { signal: 'mediaPolarization', effect: -0.012, label: { en: 'Mindful Calm', 'zh-CN': '正念沉静', ja: '正念の静寂' } },
    regionalAffinity: {
      east_asia: 0.95,
      south_asia: 0.71,
      middle_east_africa: 0.25,
      europe: 0.46,
      north_america: 0.52,
      latin_america: 0.33,
      global_online: 0.68
    }
  },
  {
    id: 'hinduism',
    name: '印度教',
    color: '#e76f51',
    exitBarrier: 0.65,
    doctrine: '强调业、轮回与梵我关系，保留多元神学与仪式传统。',
    doctrineLong:
      '印度教是多元传统的集合，既有形上学讨论，也有家庭仪式与节庆生活，强调行为后果（业）与人生循环（轮回）。在当代社会中，它通过家庭网络、寺庙社群、文化节庆和侨民认同维系稳定传播，同时保留高度地方化表达。',
    classics: ['《吠陀》', '《奥义书》', '《薄伽梵歌》', '《罗摩衍那》'],
    style: '通过节庆、寺庙网络、家庭传承与文化共同体传播。',
    metrics: { zeal: 0.58, persuasion: 0.49, openness: 0.36, retention: 0.84 },
    traits: {
      communityService: 0.63,
      digitalMission: 0.46,
      ritualDepth: 0.9,
      intellectualDialog: 0.58,
      youthAppeal: 0.56,
      identityBond: 0.82,
      institutionCapacity: 0.69
    },
    governance: {
      orthodoxy: 0.68,
      antiProselytization: 0.72,
      tribunalCapacity: 0.63,
      dueProcess: 0.58
    },
    passive: { signal: 'socialFragmentation', effect: -0.01, label: { en: 'Festival Bond', 'zh-CN': '节庆纽带', ja: '祭典の絆' } },
    regionalAffinity: {
      east_asia: 0.24,
      south_asia: 0.98,
      middle_east_africa: 0.22,
      europe: 0.28,
      north_america: 0.39,
      latin_america: 0.2,
      global_online: 0.41
    }
  },
  {
    id: 'taoism',
    name: '道教',
    color: '#2a9d8f',
    exitBarrier: 0.20,
    doctrine: '强调道法自然、身心平衡与与世协和，重视顺势而为。',
    doctrineLong:
      '道教将宇宙秩序、生命修养与社会伦理结合在一起，强调“无为”并非消极，而是避免过度干预、尊重自然规律。在现代场景中，道教常通过养生文化、生态观念、民俗节庆与宫观活动建立连接，对关注健康与传统文化的人群具有持续吸引力。',
    classics: ['《道德经》', '《庄子》', '《列子》', '《道藏》'],
    style: '通过养生文化、本土节俗、生态叙事和生活方式传播。',
    metrics: { zeal: 0.47, persuasion: 0.48, openness: 0.61, retention: 0.69 },
    traits: {
      communityService: 0.57,
      digitalMission: 0.61,
      ritualDepth: 0.68,
      intellectualDialog: 0.67,
      youthAppeal: 0.62,
      identityBond: 0.49,
      institutionCapacity: 0.51
    },
    governance: {
      orthodoxy: 0.36,
      antiProselytization: 0.41,
      tribunalCapacity: 0.35,
      dueProcess: 0.76
    },
    passive: { signal: 'meaningSearch', effect: 0.012, label: { en: 'Way of Nature', 'zh-CN': '道法自然', ja: '道の導き' } },
    regionalAffinity: {
      east_asia: 0.92,
      south_asia: 0.19,
      middle_east_africa: 0.15,
      europe: 0.34,
      north_america: 0.42,
      latin_america: 0.25,
      global_online: 0.63
    }
  },
  {
    id: 'islam',
    name: '伊斯兰教',
    color: '#264653',
    exitBarrier: 0.82,
    doctrine: '强调独一信仰、社群秩序与伦理责任，注重实践与共同体。',
    doctrineLong:
      '伊斯兰教将信仰、礼拜与社会伦理紧密结合，强调对真主的顺服、社群互助和日常生活中的规范实践。在当代社会中，它依托清真寺网络、家庭教育、公益慈善与跨地域社群保持较强凝聚力，并在迁移背景下形成新的城市宗教空间。',
    classics: ['《古兰经》', '《圣训》', '《布哈里圣训实录》', '《穆斯林圣训实录》'],
    style: '通过社群互助、教育、家庭与跨代传承推动稳定扩散。',
    metrics: { zeal: 0.68, persuasion: 0.62, openness: 0.33, retention: 0.87 },
    traits: {
      communityService: 0.79,
      digitalMission: 0.52,
      ritualDepth: 0.88,
      intellectualDialog: 0.53,
      youthAppeal: 0.59,
      identityBond: 0.9,
      institutionCapacity: 0.83
    },
    governance: {
      orthodoxy: 0.84,
      antiProselytization: 0.86,
      tribunalCapacity: 0.82,
      dueProcess: 0.52
    },
    passive: { signal: 'identityPolitics', effect: -0.01, label: { en: 'Ummah Solidarity', 'zh-CN': '乌玛团结', ja: 'ウンマの連帯' } },
    regionalAffinity: {
      east_asia: 0.39,
      south_asia: 0.67,
      middle_east_africa: 0.98,
      europe: 0.44,
      north_america: 0.36,
      latin_america: 0.22,
      global_online: 0.49
    }
  },
  {
    id: 'protestant',
    name: '基督教',
    color: '#3d5a80',
    exitBarrier: 0.38,
    doctrine: '强调个人信仰关系、救赎与团契生活，重视见证与使命。',
    doctrineLong:
      '新教传统重视个人与上帝的关系、圣经阅读与社区团契，强调“信仰应进入公共生活”这一实践取向。在现代城市中，其传播常与社区服务、青年事工、音乐敬拜、小组制度和线上内容结合，具备较强组织弹性与扩展能力。',
    classics: ['《圣经》（旧约与新约）', '《海德堡要理问答》', '《奥格斯堡信纲》'],
    style: '通过布道、社区服务、音乐与小组化组织进行传播。',
    metrics: { zeal: 0.72, persuasion: 0.67, openness: 0.52, retention: 0.75 },
    traits: {
      communityService: 0.81,
      digitalMission: 0.73,
      ritualDepth: 0.52,
      intellectualDialog: 0.69,
      youthAppeal: 0.74,
      identityBond: 0.66,
      institutionCapacity: 0.78
    },
    governance: {
      orthodoxy: 0.59,
      antiProselytization: 0.57,
      tribunalCapacity: 0.69,
      dueProcess: 0.66
    },
    passive: { signal: 'digitalization', effect: 0.012, label: { en: 'Digital Mission', 'zh-CN': '数字布道', ja: 'デジタル布教' } },
    regionalAffinity: {
      east_asia: 0.43,
      south_asia: 0.32,
      middle_east_africa: 0.29,
      europe: 0.72,
      north_america: 0.88,
      latin_america: 0.78,
      global_online: 0.84
    }
  },
  {
    id: 'pastafarianism',
    name: '飞天面条神教',
    color: '#ee9b00',
    exitBarrier: 0.05,
    doctrine: '以幽默讽喻反思教条，鼓励开放讨论与批判性思考。',
    doctrineLong:
      '飞天面条神教常被视为网络时代的讽喻性宗教表达，核心在于通过幽默方式讨论政教边界、公共教育与信仰自由。其扩散高度依赖线上文化、社交媒体与青年亚文化社群，凝聚力相对松散但传播速度较快。',
    classics: ['《飞天面条神教福音》', '《松散经典》（The Loose Canon）'],
    style: '依托网络文化、社群创作和轻松活动进行扩散。',
    metrics: { zeal: 0.46, persuasion: 0.57, openness: 0.82, retention: 0.56 },
    traits: {
      communityService: 0.34,
      digitalMission: 0.92,
      ritualDepth: 0.28,
      intellectualDialog: 0.71,
      youthAppeal: 0.86,
      identityBond: 0.37,
      institutionCapacity: 0.26
    },
    governance: {
      orthodoxy: 0.16,
      antiProselytization: 0.18,
      tribunalCapacity: 0.21,
      dueProcess: 0.85
    },
    passive: { signal: 'youthPressure', effect: -0.012, label: { en: 'Viral Meme Wave', 'zh-CN': '梗潮传播', ja: 'ミーム・ウェーブ' } },
    regionalAffinity: {
      east_asia: 0.41,
      south_asia: 0.33,
      middle_east_africa: 0.18,
      europe: 0.59,
      north_america: 0.78,
      latin_america: 0.35,
      global_online: 0.95
    }
  },
  {
    id: 'catholicism',
    name: '天主教',
    color: '#98c1d9',
    exitBarrier: 0.55,
    doctrine: '强调圣事传统、教会共同体与爱德实践，重视制度与传承。',
    doctrineLong:
      '天主教强调圣事生活、教会传统与普世性共同体，并通过教区结构将信仰实践延展至教育、医疗与慈善领域。在现代社会中，其制度化组织和跨国网络使其在长期留存、社会服务和跨代传承方面具有较强韧性。',
    classics: ['《圣经》（旧约与新约）', '《天主教教理》', '《神学大全》'],
    style: '通过堂区组织、慈善与教育体系实现跨世代传播。',
    metrics: { zeal: 0.63, persuasion: 0.58, openness: 0.41, retention: 0.85 },
    traits: {
      communityService: 0.86,
      digitalMission: 0.51,
      ritualDepth: 0.84,
      intellectualDialog: 0.61,
      youthAppeal: 0.54,
      identityBond: 0.79,
      institutionCapacity: 0.91
    },
    governance: {
      orthodoxy: 0.77,
      antiProselytization: 0.73,
      tribunalCapacity: 0.88,
      dueProcess: 0.62
    },
    passive: { signal: 'institutionalTrust', effect: 0.012, label: { en: 'Parish Network', 'zh-CN': '教区网络', ja: '教区ネットワーク' } },
    regionalAffinity: {
      east_asia: 0.32,
      south_asia: 0.26,
      middle_east_africa: 0.34,
      europe: 0.83,
      north_america: 0.64,
      latin_america: 0.95,
      global_online: 0.52
    }
  },
  {
    id: 'shinto',
    name: '日本神道教',
    color: '#c08497',
    exitBarrier: 0.32,
    doctrine: '强调神道与自然、祖灵、地方祭礼的连续性，重视净化与和谐。',
    doctrineLong:
      '神道教以“神”（kami）与自然、地方共同体和祖先记忆的关系为核心，强调祭礼、净化与季节性仪式在社会生活中的角色。现代日本社会中，神道实践常与文化认同、地方节庆、人生礼仪及公共空间象征交织，形成“宗教与文化并存”的独特格局。',
    classics: ['《古事记》', '《日本书纪》', '《延喜式》', '《古语拾遗》'],
    style: '通过神社祭礼、地方文化活动、家族仪礼与旅游文化进行扩散。',
    metrics: { zeal: 0.49, persuasion: 0.45, openness: 0.58, retention: 0.77 },
    traits: {
      communityService: 0.58,
      digitalMission: 0.47,
      ritualDepth: 0.86,
      intellectualDialog: 0.55,
      youthAppeal: 0.5,
      identityBond: 0.83,
      institutionCapacity: 0.73
    },
    governance: {
      orthodoxy: 0.64,
      antiProselytization: 0.69,
      tribunalCapacity: 0.67,
      dueProcess: 0.57
    },
    passive: { signal: 'stateRegulation', effect: -0.01, label: { en: 'Shrine Harmony', 'zh-CN': '神社和谐', ja: '神社の調和' } },
    regionalAffinity: {
      east_asia: 0.99,
      south_asia: 0.12,
      middle_east_africa: 0.08,
      europe: 0.22,
      north_america: 0.31,
      latin_america: 0.11,
      global_online: 0.38
    }
  },
  {
    id: 'secular',
    name: '无宗教/世俗主义',
    color: '#607d8b',
    exitBarrier: 0.15,
    isSecular: true,
    doctrine: '以理性、科学与人文价值为基础，追求独立于宗教框架的意义建构。',
    doctrineLong:
      '世俗主义并非一种有组织的宗教，而是现代社会中"无宗教认同"群体的集合表达。其成员通过科学理性、伦理哲学、社会运动或个人精神实践构建意义，不依附任何神学框架。在数字化、教育扩张与去机构化背景下，世俗化趋势在欧洲、北美和东亚持续上升。',
    classics: ['《人文主义宣言》', '《物种起源》', '《纯粹理性批判》', '《伦理学》（斯宾诺莎）'],
    style: '通过教育、数字内容、批判性思维和个人自由叙事扩散。',
    metrics: { zeal: 0.32, persuasion: 0.48, openness: 0.90, retention: 0.44 },
    traits: {
      communityService: 0.58,
      digitalMission: 0.78,
      ritualDepth: 0.06,
      intellectualDialog: 0.92,
      youthAppeal: 0.76,
      identityBond: 0.28,
      institutionCapacity: 0.38
    },
    governance: {
      orthodoxy: 0.05,
      antiProselytization: 0.04,
      tribunalCapacity: 0.05,
      dueProcess: 0.98
    },
    passive: { signal: 'secularization', effect: 0.015, label: { en: 'Rational Tide', 'zh-CN': '理性潮流', ja: '理性の潮流' } },
    regionalAffinity: {
      east_asia: 0.72,
      south_asia: 0.28,
      middle_east_africa: 0.14,
      europe: 0.92,
      north_america: 0.82,
      latin_america: 0.48,
      global_online: 0.96
    }
  }
];
