# BORKADE — Idea Bank Vol.3 (Final Expansion Stage)

**Pipeline:** research(7) → generation(36, Vol.2) → QA(7, REFINED) → **expansion(14, this file)**.
14 generation agents, each fed the research + QA direction, each producing a large
batch of genuinely-distinct, code-grounded ideas in a fine-grained domain not yet
deeply covered by Vol.1/Vol.2. ~2,500 ideas across 14 sections. Companion to
`IDEA_BANK_5000.md` (Vol.2), `IDEA_BANK_1000.md` (Vol.1), `IDEA_BANK_REFINED.md` (QA).

Honest scope note: this is the 7→7→7→14 pipeline structure the owner asked for,
run at its real quality ceiling — each agent yields a few hundred distinct ideas,
not a literal 10k, because past that the same idea repeats in new words. The
build-priority lives in `IDEA_BANK_REFINED.md` (Master Top 20), not in raw count.

---

## Sections
- V3-1. Onboarding & FTUE
- V3-2. In-game tutorials & teaching
- V3-3. Difficulty, balancing & dynamic difficulty
- V3-4. Score systems, combos & reward feedback
- V3-5. Particle systems & VFX catalog
- V3-6. Camera systems & screen dynamics
- V3-7. Enemy & AI design patterns
- V3-8. Boss design patterns & encounters
- V3-9. Level & world generation
- V3-10. Power-ups, items & pickups
- V3-11. UI/HUD component library
- V3-12. Microcopy & writing bank (Bork voice)
- V3-13. Sustainability, ethics & responsible design
- V3-14. Analytics-free measurement & decisions

---

## V3-1. Onboarding & FTUE

### A. First-Visit / Landing Flow (50ms impression)
1. Render a single playable pug auto-waddling across the hero banner before any asset finishes loading.
2. Show the most-played game already mid-animation in the hero tile, not a static screenshot.
3. Hero tagline reads "Press any key to play" and any keypress launches a random easy game.
4. Inline-playable demo embedded in the landing page — first interaction happens before navigation.
5. Cursor near any game tile triggers a 1-frame pug "boop" reaction to prove instant responsiveness.
6. Defer all non-critical CSS/JS so the first pug pixel paints under 50ms.
7. A pug paw "knocks" on the screen on first load, inviting a tap to start.
8. Skip splash screens entirely; first frame is interactive arcade, not a logo.
9. Landing shows live "X pugs playing now" faux-counter to imply a warm, active room.
10. Big single "PLAY" button dwarfs all secondary navigation on first visit.
11. Hero auto-cycles 3 game previews every 2s so a genre clicks within 6s.
12. Background pugs idle-animate so the page never feels dead during the 50ms window.
13. First scroll snaps to a "quick play" carousel, not a marketing wall.
14. No cookie banner, no email gate, no age wall — instant entry by design.
15. Title bar favicon animates a waddling pug to reinforce "playful" before content loads.

### B. New-vs-Returning Detection & Cold-Start Personalization
16. localStorage flag routes first-timers to guided launch, veterans to last-played.
17. Returning users land directly on their last-played game's resume screen.
18. Detect zero-history users and surface the single highest-first-win-rate game first.
19. Remember last-played and pin it as a glowing "Continue" tile top-left.
20. Infer device (touch vs keyboard) on load and pre-select control-appropriate games.
21. Cold-start ranks games by "easiest to win in 60s" until play data exists.
22. After 1 finished game, re-rank the grid by inferred genre preference.
23. Time-of-day heuristic: short games surfaced on weekday mornings, longer on weekends.
24. "Welcome back, you were on level X" toast restores context with zero clicks.
25. Detect returning-but-rusty (>7 days away) and offer a 1-screen control refresher.
26. Anonymous "play streak" persists in localStorage to nudge return visits.
27. First-session users get a curated 3-game "starter flight"; returning users see full grid.
28. Referrer-aware cold start: arriving from a specific meme link deep-links that game.
29. Detect prefers-reduced-motion and swap to a calm, low-flash FTUE variant.
30. Fingerprint slow devices and route them to lightweight games first to avoid jank-on-arrival.

### C. Guaranteed First-60s Win
31. First playthrough of any game ships with invisible "training wheels" easing difficulty.
32. First-run enemies move 40% slower until the player scores once.
33. Auto-aim/auto-grab assist silently enabled for the first life only.
34. First obstacle is always trivially clearable to bank an early success.
35. Hidden score floor guarantees the first run beats a "you won!" threshold.
36. First collectible spawns directly under the player's start position.
37. Coyote-time and hitbox forgiveness are doubled on the very first attempt.
38. First-run timer is generous; tightens only after the debut win.
39. Guaranteed-win is invisible — never labeled "easy mode" to avoid condescension.
40. If the first run is failing, dynamically spawn an easy win condition before frustration peaks.
41. First boss has a telegraphed one-hit weak point that's impossible to miss.
42. New players can't fall in the first pit — an invisible ledge catches the debut jump.
43. First-life respawns are instant and free; death penalty starts at life two.
44. The tutorial level IS the first win — completing onboarding equals a logged victory.
45. First power-up is force-dropped so players feel strong before they feel challenged.

### D. Show-Don't-Tell & Teach-By-Doing
46. Ghost-pug demonstrates the core move once, then fades, inviting imitation.
47. No text tutorials; a looping 2s gif-style demo plays inside the empty start area.
48. Diegetic arrows painted on the game floor point where to go — no UI overlay.
49. The first required action is the only thing on screen, making it self-evident.
50. Attract-mode auto-plays the game until the user grabs control mid-run.
51. Teach jumping by placing a coin just out of reach that begs a jump.
52. Highlight the only interactive object with a gentle pulse; everything else is dim.
53. Controls are revealed by a pug NPC physically performing them in front of you.
54. Failure teaches: a near-miss shows the consequence without ending the run.
55. Environmental funneling — walls shape the first 10s so only the right action fits.
56. The first enemy stands still, letting players discover attack by curiosity.
57. A "do this" hand-cursor animates the exact gesture, then disappears on success.
58. Progressive prop reveal: new mechanics slide into frame as you master prior ones.
59. Show the goal on screen from second one so intent never needs explaining.
60. Replace "how to play" pages with a 5-second interactive sandbox before the real start.

### E. Progressive Control Reveal
61. Reveal one control at a time; the second only appears after the first is used.
62. Movement first, action second, special third — gated by demonstrated competence.
63. Unused-control hint pulses only after 5s of the player not discovering it.
64. Lock advanced moves behind the first checkpoint to avoid early overload.
65. On-screen control prompts fade out permanently once each input is performed once.
66. Combo/special abilities stay hidden until the basic loop is proven.
67. Contextual key prompts appear exactly when a control becomes useful, not before.
68. Touch controls enlarge for the first session, then shrink to normal size.
69. Each new control is introduced in a safe zone with no fail state.
70. The control map builds visibly in a corner HUD as each input is unlocked.

### F. First-Win Celebration & Reward
71. First win triggers an over-the-top confetti-pug explosion disproportionate to the feat.
72. Unlock a cosmetic pug hat on the very first completed game.
73. "FIRST WIN!" badge animates into a persistent trophy shelf.
74. Screen-shake, fanfare, and a slow-mo victory pose on debut success.
75. First win grants a shareable auto-generated meme card of the moment.
76. A celebratory pug bork sound plays only on a player's first-ever win.
77. First victory awards bonus currency to seed the meta-progression loop immediately.
78. The pug does a unique "first win" dance never shown again, making it feel special.
79. Reveal the next recommended game inside the first-win celebration screen.
80. First-win screen shows "you beat 73% of new pugs" social-proof flourish.

### G. Reducing Time-to-Fun / Skip Paths
81. "Skip intro" appears the instant any onboarding starts, honored immediately.
82. Holding any key for 1s fast-forwards the entire tutorial.
83. Veterans get a "I know how to play" button that jumps straight to gameplay.
84. Pre-load the first game's assets while the user reads the one-line goal.
85. First playable frame appears under 2s from tile click; assets stream in after.
86. No loading bar over 1s; show a playable mini-loop while heavier assets stream.
87. Auto-skip onboarding for any game already completed once.
88. ESC or back-swipe always exits FTUE without penalty or confirmation.
89. Onboarding total length capped hard at 90 seconds, enforced by a hidden timer.
90. A "just throw me in" global setting disables all FTUE site-wide forever.

