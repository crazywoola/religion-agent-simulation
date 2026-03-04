import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SUPPORTED_LOCALES, createI18n, getLocaleLabel, getPreferredLocale, normalizeLocale } from './i18n.js';

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const tickInput = document.getElementById('tickInput');
const openaiToggle = document.getElementById('openaiToggle');
const providerDisplayEl = document.getElementById('providerDisplay');
const languageSelect = document.getElementById('languageSelect');
const scenarioSelect = document.getElementById('scenarioSelect');
const logFilterSelect = document.getElementById('logFilterSelect');
const statusEl = document.getElementById('status');
const religionCardsEl = document.getElementById('religionCards');
const insightBoardEl = document.getElementById('insightBoard');
const regionBoardEl = document.getElementById('regionBoard');
const transferBoardEl = document.getElementById('transferBoard');
const logListEl = document.getElementById('logList');
const mapHudStatsEl = document.getElementById('mapHudStats');
const mapLegendEl = document.getElementById('mapLegend');
const canvas = document.getElementById('sceneCanvas');
const fxCanvas = document.getElementById('fxCanvas');
const stageWrapEl = document.querySelector('.stage-wrap');

const appTitleEl = document.getElementById('appTitle');
const appHintEl = document.getElementById('appHint');
const languageLabelEl = document.getElementById('languageLabel');
const scenarioLabelEl = document.getElementById('scenarioLabel');
const providerLabelEl = document.getElementById('providerLabel');
const tickLabelEl = document.getElementById('tickLabel');
const openaiLabelEl = document.getElementById('openaiLabel');
const logFilterLabelEl = document.getElementById('logFilterLabel');
const religionSectionTitleEl = document.getElementById('religionSectionTitle');
const insightSectionTitleEl = document.getElementById('insightSectionTitle');
const regionSectionTitleEl = document.getElementById('regionSectionTitle');
const transferSectionTitleEl = document.getElementById('transferSectionTitle');
const logSectionTitleEl = document.getElementById('logSectionTitle');

// New UI elements
const signalSlidersEl = document.getElementById('signalSliders');
const signalSectionTitleEl = document.getElementById('signalSectionTitle');
const signalResetBtnEl = document.getElementById('signalResetBtn');
const historyChartEl = document.getElementById('historyChart');
const raceChartEl = document.getElementById('raceChart');
const eventFeedEl = document.getElementById('eventFeed');
const eventSectionTitleEl = document.getElementById('eventSectionTitle');
const eventBannerEl = document.getElementById('eventBanner');
const historySectionTitleEl = document.getElementById('historySectionTitle');
const raceChartTitleEl = document.getElementById('raceChartTitle');
const screenshotBtnEl = document.getElementById('screenshotBtn');
const comboBadgeEl = document.getElementById('comboBadge');
const intelBadgeEl = document.getElementById('intelBadge');
const intelUnlockBtnEl = document.getElementById('intelUnlockBtn');
const eventDecisionCardEl = document.getElementById('eventDecisionCard');
const timingBurstCardEl = document.getElementById('timingBurstCard');
const bossCrisisPanelEl = document.getElementById('bossCrisisPanel');
// Modal elements
const modalEl = document.getElementById('religionModal');
const modalCloseEl = document.getElementById('modalClose');
const modalTitleEl = document.getElementById('modalTitle');
const modalFollowersEl = document.getElementById('modalFollowers');
const modalDeltaEl = document.getElementById('modalDelta');
const modalExitBarrierEl = document.getElementById('modalExitBarrier');
const modalTraitsLabelEl = document.getElementById('modalTraitsLabel');
const modalStrategyLabelEl = document.getElementById('modalStrategyLabel');
const modalGovernanceLabelEl = document.getElementById('modalGovernanceLabel');
const modalGovernanceEl = document.getElementById('modalGovernance');
const modalDoctrineEl = document.getElementById('modalDoctrine');
const modalClassicsEl = document.getElementById('modalClassics');
const modalStrategyBarsEl = document.getElementById('modalStrategyBars');
const modalRadarCanvas = document.getElementById('modalRadarCanvas');
const modalHistoryCanvas = document.getElementById('modalHistoryCanvas');
const fxCtx = fxCanvas?.getContext('2d');

const savedLocale =
  typeof localStorage !== 'undefined' ? localStorage.getItem('app_locale') : null;
const savedScenario =
  typeof localStorage !== 'undefined' ? localStorage.getItem('app_scenario') : null;
const i18n = createI18n(savedLocale || getPreferredLocale());

let tickTimer = null;
let liveState = null;
let religionOrder = [];
let antClock = 0;
let currentLocale = i18n.locale;
let regionNodeLocale = i18n.locale;
let activeLogFilter = 'all';
let signalSliderDebounce = null;
let currentModalReligionId = null;
let activeCanvasEvents = [];
const PROJECTED_POINT = new THREE.Vector3();
let comboScore = 0;
let intelPoints = 0;
let lastComboRound = -1;
let lastProcessedRound = -1;
let lastForecastRound = -1;
let pendingDecision = null;
let burstState = null;
let lastBurstRound = -1;
const corridorCombos = new Map();
const forecastReveal = new Map();
const forecastLinks = [];
const handledDecisionEvents = new Set();
let ghostRunData = null;
let activeBossPanel = null;

const GHOST_STORAGE_KEY = 'religion_sim_ghost_run_v1';
const DECISION_OPTION_LIBRARY = {
  religious_scandal: [
    {
      id: 'transparent_reform',
      label: { en: 'Transparent Reform', 'zh-CN': '透明改革', ja: '透明改革' },
      desc: {
        en: 'Raise trust with institutional reforms, but increase short-term polarization.',
        'zh-CN': '以制度改革提升信任，但短期内会加剧极化。',
        ja: '制度改革で信頼を回復するが、短期的には分極化が高まる。'
      },
      deltas: { institutionalTrust: 0.08, mediaPolarization: 0.04, stateRegulation: 0.02 }
    },
    {
      id: 'contain_narrative',
      label: { en: 'Contain Narrative', 'zh-CN': '舆论压制', ja: '言説統制' },
      desc: {
        en: 'Reduce polarization quickly at the cost of legal pluralism.',
        'zh-CN': '快速降低极化，但会损害法律多元。',
        ja: '分極化を即時抑えるが、法的多元性を損なう。'
      },
      deltas: { mediaPolarization: -0.05, legalPluralism: -0.04, stateRegulation: 0.04 }
    }
  ],
  digital_revival: [
    {
      id: 'open_platform',
      label: { en: 'Open Platform', 'zh-CN': '开放平台', ja: 'オープンプラットフォーム' },
      desc: {
        en: 'Boost digital mission and youth engagement, with slight fragmentation risk.',
        'zh-CN': '强化数字传播和青年参与，但有轻微碎片化风险。',
        ja: 'デジタル布教と若年層参加を強化するが、断片化リスクがある。'
      },
      deltas: { digitalization: 0.08, youthPressure: 0.05, socialFragmentation: 0.02 }
    },
    {
      id: 'institutional_filter',
      label: { en: 'Institutional Filter', 'zh-CN': '制度筛选', ja: '制度フィルタ' },
      desc: {
        en: 'Stabilize discourse quality while slowing diffusion speed.',
        'zh-CN': '稳定传播质量，但会减缓扩散速度。',
        ja: '言説品質を安定化するが、拡散速度は低下する。'
      },
      deltas: { institutionalTrust: 0.06, digitalization: -0.03, stateRegulation: 0.03 }
    }
  ],
  migration_wave: [
    {
      id: 'integration_push',
      label: { en: 'Integration Push', 'zh-CN': '融合推动', ja: '統合推進' },
      desc: {
        en: 'Invest in social integration to reduce conflict.',
        'zh-CN': '加大社会融合投入，降低冲突。',
        ja: '社会統合に投資し、対立を緩和する。'
      },
      deltas: { socialFragmentation: -0.06, legalPluralism: 0.05, economicStress: 0.03 }
    },
    {
      id: 'border_hardening',
      label: { en: 'Border Hardening', 'zh-CN': '边界收紧', ja: '境界強化' },
      desc: {
        en: 'Lower migration pressure, but raise regulation and identity conflict.',
        'zh-CN': '缓解迁移压力，但提高监管和身份冲突。',
        ja: '移動圧力は下がるが、規制とアイデンティティ対立が強まる。'
      },
      deltas: { migration: -0.08, stateRegulation: 0.05, identityPolitics: 0.04 }
    }
  ],
  global_crisis: [
    {
      id: 'coordinated_response',
      label: { en: 'Coordinated Response', 'zh-CN': '协同应对', ja: '協調対応' },
      desc: {
        en: 'Cross-region coordination boosts trust and pluralism.',
        'zh-CN': '跨区域协同提升信任与多元。',
        ja: '地域横断の協調で信頼と多元性を強化。'
      },
      deltas: { institutionalTrust: 0.08, legalPluralism: 0.06, socialFragmentation: -0.05 }
    },
    {
      id: 'emergency_control',
      label: { en: 'Emergency Control', 'zh-CN': '紧急管制', ja: '緊急統制' },
      desc: {
        en: 'Rapid short-term stabilization with long-term social cost.',
        'zh-CN': '短期快速稳定，但长期社会代价更高。',
        ja: '短期安定は得られるが、長期の社会コストが増す。'
      },
      deltas: { stateRegulation: 0.08, mediaPolarization: 0.05, legalPluralism: -0.07 }
    }
  ]
};

const BURST_EVENT_SET = new Set(['digital_revival', 'migration_wave', 'youth_awakening', 'global_crisis']);
ghostRunData = loadGhostRunData();

