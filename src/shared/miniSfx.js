// Tiny shared WebAudio synth for mini-games.
// Usage:
//   import { createSfx } from '../../src/shared/miniSfx.js';
//   const sfx = createSfx({ storageKey: 'pug-tongue:muted' });
//   sfx.tone(880, 'triangle', 0.1, 0.2);
//   sfx.toggleMute();
//   sfx.applyButton(document.getElementById('mute-btn'));
export function createSfx({ storageKey = 'wg:muted' } = {}) {
  let actx = null;
  let muted = localStorage.getItem(storageKey) === '1';
  const audio = () => {
    if (actx) return actx;
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    return actx;
  };
  const tone = (freq, type = 'square', dur = 0.08, peak = 0.18) => {
    if (muted) return;
    const c = audio(); if (!c) return;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  };
  const sweep = (f0, f1, type = 'sawtooth', dur = 0.2, peak = 0.18) => {
    if (muted) return;
    const c = audio(); if (!c) return;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start(); o.stop(c.currentTime + dur + 0.02);
  };
  const noise = (dur = 0.1, peak = 0.2, hp = 0) => {
    if (muted) return;
    const c = audio(); if (!c) return;
    const buf = c.createBuffer(1, Math.floor(dur * c.sampleRate), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(peak, c.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    if (hp) {
      const f = c.createBiquadFilter();
      f.type = 'highpass'; f.frequency.value = hp;
      src.connect(f).connect(g).connect(c.destination);
    } else {
      src.connect(g).connect(c.destination);
    }
    src.start(); src.stop(c.currentTime + dur + 0.02);
  };
  const arp = (freqs, type = 'square', step = 0.07, peak = 0.2, dur = 0.3) => {
    freqs.forEach((f, i) => setTimeout(() => tone(f, type, dur, peak), i * step * 1000));
  };
  const isMuted = () => muted;
  const setMuted = (v) => { muted = !!v; localStorage.setItem(storageKey, muted ? '1' : '0'); };
  const toggleMute = () => { setMuted(!muted); return muted; };
  const resume = () => audio()?.resume?.();
  const applyButton = (btn) => {
    if (!btn) return;
    const sync = () => { btn.textContent = muted ? '🔇' : '🔊'; btn.classList.toggle('muted', muted); };
    sync();
    btn.addEventListener('click', () => { resume(); toggleMute(); sync(); });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if ((e.key === 'm' || e.key === 'M') && !/^(INPUT|TEXTAREA)$/.test(e.target?.tagName)) {
        toggleMute(); sync();
      }
    });
  };
  // Auto-resume the audio context on first user interaction (mobile autoplay policy).
  const _resumeOnce = () => { resume(); document.removeEventListener('pointerdown', _resumeOnce); document.removeEventListener('keydown', _resumeOnce); };
  document.addEventListener('pointerdown', _resumeOnce, { once: false });
  document.addEventListener('keydown', _resumeOnce, { once: false });
  return { tone, sweep, noise, arp, isMuted, setMuted, toggleMute, resume, applyButton };
}
