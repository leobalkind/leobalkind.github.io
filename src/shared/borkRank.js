// =============================================================================
// BORK RANK — DMC-style style/combo meter (D → SSS) for BORKADE.
// =============================================================================
// A stateful "style meter" that rewards continuous, VARIED play. Inspired by
// Devil May Cry's letter-grade combo system (V4-6 in IDEA_BANK_VOL4.md).
//
//   import { makeRank, drawRankMeter } from '.../borkRank.js';
//
//   const rank = makeRank();                      // defaults: D..SSS
//   rank.add('steal', 100);                       // fill the meter
//   rank.add('steal', 100);                       // same action → diminished
//   rank.add('dodge', 100);                       // varied action → full value
//   rank.update(dt);                              // decay every frame (seconds)
//   rank.hit();                                   // took damage → drop a grade
//   rank.grade();      // 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS'
//   rank.value();      // current meter value (number)
//   rank.peak();       // highest grade reached this run (label)
//   rank.scoreMultiplier(); // final multiplier derived from AVERAGE grade
//
//   // optional canvas HUD (guards a missing ctx, e.g. in Node):
//   drawRankMeter(ctx, rank, x, y, { w: 160, h: 18 });
//
// VARIETY MULTIPLIER: repeating the same actionType back-to-back yields
// diminishing returns (×1 → ×0.7 → ×0.5 → ×0.3 → …). Switching to a different
// actionType resets the streak, so flashy varied play climbs grades far faster
// than spamming one button.
//
// AVERAGE GRADE: every update() samples the current grade tier; the run's
// average tier drives scoreMultiplier(), so SUSTAINING a high rank pays out far
// more than a single momentary spike. Pure & deterministic — Node-importable,
// no required browser API (ctx is optional and guarded).
// =============================================================================

// Numeric tier index → default letter label. Index is the array position.
const DEFAULT_LABELS = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

// Meter value at which each tier (by index) BEGINS. tier 0 ('D') starts at 0.
// Thresholds are cumulative; the meter caps just past the top threshold.
const DEFAULT_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400];

// Per-grade tint (index-aligned) — gold from S, hot rainbow-ish at the top.
const DEFAULT_TINTS = ['#8a90b1', '#9fd27a', '#4cc9f0', '#ff3aa1', '#ffd23f', '#ffae3f', '#ff5e9e'];

// Diminishing-returns table for repeating the SAME actionType in a row.
// Index = number of prior consecutive repeats (0 = first use → full value).
const DEFAULT_VARIETY = [1, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1];

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

// Resolve the variety multiplier for the Nth consecutive repeat.
function varietyMul(table, repeats) {
  if (repeats < 0) repeats = 0;
  return repeats < table.length ? table[repeats] : table[table.length - 1];
}

/**
 * Create a stateful BORK Rank meter.
 *
 * @param {object} [opts]
 * @param {number[]} [opts.thresholds] cumulative meter values where each tier begins
 * @param {string[]} [opts.labels]     per-tier labels (must match thresholds length)
 * @param {string[]} [opts.tints]      per-tier colors (index-aligned)
 * @param {number[]} [opts.varietyTable] diminishing-returns multipliers for repeats
 * @param {number} [opts.decayRate]    meter points drained per second
 * @param {number} [opts.decayDelay]   grace seconds after a gain before decay starts
 * @param {number} [opts.hitDrop]      tiers dropped per .hit() (default 1 full grade)
 */