const RELIGION_EMOJI = {
  buddhism: '☸️',
  hinduism: '🕉️',
  taoism: '☯️',
  shinto: '⛩️',
  islam: '☪️',
  protestant: '✝️',
  catholicism: '✝️',
  pastafarianism: '🍝'
};

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatSigned(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function formatPercent(value, digits = 1) {
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function colorToRgba(color, alpha = 1) {
  const c = new THREE.Color(color);
  return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${clampValue(alpha, 0, 1)})`;
}

function localizedText(entry, fallback = '') {
  if (!entry) {
    return fallback;
  }
  if (typeof entry === 'string') {
    return entry;
  }
  return entry[i18n.locale] || entry.en || fallback;
}

function loadGhostRunData() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(GHOST_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.byReligion) {
      return null;
    }
    return parsed;
  } catch (_err) {
    return null;
  }
}

function archiveGhostRunFromState(state) {
  if (!state?.religions?.length || typeof localStorage === 'undefined') {
    return;
  }
  const snapshot = {
    round: state.round,
    scenario: state.scenario,
    capturedAt: new Date().toISOString(),
    byReligion: Object.fromEntries(
      state.religions.map((religion) => [religion.id, Array.isArray(religion.history) ? religion.history.slice(-160) : []])
    )
  };
  try {
    localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(snapshot));
    ghostRunData = snapshot;
  } catch (_err) {
    // Ignore storage quota errors.
  }
}


function religionLabel(religion) {
  return i18n.religionName(religion.id, religion.name);
}

function religionEmojiById(id) {
  return RELIGION_EMOJI[id] || '🕊️';
}

function religionEmoji(religion) {
  return religionEmojiById(religion?.id);
}

function religionDisplay(religion) {
  return `${religionEmoji(religion)} ${religionLabel(religion)}`;
}

function scenarioLabel(scenarioId) {
  return i18n.t(`scenario.${scenarioId}`);
}

function regionLabel(region) {
  return i18n.regionName(region.id, region.name);
}

function applyStaticI18n() {
  document.documentElement.lang = i18n.locale;
  document.title = i18n.t('app.title');

  appTitleEl.textContent = i18n.t('app.header');
  appHintEl.textContent = i18n.t('app.hint');

  startBtn.textContent = i18n.t('controls.start');
  stopBtn.textContent = i18n.t('controls.stop');
  languageLabelEl.textContent = i18n.t('controls.language');
  scenarioLabelEl.textContent = i18n.t('controls.scenario');
  providerLabelEl.textContent = i18n.t('controls.provider');
  tickLabelEl.textContent = i18n.t('controls.polling');
  openaiLabelEl.textContent = i18n.t('controls.useAI');
  logFilterLabelEl.textContent = i18n.t('controls.logFilter');

  religionSectionTitleEl.textContent = i18n.t('section.religions');
  insightSectionTitleEl.textContent = i18n.t('section.insights');
  regionSectionTitleEl.textContent = i18n.t('section.regions');
  transferSectionTitleEl.textContent = i18n.t('section.transfers');
  logSectionTitleEl.textContent = i18n.t('section.logs');
  if (historySectionTitleEl) historySectionTitleEl.textContent = i18n.t('section.history');
  if (raceChartTitleEl) raceChartTitleEl.textContent = i18n.t('insight.dominantReligion').replace('Global ', '').replace('全局', '') || 'Ranking';
  if (eventSectionTitleEl) eventSectionTitleEl.textContent = i18n.t('section.events');
  if (signalSectionTitleEl) {
    signalSectionTitleEl.querySelector('span').textContent = i18n.t('section.signals');
  }
  if (signalResetBtnEl) signalResetBtnEl.textContent = i18n.t('controls.signalReset');
  if (screenshotBtnEl) screenshotBtnEl.title = i18n.t('controls.screenshot');
  const reportBtnEl = document.getElementById('reportBtn');
  if (reportBtnEl) reportBtnEl.title = i18n.t('controls.exportReport');
  if (intelUnlockBtnEl) {
    intelUnlockBtnEl.textContent =
      i18n.locale === 'zh-CN'
        ? '解锁预测'
        : i18n.locale === 'ja'
          ? '予測を解放'
          : 'Unlock Forecast';
  }
  const drawerToggleBtnEl = document.getElementById('drawerToggleBtn');
  if (drawerToggleBtnEl) drawerToggleBtnEl.title = i18n.t('controls.drawerToggle');
  const drawerTabInsightsEl = document.getElementById('drawerTabInsights');
  if (drawerTabInsightsEl) drawerTabInsightsEl.textContent = i18n.t('drawer.insights');
  const drawerTabLogsEl = document.getElementById('drawerTabLogs');
  if (drawerTabLogsEl) drawerTabLogsEl.textContent = i18n.t('drawer.logs');
  const subtabAssimilationEl = document.getElementById('subtabAssimilation');
  const subtabRegionsEl = document.getElementById('subtabRegions');
  const subtabEventsEl = document.getElementById('subtabEvents');
  if (subtabAssimilationEl) subtabAssimilationEl.textContent = i18n.t('section.subtabAssimilation');
  if (subtabRegionsEl) subtabRegionsEl.textContent = i18n.t('section.subtabRegions');
  if (subtabEventsEl) subtabEventsEl.textContent = i18n.t('section.subtabEvents');

  for (const option of languageSelect.options) {
    option.textContent = getLocaleLabel(option.value);
  }
  languageSelect.value = i18n.locale;

  for (const option of scenarioSelect.options) {
    option.textContent = scenarioLabel(option.value);
  }

  for (const option of logFilterSelect.options) {
    option.textContent = i18n.t(`logFilter.${option.value}`);
  }
}

// ─── History Trend Chart ──────────────────────────────────────────
function renderHistoryChart(state) {
  if (!historyChartEl || !state?.religions?.length) return;
  const wrap = historyChartEl.parentElement;
  const W = wrap.clientWidth || 300;
  const H = 120;
  historyChartEl.width = W;
  historyChartEl.height = H;
  const ctx = historyChartEl.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Gather all history arrays (last 40 rounds)
  const maxLen = 40;
  const histories = state.religions.map((r) => (r.history || []).slice(-maxLen));
  const allVals = histories.flat();
  const minV = Math.min(...allVals) * 0.96;
  const maxV = Math.max(...allVals) * 1.04;
  const rangeV = maxV - minV || 1;

  const pad = { l: 6, r: 6, t: 8, b: 8 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  // Draw a subtle grid
  ctx.strokeStyle = 'rgba(46,54,95,0.08)';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad.t + (plotH * g) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + plotW, y);
    ctx.stroke();
  }

  if (ghostRunData?.byReligion) {
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.globalAlpha = 0.32;
    for (const religion of state.religions) {
      const ghostHistory = ghostRunData.byReligion[religion.id];
      if (!Array.isArray(ghostHistory) || ghostHistory.length < 2) {
        continue;
      }
      const ghost = ghostHistory.slice(-maxLen);
      ctx.beginPath();
      ctx.strokeStyle = religion.color;
      ctx.lineWidth = 1.1;
      ghost.forEach((val, idx) => {
        const x = pad.l + (idx / Math.max(ghost.length - 1, 1)) * plotW;
        const y = pad.t + plotH - ((val - minV) / rangeV) * plotH;
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }
    ctx.restore();
    ctx.setLineDash([]);
  }

  // Draw each religion's line
  for (let ri = 0; ri < state.religions.length; ri++) {
    const religion = state.religions[ri];
    const hist = histories[ri];
    if (!hist.length) continue;
    ctx.beginPath();
    ctx.strokeStyle = religion.color;
    ctx.lineWidth = religion.isSecular ? 2.5 : 1.5;
    ctx.globalAlpha = 0.82;
    hist.forEach((val, idx) => {
      const x = pad.l + (idx / Math.max(hist.length - 1, 1)) * plotW;
      const y = pad.t + plotH - ((val - minV) / rangeV) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Draw endpoint dot
    const lastVal = hist[hist.length - 1];
    const ex = pad.l + plotW;
    const ey = pad.t + plotH - ((lastVal - minV) / rangeV) * plotH;
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fillStyle = religion.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Racing Bar Chart ─────────────────────────────────────────────
function renderRaceChart(state) {
  if (!raceChartEl || !state?.religions?.length) return;
  const sorted = [...state.religions].sort((a, b) => b.followers - a.followers);
  const maxF = sorted[0]?.followers || 1;
  raceChartEl.innerHTML = sorted
    .map((r) => {
      const pct = Math.round((r.followers / maxF) * 100);
      const deltaClass = r.delta >= 0 ? 'delta-up' : 'delta-down';
      return `<div class="race-row">
        <div class="race-name" title="${religionLabel(r)}">${religionEmoji(r)} ${religionLabel(r)}</div>
        <div class="race-bar-track">
          <div class="race-bar-fill" style="width:${pct}%;background:${r.color}"></div>
        </div>
        <div class="race-val ${deltaClass}">${i18n.number(r.followers)}</div>
      </div>`;
    })
    .join('');
}

// ─── Event Feed (Breaking News) ───────────────────────────────────
const EVENT_COLORS = {
  religious_scandal: '#d14561',
  digital_revival: '#3d9bd4',
  political_persecution: '#8b3a3a',
  migration_wave: '#2a9d8f',
  economic_crisis: '#c4880a',
  youth_awakening: '#6a5acd',
  polarization_spike: '#e76f51',
  pluralism_wave: '#239b5f',
  climate_anxiety: '#607d8b',
  institutional_reform: '#4a86b8',
  global_crisis: '#b3223f'
};

function renderEventFeed(state) {
  if (!eventFeedEl) return;
  const history = state.eventHistory || [];
  const active = state.activeEvents || [];

  if (!history.length && !active.length) {
    eventFeedEl.innerHTML = `<div class="muted" style="font-size:0.8rem;padding:6px">—</div>`;
    return;
  }

  const activeStartRounds = new Set(active.map((a) => `${a.id}_${a.startRound}`));

  // Show banner for new events
  for (const ev of history) {
    const key = `${ev.id}_${ev.round}`;
    if (!shownBannerEvents.has(key)) {
      shownBannerEvents.add(key);
      showEventBanner(ev);
    }
  }

  const recentHistory = [...history].reverse().slice(0, 8);
  eventFeedEl.innerHTML = recentHistory
    .map((ev) => {
      const isActive = activeStartRounds.has(`${ev.id}_${ev.round}`);
      const color = EVENT_COLORS[ev.id] || '#607d8b';
      const label = i18n.t(`event.${ev.id}`);
      const shockText = Object.entries(ev.shock || {})
        .slice(0, 2)
        .map(([k, v]) => `${i18n.t(`signal.${k}`)} ${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`)
        .join(' · ');
      return `<article class="event-item ${isActive ? 'is-active' : ''}" style="--event-color:${color}">
        <div class="event-header">
          <span class="event-badge" style="background:${color}">${isActive ? '🔴' : '◉'}</span>
          <strong>${label}</strong>
          <span class="event-round muted">R${ev.round}</span>
        </div>
        <div class="event-shock muted">${shockText}</div>
      </article>`;
    })
    .join('');
}

function currentForecastUnlockCost() {
  return 12;
}

function updateCorridorCombos(state) {
  if (!state || state.round <= lastComboRound || state.round === 0) {
    return;
  }
  const links = state.structureOutput?.antLinks || [];
  const maxAmount = Math.max(...links.map((item) => Number(item.amount || 0)), 1);
  const activeKeys = new Set();

  for (const link of links) {
    const amount = Number(link.amount || 0);
    const intensity = Number(link.intensity || 0);
    const highFlow = amount >= maxAmount * 0.58 || intensity >= 0.72;
    if (!highFlow) {
      continue;
    }
    const key = `${link.fromReligionId}->${link.toReligionId}`;
    const prev = corridorCombos.get(key);
    const streak = prev && prev.lastRound === state.round - 1 ? prev.streak + 1 : 1;
    const level = Math.min(6, 1 + Math.floor((streak - 1) / 2));
    const boost = 1 + Math.min(0.46, streak * 0.06);
    const gained = 3 + streak * 2;
    comboScore += gained;
    intelPoints += Math.max(1, Math.round(streak * 0.32));
    corridorCombos.set(key, {
      key,
      streak,
      level,
      boost,
      amount,
      fromReligionId: link.fromReligionId,
      toReligionId: link.toReligionId,
      lastRound: state.round
    });
    activeKeys.add(key);
  }

  for (const [key, combo] of corridorCombos.entries()) {
    if (activeKeys.has(key)) {
      continue;
    }
    if (combo.lastRound < state.round - 1) {
      corridorCombos.delete(key);
    } else {
      combo.streak = Math.max(0, combo.streak - 1);
      combo.boost = 1 + Math.min(0.46, combo.streak * 0.06);
      combo.lastRound = state.round;
      corridorCombos.set(key, combo);
    }
  }

  intelPoints += 1;
  lastComboRound = state.round;
}

function topComboEntry() {
  let best = null;
  for (const combo of corridorCombos.values()) {
    if (!best || combo.streak > best.streak || (combo.streak === best.streak && combo.amount > best.amount)) {
      best = combo;
    }
  }
  return best;
}

function queueDecisionFromState(state) {
  if (pendingDecision || !Array.isArray(state?.activeEvents)) {
    return;
  }
  for (const ev of state.activeEvents) {
    const key = `${ev.id}_${ev.startRound}`;
    if (handledDecisionEvents.has(key)) {
      continue;
    }
    const options = DECISION_OPTION_LIBRARY[ev.id];
    if (!Array.isArray(options) || options.length === 0) {
      continue;
    }
    handledDecisionEvents.add(key);
    pendingDecision = {
      key,
      eventId: ev.id,
      title: i18n.t(`event.${ev.id}`),
      options
    };
    if (BURST_EVENT_SET.has(ev.id) && !burstState && state.round !== lastBurstRound) {
      burstState = {
        eventId: ev.id,
        startTs: performance.now(),
        durationMs: 3400,
        resolved: false
      };
    }
    return;
  }
}

async function applySignalDeltas(deltas = {}, reason = '') {
  if (!liveState?.socialSignals) {
    return false;
  }
  const nextSignals = {};
  for (const key of SIGNAL_KEYS) {
    const base = Number(liveState.socialSignals[key] || 0.5);
    const delta = Number(deltas[key] || 0);
    nextSignals[key] = clampValue(base + delta, 0.1, 0.98);
  }
  try {
    const response = await fetch('/api/simulation/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides: nextSignals })
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const result = await response.json();
    if (result?.socialSignals) {
      liveState.socialSignals = result.socialSignals;
      renderSignalSliders(liveState);
      renderMapHud(liveState);
      renderInsights(liveState);
    }
    if (statusEl && reason) {
      statusEl.textContent = reason;
    }
    return true;
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = `${i18n.t('status.error', { message: err.message })}`;
    }
    return false;
  }
}

function renderEventDecisionCard() {
  if (!eventDecisionCardEl) {
    return;
  }
  if (!pendingDecision) {
    eventDecisionCardEl.hidden = true;
    eventDecisionCardEl.innerHTML = '';
    return;
  }

  eventDecisionCardEl.hidden = false;
  eventDecisionCardEl.innerHTML = `
    <div class="event-decision-title">${pendingDecision.title}</div>
    <div class="event-decision-desc">${
      i18n.locale === 'zh-CN'
        ? '突发事件需要立刻抉择。'
        : i18n.locale === 'ja'
          ? '突発イベントへの即時判断が必要です。'
          : 'A breaking event requires immediate strategic choice.'
    }</div>
    <div class="event-decision-options">
      ${pendingDecision.options
        .map(
          (option, index) => `
          <button class="event-decision-option" type="button" data-index="${index}">
            <strong>${localizedText(option.label, option.id)}</strong><br />
            <span>${localizedText(option.desc, '')}</span>
          </button>
        `
        )
        .join('')}
    </div>
  `;

  for (const btn of eventDecisionCardEl.querySelectorAll('.event-decision-option')) {
    btn.addEventListener('click', async () => {
      const index = Number(btn.dataset.index);
      const option = pendingDecision?.options?.[index];
      if (!option) {
        return;
      }
      const done = await applySignalDeltas(
        option.deltas,
        i18n.locale === 'zh-CN'
          ? `已执行策略：${localizedText(option.label, option.id)}`
          : i18n.locale === 'ja'
            ? `戦略を実行: ${localizedText(option.label, option.id)}`
            : `Strategy executed: ${localizedText(option.label, option.id)}`
      );
      if (done) {
        intelPoints += 2;
      }
      pendingDecision = null;
      renderEventDecisionCard();
      renderGameplayHud();
    });
  }
}

function burstDeltaByEvent(eventId, power = 1) {
  const scale = clampValue(power, 0.3, 1.7);
  if (eventId === 'digital_revival') {
    return { digitalization: 0.05 * scale, youthPressure: 0.03 * scale, meaningSearch: 0.02 * scale };
  }
  if (eventId === 'migration_wave') {
    return { migration: 0.06 * scale, socialFragmentation: -0.04 * scale, legalPluralism: 0.03 * scale };
  }
  if (eventId === 'youth_awakening') {
    return { youthPressure: 0.05 * scale, digitalization: 0.02 * scale, identityPolitics: -0.02 * scale };
  }
  if (eventId === 'global_crisis') {
    return { institutionalTrust: 0.06 * scale, socialFragmentation: -0.05 * scale, legalPluralism: 0.03 * scale };
  }
  return { meaningSearch: 0.02 * scale };
}

async function triggerTimingBurst() {
  if (!burstState || burstState.resolved) {
    return;
  }
  const elapsed = performance.now() - burstState.startTs;
  const progress = clampValue(elapsed / burstState.durationMs, 0, 1);
  const precision = 1 - Math.abs(progress - 0.5) * 2;
  const critical = precision >= 0.84;
  const power = 0.7 + precision * (critical ? 1.6 : 1.1);
  const deltas = burstDeltaByEvent(burstState.eventId, power);
  const done = await applySignalDeltas(
    deltas,
    critical
      ? i18n.locale === 'zh-CN'
        ? '节奏暴击成功，已触发高效干预。'
        : i18n.locale === 'ja'
          ? 'タイミングクリティカル成功。高効率介入を発動。'
          : 'Timing critical hit. High-impact intervention triggered.'
      : i18n.locale === 'zh-CN'
        ? '节奏命中，已触发干预。'
        : i18n.locale === 'ja'
          ? 'タイミング命中。介入を発動。'
          : 'Timing burst landed. Intervention applied.'
  );
  if (done) {
    intelPoints += critical ? 6 : 3;
    comboScore += critical ? 12 : 5;
  }
  burstState.resolved = true;
  lastBurstRound = liveState?.round ?? lastBurstRound;
  burstState = null;
  renderGameplayHud();
  renderTimingBurstCard();
}

function renderTimingBurstCard() {
  if (!timingBurstCardEl) {
    return;
  }
  if (!burstState || burstState.resolved) {
    timingBurstCardEl.hidden = true;
    timingBurstCardEl.innerHTML = '';
    return;
  }
  const elapsed = performance.now() - burstState.startTs;
  if (elapsed >= burstState.durationMs) {
    burstState = null;
    timingBurstCardEl.hidden = true;
    timingBurstCardEl.innerHTML = '';
    return;
  }
  const progress = clampValue(elapsed / burstState.durationMs, 0, 1);
  const needleLeft = `${Math.round(progress * 100)}%`;
  const label = i18n.t(`event.${burstState.eventId}`);
  timingBurstCardEl.hidden = false;
  timingBurstCardEl.innerHTML = `
    <div class="timing-burst-title">${
      i18n.locale === 'zh-CN' ? '黄金窗口' : i18n.locale === 'ja' ? 'ゴールデンウィンドウ' : 'Golden Window'
    } · ${label}</div>
    <div class="timing-burst-sub">${
      i18n.locale === 'zh-CN'
        ? '在中线附近触发可获得暴击效果'
        : i18n.locale === 'ja'
          ? '中央付近で発動するとクリティカル'
          : 'Trigger near center for a critical boost'
    }</div>
    <div class="timing-burst-meter">
      <span class="timing-burst-needle" style="left:${needleLeft}"></span>
    </div>
    <button class="timing-burst-btn" type="button">${
      i18n.locale === 'zh-CN' ? '触发 Burst' : i18n.locale === 'ja' ? 'バースト発動' : 'Trigger Burst'
    }</button>
  `;
  const burstBtn = timingBurstCardEl.querySelector('.timing-burst-btn');
  if (burstBtn) {
    burstBtn.addEventListener('click', () => {
      triggerTimingBurst().catch(() => {});
    });
  }
}

function renderBossCrisisPanel(state) {
  if (!bossCrisisPanelEl) {
    return;
  }
  const boss = state?.bossCrisis || null;
  activeBossPanel = boss;
  if (!boss || (!boss.active && !Array.isArray(boss.log))) {
    bossCrisisPanelEl.hidden = true;
    bossCrisisPanelEl.innerHTML = '';
    return;
  }
  const latestLog = Array.isArray(boss.log) && boss.log.length ? boss.log[0] : null;
  const phaseText = boss.active
    ? `${boss.phase}/${boss.totalPhases}`
    : i18n.locale === 'zh-CN'
      ? '已结束'
      : i18n.locale === 'ja'
        ? '終了'
        : 'Resolved';
  bossCrisisPanelEl.hidden = false;
  bossCrisisPanelEl.innerHTML = `
    <div class="boss-crisis-title">${i18n.t('event.global_crisis')} · ${
      i18n.locale === 'zh-CN' ? 'Boss 阶段' : i18n.locale === 'ja' ? 'Boss フェーズ' : 'Boss Phase'
    } ${phaseText}</div>
    <div class="boss-crisis-meta">
      ${
        i18n.locale === 'zh-CN'
          ? `剩余回合: ${boss.roundsLeft || 0}<br />失败阶段: ${boss.failedStages || 0}<br />目标: ${boss.objective || '稳定区域与社会信号'}`
          : i18n.locale === 'ja'
            ? `残りラウンド: ${boss.roundsLeft || 0}<br />失敗フェーズ: ${boss.failedStages || 0}<br />目標: ${boss.objective || '地域と社会シグナルの安定化'}`
            : `Rounds left: ${boss.roundsLeft || 0}<br />Failed phases: ${boss.failedStages || 0}<br />Objective: ${boss.objective || 'Stabilize regions and social signals'}`
      }
    </div>
    ${
      latestLog
        ? `<div class="boss-crisis-log">${
            latestLog.passed
              ? i18n.locale === 'zh-CN'
                ? `R${latestLog.round} P${latestLog.phase}: 通过`
                : i18n.locale === 'ja'
                  ? `R${latestLog.round} P${latestLog.phase}: 成功`
                  : `R${latestLog.round} P${latestLog.phase}: passed`
              : i18n.locale === 'zh-CN'
                ? `R${latestLog.round} P${latestLog.phase}: 失败`
                : i18n.locale === 'ja'
                  ? `R${latestLog.round} P${latestLog.phase}: 失敗`
                  : `R${latestLog.round} P${latestLog.phase}: failed`
          } · ${latestLog.note || ''}</div>`
        : ''
    }
  `;
}

function renderGameplayHud() {
  if (comboBadgeEl) {
    const hot = topComboEntry();
    const streak = hot?.streak || 0;
    comboBadgeEl.textContent =
      i18n.locale === 'zh-CN'
        ? `连击 ×${streak}`
        : i18n.locale === 'ja'
          ? `コンボ ×${streak}`
          : `Combo ×${streak}`;
  }
  if (intelBadgeEl) {
    intelBadgeEl.textContent =
      i18n.locale === 'zh-CN'
        ? `情报 ${Math.floor(intelPoints)}`
        : i18n.locale === 'ja'
          ? `情報 ${Math.floor(intelPoints)}`
          : `Intel ${Math.floor(intelPoints)}`;
  }
  if (intelUnlockBtnEl) {
    const hiddenForecastCount = forecastLinks.filter((item) => !forecastReveal.get(item.key)).length;
    const cost = currentForecastUnlockCost();
    intelUnlockBtnEl.disabled = hiddenForecastCount <= 0 || intelPoints < cost;
    if (i18n.locale === 'zh-CN') {
      intelUnlockBtnEl.textContent = `解锁预测 (${cost})`;
    } else if (i18n.locale === 'ja') {
      intelUnlockBtnEl.textContent = `予測解放 (${cost})`;
    } else {
      intelUnlockBtnEl.textContent = `Unlock Forecast (${cost})`;
    }
  }
}

function unlockNextForecast() {
  if (!liveState) {
    return;
  }
  const hidden = forecastLinks
    .filter((item) => !forecastReveal.get(item.key))
    .sort((a, b) => b.confidence - a.confidence);
  if (!hidden.length) {
    return;
  }
  const cost = currentForecastUnlockCost();
  if (intelPoints < cost) {
    if (statusEl) {
      statusEl.textContent =
        i18n.locale === 'zh-CN'
          ? `情报不足（需要 ${cost}）`
          : i18n.locale === 'ja'
            ? `情報不足（必要 ${cost}）`
            : `Not enough intel (need ${cost})`;
    }
    return;
  }
  intelPoints -= cost;
  forecastReveal.set(hidden[0].key, true);
  updateForecastLinks(liveState, true);
  renderGameplayHud();
}

// ─── Signal Sliders ───────────────────────────────────────────────
const SIGNAL_KEYS = [
  'digitalization','economicStress','migration','institutionalTrust',
  'identityPolitics','youthPressure','meaningSearch','socialFragmentation',
  'secularization','legalPluralism','mediaPolarization','stateRegulation'
];

function renderSignalSliders(state) {
  if (!signalSlidersEl || !state?.socialSignals) return;
  const signals = state.socialSignals;

  signalSlidersEl.innerHTML = SIGNAL_KEYS.map((key) => {
    const val = Number(signals[key] || 0.5);
    const pct = Math.round(val * 100);
    return `<div class="signal-row">
      <div class="signal-row-top">
        <span class="signal-label">${i18n.t(`signal.${key}`)}</span>
        <span class="signal-val">${pct}%</span>
      </div>
      <input class="signal-slider" type="range" min="10" max="98" step="1"
        data-key="${key}" value="${Math.round(val * 100)}" />
    </div>`;
  }).join('');

  // Attach listeners
  for (const input of signalSlidersEl.querySelectorAll('.signal-slider')) {
    input.addEventListener('input', () => {
      // Update display immediately
      const row = input.closest('.signal-row');
      if (row) row.querySelector('.signal-val').textContent = `${input.value}%`;

      clearTimeout(signalSliderDebounce);
      signalSliderDebounce = setTimeout(() => {
        const overrides = {};
        for (const s of signalSlidersEl.querySelectorAll('.signal-slider')) {
          overrides[s.dataset.key] = Number(s.value) / 100;
        }
        postJson('/api/simulation/signals', { overrides }).catch(() => {});
      }, 300);
    });
  }
}

// ─── Religion Detail Modal ────────────────────────────────────────
const TRAIT_KEYS = ['communityService','digitalMission','ritualDepth','intellectualDialog','youthAppeal','identityBond','institutionCapacity'];
const TRAIT_LABELS_SHORT = ['Comm','Digit','Ritual','Intel','Youth','Ident','Inst'];

function drawRadarChart(canvasEl, values, color) {
  const W = canvasEl.width;
  const H = canvasEl.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) - 22;
  const N = values.length;
  const ctx = canvasEl.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const angle0 = -Math.PI / 2;
  function pt(i, r) {
    const a = angle0 + (i / N) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }

  // Grid circles
  for (let g = 1; g <= 4; g++) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const [x, y] = pt(i % N, (R * g) / 4);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(46,54,95,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Spokes
  for (let i = 0; i < N; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const [x, y] = pt(i, R);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(46,54,95,0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Value polygon
  ctx.beginPath();
  values.forEach((v, i) => {
    const [x, y] = pt(i, R * v);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = color + '44';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Labels
  ctx.fillStyle = '#2e365f';
  ctx.font = `600 9.5px "Nunito", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const labels = i18n.locale === 'zh-CN'
    ? ['社群','数字','仪式','对话','青年','身份','组织']
    : i18n.locale === 'ja'
    ? ['奉仕','デジ','儀礼','対話','若者','身分','組織']
    : TRAIT_LABELS_SHORT;
  for (let i = 0; i < N; i++) {
    const [x, y] = pt(i, R + 14);
    ctx.fillText(labels[i], x, y);
  }
}

function drawMiniLineChart(canvasEl, history, color) {
  const W = canvasEl.width;
  const H = canvasEl.height;
  const ctx = canvasEl.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (!history?.length) return;
  const hist = history.slice(-50);
  const minV = Math.min(...hist) * 0.97;
  const maxV = Math.max(...hist) * 1.03;
  const range = maxV - minV || 1;
  const pad = { l: 4, r: 4, t: 6, b: 6 };
  const pw = W - pad.l - pad.r;
  const ph = H - pad.t - pad.b;

  ctx.beginPath();
  hist.forEach((v, i) => {
    const x = pad.l + (i / Math.max(hist.length - 1, 1)) * pw;
    const y = pad.t + ph - ((v - minV) / range) * ph;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Fill under
  const lastX = pad.l + pw;
  const baseY = pad.t + ph;
  ctx.lineTo(lastX, baseY);
  ctx.lineTo(pad.l, baseY);
  ctx.closePath();
  ctx.fillStyle = color + '28';
  ctx.fill();
}

function openReligionModal(religion) {
  if (!modalEl) return;
  currentModalReligionId = religion.id;

  modalTitleEl.textContent = `${religionEmoji(religion)} ${religionLabel(religion)}`;
  modalFollowersEl.textContent = i18n.number(religion.followers);
  const deltaClass = religion.delta >= 0 ? 'delta-up' : 'delta-down';
  modalDeltaEl.className = `modal-stat-delta ${deltaClass}`;
  modalDeltaEl.textContent = formatSigned(religion.delta);

  // Exit barrier bar
  const barrier = Math.round((religion.exitBarrier || 0) * 100);
  modalExitBarrierEl.innerHTML = `
    <div class="modal-exit-label">${i18n.t('modal.exitBarrier')} <strong>${barrier}%</strong></div>
    <div class="modal-exit-bar-track">
      <div class="modal-exit-bar-fill" style="width:${barrier}%;background:${religion.color}"></div>
    </div>`;

  // Labels
  modalTraitsLabelEl.textContent = i18n.t('modal.traits');
  modalStrategyLabelEl.textContent = i18n.t('modal.strategy');
  modalGovernanceLabelEl.textContent = i18n.t('modal.governance');

  // Radar
  const traitVals = TRAIT_KEYS.map((k) => clampValue(Number(religion.traits?.[k] || 0.5), 0, 1));
  drawRadarChart(modalRadarCanvas, traitVals, religion.color);

  // Strategy bars
  const channels = religion.strategy?.channels || {};
  const sortedCh = Object.entries(channels).sort((a, b) => b[1] - a[1]);
  modalStrategyBarsEl.innerHTML = sortedCh.map(([ch, val]) => {
    const pct = Math.round(val * 100);
    return `<div class="strat-row">
      <span class="strat-label">${i18n.t(`signal.${ch === 'digital' ? 'digitalization' : ch === 'service' ? 'economicStress' : ch}`) || ch}</span>
      <div class="strat-bar-track"><div class="strat-bar-fill" style="width:${Math.min(pct * 4, 100)}%;background:${religion.color}"></div></div>
      <span class="strat-pct">${pct}%</span>
    </div>`;
  }).join('');

  // Governance grid
  const gov = religion.governance || {};
  modalGovernanceEl.innerHTML = Object.entries(gov).map(([k, v]) => {
    const pct = Math.round(Number(v) * 100);
    const label = { orthodoxy: '正统', antiProselytization: '反传教', tribunalCapacity: '法庭', dueProcess: '程序正义' }[k] || k;
    return `<div class="gov-item">
      <div class="gov-label">${label}</div>
      <div class="gov-val" style="color:${religion.color}">${pct}%</div>
    </div>`;
  }).join('');

  // Doctrine & classics
  modalDoctrineEl.textContent = religion.doctrineLong || religion.doctrine || '';
  modalClassicsEl.textContent = Array.isArray(religion.classics) ? religion.classics.join(' · ') : '';

  // Mini history chart
  drawMiniLineChart(modalHistoryCanvas, religion.history || [], religion.color);

  modalEl.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeReligionModal() {
  if (modalEl) modalEl.hidden = true;
  document.body.style.overflow = '';
  currentModalReligionId = null;
}

// ─── Screenshot ───────────────────────────────────────────────────
function takeScreenshot() {
  // Force one render so the exported frame matches what user currently sees.
  controls.update();
  renderer.render(scene, camera);

  const round = liveState?.round || 0;
  const filename = `religion-sim-round-${round}.png`;
  renderer.domElement.toBlob(
    (blob) => {
      if (!blob) {
        const dataUrl = renderer.domElement.toDataURL('image/png');
        const fallback = document.createElement('a');
        fallback.href = dataUrl;
        fallback.download = filename;
        fallback.click();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    'image/png',
    1
  );
}

// ─── Export AI Report ─────────────────────────────────────────────
async function exportReport() {
  const reportBtnEl = document.getElementById('reportBtn');
  if (!liveState || !liveState.round) {
    if (statusEl) statusEl.textContent = i18n.t('controls.reportFailed') || 'No simulation data';
    return;
  }

  if (reportBtnEl) {
    reportBtnEl.disabled = true;
    reportBtnEl.classList.add('loading');
  }
  if (statusEl) statusEl.textContent = i18n.t('controls.generatingReport') || 'Generating report...';

  try {
    const resp = await fetch('/api/simulation/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: currentLocale })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${resp.status}`);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `religion-analysis-round-${liveState.round}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (statusEl && liveState) {
      renderAll(liveState);
    }
  } catch (err) {
    console.error('Report export failed:', err);
    if (statusEl) statusEl.textContent = `${i18n.t('controls.reportFailed') || 'Report failed'}: ${err.message}`;
  } finally {
    if (reportBtnEl) {
      reportBtnEl.disabled = false;
      reportBtnEl.classList.remove('loading');
    }
  }
}

function setLocale(locale, rerender = true) {
  const next = normalizeLocale(locale);
  if (!SUPPORTED_LOCALES.includes(next)) {
    return;
  }

  i18n.setLocale(next);
  currentLocale = next;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app_locale', next);
  }

  applyStaticI18n();

  if (!rerender) {
    return;
  }

  if (liveState) {
    renderAll(liveState);
    return;
  }
  statusEl.textContent = i18n.t('status.notStarted');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9ced7');
scene.fog = new THREE.Fog('#b9ced7', 28, 78);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(1, 1, false);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
camera.position.set(0, 30, 42);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minPolarAngle = THREE.MathUtils.degToRad(22);
controls.maxPolarAngle = THREE.MathUtils.degToRad(82);
controls.minDistance = 22;
controls.maxDistance = 95;
controls.target.set(2, 1.6, 0);
controls.update();

const MAP_VIEW_LIMITS = {
  minWidth: 34,
  maxWidth: 88,
  minDepth: 22,
  maxDepth: 58
};
const MAP_VIEW_STATE = {
  width: 56,
  depth: 34,
  target: new THREE.Vector3(1.5, 1.7, 0.2),
  tiltDeg: 35,
  margin: 1.04
};
let cameraFitted = false;
let lastAspect = null;
let hasRegionBounds = false;

function updateMapViewBounds(state) {
  if (!Array.isArray(state?.regions) || state.regions.length === 0) {
    return;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const region of state.regions) {
    const x = Number(region?.position?.x || 0);
    const z = Number(region?.position?.z || 0);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minZ) || !Number.isFinite(maxZ)) {
    return;
  }

  const padX = 6.2;
  const padZ = 5.4;
  minX -= padX;
  maxX += padX;
  minZ -= padZ;
  maxZ += padZ;

  const nextWidth = clampValue(maxX - minX, MAP_VIEW_LIMITS.minWidth, MAP_VIEW_LIMITS.maxWidth);
  const nextDepth = clampValue(maxZ - minZ, MAP_VIEW_LIMITS.minDepth, MAP_VIEW_LIMITS.maxDepth);
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const nextMargin = clampValue(1.01 + Math.max(nextWidth / nextDepth, 0.65) * 0.03, 1.01, 1.12);
  const blend = hasRegionBounds && cameraFitted ? 0.22 : 1;

  MAP_VIEW_STATE.width = MAP_VIEW_STATE.width * (1 - blend) + nextWidth * blend;
  MAP_VIEW_STATE.depth = MAP_VIEW_STATE.depth * (1 - blend) + nextDepth * blend;
  MAP_VIEW_STATE.margin = MAP_VIEW_STATE.margin * (1 - blend) + nextMargin * blend;
  MAP_VIEW_STATE.target.set(
    MAP_VIEW_STATE.target.x * (1 - blend) + centerX * blend,
    1.7,
    MAP_VIEW_STATE.target.z * (1 - blend) + centerZ * blend
  );
  hasRegionBounds = true;
}

function fitCameraToMap(force = false) {
  const width = Math.max(1, stageWrapEl?.clientWidth || canvas.clientWidth || 1);
  const height = Math.max(1, stageWrapEl?.clientHeight || canvas.clientHeight || 1);
  const aspect = width / height;
  const majorAspectChange = lastAspect === null || Math.abs(aspect - lastAspect) > 0.18;
  if (!force && cameraFitted && !majorAspectChange) {
    lastAspect = aspect;
    return;
  }

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const fitDepthDistance = (MAP_VIEW_STATE.depth * 0.5) / Math.tan(vFov / 2);
  const fitWidthDistance = (MAP_VIEW_STATE.width * 0.5) / Math.tan(hFov / 2);
  const distance = Math.max(fitDepthDistance, fitWidthDistance) * MAP_VIEW_STATE.margin;
  const tilt = THREE.MathUtils.degToRad(MAP_VIEW_STATE.tiltDeg);

  controls.target.copy(MAP_VIEW_STATE.target);
  camera.position.set(
    MAP_VIEW_STATE.target.x,
    MAP_VIEW_STATE.target.y + Math.sin(tilt) * distance,
    MAP_VIEW_STATE.target.z + Math.cos(tilt) * distance
  );
  controls.minDistance = distance * 0.42;
  controls.maxDistance = distance * 1.95;
  controls.update();

  cameraFitted = true;
  lastAspect = aspect;
}

function resetCameraView() {
  fitCameraToMap(true);
}

scene.add(new THREE.AmbientLight('#ffffff', 0.8));

const keyLight = new THREE.DirectionalLight('#f5fdff', 1.08);
keyLight.position.set(24, 48, 14);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight('#d2e7f3', 0.58);
fillLight.position.set(-32, 28, -16);
scene.add(fillLight);

const ocean = new THREE.Mesh(
  new THREE.PlaneGeometry(86, 54),
  new THREE.MeshStandardMaterial({
    color: '#9eb8c6',
    roughness: 0.88,
    metalness: 0.04
  })
);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

const grid = new THREE.GridHelper(82, 26, '#6f8a97', '#8fa3ad');
grid.position.y = 0.01;
scene.add(grid);

const mapGroup = new THREE.Group();
scene.add(mapGroup);

const antLinkGroup = new THREE.Group();
scene.add(antLinkGroup);
const antLinks = [];

const forecastGroup = new THREE.Group();
scene.add(forecastGroup);
const forecastMeshes = [];

function addContinent(points) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      shape.moveTo(x, y);
      return;
    }
    shape.lineTo(x, y);
  });

  return shape;
}

function smoothPolygon(points, iterations = 2) {
  let result = points.map(([x, y]) => [x, y]);
  for (let step = 0; step < iterations; step += 1) {
    const next = [];
    for (let i = 0; i < result.length; i += 1) {
      const p0 = result[i];
      const p1 = result[(i + 1) % result.length];
      next.push([p0[0] * 0.75 + p1[0] * 0.25, p0[1] * 0.75 + p1[1] * 0.25]);
      next.push([p0[0] * 0.25 + p1[0] * 0.75, p0[1] * 0.25 + p1[1] * 0.75]);
    }
    result = next;
  }
  return result;
}

function coastlineNoise(x, y, seed) {
  const n1 = Math.sin(x * 0.84 + y * 0.47 + seed * 1.73);
  const n2 = Math.cos(x * 1.41 - y * 0.39 + seed * 2.61);
  return n1 * 0.62 + n2 * 0.38;
}

function buildCoastline(anchors, { smooth = 2, jitter = 0.4, seed = 1 } = {}) {
  const refined = smoothPolygon(anchors, smooth);
  const centerX = refined.reduce((sum, item) => sum + item[0], 0) / refined.length;
  const centerY = refined.reduce((sum, item) => sum + item[1], 0) / refined.length;

  return refined.map(([x, y], index) => {
    const vx = x - centerX;
    const vy = y - centerY;
    const len = Math.max(0.001, Math.hypot(vx, vy));
    const nx = vx / len;
    const ny = vy / len;
    const wave = coastlineNoise(x, y, seed + index * 0.13);
    const amp = jitter * (0.58 + ((Math.sin(index * 0.41 + seed) + 1) * 0.5) * 0.7);
    return [x + nx * wave * amp, y + ny * wave * amp];
  });
}

function addContinentMesh({ anchors, color, smooth = 2, jitter = 0.4, seed = 1, elevation = 0.06 }) {
  const coastline = buildCoastline(anchors, { smooth, jitter, seed });
  const shape = addContinent(coastline);
  const geometry = new THREE.ShapeGeometry(shape);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.03,
      transparent: true,
      opacity: 0.84
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = elevation;
  mapGroup.add(mesh);

  const coastlinePoints = coastline.map(([x, z]) => new THREE.Vector3(x, elevation + 0.02, z));
  const shore = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(coastlinePoints),
    new THREE.LineBasicMaterial({
      color: '#88a69a',
      transparent: true,
      opacity: 0.48
    })
  );
  mapGroup.add(shore);
}

const CONTINENT_PROFILES = [
  {
    anchors: [
      [-27, 11],
      [-24, 14],
      [-19, 15],
      [-14, 12],
      [-10, 8],
      [-9, 3],
      [-11, -1],
      [-16, -2],
      [-22, 1],
      [-27, 6]
    ],
    color: '#bad0c2',
    smooth: 2,
    jitter: 0.46,
    seed: 1.9
  },
  {
    anchors: [
      [-16, -1],
      [-12, -2],
      [-9, -7],
      [-10, -13],
      [-13, -17],
      [-17, -13],
      [-18, -7]
    ],
    color: '#c4d7cb',
    smooth: 2,
    jitter: 0.4,
    seed: 2.6
  },
  {
    anchors: [
      [-2, 12],
      [4, 13],
      [10, 12],
      [16, 10],
      [21, 8],
      [23, 4],
      [22, 0],
      [19, -1],
      [14, 0],
      [9, -1],
      [6, 1],
      [3, 4],
      [-1, 7]
    ],
    color: '#c7d8c6',
    smooth: 2,
    jitter: 0.38,
    seed: 3.2
  },
  {
    anchors: [
      [4, 3],
      [8, 2],
      [10, -2],
      [9, -7],
      [6, -10],
      [3, -8],
      [2, -3]
    ],
    color: '#c3d3bf',
    smooth: 2,
    jitter: 0.33,
    seed: 4.5
  },
  {
    anchors: [
      [11, 1],
      [13, 0],
      [14, -3],
      [12, -5],
      [10, -4],
      [9, -1]
    ],
    color: '#bfd1bf',
    smooth: 2,
    jitter: 0.26,
    seed: 4.9
  },
  {
    anchors: [
      [18, -5],
      [23, -6],
      [25, -10],
      [23, -13],
      [18, -12],
      [16, -8]
    ],
    color: '#c1d5c8',
    smooth: 2,
    jitter: 0.35,
    seed: 5.8
  },
  {
    anchors: [
      [-20, 17],
      [-17, 19],
      [-14, 18],
      [-14, 15],
      [-17, 14],
      [-20, 15]
    ],
    color: '#d4e1d7',
    smooth: 2,
    jitter: 0.24,
    seed: 6.1
  },
  {
    anchors: [
      [19, 7],
      [20, 6],
      [21, 5],
      [20, 4],
      [19, 5]
    ],
    color: '#d7e3d8',
    smooth: 2,
    jitter: 0.18,
    seed: 6.7
  }
];

for (const continent of CONTINENT_PROFILES) {
  addContinentMesh(continent);
}

const regionNodes = new Map();

function createTextSprite(text) {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 96;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgba(38,53,92,0.72)';
  ctx.fillRect(12, 18, 296, 58);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 18, 296, 58);

  ctx.fillStyle = '#f4f8ff';
  ctx.font = '700 34px "Baloo 2", "Nunito", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 160, 48);

  const texture = new THREE.CanvasTexture(c);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.5, 1.35, 1);
  return sprite;
}

