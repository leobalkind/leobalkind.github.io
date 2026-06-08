// =============================================================================
// SHARED GHOST REPLAY — record a run's path, replay a translucent "ghost-pug"
// of your personal best, and race shareable ghost strings (IDEA_BANK V4-6).
// =============================================================================
//
// Why this exists: mastery games (speedruns, score-attack, dailies) feel alive
// when you can race a ghost of your previous best line. This module is GENERIC:
// it knows nothing about any game. A game samples a position+flags each tick,
// serializes to a compact string, and stores it as the PB ghost for a category.
// Pure logic is Node-importable; every browser API (localStorage, canvas) is
// guarded so this file imports cleanly under `node --input-type=module`.
//
//   import {
//     GhostRecorder, loadGhost,
//     saveBestGhost, loadBestGhost, drawGhost,
//   } from '.../shared/ghost.js';
//
//   // --- recording (in the game loop) ---
//   const rec = new GhostRecorder({ tickHz: 60 });
//   // each frame, with monotonic seconds `t`:
//   rec.sample({ t, x: pug.x, y: pug.y, flags: pug.jumping ? 1 : 0 });
//   // on run end:
//   const str = rec.serialize();
//   saveBestGhost('floor-lava', 'any', str, finalTimeMs); // lower score wins? see note
//
//   // --- playback (next run) ---
//   const ghost = loadGhost(loadBestGhost('floor-lava', 'any')?.str);
//   // each frame:
//   const p = ghost.frameAt(t);            // { x, y, flags } interpolated, or null
//   drawGhost(ctx, ghost, t, { color: '#9ad', radius: 8 });
//
// SCORE DIRECTION: saveBestGhost overwrites only when the new score is STRICTLY
// GREATER than the stored one. For "lower is better" metrics (e.g. finish time),
// pass a negated score (e.g. -timeMs) so bigger = better still holds.
//
// -----------------------------------------------------------------------------
// SERIALIZE FORMAT (deterministic, compact, version-tagged)
// -----------------------------------------------------------------------------
// A ghost string is: "G1:" + base64( payload bytes ). The payload is a little-
// stream of signed-LEB128 varints describing a fixed-point frame stream:
//
//   header:
//     u-varint  tickHz            (samples per second the recorder used)
//     u-varint  scale             (fixed-point units per world-unit, e.g. 16)
//     u-varint  frameCount        (N)
//   then, delta-encoded per frame (first frame deltas are vs 0):
//     s-varint  dx                (x_i*scale - x_{i-1}*scale, rounded)
//     s-varint  dy
//   then a flags section, RLE-encoded over the same N frames:
//     u-varint  runCount
//     repeated runCount times:
//       u-varint  flags
//       u-varint  repeat          (how many consecutive frames share `flags`)
//
// Times are implicit: frame i is at t = i / tickHz seconds. We store the
// recorder's first sample time as `t0` so frameAt() works in the game's own
// monotonic clock; t0 lives in the header too (s-varint of round(t0*1000) ms).
//
// The format is fully deterministic: identical sample input always yields byte-
// identical output, and load→serialize round-trips stably.
// =============================================================================

// ---- environment guards -----------------------------------------------------
const _hasLS = (() => {
  try { return typeof localStorage !== 'undefined' && localStorage !== null; } catch { return false; }
})();

// ---- varint (LEB128) codecs -------------------------------------------------
// Unsigned LEB128: 7 bits per byte, high bit = "more bytes follow".
function _writeUVarint(bytes, value) {
  let v = value >>> 0;
  // Use a non-bitwise path for values that may exceed 31 bits safely.
  v = Math.floor(value);
  if (v < 0) v = 0;
  while (v >= 0x80) {
    bytes.push((v & 0x7f) | 0x80);
    v = Math.floor(v / 128);
  }
  bytes.push(v & 0x7f);
}
// ZigZag map signed → unsigned so small magnitudes (both signs) stay short.
function _zigzag(n) { return n < 0 ? (-n * 2 - 1) : (n * 2); }
function _unzigzag(u) { return (u % 2) ? -((u + 1) / 2) : (u / 2); }
function _writeSVarint(bytes, value) { _writeUVarint(bytes, _zigzag(Math.round(value))); }

// Reader over a Uint8Array-like number array.
function _makeReader(bytes) {
  let i = 0;
  return {
    get pos() { return i; },
    get done() { return i >= bytes.length; },
    uvarint() {
      let result = 0, shift = 1, byte;
      do {
        if (i >= bytes.length) throw new Error('ghost: varint overrun');
        byte = bytes[i++];
        result += (byte & 0x7f) * shift;
        shift *= 128;
      } while (byte & 0x80);
      return result;
    },
    svarint() { return _unzigzag(this.uvarint()); },
  };
}

