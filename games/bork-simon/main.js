// BORK SIMON — pattern-memory with bark pitches + roast you on fail.
import { submitRun, loadBest } from '../../src/persistence/highScores.js';
import { createSfx } from '../../src/shared/miniSfx.js';

const sfx = createSfx({ storageKey: 'simon:muted' });
sfx.applyButton(document.getElementById('mute-btn'));

const PITCHES = { low: 130, mid: 220, high: 440, howl: 700 };
const TYPES = { low: 'sawtooth', mid: 'square', high: 'triangle', howl: 'sawtooth' };
const ROASTS = [
  "u smell.",
  "even my cat got that one.",
  "the snoots have judged. they say 'mid'.",
  "imagine missing a 3-note sequence",
  "did you bork with your eyes closed?",
  "the audience pug is laughing at you",
  "5/10 effort, 0/10 rhythm",
  "the dev expected better. specifically of you.",
  "bork bork bork bork (translation: 'wow')",
  "have you considered a different game?",
  "instructions unclear, accidentally bonked self",
  "this is why we can't have nice treats",
];

let pattern = [];
let input = [];
let inputting = false;
let round = 1;
let running = false;

const padsEl = document.getElementById('pads');
const big = document.getElementById('bigtext');
const roast = document.getElementById('roast');

function pad(p) { return document.querySelector(`.bork-pad[data-p="${p}"]`); }

async function playPattern() {
  inputting = false;
  big.hidden = false; big.textContent = `ROUND ${round}`;
  await sleep(700);
  for (const p of pattern) {
    pad(p).classList.add('lit');
    sfx.tone(PITCHES[p], TYPES[p], 0.25, 0.25);
    await sleep(350);
    pad(p).classList.remove('lit');
    await sleep(150);
  }
  big.hidden = true;
  input = [];
  inputting = true;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function handle(p) {
  if (!inputting) return;
  pad(p).classList.add('lit');
  sfx.tone(PITCHES[p], TYPES[p], 0.18, 0.22);
  setTimeout(() => pad(p).classList.remove('lit'), 180);
  input.push(p);
  const i = input.length - 1;
  if (input[i] !== pattern[i]) {
    fail();
    return;
  }
  if (input.length === pattern.length) {
    inputting = false;
    setTimeout(() => {
      round++;
      pattern.push(randomPitch());
      document.getElementById('hud-round').textContent = round;
      playPattern();
    }, 400);
  }
}

function randomPitch() {
  const keys = Object.keys(PITCHES);
  return keys[Math.floor(Math.random() * keys.length)];
}

function fail() {
  inputting = false;
  running = false;
  sfx.sweep(220, 80, 'sawtooth', 0.5, 0.25);
  roast.hidden = false;
  const r = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  roast.textContent = r;
  setTimeout(() => {
    roast.hidden = true;
    document.getElementById('end-rounds').textContent = round - 1;
    document.getElementById('end-roast').textContent = r;
    const { isNewBest, current } = submitRun('bork-simon', { score: round - 1, round: round - 1 }, (a, b) => b.round - a.round);
    const bestEl = document.getElementById('end-best');
    if (bestEl) {
      const b = current || { round: round - 1 };
      bestEl.innerHTML = `Best: <b>${b.round} rounds</b>${isNewBest ? ' <span style="color:var(--neon-yellow)">★ NEW</span>' : ''}`;
    }
    document.getElementById('hud').hidden = true;
    padsEl.hidden = true;
    document.getElementById('end-overlay').hidden = false;
    document.getElementById('end-overlay').classList.remove('is-hidden');
  }, 1200);
}

document.querySelectorAll('.bork-pad').forEach((b) => b.addEventListener('click', () => handle(b.dataset.p)));
document.getElementById('start-btn').addEventListener('click', start);
document.getElementById('end-restart').addEventListener('click', start);
function start() {
  pattern = [randomPitch()]; round = 1; input = []; running = true;
  document.getElementById('overlay').hidden = true; document.getElementById('overlay').classList.add('is-hidden');
  document.getElementById('end-overlay').hidden = true; document.getElementById('end-overlay').classList.add('is-hidden');
  document.getElementById('hud').hidden = false;
  document.getElementById('hud-round').textContent = round;
  const best = loadBest('bork-simon');
  document.getElementById('hud-best').textContent = best ? best.round : 0;
  padsEl.hidden = false;
  sfx.resume();
  playPattern();
}