function createRegionNode(region, religions) {
  const group = new THREE.Group();
  group.position.set(region.position.x, 0, region.position.z);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.25, 0.28, 28),
    new THREE.MeshStandardMaterial({ color: '#465f6d', roughness: 0.45, metalness: 0.16 })
  );
  base.position.y = 0.14;
  group.add(base);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.08, 18, 64),
    new THREE.MeshStandardMaterial({ color: '#8fa8b6', emissive: '#4f6e82', emissiveIntensity: 0.35 })
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.3;
  group.add(halo);

  const controlRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.08, 0.065, 12, 64),
    new THREE.MeshStandardMaterial({
      color: '#9eb0be',
      emissive: '#9eb0be',
      emissiveIntensity: 0.14,
      transparent: true,
      opacity: 0.34
    })
  );
  controlRing.rotation.x = Math.PI / 2;
  controlRing.position.y = 0.24;
  group.add(controlRing);

  const controlBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshStandardMaterial({
      color: '#b8c7d6',
      emissive: '#b8c7d6',
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0.8
    })
  );
  controlBeacon.position.set(0, 0.45, 2.08);
  group.add(controlBeacon);

  const dominant = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.54, 1, 24),
    new THREE.MeshStandardMaterial({ color: '#7a94a4', roughness: 0.35, metalness: 0.28 })
  );
  dominant.position.y = 0.5;
  group.add(dominant);

  const label = createTextSprite(regionLabel(region));
  label.position.set(0, 2.9, 0);
  group.add(label);

  const bars = new Map();
  const radius = 1.86;
  religions.forEach((religion, index) => {
    const angle = (index / religions.length) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 1, 0.28),
      new THREE.MeshStandardMaterial({ color: religion.color, roughness: 0.42, metalness: 0.11 })
    );
    bar.position.set(x, 0.5, z);
    group.add(bar);

    bars.set(religion.id, {
      mesh: bar,
      currentHeight: 0.2,
      targetHeight: 0.2
    });
  });

  mapGroup.add(group);

  regionNodes.set(region.id, {
    group,
    bars,
    dominant,
    halo,
    controlRing,
    controlBeacon,
    label,
    currentDominantHeight: 0.9,
    targetDominantHeight: 0.9,
    dominantColor: '#7a94a4',
    ownerColor: '#96a9bb',
    currentControl: 0.22,
    targetControl: 0.22
  });
}