// ---- base64 (no DOM/Node dependency; works everywhere) ----------------------
const _B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function _bytesToB64(bytes) {
  let out = '';
  const n = bytes.length;
  for (let i = 0; i < n; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < n ? bytes[i + 1] : 0;
    const b2 = i + 2 < n ? bytes[i + 2] : 0;
    out += _B64[b0 >> 2];
    out += _B64[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += i + 1 < n ? _B64[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < n ? _B64[b2 & 0x3f] : '=';
  }
  return out;
}
function _b64ToBytes(str) {
  const clean = String(str).replace(/[^A-Za-z0-9+/]/g, '');
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = _B64.indexOf(clean[i]);
    const c1 = _B64.indexOf(clean[i + 1]);
    const c2 = _B64.indexOf(clean[i + 2]);
    const c3 = _B64.indexOf(clean[i + 3]);
    if (c0 < 0 || c1 < 0) break;
    out.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) out.push(((c1 & 0x0f) << 4) | (c2 >> 2));
    if (c3 >= 0) out.push(((c2 & 0x03) << 6) | c3);
  }
  return out;
}

const FORMAT_PREFIX = 'G1:';

// =============================================================================
// GhostRecorder — accumulates frames, then serializes to a compact string.
// =============================================================================
export class GhostRecorder {
  // tickHz: nominal samples/sec (used to convert frame index ↔ time on playback).
  // scale:  fixed-point precision (units per world-unit). 16 ≈ 1/16px resolution.
  constructor({ tickHz = 60, scale = 16 } = {}) {
    this.tickHz = Math.max(1, Math.round(tickHz));
    this.scale = Math.max(1, Math.round(scale));
    this._frames = []; // { t, x, y, flags }
  }

  // Push one frame. `state` = { t?, x, y, flags? }. t is monotonic seconds; if
  // omitted, an implicit index-based time is used. flags is a small unsigned int.
  sample(state) {
    if (!state) return;
    const x = +state.x || 0;
    const y = +state.y || 0;
    const flags = (state.flags | 0) >>> 0;
    const t = Number.isFinite(state.t) ? +state.t : this._frames.length / this.tickHz;
    this._frames.push({ t, x, y, flags });
  }

  get frameCount() { return this._frames.length; }

  // Serialize to "G1:<base64>". Deterministic for identical input.
  serialize() {
    const frames = this._frames;
    const bytes = [];
    const t0ms = frames.length ? Math.round(frames[0].t * 1000) : 0;
    _writeUVarint(bytes, this.tickHz);
    _writeUVarint(bytes, this.scale);
    _writeUVarint(bytes, frames.length);
    _writeSVarint(bytes, t0ms);

    // Delta-encoded fixed-point positions.
    let prevX = 0, prevY = 0;
    for (const f of frames) {
      const fx = Math.round(f.x * this.scale);
      const fy = Math.round(f.y * this.scale);
      _writeSVarint(bytes, fx - prevX);
      _writeSVarint(bytes, fy - prevY);
      prevX = fx; prevY = fy;
    }

    // RLE flags. First pass: build runs.
    const runs = [];
    for (const f of frames) {
      const last = runs[runs.length - 1];
      if (last && last.flags === f.flags) last.repeat++;
      else runs.push({ flags: f.flags, repeat: 1 });
    }
    _writeUVarint(bytes, runs.length);
    for (const r of runs) {
      _writeUVarint(bytes, r.flags);
      _writeUVarint(bytes, r.repeat);
    }

    return FORMAT_PREFIX + _bytesToB64(bytes);
  }
}

