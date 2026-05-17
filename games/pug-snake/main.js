// PUG SNAKE — classic snake with pug-themed visuals + neon polish.
// Single self-contained canvas game.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';

const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');

const startOverlay = document.getElementById('overlay');
const endOverlay = document.getElementById('end-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('end-restart');
const hudEl = document.getElementById('hud');
const muteBtn = document.getElementById('mute-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseResume = document.getElementById('pause-resume');
const pauseQuit = document.getElementById('pause-quit');

const COLORS = {
  bg1: '#0a0716', bg2: '#160b2e', grid: '#1d1535',
  body: '#c8854a', bodyDark: '#8a5a2c', head: '#e0a566',
  tongue: '#ff5a82', mask: '#1a0d05',
  treat: '#ffd23f', treatGlow: '#fff0a0',
  bone: '#eae0c0', wall: '#ff3a3a',
  trail: '#5ef38c',
};

const CELL = 28;
let cols = 0, rows = 0;
let snake = [];      // [{x, y}], head = last
let dir = { x: 1, y: 0 };
let pendingDir = null;
let treats = [];     // [{x, y, kind}]
let score = 0;
let bestNow = 0;
let dashCharges = 1;
let dashCooldown = 0;
let stepMs = 110;    // ms per step
let stepT = 0;
let running = false;
let paused = false;
let dead = false;
let muted = localStorage.getItem('snake:muted') === '1';

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cols = Math.floor(w / CELL);
  rows = Math.floor(h / CELL);
}
window.addEventListener('resize', resize);
resize();

// ===== Audio (tiny WebAudio synth) =====
let actx = null;
function audio() {
  if (actx) return actx;
  try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  return actx;
}
function sfx(freq, type = 'square', dur = 0.08, peak = 0.18) {
  if (muted) return;
  const c = audio(); if (!c) return;
  const o = c.createOscillator();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start(); o.stop(c.currentTime + dur + 0.02);
}
function sfxEat() { sfx(880, 'triangle', 0.09, 0.22); setTimeout(() => sfx(1320, 'triangle', 0.08, 0.18), 50); }
function sfxDie() { sfx(220, 'sawtooth', 0.6, 0.3); }
function sfxDash() { sfx(440, 'square', 0.06, 0.15); }
const applyMuteUI = () => {
  if (!muteBtn) return;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  muteBtn.classList.toggle('muted', muted);
};
applyMuteUI();
muteBtn?.addEventListener('click', () => {
  muted = !muted;
  localStorage.setItem('snake:muted', muted ? '1' : '0');
  applyMuteUI();
});

// ===== Game logic =====
function reset() {
  // Snake starts in middle, 4 segments going right
  const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
  snake = [
    { x: cx - 3, y: cy }, { x: cx - 2, y: cy }, { x: cx - 1, y: cy }, { x: cx, y: cy },
  ];
  dir = { x: 1, y: 0 };
  pendingDir = null;
  treats = [];
  score = 0;
  dashCharges = 1;
  dashCooldown = 0;
  stepMs = 110;
  stepT = 0;
  dead = false;
  spawnTreat();
  spawnTreat();
}

function spawnTreat() {
  for (let tries = 0; tries < 200; tries++) {
    const x = 1 + Math.floor(Math.random() * (cols - 2));
    const y = 1 + Math.floor(Math.random() * (rows - 2));
    if (snake.some((s) => s.x === x && s.y === y)) continue;
    if (treats.some((t) => t.x === x && t.y === y)) continue;
    // 10% chance of GOLDEN BONE (worth 3 + speed boost)
    const kind = Math.random() < 0.1 ? 'bone' : 'treat';
    treats.push({ x, y, kind });
    return;
  }
}

function step() {
  if (pendingDir) {
    // Block 180° reversal
    if (pendingDir.x !== -dir.x || pendingDir.y !== -dir.y) {
      dir = pendingDir;
    }
    pendingDir = null;
  }
  const head = snake[snake.length - 1];
  const nx = head.x + dir.x;
  const ny = head.y + dir.y;

  // Wall collision
  if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return die();
  // Self collision (tail moves so the last segment will move out — check rest)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === nx && snake[i].y === ny) return die();
  }

  snake.push({ x: nx, y: ny });
  // Eat?
  const eatIdx = treats.findIndex((t) => t.x === nx && t.y === ny);
  if (eatIdx >= 0) {
    const eaten = treats.splice(eatIdx, 1)[0];
    const points = eaten.kind === 'bone' ? 30 : 10;
    score += points;
    if (eaten.kind === 'bone') {
      // Bone: grow by 3 instead of 1 (we already grew by 1; +2 more keep-tails)
      // We do this by not popping the tail for 2 extra ticks.
      growExtra = (growExtra || 0) + 2;
      stepMs = Math.max(48, stepMs - 6); // speed up
      sfx(660, 'square', 0.12, 0.24); setTimeout(() => sfx(990, 'square', 0.1, 0.2), 80);
    } else {
      sfxEat();
    }
    spawnTreat();
    if (Math.random() < 0.4) spawnTreat();
  } else {
    if (growExtra && growExtra > 0) { growExtra--; }
    else snake.shift();
  }
  updateHud();
}
let growExtra = 0;

