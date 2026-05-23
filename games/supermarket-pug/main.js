// SUPERMARKET PUG — top-down chaos heist.
// Walk a supermarket. Grab items (E or button). Knock shelves (SPACE).
// Shopping cart = speed boost but louder. Guards chase based on heat.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { drawIcon } from '../../src/shared/icons.js';

// --- Custom item icons for ones not in the shared library ---------------------
// Chicken drumstick — beige leg + brown bone tip
function drawChicken(ctx, x, y, size) {
  const s = size / 16;
  ctx.save(); ctx.translate(x, y);
  // drumstick meat body
  ctx.fillStyle = '#d8a06a';
  ctx.fillRect(-4 * s, -2 * s, 8 * s, 7 * s);
  ctx.fillRect(-3 * s, -3 * s, 6 * s, 1 * s);
  ctx.fillRect(-3 * s,  5 * s, 6 * s, 1 * s);
  // shading underside
  ctx.fillStyle = '#a06a3a';
  ctx.fillRect(-4 * s,  4 * s, 8 * s, 1 * s);
  // crispy highlight
  ctx.fillStyle = '#ffd8a0';
  ctx.fillRect(-3 * s, -1 * s, 2 * s, 2 * s);
  // bone sticking out top
  ctx.fillStyle = '#f4ecd2';
  ctx.fillRect(-1 * s, -6 * s, 2 * s, 3 * s);
  ctx.fillRect(-2 * s, -7 * s, 2 * s, 2 * s);
  ctx.fillRect( 0 * s, -7 * s, 2 * s, 2 * s);
  ctx.restore();
}
// Donut — pink frosted ring with sprinkles
function drawDonut(ctx, x, y, size) {
  const s = size / 16;
  ctx.save(); ctx.translate(x, y);
  // body (brown dough)
  ctx.fillStyle = '#a0683a';
  ctx.fillRect(-5 * s, -4 * s, 10 * s, 8 * s);
  ctx.fillRect(-4 * s, -5 * s,  8 * s, 1 * s);
  ctx.fillRect(-4 * s,  4 * s,  8 * s, 1 * s);
  // pink frosting top
  ctx.fillStyle = '#ff3aa1';
  ctx.fillRect(-5 * s, -4 * s, 10 * s, 5 * s);
  ctx.fillRect(-4 * s, -5 * s,  8 * s, 1 * s);
  // hole
  ctx.fillStyle = '#0a0716';
  ctx.fillRect(-1 * s, -1 * s, 2 * s, 2 * s);
  // sprinkles
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-3 * s, -3 * s, 1 * s, 1 * s);
  ctx.fillStyle = '#4cc9f0';
  ctx.fillRect( 2 * s, -3 * s, 1 * s, 1 * s);
  ctx.fillStyle = '#5ef38c';
  ctx.fillRect(-3 * s,  0 * s, 1 * s, 1 * s);
  ctx.fillStyle = '#fff';
  ctx.fillRect( 2 * s,  0 * s, 1 * s, 1 * s);
  ctx.restore();
}

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'mart:muted' });
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

const ITEMS = [
  { drawIconFn: drawIcon.meat,     name: 'steak',   val: 40 },
  { drawIconFn: drawChicken,       name: 'chicken', val: 20 },
  { drawIconFn: drawIcon.cheese,   name: 'cheese',  val: 25 },
  { drawIconFn: drawIcon.bacon,    name: 'bacon',   val: 30 },
  { drawIconFn: drawIcon.pizza,    name: 'pizza',   val: 35 },
  { drawIconFn: drawIcon.cake,     name: 'cake',    val: 28 },
  { drawIconFn: drawIcon.bone,     name: 'bone',    val: 50 },
  { drawIconFn: drawDonut,         name: 'donut',   val: 18 },
];

