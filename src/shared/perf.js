// =============================================================================
// SHARED PERFORMANCE / LIFECYCLE HELPERS — measure, govern, pause, observe.
// =============================================================================
//
// Why this exists: IDEA_BANK_VOL4 section V4-3 ("Web performance engineering")
// calls for a per-game FPS/frame-time HUD behind a query param, a delta-time
// clock that can auto-drop quality when frames run long, clean rAF/audio
// teardown on tab-hide, and trackerless web-vitals logging (console only — the
// site has a no-ads / no-tracking promise, so there is NEVER a network beacon).
//
// Everything here is import-safe in Node: every browser API (window, document,
// performance, PerformanceObserver, addEventListener) is guarded so the pure
// helpers can be unit-tested headless.
//
//   import {
//     makePerfOverlay, makeFrameClock, onVisibilityPause, logWebVitals,
//     ema, fpsFromDelta, budgetGovernor,
//   } from '.../shared/perf.js';
//
//   // 1) A toggleable HUD (only renders when ?perf=1 or after the hotkey):
//   const hud = makePerfOverlay();           // hotkey defaults to backtick `
//   // ...each frame:
//   hud.frame(dtMs, drawCalls);              // drawCalls optional
//
//   // 2) A delta clock with smoothed FPS + a budget governor:
//   const clock = makeFrameClock({ budgetMs: 1000 / 50, overFrames: 30 });
//   function loop(now) {
//     const dt = clock.tick(now);            // ms since last tick (clamped)
//     if (clock.governor.shouldDrop()) lowerQuality();
//     requestAnimationFrame(loop);
//   }
//
//   // 3) Pause/resume on tab-hide (cancel rAF, suspend AudioContext, ...):
//   const off = onVisibilityPause({ onPause: stop, onResume: start });
//   // ...later, on teardown: off();
//
//   // 4) Trackerless web-vitals to console (local dev insight, no beacon):
//   logWebVitals();
// =============================================================================

// ---------------------------------------------------------------------------
// PURE HELPERS (no browser APIs — Node-testable)
// ---------------------------------------------------------------------------

// Exponential moving average. `alpha` in (0,1]: higher = more reactive, lower =
// smoother. Seeds itself when `prev` is null/undefined/NaN.
export function ema(prev, sample, alpha = 0.1) {
  const a = Math.max(0, Math.min(1, alpha));
  if (prev == null || !Number.isFinite(prev)) return sample;
  if (!Number.isFinite(sample)) return prev;
  return prev + a * (sample - prev);
}

// Frames-per-second implied by a frame delta in milliseconds. Returns 0 for a
// non-positive / non-finite delta (avoids Infinity in the HUD).
export function fpsFromDelta(dtMs) {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return 0;
  return 1000 / dtMs;
}

// A small state machine that "trips" once frame-time has exceeded `thresholdMs`
// for `frames` CONSECUTIVE samples, so a game can drop quality. A single
// under-budget frame resets the streak. Stays tripped (latched) until reset()
// so callers don't flip quality back and forth on noisy frames.
//
//   const gov = budgetGovernor(20, 30);   // >20ms for 30 frames in a row
//   gov.sample(dtMs);                      // call once per frame
//   if (gov.tripped) dropQuality();        // (or gov.shouldDrop())
//   gov.reset();                           // after raising the budget / quality
export function budgetGovernor(thresholdMs = 1000 / 50, frames = 30) {
  let streak = 0;
  let tripped = false;
  const api = {
    get thresholdMs() { return thresholdMs; },
    get frames() { return frames; },
    get streak() { return streak; },
    get tripped() { return tripped; },
    // Feed one frame's delta (ms). Returns true on the frame it trips.
    sample(dtMs) {
      const justTripped = (() => {
        if (Number.isFinite(dtMs) && dtMs > thresholdMs) {
          streak++;
          if (streak >= frames && !tripped) { tripped = true; return true; }
        } else {
          streak = 0;
        }
        return false;
      })();
      return justTripped;
    },
    // Convenience boolean for callers that don't track the return of sample().
    shouldDrop() { return tripped; },
    // Clear the latch + streak (call after you've applied a quality drop, or
    // when raising the budget).
    reset() { streak = 0; tripped = false; },
  };
  return api;
}

