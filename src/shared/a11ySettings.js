// =============================================================================
// SHARED ACCESSIBILITY SETTINGS — IDEA_BANK_VOL4 §V4-4 "Deep accessibility".
// =============================================================================
// A single localStorage-backed settings object (`borkade:a11y`) read on boot
// and shared by the hub gear AND every game's pause menu. Self-contained and
// ADDITIVE: importing this module touches NOTHING else — no game file, no other
// shared file. It only ever writes its own key and toggles its own body classes.
//
//   import { getA11y, setA11y, onA11yChange, getGameSpeedMul,
//            prefersReducedMotion, getTextScale, mountA11yPanel } from '.../a11ySettings.js';
//
//   const dt = rawDt * getGameSpeedMul();        // honour the speed slider
//   if (!prefersReducedMotion()) doScreenShake(); // honour reduced-motion
//   mountA11yPanel(document.getElementById('settings-body')); // build the UI
//
// The DATA/LOGIC layer (store + getters/setters + subscribe) is PURE and
// Node-importable: every `document`/`window`/`localStorage` access is wrapped in
// a `typeof … !== 'undefined'` guard, so this file imports cleanly with no DOM.
//
// Side-effects applied on every change (browser only):
//   - body.classList: `reduced-motion`, `high-contrast`, and the colour-blind
//     class (`cb-protan` | `cb-deutan` | `cb-tritan`, none when 'none').
//   - CSS var `--a11y-text-scale` on :root for text-scale-aware layouts.
// The optional companion stylesheet a11ySettings.css styles the panel + classes.

const LS_KEY = 'borkade:a11y';

// --- env guards --------------------------------------------------------------
const HAS_DOM = typeof document !== 'undefined';
const HAS_WIN = typeof window !== 'undefined';

// --- schema + clamps ---------------------------------------------------------
const COLORBLIND_MODES = ['none', 'protan', 'deutan', 'tritan'];

const clampNum = (v, lo, hi, dflt) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, n));
};
const asBool = (v, dflt) => (typeof v === 'boolean' ? v : v == null ? dflt : v === true || v === 'true' || v === 1 || v === '1');

// Detect the OS-level reduced-motion preference (used as the *default* only).
function systemReducedMotion() {
  if (!HAS_WIN || typeof window.matchMedia !== 'function') return false;
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
}

// Build the full default object. reducedMotion auto-defaults from the OS.
function makeDefaults() {
  return {
    reducedMotion: systemReducedMotion(),
    highContrast: false,
    colorblindMode: 'none', // 'none' | 'protan' | 'deutan' | 'tritan'
    textScale: 1.0,         // 1.0 – 2.0
    gameSpeed: 1.0,         // 0.5 – 1.0  (multiplier on dt)
    masterMuted: false,
    musicVol: 0.7,          // 0 – 1
    sfxVol: 0.7,            // 0 – 1
    leftHanded: false,
  };
}

// Coerce an arbitrary parsed/patch object into a valid, clamped settings shape.
// `base` supplies fallbacks for any missing field (defaults, or current state).
function sanitize(raw, base) {
  const b = base || makeDefaults();
  const r = raw && typeof raw === 'object' ? raw : {};
  const cbRaw = r.colorblindMode;
  return {
    reducedMotion: asBool(r.reducedMotion, b.reducedMotion),
    highContrast: asBool(r.highContrast, b.highContrast),
    colorblindMode: COLORBLIND_MODES.includes(cbRaw) ? cbRaw : b.colorblindMode,
    textScale: clampNum(r.textScale, 1.0, 2.0, b.textScale),
    gameSpeed: clampNum(r.gameSpeed, 0.5, 1.0, b.gameSpeed),
    masterMuted: asBool(r.masterMuted, b.masterMuted),
    musicVol: clampNum(r.musicVol, 0, 1, b.musicVol),
    sfxVol: clampNum(r.sfxVol, 0, 1, b.sfxVol),
    leftHanded: asBool(r.leftHanded, b.leftHanded),
  };
}

// --- persistence -------------------------------------------------------------
function readStore() {
  if (typeof localStorage === 'undefined') return makeDefaults();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return makeDefaults();
    return sanitize(JSON.parse(raw), makeDefaults());
  } catch {
    return makeDefaults();
  }
}
function writeStore(state) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

// In-memory cache (single source of truth for the page session).
let _state = readStore();

// --- subscribers -------------------------------------------------------------
const _listeners = new Set();
function emit() {
  const snap = getA11y();
  for (const cb of _listeners) { try { cb(snap); } catch {} }
}

