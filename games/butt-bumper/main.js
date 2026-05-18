// BUTT BUMPER — shrinking arena, push other pugs off with your butt.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'butt:muted' });
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

const ARENA_BASE = () => Math.min(W, H) * 0.42;
let arenaR = 0;
const CTRX = () => W / 2, CTRY = () => H / 2;

let player, bots, ko, running, slamCd, stam, time;
function reset() {
  arenaR = ARENA_BASE();
  player = mkPug(CTRX(), CTRY() - 80, true, '#c8854a', '#1a0d05');
  bots = [];
  const colors = [['#eac888','#6b3a1c'],['#5a5a72','#222228'],['#fafaff','#a8a8c8'],
                  ['#ff5a3a','#6a2a14'],['#b055ff','#5a1a8a'],['#ffd23f','#8a6810'],
                  ['#5ef38c','#1a5a30']];
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    const c = colors[i];
    bots.push(mkPug(CTRX() + Math.cos(ang) * 180, CTRY() + Math.sin(ang) * 180, false, c[0], c[1]));
  }
  ko = 0; slamCd = 0; stam = 100; time = 0;
}
function mkPug(x, y, isPlayer, color, mask) {
  return { x, y, vx: 0, vy: 0, r: 30, alive: true, isPlayer, color, mask, slamT: 0 };
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === ' ' && stam >= 30 && slamCd <= 0 && player?.alive) doSlam();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
let touchAim = null;
canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; touchAim = { x: t.clientX, y: t.clientY }; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; touchAim = { x: t.clientX, y: t.clientY }; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', (e) => { touchAim = null; e.preventDefault(); }, { passive: false });

function doSlam() {
  let dx = 0, dy = 0;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (!dx && !dy) { dx = player.vx; dy = player.vy; }
  if (!dx && !dy) { dx = 1; dy = 0; }
  const l = Math.hypot(dx, dy);
  player.vx += (dx / l) * 1200; player.vy += (dy / l) * 1200;
  player.slamT = 0.25; slamCd = 0.4; stam -= 30;
  sfx.sweep(220, 110, 'sawtooth', 0.18, 0.25);
}

function botAI(b, dt) {
  // Find nearest other pug, aim toward edge of them
  let target = null, bestD = Infinity;
  const all = [player, ...bots];
  for (const o of all) {
    if (o === b || !o.alive) continue;
    const d = Math.hypot(o.x - b.x, o.y - b.y);
    if (d < bestD) { bestD = d; target = o; }
  }
  if (target) {
    const dx = target.x - b.x, dy = target.y - b.y;
    const d = Math.hypot(dx, dy);
    b.vx += (dx / d) * 700 * dt;
    b.vy += (dy / d) * 700 * dt;
    // Slam if close
    if (d < 70 && b.slamT <= 0 && Math.random() < dt * 1.5) {
      b.vx += (dx / d) * 800; b.vy += (dy / d) * 800;
      b.slamT = 0.25;
    }
  }
}