function clearRegionNodes() {
  for (const node of regionNodes.values()) {
    node.group.traverse((obj) => {
      if (!obj.isMesh && !obj.isSprite) {
        return;
      }

      if (obj.material?.map) {
        obj.material.map.dispose();
      }
      if (obj.material) {
        obj.material.dispose();
      }
      if (obj.geometry) {
        obj.geometry.dispose();
      }
    });
    mapGroup.remove(node.group);
  }
  regionNodes.clear();
}

function ensureRegionNodes(state) {
  const key = state.religions.map((r) => r.id).join('|');
  if (
    religionOrder.join('|') !== key ||
    regionNodes.size !== state.regions.length ||
    regionNodeLocale !== currentLocale
  ) {
    religionOrder = state.religions.map((r) => r.id);
    regionNodeLocale = currentLocale;
    clearRegionNodes();
    state.regions.forEach((region) => createRegionNode(region, state.religions));
  }
}

function updateMap(state) {
  ensureRegionNodes(state);
  const religionById = new Map(state.religions.map((item) => [item.id, item]));
  const regionControlById = new Map((state.regionControl || []).map((item) => [item.regionId, item]));

  state.regions.forEach((region) => {
    const node = regionNodes.get(region.id);
    if (!node) {
      return;
    }

    const dist = new Map(region.distribution.map((item) => [item.id, item]));
    for (const [religionId, barNode] of node.bars.entries()) {
      const share = dist.get(religionId)?.share || 0;
      barNode.targetHeight = 0.12 + share * 9.4;
    }

    const dominantShare = region.distribution[0]?.share || 0;
    node.targetDominantHeight = 0.6 + dominantShare * 11;

    const dominant = religionById.get(region.dominantReligionId);
    if (dominant) {
      node.dominantColor = dominant.color;
      node.dominant.material.color.set(dominant.color);
      node.halo.material.color.set(dominant.color);
      node.halo.material.emissive.set(dominant.color);
      node.halo.material.emissiveIntensity = 0.22 + region.competitionIndex * 0.5;
    }

    const control = regionControlById.get(region.id);
    const owner = control ? religionById.get(control.ownerId) : dominant;
    node.targetControl = clampValue(Number(control?.control || dominantShare), 0.06, 1);
    if (owner) {
      node.ownerColor = owner.color;
      if (node.controlRing?.material) {
        node.controlRing.material.color.set(owner.color);
        node.controlRing.material.emissive.set(owner.color);
      }
      if (node.controlBeacon?.material) {
        node.controlBeacon.material.color.set(owner.color);
        node.controlBeacon.material.emissive.set(owner.color);
      }
    }

    node.label.position.y = node.targetDominantHeight + 1.25;
  });
}