/** Subscribe to settings changes. Returns an unsubscribe fn. */
export function onA11yChange(cb) {
  if (typeof cb !== 'function') return () => {};
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

// --- public getters/setters --------------------------------------------------
/** Return a defensive copy of the current settings. */
export function getA11y() {
  return { ...(_state || makeDefaults()) };
}

/**
 * Merge a partial patch into the settings, persist, apply side-effects, notify.
 * Unknown keys are ignored; out-of-range values are clamped.
 */
export function setA11y(patch) {
  _state = sanitize(patch, _state || makeDefaults());
  writeStore(_state);
  applySideEffects();
  emit();
  return getA11y();
}

/** Reset every setting back to defaults (reducedMotion re-reads the OS). */
export function resetA11y() {
  _state = makeDefaults();
  writeStore(_state);
  applySideEffects();
  emit();
  return getA11y();
}

// --- convenience accessors ---------------------------------------------------
/** True if motion should be reduced (explicit setting OR OS preference). */
export function prefersReducedMotion() {
  return !!(_state && _state.reducedMotion);
}
/** Multiplier (0.5–1.0) to scale per-frame dt by. */
export function getGameSpeedMul() {
  return _state ? _state.gameSpeed : 1.0;
}
/** Current text scale (1.0–2.0). */
export function getTextScale() {
  return _state ? _state.textScale : 1.0;
}
/** Effective volume (0–1) for a bus ('music' | 'sfx'); 0 when master-muted. */
export function getVolume(kind = 'sfx') {
  if (!_state || _state.masterMuted) return 0;
  return kind === 'music' ? _state.musicVol : _state.sfxVol;
}
/** True when the left-handed control layout is requested. */
export function isLeftHanded() {
  return !!(_state && _state.leftHanded);
}

// --- side-effects (browser only) ---------------------------------------------
function applySideEffects() {
  if (!HAS_DOM || !document.body) return;
  const s = _state || makeDefaults();
  const body = document.body;
  body.classList.toggle('reduced-motion', s.reducedMotion);
  body.classList.toggle('high-contrast', s.highContrast);
  // Colour-blind: exactly one of the cb-* classes (or none).
  for (const m of COLORBLIND_MODES) {
    if (m === 'none') continue;
    body.classList.toggle('cb-' + m, s.colorblindMode === m);
  }
  // Generic flag class is handy for CSS that only cares "is any CB mode on".
  body.classList.toggle('colorblind', s.colorblindMode !== 'none');
  // Text scale → CSS var on :root so layouts can multiply by it.
  try {
    const root = document.documentElement;
    if (root && root.style) root.style.setProperty('--a11y-text-scale', String(s.textScale));
  } catch {}
}

// Apply saved flags as soon as the DOM is ready (before any panel mounts), so
// the first paint already honours the user's stored preferences.
if (HAS_DOM) {
  const boot = () => { try { applySideEffects(); } catch {} };
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });
}

// --- optional UI panel -------------------------------------------------------
// Builds a keyboard-accessible settings panel from REAL form controls
// (<button>/<label>/<input>) with aria-labels + logical focus order. Returns a
// teardown object { element, destroy() }. No-op (returns null) outside a DOM.
let _panelStyles = false;
function ensurePanelStyles() {
  if (_panelStyles || !HAS_DOM) return;
  _panelStyles = true;
  const s = document.createElement('style');
  s.id = 'borkade-a11y-panel-styles';
  s.textContent = `
    .bk-a11y{font-family:inherit;color:inherit;display:flex;flex-direction:column;gap:10px;max-width:480px}
    .bk-a11y__row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .bk-a11y__row label{flex:1 1 auto;cursor:pointer}
    .bk-a11y__row input[type=range]{flex:0 1 200px;min-width:120px}
    .bk-a11y__row input[type=checkbox]{width:20px;height:20px;cursor:pointer}
    .bk-a11y__row select{min-height:32px;padding:2px 6px}
    .bk-a11y__val{min-width:48px;text-align:right;font-variant-numeric:tabular-nums}
    .bk-a11y__reset{align-self:flex-start;min-height:40px;padding:8px 16px;cursor:pointer}
    .bk-a11y :focus-visible{outline:3px solid #4cc9f0;outline-offset:2px}
    body.reduced-motion .bk-a11y *{transition:none!important;animation:none!important}
  `;
  document.head.appendChild(s);
}

/**
 * Mount the settings panel into `targetEl`. Every control reflects live state,
 * writes through setA11y(), and stays in sync if settings change elsewhere.
 * @returns {{element:HTMLElement, destroy:Function}|null}
 */
