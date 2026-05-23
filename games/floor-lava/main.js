// FLOOR IS LAVA: PUG ESCAPE — endless vertical climber.
// Random platforms scroll downward. Lava rises. Pug auto-falls (gravity).
// Double-jump. Treats give score.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { drawIcon } from '../../src/shared/icons.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const sfx = createSfx({ storageKey: 'lava:muted' });
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

const GRAV = 1400;
const JUMP_V = -680;
let pug, plats, treats, powerups, blobs, lavaY, height, maxHeight, score, treatsGot, running, lastPlatY;
let jetpackT = 0, freezeT = 0, shrinkT = 0;
// Juice + visual layers
let embers = [];      // {x,y,vx,vy,life,max,r}
let lavaBubbles = []; // {x,y,r,life,max}
let popups = [];      // {x,y,vy,life,max,text,color}
let banner = null;    // {text,life,max}
let nextMilestone = 5;
let hitFlashT = 0;
let shakeT = 0, shakeMag = 0;
let caveOffset = 0;   // background parallax y scroll
function reset() {
  pug = { x: W / 2, y: H - 200, vx: 0, vy: 0, onGround: false, jumpsLeft: 2, w: 22, h: 22 };
  plats = []; treats = []; powerups = []; blobs = [];
  embers = []; lavaBubbles = []; popups = []; banner = null;
  nextMilestone = 5;
  hitFlashT = 0; shakeT = 0; shakeMag = 0; caveOffset = 0;
  lastPlatY = H - 100;
  // Initial ground
  plats.push({ x: W / 2 - 80, y: H - 100, w: 160, h: 16, kind: 'normal' });
  for (let i = 0; i < 30; i++) addPlatformAbove();
  lavaY = H + 200;
  height = 0; maxHeight = 0; score = 0; treatsGot = 0;
  jetpackT = 0; freezeT = 0; shrinkT = 0;
}
function shake(mag, dur) { shakeMag = Math.max(shakeMag, mag); shakeT = Math.max(shakeT, dur); }
function pop(x, y, text, color) {
  if (popups.length > 80) popups.shift();
  popups.push({ x, y, vy: -40, life: 0, max: 0.9, text, color: color || '#ffd23f' });
}
function addPlatformAbove() {
  lastPlatY -= 80 + Math.random() * 50;
  const w = 70 + Math.random() * 70;
  const x = Math.random() * (W - w);
  // Platform variety based on depth — higher = more variety
  const r = Math.random();
  const depth = (H - lastPlatY) / 100;
  let kind = 'normal';
  if (depth > 3 && r < 0.18) kind = 'crumble';
  else if (depth > 2 && r < 0.30) kind = 'bouncy';
  plats.push({ x, y: lastPlatY, w, h: 14, kind, t: 0, alive: true });
  if (Math.random() < 0.45) treats.push({ x: x + w / 2, y: lastPlatY - 24 });
  // Powerup (rare)
  if (depth > 4 && Math.random() < 0.06) {
    const pwTypes = ['jetpack', 'freeze', 'shrink'];
    powerups.push({ x: x + w / 2, y: lastPlatY - 38, type: pwTypes[Math.floor(Math.random() * pwTypes.length)] });
  }
  // Lava blob (rare, only deep up)
  if (depth > 6 && Math.random() < 0.08) {
    blobs.push({ x: x + w / 2, y: H + 80, vy: -100 - Math.random() * 60, life: 2.5 });
  }
}

const keys = new Set();
window.addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (e.key === ' ' || e.key === 'w' || e.code === 'Space' || e.key === 'ArrowUp') jump();
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
let touchX = null;
canvas.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { touchX = e.touches[0].clientX; e.preventDefault(); }, { passive: false });
canvas.addEventListener('touchend', () => touchX = null);
document.getElementById('jump-btn').addEventListener('click', jump);
if ('ontouchstart' in window) document.getElementById('jump-btn').style.display = 'block';

