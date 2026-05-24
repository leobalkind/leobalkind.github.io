// =============================================================================
// BACKROOMS 3D — first-person horror crawl through the iconic yellow rooms.
//
// Architecture (v2 — polish round 2):
//   1. Lazy-load Three.js so the hub page never pulls in ~600kB it doesn't need.
//   2. Build canvas textures (wallpaper / carpet / ceiling / pipes / void) per
//      LEVEL so each tier feels distinct without shipping image assets.
//   3. Procedural maze of 4m cells; expand outward as the player walks (the
//      "endless" feel — every chunk-boundary cross triggers a regen wave).
//      Now seeds in occasional LARGE ROOMS (8x8), HALLWAYS (1-wide corridors),
//      and NICHES (tiny dead-end alcoves with hide spots) for variety.
//   4. Per-cell meshes with frustum culling. Each cell can also carry doodads:
//      hiding closets, light switches, level-exit doors, warehouse crates,
//      rusty pipes, etc. The doodad set varies by current LEVEL.
//   5. Per-fixture flicker + dying lights drive the unsettling vibe; light
//      intensity also tints toward the level's mood (yellow → grey → cyan → near-black).
//   6. THREE monster archetypes:
//        a) CHASER (the existing billboard pug) — physical pursuer; faster on
//           higher levels.
//        b) SHADOW — pure-black silhouette that flickers in/out at edges of
//           the player's view; psychological, drains sanity if stared at.
//        c) WHISPER — stationary far-away silhouette that whispers via audio;
//           sanity drain when looked at from distance.
//   7. LEVELS 1–4 with explicit transitions. Each level changes textures,
//      fog, light tone, monster intensity, and audio palette. Reaching the
//      LEVEL 4 EXIT DOOR triggers the win cutscene.
//   8. Audio is co-owned with Agent B in ./audio.js — we just call into it.
//      New events: door slam, distant cries, level-transition stinger.
//
// State machine: BOOT → MENU → PLAY → PAUSED → WINNING → WIN → DEAD → MENU.
// =============================================================================

import { createMobileControls } from '../../src/shared/mobileControls.js';
import { createSettingsMenu, getMasterGain } from '../../src/shared/settingsMenu.js';
import { submitRun, loadBest } from '../../src/persistence/highScores.js';

// =============================================================================
// BOOT — wrapped in an async IIFE because top-level await is not supported by
// our build target (Vite defaults to es2020 + chrome87/safari14, none of which
// allow top-level await in modules). The IIFE preserves the dynamic-import
// patterns we want (Three.js + audio.js lazy-loaded) while staying ES2020.
// =============================================================================
(async () => {

// ---------------------------------------------------------------------------
// Audio — Agent B owns ./audio.js. It exports `createAudio()` which returns a
// controller. We instantiate the controller now, but only call `start()` once
// the player clicks ENTER (browser autoplay policy needs a user gesture).
// Wrapped in a try/catch fallback so the game still boots if the module fails
// to resolve during the parallel-build phase.
// ---------------------------------------------------------------------------
let audio = null;
try {
  const audioMod = await import('./audio.js').catch(() => null);
  audio = audioMod?.createAudio ? audioMod.createAudio() : null;
} catch { audio = null; }
// Safe wrappers — every audio helper no-ops if audio.js never loaded or if the
// engine hasn't been started yet (we explicitly start it on click-to-enter).
const playFootstep = (s) => { try { audio?.playFootstep?.(s); } catch {} };
const playBuzz = (i) => { try { audio?.playBuzz?.(i); } catch {} };
const playFlicker = () => { try { audio?.playFlicker?.(); } catch {} };
const playMonsterFar = (d, p) => { try { audio?.playMonsterFar?.(d, p); } catch {} };
const playJumpscare = () => { try { audio?.playJumpscare?.(); } catch {} };
const playAmbience = (v) => { try { audio?.playAmbience?.(v); } catch {} };
const startAudio = () => { try { audio?.start?.(); } catch {} };
// Stop currently unused on this surface; kept ergonomic in case future flow
// needs to tear audio down between scenes.
// const stopAudio = () => { try { audio?.stop?.(); } catch {} };
const updateMonsterDistance = (d) => { try { audio?.updateDistance?.(d); } catch {} };
// New atmospheric oneshots (defined in audio.js v2).
const playDoorSlam = (vol) => { try { audio?.playDoorSlam?.(vol); } catch {} };
const playDistantCry = () => { try { audio?.playDistantCry?.(); } catch {} };
const playWhisper = () => { try { audio?.playWhisper?.(); } catch {} };
const playLevelSting = (lvl) => { try { audio?.playLevelSting?.(lvl); } catch {} };
const playWinChord = () => { try { audio?.playWinChord?.(); } catch {} };
const playSwitchClick = () => { try { audio?.playSwitchClick?.(); } catch {} };
const playSteam = (v) => { try { audio?.playSteam?.(v); } catch {} };
const playDrip = () => { try { audio?.playDrip?.(); } catch {} };
// v3 polish-round-3 additions:
const playPaperPickup = () => { try { audio?.playPaperPickup?.(); } catch {} };
const playMapBlip = () => { try { audio?.playMapBlip?.(); } catch {} };
const playThrow = () => { try { audio?.playThrow?.(); } catch {} };
const playRockClack = (vol, pan) => { try { audio?.playRockClack?.(vol, pan); } catch {} };
const playStalkerStep = (pan) => { try { audio?.playStalkerStep?.(pan); } catch {} };
const playCrouchRustle = () => { try { audio?.playCrouchRustle?.(); } catch {} };
const playObjectiveDing = () => { try { audio?.playObjectiveDing?.(); } catch {} };

// ---------------------------------------------------------------------------
// SETTINGS MENU — wired the same way every other game does. The gear button
// auto-appears in the top-right; controls help shows on hover/click for
// keyboard accessibility.
// ---------------------------------------------------------------------------
const _isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
createSettingsMenu({
  gameId: 'backrooms-3d',
  getControlsHelp: () => _isTouch
    ? 'JOYSTICK walk · DRAG to look · SPRINT/CROUCH/USE/THROW buttons · Find the red EXIT.'
    : 'WASD walk · SHIFT sprint · C crouch · Q throw rock · E use · ESC pause · Find the red EXIT.',
});

// ---------------------------------------------------------------------------
// LAZY THREE.JS — dynamic import. Bundle stays out of the hub page entirely;
// only loads when this file executes (i.e. the player clicked the card).
// ---------------------------------------------------------------------------
const THREE = await import('three');

// =============================================================================
// CONSTANTS — tweak knobs for the whole game.
// =============================================================================
const CELL = 4;                  // metres per maze cell
const ROOM_H = 3.5;              // ceiling height
const PLAYER_H = 1.6;             // eye height
const PLAYER_RADIUS = 0.3;        // collision radius
const WALK_SPEED = 3.6;           // m/s
const SPRINT_MULT = 1.7;          // shift / sprint button multiplier
const MOUSE_SENS = 0.0024;        // rad per pixel
const TOUCH_SENS = 0.0035;        // rad per pixel (touch drag-look — softer for thumb-drag)
const RENDER_RADIUS = 10;         // cells around player to render (=> 20x20 chunk)
const REGEN_THRESHOLD = 16;       // when player within N cells of edge, expand maze
const CHUNK_SIZE = 30;            // cells added per regen pass
// Monster tuning
const MONSTER_HEIGHT = 1.7;
const MONSTER_WANDER_SPEED = 1.6;
const MONSTER_HUNT_SPEED = 3.1;
const MONSTER_DETECT_DIST = 50;
const MONSTER_CATCH_DIST = 1.6;
const MONSTER_TELEPORT_INTERVAL = 30; // seconds without sighting → relocate
// Sanity
const SANITY_DRAIN_BASE = 0.6;       // per second when not in light
const SANITY_DRAIN_MONSTER = 4.0;    // per second when monster within 25m
const SANITY_DRAIN_STARE = 6.0;      // per second when staring at a shadow/whisper
const SANITY_RECOVER_LIGHT = 0.4;    // per second when standing under a fixture
// Progression
const CELLS_PER_LEVEL = 20;          // every N unique visited cells, advance level
const HIDE_IMMUNITY_SEC = 7;         // closet hideout duration
const HIDE_COOLDOWN_SEC = 25;        // before the same closet can be used again
// v3 — stamina (sprint) drain/recovery rates. 100 stamina max.
const STAMINA_MAX = 100;
const STAMINA_DRAIN = 28;            // units per second sprinting
const STAMINA_REGEN = 16;            // units per second standing / walking
const STAMINA_REGEN_DELAY = 1.2;     // seconds after sprint stops before regen kicks in
const STAMINA_SPRINT_MIN = 8;        // can't initiate sprint below this
// v3 — crouch movement multiplier + camera height delta.
const CROUCH_SPEED = 0.55;
const CROUCH_HEIGHT_DROP = 0.55;    // metres dropped from PLAYER_H
const CROUCH_FOOTSTEP_VOL = 0.35;   // multiplier for footstep audio
// v3 — STALKER: a 4th monster that mimics player footsteps from offset behind.
const STALKER_FOLLOW_DIST = 7;       // metres behind the player when stalking
const STALKER_STEP_CADENCE_OFFSET = 0.15; // seconds; fires a fake step after each real one
const STALKER_MIN_LEVEL = 1;         // doesn't appear in Lobby
// v3 — throwable rocks: how many we can carry + how far they go.
const ROCK_MAX_CARRY = 5;
const ROCK_THROW_SPEED = 18;         // m/s
const ROCK_GRAVITY = 12;             // m/s² (light — they arc gently)
const ROCK_NOISE_RADIUS = 18;        // monster detects up to this dist

// =============================================================================
// LEVEL DEFINITIONS — each level paints the world differently. We swap
// materials + scene fog when the player advances. Doodad/monster intensity
// scales with depth so the player feels the world close in.
// =============================================================================
const LEVELS = [
  // Level 0 — THE LOBBY (classic backrooms)
  {
    id: 0, name: 'THE LOBBY',
    fogColor: 0xb8a040, fogDensity: 0.025,
    ambient: { color: 0x141308, intensity: 0.85 },
    lightTone: 0xfff4c0,
    sky: 0x0a0806,
    monsterScale: 1.0,           // base monster speed
    shadowChance: 0.10,           // chance/sec to spawn shadow flicker
    whisperChance: 0.15,          // chance to seed a far whisper
    chaserBonus: 0,               // hunt speed multiplier
    showSteam: false,
    // v3 — per-level objective. The player completes it implicitly via
    // tracked stats; we surface it on the HUD and the pause overlay.
    objective: 'Walk 20 rooms to find the descent.',
    objectiveKind: 'walk', objectiveTarget: 20,
  },
  // Level 1 — THE WAREHOUSE (concrete + crates, dim light)
  {
    id: 1, name: 'THE WAREHOUSE',
    fogColor: 0x4a4640, fogDensity: 0.040,
    ambient: { color: 0x0c0d0e, intensity: 0.55 },
    lightTone: 0xc8d4e0,
    sky: 0x080808,
    monsterScale: 1.15,
    shadowChance: 0.20,
    whisperChance: 0.25,
    chaserBonus: 0.4,
    showSteam: false,
    objective: 'Collect 3 notes between the crates.',
    objectiveKind: 'notes', objectiveTarget: 3,
  },
  // Level 2 — THE PIPES (rust, steam, dripping water)
  {
    id: 2, name: 'THE PIPES',
    fogColor: 0x2a1a10, fogDensity: 0.055,
    ambient: { color: 0x0a0604, intensity: 0.50 },
    lightTone: 0xff9050,
    sky: 0x050302,
    monsterScale: 1.3,
    shadowChance: 0.30,
    whisperChance: 0.35,
    chaserBonus: 0.8,
    showSteam: true,
    objective: 'Flip 2 light switches to stabilise the grid.',
    objectiveKind: 'switches', objectiveTarget: 2,
  },
  // Level 3 — THE VOID (almost pure dark; flashlight halo only)
  {
    id: 3, name: 'THE VOID',
    fogColor: 0x000000, fogDensity: 0.13,
    ambient: { color: 0x000000, intensity: 0.10 },
    lightTone: 0x80a0ff,
    sky: 0x000000,
    monsterScale: 1.4,
    shadowChance: 0.45,
    whisperChance: 0.50,
    chaserBonus: 1.0,
    showSteam: false,
    objective: 'Find the red EXIT door and escape.',
    objectiveKind: 'exit', objectiveTarget: 1,
  },
];

// =============================================================================
// NOTE TEXTS — cryptic backstory snippets. Picked deterministically by cellRandom
// so the same cell always yields the same note across regens. Kept short — they
// appear in an overlay for 5s.
// =============================================================================
const NOTE_TEXTS = [
  "Day 14. The hum doesn't stop. I think it's getting louder.",
  "There are no doors. Only rooms. Only more rooms.",
  "He smiles when the lights flicker. Don't look up.",
  "The yellow is wrong. It was never this colour outside.",
  "If you find this, you stayed too long. Go back.",
  "Sanity is the price of looking back at the eyes.",
  "I counted to four. Four floors. Four chances.",
  "The closet saved me once. It will not save me twice.",
  "Some of the footsteps aren't yours. Test them.",
  "When the pipes scream, the lower one opens.",
  "Below the void there is nothing. Above the void, also nothing.",
  "The exit is red. Everything red is the exit. Almost.",
  "We are not the first. We will not be the last.",
  "Don't trust the silence. It is the loudest thing here.",
  "The shadow is just you. Until it isn't.",
];

// =============================================================================
// CANVAS TEXTURES — procedural so we ship zero image assets. Each texture is
// a small 256/512px canvas drawn once at boot and reused via NearestFilter for
// the crunchy pixel-art look the spec calls for.
//
// Each level has its own wall/floor texture set. We build them all up front
// (cheap — 256x256 canvases) and swap material maps when the level changes.
// =============================================================================
function makeWallpaperTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  // Base yellow wallpaper (#c8a93f).
  g.fillStyle = '#c8a93f'; g.fillRect(0, 0, 256, 256);
  // Vertical stripes — darker tone (#b89030), 8px wide, every 24px.
  g.fillStyle = '#b89030';
  for (let x = 0; x < 256; x += 24) {
    g.fillRect(x, 0, 8, 256);
  }
  // Subtle horizontal woodgrain to break perfect vertical repeat.
  g.globalAlpha = 0.06;
  g.fillStyle = '#000';
  for (let y = 0; y < 256; y += 4) {
    g.fillRect(0, y, 256, 1);
  }
  g.globalAlpha = 1;
  // Water stains — random brown blobs.
  for (let i = 0; i < 6; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 18 + Math.random() * 30;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(80, 50, 12, 0.35)');
    grad.addColorStop(0.5, 'rgba(80, 50, 12, 0.18)');
    grad.addColorStop(1, 'rgba(80, 50, 12, 0)');
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  g.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let i = 0; i < 60; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  return toTex(c);
}

function makeCarpetTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#6b5a3e'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, v = 0.5 + Math.random() * 0.5;
    g.fillStyle = `rgba(${Math.floor(40 * v)}, ${Math.floor(30 * v)}, ${Math.floor(20 * v)}, 0.6)`;
    g.fillRect(x, y, 1, 1);
  }
  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 12 + Math.random() * 28;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(20, 10, 4, 0.5)');
    grad.addColorStop(0.6, 'rgba(20, 10, 4, 0.2)');
    grad.addColorStop(1, 'rgba(20, 10, 4, 0)');
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  return toTex(c);
}

function makeCeilingTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#dcd6c8'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#a89c80'; g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 128); g.lineTo(256, 128);
  g.moveTo(128, 0); g.lineTo(128, 256);
  g.stroke();
  g.globalAlpha = 0.18; g.fillStyle = '#988a70';
  for (let i = 0; i < 20; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  g.globalAlpha = 1;
  return toTex(c);
}