export function mountA11yPanel(targetEl) {
  if (!HAS_DOM || !targetEl || typeof targetEl.appendChild !== 'function') return null;
  ensurePanelStyles();

  const root = document.createElement('div');
  root.className = 'bk-a11y';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Accessibility settings');

  // Helper: labelled checkbox row.
  const mkCheck = (key, labelText) => {
    const row = document.createElement('div');
    row.className = 'bk-a11y__row';
    const id = 'bk-a11y-' + key;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.setAttribute('aria-label', labelText);
    input.addEventListener('change', () => setA11y({ [key]: input.checked }));
    row.append(label, input);
    return { row, input, kind: 'check', key };
  };

  // Helper: labelled range row with a numeric readout.
  const mkRange = (key, labelText, min, max, step, fmt) => {
    const row = document.createElement('div');
    row.className = 'bk-a11y__row';
    const id = 'bk-a11y-' + key;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'range';
    input.id = id;
    input.min = String(min); input.max = String(max); input.step = String(step);
    input.setAttribute('aria-label', labelText);
    const val = document.createElement('span');
    val.className = 'bk-a11y__val';
    val.setAttribute('aria-hidden', 'true');
    input.addEventListener('input', () => {
      const n = parseFloat(input.value);
      setA11y({ [key]: n });
      val.textContent = fmt(n);
      input.setAttribute('aria-valuetext', fmt(n));
    });
    row.append(label, input, val);
    return { row, input, val, kind: 'range', key, fmt };
  };

  // Helper: labelled select row.
  const mkSelect = (key, labelText, options) => {
    const row = document.createElement('div');
    row.className = 'bk-a11y__row';
    const id = 'bk-a11y-' + key;
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    const select = document.createElement('select');
    select.id = id;
    select.setAttribute('aria-label', labelText);
    for (const [v, txt] of options) {
      const o = document.createElement('option');
      o.value = v; o.textContent = txt;
      select.appendChild(o);
    }
    select.addEventListener('change', () => setA11y({ [key]: select.value }));
    row.append(label, select);
    return { row, select, kind: 'select', key };
  };

  const pct = (n) => Math.round(n * 100) + '%';

  // Logical focus order: motion/vision first, then control, then audio.
  const controls = [
    mkCheck('reducedMotion', 'Reduced motion'),
    mkCheck('highContrast', 'High contrast'),
    mkSelect('colorblindMode', 'Colour-blind mode', [
      ['none', 'Off'], ['protan', 'Protanopia'],
      ['deutan', 'Deuteranopia'], ['tritan', 'Tritanopia'],
    ]),
    mkRange('textScale', 'Text size', 1.0, 2.0, 0.1, pct),
    mkRange('gameSpeed', 'Game speed', 0.5, 1.0, 0.05, pct),
    mkCheck('leftHanded', 'Left-handed controls'),
    mkCheck('masterMuted', 'Mute all audio'),
    mkRange('musicVol', 'Music volume', 0, 1, 0.05, pct),
    mkRange('sfxVol', 'Sound effects volume', 0, 1, 0.05, pct),
  ];
  for (const c of controls) root.appendChild(c.row);

  // Reset button.
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'bk-a11y__reset';
  resetBtn.textContent = 'Reset to defaults';
  resetBtn.setAttribute('aria-label', 'Reset accessibility settings to defaults');
  resetBtn.addEventListener('click', () => resetA11y());
  root.appendChild(resetBtn);

  // Push current state into every control.
  const sync = () => {
    const s = getA11y();
    for (const c of controls) {
      const v = s[c.key];
      if (c.kind === 'check') c.input.checked = !!v;
      else if (c.kind === 'select') c.select.value = v;
      else if (c.kind === 'range') {
        c.input.value = String(v);
        c.val.textContent = c.fmt(v);
        c.input.setAttribute('aria-valuetext', c.fmt(v));
      }
    }
  };
  sync();

  // Keep the panel in sync if another surface (e.g. hub gear) changes settings.
  const unsub = onA11yChange(sync);

  targetEl.appendChild(root);
  return {
    element: root,
    destroy() { try { unsub(); } catch {} try { root.remove(); } catch {} },
  };
}

// Named bundle export for ergonomic `import * as a11y` usage.
export default {
  getA11y, setA11y, resetA11y, onA11yChange,
  prefersReducedMotion, getGameSpeedMul, getTextScale, getVolume, isLeftHanded,
  mountA11yPanel,
};
