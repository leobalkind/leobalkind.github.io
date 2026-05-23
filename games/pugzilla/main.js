// PUGZILLA RAMPAGE — top-down city destruction.
// Walk around city, click to smash buildings, vehicles flee, helicopters shoot
// missiles. Shockwave bork knocks back everything. Eat 5 vehicles to evolve.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { drawIcon } from '../../src/shared/icons.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'pugzilla:muted' });
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

const WORLD_W = 2200, WORLD_H = 1600;
const FORMS = [
  { name: 'Tiny Pugzilla',   r: 28, smash: 1, color: '#c8854a' },
  { name: 'Chonk Pugzilla',  r: 40, smash: 2, color: '#eac888' },
  { name: 'Mega Pugzilla',   r: 56, smash: 3, color: '#ff8e3c' },
  { name: 'GIGA-BORK GOD',   r: 78, smash: 5, color: '#b055ff' },
];

let pug, buildings, vehicles, helicopters, missiles, particles, powerups, score, smashed, eaten, hp, formIdx, borkCd, cam, running;
let combo = 0, comboT = 0, dmgBoostT = 0;
let mouse = { x: 0, y: 0 };
// --- Juice ---
let shakeT = 0, shakeMag = 0;
let hitFlashT = 0;
let popups = []; // {x, y, text, color, t}
let smokeColumns = []; // ambient smoke pillars at smash sites: {x, y, t, life}
let craters = []; // permanent floor scars from smashed buildings
let distantChoppers = []; // far skyline helicopter silhouettes (decorative)
function addShake(mag, dur) { shakeMag = Math.max(shakeMag, mag); shakeT = Math.max(shakeT, dur); }
function addPopup(x, y, text, color) { popups.push({ x, y, text, color: color || '#ffd23f', t: 0 }); if (popups.length > 40) popups.shift(); }

// Building types — each with different score/effect
const BUILDING_TYPES = {
  apt:   { color: '#5a5a72', val: 50,  hp: 2, label: '' },
  apt2:  { color: '#6b3a1c', val: 60,  hp: 2, label: '' },
  apt3:  { color: '#3a3a4a', val: 50,  hp: 3, label: '' },
  apt4:  { color: '#4a4a52', val: 70,  hp: 3, label: '' },
  bank:  { color: '#5ef38c', val: 200, hp: 4, label: '$', special: 'bank' },     // 3x money + treasure burst
  gas:   { color: '#ff8e3c', val: 80,  hp: 1, label: '⛽', special: 'gas' },    // chain explosion
};

