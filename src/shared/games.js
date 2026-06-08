// =============================================================================
// GAMES REGISTRY — the single source of truth for the 15 BORKADE games.
// =============================================================================
//
// Before this file, the canonical list lived in THREE hand-maintained places:
//   1. the 15 hand-authored cards in index.html (~5.3k lines),
//   2. the `build.rollupOptions.input` map in vite.config.js,
//   3. implicit knowledge in tests / tooling.
// They drifted. This registry centralizes the facts so tooling (smoke tests,
// sitemap generation, "random game", next/prev navigation, the build input map)
// can derive from ONE array instead of re-listing games by hand.
//
//   import { GAMES, byId, gamePaths } from '.../shared/games.js';
//
// `path` is the site-absolute URL used by the hub cards (leading slash, matches
// index.html). `viteKey` is the rollup input name in vite.config.js. `category`
// matches the hub filter tabs (action/horror/stealth/defense/driving/platform/
// mining/puzzle/management). `engine` documents the renderer for smoke-test
// tuning (canvas vs webgl boot timing).
// =============================================================================

export const GAMES = [
  { id: 'bork-battle',     viteKey: 'borkBattle',     title: 'BORK BATTLE',            category: 'action',     engine: 'pixi',  path: '/games/bork-battle/index.html',     blurb: 'Meme pugs. Custom karts. Shrinking neon arena. Last dog wins.' },
  { id: 'pugfort',         viteKey: 'pugfort',        title: 'PUGFORT.EXE',            category: 'defense',    engine: 'canvas',path: '/games/pugfort/index.html',         blurb: 'Night defense. Blood moon. Hold the wall against the horde.' },
  { id: 'pug-heist',       viteKey: 'pugHeist',       title: 'PUG HEIST SOCIETY',      category: 'stealth',    engine: 'canvas',path: '/games/pug-heist/index.html',       blurb: 'Stealth pugs. Vision cones. Forbidden cheese. Distract, sneak, grab.' },
  { id: 'pug-cafe',        viteKey: 'pugCafe',        title: 'PUG CAFÉ PANIC',         category: 'management', engine: 'canvas',path: '/games/pug-cafe/index.html',        blurb: 'Chaos kitchen. Bacon pupcakes. Slime lattes. Chain orders for tips.' },
  { id: 'rocket-pug',      viteKey: 'rocketPug',      title: 'ROCKET PUG ARENA',       category: 'action',     engine: 'canvas',path: '/games/rocket-pug/index.html',      blurb: 'Toaster jetpacks. Sausage launchers. 4 bots, 1 winner.' },
  { id: 'dungeon-diggers', viteKey: 'dungeonDiggers', title: 'PUG DUNGEON DIGGERS',    category: 'mining',     engine: 'canvas',path: '/games/dungeon-diggers/index.html', blurb: 'Dig deeper. Upgrade your drill. Find the Cheese Caverns.' },
  { id: 'mutation-lab',    viteKey: 'mutationLab',    title: 'PUG MUTATION LAB',       category: 'puzzle',     engine: 'canvas',path: '/games/mutation-lab/index.html',    blurb: 'Fuse 3 ingredients. Get a cursed pug. Collect every abomination.' },
  { id: 'delivery-pugs',   viteKey: 'deliveryPugs',   title: 'APOCALYPSE DELIVERY PUGS',category: 'driving',    engine: 'canvas',path: '/games/delivery-pugs/index.html',   blurb: 'Race through the ruined city. Dodge zombies. Beat the clock.' },
  { id: 'pugzilla',        viteKey: 'pugzilla',       title: 'PUGZILLA RAMPAGE',       category: 'action',     engine: 'canvas',path: '/games/pugzilla/index.html',        blurb: 'Smash the city. Eat the tanks. Evolve into a megaform.' },
  { id: 'backrooms-pug',   viteKey: 'backroomsPug',   title: 'BACKROOMS OF PUG',       category: 'horror',     engine: 'canvas',path: '/games/backrooms-pug/index.html',   blurb: 'Endless yellow halls. Something hunts you. Walk silent. Don\'t get caught.' },
  { id: 'backrooms-3d',    viteKey: 'backrooms3d',    title: 'BACKROOMS 3D',           category: 'horror',     engine: 'three', path: '/games/backrooms-3d/index.html',    blurb: 'True first-person Three.js maze. Yellow corridors. Buzzing lights.' },
  { id: 'clown-forest',    viteKey: 'clownForest',    title: 'CLOWN IN THE FOREST',    category: 'horror',     engine: 'canvas',path: '/games/clown-forest/index.html',    blurb: 'Midnight forest. A killer clown hunts you. Find 5 items. Escape before dawn.' },
  { id: 'floor-lava',      viteKey: 'floorLava',      title: 'FLOOR IS LAVA',          category: 'platform',   engine: 'canvas',path: '/games/floor-lava/index.html',      blurb: 'Lava rising. Climb fast. Double-jump or burn.' },
  { id: 'supermarket-pug', viteKey: 'supermarketPug', title: 'SUPERMARKET PUG',        category: 'stealth',    engine: 'canvas',path: '/games/supermarket-pug/index.html', blurb: 'Grab the loot. Dodge security. Cart-escape with the biggest haul.' },
  { id: 'pug-td',          viteKey: 'pugTd',          title: 'PUG TOWER DEFENSE',      category: 'defense',    engine: 'canvas',path: '/games/pug-td/index.html',          blurb: 'Build towers. 15 waves. Defend the biscuit vault.' },
];

// Lookup by id (slug).
const _byId = Object.fromEntries(GAMES.map((g) => [g.id, g]));
export function byId(id) { return _byId[id] || null; }

// All site-absolute paths (useful for smoke tests / sitemap).
export function gamePaths() { return GAMES.map((g) => g.path); }

// All game ids (slugs).
export function gameIds() { return GAMES.map((g) => g.id); }

// Detect the current game id from the URL, e.g. on a game page.
export function currentGameId() {
  if (typeof location === 'undefined') return null;
  const m = location.pathname.match(/\/games\/([^/]+)\//);
  return m ? m[1] : null;
}

// Next / previous game (wraps), for in-game "next game" shortcuts.
export function nextGame(id) {
  const i = GAMES.findIndex((g) => g.id === id);
  return i < 0 ? GAMES[0] : GAMES[(i + 1) % GAMES.length];
}
export function prevGame(id) {
  const i = GAMES.findIndex((g) => g.id === id);
  return i < 0 ? GAMES[0] : GAMES[(i - 1 + GAMES.length) % GAMES.length];
}

// A deterministic "game of the day" — same pick worldwide per UTC date. Pass a
// makeRng/dailySeed from rng.js if you want to combine; kept dependency-free here.
export function gameOfTheDay(date = new Date()) {
  const ymd = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < ymd.length; i++) { h ^= ymd.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return GAMES[(h >>> 0) % GAMES.length];
}