// ---- Level 1 — WAREHOUSE (raw concrete + rivets) ----------------------------
function makeConcreteTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#5a5048'; g.fillRect(0, 0, 256, 256);
  // Noise speckle for cement grit.
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    const v = 30 + Math.random() * 70;
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(x, y, 1, 1);
  }
  // Streak cracks.
  g.strokeStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 8; i++) {
    g.lineWidth = 0.5 + Math.random();
    g.beginPath();
    let x = Math.random() * 256, y = Math.random() * 256;
    g.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // Rivets in a faint grid.
  g.fillStyle = '#2c2620';
  for (let y = 32; y < 256; y += 64) for (let x = 32; x < 256; x += 64) {
    g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
  }
  return toTex(c);
}
function makeConcreteFloorTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#3c3833'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    const v = 20 + Math.random() * 50;
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(x, y, 1, 1);
  }
  // Oil spills.
  for (let i = 0; i < 4; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 20 + Math.random() * 30;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  return toTex(c);
}
function makeMetalCeilingTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#3a3a3a'; g.fillRect(0, 0, 256, 256);
  // Corrugated panels.
  for (let x = 0; x < 256; x += 16) {
    g.fillStyle = (x / 16) % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.15)';
    g.fillRect(x, 0, 16, 256);
  }
  return toTex(c);
}