function disposeObject3D(obj) {
  if (!obj) {
    return;
  }
  if (obj.material?.map) {
    obj.material.map.dispose();
  }
  if (obj.material) {
    obj.material.dispose();
  }
  if (obj.geometry) {
    obj.geometry.dispose();
  }
}

function clearAntLinks() {
  for (const link of antLinks) {
    if (link.backLine) {
      antLinkGroup.remove(link.backLine);
      disposeObject3D(link.backLine);
    }
    antLinkGroup.remove(link.line);
    disposeObject3D(link.line);
    if (link.glowLine) {
      antLinkGroup.remove(link.glowLine);
      disposeObject3D(link.glowLine);
    }
    if (link.pulse) {
      antLinkGroup.remove(link.pulse);
      disposeObject3D(link.pulse);
    }
    if (link.head) {
      antLinkGroup.remove(link.head);
      disposeObject3D(link.head);
    }
    for (const ant of link.ants) {
      antLinkGroup.remove(ant);
      disposeObject3D(ant);
    }
  }
  antLinks.length = 0;
}

function buildAntCurve(start, end, curveFactor) {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
  if (perpendicular.lengthSq() < 0.001) {
    perpendicular.set(1, 0, 0);
  }
  perpendicular.normalize();

  const arcHeight = 1.1 + direction.length() * 0.07;
  midpoint.y = arcHeight;
  midpoint.add(perpendicular.multiplyScalar(curveFactor * 0.9));

  return new THREE.QuadraticBezierCurve3(start, midpoint, end);
}