### H. First-Session Goals & Gentle Ramps
91. First session sets one tiny goal: "win once," shown as a single checkbox.
92. A 3-step first-session quest (play, win, unlock) with visible progress dots.
93. Difficulty ramps per-second on a curve tuned so minute one always feels winnable.
94. First three runs each add exactly one new element, never two.
95. First-session XP bar fills fast, then normalizes, front-loading the dopamine.
96. The ramp pauses at any sign of repeated failure, holding difficulty steady.
97. First-session goal is framed as fun ("make the pug happy"), not as a task.
98. Each first-session milestone unlocks a visible new pug expression as reward.
99. First session ends on a high: difficulty dips right before the natural stop point.
100. First-session goals are universal across games so the meta-loop reads instantly.

### I. FTUE Per-Genre
101. Platformers: first screen is a flat run with one inviting low platform.
102. Shooters: first wave is a single slow target dead-center.
103. Runners: auto-run on, player only learns the one-tap jump first.
104. Puzzles: first puzzle has exactly one obvious valid move.
105. Stealth (Pug Heist): first guard faces away, teaching sneak without risk.
106. Top-down arena: first room has one enemy and a clearly marked exit.
107. Reaction games: first prompt allows a comically long response window.
108. Racing: first lap has no opponents, just a clean track to learn steering.
109. Tower-defense: first wave is one weak crawler against a pre-placed tower.
110. Endless games: a soft "first goal" line gives an early finite win.

### J. Measuring & Tuning FTUE (privacy-first, local-only)
111. Instrument time-to-first-input as the primary FTUE health metric.
112. Track first-60s win rate per game; target 90%+, alert below 80%.
113. Log tutorial-skip rate per game to find onboarding that's too long.
114. Measure D0 second-game rate as the FTUE-to-retention bridge.
115. Funnel: land → launch → first-input → first-win → second-game, per-step drop-off.
116. Heatmap first-session rage-quit points to locate the difficulty cliff.
117. All FTUE metrics computed locally, no tracking sent (brand promise).
118. Tag each death in the first run with cause to tune guaranteed-win assists.
119. Measure control-discovery time per input to validate progressive reveal.
120. Single FTUE dashboard ranks all 15 games by a composite "time-to-fun" score.

---

## V3-2. In-game tutorials & teaching

### Reusable tutorial-step engine
1. Shared `TutorialSequence` class taking `{trigger, prompt, completeWhen}` steps, reused across all 15 games.
2. Each step declares a `completeWhen(state)` predicate so the engine auto-advances only when the action is performed.
3. Steps support a `timeout` fallback that surfaces a stronger hint if the action isn't done in N seconds.
4. Engine emits `tutorial:stepStart`/`stepDone` events games hook for camera moves, pauses, or spawn gating.
5. Persist `tutorialCompleted:<gameId>` in localStorage so first-run flow auto-skips on return.
6. A `data-tutorial` attribute marks which mechanic a step teaches, enabling a cross-game "what I learned" ledger.
7. Engine supports branching (already know WASD from another game → skip the movement step).
8. Soft-gate progression: the level can't be cleared until the taught mechanic is demonstrated once.
9. Tutorial steps are pure data in a per-game config, so tuning needs no code changes.
10. `replayStep()` API so any single step can be re-triggered from a pause-menu "teach me again" list.
11. Engine throttles to one active prompt via a priority queue to avoid stacking tips.
12. Shared CSS hint-bubble component with consistent pixel-art styling across every game.

### Contextual just-in-time tips
13. Surface "press SPACE to jump" only when the first jumpable gap enters the screen.
14. Show the dash tip the first time an enemy gets within dash range, not at level start.
15. Reveal "hold to charge" only after the player taps the charge button too briefly and fizzles.
16. Pop the "you can wall-jump" tip the first time the player clings and slides.
17. Show the "enemies hear you" stealth tip when a guard's hearing radius first overlaps the pug.
18. Time-gate tips so two never appear within 1.5s of each other.
19. Suppress a tip permanently once the player performs that action three times unprompted.
20. Just-in-time "low health — eat a treat" only when HP first drops below 25%.

### Ghost-hand & demo systems
21. A translucent ghost-pug performs the target move on loop until the player mimics it.
22. Ghost-hand finger sprite taps the on-screen control to demo touch input on mobile.
23. Dotted "ideal path" line for the first platforming jump, fading after one success.
24. Animated arrow arcs trace a planned jump/throw trajectory before the player commits.
25. Ghost input indicators light up the exact keys (WASD/SPACE) in sync with the demo.
26. Slow-motion demo of a boss's tell, then hand control back for the first real dodge.
27. After three failures the ghost-hand demo auto-replays without the player asking.
28. Demo speed scales to an accessibility setting (0.5x for slower demos).

### Diegetic / in-world teaching
29. Wooden pixel-art signs read "→ HOLD to dig" instead of a popup.
30. A friendly NPC pug barks a one-line hint when approached, no menu required.
31. Painted floor arrows guide the player toward the first objective diegetically.
32. Tutorial enemies are visually "asleep" (Zzz) so the player learns attacking risk-free.
33. A cracked wall with a faint glow teaches "bombable walls" without text.
34. A mentor-pug waddles ahead and performs each action for the player to copy.
35. Color-coded doors (red key/red door) teach the matching system with zero words.
36. A practice dummy scarecrow invites free attacking before real combat.

### Stuck detector & adaptive hints
37. Track time-since-progress; after 20s with no objective change, escalate to a hint.
38. Detect repeated failure on the same obstacle (3 deaths) and offer a targeted tip.
39. Escalating hint tiers: subtle pulse → text hint → ghost demo → offer to skip.
40. Detect "input thrashing" (mashing wrong keys) and surface the correct control.
41. Silently ease the obstacle after the 4th failure rather than nagging.
42. Detect the player wandering from the objective and gently nudge with an arrow.
43. Offer an optional "skip this section" button only after the stuck threshold is hit.
44. Log stuck points to localStorage to inform which tutorials need design attention.

### Practice / sandbox modes
45. A "Practice" entry on each game's menu drops into a consequence-free room.
46. Sandbox has infinite lives/health and a reset button to retry a move endlessly.
47. Practice lets the player spawn any enemy type to rehearse fighting it.
48. A boss-rush practice room to rehearse a single boss's pattern.
49. Sandbox "slow time" toggle to study fast mechanics at half speed.
50. A combo trainer that lists target combos and confirms each successful execution.
51. "Replay last death" spawns you 3s before where you died to retry.
52. A metronome/rhythm trainer for timing-based games before the real song.

### Control-hint overlays
53. A toggleable on-screen control legend bound to one key (H) in every game.
54. First-run overlay highlights only the controls relevant to the current level.
55. Controls auto-detect gamepad vs keyboard vs touch and show matching glyphs.
56. Fade control labels to 30% opacity after first use so they linger without nagging.
57. Hold-vs-tap controls show a filling ring to teach the distinction visually.
58. Context-sensitive button prompt floats above the pug ("E: open") near interactables.

### Learn-by-doing first levels
59. Level 1 is a corridor that requires using each mechanic once to proceed.
60. The first enemy is harmless and exists solely to teach the attack input safely.
61. The opening gap is exactly one jump wide — impossible to fail the jump lesson.
62. Introduce one mechanic per screen, never two new things at once.
63. A "no-fail" intro segment where death just resets you to the same spot instantly.
64. Reward the first correct use of a mechanic with juice (coins, fanfare).
65. Gate the exit door behind demonstrating the mechanic, not behind reading text.
66. Each game's first 60 seconds teach the full core loop with no instruction screen.

### Mechanic-introduction pacing
67. Stagger introductions: movement L1, jump L2, attack L3, never front-loaded.
68. Re-test a mechanic one level after teaching it to confirm retention.
69. Combine two taught mechanics in a "synthesis" challenge only after both are solo-mastered.
70. Introduce advanced variants (charged attack) only after the basic version is reliable.
71. Each new enemy type debuts alone before appearing in mixed groups.
72. Cap "new things" budget at one per minute during the early game.

### Glossary / legend / codex
73. An in-pause "Codex" lists every enemy, item, and mechanic encountered so far.
74. Codex entries unlock the first time the player meets the thing, with a "NEW" badge.
75. Each codex entry has a tiny looping animation showing the thing in action.
76. A legend screen maps every HUD icon to its meaning, openable anytime.
77. A site-wide shared glossary for terms common across games (combo, dash, parry).
78. Enemy codex entries reveal attack patterns only after the player survives them once.

