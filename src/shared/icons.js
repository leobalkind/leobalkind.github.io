// src/shared/icons.js
// Pixel-art icon library shared across all mini-games.
//
//   drawIcon[name](ctx, x, y, size, opts?)
//     -> Canvas2D draw function. Draws a pixel-art icon centered on (x, y),
//        sized to ~ size px. opts = { rotation, alpha, tint }.
//
//   iconSvg[name](size, opts?)
//     -> Returns an inline SVG string (same icon set, same names) for DOM use
//        (settings menus, tutorial tips, hub badges, etc.).
//
// Design: hand-built 16x16 (or 16x8 for the bone) pixel grids drawn with crisp
// 1-2 px rects. Palette is hard-coded from src/shared/gameBase.css :root so
// callers don't need DOM access at runtime.
//
// IMPORTANT: This file is a self-contained library. It must not import or
// depend on any other project module.

// --- Palette -----------------------------------------------------------------
const COLORS = {
  // base
  bg:        '#0a0716',
  bgDeep:    '#050310',
  text:      '#f8f5ff',
  muted:     '#8a90b1',
  border:    '#2a2540',
  // neon
  pink:      '#ff3aa1',
  cyan:      '#4cc9f0',
  yellow:    '#ffd23f',
  green:     '#5ef38c',
  orange:    '#ff8e3c',
  purple:    '#b055ff',
  crimson:   '#ff3a3a',
  // earthier supplementals (used inside icons so they don't all look the same)
  ivory:     '#f4ecd2',
  ivoryDark: '#d7c89c',
  gold:      '#ffd23f',
  goldDark:  '#c89c20',
  brown:     '#7a4a25',
  brownDark: '#4a2810',
  brownMid:  '#a0683a',
  cheeseY:   '#f6c84a',
  cheeseDk:  '#c89020',
  meatRed:   '#b03030',
  meatLite:  '#d85050',
  pugBeige:  '#e4c79a',
  pugDark:   '#3a2a1a',
  silver:    '#c8c8d8',
  silverDk:  '#888898',
  white:     '#ffffff',
  black:     '#000000',
  fuse:      '#a0a0a0',
};

// --- Helpers -----------------------------------------------------------------
// All draw functions assume an internal 16x16 grid. `s = size / 16` scales it.
// We use fillRect (not strokes) to keep the pixel-art crisp at any size.

function _setup(ctx, x, y, size, opts) {
  const { rotation = 0, alpha = 1 } = opts || {};
  ctx.save();
  ctx.translate(x, y);
  if (rotation) ctx.rotate(rotation);
  if (alpha !== 1) ctx.globalAlpha *= alpha;
  return size / 16;
}

function _tinted(base, tint) {
  // Returns base color (we don't actually do per-pixel tint at runtime; tint
  // is honored at the outline level only — caller can compositeOperation if
  // they want a fuller wash).
  return tint || base;
}

// SVG helpers — generate <rect> grids from the same idea. We keep the SVG
// viewBox at 0 0 16 16 (or 0 0 16 8 for the bone) and let `size` scale.
function _svg(viewBox, size, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}" shape-rendering="crispEdges">${body}</svg>`;
}
function _r(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
}

// =============================================================================
// CANVAS DRAW FUNCTIONS
// =============================================================================

