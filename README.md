# web-games

A pixel-art browser-game hub featuring 15 original pug-themed games. No
accounts, no installs, no ads. Deployed to GitHub Pages at
<https://leobalkind.github.io>.

Local-first by design — every score, achievement and discovery lives in your
browser's `localStorage`. Optional Supabase cloud sync is feature-flagged off
(see `SUPABASE_SETUP.md`).

## The Games (15)

| Game | Hub category | One-liner |
| --- | --- | --- |
| **BORK BATTLE** | action | Top-down arena battle royale, 30 bots, 17 hat cosmetics, daily mutator, MAYHEM mode. |
| **PUGFORT.EXE** | strategy | Night-by-night base defense, persistent TECH TREE (RP currency), boss waves, 3 maps. |
| **PUG HEIST SOCIETY** | stealth | Multi-floor stealth thief with cones, vents, lasers, safes, 5 themes (museum / bank / mansion / office / airport) and CONTRACTS objectives. |
| **PUG CAFÉ PANIC** | time-management | Diner-Dash time-management, throw mechanic, color-chain bonuses, STAFF ROSTER. |
| **ROCKET PUG ARENA** | action | Arena shooter with rocket-jumps, BFG, CTF/KOTH/Deathmatch modes, WEAPON MASTERY, best-of-5 series. |
| **PUG DUNGEON DIGGERS** | roguelite | Digger with 5 biomes, ROCK GOLEMs, MASTERY perks, war-dog companion, TREASURE MAP item, GIANT GROUND PUG boss. |
| **PUG MUTATION LAB** | puzzle | Little-Alchemy-style ingredient discovery, 69 species across 5 tiers, FUSION CHAINS, EVOLUTION TREE modal. |
| **APOCALYPSE DELIVERY PUGS** | driving | Top-down WASD delivery driving with 5 cargo types, weather, DRIFT MASTER chains, ROUTES system. |
| **PUGZILLA RAMPAGE** | destruction | Kaiju destruction sandbox, 3 forms, RAMPAGE METER, NUCLEAR REACTOR hazard, TARGET PRIORITY HUD. |
| **BACKROOMS OF PUG** | horror | Top-down liminal-horror with 7 archetypes, 60 lore notes, PSYCHIC FLASH, 8+ monster types. |
| **BACKROOMS 3D** | horror | First-person Three.js conversion. 4 levels (LOBBY/WAREHOUSE/PIPES/VOID), 3 monster archetypes, hide-in-closet, EXIT door win. |
| **CLOWN IN THE FOREST** | realistic horror | Slender-style first-person dread. 4-state clown AI, find 5 items, 3 difficulties, 4 endings (ESCAPE/TRUE/TRAGIC/DEFIANT). |
| **FLOOR IS LAVA** | platformer | Vertical climber, 5 biomes (incl. ABYSS gentle-buoyancy), TELEPORTER pads, WIND CURRENT enemy, BIOME CHALLENGES. |
| **SUPERMARKET PUG** | stealth | Steal groceries past guards. 3 maps, 5 sections (incl. BAKERY), GETAWAY VEHICLE choice. |
| **PUG TOWER DEFENSE** | strategy | 10 tower types w/ 2-path upgrade tree, 9 maps, BANNER tower synergies, WAVE MODIFIER system. |

## Tech Stack