function reset() {
  formIdx = 0;
  pug = { x: WORLD_W / 2, y: WORLD_H / 2, vx: 0, vy: 0 };
  buildings = [];
  for (let i = 0; i < 80; i++) buildings.push(makeBuilding());
  vehicles = []; helicopters = []; missiles = []; particles = []; powerups = [];
  for (let i = 0; i < 18; i++) spawnVehicle();
  for (let i = 0; i < 3; i++) spawnHelicopter();
  score = 0; smashed = 0; eaten = 0; hp = 100; borkCd = 0;
  combo = 0; comboT = 0; dmgBoostT = 0;
  cam = { x: pug.x, y: pug.y };
  shakeT = 0; shakeMag = 0; hitFlashT = 0;
  popups = []; smokeColumns = []; craters = [];
  // Distant skyline silhouette choppers (decorative — drift across horizon band)
  distantChoppers = [];
  for (let i = 0; i < 5; i++) {
    distantChoppers.push({
      x: Math.random() * WORLD_W,
      y: 30 + Math.random() * 110,
      vx: 30 + Math.random() * 40,
      blade: Math.random() * Math.PI,
    });
  }
}
function makeBuilding() {
  // 8% bank, 12% gas station, rest apartments
  const r = Math.random();
  let typeId;
  if (r < 0.08) typeId = 'bank';
  else if (r < 0.20) typeId = 'gas';
  else typeId = ['apt', 'apt2', 'apt3', 'apt4'][Math.floor(Math.random() * 4)];
  const t = BUILDING_TYPES[typeId];
  return {
    x: rand(40, WORLD_W - 60),
    y: rand(40, WORLD_H - 60),
    w: rand(40, 80),
    h: rand(50, 130),
    hp: t.hp,
    typeId,
    color: t.color,
    val: t.val,
    label: t.label,
    special: t.special,
  };
}
function spawnPowerup(x, y) {
  const types = ['heal', 'damage', 'rage'];
  const t = types[Math.floor(Math.random() * types.length)];
  powerups.push({ x, y, type: t, t: 0 });
}
function rand(a, b) { return a + Math.random() * (b - a); }
function spawnVehicle() {
  vehicles.push({
    x: rand(0, WORLD_W), y: rand(0, WORLD_H),
    vx: 0, vy: 0, fleeT: 0,
    color: ['#ff3a3a', '#ffd23f', '#4cc9f0', '#fff'][Math.floor(Math.random() * 4)],
  });
}
function spawnHelicopter() {
  const side = Math.random() < 0.5 ? -1 : 1;
  helicopters.push({
    x: side < 0 ? -40 : WORLD_W + 40,
    y: rand(80, WORLD_H - 80),
    vx: -side * 60,
    fireCd: 2,
    hp: 2,
  });
}
function form() { return FORMS[formIdx]; }

const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === ' ' || e.code === 'Space') doBork();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', () => smashAt(mouse.x + cam.x - W / 2, mouse.y + cam.y - H / 2));
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0]; mouse.x = t.clientX; mouse.y = t.clientY;
  smashAt(t.clientX + cam.x - W / 2, t.clientY + cam.y - H / 2);
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; mouse.x = t.clientX; mouse.y = t.clientY; e.preventDefault(); }, { passive: false });
document.getElementById('bork-btn').addEventListener('click', doBork);
if ('ontouchstart' in window) document.getElementById('bork-btn').style.display = 'block';

function smashAt(wx, wy) {
  // Smash building under reach (within pug.r + 80)
  for (let i = buildings.length - 1; i >= 0; i--) {
    const b = buildings[i];
    if (wx > b.x && wx < b.x + b.w && wy > b.y && wy < b.y + b.h) {
      if (Math.hypot(b.x + b.w / 2 - pug.x, b.y + b.h / 2 - pug.y) > form().r + 100) continue;
      b.hp -= form().smash * (dmgBoostT > 0 ? 2.5 : 1);
      sfx.tone(120 + Math.random() * 60, 'sawtooth', 0.1, 0.22);
      if (b.hp <= 0) {
        smashBuilding(b, i);
      }
      return;
    }
  }
  // Eat vehicle under reach
  for (let i = vehicles.length - 1; i >= 0; i--) {
    const v = vehicles[i];
    if (Math.hypot(v.x - pug.x, v.y - pug.y) < form().r + 16 && Math.hypot(v.x - wx, v.y - wy) < 30) {
      vehicles.splice(i, 1);
      eaten++; score += 30;
      sfx.tone(660, 'triangle', 0.1, 0.22);
      addPopup(v.x, v.y - 8, '+30 🍴', '#ffd23f');
      addShake(2, 0.1);
      if (eaten >= 5 && formIdx < FORMS.length - 1) {
        formIdx++; eaten = 0;
        hp = Math.min(100 + formIdx * 50, hp + 80);
        sfx.arp([523, 659, 784, 1047], 'triangle', 0.1, 0.25, 0.3);
        addShake(10, 0.4);
        addPopup(pug.x, pug.y - form().r - 12, 'EVOLVE! ' + form().name.toUpperCase(), '#b055ff');
      }
      spawnVehicle();
      return;
    }
  }
}
function spawnReplacementBuilding() {
  buildings.push(makeBuilding());
}

