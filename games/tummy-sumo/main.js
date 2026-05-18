// TUMMY SUMO — 2-player local arena. Charge tummy, slam, knock opponent off.
import { createSfx } from '../../src/shared/miniSfx.js';
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'sumo:muted' });
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

const PUG_R = 38;
const ARENA_R = () => Math.min(W, H) * 0.4;
const CTRX = () => W / 2, CTRY = () => H / 2;

function pug(x, y, color, mask) {
  return { x, y, vx: 0, vy: 0, r: PUG_R, color, mask, charge: 0, charging: false, slamT: 0, slamAng: 0 };
}
let p1, p2, round, p1Wins, p2Wins, running, vsBot;
const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === ' ' && p1 && !p1.charging && !p1.slamT) { p1.charging = true; p1.charge = 0; }
  if (e.key === 'Enter' && p2 && !vsBot && !p2.charging && !p2.slamT) { p2.charging = true; p2.charge = 0; }
});
window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
  if (e.key === ' ' && p1?.charging) releaseSlam(p1, otherPos(p1, p2));
  if (e.key === 'Enter' && p2?.charging && !vsBot) releaseSlam(p2, otherPos(p2, p1));
});

function otherPos(a, b) { return Math.atan2(b.y - a.y, b.x - a.x); }
function releaseSlam(p, ang) {
  if (!p.charging) return;
  p.charging = false;
  p.slamT = 0.28;
  p.slamAng = ang;
  const power = 350 + p.charge * 700;
  p.vx += Math.cos(ang) * power;
  p.vy += Math.sin(ang) * power;
  sfx.sweep(220, 110, 'sawtooth', 0.15, 0.25);
}

function reset() {
  p1 = pug(CTRX() - 100, CTRY(), '#c8854a', '#1a0d05');
  p2 = pug(CTRX() + 100, CTRY(), '#eac888', '#6b3a1c');
  round = 1; p1Wins = 0; p2Wins = 0;
  updateHud();
}
function updateHud() {
  document.getElementById('hud-p1').textContent = p1Wins;
  document.getElementById('hud-p2').textContent = p2Wins;
  document.getElementById('hud-round').textContent = `${round}/5`;
}

function tickPug(p, controls, dt) {
  // Charging: slow movement, build charge
  if (p.charging) {
    p.charge = Math.min(1, p.charge + dt);
    return;
  }
  if (p.slamT > 0) {
    p.slamT -= dt;
    return;
  }
  // Normal movement
  let mx = 0, my = 0;
  if (keys.has(controls.up))    my -= 1;
  if (keys.has(controls.down))  my += 1;
  if (keys.has(controls.left))  mx -= 1;
  if (keys.has(controls.right)) mx += 1;
  if (mx || my) {
    const l = Math.hypot(mx, my);
    p.vx += (mx / l) * 1400 * dt;
    p.vy += (my / l) * 1400 * dt;
  }
}

function botTurn(dt) {
  // Simple AI: move toward p1, charge when close, release if close enough
  const dx = p1.x - p2.x, dy = p1.y - p2.y;
  const d = Math.hypot(dx, dy);
  if (p2.charging) {
    p2.charge = Math.min(1, p2.charge + dt);
    if (d < 130 && p2.charge > 0.4 + Math.random() * 0.3) releaseSlam(p2, otherPos(p2, p1));
    return;
  }
  if (p2.slamT > 0) { p2.slamT -= dt; return; }
  if (d > 160) {
    p2.vx += (dx / d) * 900 * dt;
    p2.vy += (dy / d) * 900 * dt;
  } else if (Math.random() < dt * 1.2) {
    p2.charging = true; p2.charge = 0;
  } else {
    // strafe a bit
    p2.vx += Math.sin(performance.now() / 400) * 800 * dt;
  }
}

function tickPhys(p, dt) {
  p.x += p.vx * dt; p.y += p.vy * dt;
  // friction
  p.vx *= Math.pow(0.5, dt * 3);
  p.vy *= Math.pow(0.5, dt * 3);
}

function collide() {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const d = Math.hypot(dx, dy);
  const minD = p1.r + p2.r;
  if (d < minD && d > 0) {
    const nx = dx / d, ny = dy / d;
    // Slam multiplier
    const slamBoost = (p1.slamT > 0 ? 350 : 0) + (p2.slamT > 0 ? 350 : 0);
    const overlap = minD - d;
    p1.x -= nx * overlap / 2; p1.y -= ny * overlap / 2;
    p2.x += nx * overlap / 2; p2.y += ny * overlap / 2;
    // bounce + slam transfer
    const total = (200 + slamBoost);
    p1.vx -= nx * total; p1.vy -= ny * total;
    p2.vx += nx * total; p2.vy += ny * total;
    if (slamBoost) sfx.tone(180, 'square', 0.08, 0.25);
  }
}