### Replayable, accessible & per-game
79. A "Tutorials" tab in each game's menu relists every lesson as a replayable clip.
80. Pause menu always offers "remind me how to [current mechanic]."
81. Returning after 7+ days triggers an optional one-line refresher of core controls.
82. All tutorial text respects the site's font-size and high-contrast settings.
83. Tutorials convey every lesson with both an icon and text, never color alone.
84. Reduced-motion mode replaces flashing/pulsing hints with static arrows.
85. Ghost-hand demos can be paused and stepped through frame-by-frame.
86. A "tutorial verbosity" setting: minimal / standard / extra-help.
87. Pug Heist: teach noise/vision cones diegetically via a guard's visible sight-line cone.
88. Pug Heist: a tutorial guard who is asleep, teaching sneak-past before active patrols.
89. Floor-is-Lava: the first lava tile telegraphs with a 1s warning shimmer to teach timing.
90. Delivery-Pugs: the beacon beam itself is the tutorial for "go here."
91. Backrooms-3D: a wall sign teaches WASD+mouse-look before the monster spawns.
92. Clown-Forest: the first clown is slow and visible to teach the chase-evasion loop.

### Reinforcement & feedback
93. Positive juice (sparkle + sound) the instant a newly taught mechanic is used correctly.
94. A subtle checkmark animates over the hint bubble when the step is completed.
95. Negative feedback is instructive, not punishing ("too early — wait for the flash").
96. End-of-level recap lists "new this level" mechanics to consolidate learning.
97. A "you've got it!" graduation moment retires a mechanic's hints permanently.
98. Micro-celebration when the stuck-detector's helped player finally clears the obstacle.

> Sections V3-3 through V3-14 below are tight condensations (sub-headings + strongest
> ideas) of each agent's full output. The complete raw set (≈170 ideas/section, ~2,500
> total) lives verbatim in this session's transcript; build priorities are in
> `IDEA_BANK_REFINED.md`.

---

## V3-3. Difficulty, balancing & dynamic difficulty