export const drawIcon = {

  // --- TREASURE / PICKUPS ---------------------------------------------------

  bone(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    const tint = (opts && opts.tint);
    ctx.fillStyle = _tinted(COLORS.ivory, tint);
    // shaft
    ctx.fillRect(-4 * s, -1 * s, 8 * s, 2 * s);
    // 4 knuckles
    ctx.fillRect(-6 * s, -3 * s, 3 * s, 3 * s);
    ctx.fillRect(-6 * s,  0 * s, 3 * s, 3 * s);
    ctx.fillRect( 3 * s, -3 * s, 3 * s, 3 * s);
    ctx.fillRect( 3 * s,  0 * s, 3 * s, 3 * s);
    // shading
    ctx.fillStyle = COLORS.ivoryDark;
    ctx.fillRect(-4 * s, 0 * s, 8 * s, 1 * s);
    ctx.fillRect(-6 * s, 2 * s, 3 * s, 1 * s);
    ctx.fillRect( 3 * s, 2 * s, 3 * s, 1 * s);
    // outline dots
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-5 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 4 * s, -2 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  gold(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // body — circle approximated with steps
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-5 * s, -3 * s, 10 * s, 6 * s);
    ctx.fillRect(-3 * s, -5 * s,  6 * s, 2 * s);
    ctx.fillRect(-3 * s,  3 * s,  6 * s, 2 * s);
    // rim shading
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(-5 * s,  2 * s, 10 * s, 1 * s);
    ctx.fillRect(-3 * s,  4 * s,  6 * s, 1 * s);
    ctx.fillRect( 4 * s, -3 * s,  1 * s, 6 * s);
    // $ stripe
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-1 * s, -3 * s, 2 * s, 6 * s);
    ctx.fillRect(-2 * s, -2 * s, 4 * s, 1 * s);
    ctx.fillRect(-2 * s,  1 * s, 4 * s, 1 * s);
    // highlight
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s, -2 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  gem(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // top facets
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 2 * s);
    ctx.fillRect(-5 * s, -3 * s, 10 * s, 3 * s);
    // bottom triangle
    ctx.fillRect(-4 * s,  0 * s, 8 * s, 1 * s);
    ctx.fillRect(-3 * s,  1 * s, 6 * s, 1 * s);
    ctx.fillRect(-2 * s,  2 * s, 4 * s, 1 * s);
    ctx.fillRect(-1 * s,  3 * s, 2 * s, 1 * s);
    // facet shading
    ctx.fillStyle = COLORS.purple;
    ctx.fillRect( 1 * s, -3 * s, 4 * s, 3 * s);
    ctx.fillRect( 0 * s,  0 * s, 4 * s, 1 * s);
    // highlight
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-3 * s, -4 * s, 2 * s, 1 * s);
    ctx.fillRect(-4 * s, -2 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  cheese(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // wedge triangle
    ctx.fillStyle = COLORS.cheeseY;
    ctx.fillRect(-6 * s,  3 * s, 12 * s, 2 * s);
    ctx.fillRect(-5 * s,  1 * s, 10 * s, 2 * s);
    ctx.fillRect(-3 * s, -1 * s,  7 * s, 2 * s);
    ctx.fillRect(-1 * s, -3 * s,  4 * s, 2 * s);
    ctx.fillRect( 1 * s, -5 * s,  2 * s, 2 * s);
    // rind / crust shading
    ctx.fillStyle = COLORS.cheeseDk;
    ctx.fillRect(-6 * s,  4 * s, 12 * s, 1 * s);
    // holes
    ctx.fillStyle = COLORS.brown;
    ctx.fillRect(-3 * s,  2 * s, 2 * s, 2 * s);
    ctx.fillRect( 1 * s,  3 * s, 2 * s, 1 * s);
    ctx.fillRect( 0 * s, -1 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  biscuit(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // round cookie
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-4 * s, -5 * s, 8 * s, 1 * s);
    ctx.fillRect(-5 * s, -4 * s, 10 * s, 8 * s);
    ctx.fillRect(-4 * s,  4 * s, 8 * s, 1 * s);
    // bite mark (top-right notch)
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect( 2 * s, -5 * s, 3 * s, 3 * s);
    ctx.clearRect( 3 * s, -4 * s, 2 * s, 1 * s);
    // chocolate chips
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-3 * s, -2 * s, 2 * s, 2 * s);
    ctx.fillRect( 1 * s,  0 * s, 2 * s, 2 * s);
    ctx.fillRect(-2 * s,  2 * s, 2 * s, 1 * s);
    // highlight crumb
    ctx.fillStyle = COLORS.ivory;
    ctx.fillRect(-1 * s, -3 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -1 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  crown(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // base band
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-6 * s,  1 * s, 12 * s, 3 * s);
    // 3 points
    ctx.fillRect(-6 * s, -3 * s, 2 * s, 4 * s);
    ctx.fillRect(-1 * s, -4 * s, 2 * s, 5 * s);
    ctx.fillRect( 4 * s, -3 * s, 2 * s, 4 * s);
    // notch between points
    ctx.fillRect(-4 * s, -1 * s, 3 * s, 2 * s);
    ctx.fillRect( 1 * s, -1 * s, 3 * s, 2 * s);
    // jewels
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-5 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 4 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect( 0 * s, -3 * s, 1 * s, 1 * s);
    // bottom shading
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(-6 * s,  3 * s, 12 * s, 1 * s);
    ctx.restore();
  },

  diamond(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // top point
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-1 * s, -6 * s, 2 * s, 1 * s);
    ctx.fillRect(-2 * s, -5 * s, 4 * s, 1 * s);
    ctx.fillRect(-3 * s, -4 * s, 6 * s, 1 * s);
    // widest
    ctx.fillRect(-4 * s, -3 * s, 8 * s, 2 * s);
    // taper
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 1 * s);
    ctx.fillRect(-2 * s,  0 * s, 4 * s, 2 * s);
    ctx.fillRect(-1 * s,  2 * s, 2 * s, 2 * s);
    ctx.fillRect( 0 * s,  4 * s, 1 * s, 1 * s);
    // facet shading right side
    ctx.fillStyle = COLORS.purple;
    ctx.fillRect( 1 * s, -3 * s, 3 * s, 2 * s);
    ctx.fillRect( 1 * s,  0 * s, 1 * s, 2 * s);
    // highlight
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-2 * s, -4 * s, 2 * s, 1 * s);
    ctx.restore();
  },

  bacon(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // wavy strip - red base
    ctx.fillStyle = COLORS.meatRed;
    ctx.fillRect(-6 * s, -3 * s, 12 * s, 6 * s);
    ctx.fillRect(-7 * s, -2 * s,  1 * s, 4 * s);
    ctx.fillRect( 6 * s, -2 * s,  1 * s, 4 * s);
    // white fat stripes (horizontal)
    ctx.fillStyle = COLORS.ivory;
    ctx.fillRect(-7 * s, -2 * s, 14 * s, 1 * s);
    ctx.fillRect(-6 * s,  1 * s, 13 * s, 1 * s);
    // dark trim
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-6 * s,  3 * s, 12 * s, 1 * s);
    // crisp edge wave
    ctx.fillStyle = COLORS.meatLite;
    ctx.fillRect(-5 * s, -3 * s,  2 * s, 1 * s);
    ctx.fillRect( 3 * s, -3 * s,  2 * s, 1 * s);
    ctx.restore();
  },

  cake(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // slice body (triangle on its side, pointy left)
    ctx.fillStyle = COLORS.ivory;        // sponge
    ctx.fillRect(-2 * s,  0 * s, 8 * s, 4 * s);
    ctx.fillRect(-4 * s,  1 * s, 2 * s, 3 * s);
    ctx.fillRect(-6 * s,  2 * s, 2 * s, 2 * s);
    // frosting top
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-2 * s, -2 * s, 8 * s, 2 * s);
    ctx.fillRect(-4 * s, -1 * s, 2 * s, 2 * s);
    ctx.fillRect(-6 * s,  0 * s, 2 * s, 2 * s);
    // sponge layer line
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-2 * s,  2 * s, 8 * s, 1 * s);
    ctx.fillRect(-4 * s,  3 * s, 2 * s, 1 * s);
    // cherry on top
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect( 2 * s, -4 * s, 3 * s, 3 * s);
    ctx.fillStyle = COLORS.green;
    ctx.fillRect( 3 * s, -5 * s, 1 * s, 1 * s);
    // base shading
    ctx.fillStyle = COLORS.ivoryDark;
    ctx.fillRect(-2 * s,  4 * s, 8 * s, 1 * s);
    ctx.restore();
  },

  pizza(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // slice (triangle, point up)
    ctx.fillStyle = COLORS.cheeseY;
    ctx.fillRect(-1 * s, -6 * s, 2 * s, 1 * s);
    ctx.fillRect(-2 * s, -5 * s, 4 * s, 1 * s);
    ctx.fillRect(-3 * s, -4 * s, 6 * s, 1 * s);
    ctx.fillRect(-4 * s, -3 * s, 8 * s, 1 * s);
    ctx.fillRect(-5 * s, -2 * s, 10 * s, 1 * s);
    ctx.fillRect(-6 * s, -1 * s, 12 * s, 2 * s);
    // crust (bottom edge)
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-6 * s,  1 * s, 12 * s, 2 * s);
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-6 * s,  3 * s, 12 * s, 1 * s);
    // pepperoni
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-3 * s, -3 * s, 2 * s, 2 * s);
    ctx.fillRect( 1 * s, -2 * s, 2 * s, 2 * s);
    ctx.fillRect(-1 * s, -5 * s, 2 * s, 1 * s);
    // cheese highlights
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s, -1 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  milk(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // cap
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-2 * s, -7 * s, 4 * s, 2 * s);
    // neck
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect(-2 * s, -5 * s, 4 * s, 1 * s);
    // bottle body (white)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s, -4 * s, 8 * s, 9 * s);
    ctx.fillRect(-3 * s,  5 * s, 6 * s, 1 * s);
    // shoulder shading
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect( 3 * s, -3 * s, 1 * s, 8 * s);
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-4 * s,  5 * s, 8 * s, 1 * s);
    // label
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 3 * s);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-1 * s,  0 * s, 2 * s, 1 * s);
    ctx.restore();
  },

  meat(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // big meaty oval
    ctx.fillStyle = COLORS.meatRed;
    ctx.fillRect(-5 * s, -3 * s, 10 * s, 6 * s);
    ctx.fillRect(-4 * s, -4 * s,  8 * s, 1 * s);
    ctx.fillRect(-4 * s,  3 * s,  8 * s, 1 * s);
    // fat marbling
    ctx.fillStyle = COLORS.ivoryDark;
    ctx.fillRect(-4 * s, -2 * s,  8 * s, 1 * s);
    ctx.fillRect(-3 * s,  1 * s,  6 * s, 1 * s);
    // highlight
    ctx.fillStyle = COLORS.meatLite;
    ctx.fillRect(-3 * s, -3 * s,  2 * s, 1 * s);
    // bone sticking out (right)
    ctx.fillStyle = COLORS.ivory;
    ctx.fillRect( 4 * s, -1 * s, 4 * s, 2 * s);
    ctx.fillRect( 7 * s, -2 * s, 1 * s, 4 * s);
    ctx.fillStyle = COLORS.ivoryDark;
    ctx.fillRect( 4 * s,  0 * s, 4 * s, 1 * s);
    ctx.restore();
  },

  sandwich(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // top slice
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-6 * s, -5 * s, 12 * s, 2 * s);
    ctx.fillStyle = COLORS.ivory;
    ctx.fillRect(-6 * s, -3 * s, 12 * s, 1 * s);
    // lettuce (green ruffle)
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(-7 * s, -2 * s, 14 * s, 2 * s);
    ctx.fillRect(-6 * s, -3 * s,  1 * s, 1 * s);
    ctx.fillRect( 5 * s, -3 * s,  1 * s, 1 * s);
    // cheese
    ctx.fillStyle = COLORS.cheeseY;
    ctx.fillRect(-6 * s,  0 * s, 12 * s, 1 * s);
    ctx.fillRect(-7 * s,  0 * s,  1 * s, 1 * s);
    ctx.fillRect( 6 * s,  0 * s,  1 * s, 1 * s);
    // meat slice
    ctx.fillStyle = COLORS.meatRed;
    ctx.fillRect(-6 * s,  1 * s, 12 * s, 2 * s);
    // bottom slice
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-6 * s,  3 * s, 12 * s, 2 * s);
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect(-6 * s,  5 * s, 12 * s, 1 * s);
    ctx.restore();
  },

  tennisBall(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // fuzzy green body — circle
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 1 * s);
    ctx.fillRect(-5 * s, -4 * s, 10 * s, 2 * s);
    ctx.fillRect(-6 * s, -2 * s, 12 * s, 4 * s);
    ctx.fillRect(-5 * s,  2 * s, 10 * s, 2 * s);
    ctx.fillRect(-3 * s,  4 * s, 6 * s, 1 * s);
    // white curving seam
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-5 * s, -1 * s, 1 * s, 2 * s);
    ctx.fillRect(-4 * s,  1 * s, 1 * s, 1 * s);
    ctx.fillRect(-3 * s,  2 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -3 * s, 1 * s, 1 * s);
    ctx.fillRect( 3 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 4 * s, -1 * s, 1 * s, 2 * s);
    // fuzz texture
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(-3 * s, -3 * s, 1 * s, 1 * s);
    ctx.fillRect( 1 * s,  1 * s, 1 * s, 1 * s);
    // shading
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect( 3 * s,  2 * s, 2 * s, 1 * s);
    ctx.restore();
  },

  crownGold(ctx, x, y, size, opts) {
    // Same as crown but richer gold w/ shading
    const s = _setup(ctx, x, y, size, opts);
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-7 * s,  1 * s, 14 * s, 4 * s);
    // 5 spikes
    ctx.fillRect(-7 * s, -2 * s,  2 * s, 3 * s);
    ctx.fillRect(-4 * s, -4 * s,  2 * s, 5 * s);
    ctx.fillRect(-1 * s, -5 * s,  2 * s, 6 * s);
    ctx.fillRect( 2 * s, -4 * s,  2 * s, 5 * s);
    ctx.fillRect( 5 * s, -2 * s,  2 * s, 3 * s);
    // inner shading
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(-7 * s,  4 * s, 14 * s, 1 * s);
    // jewels
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-6 * s,  2 * s, 2 * s, 2 * s);
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-1 * s,  2 * s, 2 * s, 2 * s);
    ctx.fillStyle = COLORS.green;
    ctx.fillRect( 4 * s,  2 * s, 2 * s, 2 * s);
    // sparkle
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-1 * s, -4 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  // --- TOOLS / ABILITIES ----------------------------------------------------

  shield(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // heater shield silhouette
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-5 * s, -6 * s, 10 * s, 7 * s);
    ctx.fillRect(-4 * s,  1 * s,  8 * s, 1 * s);
    ctx.fillRect(-3 * s,  2 * s,  6 * s, 1 * s);
    ctx.fillRect(-2 * s,  3 * s,  4 * s, 1 * s);
    ctx.fillRect(-1 * s,  4 * s,  2 * s, 1 * s);
    // inner band
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-4 * s, -5 * s,  8 * s, 1 * s);
    // cross
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-1 * s, -4 * s,  2 * s, 6 * s);
    ctx.fillRect(-4 * s, -1 * s,  8 * s, 2 * s);
    // shadow side
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect( 3 * s, -5 * s,  2 * s, 6 * s);
    ctx.restore();
  },

  lightning(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    ctx.fillStyle = COLORS.yellow;
    // top blade
    ctx.fillRect( 0 * s, -7 * s, 3 * s, 1 * s);
    ctx.fillRect(-1 * s, -6 * s, 4 * s, 1 * s);
    ctx.fillRect(-2 * s, -5 * s, 4 * s, 1 * s);
    ctx.fillRect(-3 * s, -4 * s, 4 * s, 1 * s);
    // middle joint
    ctx.fillRect(-2 * s, -3 * s, 5 * s, 1 * s);
    ctx.fillRect( 0 * s, -2 * s, 3 * s, 1 * s);
    ctx.fillRect( 1 * s, -1 * s, 2 * s, 1 * s);
    // bottom blade
    ctx.fillRect(-1 * s,  0 * s, 3 * s, 1 * s);
    ctx.fillRect(-2 * s,  1 * s, 3 * s, 1 * s);
    ctx.fillRect(-3 * s,  2 * s, 3 * s, 1 * s);
    ctx.fillRect(-4 * s,  3 * s, 3 * s, 1 * s);
    ctx.fillRect(-5 * s,  4 * s, 2 * s, 1 * s);
    // edge highlight
    ctx.fillStyle = COLORS.white;
    ctx.fillRect( 0 * s, -7 * s, 1 * s, 1 * s);
    ctx.fillRect(-1 * s, -5 * s, 1 * s, 1 * s);
    // shadow
    ctx.fillStyle = COLORS.orange;
    ctx.fillRect( 2 * s, -6 * s, 1 * s, 2 * s);
    ctx.fillRect( 1 * s, -1 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  magnet(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // U-shape — left prong
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-5 * s, -5 * s, 3 * s, 6 * s);
    // right prong
    ctx.fillRect( 2 * s, -5 * s, 3 * s, 6 * s);
    // arch (top)
    ctx.fillRect(-5 * s, -6 * s, 10 * s, 1 * s);
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 1 * s);
    // silver tips
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect(-5 * s,  1 * s, 3 * s, 2 * s);
    ctx.fillRect( 2 * s,  1 * s, 3 * s, 2 * s);
    // pole letters
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s,  4 * s, 1 * s, 1 * s);
    ctx.fillRect( 3 * s,  4 * s, 1 * s, 1 * s);
    // spark between poles
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-1 * s,  3 * s, 2 * s, 1 * s);
    ctx.restore();
  },

  heart(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    ctx.fillStyle = COLORS.crimson;
    // two top humps
    ctx.fillRect(-5 * s, -4 * s, 4 * s, 4 * s);
    ctx.fillRect( 1 * s, -4 * s, 4 * s, 4 * s);
    ctx.fillRect(-5 * s, -5 * s, 3 * s, 1 * s);
    ctx.fillRect( 2 * s, -5 * s, 3 * s, 1 * s);
    // mid band
    ctx.fillRect(-5 * s,  0 * s, 10 * s, 2 * s);
    // taper to point
    ctx.fillRect(-4 * s,  2 * s, 8 * s, 1 * s);
    ctx.fillRect(-3 * s,  3 * s, 6 * s, 1 * s);
    ctx.fillRect(-2 * s,  4 * s, 4 * s, 1 * s);
    ctx.fillRect(-1 * s,  5 * s, 2 * s, 1 * s);
    // shine
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-4 * s, -3 * s, 2 * s, 2 * s);
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s, -3 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  flashlight(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // handle
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-2 * s, -1 * s, 5 * s, 6 * s);
    // head (bell)
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect(-4 * s, -3 * s, 4 * s, 5 * s);
    ctx.fillRect(-5 * s, -2 * s, 1 * s, 3 * s);
    // lens
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-6 * s, -1 * s, 1 * s, 1 * s);
    // light cone going up-left
    ctx.fillStyle = 'rgba(255,210,63,0.5)';
    ctx.fillRect(-9 * s, -3 * s, 2 * s, 3 * s);
    ctx.fillRect(-8 * s, -4 * s, 2 * s, 1 * s);
    ctx.fillStyle = 'rgba(255,210,63,0.25)';
    ctx.fillRect(-9 * s, -5 * s, 3 * s, 2 * s);
    ctx.fillRect(-7 * s,  0 * s, 1 * s, 1 * s);
    // grip ring
    ctx.fillStyle = COLORS.black;
    ctx.fillRect( 0 * s, -1 * s, 1 * s, 6 * s);
    ctx.restore();
  },

  smokeBomb(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // sphere body
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(-4 * s, -2 * s, 8 * s, 6 * s);
    ctx.fillRect(-3 * s, -3 * s, 6 * s, 1 * s);
    ctx.fillRect(-3 * s,  4 * s, 6 * s, 1 * s);
    ctx.fillStyle = COLORS.border;
    ctx.fillRect(-5 * s,  0 * s, 10 * s, 2 * s);
    ctx.fillRect(-4 * s, -1 * s,  8 * s, 1 * s);
    // sheen highlight
    ctx.fillStyle = COLORS.purple;
    ctx.fillRect(-3 * s, -1 * s, 2 * s, 1 * s);
    // fuse stub
    ctx.fillStyle = COLORS.fuse;
    ctx.fillRect( 0 * s, -5 * s, 1 * s, 2 * s);
    ctx.fillRect( 1 * s, -6 * s, 1 * s, 1 * s);
    // spark
    ctx.fillStyle = COLORS.orange;
    ctx.fillRect( 2 * s, -7 * s, 1 * s, 1 * s);
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect( 1 * s, -7 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  key(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // bow (head — circle)
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-7 * s, -3 * s, 5 * s, 5 * s);
    ctx.fillRect(-6 * s, -4 * s, 3 * s, 1 * s);
    ctx.fillRect(-6 * s,  2 * s, 3 * s, 1 * s);
    // inner hole
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-5 * s, -2 * s, 2 * s, 2 * s);
    // shaft
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-2 * s, -1 * s, 8 * s, 2 * s);
    // teeth
    ctx.fillRect( 3 * s,  1 * s, 1 * s, 2 * s);
    ctx.fillRect( 5 * s,  1 * s, 1 * s, 2 * s);
    // shading
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(-2 * s,  0 * s, 8 * s, 1 * s);
    ctx.fillRect(-7 * s,  1 * s, 5 * s, 1 * s);
    ctx.restore();
  },

  sock(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // cuff (top)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-3 * s, -6 * s, 6 * s, 2 * s);
    // body (light blue)
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-3 * s, -4 * s, 6 * s, 6 * s);
    // heel turn
    ctx.fillRect(-4 * s,  2 * s, 7 * s, 2 * s);
    // toe
    ctx.fillRect(-4 * s,  4 * s, 10 * s, 2 * s);
    // stripes
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-3 * s, -3 * s, 6 * s, 1 * s);
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 1 * s);
    // shadow under heel
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-4 * s,  5 * s, 10 * s, 1 * s);
    ctx.restore();
  },

  camera(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // bracket (mount, top)
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-1 * s, -7 * s, 2 * s, 2 * s);
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 1 * s);
    // body box
    ctx.fillStyle = COLORS.border;
    ctx.fillRect(-5 * s, -4 * s, 9 * s, 5 * s);
    // lens cylinder front
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect( 4 * s, -3 * s, 3 * s, 3 * s);
    // red record dot
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-4 * s, -3 * s, 1 * s, 1 * s);
    // lens glint
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect( 5 * s, -2 * s, 1 * s, 1 * s);
    // sensor strip
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(-4 * s,  0 * s, 7 * s, 1 * s);
    // base under
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-4 * s,  1 * s, 7 * s, 1 * s);
    ctx.restore();
  },

  nitro(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // outer flame (orange)
    ctx.fillStyle = COLORS.orange;
    ctx.fillRect(-1 * s, -7 * s, 2 * s, 1 * s);
    ctx.fillRect(-2 * s, -6 * s, 4 * s, 1 * s);
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 2 * s);
    ctx.fillRect(-4 * s, -3 * s, 8 * s, 3 * s);
    ctx.fillRect(-5 * s,  0 * s, 10 * s, 3 * s);
    ctx.fillRect(-4 * s,  3 * s, 8 * s, 2 * s);
    ctx.fillRect(-3 * s,  5 * s, 6 * s, 1 * s);
    // inner flame (yellow)
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-1 * s, -4 * s, 2 * s, 1 * s);
    ctx.fillRect(-2 * s, -3 * s, 4 * s, 2 * s);
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 3 * s);
    ctx.fillRect(-2 * s,  2 * s, 4 * s, 2 * s);
    // hot core (white)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-1 * s,  0 * s, 2 * s, 2 * s);
    ctx.restore();
  },

  // alias
  flame(ctx, x, y, size, opts) {
    drawIcon.nitro(ctx, x, y, size, opts);
  },

  // --- CHARACTERS / WORLD ---------------------------------------------------

  pugFace(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // ear left + right (down-flaps, dark)
    ctx.fillStyle = COLORS.pugDark;
    ctx.fillRect(-7 * s, -4 * s, 3 * s, 5 * s);
    ctx.fillRect( 4 * s, -4 * s, 3 * s, 5 * s);
    // head (beige)
    ctx.fillStyle = COLORS.pugBeige;
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 9 * s);
    ctx.fillRect(-4 * s, -6 * s,  8 * s, 1 * s);
    ctx.fillRect(-4 * s,  4 * s,  8 * s, 1 * s);
    // black face mask (muzzle area)
    ctx.fillStyle = COLORS.pugDark;
    ctx.fillRect(-3 * s,  0 * s, 6 * s, 3 * s);
    ctx.fillRect(-2 * s, -1 * s, 4 * s, 1 * s);
    // eyes
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-3 * s, -3 * s, 2 * s, 2 * s);
    ctx.fillRect( 1 * s, -3 * s, 2 * s, 2 * s);
    // nose
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-1 * s,  0 * s, 2 * s, 1 * s);
    // tongue
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-1 * s,  3 * s, 2 * s, 2 * s);
    // eye glints
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-2 * s, -3 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -3 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  zombiePaw(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // palm pad
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(-4 * s,  0 * s, 8 * s, 4 * s);
    ctx.fillRect(-3 * s,  4 * s, 6 * s, 1 * s);
    // fingers / toe-beans
    ctx.fillRect(-5 * s, -3 * s, 2 * s, 3 * s);
    ctx.fillRect(-2 * s, -5 * s, 2 * s, 5 * s);
    ctx.fillRect( 0 * s, -5 * s, 2 * s, 5 * s);
    ctx.fillRect( 3 * s, -3 * s, 2 * s, 3 * s);
    // claws (white)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-5 * s, -4 * s, 2 * s, 1 * s);
    ctx.fillRect(-2 * s, -6 * s, 2 * s, 1 * s);
    ctx.fillRect( 0 * s, -6 * s, 2 * s, 1 * s);
    ctx.fillRect( 3 * s, -4 * s, 2 * s, 1 * s);
    // rot spots
    ctx.fillStyle = COLORS.purple;
    ctx.fillRect(-2 * s,  1 * s, 2 * s, 1 * s);
    ctx.fillRect( 1 * s,  3 * s, 1 * s, 1 * s);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-4 * s,  4 * s, 8 * s, 1 * s);
    ctx.restore();
  },

  ghost(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // rounded body
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-3 * s, -6 * s,  6 * s, 1 * s);
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 2 * s);
    ctx.fillRect(-6 * s, -3 * s, 12 * s, 7 * s);
    // wavy bottom
    ctx.fillRect(-6 * s,  4 * s,  2 * s, 1 * s);
    ctx.fillRect(-2 * s,  4 * s,  2 * s, 1 * s);
    ctx.fillRect( 2 * s,  4 * s,  2 * s, 1 * s);
    // eyes
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-3 * s, -2 * s, 2 * s, 3 * s);
    ctx.fillRect( 1 * s, -2 * s, 2 * s, 3 * s);
    // pupils
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-2 * s, -1 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -1 * s, 1 * s, 1 * s);
    // mouth
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(-1 * s,  2 * s, 2 * s, 1 * s);
    ctx.restore();
  },

  monsterEye(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // outer eyeball (white)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-5 * s, -4 * s, 10 * s, 8 * s);
    ctx.fillRect(-6 * s, -3 * s,  1 * s, 6 * s);
    ctx.fillRect( 5 * s, -3 * s,  1 * s, 6 * s);
    ctx.fillRect(-4 * s, -5 * s,  8 * s, 1 * s);
    ctx.fillRect(-4 * s,  4 * s,  8 * s, 1 * s);
    // bloodshot veins
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-5 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 4 * s,  1 * s, 1 * s, 1 * s);
    ctx.fillRect(-3 * s,  3 * s, 2 * s, 1 * s);
    // red iris
    ctx.fillRect(-2 * s, -2 * s, 4 * s, 4 * s);
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 2 * s);
    // black pupil
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-1 * s, -1 * s, 2 * s, 2 * s);
    // glow rim
    ctx.fillStyle = COLORS.orange;
    ctx.fillRect(-2 * s, -2 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  cat(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // silhouette body
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(-5 * s,  0 * s, 10 * s, 4 * s);
    // head
    ctx.fillRect(-4 * s, -3 * s,  7 * s, 4 * s);
    // ears (triangle nubs)
    ctx.fillRect(-4 * s, -5 * s,  2 * s, 2 * s);
    ctx.fillRect( 0 * s, -5 * s,  2 * s, 2 * s);
    // tail (curling up right)
    ctx.fillRect( 4 * s, -1 * s,  1 * s, 5 * s);
    ctx.fillRect( 5 * s, -3 * s,  1 * s, 3 * s);
    ctx.fillRect( 6 * s, -4 * s,  1 * s, 2 * s);
    // legs
    ctx.fillRect(-4 * s,  4 * s,  2 * s, 1 * s);
    ctx.fillRect( 1 * s,  4 * s,  2 * s, 1 * s);
    // eyes (yellow glow)
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-3 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 1 * s, -2 * s, 1 * s, 1 * s);
    // nose
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-1 * s,  0 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  // --- STATUS / UI ----------------------------------------------------------

  skull(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // skull dome
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-4 * s, -6 * s,  8 * s, 1 * s);
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 6 * s);
    // jaw
    ctx.fillRect(-3 * s,  1 * s, 6 * s, 2 * s);
    ctx.fillRect(-2 * s,  3 * s, 4 * s, 1 * s);
    // eye sockets
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-4 * s, -3 * s, 3 * s, 3 * s);
    ctx.fillRect( 1 * s, -3 * s, 3 * s, 3 * s);
    // nose hole
    ctx.fillRect(-1 * s,  0 * s, 2 * s, 1 * s);
    // teeth gap
    ctx.fillRect(-1 * s,  2 * s, 1 * s, 1 * s);
    ctx.fillRect( 1 * s,  2 * s, 1 * s, 1 * s);
    // glint in socket
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-3 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -2 * s, 1 * s, 1 * s);
    // shading
    ctx.fillStyle = COLORS.ivoryDark;
    ctx.fillRect(-5 * s,  0 * s, 10 * s, 1 * s);
    ctx.restore();
  },

  exit(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // doorframe
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(-5 * s, -6 * s, 10 * s, 2 * s);
    ctx.fillRect(-5 * s, -6 * s,  2 * s, 12 * s);
    ctx.fillRect( 3 * s, -6 * s,  2 * s, 12 * s);
    ctx.fillRect(-5 * s,  4 * s, 10 * s, 2 * s);
    // doorway opening
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(-3 * s, -4 * s, 6 * s, 8 * s);
    // arrow (white, pointing right)
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-2 * s, -1 * s, 4 * s, 2 * s);
    ctx.fillRect( 1 * s, -2 * s, 1 * s, 1 * s);
    ctx.fillRect( 2 * s, -1 * s, 1 * s, 2 * s);
    ctx.fillRect( 1 * s,  1 * s, 1 * s, 1 * s);
    // EXIT label dots
    ctx.fillStyle = COLORS.yellow;
    ctx.fillRect(-4 * s,  3 * s, 1 * s, 1 * s);
    ctx.fillRect( 3 * s,  3 * s, 1 * s, 1 * s);
    ctx.restore();
  },

  can(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // top rim
    ctx.fillStyle = COLORS.silver;
    ctx.fillRect(-3 * s, -7 * s, 6 * s, 1 * s);
    ctx.fillRect(-3 * s, -6 * s, 6 * s, 1 * s);
    // pull tab
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-1 * s, -7 * s, 2 * s, 1 * s);
    // body (red)
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 11 * s);
    // body side shading
    ctx.fillStyle = COLORS.meatRed;
    ctx.fillRect( 2 * s, -5 * s, 1 * s, 11 * s);
    // body highlight
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(-3 * s, -5 * s, 1 * s, 11 * s);
    // label band
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(-3 * s, -1 * s, 6 * s, 2 * s);
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect(-2 * s,  0 * s, 4 * s, 1 * s);
    // bottom rim
    ctx.fillStyle = COLORS.silverDk;
    ctx.fillRect(-3 * s,  6 * s, 6 * s, 1 * s);
    ctx.restore();
  },

  mailbox(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // post
    ctx.fillStyle = COLORS.brownMid;
    ctx.fillRect(-1 * s,  1 * s, 2 * s, 6 * s);
    // box body
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-6 * s, -4 * s, 12 * s, 5 * s);
    // domed top
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 1 * s);
    ctx.fillRect(-3 * s, -6 * s,  6 * s, 1 * s);
    // door front (dark frame)
    ctx.fillStyle = COLORS.bgDeep;
    ctx.fillRect(-5 * s, -3 * s, 9 * s, 3 * s);
    // door panel
    ctx.fillStyle = COLORS.cyan;
    ctx.fillRect(-4 * s, -2 * s, 7 * s, 1 * s);
    // handle
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect( 3 * s, -2 * s, 1 * s, 1 * s);
    // flag (up, red)
    ctx.fillStyle = COLORS.crimson;
    ctx.fillRect( 5 * s, -5 * s, 2 * s, 3 * s);
    ctx.fillStyle = COLORS.brownDark;
    ctx.fillRect( 5 * s, -5 * s, 1 * s, 6 * s);
    ctx.restore();
  },

  dollar(ctx, x, y, size, opts) {
    const s = _setup(ctx, x, y, size, opts);
    // glowy halo
    ctx.fillStyle = 'rgba(255,210,63,0.35)';
    ctx.fillRect(-5 * s, -5 * s, 10 * s, 10 * s);
    // bold $ shape (S-curve)
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-3 * s, -5 * s, 6 * s, 2 * s);  // top bar
    ctx.fillRect(-4 * s, -4 * s, 2 * s, 2 * s);  // top-left corner
    ctx.fillRect(-3 * s, -2 * s, 5 * s, 2 * s);  // upper-middle
    ctx.fillRect( 2 * s,  0 * s, 2 * s, 2 * s);  // lower-right corner
    ctx.fillRect(-3 * s,  2 * s, 5 * s, 2 * s);  // lower-middle
    ctx.fillRect(-4 * s,  3 * s, 2 * s, 1 * s);  // bottom-left
    ctx.fillRect(-3 * s,  5 * s, 6 * s, 1 * s);  // bottom edge
    // vertical line of $
    ctx.fillRect(-1 * s, -6 * s, 2 * s, 13 * s);
    // dark outline pixel
    ctx.fillStyle = COLORS.goldDark;
    ctx.fillRect(-3 * s,  4 * s, 6 * s, 1 * s);
    // sparkle
    ctx.fillStyle = COLORS.white;
    ctx.fillRect( 3 * s, -4 * s, 1 * s, 1 * s);
    ctx.restore();
  },

};

