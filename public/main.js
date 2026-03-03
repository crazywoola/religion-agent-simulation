import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SUPPORTED_LOCALES, createI18n, getLocaleLabel, getPreferredLocale, normalizeLocale } from './i18n.js';

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const tickInput = document.getElementById('tickInput');
const openaiToggle = document.getElementById('openaiToggle');
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
const stageWrapEl = document.querySelector('.stage-wrap');

const appTitleEl = document.getElementById('appTitle');
const appHintEl = document.getElementById('appHint');
const languageLabelEl = document.getElementById('languageLabel');
const scenarioLabelEl = document.getElementById('scenarioLabel');
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
const historySectionTitleEl = document.getElementById('historySectionTitle');
const raceChartTitleEl = document.getElementById('raceChartTitle');
const screenshotBtnEl = document.getElementById('screenshotBtn');
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
let speedMultiplier = 1;
let signalSliderDebounce = null;
let currentModalReligionId = null;

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
  tickLabelEl.textContent = i18n.t('controls.polling');
  openaiLabelEl.textContent = i18n.t('controls.useOpenAI');
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
  institutional_reform: '#4a86b8'
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
  const dataUrl = renderer.domElement.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `religion-sim-round-${liveState?.round || 0}.png`;
  a.click();
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

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(1, 1, false);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
camera.position.set(0, 30, 42);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 22;
controls.maxDistance = 95;
controls.target.set(2, 1.6, 0);
controls.update();

const MAP_VIEW_BOUNDS = {
  width: 86,
  depth: 54,
  target: new THREE.Vector3(2, 1.6, 0),
  tiltDeg: 36,
  margin: 1.16
};
let cameraFitted = false;
let lastAspect = null;

function fitCameraToMap(force = false) {
  const width = Math.max(1, stageWrapEl?.clientWidth || canvas.clientWidth || 1);
  const height = Math.max(1, stageWrapEl?.clientHeight || canvas.clientHeight || 1);
  const aspect = width / height;
  const majorAspectChange = lastAspect === null || Math.abs(aspect - lastAspect) > 0.26;
  if (!force && cameraFitted && !majorAspectChange) {
    lastAspect = aspect;
    return;
  }

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const fitDepthDistance = (MAP_VIEW_BOUNDS.depth * 0.62) / Math.tan(vFov / 2);
  const fitWidthDistance = (MAP_VIEW_BOUNDS.width * 0.52) / Math.tan(hFov / 2);
  const distance = Math.max(fitDepthDistance, fitWidthDistance) * MAP_VIEW_BOUNDS.margin;
  const tilt = THREE.MathUtils.degToRad(MAP_VIEW_BOUNDS.tiltDeg);

  controls.target.copy(MAP_VIEW_BOUNDS.target);
  camera.position.set(
    MAP_VIEW_BOUNDS.target.x,
    MAP_VIEW_BOUNDS.target.y + Math.sin(tilt) * distance,
    MAP_VIEW_BOUNDS.target.z + Math.cos(tilt) * distance
  );
  controls.minDistance = distance * 0.45;
  controls.maxDistance = distance * 2.2;
  controls.update();

  cameraFitted = true;
  lastAspect = aspect;
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

function addContinent(points, color) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });

  const geometry = new THREE.ShapeGeometry(shape);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      metalness: 0.02,
      transparent: true,
      opacity: 0.8
    })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.06;
  mapGroup.add(mesh);
}

addContinent(
  [
    [-22, 11],
    [-17, 12],
    [-12, 8],
    [-10, 1],
    [-16, -1],
    [-20, 2],
    [-23, 7]
  ],
  '#bcd0c4'
);

addContinent(
  [
    [-12, -2],
    [-8, -3],
    [-6, -9],
    [-8, -14],
    [-11, -12],
    [-13, -6]
  ],
  '#c4d5c8'
);

addContinent(
  [
    [-2, 9],
    [6, 10],
    [13, 8],
    [16, 3],
    [12, -2],
    [7, -4],
    [2, -2],
    [0, 4]
  ],
  '#cad9c7'
);

addContinent(
  [
    [1, 2],
    [6, 1],
    [8, -5],
    [5, -9],
    [0, -7],
    [-1, -2]
  ],
  '#c5d4c1'
);

