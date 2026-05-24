// =============================================================================
// SHARED ANIMATIONS — reusable arcade-feel motion primitives.
// =============================================================================
// Tiny dependency-free helpers any game (or hub UI) can call for consistent
// feedback. All visual: no audio, no game-state changes.
//
//   import {
//     bounceIn, popOut, shake, pulse,
//     confetti, flash, floatPopup, scrollTickerLine,
//   } from '../../src/shared/animations.js';
//
//   bounceIn(myEl);                            // entry pop
//   popOut(myEl, 250);                         // exit shrink
//   shake(myEl, 6, 350);                       // damage rumble
//   pulse(myEl, 'var(--neon-cyan)', 4);        // attention pulse
//   confetti({ x: ev.clientX, y: ev.clientY }); // win burst
//   flash('#ff3a3a');                          // hit/damage screen flash
//   floatPopup({ x: 200, y: 120, text: '+50', color: '#ffd23f' });
//   scrollTickerLine(myHostEl, 'WAVE COMPLETE!');
//
// All utilities honor `prefers-reduced-motion` (and body.reduced-motion):
//  - bounceIn/popOut: complete instantly, opacity-only fade
//  - shake/pulse: no-op
//  - confetti/floatPopup: emit smaller/none
//  - flash: dim, single-frame
//  - scrollTickerLine: shorter dwell, no slide-in transform
//
// Uses cubic-bezier(.34,1.56,.64,1) (the "spring" curve) for arcade pop where
// appropriate; everything else uses cubic-bezier(.22,1,.36,1) (smooth out).
// =============================================================================

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Idempotent style injection. Adds class-based fallbacks + ticker styles.
let _stylesInjected = false;
function ensureAnimStyles() {
  if (_stylesInjected) return;
  if (typeof document === 'undefined') return;
  if (document.getElementById('wg-animations-styles')) { _stylesInjected = true; return; }
  const s = document.createElement('style');
  s.id = 'wg-animations-styles';
  s.textContent = `
    /* === Float popup (rises + fades) === */
    @keyframes wgFloatRise {
      0%   { opacity: 0; transform: translate(-50%, 0) scale(0.8); }
      15%  { opacity: 1; transform: translate(-50%, -10%) scale(1.1); }
      100% { opacity: 0; transform: translate(-50%, calc(-1 * var(--wg-fp-dy, 50px))) scale(1); }
    }
    .wg-float-popup {
      position: fixed;
      z-index: 9500;
      pointer-events: none;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      white-space: nowrap;
      text-shadow: 0 2px 0 rgba(0, 0, 0, 0.65), 0 0 8px currentColor;
      animation: wgFloatRise var(--wg-fp-dur, 900ms) ${EASE_OUT} both;
      will-change: transform, opacity;
    }
    /* === Confetti particle === */
    @keyframes wgConfettiBurst {
      0%   { opacity: 1; transform: translate(-50%, -50%) rotate(0); }
      100% { opacity: 0; transform:
        translate(calc(-50% + var(--wg-cf-dx)), calc(-50% + var(--wg-cf-dy)))
        rotate(var(--wg-cf-rot)); }
    }
    .wg-confetti-piece {
      position: fixed;
      width: 8px; height: 8px;
      z-index: 9600;
      pointer-events: none;
      border-radius: 1px;
      will-change: transform, opacity;
      animation: wgConfettiBurst var(--wg-cf-dur, 1100ms) ${EASE_OUT} forwards;
    }
    /* === Full-screen color flash === */
    @keyframes wgFlashFade { 0% { opacity: 0.7; } 100% { opacity: 0; } }
    .wg-flash-layer {
      position: fixed;
      inset: 0;
      z-index: 9700;
      pointer-events: none;
      mix-blend-mode: screen;
      animation: wgFlashFade var(--wg-flash-dur, 200ms) ${EASE_OUT} forwards;
    }
    /* === Ticker line (auto-scrolls + fades) === */
    @keyframes wgTickerIn {
      from { opacity: 0; transform: translateX(36px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes wgTickerOut {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(-12px); }
    }
    .wg-ticker-line {
      font-family: 'Press Start 2P', monospace;
      font-size: 0.55rem;
      letter-spacing: 0.06em;
      color: var(--neon-cyan, #4cc9f0);
      background: rgba(10, 7, 22, 0.78);
      border-left: 3px solid currentColor;
      padding: 5px 9px;
      border-radius: 0 4px 4px 0;
      animation: wgTickerIn 0.35s ${SPRING} both;
      text-shadow: 0 0 6px currentColor;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      margin-bottom: 3px;
    }
    .wg-ticker-line.is-leaving {
      animation: wgTickerOut 0.3s ${EASE_OUT} forwards;
    }
    /* === Static keyframes for class-based shake/pulse === */
    @keyframes wgPulseOutline {
      0%, 100% { box-shadow: 0 0 0 0 currentColor, 0 0 0 0 currentColor; outline-color: transparent; }
      50%      { box-shadow: 0 0 14px 2px currentColor, 0 0 28px currentColor; outline-color: currentColor; }
    }
    .wg-pulse-target {
      outline: 2px solid transparent;
      outline-offset: 2px;
      border-radius: inherit;
    }
    /* Respect reduced-motion globally. */
    @media (prefers-reduced-motion: reduce) {
      .wg-float-popup, .wg-confetti-piece, .wg-flash-layer,
      .wg-ticker-line, .wg-ticker-line.is-leaving,
      .wg-pulse-target {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
      }
    }
    body.reduced-motion .wg-confetti-piece { display: none !important; }
    body.reduced-motion .wg-float-popup    { animation-duration: 0.001ms !important; }
    body.reduced-motion .wg-flash-layer    { opacity: 0.2 !important; animation-duration: 0.001ms !important; }
  `;
  document.head.appendChild(s);
  _stylesInjected = true;
}

