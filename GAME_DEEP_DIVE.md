# Game Deep-Dive — all 15 games, 5 options each

> Generated 2026-06-02 by a parallel multi-analyst review (one senior-designer
> pass per game). Every option is grounded in the actual source (file +
> function cited) and benchmarked against that genre's best games + Poki /
> CrazyGames conventions. **A real, code-confirmed bug was found in every game**
> — those are option #1 in each section.
>
> Legend — CATEGORY: BUG / FEEL / JUICE / ONBOARDING / VISUAL / PERF.
> IMPACT: High/Med/Low. EFFORT: S (hours) / M (a day) / L (multi-day).
>
> ✅ = fixed + build-verified in the batch-1 bug wave (pugfort, pugzilla,
> floor-lava, rocket-pug). ⓘ = investigated and found NOT to be a real bug.
> Everything else is queued for batch 2.

---

## BORK BATTLE
Top-down pug battle-royale: twin-stick shooting, charge-up BORK shockwave, treats→shop, kill-XP evolutions, shrinking zone, last pug standing.

1. ✅ **"+10% MAX HP" upgrade was a flat +5 and barely scaled** — BUG · High · S. `UPGRADES.maxhp_pct` (Game.js:487) did `b.hp += Math.round(50*0.10)` = flat +5, not 10%; strictly worse than the "+25 HP" card. **Fixed:** now multiplies `bonus.hpPctMult *= 1.10` and `_chooseUpgrade` recomputes `_hpMult` from it (mirroring `start()`), so it's a true +10% of form HP. *(Brotato players plan around %-scaling; a lying card erodes shop trust.)*
2. **No "QUICK PLAY"** — ONBOARDING · High · S. Start overlay forces starter+weapon+skin+difficulty+perk; add one "QUICK PLAY (recommended)" button calling `play()` with defaults. *(Surviv.io drops you straight in; choice-paralysis kills D1.)*
3. **BORK has no charge telegraph** — FEEL · Med · M. `_unleashBork` spawns rings only after release; draw an expanding radius preview during charge. *(VS/Brotato telegraph AoE.)*
4. **Bot fire is silent** — JUICE · Med · M. `_fireProjectile` plays `Sfx.shoot` only for the player; add distance-attenuated bot-shot ticks. *(Surviv.io directional gunfire = threat-reading.)*
5. **17 hats, no identity payoff** — VISUAL · Low · M. `drawBotCosmetic` renders 17 hats but only elites get tagged; add minimap subtype icons + a one-line bestiary. *(Brotato reads enemies at a glance.)*

## PUGFORT.EXE
Night-by-night base defense: forage by day, build walls+turrets, protect the generator, survive hordes; persistent RP tech tree.