addContinent(
  [
    [16, -3],
    [20, -3],
    [23, -7],
    [20, -12],
    [14, -10],
    [13, -5]
  ],
  '#c4d8cb'
);

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
    label,
    currentDominantHeight: 0.9,
    targetDominantHeight: 0.9,
    dominantColor: '#7a94a4'
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
    const intensity = clampValue(Number(link.intensity || 0.4), 0.1, 1.2);

    const dashedMaterial = new THREE.LineDashedMaterial({
      color: sourceColor,
      transparent: true,
      opacity: 0.38 + intensity * 0.2,
      dashSize: 0.35 + intensity * 0.95,
      gapSize: 0.28 + (1 - intensity) * 0.48
    });
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      dashedMaterial
    );
    line.computeLineDistances();
    antLinkGroup.add(line);

    const glowLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: targetColor,
        transparent: true,
        opacity: 0.08 + intensity * 0.2,
        blending: THREE.AdditiveBlending
      })
    );
    antLinkGroup.add(glowLine);

    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.3, 32),
      new THREE.MeshBasicMaterial({
        color: targetColor,
        transparent: true,
        opacity: 0.46,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    );
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.copy(end.clone().setY(0.27));
    antLinkGroup.add(pulse);

    const antCount = clampValue(Number(link.ants || 5), 3, 14);
    const ants = [];
    for (let i = 0; i < antCount; i += 1) {
      const ant = new THREE.Mesh(
        new THREE.SphereGeometry(0.065 + intensity * 0.045, 10, 10),
        new THREE.MeshStandardMaterial({
          color: targetColor,
          emissive: targetColor,
          emissiveIntensity: 0.55,
          roughness: 0.35,
          metalness: 0.08
        })
      );
      ant.position.copy(curve.getPointAt(i / antCount));
      ants.push(ant);
      antLinkGroup.add(ant);
    }

    antLinks.push({
      line,
      glowLine,
      pulse,
      curve,
      ants,
      speed: 0.012 + clampValue(Number(link.speed || 0.3), 0.08, 1.2) * 0.016,
      intensity,
      phase: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
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

  regionBoardEl.innerHTML = state.regions
    .map((region) => {
      const top = region.distribution[0];
      const topReligion = religionById.get(top.id);
      const percent = Math.round(top.share * 1000) / 10;
      const intensity = Math.round(region.competitionIndex * 100);
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
        <div class="transfer-corridor">${i18n.t('transfer.corridor')} ${corridorText} · ${i18n.t('transfer.intensity')} ${intensityText} · ${i18n.t('transfer.speed')} ${speedText}</div>
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
  if (state.scenario && scenarioSelect.value !== state.scenario) {
    scenarioSelect.value = state.scenario;
  }
  const invariant = i18n.t(state.invariantOk ? 'status.invariantFixed' : 'status.invariantAbnormal');
  const engine = i18n.t(`engine.${state.transferEngine || 'rule'}`);
  const openai = i18n.t(state.useOpenAI ? 'common.on' : 'common.off');
  statusEl.textContent = i18n.t('status.running', {
    round: state.round,
    total: i18n.number(state.totalFollowers),
    target: i18n.number(state.targetTotalFollowers),
    invariant,
    engine,
    openai
  });

  renderCards(state);
  renderInsights(state);
  renderRegionBoard(state);
  renderTransferBoard(state);
  renderLogs(state);
  renderMapHud(state);
  updateMap(state);
  updateAntLinks(state);

  // New panels
  renderHistoryChart(state);
  renderRaceChart(state);
  renderEventFeed(state);
  renderSignalSliders(state);

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
  }

  for (const link of antLinks) {
    const base = antClock * link.speed + link.phase;
    if (link.line?.material?.isLineDashedMaterial) {
      link.line.material.dashOffset = -base * 3.2;
      link.line.material.opacity =
        0.34 + link.intensity * 0.26 + Math.sin(base * 5.4 + link.phase * 6) * 0.07;
    }
    if (link.glowLine?.material) {
      link.glowLine.material.opacity =
        0.06 + link.intensity * 0.16 + Math.sin(base * 4.6 + link.phase * 4) * 0.04;
    }
    if (link.pulse) {
      const wave = (Math.sin(base * 7 + link.pulsePhase) + 1) / 2;
      const scale = 0.85 + wave * (0.75 + link.intensity * 0.6);
      link.pulse.scale.set(scale, scale, scale);
      link.pulse.material.opacity = 0.2 + wave * 0.42;
    }

    for (let i = 0; i < link.ants.length; i += 1) {
      const ant = link.ants[i];
      const t = (base + i / link.ants.length) % 1;
      const point = link.curve.getPointAt(t);
      const wave = Math.sin(base * 8 + i * 0.7 + link.phase * 6);
      point.y += wave * (0.03 + link.intensity * 0.06);
      ant.position.copy(point);
      const scale = 0.78 + ((wave + 1) / 2) * 0.55;
      ant.scale.setScalar(scale);
    }
  }

  renderer.render(scene, camera);
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
  const snapshot = await postJson('/api/simulation/start', {
    useOpenAI: openaiToggle.checked,
    locale: i18n.locale,
    scenario: scenarioSelect.value
  });
  renderAll(snapshot);
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
  const baseDelay = Number(tickInput.value) || 5000;
  const delay = Math.max(400, Math.round(baseDelay / speedMultiplier));

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

// ── Speed buttons ──────────────────────────────────────────────────
for (const btn of document.querySelectorAll('.speed-btn')) {
  btn.addEventListener('click', () => {
    speedMultiplier = Number(btn.dataset.speed) || 1;
    document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (tickTimer) {
      // Restart loop with new speed
      startLoop();
    }
  });
}

// ── Modal close ────────────────────────────────────────────────────
if (modalCloseEl) modalCloseEl.addEventListener('click', closeReligionModal);
if (modalEl) {
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeReligionModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalEl && !modalEl.hidden) closeReligionModal();
});

// ── Screenshot ─────────────────────────────────────────────────────
if (screenshotBtnEl) screenshotBtnEl.addEventListener('click', takeScreenshot);

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

setLocale(i18n.locale, false);
statusEl.textContent = i18n.t('status.notStarted');