function jump() {
  if (!running || pug.jumpsLeft <= 0) return;
  pug.vy = JUMP_V;
  pug.jumpsLeft--;
  pug.onGround = false;
  sfx.tone(pug.jumpsLeft === 1 ? 660 : 880, 'triangle', 0.08, 0.18);
}

function tick(dt) {
  if (!running) return;
  // Movement
  let mx = 0;
  if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
  if (keys.has('d') || keys.has('arrowright')) mx += 1;
  if (touchX !== null) {
    if (touchX < W / 2 - 30) mx = -1;
    else if (touchX > W / 2 + 30) mx = 1;
  }
  // Decay powerup timers
  jetpackT = Math.max(0, jetpackT - dt);
  freezeT = Math.max(0, freezeT - dt);
  shrinkT = Math.max(0, shrinkT - dt);
  pug.vx += mx * 1200 * dt;
  pug.vx *= Math.pow(0.5, dt * 5);
  pug.vy += (jetpackT > 0 ? GRAV * 0.15 : GRAV) * dt;
  if (jetpackT > 0 && keys.has(' ')) pug.vy = Math.max(pug.vy, -200); // hover
  pug.x += pug.vx * dt;
  pug.y += pug.vy * dt;
  // Wrap horizontally
  if (pug.x < -10) pug.x = W;
  if (pug.x > W + 10) pug.x = 0;

  // Platform collision (only when falling)
  pug.onGround = false;
  const hw = (shrinkT > 0 ? pug.w * 0.5 : pug.w) / 2;
  if (pug.vy > 0) {
    for (const p of plats) {
      if (!p.alive) continue;
      if (pug.x + hw > p.x && pug.x - hw < p.x + p.w) {
        if (pug.y + pug.h / 2 > p.y && pug.y + pug.h / 2 < p.y + p.h + 12) {
          if (p.kind === 'bouncy') {
            pug.vy = JUMP_V * 1.3;
            pug.jumpsLeft = 2;
            sfx.tone(990, 'triangle', 0.08, 0.2);
            shake(2, 0.12);
          } else {
            pug.y = p.y - pug.h / 2;
            pug.vy = 0;
            pug.onGround = true;
            pug.jumpsLeft = 2;
            if (p.kind === 'crumble') {
              p.t += dt * 8; // tick fast while standing
              if (!p.crumbleStartT) p.crumbleStartT = performance.now();
              if (performance.now() - p.crumbleStartT > 700) p.alive = false;
            }
          }
        }
      }
    }
  }
  // Powerup pickup
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    if (Math.abs(p.x - pug.x) < 20 && Math.abs(p.y - pug.y) < 20) {
      powerups.splice(i, 1);
      if (p.type === 'jetpack') jetpackT = 5;
      else if (p.type === 'freeze') freezeT = 4;
      else if (p.type === 'shrink') shrinkT = 6;
      sfx.tone(1320, 'triangle', 0.12, 0.22);
    }
  }
  // Lava blobs
  for (let i = blobs.length - 1; i >= 0; i--) {
    const b = blobs[i];
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0 || b.y < -200) { blobs.splice(i, 1); continue; }
    if (Math.abs(b.x - pug.x) < 18 && Math.abs(b.y - pug.y) < 18) return die();
  }

  // Lava rises — accelerating (paused if freeze powerup active)
  height = Math.max(height, Math.floor((H - 200 - pug.y) / 10));
  maxHeight = Math.max(maxHeight, height);
  const lavaSpeed = (freezeT > 0 ? 0 : 50 + height * 0.4);
  lavaY -= lavaSpeed * dt;
  // Camera: when pug is above middle, scroll world down
  if (pug.y < H * 0.4) {
    const dy = H * 0.4 - pug.y;
    pug.y += dy;
    lavaY += dy;
    for (const p of plats) p.y += dy;
    for (const t of treats) t.y += dy;
  }
  // Recycle platforms above viewport
  while (lastPlatY > -200) addPlatformAbove();
  for (let i = plats.length - 1; i >= 0; i--) if (plats[i].y > H + 100) plats.splice(i, 1);
  for (let i = treats.length - 1; i >= 0; i--) if (treats[i].y > H + 100) treats.splice(i, 1);

  // Treats
  for (let i = treats.length - 1; i >= 0; i--) {
    const t = treats[i];
    if (Math.abs(t.x - pug.x) < 20 && Math.abs(t.y - pug.y) < 20) {
      treats.splice(i, 1);
      treatsGot++; score += 50;
      sfx.tone(1320, 'triangle', 0.08, 0.2);
      pop(t.x, t.y - 10, '+50', '#ffd23f');
    }
  }
  score = Math.max(score, height * 10 + treatsGot * 50);

  // Milestone banner every 5m
  if (height >= nextMilestone) {
    banner = { text: `${nextMilestone}m MILESTONE!`, life: 0, max: 1.8 };
    pop(W / 2, H * 0.4, `+${nextMilestone * 5}`, '#5ef38c');
    score += nextMilestone * 5;
    nextMilestone += 5;
    sfx.arp([523, 659, 784], 'triangle', 0.06, 0.18, 0.15);
    shake(3, 0.18);
  }

  // Spawn embers rising from lava (cap at ~150)
  if (embers.length < 150 && lavaY < H + 40) {
    const burst = freezeT > 0 ? 0 : 2;
    for (let i = 0; i < burst; i++) {
      embers.push({
        x: Math.random() * W,
        y: lavaY + Math.random() * 4,
        vx: (Math.random() - 0.5) * 30,
        vy: -40 - Math.random() * 60,
        life: 0, max: 1.6 + Math.random() * 1.2, r: 1 + Math.random() * 2,
      });
    }
  }
  for (let i = embers.length - 1; i >= 0; i--) {
    const e = embers[i];
    e.life += dt; e.x += e.vx * dt; e.y += e.vy * dt;
    e.vy += -20 * dt; // buoyancy
    if (e.life >= e.max || e.y < -20) embers.splice(i, 1);
  }
  // Spawn lava bubbles (cap at ~30)
  if (lavaBubbles.length < 30) {
    if (Math.random() < dt * 6) {
      lavaBubbles.push({
        x: Math.random() * W, y: lavaY + 2 + Math.random() * 8,
        r: 3 + Math.random() * 5, life: 0, max: 0.6 + Math.random() * 0.5,
      });
    }
  }
  for (let i = lavaBubbles.length - 1; i >= 0; i--) {
    const b = lavaBubbles[i];
    b.life += dt;
    if (b.life >= b.max) lavaBubbles.splice(i, 1);
  }
  // Popup floats
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.life += dt; p.y += p.vy * dt; p.vy += 30 * dt;
    if (p.life >= p.max) popups.splice(i, 1);
  }
  // Banner
  if (banner) { banner.life += dt; if (banner.life >= banner.max) banner = null; }
  // Shake/flash decay
  if (shakeT > 0) shakeT -= dt;
  if (hitFlashT > 0) hitFlashT -= dt;
  // Background parallax: scroll with platforms but slower
  caveOffset += 12 * dt;

  // Lava death
  if (pug.y + pug.h / 2 >= lavaY) { hitFlashT = 0.3; shake(8, 0.4); return die(); }
  // Fall too far below
  if (pug.y > H + 80) { hitFlashT = 0.3; shake(6, 0.35); return die(); }
  updateHud();
}