function updateAntLinks(state) {
  clearAntLinks();
  const links = state.structureOutput?.antLinks || [];
  if (!links.length) {
    return;
  }

  const regionById = new Map(state.regions.map((region) => [region.id, region]));
  const religionById = new Map(state.religions.map((religion) => [religion.id, religion]));

  for (const link of links) {
    const fromRegion = regionById.get(link.fromRegionId);
    const toRegion = regionById.get(link.toRegionId);
    if (!fromRegion || !toRegion) {
      continue;
    }

    const start = new THREE.Vector3(fromRegion.position.x, 0.42, fromRegion.position.z);
    const end = new THREE.Vector3(toRegion.position.x, 0.42, toRegion.position.z);
    if (start.distanceTo(end) < 0.3) {
      continue;
    }

    const curve = buildAntCurve(start, end, Number(link.curve || 0.8));
    const points = curve.getPoints(64);

    const sourceColor = religionById.get(link.fromReligionId)?.color || '#29485a';
    const targetColor = religionById.get(link.toReligionId)?.color || '#f1f6ff';
    const pairKey = `${link.fromReligionId}->${link.toReligionId}`;
    const combo = corridorCombos.get(pairKey);
    const comboBoost = combo ? combo.boost : 1;
    const friction = clampValue(Number(link.friction || 0), 0, 0.88);
    const intensity = clampValue(Number(link.intensity || 0.4) * comboBoost * (1 - friction * 0.25), 0.1, 1.45);
    const sourceTone = new THREE.Color(sourceColor);
    const targetTone = new THREE.Color(targetColor);
    const dashTone = sourceTone.clone().lerp(new THREE.Color('#ffffff'), 0.26 + intensity * 0.18);
    const glowTone = targetTone.clone().lerp(new THREE.Color('#ffffff'), 0.2 + intensity * 0.12);

    const backLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: '#1c2c39',
        transparent: true,
        opacity: 0.2 + intensity * 0.18
      })
    );
    antLinkGroup.add(backLine);

    const dashedMaterial = new THREE.LineDashedMaterial({
      color: dashTone,
      transparent: true,
      opacity: 0.6 + intensity * 0.24,
      dashSize: 0.62 + intensity * 1.25,
      gapSize: 0.22 + (1 - intensity) * 0.24
    });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), dashedMaterial);
    line.computeLineDistances();
    antLinkGroup.add(line);

    const glowLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: glowTone,
        transparent: true,
        opacity: 0.22 + intensity * 0.24,
        blending: THREE.AdditiveBlending
      })
    );
    antLinkGroup.add(glowLine);

    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.24, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: glowTone,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.copy(end.clone().setY(0.28));
    antLinkGroup.add(pulse);

    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.1 + intensity * 0.08, 0.42 + intensity * 0.24, 12),
      new THREE.MeshStandardMaterial({
        color: dashTone,
        emissive: glowTone,
        emissiveIntensity: 0.76,
        roughness: 0.28,
        metalness: 0.12
      })
    );
    antLinkGroup.add(head);

    const antCount = clampValue(Number(link.ants || 5), 4, 16);
    const ants = [];
    for (let i = 0; i < antCount; i += 1) {
      const ant = new THREE.Mesh(
        new THREE.SphereGeometry(0.082 + intensity * 0.05, 12, 12),
        new THREE.MeshStandardMaterial({
          color: glowTone,
          emissive: glowTone,
          emissiveIntensity: 0.72,
          roughness: 0.28,
          metalness: 0.1
        })
      );
      ant.position.copy(curve.getPointAt(i / antCount));
      ants.push(ant);
      antLinkGroup.add(ant);
    }

    antLinks.push({
      backLine,
      line,
      glowLine,
      pulse,
      head,
      curve,
      ants,
      speed:
        (0.016 + clampValue(Number(link.speed || 0.3), 0.08, 1.2) * 0.02) *
        (1 + (combo ? Math.min(0.42, combo.streak * 0.05) : 0)) *
        (1 - friction * 0.32),
      intensity,
      friction,
      pairKey,
      phase: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
}

function clearForecastLinks() {
  for (const mesh of forecastMeshes) {
    forecastGroup.remove(mesh);
    disposeObject3D(mesh);
  }
  forecastMeshes.length = 0;
  forecastLinks.length = 0;
}

function updateForecastLinks(state, force = false) {
  if (!state) {
    clearForecastLinks();
    return;
  }
  if (!force && lastForecastRound === state.round && forecastMeshes.length > 0) {
    return;
  }

  clearForecastLinks();
  const transferList = (state.topTransfers || []).slice(0, 8);
  if (!transferList.length) {
    lastForecastRound = state.round;
    return;
  }

  const linkByPair = new Map(
    (state.structureOutput?.antLinks || []).map((item) => [`${item.fromReligionId}->${item.toReligionId}`, item])
  );
  const religionById = new Map((state.religions || []).map((religion) => [religion.id, religion]));
  const maxAmount = Math.max(...transferList.map((item) => Number(item.amount || 0)), 1);

  for (const transfer of transferList) {
    const key = `${transfer.fromId}->${transfer.toId}`;
    const link = linkByPair.get(key);
    if (!link) {
      continue;
    }
    const from = new THREE.Vector3(link.fromPosition?.x || 0, 0.55, link.fromPosition?.z || 0);
    const to = new THREE.Vector3(link.toPosition?.x || 0, 0.55, link.toPosition?.z || 0);
    if (from.distanceTo(to) < 0.3) {
      continue;
    }
    const curve = buildAntCurve(from, to, Number(link.curve || 0.75) * 0.9);
    const points = curve.getPoints(44);
    const confidence = clampValue(Number(transfer.amount || 0) / maxAmount, 0.16, 0.96);
    const revealed = Boolean(forecastReveal.get(key));
    const fromColor = religionById.get(transfer.fromId)?.color || '#97a8bc';
    const toColor = religionById.get(transfer.toId)?.color || '#d4dfec';
    const color = revealed
      ? new THREE.Color(fromColor).lerp(new THREE.Color(toColor), 0.46)
      : new THREE.Color('#afbbca');
    const material = revealed
      ? new THREE.LineDashedMaterial({
          color,
          transparent: true,
          opacity: 0.2 + confidence * 0.34,
          dashSize: 0.52,
          gapSize: 0.22
        })
      : new THREE.LineDashedMaterial({
          color,
          transparent: true,
          opacity: 0.12 + confidence * 0.16,
          dashSize: 0.2,
          gapSize: 0.25
        });
    const mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    mesh.computeLineDistances();
    forecastGroup.add(mesh);
    forecastMeshes.push(mesh);
    forecastLinks.push({
      key,
      confidence,
      revealed
    });
  }
  lastForecastRound = state.round;
}

function renderCards(state) {
  religionCardsEl.innerHTML = state.religions
    .map((religion) => {
      const deltaClass = religion.delta >= 0 ? 'delta-up' : 'delta-down';
      const barrierPct = Math.round((religion.exitBarrier || 0) * 100);
      return `
        <article class="religion-card" style="--tone:${religion.color}" data-id="${religion.id}" tabindex="0" role="button">
          <div class="row-title">
            <span>${religionDisplay(religion)}</span>
            <span>${i18n.number(religion.followers)} <span class="${deltaClass}">(${formatSigned(religion.delta)})</span></span>
          </div>
          <div class="sub"><strong>${i18n.t('card.inOut')}：</strong>${religion.transferIn} / ${religion.transferOut}</div>
          <div class="card-barrier-bar" title="${i18n.t('modal.exitBarrier')} ${barrierPct}%">
            <div class="card-barrier-fill" style="width:${barrierPct}%;background:${religion.color}88"></div>
          </div>
          <div class="sub"><strong>${i18n.t('card.action')}：</strong>${religion.lastAction}</div>
        </article>
      `;
    })
    .join('');

  // Attach click → modal
  for (const card of religionCardsEl.querySelectorAll('.religion-card')) {
    card.addEventListener('click', () => {
      const r = state.religions.find((x) => x.id === card.dataset.id);
      if (r) openReligionModal(r);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const r = state.religions.find((x) => x.id === card.dataset.id);
        if (r) openReligionModal(r);
      }
    });
  }
}

function renderRegionBoard(state) {
  const religionById = new Map(state.religions.map((religion) => [religion.id, religion]));
  const controlByRegion = new Map((state.regionControl || []).map((item) => [item.regionId, item]));

  regionBoardEl.innerHTML = state.regions
    .map((region) => {
      const top = region.distribution[0];
      const topReligion = religionById.get(top.id);
      const percent = Math.round(top.share * 1000) / 10;
      const intensity = Math.round(region.competitionIndex * 100);
      const control = controlByRegion.get(region.id);
      const owner = control ? religionById.get(control.ownerId) : null;
      const controlText = control
        ? i18n.locale === 'zh-CN'
          ? `控制度 ${Math.round((control.control || 0) * 100)}% · 连续 ${control.streak || 0} 轮`
          : i18n.locale === 'ja'
            ? `支配度 ${Math.round((control.control || 0) * 100)}% · 連続 ${control.streak || 0} ラウンド`
            : `Control ${Math.round((control.control || 0) * 100)}% · Streak ${control.streak || 0}`
        : i18n.t('common.none');
      return `
        <article class="region-item">
          <div class="region-head">
            <span>${regionLabel(region)}</span>
            <span>${religionDisplay(topReligion || { id: top.id, name: top.name })} ${percent}%</span>
          </div>
          <div class="sub muted">${i18n.t('region.summary', {
            total: i18n.number(region.totalFollowers),
            intensity
          })}</div>
          <div class="sub muted">${
            owner
              ? `${religionEmoji(owner)} ${religionLabel(owner)} · ${controlText}`
              : controlText
          }</div>
          <div class="region-bar"><div class="region-bar-fill" style="width:${Math.min(100, intensity)}%"></div></div>
        </article>
      `;
    })
    .join('');
}

function renderTransferBoard(state) {
  if (!state.topTransfers.length) {
    transferBoardEl.innerHTML = `<div class="muted">${i18n.t('transfer.empty')}</div>`;
    return;
  }

  const religionById = new Map(state.religions.map((religion) => [religion.id, religion]));
  const linkByPair = new Map(
    (state.structureOutput?.antLinks || []).map((link) => [
      `${link.fromReligionId}->${link.toReligionId}`,
      link
    ])
  );

  transferBoardEl.innerHTML = state.topTransfers
    .slice(0, 12)
    .map((item) => {
      const fromReligion = religionById.get(item.fromId);
      const toReligion = religionById.get(item.toId);
      const corridor = linkByPair.get(`${item.fromId}->${item.toId}`);
      const sourceLabel = i18n.t(item.source === 'ai' ? 'transfer.ai' : 'transfer.rule');
      const corridorText = corridor
        ? `${regionLabel({ id: corridor.fromRegionId, name: corridor.fromRegionName })} -> ${regionLabel({
            id: corridor.toRegionId,
            name: corridor.toRegionName
          })}`
        : i18n.t('common.none');
      const intensityText = corridor ? formatPercent(corridor.intensity, 0) : i18n.t('common.none');
      const speedText = corridor ? corridor.speed.toFixed(2) : i18n.t('common.none');
      const pairKey = `${item.fromId}->${item.toId}`;
      const combo = corridorCombos.get(pairKey);
      const comboText = combo
        ? i18n.locale === 'zh-CN'
          ? `连击 ×${combo.streak}`
          : i18n.locale === 'ja'
            ? `コンボ ×${combo.streak}`
            : `Combo ×${combo.streak}`
        : i18n.t('common.none');
      const factors = Array.isArray(item.reasonFactors) ? item.reasonFactors.slice(0, 3) : [];
      const factorText = factors.length
        ? factors
            .map((factor) => `${factor.label} ${formatPercent(Number(factor.score || 0), 0)}`)
            .join(' · ')
        : i18n.t('common.none');
      return `
      <article class="transfer-item">
        <div><strong>${religionDisplay(fromReligion || { id: item.fromId, name: item.from })}</strong> -> <strong>${religionDisplay(toReligion || { id: item.toId, name: item.to })}</strong>：${i18n.number(item.amount)}</div>
        <div class="muted">[${sourceLabel}] ${item.reason}</div>
        <div class="transfer-factors">${i18n.t('transfer.factors')} ${factorText}</div>
        <div class="transfer-corridor">${i18n.t('transfer.corridor')} ${corridorText} · ${i18n.t('transfer.intensity')} ${intensityText} · ${i18n.t('transfer.speed')} ${speedText} · ${comboText}</div>
      </article>
    `;
    })
    .join('');
}

function renderInsights(state) {
  const links = state.structureOutput?.antLinks || [];
  const topTransfer = state.topTransfers[0] || null;
  const judgmentCount = Array.isArray(state.judgmentRecords) ? state.judgmentRecords.length : 0;
  const metrics = state.roundMetrics || {};
  const fallbackFlow = links.length
    ? links.reduce((sum, item) => sum + item.amount, 0)
    : state.topTransfers.reduce((sum, item) => sum + item.amount, 0);
  const totalFlow = Number(metrics.totalFlow ?? fallbackFlow);
  const aiFlow = links.reduce((sum, item) => sum + (item.source === 'ai' ? item.amount : 0), 0);
  const aiShare = totalFlow > 0 ? aiFlow / totalFlow : 0;

  const religionById = new Map(state.religions.map((religion) => [religion.id, religion]));
  const dominantReligion = [...state.religions].sort((a, b) => b.followers - a.followers)[0];
  const mostCompetitiveRegion = [...state.regions].sort(
    (a, b) => b.competitionIndex - a.competitionIndex
  )[0];

  const strongestCorridorText = topTransfer
    ? `${religionDisplay(religionById.get(topTransfer.fromId) || { id: topTransfer.fromId, name: topTransfer.from })} -> ${religionDisplay(
        religionById.get(topTransfer.toId) || { id: topTransfer.toId, name: topTransfer.to }
      )} (${i18n.number(topTransfer.amount)})`
    : i18n.t('insight.noData');
  const dominantReligionText = dominantReligion
    ? `${religionDisplay(dominantReligion)} (${formatPercent(
        dominantReligion.followers / state.totalFollowers,
        1
      )})`
    : i18n.t('insight.noData');
  const competitiveRegionText = mostCompetitiveRegion
    ? `${regionLabel(mostCompetitiveRegion)} (${formatPercent(mostCompetitiveRegion.competitionIndex, 0)})`
    : i18n.t('insight.noData');

  const engineLabel = i18n.t(`engine.${state.transferEngine || 'rule'}`);
  const scenarioText = scenarioLabel(state.scenario || 'balanced');

  const items = [
    [i18n.t('insight.scenario'), scenarioText],
    [i18n.t('insight.totalFlow'), i18n.number(totalFlow)],
    [i18n.t('insight.judgmentRatio'), formatPercent(metrics.judgmentRatio || 0, 1)],
    [i18n.t('insight.conversionEfficiency'), formatPercent(metrics.netConversionEfficiency || 0, 1)],
    [i18n.t('insight.regionalVolatility'), formatPercent(metrics.regionalVolatility || 0, 1)],
    [i18n.t('insight.aiShare'), formatPercent(aiShare, 1)],
    [i18n.t('insight.strongestCorridor'), strongestCorridorText],
    [i18n.t('insight.dominantReligion'), dominantReligionText],
    [i18n.t('insight.mostCompetitiveRegion'), competitiveRegionText],
    [i18n.t('insight.judgmentCount'), i18n.number(judgmentCount)],
    [i18n.t('insight.lineCount'), i18n.number(links.length)],
    [i18n.t('insight.engine'), engineLabel]
  ];

  insightBoardEl.innerHTML = items
    .map(
      ([key, value]) => `
      <article class="insight-item">
        <div class="insight-key">${key}</div>
        <div class="insight-value">${value}</div>
      </article>
    `
    )
    .join('');
}

