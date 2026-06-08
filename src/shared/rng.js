// =============================================================================
// SHARED DETERMINISTIC RNG — the keystone for daily challenges, replay ghosts,
// shareable seeds, and reproducible procedural generation across all 15 games.
// =============================================================================
//
// Why this exists: only bork-battle had a seeded PRNG (games/bork-battle/src/
// rng.js), and nothing reused it. Daily challenges, "beat this exact layout"
// share codes, and deterministic replays all need ONE shared, byte-identical
// generator so a seed produces the same run on every device/browser.
//
//   import { makeRng, dailySeed, hashStr } from '.../shared/rng.js';
//
//   const rng = makeRng(dailySeed('floor-lava'));   // same layout worldwide today
//   const gap   = rng.int(2, 5);                     // inclusive integer
//   const speed = rng.float(1.0, 1.8);
//   const tile  = rng.pick(TILE_TYPES);
//   rng.shuffle(deck);                               // in-place Fisher–Yates
//   if (rng.chance(0.3)) spawnSecret();
//
//   // Shareable codes:
//   const code = seedToCode(rng.seed);   // e.g. "BORK-7F3A2"
//   const seed = codeToSeed(code);
//
// mulberry32 is tiny, fast, and has good distribution for game use. It is NOT
// cryptographic — never use it for anything security-sensitive.
// =============================================================================

// Core generator: returns a function producing floats in [0, 1).
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Hash an arbitrary string to a 32-bit unsigned int (FNV-1a). Stable across
// devices, so the same seed string always yields the same number.
export function hashStr(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// A non-deterministic seed for "surprise me" runs.
export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31) >>> 0;
}

// Today's seed for a given game/namespace, identical for every player on the
// same UTC date. `offsetDays` lets you peek at past/future dailies.
export function dailySeed(namespace = '', offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  const ymd = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  return hashStr(`${namespace}:${ymd}`);
}

// A short, human-shareable code for a seed, e.g. "BORK-1A2B3". Round-trips via
// codeToSeed(). Base32-ish (no ambiguous 0/O/1/I/L).
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // 31 chars, base31
export function seedToCode(seed) {
  let n = seed >>> 0;
  let out = '';
  do {
    out = ALPHABET[n % ALPHABET.length] + out;
    n = Math.floor(n / ALPHABET.length);
  } while (n > 0);
  return 'BORK-' + out.padStart(5, '2');
}

export function codeToSeed(code) {
  const body = String(code).trim().toUpperCase().replace(/^BORK-/, '').replace(/[^0-9A-Z]/g, '');
  let n = 0;
  for (const ch of body) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) continue;
    n = (n * ALPHABET.length + i) >>> 0;
  }
  return n >>> 0;
}

// The main API. Accepts a numeric seed OR a string (auto-hashed). Returns a
// stateful generator with convenience helpers. `.seed` is the resolved numeric
// seed so it can be displayed/shared.
export function makeRng(seedOrString) {
  const seed = typeof seedOrString === 'string' ? hashStr(seedOrString) : (seedOrString >>> 0);
  const next = mulberry32(seed);
  const api = {
    seed,
    // float in [0, 1)
    next,
    // float in [min, max)
    float(min = 0, max = 1) { return min + next() * (max - min); },
    // integer in [min, max] inclusive
    int(min, max) { return Math.floor(min + next() * (max - min + 1)); },
    // true with probability p (0..1)
    chance(p) { return next() < p; },
    // alias kept for readability at call sites
    bool(p = 0.5) { return next() < p; },
    // random element of an array
    pick(arr) { return arr[Math.floor(next() * arr.length)]; },
    // weighted pick: items is [{weight, ...}] or pass a getWeight fn
    weighted(items, getWeight = (it) => it.weight ?? 1) {
      let total = 0;
      for (const it of items) total += getWeight(it);
      let r = next() * total;
      for (const it of items) { r -= getWeight(it); if (r <= 0) return it; }
      return items[items.length - 1];
    },
    // in-place Fisher–Yates shuffle; returns the same array
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    // a fresh independent stream derived from this one (for sub-systems)
    fork(tag = '') { return makeRng(hashStr(`${seed}:${tag}:${api.int(0, 0x7fffffff)}`)); },
  };
  return api;
}
