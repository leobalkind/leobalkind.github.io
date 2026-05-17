// PUG WHISPERER — original mood-matching game.
// Pugs appear in 3 slots with random moods. Tap an action button to apply
// the matching action. Correct = score + combo, wrong = lose a life,
// timer-out = lose a life. 3 lives total. Combo multiplies score.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const endOverlay = document.getElementById('end-overlay');
const actionBar = document.getElementById('action-bar');
const hudEl = document.getElementById('hud');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('end-restart');
const muteBtn = document.getElementById('mute-btn');

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize); resize();

const MOODS = [
  { id: 'hungry', icon: '🍖', action: 'feed', color: '#ff8e3c' },
  { id: 'sleepy', icon: '💤', action: 'nap', color: '#b055ff' },
  { id: 'playful', icon: '🎾', action: 'play', color: '#5ef38c' },
  { id: 'lonely', icon: '✋', action: 'pet', color: '#ff3aa1' },
  { id: 'snacky', icon: '🦴', action: 'treat', color: '#ffd23f' },
];

let pugs = [];        // [{x, y, mood, patience, t, state}]
let score = 0, combo = 1, maxCombo = 1, helped = 0, lives = 3;
let running = false, muted = localStorage.getItem('whisperer:muted') === '1';
let spawnCooldown = 1.0;
let actx = null;

function audio() { if (actx) return actx; try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} return actx; }
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
function sfxCorrect() { sfx(880, 'triangle', 0.1, 0.22); setTimeout(() => sfx(1320, 'triangle', 0.1, 0.18), 50); }
function sfxWrong() { sfx(165, 'sawtooth', 0.2, 0.18); }
function sfxAppear() { sfx(440, 'sine', 0.05, 0.08); }
function sfxLose() { sfx(220, 'sawtooth', 0.6, 0.3); }

const applyMuteUI = () => {
  if (!muteBtn) return;
  muteBtn.textContent = muted ? '🔇' : '🔊';
  muteBtn.classList.toggle('muted', muted);
};
applyMuteUI();
muteBtn?.addEventListener('click', () => {
  muted = !muted; localStorage.setItem('whisperer:muted', muted ? '1' : '0'); applyMuteUI();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    muted = !muted; localStorage.setItem('whisperer:muted', muted ? '1' : '0'); applyMuteUI();
  }
  // Number keys 1-5 = action shortcuts
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= 5 && running) {
    const acts = ['feed','nap','play','pet','treat'];
    handleAction(acts[num - 1]);
  }
});

function reset() {
  pugs = []; score = 0; combo = 1; maxCombo = 1; helped = 0; lives = 3;
  spawnCooldown = 0.8;
}

function spawnPug() {
  // Up to 3 pugs at once. Slot positions: 1/4 W, 1/2 W, 3/4 W
  if (pugs.filter((p) => p.state === 'active').length >= 3) return;
  const slot = Math.floor(Math.random() * 3);
  // If slot already has an active pug, find empty one
  const used = pugs.filter((p) => p.state === 'active').map((p) => p.slot);
  const avail = [0, 1, 2].filter((s) => !used.includes(s));
  if (avail.length === 0) return;
  const chosen = avail[Math.floor(Math.random() * avail.length)];
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  const x = W * (chosen + 1) / 4;
  const y = H * 0.42;
  // Patience scales down with combo (harder as you go)
  const patienceBase = Math.max(2.2, 4.5 - helped * 0.05);
  pugs.push({
    slot: chosen, x, y, mood,
    patience: patienceBase, t: 0,
    state: 'active', fadeT: 0, born: performance.now(),
  });
  sfxAppear();
}

function handleAction(actId) {
  // Apply to oldest active pug matching mood, else oldest active pug → wrong
  const active = pugs.filter((p) => p.state === 'active').sort((a, b) => a.born - b.born);
  if (active.length === 0) return;
  const p = active[0];
  const correct = p.mood.action === actId;
  if (correct) {
    const pts = 100 * combo;
    score += pts;
    helped++;
    combo = Math.min(99, combo + 1);
    if (combo > maxCombo) maxCombo = combo;
    p.state = 'correct'; p.fadeT = 0.5;
    sfxCorrect();
    flashButton(actId, 'correct');
  } else {
    score = Math.max(0, score - 20);
    combo = 1;
    p.state = 'wrong'; p.fadeT = 0.5;
    lives--;
    sfxWrong();
    flashButton(actId, 'wrong');
    if (lives <= 0) return end();
  }
  updateHud();
}

