import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const tickInput = document.getElementById('tickInput');
const openaiToggle = document.getElementById('openaiToggle');
const statusEl = document.getElementById('status');
const religionCardsEl = document.getElementById('religionCards');
const regionBoardEl = document.getElementById('regionBoard');
const transferBoardEl = document.getElementById('transferBoard');
const logListEl = document.getElementById('logList');
const canvas = document.getElementById('sceneCanvas');

let tickTimer = null;
let liveState = null;
let religionOrder = [];
let antClock = 0;

function clampValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9ced7');
scene.fog = new THREE.Fog('#b9ced7', 28, 78);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
camera.position.set(0, 34, 37);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 22;
controls.maxDistance = 95;
controls.target.set(2, 4, 0);

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

  ctx.fillStyle = 'rgba(15,25,35,0.72)';
  ctx.fillRect(12, 18, 296, 58);

  ctx.fillStyle = '#f4f8ff';
  ctx.font = '600 36px "IBM Plex Sans", sans-serif';
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

  const label = createTextSprite(region.name);
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
  if (religionOrder.join('|') !== key || regionNodes.size !== state.regions.length) {
    religionOrder = state.religions.map((r) => r.id);
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
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({
        color: sourceColor,
        transparent: true,
        opacity: 0.44
      })
    );
    antLinkGroup.add(line);

    const antCount = clampValue(Number(link.ants || 5), 2, 12);
    const ants = [];
    for (let i = 0; i < antCount; i += 1) {
      const ant = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 10),
        new THREE.MeshStandardMaterial({
          color: targetColor,
          emissive: targetColor,
          emissiveIntensity: 0.45,
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
      curve,
      ants,
      speed: 0.012 + clampValue(Number(link.speed || 0.3), 0.08, 1.2) * 0.016,
      phase: Math.random()
    });
  }
}

function renderCards(state) {
  religionCardsEl.innerHTML = state.religions
    .map((religion) => {
      const deltaClass = religion.delta >= 0 ? 'delta-up' : 'delta-down';
      const deltaSign = religion.delta >= 0 ? '+' : '';
      const classicsText = Array.isArray(religion.classics) ? religion.classics.join('、') : '暂无';
      return `
        <article class="religion-card" style="--tone:${religion.color}">
          <div class="row-title">
            <span>${religion.name}</span>
            <span>${religion.followers.toLocaleString()} <span class="${deltaClass}">(${deltaSign}${religion.delta})</span></span>
          </div>
          <div class="sub"><strong>同化流入/流出：</strong>${religion.transferIn} / ${religion.transferOut}</div>
          <div class="sub"><strong>教义：</strong>${religion.doctrine}</div>
          <div class="sub"><strong>长描述：</strong>${religion.doctrineLong || religion.doctrine}</div>
          <div class="sub"><strong>经典著作：</strong>${classicsText}</div>
          <div class="sub"><strong>本轮行为：</strong>${religion.lastAction}</div>
        </article>
      `;
    })
    .join('');
}

function renderRegionBoard(state) {
  regionBoardEl.innerHTML = state.regions
    .map((region) => {
      const top = region.distribution[0];
      const percent = Math.round(top.share * 1000) / 10;
      const intensity = Math.round(region.competitionIndex * 100);
      return `
        <article class="region-item">
          <div class="region-head">
            <span>${region.name}</span>
            <span>${top.name} ${percent}%</span>
          </div>
          <div class="sub muted">区域规模：${region.totalFollowers.toLocaleString()}，竞争强度：${intensity}%</div>
          <div class="region-bar"><div class="region-bar-fill" style="width:${Math.min(100, intensity)}%"></div></div>
        </article>
      `;
    })
    .join('');
}

function renderTransferBoard(state) {
  if (!state.topTransfers.length) {
    transferBoardEl.innerHTML = '<div class="muted">暂无转移链路</div>';
    return;
  }

  transferBoardEl.innerHTML = state.topTransfers
    .slice(0, 12)
    .map(
      (item) => `
      <article class="transfer-item">
        <div><strong>${item.from}</strong> -> <strong>${item.to}</strong>：${item.amount} 人</div>
        <div class="muted">[${item.source === 'ai' ? 'AI' : '规则'}] ${item.reason}</div>
      </article>
    `
    )
    .join('');
}

function renderLogs(state) {
  const recent = state.logs.slice(-24).reverse();
  logListEl.innerHTML = recent
    .map(
      (log) => `
      <article class="log-item">
        <div class="log-meta">第 ${log.round} 轮 · ${new Date(log.time).toLocaleTimeString()} · ${log.name}</div>
        <div>${log.action}</div>
        <div class="log-meta">净变化：${log.delta >= 0 ? '+' : ''}${log.delta}（流入 ${log.transferIn} / 流出 ${log.transferOut}）</div>
      </article>
    `
    )
    .join('');
}

function renderAll(state) {
  liveState = state;
  const invariant = state.invariantOk ? '恒定' : '异常';
  const engine =
    state.transferEngine === 'ai'
      ? 'AI'
      : state.transferEngine === 'hybrid'
        ? '混合'
        : '规则';
  statusEl.textContent = `状态：运行中（第 ${state.round} 轮） | 总信徒 ${state.totalFollowers} / ${state.targetTotalFollowers} (${invariant}) | 转化引擎: ${engine} | OpenAI: ${state.useOpenAI ? '开启' : '关闭'}`;
  renderCards(state);
  renderRegionBoard(state);
  renderTransferBoard(state);
  renderLogs(state);
  updateMap(state);
  updateAntLinks(state);
}

function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resizeRenderer);
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
    for (let i = 0; i < link.ants.length; i += 1) {
      const ant = link.ants[i];
      const t = (base + i / link.ants.length) % 1;
      const point = link.curve.getPointAt(t);
      ant.position.copy(point);
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
    useOpenAI: openaiToggle.checked
  });
  renderAll(snapshot);
}

async function tickSimulation() {
  const snapshot = await postJson('/api/simulation/tick');
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
  const delay = Number(tickInput.value) || 2000;

  tickTimer = setInterval(async () => {
    try {
      await tickSimulation();
    } catch (err) {
      statusEl.textContent = `状态：错误 - ${err.message}`;
      stopLoop();
      stopBtn.disabled = true;
      startBtn.disabled = false;
    }
  }, delay);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusEl.textContent = '状态：初始化中...';

  try {
    await startSimulation();
    startLoop();
  } catch (err) {
    statusEl.textContent = `状态：启动失败 - ${err.message}`;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

stopBtn.addEventListener('click', () => {
  stopLoop();
  stopBtn.disabled = true;
  startBtn.disabled = false;
  if (liveState) {
    statusEl.textContent = `状态：已暂停（停在第 ${liveState.round} 轮）`;
  } else {
    statusEl.textContent = '状态：已暂停';
  }
});

statusEl.textContent = '状态：未开始';