// ---- Level 2 — PIPES (rust + grimy steel) -----------------------------------
function makeRustTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#5a2a14'; g.fillRect(0, 0, 256, 256);
  // Rust blooms.
  for (let i = 0; i < 14; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 16 + Math.random() * 40;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(180, 70, 20, 0.6)');
    grad.addColorStop(0.5, 'rgba(120, 50, 20, 0.4)');
    grad.addColorStop(1, 'rgba(60, 20, 10, 0)');
    g.fillStyle = grad; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Pipe seams — horizontal dark lines.
  g.fillStyle = '#1a0a04';
  for (let y = 40; y < 256; y += 60) g.fillRect(0, y, 256, 2);
  // Drip streaks.
  g.fillStyle = 'rgba(20,10,5,0.6)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 256;
    g.fillRect(x, Math.random() * 100, 1, 30 + Math.random() * 60);
  }
  return toTex(c);
}
function makeWetFloorTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#1a1812'; g.fillRect(0, 0, 256, 256);
  // Water puddles — highlights.
  for (let i = 0; i < 6; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 16 + Math.random() * 30;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(160,180,200,0.3)');
    grad.addColorStop(0.6, 'rgba(80,90,100,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Grimy specks.
  for (let i = 0; i < 1200; i++) {
    g.fillStyle = `rgba(${Math.floor(Math.random() * 40)},${Math.floor(Math.random() * 30)},${Math.floor(Math.random() * 25)},0.7)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  return toTex(c);
}

// ---- Level 3 — VOID (near-black w/ subtle blue ripples) ---------------------
function makeVoidTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#020306'; g.fillRect(0, 0, 256, 256);
  // Almost-imperceptible blue glow ripples.
  for (let i = 0; i < 6; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256, r = 30 + Math.random() * 60;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(40, 60, 120, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grad; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Faint stars.
  g.fillStyle = 'rgba(200,210,255,0.25)';
  for (let i = 0; i < 30; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  return toTex(c);
}

// Helper to convert a canvas into a configured CanvasTexture.
function toTex(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  return tex;
}

// Pug-monster face — billboard sprite (same evil-pug palette as 2D version).
function makeMonsterTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = '#1a0d05';
  g.beginPath(); g.ellipse(128, 200, 70, 50, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3a2a18';
  g.beginPath(); g.ellipse(128, 110, 70, 70, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#0a0708';
  g.beginPath(); g.ellipse(128, 130, 55, 35, 0, 0, Math.PI * 2); g.fill();
  // Glowing red eyes.
  const eyeGlow = (cx, cy, r) => {
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ff4040');
    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    g.fillStyle = grad; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  };
  eyeGlow(98, 100, 22); eyeGlow(158, 100, 22);
  g.fillStyle = '#ff1010';
  g.fillRect(94, 96, 8, 8); g.fillRect(154, 96, 8, 8);
  g.fillStyle = '#fff';
  g.fillRect(96, 98, 3, 3); g.fillRect(156, 98, 3, 3);
  // Ears.
  g.fillStyle = '#1a0d05';
  g.beginPath(); g.moveTo(60, 70); g.lineTo(80, 100); g.lineTo(72, 50); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(196, 70); g.lineTo(176, 100); g.lineTo(184, 50); g.closePath(); g.fill();
  // Teeth.
  g.fillStyle = '#fff8e0';
  for (let i = 0; i < 5; i++) {
    const tx = 102 + i * 12;
    g.beginPath(); g.moveTo(tx, 150); g.lineTo(tx + 4, 156); g.lineTo(tx + 8, 150); g.closePath(); g.fill();
  }
  g.fillStyle = 'rgba(255, 240, 200, 0.6)';
  g.fillRect(120, 156, 2, 8); g.fillRect(140, 158, 2, 6);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.premultiplyAlpha = false;
  return tex;
}

// SHADOW — pure black pug silhouette (no eyes, no detail). Reads as
// "something is just standing there" when it flickers in.
function makeShadowTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  g.fillStyle = '#000';
  // Body
  g.beginPath(); g.ellipse(128, 200, 70, 50, 0, 0, Math.PI * 2); g.fill();
  // Head
  g.beginPath(); g.ellipse(128, 110, 72, 72, 0, 0, Math.PI * 2); g.fill();
  // Ears (faint torn silhouette).
  g.beginPath(); g.moveTo(60, 70); g.lineTo(80, 100); g.lineTo(72, 50); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(196, 70); g.lineTo(176, 100); g.lineTo(184, 50); g.closePath(); g.fill();
  // Tiny pinprick eye dots (white) — barely visible, just enough to register
  // as a face when stared at.
  g.fillStyle = 'rgba(220,220,220,0.18)';
  g.fillRect(102, 100, 4, 4); g.fillRect(150, 100, 4, 4);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.premultiplyAlpha = false;
  return tex;
}

// WHISPER — far-away pug silhouette with faint glow halo so it reads as
// "something is way down the hall watching me".
function makeWhisperTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  // Pale halo behind.
  const haloGrad = g.createRadialGradient(128, 128, 30, 128, 128, 110);
  haloGrad.addColorStop(0, 'rgba(180, 200, 220, 0.22)');
  haloGrad.addColorStop(1, 'rgba(180, 200, 220, 0)');
  g.fillStyle = haloGrad; g.fillRect(0, 0, 256, 256);
  // Silhouette: small (it's far away — sprite scale also handles this).
  g.fillStyle = '#000';
  g.beginPath(); g.ellipse(128, 190, 55, 40, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(128, 130, 50, 50, 0, 0, Math.PI * 2); g.fill();
  // Eye glints — tiny cold white pinpricks.
  g.fillStyle = '#cce0ff';
  g.fillRect(115, 122, 3, 3); g.fillRect(140, 122, 3, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.premultiplyAlpha = false;
  return tex;
}

// Doodad textures: crate (warehouse), pipe (pipes level), closet door, exit door, switch.
function makeCrateTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#6a4a28'; g.fillRect(0, 0, 128, 128);
  // Plank seams.
  g.fillStyle = '#3a2618';
  for (let y = 0; y < 128; y += 16) g.fillRect(0, y, 128, 2);
  g.fillRect(0, 0, 2, 128); g.fillRect(126, 0, 2, 128);
  // Hazard stripe.
  g.fillStyle = '#ffd23f';
  g.fillRect(0, 60, 128, 8);
  g.fillStyle = '#1a0d05';
  for (let x = 0; x < 128; x += 16) g.fillRect(x, 60, 8, 8);
  return toTex(c);
}
function makeClosetTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#4a3018'; g.fillRect(0, 0, 128, 256);
  g.strokeStyle = '#2a1808'; g.lineWidth = 3;
  // Panel insets.
  g.strokeRect(10, 20, 108, 100); g.strokeRect(10, 130, 108, 110);
  // Handle (bronze).
  g.fillStyle = '#c89020';
  g.beginPath(); g.arc(100, 175, 4, 0, Math.PI * 2); g.fill();
  return toTex(c);
}
function makeExitDoorTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#a01818'; g.fillRect(0, 0, 128, 256);
  // EXIT sign.
  g.fillStyle = '#fff8a0';
  g.fillRect(20, 30, 88, 40);
  g.fillStyle = '#a01818';
  g.font = 'bold 28px monospace';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('EXIT', 64, 50);
  // Cross bar handle.
  g.fillStyle = '#1a0d05';
  g.fillRect(15, 145, 98, 8);
  // Border highlights.
  g.strokeStyle = '#ffd2c0'; g.lineWidth = 2;
  g.strokeRect(2, 2, 124, 252);
  return toTex(c);
}
function makeSwitchTexture(on) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 48;
  const g = c.getContext('2d');
  g.fillStyle = '#f0e8d8'; g.fillRect(0, 0, 32, 48);
  g.strokeStyle = '#8a8270'; g.lineWidth = 1;
  g.strokeRect(1, 1, 30, 46);
  // Toggle lever — orientation depends on on/off.
  g.fillStyle = '#3a2a18';
  if (on) g.fillRect(12, 6, 8, 22);
  else    g.fillRect(12, 20, 8, 22);
  // Tiny LED.
  g.fillStyle = on ? '#ffd23f' : '#3a3020';
  g.fillRect(13, 33, 6, 4);
  return toTex(c);
}
// v3 — note paper texture (small folded-paper sprite on floor).
function makeNoteTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  // Paper rectangle slightly skewed.
  g.fillStyle = '#f4eccc';
  g.beginPath();
  g.moveTo(8, 14); g.lineTo(56, 12); g.lineTo(58, 54); g.lineTo(10, 56);
  g.closePath(); g.fill();
  g.strokeStyle = '#8a7a40'; g.lineWidth = 1; g.stroke();
  // Folded crease line.
  g.beginPath(); g.moveTo(8, 34); g.lineTo(58, 34); g.strokeStyle = '#c8b878'; g.stroke();
  // Tiny ink-scratch glyphs.
  g.fillStyle = '#3a2818';
  for (let y = 18; y < 52; y += 5) {
    for (let x = 12; x < 52; x += 4) {
      if (Math.random() < 0.65) g.fillRect(x, y, 2, 1);
    }
  }
  return toTex(c);
}
// v3 — rock texture (chunky pebble sprite).
function makeRockTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  g.fillStyle = '#5a504a';
  g.beginPath(); g.ellipse(32, 36, 22, 16, 0, 0, Math.PI * 2); g.fill();
  // Highlight + dark spots.
  g.fillStyle = '#8a7a70';
  g.beginPath(); g.ellipse(24, 30, 8, 5, -0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a201a';
  g.beginPath(); g.arc(42, 40, 3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(20, 42, 2, 0, Math.PI * 2); g.fill();
  return toTex(c);
}
// v3 — STALKER texture — eerie outline pug with no fill, just a chalk-white edge.
function makeStalkerTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  // Pure outline silhouette — chalk-white edges only, fully transparent inside.
  g.strokeStyle = 'rgba(220, 230, 245, 0.85)';
  g.lineWidth = 2.5;
  // Body
  g.beginPath(); g.ellipse(128, 200, 68, 48, 0, 0, Math.PI * 2); g.stroke();
  // Head
  g.beginPath(); g.ellipse(128, 110, 70, 70, 0, 0, Math.PI * 2); g.stroke();
  // Ears
  g.beginPath(); g.moveTo(60, 70); g.lineTo(80, 100); g.lineTo(72, 50); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(196, 70); g.lineTo(176, 100); g.lineTo(184, 50); g.closePath(); g.stroke();
  // Tiny white pinprick eyes — barely there.
  g.fillStyle = 'rgba(240, 250, 255, 0.95)';
  g.fillRect(106, 102, 3, 3); g.fillRect(148, 102, 3, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.premultiplyAlpha = false;
  return tex;
}

// Build all level texture sets ONCE up-front. We swap material maps on
// level transition rather than rebuild canvases each time.
const TEXTURES = {
  walls:    [makeWallpaperTexture(), makeConcreteTexture(),  makeRustTexture(), makeVoidTexture()],
  floors:   [makeCarpetTexture(),    makeConcreteFloorTexture(), makeWetFloorTexture(), makeVoidTexture()],
  ceilings: [makeCeilingTexture(),   makeMetalCeilingTexture(),  makeRustTexture(), makeVoidTexture()],
  crate:    makeCrateTexture(),
  closet:   makeClosetTexture(),
  exit:     makeExitDoorTexture(),
  switchOn: makeSwitchTexture(true),
  switchOff:makeSwitchTexture(false),
  note:     makeNoteTexture(),
  rock:     makeRockTexture(),
};

// =============================================================================
// MAZE GENERATION — procedural grid. Each cell can have walls on its N/E/S/W
// edges. We share walls so we only build a single wall per cell-edge (no
// double walls between adjacent rooms).
//
// v2: cells also carry feature flags:
//   - special: 'large' (8×8 block — interior walls erased), 'hallway' (forced
//     1-wide corridor), 'niche' (2×2 dead-end alcove), or null (default).
//   - doodad: 'closet' | 'switch' | 'exit' (rare) | 'crate' (warehouse only).
// =============================================================================
const grid = new Map();
const cellKey = (cx, cy) => `${cx},${cy}`;
let gridMinX = -CHUNK_SIZE / 2, gridMaxX = CHUNK_SIZE / 2;
let gridMinY = -CHUNK_SIZE / 2, gridMaxY = CHUNK_SIZE / 2;

// Seeded pseudo-random — we want the maze to be the same for one play session
// but different across sessions. Each chunk uses its (cx, cy) as seed so the
// regenerate-on-edge feature produces consistent extensions.
function cellRandom(cx, cy, salt = 0) {
  let h = (cx * 374761393 + cy * 668265263 + salt * 982451653) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

// Special-cell decisions happen per "macro" coordinate so a feature consumes
// the same 8x8 or 2x2 block deterministically.
// large rooms: ~1 per 8x8 macro, anchored at multiples of 8.
function specialAt(x, y) {
  // Large rooms — anchored on multiples of 8.
  if (x % 8 === 0 && y % 8 === 0) {
    if (cellRandom(x, y, 31) < 0.20) return { kind: 'large', ax: x, ay: y };
  }
  // Niches — small 2x2 alcoves, anchored on multiples of 6 offset by 3.
  if ((x % 6 === 3) && (y % 6 === 3)) {
    if (cellRandom(x, y, 37) < 0.30) return { kind: 'niche', ax: x, ay: y };
  }
  return null;
}
// Check whether (x,y) lies inside an existing special block from a nearby anchor.
function specialContaining(x, y) {
  // Check large room blocks.
  const lax = x - ((x % 8 + 8) % 8);
  const lay = y - ((y % 8 + 8) % 8);
  const lspec = specialAt(lax, lay);
  if (lspec && lspec.kind === 'large') {
    if (x >= lax && x < lax + 8 && y >= lay && y < lay + 8) return lspec;
  }
  // Check niches.
  for (let dx = -1; dx <= 0; dx++) for (let dy = -1; dy <= 0; dy++) {
    const nax = x + dx, nay = y + dy;
    const ns = specialAt(nax, nay);
    if (ns && ns.kind === 'niche') {
      if (x >= nax && x < nax + 2 && y >= nay && y < nay + 2) return ns;
    }
  }
  return null;
}

// Generate cells in a rectangular range.
function generateRange(x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const k = cellKey(x, y);
      if (grid.has(k)) continue;
      const spec = specialContaining(x, y);

      // ---- Wall layout per cell type ---------------------------------------
      let wN, wE, wS, wW;
      if (spec && spec.kind === 'large') {
        // Large room: interior walls erased; outer walls intact. A door punched
        // on each side near the middle.
        const isWestEdge = x === spec.ax;
        const isEastEdge = x === spec.ax + 7;
        const isNorthEdge = y === spec.ay;
        const isSouthEdge = y === spec.ay + 7;
        // Outer walls everywhere except a door cell on each side.
        wW = isWestEdge && !(y === spec.ay + 3);
        wE = isEastEdge && !(y === spec.ay + 4);
        wN = isNorthEdge && !(x === spec.ax + 3);
        wS = isSouthEdge && !(x === spec.ax + 4);
        // Interior cells (no edge) — no walls (open room).
        if (!isWestEdge) wW = false;
        if (!isEastEdge) wE = false;
        if (!isNorthEdge) wN = false;
        if (!isSouthEdge) wS = false;
      } else if (spec && spec.kind === 'niche') {
        // 2x2 dead-end alcove: walls on three sides, single opening to one neighbour.
        const isLeft = x === spec.ax;
        const isTop  = y === spec.ay;
        const openSide = Math.floor(cellRandom(spec.ax, spec.ay, 71) * 4); // 0=N 1=E 2=S 3=W
        wN = !(openSide === 0 && isTop)       && isTop;
        wS = !(openSide === 2 && !isTop)      && !isTop;
        wW = !(openSide === 3 && isLeft)      && isLeft;
        wE = !(openSide === 1 && !isLeft)     && !isLeft;
      } else {
        // Default: each edge is shared. We seed from the edge's canonical id.
        wN = cellRandom(x, Math.min(y, y - 1), 1) < 0.70;
        wS = cellRandom(x, Math.min(y, y + 1), 1) < 0.70;
        wW = cellRandom(Math.min(x, x - 1), y, 2) < 0.70;
        wE = cellRandom(Math.min(x, x + 1), y, 2) < 0.70;

        // Hallway zones — 5% of cells. Force a 1-tile-wide N-S corridor:
        // east+west walled, north+south open.
        if (cellRandom(x, y, 41) < 0.05) {
          wE = true; wW = true; wN = false; wS = false;
        }
      }

      // ---- Fixture (ceiling light) -----------------------------------------
      // Slight noise so the grid isn't perfectly regular. Large rooms get
      // multiple lights via separate cells.
      const hasFixture = ((x + y * 2) % 3 === 0) && cellRandom(x, y, 7) > 0.15;

      // ---- Doodad assignment ----------------------------------------------
      // Hiding closets ~ every 5 cells with low overall density.
      let doodad = null;
      if (cellRandom(x, y, 53) < 0.04) doodad = 'closet';
      else if (cellRandom(x, y, 59) < 0.06) doodad = 'switch';
      else if (cellRandom(x, y, 61) < 0.03) doodad = 'crate'; // only renders in warehouse
      // v3 — additional floor-clutter doodads (mutually exclusive w/ above).
      // Note papers (~3% per cell, scattered across all levels). They carry a
      // deterministic text index so the same cell shows the same note across
      // a regeneration sweep.
      else if (cellRandom(x, y, 71) < 0.03) doodad = 'note';
      // Rocks (~5% per cell, especially common in warehouse + pipes). The
      // player picks them up to throw as monster distractions.
      else if (cellRandom(x, y, 73) < 0.05) doodad = 'rock';
      // Map snippets (~1.5% per cell). Rare-find collectible that briefly
      // shows a mini-map overlay of the current visible area.
      else if (cellRandom(x, y, 77) < 0.015) doodad = 'mapSnippet';
      // EXIT door is special: very rare seeds. We mark candidates; the actual
      // exit-door rendering is gated to LEVEL 4 ONLY so the player only sees
      // it once they've descended.
      const exitCandidate = cellRandom(x, y, 67) < 0.012;

      grid.set(k, {
        x, y,
        walls: { N: wN, E: wE, S: wS, W: wW },
        special: spec ? spec.kind : null,
        specialAnchor: spec ? { x: spec.ax, y: spec.ay } : null,
        hasFixture,
        fixturePhase: cellRandom(x, y, 9) * Math.PI * 2,
        fixtureFlickerRate: 0.05 + cellRandom(x, y, 11) * 0.4,
        fixtureDying: cellRandom(x, y, 13) < 0.18,
        fixtureDead: cellRandom(x, y, 17) < 0.04,
        fixtureOn: true,  // switchable: light switches in this cell can flip this
        lightOverride: null, // set by light switch
        light: null,
        doodad,
        exitCandidate,
        closetUsedAt: -1e9, // ts of last hide
        // v3 — pickable doodad state. `pickedUp` survives across regeneration
        // (we keep cell objects in `grid` forever once seen, so this is sticky).
        // `noteIndex` is the deterministic backstory note this cell holds.
        pickedUp: false,
        noteIndex: Math.floor(cellRandom(x, y, 83) * NOTE_TEXTS.length),
        // v3 — has a switch already been flipped (counts toward objective).
        switchFlipped: false,
      });
    }
  }
}

// Initial chunk around origin.
generateRange(gridMinX, gridMinY, gridMaxX, gridMaxY);

// =============================================================================
// THREE.JS SCENE SETUP
// =============================================================================
const threeRoot = document.getElementById('three-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(LEVELS[0].sky);
scene.fog = new THREE.FogExp2(LEVELS[0].fogColor, LEVELS[0].fogDensity);

const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, PLAYER_H, 0);

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
threeRoot.appendChild(renderer.domElement);

// Ambient — barely lit. Replaced when level changes.
const ambient = new THREE.AmbientLight(LEVELS[0].ambient.color, LEVELS[0].ambient.intensity);
scene.add(ambient);

// Player "flashlight" — a SpotLight pinned to the camera, used dramatically
// on Level 4 (VOID). On other levels it's dim/disabled. Built once.
const flashlight = new THREE.SpotLight(0xffffff, 0.0, 14, Math.PI * 0.18, 0.4, 1.6);
flashlight.position.set(0, 0, 0);
const flashTarget = new THREE.Object3D();
scene.add(flashlight); scene.add(flashTarget);
flashlight.target = flashTarget;

// =============================================================================
// MATERIALS — single shared material per surface so we render efficiently.
// MeshLambertMaterial reacts to PointLights without the perf cost of
// MeshStandardMaterial.
// =============================================================================
const wallMat = new THREE.MeshLambertMaterial({ map: TEXTURES.walls[0] });
const floorMat = new THREE.MeshLambertMaterial({ map: TEXTURES.floors[0] });
const ceilMat = new THREE.MeshLambertMaterial({ map: TEXTURES.ceilings[0] });
const crateMat = new THREE.MeshLambertMaterial({ map: TEXTURES.crate });
const closetMat = new THREE.MeshLambertMaterial({ map: TEXTURES.closet });
const exitMat = new THREE.MeshLambertMaterial({ map: TEXTURES.exit, emissive: 0x661010, emissiveIntensity: 0.5 });
const switchOnMat = new THREE.MeshBasicMaterial({ map: TEXTURES.switchOn });
const switchOffMat = new THREE.MeshBasicMaterial({ map: TEXTURES.switchOff });

// Helper to create per-cell floor/ceiling planes.
function buildFloor(cx, cy) {
  const geom = new THREE.PlaneGeometry(CELL, CELL);
  const mesh = new THREE.Mesh(geom, floorMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(cx * CELL + CELL / 2, 0, cy * CELL + CELL / 2);
  return mesh;
}
function buildCeiling(cx, cy) {
  const geom = new THREE.PlaneGeometry(CELL, CELL);
  const mesh = new THREE.Mesh(geom, ceilMat);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(cx * CELL + CELL / 2, ROOM_H, cy * CELL + CELL / 2);
  return mesh;
}

const wallGeom = new THREE.PlaneGeometry(CELL, ROOM_H);

// Track meshes so we can dispose them on regen.
const cellMeshes = new Map();

// Track interactables for raycast pickup (closets/switches/exit). We
// register the mesh and the cell-key so the use-key handler can act.
const interactables = []; // { mesh, kind: 'closet'|'switch'|'exit', cellKey }

function buildCellGeometry(cell) {
  if (cellMeshes.has(cellKey(cell.x, cell.y))) return;
  const group = { floor: null, ceiling: null, walls: [], extras: [] };
  group.floor = buildFloor(cell.x, cell.y); scene.add(group.floor);
  group.ceiling = buildCeiling(cell.x, cell.y); scene.add(group.ceiling);
  const baseX = cell.x * CELL + CELL / 2;
  const baseZ = cell.y * CELL + CELL / 2;
  if (cell.walls.N) {
    const m = new THREE.Mesh(wallGeom, wallMat);
    m.position.set(baseX, ROOM_H / 2, cell.y * CELL); m.rotation.y = 0;
    scene.add(m); group.walls.push(m);
  }
  if (cell.walls.S) {
    const m = new THREE.Mesh(wallGeom, wallMat);
    m.position.set(baseX, ROOM_H / 2, (cell.y + 1) * CELL); m.rotation.y = Math.PI;
    scene.add(m); group.walls.push(m);
  }
  if (cell.walls.W) {
    const m = new THREE.Mesh(wallGeom, wallMat);
    m.position.set(cell.x * CELL, ROOM_H / 2, baseZ); m.rotation.y = Math.PI / 2;
    scene.add(m); group.walls.push(m);
  }
  if (cell.walls.E) {
    const m = new THREE.Mesh(wallGeom, wallMat);
    m.position.set((cell.x + 1) * CELL, ROOM_H / 2, baseZ); m.rotation.y = -Math.PI / 2;
    scene.add(m); group.walls.push(m);
  }
  // Light fixture — point-light + small bar mesh.
  if (cell.hasFixture && !cell.fixtureDead) {
    const light = new THREE.PointLight(LEVELS[currentLevel].lightTone, 0.5, 8, 1.6);
    light.position.set(baseX, ROOM_H - 0.15, baseZ);
    scene.add(light);
    cell.light = light;
    const fixGeom = new THREE.PlaneGeometry(1.6, 0.6);
    const fixMat = new THREE.MeshBasicMaterial({ color: LEVELS[currentLevel].lightTone });
    const fix = new THREE.Mesh(fixGeom, fixMat);
    fix.rotation.x = Math.PI / 2;
    fix.position.set(baseX, ROOM_H - 0.02, baseZ);
    scene.add(fix); group.walls.push(fix);
    cell.fixtureVisual = fix; cell.fixtureMat = fixMat;
  }
  // -- DOODADS -------------------------------------------------------------
  // Hiding closet — vertical 1m wide 2m tall door against any wall present.
  if (cell.doodad === 'closet') {
    const wallSide = pickAvailableWallSide(cell);
    if (wallSide) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), closetMat);
      placeOnWall(m, cell, wallSide, 0.02);
      scene.add(m); group.extras.push(m);
      interactables.push({ mesh: m, kind: 'closet', cellKey: cellKey(cell.x, cell.y) });
    }
  }
  // Light switch — small panel mounted at 1.4m. Always available; if no wall,
  // skip (open rooms have no place for it).
  if (cell.doodad === 'switch') {
    const wallSide = pickAvailableWallSide(cell);
    if (wallSide) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.28), cell.fixtureOn ? switchOnMat : switchOffMat);
      placeOnWall(m, cell, wallSide, 0.025);
      m.position.y = 1.4;
      scene.add(m); group.extras.push(m);
      cell.switchMesh = m;
      interactables.push({ mesh: m, kind: 'switch', cellKey: cellKey(cell.x, cell.y) });
    }
  }
  // Crate — only on Level 1 (warehouse). Sits on the floor mid-cell.
  if (cell.doodad === 'crate' && currentLevel === 1) {
    const sz = 0.9;
    const m = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), crateMat);
    m.position.set(baseX + (cellRandom(cell.x, cell.y, 91) - 0.5) * 1.4, sz / 2,
                    baseZ + (cellRandom(cell.x, cell.y, 93) - 0.5) * 1.4);
    scene.add(m); group.extras.push(m);
  }
  // Pipes — on Level 2 (pipes). A simple horizontal cylinder hugging the ceiling.
  if (currentLevel === 2 && cellRandom(cell.x, cell.y, 101) < 0.5) {
    const pipeGeom = new THREE.CylinderGeometry(0.12, 0.12, CELL, 6);
    const pipeMat = new THREE.MeshLambertMaterial({ color: 0x5a2a14 });
    const pipe = new THREE.Mesh(pipeGeom, pipeMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(baseX, ROOM_H - 0.4, baseZ - 1.2);
    scene.add(pipe); group.extras.push(pipe);
  }
  // v3 — Note paper sprite on floor. Skip if already collected.
  if (cell.doodad === 'note' && !cell.pickedUp) {
    const noteMat = new THREE.SpriteMaterial({ map: TEXTURES.note, fog: true, transparent: true, depthWrite: false });
    const note = new THREE.Sprite(noteMat);
    note.scale.set(0.45, 0.45, 1);
    note.position.set(
      baseX + (cellRandom(cell.x, cell.y, 81) - 0.5) * 1.6,
      0.18,
      baseZ + (cellRandom(cell.x, cell.y, 82) - 0.5) * 1.6,
    );
    scene.add(note); group.extras.push(note);
    interactables.push({ mesh: note, kind: 'note', cellKey: cellKey(cell.x, cell.y) });
  }
  // v3 — Rock sprite on floor (pickable distraction). Skip if collected.
  if (cell.doodad === 'rock' && !cell.pickedUp) {
    const rockMat = new THREE.SpriteMaterial({ map: TEXTURES.rock, fog: true, transparent: true, depthWrite: false });
    const rock = new THREE.Sprite(rockMat);
    rock.scale.set(0.4, 0.4, 1);
    rock.position.set(
      baseX + (cellRandom(cell.x, cell.y, 85) - 0.5) * 1.8,
      0.15,
      baseZ + (cellRandom(cell.x, cell.y, 86) - 0.5) * 1.8,
    );
    scene.add(rock); group.extras.push(rock);
    interactables.push({ mesh: rock, kind: 'rock', cellKey: cellKey(cell.x, cell.y) });
  }
  // v3 — Map snippet sprite. Re-uses the note texture but tinted blue.
  if (cell.doodad === 'mapSnippet' && !cell.pickedUp) {
    const mapMat = new THREE.SpriteMaterial({
      map: TEXTURES.note, fog: true, transparent: true, depthWrite: false,
      color: 0x80c0ff,
    });
    const m = new THREE.Sprite(mapMat);
    m.scale.set(0.5, 0.5, 1);
    m.position.set(
      baseX + (cellRandom(cell.x, cell.y, 87) - 0.5) * 1.5,
      0.22,
      baseZ + (cellRandom(cell.x, cell.y, 88) - 0.5) * 1.5,
    );
    scene.add(m); group.extras.push(m);
    interactables.push({ mesh: m, kind: 'mapSnippet', cellKey: cellKey(cell.x, cell.y) });
  }
  // EXIT door — only on Level 3 (the VOID), only on exitCandidate cells.
  if (cell.exitCandidate && currentLevel === 3) {
    const wallSide = pickAvailableWallSide(cell);
    if (wallSide) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), exitMat);
      placeOnWall(m, cell, wallSide, 0.03);
      m.position.y = 1.3;
      scene.add(m); group.extras.push(m);
      interactables.push({ mesh: m, kind: 'exit', cellKey: cellKey(cell.x, cell.y) });
      // Small glow above the door so players can spot it from across rooms.
      const glow = new THREE.PointLight(0xff3030, 0.7, 6, 1.6);
      glow.position.copy(m.position);
      scene.add(glow); group.extras.push(glow);
    }
  }
  cellMeshes.set(cellKey(cell.x, cell.y), group);
}

// Returns the FIRST wall side with a wall built ('N'|'E'|'S'|'W'|null).
function pickAvailableWallSide(cell) {
  const order = ['N', 'E', 'S', 'W'];
  for (const s of order) if (cell.walls[s]) return s;
  return null;
}
// Places a flat mesh on the chosen wall, centered (X/Z) with a small inset.
function placeOnWall(mesh, cell, side, inset) {
  const baseX = cell.x * CELL + CELL / 2;
  const baseZ = cell.y * CELL + CELL / 2;
  if (side === 'N') {
    mesh.position.set(baseX, 1.0, cell.y * CELL + inset);
    mesh.rotation.y = 0;
  } else if (side === 'S') {
    mesh.position.set(baseX, 1.0, (cell.y + 1) * CELL - inset);
    mesh.rotation.y = Math.PI;
  } else if (side === 'W') {
    mesh.position.set(cell.x * CELL + inset, 1.0, baseZ);
    mesh.rotation.y = Math.PI / 2;
  } else { // E
    mesh.position.set((cell.x + 1) * CELL - inset, 1.0, baseZ);
    mesh.rotation.y = -Math.PI / 2;
  }
}

function disposeCellGeometry(key) {
  const group = cellMeshes.get(key);
  if (!group) return;
  scene.remove(group.floor); group.floor.geometry.dispose();
  scene.remove(group.ceiling); group.ceiling.geometry.dispose();
  for (const w of group.walls) scene.remove(w);
  // v3 BUG FIX: extras include sprites (note/rock/map) with per-instance
  // SpriteMaterial. Dispose them so we don't accumulate texture references on
  // level changes. Also dispose any per-instance geometry on Mesh extras.
  for (const e of group.extras) {
    scene.remove(e);
    if (e.geometry && e.geometry.dispose) {
      try { e.geometry.dispose(); } catch {}
    }
    if (e.material && e.material.dispose && e.isSprite) {
      // Only dispose for sprites — wall/closet/exit Meshes use shared materials.
      try { e.material.dispose(); } catch {}
    }
  }
  const cell = grid.get(key);
  if (cell?.light) { scene.remove(cell.light); cell.light = null; }
  if (cell) { cell.fixtureVisual = null; cell.fixtureMat = null; cell.switchMesh = null; }
  // Drop interactables in this cell.
  for (let i = interactables.length - 1; i >= 0; i--) {
    if (interactables[i].cellKey === key) interactables.splice(i, 1);
  }
  cellMeshes.delete(key);
}

const rendered = new Set();
function syncVisibleCells(playerCellX, playerCellY) {
  const wanted = new Set();
  for (let dy = -RENDER_RADIUS; dy <= RENDER_RADIUS; dy++) {
    for (let dx = -RENDER_RADIUS; dx <= RENDER_RADIUS; dx++) {
      const x = playerCellX + dx, y = playerCellY + dy;
      const k = cellKey(x, y);
      if (!grid.has(k)) continue;
      wanted.add(k);
      if (!rendered.has(k)) {
        buildCellGeometry(grid.get(k));
        rendered.add(k);
      }
    }
  }
  for (const k of rendered) {
    if (!wanted.has(k)) { disposeCellGeometry(k); rendered.delete(k); }
  }
}

function expandIfNeeded(cx, cy) {
  if (cx - gridMinX < REGEN_THRESHOLD) {
    const newMinX = gridMinX - CHUNK_SIZE;
    generateRange(newMinX, gridMinY, gridMinX - 1, gridMaxY);
    gridMinX = newMinX;
  }
  if (gridMaxX - cx < REGEN_THRESHOLD) {
    const newMaxX = gridMaxX + CHUNK_SIZE;
    generateRange(gridMaxX + 1, gridMinY, newMaxX, gridMaxY);
    gridMaxX = newMaxX;
  }
  if (cy - gridMinY < REGEN_THRESHOLD) {
    const newMinY = gridMinY - CHUNK_SIZE;
    generateRange(gridMinX, newMinY, gridMaxX, gridMinY - 1);
    gridMinY = newMinY;
  }
  if (gridMaxY - cy < REGEN_THRESHOLD) {
    const newMaxY = gridMaxY + CHUNK_SIZE;
    generateRange(gridMinX, gridMaxY + 1, gridMaxX, newMaxY);
    gridMaxY = newMaxY;
  }
}

// =============================================================================
// MONSTERS — three archetypes, all billboard sprites.
//   - CHASER: physical pursuer (the existing one).
//   - SHADOW: flickers in/out at edge of view, psychological only.
//   - WHISPER: stationary, far away, whispers — drain sanity if stared at.
// =============================================================================
const monsterTex = makeMonsterTexture();
const shadowTex  = makeShadowTexture();
const whisperTex = makeWhisperTexture();

// CHASER (the original).
const monsterMat = new THREE.SpriteMaterial({
  map: monsterTex, fog: true, transparent: true, depthWrite: false,
});
const monsterSprite = new THREE.Sprite(monsterMat);
monsterSprite.scale.set(2.2, 2.2, 1);
monsterSprite.position.set(40, MONSTER_HEIGHT / 2 + 0.3, 40);
scene.add(monsterSprite);

const monsterState = {
  pos: new THREE.Vector3(40, MONSTER_HEIGHT / 2 + 0.3, 40),
  vel: new THREE.Vector3(0, 0, 0),
  wanderTarget: null,
  lastSeenAt: 0,
  lastTeleport: 0,
  isHunting: false,
};

// SHADOWS — pool of up to 4 sprites. Each flickers in for a brief stare-down
// then fades out and relocates. They never physically catch the player; they
// drain sanity if the player stares at one for >1s.
const SHADOW_POOL = 4;
const shadows = [];
for (let i = 0; i < SHADOW_POOL; i++) {
  const mat = new THREE.SpriteMaterial({
    map: shadowTex, fog: true, transparent: true, depthWrite: false, opacity: 0,
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(1.8, 1.8, 1);
  sp.position.set(0, MONSTER_HEIGHT / 2 + 0.2, 0);
  sp.visible = false;
  scene.add(sp);
  shadows.push({
    sprite: sp, mat, active: false, ttl: 0, staredAt: 0, fadeIn: 0,
  });
}

// WHISPERS — pool of up to 2. They sit way down a hallway and stay put for
// the level. Audio fires periodically while one is on-screen.
const WHISPER_POOL = 2;
const whispers = [];
for (let i = 0; i < WHISPER_POOL; i++) {
  const mat = new THREE.SpriteMaterial({
    map: whisperTex, fog: true, transparent: true, depthWrite: false, opacity: 0,
  });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(1.4, 1.4, 1);
  sp.position.set(0, MONSTER_HEIGHT / 2 + 0.1, 0);
  sp.visible = false;
  scene.add(sp);
  whispers.push({ sprite: sp, mat, active: false, lastWhisper: 0, staredAt: 0 });
}

// STALKER — 4th monster archetype. Follows the player from STALKER_FOLLOW_DIST
// directly behind, mimicking footsteps slightly after each real player step.
// Visible only when the player turns to look (chalk-outline sprite).
// Doesn't catch the player physically — drains sanity when seen.
const stalkerTex = makeStalkerTexture();
const stalkerMat = new THREE.SpriteMaterial({
  map: stalkerTex, fog: true, transparent: true, depthWrite: false, opacity: 0,
});
const stalkerSprite = new THREE.Sprite(stalkerMat);
stalkerSprite.scale.set(1.9, 1.9, 1);
stalkerSprite.position.set(0, MONSTER_HEIGHT / 2 + 0.2, 0);
stalkerSprite.visible = false;
scene.add(stalkerSprite);
const stalker = {
  active: false,
  pos: new THREE.Vector3(0, 0, 0),
  staredAt: 0,
  pendingStep: 0,        // timestamp at which to fire a mimicked step
  lastSeenByPlayer: 0,
};

// =============================================================================
// COLLISION — simple cell-based AABB.
// =============================================================================
function cellAt(worldX, worldZ) {
  return { cx: Math.floor(worldX / CELL), cy: Math.floor(worldZ / CELL) };
}

function collideMove(curX, curZ, dx, dz) {
  let nx = curX, nz = curZ;
  const tryMove = (tx, ty) => {
    const { cx, cy } = cellAt(tx, ty);
    const cell = grid.get(cellKey(cx, cy));
    if (!cell) return false;
    const fx = tx - cx * CELL;
    const fz = ty - cy * CELL;
    const r = PLAYER_RADIUS;
    if (cell.walls.W && fx < r) return false;
    if (cell.walls.E && fx > CELL - r) return false;
    if (cell.walls.N && fz < r) return false;
    if (cell.walls.S && fz > CELL - r) return false;
    return true;
  };
  if (tryMove(nx + dx, nz)) nx += dx;
  if (tryMove(nx, nz + dz)) nz += dz;
  return [nx, nz];
}

function hasLineOfSight(ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(2, Math.floor(dist / 0.4));
  let prevCx = null, prevCy = null;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = ax + dx * t, z = az + dz * t;
    const cx = Math.floor(x / CELL), cy = Math.floor(z / CELL);
    if (cx !== prevCx || cy !== prevCy) {
      if (prevCx !== null) {
        const pcell = grid.get(cellKey(prevCx, prevCy));
        if (!pcell) return false;
        if (cx > prevCx && pcell.walls.E) return false;
        if (cx < prevCx && pcell.walls.W) return false;
        if (cy > prevCy && pcell.walls.S) return false;
        if (cy < prevCy && pcell.walls.N) return false;
      }
      prevCx = cx; prevCy = cy;
    }
  }
  return true;
}

// =============================================================================
// PLAYER STATE
// =============================================================================
const player = {
  pos: new THREE.Vector3(CELL / 2, PLAYER_H, CELL / 2),
  vel: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  sanity: 100,
  walkTime: 0,
  walkBob: 0,
  lastFootstep: 0,
  visitedCells: new Set(['0,0']),
  deepestCell: 0,
  hideUntil: -1e9,    // ts; monster-immune until this time
  isHidden: false,    // mirror for HUD/audio
  sprinting: false,
  // v3 additions:
  stamina: STAMINA_MAX,
  staminaCooldown: 0,   // seconds until regen kicks back in
  crouching: false,
  rocks: 3,             // start with 3 rocks
  notesCollected: 0,
  mapsCollected: 0,
  switchesFlipped: 0,
  // Per-level lifetime tracking — index = level id, value = seconds alive on that level.
  levelTime: [0, 0, 0, 0],
};

camera.position.copy(player.pos);

// =============================================================================
// LEVEL TRANSITIONS — when player.deepestCell crosses N*CELLS_PER_LEVEL, swap
// to the next level. Updates fog, ambient, light tone, texture maps, plays
// the level-sting audio + brief flash + reveal banner.
// =============================================================================
let currentLevel = 0;
let _hasAppliedFirstLevel = false;
function applyLevel(lvl) {
  if (lvl < 0 || lvl >= LEVELS.length) return;
  const wasChange = _hasAppliedFirstLevel && currentLevel !== lvl;
  currentLevel = lvl;
  _hasAppliedFirstLevel = true;
  const L = LEVELS[lvl];
  scene.background = new THREE.Color(L.sky);
  scene.fog.color = new THREE.Color(L.fogColor);
  scene.fog.density = L.fogDensity;
  ambient.color = new THREE.Color(L.ambient.color);
  ambient.intensity = L.ambient.intensity;
  // Swap material maps.
  wallMat.map = TEXTURES.walls[lvl];
  floorMat.map = TEXTURES.floors[lvl];
  ceilMat.map = TEXTURES.ceilings[lvl];
  wallMat.needsUpdate = true; floorMat.needsUpdate = true; ceilMat.needsUpdate = true;
  // Re-tint per-fixture light colour for every currently-loaded light.
  for (const k of rendered) {
    const cell = grid.get(k);
    if (cell?.light) cell.light.color = new THREE.Color(L.lightTone);
    if (cell?.fixtureMat) cell.fixtureMat.color = new THREE.Color(L.lightTone);
  }
  // Flashlight only on Level 4 (VOID).
  flashlight.intensity = (lvl === 3) ? 2.4 : 0.0;
  // Force a re-render of any cells whose extras depend on level (crates only
  // appear on warehouse, pipes only on pipes, exit only on void). The
  // cleanest way is to wipe rendered geometry — the next syncVisibleCells
  // call will rebuild with the new level-aware extras.
  for (const k of [...rendered]) { disposeCellGeometry(k); rendered.delete(k); }
  // v3 BUG FIX: extra guard — make sure no orphan interactables survive a
  // level swap. disposeCellGeometry already removes them, but if the prior
  // applyLevel ran when a cell wasn't in `rendered` (rare race during init),
  // an entry could linger.
  interactables.length = 0;
  // HUD label.
  if (levelNameOut) levelNameOut.textContent = L.name;
  // v3 — force HUD objective text to refresh on level change.
  lastHudObj = '';
  // Audio + visuals.
  playLevelSting(lvl);
  flashElLevel?.classList.add('is-on');
  setTimeout(() => flashElLevel?.classList.remove('is-on'), 900);
  // Reveal banner.
  if (levelBanner) {
    levelBanner.querySelector('.lvl-num').textContent = `LEVEL ${lvl + 1}`;
    levelBanner.querySelector('.lvl-name').textContent = L.name;
    levelBanner.classList.add('is-shown');
    setTimeout(() => levelBanner.classList.remove('is-shown'), 2800);
  }
  // Re-set ambience track volume on Pipes (extra hiss).
  playSteam(L.showSteam ? 0.5 : 0);
  // v4 polish: tunnel-zoom — brief FOV pull-in then snap back, simulating
  // a "warp" into the next level. ~0.7s total. Runs only when this is a
  // real level CHANGE (not the initial apply).
  if (wasChange) _tunnelZoomT = 0.7;
}
// v4 polish: tunnel-zoom timer driven by main loop.
let _tunnelZoomT = 0;
let _tunnelZoomBaseFov = 90;

// =============================================================================
// INPUT — keyboard + mouse + mobile drag-look
// =============================================================================
const keys = new Set();
window.addEventListener('keydown', (e) => {
  const k = (e.key || '').toLowerCase();
  keys.add(k);
  if (k === 'escape') { if (gameState === 'play') pauseGame(); }
  if (k === 'e' || k === 'f') { if (gameState === 'play') tryInteract(); }
  // v3 — Q throws a rock (if any in inventory).
  if (k === 'q') { if (gameState === 'play') tryThrowRock(); }
  // v3 — C toggles crouch (only while playing).
  if (k === 'c') {
    if (gameState === 'play') {
      player.crouching = !player.crouching;
      playCrouchRustle();
    }
  }
});
window.addEventListener('keyup', (e) => keys.delete((e.key || '').toLowerCase()));
window.addEventListener('blur', () => keys.clear());

let pointerLocked = false;
document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === renderer.domElement;
});
renderer.domElement.addEventListener('mousemove', (e) => {
  if (!pointerLocked) return;
  player.yaw -= e.movementX * MOUSE_SENS;
  player.pitch -= e.movementY * MOUSE_SENS;
  player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch));
});
renderer.domElement.addEventListener('click', () => {
  if (gameState === 'play' && !pointerLocked && !_isTouch) {
    renderer.domElement.requestPointerLock();
  }
});

// =============================================================================
// MOBILE CONTROLS — virtual joystick (left) + drag-anywhere to look (right
// half) + SPRINT action button.
// =============================================================================
let mc = null;
const mcMove = { x: 0, y: 0, mag: 0 };
let mobileSprintHeld = false;
let mobileUseHeld = false;   // edge-triggered each press
if (_isTouch) {
  mc = createMobileControls({
    layout: 'wasd-only',
    keys,
    onMove: (x, y, mag) => { mcMove.x = x; mcMove.y = y; mcMove.mag = mag; },
    buttons: [
      // Pressed-and-held SPRINT — set the held flag while down.
      { id: 'sprint', label: 'SPRINT' },
      { id: 'use', label: 'USE' },
      // v3 — crouch toggle + throw rock buttons.
      { id: 'crouch', label: 'CROUCH' },
      { id: 'throw', label: 'THROW' },
    ],
    onButton: (id, down) => {
      if (id === 'sprint') mobileSprintHeld = !!down;
      if (id === 'use' && down) {
        if (gameState === 'play') tryInteract();
      }
      if (id === 'crouch' && down) {
        if (gameState === 'play') {
          player.crouching = !player.crouching;
          playCrouchRustle();
        }
      }
      if (id === 'throw' && down) {
        if (gameState === 'play') tryThrowRock();
      }
    },
  });
  let lookFingerId = null, lookLastX = 0, lookLastY = 0;
  const isInJoystickZone = (clientX) => clientX < window.innerWidth * 0.5;
  document.addEventListener('touchstart', (e) => {
    if (gameState !== 'play') return;
    for (const t of e.changedTouches) {
      if (isInJoystickZone(t.clientX)) continue;
      if (t.target?.closest?.('.mc-root, button, a')) continue;
      if (lookFingerId === null) {
        lookFingerId = t.identifier;
        lookLastX = t.clientX; lookLastY = t.clientY;
      }
    }
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (gameState !== 'play') return;
    for (const t of e.changedTouches) {
      if (t.identifier !== lookFingerId) continue;
      const dx = t.clientX - lookLastX, dy = t.clientY - lookLastY;
      lookLastX = t.clientX; lookLastY = t.clientY;
      player.yaw -= dx * TOUCH_SENS;
      player.pitch -= dy * TOUCH_SENS;
      player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch));
    }
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === lookFingerId) { lookFingerId = null; }
    }
  }, { passive: true });
  document.addEventListener('touchcancel', () => { lookFingerId = null; }, { passive: true });
}
// Silence unused-var warning — `mobileUseHeld` is set but we read it via
// the onButton callback above; keep the reference so future tweaks compile.
void mobileUseHeld;

// =============================================================================
// GAME STATE MACHINE
// =============================================================================
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'dead' | 'winning' | 'win'
let runStartTs = 0;
let totalElapsed = 0;
let jumpscaring = false;
let jumpscareEnd = 0;
let jumpscarePhase = 'none'; // 'slowmo' | 'zoom' | 'fade'
let jumpscareT = 0;

let winSequenceT = 0;
let winSequencePhase = 'none'; // 'opening' | 'whiteout' | 'fade' | 'reveal'
let winSequenceTotal = 0;

const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const winOverlay = document.getElementById('win-overlay');
const hudEl = document.getElementById('hud');
const flashEl = document.getElementById('flash');
const flashElLevel = document.getElementById('flash-level');
const flashElWin = document.getElementById('flash-win');
const sanityFill = document.getElementById('hud-sanity');
const sanityBar = sanityFill.parentElement;
const depthOut = document.getElementById('hud-depth');
const levelOut = document.getElementById('hud-level');
const levelNameOut = document.getElementById('hud-level-name');
const heartIcon = document.getElementById('hud-heart');
const interactPrompt = document.getElementById('interact-prompt');
const hideStatus = document.getElementById('hide-status');
const levelBanner = document.getElementById('level-banner');
const endDepth = document.getElementById('end-depth');
const endLevel = document.getElementById('end-level');
const endBest = document.getElementById('end-best');
const endLevelStats = document.getElementById('end-level-stats');
const startBestOut = document.getElementById('start-best');
const winDepth = document.getElementById('win-depth');
const winTime = document.getElementById('win-time');
// v3 additions.
const staminaFill = document.getElementById('hud-stamina');
const staminaBar = staminaFill ? staminaFill.parentElement : null;
const rockCount = document.getElementById('hud-rocks');
const objectiveOut = document.getElementById('hud-objective');
const noteOverlay = document.getElementById('note-overlay');
const noteOverlayText = document.getElementById('note-overlay-text');
const mapOverlay = document.getElementById('map-overlay');
const mapCanvas = document.getElementById('map-canvas');
const pauseObjective = document.getElementById('pause-objective');
const crouchPill = document.getElementById('crouch-status');

const best = loadBest('backrooms-3d');
if (best && typeof best.depth === 'number') {
  startBestOut.textContent = `${best.depth} rooms (lvl ${best.level || 0})`;
}

function startGame() {
  gameState = 'play';
  document.body.classList.add('is-playing');
  startOverlay.hidden = true;
  endOverlay.hidden = true;
  pauseOverlay.hidden = true;
  winOverlay.hidden = true;
  hudEl.hidden = false;
  // v3 BUG FIX: hide note + map overlays (they may have lingered from prior run).
  if (noteOverlay) { noteOverlay.hidden = true; noteOverlay.classList.remove('is-shown'); }
  if (mapOverlay) { mapOverlay.hidden = true; mapOverlay.classList.remove('is-shown'); }
  clearTimeout(noteHideTimer); clearTimeout(mapHideTimer);
  // v3 BUG FIX: reset jumpscare/win flash DOM state so a restart from the
  // end-card doesn't inherit a red/black overlay.
  if (flashEl) { flashEl.classList.remove('is-on', 'is-red'); }
  if (flashElWin) {
    flashElWin.style.opacity = '0';
    flashElWin.style.background = '#fff';
  }
  // Reset player.
  player.pos.set(CELL / 2, PLAYER_H, CELL / 2);
  player.yaw = 0; player.pitch = 0;
  player.sanity = 100;
  player.visitedCells.clear();
  player.visitedCells.add('0,0');
  player.deepestCell = 0;
  player.hideUntil = -1e9;
  player.isHidden = false;
  // v3 — reset stamina/crouch/inventory/objectives.
  player.stamina = STAMINA_MAX;
  player.staminaCooldown = 0;
  player.crouching = false;
  player.rocks = 3;
  player.notesCollected = 0;
  player.mapsCollected = 0;
  player.switchesFlipped = 0;
  player.levelTime = [0, 0, 0, 0];
  for (let i = 0; i < levelObjectiveMet.length; i++) levelObjectiveMet[i] = false;
  // v3 BUG FIX — clear stalker state + sprite. Without this, the chalk
  // sprite remained visible after restart.
  stalkerActivatedThisLevel = -1;
  stalker.active = false;
  stalker.staredAt = 0;
  stalker.pendingStep = 0;
  stalkerSprite.visible = false;
  stalkerMat.opacity = 0;
  // v3 BUG FIX — clear any rocks-in-flight from the prior run.
  for (const r of rocksInFlight) {
    scene.remove(r.sprite);
    try { r.mat.dispose(); } catch {}
  }
  rocksInFlight.length = 0;
  // v3 BUG FIX — reset all grid cells' `pickedUp` flag so notes/rocks
  // collected in prior runs reappear. Switches also reset to "unflipped"
  // for objective re-tracking; the per-cell `closetUsedAt` is reset so the
  // cooldown timer doesn't carry across runs.
  for (const cell of grid.values()) {
    cell.pickedUp = false;
    cell.switchFlipped = false;
    cell.closetUsedAt = -1e9;
    cell.fixtureOn = true;
    cell.lightOverride = null;
  }
  // Reset level.
  applyLevel(0);
  // Reset monster.
  monsterSprite.position.set(60, MONSTER_HEIGHT / 2 + 0.3, 60);
  monsterState.pos.copy(monsterSprite.position);
  monsterState.isHunting = false;
  monsterState.lastSeenAt = now();
  monsterState.lastTeleport = now();
  // Reset shadows + whispers.
  for (const sh of shadows) { sh.active = false; sh.sprite.visible = false; sh.mat.opacity = 0; }
  for (const wp of whispers) { wp.active = false; wp.sprite.visible = false; wp.mat.opacity = 0; }
  // Reset win/jumpscare.
  jumpscaring = false; jumpscarePhase = 'none';
  winSequencePhase = 'none'; winSequenceT = 0;
  // v3 BUG FIX: restore camera FOV in case the jumpscare/win cutscene left
  // it pulled-in. Otherwise restarting after a death keeps the zoom.
  camera.fov = _tunnelZoomBaseFov;
  camera.updateProjectionMatrix();
  _tunnelZoomT = 0;
  if (!_isTouch) {
    renderer.domElement.requestPointerLock();
  }
  runStartTs = performance.now() / 1000;
  totalElapsed = 0;
  startAudio();
  playAmbience(0.6);
}

function pauseGame() {
  if (gameState !== 'play') return;
  gameState = 'paused';
  document.body.classList.remove('is-playing');
  pauseOverlay.hidden = false;
  document.exitPointerLock?.();
  playAmbience(0);
  playSteam(0);
  // v3 — populate pause-menu objective recap with current-level objective.
  if (pauseObjective) {
    const L = LEVELS[currentLevel];
    let progress = 0;
    if (L.objectiveKind === 'walk') progress = Math.min(L.objectiveTarget, player.visitedCells.size);
    else if (L.objectiveKind === 'notes') progress = player.notesCollected;
    else if (L.objectiveKind === 'switches') progress = player.switchesFlipped;
    const status = levelObjectiveMet[currentLevel]
      ? '<b style="color:#5ef38c">COMPLETE</b>'
      : (L.objectiveKind === 'exit' ? 'open' : `<b>${progress}/${L.objectiveTarget}</b>`);
    pauseObjective.innerHTML = `<div class="pause-obj-row"><span>LEVEL ${currentLevel + 1} — ${L.name}</span>${status}</div>` +
                               `<div class="pause-obj-detail">${L.objective}</div>`;
  }
}

function resumeGame() {
  if (gameState !== 'paused') return;
  gameState = 'play';
  document.body.classList.add('is-playing');
  pauseOverlay.hidden = true;
  if (!_isTouch) {
    renderer.domElement.requestPointerLock();
  }
  playAmbience(0.6);
  playSteam(LEVELS[currentLevel].showSteam ? 0.5 : 0);
}

function endGame(reason) {
  if (gameState === 'dead' || gameState === 'win') return;
  gameState = 'dead';
  document.body.classList.remove('is-playing');
  document.exitPointerLock?.();
  // v3 BUG FIX: clean up ALL monster visuals so end-card isn't covered by a
  // half-faded shadow or whisper, and the stalker outline disappears.
  for (const sh of shadows) { sh.active = false; sh.sprite.visible = false; sh.mat.opacity = 0; }
  for (const wp of whispers) { wp.active = false; wp.sprite.visible = false; wp.mat.opacity = 0; }
  stalker.active = false;
  stalkerSprite.visible = false;
  stalkerMat.opacity = 0;
  // Stop drift/ticking of in-flight rocks (no audio mid-end-card).
  for (const r of rocksInFlight) {
    scene.remove(r.sprite);
    try { r.mat.dispose(); } catch {}
  }
  rocksInFlight.length = 0;
  // v3 BUG FIX — hide overlay panels left over from collectibles.
  if (noteOverlay) { noteOverlay.hidden = true; noteOverlay.classList.remove('is-shown'); }
  if (mapOverlay) { mapOverlay.hidden = true; mapOverlay.classList.remove('is-shown'); }
  clearTimeout(noteHideTimer); clearTimeout(mapHideTimer);
  const depth = player.visitedCells.size;
  const level = currentLevel;
  endDepth.textContent = String(depth);
  endLevel.textContent = String(level + 1);
  const title = document.getElementById('end-title');
  const sub = document.getElementById('end-sub');
  if (reason === 'monster') {
    title.textContent = 'CAUGHT';
    sub.textContent = 'It found you. It always finds you.';
  } else {
    title.textContent = 'LOST';
    sub.textContent = 'Your sanity gave out. The yellow walls won.';
  }
  // v3 — per-level stats summary.
  if (endLevelStats) {
    const rows = [];
    for (let i = 0; i < LEVELS.length; i++) {
      const t = player.levelTime[i] || 0;
      if (t < 0.5 && i > currentLevel) continue; // skip never-reached
      const mm = String(Math.floor(t / 60)).padStart(2, '0');
      const ss = String(Math.floor(t % 60)).padStart(2, '0');
      rows.push(`<li>${LEVELS[i].name} &middot; <b>${mm}:${ss}</b></li>`);
    }
    rows.push(`<li>Notes found: <b>${player.notesCollected}</b></li>`);
    rows.push(`<li>Maps used: <b>${player.mapsCollected}</b></li>`);
    rows.push(`<li>Switches flipped: <b>${player.switchesFlipped}</b></li>`);
    endLevelStats.innerHTML = rows.join('');
  }
  const run = { depth, level, score: depth, ts: Date.now() };
  const result = submitRun('backrooms-3d', run, (a, b) => (b.depth || 0) - (a.depth || 0));
  const b2 = result.current;
  endBest.innerHTML = `Best depth: <b>${b2.depth} rooms (lvl ${(b2.level || 0) + 1})</b>${result.isNewBest ? ' &#9733; NEW BEST!' : ''}`;
  endOverlay.hidden = false;
  playAmbience(0);
  playSteam(0);
}

function winGame() {
  if (gameState === 'win' || gameState === 'dead') return;
  gameState = 'win';
  document.body.classList.remove('is-playing');
  document.exitPointerLock?.();
  // v3 BUG FIX: clean up all monster visuals — same as endGame. Otherwise
  // the win overlay shows with a faded shadow/whisper visible behind it.
  for (const sh of shadows) { sh.active = false; sh.sprite.visible = false; sh.mat.opacity = 0; }
  for (const wp of whispers) { wp.active = false; wp.sprite.visible = false; wp.mat.opacity = 0; }
  stalker.active = false;
  stalkerSprite.visible = false;
  stalkerMat.opacity = 0;
  for (const r of rocksInFlight) {
    scene.remove(r.sprite);
    try { r.mat.dispose(); } catch {}
  }
  rocksInFlight.length = 0;
  if (noteOverlay) { noteOverlay.hidden = true; noteOverlay.classList.remove('is-shown'); }
  if (mapOverlay) { mapOverlay.hidden = true; mapOverlay.classList.remove('is-shown'); }
  clearTimeout(noteHideTimer); clearTimeout(mapHideTimer);
  const depth = player.visitedCells.size;
  const elapsed = Math.floor(performance.now() / 1000 - runStartTs);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  if (winDepth) winDepth.textContent = String(depth);
  if (winTime) winTime.textContent = `${mm}:${ss}`;
  // Submit run flagged as a win.
  const run = { depth, level: 4, score: depth + 1000, ts: Date.now(), win: true };
  submitRun('backrooms-3d', run, (a, b) => (b.depth || 0) - (a.depth || 0));
  winOverlay.hidden = false;
  playAmbience(0);
  playSteam(0);
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('end-restart').addEventListener('click', () => {
  endOverlay.hidden = true; startGame();
});
document.getElementById('pause-resume').addEventListener('click', resumeGame);
document.getElementById('pause-restart').addEventListener('click', () => {
  pauseOverlay.hidden = true; startGame();
});
document.getElementById('win-restart').addEventListener('click', () => {
  winOverlay.hidden = true; startGame();
});

// =============================================================================
// INTERACT — raycasts from the camera. If an interactable mesh is within
// 2.5m and roughly in front, fire the appropriate action.
// =============================================================================
const _ray = new THREE.Raycaster();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
function findInteractable() {
  if (interactables.length === 0) return null;
  // v3 — floor pickups (note/rock/map) live near the player's feet — a normal
  // forward-only raycast misses them when the player looks straight ahead. So
  // we ALSO do a 2m-radius proximity check for kinds that are floor-laid.
  // Wall-mounted items (closet/switch/exit) still use the directional raycast.
  let bestProx = null, bestProxDist = 2.0;
  for (const it of interactables) {
    if (it.kind !== 'note' && it.kind !== 'rock' && it.kind !== 'mapSnippet') continue;
    const dx = it.mesh.position.x - player.pos.x;
    const dz = it.mesh.position.z - player.pos.z;
    const d = Math.hypot(dx, dz);
    if (d < bestProxDist) { bestProxDist = d; bestProx = it; }
  }
  // Wall-mounted directional raycast.
  const eyeY = PLAYER_H - (player.crouching ? CROUCH_HEIGHT_DROP : 0);
  _rayOrigin.set(player.pos.x, eyeY, player.pos.z);
  _rayDir.set(
    Math.cos(player.pitch) * -Math.sin(player.yaw),
    Math.sin(player.pitch),
    Math.cos(player.pitch) * -Math.cos(player.yaw),
  ).normalize();
  _ray.set(_rayOrigin, _rayDir);
  _ray.far = 2.5;
  const wallMeshes = interactables
    .filter(i => i.kind === 'closet' || i.kind === 'switch' || i.kind === 'exit')
    .map(i => i.mesh);
  const hits = _ray.intersectObjects(wallMeshes, false);
  let bestRay = null;
  if (hits.length > 0) {
    const m = hits[0].object;
    bestRay = interactables.find(i => i.mesh === m) || null;
  }
  // Prefer wall-mounted (because the player explicitly aimed at it) unless a
  // floor pickup is much closer (< 1.2m — they're literally on top of it).
  if (bestRay && bestProx) {
    return bestProxDist < 1.2 ? bestProx : bestRay;
  }
  return bestRay || bestProx;
}
function tryInteract() {
  // v3 BUG FIX: never run interact logic outside of 'play'. Without this guard,
  // a stuck click event late in the WIN/DEAD pipeline could re-trigger the win
  // cutscene or hide the player mid-end-card.
  if (gameState !== 'play') return;
  const target = findInteractable();
  if (!target) return;
  const cell = grid.get(target.cellKey);
  if (!cell) return;
  if (target.kind === 'closet') {
    // Cooldown check.
    if (now() - cell.closetUsedAt < HIDE_COOLDOWN_SEC) return;
    // v3 BUG FIX: don't allow re-hiding while already hidden — was permitted
    // before, resulting in stuck states where the player could hide forever.
    if (player.isHidden) return;
    cell.closetUsedAt = now();
    player.hideUntil = now() + HIDE_IMMUNITY_SEC;
    player.isHidden = true;
    playSwitchClick();
  } else if (target.kind === 'switch') {
    cell.fixtureOn = !cell.fixtureOn;
    // Also affect any neighbouring fixture cells in the same row of the room
    // by toggling the cell's lightOverride. The actual on/off behaviour is
    // applied per-frame in tickLights.
    cell.lightOverride = cell.fixtureOn ? null : 'off';
    // Swap the panel texture.
    if (cell.switchMesh) cell.switchMesh.material = cell.fixtureOn ? switchOnMat : switchOffMat;
    playSwitchClick();
    // v3 — count toward Level 2 objective (only first flip per switch counts).
    if (!cell.switchFlipped) {
      cell.switchFlipped = true;
      player.switchesFlipped++;
      checkObjectiveProgress();
    }
  } else if (target.kind === 'exit') {
    // EXIT — only valid on Level 4 (currentLevel === 3).
    if (currentLevel === 3) beginWinSequence();
  } else if (target.kind === 'note') {
    // v3 — pick up note: mark consumed, show overlay text, remove from scene.
    if (cell.pickedUp) return;
    cell.pickedUp = true;
    showNote(NOTE_TEXTS[cell.noteIndex] || NOTE_TEXTS[0]);
    removeInteractableMesh(target);
    player.notesCollected++;
    playPaperPickup();
    checkObjectiveProgress();
  } else if (target.kind === 'rock') {
    // v3 — pick up rock; cap inventory at ROCK_MAX_CARRY.
    if (cell.pickedUp) return;
    if (player.rocks >= ROCK_MAX_CARRY) return;
    cell.pickedUp = true;
    removeInteractableMesh(target);
    player.rocks++;
    playRockClack(0.3, 0);
  } else if (target.kind === 'mapSnippet') {
    if (cell.pickedUp) return;
    cell.pickedUp = true;
    removeInteractableMesh(target);
    player.mapsCollected++;
    showMapOverlay();
    playMapBlip();
  }
}
// v3 helper — drops an interactable mesh from the scene + the lookup array.
function removeInteractableMesh(item) {
  if (!item || !item.mesh) return;
  scene.remove(item.mesh);
  if (item.mesh.material && item.mesh.material.dispose) {
    // Sprite materials are shared (texture) — only dispose the per-sprite
    // material instance, not the texture map.
    try { item.mesh.material.dispose(); } catch {}
  }
  const idx = interactables.indexOf(item);
  if (idx !== -1) interactables.splice(idx, 1);
}

function beginWinSequence() {
  // v3 BUG FIX: state machine must not allow re-entry once 'winning' or 'win'
  // is set. Previously a stray E press while the white flash was active could
  // call beginWinSequence again, restarting the timer mid-cutscene.
  if (gameState !== 'play') return;
  gameState = 'winning';
  document.body.classList.remove('is-playing');
  document.exitPointerLock?.();
  winSequenceT = 0;
  winSequencePhase = 'opening';
  winSequenceTotal = 0;
  playWinChord();
}

// =============================================================================
// v3 — THROWN ROCKS: simple ballistic projectile pool. Each rock arcs forward
// from the camera + gravity, then on first wall/floor hit fires a noise event
// that attracts the chaser monster.
// =============================================================================
const ROCK_POOL = 8;
const rocksInFlight = [];
const rockTexFly = TEXTURES.rock;
function tryThrowRock() {
  if (gameState !== 'play') return;
  if (player.rocks <= 0) return;
  player.rocks--;
  playThrow();
  // Spawn sprite + ballistic state.
  const mat = new THREE.SpriteMaterial({ map: rockTexFly, fog: true, transparent: true, depthWrite: false });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(0.32, 0.32, 1);
  const eyeY = PLAYER_H - (player.crouching ? CROUCH_HEIGHT_DROP : 0);
  spr.position.set(player.pos.x, eyeY - 0.1, player.pos.z);
  scene.add(spr);
  // Velocity from camera-look direction. Add a small upward bias for arc.
  const lookX = Math.cos(player.pitch) * -Math.sin(player.yaw);
  const lookY = Math.sin(player.pitch);
  const lookZ = Math.cos(player.pitch) * -Math.cos(player.yaw);
  rocksInFlight.push({
    sprite: spr, mat,
    pos: spr.position,
    vel: new THREE.Vector3(
      lookX * ROCK_THROW_SPEED,
      lookY * ROCK_THROW_SPEED + 1.5,
      lookZ * ROCK_THROW_SPEED,
    ),
    ttl: 4.0,
    landed: false,
  });
  if (rocksInFlight.length > ROCK_POOL) {
    // Drop oldest if we exceed the pool to keep allocations bounded.
    const oldest = rocksInFlight.shift();
    scene.remove(oldest.sprite);
    try { oldest.mat.dispose(); } catch {}
  }
}
function tickRocks(dt) {
  for (let i = rocksInFlight.length - 1; i >= 0; i--) {
    const r = rocksInFlight[i];
    r.ttl -= dt;
    if (!r.landed) {
      // Apply gravity + step.
      r.vel.y -= ROCK_GRAVITY * dt;
      const nx = r.pos.x + r.vel.x * dt;
      const ny = r.pos.y + r.vel.y * dt;
      const nz = r.pos.z + r.vel.z * dt;
      // Floor collision.
      if (ny < 0.1) {
        r.pos.set(nx, 0.1, nz);
        landRock(r);
      } else {
        // Wall collision via existing collideMove (treat as a tiny radius).
        const [px, pz] = collideMove(r.pos.x, r.pos.z, r.vel.x * dt, r.vel.z * dt);
        const blocked = Math.abs(px - (r.pos.x + r.vel.x * dt)) > 0.001
                     || Math.abs(pz - (r.pos.z + r.vel.z * dt)) > 0.001;
        r.pos.set(px, ny, pz);
        if (blocked) landRock(r);
      }
    }
    if (r.ttl <= 0) {
      scene.remove(r.sprite);
      try { r.mat.dispose(); } catch {}
      rocksInFlight.splice(i, 1);
    }
  }
}
function landRock(rock) {
  if (rock.landed) return;
  rock.landed = true;
  rock.vel.set(0, 0, 0);
  // Audio clack with stereo pan + monster distract.
  const dx = rock.pos.x - player.pos.x;
  const dz = rock.pos.z - player.pos.z;
  const dist = Math.hypot(dx, dz);
  const screenSpaceX = Math.atan2(dz, dx) - player.yaw;
  const panX = Math.sin(screenSpaceX);
  playRockClack(Math.min(1, 0.5 + 0.3 / Math.max(1, dist / 6)), panX);
  // Chaser distraction — if within radius, redirect wander target to landing spot.
  const md = Math.hypot(monsterState.pos.x - rock.pos.x, monsterState.pos.z - rock.pos.z);
  if (md < ROCK_NOISE_RADIUS) {
    monsterState.wanderTarget = { x: rock.pos.x, z: rock.pos.z };
    // Mark as recently "heard" so the chaser commits to it briefly.
    monsterState.lastSeenAt = now();
  }
}

// =============================================================================
// MAIN LOOP
// =============================================================================
let prevTs = performance.now();
function loop(nowMs) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (nowMs - prevTs) / 1000);
  prevTs = nowMs;
  if (gameState === 'play') {
    tickPlay(dt);
  } else if (gameState === 'winning') {
    tickWinSequence(dt);
  } else if (jumpscaring) {
    tickJumpscare(dt);
  }
  // v4 polish: tunnel-zoom FOV pulse on level change. Pulls FOV down (zoom in)
  // for the first ~0.35s then back to base. Skip during jumpscare (it owns FOV).
  if (_tunnelZoomT > 0 && !jumpscaring) {
    _tunnelZoomT = Math.max(0, _tunnelZoomT - dt);
    const k = 1 - _tunnelZoomT / 0.7; // 0..1
    // ease: in-out, peak at k=0.4
    const pulse = k < 0.4 ? (k / 0.4) : (1 - (k - 0.4) / 0.6);
    const fov = _tunnelZoomBaseFov - pulse * 28;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    if (_tunnelZoomT === 0) {
      camera.fov = _tunnelZoomBaseFov;
      camera.updateProjectionMatrix();
    }
  }
  renderer.render(scene, camera);
}

function tickPlay(dt) {
  totalElapsed += dt;
  // v3 — track per-level alive time. Index by currentLevel.
  if (currentLevel >= 0 && currentLevel < player.levelTime.length) {
    player.levelTime[currentLevel] += dt;
  }
  // ---- Input → desired velocity ----
  const fwd = (keys.has('w') || keys.has('arrowup')) ? 1 : 0;
  const back = (keys.has('s') || keys.has('arrowdown')) ? 1 : 0;
  const left = (keys.has('a') || keys.has('arrowleft')) ? 1 : 0;
  const right = (keys.has('d') || keys.has('arrowright')) ? 1 : 0;
  let mx = (right - left);
  let my = (back - fwd);
  if (_isTouch && mcMove.mag > 0.05) {
    mx = mcMove.x; my = mcMove.y;
  }
  // ---- Sprint + stamina + crouch ----
  const inputMagRaw = Math.hypot(mx, my);
  const sprintHeld = keys.has('shift') || mobileSprintHeld;
  // Sprint requires stamina above the minimum AND not crouching.
  // While sprinting, stamina drains; if it bottoms out, sprint is locked out
  // until it regenerates above the min threshold.
  const canSprint = !player.crouching
                  && inputMagRaw > 0.1
                  && player.stamina > 0;
  player.sprinting = sprintHeld && canSprint && player.stamina > (player.sprinting ? 0 : STAMINA_SPRINT_MIN);
  if (player.sprinting) {
    player.stamina = Math.max(0, player.stamina - STAMINA_DRAIN * dt);
    player.staminaCooldown = STAMINA_REGEN_DELAY;
  } else {
    if (player.staminaCooldown > 0) player.staminaCooldown = Math.max(0, player.staminaCooldown - dt);
    else player.stamina = Math.min(STAMINA_MAX, player.stamina + STAMINA_REGEN * dt);
  }
  // Crouch slows you down + makes footsteps quieter.
  const speedMult = player.crouching ? CROUCH_SPEED
                  : player.sprinting ? SPRINT_MULT
                  : 1.0;
  const speed = WALK_SPEED * speedMult;
  const cs = Math.cos(player.yaw), sn = Math.sin(player.yaw);
  let vx = (-sn * (-my)) + (cs * mx);
  let vz = (-cs * (-my)) + (-sn * mx);
  const inputMag = Math.hypot(vx, vz);
  if (inputMag > 1) { vx /= inputMag; vz /= inputMag; }
  vx *= speed; vz *= speed;
  const [nx, nz] = collideMove(player.pos.x, player.pos.z, vx * dt, vz * dt);
  const moved = Math.hypot(nx - player.pos.x, nz - player.pos.z);
  player.pos.x = nx; player.pos.z = nz;
  if (moved > 0.001) {
    player.walkTime += dt * (player.sprinting ? 11 : player.crouching ? 5 : 8);
    player.walkBob = Math.sin(player.walkTime) * (player.sprinting ? 0.06 : player.crouching ? 0.02 : 0.04);
    const stepInterval = player.sprinting ? 0.22 : player.crouching ? 0.52 : 0.35;
    if (now() - player.lastFootstep > stepInterval) {
      const vol = (moved / dt / WALK_SPEED) * (player.crouching ? CROUCH_FOOTSTEP_VOL : 1);
      playFootstep(vol);
      player.lastFootstep = now();
      // v3 — STALKER mimicry: schedule a fake step a moment later.
      if (stalker.active && !player.crouching) {
        stalker.pendingStep = now() + STALKER_STEP_CADENCE_OFFSET;
      }
    }
  } else {
    player.walkBob *= 0.85;
  }
  // v3 — eye height accounts for crouch.
  const eyeY = PLAYER_H - (player.crouching ? CROUCH_HEIGHT_DROP : 0);
  camera.position.set(player.pos.x, eyeY + player.walkBob, player.pos.z);
  const lookX = Math.cos(player.pitch) * -Math.sin(player.yaw);
  const lookY = Math.sin(player.pitch);
  const lookZ = Math.cos(player.pitch) * -Math.cos(player.yaw);
  camera.lookAt(camera.position.x + lookX, camera.position.y + lookY, camera.position.z + lookZ);
  // Flashlight follows the camera (used on Level 4).
  if (flashlight.intensity > 0) {
    flashlight.position.set(camera.position.x, camera.position.y, camera.position.z);
    flashTarget.position.set(camera.position.x + lookX, camera.position.y + lookY, camera.position.z + lookZ);
  }
  const { cx, cy } = cellAt(player.pos.x, player.pos.z);
  const k = cellKey(cx, cy);
  if (!player.visitedCells.has(k)) {
    player.visitedCells.add(k);
    player.deepestCell++;
    // Level-progression check.
    const newLevel = Math.min(LEVELS.length - 1, Math.floor(player.deepestCell / CELLS_PER_LEVEL));
    if (newLevel > currentLevel) applyLevel(newLevel);
    // v3 — Lobby/walk objective progresses with each new cell.
    checkObjectiveProgress();
  }
  expandIfNeeded(cx, cy);
  syncVisibleCells(cx, cy);
  tickLights(dt, cx, cy);
  tickMonster(dt);
  tickShadows(dt);
  tickWhispers(dt);
  tickStalker(dt);
  tickRocks(dt);
  tickDistantSounds(dt);
  tickSanity(dt);
  tickInteractPrompt();
  tickHUD();
  // Hide expiry.
  if (player.isHidden && now() > player.hideUntil) {
    player.isHidden = false;
  }
}

// Helper — current "game time" in seconds.
function now() { return performance.now() / 1000; }

// =============================================================================
// LIGHT TICK — each visible fixture computes a per-frame intensity using
// random flicker, dying-light fade, and dead-light gates. Honours the
// per-cell `fixtureOn` flag from light switches.
// =============================================================================
function tickLights(dt, pcx, pcy) {
  let buzzAccum = 0, buzzCount = 0;
  // Buzz baseline scales down on darker levels (warehouse + below).
  const buzzScale = (currentLevel === 0) ? 1.0 : (currentLevel === 1) ? 0.6 : (currentLevel === 2) ? 0.4 : 0.15;
  for (let dy = -RENDER_RADIUS; dy <= RENDER_RADIUS; dy++) {
    for (let dx = -RENDER_RADIUS; dx <= RENDER_RADIUS; dx++) {
      const cell = grid.get(cellKey(pcx + dx, pcy + dy));
      if (!cell?.light) continue;
      // Hard off if cell has been switched off.
      if (!cell.fixtureOn) {
        cell.light.intensity = 0;
        if (cell.fixtureMat) cell.fixtureMat.color.setRGB(0.05, 0.04, 0.03);
        continue;
      }
      let intensity = 0.5;
      const sinVal = Math.sin(totalElapsed * (8 + cell.fixturePhase) + cell.fixturePhase);
      intensity *= 0.85 + 0.15 * sinVal;
      const r = Math.random();
      if (r < dt / cell.fixtureFlickerRate) { intensity *= 0.2; playFlicker(); }
      if (cell.fixtureDying) {
        intensity *= (Math.sin(totalElapsed * 1.4 + cell.fixturePhase * 3) > 0) ? 1.0 : 0.15;
      }
      cell.light.intensity = intensity;
      if (cell.fixtureMat) {
        const v = Math.min(1, intensity * 1.8);
        const tone = LEVELS[currentLevel].lightTone;
        const tr = ((tone >> 16) & 0xff) / 255;
        const tg = ((tone >> 8) & 0xff) / 255;
        const tb = (tone & 0xff) / 255;
        cell.fixtureMat.color.setRGB(v * tr, v * tg, v * tb);
      }
      buzzAccum += intensity; buzzCount++;
    }
  }
  if (buzzCount > 0) {
    playBuzz(Math.min(1, buzzAccum / buzzCount) * buzzScale);
  }
}

// =============================================================================
// MONSTER TICK — moves the CHASER toward the player.
// =============================================================================
function tickMonster(dt) {
  const L = LEVELS[currentLevel];
  const dx = player.pos.x - monsterState.pos.x;
  const dz = player.pos.z - monsterState.pos.z;
  const dist = Math.hypot(dx, dz);
  // Audio cue — distance-based panning.
  const screenSpaceX = Math.atan2(dz, dx) - player.yaw;
  const panX = Math.sin(screenSpaceX);
  playMonsterFar(dist, panX);
  updateMonsterDistance(dist);
  const sees = hasLineOfSight(player.pos.x, player.pos.z, monsterState.pos.x, monsterState.pos.z);
  if (sees && dist < MONSTER_DETECT_DIST * 1.5) {
    monsterState.lastSeenAt = now();
  }
  monsterState.isHunting = dist < MONSTER_DETECT_DIST && sees;
  // Level scaling — chaserBonus boosts hunt speed on higher levels.
  let speed = monsterState.isHunting
    ? (MONSTER_HUNT_SPEED + L.chaserBonus)
    : (MONSTER_WANDER_SPEED * L.monsterScale);
  let mvx = 0, mvz = 0;
  if (monsterState.isHunting) {
    const inv = 1 / Math.max(0.001, dist);
    mvx = dx * inv; mvz = dz * inv;
  } else {
    if (!monsterState.wanderTarget || Math.hypot(
          monsterState.pos.x - monsterState.wanderTarget.x,
          monsterState.pos.z - monsterState.wanderTarget.z) < 1.0) {
      const ang = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 12;
      monsterState.wanderTarget = {
        x: monsterState.pos.x + Math.cos(ang) * r,
        z: monsterState.pos.z + Math.sin(ang) * r,
      };
    }
    const wx = monsterState.wanderTarget.x - monsterState.pos.x;
    const wz = monsterState.wanderTarget.z - monsterState.pos.z;
    const wd = Math.hypot(wx, wz);
    if (wd > 0.001) { mvx = wx / wd; mvz = wz / wd; }
  }
  const oldX = monsterState.pos.x, oldZ = monsterState.pos.z;
  const targetX = oldX + mvx * speed * dt;
  const targetZ = oldZ + mvz * speed * dt;
  const tryStep = (tx, tz) => {
    const c = grid.get(cellKey(Math.floor(tx / CELL), Math.floor(tz / CELL)));
    if (!c) return false;
    const fx = tx - Math.floor(tx / CELL) * CELL;
    const fz = tz - Math.floor(tz / CELL) * CELL;
    const r = 0.4;
    if (c.walls.W && fx < r) return false;
    if (c.walls.E && fx > CELL - r) return false;
    if (c.walls.N && fz < r) return false;
    if (c.walls.S && fz > CELL - r) return false;
    return true;
  };
  if (tryStep(targetX, oldZ)) monsterState.pos.x = targetX;
  if (tryStep(monsterState.pos.x, targetZ)) monsterState.pos.z = targetZ;
  monsterSprite.position.set(monsterState.pos.x, MONSTER_HEIGHT / 2 + 0.3, monsterState.pos.z);
  // Catch / jumpscare — unless the player is hidden.
  if (dist < MONSTER_CATCH_DIST && !jumpscaring) {
    if (player.isHidden) {
      // Force the chaser to back off — give it a new wander target far away.
      const ang = Math.random() * Math.PI * 2; const r = 25 + Math.random() * 15;
      monsterState.wanderTarget = {
        x: monsterState.pos.x + Math.cos(ang) * r,
        z: monsterState.pos.z + Math.sin(ang) * r,
      };
    } else {
      triggerJumpscare();
    }
  }
  if (now() - monsterState.lastSeenAt > MONSTER_TELEPORT_INTERVAL
      && now() - monsterState.lastTeleport > MONSTER_TELEPORT_INTERVAL) {
    monsterState.lastTeleport = now();
    const ang = Math.random() * Math.PI * 2;
    const r = 35 + Math.random() * 20;
    monsterState.pos.x = player.pos.x + Math.cos(ang) * r;
    monsterState.pos.z = player.pos.z + Math.sin(ang) * r;
    monsterSprite.position.set(monsterState.pos.x, MONSTER_HEIGHT / 2 + 0.3, monsterState.pos.z);
  }
}

// =============================================================================
// SHADOWS — flicker-spawn near the player at the EDGE of view. Each shadow
// stays visible for 2-4s while fading in then out. If the player stares
// at one (dot product > 0.93) for >1s, sanity drain fires.
// =============================================================================
let shadowSpawnCooldown = 0;
function tickShadows(dt) {
  const L = LEVELS[currentLevel];
  shadowSpawnCooldown -= dt;
  // Try to spawn a new shadow.
  if (shadowSpawnCooldown <= 0) {
    shadowSpawnCooldown = 4 + Math.random() * 6;
    if (Math.random() < L.shadowChance) spawnShadow();
  }
  // Update active shadows.
  const fwdX = -Math.sin(player.yaw);
  const fwdZ = -Math.cos(player.yaw);
  for (const sh of shadows) {
    if (!sh.active) continue;
    sh.ttl -= dt;
    // Fade in 0→0.6 over 0.4s, then fade out as ttl→0.
    sh.fadeIn = Math.min(1, sh.fadeIn + dt / 0.4);
    const outFade = Math.min(1, sh.ttl / 0.8);
    sh.mat.opacity = 0.7 * sh.fadeIn * Math.max(0, outFade);
    if (sh.ttl <= 0) {
      sh.active = false; sh.sprite.visible = false; sh.mat.opacity = 0;
      continue;
    }
    // Stare detection — if the shadow is roughly in front of the player AND
    // within reasonable distance, accumulate stare-time.
    const dx = sh.sprite.position.x - player.pos.x;
    const dz = sh.sprite.position.z - player.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 20) {
      const nx = dx / dist, nz = dz / dist;
      const dot = nx * fwdX + nz * fwdZ;
      if (dot > 0.93) {
        sh.staredAt += dt;
        if (sh.staredAt > 1.0) {
          player.sanity = Math.max(0, player.sanity - SANITY_DRAIN_STARE * dt);
        }
      } else {
        sh.staredAt = Math.max(0, sh.staredAt - dt * 2);
      }
    }
  }
}
function spawnShadow() {
  // Pick an inactive slot.
  const free = shadows.find(s => !s.active);
  if (!free) return;
  // Spawn in a random direction, 6-12m away, BEHIND or to the side of player
  // so it feels like "I saw something move in the corner of my eye".
  const ang = player.yaw + (Math.random() < 0.5 ? 1 : -1) * (Math.PI * 0.5 + Math.random() * Math.PI * 0.3);
  const r = 6 + Math.random() * 8;
  const sx = player.pos.x + Math.cos(ang) * r;
  const sz = player.pos.z + Math.sin(ang) * r;
  // Sanity check: must be inside grid bounds.
  if (!grid.get(cellKey(Math.floor(sx / CELL), Math.floor(sz / CELL)))) return;
  free.sprite.position.set(sx, MONSTER_HEIGHT / 2 + 0.2, sz);
  free.sprite.visible = true;
  free.mat.opacity = 0;
  free.fadeIn = 0;
  free.staredAt = 0;
  free.ttl = 2 + Math.random() * 2;
  free.active = true;
}

// =============================================================================
// WHISPERS — far-away stationary silhouettes. Spawn 1-2 per level transition.
// =============================================================================
function tickWhispers(dt) {
  const L = LEVELS[currentLevel];
  const fwdX = -Math.sin(player.yaw);
  const fwdZ = -Math.cos(player.yaw);
  for (const wp of whispers) {
    if (!wp.active) continue;
    // Whispers fade as the player approaches (the illusion of "they were never there").
    const dx = wp.sprite.position.x - player.pos.x;
    const dz = wp.sprite.position.z - player.pos.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 8) {
      // Dissolve.
      wp.active = false; wp.sprite.visible = false; wp.mat.opacity = 0; continue;
    }
    // Far whisper: visible only on direct sight-line, fully opaque from 25m+.
    const visible = hasLineOfSight(player.pos.x, player.pos.z, wp.sprite.position.x, wp.sprite.position.z);
    if (visible && dist > 12 && dist < 50) {
      wp.mat.opacity = Math.min(0.85, (dist - 12) / 18);
      const nx = dx / dist, nz = dz / dist;
      const dot = nx * fwdX + nz * fwdZ;
      if (dot > 0.92) {
        wp.staredAt += dt;
        if (wp.staredAt > 0.6) {
          player.sanity = Math.max(0, player.sanity - SANITY_DRAIN_STARE * 0.7 * dt);
        }
        if (now() - wp.lastWhisper > 4 + Math.random() * 3) {
          wp.lastWhisper = now();
          playWhisper();
        }
      } else {
        wp.staredAt = Math.max(0, wp.staredAt - dt);
      }
    } else {
      wp.mat.opacity *= 0.95;
      wp.staredAt = Math.max(0, wp.staredAt - dt);
    }
  }
  // Spawn check — only when no whispers are active.
  const anyActive = whispers.some(w => w.active);
  if (!anyActive && Math.random() < L.whisperChance * dt * 0.4) {
    spawnWhisper();
  }
}
function spawnWhisper() {
  const free = whispers.find(w => !w.active);
  if (!free) return;
  // Pick a cell far from player but in a "dead-end-ish" direction.
  const ang = Math.random() * Math.PI * 2;
  const r = 22 + Math.random() * 18;
  const sx = player.pos.x + Math.cos(ang) * r;
  const sz = player.pos.z + Math.sin(ang) * r;
  if (!grid.get(cellKey(Math.floor(sx / CELL), Math.floor(sz / CELL)))) return;
  free.sprite.position.set(sx, MONSTER_HEIGHT / 2 + 0.1, sz);
  free.sprite.visible = true;
  free.mat.opacity = 0;
  free.active = true;
  free.lastWhisper = now();
  free.staredAt = 0;
}

// =============================================================================
// STALKER — 4th monster archetype. Stays STALKER_FOLLOW_DIST behind the player,
// mimicking footsteps with a slight offset. Only visible when the player turns
// around (chalk-outline sprite). Cannot catch the player; drains sanity when
// looked at directly.
//
// Activation: spawns on Level 2+ once the player has walked >=12 cells on
// that level. Single instance per game.
// =============================================================================
let stalkerActivatedThisLevel = -1;
function tickStalker(dt) {
  // Activation gate.
  if (currentLevel >= STALKER_MIN_LEVEL
      && stalkerActivatedThisLevel !== currentLevel
      && player.visitedCells.size > 12) {
    stalkerActivatedThisLevel = currentLevel;
    stalker.active = true;
    // Spawn directly behind player.
    const behindX = player.pos.x + Math.sin(player.yaw) * STALKER_FOLLOW_DIST;
    const behindZ = player.pos.z + Math.cos(player.yaw) * STALKER_FOLLOW_DIST;
    stalker.pos.set(behindX, MONSTER_HEIGHT / 2 + 0.2, behindZ);
    stalkerSprite.position.copy(stalker.pos);
    stalkerSprite.visible = true;
    stalker.staredAt = 0;
  }
  if (!stalker.active) return;
  // Compute desired position: STALKER_FOLLOW_DIST directly behind the player.
  const behindX = player.pos.x + Math.sin(player.yaw) * STALKER_FOLLOW_DIST;
  const behindZ = player.pos.z + Math.cos(player.yaw) * STALKER_FOLLOW_DIST;
  // Only teleport-relocate if the player can't see the current position OR
  // if we're way too far behind (e.g., player ran fast).
  const fwdX = -Math.sin(player.yaw);
  const fwdZ = -Math.cos(player.yaw);
  const dx = stalker.pos.x - player.pos.x;
  const dz = stalker.pos.z - player.pos.z;
  const distToPlayer = Math.hypot(dx, dz);
  const dotFwd = (dx / Math.max(0.001, distToPlayer)) * fwdX + (dz / Math.max(0.001, distToPlayer)) * fwdZ;
  const playerCanSee = dotFwd > 0.5; // roughly in front of player
  // If player can't see us OR we're too far, snap to "behind".
  if (!playerCanSee || distToPlayer > STALKER_FOLLOW_DIST * 2.5) {
    // Validate target cell is inside the grid before snapping.
    const tc = grid.get(cellKey(Math.floor(behindX / CELL), Math.floor(behindZ / CELL)));
    if (tc) stalker.pos.set(behindX, MONSTER_HEIGHT / 2 + 0.2, behindZ);
  } else {
    // Gentle drift toward the target (so it doesn't pop).
    stalker.pos.x += (behindX - stalker.pos.x) * Math.min(1, dt * 1.5);
    stalker.pos.z += (behindZ - stalker.pos.z) * Math.min(1, dt * 1.5);
  }
  stalkerSprite.position.set(stalker.pos.x, MONSTER_HEIGHT / 2 + 0.2, stalker.pos.z);
  // Fire delayed footstep mimic.
  if (stalker.pendingStep > 0 && now() >= stalker.pendingStep) {
    stalker.pendingStep = 0;
    // Stereo pan based on stalker position relative to player view.
    const screenSpaceX = Math.atan2(stalker.pos.z - player.pos.z, stalker.pos.x - player.pos.x) - player.yaw;
    const panX = Math.sin(screenSpaceX);
    playStalkerStep(panX);
  }
  // Visibility + opacity tied to whether the player looks back.
  if (playerCanSee && hasLineOfSight(player.pos.x, player.pos.z, stalker.pos.x, stalker.pos.z)) {
    stalkerMat.opacity = Math.min(0.7, stalkerMat.opacity + dt * 1.5);
    // Stare-drain sanity if dead-centre.
    if (dotFwd > 0.92) {
      stalker.staredAt += dt;
      if (stalker.staredAt > 0.8) {
        player.sanity = Math.max(0, player.sanity - SANITY_DRAIN_STARE * 0.6 * dt);
      }
    } else {
      stalker.staredAt = Math.max(0, stalker.staredAt - dt * 1.5);
    }
  } else {
    stalkerMat.opacity = Math.max(0, stalkerMat.opacity - dt * 3);
    stalker.staredAt = Math.max(0, stalker.staredAt - dt * 2);
  }
}

// =============================================================================
// DISTANT SOUNDS — periodically fire a random door slam or distant cry from
// "another room" to keep the player on edge.
// =============================================================================
let nextDistantSlam = 0, nextDistantCry = 0, nextDrip = 0;
function tickDistantSounds(dt) {
  void dt; // mark used
  const t = now();
  if (t > nextDistantSlam) {
    nextDistantSlam = t + 18 + Math.random() * 30;
    // Higher levels — more frequent slams.
    const chance = 0.4 + currentLevel * 0.15;
    if (Math.random() < chance) playDoorSlam(0.6 + Math.random() * 0.3);
  }
  if (t > nextDistantCry) {
    nextDistantCry = t + 30 + Math.random() * 50;
    if (currentLevel >= 1 && Math.random() < 0.5) playDistantCry();
  }
  if (currentLevel === 2 && t > nextDrip) {
    nextDrip = t + 2 + Math.random() * 5;
    playDrip();
  }
}

// =============================================================================
// JUMPSCARE — cinematic camera fall (0.4s slow-mo → 0.3s zoom-in → fade).
// =============================================================================
function triggerJumpscare() {
  if (jumpscaring) return;
  jumpscaring = true;
  jumpscarePhase = 'slowmo';
  jumpscareT = 0;
  jumpscareEnd = now() + 1.2;
  // Flash setup happens during the phases.
  // Snap mouse to monster face — set look direction toward monster.
  const dx = monsterState.pos.x - player.pos.x;
  const dz = monsterState.pos.z - player.pos.z;
  const targetYaw = Math.atan2(-dx, -dz);
  // We lerp toward this during the slowmo phase.
  jumpscareTargetYaw = targetYaw;
  playJumpscare();
}
let jumpscareTargetYaw = 0;

function tickJumpscare(dt) {
  jumpscareT += dt;
  if (jumpscarePhase === 'slowmo') {
    // Time dilation — player camera falls toward the monster slowly.
    const k = Math.min(1, jumpscareT / 0.4);
    // Smoothly rotate yaw toward monster.
    const dy = ((jumpscareTargetYaw - player.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    player.yaw += dy * (0.18 * (1 + k));
    // Tilt camera down + drop player height (falling effect).
    player.pitch = Math.max(-Math.PI / 2 + 0.1, player.pitch - dt * 0.6);
    // Slight FOV pull-back for "oh no" stretch.
    camera.fov = 90 + k * 12;
    camera.updateProjectionMatrix();
    // Camera lowers slightly (knees giving out).
    const eyeY = (PLAYER_H - 0.4 * k) + player.walkBob;
    camera.position.set(player.pos.x, eyeY, player.pos.z);
    const lookX = Math.cos(player.pitch) * -Math.sin(player.yaw);
    const lookY = Math.sin(player.pitch);
    const lookZ = Math.cos(player.pitch) * -Math.cos(player.yaw);
    camera.lookAt(camera.position.x + lookX, camera.position.y + lookY, camera.position.z + lookZ);
    if (jumpscareT >= 0.4) { jumpscarePhase = 'zoom'; jumpscareT = 0; }
  } else if (jumpscarePhase === 'zoom') {
    // Hard zoom-in + red flash.
    const k = Math.min(1, jumpscareT / 0.3);
    camera.fov = 102 - k * 60; // 102 → 42 over 0.3s
    camera.updateProjectionMatrix();
    if (k > 0.05) flashEl.classList.add('is-on', 'is-red');
    if (jumpscareT >= 0.3) { jumpscarePhase = 'fade'; jumpscareT = 0; }
  } else if (jumpscarePhase === 'fade') {
    // Fade flash, then end.
    if (jumpscareT >= 0.5) {
      jumpscaring = false; jumpscarePhase = 'none';
      flashEl.classList.remove('is-on', 'is-red');
      camera.fov = 90; camera.updateProjectionMatrix();
      endGame('monster');
    }
  }
}

// =============================================================================
// WIN CUTSCENE — door opens, white flash, fade to black, reveal text.
// =============================================================================
function tickWinSequence(dt) {
  winSequenceT += dt; winSequenceTotal += dt;
  if (winSequencePhase === 'opening') {
    // Camera pulls slowly forward (toward the exit door direction) +
    // gradually brightens the screen via the flash element.
    const k = Math.min(1, winSequenceT / 1.5);
    const fov = 90 + k * 18;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    // Bright halo grows.
    if (flashElWin) flashElWin.style.opacity = String(k * 0.6);
    if (winSequenceT >= 1.5) { winSequencePhase = 'whiteout'; winSequenceT = 0; }
  } else if (winSequencePhase === 'whiteout') {
    // Full white flash for 0.6s.
    if (flashElWin) flashElWin.style.opacity = '1';
    if (winSequenceT >= 0.6) { winSequencePhase = 'fade'; winSequenceT = 0; }
  } else if (winSequencePhase === 'fade') {
    // Fade to black.
    if (flashElWin) {
      flashElWin.style.background = '#000';
      flashElWin.style.opacity = '1';
    }
    if (winSequenceT >= 1.0) { winSequencePhase = 'reveal'; winSequenceT = 0; }
  } else if (winSequencePhase === 'reveal') {
    // Show win overlay, then leave the fade element fading away.
    if (winSequenceT >= 0.2) {
      // Restore flash element + show overlay.
      if (flashElWin) { flashElWin.style.opacity = '0'; flashElWin.style.background = '#fff'; }
      winSequencePhase = 'done';
      winGame();
    }
  }
}

// =============================================================================
// SANITY
// =============================================================================
function tickSanity(dt) {
  const { cx, cy } = cellAt(player.pos.x, player.pos.z);
  const cell = grid.get(cellKey(cx, cy));
  let inLight = false;
  if (cell?.light && cell.light.intensity > 0.3) inLight = true;
  const monDist = Math.hypot(monsterState.pos.x - player.pos.x, monsterState.pos.z - player.pos.z);
  const monClose = monDist < 25;
  let drain = SANITY_DRAIN_BASE;
  // Higher levels drain faster (the atmosphere is taking its toll).
  drain *= (1 + currentLevel * 0.5);
  if (inLight) drain -= SANITY_RECOVER_LIGHT;
  if (monClose && !player.isHidden) drain += SANITY_DRAIN_MONSTER * (1 - monDist / 25);
  player.sanity = Math.max(0, Math.min(100, player.sanity - drain * dt));
  if (player.sanity <= 0) endGame('sanity');
}

// =============================================================================
// v3 — OBJECTIVES, NOTES, MAP OVERLAY
// =============================================================================
// Per-level objective progress check. Sets `levelObjectiveMet[lvl] = true`
// once the target is reached. We fire `playObjectiveDing` + a tiny HUD pulse
// the first time each level is satisfied.
const levelObjectiveMet = [false, false, false, false];
function checkObjectiveProgress() {
  const L = LEVELS[currentLevel];
  if (!L || levelObjectiveMet[currentLevel]) return;
  let progress = 0;
  if (L.objectiveKind === 'walk') progress = player.visitedCells.size;
  else if (L.objectiveKind === 'notes') progress = player.notesCollected;
  else if (L.objectiveKind === 'switches') progress = player.switchesFlipped;
  else if (L.objectiveKind === 'exit') progress = 0; // satisfied only on win
  if (progress >= L.objectiveTarget) {
    levelObjectiveMet[currentLevel] = true;
    playObjectiveDing();
    // Visual ping on the objective HUD chip.
    if (objectiveOut) {
      objectiveOut.classList.add('is-met');
      setTimeout(() => objectiveOut?.classList.remove('is-met'), 1800);
    }
  }
}

// Show a note's text in the centre overlay for ~5 seconds.
let noteHideTimer = 0;
function showNote(text) {
  if (!noteOverlay) return;
  noteOverlayText.textContent = text;
  noteOverlay.hidden = false;
  noteOverlay.classList.add('is-shown');
  clearTimeout(noteHideTimer);
  noteHideTimer = setTimeout(() => {
    noteOverlay?.classList.remove('is-shown');
    setTimeout(() => { if (noteOverlay) noteOverlay.hidden = true; }, 400);
  }, 5000);
}

// Show a mini-map overlay for ~4 seconds. We render a 2D canvas snapshot of
// the currently-visible cells around the player.
let mapHideTimer = 0;
function showMapOverlay() {
  if (!mapOverlay || !mapCanvas) return;
  drawMiniMap();
  mapOverlay.hidden = false;
  mapOverlay.classList.add('is-shown');
  clearTimeout(mapHideTimer);
  mapHideTimer = setTimeout(() => {
    mapOverlay?.classList.remove('is-shown');
    setTimeout(() => { if (mapOverlay) mapOverlay.hidden = true; }, 400);
  }, 4000);
}
function drawMiniMap() {
  const ctx2d = mapCanvas.getContext('2d');
  const W = mapCanvas.width, H = mapCanvas.height;
  ctx2d.fillStyle = '#0a0806';
  ctx2d.fillRect(0, 0, W, H);
  // Each cell is 8px square.
  const px = 8;
  const ppc = { cx: Math.floor(player.pos.x / CELL), cy: Math.floor(player.pos.z / CELL) };
  const cols = Math.floor(W / px), rows = Math.floor(H / px);
  const ox = ppc.cx - Math.floor(cols / 2);
  const oy = ppc.cy - Math.floor(rows / 2);
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const cell = grid.get(cellKey(ox + cc, oy + r));
      if (!cell) continue;
      const X = cc * px, Y = r * px;
      // Floor tile color depends on whether visited.
      const visited = player.visitedCells.has(cellKey(ox + cc, oy + r));
      ctx2d.fillStyle = visited ? '#3a3220' : '#1a1408';
      ctx2d.fillRect(X + 1, Y + 1, px - 2, px - 2);
      // Walls.
      ctx2d.strokeStyle = '#c8a040'; ctx2d.lineWidth = 1;
      if (cell.walls.N) { ctx2d.beginPath(); ctx2d.moveTo(X, Y); ctx2d.lineTo(X + px, Y); ctx2d.stroke(); }
      if (cell.walls.S) { ctx2d.beginPath(); ctx2d.moveTo(X, Y + px); ctx2d.lineTo(X + px, Y + px); ctx2d.stroke(); }
      if (cell.walls.W) { ctx2d.beginPath(); ctx2d.moveTo(X, Y); ctx2d.lineTo(X, Y + px); ctx2d.stroke(); }
      if (cell.walls.E) { ctx2d.beginPath(); ctx2d.moveTo(X + px, Y); ctx2d.lineTo(X + px, Y + px); ctx2d.stroke(); }
    }
  }
  // Player dot — bright yellow, centred.
  const X = Math.floor(cols / 2) * px + px / 2;
  const Y = Math.floor(rows / 2) * px + px / 2;
  ctx2d.fillStyle = '#ffd23f';
  ctx2d.beginPath(); ctx2d.arc(X, Y, 3, 0, Math.PI * 2); ctx2d.fill();
  // Heading arrow.
  ctx2d.strokeStyle = '#ffd23f'; ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(X, Y);
  ctx2d.lineTo(X + Math.sin(-player.yaw) * 7, Y + Math.cos(-player.yaw) * -7);
  ctx2d.stroke();
}

// =============================================================================
// INTERACT PROMPT — show "[E] OPEN" or "[E] EXIT" when a target is reachable.
// =============================================================================
function tickInteractPrompt() {
  const target = findInteractable();
  if (!target) { if (!interactPrompt.hidden) interactPrompt.hidden = true; return; }
  const cell = grid.get(target.cellKey);
  let label = '';
  const keyHint = _isTouch ? 'USE' : 'E';
  if (target.kind === 'closet') {
    // v3 — when already hidden, show clear feedback instead of a stale HIDE prompt.
    if (player.isHidden) label = '[ already hidden ]';
    else if (cell && now() - cell.closetUsedAt < HIDE_COOLDOWN_SEC) {
      const cd = Math.ceil(HIDE_COOLDOWN_SEC - (now() - cell.closetUsedAt));
      label = `[ closet cooldown · ${cd}s ]`;
    }
    else label = `[${keyHint}] HIDE`;
  } else if (target.kind === 'switch') {
    label = cell?.fixtureOn ? `[${keyHint}] LIGHTS OFF` : `[${keyHint}] LIGHTS ON`;
  } else if (target.kind === 'exit') {
    label = currentLevel === 3 ? `[${keyHint}] ESCAPE` : '[ locked ]';
  } else if (target.kind === 'note') {
    label = `[${keyHint}] READ NOTE`;
  } else if (target.kind === 'rock') {
    label = player.rocks >= ROCK_MAX_CARRY
      ? `[ rocks full · ${ROCK_MAX_CARRY}/${ROCK_MAX_CARRY} ]`
      : `[${keyHint}] PICK UP ROCK`;
  } else if (target.kind === 'mapSnippet') {
    label = `[${keyHint}] OPEN MAP`;
  }
  interactPrompt.textContent = label;
  interactPrompt.hidden = false;
}

// =============================================================================
// HUD UPDATE
// =============================================================================
let lastHudDepth = -1, lastHudLevel = -1, lastHudSanityPct = -1, lastHidden = false;
let lastHudStaminaPct = -1, lastHudRocks = -1, lastHudObj = '', lastCrouching = false;
function tickHUD() {
  const pct = Math.round(player.sanity);
  if (pct !== lastHudSanityPct) {
    sanityFill.style.width = pct + '%';
    sanityBar.classList.toggle('is-low', pct < 50 && pct >= 25);
    sanityBar.classList.toggle('is-critical', pct < 25);
    lastHudSanityPct = pct;
  }
  // Stamina bar.
  if (staminaFill) {
    const sp = Math.round(player.stamina);
    if (sp !== lastHudStaminaPct) {
      staminaFill.style.width = sp + '%';
      if (staminaBar) {
        staminaBar.classList.toggle('is-low', sp < 30);
        staminaBar.classList.toggle('is-critical', sp < 10);
      }
      lastHudStaminaPct = sp;
    }
  }
  // Rock count.
  if (rockCount && player.rocks !== lastHudRocks) {
    rockCount.textContent = String(player.rocks);
    lastHudRocks = player.rocks;
  }
  // Objective HUD.
  if (objectiveOut) {
    const L = LEVELS[currentLevel];
    let txt;
    if (levelObjectiveMet[currentLevel]) txt = 'COMPLETE: descend deeper';
    else {
      let progress = 0;
      if (L.objectiveKind === 'walk') progress = Math.min(L.objectiveTarget, player.visitedCells.size);
      else if (L.objectiveKind === 'notes') progress = player.notesCollected;
      else if (L.objectiveKind === 'switches') progress = player.switchesFlipped;
      txt = L.objectiveKind === 'exit'
        ? L.objective
        : `${L.objective} (${progress}/${L.objectiveTarget})`;
    }
    if (txt !== lastHudObj) {
      objectiveOut.textContent = txt;
      lastHudObj = txt;
    }
  }
  const depth = player.visitedCells.size;
  if (depth !== lastHudDepth) {
    depthOut.textContent = String(depth);
    lastHudDepth = depth;
  }
  if (currentLevel !== lastHudLevel) {
    levelOut.textContent = String(currentLevel + 1);
    lastHudLevel = currentLevel;
  }
  // Heartbeat icon — pulses scaled by inverse monster distance.
  const monDist = Math.hypot(monsterState.pos.x - player.pos.x, monsterState.pos.z - player.pos.z);
  if (heartIcon) {
    if (monDist < 30) {
      heartIcon.classList.add('is-on');
      // Pulse rate inverse to distance: 0.4s @ 0m → 1.2s @ 30m.
      const period = 0.4 + (monDist / 30) * 0.8;
      heartIcon.style.animationDuration = period.toFixed(2) + 's';
      // Color shifts red when very close.
      heartIcon.classList.toggle('is-danger', monDist < 12);
    } else {
      heartIcon.classList.remove('is-on', 'is-danger');
    }
  }
  // Hidden status pill.
  if (player.isHidden !== lastHidden) {
    if (hideStatus) hideStatus.hidden = !player.isHidden;
    lastHidden = player.isHidden;
  }
  if (player.isHidden && hideStatus) {
    const left = Math.max(0, player.hideUntil - now());
    hideStatus.textContent = `HIDDEN · ${left.toFixed(1)}s`;
  }
  // Crouch pill.
  if (crouchPill && player.crouching !== lastCrouching) {
    crouchPill.hidden = !player.crouching;
    lastCrouching = player.crouching;
  }
}

// =============================================================================
// RESIZE
// =============================================================================
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();

requestAnimationFrame(loop);

})(); // end async boot IIFE
