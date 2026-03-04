import os from 'os';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../../data/locale-config.js';

export const PORT = Number(process.env.PORT || 3000);
export const HOST = process.env.HOST || '0.0.0.0';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE };

export function normalizeLocale(input) {
  if (!input || typeof input !== 'string') {
    return DEFAULT_LOCALE;
  }
  if (SUPPORTED_LOCALES.includes(input)) {
    return input;
  }
  const low = input.toLowerCase();
  if (low.startsWith('zh')) {
    return 'zh-CN';
  }
  if (low.startsWith('ja')) {
    return 'ja';
  }
  return 'en';
}

export function localeName(locale) {
  if (locale === 'zh-CN') {
    return 'Simplified Chinese';
  }
  if (locale === 'ja') {
    return 'Japanese';
  }
  return 'English';
}

export function resolveListenHostUrl(host, port = PORT) {
  if (!host || host === '0.0.0.0' || host === '::') {
    return `http://localhost:${port}`;
  }
  return `http://${host}:${port}`;
}

export function getLanUrls(port) {
  const interfaces = os.networkInterfaces();
  const urls = [];
  for (const list of Object.values(interfaces)) {
    for (const info of list || []) {
      if (info.internal || info.family !== 'IPv4') {
        continue;
      }
      urls.push(`http://${info.address}:${port}`);
    }
  }
  return urls;
}