function doBork() {
  if (!running || borkCd > 0) return;
  borkCd = 4;
  sfx.sweep(220, 80, 'sawtooth', 0.5, 0.3);
  addShake(8, 0.32);
  // Shockwave: push everything outward + damage helicopters
  const reach = form().r + 250;
  for (const v of vehicles) {
    const dx = v.x - pug.x, dy = v.y - pug.y;
    const d = Math.hypot(dx, dy);
    if (d < reach && d > 0) {
      v.vx += (dx / d) * 400;
      v.vy += (dy / d) * 400;
      v.fleeT = 2;
    }
  }
  for (let i = helicopters.length - 1; i >= 0; i--) {
    const h = helicopters[i];
    const d = Math.hypot(h.x - pug.x, h.y - pug.y);
    if (d < reach) {
      h.hp -= 2;
      h.x += (h.x - pug.x) / d * 100;
      if (h.hp <= 0) {
        score += 200;
        spawnDust(h.x, h.y, '#ff3a3a');
        helicopters.splice(i, 1);
      }
    }
  }
  // damage buildings caught
  for (let i = buildings.length - 1; i >= 0; i--) {
    const b = buildings[i];
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    if (Math.hypot(cx - pug.x, cy - pug.y) < reach) {
      b.hp -= 1;
      if (b.hp <= 0) {
        score += 30; smashed++;
        spawnDust(cx, cy, b.color);
        buildings.splice(i, 1);
      }
    }
  }
  particles.push({ ring: true, x: pug.x, y: pug.y, t: 0, maxR: reach });
}
function bumpCombo() {
  if (comboT > 0) combo++;
  else combo = 1;
  comboT = 2.0;
}
function comboMult() { return Math.min(5, 1 + (combo - 1) * 0.25); }

function smashBuilding(b, idx) {
  bumpCombo();
  const mult = comboMult();
  const gain = Math.floor(b.val * mult);
  score += gain;
  smashed++;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  spawnDust(cx, cy, b.color);
  addPopup(cx, cy - b.h / 2, '+' + gain, b.special === 'bank' ? '#5ef38c' : (b.special === 'gas' ? '#ff8e3c' : '#ffd23f'));
  addShake(b.special ? 6 : 4, b.special ? 0.28 : 0.18);
  smokeColumns.push({ x: cx, y: cy, t: 0, life: 4, mag: b.h });
  if (smokeColumns.length > 30) smokeColumns.shift();
  craters.push({ x: cx, y: cy, r: Math.max(b.w, b.h) * 0.45 });
  if (craters.length > 120) craters.shift();
  buildings.splice(idx, 1);
  // Special effects
  if (b.special === 'bank') {
    // Coin burst — extra particles + score boost
    for (let i = 0; i < 20; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 80 + Math.random() * 160;
      particles.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color: '#ffd23f', life: 1.2, t: 0, size: 5 });
    }
    sfx.arp([523, 659, 784, 1047, 1319], 'triangle', 0.07, 0.25, 0.25);
    if (Math.random() < 0.5) spawnPowerup(b.x + b.w / 2, b.y + b.h / 2);
  } else if (b.special === 'gas') {
    // Chain explosion — radius 120
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    sfx.sweep(440, 110, 'sawtooth', 0.4, 0.3);
    particles.push({ ring: true, x: cx, y: cy, t: 0, maxR: 140 });
    for (let j = buildings.length - 1; j >= 0; j--) {
      const o = buildings[j];
      const ocx = o.x + o.w / 2, ocy = o.y + o.h / 2;
      if (Math.hypot(ocx - cx, ocy - cy) < 140) {
        o.hp -= 2;
        if (o.hp <= 0) smashBuilding(o, j);
      }
    }
    // also damages vehicles & helicopters
    for (let j = helicopters.length - 1; j >= 0; j--) {
      const h = helicopters[j];
      if (Math.hypot(h.x - cx, h.y - cy) < 140) {
        h.hp -= 3;
        if (h.hp <= 0) { score += 200; helicopters.splice(j, 1); }
      }
    }
    // 30% spawn powerup
    if (Math.random() < 0.3) spawnPowerup(cx, cy);
  } else {
    if (Math.random() < 0.08) spawnPowerup(b.x + b.w / 2, b.y + b.h / 2);
  }
  if (Math.random() < 0.2 && buildings.length < 100) spawnReplacementBuilding();
}

