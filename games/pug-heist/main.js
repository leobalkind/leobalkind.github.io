// PUG HEIST SOCIETY — top-down stealth. Avoid human vision cones.
// Bark distracts a nearby human (look toward sound for ~2s).
// Fart boost = 1.5s speed burst but increases sound radius (humans turn to you).
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { drawIcon, iconSvg } from '../../src/shared/icons.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'heist:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

// Inline pixel-art icons into the rare-loot tip in the start overlay
const _rareTip = document.querySelector('.loot-rare-tip');
if (_rareTip) {
  _rareTip.innerHTML = iconSvg.crownGold(14) + iconSvg.diamond(14) + iconSvg.camera(14);
}

// Loot types — varied values (rare = worth more). `iconName` maps to drawIcon.*
const LOOT_TYPES = [
  { iconName: 'bone',      val: 50,  rare: false },
  { iconName: 'cheese',    val: 60,  rare: false },
  { iconName: 'sock',      val: 30,  rare: false },
  { iconName: 'meat',      val: 45,  rare: false },
  { iconName: 'bacon',     val: 55,  rare: false },
  { iconName: 'sandwich',  val: 40,  rare: false },
  { iconName: 'tennisBall',val: 35,  rare: false },
  { iconName: 'crownGold', val: 200, rare: true },   // crown
  { iconName: 'diamond',   val: 150, rare: true },   // diamond
  { iconName: 'camera',    val: 120, rare: true },   // was remote — camera is the closest jackpot tech icon
];
let pug, humans, walls, loot, exitZ, floor, barkCd, fartCd, running;
let smokeCd = 0, tongueCd = 0, decoyCd = 0;
let smokeBombs = []; // {x,y,t}
let particles = [];  // loot pickup particles
let alertedThisFloor = false;
let lootStolen = 0;
let totalLootValue = 0;
let lootValueThisFloor = 0;
let floorStartTime = 0;
let achievementsSeen = new Set();
let cats = [];
// --- Juice ---
let shakeT = 0, shakeMag = 0;
let hitFlashT = 0;
let popups = []; // {x, y, text, color, t}
let lights = []; // ceiling lights placed per-floor: {x, y, flickerT, on}
let scatter = []; // floor decorations: cracks, stains, debris
let dustMotes = []; // ambient dust motes drifting
function addShake(mag, dur) { shakeMag = Math.max(shakeMag, mag); shakeT = Math.max(shakeT, dur); }
function addPopup(x, y, text, color) { popups.push({ x, y, text, color: color || '#ffd23f', t: 0 }); if (popups.length > 30) popups.shift(); }