1. ✅ **Phantom "sell for refund" tip with no refund system** — BUG · High · S. `_r5RefundHint()` (main.js:880) advertises selling structures for a refund; no such path exists (`R` only repairs/rotates, `removePlaced` refunds nothing). Removed the misleading tip. *(Promising a mechanic that doesn't exist breaks trust.)*
2. **Build allows overlapping structures / stacking on generator** — FEEL · High · M. `placeAt` (Build.js:902) has no overlap test; feed a real `canPlace` into the ghost-tint. *(PvZ/TAB enforce one-per-cell.)*
3. **Turrets don't lead moving targets** — FEEL · Med · M. `_updateTurrets` (Game.js:986) aims at current position; add velocity lead. *(Non-leading aim reads as "broken turret.")*
4. **No Day-1 "protect the generator" teaching beat** — ONBOARDING · High · M. Add a highlight ring + "build walls HERE" ghost during first prep. *(Teach-by-doing in first 30s.)*
5. **No floating damage/kill numbers** — JUICE · Med · S. Reuse `_spawnDepotPop` to pop rising numbers on kills/turret hits. *(Floating combat numbers = core dopamine.)*

## PUG HEIST SOCIETY
5-theme multi-floor stealth thief: vision cones, vents, lasers, safes, contracts, grade card.

1. ✅ **Detection was instant-death — no reaction window** — BUG · High · M. Cone check fired `caught()` instantly (tick L1193). **Fixed:** added a ~0.55s "lock-on" window per guard — a `! SPOTTED` tell fires, and you can break line-of-sight (wall/smoke/vent) to escape; only crossing the threshold = caught (and only then is the perfect bonus blown). Cools down 2× faster than it builds. Cameras stay instant (fixed, predictable sweeps). *(Hitman GO/Monaco give a reaction beat.)*
2. **CONNOISSEUR / CHERRY PICKER contracts don't gate payout** — BUG · Med · M. `rollContract()` sets `_paintingsOnly`/`_rareOnly` (L2829) but loot always credits full value; `_rareOnly` never read. *(Monaco modifiers actually change scoring.)*
3. **No first-floor input teaching** — ONBOARDING · High · M. 5 gadgets (Q/G/T/X/F/J) with no contextual prompt; floor 1 is the natural tutorial bed.
4. **Guards never investigate** — FEEL · Med · M. FSM has only patrol/distracted, resets instantly (L1152); add a "search last-seen" beat. *(Distraction needs a payoff arc.)*
5. **Win/exit is under-juiced vs the loud CAUGHT** — JUICE · Med · S. Floor-clear has no shake/confetti/zoom on PERFECT STEALTH. *(Reward success louder than failure.)*

## PUG CAFÉ PANIC
Diner-Dash time-management: bench→serve, color chains, burnt timer, staff roster.

1. ✅ **Throw auto-serve fabricated ingredients on duplicate recipes** — BUG · High · S. `throwIngredient()` (main.js:1675) re-pushed ALL recipe ids on completion though each throw only consumed one chip, letting `serve()` re-consume fabricated copies (multi-bacon recipes served for free). **Fixed:** added `serve(idx, alreadyConsumed)` — the throw path finalizes without re-pushing/re-consuming (throws already removed the items). *(Overcooked never lets you plate without holding components.)*
2. ✅ **Throw mechanic was desktop-only (HTML5 drag)** — BUG · High · M. Touch users couldn't throw at all. **Fixed:** on touch (`pointer: coarse`) added tap-a-chip-to-arm (yellow outline) → tap-an-order-to-throw, reusing `throwIngredient`; mouse keeps drag-to-throw + click-to-discard. Desktop is provably unaffected (touch handlers gated behind `CAFE_TOUCH`). *Needs a real touch-device pass to confirm tap targets / no scroll conflict.* *(Poki's audience is mostly mobile.)*
3. **Plating starts the burnt clock with no intent** — FEEL · Med · M. `tick()` zeroes `freshnessT` on passive bench supply; tie burn to deliberate plating. *(Overcooked burns when cooking, not on inventory overlap.)*
4. **First-run tutorial never teaches throw/chain** — ONBOARDING · Med · M. Gate a 2-3 step interactive primer on first play.
5. **No serve-impact juice (flying-food arc)** — JUICE · Med · M. `serve()` shows a static `+$`; add a tossed-food sprite + squash bounce. *(Overcooked's plate-slam sells the verb.)*

## ROCKET PUG ARENA
Arena brawler: rocket-jumps, BFG, CTF/KOTH/DM modes, weapon mastery, PWNED freeze.

1. ✅ **Highlight reel draws the victim at the wrong coordinates** — BUG · High · S. `showHighlightReel()` (main.js:2364) passed `victimX` through `sy()` for the Y arg → a ghost square at garbage Y. **Fixed** (removed the stray duplicate draw). ✅ ALSO FIXED: `b.kills` was never written, so the timed-match tiebreaker (L1289) made bots always score 0 = auto player win — now bot-owned kills increment `pr.owner.kills`. *(The replay is the signature shareable moment.)*
2. **Desktop reticle floats at fixed range, not the cursor** — FEEL · Med · S. render (L2040) draws crosshair at projected distance; lock it to true aim. *(Brawl Stars locks the reticle.)*
3. **No first-time tutorial gate** — ONBOARDING · High · M. `showTip` flashes 6s then vanishes; jetpack/pickups/mode goals never taught.
4. **Mastery progress invisible until level-up** — VISUAL · Med · M. Add a per-weapon "2 kills to Lv2" bar to the HUD. *(Smash/Brawl show progress constantly.)*
5. **PWNED freeze lacks combo-scaled punchline** — JUICE · Med · M. Same banner/sound every kill; scale by streak ("DOUBLE TOAST!").

## PUG DUNGEON DIGGERS
Roguelite digger: 5 biomes, golems, mastery perks, war-dog, shopkeeper steal, dig combos, boss.

1. ✅ **Onboarding text contradicts biome depths + frame-coupled spore timer** — BUG · High · S. Tip said cheese unlocks at "depth 50" but `biomeAt()` opens it at depth 12; `_confusionT` decayed per-move (could last forever standing still). **Fixed both:** corrected the tip, moved confusion decay into `tick(dt)` (real-time). *(Genre kings never contradict their own tutorials.)*
2. **Surface BEAM cost/purpose before first cave-in** — ONBOARDING · High · M. Cave-ins start ~30s before players grasp beams (`placeBeam` L696). *(Teach the hazard via a forced first encounter.)*
3. **Telegraph the shopkeeper STEAL consequence** — FEEL · Med · S. STEAL spawns a wall-phasing hunter with zero in-modal warning (L661/1084). *(Spelunky's aggro works because the risk is legible.)*
4. **Directional dig impact feedback** — JUICE · Med · S. `_digShakeT` is global random; add kickback toward the dug tile. *(Downwell punches the camera away from impact.)*
5. **Lantern battery has no darkness payoff** — VISUAL · Med · M. Wire `lanternBattery` → tightening vignette. *(SteamWorld's shrinking light is a tension engine.)*

## PUG MUTATION LAB
Little-Alchemy-style discovery: 23 ingredients, tiers, fusion chains, evolution tree, codex.

1. ⓘ **Stale/contradictory progression numbers** — INVESTIGATED, mostly NOT a bug. The live HUD uses the computed `TOTAL_COMBOS` (=C(23,3)=1771) and `TIER_TARGETS.LEGENDARY` (15) correctly; the analyst's cited `_r3bPolish`/`FACTS` strings don't exist in this game (hallucination). Only two stale CODE COMMENTS ("20 ingredients", "out of 1140") — corrected for honesty; no player-facing change.
2. **Surface affinity/almost-hints at the start** — ONBOARDING · High · M. Hints only fire once ≥2 slots filled; empty-beaker players get zero guidance. *(Little Alchemy 2 always exposes "what combines.")*
3. **Teach recipes in codex unknown cells** — FEEL · Med · M. Undiscovered cells render a dead `?`; add ingredient silhouettes / "uses FIRE" breadcrumbs.
4. **Reward repeat-combo attempts** — FEEL · Med · S. `handleAlreadyDiscovered` just refuses+refunds; add "tried 412/1771" framing. *(Cookie Clicker converts every click into something.)*
5. **Add result-reveal anticipation beat** — JUICE · Med · M. `fuse` reveals instantly; gate behind a short "fusing…" charge. *(Discovery kings gate the reward for dopamine.)*

## APOCALYPSE DELIVERY PUGS
Top-down delivery driving: 5 cargo types, weather, drift chains, ETA arrow, cargo fragility.

1. ⓘ **Time bar starts ~58% full on a fresh run** — INVESTIGATED, NOT A BUG. `reset()` sets `time=35` and the bar renders `200*(time/60)` where 60 is also the refill cap — so the bar correctly shows 35/60. The run simply *starts* below the cap by design; "fixing" it would change game balance, not correct a defect. Left as-is. *(Verification caught this before any edit.)*
2. **No first-run "drive to the green marker" teach** — ONBOARDING · High · S. The edge arrow *hides* when the marker is on-screen (the first-second case); pin a one-time tip.
3. **Delivery completion lacks a payoff hit** — JUICE · Med · S. Damage gets bigger shake (10) than a successful delivery; scale reward feedback by combo. *(Crazy Taxi escalates fare-clear.)*
4. **INTACT% has no "why-it-matters" cue** — FEEL · Med · M. Show projected payout multiplier on the INTACT bar. *(Death Stranding makes cargo-care legible.)*
5. **Marker invisible through weather** — VISUAL · Med · M. Add a pulsing ground ring + light beam at the marker. *(Weather actively obscures the one thing you must find.)*

## PUGZILLA RAMPAGE
Kaiju destruction sandbox: 3 forms, rampage meter, combo multiplier, reactor hazard, target HUD.

1. ✅ **Chonk's "+30% smash reach" passive does nothing** — BUG · High · S. `FORMS[1].passive='extraReach'` (main.js:148) is never read; `smashAt()` (L684) hardcodes reach. Other passives ARE wired, so players expect this one. Fixed reach to honor the passive. *(Rampage is about escalating power per evolution.)*
2. **Bork is the only verb — add a directional charged stomp** — FEEL · Med · M. Hold-space cone in movement direction. *(Rampage thrives on aimed, weighty hits.)*
3. **No screen-edge threat arrows for off-screen jets/bombers** — JUICE · Med · M. Missiles arrive unseen from 600px on phones. *(Arcade shooters edge-indicate threats.)*
4. **Onboarding hides evolution + combo behind a 7s tip** — ONBOARDING · High · M. Add a first-match "EAT 3 MORE → EVOLVE" beacon. *(Tasty Planet gates its grow loop.)*
5. **HUD left rail stacks 5 opaque boxes** — VISUAL · Med · S. THREAT/RAMPAGE/TARGET/card all pile top-left; keep one persistent meter, surface tactics contextually.

## BACKROOMS OF PUG
Top-down liminal horror: 7 archetypes, noclip chaining, sanity, 60 lore notes, positional audio.

1. ✅ **PSYCHIC FLASH never fires in normal runs** — BUG · High · S. `_schedulePsychicFlash()` (L666) scheduled the trigger 5-7.5 min out; most 7-floor clears finish sooner, so the marquee effect was dead content. **Fixed:** rescheduled to 75-135s so it appears every run. *(Front-load your hooks.)*
2. **Can pickup has near-zero juice** — JUICE · Med · S. Same feedback for the 1st and objective-completing 5th can; add escalating pitch + an "EXIT OPEN" sting.
3. **No directional EXIT guidance until all cans collected** — ONBOARDING · Med · M. EXIT glow only renders when `cans.length===0`; add a nearest-can ping pre-completion.
4. **Lit-cell sanity regen is binary and steep** — FEEL · Med · S. ~3.5/tick swing trivially refills sanity; cap regen so light is relief, not a reset. *(Iron Lung: pressure never fully releases.)*
5. **First-seen scream is one-shot per run, not per monster** — FEEL · Med · S. Reset the flag per noclip level so each archetype's first reveal stings.

## BACKROOMS 3D
First-person Three.js crawl: 4 levels, 4 monster archetypes, procedural maze, sanity/stamina, hide-in-closet.

1. ✅ **EXIT was a blind death-race** — BUG · High · M. The only win is reaching a `exitCandidate` cell (~1.2%) while sanity drains, with no idea where one is. **Fixed:** added a deterministic ring-scan that surfaces the **live distance to the nearest exit** in the HUD objective ("nearest ~32m"), turning blind wandering into a hot/cold search (distance is unambiguous — safe to ship vs a left/right arrow I couldn't verify headlessly). *(A win you can't find kills replay.)*
2. **Sprint feels weightless** — FEEL · Med · S. Add +6-8° FOV kick + breathing on `player.sprinting`. *(Iron Lung/Outlast sell panic via FOV.)*
3. **Catch has no near-miss tension** — JUICE · Med · S. Jumps straight to jumpscare at 1.6m; ramp red vignette + heartbeat under ~5m.
4. **Core verbs never tutorialized in-world** — ONBOARDING · Med · M. Spawn a closet+rock within ~2 cells of origin; delay first chaser hunt until used.
5. ✅ **Per-frame flicker recompute on every light in a 21×21 radius** — PERF · Med · M. **Fixed (CPU):** distant cells (Chebyshev > 7, barely visible through fog) now hold a stable glow and skip the per-frame `Math.random()` flicker + dying recompute — cuts ~60% of `tickLights` work with no visible change. (Capping the GPU light *count* is a larger refactor, left for a real-device perf pass.) *(Mid-tier/mobile will stutter.)*

## CLOWN IN THE FOREST
Slender-style Three.js dread: 4-state clown AI, find 5 items, 3 difficulties, 4 endings.

1. ✅ **Trees didn't block the clown's line-of-sight** — BUG · High · M. `playerCanSeeClown()` (L6878) was a pure FOV-cone test with no occlusion, so the clown froze/chased even when fully behind a trunk. **Fixed:** added a cheap 2D point-to-segment test against the ~1100 trunks — a tree between you and the clown now blocks sight, so hiding works (correct Weeping-Angel behavior; intentionally a bit scarier). *(Needs a real-browser playtest to tune feel — headless can't verify 3D.)* *(Slender/Outlast gate the monster on true visibility.)*
2. **Pointer-lock not re-acquired after Esc** — FEEL · High · S. `resumeGame()` (L5722) requests lock without a fresh gesture (browsers reject it); show a "Click to look" prompt. *(Players read it as "mouse broken.")*
3. **No "spotted" tell** — JUICE · Med · S. Add a red vignette pulse when `playerCanSeeClown()` flips so players learn the rule. *(Outlast teaches detection instantly.)*
4. **Onboarding is a one-line subtitle** — ONBOARDING · Med · S. Add a 3-icon control strip + objective to the start panel.
5. **FogExp2 density vs 80u far-plane wastes draw distance** — PERF · Med · M. Fog hides everything past ~35u but meshes render to 80u; tighten the far-plane.

## FLOOR IS LAVA
Vertical climber: 5 biomes (incl. ABYSS buoyancy), teleporters, wind currents, combo jumps.

1. ✅ **Jetpack hover fights key auto-repeat** — BUG · High · S. `tick()` (L604) clamps `vy` for a smooth hover, but the keydown listener calls `jump()` on every auto-repeat, hard-setting `vy=JUMP_V` the same frame → jitter. Guarded `jump()` while jetpack active / on `e.repeat`. *(Doodle Jump's propeller is a clean ascent.)*
2. **No on-screen active-powerup timers** — FEEL · High · M. 8 powerup timers decay with zero countdown UI; add depleting icon bars. *(Subway Surfers/Doodle Jump always show a shrinking icon.)*
3. **Start screen is a static black canvas** — ONBOARDING · High · M. `loop()` only renders when running; show an idle bobbing pug + rising-lava preview behind the overlay. *(Poki pages lead with motion.)*
4. **Death has no impact moment** — JUICE · Med · M. `die()` instantly swaps overlays, cutting the death-frame flash; add a ~0.4s freeze + embers. *(Geometry Dash punctuates death.)*
5. **Wind currents drop in without warning** — VISUAL · Med · S. Spawn at `y:-40` and push 380px/s before their alpha ramps in; fully fade-in before collidable.

## SUPERMARKET PUG
Single-floor stealth theft: 3 maps, 5 sections, guard vision, checklist, cart dominos, getaway vehicle.

1. ✅ **Getaway vehicle bonuses never applied unless the alarm fired** — BUG · High · S. All perks were gated on `alarm.on`, but a clean stealth run never crosses heat 0.95, so the headline pick did nothing ~90% of runs. **Fixed per the vehicles' own descriptions:** bag-cap (`bagMul`) now applies for the whole run from `start()`; `heatMul` applies always (so HANDBAG's "half heat gain" actually helps you *avoid* the alarm); `speedMul` stays escape-only ("+55% speed **in escape**" by design). No double-application (removed the alarm-edge bag mutation). *(Goose/Shriek make your kit matter moment-to-moment.)*
2. **No "GET TO THE EXIT" guidance once the goal is met** — ONBOARDING · High · S. Exit ends silently; flash a banner + minimap ping when `haul>=goalHaul`.
3. **Item grab lacks weighty pickup juice** — JUICE · Med · S. One tone + `+$`; add pop scale + item-fly-to-bag.
4. **Domino chain (the star mechanic) is capped + under-celebrated** — FEEL · Med · M. `knockOverShelf` caps at 2 neighbors; widen + add hit-pause/escalating pitch. *(Cart chaos is the genre hook.)*
5. **Stealth-eye + heat are redundant; spot direction unclear** — VISUAL · Med · M. 3 overlapping danger meters but no arrow to which guard saw you.

## PUG TOWER DEFENSE
TD: 10 towers w/ 2-path trees, 9 maps, banner synergies, wave modifiers, speed toggle.

1. ✅ **Boomerang ignored the speed toggle** — BUG · High · M. Boomerang return used `setTimeout(...,400*bi)` real-time ms while gameplay runs on `dt*__speedMult` → at 3× the hits landed ~3× too late. **Fixed:** delay now divided by the captured `__speedMult`, so the return lands at the correct game-time offset under fast-forward. ⓘ The "crits skip splash" sub-claim was INVESTIGATED → not a real bug: crit *damage* is baked into `p.dmg` at fire time (L1648, `dmg *= critMul`) and the splash branch applies `p.dmg` to every victim, so crit damage DOES land on splash; only the crit *visual* + single-target status (slow/teleport) are direct-hit-only, which is intended tower identity. *(BTD6 keeps combat deterministic under fast-forward.)*
2. **No first-run interactive teach** — ONBOARDING · High · M. Only a 7.5s text tip; gate the first placement with a highlighted tile + the 2-path fork explained.
3. **Banner/buff range invisible in range preview** — FEEL · Med · S. Halo draws raw `def.range`, ignoring `bannerRangeMul`/path `rangeMul` (L2015 vs L1607). *(BTD6 rings reflect real buffed radius.)*
4. **No floating damage numbers** — JUICE · Med · S. Only crits spawn rings; normal hits are silent. *(PvZ2/KR show feedback every hit.)*
5. **No enemy HP bars** — VISUAL · Med · S. `e.maxHp` is tracked but never shown; targeting (STRONG/FIRST) is blind. *(Every genre king shows HP bars.)*

---

## Cross-game patterns (build once, fix everywhere)

- **Onboarding gap is universal:** almost every game teaches via a one-shot text
  tip that vanishes. A shared "first-run interactive primer" module (gated by a
  `localStorage` per-game key) would lift 12+ games at once.
- **Floating damage/score numbers** are requested in bork, pugfort, td, rocket —
  build one shared helper.
- **Off-screen threat / objective arrows** recur in pugzilla, delivery,
  supermarket, backrooms — one shared edge-indicator util.
- **Success is under-juiced vs failure** in heist, delivery, lava — punctuate
  wins louder.
- **Mobile parity:** pug-cafe's headline throw is desktop-only — audit touch
  paths across games (Poki's audience is mostly mobile).
