// PUG CAFÉ PANIC — order management with chaotic pug staff.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { iconSvg } from '../../src/shared/icons.js';

// Helper: prefer pixel-art SVG icon when ingredient has an iconName; fall back to emoji string
function _ingIcon(ing) {
  return ing.iconName && iconSvg[ing.iconName] ? iconSvg[ing.iconName](28) : ing.icon;
}

const sfx = createSfx({ storageKey: 'cafe:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

// ----- Visual polish: decorations + staff animation + popups + shake ------
const VISUAL_CSS = `
.cafe-bg { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
  background:
    repeating-linear-gradient(45deg, rgba(255,210,63,0.04) 0 14px, transparent 14px 28px),
    repeating-linear-gradient(-45deg, rgba(76,201,240,0.04) 0 14px, transparent 14px 28px),
    radial-gradient(ellipse at 30% 80%, #1a0f2e 0%, #0a0716 70%); }
.cafe-bg__floor { position: absolute; bottom: 0; left: 0; right: 0; height: 38%;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.5)),
    repeating-conic-gradient(from 0deg, #2a1818 0deg 90deg, #1a1010 90deg 180deg) 0 0/48px 48px;
  border-top: 2px solid rgba(255,210,63,0.18); box-shadow: 0 -6px 18px rgba(0,0,0,0.6) inset; }
.cafe-bg__neon { position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
  font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.18em;
  color: #ff8ac8; text-shadow: 0 0 8px #ff3aa1, 0 0 18px #ff3aa1, 0 0 28px #ff3aa1;
  animation: cafe-neon 2.6s ease-in-out infinite; pointer-events: none; }
@keyframes cafe-neon { 0%,90%,100% { opacity: 1; } 92% { opacity: 0.45; } 94% { opacity: 1; } 96% { opacity: 0.6; } }
.cafe-bg__plant { position: absolute; bottom: 32%; font-size: 38px; opacity: 0.85;
  text-shadow: 0 4px 8px rgba(0,0,0,0.6); animation: cafe-sway 4s ease-in-out infinite; }
@keyframes cafe-sway { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
.cafe-bg__plant--l { left: 14px; }
.cafe-bg__plant--r { right: 14px; }
.cafe-bg__hang { position: absolute; top: 0; width: 2px; background: #4a3a1a; }
.cafe-bg__hang::after { content: ''; position: absolute; bottom: -10px; left: -10px; width: 22px; height: 14px;
  border-radius: 0 0 12px 12px; background: radial-gradient(ellipse at top, #ffd23f 0%, #c08a14 70%);
  box-shadow: 0 0 16px rgba(255,210,63,0.55); }
.cafe-bg__hang--1 { left: 18%; height: 60px; } .cafe-bg__hang--2 { left: 46%; height: 90px; } .cafe-bg__hang--3 { left: 76%; height: 50px; }
.cafe-staff { position: fixed; bottom: 8px; left: 10px; z-index: 2; pointer-events: none;
  font-size: 30px; line-height: 1; transform-origin: 50% 100%;
  animation: cafe-staff-idle 1.6s ease-in-out infinite; }
@keyframes cafe-staff-idle { 0%,100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-3px) scaleY(0.96); } }
.cafe-staff__bub { position: absolute; left: 38px; top: -4px; background: rgba(255,255,255,0.92);
  color: #0a0716; font-family: var(--font-display); font-size: 0.45rem;
  padding: 3px 5px; border-radius: 4px; opacity: 0; transition: opacity 0.3s; white-space: nowrap; }
.cafe-staff__bub.is-active { opacity: 1; }
.cafe-popups { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
.cafe-popup { position: absolute; font-family: var(--font-display); font-size: 0.85rem;
  letter-spacing: 0.05em; text-shadow: 0 2px 0 #000, 0 0 12px currentColor;
  animation: cafe-pop-fly 1.1s cubic-bezier(0.2,0.7,0.3,1) forwards; }
@keyframes cafe-pop-fly { 0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
  20% { transform: translate(-50%,-90%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%,-200%) scale(1); opacity: 0; } }
.cafe-flash { animation: cafe-chip-flash 0.5s ease-out; }
@keyframes cafe-chip-flash { 0% { background: rgba(255,210,63,0.65); transform: scale(1.06); }
  100% { background: transparent; transform: scale(1); } }
.cafe-shake { animation: cafe-shake 0.32s ease-out; }
@keyframes cafe-shake { 0%,100% { transform: translate(0,0); } 20% { transform: translate(-5px, 3px); }
  40% { transform: translate(5px, -3px); } 60% { transform: translate(-4px, -2px); } 80% { transform: translate(3px, 4px); } }
.hud-card.is-critical { animation: cafe-hud-pulse 0.6s ease-in-out infinite; }
@keyframes cafe-hud-pulse { 0%,100% { box-shadow: 0 0 0 rgba(255,58,58,0); }
  50% { box-shadow: 0 0 28px rgba(255,58,58,0.7); } }
.station .placemat { position: absolute; inset: auto 0 -6px 0; height: 4px;
  background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent); opacity: 0.5; }
`;
const _s = document.createElement('style'); _s.textContent = VISUAL_CSS; document.head.appendChild(_s);

// Decorative background
const _bg = document.createElement('div');
_bg.className = 'cafe-bg';
_bg.innerHTML = `
  <div class="cafe-bg__floor"></div>
  <div class="cafe-bg__neon">★ PUG CAFÉ ★</div>
  <div class="cafe-bg__hang cafe-bg__hang--1"></div>
  <div class="cafe-bg__hang cafe-bg__hang--2"></div>
  <div class="cafe-bg__hang cafe-bg__hang--3"></div>
  <div class="cafe-bg__plant cafe-bg__plant--l">🪴</div>
  <div class="cafe-bg__plant cafe-bg__plant--r">🌵</div>
`;
document.body.appendChild(_bg);
const _popups = document.createElement('div'); _popups.className = 'cafe-popups'; document.body.appendChild(_popups);
const _staff = document.createElement('div'); _staff.className = 'cafe-staff';
_staff.innerHTML = `<span style="display:inline-block;vertical-align:middle">${iconSvg.pugFace(38)}</span><span class="cafe-staff__bub">bork!</span>`;
document.body.appendChild(_staff);
const _staffBub = _staff.querySelector('.cafe-staff__bub');
const _staffPhrases = ['bork!', 'chef!', 'snrk', 'order up!', 'woof', 'zzz…', 'OK!'];
setInterval(() => {
  if (!running) return;
  _staffBub.textContent = _staffPhrases[Math.floor(Math.random() * _staffPhrases.length)];
  _staffBub.classList.add('is-active');
  setTimeout(() => _staffBub.classList.remove('is-active'), 1400);
}, 3400);

function popup(x, y, text, color) {
  const div = document.createElement('div');
  div.className = 'cafe-popup';
  div.textContent = text;
  div.style.left = x + 'px'; div.style.top = y + 'px';
  div.style.color = color || '#5ef38c';
  _popups.appendChild(div);
  setTimeout(() => div.remove(), 1100);
}
function flashChip(stationEl) {
  if (!stationEl) return;
  stationEl.classList.remove('cafe-flash');
  void stationEl.offsetWidth;
  stationEl.classList.add('cafe-flash');
}
function screenShake() {
  document.body.classList.remove('cafe-shake');
  void document.body.offsetWidth;
  document.body.classList.add('cafe-shake');
  setTimeout(() => document.body.classList.remove('cafe-shake'), 360);
}

const INGREDIENTS = [
  { id: 'bacon', icon: '🥓', iconName: 'bacon',  name: 'Bacon' },
  { id: 'cake',  icon: '🧁', iconName: 'cake',   name: 'Pupcake' },
  { id: 'slime', icon: '🟢',                       name: 'Slime' },        // no library match — keep unicode dot
  { id: 'noodle', icon: '🍜',                      name: 'Glow Noodle' },  // no match
  { id: 'fish',  icon: '🐟',                       name: 'Fish' },         // no match
  { id: 'milk',  icon: '🥛', iconName: 'milk',    name: 'Milk' },
  { id: 'bone',  icon: '🦴', iconName: 'bone',    name: 'Bone' },
  { id: 'cheese', icon: '🧀', iconName: 'cheese', name: 'Cheese' },
  { id: 'pickle', icon: '🥒',                      name: 'Pickle' },       // no match
  { id: 'donut', icon: '🍩', iconName: 'biscuit', name: 'Donut' },         // closest round-pastry match
];

const RECIPES = [
  { name: 'Triple Bacon Pupcake', items: ['bacon', 'bacon', 'cake'], pay: 30 },
  { name: 'Slime Smoothie',       items: ['slime', 'milk'], pay: 18 },
  { name: 'Glowing Noodles',      items: ['noodle', 'cheese'], pay: 22 },
  { name: 'Fish Bone Stew',       items: ['fish', 'bone'], pay: 20 },
  { name: 'Pickle Donut',         items: ['pickle', 'donut'], pay: 16 },
  { name: 'Bacon Cheesebone',     items: ['bacon', 'cheese', 'bone'], pay: 32 },
  { name: 'Triple Slime',         items: ['slime', 'slime', 'slime'], pay: 38 },
  { name: 'Pup Pizza',            items: ['cheese', 'bacon', 'donut'], pay: 40 },
  { name: 'Fish Smoothie',        items: ['fish', 'milk'], pay: 18 },
  { name: 'Glow Donut Stack',     items: ['noodle', 'donut', 'cake'], pay: 42 },
  { name: 'Bacon Pickle Slime',   items: ['bacon', 'pickle', 'slime'], pay: 36 },
  { name: 'Cheese Donut Bake',    items: ['cheese', 'donut'], pay: 24 },
  { name: 'Quad Bacon Madness',   items: ['bacon', 'bacon', 'bacon', 'bacon'], pay: 60 },
  { name: 'Fish Pickle Latte',    items: ['fish', 'pickle', 'milk'], pay: 30 },
  { name: 'Bone Cheese Donut',    items: ['bone', 'cheese', 'donut'], pay: 38 },
  { name: 'Noodle Bone Soup',     items: ['noodle', 'bone'], pay: 22 },
  { name: 'Mega Pup Special',     items: ['cake', 'cake', 'bacon', 'donut'], pay: 70 },
];

const STAFF_EVENTS = [
  'A pug ATE your bacon.',
  'A pug fell asleep on the milk.',
  'A pug chased a pigeon out the window.',
  'A pug knocked over the noodles.',
  'A pug snored. Order delayed.',
  'A pug sat in the cake.',
  'A pug barked at the door for 20 seconds.',
  'A pug brought you a stick instead.',
];

let orders, bench, money, served, lives, spawnT, eventT, running;
let comboT = 0, comboCount = 0; // serve combo within window
function reset() {
  orders = []; bench = []; money = 0; served = 0; lives = 3;
  spawnT = 1.5; eventT = 5;
  comboT = 0; comboCount = 0;
}

function spawnOrder() {
  const r = RECIPES[Math.floor(Math.random() * RECIPES.length)];
  orders.push({
    recipe: r,
    items: r.items.map((i) => ({ id: i, done: false })),
    time: 22,
    maxTime: 22,
  });
  renderOrders();
}

function renderKitchen() {
  const k = document.getElementById('kitchen');
  k.innerHTML = '';
  for (const ing of INGREDIENTS) {
    const el = document.createElement('div');
    el.className = 'station';
    el.innerHTML = `<div class="station__icon">${_ingIcon(ing)}</div><div class="station__name">${ing.name}</div>`;
    el.style.position = 'relative';
    el.addEventListener('click', () => grab(ing, el));
    const mat = document.createElement('div'); mat.className = 'placemat'; el.appendChild(mat);
    k.appendChild(el);
  }
}

function renderOrders() {
  const el = document.getElementById('orders');
  el.innerHTML = '';
  if (orders.length === 0) {
    el.innerHTML = '<span style="color:var(--muted);font-size:0.5rem;padding:6px;">No orders yet…</span>';
    return;
  }
  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const div = document.createElement('div');
    let cls = 'order';
    const k = o.time / o.maxTime;
    if (k < 0.3) cls += ' crit';
    else if (k < 0.6) cls += ' warn';
    div.className = cls;
    div.innerHTML = `
      <h4>${o.recipe.name}</h4>
      <ul>${o.items.map((it) => {
        const ing = INGREDIENTS.find((g) => g.id === it.id);
        const iconHtml = ing.iconName && iconSvg[ing.iconName] ? iconSvg[ing.iconName](14) : ing.icon;
        return `<li class="${it.done ? 'done' : ''}"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;">${iconHtml}</span><span>${ing.name}</span></li>`;
      }).join('')}</ul>
      <div class="order__timer"><div class="order__timer-fill" style="width:${k * 100}%;background:${k < 0.3 ? '#ff3a3a' : (k < 0.6 ? '#ffd23f' : '#5ef38c')}"></div></div>
      <button class="serve-btn" data-idx="${i}" style="margin-top:6px;width:100%;">SERVE $${o.recipe.pay}</button>
    `;
    el.appendChild(div);
  }
  el.querySelectorAll('.serve-btn').forEach((b) => b.addEventListener('click', () => serve(+b.dataset.idx)));
}

function renderBench() {
  const b = document.getElementById('bench');
  b.innerHTML = '';
  if (bench.length === 0) {
    b.innerHTML = '<span style="color:var(--muted);font-size:0.5rem;">empty bench</span>';
    return;
  }
  for (let i = 0; i < bench.length; i++) {
    const ing = INGREDIENTS.find((g) => g.id === bench[i]);
    const el = document.createElement('div');
    el.className = 'bench__held';
    const iconHtml = ing.iconName && iconSvg[ing.iconName] ? iconSvg[ing.iconName](24) : ing.icon;
    el.innerHTML = `<div class="station__icon">${iconHtml}</div><div class="station__name">${ing.name}</div>`;
    el.addEventListener('click', () => { bench.splice(i, 1); renderBench(); });
    b.appendChild(el);
  }
}

function grab(ing, srcEl) {
  // Bench capacity grows with served count (4 base + 1 per 10 served, max 8)
  const cap = Math.min(8, 4 + Math.floor(served / 10));
  if (bench.length >= cap) { showEvent(`Bench full (${cap})!`); return; }
  bench.push(ing.id);
  sfx.tone(660, 'triangle', 0.06, 0.18);
  if (srcEl) flashChip(srcEl);
  renderBench();
}

function serve(idx) {
  const o = orders[idx];
  if (!o) return;
  // Check that bench contains all needed items
  const need = o.recipe.items.slice();
  const benchCopy = bench.slice();
  for (const n of need) {
    const i = benchCopy.indexOf(n);
    if (i === -1) {
      showEvent('Missing ingredient!');
      sfx.tone(165, 'sawtooth', 0.1, 0.18);
      popup(window.innerWidth / 2, window.innerHeight / 2, 'MISS', '#ff3a3a');
      return;
    }
    benchCopy.splice(i, 1);
  }
  // Success
  bench = benchCopy;
  // Combo: serves within 5s of each other stack
  if (comboT > 0) comboCount++; else comboCount = 1;
  comboT = 5;
  const comboBonus = comboCount > 1 ? (comboCount - 1) * 5 : 0;
  const pay = o.recipe.pay + comboBonus;
  money += pay;
  served++;
  orders.splice(idx, 1);
  sfx.arp([523, 659, 784], 'triangle', 0.07, 0.22, 0.2);
  // Popup near the served order's button (approx center of orders bar)
  const ordersEl = document.getElementById('orders');
  const rect = ordersEl ? ordersEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: 100, width: 0, height: 0 };
  popup(rect.left + rect.width / 2, rect.top + rect.height / 2, `+$${pay}${comboCount > 1 ? ` x${comboCount}` : ''}`, comboCount > 1 ? '#ff3aa1' : '#5ef38c');
  // Flash all kitchen chips when comboing
  if (comboCount > 1) {
    document.querySelectorAll('#kitchen .station').forEach((el, i) => setTimeout(() => flashChip(el), i * 20));
  }
  // Equipment upgrade milestones
  if (served === 10) showEvent('🪑 BENCH UPGRADED! +1 slot');
  if (served === 20) showEvent('🪑 BENCH UPGRADED! +1 slot');
  if (served === 30) showEvent('🪑 BENCH UPGRADED! +1 slot');
  if (served === 40) showEvent('🪑 BENCH UPGRADED! +1 slot (max 8)');
  if (served % 25 === 0 && served > 0) {
    money += 50; showEvent(`💰 $50 BONUS for ${served} served!`);
    popup(window.innerWidth / 2, window.innerHeight / 2, '+$50 BONUS', '#ffd23f');
  }
  renderBench(); renderOrders();
  updateHud();
}

function tick(dt) {
  if (!running) return;
  spawnT -= dt;
  if (spawnT <= 0) { spawnOrder(); spawnT = Math.max(1.6, 4 - served * 0.05); }
  for (let i = orders.length - 1; i >= 0; i--) {
    const o = orders[i];
    o.time -= dt;
    if (o.time <= 0) {
      orders.splice(i, 1);
      lives--;
      sfx.sweep(220, 110, 'sawtooth', 0.3, 0.22);
      screenShake();
      popup(window.innerWidth / 2, window.innerHeight / 3, 'ANGRY!', '#ff3a3a');
      if (lives <= 0) return end();
      updateHud();
    }
  }
  // Combo decay
  if (comboT > 0) { comboT -= dt; if (comboT <= 0) comboCount = 0; }
  eventT -= dt;
  if (eventT <= 0) {
    eventT = 8 + Math.random() * 6;
    chaosEvent();
  }
  renderOrders();
}

function chaosEvent() {
  const which = Math.floor(Math.random() * 4);
  let msg;
  if (which === 0 && bench.length > 0) {
    bench.splice(Math.floor(Math.random() * bench.length), 1);
    msg = STAFF_EVENTS[0];
    renderBench();
  } else if (which === 1) {
    msg = STAFF_EVENTS[1 + Math.floor(Math.random() * (STAFF_EVENTS.length - 1))];
    // shorten oldest order time
    if (orders.length > 0) orders[0].time = Math.max(2, orders[0].time - 3);
  } else if (which === 2) {
    msg = 'A pigeon stole a tip. -$8';
    money = Math.max(0, money - 8);
  } else {
    msg = 'A regular tipped extra! +$15';
    money += 15;
  }
  showEvent(msg);
  updateHud();
}

function showEvent(text) {
  const c = document.getElementById('staff-events');
  const div = document.createElement('div');
  div.className = 'staff__event';
  div.textContent = text;
  c.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function updateHud() {
  document.getElementById('hud-money').textContent = '$' + money;
  document.getElementById('hud-served').textContent = served;
  document.getElementById('hud-lives').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
  const best = loadBest('pug-cafe');
  document.getElementById('hud-best').textContent = best ? '$' + best.money : '$0';
  const hudCard = document.querySelector('#hud .hud-card');
  if (hudCard) hudCard.classList.toggle('is-critical', lives <= 1);
}

function end() {
  running = false;
  sfx.sweep(330, 80, 'sawtooth', 0.5, 0.22);
  document.getElementById('end-money').textContent = '$' + money;
  document.getElementById('end-served').textContent = served;
  const { isNewBest, current } = submitRun('pug-cafe', { score: money, money, served });
  const bestEl = document.getElementById('end-best');
  if (bestEl) {
    const b = current || { money, served };
    bestEl.innerHTML = `Best: <b>$${b.money}</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
  }
  document.getElementById('hud').hidden = true;
  document.getElementById('cafe').hidden = true;
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
  document.getElementById('cafe').hidden = false;
  renderKitchen(); renderBench(); renderOrders();
  updateHud();
  sfx.resume();
}

let lastT = performance.now();
(function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now; tick(dt);
  requestAnimationFrame(loop);
})(performance.now());

// Tutorial tip — shows briefly when the game starts (every match)
const _startOv = document.getElementById('overlay');
if (_startOv) {
  const _showOnHide = () => {
    if (_startOv.classList.contains('is-hidden') || _startOv.hidden) {
      showTip('Tap an ingredient → tap SERVE on the right order before timer ends', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