**Curve & stair-step:** plot each game's difficulty as a numeric curve, assert no +15% spike between adjacent levels; 3-up-1-easy "exhale" rhythm; first 30s a guaranteed-win zone; one new mechanic per stage; steepest jump *after* a checkpoint; pair every difficulty rise with a reward rise.
**Telegraphing & fair failure:** every lethal hazard flashes ≥0.4s before it can hit; consistent red=danger across all 15 games; ground-shadow under falling objects; enemy wind-up before attacks; distinct audio cue per hazard; spawn shimmer so enemies never appear on the player; audit every death to confirm cause was on-screen.
**Dynamic/adaptive:** track deaths-per-minute and soften spawns after 3 fast deaths; cap swings to ±20% so it stays invisible; one-way ratchet (assists turn on, only off on recovery); adapt the resource economy not enemy stats; persist a per-game skill estimate that decays slowly; opt-out in settings.
**Catch-up vs runaway:** behind-your-best score multiplier; cap stacked power-ups; diminishing combo returns; pity drop after an unlucky streak; final stretch slightly more generous for clutch wins.
**Assist modes:** global 15% slow toggle that keeps scoring; no-fail practice (disables high-score save); aim/lane snap; +50% telegraph windows; bigger-hitbox; reduced-shake/flash; each stackable & independent, never all-or-nothing.
**Selectors:** three presets — Pup / Pug / Top Dog — with plain-language descriptions; default Pug, suggest Pup after repeated early deaths; change mid-run from pause; badge high-scores with their difficulty; "Top Dog" changes behavior, not just numbers.
**Per-game levers:** Pug Heist = guard vision cones + patrol overlap + search-timeout, scale *number* of chasers not speed; Floor-Lava = safe-tile lifetime; Clown-Forest = chase trigger distance + accel; Delivery = timer vs route (~15% buffer); Backrooms = monster hearing radius + wander/hunt ratio; expose each game's 3 core constants at the top of main.js as named tunables.
**Anti-frustration:** mercy-frame on the first hit; coyote-time on all edges; ~120ms input buffer; checkpoint every 60–90s; auto-save best progress; respawn safe for 1.5s; never place an unavoidable hazard; input latency under 100ms everywhere.
**Anti-boredom & skill expression:** optional risk-reward shortcuts for bonus score; no-hit/perfect badges + multiplier; combo systems experts exploit but novices ignore; speed-run timer + personal-best ghost; late-game "mastery modifiers" that change strategy not numbers.
**Death-loop quality:** name the exact cause in one line; show how close you were; death anim <0.8s; highlight the killing hazard; instant Retry focused by default; after 5 deaths offer (don't force) a drop or skip; keep the death sting playful.
**Tuning methods:** log death location/cause/time to localStorage; hidden debug overlay of live difficulty values; define target completion rates per level; fixed-seed mode for retesting; all magic numbers in one CONFIG object; test at 30/144fps for frame-rate independence; capture rage-quit (close within 2s of death).
**Cross-game consistency:** one shared difficulty vocabulary; order tiles roughly easy→hard; 1–5 paw-print rating per tile; shared control-feel baseline; shared telegraph color language; ≥3 genuinely chill games; shared assist-options panel; one global "first-timer" mode.
**Mechanic fairness rules:** never require sub-100ms precision outside top tier; always show a detection meter before alarm; pursuer speed 95–100% of player; cap simultaneous falling hazards to reaction budget; bullet speed slow enough to place a dodge; instant-kills only telegraphed/optional/high-tier.
**Balance guardrails:** record one verified clear per level before shipping; assert no level spawns more threats than the reaction budget allows; confirm easiest preset is winnable by an unskilled run and hardest is beatable by an expert; regression-test constants after any physics change.

---

## V3-4. Score systems, combos & reward feedback

**Combo/chain:** shrinking timer ring (8%/link); hold-the-line freeze on miss vs reset; combo banking (cash a chain before a risky move); branching tiers (white→gold→rainbow); per-input-type separate chains; clean-combo flag doubles payout if no damage taken; combo windows tied to track BPM.
**Multipliers:** stacking visible coins on the HUD; risk multiplier that climbs only in a danger zone; idle decay (×0.1/sec); fractional (×1.25/1.5/1.75); multiplier-lock pickup; multiplier spent on death (keep score, reset ×N); heat-bar that overheats past a soft cap.
**Style/grade:** live S/A/B/C badge morphing in real time; pug-pun ranks (Bork→Boof→Zoom→Flooftastic→Smol Legend); repetition penalty (spamming one move drains style); end-screen letter grade from speed+accuracy+combo+no-hit; grade layers in extra music stems.
**Per-game score identity:** Floor-Lava = airtime²; Heist = loot × stealth-streak − alarms; Delivery = packages × (1 + time-left/total); runner = distance × speed-tier; shooter = accuracy% × kills; print the formula on the pause screen.
**Floating-number juice:** numbers inherit the multiplier-tier color; grow in font size with value; arc on a physics trajectory and "land" in the counter; crit numbers hard-shake + white flash same frame as sound; merge simultaneous hits into one growing "+247!".
**Counter & HUD feedback:** odometer roll-up with rising pitch; pulse/scale on gain; "recent gains" ticker; turns gold + sparks past your PB mid-run; milestone rungs the counter visibly climbs past.
**Escalating audio:** combo hit-sound pitches up a semitone per link; layered "stack" sound per multiplier tier; rising shepard-tone under long combos; milestone fanfares of escalating grandeur; deliberate record-scratch on combo break.
**Risk-reward scoring:** all-in wager; gem-in-spikes ×3 vs safe ×1; greed timer (points tick up the longer you delay extracting); no-shield ×1.5; last-life ×2; cash-out zones you must reach to bank points.
**Perfect/clean bonuses:** per-room FLAWLESS; full-clear collectible bonus with a (7/8) goad; pacifist path pays more; perfect-parry chains; under-par time bonus shown as saved seconds; one-credit-clear meta bonus.
**Breakdown & end screens:** animated tally with per-line SFX; stacked-bar contribution viz; gold "new record" lines; per-category PB deltas; auto-generated shareable result card; animated medal slam.
**Milestones/par/medals:** Bronze/Silver/Gold thresholds shown on start; dev-ghost par line the bar races; adaptive thresholds ~10% above your best; "next milestone in 340" hint; cross-game cumulative medal count.
**Score-attack modes:** fixed 90s window; one-life ×3; combo-survival (ends on break); boss-rush DPS readout; daily-seed score-attack; mutator-stacked multipliers.
**Fairness/legibility:** never penalize exploration; "why" tooltip on any score line; consistent small/medium/large/perfect taxonomy across games; combo break shows its cause; no hidden caps; generous rounding up.
**Variable rewards:** slot-machine lucky pickup (2–5×); rare golden enemy (10×); mystery boxes; jackpot meter; double-points-minute klaxon; hidden score easter eggs.
**Cross-run/meta:** lifetime career score per game; one arcade-wide BORKADE Score; weekly + all-time boards; mastery tiers (1–10); score-funded "kibble" unlock currency; best-run replay ghost on the attract screen.
**Feedback timing & integrity:** credit points on the exact impact frame; reward sound + number + counter same frame; 0.05s hitstop on big scores with buffered inputs; anti-double-count guard for honest boards.

---

## V3-5. Particle systems & VFX catalog

**Shared pooled engine:** single `ParticleEngine` (`spawn/update/draw`) imported by all 15 games; pre-allocated fixed pool, zero gameplay allocation; flat typed arrays indexed by slot; free-list O(1) reuse; emitter presets (rate/spread/speed/lifetime/color-ramp); burst vs continuous one code path; palette-index colors so particles match each game's locked palette; sub-pixel float positions snapped to ints at draw; seeded RNG for replay-identical VFX; `clear()` on scene change.
**Dust & ground contact:** landing puff, footstep micro-puff (alternating L/R), skid smear, jump-launch ring, heavy-land shockwave ring, wall-scuff, dig clods; dust color sampled from the tile underfoot.
**Sparks & impact:** 4–6-line hit-spark star, doubled+white-flash crit, metal-clink with gravity, ricochet off the surface normal, parry ring, pickup-pop star, combo-tier-scaled burst, floating damage glyphs, orbiting stun-stars, inward charge-up sparks.
**Fur & creature debris:** fur-tuft puff in coat color, shed-fur drift, wet-shake droplet ring, bark shockwave ring, treat-crumb scatter, slobber droplet, tail-wag motion lines, fading paw-print decals (permanence).
**Smoke/fire/scorch:** soft rising plume, exhaust puff, fire flicker, ember rise, explosion fireball→smoke, projectile smoke trail, scorch-mark decal, steam vent, smoke-puff to hide spawn/despawn pop-in.
**Debris/breakables:** chunky color-matched shards with gravity, glass slivers with a glint, wood splinters, coin/gem spray that homes to the HUD, crate reveal-sparkle, settled-debris fading to floor decals, confetti from special crates.
**Trails/motion:** speed-line streaks, after-image dash trail, dash whoosh arc, comet projectile trail, ribbon sword-swipe, wheel-roll dust, jetpack flame, velocity-stretch at high speed.
**Magnet/energy/arcs:** magnet-arc lightning to nearby coins, coin-attract stream, energy-orb convergence on meter-fill, chain-lightning hops, buff-colored aura shimmer, shield-hit ripple, healing motes, portal swirl.
**Pickups/rewards:** rotating sparkle over collectibles, collect white-pop, rarity-tiered spark density/color, level-up fountain, star-rating burst, combo-milestone confetti, treasure-reveal light column.
**Full-screen VFX:** hit-flash red vignette, 1–2-frame white impact flash, freeze-frame + flash hitstop, chromatic-fringe pulse (toggle), radial speed-blur, low-health breathing vignette, win wash, game-over desaturation sweep — all photosensitivity-capped (≤3 flashes/sec).
**Weather & ambient:** rain+splash, swaying snow with accumulation, tumbling leaves, wind gust, sandstorm, fog bank, lightning flash+thunder shake, dust motes in light shafts, fireflies, drifting embers — all share one global wind vector.
**Explosion variants:** small pop, standard blast, delayed-secondary cluster, implosion, harmless confetti reuse, EMP ring, sticky ink/splat decals, water-balloon, smoke-bomb cover, firework shell.
**Per-game identity:** each game declares a `vfxTheme` (palette subset + signature shape + default burst); Heist = muted greys + smoke despawns + alarm-red pulse; Floor-Lava = embers + scorch + heat-shimmer; Delivery = speed-lines + beacon column; Clown-Forest = confetti + balloon pops; Backrooms = minimal + buzzing-light flicker.
**Additive glow & rendering:** optional additive pass for glowing kinds; cheap glow = larger low-alpha square behind a bright core; hot→white at birth cooling to palette; per-game additive cap; toggle off on low-end.
**Performance budgets:** hard global cap (~600) with oldest-cosmetic culling; per-category soft budgets (gameplay cues never culled, ambient first); frame-time governor reduces *emission* before dropping live particles; off-screen skip; batch draws by kind; auto device-tier probe on first run; dev overlay of live count/cost.
**Reduced-motion & event bus:** `prefers-reduced-motion` disables flashes/shake/chromatic, swaps shake for a border-color pulse, keeps gameplay-readability particles; central event→VFX table so designers retune feel without per-game code; combo escalation enriches the same "hit" event; perfect-timing gets a reserved gold sparkle.

---

## V3-6. Camera systems & screen dynamics

**Shared `Camera2D` module:** position/zoom/rotation/offset; `begin/end(ctx)` wrapping canvas transform; `worldToScreen`/`screenToWorld`; single `update(dt, target)` composing follow→bounds→look-ahead→kick→shake→pixel-snap; per-game config (deadzone/smoothing/lookahead/bounds/shakeScale); frame-rate-independent via dt; first-frame snap (no startup pan); NaN guard; deterministic shake seed for replays.
**Follow & dead-zone:** box dead-zone (hold until target exits a centered rect); asymmetric (wider X than Y); critically-damped spring (no overshoot); frame-rate-independent `1 - exp(-k*dt)` lerp; snap-on-respawn; velocity-gated to kill idle jitter.
**Look-ahead/lead:** velocity- and input-based lead in movement direction; eased with hysteresis so direction flips don't swing wildly; clamped max distance; fall-lookahead shifts down on big vertical velocity; aim-based lead in shooters; per-game profiles.
**Kick & recoil:** `cam.kick(dx,dy)` decaying offset for hits/shots/landings; recoil opposite to fire; spring-return overshoot; landing kick proportional to fall speed; directional kick toward damage source; stacking kicks clamped; per-event presets (coin 1px, boss slam 12px).
**Zoom-punch & FOV:** brief scale-in on big hits; zoom-out on speed; zoom-in for precision; combo-driven tighten; death zoom-punch at the kill frame; boss-arrival zoom-out then return; pixel-snapped integer scales to avoid shimmer.
**Trauma-based shake:** single `trauma` 0–1, offset = max·trauma², linear decay; noise-driven (smooth, non-repeating); separate impact vs ambient channels; per-source decay (quake lingers, coin snaps back); `addTrauma()` clamped; rotational component on big events; bleeds fully to zero.
**Directional/shaped shake:** biased along impact axis; kick+trauma combo for layered hits; ground-pound vertical-dominant; recoil-aligned along fire line; edge-masked so it never reveals out-of-bounds void.
**Transitions & cinematics:** tween-to-target on follow-target switch; camera state machine (Follow/Cinematic/Locked/Free); boss-intro pan; final-blow slow-mo + zoom + letterbox; hitstop freeze with shake/kick queued to fire on resume; skippable on any input.
**Parallax & depth:** multi-layer per-depth scroll factors auto-computed from camera position; vertical parallax; depth-scaled shake (far layers shake less); foreground layer; infinite-tiling wrap; dampening to prevent fast streaking.
**Framing & readability:** bias between pug and current objective; multi-target bounds keep pug + nearest threat on screen; HUD-safe inset; hazard-peek nudge toward incoming off-screen threats; level-bound clamps (no void); pixel-perfect integer rounding; readability-freeze during dense bullet patterns.
**Per-genre presets:** platformer (box deadzone + fall-lookahead + vertical bias + landing kick); top-down (tight centered + aim lead); racing/runner (strong forward lead + speed zoom-out); puzzle (static/whole-board, no shake); brawler (multi-target + zoom-punch + heavy kick); twin-stick (cursor-biased lead + recoil + trauma); genre-preset registry so a game just names its mode.
**Reduced-motion & a11y:** honored `prefers-reduced-motion`; per-effect intensity scalar 0–1; toggles for shake/kick/zoom persisted to localStorage; snap-follow (no smoothing) option; disable-parallax; rotation-free mode; photosensitivity rate-limit on zoom-punch flashes; keep informative hitstop, drop vestibular shake.
**Bounds & multi-res:** world-bounds clamp per-axis; letterbox/pillarbox for small levels; resolution-aware fractional dead-zone; safe-area insets for notches; aspect-adapter recomputes zoom for phone vs desktop; DPR-aware snapping; resize/orientation re-clamp.
**3D-specific:** orbit-snap to behind the pug after manual rotation; pitch-on-speed; collision-aware pull-in; spring-arm boom (no wall clipping); FOV-kick on dash; height-follow smoothing across stairs.
**Events & tuning:** event-bus subscription (hit/death/pickup/boss) without per-game wiring; declarative juice table mapping event → {kick, trauma, zoom, hitstop} for one-place tuning; combo escalation scales intensity; screen-edge directional flash for off-screen damage; allocation-free per-frame math.

---

## V3-7. Enemy & AI design patterns

**Behavior states:** five-state spine (idle→patrol→investigate→chase→return) with a head-icon naming the current state; investigate always precedes chase (one beat to react); re-aggro cooldown prevents ping-pong; last-known-position ghost marker the enemy walks toward; explicit giving-up animation; confused "?" spin at lost corners; alert meter fills visibly before chase.
**Perception:** translucent vision cone, brighter near apex; cone widens when alerted; pulsing hearing ring on player noise; visible decaying scent paw-prints (sprint stinks more); LOS blocked by props greys the cone; peripheral zone → investigate, central → chase; blind rear arc for planned flanks; two-sense confirmation to skip to chase.
**Telegraphed/fair attacks:** 3-frame wind-up pose; charge draws its lane line; ranged shows a lock dot 0.5s before firing; AoE paints a shrinking safe circle; color-coded by damage (yellow/orange/red); audio tell paired with every visual tell; whiff-recovery stun window; no off-screen attacks; first hit from a new type is non-lethal; staggered group attacks (one at a time).
**Roles & variety:** tank (slow, body-blocks), fast (zig-zag darter), ranged (kites), support/healer (priority target with a heal-beam tell), shield (flank the exposed rear), bomber (lit-fuse countdown), summoner (glowing circle), swarm (trivial-but-deadly-in-numbers), elite (crown/glow +1 ability), mini-boss.
**Stealth AI:** search in expanding circles from last-known-position (never teleport to you); distractions pull one guard; guard chatter doubles as audio telegraph; clue discovery raises area alert; alert tiers decay if hidden; patrol leader others follow; sleeping enemies wake on noise; flashlight *is* the vision cone at night.
**Action/horror/TD AI:** edge spawns with a 1s warning chevron; pre-wave composition banner; aggression budget (only N actively pursue); leash range; shared flow-field pathing; soft separation so swarms don't stack; (horror) faster in a straight line but worse at corners, hunts by sound, hold-breath invisibility, lights flicker before it appears, freezes when looked at, safe-rooms it won't enter; (TD) fixed pre-shown path, color-coded fliers/armored/healer/speed/shield/stealth creeps.
**Difficulty-scaled:** reaction-time delay (ms) is the single tuned dial; rubber-band aggression eases after repeat deaths in one spot; mercy miss after respawn; comeback crit-drop at critical HP; difficulty adds *abilities* not HP-sponging; telegraph windows shrink but never vanish.
**Pug-comedy enemies:** Roomba-cat in lawnmower rows; mailman flinging catchable letters; squirrel only aggressive while holding an acorn; mirror-pug mimicking delayed inputs; snoring guard dog (snore rhythm = the puzzle); goose with a honk-telegraphed charge; cat in a cardboard "tank" with paper-thin rear.
**Performance-cheap:** staggered AI ticks (every Nth frame, offset per unit); LOD sleep off-screen; one shared flow-field recalculated ~1/sec; distance-culled senses; state machines over behavior trees; pooled enemy objects; grid-occupancy separation (no O(n²)); cap simultaneous "thinkers" to nearest K.
**Readable tells & emergent moments:** signature one-frame silhouette per type; idle micro-tics for pre-ID; unique sound sting per type; health shown by appearance (cracks/limp/smoke); friendly-fire among enemies; hazard-aware herding the player can turn back on them; panic-flee when a pack's allies all die; taunt/showboat punish windows.
**Spawning & fairness:** no spawns in the player's current quadrant; 1s portal/shadow pre-tell; soft cap tied to on-screen count; themed encounters (all-ranged room teaches one tactic); guaranteed breather rooms; first of each new type spawns alone and slow; ambushes always paired with a visual pre-tell.
**Aggro/targeting:** threat table (prefers most-recent damager, so aggro is manipulable); taunt/lure tools; sticky closest-target bias; LOS-required targeting (break LOS to escape); ranged kite toward a preferred range band; priority glow on supports; faint floor aggro-ring on first encounter; enemies abandon chase at marked zone boundaries.

---

## V3-8. Boss design patterns & encounters

**Pug-themed signature bosses (household menagerie):** THE VACUUM (retracts hose to telegraph lunges, suck-zones drag you in, weak point is the swelling dust-bag); THE MAILMAN (letter-volley fans, weak knee when bending for a package); THE CAT — final boss (telegraphed paw-raises, knocks toys as projectiles, purrs to heal unless interrupted); THE VET (syringe-darts + a cone-of-shame shield to flank); THE BATH (tidal-wave tub, foam-bubble adds before the rinse-slam); THE LAWNMOWER (rev-spike charge leaving safe uncut lanes); THE SQUIRREL KING (flees up a tree, bark it back down); plus Leaf-Blower, Doorbell Hydra, Flea Lord, Groomer's Clippers.
**Multi-phase structure:** three-phase rule (one new mechanic per phase, additive); transitions on a health threshold + a brief invuln cinematic beat; recolor on phase-up (fur bristles, eyes redden); desperation phase <15% trades speed for *more* telegraphing; arena mutates per phase (floods, dims, walls close); each phase retires one old attack; final phase combines two already-mastered mechanics; one "false death" max per game.
**Telegraphed attacks players learn:** distinct held wind-up pose; color grammar (red=dodge, yellow=parry, blue=jump); growing ground-decal AoE markers; audio tell precedes every major attack; charge shows a locking aim-line; biggest hits = longest tells; identical animation every time for muscle memory; feints only introduced after the real move is mastered.
**Weak-points:** glow only during recovery frames (teaches punish-after-dodge); sequential (destroy legs → head drops into reach); parry-the-projectile-back; relocates each phase; armor plates barked off one at a time; environmental (lure into the open dryer); brighter as HP drops.
**Arena & hazards:** static/learnable (deaths feel like player error); cover pillars that erode over time; fenced edges (no death from unseen pits); warning-colored hazard tiles; arena shape teaches the fight; one reliable central safe-zone per phase.
**Health/state readability:** segmented bar with phase notches; boss portrait changes expression per phase; stagger meter that cracks the guard; visible draining enrage fuse (not a hidden clock); separate weak-point sub-bar; invuln frames flash white so wasted hits are obvious.
**Intros & defeat payoffs:** pre-fight harmless preview of one signature move; pixel name-card slam-in + bass hit; slow-mo final hit → comedic deflate with a squeaky-toy sound → treat burst reward-lap; each boss drops a wearable cosmetic (the vet's cone, the mailman's cap); skippable cinematics on retries.
**Fairness & a11y:** early-phase hits always survivable in one; generous post-hit invuln (no chain-stun); per-phase checkpoint on a "casual" toggle; telegraph timing identical across difficulties (harder = *more patterns*, never shorter warnings); per-phase practice mode; death screen names what killed you; bounded RNG (no hard attack 3× in a row); 20%-slower-telegraph assist; first boss is a deliberate exaggerated-tell "teacher."
**Mini-bosses per genre:** single-mechanic warm-ups previewing the main boss; platformer bop-the-flea; shmup readable spiral-then-gap; brawler grab-escape bouncer; runner endless-pursuit truck; puzzle boss solved by redirecting the laser cat-toy; rhythm boss attacks on the beat; stealth sabotage-Dane; TD siege-cat with a glowing weak-point window.
**Boss rush & modifiers:** all bosses back-to-back, shared health, time-scored, unlocked post-game; small heal between fights; daily-seeded rush with a fixed modifier; mirror-mode flips all telegraphs; pacifist (environmental-only); sudden-death (one-hit but lengthened tells); remix reshuffles each boss's attacks; hidden true-final secret boss (THE OWNER) after a no-hit rush.
**Telegraph/pattern library:** sweeping swat (duck), overhead slam (sidestep the circle), radial shockwave (jump the ring), homing projectile (break LOS), multi-shot fan (stand in the gap), charge dash (bait + sidestep at lock), suction cone (run perpendicular), ground-pound chain (fixed rhythm), beam sweep (circle toward origin), summon-and-retreat (kill adds fast), spit-arc lob (watch the shadow), spin flurry (back off, punish the dizzy).
**Design hygiene:** no two consecutive bosses share a primary mechanic; every boss solvable with the core moveset; ≥1 free punish window per cycle; attack pool capped at six; each genre's boss respects that genre's verbs; HP padded via phases not inflated bars; banned cheap tactics (off-screen spawns, undodgeable AoE, invisible hitboxes); every boss beatable hitless in principle.

---

## V3-9. Level & world generation

**Seeded determinism & dailies:** every level from a 32-bit seed string, shareable as a 6-char code; one shared xorshift32 PRNG for byte-identical results on any device; "Daily Borkade" seed = hash of UTC date, same layout worldwide; separate daily per game (15 boards); paste-a-seed box on each title screen; seed shown on game-over with one-tap copy; replay-ghost stored as seed + input log (<1 KB); seed namespaced by game-version; independent named sub-streams (layout/enemies/loot/weather); mirror-mode flag in the seed.
**Handcrafted vs procedural:** hybrid — hand-authored "anchor" rooms guaranteed, procedural filler between; tutorial L1 always handcrafted; curated set-piece library injected at pacing beats; layouts must pass a "vibe filter" rejecting all-corridor results; boss arenas always handcrafted; procedural snaps to an 8px grid.
**Chunk assembly:** typed connector sockets (door-left, pit-right) prevent impossible joins; WFC tile assembly for mazes; chunks tagged by role (entrance/combat/rest/treasure/exit) and min/max difficulty; rotatable/flippable to quadruple library size; auto-decorated seams; prebaked tile arrays (assembly = memcpy); per-run frequency budget so no room repeats.
**Difficulty-aware:** reads rolling success rate to tune upcoming chunks; distance-based runner ramp; mercy chunk after 3 deaths; reaction-window budget guarantees minimum warning pixels; single 0–1 "intensity" knob drives 6 downstream params; adaptive gap-width clamped to the actual jump arc; skill-gated hard side-routes.
**Fairness/solvability:** post-gen A* confirms a reachable start→exit path; re-roll a *sub-stream* (not the whole seed) on failure, capped; platformer jump-reachability via real physics constants; key-before-door ordering guaranteed; hazard-free spawn bubble; solver also computes optimal path → fair par time; soft-lock scan.
**Biomes/themes:** biome wheel (alley/park/kitchen/sewer/rooftop) swaps palette + tiles + *mechanics* (sewer current, kitchen grease); weather layer stacks on a biome; seeded biome order per run; per-biome enemy roster + music stem; rare ~3% "anomaly biome" (upside-down/monochrome).
**Set-pieces & secrets:** reserved event slots pull from a curated pool; secret rooms behind crack-hinted breakable walls; one guaranteed secret per level; mini-boss injection if a run's been too quiet; timed treasure-vault; shrine rooms (risk/reward buff that re-rolls remaining loot).
**Pacing within a level:** intensity envelope (rise→peak→valley→final spike→exit); mandatory rest beat every ~30s; forced calm chunk if it's been too hot; crescendo rule (hardest chunk just before the exit); loot drip then a big climax reward; staggered enemy-type introductions.
**Per-genre strategies:** maze = recursive-backtracker + braided dead-ends + seeded loop density; platformer = jump-arc primitives so every gap is provably clearable; runner = growing chunk speed/density with a "fair death" reachable-around rule; dungeon = lock-key-boss graph-grammar, critical-path-first then optional branches; TD = seeded path carving with guaranteed minimum length + coverage-validated build spots; puzzle = generate-then-solve keeping only unique-solution boards; stealth = patrol routes that always leave one timing gap.
**Editors/UGC:** in-browser tile editor exporting a seed/string; shared user levels encoded entirely in the URL hash (no server); validator runs on user levels (guaranteed solvable); "remix" opens any daily seed in the editor; static-JSON community gallery; instant test-play; difficulty auto-rating from the solver's path.
**Performance:** generate the whole level synchronously at load under 16ms; stream runner chunks just ahead of the camera; prebaked collision in a Uint8Array; object pool, never allocate mid-run; flat typed-array tile maps; cap re-roll attempts so a bad seed can't freeze the load screen; Web Worker for the largest dungeons.
**Variety that changes strategy:** seeded "modifier of the day" (low gravity, double loot, fog); randomized win-condition per run shown up front; mutator chunks (reversed controls, dark); seeded starting loadout; variable exit placement; resource-scarcity dial; seeded "keystone item" whose location dictates pathing.
**Testing & meta:** batch-generate 10,000 seeds headlessly and assert every one solvable in CI; death-position heatmap across seeds; determinism unit test (same seed → identical tile arrays on Chrome/Firefox/Safari); replay-from-seed regression test; shared chunk-grammar engine reused by all 15 games; cross-game daily chaining one level from three games; pre-run "briefing card" showing seed + active modifiers; solver-derived difficulty label (Cozy/Tricky/Brutal).

---

## V3-10. Power-ups, items & pickups

**Archetypes (pug-flavored):** Bork Cannon (piercing bark-wave), Treat Magnet, Squeak Shield (one hit + honk), Zoomies Dash (paw-print afterimage), Stink Cloud (slow+damage fog), Snoot Boop (knockback stun), Tail-Wind (combo-scaled speed), Drool Slick (trips pursuers), Floof Armor (extra HP as fur layers), Bark Beacon (radar ping), Pounce, Fetch Boomerang, Burrow (invuln reposition), Howl (buff allies + fear foes), Long Tongue (extended grab reach), Kibble Turret, Doggo Decoy.
**Timing model:** instant heal/reload; timed frenzy with a shrinking ring; passive collar charm; stacking timer adds duration; charge-based (3 kibble pips); one-shot panic button; toggle (speed↔damage); delayed-bloom (doubles if you wait); decaying buff (rewards immediate aggression); conditional passive ("while moving"); persistent-until-hit.
**Rarity & weighted drops:** four tiers (Common gray / Rare blue / Epic purple / Legendary gold) with brighter glow + higher chime per tier; pity timer; bad-luck protection scaling; boss-only legendary table; depth- and risk-weighted; duplicate-protection; build-aware odds boost; visible drop odds before committing — *(Bork Battle already ships this: `_weightedPick()` in Powerups.js, GHOST/RAMPAGE weights — extend the same pattern site-wide).*
**Synergies & builds:** element pairing (Fire-bork + Oil-slick → explosion); set bonuses (3 treat-items → gluttony buff); multiplicative crit stacking; trigger chains ("on dash drop a bomb" + "on bomb gain speed"); keystone items that rewrite a rule (borks bounce off walls); HUD names your emerging archetype (Glass Cannon, Tank Pug); tag system (Loud/Fast/Greedy amplify matches); synergy preview on hover.
**Risk-reward & gambles:** Glass Bone (+100% dmg, double dmg taken); Sugar Rush (speed but twitchy steering); Hungry Collar (stronger the lower your HP); Blood Treat (1 HP → rarity bump); All-In Chest (50/50 telegraphed by a shaking lid); Overclock (overheats); wager your combo on a coin-flip; Borrowed Power (buff now, debuff next level); Fragile Crown (shatters after 3 hits).
**Pickup feedback/juice:** pop-and-pitch chime ladder; magnetic spring snap; 2-frame hitstop on a Legendary; confetti-bork on rares; floating "+SPEED!" with bouncy ease; rarity-colored screen-edge tint; tail-wag celebration; glow pulses faster the closer you are; jackpot slow-mo.
**Choice moments:** three-card draft after each boss; banish a bad item from the pool; reroll + lock a shop slot; skip-for-gold; blind mystery box; branching reward door (Treasure/Combat/Shop); trade-in counter; free-sample for one level; time-pressure pick (cards flip face-down).
**Cursed items (downsides):** Cursed Crown (can't drop/sell); Hungry Idol (must eat each level); Twin Curse (spawns a shadow-pug); Loud Collar (+power, bigger aggro); Brittle Bones (you also get crit); Mystery Curse (hidden until equipped); Sacrificial Bowl (destroy one item to buff another); Cleansing Spring removes one curse for a price.
**Per-game sets & balance:** each of 15 games gets a bespoke 6–10 item pool, no shared globals; runners favor mobility, arenas favor offense, puzzles get undo/peek/swap; shared rarity framework with per-game weights; one signature item per game for identity; power-budget cap so nothing trivializes a game; soft-counter design (every strong item has a weakness); anti-snowball worse odds for the versus leader; diminishing returns on duplicate stacking.
**Collection & telegraphing:** persistent Item Codex (gray silhouettes for undiscovered); unlock-by-use joins the global pool; achievement-gated items; per-game completion → cosmetic collar; one-line funny backstory on discovery; aura-color telegraph (offense red / defense blue / mobility green / utility yellow); pre-grab tooltip; depleting duration-ring on active buffs; stack-count badge; "NEW!" starburst.

---

## V3-11. UI/HUD component library

**Core widgets:** `hud-stat` web-component (`icon`/`value`/`format`, digit-padded so score never reflows); rolling-odometer score with a gold-flash rolled digit; pug-head life pips with a shatter-puff + dim ghost slot; 9-slice half-heart health; segmented (notched) health bar; timer pill white→amber→pulsing-red with a per-second tick; one `hud-timer` supporting count-up *and* count-down; combo drain-bar doubling as the combo-window indicator; ammo pip cells with a reload sweep; boss/objective bar with a lagging chip-damage underlay.
**Screen templates:** `screen-start` (title plate + high-score line + Play + one-line control hint, squash-bounce entrance); `screen-pause` (desaturated frozen-snapshot blur + Resume/Restart/Settings/Back-to-Arcade); `screen-gameover` (result word + score + best + delta + Retry/Arcade, Retry pre-focused on Enter/Space); `results-screen` (stat rows count up sequentially); new-high-score confetti + "NEW BEST!" ribbon; star/medal rating row; "3-2-1-GO" interstitial reused for start and post-pause; pug-paw curtain transition wipe.
**Buttons/toggles/sliders/modals:** `pug-button` with all states + a 2px press-down + primary/ghost/danger variants + chunky pixel-bevel skin; `pug-toggle` snap switch; `pug-slider` with a value bubble + tick snapping; segmented control for difficulty; `pug-modal` with scrim + focus-trap + Esc-close + scale-in; destructive-action confirm preset; press-and-hold auto-repeat stepper; icon-only variant warns in console if `aria-label` missing.
**Toasts/banners:** `pug-toast` queue (bottom-center, auto-dismiss, coalesces duplicates to "xN"); severity variants (info/success/warn/error); achievement banner sliding from the top with a shimmer; tiny non-blocking mid-run pickup toast; wave/level banner; persistent countdown status chip ("2x SCORE 0:08"); "Progress saved" toast on localStorage writes; reduced-motion cross-fade instead of slide.
**Readability:** `--hud-outline` 4-direction text-shadow stroke; `.hud-plate` semi-opaque panel behind grouped stats; auto-contrast helper picking black/white from sampled background luminance; standardized two-tone numerals; top/bottom scrim gradients; minimum HUD font-size floor; safe-zone insets; icon+label rule (never icon-alone for key stats).
**Genre layouts & diegetic HUD:** named layout presets (arcade-score / runner / stealth / puzzle / shooter / survival) applied by one class; 9-slot grid-anchor system (tl…br) so widgets place by name not pixels; per-genre density flag; world-space damage numbers; edge-clamped off-screen objective arrow; tethered leader-line labels; diegetic detection-cone on the guard sprite using shared alert colors (Pug Heist fit); reticle with hit-/kill-confirm pips.
**Responsive & mobile:** breakpoint S/M/L size buckets (snap, don't fluid-blur pixels); auto-relayout collapsing paired stats to rows; on-screen touch d-pad + 2 action buttons that appear only on coarse-pointer; thumb-zone lower-corner placement; 44px minimum hit-area inflation; `env(safe-area-inset-*)` padding.
**Accessibility:** `aria-live="polite"` for score/lives, `assertive` reserved for critical alerts; global `--hud-scale` (100/125/150%); high-contrast theme; colorblind-safe states carry a shape/icon too; reduced-motion disables shake/pulse/parallax; standardized high-visibility focus ring; roving-tabindex menus; pause-on-blur option; text-alt tooltips on every icon.
**Animation & tokens:** shared "value-changed" scale-punch on any number change; `flashDamage()` red vignette + green heal counterpart; shake utility (intensity+duration, auto-muted under reduced-motion); low-health heartbeat vignette; combo-tier color ramp; one `hud-tokens.css` (color/spacing/radius/outline/z-index vars); z-index scale tokens to end stacking bugs; one `initHUD(config)` factory returning `setScore`/`loseLife`/`setTimer`; declarative HUD-from-JSON; event-bus (`score:add`/`life:lose`) decoupling logic from view.
**Back-to-arcade chrome:** persistent slim `arcade-bar` (back arrow + game title + mute + settings) auto-injected via one `<script>` include; back button confirms mid-run but navigates instantly from menu/game-over; shared mute wired to the global audio bus (persisted); settings cog opening the existing shared settingsMenu; fullscreen toggle; current-game high-score readout; "next/random game" shortcut; collapses to a hamburger on narrow screens.

---

## V3-12. Microcopy & writing bank (Bork voice — actual copy lines)

**Buttons/CTAs:** "BORK." (start) · "One more." (replay) · "Again, intern." · "Yes. Obviously." · "No. Coward." (cancel, affectionate) · "Eat the cookie?" (consent: there are zero) · "Steal this score" (share) · "Skip the talky bit" · "Let's go, intern".
**Empty states:** "Nothing here yet. Spooky." · "No scores. The board weeps." · "Your stats are a blank pug stare." · "No favorites pinned. Pick a pug, intern." · "This list is emptier than Bork's calendar." · "Search found nothing. Even Bork looked."
**Errors / 404 / 500:** "404. This page ran off with a treat." · "404: pug not found. Last seen near the snacks." · "500. Something exploded. Bork pretends it's fine." · "That link is fake news, intern." · "Whoops. The hamster powering the server fell asleep."
**Loading tips:** "Loading. Bork is doing a little stretch." · "Fun fact: there are no ads. We checked twice." · "Tip: every pug here is free. Always. No catch." · "Bork is feeding the loading bar a snack."
**Game over:** "BORK. You died. Cutely, but you died." · "Skill issue. Affectionate skill issue." · "You got bork'd. It happens." · "Final score logged. Bork raised one eyebrow."
**Win/celebration:** "BORK!! You actual legend." · "That's the good bork right there." · "New high score! Bork choked on a treat." · "Big bork energy detected." · "W. Capital W. Bork-approved."
**Streak nudges:** "3-day streak. Bork is mildly impressed." · "Don't break the streak. Bork is watching." · "Your streak is on fire. Metaphorically. Calm down." · "Come back tomorrow or the streak ghosts you."
**Achievements:** "Achievement: First Bork. You did a thing!" · "Unlocked: 'Repeat Offender.' 10 games deep." · "Badge: 'Completionist.' Bork ran out of badges. Wow." · "Achievement: 'Night Owl.' Go to bed, intern."
**Tutorial hints:** "Tap to bork. That's literally it." · "Spacebar = jump. Try not to overthink it." · "Avoid the spiky bits. They are not friends." · "Mistakes are free here. So is everything else."
**Settings descriptions:** "Sound: lets Bork bork out loud." · "Reduce motion: for when the zoomies are too much." · "Difficulty: how mean Bork is allowed to be." · "Clear data: nuke it all. Bork won't tell."
**Share-card captions:** "I scored [X] on BORKADE and Bork said 'fine, I guess.'" · "Free pug game, zero ads, infinite bork. Come." · "New high score. No tracking watched me do it." · "Beat my score, intern. I dare you."
**No-ads/no-tracking trust lines:** "No ads. No tracking. No nonsense. Just bork." · "Your data stays in your browser. Bork can't even see it." · "We don't know who you are and we love that." · "Free forever. Bork pinky-swears with a tiny paw."
**Onboarding greetings:** "BORK. Welcome, intern." · "Hi. I'm Bork. You're 'intern' now. Deal with it." · "Welcome to BORKADE. Snacks not included." · "Hello, intern. Let's waste some time correctly."
**Rage-quit comfort:** "Quitting? Bork understands. Bork also quit once." · "It's okay to rage-quit. Come back when you're cute again." · "The game was hard. You were valid. Bork loves you." · "No shame in the bail, intern. Snacks heal all."
**Daily-challenge prompts:** "Today's challenge: survive 60 seconds. Bork doubts you." · "Challenge: no powerups. Pure suffering. Have fun." · "One life. One chance. One bork. Go." · "Fresh challenge dropped. It is rude. Enjoy."

---

## V3-13. Sustainability, ethics & responsible design (no-ads model)

**Funding without ads/tracking:** single "Buy the maker a treat" Ko-fi on the About page only (never in-game); pay-what-you-want tip jar with a £0 option shown first; donation goal as a literal filling pug food bowl (no urgency timer); name-in-credits "Friends of Borkade" wall with opt-out; "adopt a game" yearly-hosting sponsorship credited on that game; publish the real hosting invoice as a transparency artifact; itch.io mirror with optional pay; GitHub Sponsors / Liberapay; print-on-demand sticker/pin merch at cost-plus-tiny-margin; PWA "forever copy" sold once; grants (NLnet/Mozilla-style, arts councils); aligned-org sponsorship only, with a public "who we'll never take money from" list; dog-rescue charity tie-in.
**Hosting-cost minimization:** fully static (free-tier hosts); zero backend (state in localStorage); per-game payload budget (<500 KB); native-res pixel art upscaled by CSS; procedural sprites/audio where feasible; shared sprite atlas for cache reuse; immutable content-hashed cache headers; Brotli precompression; lazy-load each game; free CDN in front; no analytics JS; chiptune/Web-Audio synthesis over streamed MP3; hard monthly bandwidth alert; no video at all.
**Ethics manifesto:** one-screen plain-language doc linked in every footer; lead with "no ads, no tracking, no accounts required, ever"; concrete "things we will never do" list (sell data, loot boxes, ads, login nags); versioned in git so every promise change is diffable; readability-checked, not legalese; pin the commit hash so people can verify; translate it first, before games.
**Transparency reports:** annual real costs + donation totals + where money went; full list of every third-party request (ideally zero); a live in-page "network requests" self-audit; disclose every dependency and why; honest uptime/outage reporting; "no breaches because there's no data" status.
**No dark patterns:** no countdown timers / login-streak pressure / FOMO; no infinite scroll or autoplay-next; no confirm-shaming on exit; no pre-checked boxes; no "rate us" interrupts; no fake notification badges; no pay-to-win/energy meters; no consent bundling; a self-certified "Dark Patterns: none" checklist against the deceptive.design taxonomy; no A/B testing *on users* to manipulate.
**Healthy play:** gentle optional break reminder; an always-honored friction-free "I'm done" exit that saves instantly; session-length display (no judgment); opt-in wind-down mode; no penalty for leaving mid-game; default short complete-able sessions; "good stopping point" cue at level ends; locally-enforced parental daily cap (no account); rewards for skill/exploration, not for showing up daily; one-tap quiet mode.
**Data ownership:** all saves in one documented human-readable JSON; one-click export / import / delete-everything; no account = nothing to be locked out of; public localStorage schema; optional encrypted user-keyed cloud sync the maker can't read; forward-compatible saves never silently wiped; printable high-score certificate.
**Open source & continuity:** MIT-licensed so the arcade outlives the maker; CONTRIBUTING + "good first issue" + "how to add a game" template; public roadmap; mirror on GitHub/GitLab/Codeberg; an "if I disappear" succession doc; reproducible builds; CC-licensed art/audio; archive snapshot with the Internet Archive / Software Heritage.
**Accessibility as ethics:** full keyboard play; remappable controls; colorblind-safe palettes with shape cues; high-contrast + adjustable text size; screen-reader menus + alt text; captions for audio gameplay cues; adjustable game speed; honored prefers-reduced-motion; no flashing above safe thresholds; one-switch modes; honest accessibility statement listing what's missing.
**Kid safety:** no chat / UGC / stranger contact; no in-game external links; purchase/donation flows adult-gated ("ask a grown-up"); collect nothing (COPPA/GDPR-K friendly by design); age-neutral content (no violence/gambling/jolts); plain-language "Parents" page; no third-party embeds; no push permissions ever.
**Environmental & trust:** publish page-weight as a green metric; renewable-energy hosts; idle-pause rendering/audio when tabbed away; support old/cheap hardware to extend device lifespans; sign releases (or publish hashes); a dated "promises kept" log; "last reviewed" dates on policy pages; invite independent audits; a "frozen but playable" end-state plan; LTS promise (availability/security fixes continue even when features pause).

---

## V3-14. Analytics-free measurement & decisions

**Server-log analytics:** put a thin self-hosted Nginx/Cloudflare proxy in front to generate parseable access logs (GitHub Pages exposes none); nightly static GoAccess HTML report published to a public `/stats`; strip IPs at ingestion + `--anonymize-ip`; measure per-game popularity from `GET /games/<slug>/` hits; spot broken assets via 404 clustering; read `Referer` for embeds/hotlinks; diff weekly reports to attribute a Reddit/HN spike; 7-day log retention cron (no data hoard).
**Cookieless self-hosted counters:** GoatCounter/Plausible/Umami on a $5 VPS — no cookies, pageviews only; pin `count.js` by SRI hash so it can never become a tracker; daily-rotating salt so the "fingerprint" expires nightly; bucketed score events (never exact, to avoid uniqueness); run from your own first-party domain (zero third-party requests); gate behind a measurement toggle defaulting OFF; separate subdomain you can null-route instantly.
**Fully-local metrics:** per-game `playCount` ("you've played this 12 times" — never leaves the device); total seconds played; rolling 30-day local play histogram for a private "your week in BORKADE"; local-only high-score table; last-played timestamp powering a "jump back in" rail; local streak counter; local rage-quit flag to self-tune difficulty; cap every aggregate at a *count*, never a log; namespace under `borkade.metrics.*` so one "wipe my data" clears all; a "show me everything stored about me" debug panel.
**Privacy-preserving counters:** public "pugs deployed" odometer via a stateless server-side `++` on a single edge-KV int (no rows/users); per-day int → sparkline; tiny proof-of-work to deter bots without cookies/IP; round public counters to the nearest 100; HyperLogLog "approx players today" storing only registers, reset daily; publish the endpoint source so anyone verifies zero PII; client-optimistic animation.
**Opt-in anonymous stats:** clearly-worded toggle OFF by default; send only coarse buckets (device class, viewport bucket, game slug); show the exact JSON payload before opt-in; batch once per session; per-game "too hard/easy/just right" + "was this fun?" thumbs; consent expires after 30 days (re-prompt); strip timestamps to the hour; global kill-switch overriding even yes; open-source ingestion endpoint.
**Trackerless A/B:** derive the bucket from `hash(date + experimentName) % 2` (same for everyone that day, no per-user state); day-of-week split read off GoAccess; switchback hourly site-wide; `?v=b` URL-param buckets compared in logs; measure success by the global odometer's slope or share-link clicks; pre-register each experiment (hypothesis + metric + window) in a public `experiments.md`; tie-break toward the simpler/less-code variant.
**Search Console as a free dashboard:** treat impressions-per-game-page as a PII-free demand signal; use the "queries" report to rename pages to what people actually call them; A/B `<title>`/meta via CTR; watch coverage to catch a game that fell out of the index after a refactor; mirror in Bing Webmaster for DuckDuckGo reach; GSC email alerts as a free uptime/indexing monitor; the "links" report surfaces who's embedding games.
**Retention/virality without PII:** retention proxied by the local days-played-streak distribution (aggregate, opt-in only); engagement = median session length from server-log dwell gaps; virality ≈ ratio of social-`Referer` hits to direct; "discovery success" = share of sessions opening a second game; north-star "pug-minutes played" from aggregate local exports; bounce = single-request sessions in logs.
**Share-rate measurement:** distinct `?s=twitter` param per share counted in logs; local Web Share API invocation count surfaced only in aggregate; per-platform static redirect links as share dashboards; crude k-factor = new sessions from share links ÷ sessions that shared; organic iframe-`Referer` embeds as the highest-signal share metric.
**Deciding what to build without tracking:** public roadmap driven by GitHub issue-reaction upvotes; a "dogfood diary" (you play every game weekly, log friction); GSC demand to validate a game idea before coding; prioritize by manual "code-cost ÷ expected-joy"; ship small, watch the odometer slope, keep what bends the curve; 404/search-miss logs as a backlog of demanded games; prefer reversible bets; a public "kill list" for persistently-low-traffic games.
**Qualitative channels:** one-tap "send feedback" opening a pre-filled GitHub issue; a Discord #wishlist/#bugs; `mailto:` with a subject template; optional "tell us why you quit" box (local, sent only on submit); monthly public "town halls"; GitHub Discussions polls (account-gated = low-spam); a rotating footer question ("Which pug is your favorite?") with local-only tally.
**Honest dashboards & consent:** a static, open-source `/transparency` page showing the *same* numbers you see internally; a live in-page "0 third-party requests" check that fails loudly if it ever changes; a "data we store on your device" live readout of actual localStorage keys; a CI check failing the build if any third-party domain appears in network requests; read `navigator.doNotTrack` and `globalPrivacyControl` and let the stricter signal hard-disable measurement (override the toggle, never the reverse); skip the cookie banner entirely by using no cookies; a "report a tracker" bounty; a CI test asserting zero measurement requests fire with DNT=1.

---

*End of Vol.3. Combined with Vol.1 (~1,230) + Vol.2 (~3,100), the bank now holds ~6,900 curated ideas. Build priorities: `IDEA_BANK_REFINED.md`.*