function renderMapHud(state) {
  const links = state.structureOutput?.antLinks || [];
  const signalEntries = Object.entries(state.socialSignals || {})
    .map(([id, score]) => ({ id, score: Number(score) || 0 }))
    .sort((a, b) => b.score - a.score);
  const topSignal = signalEntries[0];
  const hotCombo = topComboEntry();
  const ghostGap = (() => {
    if (!ghostRunData?.byReligion) {
      return null;
    }
    const currentTop = [...state.religions].sort((a, b) => b.followers - a.followers)[0];
    if (!currentTop) {
      return null;
    }
    const ghostSeries = ghostRunData.byReligion[currentTop.id];
    if (!Array.isArray(ghostSeries) || ghostSeries.length === 0) {
      return null;
    }
    const idx = clampValue(state.round, 0, ghostSeries.length - 1);
    const ghostVal = Number(ghostSeries[idx] || 0);
    return currentTop.followers - ghostVal;
  })();

  mapHudStatsEl.innerHTML = `
    <article class="hud-chip">
      <div class="hud-label">${i18n.t('hud.round')}</div>
      <div class="hud-value">${i18n.number(state.round)}</div>
    </article>
    <article class="hud-chip">
      <div class="hud-label">${i18n.t('hud.totalFollowers')}</div>
      <div class="hud-value">${i18n.number(state.totalFollowers)}</div>
    </article>
    <article class="hud-chip">
      <div class="hud-label">${i18n.t('hud.activeLines')}</div>
      <div class="hud-value">${i18n.number(links.length)}</div>
    </article>
    <article class="hud-chip">
      <div class="hud-label">${i18n.t('hud.topSignal')}</div>
      <div class="hud-value">${
        topSignal
          ? `${i18n.t(`signal.${topSignal.id}`)} ${formatPercent(topSignal.score, 0)}`
          : i18n.t('common.none')
      }</div>
    </article>
    <article class="hud-chip">
      <div class="hud-label">${i18n.locale === 'zh-CN' ? '连锁走廊' : i18n.locale === 'ja' ? '連鎖回廊' : 'Combo Corridor'}</div>
      <div class="hud-value">${
        hotCombo
          ? `${hotCombo.streak}x · ${i18n.number(hotCombo.amount)}`
          : i18n.locale === 'zh-CN'
            ? '暂无'
            : i18n.locale === 'ja'
              ? 'なし'
              : 'None'
      }</div>
    </article>
    <article class="hud-chip">
      <div class="hud-label">${i18n.locale === 'zh-CN' ? '对比上局' : i18n.locale === 'ja' ? '前回比較' : 'Vs Ghost'}</div>
      <div class="hud-value">${
        ghostGap === null
          ? i18n.t('common.none')
          : `${ghostGap >= 0 ? '+' : ''}${i18n.number(Math.round(ghostGap))}`
      }</div>
    </article>
  `;

  const sortedReligions = [...state.religions]
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 8);
  mapLegendEl.innerHTML = sortedReligions
    .map((religion) => {
      const share = state.totalFollowers > 0 ? religion.followers / state.totalFollowers : 0;
      return `
      <article class="legend-pill">
        <div class="legend-name">
          <span class="legend-dot" style="background:${religion.color}"></span>
          <span class="legend-text">${religionEmoji(religion)} ${religionLabel(religion)}</span>
        </div>
        <span>${formatPercent(share, 1)}</span>
      </article>
    `;
    })
    .join('');
}

function renderLogs(state) {
  const religionById = new Map(state.religions.map((religion) => [religion.id, religion]));
  const filtered =
    activeLogFilter === 'all'
      ? state.logs
      : state.logs.filter((log) => (log.type || 'mission') === activeLogFilter);
  const recent = filtered.slice(-24).reverse();

  if (!recent.length) {
    logListEl.innerHTML = `<div class="muted">${i18n.t('log.empty')}</div>`;
    return;
  }

  logListEl.innerHTML = recent
    .map((log) => {
      const religion = log.religionId ? religionById.get(log.religionId) : null;
      const religionName = religion
        ? religionDisplay(religion)
        : `${religionEmojiById(log.religionId)} ${log.name || ''}`.trim();
      const title = i18n.t('log.header', {
        round: log.round,
        time: i18n.time(log.time),
        name: religionName
      });
      const delta = formatSigned(log.delta);
      const isJudgment = log.type === 'judgment';
      const net = isJudgment
        ? `${i18n.t('log.judgment')} · ${i18n.number(log.judgment?.blocked || log.transferOut || 0)}`
        : i18n.t('log.net', {
            delta,
            inflow: log.transferIn,
            outflow: log.transferOut
          });
      return `
      <article class="log-item ${isJudgment ? 'is-judgment' : ''}">
        <div class="log-meta">${title}</div>
        <div>${isJudgment ? `<span class="log-tag">${i18n.t('log.judgment')}</span>` : ''}${log.action}</div>
        <div class="log-meta">${net}</div>
      </article>
    `;
    })
    .join('');
}

function renderAll(state) {
  liveState = state;
  if (state.round > lastProcessedRound) {
    updateCorridorCombos(state);
    queueDecisionFromState(state);
    lastProcessedRound = state.round;
  }
  updateMapViewBounds(state);
  if (state.scenario && scenarioSelect.value !== state.scenario) {
    scenarioSelect.value = state.scenario;
  }
  const invariant = i18n.t(state.invariantOk ? 'status.invariantFixed' : 'status.invariantAbnormal');
  const engine = i18n.t(`engine.${state.transferEngine || 'rule'}`);
  const aiEnabled = Boolean(state.useAI ?? state.useOpenAI);
  const ai = i18n.t(aiEnabled ? 'common.on' : 'common.off');
  const provider = i18n.t(`provider.${state.provider || 'openai'}`);
  statusEl.textContent = i18n.t('status.running', {
    round: state.round,
    total: i18n.number(state.totalFollowers),
    target: i18n.number(state.targetTotalFollowers),
    invariant,
    engine,
    ai,
    provider
  });

  renderCards(state);
  renderInsights(state);
  renderRegionBoard(state);
  renderTransferBoard(state);
  renderLogs(state);
  renderMapHud(state);
  updateMap(state);
  updateAntLinks(state);
  updateForecastLinks(state);
  syncCanvasEventEffects(state.activeEvents || []);

  // New panels
  renderHistoryChart(state);
  renderRaceChart(state);
  renderEventFeed(state);
  renderSignalSliders(state);
  renderGameplayHud();
  renderEventDecisionCard();
  renderTimingBurstCard();
  renderBossCrisisPanel(state);

  // If modal is open, refresh it with updated data
  if (currentModalReligionId && !modalEl.hidden) {
    const r = state.religions.find((x) => x.id === currentModalReligionId);
    if (r) openReligionModal(r);
  }
}

function resizeRenderer() {
  const rect = stageWrapEl?.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect?.width || canvas.clientWidth || 1));
  const height = Math.max(1, Math.floor(rect?.height || canvas.clientHeight || 1));
  renderer.setSize(width, height, false);
  if (fxCanvas) {
    fxCanvas.width = width;
    fxCanvas.height = height;
  }
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  fitCameraToMap(false);
}

window.addEventListener('resize', resizeRenderer);
if (typeof ResizeObserver !== 'undefined' && stageWrapEl) {
  const ro = new ResizeObserver(() => resizeRenderer());
  ro.observe(stageWrapEl);
}
fitCameraToMap(true);
resizeRenderer();

function syncCanvasEventEffects(events = []) {
  activeCanvasEvents = Array.isArray(events) ? events.slice() : [];
}

function getEventPower(eventId) {
  if (!activeCanvasEvents.length) {
    return 0;
  }
  let power = 0;
  for (const event of activeCanvasEvents) {
    if (event.id !== eventId) {
      continue;
    }
    const duration = Math.max(1, Number(event.duration || 1));
    const roundsLeft = clampValue(Number(event.roundsLeft || duration), 0, duration);
    const life = roundsLeft / duration;
    power += 0.42 + life * 0.58;
  }
  return clampValue(power, 0, 1.6);
}

function projectWorldToFx(x, y, z) {
  if (!fxCanvas) {
    return null;
  }
  PROJECTED_POINT.set(x, y, z).project(camera);
  if (PROJECTED_POINT.z < -1 || PROJECTED_POINT.z > 1) {
    return null;
  }
  return {
    x: (PROJECTED_POINT.x * 0.5 + 0.5) * fxCanvas.width,
    y: (-PROJECTED_POINT.y * 0.5 + 0.5) * fxCanvas.height
  };
}

function projectRegionToFx(regionId, y = 0.8) {
  const region = liveState?.regions?.find((item) => item.id === regionId);
  if (!region) {
    return null;
  }
  return projectWorldToFx(Number(region.position?.x || 0), y, Number(region.position?.z || 0));
}

