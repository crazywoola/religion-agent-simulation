export function randomIn(min, max) {
  return min + (max - min) * Math.random();
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function allocateByScore(total, scoredItems) {
  if (total <= 0 || scoredItems.length === 0) {
    return new Map();
  }

  const sum = scoredItems.reduce((acc, item) => acc + item.score, 0);
  if (sum <= 0) {
    return new Map();
  }

  const plan = new Map();
  const fracs = [];
  let allocated = 0;

  for (const item of scoredItems) {
    const raw = (total * item.score) / sum;
    const base = Math.floor(raw);
    plan.set(item.key, base);
    allocated += base;
    fracs.push({ key: item.key, frac: raw - base });
  }

  let remainder = total - allocated;
  if (remainder > 0) {
    const withFrac = fracs.slice().sort((a, b) => b.frac - a.frac);

    for (let i = 0; i < withFrac.length && remainder > 0; i += 1) {
      const current = plan.get(withFrac[i].key) || 0;
      plan.set(withFrac[i].key, current + 1);
      remainder -= 1;
    }
  }

  return plan;
}