function render() {
  // Screen shake transform
  let sx = 0, sy = 0;
  if (shakeT > 0) {
    const k = Math.min(1, shakeT / 0.3);
    sx = (Math.random() - 0.5) * shakeMag * 2 * k;
    sy = (Math.random() - 0.5) * shakeMag * 2 * k;
  }
  ctx.save();
  ctx.translate(sx, sy);
  // Sky gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#0a0716'); grd.addColorStop(1, '#3a1a14');
  ctx.fillStyle = grd; ctx.fillRect(-8, -8, W + 16, H + 16);
  // Background parallax: distant cave walls (slow scroll, repeating)
  const parY = (caveOffset * 0.4) % 200;
  ctx.fillStyle = 'rgba(60,18,18,0.55)';
  for (let yy = -200; yy < H + 200; yy += 200) {
    for (let i = 0; i < 6; i++) {
      const cx = (i / 5) * W;
      const cy = yy + parY + (i % 2) * 80;
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy);
      ctx.lineTo(cx - 30, cy - 40);
      ctx.lineTo(cx + 30, cy - 30);
      ctx.lineTo(cx + 60, cy);
      ctx.closePath(); ctx.fill();
    }
  }
  // Mid parallax: closer rocks (faster)
  const parY2 = (caveOffset * 0.85) % 160;
  ctx.fillStyle = 'rgba(90,30,20,0.6)';
  for (let yy = -160; yy < H + 160; yy += 160) {
    for (let i = 0; i < 4; i++) {
      const cx = (i / 3) * W + 40;
      const cy = yy + parY2;
      ctx.fillRect(cx - 18, cy - 12, 36, 24);
      ctx.fillRect(cx - 22, cy + 8, 44, 6);
    }
  }
  // Glow embers (cheap, additive)
  ctx.globalCompositeOperation = 'lighter';
  for (const e of embers) {
    const a = 1 - e.life / e.max;
    ctx.fillStyle = `rgba(255,${140 + Math.floor(80 * a)},40,${a * 0.7})`;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // Platforms (color by kind) with grain/moss
  for (const p of plats) {
    if (!p.alive) continue;
    const isCrumble = p.kind === 'crumble';
    const isBouncy = p.kind === 'bouncy';
    const color = isBouncy ? '#b055ff' : (isCrumble ? '#8a6a4a' : '#5a3a1c');
    const topColor = isBouncy ? '#d59aff' : (isCrumble ? '#a68a6a' : '#7a5a3a');
    const grassColor = isBouncy ? '#ff8aa8' : (isCrumble ? '#ff8e3c' : '#5ef38c');
    ctx.fillStyle = color; ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = topColor; ctx.fillRect(p.x, p.y, p.w, 3);
    ctx.fillStyle = grassColor; ctx.fillRect(p.x, p.y - 3, p.w, 3);
    // Wood-grain texture (vertical streaks)
    if (!isBouncy) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      const seed = Math.floor(p.x * 13 + p.w * 7) % 11;
      for (let i = 0; i < Math.floor(p.w / 14); i++) {
        const gx = p.x + 4 + i * 14 + ((seed + i) % 4);
        ctx.fillRect(gx, p.y + 4, 1, p.h - 6);
      }
    }
    // Moss tufts on top of normal platforms
    if (!isBouncy && !isCrumble && p.w > 80) {
      ctx.fillStyle = '#3a8e4c';
      ctx.fillRect(p.x + 8, p.y - 4, 3, 1);
      ctx.fillRect(p.x + p.w - 14, p.y - 4, 3, 1);
    }
    // crumble indicator: cracks if started crumbling
    if (isCrumble && p.crumbleStartT) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(p.x + 6, p.y + 4, 4, 2);
      ctx.fillRect(p.x + p.w - 14, p.y + 6, 4, 2);
      ctx.fillRect(p.x + p.w / 2 - 2, p.y + 3, 1, p.h - 4);
    }
  }
  // Powerups — jetpack uses pixel-art flame; freeze/shrink have no library match,
  // so we render simple primitives (snowflake cross, downward triangle) instead of emoji.
  for (const p of powerups) {
    const colors = { jetpack: '#ff8e3c', freeze: '#4cc9f0', shrink: '#b055ff' };
    ctx.shadowColor = colors[p.type]; ctx.shadowBlur = 12;
    ctx.fillStyle = colors[p.type]; ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
    ctx.shadowBlur = 0;
    if (p.type === 'jetpack') {
      drawIcon.flame(ctx, p.x, p.y, 16);
    } else if (p.type === 'freeze') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x - 7, p.y - 1, 14, 2);
      ctx.fillRect(p.x - 1, p.y - 7, 2, 14);
      ctx.fillRect(p.x - 5, p.y - 5, 2, 2); ctx.fillRect(p.x + 3, p.y - 5, 2, 2);
      ctx.fillRect(p.x - 5, p.y + 3, 2, 2); ctx.fillRect(p.x + 3, p.y + 3, 2, 2);
    } else { // shrink — downward triangle
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(p.x - 7, p.y - 5); ctx.lineTo(p.x + 7, p.y - 5); ctx.lineTo(p.x, p.y + 7);
      ctx.closePath(); ctx.fill();
    }
  }
  // Lava blobs
  for (const b of blobs) {
    ctx.fillStyle = '#ff3a3a'; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(b.x - 3, b.y - 3, 2, 2);
    ctx.fillRect(b.x + 1, b.y - 3, 2, 2);
  }
  // Treats
  for (const t of treats) {
    ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(t.x - 6, t.y - 6, 12, 12);
    ctx.shadowBlur = 0;
  }
  // Lava: gradient body
  const lgrd = ctx.createLinearGradient(0, lavaY, 0, H);
  lgrd.addColorStop(0, '#ff8e3c'); lgrd.addColorStop(0.3, '#ff3a3a'); lgrd.addColorStop(1, '#7a0a0a');
  ctx.fillStyle = lgrd; ctx.fillRect(-8, lavaY, W + 16, H + 16 - lavaY);
  // Lava swirl streaks
  ctx.fillStyle = 'rgba(255,210,63,0.35)';
  const t = performance.now() / 600;
  for (let i = 0; i < 6; i++) {
    const wx = ((i * 137 + t * 30) % (W + 80)) - 40;
    const wy = lavaY + 14 + Math.sin(t + i) * 4 + i * 6;
    ctx.fillRect(wx, wy, 50, 2);
  }
  // Bubble pops (animated arc + crown)
  for (const bb of lavaBubbles) {
    const k = bb.life / bb.max;
    const r = bb.r * (k < 0.5 ? k * 2 : (1 - k) * 2);
    if (r < 0.5) continue;
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(bb.x, bb.y - r * 0.3, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(bb.x - r * 0.4, bb.y - r * 0.6, r * 0.4, r * 0.3);
  }
  ctx.fillStyle = '#ff8e3c';
  ctx.fillRect(-8, lavaY, W + 16, 4);
  // Surface wave bumps
  ctx.fillStyle = '#ffd23f';
  for (let i = 0; i < 14; i++) {
    const x = (i * 73 + performance.now() / 5) % W;
    ctx.beginPath(); ctx.arc(x, lavaY + 4 + Math.sin(t * 2 + i) * 2, 3, 0, Math.PI * 2); ctx.fill();
  }
  // Pug
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(pug.x - 10, pug.y - 16, 5, 5); ctx.fillRect(pug.x + 5, pug.y - 16, 5, 5);
  const pugColor = hitFlashT > 0 ? '#ffffff' : '#c8854a';
  ctx.fillStyle = pugColor;
  ctx.fillRect(pug.x - pug.w / 2, pug.y - pug.h / 2, pug.w, pug.h);
  ctx.fillStyle = '#1a0d05';
  ctx.fillRect(pug.x - 8, pug.y - 5, 16, 8);
  ctx.fillStyle = '#fff';
  ctx.fillRect(pug.x - 6, pug.y - 4, 3, 3); ctx.fillRect(pug.x + 3, pug.y - 4, 3, 3);
  ctx.fillStyle = '#000';
  ctx.fillRect(pug.x - 5, pug.y - 3, 2, 2); ctx.fillRect(pug.x + 4, pug.y - 3, 2, 2);
  // Jump indicator
  ctx.fillStyle = '#5ef38c';
  for (let i = 0; i < pug.jumpsLeft; i++) ctx.fillRect(pug.x - 6 + i * 8, pug.y - 24, 4, 4);
  // Active powerup HUD chips (bottom-left). `iconDraw` is an optional pixel-art icon drawer.
  let py = H - 30;
  const chip = (label, t, color, iconDraw) => {
    if (t <= 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(12, py - 16, 130, 22);
    ctx.fillStyle = color;
    ctx.fillRect(12, py - 16, 130 * Math.min(1, t / 5), 4);
    if (iconDraw) iconDraw(22, py - 6);
    ctx.fillStyle = '#fff'; ctx.font = "10px 'Press Start 2P', monospace"; ctx.textAlign = 'left';
    ctx.fillText(`${label} ${t.toFixed(1)}s`, 32, py);
    py -= 26;
  };
  chip('JETPACK', jetpackT, '#ff8e3c', (cx, cy) => drawIcon.flame(ctx, cx, cy, 12));
  chip('FREEZE', freezeT, '#4cc9f0', (cx, cy) => {
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(cx - 5, cy - 1, 10, 2); ctx.fillRect(cx - 1, cy - 5, 2, 10);
  });
  chip('SHRINK', shrinkT, '#b055ff', (cx, cy) => {
    ctx.fillStyle = '#b055ff';
    ctx.beginPath(); ctx.moveTo(cx - 5, cy - 4); ctx.lineTo(cx + 5, cy - 4); ctx.lineTo(cx, cy + 5); ctx.closePath(); ctx.fill();
  });
  // Score popups
  ctx.textAlign = 'center';
  ctx.font = "12px 'Press Start 2P', monospace";
  for (const pp of popups) {
    const a = 1 - pp.life / pp.max;
    ctx.globalAlpha = a;
    ctx.fillStyle = '#000'; ctx.fillText(pp.text, pp.x + 1, pp.y + 1);
    ctx.fillStyle = pp.color;
    ctx.fillText(pp.text, pp.x, pp.y);
    ctx.globalAlpha = 1;
  }
  // Milestone banner
  if (banner) {
    const a = banner.life < 0.3 ? banner.life / 0.3 : (banner.life > banner.max - 0.4 ? (banner.max - banner.life) / 0.4 : 1);
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W / 2 - 180, H * 0.25 - 24, 360, 48);
    ctx.fillStyle = '#5ef38c';
    ctx.fillRect(W / 2 - 180, H * 0.25 - 24, 360, 3);
    ctx.fillRect(W / 2 - 180, H * 0.25 + 21, 360, 3);
    ctx.fillStyle = '#ffd23f';
    ctx.font = "18px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(banner.text, W / 2, H * 0.25 + 6);
    ctx.globalAlpha = 1;
  }
  // Hit flash overlay (red tint)
  if (hitFlashT > 0) {
    ctx.fillStyle = `rgba(255,58,58,${Math.min(0.6, hitFlashT * 2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function updateHud() {
  document.getElementById('hud-height').textContent = height + 'm';
  document.getElementById('hud-score').textContent = score;
  const best = loadBest('floor-lava');
  document.getElementById('hud-best').textContent = (best ? best.height : 0) + 'm';
}

function die() {
  running = false;
  sfx.sweep(440, 110, 'sawtooth', 0.6, 0.25);
  document.getElementById('end-height').textContent = maxHeight + 'm';
  document.getElementById('end-treats').textContent = treatsGot;
  const { isNewBest, current } = submitRun('floor-lava', { score: maxHeight * 10 + treatsGot * 50, height: maxHeight });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { height: maxHeight };
    bestEl.innerHTML = `Best: <b>${b.height}m</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
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
      showTip('A/D move · SPACE jump (double-jump midair) · grab treats, dodge lava', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
