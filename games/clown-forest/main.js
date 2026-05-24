// =============================================================================
// CLOWN IN THE FOREST — realistic first-person horror in a midnight forest.
//
// Tone target: SLENDER. Grounded, oppressive, hopeless. No cartoony elements.
// The player has 5 lost items to find before the clown catches them; if they
// collect all 5 a red beacon appears at the map edge and they can ESCAPE
// before dawn.
//
// Architecture:
//   1. Lazy-load Three.js + audio.js so the hub doesn't pay the cost.
//   2. Build procedural canvas textures once at boot (ground, bark, foliage,
//      ground-fog, item icons, the clown sprite). Zero image assets.
//   3. Procedural 400x400m forest:
//        - PlaneGeometry ground with ImprovedNoise vertex displacement
//        - InstancedMesh of tapered tree trunks (~1100 instances)
//        - InstancedMesh of leaf canopies (sphere geometry)
//        - Some trees are dead (no canopy instance)
//        - Fallen logs, rocks, fog patches scattered
//   4. Dense linear fog (10..45m) so the world feels SMALL even though it's huge.
//   5. Flashlight = SpotLight attached to camera, casts moving shadows (visceral).
//   6. CLOWN AI state machine — STALK → HUNT → CHASE → KILL.
//   7. Audio is co-owned with Agent B in ./audio.js — we just call its API.
//
// State machine: MENU → PLAY → PAUSED → DEAD | ESCAPED → MENU.
// =============================================================================

import { createMobileControls } from '../../src/shared/mobileControls.js';
import { createSettingsMenu } from '../../src/shared/settingsMenu.js';
import { submitRun, loadBest } from '../../src/persistence/highScores.js';