function tick(dt) {
  if (!running) return;
  time += dt;
  arenaR = Math.max(80, ARENA_BASE() - time * 8);
  slamCd = Math.max(0, slamCd - dt);
  stam = Math.min(100, stam + dt * 15);

  // Player input
  if (player.alive) {
    let mx = 0, my = 0;
    if (keys.has('w') || keys.has('arrowup'))    my -= 1;
    if (keys.has('s') || keys.has('arrowdown'))  my += 1;
    if (keys.has('a') || keys.has('arrowleft'))  mx -= 1;
    if (keys.has('d') || keys.has('arrowright')) mx += 1;
    if (touchAim) {
      mx = touchAim.x - player.x; my = touchAim.y - player.y;
      const l = Math.hypot(mx, my);
      if (l > 30) { mx /= l; my /= l; } else { mx = 0; my = 0; }
    }
    if (mx || my) {
      const l = Math.hypot(mx, my);
      player.vx += (mx / l) * 1200 * dt; player.vy += (my / l) * 1200 * dt;
    }
  }

  // Bots
  for (const b of bots) {
    if (!b.alive) continue;
    botAI(b, dt);
  }
  // Phys
  for (const p of [player, ...bots]) {
    if (!p.alive) continue;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= Math.pow(0.5, dt * 3); p.vy *= Math.pow(0.5, dt * 3);
    if (p.slamT > 0) p.slamT -= dt;
  }
  // Collisions
  const all = [player, ...bots].filter((p) => p.alive);
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      const minD = a.r + b.r;
      if (d < minD && d > 0) {
        const nx = dx / d, ny = dy / d;
        const overlap = minD - d;
        a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
        b.x += nx * overlap / 2; b.y += ny * overlap / 2;
        const slamBoost = (a.slamT > 0 ? 280 : 0) + (b.slamT > 0 ? 280 : 0);
        const total = 160 + slamBoost;
        a.vx -= nx * total; a.vy -= ny * total;
        b.vx += nx * total; b.vy += ny * total;
        if (slamBoost) sfx.tone(180, 'square', 0.05, 0.22);
      }
    }
  }
  // Ring-out
  for (const p of [player, ...bots]) {
    if (!p.alive) continue;
    if (Math.hypot(p.x - CTRX(), p.y - CTRY()) > arenaR + p.r) {
      p.alive = false;
      if (!p.isPlayer) { ko++; sfx.tone(660, 'triangle', 0.12, 0.22); }
      else { sfx.sweep(330, 110, 'sawtooth', 0.4, 0.2); }
    }
  }
  // End check
  const aliveBots = bots.filter((b) => b.alive).length;
  if (!player.alive) return end(false);
  if (aliveBots === 0) return end(true);
  // HUD
  document.getElementById('hud-left').textContent = aliveBots + 1;
  document.getElementById('hud-stam').textContent = Math.floor(stam);
  const best = loadBest('butt-bumper');
  document.getElementById('hud-best').textContent = best ? best.ko : 0;
}

function render() {
  ctx.fillStyle = '#0a0716'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#3a2a5a';
  ctx.beginPath(); ctx.arc(CTRX(), CTRY(), arenaR + 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9a86a';
  ctx.beginPath(); ctx.arc(CTRX(), CTRY(), arenaR, 0, Math.PI * 2); ctx.fill();
  // grid
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  for (let r = 30; r < arenaR; r += 30) {
    ctx.beginPath(); ctx.arc(CTRX(), CTRY(), r, 0, Math.PI * 2); ctx.stroke();
  }
  for (const p of [...bots, player]) {
    if (!p.alive) continue;
    drawPug(p);
  }
}
function drawPug(p) {
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  // butt-emphasis ring at back
  const ang = Math.atan2(p.vy, p.vx) || 0;
  ctx.fillStyle = `rgba(0,0,0,0.4)`;
  ctx.beginPath();
  ctx.arc(p.x - Math.cos(ang) * (p.r * 0.5), p.y - Math.sin(ang) * (p.r * 0.5), p.r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // mask
  ctx.fillStyle = p.mask;
  ctx.beginPath(); ctx.ellipse(p.x + Math.cos(ang) * 6, p.y + Math.sin(ang) * 6, p.r * 0.6, p.r * 0.4, ang, 0, Math.PI * 2); ctx.fill();
  // eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(p.x - 8 + Math.cos(ang) * 4, p.y - 4 + Math.sin(ang) * 4, 4, 4);
  ctx.fillRect(p.x + 4 + Math.cos(ang) * 4, p.y - 4 + Math.sin(ang) * 4, 4, 4);
  // player crown
  if (p.isPlayer) {
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(p.x - 12, p.y - p.r - 10, 4, 6);
    ctx.fillRect(p.x - 2, p.y - p.r - 14, 4, 10);
    ctx.fillRect(p.x + 8, p.y - p.r - 10, 4, 6);
  }
  // slam streak
  if (p.slamT > 0) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x - Math.cos(ang) * 20, p.y - Math.sin(ang) * 20);
    ctx.lineTo(p.x - Math.cos(ang) * 50, p.y - Math.sin(ang) * 50);
    ctx.stroke();
  }
}

function end(won) {
  running = false;
  document.getElementById('end-title').textContent = won ? 'LAST PUG STANDING' : 'YOU GOT BUMPED';
  document.getElementById('end-sub').textContent = won ? 'Such butt. Many bonk.' : 'Off the edge. Try again.';
  document.getElementById('end-ko').textContent = ko;
  const { isNewBest, current } = submitRun('butt-bumper', { score: ko, ko, won });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { ko };
    bestEl.innerHTML = `Best: <b>${b.ko} KOs</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
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
