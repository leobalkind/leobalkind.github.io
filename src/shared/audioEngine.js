// =============================================================================
// BORKADE ADAPTIVE AUDIO ENGINE — one shared procedural sound core.
// =============================================================================
// A singleton wrapping ONE AudioContext for every game. No audio files — all
// sound is synthesised on the fly (oscillators + a cached white-noise buffer).
//
// Usage:
//   import { audio } from '../../src/shared/audioEngine.js';
//   audio.unlock();                       // bind once; resumes on 1st gesture
//   audio.beep(440, 0.1, 'square');       // ADSR-shaped tone
//   audio.coin();  audio.kick();  audio.snare();  audio.hihat();
//   audio.setMusic({ drums, bass, lead, pad });  // 4 vertical stems
//   audio.setIntensity(0.7);              // fade stems in/out (0..1)
//   audio.playStinger([[660,0],[880,1]]); // beat-quantised phrase over the bed
//   audio.duck(200, -6);                  // dip music for a big event
//   audio.pan(node, 0.5);                 // StereoPanner helper
//   audio.setMusicVolume(0.6); audio.setSfxVolume(0.8); audio.setMuted(true);
//
// IMPORT-SAFE IN NODE: no Web Audio / window / document access at module load.
// Every browser API is reached behind a `typeof` guard and lazily, on the first
// user gesture. The pure helpers (dbToGain, beatTime, BPM math, the scheduler
// queue) work with no DOM at all so they can be unit-tested headless.
// =============================================================================

const STORE_KEY = 'borkade:audio';

const VOICE_CAP = 24;          // hard cap on simultaneously-sounding voices
const LOOKAHEAD_MS = 25;       // scheduler tick interval
const SCHEDULE_AHEAD = 0.1;    // schedule events due within the next 100ms
const RAMP0 = 0.003;           // ~3ms ramp-to-0 to avoid clicks
const NOISE_SECONDS = 2;       // length of the cached white-noise buffer
const STEM_FADE = 0.3;         // 300ms per-stem crossfade for vertical layers

// --- environment guards ------------------------------------------------------
const hasWindow = typeof window !== 'undefined';
const hasDocument = typeof document !== 'undefined';
const AC = hasWindow ? (window.AudioContext || window.webkitAudioContext) : undefined;

// --- pure helpers (no Web Audio, safe in Node) -------------------------------

// Decibels → linear gain multiplier. dbToGain(0)===1, dbToGain(-6)≈0.501.
export function dbToGain(db) {
  return Math.pow(10, db / 20);
}
// Linear gain → decibels (inverse of the above; guards log(0)).
export function gainToDb(gain) {
  return 20 * Math.log10(Math.max(1e-6, gain));
}
// Clamp a value to a range.
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
// Seconds per beat at a given BPM.
export function beatSeconds(bpm) {
  return 60 / bpm;
}
// Seconds per bar (beats-per-bar defaults to 4/4).
export function barSeconds(bpm, beatsPerBar = 4) {
  return beatSeconds(bpm) * beatsPerBar;
}
// Absolute time (relative to a base time) of beat index `beat` at `bpm`.
// beatTime(baseTime, 0, bpm) === baseTime; each beat adds 60/bpm seconds.
export function beatTime(baseTime, beat, bpm) {
  return baseTime + beat * beatSeconds(bpm);
}
// Time of the next bar boundary at/after `time`, given a grid anchored at `base`.
export function nextBarTime(time, base, bpm, beatsPerBar = 4) {
  const bar = barSeconds(bpm, beatsPerBar);
  const elapsed = Math.max(0, time - base);
  return base + Math.ceil(elapsed / bar - 1e-9) * bar;
}
// Time of the next beat boundary at/after `time`.
export function nextBeatTime(time, base, bpm) {
  const b = beatSeconds(bpm);
  const elapsed = Math.max(0, time - base);
  return base + Math.ceil(elapsed / b - 1e-9) * b;
}
// ±percent random pitch jitter (anti-repetition). jitter(440,0.2) ∈ [352,528].
export function jitter(freq, pct = 0.2) {
  return freq * (1 + (Math.random() * 2 - 1) * pct);
}