// =============================================================================
// loadGhost — parse a string into a playback object.
// =============================================================================
// Returns null on empty/invalid input. The playback object exposes:
//   .tickHz, .scale, .frameCount, .t0 (seconds), .duration (seconds)
//   .frames  — [{ t, x, y, flags }] decoded (absolute world units)
//   .frameAt(t) — interpolated { x, y, flags } at monotonic time t, or null if
//                 outside the recorded window. flags is taken from the nearest
//                 (floored) frame, position is linearly interpolated.
export function loadGhost(str) {
  if (!str || typeof str !== 'string') return null;
  if (str.slice(0, FORMAT_PREFIX.length) !== FORMAT_PREFIX) return null;
  let bytes, r;
  try {
    bytes = _b64ToBytes(str.slice(FORMAT_PREFIX.length));
    r = _makeReader(bytes);
    const tickHz = r.uvarint();
    const scale = r.uvarint() || 1;
    const count = r.uvarint();
    const t0 = r.svarint() / 1000;

    const frames = new Array(count);
    let accX = 0, accY = 0;
    for (let i = 0; i < count; i++) {
      accX += r.svarint();
      accY += r.svarint();
      frames[i] = { t: t0 + i / tickHz, x: accX / scale, y: accY / scale, flags: 0 };
    }

    // Decode RLE flags back over the same N frames.
    const runCount = r.uvarint();
    let fi = 0;
    for (let k = 0; k < runCount; k++) {
      const flags = r.uvarint();
      const repeat = r.uvarint();
      for (let j = 0; j < repeat && fi < count; j++) frames[fi++].flags = flags;
    }

    const duration = count > 1 ? frames[count - 1].t - frames[0].t : 0;
    return {
      tickHz, scale, frameCount: count, t0, duration, frames,
      frameAt(t) {
        if (count === 0) return null;
        if (count === 1) return { x: frames[0].x, y: frames[0].y, flags: frames[0].flags };
        if (t <= frames[0].t) return { x: frames[0].x, y: frames[0].y, flags: frames[0].flags };
        const last = frames[count - 1];
        if (t >= last.t) return { x: last.x, y: last.y, flags: last.flags };
        // Time is uniform (i/tickHz + t0): index directly, then interpolate.
        // Add a tiny epsilon before flooring so a query landing exactly on a
        // frame time (modulo float error like 16.99999) snaps to frame i, not i-1.
        const rel = (t - t0) * tickHz;
        let i = Math.floor(rel + 1e-6);
        if (i < 0) i = 0;
        if (i >= count - 1) i = count - 2;
        const a = frames[i], b = frames[i + 1];
        const span = b.t - a.t || 1;
        let u = (t - a.t) / span;
        if (u < 0) u = 0; else if (u > 1) u = 1;
        return {
          x: a.x + (b.x - a.x) * u,
          y: a.y + (b.y - a.y) * u,
          // flags are discrete per-frame state: take the nearer frame so an
          // exact-frame query reads that frame's flags, not the previous run's.
          flags: u < 0.5 ? a.flags : b.flags,
        };
      },
    };
  } catch {
    return null;
  }
}

// =============================================================================
// localStorage helpers — namespaced PB ghosts per game+category.
// =============================================================================
// Key: borkade:ghost:<game>:<cat>. Value: JSON { str, score, ts }.
// Overwrites ONLY when the new score is strictly greater than the stored score.
function _key(gameId, category) {
  return `borkade:ghost:${gameId}:${category}`;
}

// Returns true if it wrote (i.e. this was a new best), false otherwise.
export function saveBestGhost(gameId, category, str, score) {
  if (!_hasLS || !str) return false;
  const sc = +score || 0;
  try {
    const prev = loadBestGhost(gameId, category);
    if (prev && prev.score >= sc) return false;
    localStorage.setItem(_key(gameId, category), JSON.stringify({ str, score: sc, ts: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

// Returns { str, score, ts } or null.
export function loadBestGhost(gameId, category) {
  if (!_hasLS) return null;
  try {
    const raw = localStorage.getItem(_key(gameId, category));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.str !== 'string') return null;
    return { str: obj.str, score: +obj.score || 0, ts: +obj.ts || 0 };
  } catch {
    return null;
  }
}

// Wipe a stored ghost (dev/testing). Returns true if removed.
export function clearBestGhost(gameId, category) {
  if (!_hasLS) return false;
  try { localStorage.removeItem(_key(gameId, category)); return true; } catch { return false; }
}

// =============================================================================
// drawGhost — optional translucent marker at the interpolated position.
// =============================================================================
// Safe no-op if ctx or ghost is missing. opts:
//   color   '#9ad'   stroke/fill base color
//   radius  7        marker radius in px
//   alpha   0.45     overall translucency
//   label   ''       optional text drawn above the marker
export function drawGhost(ctx, ghost, t, opts = {}) {
  if (!ctx || !ghost || typeof ctx.save !== 'function') return;
  const p = ghost.frameAt(t);
  if (!p) return;
  const color = opts.color || '#9ad8ff';
  const radius = opts.radius == null ? 7 : opts.radius;
  const alpha = opts.alpha == null ? 0.45 : opts.alpha;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = Math.min(1, alpha + 0.3);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();
  if (opts.label) {
    ctx.globalAlpha = Math.min(1, alpha + 0.4);
    ctx.fillStyle = color;
    ctx.font = opts.font || '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(String(opts.label), p.x, p.y - radius - 4);
  }
  ctx.restore();
}
