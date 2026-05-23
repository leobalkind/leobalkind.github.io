// PUG MUTATION LAB — combine 3 ingredients to discover pug species.
// Recipes are deterministic by ingredient set (sorted). Some are pre-named
// legendaries, others are procedurally generated cursed pugs.
import { createSfx } from '../../src/shared/miniSfx.js';
import { showTip } from '../../src/shared/tutorialTip.js';
import { iconSvg } from '../../src/shared/icons.js';

// Helper: prefer pixel-art SVG icon for ingredients that map to the library
function _labIcon(ing, size) {
  return ing.iconName && iconSvg[ing.iconName] ? iconSvg[ing.iconName](size || 24) : ing.icon;
}

const sfx = createSfx({ storageKey: 'mutlab:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

// ----- Visual polish: bubbling beaker, glow, sparkles, table texture -----
const LAB_CSS = `
.lab-bg { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(76,201,240,0.08), transparent 60%),
    radial-gradient(ellipse at 20% 100%, rgba(255,58,161,0.08), transparent 60%),
    #0a0716; }
.lab-bg__table { position: absolute; left: 0; right: 0; bottom: 0; height: 38%;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.55)),
    repeating-linear-gradient(0deg, #2a2018 0 2px, #1f160f 2px 6px),
    repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 20px, transparent 20px 40px);
  border-top: 2px solid rgba(255,210,63,0.22); }
.lab-bg__shelf { position: absolute; left: 8px; right: 8px; top: 6px; padding: 4px 8px;
  background: rgba(20,12,30,0.65); border: 1px solid rgba(255,210,63,0.25);
  border-radius: 6px; display: flex; gap: 6px; overflow-x: auto; max-width: calc(100% - 16px); }
.lab-bg__shelf__pug { font-size: 18px; opacity: 0.7; filter: drop-shadow(0 2px 4px #000);
  animation: lab-shelf-bob 3s ease-in-out infinite; }
.lab-bg__shelf__pug:nth-child(2n) { animation-delay: 0.4s; }
.lab-bg__shelf__pug:nth-child(3n) { animation-delay: 0.8s; }
@keyframes lab-shelf-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.lab-beaker { position: relative; overflow: visible !important; }
.lab-beaker.is-ready { box-shadow: 0 0 36px rgba(255,210,63,0.7), inset 0 0 24px rgba(255,210,63,0.18) !important;
  border-color: var(--neon-yellow) !important; }
.lab-beaker.is-ready h3 { color: var(--neon-yellow) !important; text-shadow: 0 0 12px var(--neon-yellow); }
.lab-bubble { position: absolute; bottom: 14px; left: 50%; width: 6px; height: 6px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ffffff, #4cc9f0 70%);
  opacity: 0; pointer-events: none;
  animation: lab-bubble-rise 1.8s ease-in infinite; }
@keyframes lab-bubble-rise { 0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; }
  20% { opacity: 0.9; } 100% { transform: translate(calc(-50% + var(--dx, 0px)), -90px) scale(1.4); opacity: 0; } }
.lab-spark { position: fixed; width: 6px; height: 6px; border-radius: 50%; pointer-events: none; z-index: 1000;
  box-shadow: 0 0 12px currentColor; animation: lab-spark-fly 1s ease-out forwards; }
@keyframes lab-spark-fly { 0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx,0), var(--ty,0)) scale(0.2); opacity: 0; } }
.lab-shake { animation: lab-shake 0.4s ease-out; }
@keyframes lab-shake { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-6px, 4px); }
  50% { transform: translate(6px, -4px); } 75% { transform: translate(-4px, -3px); } }
.lab-result { transition: transform 0.2s, box-shadow 0.2s; }
.lab-result.legendary { animation: lab-leg-pulse 1.4s ease-in-out infinite; }
@keyframes lab-leg-pulse { 0%,100% { box-shadow: 0 0 40px var(--neon-yellow); }
  50% { box-shadow: 0 0 80px var(--neon-yellow), 0 0 120px rgba(255,210,63,0.5); } }
.hud-card.is-legendary { animation: lab-hud-leg 0.8s ease-out; }
@keyframes lab-hud-leg { 0% { box-shadow: 0 0 0 var(--neon-yellow); }
  50% { box-shadow: 0 0 40px var(--neon-yellow); } 100% { box-shadow: 0 0 0 var(--neon-yellow); } }
`;
const _lstyle = document.createElement('style'); _lstyle.textContent = LAB_CSS; document.head.appendChild(_lstyle);
const _lbg = document.createElement('div');
_lbg.className = 'lab-bg';
_lbg.innerHTML = `<div class="lab-bg__shelf" id="lab-shelf-bg"></div><div class="lab-bg__table"></div>`;
document.body.appendChild(_lbg);
const _shelfBg = _lbg.querySelector('#lab-shelf-bg');

function refreshShelfBg() {
  if (!_shelfBg) return;
  _shelfBg.innerHTML = '';
  const recent = Object.values(discoveries).slice(-22);
  for (const d of recent) {
    const sp = document.createElement('span');
    sp.className = 'lab-bg__shelf__pug';
    sp.title = d.name;
    sp.textContent = d.icon;
    _shelfBg.appendChild(sp);
  }
}
function sparkleBurst(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'lab-spark';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.background = color;
    s.style.color = color;
    const a = Math.random() * Math.PI * 2;
    const r = 80 + Math.random() * 140;
    s.style.setProperty('--tx', `${Math.cos(a) * r}px`);
    s.style.setProperty('--ty', `${Math.sin(a) * r}px`);
    s.style.animationDuration = (0.7 + Math.random() * 0.6) + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  }
}
function shakeEl(el) {
  if (!el) return;
  el.classList.remove('lab-shake'); void el.offsetWidth; el.classList.add('lab-shake');
  setTimeout(() => el.classList.remove('lab-shake'), 420);
}

const INGREDIENTS = [
  { id: 'lava', icon: '🌋', name: 'Lava' },                                       // no match
  { id: 'donut', icon: '🍩', name: 'Donut' },                                     // no match (biscuit is reserved for cafe)
  { id: 'wizard', icon: '🧙', name: 'Wizard Hat' },                                // no match
  { id: 'taco', icon: '🌮', name: 'Taco' },                                        // no match
  { id: 'lightning', icon: '⚡', iconName: 'lightning', name: 'Lightning' },
  { id: 'bone', icon: '🦴', iconName: 'bone',           name: 'Cursed Bone' },
  { id: 'ghost', icon: '👻', iconName: 'ghost',         name: 'Ghost Wisp' },
  { id: 'crystal', icon: '💎', iconName: 'gem',          name: 'Crystal' },
  { id: 'cheese', icon: '🧀', iconName: 'cheese',       name: 'Forbidden Cheese' },
  { id: 'gear', icon: '⚙', name: 'Mech Gear' },                                   // no match
  { id: 'rainbow', icon: '🌈', name: 'Rainbow Juice' },                            // no match
  { id: 'eyeball', icon: '👁', iconName: 'monsterEye',  name: 'Spare Eyeball' },
  { id: 'tongue', icon: '👅', name: 'Extra Tongue' },                              // no match
  { id: 'fire', icon: '🔥', iconName: 'flame',          name: 'Fire Spark' },
  { id: 'ice', icon: '🧊', name: 'Ice Cube' },                                    // no match
  { id: 'snake', icon: '🐍', name: 'Snake DNA' },                                  // no match
  { id: 'cake', icon: '🍰', iconName: 'cake',            name: 'Birthday Cake' },
  { id: 'bat', icon: '🦇', name: 'Bat Wing' },                                     // no match
  { id: 'tentacle', icon: '🐙', name: 'Tentacle' },                                // no match
  { id: 'leaf', icon: '🌿', name: 'Strange Leaf' },                                // no match
];

// Legendary named recipes (sorted ingredient ids → result)
const LEGENDARY = {
  'donut,lava,wizard':     { name: 'MOLTEN SPRINKLE MAGE', icon: '🔥🍩🧙', tier: 'LEGENDARY', desc: 'Casts donut-meteors. Glaze is volcanic.' },
  'bone,cheese,ghost':     { name: 'GORGONZOLA SPECTRE',   icon: '👻🧀🦴', tier: 'LEGENDARY', desc: 'Phases through walls, stinks of regret.' },
  'crystal,rainbow,wizard':{ name: 'PRISMATIC ORACLE PUG', icon: '💎🌈🧙', tier: 'LEGENDARY', desc: 'Sees all futures. Mostly futures involving snacks.' },
  'gear,lightning,snake':  { name: 'MECHA-COBRA EMPEROR',  icon: '🐍⚡⚙',  tier: 'LEGENDARY', desc: 'Half snake, half tank. 100% bork.' },
  'ghost,tentacle,eyeball':{ name: 'PUG-THULHU',           icon: '🐙👁👻', tier: 'LEGENDARY', desc: 'Ph\'nglui mglw\'nafh bork bork.' },
  'cake,fire,rainbow':     { name: 'BIRTHDAY DRAGON PUG',   icon: '🎂🔥🌈', tier: 'LEGENDARY', desc: 'Breathes party candles. Every day is its birthday.' },
  'bat,ghost,leaf':        { name: 'AUTUMN HAUNT PUG',      icon: '🍂🦇👻', tier: 'LEGENDARY', desc: 'Smells like pumpkin spice and old regret.' },
  'crystal,ice,tongue':    { name: 'FROZEN LICK GOLEM',     icon: '🧊💎👅', tier: 'LEGENDARY', desc: 'Long tongue, longer brain freeze.' },
  'cheese,snake,taco':     { name: 'NACHO SERPENT',         icon: '🌮🐍🧀', tier: 'LEGENDARY', desc: 'Slithers with crunch. Spicy bork.' },
  'gear,fire,wizard':      { name: 'STEAMPUNK MAGUS',       icon: '⚙🔥🧙',  tier: 'LEGENDARY', desc: 'Half clockwork, half spellcaster, all bork.' },
  'lightning,rainbow,eyeball': { name: 'KALEIDOSCOPE EYE',  icon: '👁🌈⚡', tier: 'LEGENDARY', desc: 'Sees in 11 dimensions. Most are snacks.' },
  'donut,cake,cheese':     { name: 'DESSERT KING PUG',      icon: '🍩🧀🍰', tier: 'LEGENDARY', desc: 'Eats only the sweet AND the savory. Diabetic vet declines.' },
  'bone,lava,tentacle':    { name: 'HELL-OCTOPUG',          icon: '🦴🌋🐙', tier: 'LEGENDARY', desc: 'Eight burning tentacles. Eight times the chaos.' },
};

// Cursed adjectives + nouns for procedural names
const ADJ = ['Molten', 'Cursed', 'Slimy', 'Holy', 'Frozen', 'Toasted', 'Glittered', 'Stinky', 'Spectral', 'Crispy', 'Soggy', 'Galactic', 'Forbidden', 'Burnt', 'Dripping', 'Glowing', 'Wobbly', 'Inverted', 'Possessed', 'Sentient'];
const NOUN = ['Loaf', 'Mage', 'Knight', 'Lord', 'Demon', 'Angel', 'Ghoul', 'Sphere', 'Blob', 'Wraith', 'Thing', 'Hybrid', 'Crab', 'Worm', 'Wisp', 'Beast', 'Mutant', 'Abomination', 'Snack', 'Cryptid'];
const FACE = ['😈', '👹', '🤖', '🧟', '🦄', '🐲', '🦑', '🦎', '🐸', '🐺', '🐯', '🦊', '🐻', '🦝', '🦨', '🐲', '🦖', '🦕', '🪼', '🧠'];
const CAPS = ['"It bork. It haunt. It mid."', '"Tag urself."', '"Do not feed."', '"Was once a good boy."', '"Smells like static."', '"Born in a microwave."', '"Knows what you did."', '"5/7."', '"Sad pug noises."', '"Just vibing."', '"Don\'t look it in the snoot."', '"Vegan now somehow."', '"100% organic chaos."', '"Cannot stop bork."', '"Free to a good home."'];

let beaker = [null, null, null];
let discoveries = {}; // id -> {name, icon, tier, desc}
let experiments = 0;

const collEl = document.getElementById('collection');
const ingEl = document.getElementById('ingredients');
const resEl = document.getElementById('result');
const fuseBtn = document.getElementById('lab-fuse');

function renderIngredients() {
  ingEl.innerHTML = '';
  for (const ing of INGREDIENTS) {
    const el = document.createElement('div');
    el.className = 'lab-item';
    el.innerHTML = `<div class="lab-item__icon">${_labIcon(ing, 24)}</div><div class="lab-item__name">${ing.name}</div>`;
    el.addEventListener('click', () => addToBeaker(ing));
    ingEl.appendChild(el);
  }
}

function addToBeaker(ing) {
  const slot = beaker.findIndex((s) => s == null);
  if (slot === -1) return;
  beaker[slot] = ing;
  sfx.tone(440 + slot * 110, 'triangle', 0.08, 0.18);
  syncBeaker();
}

function syncBeaker() {
  document.querySelectorAll('.lab-slot').forEach((el, i) => {
    if (beaker[i]) {
      // Use SVG icon when available so beaker matches the shelf
      if (beaker[i].iconName && iconSvg[beaker[i].iconName]) {
        el.innerHTML = iconSvg[beaker[i].iconName](32);
      } else {
        el.textContent = beaker[i].icon;
      }
      el.classList.add('filled');
    } else {
      el.textContent = '+';
      el.classList.remove('filled');
    }
  });
  const allFilled = beaker.every((s) => s != null);
  fuseBtn.disabled = !allFilled;
  // Glow + bubbles when 3 loaded
  const beakerEl = document.querySelector('.lab-beaker');
  if (beakerEl) {
    beakerEl.classList.toggle('is-ready', allFilled);
    // Manage bubbles
    let bubbles = beakerEl.querySelectorAll('.lab-bubble');
    const want = allFilled ? 5 : (beaker.filter((b) => b != null).length);
    if (bubbles.length < want) {
      for (let i = bubbles.length; i < want; i++) {
        const b = document.createElement('div'); b.className = 'lab-bubble';
        b.style.animationDelay = (i * 0.3) + 's';
        b.style.setProperty('--dx', ((Math.random() - 0.5) * 30) + 'px');
        beakerEl.appendChild(b);
      }
    } else if (bubbles.length > want) {
      for (let i = want; i < bubbles.length; i++) bubbles[i].remove();
    }
  }
}

document.querySelectorAll('.lab-slot').forEach((el, i) => {
  el.addEventListener('click', () => { beaker[i] = null; syncBeaker(); });
});

fuseBtn.addEventListener('click', fuse);

function fuse() {
  const ids = beaker.map((b) => b.id).sort();
  const key = ids.join(',');
  experiments++;
  let result;
  if (LEGENDARY[key]) {
    result = { ...LEGENDARY[key], key, legendary: true };
  } else {
    // Procedural mutant: derive name from hashed ingredient ids
    const hash = ids.reduce((h, s) => (h * 31 + s.charCodeAt(0)) >>> 0, 7);
    const adj = ADJ[hash % ADJ.length];
    const noun = NOUN[(hash >> 4) % NOUN.length];
    const face = FACE[(hash >> 8) % FACE.length];
    const cap = CAPS[(hash >> 12) % CAPS.length];
    const cursed = (hash & 0xff) < 60;  // ~23% cursed
    result = {
      key, name: `${adj.toUpperCase()} ${noun.toUpperCase()} PUG`, icon: face,
      tier: cursed ? 'CURSED' : 'COMMON', desc: cap, cursed,
    };
  }
  const isNew = !discoveries[key];
  if (isNew) discoveries[key] = result;
  showResult(result, isNew);
  beaker = [null, null, null];
  syncBeaker();
  save();
  renderCollection();
  refreshShelfBg();
  updateHud();
  // Celebration FX
  const beakerEl = document.querySelector('.lab-beaker');
  const rect = beakerEl ? beakerEl.getBoundingClientRect() : null;
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
  if (result.legendary) {
    sparkleBurst(cx, cy, 36, '#ffd23f');
    setTimeout(() => sparkleBurst(cx, cy, 24, '#ff8ac8'), 120);
    setTimeout(() => sparkleBurst(cx, cy, 24, '#4cc9f0'), 240);
    shakeEl(beakerEl);
    if (isNew) {
      const hudCard = document.querySelector('#hud .hud-card');
      if (hudCard) {
        hudCard.classList.remove('is-legendary'); void hudCard.offsetWidth; hudCard.classList.add('is-legendary');
      }
    }
  } else if (result.cursed) {
    sparkleBurst(cx, cy, 16, '#ff3a3a');
    shakeEl(beakerEl);
  } else {
    sparkleBurst(cx, cy, 12, '#4cc9f0');
  }
}

function showResult(r, isNew) {
  resEl.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'lab-result' + (r.legendary ? ' legendary' : (r.cursed ? ' cursed' : ''));
  div.innerHTML = `
    <div class="lab-result__pug">${r.icon}</div>
    <div class="lab-result__name">${r.name}</div>
    <div class="lab-result__rarity">${r.tier}${isNew ? ' · ★ NEW' : ''}</div>
    <div class="lab-result__caption">${r.desc}</div>
  `;
  resEl.appendChild(div);
  if (r.legendary) {
    sfx.arp([523, 659, 784, 1047, 1319], 'triangle', 0.1, 0.25, 0.3);
  } else if (r.cursed) {
    sfx.sweep(220, 80, 'sawtooth', 0.5, 0.22);
  } else {
    sfx.arp([330, 440, 523], 'square', 0.08, 0.2, 0.25);
  }
  setTimeout(() => { div.style.transition = 'opacity 1s'; div.style.opacity = '0.4'; }, 3500);
}

function renderCollection() {
  collEl.innerHTML = '';
  const list = Object.values(discoveries);
  if (list.length === 0) {
    collEl.innerHTML = '<div style="color:var(--muted);font-size:0.45rem;padding:6px;">No pugs discovered yet</div>';
    return;
  }
  for (const d of list) {
    const el = document.createElement('div');
    el.className = 'lab-item';
    el.title = `${d.name} — ${d.desc}`;
    el.innerHTML = `<div class="lab-item__icon">${d.icon}</div><div class="lab-item__name" style="color:${d.legendary ? 'var(--neon-yellow)' : (d.cursed ? 'var(--crimson)' : 'var(--text-soft)')}">${d.name.split(' ').slice(0, 2).join(' ')}</div>`;
    collEl.appendChild(el);
  }
}

function updateHud() {
  const total = Object.keys(discoveries).length;
  const legCount = Object.values(discoveries).filter((d) => d.legendary).length;
  document.getElementById('hud-discovered').textContent = `${total}/60`;
  document.getElementById('hud-legendary').textContent = `${legCount}/${Object.keys(LEGENDARY).length}`;
  document.getElementById('hud-exp').textContent = experiments;
}

function save() { try { localStorage.setItem('mutlab:state', JSON.stringify({ discoveries, experiments })); } catch {} }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem('mutlab:state') || '{}');
    if (s.discoveries) discoveries = s.discoveries;
    if (s.experiments) experiments = s.experiments;
  } catch {}
}

document.getElementById('start-btn').addEventListener('click', () => {
  document.getElementById('overlay').hidden = true;
  document.getElementById('overlay').classList.add('is-hidden');
  document.getElementById('hud').hidden = false;
  document.getElementById('lab').hidden = false;
  load();
  renderIngredients();
  renderCollection();
  refreshShelfBg();
  updateHud();
  syncBeaker(); // ensures bubble + glow state reflects empty beaker
  sfx.resume();
});

// Tutorial tip — shows briefly when the game starts (every match)
const _startOv = document.getElementById('overlay');
if (_startOv) {
  const _showOnHide = () => {
    if (_startOv.classList.contains('is-hidden') || _startOv.hidden) {
      showTip('Tap 3 ingredients → ⚗ FUSE → discover a pug. Find legendaries!', 6000);
    }
  };
  new MutationObserver(_showOnHide).observe(_startOv, { attributes: true, attributeFilter: ['hidden', 'class'] });
}