function genFloor(level) {
  pug = { x: 60, y: H - 100, vx: 0, vy: 0, alive: true, fartT: 0, sound: 0 };
  walls = [];
  // Outer walls
  walls.push({ x: 0, y: 0, w: W, h: 12 });
  walls.push({ x: 0, y: H - 12, w: W, h: 12 });
  walls.push({ x: 0, y: 0, w: 12, h: H });
  walls.push({ x: W - 12, y: 0, w: 12, h: H });
  // Interior walls forming rooms (random)
  const cols = 4, rows = 3;
  const cw = W / cols, ch = H / rows;
  for (let c = 1; c < cols; c++) {
    let y = 0;
    const gaps = [Math.floor(Math.random() * rows)];
    for (let r = 0; r < rows; r++) {
      if (!gaps.includes(r)) {
        walls.push({ x: c * cw - 6, y: r * ch + 10, w: 12, h: ch - 20 });
      }
    }
  }
  for (let r = 1; r < rows; r++) {
    const gaps = [Math.floor(Math.random() * cols)];
    for (let c = 0; c < cols; c++) {
      if (!gaps.includes(c)) {
        walls.push({ x: c * cw + 10, y: r * ch - 6, w: cw - 20, h: 12 });
      }
    }
  }
  // Cat ally: 30% chance per floor (helpful distraction NPC)
  cats = [];
  if (Math.random() < 0.3) {
    for (let tries = 0; tries < 20; tries++) {
      const x = 50 + Math.random() * (W - 100), y = 50 + Math.random() * (H - 100);
      if (!isWallNear(x, y, 18) && Math.hypot(x - pug.x, y - pug.y) > 120) {
        cats.push({ x, y, vx: 0, vy: 0, t: 0, distractT: 0 });
        break;
      }
    }
  }
  // Loot - one per room (roughly)
  loot = [];
  const lootCount = 4 + level;
  for (let i = 0; i < lootCount; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const x = 30 + Math.random() * (W - 60);
      const y = 30 + Math.random() * (H - 60);
      if (!isWallNear(x, y, 16)) {
        // 12% rare drop chance
        const pool = Math.random() < 0.12 ? LOOT_TYPES.filter((t) => t.rare) : LOOT_TYPES.filter((t) => !t.rare);
        const ltype = pool[Math.floor(Math.random() * pool.length)];
        loot.push({ x, y, ...ltype, taken: false });
        break;
      }
    }
  }
  // Humans - 2 + level/2
  humans = [];
  const humanCount = 1 + Math.floor(level / 2) + 1;
  for (let i = 0; i < humanCount; i++) {
    for (let tries = 0; tries < 50; tries++) {
      const x = W / 2 + (Math.random() - 0.5) * W * 0.5;
      const y = H / 2 + (Math.random() - 0.5) * H * 0.5;
      if (!isWallNear(x, y, 30) && Math.hypot(x - pug.x, y - pug.y) > 200) {
        humans.push({
          x, y, ang: Math.random() * Math.PI * 2, lookT: 0,
          patrol: [
            { x: x + (Math.random() - 0.5) * 200, y: y + (Math.random() - 0.5) * 200 },
            { x: x + (Math.random() - 0.5) * 200, y: y + (Math.random() - 0.5) * 200 },
          ],
          patrolIdx: 0,
          state: 'patrol',
          alertT: 0,
          distractTarget: null,
        });
        break;
      }
    }
  }
  // Exit
  exitZ = { x: W - 50, y: 50, r: 30 };
  barkCd = 0; fartCd = 0;
  smokeCd = 0; tongueCd = 0; decoyCd = 0;
  smokeBombs = []; particles = [];
  alertedThisFloor = false;
  lootValueThisFloor = 0;
  floorStartTime = performance.now();
  // Ceiling lights — one per "room" cell
  lights = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      lights.push({
        x: c * cw + cw / 2,
        y: r * ch + ch / 2,
        flickerT: Math.random() * 2,
        on: true,
        broken: Math.random() < 0.18,
      });
    }
  }
  // Floor decor: deterministic-ish scatter (cracks, stains, debris)
  scatter = [];
  for (let i = 0; i < 70; i++) {
    const x = 16 + Math.random() * (W - 32), y = 16 + Math.random() * (H - 32);
    if (isWallNear(x, y, 8)) continue;
    const k = Math.random();
    if (k < 0.35) scatter.push({ kind: 'crack', x, y, ang: Math.random() * Math.PI, len: 14 + Math.random() * 22 });
    else if (k < 0.6) scatter.push({ kind: 'stain', x, y, r: 6 + Math.random() * 10, color: Math.random() < 0.5 ? 'rgba(110,30,30,0.35)' : 'rgba(20,12,30,0.4)' });
    else if (k < 0.85) scatter.push({ kind: 'debris', x, y, sz: 4 + Math.random() * 5 });
    else scatter.push({ kind: 'tile', x, y, sz: 24 + Math.random() * 16 });
  }
  // Dust motes (ambient drift)
  dustMotes = [];
  for (let i = 0; i < 24; i++) {
    dustMotes.push({ x: Math.random() * W, y: Math.random() * H, vx: -6 + Math.random() * 12, vy: -3 + Math.random() * 6, r: 1 + Math.random() * 1.6 });
  }
  shakeT = 0; shakeMag = 0; hitFlashT = 0;
  popups = [];
}

function isWallNear(x, y, r) {
  for (const w of walls) {
    if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) return true;
  }
  return false;
}