- **Build:** [Vite 5](https://vitejs.dev/) with multi-page rollup config
  (one HTML entry per game, lazy-loaded)
- **2D games:** Plain Canvas2D, hand-rolled — no Pixi runtime in the active
  games (PixiJS is in the dep tree only for legacy/experimental use)
- **3D games:** [Three.js r184](https://threejs.org/) — used by
  `backrooms-3d` and `clown-forest`, shared chunk (~740KB lazy-loaded only
  on entering those games; hub stays small)
- **Cloud sync (optional):**
  [@supabase/supabase-js](https://github.com/supabase/supabase-js) v2 —
  feature-flagged off by default. SDK loads lazily (only after the user
  clicks Sign In)
- **PWA:** static `manifest.webmanifest` + service worker in `public/sw.js`,
  4 icon sizes, per-game shortcuts to 3 most-played
- **Mobile:** shared touch controls module
  (`src/touch/touchControls.js`) — joystick + 6 layouts per game,
  safe-area aware (iOS notch), auto-orientation, haptic feedback API
- **Deployment:** GitHub Pages via Actions
  (`.github/workflows/deploy.yml`) — `npm ci && npm run build`, then
  publishes `dist/` on every push to `main`

## Local Development

Requires Node 20+ (CI runs on Node 20).

```bash
npm install
npm run dev      # vite dev server on http://localhost:5173 (auto-opens)
npm run build    # production build into ./dist
npm run preview  # serve the production build locally
```

The dev server's `allowedHosts: true` permits public tunneling via
`cloudflared` / `ngrok` for mobile testing.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`:

1. Checks out the repo
2. `npm ci` (strict-mode install from `package-lock.json`)
3. `npm run build` produces `dist/` with one HTML per game
4. `actions/upload-pages-artifact` packages `dist/`
5. `actions/deploy-pages` publishes to GitHub Pages

The repo is a **user page** (`leobalkind.github.io`) so Vite's `base` is
`'/'`. To deploy under a sub-path, set `VITE_BASE=/your-prefix/ npm run build`.

## Project Layout

```
games/                       — one folder per game (index.html + main.js + style.css + audio.js)
  bork-battle/src/           — bork-battle is the only modular game; the
                               rest are single-file main.js
src/
  config.js                  — Supabase URL/anon-key (blank = local mode)
  hub/login.js               — cinematic login w/ profile picker + PIN + guest
  shared/                    — cross-game modules:
    achievements.js          — shared achievement system w/ persistence
    cloudSync.js             — lazy-loaded Supabase wrapper
    depth3D.js               — pseudo-3D shadows + parallax horizons
    gradeCard.js             — S/A/B/C end-of-run grade with breakdown
    killFeed.js              — scrolling event ticker
    mobileControls.js        — unified touch UI (joystick + buttons)
    musicTrack.js            — procedural BG music in 4 moods
    pugSprite.js             — shared pug drawer w/ accessories
    settingsMenu.js          — gear modal: music/SFX sliders, mute, FPS,
                               CRT mode, high-contrast, reduced-motion,
                               shake intensity
    speedToggle.js           — 1× / 2× / 3× game-time toggle
    wavePreview.js           — incoming-enemy banner module
    visualPolish.js          — hit-pause, shockwaves, ragdoll helpers
  persistence/highScores.js  — localStorage scores with profile scoping
  gamepad/gamepad.js         — XInput / Standard gamepad mapping
  touch/touchControls.js     — low-level pointer plumbing
public/                      — favicon, PWA manifest, service worker, icons
docs/                        — design notes (characters, map, wishlist)
.github/workflows/deploy.yml — CI build + Pages deploy
vite.config.js               — 15 HTML entries, multi-page setup
```

## Documentation Index

- **[RESEARCH_BRIEF.md](./RESEARCH_BRIEF.md)** — the original 13-game audit
  against indie/mobile reference titles (Brotato, Bloons TD, Hotline Miami,
  Hitman GO, etc.). Each item now tagged with `STATUS: COMPLETED IN vX.Y`.
- **[IMPROVEMENT_LIST_300.md](./IMPROVEMENT_LIST_300.md)** — atomized
  300-item backlog with per-item `[DONE vX.Y]` tags showing what shipped in
  the v2.0 → v2.3 wave (~110/300 complete).
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** — opt-in cloud sync guide
  (free Supabase project, schema SQL, RLS policies).
- **[docs/wishlist.md](./docs/wishlist.md)** /
  **[docs/wishlist-per-game.md](./docs/wishlist-per-game.md)** — 4000-item
  forward roadmap (older, less current than IMPROVEMENT_LIST_300).
- **[docs/design/](./docs/design/)** — character / map / hub design notes.

## Versioning

Current version: **v2.3** (see in-hub `WHAT'S NEW` modal for full changelog).
Milestone arc:

- v0.1–0.8 — initial prototypes (cleared in v0.8 reset)
- v0.9–v1.1 — first 13 original games shipped
- v1.2–v1.4 — depth + polish + shared utilities
- v1.5.x — 5-round MEGA POLISH series
- v1.6 — BACKROOMS HORROR OVERHAUL (4 parallel agents)
- v1.7 / v1.7.1 / v1.7.2 — 3D-DEPTH wave + extended polish wave
- v1.8 — Wave X2 + NEW GAME: BACKROOMS 3D (Three.js)
- v1.9 — NEW GAME: CLOWN IN THE FOREST (Three.js, realistic horror)
- v2.0 — CLOWN-FOREST mega-polish (5 agents) + sprite quality
- v2.1 — sprite quality across remaining 9 games + clown-forest bug-hunt
- v2.2 — perf + backrooms-3d round 2 + cross-game polish
- v2.3 — deep systems wave + hub UX final + 1 new mechanic per game

## License & Contact

Personal hobby project — no license attached. For bug reports or feedback,
email <info@sodaworld.tv>.
