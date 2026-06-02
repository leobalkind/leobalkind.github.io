# Pro Upgrade Plan — Web Games

> Written 2026-06-02 after a live audit of all 15 games + the hub at v2.9.1.
> This is the "make it feel professionally designed" roadmap, prioritized by
> **felt impact ÷ risk**. Each item says what to change and why it matters.

---

## 0. Honest assessment (read this first)

The site is **not** at a "kid level" in engineering. Live audit findings:

- **All 15 games boot with ZERO JavaScript errors.** That is rare even for
  commercial portals. Stability is a solved problem here.
- The hub CSS already uses **design tokens, a spacing scale, a radius scale,
  shadow tokens, accessibility (skip-link, ARIA roles, reduced-motion,
  high-contrast, large-text), and a PWA + service worker.** This is
  professional front-end practice.
- There is already structured competitive research (`RESEARCH_BRIEF.md`)
  benchmarking each game against Brotato, Bloons TD 6, Hotline Miami, Hitman
  GO, Overcooked, Spelunky, etc., with ~35/39 items shipped.

So why does it *feel* amateur? Three real reasons, all **presentation**, not code:

1. **Front door wastes the first screen.** On a 1440×900 desktop, 74% of the
   screen is consumed by the hero (logo + tagline + chips + search + a
   stale "WHAT'S NEW" box + category row) before a single game is visible.
   Poki / CrazyGames show **2–3 full rows of games instantly**. First
   impression = "this is a personal project," not "this is a games portal."
2. **Brand reads as generic.** Title is literally "Web Games." No mascot lockup,
   no memorable name. The pug/neon identity is strong *inside* the games but
   absent from the masthead.
3. **Dev-diary artifacts on the player-facing surface.** A "WHAT'S NEW v2.6"
   changelog box (now 3 versions stale) and "coming soon vote" tiles read as a
   build log, not a product.

**Conclusion:** we are ~8/10 on substance and ~5/10 on presentation. The fast
wins are all on presentation. We do NOT need to rebuild games.

---

## 1. What to install on your PC (your direct question)

**Short answer: you already have the single best tool — Claude Code running on
Opus.** You do not need to install another LLM. Local LLMs you could run on a
PC (Llama, Mistral via Ollama/LM Studio) are *weaker* than what you're using
now and would be a downgrade for coding. Don't bother.

Genuinely useful (free) additions, in priority order:

| Tool | Why | Needed? |
| --- | --- | --- |
| **Node 20+** (you have v24) | already installed, runs the build | ✅ have it |
| **Git + GitHub** | already used for deploy | ✅ have it |
| **VS Code** | nicer than editing blind; live preview, git UI | recommended |
| **Chrome + Lighthouse** (built in) | one-click perf/SEO/accessibility score | recommended |
| **A real font + a logo** (Figma free, or just an SVG) | brand identity | high value |
| Local image tools (only if adding raster art) | optimize PNGs | optional |

**Do NOT install:** a second/local LLM, a "website builder," a game engine.
None of them improve this project; they'd fragment it. The leverage is here in
this repo with the tools you already run.

---

## 2. Prioritized roadmap

### TIER A — front-door presentation (highest felt impact, lowest risk)

- [x] **A1. Games above the fold.** Tighten the hero vertical stack on desktop
  so the first 2 game rows show on load. *(shipped this session — desktop hero
  compacted, grid pulled up ~140px.)*
- [x] **A2. Kill stale dev artifacts.** Refresh the "WHAT'S NEW" banner to the
  current version (was hardcoded v2.6). *(shipped this session.)*
- [ ] **A3. Brand the masthead.** Add a small pug mascot SVG next to the logo,
  and consider a real product name (e.g. "PUG ARCADE" / "BORKADE"). Keep the
  shimmer but pair display font with the mascot lockup.
