// =============================================================================
// SHARED TOUCH / MOBILE-FIRST HELPERS — low-level building blocks for the
// touch-first ideas in IDEA_BANK_VOL4 §V4-2 + the mobile research brief.
// =============================================================================
//
// This is the *primitive* layer that sits BELOW the all-in-one overlay in
// `mobileControls.js`. Where mobileControls.js bakes a full opinionated HUD,
// this module exposes the small, composable pieces a game (or a future overlay)
// can wire by hand:
//
//   import {
//     makeFloatingJoystick, makeSwipeDetector,
//     inflateHit, hitTest, swipeDecision,
//     tap, haptic, setHapticEnabled,
//     isTouch, installViewportFixes,
//   } from '.../shared/touch.js';
//
//   // Floating analog stick that spawns wherever the thumb lands:
//   const stick = makeFloatingJoystick(zoneEl, { radius: 60, deadzone: 0.12 });
//   // each frame:
//   const { x, y, mag } = stick.value();   // normalized, deadzone-corrected
//
//   // Swipe-to-act (lane runner, dash, etc.):
//   const swipe = makeSwipeDetector(canvas, {
//     threshold: 25,
//     onSwipe: (dir) => { ... },           // 'up' | 'down' | 'left' | 'right'
//   });
//
//   // Big-thumb hit areas (PURE, Node-testable):
//   const big = inflateHit(spriteRect, 48);
//   if (hitTest({ x, y }, spriteRect, 48)) grab();
//
//   tap(button, () => fire());             // no 300ms delay, pointer-events
//   haptic(20);                            // guarded navigator.vibrate
//   installViewportFixes(canvas);          // --vh, safe-area, touch-action:none
//
// DESIGN RULES (match house style):
//  - EVERY DOM / navigator / window access is feature-guarded so the module
//    imports cleanly in Node (for unit tests / SSR-style tooling).
//  - The geometry + swipe-decision logic is kept PURE (no globals) so it is
//    deterministically unit-testable: `inflateHit`, `hitTest`, `swipeDecision`.
//  - Coordinates are screen-space (clientX/clientY); callers map to canvas space
//    with their own rect+scale (we never read getBoundingClientRect per-frame).
// =============================================================================

// ---------------------------------------------------------------------------
// PURE helpers (no DOM / navigator) — unit-testable in Node.
// ---------------------------------------------------------------------------

// Inflate a rect so its smallest dimension reaches at least `minPx`, growing
// symmetrically around the original centre. Used to decouple a crisp ~24px
// sprite from a comfortable ≥48px tap target (V4-2 "hit-area inflation").
//
//   rect: { x, y, w, h }  (top-left origin)
//   minPx: minimum width AND height the inflated rect should reach.
// Returns a NEW rect; never mutates the input.
export function inflateHit(rect, minPx = 48) {
  const x = +rect.x || 0;
  const y = +rect.y || 0;
  const w = Math.max(0, +rect.w || 0);
  const h = Math.max(0, +rect.h || 0);
  const min = Math.max(0, +minPx || 0);
  const padX = Math.max(0, (min - w) / 2);
  const padY = Math.max(0, (min - h) / 2);
  return {
    x: x - padX,
    y: y - padY,
    w: w + padX * 2,
    h: h + padY * 2,
  };
}