function _reducedMotion() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  try {
    if (document.body && document.body.classList.contains('reduced-motion')) return true;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch {}
  return false;
}

// === bounceIn(el, dur=400) — scale 0.8 → 1.05 → 1 ==========================
export function bounceIn(el, dur = 400) {
  if (!el) return;
  ensureAnimStyles();
  if (_reducedMotion()) {
    // Just fade in
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 80ms linear';
      el.style.opacity = '1';
    });
    return;
  }
  // Use the WAAPI so we don't trample existing inline transforms after the
  // animation finishes — Element.animate() removes effects on completion.
  if (typeof el.animate === 'function') {
    try {
      el.animate(
        [
          { transform: 'scale(0.8)', opacity: 0 },
          { transform: 'scale(1.05)', opacity: 1, offset: 0.6 },
          { transform: 'scale(1)', opacity: 1 },
        ],
        { duration: dur, easing: SPRING, fill: 'none' },
      );
      return;
    } catch {}
  }
  // Fallback: inline transitions (less clean but functional)
  el.style.transformOrigin = el.style.transformOrigin || 'center';
  el.style.transform = 'scale(0.8)';
  el.style.opacity = '0';
  requestAnimationFrame(() => {
    el.style.transition = `transform ${dur}ms ${SPRING}, opacity ${Math.max(120, dur * 0.5)}ms linear`;
    el.style.transform = 'scale(1)';
    el.style.opacity = '1';
  });
}

// === popOut(el, dur=300) — scale 1 → 0.9 → 0 + fade ========================
// Resolves the returned Promise (and removes the element if `removeAfter`)
// when the animation completes.
export function popOut(el, dur = 300, { removeAfter = false } = {}) {
  if (!el) return Promise.resolve();
  ensureAnimStyles();
  const finalize = () => {
    if (removeAfter && el.parentNode) el.parentNode.removeChild(el);
  };
  if (_reducedMotion()) {
    el.style.transition = 'opacity 80ms linear';
    el.style.opacity = '0';
    return new Promise((res) => setTimeout(() => { finalize(); res(); }, 90));
  }
  if (typeof el.animate === 'function') {
    try {
      const a = el.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0.9)', opacity: 0.85, offset: 0.4 },
          { transform: 'scale(0)', opacity: 0 },
        ],
        { duration: dur, easing: EASE_OUT, fill: 'forwards' },
      );
      return new Promise((res) => {
        a.addEventListener('finish', () => { finalize(); res(); }, { once: true });
      });
    } catch {}
  }
  el.style.transition = `transform ${dur}ms ${EASE_OUT}, opacity ${dur}ms ${EASE_OUT}`;
  el.style.transform = 'scale(0)';
  el.style.opacity = '0';
  return new Promise((res) => setTimeout(() => { finalize(); res(); }, dur + 20));
}

// === shake(el, intensity=4, dur=400) — x translate oscillate ===============
export function shake(el, intensity = 4, dur = 400) {
  if (!el) return;
  if (_reducedMotion()) return;
  ensureAnimStyles();
  const i = Math.max(1, intensity);
  if (typeof el.animate === 'function') {
    try {
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: `translateX(-${i}px)` },
          { transform: `translateX(${i}px)` },
          { transform: `translateX(-${i * 0.66}px)` },
          { transform: `translateX(${i * 0.66}px)` },
          { transform: `translateX(-${i * 0.33}px)` },
          { transform: 'translateX(0)' },
        ],
        { duration: dur, easing: 'ease-in-out', fill: 'none' },
      );
    } catch {}
  }
}

// === pulse(el, color='var(--neon-pink)', count=3) — outline pulse ==========
export function pulse(el, color = 'var(--neon-pink)', count = 3) {
  if (!el) return;
  ensureAnimStyles();
  if (_reducedMotion()) return;
  // Use class-based animation so multiple call sites compose cleanly.
  el.classList.add('wg-pulse-target');
  // Save + restore the previous inline color so we don't overwrite user style.
  const prev = el.style.color;
  el.style.color = color;
  const dur = 700;
  const total = dur * Math.max(1, count);
  if (typeof el.animate === 'function') {
    try {
      el.animate(
        [
          { boxShadow: `0 0 0 0 ${color}, 0 0 0 0 ${color}` },
          { boxShadow: `0 0 16px 3px ${color}, 0 0 30px ${color}`, offset: 0.5 },
          { boxShadow: `0 0 0 0 ${color}, 0 0 0 0 ${color}` },
        ],
        { duration: dur, iterations: count, easing: 'ease-in-out' },
      );
    } catch {}
  }
  setTimeout(() => {
    el.classList.remove('wg-pulse-target');
    el.style.color = prev;
  }, total + 40);
}