// ---------------------------------------------------------------------------
// ENVIRONMENT GUARDS
// ---------------------------------------------------------------------------

const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';

// A monotonic-ish clock that works in Node too (for tests / SSR).
function nowMs() {
  try {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
  } catch { /* ignore */ }
  return Date.now();
}

function perfFlagFromQuery() {
  if (!hasWindow) return false;
  try {
    const sp = new URLSearchParams(window.location.search || '');
    const v = sp.get('perf');
    return v === '1' || v === 'true' || v === 'on';
  } catch { return false; }
}

// ---------------------------------------------------------------------------
// FRAME CLOCK — delta time + smoothed FPS + budget governor
// ---------------------------------------------------------------------------
//
// opts:
//   maxDtMs   clamp for the returned delta (default 100 — a long tab-hide gap
//             shouldn't teleport the simulation). Set Infinity to disable.
//   alpha     EMA smoothing for fps/frameMs (default 0.1).
//   budgetMs  frame-time budget for the governor (default 1000/50 = 20ms).
//   overFrames consecutive over-budget frames before the governor trips (30).
export function makeFrameClock(opts = {}) {
  const maxDtMs = opts.maxDtMs == null ? 100 : opts.maxDtMs;
  const alpha = opts.alpha == null ? 0.1 : opts.alpha;
  const budgetMs = opts.budgetMs == null ? 1000 / 50 : opts.budgetMs;
  const overFrames = opts.overFrames == null ? 30 : opts.overFrames;

  let last = null;          // timestamp of previous tick
  let frameMs = 0;          // smoothed frame time (ms)
  let fps = 0;              // smoothed fps
  let rawDt = 0;            // last raw (unclamped) delta
  let frames = 0;           // total ticks since start

  const governor = budgetGovernor(budgetMs, overFrames);

  const api = {
    governor,
    get fps() { return fps; },
    get frameMs() { return frameMs; },
    get rawDt() { return rawDt; },
    get frames() { return frames; },
    // Advance the clock. Pass a timestamp (e.g. the rAF arg / performance.now())
    // or omit to read the clock itself. Returns the CLAMPED delta in ms.
    tick(ts) {
      const t = Number.isFinite(ts) ? ts : nowMs();
      if (last == null) { last = t; return 0; }
      rawDt = t - last;
      last = t;
      const dt = Math.max(0, Math.min(maxDtMs, rawDt));
      frames++;
      // Govern on the RAW delta — a clamped value would hide real stalls.
      governor.sample(rawDt);
      frameMs = ema(frameMs, rawDt, alpha);
      fps = ema(fps, fpsFromDelta(rawDt), alpha);
      return dt;
    },
    // Forget the last timestamp so the next tick returns 0 (use after a pause so
    // the resume frame doesn't report a huge delta).
    pause() { last = null; },
    // Clear all smoothing + governor latch.
    reset() {
      last = null; frameMs = 0; fps = 0; rawDt = 0; frames = 0;
      governor.reset();
    },
  };
  return api;
}