// =============================================================================
// SVG STRING FUNCTIONS
// =============================================================================
//
// SVGs use viewBox -8 -8 16 16 so coordinates match the canvas grid: origin at
// center, x/y in -8..+8 like drawIcon. shape-rendering="crispEdges" forces the
// pixel-art look at any zoom level. Caller controls outer size.

export const iconSvg = {

  bone(size) {
    const c = COLORS;
    return _svg('-8 -4 16 8', size, [
      _r(-4, -1, 8, 2, c.ivory),
      _r(-6, -3, 3, 3, c.ivory),
      _r(-6,  0, 3, 3, c.ivory),
      _r( 3, -3, 3, 3, c.ivory),
      _r( 3,  0, 3, 3, c.ivory),
      _r(-4,  0, 8, 1, c.ivoryDark),
      _r(-6,  2, 3, 1, c.ivoryDark),
      _r( 3,  2, 3, 1, c.ivoryDark),
    ].join(''));
  },

  gold(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -3, 10, 6, c.gold),
      _r(-3, -5,  6, 2, c.gold),
      _r(-3,  3,  6, 2, c.gold),
      _r(-5,  2, 10, 1, c.goldDark),
      _r(-3,  4,  6, 1, c.goldDark),
      _r( 4, -3,  1, 6, c.goldDark),
      _r(-1, -3,  2, 6, c.brownDark),
      _r(-2, -2,  4, 1, c.brownDark),
      _r(-2,  1,  4, 1, c.brownDark),
      _r(-4, -2,  1, 1, c.white),
    ].join(''));
  },

  gem(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-3, -5, 6, 2, c.cyan),
      _r(-5, -3, 10, 3, c.cyan),
      _r(-4,  0, 8, 1, c.cyan),
      _r(-3,  1, 6, 1, c.cyan),
      _r(-2,  2, 4, 1, c.cyan),
      _r(-1,  3, 2, 1, c.cyan),
      _r( 1, -3, 4, 3, c.purple),
      _r( 0,  0, 4, 1, c.purple),
      _r(-3, -4, 2, 1, c.white),
      _r(-4, -2, 1, 1, c.white),
    ].join(''));
  },

  cheese(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-6,  3, 12, 2, c.cheeseY),
      _r(-5,  1, 10, 2, c.cheeseY),
      _r(-3, -1,  7, 2, c.cheeseY),
      _r(-1, -3,  4, 2, c.cheeseY),
      _r( 1, -5,  2, 2, c.cheeseY),
      _r(-6,  4, 12, 1, c.cheeseDk),
      _r(-3,  2,  2, 2, c.brown),
      _r( 1,  3,  2, 1, c.brown),
      _r( 0, -1,  1, 1, c.brown),
    ].join(''));
  },

  biscuit(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-4, -5, 8, 1, c.brownMid),
      _r(-5, -4, 7, 8, c.brownMid), // skip top-right for bite
      _r(-5, -4, 10, 2, c.brownMid),
      _r(-5, -2, 10, 6, c.brownMid),
      _r(-4,  4,  8, 1, c.brownMid),
      // bite mark (transparent rect by drawing bg-deep) — show on dark UIs as halo
      _r( 2, -5,  3, 3, '#00000000'),
      _r(-3, -2,  2, 2, c.brownDark),
      _r( 1,  0,  2, 2, c.brownDark),
      _r(-2,  2,  2, 1, c.brownDark),
      _r(-1, -3,  1, 1, c.ivory),
      _r( 2, -1,  1, 1, c.ivory),
    ].join(''));
  },

  crown(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-6,  1, 12, 3, c.yellow),
      _r(-6, -3,  2, 4, c.yellow),
      _r(-1, -4,  2, 5, c.yellow),
      _r( 4, -3,  2, 4, c.yellow),
      _r(-4, -1,  3, 2, c.yellow),
      _r( 1, -1,  3, 2, c.yellow),
      _r(-5, -2,  1, 1, c.crimson),
      _r( 4, -2,  1, 1, c.crimson),
      _r( 0, -3,  1, 1, c.cyan),
      _r(-6,  3, 12, 1, c.goldDark),
    ].join(''));
  },

  diamond(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-1, -6, 2, 1, c.cyan),
      _r(-2, -5, 4, 1, c.cyan),
      _r(-3, -4, 6, 1, c.cyan),
      _r(-4, -3, 8, 2, c.cyan),
      _r(-3, -1, 6, 1, c.cyan),
      _r(-2,  0, 4, 2, c.cyan),
      _r(-1,  2, 2, 2, c.cyan),
      _r( 0,  4, 1, 1, c.cyan),
      _r( 1, -3, 3, 2, c.purple),
      _r( 1,  0, 1, 2, c.purple),
      _r(-2, -4, 2, 1, c.white),
    ].join(''));
  },

  bacon(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-6, -3, 12, 6, c.meatRed),
      _r(-7, -2,  1, 4, c.meatRed),
      _r( 6, -2,  1, 4, c.meatRed),
      _r(-7, -2, 14, 1, c.ivory),
      _r(-6,  1, 13, 1, c.ivory),
      _r(-6,  3, 12, 1, c.brownDark),
      _r(-5, -3,  2, 1, c.meatLite),
      _r( 3, -3,  2, 1, c.meatLite),
    ].join(''));
  },

  cake(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-2,  0, 8, 4, c.ivory),
      _r(-4,  1, 2, 3, c.ivory),
      _r(-6,  2, 2, 2, c.ivory),
      _r(-2, -2, 8, 2, c.pink),
      _r(-4, -1, 2, 2, c.pink),
      _r(-6,  0, 2, 2, c.pink),
      _r(-2,  2, 8, 1, c.brownMid),
      _r(-4,  3, 2, 1, c.brownMid),
      _r( 2, -4, 3, 3, c.crimson),
      _r( 3, -5, 1, 1, c.green),
      _r(-2,  4, 8, 1, c.ivoryDark),
    ].join(''));
  },

  pizza(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-1, -6, 2, 1, c.cheeseY),
      _r(-2, -5, 4, 1, c.cheeseY),
      _r(-3, -4, 6, 1, c.cheeseY),
      _r(-4, -3, 8, 1, c.cheeseY),
      _r(-5, -2, 10, 1, c.cheeseY),
      _r(-6, -1, 12, 2, c.cheeseY),
      _r(-6,  1, 12, 2, c.brownMid),
      _r(-6,  3, 12, 1, c.brownDark),
      _r(-3, -3, 2, 2, c.crimson),
      _r( 1, -2, 2, 2, c.crimson),
      _r(-1, -5, 2, 1, c.crimson),
      _r(-4, -1, 1, 1, c.white),
    ].join(''));
  },

  milk(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-2, -7, 4, 2, c.crimson),
      _r(-2, -5, 4, 1, c.silver),
      _r(-4, -4, 8, 9, c.white),
      _r(-3,  5, 6, 1, c.white),
      _r( 3, -3, 1, 8, c.silver),
      _r(-4,  5, 8, 1, c.silverDk),
      _r(-3, -1, 6, 3, c.cyan),
      _r(-1,  0, 2, 1, c.white),
    ].join(''));
  },

  meat(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -3, 10, 6, c.meatRed),
      _r(-4, -4,  8, 1, c.meatRed),
      _r(-4,  3,  8, 1, c.meatRed),
      _r(-4, -2,  8, 1, c.ivoryDark),
      _r(-3,  1,  6, 1, c.ivoryDark),
      _r(-3, -3,  2, 1, c.meatLite),
      _r( 4, -1,  4, 2, c.ivory),
      _r( 7, -2,  1, 4, c.ivory),
      _r( 4,  0,  4, 1, c.ivoryDark),
    ].join(''));
  },

  sandwich(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-6, -5, 12, 2, c.brownMid),
      _r(-6, -3, 12, 1, c.ivory),
      _r(-7, -2, 14, 2, c.green),
      _r(-6, -3,  1, 1, c.green),
      _r( 5, -3,  1, 1, c.green),
      _r(-6,  0, 12, 1, c.cheeseY),
      _r(-7,  0,  1, 1, c.cheeseY),
      _r( 6,  0,  1, 1, c.cheeseY),
      _r(-6,  1, 12, 2, c.meatRed),
      _r(-6,  3, 12, 2, c.brownMid),
      _r(-6,  5, 12, 1, c.brownDark),
    ].join(''));
  },

  tennisBall(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-3, -5, 6, 1, c.green),
      _r(-5, -4, 10, 2, c.green),
      _r(-6, -2, 12, 4, c.green),
      _r(-5,  2, 10, 2, c.green),
      _r(-3,  4, 6, 1, c.green),
      _r(-5, -1, 1, 2, c.white),
      _r(-4,  1, 1, 1, c.white),
      _r(-3,  2, 1, 1, c.white),
      _r( 2, -3, 1, 1, c.white),
      _r( 3, -2, 1, 1, c.white),
      _r( 4, -1, 1, 2, c.white),
    ].join(''));
  },

  crownGold(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-7,  1, 14, 4, c.gold),
      _r(-7, -2,  2, 3, c.gold),
      _r(-4, -4,  2, 5, c.gold),
      _r(-1, -5,  2, 6, c.gold),
      _r( 2, -4,  2, 5, c.gold),
      _r( 5, -2,  2, 3, c.gold),
      _r(-7,  4, 14, 1, c.goldDark),
      _r(-6,  2,  2, 2, c.crimson),
      _r(-1,  2,  2, 2, c.cyan),
      _r( 4,  2,  2, 2, c.green),
      _r(-1, -4,  1, 1, c.white),
    ].join(''));
  },

  shield(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -6, 10, 7, c.cyan),
      _r(-4,  1,  8, 1, c.cyan),
      _r(-3,  2,  6, 1, c.cyan),
      _r(-2,  3,  4, 1, c.cyan),
      _r(-1,  4,  2, 1, c.cyan),
      _r(-4, -5,  8, 1, c.bg),
      _r(-1, -4,  2, 6, c.white),
      _r(-4, -1,  8, 2, c.white),
      _r( 3, -5,  2, 6, '#00000040'),
    ].join(''));
  },

  lightning(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r( 0, -7, 3, 1, c.yellow),
      _r(-1, -6, 4, 1, c.yellow),
      _r(-2, -5, 4, 1, c.yellow),
      _r(-3, -4, 4, 1, c.yellow),
      _r(-2, -3, 5, 1, c.yellow),
      _r( 0, -2, 3, 1, c.yellow),
      _r( 1, -1, 2, 1, c.yellow),
      _r(-1,  0, 3, 1, c.yellow),
      _r(-2,  1, 3, 1, c.yellow),
      _r(-3,  2, 3, 1, c.yellow),
      _r(-4,  3, 3, 1, c.yellow),
      _r(-5,  4, 2, 1, c.yellow),
      _r( 0, -7, 1, 1, c.white),
      _r(-1, -5, 1, 1, c.white),
      _r( 2, -6, 1, 2, c.orange),
      _r( 1, -1, 1, 1, c.orange),
    ].join(''));
  },

  magnet(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -5, 3, 6, c.crimson),
      _r( 2, -5, 3, 6, c.crimson),
      _r(-5, -6, 10, 1, c.crimson),
      _r(-5, -5, 10, 1, c.crimson),
      _r(-5,  1, 3, 2, c.silver),
      _r( 2,  1, 3, 2, c.silver),
      _r(-4,  4, 1, 1, c.white),
      _r( 3,  4, 1, 1, c.white),
      _r(-1,  3, 2, 1, c.yellow),
    ].join(''));
  },

  heart(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -4, 4, 4, c.crimson),
      _r( 1, -4, 4, 4, c.crimson),
      _r(-5, -5, 3, 1, c.crimson),
      _r( 2, -5, 3, 1, c.crimson),
      _r(-5,  0, 10, 2, c.crimson),
      _r(-4,  2,  8, 1, c.crimson),
      _r(-3,  3,  6, 1, c.crimson),
      _r(-2,  4,  4, 1, c.crimson),
      _r(-1,  5,  2, 1, c.crimson),
      _r(-4, -3,  2, 2, c.pink),
      _r(-4, -3,  1, 1, c.white),
    ].join(''));
  },

  flashlight(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-2, -1, 5, 6, c.silverDk),
      _r(-4, -3, 4, 5, c.silver),
      _r(-5, -2, 1, 3, c.silver),
      _r(-6, -1, 1, 1, c.yellow),
      _r(-9, -3, 2, 3, '#ffd23f80'),
      _r(-8, -4, 2, 1, '#ffd23f80'),
      _r(-9, -5, 3, 2, '#ffd23f40'),
      _r(-7,  0, 1, 1, '#ffd23f40'),
      _r( 0, -1, 1, 6, c.black),
    ].join(''));
  },

  smokeBomb(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-4, -2, 8, 6, c.bgDeep),
      _r(-3, -3, 6, 1, c.bgDeep),
      _r(-3,  4, 6, 1, c.bgDeep),
      _r(-5,  0, 10, 2, c.border),
      _r(-4, -1,  8, 1, c.border),
      _r(-3, -1,  2, 1, c.purple),
      _r( 0, -5,  1, 2, c.fuse),
      _r( 1, -6,  1, 1, c.fuse),
      _r( 2, -7,  1, 1, c.orange),
      _r( 1, -7,  1, 1, c.yellow),
    ].join(''));
  },

  key(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-7, -3, 5, 5, c.gold),
      _r(-6, -4, 3, 1, c.gold),
      _r(-6,  2, 3, 1, c.gold),
      _r(-5, -2, 2, 2, c.bg),
      _r(-2, -1, 8, 2, c.gold),
      _r( 3,  1, 1, 2, c.gold),
      _r( 5,  1, 1, 2, c.gold),
      _r(-2,  0, 8, 1, c.goldDark),
      _r(-7,  1, 5, 1, c.goldDark),
    ].join(''));
  },

  sock(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-3, -6, 6, 2, c.white),
      _r(-3, -4, 6, 6, c.cyan),
      _r(-4,  2, 7, 2, c.cyan),
      _r(-4,  4, 10, 2, c.cyan),
      _r(-3, -3, 6, 1, c.pink),
      _r(-3, -1, 6, 1, c.pink),
      _r(-4,  5, 10, 1, '#00000040'),
    ].join(''));
  },

  camera(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-1, -7, 2, 2, c.silverDk),
      _r(-3, -5, 6, 1, c.silverDk),
      _r(-5, -4, 9, 5, c.border),
      _r( 4, -3, 3, 3, c.silver),
      _r(-4, -3, 1, 1, c.crimson),
      _r( 5, -2, 1, 1, c.cyan),
      _r(-4,  0, 7, 1, c.bgDeep),
      _r(-4,  1, 7, 1, c.silverDk),
    ].join(''));
  },

  nitro(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-1, -7, 2, 1, c.orange),
      _r(-2, -6, 4, 1, c.orange),
      _r(-3, -5, 6, 2, c.orange),
      _r(-4, -3, 8, 3, c.orange),
      _r(-5,  0, 10, 3, c.orange),
      _r(-4,  3,  8, 2, c.orange),
      _r(-3,  5,  6, 1, c.orange),
      _r(-1, -4, 2, 1, c.yellow),
      _r(-2, -3, 4, 2, c.yellow),
      _r(-3, -1, 6, 3, c.yellow),
      _r(-2,  2, 4, 2, c.yellow),
      _r(-1,  0, 2, 2, c.white),
    ].join(''));
  },

  flame(size) { return iconSvg.nitro(size); },

  pugFace(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-7, -4, 3, 5, c.pugDark),
      _r( 4, -4, 3, 5, c.pugDark),
      _r(-5, -5, 10, 9, c.pugBeige),
      _r(-4, -6,  8, 1, c.pugBeige),
      _r(-4,  4,  8, 1, c.pugBeige),
      _r(-3,  0, 6, 3, c.pugDark),
      _r(-2, -1, 4, 1, c.pugDark),
      _r(-3, -3, 2, 2, c.black),
      _r( 1, -3, 2, 2, c.black),
      _r(-1,  0, 2, 1, c.black),
      _r(-1,  3, 2, 2, c.pink),
      _r(-2, -3, 1, 1, c.white),
      _r( 2, -3, 1, 1, c.white),
    ].join(''));
  },

  zombiePaw(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-4,  0, 8, 4, c.green),
      _r(-3,  4, 6, 1, c.green),
      _r(-5, -3, 2, 3, c.green),
      _r(-2, -5, 2, 5, c.green),
      _r( 0, -5, 2, 5, c.green),
      _r( 3, -3, 2, 3, c.green),
      _r(-5, -4, 2, 1, c.white),
      _r(-2, -6, 2, 1, c.white),
      _r( 0, -6, 2, 1, c.white),
      _r( 3, -4, 2, 1, c.white),
      _r(-2,  1, 2, 1, c.purple),
      _r( 1,  3, 1, 1, c.purple),
    ].join(''));
  },

  ghost(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-3, -6,  6, 1, c.white),
      _r(-5, -5, 10, 2, c.white),
      _r(-6, -3, 12, 7, c.white),
      _r(-6,  4,  2, 1, c.white),
      _r(-2,  4,  2, 1, c.white),
      _r( 2,  4,  2, 1, c.white),
      _r(-3, -2, 2, 3, c.bg),
      _r( 1, -2, 2, 3, c.bg),
      _r(-2, -1, 1, 1, c.cyan),
      _r( 2, -1, 1, 1, c.cyan),
      _r(-1,  2, 2, 1, c.bg),
    ].join(''));
  },

  monsterEye(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -4, 10, 8, c.white),
      _r(-6, -3,  1, 6, c.white),
      _r( 5, -3,  1, 6, c.white),
      _r(-4, -5,  8, 1, c.white),
      _r(-4,  4,  8, 1, c.white),
      _r(-5, -2,  1, 1, c.crimson),
      _r( 4,  1,  1, 1, c.crimson),
      _r(-3,  3,  2, 1, c.crimson),
      _r(-2, -2,  4, 4, c.crimson),
      _r(-3, -1,  6, 2, c.crimson),
      _r(-1, -1,  2, 2, c.black),
      _r(-2, -2,  1, 1, c.orange),
    ].join(''));
  },

  cat(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5,  0, 10, 4, c.bgDeep),
      _r(-4, -3,  7, 4, c.bgDeep),
      _r(-4, -5,  2, 2, c.bgDeep),
      _r( 0, -5,  2, 2, c.bgDeep),
      _r( 4, -1,  1, 5, c.bgDeep),
      _r( 5, -3,  1, 3, c.bgDeep),
      _r( 6, -4,  1, 2, c.bgDeep),
      _r(-4,  4,  2, 1, c.bgDeep),
      _r( 1,  4,  2, 1, c.bgDeep),
      _r(-3, -2,  1, 1, c.yellow),
      _r( 1, -2,  1, 1, c.yellow),
      _r(-1,  0,  1, 1, c.pink),
    ].join(''));
  },

  skull(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-4, -6,  8, 1, c.white),
      _r(-5, -5, 10, 6, c.white),
      _r(-3,  1,  6, 2, c.white),
      _r(-2,  3,  4, 1, c.white),
      _r(-4, -3,  3, 3, c.black),
      _r( 1, -3,  3, 3, c.black),
      _r(-1,  0,  2, 1, c.black),
      _r(-1,  2,  1, 1, c.black),
      _r( 1,  2,  1, 1, c.black),
      _r(-3, -2,  1, 1, c.crimson),
      _r( 2, -2,  1, 1, c.crimson),
      _r(-5,  0, 10, 1, c.ivoryDark),
    ].join(''));
  },

  exit(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -6, 10, 2, c.green),
      _r(-5, -6,  2, 12, c.green),
      _r( 3, -6,  2, 12, c.green),
      _r(-5,  4, 10, 2, c.green),
      _r(-3, -4,  6, 8, c.bgDeep),
      _r(-2, -1,  4, 2, c.white),
      _r( 1, -2,  1, 1, c.white),
      _r( 2, -1,  1, 2, c.white),
      _r( 1,  1,  1, 1, c.white),
      _r(-4,  3,  1, 1, c.yellow),
      _r( 3,  3,  1, 1, c.yellow),
    ].join(''));
  },

  can(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-3, -7, 6, 1, c.silver),
      _r(-3, -6, 6, 1, c.silver),
      _r(-1, -7, 2, 1, c.silverDk),
      _r(-3, -5, 6, 11, c.crimson),
      _r( 2, -5, 1, 11, c.meatRed),
      _r(-3, -5, 1, 11, c.pink),
      _r(-3, -1, 6, 2, c.white),
      _r(-2,  0, 4, 1, c.crimson),
      _r(-3,  6, 6, 1, c.silverDk),
    ].join(''));
  },

  mailbox(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-1,  1, 2, 6, c.brownMid),
      _r(-6, -4, 12, 5, c.cyan),
      _r(-5, -5, 10, 1, c.cyan),
      _r(-3, -6,  6, 1, c.cyan),
      _r(-5, -3,  9, 3, c.bgDeep),
      _r(-4, -2,  7, 1, c.cyan),
      _r( 3, -2,  1, 1, c.gold),
      _r( 5, -5,  2, 3, c.crimson),
      _r( 5, -5,  1, 6, c.brownDark),
    ].join(''));
  },

  dollar(size) {
    const c = COLORS;
    return _svg('-8 -8 16 16', size, [
      _r(-5, -5, 10, 10, '#ffd23f40'),
      _r(-3, -5, 6, 2, c.gold),
      _r(-4, -4, 2, 2, c.gold),
      _r(-3, -2, 5, 2, c.gold),
      _r( 2,  0, 2, 2, c.gold),
      _r(-3,  2, 5, 2, c.gold),
      _r(-4,  3, 2, 1, c.gold),
      _r(-3,  5, 6, 1, c.gold),
      _r(-1, -6, 2, 13, c.gold),
      _r(-3,  4, 6, 1, c.goldDark),
      _r( 3, -4, 1, 1, c.white),
    ].join(''));
  },

};

// =============================================================================
// Optional convenience: list of all icon names for tooling / docs.
// =============================================================================
export const ICON_NAMES = Object.keys(drawIcon);
