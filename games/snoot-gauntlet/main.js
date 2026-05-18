// SNOOT GAUNTLET — endless dodge + collect.
// Pug rolls down screen; snoots scroll up. Touch pug snoots (+points),
// avoid cat/snail/skunk snoots. Speed accelerates.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'gauntlet:muted' });
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

const TYPES = [
  { id: 'pug',   bg: '#c8854a', dot: '#1a0d05', good: true, points: 50 },
  { id: 'pug2',  bg: '#eac888', dot: '#6b3a1c', good: true, points: 50 },
  { id: 'pug3',  bg: '#fafaff', dot: '#a8a8c8', good: true, points: 80 },
  { id: 'cat',   bg: '#222228', dot: '#ff3a3a', good: false, points: -200 },
  { id: 'snail', bg: '#5ef38c', dot: '#1a5a30', good: false, points: -100 },
  { id: 'skunk', bg: '#000', dot: '#fff', good: false, points: -150 },
];

let pug, snoots, score, speedMul, missedGood, running, t;
function reset() {
  pug = { x: W / 2, y: H - 120, r: 36, rot: 0 };
  snoots = [];
  score = 0; speedMul = 1; missedGood = 0; t = 0;
}
function spawnRow() {
  // 3-4 snoots per row at random lanes
  const lanes = 5;
  const laneW = W / lanes;
  const count = 2 + Math.floor(Math.random() * 3);
  const used = new Set();
  for (let i = 0; i < count; i++) {
    let l = Math.floor(Math.random() * lanes);
    while (used.has(l)) l = (l + 1) % lanes;
    used.add(l);
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    snoots.push({
      x: l * laneW + laneW / 2,
      y: -40,
      r: 28,
      type,
      hit: false,
    });
  }
}

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
let dragX = null;
canvas.addEventListener('mousedown', (e) => dragX = e.clientX);
canvas.addEventListener('mousemove', (e) => { if (dragX != null) dragX = e.clientX; });
window.addEventListener('mouseup', () => dragX = null);
canvas.addEventListener('touchstart', (e) => { dragX = e.touches[0].clientX; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { dragX = e.touches[0].clientX; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', (e) => { dragX = null; e.preventDefault(); }, { passive: false });

function tick(dt) {
  if (!running) return;
  t += dt;
  speedMul = Math.min(3.0, 1 + t / 30);
  if (Math.random() < dt * (1.5 + speedMul * 0.6)) spawnRow();
  // Steer
  if (dragX != null) {
    pug.x += (dragX - pug.x) * 10 * dt;
  }
  if (keys.has('arrowleft') || keys.has('a')) pug.x -= 380 * dt;
  if (keys.has('arrowright') || keys.has('d')) pug.x += 380 * dt;
  pug.x = Math.max(40, Math.min(W - 40, pug.x));
  pug.rot += dt * 4 * speedMul;

  // Move snoots up
  const speed = 240 * speedMul;
  for (let i = snoots.length - 1; i >= 0; i--) {
    const s = snoots[i];
    s.y += speed * dt;
    if (s.y > H + 50) {
      if (s.type.good && !s.hit) {
        missedGood++;
        score = Math.max(0, score - 20);
        if (missedGood >= 5) return end('missed');
      }
      snoots.splice(i, 1);
      continue;
    }
    // Collision
    if (!s.hit) {
      const d = Math.hypot(s.x - pug.x, s.y - pug.y);
      if (d < s.r + pug.r - 8) {
        s.hit = true;
        if (s.type.good) {
          score += s.type.points;
          sfx.tone(880, 'triangle', 0.06, 0.2);
        } else {
          score = Math.max(0, score + s.type.points);
          sfx.sweep(220, 110, 'sawtooth', 0.18, 0.22);
          return end(s.type.id);
        }
      }
    }
  }
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-speed').textContent = speedMul.toFixed(1) + '×';
  const best = loadBest('snoot-gauntlet');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

function render() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a0f2e'); g.addColorStop(1, '#0a0716');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // lane lines moving
  ctx.strokeStyle = 'rgba(76,201,240,0.15)';
  ctx.lineWidth = 1;
  const laneW = W / 5;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * laneW, 0); ctx.lineTo(i * laneW, H); ctx.stroke();
  }
  // dashes
  const offY = (t * 240 * speedMul) % 30;
  ctx.fillStyle = 'rgba(76,201,240,0.25)';
  for (let y = -30; y < H; y += 30) {
    ctx.fillRect(W / 2 - 2, y + offY, 4, 14);
  }
  // snoots (orbs)
  for (const s of snoots) {
    if (s.hit) {
      ctx.globalAlpha = 0.4;
    }
    ctx.fillStyle = s.type.bg;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = s.type.dot;
    ctx.beginPath(); ctx.arc(s.x, s.y, 8, 0, Math.PI * 2); ctx.fill();
    // tag
    ctx.fillStyle = '#fff';
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    const label = s.type.id.toUpperCase();
    ctx.fillText(label, s.x, s.y + s.r + 12);
    ctx.globalAlpha = 1;
  }
  // pug (rolling)
  ctx.save();
  ctx.translate(pug.x, pug.y);
  ctx.rotate(pug.rot);
  ctx.fillStyle = '#c8854a';
  ctx.beginPath(); ctx.arc(0, 0, pug.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(0, 0, pug.r * 0.7, pug.r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-pug.r * 0.4, -5, 5, 5);
  ctx.fillRect(pug.r * 0.15, -5, 5, 5);
  ctx.fillStyle = '#ff5a82';
  ctx.beginPath(); ctx.arc(0, 8, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function end(reason) {
  running = false;
  document.getElementById('end-title').textContent = reason === 'missed' ? 'TOO MANY MISSED' : 'BAD SNOOT';
  document.getElementById('end-sub').textContent =
    reason === 'cat' ? 'Cat snoot. Pug betrayed.' :
    reason === 'snail' ? 'Snail snoot. Pug slow now.' :
    reason === 'skunk' ? 'Skunk snoot. Pug stinky now.' :
    'Missed too many good snoots.';
  document.getElementById('end-score').textContent = score;
  const { isNewBest, current } = submitRun('snoot-gauntlet', { score });
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