// ---------------------------------------------------------------------------
// PERF OVERLAY — toggleable FPS / frame-time / draw-call HUD
// ---------------------------------------------------------------------------
//
// opts:
//   hotkey   key (event.key) that toggles the HUD (default '`'). null disables.
//   alpha    EMA smoothing for the displayed numbers (default 0.1).
//   corner   'tl' | 'tr' | 'bl' | 'br' (default 'tr').
//   query    honor ?perf=1 to start enabled (default true).
//   start    force-start enabled regardless of query (default false).
//
// Returns { frame(dtMs, drawCalls?), show(), hide(), toggle(), destroy(),
//           get enabled }. All DOM access is guarded — in Node frame() is a
// silent no-op so games can call it unconditionally.
export function makePerfOverlay(opts = {}) {
  const hotkey = opts.hotkey === undefined ? '`' : opts.hotkey;
  const alpha = opts.alpha == null ? 0.1 : opts.alpha;
  const corner = opts.corner || 'tr';
  const honorQuery = opts.query !== false;
  let enabled = !!opts.start || (honorQuery && perfFlagFromQuery());

  let el = null;
  let fps = 0;
  let frameMs = 0;
  let draws = 0;
  let dirty = false;
  let rafPending = false;

  const cornerCss = {
    tl: 'top:6px;left:6px',
    tr: 'top:6px;right:6px',
    bl: 'bottom:6px;left:6px',
    br: 'bottom:6px;right:6px',
  }[corner] || 'top:6px;right:6px';

  function ensureEl() {
    if (!hasDocument) return null;
    if (el) return el;
    if (!document.body) return null;
    el = document.createElement('div');
    el.id = 'borkade-perf';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed', cornerCss, 'z-index:2147483646',
      'pointer-events:none', 'user-select:none',
      'font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
      'color:#9affc8', 'background:rgba(8,4,20,0.78)',
      'border:1px solid rgba(154,255,200,0.35)', 'border-radius:6px',
      'padding:4px 7px', 'white-space:pre', 'letter-spacing:0.3px',
      'text-shadow:0 1px 0 #000', 'min-width:78px',
    ].join(';');
    document.body.appendChild(el);
    return el;
  }

  function removeEl() {
    try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch { /* ignore */ }
    el = null;
  }

  // Throttle DOM writes to one per rAF so the HUD never costs a frame itself.
  function scheduleRender() {
    if (!enabled || !hasDocument) return;
    dirty = true;
    if (rafPending) return;
    rafPending = true;
    const flush = () => {
      rafPending = false;
      if (!dirty) return;
      dirty = false;
      const node = ensureEl();
      if (!node) return;
      const f = fps.toFixed(0).padStart(3, ' ');
      const ms = frameMs.toFixed(1).padStart(4, ' ');
      let txt = `${f} fps\n${ms} ms`;
      if (draws > 0) txt += `\n${String(draws).padStart(4, ' ')} draws`;
      // Tint red when we're missing 60fps badly.
      node.style.color = frameMs > 20 ? '#ff8aa1' : (frameMs > 16.9 ? '#ffd27a' : '#9affc8');
      node.textContent = txt;
    };
    try {
      if (hasWindow && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(flush);
      } else {
        flush();
      }
    } catch { flush(); }
  }

  const api = {
    get enabled() { return enabled; },
    // Feed one frame. dtMs = frame delta (ms); drawCalls optional.
    frame(dtMs, drawCalls) {
      if (!enabled) return;
      frameMs = ema(frameMs, dtMs, alpha);
      fps = ema(fps, fpsFromDelta(dtMs), alpha);
      if (Number.isFinite(drawCalls)) draws = drawCalls;
      scheduleRender();
    },
    show() { enabled = true; scheduleRender(); },
    hide() { enabled = false; removeEl(); },
    toggle() { return enabled ? (api.hide(), false) : (api.show(), true); },
    destroy() {
      enabled = false;
      removeEl();
      if (keyHandler && hasWindow) {
        try { window.removeEventListener('keydown', keyHandler); } catch { /* ignore */ }
      }
    },
  };

  // Hotkey toggle (guarded; ignored while typing in a field).
  let keyHandler = null;
  if (hotkey != null && hasWindow) {
    keyHandler = (e) => {
      if (!e || e.key !== hotkey) return;
      const t = e.target;
      const tag = t && t.tagName ? t.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      api.toggle();
    };
    try { window.addEventListener('keydown', keyHandler); } catch { keyHandler = null; }
  }

  if (enabled) scheduleRender();
  return api;
}