// =============================================================================
// BOOT — async IIFE because top-level await isn't in our build target.
// =============================================================================
(async () => {

// ---------------------------------------------------------------------------
// AUDIO — Agent B owns ./audio.js. We instantiate the controller now but
// only call start() once the player clicks ENTER (autoplay policy).
// Every wrapper no-ops if audio.js fails to load.
// ---------------------------------------------------------------------------
let audio = null;
try {
  const audioMod = await import('./audio.js').catch(() => null);
  audio = audioMod?.createAudio ? audioMod.createAudio() : null;
} catch { audio = null; }
const playFootstep    = (s)    => { try { audio?.playFootstep?.(s); } catch {} };
const playTwigSnap    = ()     => { try { audio?.playTwigSnap?.(); } catch {} };
const playClownLaugh  = (p, d) => { try { audio?.playClownLaugh?.(p, d); } catch {} };
const playClownStep   = (p, d) => { try { audio?.playClownStep?.(p, d); } catch {} };
const playHuntMusic   = ()     => { try { audio?.playHuntMusic?.(); } catch {} };
const playChaseMusic  = ()     => { try { audio?.playChaseMusic?.(); } catch {} };
const playStalkMusic  = ()     => { try { audio?.playStalkMusic?.(); } catch {} };
const playKill        = ()     => { try { audio?.playKill?.(); } catch {} };
const playEscape      = ()     => { try { audio?.playEscape?.(); } catch {} };
const playPickup      = ()     => { try { audio?.playPickup?.(); } catch {} };
const playLightning   = ()     => { try { audio?.playLightning?.(); } catch {} };
const playFlashlight  = (on)   => { try { audio?.playFlashlight?.(on); } catch {} };
const playOwl         = ()     => { try { audio?.playOwl?.(); } catch {} };
const playAmbience    = (v)    => { try { audio?.playAmbience?.(v); } catch {} };
const startAudio      = ()     => { try { audio?.start?.(); } catch {} };
const stopAudio       = ()     => { try { audio?.stop?.(); } catch {} };
const updateClownDist = (d)    => { try { audio?.updateClownDistance?.(d); } catch {} };
const setHeartbeat    = (r)    => { try { audio?.setHeartbeatRate?.(r); } catch {} };

// ---------------------------------------------------------------------------
// SETTINGS — gear button auto-mounts top-right. Controls help on hover/click.
// ---------------------------------------------------------------------------
const _isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
createSettingsMenu({
  gameId: 'clown-forest',
  getControlsHelp: () => _isTouch
    ? 'JOYSTICK walk · DRAG to look · Find 5 items. Don\'t get caught.'
    : 'WASD walk · MOUSE look · SHIFT sprint · C crouch · F flashlight · ESC pause.',
});

// ---------------------------------------------------------------------------
// LAZY THREE.JS + ImprovedNoise for ground displacement.
// ---------------------------------------------------------------------------
const THREE = await import('three');
const { ImprovedNoise } = await import('three/examples/jsm/math/ImprovedNoise.js');

// =============================================================================
// CONSTANTS — tweak knobs.
// =============================================================================
const WORLD_SIZE   = 400;          // metres; forest is 400x400
const TREE_COUNT   = 1100;         // trunk instances
const ROCK_COUNT   = 80;
const LOG_COUNT    = 50;
const FOG_NEAR     = 10;
const FOG_FAR      = 45;
const FOG_COLOR    = 0x0a0b15;

const PLAYER_H            = 1.65;  // eye height (slightly lower than backrooms)
const PLAYER_CROUCH_H     = 1.15;
const PLAYER_R            = 0.32;
const WALK_SPEED          = 2.5;
const SPRINT_SPEED        = 5.0;
const CROUCH_SPEED        = 1.2;
const STAMINA_MAX         = 8.0;   // 8 seconds of sprint
const STAMINA_REGEN       = 1.4;   // per sec when not sprinting
const MOUSE_SENS          = 0.0022;
const TOUCH_SENS          = 0.0050;

const FLASHLIGHT_DRAIN    = 0.3;   // % per second
const ITEMS_TO_ESCAPE     = 5;
const ITEM_GLOW_DIST      = 8;
const ITEM_PICKUP_DIST    = 1.5;

// Clown tuning
const CLOWN_HEIGHT        = 2.2;
const CLOWN_HUNT_SPEED    = 1.6;
const CLOWN_CHASE_SPEED   = 4.0;
const CLOWN_KILL_DIST     = 1.5;
const CLOWN_CHASE_TRIGGER = 10;    // metres + line-of-sight => CHASE
const CLOWN_HUNT_AFTER    = 300;   // 5 minutes => HUNT phase activates
const CLOWN_STALK_INTERVAL_MIN = 25;
const CLOWN_STALK_INTERVAL_MAX = 55;
const CLOWN_TELEPORT_DELAY = 10;   // seconds out-of-sight before relocation

// =============================================================================
// PROCEDURAL CANVAS TEXTURES — desaturated, organic. Zero image assets.
// =============================================================================

// Forest floor: dark mud + scattered leaves + dirt patches. Tileable.
function makeGroundTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  // Base dark soil.
  g.fillStyle = '#1a1a10'; g.fillRect(0, 0, 512, 512);
  // Many overlapping dirt patches with varying brown tones.
  for (let i = 0; i < 240; i++) {
    const cx = Math.random() * 512, cy = Math.random() * 512;
    const r = 12 + Math.random() * 48;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tone = Math.random();
    const col = tone < 0.4 ? '58, 50, 32' : tone < 0.7 ? '42, 48, 24' : '36, 30, 18';
    grad.addColorStop(0, `rgba(${col}, ${0.4 + Math.random() * 0.35})`);
    grad.addColorStop(1, `rgba(${col}, 0)`);
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Scattered leaves — small dark-green / brown specks.
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    const w = 2 + Math.random() * 3, h = 1 + Math.random() * 2;
    const isLeaf = Math.random() < 0.55;
    g.fillStyle = isLeaf
      ? `rgba(${30 + Math.random() * 20}, ${48 + Math.random() * 20}, ${24}, 0.55)`
      : `rgba(${56 + Math.random() * 20}, ${44 + Math.random() * 16}, ${22}, 0.55)`;
    g.save();
    g.translate(x, y);
    g.rotate(Math.random() * Math.PI * 2);
    g.fillRect(-w / 2, -h / 2, w, h);
    g.restore();
  }
  // Occasional small rock dots (grey-brown).
  for (let i = 0; i < 60; i++) {
    g.fillStyle = `rgba(${70 + Math.random() * 25}, ${66 + Math.random() * 18}, ${56}, 0.7)`;
    g.beginPath();
    g.arc(Math.random() * 512, Math.random() * 512, 1.5 + Math.random() * 2, 0, Math.PI * 2);
    g.fill();
  }
  // Final very dark noise pass — dirt graininess.
  for (let i = 0; i < 4000; i++) {
    g.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.35})`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // Tile across the 400m plane many times so detail stays at human scale.
  tex.repeat.set(80, 80);
  tex.anisotropy = 4;
  return tex;
}

// Dark fissured bark texture for tree trunks.
function makeBarkTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#1a120a'; g.fillRect(0, 0, 256, 512);
  // Vertical fissures (lighter highlight + dark crack).
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 256;
    const w = 1 + Math.random() * 3;
    const tone = 30 + Math.random() * 25;
    g.fillStyle = `rgba(${tone}, ${tone * 0.75}, ${tone * 0.45}, 0.55)`;
    g.fillRect(x, 0, w, 512);
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.fillRect(x + w, 0, 1, 512);
  }
  // Horizontal noise bands (bark cross-grain).
  for (let i = 0; i < 250; i++) {
    g.fillStyle = `rgba(${20 + Math.random() * 30}, ${14 + Math.random() * 20}, ${8}, ${Math.random() * 0.35})`;
    g.fillRect(0, Math.random() * 512, 256, 1 + Math.random() * 2);
  }
  // Random dark knots.
  for (let i = 0; i < 12; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 512;
    const r = 6 + Math.random() * 14;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Very dark base grain.
  for (let i = 0; i < 2400; i++) {
    g.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.4})`;
    g.fillRect(Math.random() * 256, Math.random() * 512, 1, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Foliage (canopy) texture — clumpy dark green/black noise. Sphere mapping
// will smear it into a soft cloud which reads as a leafy mass at distance.
function makeFoliageTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#0e1808'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1000; i++) {
    const cx = Math.random() * 256, cy = Math.random() * 256;
    const r = 2 + Math.random() * 8;
    const tone = 16 + Math.random() * 24;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(${tone * 0.4}, ${tone}, ${tone * 0.3}, 0.7)`);
    grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // Dark blobs (deep shadow gaps).
  for (let i = 0; i < 20; i++) {
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 20, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// Ground-fog patch — radial gradient soft puff. Used on a transparent quad,
// scattered across the forest floor to fake low-hanging mist.
function makeFogPatchTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0,   'rgba(180, 190, 210, 0.45)');
  grad.addColorStop(0.5, 'rgba(150, 160, 180, 0.18)');
  grad.addColorStop(1,   'rgba(120, 130, 150, 0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// Glowing item icon — used for the 5 pickups. Each item gets a slightly
// different tint but the same overall faint glow shape.
function makeItemTexture(label) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  // Soft halo.
  const halo = g.createRadialGradient(64, 64, 0, 64, 64, 60);
  halo.addColorStop(0,   'rgba(255, 220, 160, 0.7)');
  halo.addColorStop(0.4, 'rgba(255, 180, 100, 0.3)');
  halo.addColorStop(1,   'rgba(255, 140, 60, 0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, 128, 128);
  // Item silhouette in the center — small pixel doodle per item.
  g.fillStyle = '#1a1006';
  switch (label) {
    case 'radio':
      g.fillRect(48, 56, 32, 22);
      g.fillStyle = '#3a3028';
      g.fillRect(52, 60, 16, 8);
      g.fillStyle = '#ffd680';
      g.fillRect(70, 62, 6, 4);
      g.fillStyle = '#1a1006';
      g.fillRect(56, 50, 2, 10); // antenna
      break;
    case 'locket':
      g.beginPath();
      g.arc(64, 66, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffd680';
      g.fillRect(63, 50, 2, 8); // chain
      break;
    case 'phone':
      g.fillRect(54, 48, 20, 36);
      g.fillStyle = '#3a4858';
      g.fillRect(57, 52, 14, 26);
      g.fillStyle = '#1a1006';
      g.fillRect(62, 80, 4, 1);
      break;
    case 'lighter':
      g.fillRect(56, 56, 16, 22);
      g.fillStyle = '#3a3028';
      g.fillRect(58, 52, 12, 4);
      g.fillStyle = '#ffaa40';
      g.beginPath();
      g.moveTo(64, 48); g.lineTo(66, 52); g.lineTo(62, 52);
      g.closePath(); g.fill();
      break;
    case 'photo':
      g.fillRect(46, 52, 36, 28);
      g.fillStyle = '#3a3028';
      g.fillRect(49, 55, 30, 22);
      g.fillStyle = '#5a4a3a';
      g.fillRect(60, 64, 8, 8);
      break;
    default:
      g.beginPath();
      g.arc(64, 64, 10, 0, Math.PI * 2); g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

// THE CLOWN — billboard sprite. Tall figure, pale face, red triangle eyes,
// asymmetric red smile, ratty striped clown costume, machete in one hand.
// Drawn vertically (256x512) so the proportions read tall when scaled.
function makeClownTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 256, 512);

  // ----- BODY / COSTUME -----
  // Torso — faded clown suit with vertical stripes. Slightly hunched silhouette.
  g.fillStyle = '#1a1408';
  // Body outline (slight hunch — leans forward).
  g.beginPath();
  g.moveTo(80, 200);  // left shoulder
  g.lineTo(176, 200); // right shoulder
  g.lineTo(184, 380); // right hip
  g.lineTo(72, 380);  // left hip
  g.closePath();
  g.fill();
  // Stripe painting — faded red/yellow/blue alternating.
  const stripes = ['#5a1414', '#1a3858', '#5a4a1a', '#5a1414', '#1a3858'];
  for (let i = 0; i < stripes.length; i++) {
    g.fillStyle = stripes[i];
    g.globalAlpha = 0.5;
    const x = 84 + (i / stripes.length) * 96;
    const w = 96 / stripes.length;
    g.fillRect(x, 202, w, 178);
  }
  g.globalAlpha = 1;
  // Dirt / blood smears on costume.
  for (let i = 0; i < 12; i++) {
    g.fillStyle = `rgba(${40 + Math.random() * 20}, 8, 8, ${0.35 + Math.random() * 0.3})`;
    const x = 86 + Math.random() * 92;
    const y = 220 + Math.random() * 140;
    g.beginPath();
    g.arc(x, y, 3 + Math.random() * 6, 0, Math.PI * 2);
    g.fill();
  }
  // Ruffle collar.
  g.fillStyle = '#48342a';
  g.beginPath();
  g.moveTo(80, 200);
  g.lineTo(86, 188); g.lineTo(94, 198); g.lineTo(102, 188);
  g.lineTo(110, 198); g.lineTo(120, 188); g.lineTo(128, 200);
  g.lineTo(136, 188); g.lineTo(146, 198); g.lineTo(156, 188);
  g.lineTo(164, 198); g.lineTo(172, 188); g.lineTo(176, 200);
  g.closePath();
  g.fill();

  // ----- ARMS -----
  // Left arm hanging by side.
  g.fillStyle = '#1a1408';
  g.fillRect(58, 208, 22, 110);
  g.fillStyle = '#48342a';
  g.fillRect(56, 312, 24, 14); // glove cuff
  g.fillStyle = '#d8c0a0';
  g.beginPath();
  g.arc(68, 332, 12, 0, Math.PI * 2);
  g.fill();
  // Right arm — holding a long machete.
  g.fillStyle = '#1a1408';
  g.fillRect(178, 208, 22, 110);
  g.fillStyle = '#48342a';
  g.fillRect(176, 312, 24, 14);
  g.fillStyle = '#d8c0a0';
  g.beginPath();
  g.arc(190, 332, 12, 0, Math.PI * 2);
  g.fill();
  // The machete — long thin blade extending down-right, with worn handle.
  g.save();
  g.translate(190, 332);
  g.rotate(0.15);
  // Handle (dark wood).
  g.fillStyle = '#2a1a0a';
  g.fillRect(-6, -10, 12, 22);
  // Blade — silver with darker bevel + bloody edge.
  g.fillStyle = '#9a9aa0';
  g.fillRect(-4, 10, 8, 110);
  g.fillStyle = '#5a5a64';
  g.fillRect(-4, 10, 2, 110);
  // Blood streaks on blade.
  g.fillStyle = 'rgba(110, 12, 12, 0.85)';
  g.fillRect(-3, 20, 2, 40);
  g.fillRect(0, 50, 2, 50);
  g.restore();

  // ----- HEAD -----
  // Pale flesh oval, slightly elongated.
  g.fillStyle = '#dcc8b0';
  g.beginPath();
  g.ellipse(128, 130, 56, 70, 0, 0, Math.PI * 2);
  g.fill();
  // Shadow under jaw (gives some depth).
  g.fillStyle = 'rgba(40, 30, 30, 0.45)';
  g.beginPath();
  g.ellipse(128, 178, 48, 18, 0, 0, Math.PI * 2);
  g.fill();
  // Shadow on left side (rim lighting from a moonlit right).
  g.fillStyle = 'rgba(20, 18, 30, 0.5)';
  g.beginPath();
  g.ellipse(98, 130, 22, 56, 0, 0, Math.PI * 2);
  g.fill();

  // Hair — wispy dark tufts on top + sides (greenish-black).
  g.fillStyle = '#0a1a08';
  for (let i = 0; i < 14; i++) {
    const ang = -Math.PI * 0.85 + (i / 13) * Math.PI * 0.7;
    const x = 128 + Math.cos(ang) * 56;
    const y = 130 + Math.sin(ang) * 70;
    g.beginPath();
    g.ellipse(x, y - 6, 8 + Math.random() * 6, 14 + Math.random() * 8, ang, 0, Math.PI * 2);
    g.fill();
  }

  // EYES — deep dark sockets first.
  g.fillStyle = '#0a0608';
  g.beginPath();
  g.ellipse(110, 116, 14, 10, 0, 0, Math.PI * 2); g.fill();
  g.beginPath();
  g.ellipse(146, 116, 14, 10, 0, 0, Math.PI * 2); g.fill();
  // Pupil — tiny glowing dot in each.
  g.fillStyle = '#fff8e0';
  g.fillRect(108, 114, 3, 3);
  g.fillRect(144, 114, 3, 3);
  // RED triangle markings around eyes (the classic killer-clown signature).
  g.fillStyle = '#9a0a0a';
  g.beginPath();
  g.moveTo(94, 96); g.lineTo(110, 124); g.lineTo(126, 96);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(130, 96); g.lineTo(146, 124); g.lineTo(162, 96);
  g.closePath(); g.fill();
  // Triangle inverted under each eye — completes the diamond markings.
  g.beginPath();
  g.moveTo(98, 136); g.lineTo(110, 124); g.lineTo(122, 136);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(134, 136); g.lineTo(146, 124); g.lineTo(158, 136);
  g.closePath(); g.fill();

  // RED LIPSTICK SMILE — asymmetric, way too wide. Drawn as a thick curved
  // stroke + jagged white teeth + drips.
  g.strokeStyle = '#8a0a0a';
  g.lineWidth = 8;
  g.lineCap = 'round';
  g.beginPath();
  // Asymmetric: left side curls higher than right.
  g.moveTo(80, 160);
  g.bezierCurveTo(90, 192, 160, 198, 184, 172);
  g.stroke();
  // Slightly thinner darker stroke under to add depth.
  g.strokeStyle = '#5a0808';
  g.lineWidth = 3;
  g.stroke();
  // Mouth interior (black void).
  g.fillStyle = '#0a0408';
  g.beginPath();
  g.moveTo(86, 164);
  g.bezierCurveTo(96, 186, 158, 190, 180, 170);
  g.bezierCurveTo(160, 178, 100, 178, 86, 164);
  g.closePath();
  g.fill();
  // Teeth — irregular jagged shards.
  g.fillStyle = '#e8dcc0';
  for (let i = 0; i < 9; i++) {
    const tx = 92 + i * 11;
    const ty = 168 + (i % 2 === 0 ? 0 : 2);
    g.beginPath();
    g.moveTo(tx, ty);
    g.lineTo(tx + 5, ty + 8 + Math.random() * 3);
    g.lineTo(tx + 10, ty);
    g.closePath();
    g.fill();
  }
  // Lipstick smudge on chin (a dripping streak).
  g.fillStyle = 'rgba(140, 10, 10, 0.85)';
  g.fillRect(124, 188, 2, 10);
  g.fillRect(140, 192, 2, 8);

  // Subtle nose — just a faint shadow line.
  g.fillStyle = 'rgba(80, 50, 50, 0.55)';
  g.beginPath();
  g.ellipse(128, 144, 6, 4, 0, 0, Math.PI * 2);
  g.fill();

  // Tiny RED CLOWN NOSE highlight (small — keeps the realism, isn't goofy).
  g.fillStyle = '#7a0a0a';
  g.beginPath();
  g.arc(128, 148, 5, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#aa1414';
  g.beginPath();
  g.arc(126, 146, 2, 0, Math.PI * 2);
  g.fill();

  // Ground shadow underneath the body so the sprite reads as standing on something.
  g.fillStyle = 'rgba(0, 0, 0, 0.65)';
  g.beginPath();
  g.ellipse(128, 386, 70, 12, 0, 0, Math.PI * 2);
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.premultiplyAlpha = false;
  return tex;
}

// =============================================================================
// THREE.JS SCENE — single scene, single camera.
// =============================================================================
const threeRoot = document.getElementById('three-root');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x060810);
// Linear fog — opaque at 45m. Keeps the world feeling small (~20m visibility
// in practice with the dense color).
scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 80);
camera.position.set(0, PLAYER_H, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
// Shadows ON — the flashlight's moving shadow is a major fear lever.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
threeRoot.appendChild(renderer.domElement);

// =============================================================================
// LIGHTING — very low ambient, faint moon, player flashlight, lightning flash.
// =============================================================================
const ambient = new THREE.AmbientLight(0x0a0c12, 0.85);
scene.add(ambient);

// Moon — faint blue-white directional from above-rear.
const moon = new THREE.DirectionalLight(0x6a78a0, 0.18);
moon.position.set(60, 100, 40);
moon.castShadow = false; // moon shadows would kill perf; flashlight handles drama
scene.add(moon);

// Hemisphere — sky tint vs ground tint, very faint.
const hemi = new THREE.HemisphereLight(0x0a1020, 0x0a0805, 0.25);
scene.add(hemi);

// FLASHLIGHT — SpotLight attached to camera. Yellow, ~30° cone, flickers.
const flashlight = new THREE.SpotLight(0xffd070, 1.5, 30, Math.PI / 6, 0.35, 1.2);
flashlight.castShadow = true;
flashlight.shadow.mapSize.set(512, 512);
flashlight.shadow.camera.near = 0.5;
flashlight.shadow.camera.far = 28;
flashlight.shadow.bias = -0.0008;
flashlight.shadow.normalBias = 0.04;
camera.add(flashlight);
// SpotLight needs a target — attach to camera so it points where we look.
flashlight.target.position.set(0, 0, -1);
camera.add(flashlight.target);
scene.add(camera);
flashlight.visible = true;

// =============================================================================
// GROUND — PlaneGeometry with ImprovedNoise vertex displacement for bumps.
// =============================================================================
const groundTex = makeGroundTexture();
const groundGeom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 64, 64);
// Displace vertices with two octaves of Perlin noise so the ground rolls.
{
  const noise = new ImprovedNoise();
  const pos = groundGeom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const n =
      noise.noise(x * 0.012, y * 0.012, 0) * 0.6 +
      noise.noise(x * 0.045, y * 0.045, 4) * 0.25;
    pos.setZ(i, n);
  }
  pos.needsUpdate = true;
  groundGeom.computeVertexNormals();
}
const groundMat = new THREE.MeshStandardMaterial({
  map: groundTex,
  roughness: 0.95,
  metalness: 0,
  color: 0x4a4830, // base tint multiplied into the texture map
});
const ground = new THREE.Mesh(groundGeom, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Cheap helper — sample ground height at world (x,z). Uses the same noise so
// items and trees can rest on the displaced surface.
const groundNoise = new ImprovedNoise();
function groundY(x, z) {
  return groundNoise.noise(x * 0.012, z * 0.012, 0) * 0.6
       + groundNoise.noise(x * 0.045, z * 0.045, 4) * 0.25;
}

// =============================================================================
// TREE LAYOUT — Poisson-disk-ish scatter with cluster bias (creates "groves"
// and natural "paths"). Stored in `treeData` so we can also use it for
// collision detection later.
// =============================================================================
const treeData = []; // { x, z, scale, rot, dead, clusterId }
{
  // Seeded random so layout is stable for the session (but varies per load).
  let seed = Math.floor(Math.random() * 1e9);
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  // Pre-place a handful of cluster centers — denser, gnarlier groves.
  const clusters = [];
  for (let i = 0; i < 22; i++) {
    clusters.push({
      x: (rng() - 0.5) * WORLD_SIZE * 0.85,
      z: (rng() - 0.5) * WORLD_SIZE * 0.85,
      r: 20 + rng() * 30,
    });
  }
  // Place trees one at a time, rejecting if too close to an existing one.
  const minDist = 2.2;
  const minDistSq = minDist * minDist;
  const spawnRadius = WORLD_SIZE * 0.45;
  let tries = 0;
  while (treeData.length < TREE_COUNT && tries < TREE_COUNT * 40) {
    tries++;
    let x, z;
    // 65% biased toward a cluster center; 35% pure uniform.
    if (rng() < 0.65) {
      const cl = clusters[Math.floor(rng() * clusters.length)];
      const ang = rng() * Math.PI * 2;
      const r = rng() * cl.r;
      x = cl.x + Math.cos(ang) * r;
      z = cl.z + Math.sin(ang) * r;
    } else {
      x = (rng() - 0.5) * WORLD_SIZE * 0.9;
      z = (rng() - 0.5) * WORLD_SIZE * 0.9;
    }
    // Keep a clear plaza around the player spawn (a hint of "trail").
    if (Math.hypot(x, z) < 4) continue;
    if (Math.abs(x) > spawnRadius || Math.abs(z) > spawnRadius) continue;
    // Distance check against existing trees.
    let ok = true;
    for (let i = 0; i < treeData.length; i++) {
      const t = treeData[i];
      const dx = t.x - x, dz = t.z - z;
      if (dx * dx + dz * dz < minDistSq) { ok = false; break; }
    }
    if (!ok) continue;
    treeData.push({
      x, z,
      scale: 0.85 + rng() * 0.6,
      rot: rng() * Math.PI * 2,
      dead: rng() < 0.18,         // 18% are dead silhouettes (no canopy)
      swayPhase: rng() * Math.PI * 2,
    });
  }
}

// TRUNK InstancedMesh — single tapered cylinder, hundreds of instances. The
// per-instance matrices encode position + rotation + scale.
const barkTex = makeBarkTexture();
const trunkGeom = new THREE.CylinderGeometry(0.15, 0.4, 12, 8, 1, false);
// Move the trunk so its base sits at y=0 (cylinders default to centered).
trunkGeom.translate(0, 6, 0);
const trunkMat = new THREE.MeshStandardMaterial({
  map: barkTex,
  roughness: 1.0,
  metalness: 0,
  color: 0x6a5238,
});
const trunkMesh = new THREE.InstancedMesh(trunkGeom, trunkMat, treeData.length);
trunkMesh.castShadow = true;
trunkMesh.receiveShadow = true;
// Frustum culling on instanced meshes uses the bounding sphere of the geom —
// expand it so trees at the world edge stay rendered even when their geom
// center is technically outside the camera frustum.
trunkMesh.frustumCulled = false;
{
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < treeData.length; i++) {
    const t = treeData[i];
    e.set(0, t.rot, 0);
    q.setFromEuler(e);
    s.set(t.scale, t.scale, t.scale);
    p.set(t.x, groundY(t.x, t.z), t.z);
    m.compose(p, q, s);
    trunkMesh.setMatrixAt(i, m);
  }
  trunkMesh.instanceMatrix.needsUpdate = true;
}
scene.add(trunkMesh);

// CANOPY InstancedMesh — sphere foliage above each live (non-dead) trunk.
const foliageTex = makeFoliageTexture();
const canopyGeom = new THREE.IcosahedronGeometry(3.2, 1); // low-poly cloud
const canopyMat = new THREE.MeshStandardMaterial({
  map: foliageTex,
  color: 0x1a2a14,
  roughness: 1,
  metalness: 0,
  transparent: true,
  opacity: 0.92,
  alphaTest: 0.15,
});
const liveTrees = treeData.filter((t) => !t.dead);
const canopyMesh = new THREE.InstancedMesh(canopyGeom, canopyMat, liveTrees.length);
canopyMesh.castShadow = false; // canopies casting shadows is too expensive
canopyMesh.receiveShadow = false;
canopyMesh.frustumCulled = false;
{
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let i = 0; i < liveTrees.length; i++) {
    const t = liveTrees[i];
    e.set(0, t.rot, 0);
    q.setFromEuler(e);
    // Canopies slightly larger than trunk scale for visual weight.
    const cs = (0.75 + Math.random() * 0.55) * t.scale;
    s.set(cs, cs * 0.85, cs);
    p.set(t.x, groundY(t.x, t.z) + 10 * t.scale, t.z);
    m.compose(p, q, s);
    canopyMesh.setMatrixAt(i, m);
  }
  canopyMesh.instanceMatrix.needsUpdate = true;
}
scene.add(canopyMesh);

// FALLEN LOGS — scattered BoxGeometry rotated. Just a handful, all unique
// meshes (small count, not worth instancing).
{
  const logGeom = new THREE.CylinderGeometry(0.3, 0.3, 4, 6);
  for (let i = 0; i < LOG_COUNT; i++) {
    const log = new THREE.Mesh(logGeom, trunkMat);
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    log.position.set(x, groundY(x, z) + 0.3, z);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = Math.random() * Math.PI * 2;
    log.castShadow = true;
    log.receiveShadow = true;
    scene.add(log);
  }
}

// ROCKS — IcosahedronGeometry with random scale & rotation.
{
  const rockGeom = new THREE.IcosahedronGeometry(0.5, 0);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x3a3830,
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });
  for (let i = 0; i < ROCK_COUNT; i++) {
    const r = new THREE.Mesh(rockGeom, rockMat);
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.85;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.85;
    const s = 0.4 + Math.random() * 1.3;
    r.position.set(x, groundY(x, z) + s * 0.3, z);
    r.scale.set(s, s * 0.7, s);
    r.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    r.castShadow = true;
    r.receiveShadow = true;
    scene.add(r);
  }
}

// GROUND-FOG PATCHES — semi-transparent quads near the floor, scattered.
{
  const fogTex = makeFogPatchTexture();
  const fogMat = new THREE.MeshBasicMaterial({
    map: fogTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
    fog: true,
  });
  const fogGeom = new THREE.PlaneGeometry(6, 6);
  for (let i = 0; i < 60; i++) {
    const f = new THREE.Mesh(fogGeom, fogMat);
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
    f.position.set(x, groundY(x, z) + 0.3, z);
    f.rotation.x = -Math.PI / 2;
    f.rotation.z = Math.random() * Math.PI * 2;
    const s = 0.9 + Math.random() * 1.6;
    f.scale.set(s, s, 1);
    scene.add(f);
  }
}

// =============================================================================
// ITEMS — 5 lost objects. Each is a billboard sprite with a faint glow that
// brightens within ITEM_GLOW_DIST. Stored so we can update + check pickup.
// =============================================================================
const ITEM_LABELS = ['radio', 'locket', 'phone', 'lighter', 'photo'];
const items = []; // { label, sprite, baseOpacity, x, z, picked }
{
  for (let i = 0; i < ITEMS_TO_ESCAPE; i++) {
    const label = ITEM_LABELS[i];
    const tex = makeItemTexture(label);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      fog: true,
      opacity: 0.35,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 1.4, 1);
    // Place items at varying radii so the player explores in multiple directions.
    const ang = (i / ITEMS_TO_ESCAPE) * Math.PI * 2 + Math.random() * 0.8;
    const r = 40 + Math.random() * 90;
    const x = Math.cos(ang) * r, z = Math.sin(ang) * r;
    sprite.position.set(x, groundY(x, z) + 0.9, z);
    scene.add(sprite);
    items.push({ label, sprite, baseOpacity: 0.35, x, z, picked: false });
  }
}

// =============================================================================
// EXIT BEACON — appears only after all 5 items are picked up. A faint red
// glowing tower at a random edge.
// =============================================================================
let beacon = null;
let beaconLight = null;
let beaconPos = null;
function spawnBeacon() {
  if (beacon) return;
  // Choose a far edge so the player has to traverse some forest to reach it.
  const side = Math.floor(Math.random() * 4);
  const edge = WORLD_SIZE * 0.42;
  let bx, bz;
  if (side === 0) { bx = -edge; bz = (Math.random() - 0.5) * edge * 0.5; }
  else if (side === 1) { bx = edge; bz = (Math.random() - 0.5) * edge * 0.5; }
  else if (side === 2) { bx = (Math.random() - 0.5) * edge * 0.5; bz = -edge; }
  else { bx = (Math.random() - 0.5) * edge * 0.5; bz = edge; }
  beaconPos = { x: bx, z: bz };
  // Tall thin pillar with emissive red top.
  const beaconGeom = new THREE.CylinderGeometry(0.25, 0.5, 9, 6);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x1a0808,
    emissive: 0xc81a14,
    emissiveIntensity: 1.4,
    roughness: 1,
  });
  beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.set(bx, groundY(bx, bz) + 4.5, bz);
  scene.add(beacon);
  // Soft red point-light for ambience.
  beaconLight = new THREE.PointLight(0xff3030, 1.8, 24, 1.5);
  beaconLight.position.set(bx, groundY(bx, bz) + 7, bz);
  scene.add(beaconLight);
  showSubtitle('A red beacon glows in the distance.', 5);
}

// =============================================================================
// THE CLOWN — billboard sprite that floats above the ground at clown height.
// Hidden during STALK phase (off-screen / teleporting); becomes visible in
// HUNT and CHASE phases.
// =============================================================================
const clownTex = makeClownTexture();
const clownMat = new THREE.SpriteMaterial({
  map: clownTex,
  transparent: true,
  depthWrite: false,
  fog: true,
  opacity: 1.0,
});
const clownSprite = new THREE.Sprite(clownMat);
// Sprite is sized so the clown reads as a 2.2m-tall figure. Width is half the
// texture aspect (256/512 = 0.5).
clownSprite.scale.set(CLOWN_HEIGHT * 0.5, CLOWN_HEIGHT, 1);
clownSprite.position.set(100, CLOWN_HEIGHT / 2, 100);
clownSprite.visible = false;
scene.add(clownSprite);

const clownState = {
  phase: 'stalk',           // 'stalk' | 'hunt' | 'chase'
  pos: new THREE.Vector3(100, 0, 100),
  lastStalkEvent: 0,        // ts of last stalk peek
  nextStalkEvent: 0,        // ts when the next peek is scheduled
  lastSeenAt: 0,            // ts of last player line-of-sight
  visibleStartedAt: 0,      // ts when sprite became visible (for run-away timing)
  isVisible: false,
  fleeUntil: 0,             // ts until which the clown is hiding (post-peek)
  ranAwayCount: 0,          // tracks times player has run from clown
  lastPlayerCheckPos: null, // helps detect "running away from"
};

// =============================================================================
// PLAYER STATE
// =============================================================================
const player = {
  pos: new THREE.Vector3(0, PLAYER_H, 0),
  vel: new THREE.Vector3(),
  yaw: 0,
  pitch: 0,
  walkTime: 0,
  walkBob: 0,
  lastFootstep: 0,
  stamina: STAMINA_MAX,
  flashlightOn: true,
  flashlightBattery: 100,
  isCrouching: false,
  isSprinting: false,
  itemsFound: 0,
  twigSnapCooldown: 0,
};

// =============================================================================
// INPUT — keyboard + mouse + mobile drag-look
// =============================================================================
const keys = new Set();
window.addEventListener('keydown', (e) => {
  const k = (e.key || '').toLowerCase();
  keys.add(k);
  if (k === 'escape') {
    if (gameState === 'play') pauseGame();
  }
  // F toggles flashlight — only when battery > 0 (off→on blocked when dead).
  if (k === 'f' && gameState === 'play') {
    if (player.flashlightOn) {
      player.flashlightOn = false;
      flashlight.visible = false;
      playFlashlight(false);
    } else if (player.flashlightBattery > 0) {
      player.flashlightOn = true;
      flashlight.visible = true;
      playFlashlight(true);
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

// MOBILE — joystick + drag-look on the right half of the screen.
let mc = null;
const mcMove = { x: 0, y: 0, mag: 0 };
if (_isTouch) {
  mc = createMobileControls({
    layout: 'wasd-only',
    keys,
    onMove: (x, y, mag) => { mcMove.x = x; mcMove.y = y; mcMove.mag = mag; },
    buttons: [
      // Action buttons stack — F (flashlight) + Shift (sprint).
      { id: 'F', label: 'TORCH' },
      { id: 'Shift', label: 'RUN' },
    ],
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
      if (t.identifier === lookFingerId) lookFingerId = null;
    }
  }, { passive: true });
  document.addEventListener('touchcancel', () => { lookFingerId = null; }, { passive: true });
}

// =============================================================================
// GAME STATE MACHINE
// =============================================================================
let gameState = 'menu'; // 'menu' | 'play' | 'paused' | 'dead' | 'escaped'
let runStartTs = 0;
let totalElapsed = 0;
let nextLightningAt = 0;
let nextOwlAt = 0;

const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const hudEl = document.getElementById('hud');
const flashEl = document.getElementById('flash');
const killCamEl = document.getElementById('kill-cam');
const killCanvas = document.getElementById('kill-canvas');

const itemsBadge = document.getElementById('hud-items');
const itemsN = document.getElementById('hud-items-n');
const staminaBox = document.getElementById('hud-stamina');
const staminaFill = document.getElementById('hud-stamina-fill');
const batteryBox = document.getElementById('hud-battery');
const batteryN = document.getElementById('hud-battery-n');
const subtitleEl = document.getElementById('hud-subtitle');

const endTitle = document.getElementById('end-title');
const endSub = document.getElementById('end-sub');
const endItems = document.getElementById('end-items');
const endTime = document.getElementById('end-time');
const endBest = document.getElementById('end-best');
const startBestOut = document.getElementById('start-best');

// Best escape (lowest time wins for completion runs).
{
  const best = loadBest('clown-forest');
  if (best?.escaped && typeof best.time === 'number') {
    startBestOut.textContent = `${formatTime(best.time)} (escaped)`;
  } else if (best?.itemsFound) {
    startBestOut.textContent = `${best.itemsFound}/5 items`;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

let subtitleClearTo = 0;
function showSubtitle(text, durationSecs = 3) {
  subtitleEl.textContent = text;
  subtitleEl.classList.add('is-shown');
  subtitleClearTo = now() + durationSecs;
}

let itemsBadgeHideTo = 0;
function flashItemsBadge() {
  itemsN.textContent = String(player.itemsFound);
  itemsBadge.classList.add('is-shown');
  itemsBadgeHideTo = now() + 3.0;
}

function startGame() {
  gameState = 'play';
  document.body.classList.add('is-playing');
  startOverlay.hidden = true;
  endOverlay.hidden = true;
  pauseOverlay.hidden = true;
  hudEl.hidden = false;
  flashEl.className = '';
  flashEl.style.opacity = '';
  killCamEl.classList.remove('is-on');

  // Reset player.
  player.pos.set(0, PLAYER_H, 0);
  player.yaw = 0; player.pitch = 0;
  player.stamina = STAMINA_MAX;
  player.flashlightOn = true;
  flashlight.visible = true;
  player.flashlightBattery = 100;
  player.isCrouching = false;
  player.isSprinting = false;
  player.itemsFound = 0;
  player.twigSnapCooldown = 0;
  // Reset items.
  for (const it of items) {
    it.picked = false;
    it.sprite.visible = true;
    it.sprite.material.opacity = 0.35;
  }
  // Remove existing beacon if any.
  if (beacon) {
    scene.remove(beacon); beacon.geometry.dispose(); beacon = null;
  }
  if (beaconLight) { scene.remove(beaconLight); beaconLight = null; }
  beaconPos = null;
  // Reset clown.
  clownState.phase = 'stalk';
  clownState.lastStalkEvent = 0;
  clownState.nextStalkEvent = now() + 8 + Math.random() * 10; // first peek soon
  clownState.lastSeenAt = now();
  clownState.fleeUntil = 0;
  clownState.ranAwayCount = 0;
  clownState.isVisible = false;
  clownSprite.visible = false;
  // Pick a far hiding spot.
  const ang0 = Math.random() * Math.PI * 2;
  clownState.pos.set(Math.cos(ang0) * 50, 0, Math.sin(ang0) * 50);
  clownSprite.position.set(clownState.pos.x, CLOWN_HEIGHT / 2 + groundY(clownState.pos.x, clownState.pos.z), clownState.pos.z);

  runStartTs = now();
  totalElapsed = 0;
  nextLightningAt = now() + 30 + Math.random() * 60;
  nextOwlAt = now() + 15 + Math.random() * 25;

  if (!_isTouch) {
    renderer.domElement.requestPointerLock();
  }
  // First user gesture — start audio + start stalk-phase music.
  startAudio();
  playAmbience(0.55);
  playStalkMusic();
  // Tutorial subtitle on entry.
  showSubtitle('Find 5 items. Stay alive.', 5);
}

function pauseGame() {
  if (gameState !== 'play') return;
  gameState = 'paused';
  document.body.classList.remove('is-playing');
  pauseOverlay.hidden = false;
  document.exitPointerLock?.();
  playAmbience(0);
}

function resumeGame() {
  if (gameState !== 'paused') return;
  gameState = 'play';
  document.body.classList.add('is-playing');
  pauseOverlay.hidden = true;
  if (!_isTouch) {
    renderer.domElement.requestPointerLock();
  }
  playAmbience(0.55);
}

function endGame(reason) {
  if (gameState === 'dead' || gameState === 'escaped') return;
  document.body.classList.remove('is-playing');
  document.exitPointerLock?.();
  const escaped = reason === 'escape';
  gameState = escaped ? 'escaped' : 'dead';
  const elapsed = now() - runStartTs;

  if (escaped) {
    endTitle.textContent = 'DAWN BREAKS. YOU ESCAPED.';
    endSub.textContent = 'You will dream of red triangles for years.';
    flashEl.className = 'is-sunrise';
    playEscape();
  } else {
    endTitle.textContent = 'YOU DIDN\'T MAKE IT';
    endSub.textContent = 'The smile reached you.';
  }
  endItems.textContent = String(player.itemsFound);
  endTime.textContent = formatTime(elapsed);

  // Persist best — prioritize ESCAPED runs by time, else by items found.
  const run = {
    escaped,
    itemsFound: player.itemsFound,
    time: elapsed,
    // Score = 1000 for escape + items*10 - seconds (lower time = higher score).
    score: (escaped ? 1000 : 0) + player.itemsFound * 10 - Math.floor(elapsed / 10),
    ts: Date.now(),
  };
  const result = submitRun('clown-forest', run, (a, b) => {
    // Sort escape > non-escape; within escape, faster time wins; within non-escape, more items.
    if (a.escaped !== b.escaped) return a.escaped ? -1 : 1;
    if (a.escaped) return (a.time || Infinity) - (b.time || Infinity);
    return (b.itemsFound || 0) - (a.itemsFound || 0);
  });
  const best = result.current;
  const newBest = result.isNewBest ? ' ★ NEW BEST!' : '';
  if (best.escaped) {
    endBest.innerHTML = `Best escape: <b>${formatTime(best.time)}</b>${newBest}`;
  } else {
    endBest.innerHTML = `Best items: <b>${best.itemsFound || 0}/5</b>${newBest}`;
  }

  // Brief delay so the visual fade is visible before the menu lands.
  const delay = escaped ? 1600 : 1100;
  setTimeout(() => {
    endOverlay.hidden = false;
    flashEl.className = '';
    flashEl.style.opacity = '';
  }, delay);
  playAmbience(0);
}

// ---- KILL CINEMATIC -------------------------------------------------------
// Draws the clown face HUGE on the kill canvas, fades the rest to black,
// then triggers endGame('dead').
function triggerKillCinematic() {
  if (gameState !== 'play') return;
  // Snap the kill canvas to the clown face (just reuse the texture's source
  // canvas via the same drawing routine, drawn HUGE).
  const ctx = killCanvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, killCanvas.width, killCanvas.height);
  // Draw a fresh, even more menacing close-up — bigger eyes, bigger smile.
  drawKillFace(ctx);
  killCamEl.classList.add('is-on');
  playKill();
  // Bring everything down after the scream resolves.
  setTimeout(() => {
    flashEl.className = 'is-black';
    endGame('caught');
  }, 850);
}

// Bigger clown face for the kill cam — close-up, eyes filling the frame.
function drawKillFace(g) {
  const W = killCanvas.width, H = killCanvas.height;
  // Background: oppressive black + faint dark red corner glow.
  const bg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
  bg.addColorStop(0, '#1a0a0a');
  bg.addColorStop(1, '#000');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // Pale face fills 80% of the frame.
  g.fillStyle = '#dcc8b0';
  g.beginPath();
  g.ellipse(W / 2, H * 0.55, W * 0.42, H * 0.5, 0, 0, Math.PI * 2);
  g.fill();
  // Side shadows.
  g.fillStyle = 'rgba(40, 30, 30, 0.55)';
  g.beginPath();
  g.ellipse(W * 0.3, H * 0.5, W * 0.18, H * 0.45, 0, 0, Math.PI * 2);
  g.fill();
  // Big black eye sockets.
  g.fillStyle = '#0a0608';
  g.beginPath();
  g.ellipse(W * 0.36, H * 0.42, 40, 28, 0, 0, Math.PI * 2); g.fill();
  g.beginPath();
  g.ellipse(W * 0.64, H * 0.42, 40, 28, 0, 0, Math.PI * 2); g.fill();
  // RED triangle markings.
  g.fillStyle = '#9a0a0a';
  g.beginPath();
  g.moveTo(W * 0.25, H * 0.30); g.lineTo(W * 0.36, H * 0.5); g.lineTo(W * 0.47, H * 0.30);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(W * 0.53, H * 0.30); g.lineTo(W * 0.64, H * 0.5); g.lineTo(W * 0.75, H * 0.30);
  g.closePath(); g.fill();
  // Glowing white pupils.
  g.fillStyle = '#fff8e0';
  g.fillRect(W * 0.36 - 4, H * 0.42 - 4, 8, 8);
  g.fillRect(W * 0.64 - 4, H * 0.42 - 4, 8, 8);
  // The smile — huge, asymmetric, blood-red.
  g.strokeStyle = '#7a0a0a';
  g.lineWidth = 22;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(W * 0.22, H * 0.68);
  g.bezierCurveTo(W * 0.35, H * 0.90, W * 0.65, H * 0.92, W * 0.78, H * 0.74);
  g.stroke();
  g.fillStyle = '#0a0408';
  g.beginPath();
  g.moveTo(W * 0.23, H * 0.69);
  g.bezierCurveTo(W * 0.35, H * 0.88, W * 0.65, H * 0.88, W * 0.77, H * 0.74);
  g.bezierCurveTo(W * 0.65, H * 0.80, W * 0.35, H * 0.80, W * 0.23, H * 0.69);
  g.closePath();
  g.fill();
  // Teeth — irregular jagged.
  g.fillStyle = '#e8dcc0';
  for (let i = 0; i < 11; i++) {
    const tx = W * 0.27 + (i / 10) * W * 0.46;
    const ty = H * 0.74 + (i % 2 === 0 ? 0 : 4);
    g.beginPath();
    g.moveTo(tx, ty);
    g.lineTo(tx + 14, ty + 22 + Math.random() * 8);
    g.lineTo(tx + 28, ty);
    g.closePath();
    g.fill();
  }
  // Red nose.
  g.fillStyle = '#7a0a0a';
  g.beginPath();
  g.arc(W / 2, H * 0.55, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#aa1414';
  g.beginPath();
  g.arc(W / 2 - 5, H * 0.54, 9, 0, Math.PI * 2); g.fill();
}

// Buttons.
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('end-restart').addEventListener('click', () => {
  endOverlay.hidden = true;
  killCamEl.classList.remove('is-on');
  flashEl.className = '';
  startGame();
});
document.getElementById('pause-resume').addEventListener('click', resumeGame);
document.getElementById('pause-restart').addEventListener('click', () => {
  pauseOverlay.hidden = true;
  killCamEl.classList.remove('is-on');
  flashEl.className = '';
  startGame();
});

// =============================================================================
// MAIN LOOP
// =============================================================================
let prevTs = performance.now();
function loop(now_) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now_ - prevTs) / 1000);
  prevTs = now_;
  if (gameState === 'play') {
    tickPlay(dt);
  }
  renderer.render(scene, camera);
}

function now() { return performance.now() / 1000; }

function tickPlay(dt) {
  totalElapsed += dt;

  // ---- Movement input + speed selection -----------------------------------
  const fwd = (keys.has('w') || keys.has('arrowup')) ? 1 : 0;
  const back = (keys.has('s') || keys.has('arrowdown')) ? 1 : 0;
  const left = (keys.has('a') || keys.has('arrowleft')) ? 1 : 0;
  const right = (keys.has('d') || keys.has('arrowright')) ? 1 : 0;
  let mx = (right - left), my = (back - fwd);
  if (_isTouch && mcMove.mag > 0.05) { mx = mcMove.x; my = mcMove.y; }
  const inputMag = Math.hypot(mx, my);
  const isMoving = inputMag > 0.05;

  // Crouch — held with C key.
  player.isCrouching = keys.has('c');
  // Sprint — Shift held + stamina available + not crouching.
  const sprintRequested = keys.has('shift');
  player.isSprinting = sprintRequested && !player.isCrouching && player.stamina > 0.05 && isMoving;

  let targetSpeed = WALK_SPEED;
  if (player.isCrouching) targetSpeed = CROUCH_SPEED;
  else if (player.isSprinting) targetSpeed = SPRINT_SPEED;

  // Stamina drain / regen.
  if (player.isSprinting) {
    player.stamina = Math.max(0, player.stamina - dt);
  } else {
    player.stamina = Math.min(STAMINA_MAX, player.stamina + dt * STAMINA_REGEN);
  }

  // Convert input to world-space velocity.
  const cs = Math.cos(player.yaw), sn = Math.sin(player.yaw);
  let vx = (-sn * (-my)) + (cs * mx);
  let vz = (-cs * (-my)) + (-sn * mx);
  const vmag = Math.hypot(vx, vz);
  if (vmag > 1) { vx /= vmag; vz /= vmag; }
  vx *= targetSpeed; vz *= targetSpeed;

  // ---- Movement + tree collision ----
  const [nx, nz] = collideMove(player.pos.x, player.pos.z, vx * dt, vz * dt);
  const moved = Math.hypot(nx - player.pos.x, nz - player.pos.z);
  player.pos.x = nx; player.pos.z = nz;
  // Soft clamp to playable area (with margin from world edge).
  const lim = WORLD_SIZE * 0.48;
  player.pos.x = Math.max(-lim, Math.min(lim, player.pos.x));
  player.pos.z = Math.max(-lim, Math.min(lim, player.pos.z));

  // ---- Walk bob + footsteps ----
  if (moved > 0.001) {
    const bobRate = player.isSprinting ? 12 : player.isCrouching ? 5 : 8;
    player.walkTime += dt * bobRate;
    player.walkBob = Math.sin(player.walkTime) * (player.isSprinting ? 0.06 : 0.035);
    // Footstep cadence scales with speed.
    const footInterval = player.isSprinting ? 0.30 : player.isCrouching ? 0.55 : 0.42;
    if (now() - player.lastFootstep > footInterval) {
      const intensity = player.isSprinting ? 1.0 : player.isCrouching ? 0.35 : 0.65;
      playFootstep(intensity);
      player.lastFootstep = now();
    }
    // Occasional twig snap — sounds genuinely scary in headphones.
    player.twigSnapCooldown -= dt;
    if (player.twigSnapCooldown <= 0 && Math.random() < 0.012) {
      playTwigSnap();
      player.twigSnapCooldown = 2 + Math.random() * 4;
    }
  } else {
    player.walkBob *= 0.85;
  }

  // ---- Camera ----
  const targetH = player.isCrouching ? PLAYER_CROUCH_H : PLAYER_H;
  // Smooth crouch transition.
  const eyeH = (camera.position.y - player.walkBob);
  const newH = eyeH + (targetH - eyeH) * Math.min(1, dt * 6);
  camera.position.set(player.pos.x, newH + player.walkBob, player.pos.z);
  const lookX = Math.cos(player.pitch) * -Math.sin(player.yaw);
  const lookY = Math.sin(player.pitch);
  const lookZ = Math.cos(player.pitch) * -Math.cos(player.yaw);
  camera.lookAt(camera.position.x + lookX, camera.position.y + lookY, camera.position.z + lookZ);

  // ---- Flashlight battery + flicker ----
  if (player.flashlightOn) {
    player.flashlightBattery = Math.max(0, player.flashlightBattery - FLASHLIGHT_DRAIN * dt);
    if (player.flashlightBattery <= 0) {
      player.flashlightOn = false;
      flashlight.visible = false;
      playFlashlight(false);
      showSubtitle('Flashlight is dead.', 4);
    }
    // Slight flicker every frame.
    const flicker = 0.85 + Math.random() * 0.15;
    flashlight.intensity = 1.5 * flicker;
  }

  // ---- Items: glow when near + pickup ----
  for (const it of items) {
    if (it.picked) continue;
    const d = Math.hypot(it.x - player.pos.x, it.z - player.pos.z);
    if (d < ITEM_PICKUP_DIST) {
      it.picked = true;
      it.sprite.visible = false;
      player.itemsFound++;
      playPickup();
      flashItemsBadge();
      const remaining = ITEMS_TO_ESCAPE - player.itemsFound;
      if (remaining === 0) {
        showSubtitle('All items found. Run.', 6);
        spawnBeacon();
      } else if (remaining === 1) {
        showSubtitle('One more...', 4);
      }
    } else if (d < ITEM_GLOW_DIST) {
      // Brighten the sprite as we approach.
      const t = 1 - d / ITEM_GLOW_DIST;
      it.sprite.material.opacity = 0.35 + t * 0.6;
      it.sprite.scale.setScalar(1.4 + t * 0.4);
    } else {
      it.sprite.material.opacity = 0.35;
      it.sprite.scale.setScalar(1.4);
    }
  }

  // ---- Beacon check ----
  if (beaconPos) {
    const d = Math.hypot(beaconPos.x - player.pos.x, beaconPos.z - player.pos.z);
    if (d < 3.5) {
      endGame('escape');
    } else if (d < 30) {
      // Pulse beacon emissive based on proximity for visual urgency.
      if (beacon) {
        const t = 1 - d / 30;
        beacon.material.emissiveIntensity = 1.2 + t * 1.4 + Math.sin(totalElapsed * 6) * 0.3 * t;
      }
    }
  }

  // ---- Tree sway (subtle wind on canopy) ----
  // We can't actually sway every instance per frame for free — but we can
  // gently rotate the whole canopy mesh by a tiny amount tied to time.
  // This is cheap and reads as a soft procedural breeze on the leaf cloud.
  canopyMesh.rotation.y = Math.sin(totalElapsed * 0.3) * 0.012;

  // ---- Clown AI ----
  tickClown(dt);

  // ---- Ambient events: lightning + owl ----
  if (now() > nextLightningAt) {
    triggerLightning();
    nextLightningAt = now() + 30 + Math.random() * 60;
  }
  if (now() > nextOwlAt) {
    playOwl();
    nextOwlAt = now() + 30 + Math.random() * 50;
  }

  // ---- HUD ticking ----
  tickHUD();
}

// =============================================================================
// TREE COLLISION — for each tree within a small bounding box of the player,
// resolve overlap by pushing the player away.
// =============================================================================
function collideMove(curX, curZ, dx, dz) {
  let nx = curX + dx;
  let nz = curZ + dz;
  // Only check trees within a 6m bubble (cheap).
  const checkR = 6;
  const checkRSq = checkR * checkR;
  for (let i = 0; i < treeData.length; i++) {
    const t = treeData[i];
    const dx2 = t.x - nx, dz2 = t.z - nz;
    const distSq = dx2 * dx2 + dz2 * dz2;
    if (distSq > checkRSq) continue;
    // Trunk radius scales with tree scale; conservative bottom radius.
    const trunkR = 0.4 * t.scale;
    const minD = PLAYER_R + trunkR;
    if (distSq < minD * minD) {
      // Push the player out along the normal.
      const d = Math.sqrt(distSq);
      if (d < 0.001) continue;
      const nxn = (nx - t.x) / d;
      const nzn = (nz - t.z) / d;
      nx = t.x + nxn * minD;
      nz = t.z + nzn * minD;
    }
  }
  return [nx, nz];
}

// =============================================================================
// LINE-OF-SIGHT for the clown — check if player can see the clown. Cheap:
// distance + roughly a frustum check (is clown inside the view cone?).
// Fog + trees mean the player has very limited sight regardless, so we don't
// need to ray-march the trees explicitly.
// =============================================================================
function playerCanSeeClown() {
  const dx = clownState.pos.x - player.pos.x;
  const dz = clownState.pos.z - player.pos.z;
  const dist = Math.hypot(dx, dz);
  if (dist > FOG_FAR) return false;
  // Angle to clown vs forward (yaw).
  const fwdX = -Math.sin(player.yaw);
  const fwdZ = -Math.cos(player.yaw);
  const len = Math.max(0.001, dist);
  const dot = (dx / len) * fwdX + (dz / len) * fwdZ;
  // Camera FOV ~72°, so cos(36°) ≈ 0.81. Widen slightly for peripheral feel.
  return dot > 0.65;
}

// =============================================================================
// CLOWN STATE MACHINE
// =============================================================================
function tickClown(dt) {
  const playerHuntStart = totalElapsed > CLOWN_HUNT_AFTER || clownState.ranAwayCount >= 3;

  // Compute basics.
  const dx = clownState.pos.x - player.pos.x;
  const dz = clownState.pos.z - player.pos.z;
  const dist = Math.hypot(dx, dz);
  const sees = playerCanSeeClown();
  // Audio: pan + distance for breath/whispers (Agent B reacts).
  const screenAng = Math.atan2(dz, dx) - player.yaw;
  const panX = Math.sin(screenAng);
  updateClownDist(dist);
  // Heartbeat speeds up when clown is closer.
  setHeartbeat(Math.max(0.4, Math.min(1.8, 0.4 + (50 - Math.min(50, dist)) / 30)));

  // ---- PHASE TRANSITIONS ----
  if (clownState.phase === 'stalk' && playerHuntStart) {
    clownState.phase = 'hunt';
    playHuntMusic();
    showSubtitle('Something is following you.', 5);
  }
  if (clownState.phase !== 'chase' && dist < CLOWN_CHASE_TRIGGER && sees && clownState.isVisible) {
    clownState.phase = 'chase';
    playChaseMusic();
    showSubtitle('RUN.', 3);
  }
  if (clownState.phase === 'chase' && dist > CLOWN_CHASE_TRIGGER * 2.5 && !sees) {
    // Lost the player — back to hunt.
    clownState.phase = playerHuntStart ? 'hunt' : 'stalk';
    if (clownState.phase === 'hunt') playHuntMusic(); else playStalkMusic();
  }

  // ---- KILL ----
  if (dist < CLOWN_KILL_DIST && clownState.isVisible) {
    triggerKillCinematic();
    return;
  }

  // ---- PHASE BEHAVIOR ----
  if (clownState.phase === 'stalk') {
    // Hidden most of the time. Periodic peeks at the edge of visibility.
    // Hidden default: sprite invisible until peek triggers.
    if (clownState.isVisible) {
      // Already peeking — when player looks at clown, VANISH (teleport away).
      const seeing = playerCanSeeClown();
      if (seeing) {
        // Vanish: hide and reposition far.
        clownState.isVisible = false;
        clownSprite.visible = false;
        clownState.fleeUntil = now() + 3 + Math.random() * 4;
        // Move clown ~50-80m in a random direction.
        const ang = Math.random() * Math.PI * 2;
        const r = 50 + Math.random() * 30;
        clownState.pos.x = player.pos.x + Math.cos(ang) * r;
        clownState.pos.z = player.pos.z + Math.sin(ang) * r;
        // Were they running away from us before vanishing? Detect via player motion.
        if (clownState.lastPlayerCheckPos) {
          const lp = clownState.lastPlayerCheckPos;
          const movedAwayFromClown =
            Math.hypot(player.pos.x - lp.x, player.pos.z - lp.z) > 1.0;
          if (movedAwayFromClown) clownState.ranAwayCount++;
        }
      }
      // Otherwise stay visible briefly — player gets a flash of clown
      // before they catch on. Time-out after 3 seconds.
      if (now() - clownState.visibleStartedAt > 3) {
        clownState.isVisible = false;
        clownSprite.visible = false;
        clownState.fleeUntil = now() + 5 + Math.random() * 6;
      }
    } else if (now() > clownState.nextStalkEvent && now() > clownState.fleeUntil) {
      // Schedule a peek: spawn clown 20-35m from the player, slightly behind
      // a tree if we can find one (we pick a random nearby tree as cover).
      let cx, cz;
      // 60% chance to spawn behind a tree (i.e. very close to one).
      if (Math.random() < 0.6) {
        // Find a tree 18-32m from the player.
        const candidates = [];
        for (let i = 0; i < treeData.length; i += 5) {
          const t = treeData[i];
          const d = Math.hypot(t.x - player.pos.x, t.z - player.pos.z);
          if (d > 18 && d < 32) candidates.push(t);
        }
        if (candidates.length) {
          const t = candidates[Math.floor(Math.random() * candidates.length)];
          // Position the clown JUST behind that tree from player's POV.
          const dxT = t.x - player.pos.x, dzT = t.z - player.pos.z;
          const dT = Math.hypot(dxT, dzT);
          cx = t.x + (dxT / dT) * 1.2;
          cz = t.z + (dzT / dT) * 1.2;
        } else {
          // Fallback — random ring.
          const ang = Math.random() * Math.PI * 2;
          const r = 20 + Math.random() * 15;
          cx = player.pos.x + Math.cos(ang) * r;
          cz = player.pos.z + Math.sin(ang) * r;
        }
      } else {
        const ang = Math.random() * Math.PI * 2;
        const r = 22 + Math.random() * 13;
        cx = player.pos.x + Math.cos(ang) * r;
        cz = player.pos.z + Math.sin(ang) * r;
      }
      clownState.pos.x = cx;
      clownState.pos.z = cz;
      clownState.isVisible = true;
      clownSprite.visible = true;
      clownState.visibleStartedAt = now();
      clownState.lastPlayerCheckPos = { x: player.pos.x, z: player.pos.z };
      // Audio cue from clown's direction.
      const a = Math.atan2(cz - player.pos.z, cx - player.pos.x) - player.yaw;
      const pan = Math.sin(a);
      const d = Math.hypot(cx - player.pos.x, cz - player.pos.z);
      if (Math.random() < 0.5) playClownLaugh(pan, d);
      else playClownStep(pan, d);
      clownState.lastStalkEvent = now();
      clownState.nextStalkEvent = now() + CLOWN_STALK_INTERVAL_MIN + Math.random() * (CLOWN_STALK_INTERVAL_MAX - CLOWN_STALK_INTERVAL_MIN);
    }
  } else if (clownState.phase === 'hunt') {
    // Clown is visible and slowly closing. Walks toward player at walking speed.
    clownState.isVisible = true;
    clownSprite.visible = true;
    moveClownToward(player.pos.x, player.pos.z, CLOWN_HUNT_SPEED, dt);
    // Occasional audio (steps).
    if (Math.random() < dt * 0.4) {
      const a = Math.atan2(dz, dx) - player.yaw;
      playClownStep(Math.sin(a), dist);
    }
    // If clown is way too far, teleport closer (so the hunt never feels lost).
    if (dist > 45 && now() - clownState.lastStalkEvent > CLOWN_TELEPORT_DELAY) {
      const ang = player.yaw + Math.PI + (Math.random() - 0.5) * 1.6;
      const r = 25 + Math.random() * 10;
      clownState.pos.x = player.pos.x + Math.cos(ang) * r;
      clownState.pos.z = player.pos.z + Math.sin(ang) * r;
      clownState.lastStalkEvent = now();
    }
  } else if (clownState.phase === 'chase') {
    clownState.isVisible = true;
    clownSprite.visible = true;
    moveClownToward(player.pos.x, player.pos.z, CLOWN_CHASE_SPEED, dt);
    // Chase: heartbeat at max + frequent audio.
    if (Math.random() < dt * 1.2) {
      const a = Math.atan2(dz, dx) - player.yaw;
      playClownStep(Math.sin(a), dist);
    }
  }

  // ---- Sync sprite position to ground + ensure facing camera ----
  if (clownState.isVisible) {
    const gy = groundY(clownState.pos.x, clownState.pos.z);
    clownSprite.position.set(
      clownState.pos.x,
      CLOWN_HEIGHT / 2 + gy,
      clownState.pos.z
    );
    // Slight bob to feel "breathing" / shuffling weight.
    clownSprite.position.y += Math.sin(totalElapsed * 1.4) * 0.04;
  }
}

// Move clown toward a target world position. Clamps to world bounds.
function moveClownToward(tx, tz, speed, dt) {
  const dx = tx - clownState.pos.x;
  const dz = tz - clownState.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.01) return;
  const step = speed * dt;
  const ux = dx / d, uz = dz / d;
  // Try the full step; if we'd hit a tree, slide around it.
  let cx = clownState.pos.x + ux * step;
  let cz = clownState.pos.z + uz * step;
  // Cheap clown collision: same as player but smaller radius.
  for (let i = 0; i < treeData.length; i++) {
    const t = treeData[i];
    const dx2 = t.x - cx, dz2 = t.z - cz;
    const distSq = dx2 * dx2 + dz2 * dz2;
    const trunkR = 0.4 * t.scale;
    const minD = 0.5 + trunkR;
    if (distSq < minD * minD && distSq > 0.0001) {
      const dd = Math.sqrt(distSq);
      cx = t.x + ((cx - t.x) / dd) * minD;
      cz = t.z + ((cz - t.z) / dd) * minD;
    }
  }
  clownState.pos.x = cx;
  clownState.pos.z = cz;
}

// =============================================================================
// LIGHTNING — full-screen white flash + crash audio. The atmospheric peak
// moment that breaks tension when you'd already forgotten about it.
// =============================================================================
function triggerLightning() {
  flashEl.className = 'is-lightning';
  setTimeout(() => { flashEl.className = ''; }, 90);
  // A second softer flash after 180ms — feels more realistic.
  setTimeout(() => {
    flashEl.className = 'is-lightning';
    setTimeout(() => { flashEl.className = ''; }, 60);
  }, 220);
  playLightning();
}

// =============================================================================
// HUD UPDATE — gated by deltas so we don't repaint every frame.
// =============================================================================
let lastStamPct = -1, lastBatPct = -1;
function tickHUD() {
  // Subtitle clear.
  if (subtitleClearTo && now() > subtitleClearTo) {
    subtitleEl.classList.remove('is-shown');
    subtitleClearTo = 0;
  }
  // Items badge auto-hide.
  if (itemsBadgeHideTo && now() > itemsBadgeHideTo) {
    itemsBadge.classList.remove('is-shown');
    itemsBadgeHideTo = 0;
  }
  // Stamina bar — show when actively sprinting or stamina < max.
  const stamPct = Math.round((player.stamina / STAMINA_MAX) * 100);
  if (stamPct !== lastStamPct) {
    staminaFill.style.width = stamPct + '%';
    lastStamPct = stamPct;
  }
  const showStam = player.isSprinting || player.stamina < STAMINA_MAX - 0.1;
  staminaBox.classList.toggle('is-shown', showStam);
  staminaBox.classList.toggle('is-low', stamPct < 30);
  // Battery readout — only when flashlight on.
  const batPct = Math.round(player.flashlightBattery);
  if (batPct !== lastBatPct) {
    batteryN.textContent = batPct;
    lastBatPct = batPct;
  }
  batteryBox.classList.toggle('is-shown', player.flashlightOn);
  batteryBox.classList.toggle('is-low', batPct < 25);
}

// =============================================================================
// RESIZE
// =============================================================================
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', onResize);
onResize();

// First frame.
requestAnimationFrame(loop);

})(); // end async boot IIFE
