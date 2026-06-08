// =============================================================================
// DAILY CHALLENGE SYSTEM — one seeded run per UTC day, identical worldwide.
//
// Wordle-style daily challenges with NO backend (IDEA_BANK Vol.4 §V4-5/§V4-6):
//   - every player on the same UTC date gets the SAME seed → the SAME layout
//   - a human-comparable "#NNN" index counts days since the Borkade launch epoch
//   - a deterministic "modifier of the day" ("Foggy Friday") rolled from the seed
//   - one RANKED attempt per day, locked in localStorage; practice runs are free
//     and never counted (no fake scarcity — Vol.4 ethical-virality rule)
//
// This module is the bridge between the shared deterministic RNG (rng.js) and
// per-game daily UI. It reuses rng.js — it does NOT re-implement seeding.
//
//   import { getDaily, isDailyDone, markDailyDone } from '.../shared/daily.js';
//
//   const d = getDaily('pug-heist');
//   //   d.seed     → 32-bit uint, same for everyone today
//   //   d.index    → 214        (Borkade "Day #214")
//   //   d.code     → 'BORK-7F3A2'
//   //   d.modifier → { id:'foggy', name:'Foggy Friday', desc:'...' }
//   const rng = makeRng(d.seed);   // build today's layout
//
//   if (!isDailyDone('pug-heist')) { ...run ranked attempt... }
//   markDailyDone('pug-heist', finalScore);
//   const best = dailyResult('pug-heist');     // { score, at } | null
//   const ms   = msUntilNextDaily();           // for a "next daily in HH:MM:SS" timer
//
// Browser localStorage is GUARDED so the pure logic (dailyIndex, getDaily, the
// modifier roll) is importable and testable under plain Node. Every date-based
// function accepts an optional injected Date for deterministic tests.
// =============================================================================

import { hashStr, makeRng, seedToCode } from './rng.js';

// Borkade launch epoch — "Day #1" is this UTC date. Counting days from here gives
// the shareable "#NNN" that makes two players' runs comparable at a glance.
export const LAUNCH_EPOCH_ISO = '2026-06-01';

const DAY_MS = 86400000; // 24 * 60 * 60 * 1000

// Modifier-of-the-day pool. One is rolled deterministically from the daily seed
// so every player sees the SAME modifier today, but it varies day to day. Kept
// small and game-agnostic; individual games interpret the `id` as they see fit.
export const DAILY_MODIFIERS = [
  { id: 'classic', name: 'Classic Bork',  desc: 'No twist — pure daily run.' },
  { id: 'foggy',   name: 'Foggy Friday',  desc: 'Vision is reduced.' },
  { id: 'rush',    name: 'Rush Hour',     desc: 'Everything moves faster.' },
  { id: 'greedy',  name: 'Greedy Bork',   desc: 'Double points, double danger.' },
  { id: 'sudden',  name: 'Sudden Bork',   desc: 'One life — no second chances.' },
  { id: 'swarm',   name: 'Swarm Day',     desc: 'More enemies than usual.' },
  { id: 'tiny',    name: 'Tiny Treats',   desc: 'Pickups are smaller and rarer.' },
  { id: 'mirror',  name: 'Mirror Match',  desc: 'The world is flipped.' },
];

// --- date helpers -----------------------------------------------------------

// Midnight-UTC timestamp for a given Date (strips the time-of-day).
function _utcMidnight(date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// 'YYYYMMDD' in UTC — used as the localStorage day key so a run locks per day.
function _ymd(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// --- public date/seed logic (pure, Node-importable) -------------------------

// Integer day index since launch (the "#NNN"). Day of the launch epoch = 1.
// `now` is injectable for tests; defaults to the real clock.
export function dailyIndex(launchEpochISO = LAUNCH_EPOCH_ISO, now = new Date()) {
  const launch = _utcMidnight(new Date(launchEpochISO));
  const today = _utcMidnight(now);
  return Math.floor((today - launch) / DAY_MS) + 1;
}

// Everything about today's challenge for a game. Deterministic for a given
// (gameId, date): same date worldwide → same seed, index, code, and modifier.
export function getDaily(gameId, now = new Date()) {
  const index = dailyIndex(LAUNCH_EPOCH_ISO, now);
  // Seed namespaced by game AND day so each game has its own daily layout, but
  // it is still globally identical for everyone on the same UTC date.
  const seed = hashStr(`borkade:daily:${gameId}:${_ymd(now)}`);
  const code = seedToCode(seed);
  // Roll the modifier from the seed (forked so it never disturbs the game's own
  // RNG stream — the game builds its own makeRng(seed) for layout).
  const modRng = makeRng(hashStr(`${seed}:modifier`));
  const modifier = modRng.pick(DAILY_MODIFIERS);
  return { seed, index, code, modifier, gameId, ymd: _ymd(now) };
}

// Milliseconds until the next UTC midnight (for a non-nagging countdown timer).
export function msUntilNextDaily(now = new Date()) {
  const nextMidnight = _utcMidnight(now) + DAY_MS;
  return nextMidnight - now.getTime();
}

// --- ranked-attempt locking (localStorage-backed, guarded) ------------------

// Per-game, per-day key. Distinct days never collide, so yesterday's lock never
// blocks today's attempt and an archive of past results is preserved.
function _dailyKey(gameId, now = new Date()) {
  return `borkade:daily:${gameId}:${_ymd(now)}`;
}

function _readJson(key, fallback) {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function _writeJson(key, val) {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch { return false; }
}

// Has the player already used their one ranked attempt today?
export function isDailyDone(gameId, now = new Date()) {
  return _readJson(_dailyKey(gameId, now), null) !== null;
}

// Today's ranked result, or null if not yet played. Shape: { score, index, at }.
export function dailyResult(gameId, now = new Date()) {
  return _readJson(_dailyKey(gameId, now), null);
}

// Record the ranked attempt. First write wins (the one daily attempt); later
// calls are ignored so a replay/practice can't overwrite the ranked score.
// Returns the stored result (existing one if already done).
export function markDailyDone(gameId, score, now = new Date()) {
  const key = _dailyKey(gameId, now);
  const existing = _readJson(key, null);
  if (existing !== null) return existing;
  const result = {
    score: Number(score) || 0,
    index: dailyIndex(LAUNCH_EPOCH_ISO, now),
    at: now.getTime(),
  };
  _writeJson(key, result);
  return result;
}

// Clear today's lock (dev/testing only).
export function resetDaily(gameId, now = new Date()) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(_dailyKey(gameId, now));
  } catch {}
}