// A tiny priority queue keyed by scheduled time (ascending). Pure data
// structure — no audio — so the scheduler ordering can be tested in Node.
export class ScheduleQueue {
  constructor() { this._items = []; }
  get length() { return this._items.length; }
  // Insert keeping the array sorted ascending by `.time`.
  push(item) {
    const a = this._items;
    let lo = 0, hi = a.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid].time <= item.time) lo = mid + 1; else hi = mid;
    }
    a.splice(lo, 0, item);
    return this;
  }
  // Peek at the earliest item without removing it.
  peek() { return this._items[0]; }
  // Remove + return the earliest item.
  shift() { return this._items.shift(); }
  // Pull every item whose time is <= `time`, in ascending order.
  drainUntil(time) {
    const out = [];
    while (this._items.length && this._items[0].time <= time) out.push(this._items.shift());
    return out;
  }
  clear() { this._items.length = 0; }
}

// A round-robin pool that never returns the same entry twice in a row.
export class RoundRobin {
  constructor(items) { this._items = items.slice(); this._last = -1; }
  next() {
    const n = this._items.length;
    if (n === 0) return undefined;
    if (n === 1) return this._items[0];
    let i = Math.floor(Math.random() * n);
    if (i === this._last) i = (i + 1) % n;
    this._last = i;
    return this._items[i];
  }
}

// Read/write persisted prefs without throwing in Node or private mode.
function loadPrefs() {
  const def = { master: 1, music: 0.6, sfx: 0.7, muted: false };
  if (!hasWindow || typeof localStorage === 'undefined') return def;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return def;
    return Object.assign(def, JSON.parse(raw));
  } catch { return def; }
}
function savePrefs(p) {
  if (!hasWindow || typeof localStorage === 'undefined') return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch {}
}

