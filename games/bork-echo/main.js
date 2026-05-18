// BORK ECHO — dark sonar maze. Bork creates expanding visibility ring.
// Cat hunts you when you bork too often. Find 5 treats.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'echo:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

let W = 0, H = 0, DPR = 1;
const TILE = 40;
let cols = 0, rows = 0;
let grid = []; // 1 = wall, 0 = floor
let pug, cat, treats, pulses, borkCd, borks, alarm;
let startTime, running;

function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

function genMaze() {
  cols = Math.max(10, Math.floor(W / TILE));
  rows = Math.max(10, Math.floor(H / TILE));
  grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  // Carve via recursive backtracker on odd cells
  const stack = [];
  const sx = 1, sy = 1;
  grid[sy][sx] = 0; stack.push([sx, sy]);
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [[2,0],[-2,0],[0,2],[0,-2]].sort(() => Math.random() - 0.5);
    let moved = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[ny][nx] = 0;
        grid[y + dy / 2][x + dx / 2] = 0;
        stack.push([nx, ny]);
        moved = true; break;
      }
    }
    if (!moved) stack.pop();
  }
}

function placeEntities() {
  pug = { x: 1.5 * TILE, y: 1.5 * TILE };
  cat = { x: (cols - 2.5) * TILE, y: (rows - 2.5) * TILE, vx: 0, vy: 0, hunting: false };
  treats = [];
  for (let i = 0; i < 5; i++) {
    // random floor tile far from start
    for (let tries = 0; tries < 100; tries++) {
      const tx = 1 + Math.floor(Math.random() * (cols - 2));
      const ty = 1 + Math.floor(Math.random() * (rows - 2));
      if (grid[ty][tx] === 0 && (tx + ty > 6)) {
        treats.push({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
        break;
      }
    }
  }
  pulses = []; // {x,y,t,maxR}
  borkCd = 0; borks = 0; alarm = 0;
}

function reset() {
  genMaze(); placeEntities();
  startTime = performance.now();
}

const keys = new Set();
window.addEventListener('keydown', (e) => { keys.add(e.key.toLowerCase());
  if (e.key === ' ' || e.code === 'Space') bork();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
canvas.addEventListener('mousedown', bork);
canvas.addEventListener('touchstart', (e) => { bork(); e.preventDefault(); }, { passive: false });

function bork() {
  if (borkCd > 0 || !running) return;
  pulses.push({ x: pug.x, y: pug.y, t: 0, maxR: 280 });
  borkCd = 1.4;
  borks++;
  alarm = Math.min(1, alarm + 0.25);
  sfx.sweep(440, 220, 'square', 0.18, 0.22);
}

function isWallAt(x, y) {
  const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
  if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return true;
  return grid[ty][tx] === 1;
}

function moveWithCollide(e, dx, dy) {
  const r = 12;
  const nx = e.x + dx;
  if (!isWallAt(nx - r, e.y - r) && !isWallAt(nx + r, e.y - r) &&
      !isWallAt(nx - r, e.y + r) && !isWallAt(nx + r, e.y + r)) e.x = nx;
  const ny = e.y + dy;
  if (!isWallAt(e.x - r, ny - r) && !isWallAt(e.x + r, ny - r) &&
      !isWallAt(e.x - r, ny + r) && !isWallAt(e.x + r, ny + r)) e.y = ny;
}

function tick(dt) {
  if (!running) return;
  borkCd = Math.max(0, borkCd - dt);
  alarm = Math.max(0, alarm - dt * 0.15);

  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  if (mx || my) {
    const l = Math.hypot(mx, my);
    moveWithCollide(pug, (mx / l) * 140 * dt, (my / l) * 140 * dt);
  }

  // Collect treats
  for (let i = treats.length - 1; i >= 0; i--) {
    const t = treats[i];
    if (Math.hypot(t.x - pug.x, t.y - pug.y) < 22) {
      treats.splice(i, 1);
      sfx.tone(880, 'triangle', 0.1, 0.22);
      setTimeout(() => sfx.tone(1320, 'triangle', 0.08, 0.18), 50);
    }
  }
  if (treats.length === 0) return win();

  // Pulses
  for (let i = pulses.length - 1; i >= 0; i--) {
    const p = pulses[i];
    p.t += dt;
    if (p.t > 1.5) pulses.splice(i, 1);
  }

  // Cat AI: stalks when alarm > 0.4, else wanders slowly
  cat.hunting = alarm > 0.4;
  const catSpeed = cat.hunting ? 70 : 30;
  if (cat.hunting) {
    const dx = pug.x - cat.x, dy = pug.y - cat.y;
    const d = Math.hypot(dx, dy);
    cat.vx = (dx / d) * catSpeed; cat.vy = (dy / d) * catSpeed;
  } else {
    if (Math.random() < dt * 0.5) {
      const ang = Math.random() * Math.PI * 2;
      cat.vx = Math.cos(ang) * catSpeed; cat.vy = Math.sin(ang) * catSpeed;
    }
  }
  moveWithCollide(cat, cat.vx * dt, cat.vy * dt);
  // Catch
  if (Math.hypot(cat.x - pug.x, cat.y - pug.y) < 20) return lose();

  updateHud();
}

function updateHud() {
  document.getElementById('hud-treats').textContent = `${5 - treats.length}/5`;
  document.getElementById('hud-cd').textContent = borkCd > 0 ? borkCd.toFixed(1) + 's' : 'READY';
  const best = loadBest('bork-echo');
  document.getElementById('hud-best').textContent = best ? `${Math.floor(best.score/60)}:${String(Math.floor(best.score)%60).padStart(2,'0')}` : '—';
}

function render() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // Render only visibility from pulses
  // Draw walls only where any pulse covers them
  // For perf, fill base wall layer behind a mask of pulse circles
  // We approximate: just iterate tiles and check distance to each pulse, render if any in range
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] !== 1) continue;
      const cx = x * TILE + TILE / 2;
      const cy = y * TILE + TILE / 2;
      let maxVis = 0;
      for (const p of pulses) {
        const d = Math.hypot(p.x - cx, p.y - cy);
        const radius = p.t * 320;
        if (d < radius + 50 && d > radius - 50) {
          // close to wavefront — lit
          const vis = 1 - Math.abs(d - radius) / 50;
          if (vis > maxVis) maxVis = vis;
        } else if (d < radius) {
          // already passed — faint trail
          maxVis = Math.max(maxVis, 0.15 * (1 - p.t / 1.5));
        }
      }
      if (maxVis > 0) {
        ctx.fillStyle = `rgba(76,201,240,${0.4 + maxVis * 0.5})`;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        ctx.fillStyle = `rgba(176,85,255,${maxVis * 0.4})`;
        ctx.fillRect(x * TILE, y * TILE, TILE, 4);
      }
    }
  }
  // Treats — always slightly visible
  for (const t of treats) {
    const fade = 0.25 + (Math.sin(performance.now() / 300) + 1) / 6;
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 14;
    ctx.fillStyle = `rgba(255,210,63,${fade})`;
    ctx.fillRect(t.x - 6, t.y - 6, 12, 12);
    ctx.shadowBlur = 0;
  }
  // Pulse arcs (visible as faint rings)
  for (const p of pulses) {
    const r = p.t * 320;
    ctx.strokeStyle = `rgba(76,201,240,${0.4 * (1 - p.t / 1.5)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
  }
  // Pug (small glow)
  ctx.shadowColor = '#c8854a'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#c8854a';
  ctx.beginPath(); ctx.arc(pug.x, pug.y, 10, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a0d05';
  ctx.fillRect(pug.x - 3, pug.y - 2, 2, 2); ctx.fillRect(pug.x + 1, pug.y - 2, 2, 2);
  // Cat — only visible if recently hit by pulse
  let catVis = 0;
  for (const p of pulses) {
    const d = Math.hypot(p.x - cat.x, p.y - cat.y);
    const r = p.t * 320;
    if (d < r) catVis = Math.max(catVis, 1 - (r - d) / 200);
  }
  if (catVis > 0 || cat.hunting) {
    ctx.shadowColor = '#ff3a3a'; ctx.shadowBlur = 16;
    ctx.fillStyle = `rgba(255,58,58,${Math.max(catVis, cat.hunting ? 0.7 : 0)})`;
    ctx.beginPath(); ctx.arc(cat.x, cat.y, 12, 0, Math.PI * 2); ctx.fill();
    // ears
    ctx.fillRect(cat.x - 10, cat.y - 18, 4, 6);
    ctx.fillRect(cat.x + 6, cat.y - 18, 4, 6);
    ctx.shadowBlur = 0;
  }
  // Alarm bar
  if (alarm > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 70, 60, 140, 8);
    ctx.fillStyle = alarm > 0.4 ? '#ff3a3a' : '#ffd23f';
    ctx.fillRect(W / 2 - 70, 60, 140 * alarm, 8);
    ctx.fillStyle = '#fff';
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('CAT ALARM', W / 2, 56);
  }
}

function win() {
  running = false;
  const elapsed = (performance.now() - startTime) / 1000;
  sfx.arp([523, 659, 784, 1047], 'triangle', 0.1, 0.22, 0.3);
  document.getElementById('end-title').textContent = 'CLEARED';
  document.getElementById('end-sub').textContent = 'All 5 treats. Such bork.';
  document.getElementById('end-time').textContent = `${Math.floor(elapsed/60)}:${String(Math.floor(elapsed)%60).padStart(2,'0')}`;
  const { isNewBest, current } = submitRun('bork-echo', { score: -elapsed, raw: elapsed }, (a, b) => a.raw - b.raw);
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const t = current?.raw || elapsed;
    bestEl.innerHTML = `Best: <b>${Math.floor(t/60)}:${String(Math.floor(t)%60).padStart(2,'0')}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  showEnd();
}
function lose() {
  running = false;
  sfx.sweep(220, 80, 'sawtooth', 0.5, 0.25);
  document.getElementById('end-title').textContent = 'CAUGHT';
  document.getElementById('end-sub').textContent = 'The cat got you.';
  document.getElementById('end-time').textContent = 'NEVER';
  showEnd();
}
function showEnd() {
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
  // Initial bork
  setTimeout(bork, 200);
}

let lastT = performance.now();
(function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  tick(dt); render();
  requestAnimationFrame(loop);
})(performance.now());