function drawCanvasEventFx(time) {
  if (!fxCtx || !fxCanvas) {
    return;
  }
  const ctx = fxCtx;
  const width = fxCanvas.width;
  const height = fxCanvas.height;
  ctx.clearRect(0, 0, width, height);
  if (!activeCanvasEvents.length) {
    return;
  }

  const scandal = getEventPower('religious_scandal');
  if (scandal > 0) {
    const pulse = (Math.sin(time * 8.3) + 1) * 0.5;
    ctx.fillStyle = colorToRgba('#9f1732', 0.05 + scandal * 0.08);
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = colorToRgba('#ff4f63', (0.08 + pulse * 0.2) * scandal);
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.14, width * 0.35, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const digital = getEventPower('digital_revival');
  if (digital > 0) {
    const onlinePoint = projectRegionToFx('global_online', 0.9) || { x: width * 0.52, y: height * 0.74 };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i += 1) {
      const y = (time * 180 + i * 52) % (height + 40) - 20;
      ctx.fillStyle = colorToRgba('#5be9ff', (0.02 + digital * 0.04) * (1 - i / 9));
      ctx.fillRect(0, y, width, 2 + digital * 1.3);
    }
    const radius = 24 + ((Math.sin(time * 5.4) + 1) * 0.5) * (40 + digital * 60);
    ctx.strokeStyle = colorToRgba('#8ef5ff', 0.28 + digital * 0.24);
    ctx.lineWidth = 2 + digital * 2.2;
    ctx.beginPath();
    ctx.arc(onlinePoint.x, onlinePoint.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const persecution = getEventPower('political_persecution');
  if (persecution > 0) {
    ctx.save();
    ctx.strokeStyle = colorToRgba('#d32f2f', 0.1 + persecution * 0.16);
    ctx.lineWidth = 5 + persecution * 3;
    for (let x = -width * 0.2; x < width * 1.2; x += 38) {
      const offset = ((time * 110) % 40) - 20;
      ctx.beginPath();
      ctx.moveTo(x + offset, -20);
      ctx.lineTo(x + offset - 26, height + 20);
      ctx.stroke();
    }
    ctx.restore();
  }

  const migration = getEventPower('migration_wave');
  if (migration > 0 && Array.isArray(liveState?.structureOutput?.antLinks)) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.2 + migration * 1.8;
    for (const [index, link] of liveState.structureOutput.antLinks.slice(0, 8).entries()) {
      const start = projectWorldToFx(link.fromPosition?.x || 0, 0.92, link.fromPosition?.z || 0);
      const end = projectWorldToFx(link.toPosition?.x || 0, 0.92, link.toPosition?.z || 0);
      if (!start || !end) {
        continue;
      }
      const controlX = (start.x + end.x) * 0.5 + Math.sin(time * 2.1 + index) * 24;
      const controlY = (start.y + end.y) * 0.5 - (18 + migration * 18);
      ctx.setLineDash([10 + migration * 8, 12]);
      ctx.lineDashOffset = -(time * 130 + index * 17);
      ctx.strokeStyle = colorToRgba('#ffe9a3', 0.18 + migration * 0.2);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(controlX, controlY, end.x, end.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  const crisis = getEventPower('economic_crisis');
  if (crisis > 0) {
    ctx.fillStyle = colorToRgba('#2a1f25', 0.08 + crisis * 0.14);
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = colorToRgba('#ff9e57', 0.1 + crisis * 0.14);
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i += 1) {
      const x = ((i * 113 + time * 73) % (width + 120)) - 60;
      const y = ((i * 59 + time * 37) % (height + 120)) - 60;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y + 10);
      ctx.stroke();
    }
  }

  const youth = getEventPower('youth_awakening');
  if (youth > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i += 1) {
      const x = (Math.sin(i * 3.1 + time * 1.8) * 0.5 + 0.5) * width;
      const y = (Math.cos(i * 1.7 + time * 2.6) * 0.5 + 0.5) * height;
      const r = 1.2 + ((Math.sin(time * 5 + i) + 1) * 0.5) * (3.4 + youth * 2.4);
      ctx.fillStyle = i % 2 === 0
        ? colorToRgba('#ff8ce9', 0.2 + youth * 0.26)
        : colorToRgba('#98f6ff', 0.2 + youth * 0.24);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const polarization = getEventPower('polarization_spike');
  if (polarization > 0) {
    const center = width * (0.5 + Math.sin(time * 1.8) * 0.04);
    ctx.fillStyle = colorToRgba('#cf2f59', 0.08 + polarization * 0.14);
    ctx.fillRect(0, 0, center, height);
    ctx.fillStyle = colorToRgba('#2b5ab4', 0.08 + polarization * 0.14);
    ctx.fillRect(center, 0, width - center, height);
    ctx.strokeStyle = colorToRgba('#ffffff', 0.14 + polarization * 0.2);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(center, 0);
    ctx.lineTo(center + Math.sin(time * 7) * 10, height);
    ctx.stroke();
  }

  const pluralism = getEventPower('pluralism_wave');
  if (pluralism > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cx = width * 0.5;
    const cy = height * 0.48;
    for (let i = 0; i < 4; i += 1) {
      const radius = 70 + i * 30 + ((time * 46 + i * 40) % 48);
      ctx.strokeStyle = `hsla(${(time * 95 + i * 88) % 360}, 86%, 66%, ${0.14 + pluralism * 0.14})`;
      ctx.lineWidth = 2.4 + pluralism * 1.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const climate = getEventPower('climate_anxiety');
  if (climate > 0) {
    const haze = ctx.createRadialGradient(
      width * 0.5,
      height * 0.72,
      10,
      width * 0.5,
      height * 0.72,
      Math.max(width, height) * 0.64
    );
    haze.addColorStop(0, colorToRgba('#97d86d', 0.02 + climate * 0.08));
    haze.addColorStop(1, colorToRgba('#3b6f4d', 0.01 + climate * 0.1));
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
  }

  const reform = getEventPower('institutional_reform');
  if (reform > 0) {
    ctx.save();
    ctx.strokeStyle = colorToRgba('#91d2ff', 0.08 + reform * 0.18);
    ctx.lineWidth = 1;
    const spacing = 28;
    const shift = (time * 40) % spacing;
    for (let x = -spacing + shift; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = -spacing + shift; y < height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  const globalCrisis = getEventPower('global_crisis');
  if (globalCrisis > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const storm = ctx.createRadialGradient(
      width * 0.5,
      height * 0.52,
      10,
      width * 0.5,
      height * 0.52,
      Math.max(width, height) * 0.78
    );
    storm.addColorStop(0, colorToRgba('#4d1b2d', 0.12 + globalCrisis * 0.18));
    storm.addColorStop(1, colorToRgba('#130c16', 0.2 + globalCrisis * 0.24));
    ctx.fillStyle = storm;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = colorToRgba('#ff6283', 0.22 + globalCrisis * 0.2);
    ctx.lineWidth = 2 + globalCrisis * 2;
    for (let i = 0; i < 5; i += 1) {
      const radius = 44 + i * 28 + ((time * 60 + i * 38) % 28);
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  antClock += 0.016;

  for (const node of regionNodes.values()) {
    for (const bar of node.bars.values()) {
      const diff = bar.targetHeight - bar.currentHeight;
      if (Math.abs(diff) > 0.001) {
        bar.currentHeight += diff * 0.14;
        bar.mesh.scale.y = Math.max(0.05, bar.currentHeight);
        bar.mesh.position.y = bar.mesh.scale.y / 2;
      }
    }

    const d = node.targetDominantHeight - node.currentDominantHeight;
    if (Math.abs(d) > 0.001) {
      node.currentDominantHeight += d * 0.1;
      node.dominant.scale.y = Math.max(0.15, node.currentDominantHeight);
      node.dominant.position.y = node.dominant.scale.y / 2;
    }

    const controlDiff = node.targetControl - node.currentControl;
    if (Math.abs(controlDiff) > 0.001) {
      node.currentControl += controlDiff * 0.12;
    }
    if (node.controlRing?.material) {
      const controlPulse = (Math.sin(antClock * 4.2) + 1) * 0.5;
      node.controlRing.scale.setScalar(0.84 + node.currentControl * 0.28 + controlPulse * 0.05);
      node.controlRing.material.opacity = 0.18 + node.currentControl * 0.52;
      node.controlRing.material.emissiveIntensity = 0.08 + node.currentControl * 0.6;
    }
    if (node.controlBeacon?.material) {
      const wave = (Math.sin(antClock * 6.4 + node.currentControl * 8) + 1) * 0.5;
      node.controlBeacon.position.y = 0.42 + node.currentControl * 0.24 + wave * 0.08;
      node.controlBeacon.material.opacity = 0.28 + node.currentControl * 0.62;
      node.controlBeacon.scale.setScalar(0.85 + wave * 0.48);
      node.controlBeacon.material.emissiveIntensity = 0.2 + node.currentControl * 0.82;
    }
  }

  for (const link of antLinks) {
    const base = antClock * link.speed + link.phase;
    if (link.backLine?.material) {
      link.backLine.material.opacity =
        0.18 + link.intensity * 0.2 + Math.sin(base * 3.2 + link.phase * 7) * 0.04;
    }
    if (link.line?.material?.isLineDashedMaterial) {
      link.line.material.dashOffset = -base * 4.6;
      link.line.material.opacity =
        0.58 + link.intensity * 0.24 + Math.sin(base * 6 + link.phase * 6) * 0.08;
    }
    if (link.glowLine?.material) {
      link.glowLine.material.opacity =
        0.18 + link.intensity * 0.22 + Math.sin(base * 5 + link.phase * 4) * 0.06;
    }
    if (link.pulse) {
      const wave = (Math.sin(base * 7 + link.pulsePhase) + 1) / 2;
      const scale = 0.85 + wave * (0.9 + link.intensity * 0.65);
      link.pulse.scale.set(scale, scale, scale);
      link.pulse.material.opacity = 0.28 + wave * 0.46;
    }
    if (link.head) {
      const headT = (base + 0.12) % 1;
      const headPoint = link.curve.getPointAt(headT);
      const aheadPoint = link.curve.getPointAt((headT + 0.015) % 1);
      const direction = aheadPoint.clone().sub(headPoint).normalize();
      if (direction.lengthSq() > 0) {
        link.head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      }
      link.head.position.copy(headPoint);
      const headScale = 0.82 + (Math.sin(base * 10 + link.phase * 8) + 1) * 0.24;
      link.head.scale.setScalar(headScale);
    }

    for (let i = 0; i < link.ants.length; i += 1) {
      const ant = link.ants[i];
      const t = (base + i / link.ants.length) % 1;
      const point = link.curve.getPointAt(t);
      const wave = Math.sin(base * 9 + i * 0.72 + link.phase * 6.5);
      point.y += wave * (0.035 + link.intensity * 0.08);
      ant.position.copy(point);
      const scale = 0.9 + ((wave + 1) / 2) * 0.65;
      ant.scale.setScalar(scale);
    }
  }

  for (const mesh of forecastMeshes) {
    if (mesh.material?.isLineDashedMaterial) {
      mesh.material.dashOffset = -(antClock * 2.8);
      mesh.material.opacity = clampValue(
        Number(mesh.material.opacity || 0.2) + Math.sin(antClock * 3.2) * 0.005,
        0.08,
        0.64
      );
    }
  }

  renderer.render(scene, camera);
  drawCanvasEventFx(antClock);
  if (burstState) {
    renderTimingBurstCard();
  }
}

animate();

async function postJson(url, body = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }

  return response.json();
}

async function startSimulation() {
  if (liveState?.round > 0) {
    archiveGhostRunFromState(liveState);
  }
  corridorCombos.clear();
  forecastReveal.clear();
  comboScore = 0;
  intelPoints = 0;
  pendingDecision = null;
  burstState = null;
  lastComboRound = -1;
  lastProcessedRound = -1;
  lastForecastRound = -1;
  handledDecisionEvents.clear();
  clearForecastLinks();

  const snapshot = await postJson('/api/simulation/start', {
    useAI: openaiToggle.checked,
    useOpenAI: openaiToggle.checked,
    locale: i18n.locale,
    scenario: scenarioSelect.value
  });
  renderAll(snapshot);
  // Always reset map framing on new game start for a stable first view.
  resetCameraView();
}

async function tickSimulation() {
  const snapshot = await postJson('/api/simulation/tick', {
    locale: i18n.locale,
    scenario: scenarioSelect.value
  });
  renderAll(snapshot);
}

function stopLoop() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function startLoop() {
  stopLoop();
  const delay = Math.max(400, Number(tickInput.value) || 5000);

  tickTimer = setInterval(async () => {
    try {
      await tickSimulation();
    } catch (err) {
      statusEl.textContent = i18n.t('status.error', { message: err.message });
      stopLoop();
      stopBtn.disabled = true;
      startBtn.disabled = false;
    }
  }, delay);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusEl.textContent = i18n.t('status.initializing');

  try {
    await startSimulation();
    startLoop();
  } catch (err) {
    statusEl.textContent = i18n.t('status.startFailed', { message: err.message });
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

stopBtn.addEventListener('click', () => {
  stopLoop();
  stopBtn.disabled = true;
  startBtn.disabled = false;
  if (liveState) {
    statusEl.textContent = i18n.t('status.pausedRound', { round: liveState.round });
  } else {
    statusEl.textContent = i18n.t('status.paused');
  }
});

languageSelect.addEventListener('change', (event) => {
  setLocale(event.target.value, true);
});

scenarioSelect.addEventListener('change', (event) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('app_scenario', event.target.value);
  }
});

logFilterSelect.addEventListener('change', (event) => {
  activeLogFilter = event.target.value || 'all';
  if (liveState) {
    renderLogs(liveState);
  }
});

// ── Modal close ────────────────────────────────────────────────────
if (modalCloseEl) modalCloseEl.addEventListener('click', closeReligionModal);
if (modalEl) {
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeReligionModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalEl && !modalEl.hidden) closeReligionModal();
    const overlay = document.getElementById('drawerOverlay');
    if (overlay && !overlay.hidden) overlay.hidden = true;
  }
});

// ── Screenshot ─────────────────────────────────────────────────────
if (screenshotBtnEl) screenshotBtnEl.addEventListener('click', takeScreenshot);

// ── Report export ──────────────────────────────────────────────────
const reportBtnInit = document.getElementById('reportBtn');
if (reportBtnInit) reportBtnInit.addEventListener('click', exportReport);

if (intelUnlockBtnEl) {
  intelUnlockBtnEl.addEventListener('click', () => {
    unlockNextForecast();
  });
}

// ── Signal reset ───────────────────────────────────────────────────
if (signalResetBtnEl) {
  signalResetBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!liveState) return;
    // Force re-render sliders with current state values
    renderSignalSliders(liveState);
  });
}

if (savedScenario && [...scenarioSelect.options].some((option) => option.value === savedScenario)) {
  scenarioSelect.value = savedScenario;
}

// ── Drawer (Insights & Logs) ──────────────────────────────────────
const drawerOverlayEl = document.getElementById('drawerOverlay');
const drawerCloseEl = document.getElementById('drawerClose');
const drawerToggleBtnEl = document.getElementById('drawerToggleBtn');

function openDrawer() {
  if (drawerOverlayEl) drawerOverlayEl.hidden = false;
}
function closeDrawer() {
  if (drawerOverlayEl) drawerOverlayEl.hidden = true;
}
function toggleDrawer() {
  if (drawerOverlayEl) drawerOverlayEl.hidden = !drawerOverlayEl.hidden;
}

if (drawerToggleBtnEl) drawerToggleBtnEl.addEventListener('click', toggleDrawer);
if (drawerCloseEl) drawerCloseEl.addEventListener('click', closeDrawer);
if (drawerOverlayEl) {
  drawerOverlayEl.addEventListener('click', (e) => {
    if (e.target === drawerOverlayEl) closeDrawer();
  });
}

for (const tab of document.querySelectorAll('.drawer-tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.drawer-tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.drawer-tab-panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.querySelector(`.drawer-tab-panel[data-panel="${tab.dataset.tab}"]`);
    if (panel) panel.classList.add('active');
  });
}

// ── Insight sub-tabs ──────────────────────────────────────────────
for (const subtab of document.querySelectorAll('.insight-subtab')) {
  subtab.addEventListener('click', () => {
    document.querySelectorAll('.insight-subtab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.insight-subpanel').forEach((p) => p.classList.remove('active'));
    subtab.classList.add('active');
    const panel = document.querySelector(`.insight-subpanel[data-subpanel="${subtab.dataset.subtab}"]`);
    if (panel) panel.classList.add('active');
  });
}

// ── Event banner ──────────────────────────────────────────────────
const shownBannerEvents = new Set();
let bannerTimeout = null;

function showEventBanner(ev) {
  if (!eventBannerEl) return;
  const color = EVENT_COLORS[ev.id] || '#607d8b';
  const label = i18n.t(`event.${ev.id}`);
  const shockText = Object.entries(ev.shock || {})
    .slice(0, 3)
    .map(([k, v]) => `${i18n.t(`signal.${k}`)} ${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`)
    .join('  ');

  eventBannerEl.style.background = `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, #1a1a2e 30%))`;
  eventBannerEl.innerHTML = `<div class="event-banner-label">${label}</div><div class="event-banner-shock">${shockText}</div>`;
  eventBannerEl.hidden = false;
  eventBannerEl.style.animation = 'none';
  void eventBannerEl.offsetHeight;
  eventBannerEl.style.animation = '';

  if (bannerTimeout) clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => {
    eventBannerEl.hidden = true;
  }, 5200);
}

// ── Fetch provider info from server ───────────────────────────────
fetch('/api/health')
  .then((r) => r.json())
  .then((data) => {
    if (providerDisplayEl && data.providerLabel) {
      providerDisplayEl.textContent = `${data.providerLabel} / ${data.model || '—'}`;
    }
  })
  .catch(() => {});

setLocale(i18n.locale, false);
statusEl.textContent = i18n.t('status.notStarted');