let pug, inCart, shelves, items, guards, exitZ, haul, bag, maxBag, heat, shelvesKnocked, running;
let popups, aisles, lights, cameras, decorCarts, pallets, sceneRows, sceneCols, sceneGx, sceneGy;
let shakeT = 0, shakeAmp = 0;
function shake(amp, dur) { shakeAmp = Math.max(shakeAmp, amp); shakeT = Math.max(shakeT, dur); }
function popup(x, y, text, color) {
  if (!popups) return;
  if (popups.length > 24) popups.shift();
  popups.push({ x, y, vy: -36, text, color: color || '#5ef38c', life: 0.9, t: 0 });
}
function reset() {
  pug = { x: W / 2, y: H - 80, vx: 0, vy: 0, ang: 0 };
  inCart = false;
  shelves = []; items = []; guards = []; exitZ = { x: W / 2, y: 40, r: 36 };
  popups = []; aisles = []; lights = []; cameras = []; decorCarts = []; pallets = [];
  shakeT = 0; shakeAmp = 0;
  haul = 0; bag = 0; maxBag = 8; heat = 0; shelvesKnocked = 0;
  // Generate shelf grid
  const rows = 4, cols = 5;
  const sw = 80, sh = 24, gx = (W - cols * 120) / 2, gy = 100;
  sceneRows = rows; sceneCols = cols; sceneGx = gx; sceneGy = gy;
  for (let r = 0; r < rows; r++) {
    aisles.push({ x: gx, y: gy + r * 100 + sh + 30, w: cols * 120, n: r + 1 });
    for (let c = 0; c < cols; c++) {
      const sh1 = { x: gx + c * 120 + 20, y: gy + r * 100, w: sw, h: sh, hp: 2, seed: (r * 13 + c * 7) | 0 };
      shelves.push(sh1);
      // Items on top of shelf — keep deterministic-ish product slots so render can show varied colors below
      for (let i = 0; i < 3; i++) {
        const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        items.push({ x: sh1.x + 12 + i * 22, y: sh1.y - 4, item: it, on: sh1, taken: false });
      }
    }
  }
  // Ceiling light strips along the top of each row
  for (let r = 0; r < rows; r++) {
    lights.push({ x: gx - 12, y: gy + r * 100 - 18, w: cols * 120 + 24, h: 4 });
  }
  // Security cameras (decorative) at top corners
  cameras.push({ x: 40, y: 40, ang: 0.5, phase: 0 });
  cameras.push({ x: W - 40, y: 40, ang: Math.PI - 0.5, phase: Math.PI });
  // Shopping carts as decoration (parked near the bottom)
  for (let i = 0; i < 3; i++) {
    decorCarts.push({ x: 80 + i * 70, y: H - 40, ang: (Math.random() - 0.5) * 0.4 });
  }
  // Restock pallets — between rows
  for (let r = 0; r < rows - 1; r++) {
    pallets.push({ x: gx + (r % 2 ? cols - 1 : 0) * 120 + 4, y: gy + r * 100 + 60, w: 28, h: 22 });
  }
  // Guards (2)
  guards.push({ x: 60, y: 60, vx: 0, vy: 0, ang: 0, alertT: 0, target: null });
  guards.push({ x: W - 60, y: 60, vx: 0, vy: 0, ang: 0, alertT: 0, target: null });
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === 'e' || e.key === 'E') grabNear();
  if (e.key === ' ' || e.code === 'Space') ram();
  if (e.key === 'c' || e.key === 'C') toggleCart();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
document.getElementById('cart-btn').addEventListener('click', toggleCart);
if ('ontouchstart' in window) document.getElementById('cart-btn').style.display = 'block';
let touchAt = null;
canvas.addEventListener('touchstart', (e) => { touchAt = e.touches[0]; grabNear(); e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { touchAt = e.touches[0]; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => touchAt = null);

function grabNear() {
  if (!running) return;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.taken) continue;
    if (Math.hypot(it.x - pug.x, it.y - pug.y) < 30) {
      if (bag < maxBag) {
        it.taken = true;
        bag++;
        haul += it.item.val;
        popup(it.x, it.y - 10, '+$' + it.item.val);
        sfx.tone(880, 'triangle', 0.07, 0.18);
        return;
      } else {
        popup(pug.x, pug.y - 24, 'BAG FULL', '#ff3a3a');
        sfx.tone(220, 'sawtooth', 0.08, 0.18);
        return;
      }
    }
  }
}

function ram() {
  if (!running) return;
  for (const s of shelves) {
    const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
    if (Math.hypot(cx - pug.x, cy - pug.y) < 40) {
      s.hp--;
      heat = Math.min(1, heat + 0.18);
      sfx.tone(180, 'sawtooth', 0.1, 0.22);
      if (s.hp <= 0) {
        // Drop all items
        for (const it of items) {
          if (it.on === s && !it.taken) {
            it.y += 18;
            it.fallen = true;
          }
        }
        shelvesKnocked++;
        shelves = shelves.filter((x) => x !== s);
        sfx.tone(110, 'square', 0.2, 0.24);
        shake(6, 0.22);
      } else {
        shake(2, 0.1);
      }
      return;
    }
  }
}

function toggleCart() {
  inCart = !inCart;
  heat = Math.min(1, heat + 0.1);
  sfx.tone(550, 'square', 0.06, 0.16);
}