function rectCollide(e, dx, dy) {
  const r = 10;
  const nx = e.x + dx;
  if (!isWallNear(nx, e.y, r)) e.x = nx;
  const ny = e.y + dy;
  if (!isWallNear(e.x, ny, r)) e.y = ny;
}
// Generic radius-aware move (used by cats; was previously called undefined)
function move(e, dx, dy, r) {
  const _r = r || 10;
  const nx = e.x + dx;
  if (!isWallNear(nx, e.y, _r)) e.x = nx;
  const ny = e.y + dy;
  if (!isWallNear(e.x, ny, _r)) e.y = ny;
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === ' ' || e.code === 'Space') doBark();
  if (e.key === 'Shift' || e.key.toLowerCase() === 'shift') doFart();
  if (e.key === 'q' || e.key === 'Q') doSmoke();
  if (e.key === 'g' || e.key === 'G') doTongue();
  if (e.key === 't' || e.key === 'T') doDecoy();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
let touchAim = null;
canvas.addEventListener('touchstart', (e) => { touchAim = e.touches[0]; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { touchAim = e.touches[0]; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => touchAim = null);

function doBark() {
  if (barkCd > 0 || !running) return;
  barkCd = 5;
  sfx.tone(440, 'square', 0.15, 0.22);
  // Find nearest human and distract toward a random direction
  let near = null, bestD = 200;
  for (const h of humans) {
    const d = Math.hypot(h.x - pug.x, h.y - pug.y);
    if (d < bestD) { bestD = d; near = h; }
  }
  if (near) {
    // distract toward a random position AWAY from pug
    const ang = Math.atan2(pug.y - near.y, pug.x - near.x) + Math.PI; // opposite of pug
    near.distractTarget = {
      x: near.x + Math.cos(ang) * 200,
      y: near.y + Math.sin(ang) * 200,
    };
    near.state = 'distracted';
    near.alertT = 2.0;
  }
}

function doSmoke() {
  if (smokeCd > 0 || !running) return;
  smokeCd = 7;
  // 3s smoke cloud at pug position, blocks vision cones in radius 90
  smokeBombs.push({ x: pug.x, y: pug.y, t: 0, life: 3 });
  sfx.tone(330, 'sawtooth', 0.2, 0.2);
}
function doTongue() {
  if (tongueCd > 0 || !running) return;
  // Grab nearest visible loot within 180px
  let near = null, bestD = 180;
  for (const lt of loot) {
    if (lt.taken) continue;
    const d = Math.hypot(lt.x - pug.x, lt.y - pug.y);
    if (d < bestD) { bestD = d; near = lt; }
  }
  if (near) {
    near.taken = true;
    lootValueThisFloor += near.val;
    totalLootValue += near.val;
    lootStolen++;
    tongueCd = 4;
    sfx.tone(880, 'triangle', 0.1, 0.22);
    spawnParticles(near.x, near.y, '#ff5a82');
  } else {
    tongueCd = 1; // short cooldown on whiff
    sfx.tone(220, 'sawtooth', 0.08, 0.16);
  }
}
function doDecoy() {
  if (decoyCd > 0 || !running) return;
  decoyCd = 8;
  // Distract nearest human: walk away from pug for 4s
  let near = null, bestD = 280;
  for (const h of humans) {
    const d = Math.hypot(h.x - pug.x, h.y - pug.y);
    if (d < bestD) { bestD = d; near = h; }
  }
  if (near) {
    const ang = Math.atan2(near.y - pug.y, near.x - pug.x);
    near.distractTarget = { x: near.x + Math.cos(ang) * 220, y: near.y + Math.sin(ang) * 220 };
    near.state = 'distracted'; near.alertT = 4.0;
  }
  sfx.tone(440, 'square', 0.1, 0.2);
}
function spawnParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 80;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 0.6, t: 0, size: 3 });
  }
}

function doFart() {
  if (fartCd > 0 || !running) return;
  fartCd = 6;
  pug.fartT = 1.5;
  pug.sound = 1; // big sound
  sfx.tone(110, 'sawtooth', 0.4, 0.25);
}