// Point-in-rect against the INFLATED rect (so small art still gets a big
// target). PURE — feed it plain numbers in tests.
//
//   point: { x, y }
//   rect:  { x, y, w, h }
//   minPx: inflation floor (default 48); pass 0 to test the raw rect.
export function hitTest(point, rect, minPx = 48) {
  const r = inflateHit(rect, minPx);
  const px = +point.x;
  const py = +point.y;
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// PURE swipe decision: given a displacement (dx, dy) over `dt` ms, decide
// whether it counts as a swipe and in which dominant-axis direction.
// "Commit on distance OR velocity" (V4-2): fires if the travelled distance
// clears `threshold`, OR the speed clears `velocity` px/ms even on a short flick.
//
//   dx, dy : total displacement in px (end - start), y grows downward.
//   dt     : elapsed time in ms.
//   opts   : { threshold=25, velocity=0.5, maxTime=600 }
//            - velocity in px/ms (0.5 ≈ 500px/s).
//            - maxTime: ignore slow drags older than this (0 = no cap).
// Returns 'up' | 'down' | 'left' | 'right', or null if it isn't a swipe.
// Dominant-axis snapping: the larger of |dx|/|dy| wins.
export function swipeDecision(dx, dy, dt, opts = {}) {
  const threshold = opts.threshold != null ? opts.threshold : 25;
  const velocity = opts.velocity != null ? opts.velocity : 0.5;
  const maxTime = opts.maxTime != null ? opts.maxTime : 600;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return null;
  if (maxTime > 0 && dt > maxTime) return null;
  // Velocity uses straight-line distance / time; guard divide-by-zero.
  const speed = dt > 0 ? dist / dt : Infinity;
  const passed = dist >= threshold || speed >= velocity;
  if (!passed) return null;
  if (ax >= ay) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}

// PURE joystick math: clamp a raw drag to a circle and return a normalized,
// deadzone-corrected vector. Shared by makeFloatingJoystick + testable alone.
//
//   dx, dy : finger offset from stick origin (px).
//   radius : clamp radius (px).
//   deadzone : normalized 0..1 below which the stick reads as centred.
// Returns { x, y, mag, clampX, clampY } where x/y are normalized [-1,1]
// re-scaled past the deadzone, mag is 0..1, and clampX/clampY are the px
// offset of the thumb after clamping (for rendering).
export function joystickVector(dx, dy, radius, deadzone = 0.12) {
  const R = Math.max(1, +radius || 1);
  let cx = dx;
  let cy = dy;
  const dist = Math.hypot(cx, cy);
  if (dist > R) {
    cx = (cx / dist) * R;
    cy = (cy / dist) * R;
  }
  const nx = cx / R;
  const ny = cy / R;
  const mag = Math.hypot(nx, ny);
  const dz = Math.max(0, Math.min(0.99, +deadzone || 0));
  if (mag <= dz) {
    return { x: 0, y: 0, mag: 0, clampX: cx, clampY: cy };
  }
  // Re-scale so the stick ramps 0..1 from the deadzone edge to the rim.
  const scaled = (mag - dz) / (1 - dz);
  return {
    x: (nx / mag) * scaled,
    y: (ny / mag) * scaled,
    mag: scaled,
    clampX: cx,
    clampY: cy,
  };
}

// ---------------------------------------------------------------------------
// Environment guards — safe in Node (all return false / no-op).
// ---------------------------------------------------------------------------

const _hasWindow = typeof window !== 'undefined';
const _hasDoc = typeof document !== 'undefined';

// Coarse-pointer (touch) detection via matchMedia, with the same `?touch=1/0`
// QA override mobileControls.js uses so previews stay consistent.
export function isTouch() {
  if (!_hasWindow) return false;
  try {
    const q = window.location && window.location.search;
    if (q && q.indexOf('touch=1') !== -1) return true;
    if (q && q.indexOf('touch=0') !== -1) return false;
  } catch {}
  try {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
  } catch {}
  try {
    if ('ontouchstart' in window) return true;
    if (navigator && navigator.maxTouchPoints > 0) return true;
  } catch {}
  return false;
}

// ---------------------------------------------------------------------------
// Haptics — guarded navigator.vibrate with a global enable flag (V4-2).
// ---------------------------------------------------------------------------

let _hapticEnabled = true;

// Master switch (e.g. wire to a settings toggle). Defaults ON.
export function setHapticEnabled(on) { _hapticEnabled = !!on; }
export function isHapticEnabled() { return _hapticEnabled; }

// Vibrate for `ms` (or a [on,off,...] pattern). No-ops when disabled, when the
// API is missing, or when the user has reduced-motion set (treated as a comfort
// signal, matching screenShake.js + mobileControls.js).
export function haptic(ms = 15) {
  if (!_hapticEnabled) return false;
  if (!_hasWindow) return false;
  try {
    if (_hasDoc && document.body && document.body.classList.contains('reduced-motion')) return false;
  } catch {}
  try {
    if (!navigator || typeof navigator.vibrate !== 'function') return false;
    return navigator.vibrate(ms);
  } catch {}
  return false;
}

// ---------------------------------------------------------------------------
// tap() — fast tap via Pointer Events + touch-action:manipulation (no 300ms
// delay, no FastClick). Fires once per press, only if the pointer didn't drift
// far enough to count as a drag/scroll. Returns a destroy fn.
// ---------------------------------------------------------------------------
export function tap(el, handler, opts = {}) {
  if (!el || typeof el.addEventListener !== 'function') return () => {};
  const slop = opts.slop != null ? opts.slop : 10;   // px drift allowed
  const maxMs = opts.maxMs != null ? opts.maxMs : 700; // long-press is not a tap
  // Kills the synthetic 300ms click delay on iOS/Android without FastClick.
  try { el.style.touchAction = 'manipulation'; } catch {}

  let active = false, sx = 0, sy = 0, st = 0, pid = null;
  const down = (e) => {
    active = true;
    pid = e.pointerId;
    sx = e.clientX; sy = e.clientY;
    st = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    try { el.setPointerCapture && el.setPointerCapture(e.pointerId); } catch {}
  };
  const up = (e) => {
    if (!active || e.pointerId !== pid) return;
    active = false;
    try { el.releasePointerCapture && el.releasePointerCapture(e.pointerId); } catch {}
    const dt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - st;
    const moved = Math.hypot(e.clientX - sx, e.clientY - sy);
    if (moved <= slop && dt <= maxMs) {
      try { handler(e); } catch {}
    }
  };
  const cancel = () => { active = false; pid = null; };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
  };
}