function spawnDust(x, y, color) {
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 60 + Math.random() * 140;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 0.7, t: 0, size: 4 });
  }
}

function tick(dt) {
  if (!running) return;
  borkCd = Math.max(0, borkCd - dt);
  comboT = Math.max(0, comboT - dt);
  if (comboT <= 0) combo = 0;
  dmgBoostT = Math.max(0, dmgBoostT - dt);
  // Powerup pickup
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    p.t += dt;
    if (p.t > 12) { powerups.splice(i, 1); continue; }
    if (Math.hypot(p.x - pug.x, p.y - pug.y) < form().r + 16) {
      if (p.type === 'heal') { hp = Math.min(100 + formIdx * 50, hp + 40); sfx.tone(880, 'triangle', 0.12, 0.22); }
      else if (p.type === 'damage') { dmgBoostT = 8; sfx.arp([523, 880, 1320], 'square', 0.06, 0.22, 0.18); }
      else if (p.type === 'rage') { borkCd = 0; eaten = Math.min(4, eaten + 2); sfx.tone(440, 'sawtooth', 0.3, 0.25); }
      powerups.splice(i, 1);
    }
  }
  // Move pug
  let mx = 0, my = 0;
  if (keys.has('w')) my -= 1;
  if (keys.has('s')) my += 1;
  if (keys.has('a')) mx -= 1;
  if (keys.has('d')) mx += 1;
  if (mx || my) {
    const l = Math.hypot(mx, my);
    const speed = 220 - formIdx * 25;
    pug.vx += (mx / l) * speed * dt * 3;
    pug.vy += (my / l) * speed * dt * 3;
  }
  pug.vx *= Math.pow(0.5, dt * 3); pug.vy *= Math.pow(0.5, dt * 3);
  pug.x += pug.vx * dt; pug.y += pug.vy * dt;
  pug.x = Math.max(form().r, Math.min(WORLD_W - form().r, pug.x));
  pug.y = Math.max(form().r, Math.min(WORLD_H - form().r, pug.y));
  cam.x += (pug.x - cam.x) * 5 * dt;
  cam.y += (pug.y - cam.y) * 5 * dt;

  // Vehicles flee from pug
  for (const v of vehicles) {
    if (v.fleeT > 0) v.fleeT -= dt;
    const dx = pug.x - v.x, dy = pug.y - v.y;
    const d = Math.hypot(dx, dy);
    if (d < 300) {
      v.vx -= (dx / d) * 200 * dt;
      v.vy -= (dy / d) * 200 * dt;
    }
    v.vx *= Math.pow(0.5, dt * 2); v.vy *= Math.pow(0.5, dt * 2);
    v.x += v.vx * dt; v.y += v.vy * dt;
    v.x = Math.max(20, Math.min(WORLD_W - 20, v.x));
    v.y = Math.max(20, Math.min(WORLD_H - 20, v.y));
  }
  // Helicopters
  for (const h of helicopters) {
    h.x += h.vx * dt;
    h.fireCd -= dt;
    if (h.fireCd <= 0) {
      h.fireCd = 1.8 + Math.random() * 0.6;
      const dx = pug.x - h.x, dy = pug.y - h.y;
      const d = Math.hypot(dx, dy);
      missiles.push({ x: h.x, y: h.y, vx: (dx / d) * 200, vy: (dy / d) * 200, life: 5 });
      sfx.tone(440, 'square', 0.06, 0.18);
    }
    if (h.x < -60 || h.x > WORLD_W + 60) h.vx = -h.vx;
  }
  // Spawn new helicopters periodically
  if (Math.random() < dt * 0.08 && helicopters.length < 6) spawnHelicopter();
  if (vehicles.length < 12) spawnVehicle();

  // Missiles
  for (let i = missiles.length - 1; i >= 0; i--) {
    const m = missiles[i];
    m.x += m.vx * dt; m.y += m.vy * dt; m.life -= dt;
    if (m.life <= 0) { missiles.splice(i, 1); continue; }
    if (Math.hypot(m.x - pug.x, m.y - pug.y) < form().r) {
      hp -= 12;
      missiles.splice(i, 1);
      sfx.tone(180, 'square', 0.1, 0.22);
      addShake(5, 0.22);
      hitFlashT = 0.18;
      addPopup(pug.x, pug.y - form().r - 4, '-12 HP', '#ff5a5a');
      if (hp <= 0) return end();
    }
  }
  // particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.ring) {
      if (p.t > 0.5) particles.splice(i, 1);
    } else {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94;
      if (p.t >= p.life) particles.splice(i, 1);
    }
  }
  // Juice tick
  if (shakeT > 0) { shakeT -= dt; if (shakeT <= 0) shakeMag = 0; }
  if (hitFlashT > 0) hitFlashT = Math.max(0, hitFlashT - dt);
  for (const p of popups) { p.t += dt; p.y -= 32 * dt; }
  popups = popups.filter((p) => p.t < 1.2);
  for (const s of smokeColumns) s.t += dt;
  smokeColumns = smokeColumns.filter((s) => s.t < s.life);
  // Distant choppers drift
  for (const d of distantChoppers) {
    d.x += d.vx * dt;
    d.blade += dt * 18;
    if (d.x > WORLD_W + 60) { d.x = -60; d.y = 30 + Math.random() * 110; }
  }
  updateHud();
}