function tick(dt) {
  if (!running) return;
  barkCd = Math.max(0, barkCd - dt);
  fartCd = Math.max(0, fartCd - dt);
  pug.fartT = Math.max(0, pug.fartT - dt);
  pug.sound = Math.max(0, pug.sound - dt * 0.5);

  // Move
  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  if (touchAim) {
    mx = touchAim.clientX - pug.x; my = touchAim.clientY - pug.y;
    const l = Math.hypot(mx, my);
    if (l > 20) { mx /= l; my /= l; } else { mx = 0; my = 0; }
  }
  if (mx || my) {
    const l = Math.hypot(mx, my);
    const speed = (pug.fartT > 0 ? 220 : 110);
    rectCollide(pug, (mx / l) * speed * dt, (my / l) * speed * dt);
  }

  // Loot pickup
  for (const lt of loot) {
    if (lt.taken) continue;
    if (Math.hypot(lt.x - pug.x, lt.y - pug.y) < 20) {
      lt.taken = true;
      lootValueThisFloor += lt.val;
      totalLootValue += lt.val;
      lootStolen++;
      sfx.tone(lt.rare ? 1320 : 880, 'triangle', 0.1, 0.22);
      spawnParticles(lt.x, lt.y, lt.rare ? '#ffd23f' : '#5ef38c');
      addPopup(lt.x, lt.y - 6, '+$' + lt.val, lt.rare ? '#ffd23f' : '#5ef38c');
      if (lt.rare) addShake(3, 0.15);
    }
  }
  // Gadget cooldown decay
  smokeCd = Math.max(0, smokeCd - dt);
  tongueCd = Math.max(0, tongueCd - dt);
  decoyCd = Math.max(0, decoyCd - dt);
  // Cat ally — wanders, periodically distracts a random human
  for (const c of cats) {
    c.t += dt;
    c.distractT -= dt;
    if (Math.random() < dt * 0.5) {
      const a = Math.random() * Math.PI * 2;
      c.vx = Math.cos(a) * 30; c.vy = Math.sin(a) * 30;
    }
    move(c, c.vx * dt, c.vy * dt, 8);
    // Every ~4s, distract one random human
    if (c.distractT <= 0 && humans.length > 0) {
      c.distractT = 4 + Math.random() * 3;
      const h = humans[Math.floor(Math.random() * humans.length)];
      h.distractTarget = { x: c.x, y: c.y };
      h.state = 'distracted';
      h.alertT = 2.0;
    }
  }
  // Smoke bombs
  for (let i = smokeBombs.length - 1; i >= 0; i--) {
    const s = smokeBombs[i];
    s.t += dt;
    if (s.t >= s.life) smokeBombs.splice(i, 1);
  }
  // Particles
  for (const p of particles) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.95; p.vy *= 0.95;
  }
  particles = particles.filter((p) => p.t < p.life);
  // Juice tick
  if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
  if (hitFlashT > 0) hitFlashT = Math.max(0, hitFlashT - dt);
  for (const p of popups) { p.t += dt; p.y -= 28 * dt; }
  popups = popups.filter((p) => p.t < 1.2);
  // Light flicker tick
  for (const l of lights) {
    l.flickerT -= dt;
    if (l.flickerT <= 0) {
      l.on = l.broken ? Math.random() < 0.55 : Math.random() < 0.95;
      l.flickerT = l.broken ? 0.05 + Math.random() * 0.2 : 0.6 + Math.random() * 3;
    }
  }
  // Dust drift
  for (const d of dustMotes) {
    d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.x < -4) d.x = W + 4;
    if (d.x > W + 4) d.x = -4;
    if (d.y < -4) d.y = H + 4;
    if (d.y > H + 4) d.y = -4;
  }
  // Exit check
  if (loot.every((l) => l.taken)) {
    if (Math.hypot(exitZ.x - pug.x, exitZ.y - pug.y) < exitZ.r) {
      floor++;
      genFloor(floor);
      sfx.arp([523, 659, 784], 'triangle', 0.08, 0.22, 0.2);
      return;
    }
  }

  // Humans
  for (const h of humans) {
    if (h.lookT > 0) h.lookT -= dt;
    if (h.alertT > 0) h.alertT -= dt;
    if (h.state === 'patrol') {
      const target = h.patrol[h.patrolIdx];
      const dx = target.x - h.x, dy = target.y - h.y;
      const d = Math.hypot(dx, dy);
      if (d < 20) {
        h.patrolIdx = (h.patrolIdx + 1) % h.patrol.length;
        h.lookT = 1.2; // pause to look
      } else if (h.lookT <= 0) {
        h.ang = Math.atan2(dy, dx);
        rectCollide(h, (dx / d) * 50 * dt, (dy / d) * 50 * dt);
      }
    } else if (h.state === 'distracted' && h.distractTarget) {
      const dx = h.distractTarget.x - h.x, dy = h.distractTarget.y - h.y;
      const d = Math.hypot(dx, dy);
      h.ang = Math.atan2(dy, dx);
      if (d > 20) rectCollide(h, (dx / d) * 60 * dt, (dy / d) * 60 * dt);
      if (h.alertT <= 0) { h.state = 'patrol'; h.distractTarget = null; }
    }
    // Vision cone check
    const dx = pug.x - h.x, dy = pug.y - h.y;
    const d = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    let diff = ang - h.ang;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const inCone = d < 180 && Math.abs(diff) < 0.6;
    // line-of-sight: any wall between?
    let blocked = false;
    if (inCone) {
      const steps = 16;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const sx = h.x + (pug.x - h.x) * t;
        const sy = h.y + (pug.y - h.y) * t;
        if (isWallNear(sx, sy, 2)) { blocked = true; break; }
        // Smoke blocks vision
        for (const sb of smokeBombs) {
          if (Math.hypot(sx - sb.x, sy - sb.y) < 90) { blocked = true; break; }
        }
        if (blocked) break;
      }
    }
    // Cone-color escalation: mark suspicion based on closeness
    if (inCone && d < 240) h._closeT = (h._closeT || 0) + dt; else h._closeT = Math.max(0, (h._closeT || 0) - dt);
    if (inCone && !blocked) { alertedThisFloor = true; caught(); }
    // Sound detection
    if (pug.sound > 0.6 && d < 240) {
      // turn toward sound
      h.ang = ang;
      h.state = 'distracted';
      h.distractTarget = { x: pug.x, y: pug.y };
      h.alertT = 1.5;
    }
  }
  updateHud();
}