// ---------------------------------------------------------------------------
// makeFloatingJoystick — spawns at touch-down anywhere inside `el`, clamped to
// `radius`, deadzone-corrected, normalized via `.value()`, auto-hides on
// release. (V4-2 "floating joystick".)
//
//   el   : the zone element that captures the touch (e.g. a left-half div).
//   opts : {
//     radius=60,            clamp radius (px)
//     deadzone=0.12,        normalized deadzone
//     fixed=false,          if true, always centre the base in the zone
//     onStart, onMove, onEnd (callbacks; onMove gets (x,y,mag))
//     hapticOnStart=true,
//     baseClass='wg-stick__base', thumbClass='wg-stick__thumb',
//   }
//
// Returns { value, active, destroy }. `value()` -> { x, y, mag } each frame.
// Renders a base+thumb via inline styles if no CSS classes match — pairs with
// touch.css for the polished look but works standalone.
// ---------------------------------------------------------------------------
export function makeFloatingJoystick(el, opts = {}) {
  const radius = opts.radius != null ? opts.radius : 60;
  const deadzone = opts.deadzone != null ? opts.deadzone : 0.12;
  const fixed = !!opts.fixed;
  const hapticOnStart = opts.hapticOnStart !== false;

  const state = { x: 0, y: 0, mag: 0 };
  const api = {
    value: () => state,
    active: () => activeId !== null,
    destroy: () => {},
  };
  // No DOM? Return an inert stick so games importing in Node don't crash.
  if (!el || !_hasDoc || typeof el.addEventListener !== 'function') return api;

  let activeId = null, originX = 0, originY = 0;
  // Build the visual base + thumb once; positioned per-touch.
  const base = document.createElement('div');
  base.className = 'wg-stick__base';
  base.style.cssText =
    'position:fixed;width:' + radius * 2 + 'px;height:' + radius * 2 + 'px;' +
    'margin-left:' + -radius + 'px;margin-top:' + -radius + 'px;' +
    'border-radius:50%;pointer-events:none;z-index:2000;opacity:0;' +
    'transition:opacity .12s ease;touch-action:none;';
  const thumb = document.createElement('div');
  thumb.className = 'wg-stick__thumb';
  thumb.style.cssText =
    'position:absolute;left:50%;top:50%;width:42%;height:42%;' +
    'margin-left:-21%;margin-top:-21%;border-radius:50%;pointer-events:none;';
  base.appendChild(thumb);
  try { (document.body || document.documentElement).appendChild(base); } catch {}

  function show(cx, cy) {
    originX = cx; originY = cy;
    base.style.left = cx + 'px';
    base.style.top = cy + 'px';
    base.style.opacity = '1';
  }
  function hide() {
    base.style.opacity = '0';
    thumb.style.transform = 'translate(0px,0px)';
  }
  function apply(cx, cy) {
    const v = joystickVector(cx - originX, cy - originY, radius, deadzone);
    state.x = v.x; state.y = v.y; state.mag = v.mag;
    thumb.style.transform = 'translate(' + v.clampX + 'px,' + v.clampY + 'px)';
    if (opts.onMove) { try { opts.onMove(state.x, state.y, state.mag); } catch {} }
  }
  function reset() {
    activeId = null;
    state.x = 0; state.y = 0; state.mag = 0;
    hide();
    if (opts.onEnd) { try { opts.onEnd(); } catch {} }
  }

  const start = (e) => {
    if (activeId !== null) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    if (!t) return;
    activeId = (t.identifier != null) ? t.identifier : 'mouse';
    if (fixed) {
      // Centre in the zone element instead of where the thumb landed.
      try {
        const r = el.getBoundingClientRect();
        show(r.left + r.width / 2, r.top + r.height / 2);
      } catch { show(t.clientX, t.clientY); }
    } else {
      show(t.clientX, t.clientY);
    }
    apply(t.clientX, t.clientY);
    if (hapticOnStart) haptic(15);
    if (opts.onStart) { try { opts.onStart(); } catch {} }
    if (e.preventDefault) e.preventDefault();
  };
  const move = (e) => {
    if (activeId === null) return;
    const list = e.changedTouches || [e];
    for (const t of list) {
      const id = (t.identifier != null) ? t.identifier : 'mouse';
      if (id === activeId) { apply(t.clientX, t.clientY); if (e.preventDefault) e.preventDefault(); return; }
    }
  };
  const end = (e) => {
    if (activeId === null) return;
    const list = e.changedTouches || [e];
    for (const t of list) {
      const id = (t.identifier != null) ? t.identifier : 'mouse';
      if (id === activeId) { reset(); if (e.preventDefault) e.preventDefault(); return; }
    }
  };

  el.addEventListener('touchstart', start, { passive: false });
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('touchend', end, { passive: false });
  document.addEventListener('touchcancel', end, { passive: false });
  // Mouse fallback (desktop QA with ?touch=1).
  el.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);

  api.destroy = () => {
    el.removeEventListener('touchstart', start);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', end);
    document.removeEventListener('touchcancel', end);
    el.removeEventListener('mousedown', start);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', end);
    try { base.remove(); } catch {}
  };
  return api;
}