function tick(dt) {
  if (!running) return;
  let mx = 0, my = 0;
  if (keys.has('w') || keys.has('arrowup')) my -= 1;
  if (keys.has('s') || keys.has('arrowdown')) my += 1;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  if (touchAt) {
    mx = touchAt.clientX - pug.x; my = touchAt.clientY - pug.y;
    const l = Math.hypot(mx, my);
    if (l > 20) { mx /= l; my /= l; } else { mx = 0; my = 0; }
  }
  const speed = inCart ? 280 : 160;
  if (mx || my) {
    const l = Math.hypot(mx, my);
    pug.vx += (mx / l) * speed * dt * 4;
    pug.vy += (my / l) * speed * dt * 4;
    pug.ang = Math.atan2(my, mx);
    if (inCart) heat = Math.min(1, heat + dt * 0.04);
  }
  // Shelf collision (block movement)
  pug.x += pug.vx * dt; pug.y += pug.vy * dt;
  pug.vx *= Math.pow(0.5, dt * 4); pug.vy *= Math.pow(0.5, dt * 4);
  for (const s of shelves) {
    if (pug.x + 14 > s.x && pug.x - 14 < s.x + s.w && pug.y + 14 > s.y && pug.y - 14 < s.y + s.h) {
      // push out (simple)
      const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
      const dx = pug.x - cx, dy = pug.y - cy;
      if (Math.abs(dx) > Math.abs(dy)) pug.x = dx > 0 ? s.x + s.w + 14 : s.x - 14;
      else pug.y = dy > 0 ? s.y + s.h + 14 : s.y - 14;
      pug.vx *= 0.5; pug.vy *= 0.5;
    }
  }
  pug.x = Math.max(20, Math.min(W - 20, pug.x));
  pug.y = Math.max(20, Math.min(H - 20, pug.y));
  // Heat decays slowly
  heat = Math.max(0, heat - dt * 0.05);
  // Guards
  for (const g of guards) {
    const dx = pug.x - g.x, dy = pug.y - g.y;
    const d = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);
    let diff = ang - g.ang;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const sees = d < 200 && Math.abs(diff) < 0.5;
    if (sees) { g.alertT = 3; heat = Math.min(1, heat + 0.4 * dt); }
    if (heat > 0.7) g.alertT = Math.max(g.alertT, 1.5);
    if (g.alertT > 0) {
      g.alertT -= dt;
      g.ang = ang;
      const gs = 140;
      g.x += (dx / d) * gs * dt; g.y += (dy / d) * gs * dt;
    } else {
      // patrol along x
      g.ang += dt * 0.4;
      g.x += Math.cos(g.ang) * 30 * dt;
      g.y += Math.sin(g.ang) * 30 * dt;
      g.x = Math.max(40, Math.min(W - 40, g.x));
      g.y = Math.max(40, Math.min(H - 100, g.y));
    }
    if (d < 22) return caught();
  }
  // Exit reach
  if (Math.hypot(exitZ.x - pug.x, exitZ.y - pug.y) < exitZ.r) {
    if (haul > 0) end(true);
  }
  // popups + shake decay
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i]; p.t += dt; p.y += p.vy * dt; p.vy *= 0.9;
    if (p.t >= p.life) popups.splice(i, 1);
  }
  shakeT = Math.max(0, shakeT - dt); if (shakeT === 0) shakeAmp = 0;
  updateHud();
}