function roundOver(winner) {
  if (winner === 1) p1Wins++; else p2Wins++;
  updateHud();
  sfx.tone(winner === 1 ? 880 : 440, 'triangle', 0.3, 0.25);
  // Quick reset positions
  p1.x = CTRX() - 100; p1.y = CTRY(); p1.vx = 0; p1.vy = 0; p1.slamT = 0; p1.charging = false; p1.charge = 0;
  p2.x = CTRX() + 100; p2.y = CTRY(); p2.vx = 0; p2.vy = 0; p2.slamT = 0; p2.charging = false; p2.charge = 0;
  round++;
  if (p1Wins >= 3 || p2Wins >= 3 || round > 5) end();
}

function end() {
  running = false;
  const winner = p1Wins > p2Wins ? 1 : 2;
  document.getElementById('end-title').textContent = winner === 1 ? 'P1 WINS' : (vsBot ? 'BOT WINS' : 'P2 WINS');
  document.getElementById('end-p1').textContent = p1Wins;
  document.getElementById('end-p2').textContent = p2Wins;
  document.getElementById('hud').hidden = true;
  document.getElementById('end-overlay').hidden = false;
  document.getElementById('end-overlay').classList.remove('is-hidden');
}

function tick(dt) {
  if (!running) return;
  tickPug(p1, { up: 'w', down: 's', left: 'a', right: 'd' }, dt);
  if (vsBot) botTurn(dt);
  else tickPug(p2, { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' }, dt);
  tickPhys(p1, dt); tickPhys(p2, dt);
  collide();
  // Check ring-out
  const cx = CTRX(), cy = CTRY(), R = ARENA_R();
  if (Math.hypot(p1.x - cx, p1.y - cy) > R + p1.r) roundOver(2);
  else if (Math.hypot(p2.x - cx, p2.y - cy) > R + p2.r) roundOver(1);
}

function render() {
  ctx.fillStyle = '#0a0716'; ctx.fillRect(0, 0, W, H);
  // Arena ring
  ctx.fillStyle = '#3a2a5a';
  ctx.beginPath(); ctx.arc(CTRX(), CTRY(), ARENA_R() + 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9a86a';
  ctx.beginPath(); ctx.arc(CTRX(), CTRY(), ARENA_R(), 0, Math.PI * 2); ctx.fill();
  // Concentric rings
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 2;
  for (let r = 30; r < ARENA_R(); r += 30) {
    ctx.beginPath(); ctx.arc(CTRX(), CTRY(), r, 0, Math.PI * 2); ctx.stroke();
  }
  drawPug(p1);
  drawPug(p2);
}

function drawPug(p) {
  // body grows during charge
  const r = p.r + (p.charging ? p.charge * 14 : 0);
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  // mask
  ctx.fillStyle = p.mask;
  ctx.beginPath(); ctx.ellipse(p.x, p.y + r * 0.18, r * 0.65, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  // eyes
  ctx.fillStyle = '#fff';
  ctx.fillRect(p.x - r * 0.4, p.y - r * 0.15, 6, 6);
  ctx.fillRect(p.x + r * 0.18, p.y - r * 0.15, 6, 6);
  ctx.fillStyle = '#000';
  ctx.fillRect(p.x - r * 0.4 + 2, p.y - r * 0.15 + 2, 3, 3);
  ctx.fillRect(p.x + r * 0.18 + 2, p.y - r * 0.15 + 2, 3, 3);
  // snoot
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.arc(p.x, p.y + r * 0.35, 6, 0, Math.PI * 2); ctx.fill();
  // Charge ring
  if (p.charging) {
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 6 + p.charge * 10, 0, Math.PI * 2); ctx.stroke();
  }
  // Slam streak
  if (p.slamT > 0) {
    const ang = p.slamAng;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.x - Math.cos(ang) * 20, p.y - Math.sin(ang) * 20);
    ctx.lineTo(p.x - Math.cos(ang) * 50, p.y - Math.sin(ang) * 50);
    ctx.stroke();
  }
}

document.getElementById('start-btn').addEventListener('click', () => start(false));
document.getElementById('start-bot').addEventListener('click', () => start(true));
document.getElementById('end-restart').addEventListener('click', () => start(vsBot));
function start(bot) {
  vsBot = bot;
  reset(); running = true;
  document.getElementById('overlay').hidden = true; document.getElementById('overlay').classList.add('is-hidden');
  document.getElementById('end-overlay').hidden = true; document.getElementById('end-overlay').classList.add('is-hidden');
  document.getElementById('hud').hidden = false;
  sfx.resume();
}

let lastT = performance.now();
(function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  tick(dt); render();
  requestAnimationFrame(loop);
})(performance.now());