function die() {
  dead = true;
  running = false;
  sfxDie();
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-length').textContent = snake.length;
  // Submit best
  const { isNewBest, current } = submitRun('pug-snake', { score, length: snake.length });
  const bestRow = document.getElementById('end-best');
  if (bestRow) {
    const b = current || { score, length: snake.length };
    bestRow.innerHTML = `Best: <b>${b.score}</b> pts, length <b>${b.length}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  hudEl.hidden = true;
  endOverlay.hidden = false;
  endOverlay.classList.remove('is-hidden');
}

function updateHud() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-length').textContent = snake.length;
  const best = loadBest('pug-snake');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
}

// ===== Render =====
function render() {
  const W = canvas.width / (window.devicePixelRatio || 1);
  const H = canvas.height / (window.devicePixelRatio || 1);
  // BG
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, COLORS.bg2);
  grd.addColorStop(1, COLORS.bg1);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  // Grid
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL + 0.5, 0); ctx.lineTo(x * CELL + 0.5, rows * CELL); ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL + 0.5); ctx.lineTo(cols * CELL, y * CELL + 0.5); ctx.stroke();
  }
  // Border
  ctx.strokeStyle = '#3a2a5a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, cols * CELL - 4, rows * CELL - 4);

  // Treats
  for (const t of treats) {
    const cx = t.x * CELL + CELL / 2;
    const cy = t.y * CELL + CELL / 2;
    if (t.kind === 'bone') {
      // glowing bone
      ctx.shadowColor = COLORS.treatGlow; ctx.shadowBlur = 14;
      ctx.fillStyle = COLORS.bone;
      ctx.fillRect(cx - 9, cy - 3, 18, 6);
      ctx.fillRect(cx - 11, cy - 5, 4, 4);
      ctx.fillRect(cx - 11, cy + 1, 4, 4);
      ctx.fillRect(cx + 7, cy - 5, 4, 4);
      ctx.fillRect(cx + 7, cy + 1, 4, 4);
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowColor = COLORS.treat; ctx.shadowBlur = 10;
      ctx.fillStyle = COLORS.treat;
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
      ctx.fillStyle = COLORS.treatGlow;
      ctx.fillRect(cx - 4, cy - 4, 8, 4);
      ctx.shadowBlur = 0;
    }
  }

  // Snake body
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i];
    const px = seg.x * CELL;
    const py = seg.y * CELL;
    const isHead = i === snake.length - 1;
    const isTail = i === 0;
    if (isHead) {
      // Pug head — bigger, with ears + eyes + tongue
      ctx.fillStyle = COLORS.head;
      ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
      ctx.fillStyle = COLORS.body;
      ctx.fillRect(px + 2, py + CELL - 10, CELL - 4, 8);
      // ears
      ctx.fillStyle = COLORS.bodyDark;
      ctx.fillRect(px + 2, py - 2, 6, 7);
      ctx.fillRect(px + CELL - 8, py - 2, 6, 7);
      // mask
      ctx.fillStyle = COLORS.mask;
      ctx.fillRect(px + 6, py + 10, CELL - 12, 10);
      // eyes — direction-aware
      ctx.fillStyle = '#fff';
      let ex1 = px + 8, ex2 = px + CELL - 11, ey = py + 8;
      ctx.fillRect(ex1, ey, 4, 4);
      ctx.fillRect(ex2, ey, 4, 4);
      ctx.fillStyle = '#000';
      const eyeOff = { x: Math.sign(dir.x) * 1, y: Math.sign(dir.y) * 1 };
      ctx.fillRect(ex1 + 1 + eyeOff.x, ey + 1 + eyeOff.y, 2, 2);
      ctx.fillRect(ex2 + 1 + eyeOff.x, ey + 1 + eyeOff.y, 2, 2);
      // tongue out in direction of travel
      ctx.fillStyle = COLORS.tongue;
      const tcx = px + CELL / 2;
      const tcy = py + CELL / 2;
      const toff = 10;
      ctx.fillRect(tcx + dir.x * toff - 2, tcy + dir.y * toff - 2, 4, 4);
    } else if (isTail) {
      ctx.fillStyle = COLORS.bodyDark;
      ctx.fillRect(px + 6, py + 6, CELL - 12, CELL - 12);
    } else {
      ctx.fillStyle = COLORS.body;
      ctx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
      // little stripe to give scale-like pattern
      ctx.fillStyle = COLORS.bodyDark;
      ctx.fillRect(px + 5, py + 5, CELL - 10, 2);
    }
  }

  // Dash bar (top-right area, below HUD)
  if (running && !dead) {
    const bw = 60, bh = 6;
    const bx = 20 + 180 + 20;
    const by = 24;
    if (dashCharges <= 0) {
      ctx.fillStyle = 'rgba(76,201,240,0.18)';
      ctx.fillRect(bx, by, bw, bh);
      const k = 1 - (dashCooldown / 4);
      ctx.fillStyle = COLORS.trail;
      ctx.fillRect(bx, by, bw * k, bh);
    }
  }
}

// ===== Input =====
function setDir(x, y) {
  pendingDir = { x, y };
}
window.addEventListener('keydown', (e) => {
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') setDir(0, -1);
  else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') setDir(0, 1);
  else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') setDir(-1, 0);
  else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') setDir(1, 0);
  else if (e.key === ' ' || e.code === 'Space') {
    // dash — skip ahead 3 cells instantly (consume charge)
    if (dashCharges > 0 && running && !dead) {
      dashCharges--;
      dashCooldown = 4;
      for (let i = 0; i < 3; i++) step();
      sfxDash();
    }
  } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
    if (running && !dead) togglePause();
  } else if (e.key === 'm' || e.key === 'M') {
    muted = !muted; localStorage.setItem('snake:muted', muted ? '1' : '0'); applyMuteUI();
  }
});

// Touch swipe
let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const dt = Date.now() - touchStart.t;
  // tap = dash, else swipe = turn
  if (Math.hypot(dx, dy) < 24 && dt < 250) {
    if (dashCharges > 0 && running && !dead) {
      dashCharges--; dashCooldown = 4;
      for (let i = 0; i < 3; i++) step();
      sfxDash();
    }
  } else if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? 1 : -1, 0);
  } else {
    setDir(0, dy > 0 ? 1 : -1);
  }
  touchStart = null;
  e.preventDefault();
}, { passive: false });

// Buttons
startBtn.addEventListener('click', start);
restartBtn.addEventListener('click', start);
pauseBtn?.addEventListener('click', togglePause);
pauseResume?.addEventListener('click', () => { togglePause(); });
pauseQuit?.addEventListener('click', () => { window.location.href = '../../index.html'; });

function start() {
  reset();
  running = true;
  paused = false;
  hide(startOverlay);
  hide(endOverlay);
  hudEl.hidden = false;
  updateHud();
  // Resume audio context (autoplay rules)
  audio()?.resume?.();
}
function togglePause() {
  paused = !paused;
  pauseOverlay.hidden = !paused;
}
function hide(el) { el.hidden = true; el.classList.add('is-hidden'); }

// ===== Main loop =====
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(now - lastT, 100);
  lastT = now;
  if (running && !paused && !dead) {
    stepT += dt;
    while (stepT >= stepMs) {
      stepT -= stepMs;
      step();
      if (dead) break;
    }
    if (dashCooldown > 0) {
      dashCooldown -= dt / 1000;
      if (dashCooldown <= 0) { dashCooldown = 0; dashCharges = 1; }
    }
  }
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Show best on start screen
const best = loadBest('pug-snake');
if (best) {
  const sub = startOverlay.querySelector('.overlay__sub');
  if (sub) {
    const div = document.createElement('div');
    div.style.cssText = 'margin:10px 0 0;color:var(--neon-yellow);font-size:0.6rem;letter-spacing:0.05em;';
    div.innerHTML = `★ Personal best: <b>${best.score}</b> pts, length <b>${best.length}</b>`;
    sub.appendChild(div);
  }
}
