# BORKADE — Idea Bank Vol.4 (Research → Generation, fresh high-impact domains)

**Pipeline (this volume):** 7 research agents (real web research, cited) → 7 generation
agents (each grounded in a brief). ~1,100 distinct, implementable ideas in domains
**not** covered by Vol.1–3, deliberately chosen for high impact: frame-level juice
craft, mobile/touch-first, web-performance-as-UX, deep accessibility, 2026
shareability/virality, mastery/leaderboard/daily systems, and adaptive Web-Audio sound.

Honest scope note (unchanged from Vol.3): this is the research→generation pipeline run
again at its real quality ceiling — each agent yields a few hundred *distinct* ideas, not
a literal 10k. Padding to 140k would bury the good ideas and make the bank unusable;
quality-over-count is the deliberate choice. Combined with Vol.1–3, the bank now holds
~8,000 curated ideas. Build priorities remain in `IDEA_BANK_REFINED.md`.

---

## Research foundation (7 cited briefs — key findings)

**R1 — Juice neuroscience.** Hitstop is the highest-ROI technique (Capcom ~8-frame/133ms
freezes; freeze attacker+victim only). Input-latency cliff: <50ms feels instant, >100ms
laggy — read input → integrate → render in the *same* RAF tick. Dopamine = reward-
prediction-error; *uncertainty sustains it* (vary reward magnitude; telegraph before
payoff for anticipatory release). Audio-visual synchrony must land within the ~100–150ms
temporal binding window — fire SFX+particles+flash+shake on the *same frame*. Layer 4+
channels per action; add anticipation + follow-through (squash/stretch). Coyote ~80–120ms
+ input-buffer ~100ms. Flow = sawtooth tension-release. *(Swink Game Feel; Nijman "Art of
Screenshake"; Vlambeer; RPE/dopamine + temporal-binding-window literature.)*

**R2 — Mobile/touch-first.** Thumb-zone = bottom ~40% of portrait; menu top-right.
Swipe (≥20–30px threshold), *floating* joystick (spawns at thumb), split-screen
multitouch via `e.touches` partition. Touch targets ≥44–48px; inflate the *hitbox in code*
beyond the artwork. iOS: `touch-action:manipulation` (300ms delay is gone, FastClick is
obsolete), `100dvh/svh` not `100vh`, AudioContext+vibrate need a user gesture,
`touch-action:none` on canvas, `user-select:none`. Haptics tiny (10–30ms),
confirmation-only, feature-detect+toggle. `viewport-fit=cover` + `env(safe-area-inset-*)`.
PWA: Android `beforeinstallprompt` custom button; iOS manual A2HS tip. *(MDN; Chrome
Developers; UXPin; web.dev.)*

**R3 — Web performance as UX.** CWV 2026: LCP ≤2.5s (aim 2.0), INP ≤200ms, CLS ≤0.1 for
75% of visits. 53% abandon if load >3s; each +1s ≈ −7% conversion. JS budget <300KB (ideal
<200KB) first load, chunks ≤50KB (~1ms parse/KB mobile). Vite route-split per game via
dynamic `import()`; shared Pixi/Three vendor chunk; Brotli; CI bundle-size budget. Canvas:
single rAF, sprite atlases (1 bind), object pooling (~0 alloc/frame → no GC→INP spikes).
Three.js mobile: <50 draw calls, InstancedMesh, pixelRatio ≤2, shadows off, KTX2. Teardown
rAF+audio+WebGL on `visibilitychange`/navigate. Measure trackerless: Lighthouse CI +
WebPageTest. *(corewebvitals.io; web.dev; Calibre; Three.js perf docs.)*

**R4 — Deep accessibility.** Game Accessibility Guidelines (6 categories × Basic/Inter/
Advanced) — ship all "Basic" first. Xbox AG as per-game QA checklist. Motor: remap
*actions* not keys, hold-vs-toggle, no rapid-mash, game-speed 50–100% slider. Vision:
never color-alone (pair shape/icon), Okabe-Ito colorblind-safe palette, scalable text,
SR-navigable HTML menus. Hearing: every gameplay sound needs a visual twin. Cognitive:
Relaxed preset, change difficulty anytime without losing progress, pause-anywhere.
Photosensitivity: ≤3 flashes/sec, no full-screen saturated-red, honor
`prefers-reduced-motion`. Highest ROI = one shared Settings panel across all 15 games.
*(gameaccessibilityguidelines.com; Microsoft XAG; AbleGamers Includification; WCAG 2.2;
Okabe-Ito.)*

**R5 — 2026 virality.** A clip must read in <3s and look good frozen as one frame — design
each game around ONE "money moment." Engineered fail/rage-bait beats are shareable.
Wordle playbook (all no-backend): copy-to-clipboard emoji/text result card that tells a
story without a link/spoiler; one Share button on game-over; daily seeded challenge
(date=seed, identical worldwide, comparable "#214"); challenge-a-friend via URL hash; pre-
baked per-game OG images for clean unfurls. Mascot+streamer = amplifier (make Bork meme-
able: "BORK!", reaction faces, victory pose, recognizable muted). Ethical virality (no
share-to-unlock, no nag, no login) — the no-ads/no-tracking promise IS a virality asset.
*(Webflow/Wordle; aakashg.com; GeoGuessr; Vercel OG; Kotaku/Fever Meme; itch.io.)*

**R6 — Mastery/speedrun/leaderboards.** Separate a *floor* (clear it) from a *ceiling*
(max points) — every game needs a risky optional point source. DMC Style Rank (reward
variety, diminishing returns on repetition, live decaying meter). Bushnell's Law: simple
controls + layered depth. No-backend leaderboards: deterministic seeded PRNG (daily = UTC
date), personal-best + daily-seed in localStorage, scores shareable/self-reported not
authoritative. GHOST replay (record best run as input/position trace, replay as
translucent ghost) = highest-leverage retention. Daily formats ~70% retention; sustainable
non-shaming streaks (grace day + cumulative tally). *(TV Tropes Scoring; DMC wiki;
Bushnell's Law; speedrun.com/LiveSplit; daily-challenge retention studies.)*

**R7 — Adaptive audio (Web Audio).** Vertical layering (stems via per-stem GainNodes to
scale intensity); horizontal resequencing (swap loops at bar boundaries); stingers over
the bed. CRITICAL timing: lookahead scheduler (~25ms interval scheduling notes due in next
~100ms vs `AudioContext.currentTime`), never bare setTimeout. Procedural chiptune =
Oscillator (sine/square/tri/saw) + ADSR; freq sweeps via `exponentialRampToValueAtTime`;
white-noise buffer for percussion. Anti-repetition: randomize pitch ±20%, round-robin
pools. Ducking via a master GainNode (−6dB 200ms on big events). StereoPannerNode by
on-screen X. Mobile: resume AudioContext on user gesture (bind touchstart AND touchend on
iOS). *(web.dev "Tale of Two Clocks"; MDN Web Audio; thegameaudioco; chiptune Web Audio
guides.)*

---

## Sections
- V4-1. Frame-level juice & game-feel craft
- V4-2. Mobile & touch-first design
- V4-3. Web performance engineering
- V4-4. Deep accessibility
- V4-5. Shareability & viral moments
- V4-6. Mastery, scoring depth & daily/leaderboard systems
- V4-7. Adaptive audio & procedural sound

> The full numbered idea lists for each section follow. (~1,100 ideas total.)

---

## V4-1. Frame-level juice & game-feel craft

### Hitstop systems (per-event budgets)
1. Build one global `hitstop(frames)` helper that zeroes `dt` for N frames while still pumping RAF — never `setTimeout`-pause the loop.
2. Scale freeze by impact tier: light hit 2 frames (~33ms), solid hit 5 frames (~83ms), kill/crit 8 frames (~133ms) — cap at 120ms so it never reads as a stutter.
3. Freeze BOTH attacker and victim sprites on the same frame; let only particles/flash continue so the world reads "punched, not paused."
4. Pug-bite hitstop: 4 frames on contact, then a 1-frame overshoot of the jaw before release.
5. Coin/pickup hitstop is illegal — pickups get a 1-frame scale-pop instead, reserve true freeze for combat/collision only.
6. Stack a tiny variable jitter (±1 frame) onto hitstop duration so repeated hits never feel metronomic.
7. During hitstop, hold the SFX attack transient (don't let it decay) so audio confirms the freeze.
8. Boss/big-impact hitstop 10–12 frames + a 60ms global desaturation flash that resolves as time resumes.
9. Chain-combo hitstop decays: 1st hit 6 frames, each subsequent hit −1 frame (min 2) so flurries stay snappy.
10. Add a 1-frame pre-hit freeze on the WIND-UP contact frame so the brain registers anticipation before the stop.
11. Per-game hitstop toggle in a `JUICE` config object so puzzle/idle games can disable it wholesale.
12. Never apply hitstop to camera-follow lerp target — freeze the sprite, let the camera keep its eased catch-up.

### Input-latency discipline
13. Read input at the TOP of the RAF tick, integrate movement, THEN render — never sample input post-render (saves a full frame).
14. Budget total input→pixel under 50ms; log `performance.now()` delta in a dev overlay and fail-loud past 80ms.
15. Apply player velocity changes immediately on keydown, not on the next fixed-step, to dodge the accumulator's hidden latency.
16. Use `pointerrawupdate` / `keydown` (not `keypress`) and avoid `passive:false` scroll-blocking that injects jank.
17. Pre-bind all input handlers once; never allocate closures per-frame inside the loop (GC pauses = phantom latency).
18. Decouple physics fixed-step (e.g. 120Hz) from render so a 60Hz display still gets sub-frame-fresh input.
19. Kill any `requestAnimationFrame` double-buffer lag by drawing to the visible canvas directly, not an offscreen copy you blit late.
20. On mobile, register `touchstart` with `{passive:true}` and act on it instantly — don't wait for `touchend` for jumps/taps.
21. Predict-and-correct: move the pug on input prediction this frame, reconcile against physics next frame if they disagree.
22. Avoid layout-thrash latency — never read `getBoundingClientRect` inside the loop; cache canvas rect on resize only.

### Anticipation & follow-through (pug squash-stretch)
23. Jump = 2-frame anticipatory squash (scaleY 0.8) BEFORE leaving ground, then stretch (scaleY 1.2) on launch.
24. Landing = squash to 0.7 height on impact frame, then overshoot to 1.1 and settle to 1.0 over 4 frames.
25. Pug start-running: 1-frame lean-back wind-up, then snap forward into the run cycle.
26. Stop/skid: overshoot past the stop point, ears/jowls trail one frame behind the body, then settle back.
27. Bark/attack: jaw winds up closed for 2 frames, snaps open with a +15% horizontal stretch, follows through to slight overshoot.
28. Tie squash-stretch to velocity magnitude so a tiny hop barely deforms and a big slam squashes hard — never a fixed amount.
29. Conserve volume: when you squash height to 0.8, widen to ~1.25 so the pug never loses visual mass.
30. Ears, tail, and jowls get a 1–2 frame follow-through offset from the torso (cheap secondary motion = alive).
31. Tongue lolls out on fast deceleration and snaps back on acceleration — free directional feedback.
32. Direction-flip: don't instant-mirror; do a 2-frame horizontal squash-through-zero so the turn has weight.

### Same-frame multi-channel feedback
33. Define a `FEEL.impact()` that on ONE frame fires: shake + flash + particles + pitch-varied SFX + squash — never sequence them.
34. Land all audio-visual feedback inside the ~120ms binding window or the brain splits it into two events.
35. Layer minimum 4 channels per meaningful action; 5+ for kills (add chromatic-shift or freeze).
36. White-flash the hit sprite for exactly 1 frame (additive blend), not a fade — a fade reads as mushy.
37. Pitch-vary every repeated SFX ±8% so spammed actions don't fatigue the ear (variance, not repetition).
38. Spawn particles AT the contact point computed this frame, not at the sprite origin — sub-pixel placement sells it.
39. Couple shake direction to impact vector: hit-from-right shakes left, never an omnidirectional rumble.
40. Tie a 1-frame radial vignette pulse to big hits so the screen edges "breathe" with the impact.
41. Fire a sub-bass "thud" layer under the main SFX for heavy hits — felt more than heard, sells weight.
42. On the SAME frame as a kill: hitstop + flash + debris + downward-pitched SFX + 1 controller-style shake burst.

### Variable & anticipatory reward feedback
43. Vary reward magnitude per pickup (±20% score popup size + particle count) to drive reward-prediction-error dopamine.
44. Telegraph payouts: 8–12 frame anticipation glow on a chest/combo before it pays, building anticipatory dopamine.
45. Occasional (~10%) "surprise" jackpot pickup with outsized juice — uncertainty sustains engagement longer than fixed rewards.
46. Combo milestones escalate juice non-linearly: x5 small, x10 screen-flash, x25 slow-mo + fanfare — sawtooth payoff.
47. Near-miss feedback: when the pug *barely* dodges, brief slow-mo + whoosh — reward the skill, not just the score.
48. Stagger multi-pickup payouts by 2 frames each (cha-ching ladder) so a cluster reads as escalating, not simultaneous.
49. Randomize coin-pop pitch upward through a combo (do-re-mi ladder) and reset on combo break.
50. Delay the score-number commit ~6 frames behind the pop so the eye sees "earned" then "counted."
51. Variable particle burst count (8–16) per identical pickup so no two grabs look mechanically cloned.
52. "Almost" telegraph: a reward you nearly got flashes briefly visible before vanishing — primes the next attempt.

### Permanence & world memory
53. Debris/shards from hits linger 3–8s and fade, never instant-despawn — the world remembers the action.
54. Scuff marks / paw prints persist on the floor where the pug skidded, baked to a static "decal" layer.
55. Cap the persistent-decal layer at N entries (ring buffer) so permanence never tanks the frame budget.
56. Cracks accumulate on a wall/glass with each hit and stay — visible progress toward breaking it.
57. Defeated enemies leave a fading silhouette/ghost for ~1s rather than popping out of existence.
58. Spent shell casings / dropped bones pile up and settle physically, then bake into the static layer after 2s.
59. Splatter (mud, treats, paint) accumulates on the backdrop across a run and only clears on restart.
60. Trail of last ~12 pug positions rendered as a fading motion-ghost during dashes — permanence of motion.
61. Persistent score-confetti settles to the floor and stays for the run rather than fading mid-air.
62. Bake lingering decals to an offscreen canvas once they stop animating — permanence with zero per-frame cost.

### Coyote time & input buffering
63. Coyote time ~6 frames (100ms): allow a jump for 100ms after the pug walks off a ledge.
64. Jump input buffer ~100ms: a jump pressed just before landing fires the instant ground is touched.
65. Buffer the LAST input only (not a queue) so early presses don't stack into double-actions.
66. Visually nudge the pug 1px toward a ledge edge during coyote window so the forgiveness reads as intentional.
67. Dash/attack buffer ~120ms so eager players never feel a "dropped" input on tight sequences.
68. Corner-correction: if a jump clips a platform corner by ≤4px, nudge the pug over instead of blocking.
69. Tune coyote+buffer per game and surface both in the `JUICE` config — platformer generous, precision game tight.
70. Reset coyote timer on dash/double-jump consumption so forgiveness can't be exploited for free air.
71. Sticky-edge: brief 80ms grace where the pug clings to a ledge lip before falling — readable, fair.
72. Buffer jump through hitstop: an input during freeze queues and fires the frame motion resumes.

### Sawtooth pacing & flow
73. Structure each level as tension-ramp → spike → release-beat (calm room/collectible lull) → steeper ramp.
74. Insert a 1.5–3s "breather" after every boss/wave so the dopamine valley makes the next peak hit harder.
75. Escalate spawn rate on a sawtooth, not a ramp — sudden drops reset the player's stress and re-engage attention.
76. Tie music intensity layers to the sawtooth: add a percussion stem at each tension step, strip it on release.
77. Reward the release beat with safe collectibles so calm still feels productive (no dead air).
78. Difficulty rubber-bands gently toward the player's recent performance to keep them on the tension knife-edge.
79. Telegraph each spike with a 1–2s warning cue (light dim, audio sting) so the spike reads as earned, not cheap.
80. End every run on a micro-crescendo (final-second score tally fanfare) so the last memory is a peak.

### Camera craft
81. Camera leads the pug's facing direction by ~40px so the player sees where they're going, not where they were.
82. Decaying directional shake: impulse then exponential damp — never a fixed-duration uniform wobble.
83. Look-ahead on velocity: faster pug = camera offsets further ahead, eased, so speed feels readable.
84. Trauma-based shake: accumulate a 0–1 `trauma` value, shake = trauma², decay linearly — multiple hits stack naturally.
85. Clamp shake amplitude per game in `JUICE` so a screen full of hits never becomes unreadable seasickness.
86. Punch-zoom: snap camera in ~3% on a big hit, ease back over 8 frames — focuses the eye on impact.
87. Smooth camera with a critically-damped spring, not linear lerp, so it never overshoots or rubber-bands.
88. Freeze camera shake during hitstop, release the stored shake energy the frame motion resumes.
89. Vertical leading on jump: bias the camera slightly up at apex so the player sees the landing zone.
90. Decouple shake from the world transform (apply to a wrapper) so UI/HUD never shakes with the playfield.

### Sprite & visual micro-juice
91. 1-frame additive flash on spawn so every entity "pops" into existence rather than appearing.
92. Idle breathing: ±2% scaleY sine on the pug at rest so it never reads as a frozen sprite.
93. Sub-pixel positioning with rounded *render* but float *logic* so slow movement isn't a stair-step.
94. Rotate the pug ±5° into its movement direction (banking) on fast turns for momentum read.
95. Squash the shadow independently — wider/lighter at jump apex, tight/dark on ground — sells height.
96. Anticipatory eye-dart: pupils flick toward a threat 2–3 frames before the pug reacts (telegraphs AI intent).
97. Speed lines / motion blur streak only above a velocity threshold so it means "fast," not "always on."
98. Color-grade the whole frame warmer on success beats, cooler on danger — mood without UI text.
99. Trail afterimages tinted to the pug's palette during dash, alpha-decaying over 6 frames.
100. Recoil the pug 2–3px backward on firing/barking, ease forward — every output action has a physical cost.

### Audio-feel coupling
101. Trigger SFX on the exact contact frame, never on animation-start — sync the sound to the visual peak.
102. Layer attack SFX = transient (click) + body (thud) + tail (ring); pitch the transient up with combo.
103. Footstep SFX fire on the squash frame of the run cycle, not on a timer — locked to the visual step.
104. Duck the music −3dB for 80ms on big hits so the impact SFX punches through, then restore.
105. Low-pass the whole mix during slow-mo/hitstop, snap it back open the frame time resumes.
106. Randomize from a pool of 3–4 variants per repeated SFX (not pitch-only) to defeat ear fatigue.
107. Rising pitch sweep over a charge-up that resolves into the release SFX — anticipatory audio dopamine.
108. Spatial-pan SFX by on-screen X position so off-center events read directionally even in stereo.

### Juice budgets & performance discipline
109. Define a per-game `JUICE` config: max particles, max shake trauma, hitstop on/off, decal cap, flash intensity.
110. Hard-cap simultaneous particles per game (e.g. 300) with a recycling pool — never `new`-allocate in the loop.
111. Budget ≤2ms/frame for all juice combined; profile and cut the cheapest-value channel first if over.
112. Pool and reuse every transient object (particles, popups, decals) — zero allocations inside the RAF tick.
113. Throttle screen-shake and flash on `prefers-reduced-motion`; keep SFX/particles so feel survives accessibly.
114. Tier juice by device: detect low frame budget and drop particle counts/decals before dropping frames.
115. Bake settled permanence to a static canvas so the live draw call count stays flat regardless of run length.
116. One shared particle system across all entities, not per-entity emitters — fewer draw calls, one pool.
117. Gate every juice channel behind a single `if(JUICE.enabled)` so the whole layer is one-switch removable for debugging.
118. Measure feel changes by input→feedback latency in the dev overlay, not by eye — make game-feel quantifiable.

### Combo, streak & escalation feel
119. Combo counter scale-pops bigger with each increment (1.0→1.4 cap), eases back — visible momentum.
120. Combo timer drains as a shrinking ring around the counter so the player feels the window closing.
121. Combo break = hard 4-frame freeze + desaturate + descending SFX — make the loss FELT, not silent.
122. Screen-edge heat: a warm glow creeps in from the borders as combo climbs, recedes on break.
123. Every Nth combo tier swaps the hit-flash color (white→gold→red) for escalating visual stakes.
124. Combo multiplier text trails the score with a 2-frame lag so "x12" lands just after the points.
125. Pitch the combo "tick" SFX up a semitone per hit until it caps, then sustain a held tone at max.

### Death, failure & restart feel
126. Death = 6-frame hitstop + full desaturate + radial shockwave + drop the music to a single held note.
127. Slow-mo the final death moment to ~30% speed over 12 frames so the player sees exactly what killed them.
128. Restart is instant (<200ms) — no menu round-trip; failure must cost time only in dread, not in clicks.
129. On death, freeze the killing blow on screen for ~400ms before the fail card so the cause is unambiguous.
130. Fade the world to grayscale on the fail frame but keep the pug colored for one beat — emotional focus.
131. Respawn = anticipatory 3-frame squash on the ground, then pop up — entrance gets follow-through too.
132. Death camera punches in slightly on the pug, not out — intimacy with the failure, then cut to retry.

### Pickup, collect & progression feel
133. Pickups arc toward the pug with eased magnetism inside a radius, accelerating in — they "want" to be caught.
134. Pickup absorb = 1-frame scale-pop on the pug + a ring-burst at the absorb point, locked same frame.
135. Score popup floats up, scales in over 3 frames, holds, then fades — never a static instant number.
136. Coins/treats jiggle on a sine idle so the eye catches them as "alive" against the static backdrop.
137. Stack collected-item icons in the HUD with a 1-frame pop each so accumulation feels tactile.
138. A "last collectible" of a set gets outsized juice (fanfare + flash) — completion is a peak, not a footnote.
139. Magnet pull strength scales with combo so a hot streak literally vacuums treats — reward compounds.
140. Bounce a freshly-spawned pickup once on landing (squash on contact) so it announces itself.

### Movement & traversal feel
141. Acceleration/deceleration curves, never instant velocity — ease into top speed over ~6 frames for weight.
142. Air-control slightly looser than ground control so jumps feel floaty-but-fair, tuned per game.
143. Dash = brief 4-frame freeze of facing + afterimage trail + camera punch in the dash direction.
144. Wall-bonk = squash against the wall + 2px rebound + dust puff, never a dead stop.
145. Variable jump height: release-to-cut gravity so a tap is a hop and a hold is a full leap.
146. Apex hang: reduce gravity ~30% for 3 frames at jump peak so the top of the arc feels controllable.
147. Slope-stick: snap the pug to downhill ground instead of launching off bumps — smooth traversal read.
148. Landing dust-puff scales with fall velocity so a big drop kicks up more than a small step.

### Telegraphing & readability
149. Every enemy attack gets a 6–12 frame wind-up tell (color shift, scale, audio sting) before the hit-frame.
150. Danger zones pulse on a 1Hz sine before activating so the threat is learnable, never a surprise.
151. Telegraph color-codes by reaction: yellow = dodge, red = unblockable, blue = punish window.
152. Incoming-projectile direction marker on the screen edge if the source is off-camera — fairness over surprise.
153. Boss tells escalate: the same attack telegraphs faster as the fight progresses, raising tension on a sawtooth.
154. A 1-frame full-screen flash precedes a screen-clearing attack so the player gets a fair "brace" beat.
155. Hover/aim feedback: the target highlights the frame it's acquired, not after a delay — instant intent confirmation.

### Cross-game consistency & tuning
156. Centralize all feel constants (hitstop frames, coyote ms, shake decay) in one shared `feel.js` imported per game.
157. Keep the binding window sacred everywhere: any feedback >150ms after its cause is a bug, not a style choice.
158. A/B feel by hot-swapping the `JUICE` config at runtime via a dev panel — tune by feel, lock by number.
159. Reuse the same squash-stretch curve constants across all pug sprites so the character feels consistent site-wide.
160. Document each game's juice budget in a header comment so feel is intentional, not accidental.
161. Snapshot input→pixel latency per game in CI-style dev logging so a regression in feel is caught like a code bug.
162. Default every new game to the shared `feel.js` baseline so "good game-feel" is the floor, not a per-game rediscovery.

> Sections V4-2 through V4-7 below are tight digests (sub-headings + strongest ideas)
> of each generation agent's full ~150-idea list; the complete raw lists live verbatim
> in this session's transcript. ~1,100 ideas total across the seven sections.

---

## V4-2. Mobile & touch-first design

**Thumb-zone layout & safe areas:** anchor primary actions in the bottom ~40% hugging the right edge; "left-handed" mirror toggle (localStorage); pause top-right at 48px; wrap canvas in `env(safe-area-inset-*)` + `viewport-fit=cover`; use `100dvh/svh` not `100vh`; reserve a 34px iOS home-bar gutter; keep score/lives top, never under thumbs; scrim behind bottom buttons.
**Hit-area inflation:** inflate touch hitboxes to ≥48px even for 24px art; snap-to-nearest within 16px touch-slop; ≥8px dead-space between targets; 56px retry/menu buttons; DPR-aware px; decouple hitbox from render rect (crisp art, big target).
**Swipe & gestures per genre:** lane-runner = swipe ≥25px to switch lane / up=jump / down=slide; commit on distance OR velocity; flick-to-throw captures angle+magnitude; long-press (350ms, radial fill) for crouch/hold; double-tap dash (250ms window); two-finger tap = pause; one-time ghost-finger tutorial on first mobile launch.
**Floating joystick:** spawns at touch-down in the left half; 60px clamped radius, normalized vector, ~10px deadzone; sticky-follow beyond max; fades to 35% idle; auto-hide on release; "fixed joystick" alternative in settings.
**Multitouch:** partition `e.touches` by `clientX < innerWidth/2` (left=move, right=action); track by `identifier` so lifting one finger never cancels the other; handle per-`changedTouches` to dodge the iOS "second touch cancels first" bug; 30ms haptic on action only.
**iOS fixes:** `touch-action:manipulation` on buttons (kills 300ms delay, no FastClick), `touch-action:none` on canvas (no scroll/zoom/pull-refresh), `user-select:none`, `-webkit-tap-highlight-color:transparent`, `-webkit-touch-callout:none`; resume AudioContext + warm-up vibrate inside the first gesture; `apple-mobile-web-app-capable`; lock body scroll (`position:fixed`) during play; re-measure on `visualViewport` resize.
**Haptics:** 10ms on pickup, 20ms double-pulse on level-complete, 30ms on game-over, 40ms on "caught"; feature-detect `'vibrate' in navigator`; debounce continuous collisions to ≤1 pulse/200ms; settings toggle; conservative for battery.
**Orientation:** portrait default for tappers/runners, landscape for free-roam with a friendly mascot "rotate" overlay (pause underneath); `matchMedia('(orientation:portrait)')` listener; remember last-used per game; `screen.orientation.lock` where supported with graceful fallback.
**PWA install:** capture Android `beforeinstallprompt`, show a custom "Install" button, fire on tap then null it; iOS one-time "Share → Add to Home Screen" tip; suppress if already `display-mode:standalone`; maskable 512/192 icons; defer the nudge until after the first game; don't re-nudge a dismisser for 7 days.
**One-handed & plumbing:** tag/"one-hand" badge games beatable one-handed; use Pointer Events as the unified path with `setPointerCapture` on drags; `preventDefault()` handled gestures; coordinates via `getBoundingClientRect`+scale; throttle `pointermove` to one/frame; clear touch state on `pointercancel`/`visibilitychange`; `@media (pointer:coarse)` to switch UI, never UA sniffing.
**Per-game touch schemes:** Pug-Heist floating-stick + grab button + long-press crouch; Delivery flick-throw with arc preview; Floor-Lava swipe-up jump / swipe-dash (25px); Backrooms-3D left stick + right-drag look + double-tap sprint; stacker = tap-anywhere drop; flappy-style = full-screen hold-to-ascend.
**Defensive & a11y:** 300ms input lockout after transitions; ignore touches starting outside canvas; auto-pause on `visibilitychange`→hidden + "tap to resume" gate; cap tracked touches at 3; "large controls" (64px) + "hold-instead-of-tap" + adjustable swipe-sensitivity assists; global left/right-hand toggle site-wide.

## V4-3. Web performance engineering

**Budgets & CI gating:** hard first-load JS budget 200KB gzip/route (fail CI); vendor (Pixi/Three) ≤120KB Brotli, alert on +5KB drift; per-chunk ≤50KB; `size-limit` per entry; Lighthouse-CI assertions LCP<2.0s/INP<200ms/CLS<0.05/TBT<150ms; committed per-game "weight ledger" diffed in PRs; draw-call budget (2D ≤2 binds, 3D ≤50); texture-memory ≤64MB; audio ≤150KB preload; reject >30KB deps without a `// BUDGET-OK` note.
**First-frame & load:** attract-loop frame within 300ms (never blank canvas); inline <5KB bootstrap that paints frame 1; lazy-load audio after first interaction; `requestIdleCallback` atlas decode; `modulepreload`/prefetch a game's chunk on hub-tile hover; `decoding="async"` + explicit width/height (CLS~0); deterministic skeleton sized to canvas; boot rAF with a stub scene and swap assets in.
**Code-splitting:** route-split every game via dynamic `import()` (hub ships zero game code); separate Pixi/Three vendor chunks loaded only by users; shared "engine-lite" chunk; tree-shake by named submodule imports; `manualChunks` pinned hashes; Brotli precompress; strip dev assertions; target esnext (no needless polyfills); `rollup-plugin-visualizer` each release.
**Canvas/Pixi:** single rAF (never nested); one sprite atlas (one texture bind/frame); pool every transient (≈0 alloc/frame); batch draws (avoid per-sprite tint/filter); cache static layers to a RenderTexture; `roundPixels`/NEAREST for pixel art; `ParticleContainer` for homogeneous sets; clamp resolution to `min(dpr,2)`; cull off-screen via `renderable=false`; pre-render text to textures; delta-time logic.
**Three.js mobile:** <50 draw calls (merge static geo); `InstancedMesh` for repeats; pixelRatio ≤2 (→1 on low-end); shadows off (blob-shadow plane); 1024px KTX2/Basis textures; baked lighting; Basic/Lambert over PBR; aggressive frustum cull + fog; reuse one geometry/material per clone; `matrixAutoUpdate=false` for static; scratch vectors (no per-frame `new`).
**Memory/GC:** zero hot-loop allocation; typed arrays for particle/physics state; free-lists; hoist callbacks (no per-frame closures); indexed `for` over map/filter in hot path; clear refs on teardown; no string concat in HUD loop; assert no GC sawtooth over a 60s run.
**Teardown/lifecycle:** cancel rAF + suspend AudioContext on `visibilitychange`→hidden; fully dispose Three geo/materials/textures/renderer and `app.destroy(true,...)` for Pixi on navigate; remove all listeners/timers; `loseContext()` on leaving 3D; idempotent `start()`; handle `pagehide`/bfcache by pausing not destroying.
**Battery/adaptive:** 30fps battery-saver (frame-skip); `navigator.getBattery()` auto power-saver; `IntersectionObserver` pause when off-screen; honor `prefers-reduced-motion` (fewer particles/no post-fx); tier quality by `deviceMemory`/`hardwareConcurrency`; honor `connection.saveData`; dynamic quality drop if frame-time >20ms for N frames.
**Network/caching:** service worker precaches hub shell + offers offline replay; cache-first for hashed assets, network-first for the shell; `Cache-Control: immutable`; combine tiny icons into one sheet; self-host subset WOFF2; warm SW cache on hub-tile hover; version SW cache by build hash.
**Asset pipeline:** build-time atlases (trim transparent padding); AVIF/WebP with PNG fallback (pixel art = indexed PNG-8, ≤64 colors); KTX2/Basis 3D textures; Draco/meshopt glTF; strip EXIF; `srcset` thumbnails; Opus/AAC SFX.
**INP & main-thread:** keep handlers <50ms; offload pathfinding/physics/procgen to a Web Worker; `OffscreenCanvas` in a worker for render-heavy games; `scheduler.yield()`/`postTask`; passive touch/wheel listeners; batch DOM reads then writes; `createImageBitmap` off-thread decode; chunk long init across frames.
**Trackerless measurement:** Lighthouse CI per PR (archive HTML); WebPageTest/unlighthouse on a throttled mobile profile; local `web-vitals` to console (no beacon); in-app FPS/frame-time/draw-call HUD via query param; `PerformanceObserver` long-task logging; committed per-release bundle-stats JSON; Playwright CLS diff; synthetic cold-load CI test asserting first-interactive-frame <2.5s.

## V4-4. Deep accessibility

**Shared settings & remap (build once → all 15):** one `borkadeA11y` localStorage object read on boot; identical Settings panel from the hub gear AND every pause menu; game-speed 50–100% slider (scales `dt`); master "Assist Mode" one-click bundle; remap ACTION verbs (not keycodes) with live capture + conflict detection + reset; hold-vs-toggle per sustained input; input-repeat-delay slider; "no rapid mash" master switch; instant apply + persist; export/import profile code; named profile slots; the panel itself is keyboard-first with visible focus + numeric readouts.
**Motor:** full keyboard + pointer + touch for all 15; size-adjustable repositionable on-screen D-pad; one-switch/scan mode; sticky-keys diagonals; dwell-to-click; eliminate simultaneous-key requirements; generous input buffering + coyote toggles; auto-fire toggle; aim-assist snap; forgiving-collision (shrink hurtbox) assist; pause-anywhere on multiple inputs + confirm-before-quit; gamepad via Gamepad API with the same remap; stick deadzone slider; slow-aim modifier.
**Timing assists:** global "no timers"; per-game timer multiplier (1×/2×/3×/∞); adjustable reaction windows; "slow on danger"; auto-pause on tab blur; decouple enemy speed from player speed; spawn-rate slider; "breather" between waves; lives/retries slider; instant restart.
**Vision/color:** Okabe-Ito as the default accent palette; protan/deutan/tritan presets remapping gameplay-critical colors; never color-alone (pair shape/icon/pattern); pattern overlays on teams/hazards; high-contrast theme; text-size slider (100–200%) no clipping; dyslexia-friendly font option; 4.5:1 / 3:1 contrast audits; separate HUD-scale; "highlight player" outline; enemy/hazard outlines; brightness/contrast sliders; reduce-clutter toggle; adjustable camera zoom.
**Screen-reader & semantic menus:** build the hub from real `<button>`/`<a>` (never click-only divs); `aria-label` per tile (name+genre+"Relaxed available"); logical focus order + visible ring; skip-to-content + landmarks; `aria-live="polite"` for menu/settings/load status; per-game "now playing: score X lives Y" live region; announce game-over/level-complete/new-best; focus-trapped HTML pause menu; in-DOM "how to play" card; `lang` + meaningful titles; honor `prefers-contrast`/`prefers-reduced-transparency`.
**Hearing:** every gameplay sound gets a visual twin (flash/ring/icon/edge-indicator) behind one "visual sound cues" toggle; directional off-screen-threat indicator; caption line for key cues; separate Music/SFX/UI volume + mute; visual beat cue for rhythm; never gate progress on audio-only; haptic mirror option; mono-audio toggle + balance slider.
**Cognitive:** per-game one-screen Goal/Controls/Tip card (re-openable); persistent objective line; Relaxed preset selectable from tile AND mid-run without losing progress; minimal-UI toggle; waypoint marker; practice mode (no death/score); consistent iconography + kid-grade vocabulary; one-mistake "rewind 3s" under Assist; save-and-resume; consistent pause/back placement.
**Photosensitivity/motion:** auto-honor `prefers-reduced-motion` (reflect in toggle default); hard ≤3 flashes/sec enforced in the shared render helper; no full-screen saturated-red; "reduce motion" dampens shake/parallax/zoom/flash; "reduce particles" slider; shake→border-pulse fallback; fade (not flash) transitions; static menu-bg option.
**Per-genre specifics:** Pug-Heist alert-state caption + patterned cones + "guards never run" assist; platformers coyote/buffer toggles + auto-run + fall-forgiveness; runners speed-cap + lane-snap + hazard pre-warning; shooters aim-assist + reticle options + auto-fire; 3D FOV slider + remove head-bob + snap-turn + minimap + brightness; puzzle no-timer + hints + shape-coded pieces; rhythm adjustable windows + offset-calibration + no-fail.
**QA & discovery:** GAG "Basic" tier as a ship-gate; Xbox AG per-game checklist; axe-core lint in CI; keyboard-only + screen-reader + colorblind-sim + flash-rate + touch-only playthrough passes per release; per-game a11y coverage doc + an "Accessibility" hub page; assist icons on each tile; first-run "Comfortable defaults?" prompt; detect `prefers-*` and pre-set; "Need it easier?" hint after repeated deaths; Assist Mode framed as non-penalizing, never "cheating".

## V4-5. Shareability & viral moments

**Per-game "money moments" (one frozen frame):** Heist alarm-trip mid-leap; Floor-Lava last-pixel save at 95% lava; Backrooms turn-and-it's-there; Clown-Forest over-shoulder conga; Delivery perfect-throw apex with trajectory line. A "money-moment camera" briefly zoom+slow-mos the defining beat so the auto-screenshot lands composed; freeze 2 frames AFTER death for peak ragdoll; tag each internally so Share always crops to it.
**Result-card / share-string (client-side text):** universal emoji card "🐶 Bork Daily #214 — Pug Heist" + a grid encoding the run (🟩 cleared / 🟥 alarm / 🟨 loot); per-game signature glyph header (🦴/🔥/📦); chunky pixel-digit score blocks; seed encoded invisibly (zero-width chars) so "beat this" links auto-load the exact run; streak line; rank crest (🥉→👑 from local percentile); spoiler-safe toggle (shape, hide number); footer "BORK! borkade…"; ≤280 chars, monospace-safe; last-7 sparkline ▁▂▃▅▇; one-tap copy of card + challenge URL together.
**Daily-seed challenge (pure client-side):** "Bork Daily" seed=YYYYMMDD, identical worldwide, "#NNN" from a launch epoch; one ranked attempt + clearly-marked non-counting practice (no fake scarcity); archive of past days; "Daily Borkdle" meta stringing all 15; seeded modifier-of-the-day ("Foggy Friday"); countdown-to-next on game-over (no nag); "perfect week" 🐶×7 badge; CI determinism test.
**Challenge-a-friend (URL hash, no server):** `#game=heist&seed=214` loads instantly; "challenge" button encodes game+seed+score for an asymmetric "beat my 9,400" ghost; RLE-compressed input timeline in the hash to race the literal replay; revenge auto-link; handicap encoding; base64-packed ints to stay iMessage-friendly; mirror-match flag; expiry-free (seed deterministic forever); "daily duel" link always points to today.
**OG & unfurls:** pre-baked 1200×630 OG per game (Bork face + name + "Can you beat it?"); per-daily variant with "#214"; canvas-to-dataURL rank card at share time (still no server); distinct color band per game; `summary_large_image` + Open Graph + oEmbed; no-JS fallback OG; Bork-face favicon/apple-touch-icon; per-game `theme-color`.
**Bork mascot hooks:** one catchphrase "BORK!"; a small reaction-face set (smug/terrified/dizzy/triumphant/deceased-X-eyes) reused across all 15; one signature victory pose; readable as a 16px silhouette; "deceased Bork" universal fail stamp; exportable sticker pack + animated GIFs for Discord; bone-icon 🦴 as the universal score glyph; one short distinctive "BORK!" bark sample everywhere.
**Built-in capture:** one-tap "screenshot this moment" framing the money-moment (not HUD); ring-buffer last ~6s → "save GIF/WebM"; instant-replay with slow-mo + Share; subtle "borkade.com" watermark; 9:16 portrait crop for TikTok/Reels; auto-pick highest-juice frame; clean "hide HUD" mode; particles peak on the capture frame.
**Discord-led growth:** "Copy for Discord" formatting that renders native; official emoji/sticker pack; clean-unfurling OG links as the core growth surface; optional self-host "Bork Bot" static-JSON daily poster; press-kit page (logo/palette/GIFs/OG templates); curated "Hall of Borks" link gallery (links only, no uploads); streamer mode (clean overlay-friendly layout).
**Ethical (no dark patterns):** sharing 100% voluntary, never share-to-unlock; no forced login/email; the no-ads/no-tracking promise shown on the card as a trust asset; never auto-open share dialogs; no streak-loss guilt or notification nags; share strings carry no PII/tracking params; "copy" default verb; practice mode always free; opt-in only for any future cloud.
**Cross-game systems:** site-wide "Borkscore" daily aggregate; "Bork Gauntlet" hash chaining 3 games at one seed; one universal share component every new game inherits; weekly local "Bork Wrapped" recap; "Bork Bingo" 5×5 micro-feats; site-wide daily modifier; global launch-epoch day counter ("Day 214 of Borkade").

## V4-6. Mastery, scoring depth & daily/leaderboard systems

**BORK-Rank meter (DMC-style):** shared `borkRank.js` letter grade D→SSS top-right; live meter that decays every frame (forces continuous play); variety multiplier with diminishing returns on repeated actions; rank-up flash + ascending stinger; rank-down shatter; per-grade tint (gold at S+, rainbow at SSS); "Peak Rank" stored separately; style feeds a final-score multiplier; a hit knocks the meter down a full grade; per-game flavored labels over the same numeric tiers.
**Per-game skill ceilings (risky optional points):** Heist "ghost steal" (loot within one tile of a guard); Floor-Lava "lava-kiss" near-miss multiplier; Delivery speed-streak; Clown-Forest "taunt" (more points, pulls chasers); Backrooms deeper-room scoring vs higher spawn; universal combo-chain field; "greed gauge" (banked uncashed points, lost on death); perfect-input pops; near-death double points; golden-bone off-path collectible; optional secondary objectives; risk-die enemy-speed-for-multiplier toggle; on-beat tempo bonus.
**Ghost replay:** shared `ghost.js` records position+key state per tick to localStorage; translucent ghost-pug of your PB; per-category ghosts (Any%/Score%/Daily); live ±delta vs ghost at splits; auto-overwrite only on a better run; paste a shared ghost string to race anyone; RLE input trace → short base64; off-screen ghost arrow; multi-ghost (last 3 PBs); determinism desync detection; "beat your ghost" confetti; input-glyph display teaching the optimal line.
**Daily/seed systems (reuse rng.js):** `dailySeed()` UTC seed identical worldwide; one ranked attempt/day with "come back tomorrow"; a hub showing all 15 dailies + status; seed-driven modifier-of-the-day; "daily set" badge for all 15; non-counting practice; yesterday archive; human-readable code (BORK-2026-06-06); seeded route-hint markers (toggle off for purists); difficulty ramp by day-of-week; type-any-code custom runs; "seed of the week"; favorite seeds; embed seed in share-string for verifiability.
**No-backend leaderboards & share strings:** Wordle-style emoji+score+seed+category string; per-game per-category PB ledger; paste-a-friend's-string to compare locally; deterministic re-simulation to verify a claimed score; checksum for tamper detection; "beat this" challenge URLs; local "rivals" list (8 pasted scores); QR-code of a share string; percentile estimator from a seed-hashed synthetic distribution; export/import full profile code.
**Speedrun timers/categories:** ms split timer (start-on-first-input); standard categories (Any%/Score%/100%/Daily); auto-split checkpoints; sum-of-best; gold-split flash; reset + attempt counter; load-removed mode; run-history of last 20; PB-pace coloring; frame-counter mode; per-category WR-of-this-machine on the start screen; no-damage/pacifist categories.
**Streaks & retention:** cumulative daily streak with a non-shaming grace day; flame icon growing with milestones (7/30/100); earnable streak-freeze token; variable-reward surprise drops; per-game AND global "any daily today" streak; gentle comeback message; lifetime "dailies played" tally; streak-leaderboard share card; soft midnight reminder (no push); weekly recap card.
**Mastery progression:** per-game XP track unlocking cosmetic skins/trails; Bronze/Silver/Gold/Platinum medals; cross-game "Borkade Completion %"; achievement feed; per-game "challenge ladder" (e.g. clear without jumping); equippable titles; mastery-gated harder tiers; prestige reset; daily mastery quest; global arcade rank summing all XP.
**Transparency, integrity & onboarding:** end-of-run score breakdown (base/combo/style/near-miss/clear); "score popcorn" + projected-final estimate + "what cost you points"; determinism guarantee enforced by replay tests; signed input-trace+seed in share strings; "verified" vs "unverified"/"assisted" tags; impossible-input detection; versioned scoring rules; progressive-disclosure "Pro HUD" so casuals aren't overwhelmed; "you could've scored X more" coach; ghost-coach that slows where you keep failing.

## V4-7. Adaptive audio & procedural sound

**Shared engine core:** one `src/shared/audioEngine.js` singleton wrapping a single AudioContext for all games; 25ms lookahead scheduler scheduling notes due in next ~100ms vs `ctx.currentTime` (never bare setTimeout); shared `engine.now()` clock for AV sync; global BPM → bar/beat boundaries; priority queue drained per tick; voice cap (~24) with oldest/quietest stealing; master + `musicBus`/`sfxBus` gains; one cached white-noise buffer; lazy create on first gesture; `dispose()` on leaving; keep miniSfx.js as a thin forwarding shim.
**Synth primitives & ADSR:** reusable ADSR (fast attack ~5ms, near-zero release, always a ~3ms ramp-to-0 to avoid clicks); all four waveforms; `pluck`/`kick` (sine 120→40Hz)/`snare`/`hihat`/`coin`(asc arp)/`hit`(desc sweep+noise); detuned supersaw; FM bell; shared biquad lowpass/highpass with envelope sweeps; vibrato; portamento glide.
**Vertical-layer adaptive music:** 4 synced stems (drums/bass/lead/pad) always playing at zero gain so they re-enter in sync; map intensity 0–1 to how many stems are unmuted (~300ms fades); Heist pad+bass→+drums on alert→+lead on chase; Floor-Lava adds hi-hat per rising-lava threshold; crossfade only at bar boundaries; "calm" target decays after danger; lowpass on the bus opens as intensity rises; boss adds a dedicated lead.
**Horizontal resequencing:** music as named patterns (intro/loop-A/loop-B/outro) swapped at bar ends; one-bar "fill" transitions; let the menu loop finish its bar before dropping into gameplay; randomly pick A vs B to reduce repetition; outro phrase on game-over; per-pattern tempo (faster "panic" loop); last-10-seconds switches to an urgent variant.
**Stingers:** 0.5–1s phrases layered over the bed (never replacing it), quantized to the next beat; level-up asc arp; new-best fanfare; death desc minor cadence; pickup-streak pitch ladder; combo-break dissonant slide; perfect shimmer; "3-2-1-GO"; per-game key/scale table so stingers harmonize; boss-defeat 2-bar phrase ducking the bed.
**Procedural SFX & anti-repetition:** randomize pitch ±20% (`detune`/`playbackRate`); round-robin variant pools (never same twice in a row); layer randomized sub-components; footsteps vary pitch/filter/length to the waddle; coin pitch rises by combo; explosion = down-swept noise + sine sub; UI blips; per-character dialogue blips; global per-sound cooldown; cap concurrent instances (~3); seed SFX RNG from an event counter so replays reproduce audio.
**Ducking & mixing:** route music through `musicBus`, dip ~6dB/200ms on big events; kick-keyed sidechain pulse for groove; ~10dB duck during dialogue; soft `DynamicsCompressorNode` limiter on master; normalize per-SFX loudness; high-shelf cut on music so SFX cut through; activity-based auto-duck; fade to silence on pause; subtle shared convolver reverb send.
**Stereo & space:** lightweight `StereoPannerNode` (not 3D Panner); pan by on-screen X clamped ~±0.7; pan footsteps/enemies by world-X minus camera-X; UI centered; distance falloff + lowpass for off-screen sources; whoosh panned across on dashes; keep music mono-summed so positional SFX read clearly.
**Mobile unlock & lifecycle:** one shared unlock bound to first touchstart AND touchend AND click (iOS); on unlock `resume()` + play a silent buffer; remove listeners after success; re-resume on `visibilitychange`; suspend on blur; lazily resume before scheduling; "tap to enable sound" if still suspended; rebuild noise buffers if sample-rate changes (Bluetooth swap).
**Accessibility & controls:** every meaningful sound has a visual counterpart; global master-mute + separate Music/SFX sliders (persisted); "reduced audio intensity" mode (fewer layers); sane default ~0.6 (never full blast); M hotkey; captions for key stingers; avoid sustained >10kHz and sudden full-volume; mono-audio toggle.
**Per-game identity & sync:** per-game scale/key + waveform palette (Heist dark-minor noir plucks; Floor-Lava bright major + sizzle; Delivery bouncy ska; Clown-Forest detuned carnival waltz; Backrooms minimal drone + fluorescent-hum sine); 2–3 note start-screen motif; beat callback pulses HUD; pickup pitches walk a scale so a good run plays a melody; tempo scales with runner speed; low-health heartbeat layer that speeds up; +1 semitone bed during overtime.
**Rollout:** migrate Pug-Heist first as reference; debug overlay (voice count/state/BPM/intensity); audio-sandbox page to audition primitives; unit-test scheduler timing vs a faked clock; lazy-load pattern data per game; `data-no-audio` kill switch; profile on a low-end Android; document a "how to add music" recipe; per-game migration flags; degrade to simple `beep()` if the scheduler fails.

---

*End of Vol.4. Combined with Vol.1 (~1,230) + Vol.2 (~3,100) + Vol.3 (~2,500) + Vol.4 (~1,100), the bank now holds ~8,000 curated ideas across ~60 domains, on a 14-brief cited research foundation. Build priorities: `IDEA_BANK_REFINED.md`.*