function flashButton(actId, kind) {
  const btn = document.querySelector(`.action-btn[data-act="${actId}"]`);
  if (!btn) return;
  btn.classList.add(kind);
  setTimeout(() => btn.classList.remove(kind), 320);
}

function tick(dt) {
  if (!running) return;
  spawnCooldown -= dt;
  // Spawn cadence speeds up with helped count
  const minSpawn = Math.max(0.7, 1.6 - helped * 0.04);
  if (spawnCooldown <= 0) {
    spawnPug();
    spawnCooldown = minSpawn + Math.random() * 0.6;
  }
  for (let i = pugs.length - 1; i >= 0; i--) {
    const p = pugs[i];
    p.t += dt;
    if (p.state === 'active') {
      if (p.t >= p.patience) {
        // Timeout = wrong
        p.state = 'wrong'; p.fadeT = 0.5;
        lives--;
        combo = 1;
        sfxWrong();
        if (lives <= 0) return end();
        updateHud();
      }
    } else {
      p.fadeT -= dt;
      if (p.fadeT <= 0) pugs.splice(i, 1);
    }
  }
}

function end() {
  running = false;
  sfxLose();
  document.getElementById('end-score').textContent = score;
  document.getElementById('end-combo').textContent = `x${maxCombo}`;
  document.getElementById('end-helped').textContent = helped;
  const { isNewBest, current } = submitRun('pug-whisperer', { score, maxCombo, helped });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { score, maxCombo, helped };
    bestEl.innerHTML = `Best: <b>${b.score}</b> (combo x${b.maxCombo})${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  hudEl.hidden = true;
  actionBar.hidden = true;
  endOverlay.hidden = false; endOverlay.classList.remove('is-hidden');
}

function updateHud() {
  document.getElementById('hud-score').textContent = score;
  document.getElementById('hud-combo').textContent = `x${combo}`;
  const best = loadBest('pug-whisperer');
  document.getElementById('hud-best').textContent = best ? best.score : 0;
  const heartsArr = [];
  for (let i = 0; i < 3; i++) heartsArr.push(i < lives ? '❤️' : '🖤');
  document.getElementById('hud-lives').textContent = heartsArr.join('');
}

// === Render ===
function drawPug(p) {
  const x = p.x, y = p.y;
  const k = Math.min(1, p.t / p.patience);
  // Pug body
  const baseR = 48;
  let scale = 1;
  let alpha = 1;
  if (p.state === 'correct') {
    const f = 1 - (p.fadeT / 0.5);
    scale = 1 + f * 0.6;
    alpha = 1 - f;
  } else if (p.state === 'wrong') {
    const f = 1 - (p.fadeT / 0.5);
    alpha = 1 - f;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, baseR + 8, baseR * 0.8, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(-baseR + 4, -baseR - 6, 18, 18);
  ctx.fillRect(baseR - 22, -baseR - 6, 18, 18);
  // head
  ctx.fillStyle = '#e0a566';
  ctx.beginPath(); ctx.arc(0, 0, baseR, 0, Math.PI * 2); ctx.fill();
  // body bottom
  ctx.fillStyle = '#c8854a';
  ctx.fillRect(-baseR, 0, baseR * 2, baseR);
  // mask
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.ellipse(0, 8, baseR * 0.78, baseR * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  // eyes (state-aware)
  ctx.fillStyle = '#fff';
  ctx.fillRect(-baseR * 0.42, -baseR * 0.15, 8, 8);
  ctx.fillRect(baseR * 0.18, -baseR * 0.15, 8, 8);
  ctx.fillStyle = '#000';
  ctx.fillRect(-baseR * 0.42 + 2, -baseR * 0.15 + 2, 4, 4);
  ctx.fillRect(baseR * 0.18 + 2, -baseR * 0.15 + 2, 4, 4);
  // snoot
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath(); ctx.arc(0, baseR * 0.4, 9, 0, Math.PI * 2); ctx.fill();
  // expression marks: correct = smile up; wrong = X mouth; active = neutral wobble
  if (p.state === 'correct') {
    ctx.strokeStyle = '#5ef38c'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, baseR * 0.4 + 6, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (p.state === 'wrong') {
    ctx.strokeStyle = '#ff3a3a'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, baseR * 0.5);
    ctx.lineTo(8, baseR * 0.5 + 8);
    ctx.moveTo(8, baseR * 0.5);
    ctx.lineTo(-8, baseR * 0.5 + 8);
    ctx.stroke();
  }
  ctx.restore();

  if (p.state !== 'active') return;
  // Mood bubble above
  ctx.font = "40px serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 28, y - baseR - 70, 56, 56);
  ctx.strokeStyle = p.mood.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 28, y - baseR - 70, 56, 56);
  ctx.fillStyle = '#fff';
  ctx.fillText(p.mood.icon, x, y - baseR - 30);
  // patience bar
  const bw = 80;
  const bx = x - bw / 2;
  const by = y + baseR + 24;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(bx, by, bw, 6);
  const remaining = 1 - k;
  let barColor = '#5ef38c';
  if (remaining < 0.5) barColor = '#ffd23f';
  if (remaining < 0.25) barColor = '#ff3a3a';
  ctx.fillStyle = barColor;
  ctx.fillRect(bx, by, bw * remaining, 6);
}

function render() {
  // BG
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1a0f2e');
  grd.addColorStop(1, '#0a0716');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  // floor line
  ctx.fillStyle = '#3a2a5a';
  ctx.fillRect(0, H * 0.55, W, 2);
  // pug positions are based on current W after resize
  for (const p of pugs) {
    p.x = W * (p.slot + 1) / 4;
    p.y = H * 0.42;
    drawPug(p);
  }
  // big combo text
  if (combo > 2 && running) {
    ctx.font = "bold 22px 'Press Start 2P', monospace";
    ctx.fillStyle = '#ffd23f';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 12;
    ctx.fillText(`COMBO x${combo}`, W / 2, 50);
    ctx.shadowBlur = 0;
  }
}

// Input
actionBar.addEventListener('click', (e) => {
  const t = e.target.closest('.action-btn');
  if (!t) return;
  handleAction(t.dataset.act);
});

// Start / restart
function start() {
  reset();
  running = true;
  overlay.hidden = true; overlay.classList.add('is-hidden');
  endOverlay.hidden = true; endOverlay.classList.add('is-hidden');
  actionBar.hidden = false;
  hudEl.hidden = false;
  updateHud();
  audio()?.resume?.();
}
startBtn.addEventListener('click', start);
restartBtn.addEventListener('click', start);

document.getElementById('end-share')?.addEventListener('click', async () => {
  const s = document.getElementById('end-score')?.textContent || '0';
  const c = document.getElementById('end-combo')?.textContent || 'x1';
  const text = `🐶 PUG WHISPERER — Score ${s}, max combo ${c}! Beat me at https://leobalkind.github.io/web-games/`;
  const btn = document.getElementById('end-share');
  try {
    if (navigator.share) await navigator.share({ title: 'PUG WHISPERER', text, url: 'https://leobalkind.github.io/web-games/' });
    else { await navigator.clipboard.writeText(text); btn.textContent = '✓ COPIED!'; setTimeout(() => btn.textContent = '📋 SHARE', 2000); }
  } catch { btn.textContent = '⚠ FAILED'; setTimeout(() => btn.textContent = '📋 SHARE', 2000); }
});

// Main loop
let lastT = performance.now();
function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now;
  tick(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Show best on start
const best = loadBest('pug-whisperer');
if (best) {
  const sub = overlay.querySelector('.overlay__sub');
  if (sub) {
    const div = document.createElement('div');
    div.style.cssText = 'margin:10px 0 0;color:var(--neon-yellow);font-size:0.6rem;letter-spacing:0.05em;';
    div.innerHTML = `★ Personal best: <b>${best.score}</b> (combo x${best.maxCombo}, ${best.helped} helped)`;
    sub.appendChild(div);
  }
}