// =============================================================================
// The engine.
// =============================================================================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.limiter = null;
    this._noiseBuf = null;
    this._noiseRate = 0;        // sampleRate the cached buffer was built at

    this.bpm = 120;
    this.beatsPerBar = 4;
    this._barBase = 0;          // ctx time the bar grid is anchored to

    this._voices = [];          // { node, t } active voices for stealing
    this._queue = new ScheduleQueue();
    this._timer = null;
    this._unlocked = false;
    this._bound = false;
    this._disabled = false;     // data-no-audio / disable() kill switch
    this._unavailable = !AC;    // no AudioContext at all → graceful no-op

    // Vertical-layer music state.
    this._stems = null;         // { name: { osc/loop fns, gain } }
    this._intensity = 0;

    this.prefs = loadPrefs();
    if (hasDocument && typeof document.documentElement !== 'undefined') {
      try {
        if (document.documentElement.hasAttribute('data-no-audio')) this._disabled = true;
      } catch {}
    }
  }

  // --- availability -----------------------------------------------------------
  get enabled() { return !this._disabled && !this._unavailable; }

  // Disable permanently for this page (kill switch). Tears the graph down.
  disable() {
    this._disabled = true;
    this.dispose();
  }

  // --- lazy context -----------------------------------------------------------
  // Create the AudioContext + bus graph on first need. Returns the ctx or null.
  _ensure() {
    if (!this.enabled) return null;
    if (this.ctx) return this.ctx;
    if (!AC) { this._unavailable = true; return null; }
    try {
      this.ctx = new AC();
    } catch { this._unavailable = true; return null; }

    const ctx = this.ctx;
    // master → limiter → destination
    this.master = ctx.createGain();
    this.limiter = ctx.createDynamicsCompressor();
    // Soft brickwall-ish limiter to tame stacked voices.
    try {
      this.limiter.threshold.value = -6;
      this.limiter.knee.value = 6;
      this.limiter.ratio.value = 12;
      this.limiter.attack.value = 0.003;
      this.limiter.release.value = 0.25;
    } catch {}
    this.master.connect(this.limiter);
    this.limiter.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.sfxBus = ctx.createGain();
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);

    this._applyVolumes();
    this._barBase = ctx.currentTime;
    this._buildNoise();
    return ctx;
  }

  _applyVolumes() {
    if (!this.master) return;
    const p = this.prefs;
    const m = p.muted ? 0 : p.master;
    try {
      this.master.gain.value = m;
      this.musicBus.gain.value = p.music;
      this.sfxBus.gain.value = p.sfx;
    } catch {}
  }

  // Build (or rebuild after a sample-rate swap) the shared white-noise buffer.
  _buildNoise() {
    const ctx = this.ctx;
    if (!ctx) return null;
    if (this._noiseBuf && this._noiseRate === ctx.sampleRate) return this._noiseBuf;
    const len = Math.floor(NOISE_SECONDS * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this._noiseBuf = buf;
    this._noiseRate = ctx.sampleRate;
    return buf;
  }

  now() { return this.ctx ? this.ctx.currentTime : 0; }

  // --- voice management -------------------------------------------------------
  // Register a source so the cap can steal the oldest voice when over budget.
  _track(node) {
    const v = { node, t: this.ctx ? this.ctx.currentTime : 0 };
    this._voices.push(v);
    if (this._voices.length > VOICE_CAP) {
      const oldest = this._voices.shift();
      try { oldest.node.stop(); } catch {}
      try { oldest.node.disconnect(); } catch {}
    }
    // Self-cleanup on natural end.
    try {
      node.onended = () => {
        const i = this._voices.indexOf(v);
        if (i !== -1) this._voices.splice(i, 1);
      };
    } catch {}
    return node;
  }

  // --- synth primitives -------------------------------------------------------
  // ADSR-shaped tone. opts: { peak, attack, decay, sustain, release, detune,
  //   dest, when, vibrato, vibratoDepth }. `when` is an absolute ctx time.
  beep(freq, dur = 0.12, type = 'square', opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const {
      peak = 0.18, attack = 0.005, decay = 0, sustain = 1,
      release = RAMP0, detune = 0, dest = this.sfxBus, when = ctx.currentTime,
      pitchVary = 0.2, vibrato = 0, vibratoDepth = 0,
    } = opts;
    const f = pitchVary ? jitter(freq, pitchVary) : freq;
    const t0 = Math.max(when, ctx.currentTime);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (detune) o.detune.setValueAtTime(detune, t0);

    const g = ctx.createGain();
    const susLevel = peak * clamp(sustain, 0, 1);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + attack);
    if (decay > 0) g.gain.linearRampToValueAtTime(susLevel, t0 + attack + decay);
    const endHold = t0 + Math.max(attack + decay, dur);
    g.gain.setValueAtTime(Math.max(0.0001, susLevel), endHold);
    g.gain.exponentialRampToValueAtTime(0.0001, endHold + Math.max(RAMP0, release));
    // Always finish flat at 0 to kill the click exponential leaves behind.
    g.gain.linearRampToValueAtTime(0, endHold + Math.max(RAMP0, release) + RAMP0);

    o.connect(g).connect(dest || this.sfxBus);

    let lfo = null;
    if (vibrato > 0 && vibratoDepth > 0) {
      lfo = ctx.createOscillator();
      lfo.frequency.value = vibrato;
      const lg = ctx.createGain();
      lg.gain.value = vibratoDepth;
      lfo.connect(lg).connect(o.frequency);
      lfo.start(t0);
      lfo.stop(endHold + release + 0.05);
    }
    const stopAt = endHold + Math.max(RAMP0, release) + RAMP0 + 0.01;
    o.start(t0);
    o.stop(stopAt);
    this._track(o);
    return { osc: o, gain: g, lfo };
  }

  // Frequency sweep via exponentialRamp (portamento glide / whoosh).
  sweep(f0, f1, dur = 0.2, type = 'sawtooth', opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const { peak = 0.18, dest = this.sfxBus, when = ctx.currentTime, pitchVary = 0 } = opts;
    const a = pitchVary ? jitter(f0, pitchVary) : f0;
    const b = pitchVary ? jitter(f1, pitchVary) : f1;
    const t0 = Math.max(when, ctx.currentTime);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(1, a), t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, b), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.gain.linearRampToValueAtTime(0, t0 + dur + RAMP0);
    o.connect(g).connect(dest || this.sfxBus);
    o.start(t0);
    o.stop(t0 + dur + RAMP0 + 0.01);
    this._track(o);
    return { osc: o, gain: g };
  }

  // White-noise burst, optional highpass. Reuses the cached buffer.
  noiseHit(dur = 0.1, opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const { peak = 0.2, hp = 0, lp = 0, dest = this.sfxBus, when = ctx.currentTime } = opts;
    const buf = this._buildNoise();
    if (!buf) return null;
    const t0 = Math.max(when, ctx.currentTime);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;                  // 2s buffer loops to cover any dur
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.gain.linearRampToValueAtTime(0, t0 + dur + RAMP0);
    let node = src;
    if (hp) {
      const f = ctx.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = hp;
      node.connect(f); node = f;
    }
    if (lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = lp;
      node.connect(f); node = f;
    }
    node.connect(g).connect(dest || this.sfxBus);
    src.start(t0);
    src.stop(t0 + dur + RAMP0 + 0.01);
    this._track(src);
    return { src, gain: g };
  }

  // --- drum kit ---------------------------------------------------------------
  kick(when, opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const t0 = Math.max(when || ctx.currentTime, ctx.currentTime);
    return this.sweep(120, 40, opts.dur || 0.18, 'sine',
      { peak: opts.peak ?? 0.5, dest: opts.dest, when: t0, pitchVary: 0 });
  }
  snare(when, opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const t0 = Math.max(when || ctx.currentTime, ctx.currentTime);
    this.beep(180, 0.08, 'triangle', { peak: 0.18, when: t0, dest: opts.dest, pitchVary: 0 });
    return this.noiseHit(0.12, { peak: opts.peak ?? 0.25, hp: 1200, when: t0, dest: opts.dest });
  }
  hihat(when, opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const t0 = Math.max(when || ctx.currentTime, ctx.currentTime);
    return this.noiseHit(opts.open ? 0.18 : 0.04,
      { peak: opts.peak ?? 0.12, hp: 7000, when: t0, dest: opts.dest });
  }

  // --- gameplay one-shots -----------------------------------------------------
  // Ascending arpeggio — coin / pickup.
  coin(opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    const base = (opts.base || 988);
    const step = beatSeconds(this.bpm) * 0.12;
    const t0 = ctx.currentTime;
    this.beep(base, 0.05, 'square', { peak: 0.16, when: t0, pitchVary: 0.05 });
    this.beep(base * 1.5, 0.09, 'square', { peak: 0.18, when: t0 + step, pitchVary: 0.05 });
    return null;
  }
  // Descending sweep + noise — hit / damage.
  hit(opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx) return null;
    this.sweep(opts.from || 420, opts.to || 90, 0.18, 'sawtooth', { peak: 0.2 });
    this.noiseHit(0.12, { peak: 0.14, lp: 1800 });
    return null;
  }

  // --- scheduler --------------------------------------------------------------
  // Queue a callback to fire at absolute ctx time `time`. The callback receives
  // that exact time so it can schedule sample-accurate audio against it.
  schedule(time, fn) {
    this._queue.push({ time, fn });
    this._startTimer();
    return this;
  }

  _startTimer() {
    if (this._timer != null) return;
    if (!hasWindow || typeof setInterval === 'undefined') return;
    this._timer = setInterval(() => this._tick(), LOOKAHEAD_MS);
  }
  _stopTimer() {
    if (this._timer != null && typeof clearInterval !== 'undefined') clearInterval(this._timer);
    this._timer = null;
  }
  _tick() {
    const ctx = this.ctx;
    if (!ctx) { if (!this._queue.length) this._stopTimer(); return; }
    const horizon = ctx.currentTime + SCHEDULE_AHEAD;
    const due = this._queue.drainUntil(horizon);
    for (const ev of due) {
      try { ev.fn(ev.time); } catch {}
    }
    if (!this._queue.length && !this._stems) this._stopTimer();
  }

  // --- ducking / stingers -----------------------------------------------------
  // Dip the music bus by `amountDb` for `ms` then restore (sidechain feel).
  duck(ms = 200, amountDb = -6) {
    const ctx = this._ensureForPlay();
    if (!ctx || !this.musicBus) return;
    const g = this.musicBus.gain;
    const now = ctx.currentTime;
    const target = this.prefs.music * dbToGain(amountDb);
    try {
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(Math.max(0.0001, target), now + 0.03);
      g.linearRampToValueAtTime(this.prefs.music, now + ms / 1000);
    } catch {}
  }

  // Play a short phrase over the music bed, quantised to the next beat.
  // `notes` is an array of [freq, beatOffset, dur?, type?].
  playStinger(notes, opts = {}) {
    const ctx = this._ensureForPlay();
    if (!ctx || !Array.isArray(notes)) return;
    const dest = opts.dest || this.sfxBus;
    const start = nextBeatTime(ctx.currentTime + 0.02, this._barBase, this.bpm);
    for (const n of notes) {
      const [freq, beatOff = 0, dur = 0.18, type = 'triangle'] = n;
      this.beep(freq, dur, type, {
        peak: opts.peak ?? 0.18, when: beatTime(start, beatOff, this.bpm),
        dest, pitchVary: 0,
      });
    }
  }

  // --- vertical-layer adaptive music -----------------------------------------
  // `stems` maps a name → a function `(engine, when, stemGain)=>void` that
  // schedules one bar of that stem; OR an object { play(engine,when,gain) }.
  // All stems run continuously; only their per-stem gain changes with intensity.
  setMusic(stems) {
    const ctx = this._ensureForPlay();
    if (!ctx) { this._pendingStems = stems; return; }
    this.stopMusic();
    const names = Object.keys(stems || {});
    if (names.length === 0) return;
    this._stems = {};
    names.forEach((name) => {
      const g = ctx.createGain();
      g.gain.value = 0;            // start silent; intensity fades them in
      g.connect(this.musicBus);
      this._stems[name] = { def: stems[name], gain: g };
    });
    this._musicLoopAt(nextBarTime(ctx.currentTime + 0.05, this._barBase, this.bpm, this.beatsPerBar));
    this.setIntensity(this._intensity);
  }

  // Schedule one bar of every stem, then re-schedule itself at the next bar.
  _musicLoopAt(when) {
    if (!this._stems || !this.ctx) return;
    const bar = barSeconds(this.bpm, this.beatsPerBar);
    for (const name of Object.keys(this._stems)) {
      const s = this._stems[name];
      const fn = typeof s.def === 'function' ? s.def : (s.def && s.def.play);
      if (fn) { try { fn(this, when, s.gain); } catch {} }
    }
    // Re-arm shortly before this bar ends.
    this.schedule(when + bar - SCHEDULE_AHEAD, () => this._musicLoopAt(when + bar));
  }

  // Map intensity 0..1 to how many stems are audible. The first stem is the
  // always-on bed; later stems enter as intensity rises (300ms fades).
  setIntensity(level) {
    this._intensity = clamp(level, 0, 1);
    if (!this._stems || !this.ctx) return;
    const names = Object.keys(this._stems);
    const n = names.length;
    const active = 1 + Math.round(this._intensity * (n - 1));
    const now = this.ctx.currentTime;
    names.forEach((name, i) => {
      const g = this._stems[name].gain.gain;
      const target = i < active ? 1 : 0;
      try {
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(target, now + STEM_FADE);
      } catch {}
    });
  }

  stopMusic() {
    if (this._stems && this.ctx) {
      for (const name of Object.keys(this._stems)) {
        try { this._stems[name].gain.disconnect(); } catch {}
      }
    }
    this._stems = null;
    this._pendingStems = null;
  }

  // --- stereo -----------------------------------------------------------------
  // Insert a StereoPannerNode between `node` and the sfx bus. Returns the
  // panner (or the node unchanged if panning is unsupported).
  pan(node, x = 0) {
    const ctx = this._ensureForPlay();
    if (!ctx || !node) return node;
    try {
      const p = ctx.createStereoPanner();
      p.pan.value = clamp(x, -1, 1);
      node.connect(p);
      p.connect(this.sfxBus);
      return p;
    } catch { return node; }
  }

  // --- unlock / lifecycle -----------------------------------------------------
  // Bind one-shot unlock to the gestures iOS requires (touchstart+touchend+
  // click). Safe to call repeatedly; only binds once.
  unlock() {
    if (!this.enabled || this._bound || !hasDocument) return this;
    this._bound = true;
    const handler = () => {
      const ctx = this._ensure();
      if (!ctx) { teardown(); return; }
      ctx.resume && ctx.resume();
      // Play a silent buffer to satisfy iOS unlock.
      try {
        const b = ctx.createBuffer(1, 1, ctx.sampleRate);
        const s = ctx.createBufferSource();
        s.buffer = b; s.connect(ctx.destination); s.start(0);
      } catch {}
      this._unlocked = true;
      teardown();
    };
    const teardown = () => {
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('touchend', handler);
      document.removeEventListener('click', handler);
    };
    document.addEventListener('touchstart', handler, { passive: true });
    document.addEventListener('touchend', handler, { passive: true });
    document.addEventListener('click', handler);
    // Re-resume / suspend with page visibility.
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) this.suspend(); else this.resume();
      });
    }
    return this;
  }

  resume() { const c = this.ctx; if (c && c.resume) try { c.resume(); } catch {} ; return this; }
  suspend() { const c = this.ctx; if (c && c.suspend) try { c.suspend(); } catch {} ; return this; }

  // --- volume / mute ----------------------------------------------------------
  setMasterVolume(v) { this.prefs.master = clamp(v, 0, 1); savePrefs(this.prefs); this._applyVolumes(); }
  setMusicVolume(v) { this.prefs.music = clamp(v, 0, 1); savePrefs(this.prefs); this._applyVolumes(); }
  setSfxVolume(v) { this.prefs.sfx = clamp(v, 0, 1); savePrefs(this.prefs); this._applyVolumes(); }
  setMuted(m) { this.prefs.muted = !!m; savePrefs(this.prefs); this._applyVolumes(); }
  toggleMuted() { this.setMuted(!this.prefs.muted); return this.prefs.muted; }
  isMuted() { return !!this.prefs.muted; }

  setBpm(bpm) { this.bpm = Math.max(1, bpm); return this; }

  // --- teardown ---------------------------------------------------------------
  dispose() {
    this._stopTimer();
    this._queue.clear();
    this.stopMusic();
    for (const v of this._voices) { try { v.node.stop(); } catch {} try { v.node.disconnect(); } catch {} }
    this._voices.length = 0;
    if (this.ctx) { try { this.ctx.close(); } catch {} }
    this.ctx = this.master = this.musicBus = this.sfxBus = this.limiter = null;
    this._noiseBuf = null;
    this._unlocked = false;
  }

  // Lazily resume + ensure the graph right before scheduling any audio.
  _ensureForPlay() {
    const ctx = this._ensure();
    if (ctx && ctx.state === 'suspended') this.resume();
    if (ctx && this._pendingStems) { const s = this._pendingStems; this._pendingStems = null; this.setMusic(s); }
    return ctx;
  }
}

// =============================================================================
// Singleton — every game shares this one instance / one AudioContext.
// =============================================================================
export const audio = new AudioEngine();
export default audio;