// ---------------------------------------------------------------------------
// VISIBILITY PAUSE — wire visibilitychange + pagehide to pause/resume
// ---------------------------------------------------------------------------
//
// Calls onPause when the tab is hidden / the page is being put in the bfcache,
// and onResume when it comes back. Idempotent: it won't fire onPause twice in a
// row. Returns an unsubscribe function (safe to call multiple times / in Node).
//
//   const off = onVisibilityPause({
//     onPause:  () => { cancelAnimationFrame(raf); audioCtx?.suspend(); },
//     onResume: () => { raf = requestAnimationFrame(loop); audioCtx?.resume(); },
//   });
export function onVisibilityPause({ onPause, onResume } = {}) {
  if (!hasDocument && !hasWindow) return () => {};

  let paused = false;
  const pause = () => {
    if (paused) return;
    paused = true;
    try { if (typeof onPause === 'function') onPause(); } catch { /* ignore */ }
  };
  const resume = () => {
    if (!paused) return;
    paused = false;
    try { if (typeof onResume === 'function') onResume(); } catch { /* ignore */ }
  };

  const onVis = () => {
    // document.hidden covers tab-switch / minimize / phone-lock.
    if (hasDocument && document.hidden) pause(); else resume();
  };
  // pagehide fires for bfcache navigations where visibilitychange may not; we
  // pause (don't destroy) so a back-button bfcache restore can resume cleanly.
  const onHide = () => pause();
  const onShow = () => { if (!hasDocument || !document.hidden) resume(); };

  try { if (hasDocument) document.addEventListener('visibilitychange', onVis); } catch { /* ignore */ }
  try { if (hasWindow) window.addEventListener('pagehide', onHide); } catch { /* ignore */ }
  try { if (hasWindow) window.addEventListener('pageshow', onShow); } catch { /* ignore */ }

  let off = false;
  return function unsubscribe() {
    if (off) return;
    off = true;
    try { if (hasDocument) document.removeEventListener('visibilitychange', onVis); } catch { /* ignore */ }
    try { if (hasWindow) window.removeEventListener('pagehide', onHide); } catch { /* ignore */ }
    try { if (hasWindow) window.removeEventListener('pageshow', onShow); } catch { /* ignore */ }
  };
}

// ---------------------------------------------------------------------------
// WEB VITALS — trackerless console logging (NO network beacon, ever)
// ---------------------------------------------------------------------------
//
// Uses PerformanceObserver (fully guarded) to log Largest Contentful Paint,
// Cumulative Layout Shift, and long tasks to the console for local insight.
// This NEVER sends anything anywhere — it only console.* — honoring the site's
// no-tracking promise. Returns a stop() function that disconnects observers.
//
//   logWebVitals();                       // logs to console on this page
//   const stop = logWebVitals({ prefix: '[heist]' });
export function logWebVitals(opts = {}) {
  const prefix = opts.prefix || '[perf]';
  const log = opts.log || ((...a) => { try { console.log(...a); } catch { /* ignore */ } });

  if (typeof PerformanceObserver === 'undefined') {
    log(`${prefix} PerformanceObserver unavailable — web-vitals logging skipped`);
    return () => {};
  }

  const observers = [];
  const observe = (type, cb, extra) => {
    try {
      const po = new PerformanceObserver((list) => {
        try { cb(list); } catch { /* ignore */ }
      });
      po.observe(Object.assign({ type, buffered: true }, extra));
      observers.push(po);
    } catch { /* type unsupported on this browser — skip silently */ }
  };

  // LCP — report the latest candidate (it can update as the page renders).
  observe('largest-contentful-paint', (list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    if (last) {
      const t = Math.round(last.renderTime || last.loadTime || last.startTime || 0);
      log(`${prefix} LCP ~${t}ms`, last.element || '');
    }
  });

  // CLS — accumulate layout-shift score (ignoring user-initiated shifts).
  let cls = 0;
  observe('layout-shift', (list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) cls += entry.value || 0;
    }
    log(`${prefix} CLS ${cls.toFixed(4)}`);
  });

  // Long tasks — anything blocking the main thread >50ms hurts INP.
  observe('longtask', (list) => {
    for (const entry of list.getEntries()) {
      log(`${prefix} long task ${Math.round(entry.duration)}ms`);
    }
  });

  let stopped = false;
  return function stop() {
    if (stopped) return;
    stopped = true;
    for (const po of observers) { try { po.disconnect(); } catch { /* ignore */ } }
    observers.length = 0;
  };
}