function drawCart(x, y, ang, big) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  // basket
  ctx.fillStyle = '#8a8a9a';
  ctx.fillRect(-18, -12, 36, 20);
  // diagonal mesh
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
  for (let i = -16; i < 18; i += 5) {
    ctx.beginPath(); ctx.moveTo(i, -12); ctx.lineTo(i + 6, 8); ctx.stroke();
  }
  // handle
  ctx.strokeStyle = '#cacad6'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(-22, -4); ctx.stroke();
  // wheels
  ctx.fillStyle = '#1a0d05';
  ctx.fillRect(-16, 8, 6, 4); ctx.fillRect(10, 8, 6, 4);
  ctx.restore();
}
function render() {
  // screen-shake offset
  const sx = shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp * 2 : 0;
  const sy = shakeAmp > 0 ? (Math.random() - 0.5) * shakeAmp * 2 : 0;
  ctx.save();
  ctx.translate(sx, sy);
  // Vinyl tile floor (alternating pattern)
  ctx.fillStyle = '#3a3a4a'; ctx.fillRect(-8, -8, W + 16, H + 16);
  const TS = 48;
  for (let y = 0; y < H; y += TS) {
    for (let x = 0; x < W; x += TS) {
      const c = ((x / TS | 0) + (y / TS | 0)) & 1;
      ctx.fillStyle = c ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.07)';
      ctx.fillRect(x, y, TS, TS);
    }
  }
  // subtle grout lines
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= W; x += TS) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
  for (let y = 0; y <= H; y += TS) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke();

  // Aisle numbers between rows
  ctx.fillStyle = 'rgba(255,210,63,0.35)';
  ctx.font = "bold 9px 'Press Start 2P', monospace"; ctx.textAlign = 'center';
  for (const a of aisles) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(a.x, a.y - 8, a.w, 16);
    ctx.fillStyle = 'rgba(255,210,63,0.4)';
    ctx.fillText('· AISLE ' + a.n + ' ·', a.x + a.w / 2, a.y + 3);
  }

  // Restock pallets (decorative)
  for (const p of pallets) {
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(p.x, p.y + p.h - 4, p.w, 2);
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 4);
    ctx.fillRect(p.x + 2, p.y + 10, p.w - 4, 4);
    // small cardboard boxes on top
    ctx.fillStyle = '#a87a4a'; ctx.fillRect(p.x + 4, p.y - 6, 8, 8); ctx.fillRect(p.x + 16, p.y - 6, 8, 8);
  }

  // Decor carts parked at bottom
  for (const c of decorCarts) drawCart(c.x, c.y, c.ang);

  // Ceiling light strips (subtle yellow glow above rows)
  for (const l of lights) {
    const grad = ctx.createLinearGradient(0, l.y - 12, 0, l.y + 16);
    grad.addColorStop(0, 'rgba(255,230,150,0)');
    grad.addColorStop(0.5, 'rgba(255,230,150,0.16)');
    grad.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = grad; ctx.fillRect(l.x, l.y - 12, l.w, 28);
    ctx.fillStyle = '#fff7d0'; ctx.fillRect(l.x, l.y, l.w, l.h);
  }

  // EXIT zone at top
  ctx.shadowColor = '#5ef38c'; ctx.shadowBlur = 16;
  ctx.strokeStyle = '#5ef38c'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(exitZ.x, exitZ.y, exitZ.r, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#5ef38c'; ctx.font = "14px 'Press Start 2P', monospace"; ctx.textAlign = 'center';
  ctx.fillText('EXIT', exitZ.x, exitZ.y + 4);

  // Shelves — multi-tier with colorful products visible
  const PROD = ['#ff5a3a', '#ffd23f', '#5ef38c', '#4cc9f0', '#c062ff', '#ff8e3c'];
  for (const s of shelves) {
    // back board
    ctx.fillStyle = s.hp > 1 ? '#5a3a1c' : '#3a2a14';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    // top trim
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(s.x, s.y, s.w, 3);
    // products line on the front
    for (let i = 0; i < 6; i++) {
      const pc = PROD[(s.seed + i) % PROD.length];
      ctx.fillStyle = pc;
      ctx.fillRect(s.x + 2 + i * 13, s.y + 5, 10, s.h - 8);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(s.x + 2 + i * 13, s.y + 5, 10, 2);
    }
    // damage cracks if hp <=1
    if (s.hp <= 1) {
      ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s.x + 8, s.y + 4); ctx.lineTo(s.x + 22, s.y + 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s.x + 40, s.y + 6); ctx.lineTo(s.x + 56, s.y + 20); ctx.stroke();
    }
    // shelf shadow on floor
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(s.x + 2, s.y + s.h, s.w - 4, 4);
  }
  // Items
  for (const it of items) {
    if (it.taken) continue;
    if (it.item.drawIconFn) it.item.drawIconFn(ctx, it.x, it.y, 18);
  }
  // Security cameras at corners (decorative, animated pan)
  const tNow = performance.now() * 0.001;
  for (const cam of cameras) {
    const pan = Math.sin(tNow * 0.6 + cam.phase) * 0.4;
    // bracket
    ctx.fillStyle = '#2a2a3a'; ctx.fillRect(cam.x - 6, cam.y - 6, 12, 4);
    // camera body
    ctx.save(); ctx.translate(cam.x, cam.y); ctx.rotate(cam.ang + pan);
    ctx.fillStyle = '#1a1a26'; ctx.fillRect(-8, -4, 14, 8);
    ctx.fillStyle = '#4cc9f0'; ctx.fillRect(4, -2, 4, 4); // lens
    // faint vision indicator
    ctx.fillStyle = 'rgba(76,201,240,0.07)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 60, -0.4, 0.4); ctx.closePath(); ctx.fill();
    ctx.restore();
    // tiny red recording dot
    ctx.fillStyle = (((tNow * 1.5 | 0) & 1) ? '#ff3a3a' : '#7a1a1a');
    ctx.fillRect(cam.x - 2, cam.y + 2, 2, 2);
  }
  // Guards
  for (const g of guards) {
    // vision cone
    ctx.fillStyle = `rgba(255,58,58,${g.alertT > 0 ? 0.3 : 0.15})`;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.arc(g.x, g.y, 200, g.ang - 0.5, g.ang + 0.5);
    ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(g.x - 12, g.y - 12, 24, 24);
    ctx.fillStyle = '#fff';
    ctx.fillRect(g.x - 8, g.y - 18, 16, 8);
    // alert
    if (g.alertT > 0) {
      ctx.fillStyle = '#ff3a3a'; ctx.font = "16px sans-serif"; ctx.textAlign = 'center';
      ctx.fillText('!', g.x, g.y - 18);
    }
  }
  // Pug (and cart if active) — use the same cart art for consistency
  if (inCart) drawCart(pug.x, pug.y + 4, 0);
  ctx.fillStyle = '#c8854a';
  ctx.beginPath(); ctx.arc(pug.x, pug.y - (inCart ? 6 : 0), 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0d05';
  ctx.fillRect(pug.x - 4, pug.y - 4 - (inCart ? 6 : 0), 2, 2);
  ctx.fillRect(pug.x + 2, pug.y - 4 - (inCart ? 6 : 0), 2, 2);
  // Score popups
  for (const p of popups) {
    const a = 1 - p.t / p.life;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color; ctx.font = "bold 11px 'Press Start 2P', monospace"; ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }
  // Heat bar — pulses if hot
  const hotPulse = heat > 0.7 ? (0.7 + 0.3 * Math.sin(performance.now() * 0.02)) : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(W / 2 - 100, 18, 200, 8);
  ctx.fillStyle = heat > 0.7 ? '#ff3a3a' : (heat > 0.4 ? '#ffd23f' : '#5ef38c');
  ctx.globalAlpha = hotPulse;
  ctx.fillRect(W / 2 - 100, 18, 200 * heat, 8);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = "9px 'Press Start 2P', monospace"; ctx.textAlign = 'center';
  ctx.fillText('HEAT', W / 2, 14);
  // High-heat vignette
  if (heat > 0.7) {
    const a = (heat - 0.7) / 0.3 * 0.35 * hotPulse;
    const grad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.65);
    grad.addColorStop(0, 'rgba(255,58,58,0)');
    grad.addColorStop(1, `rgba(255,58,58,${a})`);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function updateHud() {
  document.getElementById('hud-haul').textContent = '$' + haul;
  document.getElementById('hud-bag').textContent = `${bag}/${maxBag}`;
  document.getElementById('hud-heat').textContent = Math.floor(heat * 100) + '%';
  document.getElementById('hud-shelves').textContent = shelvesKnocked;
  const hud = document.getElementById('hud');
  if (heat > 0.7) {
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.014);
    hud.style.filter = `drop-shadow(0 0 ${6 + pulse * 8}px rgba(255,58,58,${0.4 + pulse * 0.4}))`;
  } else {
    hud.style.filter = '';
  }
  const best = loadBest('supermarket-pug');
  document.getElementById('hud-best').textContent = best ? '$' + best.haul : '$0';
}

function caught() { shake(8, 0.3); end(false); }
function end(escaped) {
  running = false;
  sfx.sweep(escaped ? 880 : 220, escaped ? 1320 : 80, escaped ? 'triangle' : 'sawtooth', 0.5, 0.25);
  document.getElementById('end-title').textContent = escaped ? 'CLEAN GETAWAY' : 'CAUGHT';
  document.getElementById('end-sub').textContent = escaped ? 'You made it to the parking lot.' : 'Security got you. The snacks are gone.';
  document.getElementById('end-haul').textContent = '$' + haul;
  document.getElementById('end-shelves').textContent = shelvesKnocked;
  const finalScore = haul + (escaped ? 100 : 0);
  const { isNewBest, current } = submitRun('supermarket-pug', { score: finalScore, haul });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { haul };
    bestEl.innerHTML = `Best: <b>$${b.haul}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
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
      showTip('WASD move · E grab item · SPACE ram shelf · C cart · reach EXIT', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