// === confetti({ x, y, palette, count }) — DOM particle burst ===============
const DEFAULT_PALETTE = ['#ff3aa1', '#4cc9f0', '#ffd23f', '#5ef38c', '#ff8e3c', '#b055ff'];
export function confetti(opts = {}) {
  if (_reducedMotion()) return;
  if (typeof document === 'undefined') return;
  ensureAnimStyles();
  const x = opts.x ?? window.innerWidth / 2;
  const y = opts.y ?? window.innerHeight / 2;
  const palette = (opts.palette && opts.palette.length) ? opts.palette : DEFAULT_PALETTE;
  const count = Math.max(4, opts.count || 28);
  const spread = opts.spread || 220;
  const dur = opts.dur || 1100;
  const frag = document.createDocumentFragment();
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'wg-confetti-piece';
    const ang = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.8);
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist + (0.3 + Math.random() * 0.6) * spread; // gravity bias
    const rot = (Math.random() * 720 - 360) + 'deg';
    const color = palette[i % palette.length];
    const sz = 5 + Math.random() * 6;
    const d = dur + Math.random() * 350 - 100;
    piece.style.left = x + 'px';
    piece.style.top = y + 'px';
    piece.style.width = sz + 'px';
    piece.style.height = sz + 'px';
    piece.style.background = color;
    piece.style.setProperty('--wg-cf-dx', dx.toFixed(1) + 'px');
    piece.style.setProperty('--wg-cf-dy', dy.toFixed(1) + 'px');
    piece.style.setProperty('--wg-cf-rot', rot);
    piece.style.setProperty('--wg-cf-dur', d + 'ms');
    frag.appendChild(piece);
    pieces.push(piece);
  }
  document.body.appendChild(frag);
  const cleanup = () => {
    for (const p of pieces) { try { p.remove(); } catch {} }
  };
  setTimeout(cleanup, dur + 500);
}

// === flash(color, dur=200) — full-screen color flash =======================
export function flash(color = '#fff', dur = 200) {
  if (typeof document === 'undefined') return;
  ensureAnimStyles();
  const layer = document.createElement('div');
  layer.className = 'wg-flash-layer';
  layer.style.background = color;
  layer.style.setProperty('--wg-flash-dur', dur + 'ms');
  document.body.appendChild(layer);
  setTimeout(() => { try { layer.remove(); } catch {} }, dur + 80);
}

// === floatPopup({ x, y, text, color, dy=50, dur=900 }) — DOM floating text =
export function floatPopup({ x, y, text, color = 'var(--neon-yellow, #ffd23f)', dy = 50, dur = 900 } = {}) {
  if (typeof document === 'undefined') return;
  if (text == null) return;
  ensureAnimStyles();
  const el = document.createElement('div');
  el.className = 'wg-float-popup';
  el.textContent = String(text);
  el.style.left = (x ?? window.innerWidth / 2) + 'px';
  el.style.top = (y ?? window.innerHeight / 2) + 'px';
  el.style.color = color;
  el.style.setProperty('--wg-fp-dy', dy + 'px');
  el.style.setProperty('--wg-fp-dur', dur + 'ms');
  document.body.appendChild(el);
  setTimeout(() => { try { el.remove(); } catch {} }, dur + 80);
}

// === scrollTickerLine(host, text) — adds line + auto-scroll + fadeout ======
// `host` is any container element. Lines are stacked vertically; the oldest
// auto-fades after ~4s; the host is clamped to a sensible max so it doesn't
// grow infinitely. Returns the line element so callers can style/inspect.
export function scrollTickerLine(host, text, { life = 4000, max = 6, color } = {}) {
  if (!host || typeof document === 'undefined') return null;
  ensureAnimStyles();
  const line = document.createElement('div');
  line.className = 'wg-ticker-line';
  if (color) line.style.color = color;
  line.textContent = String(text);
  host.appendChild(line);
  // Trim oldest if too many
  while (host.childElementCount > max) {
    const old = host.firstElementChild;
    if (!old) break;
    old.classList.add('is-leaving');
    setTimeout(() => { try { old.remove(); } catch {} }, 320);
  }
  // Auto-fadeout after `life` ms
  setTimeout(() => {
    if (!line.isConnected) return;
    line.classList.add('is-leaving');
    setTimeout(() => { try { line.remove(); } catch {} }, 320);
  }, _reducedMotion() ? Math.min(1500, life) : life);
  return line;
}

// Convenience: register all functions on window for quick console testing.
// Guarded so we never collide if the page already defined them.
if (typeof window !== 'undefined' && !window.__wgAnim) {
  window.__wgAnim = { bounceIn, popOut, shake, pulse, confetti, flash, floatPopup, scrollTickerLine };
}
