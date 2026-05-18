// TONGUE STRETCH — aim + charge + fling a stretchy tongue.
// Original mechanic: tongue is a dynamic curve that extends, lashes back,
// and snags treats. Bees deflect it.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'tongue:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

const PUG_R = 50;
let pug = { x: 0, y: 0 };
let aim = { x: 0, y: 0 };
let tongue = { active: false, t: 0, dur: 0, maxLen: 0, retract: false, hitTreat: null };
let charging = false, chargeT = 0;
let treats = [];   // {x,y,r,vx,vy}
let bees = [];     // {x,y,vx,vy}
let score = 0, treatsCount = 0, timeLeft = 60;
let running = false;

function reset() {
  pug.x = W / 2; pug.y = H - 80;
  aim.x = W / 2; aim.y = H / 2;
  tongue = { active: false, t: 0, dur: 0, maxLen: 0, retract: false, hitTreat: null };
  charging = false; chargeT = 0;
  treats = []; bees = [];
  score = 0; treatsCount = 0; timeLeft = 60;
  for (let i = 0; i < 6; i++) spawnTreat();
}
function spawnTreat() {
  treats.push({
    x: 60 + Math.random() * (W - 120),
    y: 60 + Math.random() * (H - 280),
    r: 12 + Math.random() * 6,
    vx: (Math.random() - 0.5) * 30,
    vy: (Math.random() - 0.5) * 30,
  });
}
function spawnBee() {
  const side = Math.random() < 0.5 ? -1 : 1;
  bees.push({
    x: side < 0 ? -20 : W + 20,
    y: 80 + Math.random() * (H - 280),
    vx: -side * (50 + Math.random() * 60),
    vy: (Math.random() - 0.5) * 30,
    life: 6,
  });
}
function startCharge() { if (!running) return; charging = true; chargeT = 0; }
function releaseCharge() {
  if (!charging) return;
  charging = false;
  if (!running) return;
  const len = Math.min(1, chargeT / 1.0);
  const reach = 120 + len * 600;
  tongue = { active: true, t: 0, dur: 0.18 + len * 0.4, maxLen: reach, retract: false, hitTreat: null };
  sfx.sweep(440, 220, 'sawtooth', 0.12, 0.2);
}
canvas.addEventListener('mousedown', (e) => { aim.x = e.clientX; aim.y = e.clientY; startCharge(); });
canvas.addEventListener('mousemove', (e) => { aim.x = e.clientX; aim.y = e.clientY; });
window.addEventListener('mouseup', releaseCharge);
canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; aim.x = t.clientX; aim.y = t.clientY; startCharge(); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; aim.x = t.clientX; aim.y = t.clientY; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', (e) => { releaseCharge(); e.preventDefault(); }, { passive: false });

function tongueTip() {
  if (!tongue.active) return null;
  const k = tongue.retract ? 1 - tongue.t / tongue.dur : tongue.t / tongue.dur;
  const ang = Math.atan2(aim.y - pug.y, aim.x - pug.x);
  const len = tongue.maxLen * Math.max(0, Math.min(1, k));
  return { x: pug.x + Math.cos(ang) * len, y: pug.y + Math.sin(ang) * len, len, ang };
}

function tick(dt) {
  if (!running) return;
  timeLeft -= dt;
  if (timeLeft <= 0) return end();

  if (charging) chargeT = Math.min(1.0, chargeT + dt);
  // pug bobs slightly
  pug.y = H - 80 + Math.sin(performance.now() / 400) * 4;

  // Treats drift
  for (const t of treats) {
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    if (t.x < t.r + 10 || t.x > W - t.r - 10) t.vx *= -1;
    if (t.y < t.r + 60 || t.y > H - 220) t.vy *= -1;
  }
  // Spawn bees occasionally
  if (Math.random() < dt * 0.6) spawnBee();
  for (let i = bees.length - 1; i >= 0; i--) {
    const b = bees[i];
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < -50 || b.x > W + 50) bees.splice(i, 1);
  }

  // Tongue progress
  if (tongue.active) {
    tongue.t += dt;
    const tip = tongueTip();
    if (!tongue.retract) {
      // Hit-check vs treats
      for (let i = treats.length - 1; i >= 0; i--) {
        const tr = treats[i];
        const d = Math.hypot(tr.x - tip.x, tr.y - tip.y);
        if (d < tr.r + 10) {
          tongue.hitTreat = tr;
          treats.splice(i, 1);
          tongue.retract = true; tongue.t = 0; tongue.dur = 0.35;
          sfx.tone(900, 'triangle', 0.1, 0.22);
          break;
        }
      }
      // Hit-check vs bees (cancel)
      for (let i = bees.length - 1; i >= 0; i--) {
        const b = bees[i];
        const d = Math.hypot(b.x - tip.x, b.y - tip.y);
        if (d < 18) {
          tongue.retract = true; tongue.t = 0; tongue.dur = 0.25;
          score = Math.max(0, score - 50);
          sfx.sweep(220, 110, 'sawtooth', 0.2, 0.2);
          bees.splice(i, 1);
          break;
        }
      }
      // Auto-retract when fully extended
      if (tongue.t >= tongue.dur) { tongue.retract = true; tongue.t = 0; tongue.dur = 0.35; }
    } else {
      if (tongue.t >= tongue.dur) {
        // Done — score the treat
        if (tongue.hitTreat) {
          treatsCount++;
          const pts = 100 + Math.floor(tongue.maxLen / 5);
          score += pts;
          // Spawn replacement
          spawnTreat();
        }
        tongue = { active: false, t: 0, dur: 0, maxLen: 0, retract: false, hitTreat: null };
      }
    }
  }
  updateHud();
}