// ---------------------------------------------------------------------------
// makeSwipeDetector — wires touch (and mouse) events on `el` and fires
// `onSwipe(dir, info)` using the PURE swipeDecision logic. Tracks a single
// gesture at a time by pointer identifier.
//
//   el   : element to listen on (canvas, etc.).
//   opts : { threshold=25, velocity=0.5, maxTime=600, onSwipe, haptic=true }
//
// Returns { destroy }.
// ---------------------------------------------------------------------------
export function makeSwipeDetector(el, opts = {}) {
  const onSwipe = opts.onSwipe;
  const wantHaptic = opts.haptic !== false;
  const decideOpts = {
    threshold: opts.threshold != null ? opts.threshold : 25,
    velocity: opts.velocity != null ? opts.velocity : 0.5,
    maxTime: opts.maxTime != null ? opts.maxTime : 600,
  };
  if (!el || !_hasDoc || typeof el.addEventListener !== 'function') return { destroy: () => {} };

  let id = null, sx = 0, sy = 0, st = 0;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const start = (e) => {
    if (id !== null) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    if (!t) return;
    id = (t.identifier != null) ? t.identifier : 'mouse';
    sx = t.clientX; sy = t.clientY; st = now();
  };
  const end = (e) => {
    if (id === null) return;
    const list = e.changedTouches || [e];
    for (const t of list) {
      const tid = (t.identifier != null) ? t.identifier : 'mouse';
      if (tid !== id) continue;
      const dir = swipeDecision(t.clientX - sx, t.clientY - sy, now() - st, decideOpts);
      id = null;
      if (dir && onSwipe) {
        if (wantHaptic) haptic(15);
        try { onSwipe(dir, { dx: t.clientX - sx, dy: t.clientY - sy }); } catch {}
      }
      return;
    }
  };
  el.addEventListener('touchstart', start, { passive: true });
  el.addEventListener('touchend', end, { passive: true });
  el.addEventListener('mousedown', start);
  document.addEventListener('mouseup', end);
  return {
    destroy: () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchend', end);
      el.removeEventListener('mousedown', start);
      document.removeEventListener('mouseup', end);
    },
  };
}

