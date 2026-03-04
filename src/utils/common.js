export function formatErrorDetail(err) {
  const parts = [];
  if (err?.message) {
    parts.push(err.message);
  }
  if (err?.cause?.code) {
    parts.push(`code=${err.cause.code}`);
  } else if (err?.cause?.message) {
    parts.push(`cause=${err.cause.message}`);
  }
  return parts.join(' | ') || 'unknown_error';
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function truncateText(text, maxLen = 600) {
  if (typeof text !== 'string') {
    return '';
  }
  if (text.length <= maxLen) {
    return text;
  }
  return `${text.slice(0, maxLen)}...(truncated)`;
}

export function normalizeInteger(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.max(0, Math.floor(n));
}
