// PUG TRAFFIC — pugs run up, you tap the matching door to route them.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'traffic:muted' });
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

const DOOR_COUNT = 5;
const COLORS = ['#ff8e3c', '#ffd23f', '#5ef38c', '#4cc9f0', '#b055ff'];
let doors = []; // {x,y,w,h,color,litT}
let pugs = []; // {x,y,vx,vy,target,want, routed}
let score, routed, lives, spawnT, running, doorFlash;

function recalcDoors() {
  doors = [];
  const dw = Math.min(120, (W - 60) / DOOR_COUNT);
  const gap = (W - dw * DOOR_COUNT) / (DOOR_COUNT + 1);
  for (let i = 0; i < DOOR_COUNT; i++) {
    doors.push({
      x: gap + i * (dw + gap),
      y: 100,
      w: dw,
      h: 120,
      color: COLORS[i],
      litT: 0,
    });
  }
}

function reset() {
  recalcDoors();
  pugs = []; score = 0; routed = 0; lives = 3; spawnT = 1.0;
}

function spawnPug() {
  const target = Math.floor(Math.random() * DOOR_COUNT);
  const x = 60 + Math.random() * (W - 120);
  pugs.push({
    x, y: H - 40, vx: 0, vy: -80 - Math.random() * 30,
    target, want: target, t: 0, state: 'running',
  });
}

window.addEventListener('resize', recalcDoors);

canvas.addEventListener('mousedown', (e) => tapAt(e.clientX, e.clientY));
canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; tapAt(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
function tapAt(x, y) {
  if (!running) return;
  for (let i = 0; i < doors.length; i++) {
    const d = doors[i];
    if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) {
      d.litT = 0.5;
      // Find nearest running pug and assign its want = this door
      let nearest = null, bestDy = Infinity;
      for (const p of pugs) {
        if (p.state !== 'running') continue;
        if (p.y < bestDy && p.y > 230) { bestDy = p.y; nearest = p; }
      }
      if (nearest) {
        nearest.want = i;
        sfx.tone(440 + i * 80, 'square', 0.06, 0.18);
      } else {
        sfx.tone(165, 'sawtooth', 0.06, 0.14);
      }
      return;
    }
  }
}

function tick(dt) {
  if (!running) return;
  spawnT -= dt;
  // Spawn cadence speeds up
  const minSpawn = Math.max(0.5, 1.4 - routed * 0.02);
  if (spawnT <= 0) { spawnPug(); spawnT = minSpawn + Math.random() * 0.6; }

  for (const d of doors) d.litT = Math.max(0, d.litT - dt);

  for (let i = pugs.length - 1; i >= 0; i--) {
    const p = pugs[i];
    p.t += dt;
    if (p.state === 'running') {
      p.y += p.vy * dt;
      // Steer toward door of "want"
      const d = doors[p.want];
      const targetX = d.x + d.w / 2;
      const dx = targetX - p.x;
      p.vx += dx * 1.5 * dt;
      p.vx *= Math.pow(0.5, dt * 2);
      p.x += p.vx * dt;
      // Reached door?
      if (p.y < d.y + d.h - 10) {
        const correct = p.want === p.target;
        if (correct) {
          score += 100 + routed * 5;
          routed++;
          sfx.tone(880, 'triangle', 0.1, 0.22);
        } else {
          score = Math.max(0, score - 30);
          lives--;
          sfx.sweep(220, 110, 'sawtooth', 0.2, 0.2);
          if (lives <= 0) return end();
        }
        p.state = 'done';
        p.fadeT = 0.3;
      }
    } else {
      p.fadeT -= dt;
      if (p.fadeT <= 0) pugs.splice(i, 1);
    }
  }
  // HUD
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-lives').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
  const best = loadBest('pug-traffic');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

function render() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a0f2e'); g.addColorStop(1, '#0a0716');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // floor
  ctx.fillStyle = '#3a2a5a';
  ctx.fillRect(0, H - 60, W, 60);
  // doors
  for (let i = 0; i < doors.length; i++) {
    const d = doors[i];
    ctx.fillStyle = '#2a1a40';
    ctx.fillRect(d.x - 4, d.y - 4, d.w + 8, d.h + 8);
    ctx.fillStyle = d.color;
    ctx.globalAlpha = 0.35 + d.litT * 1.3;
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.globalAlpha = 1;
    // number
    ctx.fillStyle = '#fff';
    ctx.font = "bold 28px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), d.x + d.w / 2, d.y + d.h / 2 + 8);
    // knob
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(d.x + d.w - 14, d.y + d.h / 2 - 3, 6, 6);
  }
  // pugs
  for (const p of pugs) {
    let alpha = 1;
    if (p.state === 'done') alpha = p.fadeT / 0.3;
    ctx.globalAlpha = alpha;
    drawTrafficPug(p);
    // mood bubble (which door they want, color-coded)
    const d = doors[p.target];
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(p.x - 14, p.y - 56, 28, 22);
    ctx.strokeStyle = d.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 14, p.y - 56, 28, 22);
    ctx.fillStyle = d.color;
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(String(p.target + 1), p.x, p.y - 40);
    ctx.globalAlpha = 1;
  }
}

function drawTrafficPug(p) {
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(p.x - 14, p.y - 26, 6, 6);
  ctx.fillRect(p.x + 8, p.y - 26, 6, 6);
  ctx.fillStyle = '#e0a566';
  ctx.beginPath(); ctx.arc(p.x, p.y - 20, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8854a';
  ctx.fillRect(p.x - 14, p.y - 20, 28, 16);
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(p.x, p.y - 14, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(p.x - 6, p.y - 19, 3, 3); ctx.fillRect(p.x + 3, p.y - 19, 3, 3);
}

function end() {
  running = false;
  sfx.sweep(330, 80, 'sawtooth', 0.5, 0.25);
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-routed').textContent = routed;
  const { isNewBest, current } = submitRun('pug-traffic', { score, routed });
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