export function makeRank(opts = {}) {
  const thresholds = (opts.thresholds || DEFAULT_THRESHOLDS).slice();
  const labels = (opts.labels || DEFAULT_LABELS).slice();
  const tints = (opts.tints || DEFAULT_TINTS).slice();
  const varietyTable = (opts.varietyTable || DEFAULT_VARIETY).slice();
  const decayRate = opts.decayRate != null ? opts.decayRate : 60;
  const decayDelay = opts.decayDelay != null ? opts.decayDelay : 0.6;
  const hitDrop = opts.hitDrop != null ? opts.hitDrop : 1;

  const topTier = thresholds.length - 1;
  const maxValue = thresholds[topTier] + (thresholds[topTier] - thresholds[topTier - 1 < 0 ? 0 : topTier - 1]) * 0.5;

  let value = 0;
  let lastAction = null;
  let repeatCount = 0;          // consecutive repeats of lastAction
  let sinceGain = decayDelay;   // seconds since the last positive gain
  let peakTier = 0;             // highest tier index reached this run

  // Running average of the grade tier, sampled on every update().
  let tierSum = 0;
  let tierSamples = 0;

  // Map a meter value to its tier index (0..topTier).
  function tierOf(v) {
    let t = 0;
    for (let i = 0; i < thresholds.length; i++) {
      if (v >= thresholds[i]) t = i; else break;
    }
    return t;
  }

  function refreshPeak() {
    const t = tierOf(value);
    if (t > peakTier) peakTier = t;
  }

  return {
    /**
     * Add style points for an action. Repeating the same actionType in a row
     * applies the diminishing-returns variety multiplier.
     * @param {string} actionType  category key (e.g. 'steal', 'dodge')
     * @param {number} [points]    base points before the variety multiplier
     * @returns {number} the actual points added after the multiplier
     */
    add(actionType, points = 0) {
      if (actionType === lastAction) repeatCount += 1;
      else { lastAction = actionType; repeatCount = 0; }
      const gained = points * varietyMul(varietyTable, repeatCount);
      value = clamp(value + gained, 0, maxValue);
      sinceGain = 0;
      refreshPeak();
      return gained;
    },

    /** Took damage — knock the meter down `hitDrop` full grade(s). */
    hit() {
      const t = tierOf(value);
      const target = Math.max(0, t - hitDrop);
      value = thresholds[target];
      // Also break the variety streak; damage interrupts the flow.
      lastAction = null;
      repeatCount = 0;
      return value;
    },

    /** Per-frame decay toward 0. `dt` is in seconds. */
    update(dt = 0) {
      if (dt < 0) dt = 0;
      sinceGain += dt;
      if (sinceGain >= decayDelay) {
        value = clamp(value - decayRate * dt, 0, maxValue);
      }
      // Sample the current tier for the running average (drives final multiplier).
      tierSum += tierOf(value);
      tierSamples += 1;
      return value;
    },

    /** Current tier index (0 = lowest). */
    tier() { return tierOf(value); },

    /** Current grade label (e.g. 'A'). */
    grade() { return labels[tierOf(value)]; },

    /** Current raw meter value. */
    value() { return value; },

    /** Fraction (0..1) of progress through the CURRENT tier toward the next. */
    tierProgress() {
      const t = tierOf(value);
      if (t >= topTier) return 1;
      const lo = thresholds[t], hi = thresholds[t + 1];
      return clamp((value - lo) / (hi - lo), 0, 1);
    },

    /** Highest grade label reached this run. */
    peak() { return labels[peakTier]; },

    /** Highest tier index reached this run. */
    peakTier() { return peakTier; },

    /** Tint color for the current grade. */
    tint() { return tints[Math.min(tierOf(value), tints.length - 1)]; },

    /**
     * Final score multiplier derived from the AVERAGE grade sustained across
     * the run. Each tier above D adds 0.5×, so a run averaging 'S' (tier 4)
     * yields ×3.0; a run that briefly spiked but mostly sat at D stays near ×1.
     */
    scoreMultiplier() {
      const avg = tierSamples > 0 ? tierSum / tierSamples : 0;
      return 1 + avg * 0.5;
    },

    /** Reset the meter & all run stats. */
    reset() {
      value = 0; lastAction = null; repeatCount = 0;
      sinceGain = decayDelay; peakTier = 0; tierSum = 0; tierSamples = 0;
    },

    // Exposed for the HUD helper / introspection.
    _labels: labels,
    _tints: tints,
  };
}

/**
 * Optional canvas HUD: draws the current letter grade + a draining bar.
 * Guards a missing/invalid ctx so it's a no-op in Node or headless tests.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} rank   a meter from makeRank()
 * @param {number} x      left
 * @param {number} y      top
 * @param {object} [opts] { w, h, font }
 */
export function drawRankMeter(ctx, rank, x, y, opts = {}) {
  if (!ctx || typeof ctx.fillRect !== 'function' || !rank) return;
  const w = opts.w != null ? opts.w : 160;
  const h = opts.h != null ? opts.h : 18;
  const font = opts.font || 'bold 22px monospace';
  const tint = rank.tint();
  const grade = rank.grade();
  const prog = rank.tierProgress();

  ctx.save();
  // Letter grade.
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillStyle = tint;
  ctx.fillText(grade, x, y);

  // Draining bar beneath/right of the letter.
  const barX = x + (opts.barOffsetX != null ? opts.barOffsetX : 46);
  const barY = y + (opts.barOffsetY != null ? opts.barOffsetY : 4);
  // Track.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(barX, barY, w, h);
  // Fill (current tier progress).
  ctx.fillStyle = tint;
  ctx.fillRect(barX, barY, w * prog, h);
  // Border.
  if (typeof ctx.strokeRect === 'function') {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.strokeRect(barX, barY, w, h);
  }
  ctx.restore();
}

export default makeRank;