// ---------------------------------------------------------------------------
// installViewportFixes — the iOS/Android plumbing from V4-2: keep a live
// `--vh` (1% of the *visual* viewport height, sidestepping the address-bar
// 100vh bug), expose safe-area insets as CSS vars, and set
// `touch-action:none` on a given canvas so it never scrolls/zooms/pull-refreshes.
//
//   canvas (optional): element to lock to `touch-action:none` + no callouts.
//   opts: { lockBodyScroll=false }  — position:fixed the body during play.
//
// All access guarded; returns a cleanup fn. No-op in Node.
// ---------------------------------------------------------------------------
export function installViewportFixes(canvas, opts = {}) {
  if (!_hasWindow || !_hasDoc) return () => {};
  const root = document.documentElement;

  const setVh = () => {
    try {
      const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 0;
      if (h > 0) {
        root.style.setProperty('--vh', (h * 0.01) + 'px');
        root.style.setProperty('--wg-vvh', h + 'px');
      }
    } catch {}
  };
  setVh();

  // Listen on visualViewport when present (handles iOS address-bar shifts),
  // else fall back to window resize.
  const targets = [];
  try {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVh);
      window.visualViewport.addEventListener('scroll', setVh);
      targets.push(() => {
        window.visualViewport.removeEventListener('resize', setVh);
        window.visualViewport.removeEventListener('scroll', setVh);
      });
    } else {
      window.addEventListener('resize', setVh);
      targets.push(() => window.removeEventListener('resize', setVh));
    }
  } catch {}

  // Lock the canvas so the browser never hijacks the gesture.
  if (canvas && canvas.style) {
    try {
      canvas.style.touchAction = 'none';
      canvas.style.webkitUserSelect = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.webkitTapHighlightColor = 'transparent';
      canvas.style.webkitTouchCallout = 'none';
    } catch {}
  }

  // Optional: stop the page itself from scrolling/bouncing during play.
  let prevBody = null;
  if (opts.lockBodyScroll && document.body) {
    try {
      prevBody = document.body.style.cssText;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
    } catch {}
  }

  return () => {
    for (const fn of targets) { try { fn(); } catch {} }
    if (prevBody != null && document.body) {
      try { document.body.style.cssText = prevBody; } catch {}
    }
  };
}

export default {
  makeFloatingJoystick,
  makeSwipeDetector,
  inflateHit,
  hitTest,
  swipeDecision,
  joystickVector,
  tap,
  haptic,
  setHapticEnabled,
  isHapticEnabled,
  isTouch,
  installViewportFixes,
};