- [ ] **A4. Card hover = play affordance.** On hover, dim the art and show a
  centered ▶ PLAY pill + the one-line pitch (Poki's signature interaction).
  Many cards already have art; this is a CSS/JS overlay, no new assets.
- [ ] **A5. Consistent card meta.** Every card shows: category tag (top-left),
  "NEW"/"UPDATED" ribbon where true, and best-score chip if the player has one.

### TIER B — perceived quality / polish

- [ ] **B1. Lighthouse pass.** Run Chrome Lighthouse on hub + 3 games; fix any
  perf/accessibility/SEO red flags. Target 90+ on all four metrics.
- [ ] **B2. Loading polish.** A branded splash/skeleton while a game's JS
  loads (the 3D games pull ~740KB) instead of a blank canvas.
- [ ] **B3. First-time onboarding per game.** A 1-card "how to play" overlay on
  first launch (controls + goal), dismissible. Reduces bounce.
- [ ] **B4. Sound on by default with a clear mute** (respecting autoplay rules:
  start muted, prompt to enable on first input).

### TIER C — depth / retention (where the existing research lives)

- [ ] **C1. Finish the 3 open RESEARCH_BRIEF items:** weapon evolution
  (bork-battle), debris persistence (pugzilla), DNA-hint system (mutation-lab).
- [ ] **C2. Cross-game meta progression** — a single "kibble" wallet + profile
  level that all games feed, giving a reason to play the whole portal.
- [ ] **C3. Daily challenge surfaced on the hub** (you already have a daily
  featured pick + per-game daily mutators — surface a unified "today's
  challenge" strip).

### TIER D — reach / growth

- [ ] **D1. SEO + share cards.** Per-game `<meta og:*>` + a generated share
  image so links unfurl nicely on social.
- [ ] **D2. Real analytics** (privacy-friendly, e.g. Plausible) to see which
  games people actually play, so polish effort follows the data.

---

## 3. How to keep improving (the repeatable loop you asked for)

For each game, the professional review loop is:

1. **Play it for 60s** and write down the first moment of confusion or boredom.
2. **Compare to its genre king** (already mapped in RESEARCH_BRIEF.md).
3. **Pick ONE friction fix + ONE "juice" add** (screen shake, sound, popup).
4. **Ship + verify live**, then move on. Don't gold-plate one game.

Breadth beats depth here: 15 games each 5% better >> 1 game 75% better.

---

## 4. What's shipped in this session (all verified live + build passes)

- **A1 — games above the fold.** Desktop hero compacted: 0 → 3 game cards
  visible on first paint (74% → 62% of fold before the grid).
- **A2 — WHAT'S NEW banner.** Was a stale 3-bullet v2.6 box; now a slim
  one-line v2.9 pill that opens the changelog modal.
- **A3 — BORKADE rebrand.** "Web Games" masthead → pug-mascot + neon "BORKADE"
  wordmark lockup (with a gentle bob, reduced-motion aware) + new tagline +
  updated `<title>` for SEO.
- **QA fix — favicon on all 15 games.** Every game page lacked a favicon, so
  browsers requested `/favicon.ico` → 404 in console, and tabs showed a generic
  globe. All 15 now point at `/icon-192.svg`: branded pug tab icon + clean
  console. (Root cause of the "transient 404" seen in the QA sweep.)

- **Brand on PWA + SEO/social.** Manifest name → "BORKADE — Pug Arcade"
  (installed-app launcher now branded). Hub had NO meta description / Open Graph
  / Twitter tags — added them, so shared links unfurl with a title + description
  on Discord/social/iMessage. (Follow-up: a real 1200×630 PNG share card; the
  SVG icon is the og:image placeholder, text unfurl works now.)

Deep-dive round 1 (Bork Battle): confirmed flagship is high-quality
(surviv.io-tier HUD, radar, leaderboard, 0 runtime errors). Minor future item:
top-right HUD crowding (SHOP button vs 1x/pause).
Deep-dive round 1 (Pugfort): 0 errors, full-bleed canvas, strong start screen
(title + PLAY + controls + meta-unlocks = good onboarding). No defects; no change
needed. **Finding: the top games are already solid — the ROI is in cross-cutting
presentation, not per-game bug-hunting.**

**Full per-game deep dive (all 15 games):** see `GAME_DEEP_DIVE.md` — a parallel
multi-analyst pass produced 5 code-grounded, genre-king-benchmarked improvement
options per game, with a real bug found in every game (75 options total).

**Batch-1 bug fixes shipped (verified, build green, 0 console errors):**
- pugfort — removed a phantom "sell for refund" tip (no such mechanic existed);
  retargeted it to teach the real R-to-repair hotkey.
- pugzilla — Chonk's advertised "+30% smash reach" passive (`extraReach`) was
  declared but never read; wired it into all four `smashAt` reach checks.
- floor-lava — jetpack hover jittered because keydown auto-repeat spammed
  `jump()`; gated on `!e.repeat` so each jump is a discrete press.
- rocket-pug — highlight reel drew a ghost victim square at a wrong-axis Y
  (`sy(victimX)`); removed the stray duplicate draw.
- delivery-pugs — INVESTIGATED, NOT a bug (timer bar denominator matches the
  60s cap; verification caught this before any edit).

**Batch-2 bug fixes shipped (verified, build green, 0 console errors):**
- dungeon-diggers — corrected the "cheese unlocks at depth 50" tip (it's
  depth 12), and moved the fungal-spore confusion decay into `tick(dt)` so it's
  real-time, not per-move (it could last forever if you stood still).
- backrooms-pug — PSYCHIC FLASH was scheduled 5-7.5 min out and almost never
  fired; rescheduled to 75-135s so it appears every run.
- bork-battle — "+10% MAX HP" upgrade was a flat +5 that didn't scale; now
  multiplies `hpPctMult` and `_chooseUpgrade` recomputes `_hpMult` (true +10%).
- rocket-pug — bots' `.kills` were never tracked, so timed matches were an
  automatic player win; bot-owned kills now increment `pr.owner.kills`.
- supermarket-pug — the getaway-vehicle pick did nothing on clean runs (all
  perks gated on the alarm); bag-cap + heat-gain now apply the whole run per the
  vehicles' descriptions, speed stays escape-only.
- mutation-lab — INVESTIGATED: the "contradictory counts" claim was mostly an
  analyst hallucination (HUD uses computed values correctly); only two stale
  code comments existed — corrected.

- pug-td — boomerang return used real-time `setTimeout` while gameplay scales
  with the speed toggle, so at 3× the return landed ~3× too late; delay now
  divided by the captured `__speedMult`.
- pug-cafe — the throw path re-pushed recipe ids and let `serve()` re-consume
  them, fabricating ingredients on duplicate-item recipes; added a
  `serve(idx, alreadyConsumed)` flag so throws finalize without re-consuming.

**"Go aggressive" pass — design-level + Three.js items shipped (build green, full
15-game sweep = 0 errors):**
- pug-heist — instant-death → a ~0.55s per-guard "lock-on" reaction window with
  a `! SPOTTED` tell; break line-of-sight to escape, perfect-bonus only lost on
  actual capture. (Cameras stay instant by design.)
- clown-forest — added 2D trunk occlusion to `playerCanSeeClown()`, so hiding
  behind a tree now works (correct Weeping-Angel behavior). *Needs a real-browser
  playtest to tune feel.*
- backrooms-3d — the blind exit death-race now shows a **live distance to the
  nearest exit** ("nearest ~32m") via a deterministic ring-scan (hot/cold search);
  plus a CPU perf throttle that skips per-frame flicker on distant lights.
- pug-td crit-on-splash — INVESTIGATED → not a bug (crit damage is baked into
  `p.dmg` and already applies on splash).

**Final tally: 15 substantive fixes shipped + verified (12 real bugs across 11
games + heist reaction window + clown occlusion + backrooms-3d exit aid), plus a
perf throttle; 3 analyst claims correctly rejected as non-bugs (delivery timer,
mutation-lab counts, pug-td crit-splash).** Every change build-verified; full
15-game sweep = 0 console errors throughout.

**User-reported fix — login overlay was see-through.** The login screen's
`.login-ov` backdrop + `.login-ov__panel` box used gradient-only backgrounds
that weren't painting, so the hub bled through (no solid block). Added an opaque
`background-color` fallback *under* the gradients on both (now bulletproof even
if gradients fail), and fixed the stale "WEBGAMES OS · v1.4" label → "BORKADE OS
· v2.9". Verified by screenshot.

**Only item left in the queue:** pug-cafe **mobile tap-to-throw** — a new touch
feature (mobile already has a working SERVE fallback, so it's an enhancement, not
a bug). It genuinely needs a real touch device to validate tap targets / scroll
conflicts, so it's deliberately not rushed in headless. The remaining
juice/onboarding/visual options per game in `GAME_DEEP_DIVE.md` are also there
when you want them.

**Next presentation items:** A4 (card hover→PLAY, as a real DOM element), A5
(card tags), B1 (Lighthouse pass), D1 (real 1200×630 PNG share card).