function caught() {
  if (!running) return;
  addShake(8, 0.32);
  hitFlashT = 0.25;
  running = false;
  sfx.sweep(220, 80, 'sawtooth', 0.6, 0.25);
  const g = calcGrade();
  document.getElementById('end-title').textContent = `CAUGHT! · GRADE ${g.grade}`;
  document.getElementById('end-sub').textContent = `${g.desc}. Final haul: $${totalLootValue}.`;
  document.getElementById('end-floor').textContent = floor;
  document.getElementById('end-loot').textContent = lootStolen;
  const score = floor * 100 + totalLootValue;
  const { isNewBest, current } = submitRun('pug-heist', { score, floor, value: totalLootValue });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { floor };
    bestEl.innerHTML = `Best: <b>${b.floor} floors · $${b.value || 0}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  document.getElementById('hud').hidden = true;
  document.getElementById('end-overlay').hidden = false;
  document.getElementById('end-overlay').classList.remove('is-hidden');
}

function render() {
  // Screen shake offset
  let _sx = 0, _sy = 0;
  if (shakeT > 0 && shakeMag > 0) {
    const k = Math.min(1, shakeT / 0.3);
    _sx = (Math.random() - 0.5) * shakeMag * 2 * k;
    _sy = (Math.random() - 0.5) * shakeMag * 2 * k;
  }
  ctx.save();
  ctx.translate(_sx, _sy);
  // BG: vary tile color by room cell (bedroom / hallway / vault look)
  const cols = 4, rows = 3;
  const cw = W / cols, ch = H / rows;
  // Per-room palette (deterministic by floor seed via index)
  const palettes = [
    ['#3a2a5a', '#2e2148'], // hallway
    ['#4a2a3a', '#3a1f2e'], // bedroom (warm)
    ['#2a3a4a', '#1e2e3a'], // study (cool)
    ['#5a4a2a', '#4a3a1f'], // vault (gold-tint)
    ['#2a4a3a', '#1e3a2e'], // green office
  ];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = palettes[(r * 7 + c * 3 + (floor || 1)) % palettes.length];
      ctx.fillStyle = p[0];
      ctx.fillRect(c * cw, r * ch, cw, ch);
      // checker
      ctx.fillStyle = p[1];
      for (let y = 0; y < ch; y += 40) {
        for (let x = 0; x < cw; x += 40) {
          if (((x / 40) + (y / 40)) % 2 === 0) ctx.fillRect(c * cw + x, r * ch + y, 40, 40);
        }
      }
    }
  }
  // tile borders
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
  }
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke();
  }
  // Floor scatter (cracks, stains, debris, tile accents)
  for (const s of scatter) {
    if (s.kind === 'crack') {
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(s.x, s.y); ctx.rotate(s.ang);
      ctx.beginPath();
      ctx.moveTo(-s.len / 2, 0);
      ctx.lineTo(-s.len / 4, -2);
      ctx.lineTo(s.len / 4, 1);
      ctx.lineTo(s.len / 2, 0);
      ctx.stroke();
      ctx.restore();
    } else if (s.kind === 'stain') {
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    } else if (s.kind === 'debris') {
      ctx.fillStyle = 'rgba(40,28,52,0.7)';
      ctx.fillRect(s.x, s.y, s.sz, s.sz);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(s.x, s.y + s.sz - 1, s.sz, 1);
    } else if (s.kind === 'tile') {
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x, s.y, s.sz, s.sz);
    }
  }
  // Walls — thicker with highlight/shadow for depth
  ctx.fillStyle = '#1a0d05';
  for (const w of walls) ctx.fillRect(w.x, w.y, w.w, w.h);
  // top highlight
  ctx.fillStyle = '#6b3a1c';
  for (const w of walls) ctx.fillRect(w.x, w.y, w.w, Math.min(3, w.h));
  // side highlight (left)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (const w of walls) ctx.fillRect(w.x + w.w - 2, w.y + 2, 2, w.h - 2);
  // Loot — pixel-art icons from shared library
  for (const lt of loot) {
    if (lt.taken) continue;
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12;
    const fn = drawIcon[lt.iconName];
    if (fn) fn(ctx, lt.x, lt.y, 22);
    ctx.shadowBlur = 0;
  }
  // Exit zone (only when all loot taken)
  if (loot.every((l) => l.taken)) {
    ctx.strokeStyle = '#5ef38c'; ctx.lineWidth = 3;
    ctx.shadowColor = '#5ef38c'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(exitZ.x, exitZ.y, exitZ.r + Math.sin(performance.now() / 200) * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#5ef38c'; ctx.font = "20px sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('EXIT', exitZ.x, exitZ.y + 6);
  }
  // Humans + vision cones (color shifts with suspicion)
  for (const h of humans) {
    // cone color: yellow safe → orange suspicious → red alerted
    const sus = Math.min(1, (h._closeT || 0) / 1.5);
    const alert = h.alertT > 0 ? 1 : 0;
    const r = Math.max(255, Math.floor(255));
    const g = alert ? 58 : Math.floor(210 - sus * 130);
    const b = alert ? 58 : Math.floor(63 - sus * 5);
    ctx.fillStyle = `rgba(${r},${g},${b},0.20)`;
    ctx.beginPath();
    ctx.moveTo(h.x, h.y);
    ctx.arc(h.x, h.y, 180, h.ang - 0.6, h.ang + 0.6);
    ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(h.x - 12, h.y - 12, 24, 24);
    ctx.fillStyle = '#e0a566';
    ctx.fillRect(h.x - 8, h.y - 18, 16, 8);
    // facing dot
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(h.x + Math.cos(h.ang) * 10, h.y + Math.sin(h.ang) * 10, 3, 0, Math.PI * 2); ctx.fill();
    if (h.alertT > 0) {
      ctx.fillStyle = '#ff3a3a'; ctx.font = "12px sans-serif"; ctx.textAlign = 'center';
      ctx.fillText('?', h.x, h.y - 22);
    }
  }
  // Smoke bombs
  for (const sb of smokeBombs) {
    const a = sb.t < 0.4 ? sb.t / 0.4 : (sb.t > 2.5 ? (sb.life - sb.t) / 0.5 : 1);
    ctx.fillStyle = `rgba(60,60,60,${a * 0.7})`;
    ctx.beginPath(); ctx.arc(sb.x, sb.y, 90, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(140,140,140,${a * 0.5})`;
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + sb.t * 0.5;
      const rr = 60 + Math.sin(sb.t * 3 + i) * 10;
      ctx.beginPath(); ctx.arc(sb.x + Math.cos(ang) * rr, sb.y + Math.sin(ang) * rr, 18, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Particles
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.t / p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  // Cat allies
  for (const c of cats) {
    ctx.fillStyle = '#5a5a5a'; ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(c.x - 7, c.y - 12, 3, 5); ctx.fillRect(c.x + 4, c.y - 12, 3, 5);
    ctx.fillStyle = '#5ef38c'; ctx.fillRect(c.x - 3, c.y - 2, 2, 2); ctx.fillRect(c.x + 1, c.y - 2, 2, 2);
    // Indicator
    ctx.fillStyle = '#5ef38c'; ctx.font = "8px 'Press Start 2P', monospace"; ctx.textAlign = 'center';
    ctx.fillText('ALLY', c.x, c.y - 16);
  }
  // Pug
  ctx.fillStyle = '#c8854a';
  ctx.beginPath(); ctx.arc(pug.x, pug.y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0d05';
  ctx.fillRect(pug.x - 3, pug.y - 2, 2, 2); ctx.fillRect(pug.x + 1, pug.y - 2, 2, 2);
  // fart cloud
  if (pug.fartT > 0) {
    ctx.fillStyle = `rgba(94,243,140,${pug.fartT / 1.5 * 0.6})`;
    ctx.beginPath(); ctx.arc(pug.x, pug.y + 6, 18, 0, Math.PI * 2); ctx.fill();
  }
  // sound ring
  if (pug.sound > 0) {
    ctx.strokeStyle = `rgba(255,210,63,${pug.sound})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(pug.x, pug.y, 30 * (1 - pug.sound + 1), 0, Math.PI * 2); ctx.stroke();
  }
  // Score popups (world space, before lighting)
  ctx.font = "bold 11px 'Press Start 2P', monospace";
  ctx.textAlign = 'center';
  for (const p of popups) {
    const a = p.t < 0.1 ? p.t / 0.1 : (p.t > 0.9 ? Math.max(0, (1.2 - p.t) / 0.3) : 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#000'; ctx.fillText(p.text, p.x + 1, p.y + 1);
    ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }
  // Dust motes (ambient, soft)
  ctx.fillStyle = 'rgba(220,210,255,0.18)';
  for (const d of dustMotes) {
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
  }
  // ---- Lighting pass: darken whole stage, punch out light pools ----
  ctx.save();
  ctx.fillStyle = 'rgba(8,4,16,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'destination-out';
  // Player carries soft visibility halo
  const pgrd = ctx.createRadialGradient(pug.x, pug.y, 10, pug.x, pug.y, 140);
  pgrd.addColorStop(0, 'rgba(0,0,0,1)');
  pgrd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = pgrd;
  ctx.beginPath(); ctx.arc(pug.x, pug.y, 140, 0, Math.PI * 2); ctx.fill();
  // Each ceiling light contributes a pool when on
  for (const l of lights) {
    if (!l.on) continue;
    const grd = ctx.createRadialGradient(l.x, l.y, 10, l.x, l.y, 110);
    grd.addColorStop(0, 'rgba(0,0,0,1)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(l.x, l.y, 110, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Warm light tint over pools (additive feel)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    if (!l.on) continue;
    const grd = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 80);
    grd.addColorStop(0, 'rgba(255,210,140,0.18)');
    grd.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(l.x, l.y, 80, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Ceiling light fixtures (small icons)
  for (const l of lights) {
    ctx.fillStyle = l.on ? '#ffd23f' : '#3a3040';
    ctx.fillRect(l.x - 5, l.y - 1, 10, 2);
    if (l.broken) {
      ctx.strokeStyle = 'rgba(255,90,90,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(l.x - 6, l.y - 3); ctx.lineTo(l.x + 6, l.y - 3); ctx.stroke();
    }
  }
  ctx.restore(); // closes the shake-translate save
  // Hit flash overlay (screen space, after shake)
  if (hitFlashT > 0) {
    ctx.fillStyle = `rgba(255,58,58,${Math.min(0.5, hitFlashT * 2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.65);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  drawGadgetHud();
}

function updateHud() {
  const t = loot.filter((l) => l.taken).length;
  document.getElementById('hud-loot').textContent = `${t}/${loot.length}`;
  document.getElementById('hud-floor').textContent = floor;
  document.getElementById('hud-bark').textContent = barkCd > 0 ? barkCd.toFixed(1) + 's' : 'READY';
  document.getElementById('hud-fart').textContent = fartCd > 0 ? fartCd.toFixed(1) + 's' : 'READY';
  const best = loadBest('pug-heist');
  document.getElementById('hud-best').textContent = best ? best.floor : 0;
  // Alert pulse: any human with vision suspicion or alerted
  let suspicious = false;
  for (const h of humans) {
    if (h.alertT > 0 || (h._closeT || 0) > 0.6) { suspicious = true; break; }
  }
  const card = document.querySelector('#hud .hud-card');
  if (card) card.classList.toggle('is-alert', suspicious);
}

function drawGadgetHud() {
  const ox = W - 200, oy = H - 80;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(ox - 8, oy - 8, 190, 70);
  // Row icons: smokeBomb / no-match tongue / bone — drawn pixel-art at left of row
  drawIcon.smokeBomb(ctx, ox + 8, oy + 4, 14);
  // tongue has no library match — keep a tiny pink rounded blob
  ctx.fillStyle = '#ff8ac8'; ctx.fillRect(ox + 2, oy + 21, 12, 4); ctx.fillRect(ox + 4, oy + 19, 8, 2);
  drawIcon.bone(ctx, ox + 8, oy + 40, 14);
  ctx.fillStyle = '#fff'; ctx.font = "9px 'Press Start 2P', monospace"; ctx.textAlign = 'left';
  ctx.fillText('SMOKE [Q]  ' + (smokeCd > 0 ? smokeCd.toFixed(1) + 's' : 'READY'), ox + 22, oy + 8);
  ctx.fillText('TONGUE [G] ' + (tongueCd > 0 ? tongueCd.toFixed(1) + 's' : 'READY'), ox + 22, oy + 26);
  ctx.fillText('DECOY [T]  ' + (decoyCd > 0 ? decoyCd.toFixed(1) + 's' : 'READY'), ox + 22, oy + 44);
  // Loot value running total
  ctx.fillStyle = '#ffd23f'; ctx.font = "11px 'Press Start 2P', monospace"; ctx.textAlign = 'right';
  ctx.fillText(`$ ${totalLootValue}`, W - 16, 26);
}

function calcGrade() {
  // Per-floor grade: how much of this floor's loot did we take?
  const floorTaken = loot.filter((l) => l.taken).length;
  const collectedPct = floorTaken / Math.max(1, loot.length);
  const undetected = !alertedThisFloor;
  if (collectedPct >= 0.95 && undetected) return { grade: 'S', desc: 'PERFECT HEIST' };
  if (collectedPct >= 0.85 && undetected) return { grade: 'A', desc: 'CLEAN' };
  if (collectedPct >= 0.6) return { grade: 'B', desc: 'GOOD' };
  if (collectedPct >= 0.4) return { grade: 'C', desc: 'MESSY' };
  return { grade: 'D', desc: 'ROUGH' };
}

document.getElementById('start-btn').addEventListener('click', start);
document.getElementById('end-restart').addEventListener('click', start);
function start() {
  floor = 1; running = true;
  lootStolen = 0; totalLootValue = 0; achievementsSeen = new Set();
  genFloor(floor);
  document.getElementById('overlay').hidden = true; document.getElementById('overlay').classList.add('is-hidden');
  document.getElementById('end-overlay').hidden = true; document.getElementById('end-overlay').classList.add('is-hidden');
  document.getElementById('hud').hidden = false;
  sfx.resume();
}
let lastT = performance.now();
(function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now; tick(dt); if (running) render();
  requestAnimationFrame(loop);
})(performance.now());

// Tutorial tip — shows briefly when the game starts (every match)
const _startOv = document.getElementById('overlay');
if (_startOv) {
  const _showOnHide = () => {
    if (_startOv.classList.contains('is-hidden') || _startOv.hidden) {
      showTip('WASD sneak · avoid red vision cones · Q smoke · G tongue · T decoy', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