function render() {
  // Sky gradient (screen space, painted first)
  const skyGrd = ctx.createLinearGradient(0, 0, 0, H);
  skyGrd.addColorStop(0, '#3a1a4a');
  skyGrd.addColorStop(0.5, '#52223a');
  skyGrd.addColorStop(1, '#22103f');
  ctx.fillStyle = skyGrd; ctx.fillRect(0, 0, W, H);
  // Distant low-parallax skyline band (screen space, before world)
  const horizonY = H * 0.22;
  ctx.fillStyle = 'rgba(20,8,30,0.7)';
  // Pseudo-random skyline silhouettes (parallax: shift by cam.x * 0.1)
  const px = (cam.x * 0.12) % 80;
  for (let i = -2; i < Math.floor(W / 30) + 2; i++) {
    const seed = ((i + 100) * 37) % 100;
    const bh = 30 + (seed % 60);
    const bw = 16 + (seed % 14);
    ctx.fillRect(i * 30 - px, horizonY - bh, bw, bh + 4);
    // tiny windows
    ctx.fillStyle = 'rgba(255,210,63,0.4)';
    for (let yy = 4; yy < bh - 4; yy += 8) {
      if ((yy + seed) % 16 === 0) ctx.fillRect(i * 30 - px + 4, horizonY - bh + yy, 2, 3);
    }
    ctx.fillStyle = 'rgba(20,8,30,0.7)';
  }
  // Distant choppers (parallax silhouette)
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  for (const d of distantChoppers) {
    const sx = ((d.x - cam.x * 0.3) % (WORLD_W + 120) + (WORLD_W + 120)) % (WORLD_W + 120) - 60;
    const sy = d.y;
    if (sx < -60 || sx > W + 60) continue;
    ctx.fillRect(sx - 6, sy - 2, 12, 4);
    // blade
    const bx = Math.cos(d.blade) * 10;
    ctx.fillRect(sx - bx, sy - 4, bx * 2 || 1, 1);
  }
  // Now world-space render with shake offset
  let _sx = 0, _sy = 0;
  if (shakeT > 0 && shakeMag > 0) {
    const k = Math.min(1, shakeT / 0.3);
    _sx = (Math.random() - 0.5) * shakeMag * 2 * k;
    _sy = (Math.random() - 0.5) * shakeMag * 2 * k;
  }
  ctx.save();
  ctx.translate(W / 2 - cam.x + _sx, H / 2 - cam.y + _sy);
  // Ground / streets
  ctx.fillStyle = '#3a2a5a'; ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  // Wide road bands
  ctx.fillStyle = '#221836';
  for (let x = 80; x < WORLD_W; x += 220) ctx.fillRect(x - 22, 0, 44, WORLD_H);
  for (let y = 80; y < WORLD_H; y += 220) ctx.fillRect(0, y - 22, WORLD_W, 44);
  // Sidewalk edge highlights
  ctx.fillStyle = '#4a3a6a';
  for (let x = 80; x < WORLD_W; x += 220) {
    ctx.fillRect(x - 24, 0, 2, WORLD_H);
    ctx.fillRect(x + 22, 0, 2, WORLD_H);
  }
  for (let y = 80; y < WORLD_H; y += 220) {
    ctx.fillRect(0, y - 24, WORLD_W, 2);
    ctx.fillRect(0, y + 22, WORLD_W, 2);
  }
  // Center lane dashes (yellow)
  ctx.fillStyle = 'rgba(255,210,63,0.55)';
  for (let x = 80; x < WORLD_W; x += 220) {
    for (let y = 10; y < WORLD_H; y += 38) ctx.fillRect(x - 1, y, 2, 18);
  }
  for (let y = 80; y < WORLD_H; y += 220) {
    for (let x = 10; x < WORLD_W; x += 38) ctx.fillRect(x, y - 1, 18, 2);
  }
  // Strong street outlines (kept similar to original look)
  ctx.strokeStyle = '#1a0d05';
  ctx.lineWidth = 2;
  for (let x = 80; x < WORLD_W; x += 220) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_H); ctx.stroke();
  }
  for (let y = 80; y < WORLD_H; y += 220) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_W, y); ctx.stroke();
  }
  // Craters from smashed buildings (drawn under everything)
  for (const c of craters) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(60,40,30,0.55)';
    ctx.beginPath(); ctx.arc(c.x + 2, c.y + 2, c.r * 0.7, 0, Math.PI * 2); ctx.fill();
    // rubble dots
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.fillStyle = 'rgba(80,60,50,0.6)';
      ctx.fillRect(c.x + Math.cos(a) * c.r * 0.8 - 1, c.y + Math.sin(a) * c.r * 0.8 - 1, 3, 3);
    }
  }
  // Buildings
  for (const b of buildings) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(b.x, b.y + b.h - 6, b.w, 6);
    // windows
    ctx.fillStyle = 'rgba(255,210,63,0.55)';
    for (let yy = 6; yy < b.h - 8; yy += 12) {
      for (let xx = 6; xx < b.w - 6; xx += 12) {
        if ((xx + yy + b.hp * 7) % 24 === 0) ctx.fillRect(b.x + xx, b.y + yy, 4, 6);
      }
    }
    // Special label
    if (b.label) {
      ctx.font = "16px serif"; ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + 18);
    }
    if (b.special === 'bank') {
      ctx.strokeStyle = '#5ef38c'; ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    } else if (b.special === 'gas') {
      ctx.strokeStyle = '#ff8e3c'; ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
  }
  // Powerups — pixel-art icons (heal→heart, damage→lightning; rage has no library match → keep abstract glyph)
  for (const p of powerups) {
    const blink = p.t > 8 ? (Math.floor(p.t * 6) % 2 === 0) : true;
    if (!blink) continue;
    ctx.shadowColor = p.type === 'heal' ? '#5ef38c' : (p.type === 'damage' ? '#ff3a3a' : '#b055ff');
    ctx.shadowBlur = 14;
    ctx.fillStyle = p.type === 'heal' ? '#5ef38c' : (p.type === 'damage' ? '#ff3a3a' : '#b055ff');
    ctx.fillRect(p.x - 14, p.y - 14, 28, 28);
    ctx.shadowBlur = 0;
    if (p.type === 'heal') drawIcon.heart(ctx, p.x, p.y, 22);
    else if (p.type === 'damage') drawIcon.lightning(ctx, p.x, p.y, 22);
    else {
      // Rage / enrage — no library match, keep a fanged glyph (eyebrows + jagged mouth)
      ctx.fillStyle = '#fff';
      ctx.font = "20px serif"; ctx.textAlign = 'center';
      ctx.fillText('!!', p.x, p.y + 6);
    }
  }
  // Vehicles
  for (const v of vehicles) {
    ctx.fillStyle = v.color;
    ctx.fillRect(v.x - 10, v.y - 6, 20, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(v.x - 6, v.y - 4, 12, 5);
  }
  // Helicopters
  for (const h of helicopters) {
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(h.x - 14, h.y - 8, 28, 16);
    ctx.fillStyle = '#1a0d05';
    ctx.fillRect(h.x - 18, h.y - 1, 36, 2); // rotor
    ctx.fillStyle = '#ff3a3a';
    ctx.fillRect(h.x - 2, h.y - 2, 4, 4); // light
  }
  // Missiles
  for (const m of missiles) {
    ctx.fillStyle = '#ff8e3c';
    ctx.fillRect(m.x - 3, m.y - 3, 6, 6);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(m.x - 6, m.y - 1, 4, 2);
  }
  // Particles
  for (const p of particles) {
    if (p.ring) {
      ctx.strokeStyle = `rgba(255,210,63,${1 - p.t / 0.5})`;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.maxR * (p.t / 0.5), 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.globalAlpha = 1 - p.t / p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.globalAlpha = 1;
    }
  }
  // PUGZILLA
  const r = form().r;
  // Damage-boost aura
  if (dmgBoostT > 0) {
    ctx.strokeStyle = `rgba(255,58,58,${0.4 + Math.sin(performance.now() / 80) * 0.3})`;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(pug.x, pug.y, r + 12, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = form().color;
  ctx.beginPath(); ctx.arc(pug.x, pug.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(pug.x - r + 4, pug.y - r - 8, r * 0.5, r * 0.5);
  ctx.fillRect(pug.x + r * 0.5 - 4, pug.y - r - 8, r * 0.5, r * 0.5);
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(pug.x, pug.y + r * 0.18, r * 0.7, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(pug.x - r * 0.4, pug.y - r * 0.18, r * 0.16, r * 0.16);
  ctx.fillRect(pug.x + r * 0.24, pug.y - r * 0.18, r * 0.16, r * 0.16);
  ctx.fillStyle = '#ff3a3a';
  ctx.fillRect(pug.x - r * 0.36, pug.y - r * 0.14, r * 0.08, r * 0.08);
  ctx.fillRect(pug.x + r * 0.28, pug.y - r * 0.14, r * 0.08, r * 0.08);
  ctx.fillStyle = '#ff5a82';
  ctx.beginPath(); ctx.arc(pug.x, pug.y + r * 0.45, r * 0.18, 0, Math.PI * 2); ctx.fill();
  // Smoke columns (drawn in world, rise upward from smash sites)
  for (const s of smokeColumns) {
    const t = s.t / s.life;
    const baseA = (1 - t) * 0.55;
    const rise = t * 90;
    for (let i = 0; i < 5; i++) {
      const py = s.y - i * 22 - rise;
      const rr = 14 + i * 5 + Math.sin(s.t * 2 + i) * 3;
      const a = baseA * (1 - i * 0.15);
      ctx.fillStyle = `rgba(60,55,72,${a})`;
      ctx.beginPath(); ctx.arc(s.x + Math.sin(s.t + i) * 4, py, rr, 0, Math.PI * 2); ctx.fill();
    }
    // Ember
    if (t < 0.4) {
      ctx.fillStyle = `rgba(255,142,60,${(0.4 - t) * 1.4})`;
      ctx.beginPath(); ctx.arc(s.x, s.y - rise * 0.3, 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Score popups (world space)
  ctx.font = "bold 12px 'Press Start 2P', monospace";
  ctx.textAlign = 'center';
  for (const p of popups) {
    const a = p.t < 0.1 ? p.t / 0.1 : (p.t > 0.9 ? Math.max(0, (1.2 - p.t) / 0.3) : 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#000'; ctx.fillText(p.text, p.x + 1, p.y + 1);
    ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // Hit flash overlay
  if (hitFlashT > 0) {
    ctx.fillStyle = `rgba(255,58,58,${Math.min(0.45, hitFlashT * 2.2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  // Vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.7);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // HP bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W / 2 - 100, 16, 200, 8);
  ctx.fillStyle = hp > 50 ? '#5ef38c' : (hp > 25 ? '#ffd23f' : '#ff3a3a');
  ctx.fillRect(W / 2 - 100, 16, 200 * Math.max(0, hp) / 100, 8);
  // Combo banner
  if (combo > 1 && running) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = "bold 28px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14;
    ctx.fillText(`COMBO ×${combo}  (×${comboMult().toFixed(1)})`, W / 2, 60);
    ctx.shadowBlur = 0;
    // Combo timer
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W / 2 - 100, 72, 200, 4);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(W / 2 - 100, 72, 200 * (comboT / 2.0), 4);
  }
  // Damage boost banner
  if (dmgBoostT > 0) {
    ctx.fillStyle = '#ff3a3a';
    ctx.font = "16px 'Press Start 2P', monospace"; ctx.textAlign = 'right';
    const txt = `2.5× DMG ${dmgBoostT.toFixed(1)}s`;
    ctx.fillText(txt, W - 16, H - 22);
    // pixel lightning glyph just left of the text
    const tw = ctx.measureText(txt).width;
    drawIcon.lightning(ctx, W - 16 - tw - 14, H - 28, 16);
  }
  // Cursor reach indicator
  ctx.strokeStyle = 'rgba(255,210,63,0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(W / 2 + (pug.x - cam.x), H / 2 + (pug.y - cam.y), r + 100, 0, Math.PI * 2); ctx.stroke();
}

function updateHud() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-form').textContent = form().name;
  const hpEl = document.getElementById('hud-hp');
  hpEl.textContent = Math.max(0, Math.ceil(hp));
  hpEl.parentElement.classList.toggle('is-low', hp < 30);
  document.getElementById('hud-smashed').textContent = smashed;
  document.getElementById('hud-eaten').textContent = `${eaten}/5`;
  document.getElementById('hud-cd').textContent = borkCd > 0 ? borkCd.toFixed(1) + 's' : 'READY';
  const best = loadBest('pugzilla');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

function end() {
  running = false;
  sfx.sweep(220, 60, 'sawtooth', 1.0, 0.25);
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-smashed').textContent = smashed;
  document.getElementById('end-eaten').textContent = eaten + formIdx * 5;
  const { isNewBest, current } = submitRun('pugzilla', { score, smashed });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { score };
    bestEl.innerHTML = `Best: <b>${b.score}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  document.getElementById('hud').hidden = true;
  document.getElementById('end-overlay').hidden = false;
  document.getElementById('end-overlay').classList.remove('is-hidden');
}

document.getElementById('start-btn').addEventListener('click', start);
document.getElementById('end-restart').addEventListener('click', start);
function start() {
  reset(); running = true;
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
      showTip('WASD walk · CLICK building to smash · SPACE = shockwave bork', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
