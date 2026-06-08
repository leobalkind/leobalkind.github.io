# BORKADE — Big-League Research & Full Improvement List

> Written 2026-06-08. A deep competitive + attention-science + game-feel research
> pass: **how BORKADE compares to the big game portals and apps, where people
> actually look, what makes it more appealing, what makes the games fun**, and a
> full prioritized list of what to improve.
>
> Method: 6 parallel research deep-dives across **Poki, CrazyGames, itch.io,
> Newgrounds, Kongregate, Armor Games, Coolmath, Miniclip, Y8, AddictingGames,
> Lagged, GameSnacks/GameDistribution**, the **App Store / Google Play + top
> mobile games** (Subway Surfers, Candy Crush, Duolingo, Clash Royale, Wordle),
> and the canonical **UX attention science** (Nielsen Norman Group, Baymard,
> Stanford, Laws of UX, WCAG) + **game-feel literature** (Swink's *Game Feel*,
> Nijman's *Art of Screenshake*, Jonasson/Purho's *Juice it or Lose it*).
> Builds on — does not repeat — `PRO_UPGRADE_PLAN.md`, `RESEARCH_BRIEF.md`,
> `GAME_DEEP_DIVE.md`, `IMPROVEMENT_LIST_300.md`.

---

## 0. TL;DR — the 7 biggest needle-movers

If only seven things get done, do these (each is fully achievable on a static
no-backend site, in priority order of **felt impact ÷ effort**):

1. **Kill the on-load profile/onboarding gate.** The live hub opens with a
   "WELCOME · PICK A PROFILE" modal (and a first-visit onboarding modal auto-opens
   at `index.html:3865`) on top of an **empty dark hero**. *Poki and CrazyGames
   never gate play.* Land straight on a grid of games. This is the single largest
   gap vs every leader, and it's mostly deletion + CSS.
2. **Get a real row of games above the fold + a clear "Start here."** ~57% of
   attention is above the fold; the first row decides whether the rest is ever
   seen. Compress the header, surface a Featured / Most-Played strip.
3. **A daily habit loop: date-seeded "Daily Pug Challenge" + streak + Wordle-style
   shareable result.** This is the highest-ROI retention + virality mechanic that
   works with zero backend (localStorage + date seed). Nothing currently pulls a
   player back tomorrow.
4. **Cross-game meta-progression: one "kibble/bones" wallet + profile level +
   achievement wall.** Newgrounds/Kongregate prove site-wide XP is the retention
   engine. Gives a reason to play the *whole* arcade.
5. **A universal juice pass across all 15 games** (hit-stop, screen shake + camera
   kick, squash & stretch, particles, run-end score-breakdown celebration). The
   cheapest way to make every game feel "pro." Already started in pug-heist.
6. **Real per-game pages + "You'll also like" rail + the "unblocked at school"
   SEO channel.** Turns dead-end launches into loops and opens the biggest free
   traffic source for a teen audience.
7. **Lean hard into the genuine differentiator: "No ads. No tracking. Instant.
   100% original pug."** Every casual portal is ad-saturated (some with
   behavioral ads on kids). This is a real, ownable premium identity — say it loud.

---

## STATUS — what's shipped (updated 2026-06-08)

**✅ Shipped & live (front-door P0 tier, verified in-browser):**
- **P0-1** — killed the on-load gate. New visitors land straight on the game grid
  (silent guest; login still reachable via the GUEST chip). Onboarding tip modal
  no longer auto-opens (reachable via "?"/help).
- **P0-2** — first game row above the fold (cut the 80px hero top-padding). At
  1440×900: hero + Featured banner + full first card row on first paint.