function render() {
  // BG gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a0f2e'); g.addColorStop(1, '#0a0716');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // grass strip at bottom
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(0, H - 200, W, 200);
  ctx.fillStyle = '#3a5a3a';
  for (let x = 0; x < W; x += 12) ctx.fillRect(x, H - 200, 2, 6);

  // Treats
  for (const t of treats) {
    ctx.fillStyle = '#ffd23f';
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10;
    ctx.fillRect(t.x - t.r, t.y - t.r, t.r * 2, t.r * 2);
    ctx.fillStyle = '#fff0a0';
    ctx.fillRect(t.x - t.r + 4, t.y - t.r + 4, t.r * 2 - 12, 4);
    ctx.shadowBlur = 0;
  }
  // Bees
  for (const b of bees) {
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(b.x - 6, b.y - 4, 12, 8);
    ctx.fillStyle = '#000'; ctx.fillRect(b.x - 4, b.y - 4, 2, 8); ctx.fillRect(b.x, b.y - 4, 2, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(b.x - 8, b.y - 6, 4, 3); ctx.fillRect(b.x + 4, b.y - 6, 4, 3);
  }
  // Pug at bottom
  drawPug(pug.x, pug.y);

  // Aim guide (when charging)
  if (charging) {
    const ang = Math.atan2(aim.y - pug.y, aim.x - pug.x);
    const reach = 120 + chargeT * 600;
    ctx.strokeStyle = 'rgba(255,210,63,0.35)';
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pug.x, pug.y); ctx.lineTo(pug.x + Math.cos(ang) * reach, pug.y + Math.sin(ang) * reach); ctx.stroke();
    ctx.setLineDash([]);
    // charge bar
    const bw = 140, bx = pug.x - bw / 2, by = pug.y + PUG_R + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bx, by, bw, 8);
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(bx, by, bw * chargeT, 8);
  }

  // Tongue
  if (tongue.active) {
    const tip = tongueTip();
    ctx.strokeStyle = '#ff5a82';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pug.x, pug.y - 6);
    // tiny wobble
    const midX = (pug.x + tip.x) / 2 + Math.sin(performance.now() / 50) * 8;
    const midY = (pug.y + tip.y) / 2 + Math.cos(performance.now() / 50) * 4;
    ctx.quadraticCurveTo(midX, midY, tip.x, tip.y);
    ctx.stroke();
    // tip dot
    ctx.fillStyle = '#ffaac4';
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 8, 0, Math.PI * 2); ctx.fill();
    // if hit treat, attach to tip
    if (tongue.retract && tongue.hitTreat) {
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(tip.x - 10, tip.y - 10, 20, 20);
    }
  }
}

function drawPug(x, y) {
  // ears
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(x - PUG_R + 4, y - PUG_R - 6, 18, 18);
  ctx.fillRect(x + PUG_R - 22, y - PUG_R - 6, 18, 18);
  // head
  ctx.fillStyle = '#e0a566';
  ctx.beginPath(); ctx.arc(x, y, PUG_R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8854a';
  ctx.fillRect(x - PUG_R, y, PUG_R * 2, PUG_R);
  // mask
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(x, y + 8, PUG_R * 0.78, PUG_R * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 20, y - 8, 8, 8); ctx.fillRect(x + 12, y - 8, 8, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 18, y - 6, 4, 4); ctx.fillRect(x + 14, y - 6, 4, 4);
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.arc(x, y + 18, 9, 0, Math.PI * 2); ctx.fill();
}

function updateHud() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-treats').textContent = treatsCount;
  document.getElementById('hud-time').textContent = Math.max(0, Math.ceil(timeLeft));
  const best = loadBest('tongue-stretch');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

function end() {
  running = false;
  sfx.arp([440, 330, 220], 'sawtooth', 0.12, 0.2, 0.4);
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-treats').textContent = treatsCount;
  const { isNewBest, current } = submitRun('tongue-stretch', { score, treats: treatsCount });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { score, treats: treatsCount };
    bestEl.innerHTML = `Best: <b>${b.score}</b> (${b.treats} treats)${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  document.getElementById('hud').hidden = true;
  document.getElementById('end-overlay').hidden = false;
  document.getElementById('end-overlay').classList.remove('is-hidden');
}

document.getElementById('start-btn').addEventListener('click', start);
document.getElementById('end-restart').addEventListener('click', start);
function start() {
  reset(); running = true;
  document.getElementById('overlay').hidden = true;
  document.getElementById('overlay').classList.add('is-hidden');
  document.getElementById('end-overlay').hidden = true;
  document.getElementById('end-overlay').classList.add('is-hidden');
  document.getElementById('hud').hidden = false;
  updateHud(); sfx.resume();
}

let lastT = performance.now();
(function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  tick(dt); render();
  requestAnimationFrame(loop);
})(performance.now());

const best = loadBest('tongue-stretch');
if (best) {
  const sub = document.querySelector('#overlay .overlay__sub');
  if (sub) {
    const d = document.createElement('div');
    d.style.cssText = 'margin:10px 0 0;color:var(--neon-yellow);font-size:0.55rem;';
    d.innerHTML = `★ Best: <b>${best.score}</b>`;
    sub.appendChild(d);
  }
}
