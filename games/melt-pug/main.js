// MELT-PUG — pet on beat. The pug melts unless you keep up.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'melt:muted' });
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

let pug, spot, melt, score, streak, beatT, beatDur, running;

function reset() {
  pug = { cx: W / 2, cy: H / 2, melt: 0 };
  newSpot();
  melt = 0; score = 0; streak = 0;
  beatT = 0; beatDur = 1.0;
}
function newSpot() {
  // Random spot on pug body (radius ~120 from center)
  const ang = Math.random() * Math.PI * 2;
  const r = 60 + Math.random() * 60;
  spot = {
    x: pug.cx + Math.cos(ang) * r,
    y: pug.cy + Math.sin(ang) * r,
    r: 30,         // current click radius (shrinks)
    targetR: 26,   // perfect when ringR <= targetR + 6
    life: beatDur,
    t: 0,
  };
}

canvas.addEventListener('mousedown', (e) => tryPet(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; tryPet(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });

function tryPet(x, y) {
  if (!running) return;
  const d = Math.hypot(x - spot.x, y - spot.y);
  if (d > 60) return; // outside zone
  // Judge by current spot.r vs targetR
  const diff = spot.r - spot.targetR;
  if (diff <= 8) {
    score += 100 + streak * 5;
    streak++;
    melt = Math.max(0, melt - 0.06);
    sfx.tone(880, 'triangle', 0.08, 0.22);
  } else if (diff <= 24) {
    score += 30;
    streak = Math.max(0, streak - 0);
    melt = Math.max(0, melt - 0.02);
    sfx.tone(523, 'square', 0.08, 0.18);
  } else {
    streak = 0;
    melt = Math.min(1, melt + 0.06);
    sfx.tone(165, 'sawtooth', 0.12, 0.2);
  }
  if (streak > 0 && streak % 10 === 0) {
    melt = Math.max(0, melt - 0.3);
    sfx.arp([523, 659, 784, 1047], 'triangle', 0.08, 0.22, 0.2);
  }
  newSpot();
}

function tick(dt) {
  if (!running) return;
  beatT += dt;
  // Beat speeds up over time
  if (score > 2000) beatDur = 0.7;
  if (score > 5000) beatDur = 0.5;
  spot.t += dt;
  spot.r = 50 - (50 - spot.targetR) * (spot.t / spot.life);
  if (spot.t >= spot.life) {
    // missed the beat
    streak = 0;
    melt = Math.min(1, melt + 0.1);
    sfx.tone(110, 'sawtooth', 0.18, 0.18);
    newSpot();
  }
  // Constant melt over time
  melt = Math.min(1, melt + dt * 0.02);
  pug.melt = melt;
  if (melt >= 1) end();
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-streak').textContent = streak;
  const best = loadBest('melt-pug');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

function render() {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1a0f2e'); grd.addColorStop(1, '#0a0716');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  // Floor puddle of melt
  ctx.fillStyle = `rgba(247,162,90,${melt * 0.7})`;
  ctx.beginPath();
  ctx.ellipse(W / 2, H / 2 + 100 * melt, 200 + 100 * melt, 30 + 60 * melt, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pug (squashed by melt)
  drawMeltPug(W / 2, H / 2 + 30 * melt, 1 - melt * 0.4, 1 + melt * 0.6);
  // Target spot (move toward melt center as pug melts)
  spot.x = spot.x + ((W / 2 + (spot.x - W / 2) * (1 + melt * 0.6)) - spot.x) * 0.05;
  // Outer ring
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  // Inner perfect zone
  ctx.strokeStyle = 'rgba(255,210,63,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(spot.x, spot.y, spot.targetR + 4, 0, Math.PI * 2); ctx.stroke();
  // Tap hint
  ctx.fillStyle = '#fff';
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.textAlign = 'center';
  ctx.fillText('✋ PET', spot.x, spot.y + 4);
  // Melt bar
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W / 2 - 80, 30, 160, 10);
  ctx.fillStyle = melt > 0.7 ? '#ff3a3a' : (melt > 0.4 ? '#ffd23f' : '#5ef38c');
  ctx.fillRect(W / 2 - 80, 30, 160 * (1 - melt), 10);
  ctx.fillStyle = '#fff';
  ctx.font = "10px 'Press Start 2P', monospace";
  ctx.fillText('PUG INTEGRITY', W / 2, 24);
}

function drawMeltPug(x, y, sx, sy) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(-44, -46, 18, 18); ctx.fillRect(26, -46, 18, 18);
  ctx.fillStyle = '#e0a566';
  ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8854a';
  ctx.fillRect(-50, 0, 100, 50);
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(0, 10, 40, 28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-18, -5, 8, 8); ctx.fillRect(10, -5, 8, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(-15, -2, 4, 4); ctx.fillRect(13, -2, 4, 4);
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.arc(0, 22, 10, 0, Math.PI * 2); ctx.fill();
  // Smiley tongue if low melt, sad if high
  if (sy < 1.4) {
    ctx.strokeStyle = '#5ef38c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 28, 12, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.restore();
}

function end() {
  running = false;
  sfx.sweep(330, 80, 'sawtooth', 0.8, 0.25);
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-streak').textContent = streak;
  const { isNewBest, current } = submitRun('melt-pug', { score, streak });
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
  lastT = now; tick(dt); render();
  requestAnimationFrame(loop);
})(performance.now());