- **P0-3 / P0-5** — fixed card-title self-overlap (Press Start 2P line-height).
- **P0-4** — removed both "coming soon" dev tiles from the grid.
- **P0-7** — lightened `--muted` to clear WCAG AA.
- **P6-7** — hero now leads with the differentiator ("no ads · no tracking ·
  instant"; chips "FREE · NO ADS" / "NO TRACKING").

**🟡 Already existed in code (the research agents couldn't see the repo, so they
over-estimated the gaps — DON'T rebuild these):**
- **Hover PLAY pill** (`.card__play` / `.card__play-btn`, injected DOM) → P0-8 / A4 done.
- **Card status badges** — NEW / 3D / HORROR / REALISTIC tag chips (`.card__tag`),
  plus per-card **BEST: N** high-score badges → most of P1-5 done.
- **Recently-played** "RECENT:" pill below the search (`wg:recent`) → P1-1 (lite) done.
- **Daily-login streak** (`wg:streak`, DAY-N / "Welcome back!" toasts) → P2-3/P2-9 partly.
- **Featured game of the day** — deterministic UTC-date pick (`#hub-featured`,
  now visible since the gate's gone) → P2-1 (foundation) done.
- **Most-played sort** (`wg:plays:*`), search, category tabs, count toolbar.
- **Achievements + stats** (`wg:ach:*`, stats modal: "PLAYED N / 🏆 N ACHIEVEMENTS")
  → P2-6 (foundation) done.
- **Full share modal** — copy-link / native Web Share / tweet, per-game → P2-2
  (foundation) done; missing only the Wordle-style *daily result* card.
- **Shared juice modules** in `src/shared/`: `screenShake.js`, `particleBurst.js`,
  `animations.js`, `visualPolish.js`, `gradeCard.js`, `killFeed.js`,
  `wavePreview.js`, `tutorialTip.js` → P5 *infrastructure* exists; the work is an
  audit that each game USES them, not building from scratch.

**So the genuine remaining net-new work is narrower than P1–P6 implied:** (a) a real
*scored* Daily Challenge + Wordle-style shareable result; (b) a single cross-game
**profile LEVEL** aggregating the existing achievements/plays; (c) per-game SEO
landing pages; (d) a per-game **juice audit** (use the existing shared modules
everywhere). These are design-sensitive / large / multi-session.

**▶️ Next up (not yet done):** P0-8 hover PLAY pill · P1 discovery rails
(recently-played / most-played / recommended) + facet chips + badges · P2-1/P2-2
real daily challenge + Wordle-style share · P2-4..6 cross-game XP/level +
achievement wall · P3 per-game pages + "unblocked" SEO · P4 ratings/play-counts ·
P5 arcade-wide juice pass · P6 PWA install prompt + loading splash.

---

## 1. Honest gap analysis — BORKADE vs the big leagues

BORKADE's *engineering* is strong (15 original games, 0 console errors, design
tokens, a11y, PWA). The gaps are **front-door presentation, discovery, retention
loops, and per-game framing** — exactly what the big sites invest in.

| Dimension | Big portals / apps do | BORKADE today | Gap |
| --- | --- | --- | --- |
| **First load** | Instant grid of games; account always optional | Profile-gate + onboarding modal over an empty dark hero | 🔴 Critical |
| **Above the fold** | 2–3 rows of games on arrival | Hero/modal pushes first row down | 🔴 Critical |
| **Visual hierarchy** | 1–2 hero tiles + curated "Start here" | 15 equal-weight cards, all neon-glowing | 🟠 High |
| **Thumbnails** | Fixed aspect, 1 focal char, no baked text, hover-animate | Pixel mini-scenes; some title/desc **overlap bugs** | 🟠 High |
| **Discovery** | Recently-played, Recommended, Featured, Fresh, Most-Played rails; facet chips (2P, .io, quick) | Category tabs + search + sort only | 🟠 High |
| **Badges** | Data-driven NEW / HOT / TOP / TRENDING | Some static badges; lingering "coming soon" tiles | 🟡 Med |
| **Retention loop** | Daily streak, daily challenge, quests, season pass | None — nothing returns you tomorrow | 🔴 Critical |
| **Meta-progression** | Site-wide XP / level / badges / collections | Per-game scores only; no cross-game layer | 🟠 High |
| **Social proof** | Ratings + vote counts, play counts, "X M players", staff pick | None surfaced on the hub | 🟡 Med |
| **Per-game page** | Banner, how-to-play, tips, FAQ, rating, related rail | Launches straight into the game (no framing) | 🟠 High |
| **Virality** | Wordle-style shareable result; invite loops | None | 🟠 High |
| **Game feel** | Heavy juice (shake, hit-stop, particles, win celebration) | Inconsistent across the 15 | 🟠 High |
| **Loading** | Branded themed splash + skeletons (a conversion lever) | Blank/black starts (just fixed one crash) | 🟡 Med |
| **PWA / install** | "Get" / home-screen icon = top retention surface | Manifest exists; no install prompt after a win | 🟡 Med |
| **SEO** | Rich per-game landing pages; "unblocked" keyword channel | Single hub page | 🟠 High |
| **Ads/trust** | Ad-saturated (some behavioral on minors) | **None — a real differentiator, under-sold** | 🟢 Our edge |
| **Originality** | Mostly licensed/embedded HTML5 games | **100% original pug games** | 🟢 Our edge |

---

## 2. Where do people look? (attention science → what we're violating)

Research-backed answers to the owner's literal question.

**The facts (sources in §9):**
- **Scanning, not reading.** Eyes hit headings/anchors; the *card title* is the
  "heading" of each tile (NN/G layer-cake pattern). Weak hierarchy → wasteful
  F-pattern; the Z/Gutenberg sweep governs the sparse header/hero zone.
- **Faces & gaze pull the eye**, and people *look where a face looks* — a pug face
  with eyes angled toward the title/CTA is a free attention director.
- **Motion is a preattentive magnet** — great on *one* focal element, a distraction
  when everything glows/drifts.
- **Above the fold carries ~57% of viewing time** (74% within two screenfuls). The
  100px above the fold gets ~102% more views than the 100px below. People scroll
  **only if the first screen is promising.**
- **50ms to form an opinion** (Lindgaard) → a halo over everything after. Stanford:
  a "clean professional look" is the #1 credibility factor.
- **Choice overload** (Hick's Law; Iyengar jam study: 6 options → ~10× more action
  than 24). Curate; don't dump 15 equal cards + sort + search + 10 chips at once.
- **Fitts's Law:** big, close, whole-card click targets; ≥44px taps.
- **WCAG AA contrast 4.5:1** (normal text). Pure-black + saturated neon "vibrates"
  — use ~`#121212` base, reserve hot neon for accents/glows, not body text.

**What BORKADE is likely violating (code-grounded):**
- On-load onboarding modal over the grid (`index.html:3865`) — burns the 50ms
  first impression and the most attention-rich space.
- Tall header stack (logo + tagline + 3 chips + search + **10 category tabs** +
  sort/count) pushes the first card row below the fold.
- 15 equal-weight cards + chips + sort + search = choice overload, no "start here."
- Neon-on-everything flattens hierarchy ("if everything is contrasted, nothing
  stands out" — keep ≤3 contrast levels per view).
- **Card titles in `Press Start 2P` at 0.95rem** — dense, fails the small-size
  read; it's the layer-cake heading, so it must be legible.
- `--muted: #8a90b1` helper text is borderline vs AA on the dark bg.
- Pure-dark base (`#0a0716`/`#050310`) + saturated neon invites eye fatigue.
- CTA is a text link ("Sneak →") not a filled button (whole card *is* clickable,
  which helps Fitts's Law — but the affordance reads weaker).
- **Visible bug:** card title overlaps description on several tiles (PUG DUNGEON
  DIGGERS, APOCALYPSE DELIVERY PUGS, CLOWN IN THE FOREST) — and a "coming soon"
  dev tile remains. Both read as amateur in the first 50ms.

---

## 3. THE FULL IMPROVEMENT LIST (prioritized)

Each item: **What → Why → How (static-site feasible) → Effort** (S/M/L).
Grouped P0 (front door) → P6 (differentiator). This is the master backlog.

### P0 — First impression / front door (do first; mostly CSS/HTML)

- **P0-1. Remove the on-load gate.** Land on the game grid; make profile creation
  a dismissible "Save your progress?" badge, never a blocker. Persist a guest
  profile silently in `localStorage` on first earned score. *Why:* Poki/CrazyGames
  never gate; biggest single gap; 50ms first impression. *Effort:* S.
- **P0-2. First card row above the fold.** Compress header: collapse the 3 chips,
  make the 10 category tabs one horizontally-scrolling row, cut vertical padding.
  Target 2–4 tiles on first paint. *Effort:* M.
- **P0-3. Fix the card title/description overlap bug** on DUNGEON DIGGERS,
  DELIVERY PUGS, CLOWN IN THE FOREST (long titles collide with the pitch). *Why:*
  visible amateur tell. *Effort:* S.
- **P0-4. Kill the remaining "coming soon" / "more games" dev tiles** from the
  player surface (or move to an About/Roadmap). *Effort:* S.
- **P0-5. Readable card titles.** Keep `Press Start 2P` for the BORKADE logo only;
  use a clean condensed font (VT323 / system sans) for `.card__title`. *Effort:* S.
- **P0-6. Tame neon to ≤3 contrast levels per view**; one accent for primary CTAs;
  reserve glow for hover/featured. *Effort:* M.
- **P0-7. Fix contrast:** lighten `--muted` to clear 4.5:1; nudge base bg toward
  `#121212`-ish to stop neon vibration. *Effort:* S.
- **P0-8. Real Play affordance** (PRO_UPGRADE A4): on hover, dim art + centered
  ▶ PLAY pill + one-line pitch (Poki signature), as a real injected DOM element.
  Keep whole card clickable (Fitts). *Effort:* M.

### P1 — Discovery & navigation (turn a list into a portal)

- **P1-1. "Jump back in" / Recently-played rail** at the top, from localStorage.
  *Why:* highest-ROI personalization, fully offline. *Effort:* M.
- **P1-2. Curated "Featured / Start here" strip** (un-hide `#hub-featured`; rotate
  an editor pick) + a "Most Played this week" rail (local play counts). *Why:*
  beats choice overload; creates hierarchy. *Effort:* M.
- **P1-3. "More pug games like this" rail** (same-tag) on the hub + after each game.
  *Effort:* M.
- **P1-4. High-intent facet chips:** "2-Player", "Quick (60s)", "Hardcore /
  High-Score", "Chill", "New". *Why:* the discovery pattern teens expect; static.
  *Effort:* M.
- **P1-5. Data-driven badges:** `new:true` flag for recent titles; "HOT" flame for
  top-3 by local play count; "DAILY" on today's challenge game. *Effort:* S.
- **P1-6. Visual hierarchy in the grid:** 1–2 hero tiles larger/brighter, rest
  secondary, so the squint test reveals an entry point. *Effort:* M.
- **P1-7. Hover-to-animate tiles** for pixel art: swap to a 2–3-frame APNG/GIF or
  CSS sprite wiggle on `:hover` (no video pipeline). *Effort:* M.
- **P1-8. Standardize covers:** one aspect ratio (square suits pixel art), one
  centered pug in a dynamic pose, gaze pointed inward, **no baked-in text** (HTML
  title below stays crisp). *Effort:* L (art pass across 15).

### P2 — Retention loop (the "come back tomorrow" engine; all client-side)

- **P2-1. Date-seeded "Daily Pug Challenge."** One game + one seed per calendar
  day, identical for everyone (seed from the date). *Why:* Wordle/Daily-Dadish
  proven habit + fair comparison; #1 static retention mechanic. *Effort:* M.
- **P2-2. Wordle-style shareable result.** After the daily, copy a spoiler-free
  card to clipboard: `BORKADE Daily 🐶 #142 — 3/5 🦴🦴🦴 borkade…`. *Why:* free
  virality, meme/teen audience. *Effort:* S.
- **P2-3. localStorage daily streak with loss aversion** (flame counter, "Don't
  lose your N-day streak!") + a monthly **streak-freeze** auto-grant so one miss
  doesn't nuke it. *Why:* Duolingo's strongest retention driver. *Effort:* M.
- **P2-4. Cross-game XP + profile level.** Award arcade-wide XP for playing,
  beating PBs, and earning medals; pug-themed levels ("Lv 7 — Top Dog"). *Why:*
  Newgrounds/Kongregate retention engine; reason to play the whole portal.
  *Effort:* M.
- **P2-5. One "kibble/bones" wallet** all games feed → spend on **unlockable pug
  cosmetics** (hats/skins/colors) shared across the hub (Hades Mirror-style,
  anxiety-free respec). *Effort:* L.
- **P2-6. Achievement / "Bork Badges" wall** spanning all 15 games, with point
  values (easy/med/hard, à la Kongregate) and a few **secret** medals
  (Newgrounds). *Effort:* L.
- **P2-7. Daily quests** (2–3 rotating: "score 20 in Floor-Lava", "play 3 games")
  so a 5-minute visit feels complete. *Effort:* M.
- **P2-8. "Badge of the Day" / daily double-XP** game (date-seeded rotation).
  *Effort:* S.
- **P2-9. Comeback bonus** on return after ≥2 days ("Welcome back! 🦴"). *Effort:* S.
- **P2-10. Free monthly "season" track** (date-based) unlocking pug skins/badges
  via the daily challenge — battle-pass habit loop, no IAP. *Effort:* L.

### P3 — Per-game pages & SEO (free traffic + framing)

- **P3-1. A real per-game page/modal** for each of the 15: banner, 2–3
  screenshots/GIF, 1-paragraph blurb, **Controls**, **How to play**, 2–3 **tips**,
  a 3-Q **FAQ**, your-rating, your-best, and a "Play next" rail. *Why:* Coolmath's
  Run 3 page (rating + vote count + tips + FAQ) is the SEO + dwell-time engine.
  *Effort:* L.
- **P3-2. "You'll also like" rail** at the bottom of every game (3–4 hand-picked).
  *Effort:* M.
- **P3-3. SEO title pattern:** `[Game] — Play Free, No Ads | BORKADE`, plus per-game
  `<meta>` + Open Graph. *Effort:* M.
- **P3-4. Target "unblocked / play at school" intent.** Copy like "works on school
  Chromebooks, no download, loads instantly" + an unblocked-style landing page.
  *Why:* ~73% of students search games at school; biggest free teen channel.
  *Effort:* M.
- **P3-5. Real 1200×630 PNG share card** (PRO_UPGRADE D1) so links unfurl. *Effort:* S.

### P4 — Social proof & trust (make it feel legit)

- **P4-1. Local star ratings + believable aggregate.** Player rates 1–5 (stored
  locally as "Your rating"); seed a confidence-weighted baseline so cards show
  "★4.6". *Why:* itch.io's lesson — a weighted number reads trustworthy. *Effort:* M.
- **P4-2. Play counts** (local + seeded site-wide "12,403 plays") on cards.
  *Effort:* S.
- **P4-3. "Staff Pick" / "Featured" ribbon** (Editor's-Choice visual language).
  *Effort:* S.
- **P4-4. Rating/thumbs prompt only after a win** — never on load (Apple/ASO rule).
  *Effort:* S.
- **P4-5. Local favorites / "My Collection"** heart button → a Faves rail.
  *Effort:* M.

### P5 — Game feel / juice across all 15 (make each game "pro")

Apply the **JUICE & FUN CHECKLIST** (§4) to every game. Highest-impact, shared
helpers:

- **P5-1. Hit-stop / freeze-frame** (30–100ms) on big hits/grabs/kills/crashes
  (Nijman's "sleep" — single biggest lever). *Effort:* M (one shared helper).
- **P5-2. Screen shake + camera kick** scaled to event size. *Effort:* M.
- **P5-3. Squash & stretch + tweening/easing** on sprites & UI (no hard snaps).
  *Effort:* M.
- **P5-4. Particles + permanence** (fur tufts, dust, debris, scorch marks linger).
  *Effort:* M.
- **P5-5. Combo / score-multiplier with escalating audio pitch.** *Effort:* M.
- **P5-6. Run-end "score breakdown" celebration** (animated tally + new-best stamp
  + confetti + bass). *Effort:* M.
- **P5-7. First-win onboarding beat** per game: a guaranteed competence moment in
  the first ~15s, taught by doing, no text wall. *Effort:* M.
- **P5-8. Fairness/feedback audit:** clear hitboxes, telegraphed threats, instant
  input, "why did I die" always answerable. *Effort:* M.
- **P5-9. Vibration-API haptics** on hits/wins for mobile. *Effort:* S.
- **P5-10. One emergent funny mechanic per game** (ragdoll faceplants, absurd
  escalation) — humor is this brand's most ownable retention (see
  `feedback_game_design`). *Effort:* varies.

### P6 — Polish, mobile, PWA & the differentiator

- **P6-1. Themed pixel loading splash + skeleton tiles** instead of blank/black
  starts (a conversion lever per Poki). *Effort:* M.
- **P6-2. Install-as-PWA prompt** after a win ("Add BORKADE to your home screen") —
  the static-web "Get"; strongest retention surface. *Effort:* S.
- **P6-3. Sub-second-to-interactive as a brand promise** (GameSnacks bar: loading
  screen <1s, playable <15s, small initial payload) — *and say so.* *Effort:* M.
- **P6-4. Sound on by default with clear mute** (start muted, prompt on first
  input — autoplay-safe). *Effort:* S.
- **P6-5. Limit motion to one focal element; respect `prefers-reduced-motion`.**
  *Effort:* S.
- **P6-6. Lighthouse pass** (hub + 3 games), target 90+ across metrics. *Effort:* M.
- **P6-7. THE DIFFERENTIATOR — make it the hero line:** *"No ads. No pop-ups. No
  tracking. No data sold. 15 original pug games. Click and play."* Every casual
  portal is ad-saturated (some run behavioral/geo ads on a kids' site; GD/
  GameSnacks force pre-rolls + "an ad every minute"). This contrast is real and
  no ad-funded competitor can honestly match it. *Effort:* S.

---

## 4. JUICE & FUN CHECKLIST (apply to each of the 15 games)

**Feel (every action):** hit-stop on big hits (30–100ms) · screen shake + camera
kick scaled to event · squash & stretch on jump/land/hit/spawn · tween/ease
everything (no snaps) · particles on impact/pickup/death/milestone · knockback on
target *and* player · screen/color flash on damage & success · anticipation
wind-up + follow-through overshoot · permanence (debris/marks linger) · layered
pitch-varied SFX with bass on impacts · popping floating score/damage numbers ·
**readability preserved under all effects** (don't over-juice).

**Loop & onboarding:** fun in first 30s; sessions ~30s–3min · easy to learn, hard
to master (one-button grasp, deep ceiling) · teach by doing, first-win in opening
seconds · clear goal stated up front with visual cues (arrows/glows).

**Difficulty & fairness:** difficulty rises with skill (flow channel) · every
death feels fair ("my fault") · no fake difficulty (inflated HP, bad hitboxes,
input lag).

**Reward & replay:** combo/multiplier with escalating audio · variable rewards +
juicy success celebration · run-end score breakdown · meta-progression
(unlockable pug cosmetics) · personal-best + "just one more run" · daily seeded
challenge + leaderboard · randomized variety per run.

**Personality:** ≥1 emergent funny mechanic/surprise · pug expressed in animation,
sound, reactions.

---

## 5. Recommended sequencing (where the needle moves most)

1. **Week 1 — Front door (P0).** Kill the gate, first row above fold, fix the
   overlap bug + coming-soon tiles, readable titles, contrast/neon pass, hover
   PLAY. *Biggest felt jump, lowest risk.*
2. **Week 2 — Discovery (P1).** Recently-played + Featured + Most-Played rails,
   badges, facet chips, hero tiles.
3. **Week 3 — Daily loop + meta (P2-1..4).** Daily challenge, share card, streak,
   profile XP/level. *The retention engine.*
4. **Week 4 — Per-game pages + SEO (P3) & social proof (P4).** Free traffic +
   "feels legit."
5. **Ongoing — Juice pass (P5)** one game at a time (breadth beats depth: 15 games
   5% better >> 1 game 75% better), and **PWA/polish/differentiator (P6).**

---

## 6. Our two unfair advantages (defend & amplify)

1. **100% original games** — every competitor mostly licenses/embeds. Our catalog
   is a coherent, ownable IP (the pug).
2. **No ads, no tracking, instant, fast** — a genuine premium identity the
   ad-funded incumbents *cannot* copy without breaking their business model.

Everything in §3 is about borrowing the incumbents' **structure** (zero-friction
entry, rails, badges, daily loops, per-game pages, juice) while leaning on these
two advantages as the headline story.

---

## 7. Quick wins shippable this week (S-effort, high impact)

- Remove on-load gate (P0-1) · fix title overlap (P0-3) · drop coming-soon tiles
  (P0-4) · readable card titles (P0-5) · contrast fix (P0-7) · data-driven badges
  (P1-5) · Wordle share card (P2-2) · comeback bonus (P2-9) · play counts (P4-2) ·
  staff-pick ribbon (P4-3) · haptics (P5-9) · PWA install prompt (P6-2) · "no ads"
  hero line (P6-7).

---

## 8. Cross-references

- `PRO_UPGRADE_PLAN.md` — prior front-door roadmap (A1/A2/A3 shipped; A4/A5/B/C/D
  open). This doc **supersedes & expands** it with retention + game-feel + SEO.
- `GAME_DEEP_DIVE.md` — per-game improvement options (juice candidates per game).
- `RESEARCH_BRIEF.md` / `IMPROVEMENT_LIST_300.md` — genre-king benchmarks.
- `games/pug-heist/FIXLIST.md` — example of the per-game polish loop in action
  (footstep audio + loot-grab pop shipped; same pattern applies arcade-wide).

---

## 9. Sources

**Web portals:** poki.com · sdk.poki.com (thumbnails/accounts/html5) · crazygames.com
· docs.crazygames.com (game-covers/account-integration/APS) · GamesBeat (CrazyGames
social) · itch.io (design docs, collections, sort, Bayesian rating) ·
newgrounds.wiki.gg (Experience Level, Medals, Whistle) · kongregate (badges/levels)
· armorgames · coolmathgames.com (categories, Run 3 page, ads) ·
internetsafetylabs.org (Coolmath geo-ads on kids) · y8.com (tags, game pages) ·
addictinggames.com · lagged.com · developers.google.com/gamesnacks ·
GameDistribution SDK · hoodamath / classroomcenter ("unblocked at school").

**Apps / ASO / retention:** asomobile.net · apptweak.com · splitmetrics.com ·
appfollow.io · appreply.co · keewano.com · userguiding.com · blog.duolingo.com +
duolingo.deconstructoroffun.com (streaks) · maf.ad · segwise.ai · argentics.io ·
beamable.com · appbot.co + developer.apple.com (rating timing) · clevertap.com
(viral loops) · thegamer.com (Wordle format).

**UX / attention:** nngroup.com (F-pattern, layer-cake, scanning, scrolling &
attention, visual hierarchy, squint test, Fitts's Law, animation, eyetracking) ·
lawsofux.com (Hick's / choice overload) · credibility.stanford.edu · Lindgaard
"50 milliseconds" · w3.org WCAG 2.2 contrast · accessibilitychecker.org (dark
mode) · gdevelop.io (thumbnails) · vanseodesign (Z/Gutenberg) · CXL (above the
fold) · Key Lime Interactive (faces/gaze).

**Game feel / fun:** Swink *Game Feel* (ch.1 PDF) · Nijman *The Art of
Screenshake* (YouTube + Internet Archive) · Jonasson & Purho *Juice it or Lose it*
(GDC Vault) · Bushnell's Law · Bungie "30 seconds of fun" · gamedesignskills.com
(core loops, bad design) · Csikszentmihalyi flow / DDA studies · Antidote &
DesignTheGame (FTUE) · Bullet Haven (roguelite meta-progression) · MINIFINITI
(humor in games).
