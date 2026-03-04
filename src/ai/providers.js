export const AI_PROVIDER_PRESETS = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    apiKeyEnvKeys: ['AI_API_KEY', 'OPENAI_API_KEY'],
    baseUrlEnvKeys: ['AI_API_BASE', 'OPENAI_API_BASE'],
    modelEnvKeys: ['AI_MODEL', 'OPENAI_MODEL']
  },
  moonshot: {
    id: 'moonshot',
    label: 'Moonshot / Kimi',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'kimi-k2-turbo-preview',
    apiKeyEnvKeys: ['MOONSHOT_API_KEY', 'KIMI_API_KEY', 'AI_API_KEY'],
    baseUrlEnvKeys: ['MOONSHOT_API_BASE', 'KIMI_API_BASE', 'AI_API_BASE'],
    modelEnvKeys: ['MOONSHOT_MODEL', 'KIMI_MODEL', 'AI_MODEL']
  }
};

export const DEFAULT_AI_PROVIDER = 'openai';

export function firstNonEmptyEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function normalizeProvider(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_AI_PROVIDER;
  }
  const low = input.trim().toLowerCase();
  if (!low) {
    return DEFAULT_AI_PROVIDER;
  }
  if (low === 'kimi' || low === 'moonshot/kimi' || low === 'moonshot-kimi') {
    return 'moonshot';
  }
  return Object.hasOwn(AI_PROVIDER_PRESETS, low) ? low : DEFAULT_AI_PROVIDER;
}

export function resolveProviderPreset(providerId) {
  return AI_PROVIDER_PRESETS[normalizeProvider(providerId)] || AI_PROVIDER_PRESETS[DEFAULT_AI_PROVIDER];
}

export function listAvailableProviders() {
  return Object.values(AI_PROVIDER_PRESETS).map((provider) => ({
    id: provider.id,
    label: provider.label
  }));
}
