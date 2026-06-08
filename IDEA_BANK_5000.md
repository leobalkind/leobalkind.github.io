# BORKADE — Idea Bank Vol. 2 (5,000+ ideas)

> Created 2026-06-08 (/goal ULTRATHINK). A second, deeper idea bank for BORKADE —
> ~5,000+ granular, novel, advanced improvement ideas across 36 niches, generated
> by 36 parallel domain specialists. Companion to `IDEA_BANK_1000.md` (Vol. 1) and
> `COMPETITIVE_RESEARCH_2026.md` (the prioritized, partly-shipped roadmap).
>
> **How to use it:** this is a *menu*, not a to-do list. Pull the highest
> impact ÷ effort items per cycle; check what already exists before building (the
> hub + games are mature); verify every game change in a real browser; keep the
> brand rule — humor in the *mechanic*, not a pug skin on a known genre.
>
> Sections: **Part A (1–12)** hub/UX/discovery/a11y/i18n · **Part B (13–24)**
> retention/social/meta/audio · **Part C (25–36)** brand/new-games/per-game/tech/growth.

---

# RESEARCH FOUNDATION (Stage 1 — 7 research agents)

> The 7 briefs below were produced by dedicated research agents (real web research,
> cited) and FEED the idea generators downstream. Read these directives first; the
> 36 idea sections apply them.

## R1. Visual attention & where people look — research brief
**Key findings:** Users scan, don't read (~20-28% of words; NN/G). The F-pattern is the default scan path and a symptom of weak hierarchy — design "stopping points" against it. Strong pages get a "layer-cake" scan of headings → descriptive headings are the highest-leverage layout tool. Z-pattern/Gutenberg governs sparse heroes (logo top-left, CTA bottom-right). First impression forms in 50ms (Lindgaard) with a credibility halo. 57% of viewing time is above the fold. Faces are attention magnets and gaze-cue the viewer (point a pug's eyes at the CTA). Motion dominates peripheral vision — one moving element = one attention sink. Banner blindness skips ad-shaped content (and content beside it). Hierarchy = contrast/scale/grouping, not absolute color. Fitts's Law: big, close targets. Hick's Law: don't dump 15 equal tiles. Top-left grid slot wins. Thumbnails judged <1.5s — one focal subject, big readable title, high contrast.
**Directives:** value prop + one primary action above the fold; pug gaze → Play; one focal point + big title per card; high focal/bg contrast; cap neon to one accent per screen; restrict motion to one element; front-load labels; short scannable headings; large Play near its card; chunk 15 games into labeled clusters; spotlight 1-3 featured; make "FREE/no ads/no tracking" poppable tokens as native UI; strongest game top-left; fast first paint; run the squint test.
**Pitfalls:** ad-styled real content; competing motion; color-only hierarchy; buried hook; left-trailing labels; 15 equal tiles; tiny/distant Play; cluttered thumbnails; slow hero. (NN/G; Lindgaard; Laws of UX.)

## R2. Color psychology, palettes & contrast — research brief
**Key findings:** Color moves conversion 5-35% but CONTRAST/standout wins, not a magic hue. Hue carries emotion (red=urgency/danger, blue=trust, yellow=optimism, green=go). Saturated color on pure black "vibrates"/fatigues — desaturate ~20-40%, never `#000` (use ~`#1A1726`; body off-white `#E2E8F0`). WCAG AA 4.5:1/3:1; re-check every dark pair (don't invert). HSL lies about brightness; OKLCH is perceptually uniform, guarantees contrast by formula, accesses P3. 60-30-10. One accent, not five. Red-green fails ~8% of men → blue/orange; Okabe-Ito 8-color set is CVD gold standard; never color-only. Top games use color as a gameplay language. Gen-Z "dopamine" maximalism + synthwave (magenta+cyan) is on-brand.
**Directives:** charcoal base `oklch(0.18 0.02 270)`; OKLCH system; primary neon magenta ~`#FF3DBE` at ~10%; secondary cyan ~`#3DE7FF`; 60-30-10; off-white body; desaturate large fills; verify ≥4.5:1; player=cyan, hazard=vermillion-orange `#FF6B2C`, reward=amber; orange/blue not red/green; double-encode w/ icon/shape; ≥40% lightness gap between sprites; P3 + sRGB fallback; colorblind toggle; seasonal accent slot; run a CVD sim.
**Pitfalls:** inverting palette for dark mode; full-sat neon on `#000`; HSL ramps; red/green-only; too many accents; spending signal colors on decoration; low-contrast gray; vaporwave pastels; shipping without CVD/contrast checks.

## R3. Retention & engagement psychology — research brief
**Key findings:** Hook Model — the investment phase (stored progress/cosmetics) is the moat; internal triggers beat notifications; variable rewards maximize dopamine (randomize cosmetics, never power). Loss aversion is strongest (~2×) → a visible growing streak is the #1 feature. Streak slack (1-2 freezes) raises motivation; a 7-day streak made Duolingo users 3.6× likelier to continue (front-load week 1). Goal-gradient (show next goal; endowed progress). Zeigarnik (leave "almost done" states). Early easy wins drive D1 (win in first 60s; tutorials <5min skippable). 30s-3min loops maximize "just one more". Concrete + secret achievements; site-wide completion %. Free season passes get the psychology, no monetization. Scoped/personal-best leaderboards motivate; global ones demotivate. Comeback bonuses. Anticipation > reward (juicy reveals).
**Directives (client-side):** localStorage streak + freezes; front-load 7-day rewards; first-60s win; <2min skippable onboarding; 30s-3min loops + instant restart; site-wide completion %; endowed progress; always show next goal; Zeigarnik home hooks; free "Pup Pass"; daily+weekly quests; login calendar; cosmetic variable drops w/ reveals; compete vs personal best + shareable cards; concrete+secret achievements; customizable pug profile; warm welcome-back gift; juicy unlock anims; respectful in-page nudges.
**Lines not to cross:** no withdrawal loops; no streak-anxiety weaponizing; no grind-gates; no false-scarcity panic; no gambling-for-value; no notification spam/guilt; no demotivating global ladders; no busywork; don't over-extrinsify; always a clean stop. Litmus: would a fully-informed player be glad it's there?

## R4. Game feel, juice & fun — research brief
**Key findings:** Game feel = control + simulated space + polish (Swink); close the loop <100ms — never gate input behind animation. Juice (Jonasson/Purho): hit-stop, screen shake, squash & stretch, particles, tween everything, flash, camera kick/lerp, sound per event, number-pop. Nijman's stack incl. hit-pause, knockback on both, and PERMANENCE (debris lingers). Bushnell: easy to learn, hard to master. "30 seconds of fun" looped in varied contexts; nest 3s/30s/3min loops. Flow = challenge≈skill (stair-step, dynamic difficulty). Readability is the biggest fairness lever — telegraph threats; deaths legibly the player's fault. Reward same-frame. Replayability = meaningful procedural variety + score-chase + mastery. Humor tied to mechanics retains. 60fps fixed timestep; never fake difficulty via laggy/inverted input; teach by doing.
**Directives (15 games):** <100ms input; juice checklist; 2-5 frame hit-stop; tween everything; squash & stretch; short proportional shake; particles+sound per collision; popping numbers; flash on big events; camera kick + ease; permanence; one mechanic/one button; one ~30s loop varied; nested loops; "get it" in 10s; rubber-band difficulty; stair-step curve; telegraph; show-why-on-death + instant restart; same-frame reward; per-game high score; meaningful randomization; humor in mechanics; 60fps fixed timestep; knockback on both.
**Fun-killers:** laggy/inverted controls; unreadable threats; inconsistent hit detection; difficulty walls/flatlines; unskippable tutorials; too many inputs; delayed rewards; meaningless randomness; un-juiced snapping; bolt-on humor.

## R5. Conversion, first-impression & UX — research brief
**Key findings:** 50ms aesthetic verdict rarely reverses (Lindgaard). Users leave in 10-20s without a clear value prop; survive 30s and they often stay 2min+. 0.1s load improvement = measurable conversion lift; bounce ~+32% from 1→3s load, ~90% at 5s; better LCP drove +8-17% sales/conversion across case studies; CLS hurts revenue. 46% judge credibility on visual design (Stanford) → polished pixel art is a trust signal; "free/no ads/no tracking" is a textbook honesty cue. Forcing account creation = ~26% abandon → never gate play; defer accounts until after a success. Shorter forms convert far better. CTA COPY beats color; label "Play now"/"Bork now". Message continuity: link a game card straight into that game. Progressive disclosure (≤2 levels). Social proof lifts 30-70%. Tap targets ≥48px, ≥8px apart. Microcopy reduces friction. Privacy is a differentiator (only 28% trust companies with data). Ship a playable loop before full assets load; one-thumb, 5-20min sessions fit BORKADE.
**Directives:** charming first frame (50ms); one-line value prop above fold; playable loop <3s (lazy-load rest); reserve canvas dims (kill CLS); never gate play; "Play now" per game (one dominant CTA); card → that game; banner "No ads · No tracking · No cookies · Free"; in-context progressive disclosure; surface play counts/leaderboards; ≥48px targets; benefit-driven microcopy; one-tap share; branded loading pug; fast scannable grid first; "Play again/Next" loop on game-over; ≤15-word headline; prompt accounts only after a high score; WCAG 2.2 AA; test copy → placement → visuals.
**Pitfalls:** login/email gates; blank/black load screen (the v2.10 crash class); layout shift; vague CTAs; competing CTAs; pre-play tutorial walls; tiny targets; buried value prop; "no ads" as legalese; unpolished visuals; generic error/game-over copy; hard-to-share results.

## R6. Competitor & portal benchmarking — research brief
**Key findings:** Poki/CrazyGames use stacked curated rails + deep subgenre categories + working tag search; per-game pages carry controls/tips/ratings/similar-games. Y8 plays hover video previews; lazy-loaded, consistent thumbnails read "professional". Newgrounds/Kongregate use medals/achievements + scoreboards as social signals + a cross-game profile. Coolmath runs Daily Games (return-appointment); Wordle's daily + emoji share turned players into promoters. CrazyGames SDK: cloud save, leaderboards, usernames, celebration effect, multiplayer invite links. GameSnacks = tiny, instant, touch-first for low-end devices. PWA (manifest + service worker) = installable + offline + shareable + SEO. VideoGame schema + OG tags drive passive search traffic. Every major free portal funds itself with ADS — BORKADE's no-ads stance is the brand wedge; the gap is positioning, not features.
**Steal (static, no-ads):** curated rails (Featured/New/Staff/by-genre); multi-tag metadata + static filter pages; tiny client-side fuzzy search; one fixed thumbnail spec; hover GIF/WebM previews; lazy-load tiles; real per-game pages w/ controls + "more pug games"; VideoGame JSON-LD + OG per page; localStorage high scores; per-game medals; one cross-game pug profile; localStorage save + confetti on PB; deterministic "Game of the Day"; one daily-challenge seed; spoiler-free emoji share; installable PWA + offline service worker; tiny touch-first payloads; sort toggle (New/A-Z/Random); one off-site Discord; headline "No ads. No tracking. Forever."; prioritize instant launch + crash-free.
**Anti-patterns:** interstitial/midroll/rewarded ads; deceptive ad placement; third-party trackers; premium currency/loot/pay-to-skip; grind treadmills; streak guilt; pyramid/social dark patterns; login walls; heavy payloads; cookie/email popups; unmoderated on-site chat.

## R7. Virality, sharing, growth & branding — research brief
**Key findings:** Wordle's emoji grid = spoiler-free, text-only, identity-encoding; omitting the URL fueled organic growth (make the game findable by name). K-factor = invites×conversion; cycle TIME matters more than K → a DAILY shareable result is structurally superior. Optimal OG/share card = 1200×630 (one file for all platforms); keep text/logo in center 80%, 48px+ bold type, <1MB; validate with FB/Twitter debuggers (caches are sticky). Double-sided referrals beat one-sided (~2.3× shares); for a no-money site, reward both sides with cosmetics. Sharing triggers: utility, identity, emotion/humor, social currency. Images process ~60,000× faster than text. Mascots create parasocial loyalty (Duo the Owl) — give the pug attitude, be unhinged/reactive, extend into merch/memes. "Unblocked games" is a real large channel — a static HTML5 site is natively a candidate; whitelisted mirrors (GitHub Pages) help; "brain games" framing rides the Coolmath whitelist halo. HTML5 is SEO-indexable (native apps aren't) — VideoGame/FAQ/HowTo schema, keyword titles, fast loads; fresh content (devlog) ranks long-tail. Strong names are short/spellable/distinctive ("BORKADE" fits invented-compound); wordmarks suit 6-10-char names. Meme marketing ~60% higher organic reach but Gen-Z punishes forced/cringe. Indie playbook: build community 6-12mo pre-launch, Discord + 3-4 TikToks/week; small engaged streamers; Reddit 9:1 rule.
**Directives:** spoiler-free copy-to-clipboard result card per game; daily challenge (same seed) → ~1-day viral cycle; 1200×630 PNG card w/ mascot + chunky neon score + wordmark; OG + Twitter Card meta on every page (validate); subtle name + borkade.com on the card; double-sided VIRTUAL referral (both unlock a skin); lock ONE wordmark spelling; name the pug + consistent unhinged voice; meme-first TikTok/Reels 3-4×/week; remixable meme templates; open a Discord now; per-game SEO landing pages w/ VideoGame+FAQ+HowTo schema; target "unblocked" search; whitelisted-host mirror; "brain games" framing; tiny devlog for freshness; shareable streak badge; humor-forward short share copy; Reddit 9:1 in niche subs; partner small streamers; daily challenge refresh (FOMO); one obvious Share on game-over; free sticker/wallpaper packs; original IP-safe assets.
**Pitfalls:** spoiler leakage; broken/stale OG cache; edge-cropped fine-detail cards; chasing K>1; forced/cringe memes; meme legal exposure; Reddit over-promo shadowban; referral farming; inconsistent name/wordmark; single-domain fragility; slow trend pipeline; launch-day-only community.

---

# PART A — Hub, UX, discovery, accessibility, i18n

## 1. Hub hero & first-impression micro-details

### Masthead / logo / mascot lockup
1. Lock the BORKADE wordmark and pug mascot into a single SVG so they never reflow apart at any breakpoint.
2. Animate the wordmark letters drawing in stroke-by-stroke on first paint (CSS `stroke-dashoffset`) under 400ms total.
3. Give each letter of "BORKADE" a 1px chromatic-aberration RGB split that only resolves to crisp on full load.
4. Render the logo at native pixel grid with `image-rendering: pixelated` and snap to integer scales only.
5. Mascot pug sits on the baseline of the wordmark, paw resting on the "B" like a ledge.
6. On load, the pug "carries" the last letter "E" in and drops it into place with a tiny dust puff.
7. Logo has a 2-frame idle blink loop every 4-7s, randomized so it never feels metronomic.
8. Add a subtle 1px drop-shadow that shifts with simulated CRT scanline phase.
9. Tongue-loll micro-animation on the mascot triggers once after 8s of inactivity.
10. Wordmark baseline has a faint neon underglow that pulses at the site BPM.
11. Provide a monochrome 1-bit fallback logo for prefers-reduced-data / print / favicon consistency.
12. Mascot ear flicks toward whichever nav item the cursor approaches.
13. Logo "powers on" with a CRT degauss wobble for the first 250ms only.
14. Reserve exact logo box dimensions via aspect-ratio to guarantee zero CLS on the masthead.
15. Mascot's collar tag shows the current site version in 3px text as an easter egg.

### Tagline rotation
16. Rotate taglines on a typewriter-erase-retype loop, never a hard cut.
17. Seed the tagline rotation from the date so the "tagline of the day" is stable per visit-day.
18. First tagline a returning user sees references their most-played game.
19. Hold each tagline 4.5s, erase fast (40ms/char), type next slower (70ms/char) for rhythm.
20. Keep a pool of 30+ meme taglines; weight rarer ones to ~5% for delight on repeat visits.
21. Tagline cursor is a blinking pug-paw glyph instead of a pipe.
22. Pause tagline rotation while the tab is hidden; resume on the same entry.
23. One tagline slot reserved for live status ("3 new high scores today").
24. Respect prefers-reduced-motion: show a single static tagline.
25. Tagline font-size uses clamp() so the longest line never wraps on a 320px screen.
26. Glitch-corrupt 1 char mid-tagline ~10% of the time, then self-correct.
27. Konami code typed on the hero swaps the tagline pool to an all-caps "dev mode" set.

### The first 50ms / brand moment
28. Inline a critical hero CSS block in <head> so the masthead paints before external CSS.
29. Ship a base64 LQIP hero background that resolves to full art on decode.
30. Paint the neon background gradient via CSS only so the first frame is instant.
31. Set theme-color meta to the hero neon so mobile browser chrome flashes on-brand instantly.
32. Preload only the mascot sprite + wordmark font with fetchpriority="high".
33. Show a 1-frame "BORK!" speech bubble that pops and fades in the first 600ms.
34. Use font-display: optional on the display font so there's no FOIT flash.
35. CRT power-on white flash line wipes top-to-bottom in 120ms on first load only.
36. First-paint background is the darkest brand color so the screen never flashes white.
37. Decode the mascot sprite off-main-thread via Image.decode() before inserting.

### Hero background / parallax / particles
38. 3-layer parallax (stars / mid neon grid / foreground floor) driven by pointer + device tilt.
39. Cap particle count adaptively from hardwareConcurrency and measured FPS.
40. Floating pixel "dust borks" drift upward; max ~40 on desktop.
41. Parallax offset eased with a spring, not linear, so it settles.
42. Neon grid floor recedes in fake perspective and scrolls toward the viewer at 6px/s.
43. Mouse leaves a short-lived pixel paw-print trail across the hero floor.
44. Particles avoid a "dead zone" behind the wordmark to keep text legible.
45. On scroll, parallax layers separate faster than scroll (1.2x) for a depth-leap.
46. Idle 15s: a tumbleweed of pixel fur rolls across the hero floor once.
47. Background grid hue slowly cycles 12° over 60s.
48. Pause all particle RAF when hero scrolls out of viewport.
49. Disable parallax under prefers-reduced-motion; keep a static composed scene.
50. Particle field reacts to audio amplitude if ambient sound is enabled.
51. A single shooting-star pixel streaks the sky on a ~30s Poisson timer.
52. Device-tilt parallax on mobile clamped to ±8°.

### Above-the-fold composition
53. Compose hero on an 8px baseline grid; every element snaps to it.
54. Guarantee one full game tile peeks above the fold so users know to scroll.
55. Hero height is 100svh so mobile URL bars never crop the CTA.
56. Golden-ratio split: mascot lockup left, CTA + tagline right on desktop.
57. Strict z-index scale (bg 0 / particles 10 / scene 20 / lockup 30 / CTA 40).
58. Subtle vignette darkens hero corners to funnel the eye to the center lockup.
59. Above-the-fold contains exactly one primary CTA.
60. Faint diagonal "scanline shimmer" sweep across the fold every 12s.
61. On ultrawide, letterbox the hero scene with neon framing bars.
62. Hero reserves a fixed-height tagline row so rotation never shifts the CTA.

### Animated logo states
63. Logo states: boot, idle, hover, click-ack, loading, error, celebrate.
64. Hover: mascot perks ears + wordmark gains +1 neon glow tier.
65. Click-ack: wordmark does a 1px "press" squash before navigation.
66. Loading state: mascot runs in place, wordmark dims.
67. Error state (asset fail): mascot tilts head with a "?" and a muted palette.
68. Celebrate state on a new high score: confetti pixels burst from the wordmark.
69. After 5 visits, unlock a "veteran" logo variant with a tiny crown sprite.
70. Triple-click the mascot to toggle a hidden "rave" logo state (session-only).
71. Logo state machine driven by a single CSS class on body for testability.
72. First-of-day visit triggers a one-time "stretch and yawn" wake-up animation.

### Mascot eye-tracking / reactions
73. Pug pupils track the cursor within a clamped radius.
74. On mobile, pupils track the most recent touch, then drift to center after 2s.
75. Mascot looks at the primary CTA whenever the cursor isn't moving.
76. Rapid cursor shake over the mascot makes it look dizzy briefly.
77. Cursor hovering the CTA makes the mascot's eyes widen.
78. Scrolling down makes the mascot's eyes follow the content downward.
79. Mascot blinks when the cursor crosses directly over its eyes.
80. Cursor leaves the window → mascot eyes drift sleepy half-closed.
81. Eye-tracking throttled to pointermove via rAF.
82. Mascot occasionally "catches you looking" with a slow double-take on tab re-entry.

### Scroll cues, sticky header & personalization
83. Animated chevron bobs at fold bottom; auto-hides the instant the user scrolls.
84. A pixel paw "walks" down the screen edge as a scroll affordance.
85. Show the cue only if the user hasn't scrolled within 4s.
86. Scroll-cue label rotates: "more games ↓", "keep diggin'", "fetch more ↓".
87. Mascot points a paw toward the games grid when the cue appears.
88. Thin top progress bar fills as the page scrolls (neon sliver).
89. First scroll triggers a one-time "click" tick + tiny haptic on mobile.
90. Header condenses to a 48px bar with mini-logo after 120px of scroll.
91. Hide sticky header on scroll-down, reveal on scroll-up.
92. Sticky bar shows a live "search games" affordance that expands inline on focus.
93. Condensed header surfaces the user's current streak/coins as a tiny badge.
94. Greet by time: "gm" before noon, "gn, gamer" after 10pm.
95. Returning users see a "Welcome back" micro-toast with a Continue button.
96. First-time visitors get a 3-second guided glow tracing logo → CTA → games.
97. "X days since your last bork" counter for lapsed users.
98. Hero re-pins the user's single favorited game as a hero shortcut chip.
99. Late-night visitors get moon + sleepy-mascot dressing; daytime gets a sun.
100. Personalized tagline names the profile handle if one is set.
101. Date-driven seasonal layer: snow in December, leaves in autumn (lazy-loaded, reduced-motion aware).
102. Mascot wears a date-gated accessory (santa hat, party shades).
103. New Year midnight: a one-time pixel-firework burst behind the lockup.
104. Primary CTA "PLAY" is a chunky pixel button with a 2px hard offset shadow.
105. CTA defaults to a smart pick: Continue, else daily featured, else random.
106. Secondary "Surprise me 🎲" CTA launches a weighted-random game.
107. CTA label shows the target game name on hover ("PLAY → Pug Heist").
108. CTA min hit-target 48x48px even when visually smaller.
109. Hero LCP element is the wordmark image, preloaded fetchpriority=high.
110. All hero animations use only transform/opacity; pause RAF when document.hidden.
111. Run particle physics in a Worker + OffscreenCanvas where supported.
112. Throttle hero RAF to 30fps on battery-saver / low-power devices.
113. Hover the mascot 10s to unlock a secret bork + happy tail wag.
114. The wordmark's "O" is a clickable target that spins like a coin.
115. Cursor idle over the pug's nose 2s → a "boop" + nose-scrunch.
116. 1-in-1000 page loads spawn a rare golden mascot variant (collectible flag).
117. Type "borkade" on the hero → mascot spells it with paw-stamps.
118. Konami-complete rains pixel bones for 2s and unlocks a permanent tiny bone in the masthead.

## 2. Game-card & tile design variations

### Thumbnail composition & hero framing
1. Rule-of-thirds pug eye locked to the upper-left third for instant gaze-anchoring.
2. Diagonal "action streak" composition; the pug always faces toward the card's center.
3. Forced 16:10 crop slicing off HUD so only pure play shows.
4. Negative-space left column reserved for the title so art never fights type.
5. "Money shot" frame: a hand-picked peak-action moment, not the title screen.
6. Parallax-depth thumbnail from 3 stacked PNG layers that separate on hover.
7. Silhouette-first composition: pug reads as a clean shape even at 64px.
8. Center-weighted vignette so the pug pops on any background.
9. Duotone-clamped screenshots so every thumbnail shares a 2-color band site-wide.
10. Top-down vs side-view thumbnails alternated for grid rhythm.
11. "Frozen confetti" overlay baked into celebratory-game thumbnails.
12. Macro close-up of a single object (coin/gem/bone) for puzzle cards.
13. Mirror-split thumbnail: left art, right wireframe/pixel-grid reveal.
14. Letterboxed cinematic bars that retract on hover to reveal more art.
15. Thumbnail safe-zone guide so the pug face survives any aspect-ratio crop.

### Animated / GIF / sprite previews
16. 3-frame idle-loop that breathes only when the card is in viewport.
17. Hover-scrub: mouse X scrubs a 12-frame sprite-sheet like a timeline.
18. Auto-play muted 2s WebM preview after 400ms hover dwell.
19. "Wag tail" micro-loop at 6fps to feel hand-drawn.
20. Lottie pug that reacts to cursor proximity with eye-tracking.
21. Decimated 8-color GIF intentionally retro-dithered.
22. First-frame poster morphs into animation via cross-fade, no pop-in.
23. Reduced-motion users get a single "key pose" still.
24. Preview plays once on first reveal, freezes until re-hover (battery).
25. Sprite speed scales with the game's difficulty.
26. CSS steps() sprite animation so no inter-frame blur.
27. "Demo reel": long-press a card to watch a 6s curated montage.
28. Cursor-leave triggers a reverse-rewind back to frame one.
29. Battery-saver detection drops all card animation to static below 20%.
30. Shared sprite atlas so the whole grid animates from one decoded image.

### Hover / focus states
31. Lift-and-shadow: card rises 6px with a soft neon under-glow.
32. Sibling cards dim to 60% + desaturate while hovered card stays full-color.
33. Hover spawns a thin scanline sweep top-to-bottom once.
34. Title underline draws left-to-right as an animated neon stroke.
35. Cursor becomes a tiny paw print only while over a card.
36. Hover reveals a hidden play-bone button sliding up from the bottom.
37. Focus-visible ring is a chunky pixel dashed border, not a soft outline.
38. Keyboard focus mirrors hover exactly.
39. Hover tint shifts the accent hue 15° for a subtle shimmer.
40. Press/active squishes the card 2% like an arcade button.
41. Long-hover (1.5s) triggers an easter-egg bark once per session.
42. Hover halo intensity scales with the user's personal best on that game.
43. Edge-magnet hover: card leans toward the cursor.
44. Hover surfaces a one-line tagline in a typewriter reveal.
45. Multi-card hover trail: recently-hovered cards keep a fading warm glow.

### 3D tilt, flip & physics
46. Pointer-driven 3D tilt clamped to 8°.
47. Gyroscope tilt on mobile.
48. Specular gloss highlight sweeping across the bezel with tilt.
49. Flip-to-info reveals controls, length, stats on the back.
50. Tilt depth-layers badge, title, art at different Z for true parallax.
51. Spring-physics return overshoot when the cursor leaves.
52. "Holographic foil" gradient that shifts rainbow with tilt for rare/featured cards.
53. Flip triggered by a corner "dog-ear" peel, not the whole card.
54. Tilt disabled under prefers-reduced-motion.
55. Unhovered tiles drift a half-degree on a slow sine (idle wobble).
56. Double-tap on mobile flips; single tap launches.
57. Whole grid counter-rotates toward the cursor as a field.
58. Flip-back auto-timer after 8s.
59. Z-tilt shadow grows/shrinks under the card to sell the lift.
60. Scroll-zoom "card peek" enlarges only that tile.

### Badges, ribbons & chips
61. Corner-folded "NEW" ribbon casting a tiny shadow on the art.
62. Animated "HOT" flame badge flickering only on the week's most-played.
63. Personal-best chip in a pixel LED-segment font.
64. "Last played 3d ago" recency chip in muted text.
65. Global high-score ribbon from a static leaderboard JSON.
66. Star-rating as tiny pixel bones instead of stars.
67. "v2.10" micro-badge for games patched in the last 30 days.
68. Combo badges stack tidily in a fixed corner queue, never overlapping the title.
69. "Speedrun verified" stopwatch badge for timer-mode games.
70. Beta cards wear a diagonal hazard-tape ribbon.
71. "Controller-friendly" gamepad glyph chip.
72. "Made this week" sparkle badge auto-expiring after 7 days.
73. Daily-challenge cards get a calendar-day numbered badge.
74. "Your #1 most-played" crown badge on exactly one card per user.
75. Achievement-progress chip "7/12 unlocked" with a segmented bar.

### Frames, bezels & arcade-cabinet styling
76. Each tile as a mini arcade cabinet: marquee, screen, coin-slot.
77. Marquee strip holds the title in backlit-sign styling.
78. Faux-CRT curvature + scanlines on the screenshot region only.
79. Coin-slot lights up "INSERT COIN" on hover before launch.
80. Chunky beveled pixel-border with hard top-light/bottom-shadow.
81. Bezel reflection: a faint diagonal glass-glare sweep.
82. Cabinet side-art panels visible at the edges for the hero tile.
83. "Cartridge" styling option: labeled carts with a chamfered top.
84. Worn-sticker texture + slight rotation on retro-themed cards.
85. Power-LED dot pulses green when the game is "new".
86. Tile frame thickness encodes difficulty (thicker = harder).
87. Joystick + 2-button glyph cluster hints at controls.
88. Hover "powers on" the cabinet: screen flickers from black to gameplay.

### Score chips, progress rings & states
89. Circular progress ring around the play button showing completion/achievements.
90. Best-score chip flips like a split-flap display when you beat your record.
91. Tiny sparkline of your last 10 scores along the card's bottom.
92. "Streak" flame counter chip for consecutive-day plays.
93. Radial difficulty dial (1-5 pips) as filled pixel dots.
94. Estimated-playtime chip ("~2 min").
95. Percentile chip "Top 12%" vs the static leaderboard distribution.
96. Mini medal row (bronze/silver/gold bones) for tiered thresholds.
97. "NEW" state: subtle perpetual shimmer until first open.
98. Locked cards: frosted-glass blur + pug-bone padlock + unlock hint tooltip.
99. Favorited cards pin a filled paw-heart + persistent warm glow.
100. "Hot this week" cards emit slow rising embers behind the bezel.
101. In-progress cards show a "Resume" ribbon with a saved-run timestamp.
102. Newly-patched cards flag a blue "Updated" dot that clears on view.
103. Just-beaten-record overlays a one-time gold flash next time you see the card.
104. Favoriting plays a "chime + paw stamp" micro-celebration.
105. Hidden/secret game cards appear glitched until an unlock code reveals them.

### Density, hero tiles, sound & accessibility
106. One double-wide hero tile per row spotlighting the featured game.
107. Bento-grid mixing 1x1, 2x1, 2x2 tiles for rhythm.
108. Density toggle: comfortable / compact / list, persisted.
109. Featured tile gets full WebM while small tiles stay static.
110. First-visit large cards; returning visitors default to denser grid.
111. Grid auto-balances so the last row never leaves an orphan card.
112. Distinct hover "blip" + launch "coin-drop" SFX, globally mutable.
113. Vibration pulse on mobile tap-launch.
114. Each card is a single focusable link with a descriptive aria-label.
115. Badges expose text alternatives so SR announces "NEW, Hot".
116. Min 44x44px touch targets for all in-card buttons.
117. Accent-color pairs contrast-checked to 4.5:1 against their card bg.
118. Reduced-motion disables tilt, sprite loops, particles in one media query.
119. Difficulty/length conveyed by icon + text, never color alone.
120. High-contrast mode swaps neon glows for solid 3px outlines.

## 3. Hub animations & micro-interactions

### Page-load choreography
1. Logo letters drop in one-by-one with a 2px squash overshoot.
2. Hub paints in z-order: backdrop → tiles → header → footer, 60ms apart.
3. First-ever visit plays a 1.2s CRT "boot" that never repeats.
4. Each tile fades up from 8px below with delay = grid index × 35ms.
5. Cursor starts as a giant paw that shrinks to normal over 400ms.
6. Header tagline types itself out with a blinking block caret.
7. Tiles arrive pre-rotated ±3° and snap to 0° with a spring bounce.
8. A "fetching biscuits…" loader bar becomes the header underline.
9. A scanline sweeps top-to-bottom once, revealing each tile as it crosses.
10. Pug mascot trots in from the left, sits center, grid pops in around him.
11. Tiles "inflate" from center (scale 0.6→1) with staggered spring stiffness.
12. The corner mini-logo does a single tail-wag flick once loaded.

### Staggered reveals & scroll motion
13. Rows reveal on scroll, tiles cascading left-to-right with 40ms stagger.
14. Section headings underline themselves (width 0→100%) on view.
15. Below-fold tiles start at 60% opacity + 4px blur, sharpening on entry.
16. Thin progress rail on the page edge fills with scroll depth.
17. Tile shadows shift opposite to scroll for faux-3D lift.
18. "Featured" banner does a subtle ken-burns zoom tied to scroll.
19. Scroll velocity gently skews tiles, settling when scroll stops.
20. Category dividers wipe in with a dotted-line draw.
21. Footer rises into place with a gentle overshoot at page bottom.
22. Scrolling up vs down flips stagger direction so reveals feel "forward."
23. Back-to-top paw button fades in past 1.5 viewport heights and bobs.

### Cursor effects & trails
24. Dotted paw-print trail stamps behind the cursor, fading after ~600ms.
25. Kibble-crumb trail physics-scatters on quick movements.
26. Cursor morphs into a wagging-tail glyph over any tile.
27. Idle cursor 3s sprouts a "zzz" bubble.
28. Fast flicks emit 2-3 sparkle particles in the motion direction.
29. Cursor near a tile edge tugs slightly toward the tile center (6px).
30. Holding the mouse button thickens the trail into a paw-print brush.
31. A soft circular spotlight follows the cursor, brightening passed tiles.
32. Double-click drops a one-off bouncing bone that despawns.
33. Cursor trail color samples the hue of the tile it's over.

### Hover / press / transitions
34. Tile hover lifts 6px with layered shadow and 1.03 scale spring.
35. Hovered tile's pug does a single ear-perk twitch.
36. Press squashes to 0.97 with a 1-frame darken.
37. Hover sweeps the game's accent color diagonally across the thumbnail.
38. Release fires a tiny radial "pop" ring from the click point.
39. Long-hover (800ms) flips the tile to a back-face description.
40. Selecting a tile: shared-element transition scaling the thumb to the loading frame.
41. Chosen tile's accent floods outward as a circular wipe before load.
42. Non-selected tiles fly off-screen toward their nearest edge during transition.
43. Back-from-game reverses the wipe, depositing you on the launch tile.
44. Filtering collapses hidden tiles with a FLIP animation; remaining reflow.
45. Search reorders matches to the top with FLIP; non-matches fade to 15%.
46. Theme switch does an iris-wipe from the toggle's position.
47. Sort change animates tiles along curved bezier paths.

### Idle, celebration & physics
48. After 20s idle, tiles begin a synchronized "breathing" pulse.
49. Attract mode: mascot wanders the bottom chasing rolling kibble.
50. Idle tiles do occasional one-off micro-animations (blink, ear-flick).
51. New high score rains pug-and-bone confetti over the hub on return.
52. Clicking the logo 5× fast triggers a confetti bork-storm.
53. First time all 15 games are played, fireworks + "Top Dog" banner once.
54. Beating a personal best does a slot-machine roll-up to the new value.
55. Standardize a 3-tier easing scale: snappy / smooth / bouncy.
56. Tile bounces use a real spring so interrupted animations stay continuous.
57. Overshoots cap at 1.06 scale to stay tasteful.
58. Drag-to-reorder favorites uses inertia + rubber-band at edges.
59. Number tickers ease-out so the last digits crawl in.

### Buttons, toasts, depth & reduced-motion
60. Theme toggle is a sun/moon that rotates 180° and morphs.
61. Category chips fill with their color left-to-right on selection.
62. Selected chip's check draws itself stroke-by-stroke.
63. "Random game" button shakes like a dice cup before resolving.
64. Primary CTA has a slow resting shimmer every 4s.
65. Favorite/heart toggle bursts into a particle pop when filled.
66. Copy-link button morphs into a checkmark, then back after 1.5s.
67. Toasts slide up from bottom-right, overshoot 4px, settle, auto-collapse.
68. Stacked toasts fan slightly; collapse FLIP-style when one dismisses.
69. Toast progress is a thin draining underline.
70. Skeleton tiles shimmer with a diagonal sweep, then cross-fade to real.
71. Loading spinner is a chasing-tail pug that speeds up the longer it waits.
72. Multi-layer parallax on mouse-move at 3 different rates.
73. Header frosted-glass blur intensifies as content scrolls beneath.
74. Subtle grain overlay shifts 1px on interaction so flat colors feel alive.
75. prefers-reduced-motion swaps all transforms for opacity cross-fades.
76. Reduced-motion replaces parallax with a static layered look.
77. Confetti becomes a single static "Nice!" badge under reduced-motion.
78. A user "calm mode" toggle overrides everything to minimal motion.
79. Stagger delays collapse to 0 under reduced-motion (instant but ordered).

### Spatial input, continuity & easter eggs
80. Arrow-key nav moves a glowing focus halo tile-to-tile with a slide.
81. The focus halo stretches elastically toward the next tile before snapping.
82. Touch long-press peeks a larger preview that springs back on release.
83. Two-finger swipe between categories animates a carousel slide.
84. Pull-to-refresh stretches a pug face that grins wider as you pull.
85. Gamepad connected swaps the focus halo for a pulsing "press A" prompt.
86. Returning users' last-played tile gently pulses with a "continue?" glow.
87. Recently-played tiles wear a fading "time-ago" ring that empties over the week.
88. The hub animates a quick re-settle to your last scroll position on return.
89. First feature use shows a one-shot coachmark that dissolves.
90. The 13th tile occasionally "glitches" for half a second then behaves.
91. Holding a tile 3s makes it pant (excited) before launch.
92. Shaking the window makes every pug shake-off like a wet dog.
93. At midnight local time the mascot yawns and the hub dims for an hour.
94. Right-clicking the mascot toggles sit/lie-down instead of a context menu.
95. Typing "treat" drops a bone the mascot trots over to fetch.
96. The scrollbar thumb is a tiny bone that rotates as you scroll.
97. Konami code turns all tiles into their "puppy" art for the session.
98. Hover/press animations sync duration to short SFX so motion+sound land together.
99. Muting sound makes all motion 10% subtler (visual "volume" follows audio).
100. A subtle screen-wide pulse on big celebrations matches the jingle's downbeat.

## 4. Theming, palettes & seasonal skins

### Core theme engine
1. Central data-theme attribute on <html> driving every CSS custom property.
2. Theme tokens in 3 layers: raw palette → semantic roles → per-game overrides.
3. Persist theme in localStorage with a versioned schema for migrations.
4. Per-game theme memory (Pug Heist "Vault Noir" while hub stays "Neon Default").
5. Export current theme as a short base64 "theme code" to paste/share.
6. Importable theme codes validated against a checksum.
7. Shareable theme deep-links (?theme=vaultnoir) that auto-apply then clean the URL.
8. "Last 3 themes" quick-switch ring on long-press of the theme button.
9. Random theme dice that rerolls only among unlocked themes.
10. Reduced-motion-aware themes swap animated gradients for static ones.
11. Theme changes broadcast over storage events so multiple tabs re-skin in sync.
12. First-visit theme inferred from prefers-color-scheme.
13. Theme set pre-paint via an inline head script to kill flash-of-wrong-theme.
14. A "theme lab" sandbox with hue/sat sliders saved to a custom slot.

### Selectable & unlockable themes
15. Three free starter themes; rest unlock via total-stars milestones.
16. "Vault Noir" unlocked after a no-alarm Pug Heist clear.
17. Per-game signature theme unlocks on first beating that game.
18. Mystery locked themes shown as silhouettes with a riddle hint.
19. "Completionist Gold" theme appears once every game is played once.
20. Theme unlock toast with one-tap "Apply now?".
21. Streak-gated "Aurora Week" theme (7 days running).
22. Konami "Bork Mode" theme with deliberately garish clash.
23. Themes tagged with rarity badges (common/rare/legendary).
24. Theme gallery grid with "9 / 24 unlocked" progress.
25. Hidden "Dev Console Green" unlocked by typing borkade.
26. Anniversary theme auto-unlocks on the launch date each year.
27. Theme "loadout" presets bundling palette + CRT + sound pack.
28. Earn-to-gift: a legendary theme grants one shareable code.

### Dark / light / auto
29. True light mode (paper-white canvas, ink sprites), not inverted dark.
30. Auto mode following the OS via matchMedia live listener.
31. Time-of-day auto: dawn pastels, midday bright, dusk amber, midnight violet.
32. "Solar" mode estimating sunrise/sunset from timezone offset.
33. "Dim after 10pm" comfort mode lowering max brightness.
34. Light mode tuned so neon glows become soft shadows, not vanishing.
35. Three-state toggle (Light / Dark / Auto).
36. Smooth 300ms cross-fade between light and dark.
37. "Eclipse" transition when auto mode flips at sunset.
38. Light-mode sprite outlines so white pugs stay visible.
39. Manual override beats auto until reset.

### Seasonal & holiday
40. Calendar-driven auto-skin: December snow + warm string lights.
41. Falling-snow overlay in winter, toggleable.
42. Spring "cherry-bork" with drifting petals.
43. Summer "boardwalk" teal/coral/yellow with heat-shimmer.
44. Autumn "leaf-pile" with a swirling-leaf spinner.
45. Halloween: pumpkin-orange UI, mascot wears bat wings.
46. Valentine's pink-and-red with floating hearts.
47. New Year midnight confetti at local 12.
48. Lunar New Year red-and-gold with paper-lantern logo.
49. Pride-month rainbow accent ring, opt-out in settings.
50. April Fools "upside-down" theme for one day.
51. Seasonal themes previewable year-round, auto-applied only in season.
52. "Holiday opt-out" master switch.
53. Day/night hub theming based on local time.

### Per-genre & per-game sub-palettes
54. Stealth games default to noir + red-alert accents.
55. Racing/delivery get a high-energy speed palette.
56. Cozy/puzzle get a muted "warm den" palette.
57. Horror gets desaturated fluorescent-buzz.
58. Each game declares an --accent the hub tile borrows for hover glow.
59. Per-game "danger color" reserved sitewide so red always = threat.
60. Boss/alert states temporarily override with a pulsing warning palette.
61. Mini-map/radar elements pull a dedicated --map token.
62. Per-game particle colors derived from accent via HSL rotation.
63. "Inherit hub theme" vs "use game theme" per-game toggle.

### CRT, scanline & glow
64. Toggleable CRT overlay: scanlines + subtle barrel distortion.
65. Three CRT intensities (off / soft / heavy arcade).
66. Phosphor-glow recipe: layered text-shadow at 2/6/14px blur.
67. Rolling-scanline animation that can be frozen for screenshots.
68. Vignette toggle separate from scanlines.
69. Chromatic-aberration toggle splitting R/G/B by 1px.
70. "Bloom" slider capped for readability.
71. CRT flicker disabled under prefers-reduced-motion.
72. Per-theme default CRT level.
73. Screen-curvature toggle separate from scanlines.
74. Performance guard auto-disables CRT below an FPS threshold.

### Accessibility & advanced color science
75. WCAG-AA high-contrast theme with thick outlines, no glow.
76. Deuteranopia/protanopia/tritanopia variants as selectable palettes.
77. Colorblind sim preview before choosing a theme.
78. "Never rely on color alone" mode adds icons/patterns to states.
79. Adjustable global contrast slider as a CSS filter.
80. Monochrome "ink" theme for max contrast.
81. Flash/strobe-safe mode capping brightness deltas.
82. Dyslexia-friendly variant + optional OpenDyslexic.
83. Generate full palettes from a single seed hue via fixed HSL rotation.
84. OKLCH-based tokens so brightness stays perceptually even.
85. Auto-derive readable text color per background via WCAG contrast.
86. Palette "temperature" slider warming/cooling every token.
87. Triadic/analogous generator for custom themes from one pick.
88. Auto-generate a dark variant of any custom light theme by inverting lightness.
89. Clamp custom-theme contrast so player palettes can't become unreadable.
90. Theme tokens as typed @property customs for smooth animated transitions.

### Animated backgrounds, mascot & sound
91. Slow-drifting two-stop gradient hub background from accent colors.
92. Parallax starfield whose star tint matches the theme.
93. Animated synthwave scanning-grid floor toggle.
94. Per-theme ambient particles: embers, snow, petals, bubbles.
95. Background dims/desaturates while a game is focused.
96. Neon "tube" border that flickers on at load.
97. Idle screensaver: hub drifts into a slow neon lava-lamp after 60s.
98. Logo wordmark inherits --accent so it recolors with every theme.
99. Mascot per-theme palette swaps (snow-dusted, neon-rimmed, sepia).
100. Theme-linked sound pack (Vault Noir = muffled clicks, Arcade = chiptune blips).
101. Per-theme favicon generated to match the accent.
102. 404/error page reskinned by the active theme with a themed sad-pug.

## 5. Typography & iconography systems

### Font strategy & pixel legibility
1. Pair a chunky 8px display pixel font for headings with a 5px humanist font for body.
2. Reserve the display font for wordmark, game titles, and score totals only.
3. Three-font system: Bork Display (titles), Bork Text (UI), Bork Mono (scores/timers).
4. Bake three weights (regular/bold/black) to dodge synthetic-bold blur.
5. Rounded-pixel font for menus, hard-edged blackletter-pixel only for boss banners.
6. Enforce a min rendered size so 1px serifs never vanish.
7. Body font x-height ≥60% of cap height so 5px glyphs stay readable.
8. Exactly one decorative font site-wide.
9. Fallback display→body→system-mono, never display→sans.
10. Mono font for any per-frame value (FPS/combo/ms) so glyph reflow never jitters.
11. Force image-rendering: pixelated via integer-multiple sizing (8/16/24/32).
12. Disable sub-pixel antialiasing for true bitmap crispness.
13. Detect non-integer DPR and bump to the next clean multiple.
14. Test glyph mirrors (b/d, p/q, 6/9) for ambiguity.
15. Faux-bold by 1px smear, not browser bold.
16. Cap body line length at 60ch (pixel fonts fatigue faster).
17. Verify pixel fonts render in Safari's min-font-size clamp via screenshot diff.

### Type scale, rhythm & fluid type
18. Modular scale locked to pixel multiples (8/12/16/24/32/48/64).
19. Integer-pixel line-height so the baseline grid stays on the lattice.
20. 8px baseline grid; snap every text block's top to it.
21. A --space-glyph unit = one body-font pixel; all gaps are multiples.
22. Negative letter-spacing only on display all-caps titles.
23. Tighten word-spacing on pixel body text by 1 glyph-pixel.
24. Headings: 2 baseline-units before, 1 after.
25. Cap heading sizes per viewport tier.
26. A .stack utility enforcing baseline-multiple gaps.
27. Border/divider widths locked to 1-2 device-pixels.
28. clamp() only between pixel-clean stops.
29. Container-query type per card, not just viewport.
30. Drop the decorative font below 360px width.
31. Keep the wordmark a fixed pixel size, never fluid.

### Tabular figures & numbers
32. font-variant-numeric: tabular-nums on every score/timer/leaderboard cell.
33. Mono font with identical digit advance widths (metrics-tested).
34. Right-align numerics, left-pad with a dimmed zero (00420).
35. Group thousands with a thin pixel apostrophe.
36. Roll each score digit vertically like an odometer on change.
37. K/M suffixes outside live HUD; full digits during play.
38. Reserve a fixed digit-count width so layout never shifts.
39. Timers MM:SS with a colon that blinks on whole seconds.
40. Slashed-zero so scores never read as O.
41. Leading zeros at 30% opacity so significant digits pop.
42. Penalty deltas in red mono sharing width with positives.
43. Right-pad percentages to a fixed 100% width slot.
44. Localize separators via Intl.NumberFormat but force tabular glyphs.

### Icon library & emoji migration
45. Standardize icons on a 16x16 artboard with 1px safe-margin.
46. Two-tier icon grid (16px UI, 32px feature) via a sprite manifest.
47. Icons as a CSS-mask sprite sheet so any icon recolors via background-color.
48. Uniform 1px stroke weight; reject mixed strokes.
49. Optical-volume balancing (circle 1px larger than square).
50. Every icon paired with a hidden title/aria-label.
51. An icon "DNA" doc: shared corner radius, perspective, light source.
52. Canonical 8-icon core kit: coin, bone, paw, crown, heart, star, lock, gear.
53. Snap icon details to a 2px sub-grid.
54. Two states per icon (idle, active = +1px glow), no full redraws.
55. Version the icon sheet; lint that UIs only reference manifest icons.
56. Contact-sheet page rendering all icons at 1x/2x/4x for QA.
57. 24x24 invisible tap-target wrapper even when the glyph is 16px.
58. Audit and catalog raw emoji into an emoji→bespoke-icon map.
59. Replace 🐶/🐾 with the canonical pixel paw.
60. Build-time check failing CI on disallowed emoji in chrome.
61. Migrate ⭐ to a pixel star supporting fractional fill.
62. Keep emoji only inside user/share text, never in chrome.

### Animated icons, readability & headings
63. Gear rotates one 45°-stepped notch on settings hover.
64. Coin flips on a 4-frame cycle when currency increases.
65. Heart outline pulses on damage (2-frame stepped).
66. Loading icon = an 8-frame paw-print trail, not a spinner.
67. Freeze all animated icons to idle under prefers-reduced-motion.
68. Cap icon animation to a 12fps "pixel cadence".
69. 1px hard black outline (4-direction text-shadow) on all HUD text.
70. Layered shadow (black outline + colored glow) for neon headings, ≤2px.
71. Auto-pick black/white outline from underlying luminance.
72. -webkit-text-stroke + paint-order for crisp 1px outlines where supported.
73. Semi-transparent plate behind body text over busy backgrounds.
74. Avoid color-on-complementary text vibration; mandate a neutral outline.
75. <hr> as a repeating 4px pixel-dash divider matched to theme.
76. Bracket-glyph section headings `[ TITLE ]` in display font.
77. Marquee-bulb divider (6px dots) for hero separators.
78. Numbered pixel tabs 01-15 per game section as wayfinding.
79. Chunky pixel chevron bullet for list items.

### Microcopy, i18n & governance
80. Button labels in display ALL-CAPS with +1px letter-spacing.
81. Helper text in body at 80% opacity, 1px shear for faux-italic.
82. Keyboard hints as bespoke [W][A][S][D] pixel keycaps.
83. Error microcopy in alarm-red with the 2px outline.
84. Tooltips at fixed 8px with a 1px sprite arrow.
85. "PRESS START" CTA blinks on a 1s stepped cycle.
86. Per-script fallback stacks so non-Latin never renders tofu.
87. Latin-Extended pixel subset for accented ES/FR/DE titles.
88. Auto-step font down one tier in long-string locales on overflow.
89. Dyslexia mode pairs the readable font with increased spacing/line-height.
90. "Larger text" setting scales body 1.5x via rem without breaking the grid.
91. Vector fallback for every pixel glyph so magnifiers don't break at 5x.
92. Test German/Finnish longest-word against every fixed-width button.
93. Centralize all type in CSS custom properties — zero hardcoded sizes.
94. Generate scale + icon manifest + contrast pairs from one JSON token source.
95. A /styleguide.html listing every size, weight, icon, divider live.
96. Lint CSS for any font-size not referencing a token; fail on raw px.
97. Snapshot-test the styleguide so typographic regressions show in diff.
98. Subset/self-host fonts (no CDN), preload the display font to kill FOIT.
99. A one-page "type & icon contract" all 15 games import.
100. A ?debug=type flag overlaying the baseline grid and outlining text boxes.

## 6. Hub navigation, search & command palette

### Matching: fuzzy, phonetic, synonym
1. Typo-tolerant fuzzy search (Levenshtein ≤2) so "pgu" surfaces pug games.
2. Phonetic Soundex/Metaphone so "klown forrest" finds Clown Forest.
3. Synonym dictionary (robber/thief→Heist, lava/floor→Floor-Lava).
4. Keyboard-adjacency weighting so "lzva" ranks Floor-Lava first.
5. Transliteration so "delivéry" matches ASCII titles.
6. Bilingual ES/EN alias table (perro/dog, ladrón/heist).
7. Stemming so delivering/delivered/delivers hit Delivery-Pugs.
8. Acronym expansion so "BR3D" jumps to Backrooms-3D.
9. Number-word equivalence (three ↔ 3).
10. Highlight the matched span inside each result title.
11. Confidence threshold switching to "did you mean…" below 60%.
12. Diacritic-insensitive index built once at load.
13. Hyphen/space normalization (floorlava = floor lava = floor-lava).
14. Tag-aware fuzzy so "scary" finds horror games.
15. Per-result match-reason chip ("matched: tag 'stealth'").

### Emoji, voice & alt input
16. Emoji search (🐶 lists all, 🔥 surfaces Floor-Lava).
17. Emoji autocomplete suggesting 👻 for "ghost".
18. Web Speech API voice search via a mic button.
19. Voice grammar so "play pug heist" searches and launches.
20. Spoken-number handling ("play game five").
21. Paste-to-search stripping a full URL to the slug.
22. Color search ("yellow"/"#ffd400" surfaces by accent color).
23. Shake-to-randomize on mobile via devicemotion.
24. Mood search ("chill"/"intense") mapped to a difficulty bucket.

### Autocomplete, suggestions & memory
25. Inline ghost-text completion previewing the top match.
26. Dropdown autocomplete with thumbnail + title + tags.
27. Keyboard-navigable suggestions with aria-activedescendant.
28. "Recent searches" row (last 8) with one-tap re-run.
29. Per-search clear + "clear all history" with confirm.
30. Trending searches from local play-count deltas.
31. "Most played" suggestions seeded from localStorage stats.
32. Zero-state suggestions: 3 random "try these" games.
33. Suggestion grouping: Games / Tags / Actions / Recent.
34. Debounced input (120ms) so fuzzy scoring never janks.
35. "No results" offering the 3 closest fuzzy near-misses as buttons.
36. Live result-count badge ("7 games").
37. Sticky last-query restore on reopening search.
38. Hover-preview GIF on a suggestion after 400ms dwell.

### Command palette (Cmd-K)
39. Cmd-K opens a global command palette overlay anywhere.
40. "/" focuses search; Cmd-K opens the full action palette.
41. Fuzzy list mixing games, settings, and meta-actions.
42. "Play random game" / "Resume last played" actions.
43. "Toggle theme" / "Toggle grid/list" with live preview.
44. "Surprise me with a hard game" filtered by difficulty.
45. "Copy link to this game" writes a deep link to clipboard.
46. "Mute all audio" global toggle.
47. Open settings/about/changelog navigation commands.
48. Command aliases (dark/night/lights-off all toggle theme).
49. Recent-commands section mirroring recent searches.
50. Inline keyboard-shortcut hints beside each command.
51. Nested modes: ">" for commands, plain text for games.
52. "Clear all progress" destructive command behind a typed confirm.
53. Alt-Enter opens a result in a new tab.

### Keyboard shortcuts
54. "?" opens a keyboard cheat-sheet overlay.
55. "g h" chord jumps to Home from any sub-view.
56. Number keys 1-9 launch the Nth visible tile.
57. j/k/h/l vim navigation across the grid.
58. Enter launches focused tile; Space opens its detail flyout.
59. Esc closes any overlay and returns focus to its trigger.
60. "f" toggles favorite on the focused tile.
61. "t" cycles theme; "v" toggles grid/list.
62. "[" "]" page through category tabs.
63. Shortcuts auto-disabled while typing in inputs.
64. Per-shortcut visual "key pressed" flash.
65. Remappable shortcuts persisted to localStorage.
66. "gg"/"G" jump to top/bottom of grid.

### Results, URL state & sticky nav
67. Grid/list toggle persisted with a FLIP transition.
68. Compact list mode: title, tags, play-count, last-played.
69. Density toggle (cozy/compact/comfortable).
70. Result-count headline ("Showing 7 of 15").
71. Active-filter chips row with × removal and "clear all".
72. Multi-tag AND/OR toggle.
73. Sort dropdown: Recommended/Newest/Most-played/A-Z/Random.
74. "New" ribbon on games added within N days.
75. Highlight-on-match: dim non-matching tiles, with a toggle.
76. Inline expand: click a tile to expand an in-grid detail panel.
77. Search query in the URL (?q=heist) for shareable results.
78. Filters + sort + view serialized to the query string.
79. Back-button restores prior search/filter/scroll state.
80. Deep link per game (#/game/pug-heist).
81. replaceState for keystroke updates; pushState on committed searches.
82. "Copy current view link" bundling q+tag+sort+view.
83. Sticky top nav that condenses on scroll-down, reveals on scroll-up.
84. Persistent breadcrumb (Home ▸ Category ▸ Game).
85. Floating A-Z jump rail scrolling to the first title per letter.
86. "Back to top" pill past one viewport of scroll.
87. Scroll-spy active-section highlight in nav.

### Mobile gestures & accessibility
88. Swipe-down to reveal search (pull-to-search).
89. Swipe-left/right on category tabs to page between categories.
90. Long-press a tile for a context menu (favorite/share/copy/info).
91. Bottom-sheet command palette on mobile.
92. Thumb-reach bottom nav (Search/Home/Favorites/Random).
93. Haptic feedback on tile focus and launch.
94. Floating "Random game" FAB on mobile.
95. Focus trap inside the palette/search overlay; return focus on close.
96. aria-live region announcing "7 results" after each search.
97. Roving tabindex across grid tiles.
98. Skip-to-content and skip-to-search links.
99. First-run coach-mark pointing out search, Cmd-K, shortcuts.
100. "What's new" badge on the help icon when the changelog has unseen entries.

## 7. Discovery rails & recommendation logic

### Content-based similarity
1. Tag each game with a vector (pace, twitch, chill, puzzle, luck, score-chase); recommend nearest cosine neighbor to last-played.
2. "Because you played Pug Heist" rail seeded by shared genre tags.
3. Similarity by control scheme so muscle memory transfers.
4. "Same vibe, different challenge" — same mood, one tier harder.
5. Shared-mechanic rails: "More stealth", "More dodging", "More timing".
6. Color-palette similarity rail ("more cozy warm-toned games").
7. Session-length sibling rail ("Quick like your last game").
8. Inverse-similarity "Try the opposite of X".
9. Weighted multi-seed: blend your last 3 plays into one query centroid.
10. Tag-overlap badge ("shares 3 tags with your favorite").
11. "Because you beat X" rail unlocked after a win.

### Local trending & jump-back-in
12. "Trending for you" = steepest 7-day rise in your own play count.
13. Bundled static "this week's picks" JSON refreshed at build.
14. "Jump back in" rail for games left mid-run.
15. "You were SO close" rail for last-score within 10% of best.
16. Streak-resume rail protecting an active daily streak.
17. "Unfinished business" — one step from an achievement.
18. Recency-weighted trending (exponential decay).
19. "Back from the dead" resurfacing 60+-day-untouched games.
20. Momentum rail where your scores trend upward.
21. Time-of-day rail (what you play at this hour).
22. "Last session's leftovers" — opened but quit under 30s.

### Cold-start & diversity
23. Cold-start "Start here" rail of 3 approachable games.
24. Onboarding mood picker (chill/intense/brainy) seeding the first rail.
25. Cold-start diversity sampler: one per genre cluster.
26. "Most-loved by everyone" fallback using bundled aggregate stats.
27. Progressive reveal: 5 games cold-start, unlocking rails as you play.
28. Diversity quota: ≤2 games from the same genre per rail.
29. "Get out of your rut" recommending never-played genres.
30. Epsilon-greedy: 1 in 5 slots is a random wildcard.
31. Serendipity slot pinned to a never-opened game.
32. Difficulty-spread rule mixing easy/medium/hard per rail.

### Difficulty ladder & time/mood
33. "Next challenge" = same game's harder mode after a clear.
34. Skill-ladder across games within a cluster.
35. "Ready for hard mode?" after 3 consecutive clears.
36. Personal difficulty estimate from win rate.
37. "Too easy lately" flagging >80% win-rate games.
38. Adaptive demotion if you're losing repeatedly (avoid frustration).
39. "Comeback ramp" easing you back after a long absence.
40. "You have 5 minutes" rail of sub-5-min games.
41. Late-night low-intensity dark-palette quiet games.
42. Mood toggle (calm/hyped/focused) re-weighting the homepage live.
43. Session-budget slider filtering rails by clear-time.
44. Detected-rage cooldown swapping in a "decompress" rail after 3 fast losses.
45. "One-and-done" rail for clean single-run loops.

### Collections, editorial & surprise
46. "Complete the set" rail for nearly-finished collections.
47. Seasonal collection auto-activated by date.
48. Mechanic-themed sets ("The Stealth Shelf", "The Reflex Rack").
49. Color-themed collections ("Neon Night", "Pastel Picnic").
50. "Speedrun starter pack" collection.
51. Progress meter on each collection card.
52. "Two-minute tour" chaining 5 ultra-short games.
53. Mystery collection revealed only as you play.
54. Staff-pick-of-the-day rotating by date hash.
55. Editorial blurb ("why we love it") on the spotlight card.
56. Rotating hero spotlight per page load.
57. "Hidden gem" rail of high-quality, low-play games.
58. Anniversary spotlight resurfacing your first-ever played game.
59. "Surprise me" weighted toward unplayed games.
60. Slot-machine reel spinning three games, daring you to play the middle.
61. "Blind date" hiding name/art until you commit.
62. Daily "mystery box" with a streak for opening it.

### Rail meta-logic, affinity & profiling
63. Personalized rail ordering: float your most-clicked rail to the top.
64. Click-through learning demoting ignored rails.
65. Rail fatigue: hide a rail scrolled past 5 times unclicked.
66. "Pin this rail" to lock a favorite row to the top.
67. Dismiss-a-rec ("not interested") down-weighting it everywhere.
68. Recommendation-reason chips on every card.
69. De-dupe across rails so a game never appears twice above the fold.
70. Adaptive rail count: fewer for new users, more as data accrues.
71. "Reset my recommendations" nuke button.
72. Local co-occurrence: "you often play X right after Y".
73. Transition-probability "what's next" single best follow-up.
74. Markov-chain autoplay queue of your likely next 3 games.
75. Auto "taste portrait" ("Twitch Tactician") driving a matching rail.
76. Genre pie-chart insight + "explore my weakest slice" rail.
77. "Discovery score" rewarding breadth.
78. Weekly "taste recap" suggesting one new thing.
79. Completionist tracker ("4 games left to have played them all").
80. "Revenge match" rail for the game that beat your last PB attempt.
81. "Goldilocks" rail of games where your win rate is 40-60%.
82. "Forgotten favorite" cross-referencing favorited-but-not-recently-played.

## 8. Filtering, tags & faceted sorting

### Tag taxonomy
1. Frozen canonical tag vocabulary in one tags.json.
2. Orthogonal namespaces: genre:/vibe:/controls:/length:/players:/a11y:.
3. Exactly one primary genre tag per game.
4. Cap each game at 8 tags; force curation.
5. Synonym map silently rewriting legacy tags on load.
6. Version the taxonomy so saved filters can migrate.
7. Internal-only tags (wip/experimental) hidden from the UI.
8. One-line tooltip definition per tag.
9. Namespace color-coding (genre=warm, a11y=blue).
10. Lint failing on orphan tags matching <2 games.
11. canonicalSlug per tag distinct from display label.
12. Hidden era tags (retro-80s, crt) for aesthetic filtering.
13. Tag-implication rules (coop implies two-player).
14. Mutually-exclusive groups (quick XOR epic) validated at build.

### Facet chips & multi-select logic
15. Toggle chips, not dropdowns, so filter state is visible.
16. Live result count on each chip vs current other filters.
17. Grey-out chips that would yield zero results.
18. Collapsible facet headers; collapse rarely-used facets.
19. "Clear all" pill with active-filter count.
20. Active filters as removable tokens in a summary bar.
21. Long-press a chip → "only this".
22. Hover a chip dims non-matching cards (preview).
23. Chips reorder by popularity over time.
24. "More…" expander for the niche-tag long tail.
25. Within-facet OR, across-facet AND (the intuitive default).
26. Per-facet OR→AND toggle ("must have ALL").
27. Alt-click to negate (NOT) a tag.
28. Visual language: positive filled, negated struck-red, OR bracketed.
29. Plain-English query echo ("Quick puzzle games for 2 players, not scary (6)").
30. Separate "Exclude" tray for NOT chips.
31. Bracketed precedence for mixed logic.

### Intent presets & sorting
32. "Beginner-friendly" preset = easy+tutorial+forgiving, no twitch.
33. "Score-chase" preset = leaderboard + arcade vibe.
34. "2-player/couch" preset surfacing local-multiplayer.
35. "Quick" = length:under-5-min.
36. "One-handed" = arrows OR WASD OR mouse only.
37. "Zen/no-fail" = no death/timer.
38. Preset cards above the fine-grained chips; hover shows underlying filters.
39. Sort: Recommended/Newest/A-Z/Most-played/Random.
40. "Personal best closest to beating" sort.
41. "Most improved" by score delta.
42. "Unfinished/unbeaten" first.
43. "Haven't played in longest" rediscovery.
44. "Completion %" sort from local achievements.
45. "Quickest to a win" by median time-to-first-clear.
46. True Random with a reshuffle dice + shareable seed.
47. Sort direction toggle decoupled from sort key.
48. "Difficulty: gentle→brutal" sort.
49. Secondary tie-break (A-Z) for stable order.
50. "Just added since your last visit" with NEW ribbons.

### URL state, empty states & auto-tagging
51. Encode full filter+sort state in the URL with canonical slugs.
52. Round-trip pasting a filter URL restores chips, NOT-tray, sort.
53. "Copy filter link" with a toast.
54. Save named filters ("My cozy quickies") as one-tap chips.
55. A default landing filter the user can pin.
56. Export/import saved filters as a JSON blob.
57. Repair/delete a stale saved filter matching zero games.
58. Always show "N games" updating live (animated count).
59. Zero-results suggests the single filter to drop for the most games back.
60. "Loosen filters" removing the most-restrictive facet first.
61. Distinguish "0 because filters" from "0 because nothing tagged".
62. Auto-infer length from session metadata.
63. Auto-tag has-leaderboard by detecting a score key.
64. Auto-tag controls by scanning keydown handlers.
65. Auto-tag two-player when a 2nd input scheme registers.
66. Auto-derive difficulty from local death/retry counts.
67. Auto-tag new for 14 days from addedDate, then expire.
68. Heuristic twitch tag from input events/sec.
69. Lint flagging auto-tag vs manual-tag conflicts.

### Accessibility facets, performance & mobile
70. a11y:colorblind-safe / no-flashing / one-handed / pausable / no-time-pressure / remappable-keys / large-targets facets.
71. An "Accessibility" preset opening all a11y facets pre-grouped.
72. Facet chips carry ARIA pressed-state and announce counts.
73. Precomputed tag→game bitsets so multi-facet filtering is O(facets).
74. Debounce rapid chip-toggling.
75. "/" palette to type-filter ("puzzle quick 2p" → chips).
76. Filter state survives hard refresh (URL is source of truth).
77. Sort independent from facets; "lock sort" so Random doesn't reshuffle.
78. Memoize last-5 filter results for instant Back/Forward.
79. Graceful no-JS degradation: render all games, hide filter UI.
80. "Related filters" row (after puzzle, suggest +cozy from co-occurrence).
81. Auto-suggest the next facet that best splits the result set.
82. "Broaden" chips appear when results <3.
83. Collapse facets into a bottom-sheet "Filter" drawer on mobile with a live "Show N games" apply button.
84. Horizontal scroll-snap chip rails per facet on mobile.
85. Taxonomy linter in CI (orphan/undefined/typo tags fail the build).

## 9. Empty states, loading & errors (pug personality)

### Branded loaders & loading tips
1. Boot splash: pug yawns, stretches, shakes off sleep dust before the logo snaps in.
2. Loader spinner is a pug chasing its tail, speed scaling with progress.
3. "BORKADE" letters drop in with paw-print thuds.
4. Loading bar = a leash reeled in; the pug nears a bone at 100%.
5. Cartridge-insert animation into a pug-shaped console with a clunk.
6. CRT power-on with a pug silhouette settling into the menu.
7. Pug fills a food bowl; full = ready.
8. Pug does push-ups; each rep = +10%.
9. Snoozing pug in a hammock wakes at 100%.
10. Pixel rain of bones filling a bowl as a literal progress meter.
11. Rotating loading tips narrated by the pug ("the cake in Floor-Lava is a lie").
12. "Did you bork?" trivia cards about each game.
13. Tip cards stamped "approved by management (a pug)".
14. Transition: pug grabs the old game and trots off, dropping in the new.
15. "Now leaving [Game A]…" departures-board flap with the pug as announcer.
16. Between games, the pug stamps a passport with the game's logo.
17. Loading tips count down: "3 borks until launch… 2… 1…".
18. One absurd lie per session ("hold W to summon a bigger pug").
19. Teleport transition: pug steps into a portal, brief static, reappears.
20. Loading tips localized to the season.

### Empty states
21. Empty favorites: a lonely pug by an empty bowl.
22. Fresh profile: blank pug avatar with a "?" collar tag.
23. No search results: pug digs a hole, pops up confused.
24. Empty history: dusty cabinet, pug blowing off cobwebs.
25. Zero high-scores: pug holds a blank scoreboard, "be the first to bork".
26. Empty achievements: trophy shelf with one pug-shaped dent.
27. Empty cart/unlocks: pug window-shopping at a closed pixel shop.
28. Fresh leaderboard: a fur-tumbleweed rolls across an empty podium.
29. Empty notifications: pug napping on the mailbox.
30. No saved games: blank slots styled as empty dog-bowls.
31. Empty filter result: pug holds a sieve dripping nothing.
32. First-visit grid: every tile gently pulses "play me".
33. Empty wishlist: a star cookie-cutter with no cookie.
34. Cleared search: pug sweeps results away with a broom-tail.
35. Empty replays: a film reel unspooled, pug tangled in it.
36. Zero daily streak: calendar with one hopeful empty square.

### First visit, offline & PWA
37. First-ever visit: pug pops from behind the logo, "oh hi, new friend!".
38. Cold-start tour: a "ghost hand" pug points at the grid.
39. "Pick your starter pug" avatar select.
40. Welcome doormat "WIPE PAWS" on the very first load.
41. First-run name prompt: pug holds a chalkboard.
42. Returning-after-absence: pug with a "we missed you" sign + dust.
43. Offline banner: pug with two cans on a string, "line's dead".
44. PWA install prompt: pug holds your home-screen icon out, "take me home?".
45. Slow network: pug pedals a tiny bike dragging the loading bar uphill.
46. Reconnecting: pug jiggling a pixel router.
47. Offline mode: grayscale pug with a candle, "playing by lamplight (cached)".
48. "Back online!": pug bursts through with confetti.
49. PWA added: pug saluting from your new home-screen icon.
50. Offline leaderboard note: "scores saved locally; I'll mail them when wifi's back".

### Errors, crashes & 404/500
51. 404: pug sniffing a dead-end alley, "this URL ran off the leash".
52. 500: pug with a wrench amid sparks, "I broke something. Borking it.".
53. Generic error: pug in a cone of shame, "oops, my bad".
54. Crash recovery: "I tripped over my own paws — try again?" + retry.
55. 403: stern pug bouncer crossing paws, "members only, pup".
56. 418 teapot: pug pouring tea, "I'm a pug, not a teapot".
57. Error toast styled as a chewed-up error log the pug "ate".
58. Game-specific crash: that game's mascot apologizes in-character.
59. Maintenance page: pug in a hard hat, "renovating the doghouse".
60. JS-disabled fallback: pug holding a sign, "I need JavaScript to do my tricks".
61. Asset 404: placeholder pug, "imagine a cool thing here".
62. Repeated crash: pug offers a "report this bork" button.
63. Rage-quit detector: after 3 fast retries, pug offers an easier mode, "no judgment".
64. WebGL-unsupported: pug with broken glasses, "try another browser?".
65. Stack-trace easter egg: expand the error to find ASCII pug art.

### Save, paused, idle & update states
66. Save success: pug stamps the slot with a glowing paw print.
67. Quota full: overstuffed toy box, pug on the lid, "no more room!".
68. Storage-cleared warning: pug with a broom, "this will erase locals — sure?".
69. Local-storage blocked (private mode): pug in an eye-mask, "I can't remember anything".
70. Export-save prompt: pug hands you a floppy disk, "keep a backup".
71. Pause screen: pug freezes mid-stride like a statue, spotlighted.
72. Idle 30s: pug grooms itself, oblivious.
73. AFK 2min: pug curls up and naps with "Z" pixels.
74. AFK return: pug startles awake, "oh! where were we?".
75. Tab-blurred: pug peeks at the tab edge, "psst, come back".
76. Update available: pug with a "NEW!" balloon, "reload?".
77. Update installing: pug swapping in a fresh shiny cartridge.
78. "Are you still there?" idle modal with a concerned pug.
79. Battery-low: pug dims the lights, "low-glow mode on".
80. Long-idle screensaver: DVD-logo-style bouncing pug.

### Skeletons, slow-network & personality
81. Skeleton tiles: grayed cards with a shimmering fur-brush sweep.
82. Skeleton text shaped like little chew-bones.
83. Thumbnails "develop" like a Polaroid the pug shakes.
84. Slow-load after 5s: pug pokes in, "still fetching, hang tight".
85. Slow-load after 10s: pug offers a mini tap-game to pass time.
86. Partial-load: loaded games playable while others show "fetching…".
87. Prefetch hint on hover: pug "sniffs" the tile, quietly preloading.
88. Low-data mode: pug in a thrifty sweater, "lite graphics".
89. Every state has a 1-in-50 rare "golden pug" variant.
90. Konami code in any error state summons a party pug that fixes it with confetti.
91. State mascot reacts to local time (sleepy at night, hyper at dawn).
92. Long-press the mascot in any state for a secret boop + happy bork.

## 10. Settings, preferences & profile customization

### Organization & per-game settings
1. Fuzzy settings search matching synonyms ("loud"→volume, "epilepsy"→flashing).
2. Type-ahead showing breadcrumb path ("Audio › Mix › Bark volume").
3. "Recently changed" strip pinning the last 5 settings.
4. Per-setting deep-link URL.
5. "?" over any toggle reveals a plain-language one-liner.
6. Inline mini-preview (2s loop of the effect on/off).
7. Settings change-log drawer with timestamps + old→new.
8. Settings grouped by goal ("I want it quieter/calmer"), not by category.
9. Collapsible "Show advanced" reveal to reduce overwhelm.
10. Settings A-Z flat index mode for power users.
11. Three-state per-game toggles: Inherit / Force on / Force off.
12. Per-game difficulty memory reopening at your last tier.
13. Per-game speed slider (0.5x-1.5x).
14. Tile indicator showing a game has non-default settings.
15. "Copy settings from another game" cloner.
16. Per-game camera-shake independent of global motion.
17. Per-game palette swap (Heist's red alarms → blue).
18. Per-game control remap isolated from other games.
19. Per-game HUD density (minimal/standard/verbose).
20. Per-game high-score reset isolated from a global wipe.

### Profiles, avatars & flair
21. Pug avatar builder (coat, ear flop, tongue-out, hat).
22. Procedural default avatar seeded from the profile name.
23. Nameplate frames unlocked by milestones (bronze/silver/gold bones).
24. Animated avatar idle-waddle on the profile screen.
25. Equippable flair pins per game (heist mask, lava flame).
26. Color-customizable nameplate with high-contrast safe presets.
27. Avatar expression reflecting recent performance.
28. Seasonal cosmetic flair, toggleable off.
29. Avatar "mood ring" border tied to streak.
30. Randomize-avatar dice button.
31. Fast profile switcher with avatar thumbnails, no reload.
32. "Guest" ephemeral profile discarded on tab close.
33. Per-profile optional 4-emoji passcode (sibling friction, not security).
34. "Who's playing?" Netflix-style chooser for multiple profiles.
35. Per-profile favorites surfaced first on their home.
36. Profile avatars on the local leaderboard.

### Parental/teacher mode
37. PIN-gated parental panel with a forgot-PIN local reset via export file.
38. Per-profile daily playtime budget with a 5-min warning then soft lock.
39. Allowlist of games a child profile can open.
40. "Bedtime" window disabling play between set hours.
41. Teacher mode applying a classroom preset to all child profiles.
42. Disable external links + data-export under kid-safe lock.
43. Local session report card of what was played and for how long.
44. Break reminder every N minutes.
45. Lock cosmetics so kids can't undo a parent's setup.
46. Per-profile content-intensity cap (hide scarier games).
47. Parental override forcing reduced-motion + high-contrast locked on.
48. Export a parental config QR/file to clone to a sibling.

### Audio, motion & input
49. Independent sliders: master/music/SFX/UI/barks/ambience.
50. "Duck music when SFX plays" toggle.
51. Mono-audio toggle for single-sided hearing.
52. Audio "night mode" compressing dynamic range.
53. Mute-on-blur with a fade-out.
54. Per-category preview buttons.
55. Bark-frequency limiter.
56. Subtitle/caption toggle for audio cues.
57. Visual sound indicator alternative.
58. Separate toggles: camera shake / screen flash / particles / parallax / zoom-punch.
59. Motion-intensity slider (0-100%), not binary.
60. Flash-safety badge confirming <3 flashes/sec.
61. "Calm mode" master dialing all to gentle in one tap.
62. Particle-density slider for low-end devices.
63. "Freeze decorative loops" to save battery.
64. Full key-rebind with conflict detection.
65. On-screen touch controls toggle with size/opacity.
66. Left/right-handed touch mirror.
67. Hold-vs-toggle for run/aim actions.
68. Input dead-zone slider for stick drift.
69. Adjustable double-tap/long-press thresholds.
70. "Reset just my controls".

### Data, wizards, presets & reset
71. "What we store" plain-language page listing every localStorage key.
72. Per-category export (settings / scores / everything) as JSON.
73. Import with a dry-run preview before applying.
74. Storage-usage meter per profile.
75. "Wipe this profile" vs "wipe everything" distinct confirmations.
76. Tombstone undo: a wiped profile recoverable for 60s.
77. Versioned export files with a schema tag.
78. Cloud-opt-in framed as off-by-default with a one-line trade-off.
79. Corruption-detector quarantining unreadable saves gracefully.
80. "No tracking, no servers" honesty banner on the data page.
81. First-launch accessibility quick-setup wizard (3 questions).
82. "Tune it for me" wizard writing matching toggles from goals.
83. One-tap presets: Calm / Default / Arcade-Intense / Kid-Safe / Low-End.
84. Preset preview card showing exactly what changes.
85. Save-your-own named preset slot.
86. Smart defaults honoring OS reduced-motion/contrast on first run.
87. Device-aware defaults (touch controls on phones).
88. Granular reset (audio/visual/controls/cosmetics independently).
89. Two-step typed "RESET" only for the full wipe.
90. "Undo last reset" until reload; reset button never adjacent to Save.

## 11. Deep accessibility

### Screen-reader & semantics
1. ARIA application role on each canvas with aria-keyshortcuts.
2. Mirror canvas state into an aria-live region narrating score/lives/level.
3. aria-live="assertive" only for urgent events (hit, game over).
4. A visually-hidden DOM grid mirroring the playfield for grid games.
5. Focusable DOM proxy nodes for interactive sprites with live coords.
6. aria-roledescription using the game's own vocabulary.
7. Debounce live-region updates (300-500ms) to prevent flooding.
8. "Verbose / terse / off" narration verbosity setting.
9. Announce relative positions ("enemy 2 left, 1 up").
10. SR-only "scan surroundings" key reading 8 neighbors.
11. aria-describedby pointing to a rules summary before play.
12. Label all HUD buttons with text, never icon-only.
13. A screen-reader-playable text variant (turn-based command list).
14. Document landmarks + skip-to-game on every page.
15. Focus trap + return-focus on modal open/close.
16. High-score table as a real <table> with caption + scope headers.
17. aria-pressed/aria-checked on every toggle.

### Visual / low-vision / color
18. Hand-tuned colorblind palette per game (protan/deutan/tritan).
19. Real-time Daltonize shader option.
20. Never color alone — pair with shape/icon/pattern.
21. Selectable fill patterns (stripes/dots) to distinguish enemies.
22. High-contrast canvas mode (pure b/w + one accent, 7:1).
23. Honor forced-colors (Windows High Contrast).
24. In-game UI scale slider (75-200%) that reflows.
25. Dyslexia-friendly font for menu/HUD text.
26. Adjustable letter/word-spacing + line-height (WCAG 1.4.12).
27. Text scales to 200% with no content loss.
28. High-contrast outline option around the player sprite.
29. Adjustable crosshair/spotlight tracking the player.
30. Screen-magnifier mode keeping the player centered.
31. "Reduce visual clutter" hiding decorative parallax/particles.
32. Focus indicators 2px+ at 3:1 contrast.
33. Brightness/gamma slider for photophobia.
34. Recolor player/enemies/pickups via color pickers.

### Photosensitivity & motion
35. Audit every effect against 3-flashes/sec; cap flash rate.
36. Global "photosensitivity safe mode".
37. Replace hit flashes with a non-flashing edge vignette/wash.
38. Limit any flash to <25% of viewport.
39. Throttle particle/explosion brightness deltas.
40. Tie shake to reduced-motion + a shake-intensity slider.
41. "Reduce flashing" dial separate from the binary safe-mode.
42. Static/slow backgrounds under reduced-motion.
43. Pre-launch warning + skippable test pattern for retained flashing.
44. Avoid saturated-red flashes specifically.
45. Cross-fade scene changes under reduced-motion.

### Hearing & motor
46. Closed captions for spoken cues, repositionable.
47. Caption meaningful SFX ("[coin]", "[enemy behind]").
48. Visual "sound radar" ring for off-screen audio.
49. Directional edge indicator for off-screen threats.
50. Visual beat/VU indicator for rhythm gameplay.
51. Separate music/SFX/UI/voice sliders + master mute.
52. Mono-audio toggle.
53. Vibration-API haptic cues as an audio substitute.
54. Caption ambient audio signaling state (rising danger, low timer).
55. Full input remapping to any key/button, persisted.
56. One-hand layouts (left-only and right-only) per game.
57. One-button play mode where a single input contextually acts.
58. Switch-access scanning with configurable speed/dwell.
59. Dwell-click (hover-to-activate) for menus.
60. Pointer Events so touch/pen/mouse/assistive all work.
61. No required simultaneous combos; sequential/toggle alternatives.
62. Hold→toggle option for low-stamina users.
63. "Sticky" modifier toggles for chorded actions one key at a time.
64. Configurable key-repeat/debounce; ignore unintended double-presses.
65. Analog/d-pad equivalence + deadzone/sensitivity sliders.
66. On-screen virtual pad ≥44×44px targets.

### Timing/assist, cognitive & conformance
67. Coyote-time + input-buffering as first-class a11y aids with a slider.
68. Global game-speed slider (50-100%).
69. Assist menu: invincibility, extra lives, slower enemies, bigger hitboxes, infinite time.
70. Every timed challenge has an untimed/generous option.
71. "No fail"/practice mode.
72. Enlarged hitboxes toggle.
73. Forgiving aim-assist/snap-to-target.
74. Checkpoints + rewind-on-death.
75. Difficulty changeable mid-run, not locked at start.
76. Auto-pause on tab blur (Visibility API).
77. Non-punitive assists (no score-shaming asterisk).
78. "Calm/low-stimulus" mode (muted palette, no shake, slower pace).
79. Pause-anywhere with clear resume.
80. Always-available plain-language objective reminder.
81. Consistent UI layout/iconography/controls across all 15 games.
82. Plain-language instructions, short sentences.
83. Skippable, replayable, pausable tutorial.
84. Icons + text labels together everywhere.
85. Confirmation + undo for destructive actions.
86. One global accessibility panel + per-game overrides, persisted.
87. Respect reduced-motion/transparency/contrast/forced-colors/color-scheme.
88. Surface a11y settings on the front page, not buried.
89. a11y presets ("Low vision", "Motor", "Calm", "Deaf/HoH") as one-click bundles.
90. Per-game WCAG 2.2 AA audit + axe-core in CI + a11y feature badges on cards.

## 12. Localization & internationalization

### Architecture & picker
1. Extract every string into per-game strings.en.json keyed by stable IDs.
2. A ~30-line t(key, vars) helper shared via one i18n.js.
3. Namespace keys by game slug; shared common.* bundle.
4. A _meta.note per string giving translators context.
5. Mark non-translatable tokens ({brand}, pug names).
6. CI grep failing the build on bare visible-text strings.
7. Store IDs not English in game logic.
8. Lazy-load only the active locale bundle.
9. Split bundles into high-churn ui vs stable lore.
10. sourceHash per locale to detect stale strings.
11. data-i18n="key" convention for static HTML.
12. missingKeyHandler logging in dev, falling back to English in prod.
13. Globe-icon picker persisting to localStorage.
14. Auto-detect from navigator.languages but never override explicit choice.
15. Language names in their own script ("日本語", "Español").
16. "System default" option re-following the browser locale.
17. ?lang=es URL override for shareable localized links.
18. Fall back pt-BR → pt → en without a 404.
19. Cache the chosen locale in the service worker.

### RTL, layout & formatting
20. dir="rtl" on <html> + logical CSS props (margin-inline-start).
21. Audit HUDs for hardcoded left/right pixel offsets under RTL.
22. Do NOT mirror gameplay sprites/levels under RTL — only chrome.
23. Reserve 30-40% extra button width for German/Finnish overflow.
24. min-width + ellipsis + tooltip for score labels that can't grow.
25. Test the longest known translation in every fixed-width box.
26. Auto height menu rows so two-line translations don't clip.
27. Verify the pixel font covers the target script (else clean fallback).
28. Pseudo-localize early ([!!! Ḷöröm !!!]) to expose truncation.
29. Format scores with Intl.NumberFormat per locale.
30. Compact notation for big scores ("1.2M"/"120万").
31. Timestamps via Intl.DateTimeFormat, never hardcoded MM/DD/YYYY.
32. Durations via Intl.DurationFormat.
33. Localize ordinal ranks (1st → 1.º → 1er).
34. Tabular figures in HUD so digit width stays stable.
35. Relative times via Intl.RelativeTimeFormat.
36. Localize percentages and list formatting (Intl.ListFormat).

### Plurals, grammar & workflow
37. Intl.PluralRules, not n===1 ternaries.
38. ICU MessageFormat for every counted noun.
39. Support 3-6 plural forms (Polish, Arabic, Russian).
40. Never concatenate sentences; pass full templated sentences.
41. {gender, select} slots where descriptors must agree.
42. Explicit zero-case ("No bones yet").
43. Test plural rules at boundaries (0,1,2,11,21,101) per locale.
44. Seed new locales with MT, flag mt_unreviewed until human sign-off.
45. A borkade-l10n repo; source JSON is the single source of truth.
46. A static web string-editor (read/write JSON via GitHub API) for non-coders.
47. In-context screenshots per key for translators.
48. Glossary locking brand terms from MT.
49. Public "help translate" progress bar to recruit community.
50. Localized credits scroll crediting translators.
51. Diff bot opening issues for stale keys when English changes.
52. Tone review so MT lands as teen/meme voice.
53. do-not-translate.txt enforced in the pipeline.
54. Translation memory reusing repeated phrases.

### Cultural localization & SEO
55. Tier strings: T1 UI (must), T2 lore (should), T3 memes (transcreate).
56. Transcreate game-over puns into native puns.
57. Alternate joke bank per locale.
58. Localize pug "bork/woof" onomatopoeia (wan wan / guau guau).
59. Decide brand-wide that pug names stay English (recognizability).
60. Flag region-sensitive imagery/jokes for cultural review.
61. Replace US-only references with locale-equivalent events.
62. Localize SFX captions / a11y subtitles.
63. Prefer visual/situational gags (translatable by design).
64. Serve localized pages under /es/, /ja/ path prefixes.
65. hreflang alternates linking every language version.
66. hreflang="x-default" to the picker/English root.
67. Localize <title>, meta description, OG tags per language.
68. Pre-render static localized HTML per game for crawlers/no-JS.
69. Localized sitemap.xml per locale.
70. Translate URL slugs where it aids local SEO (/es/atraco-pug/).
71. Localize VideoGame JSON-LD name/description.
72. Localize the PWA manifest name/short_description.

### Fonts, testing & rollout
73. Subset web fonts per locale to keep the retro feel small.
74. Script-coverage matrix mapping locale → font with verified glyphs.
75. Pixel-style fallback chain so missing glyphs degrade to a readable system font (no tofu).
76. Verify combining marks (Vietnamese, Thai) don't clip.
77. Confirm Arabic shaping/joining in the chosen font.
78. Lazy-load heavy CJK fonts only when a CJK locale is active.
79. Pull analytics visitor-language data to rank which locales to fund.
80. Prioritize es, pt-BR, fr, de, it (Latin, easy font coverage) first.
81. Ship one fully-localized game end-to-end as a template.
82. A "locale readiness" checklist (font/RTL/plurals/SEO) before going public.
83. Keep locales in beta (badged) so partial translations still help.
84. A pseudo-locale (?lang=pseudo) for instant truncation testing.
85. CI fail if a locale is missing English keys (no silent fallbacks shipping).
86. CI fail on orphan keys not present in English.
87. Snapshot-test the longest-string locale for overflow.
88. Playwright loads each game in each locale, screenshots menu + game-over.
89. Verify switching language mid-game updates HUD live without losing state.
90. Always keep an "English (original)" option so nothing traps a user.

---

# PART B — Retention, social, meta-progression & audio

## 13. Daily, weekly & seasonal engagement loops

### Daily challenge & date-seeded content
1. Date-seeded "Pug of the Day" — one game crowned daily via a date hash; everyone gets the same layout.
2. Daily seed string shown on screen ("JUN-06-BORK") so players verify they got the same run.
3. "Mirror Monday" — the daily ships flipped horizontally one day a week.
4. Same-seed leaderboard resetting at local midnight, separate from all-time.
5. Daily "one life only" variant of any game.
6. Deterministic daily obstacle pattern so a "perfect run" exists to chase.
7. "Yesterday's seed" practice mode (fun, no score).
8. Daily par score shown before you start as a goal-gradient anchor.
9. Date-seeded palette swap so each day feels visually distinct.
10. Daily "cursed modifier" rolled from the date (inverted controls, double speed) shown as a banner.
11. Shared daily 3-game gauntlet; total score across all three.
12. Calendar-locked rotation (Pug-Heist Tuesdays).

### Daily quests, rerolls & login calendars
13. Three daily quests/profile (easy/medium/spicy) seeded from the date.
14. One free quest reroll per day, the rerolled quest visibly "fresh".
15. Quest chains: finishing all three unlocks a capstone fourth.
16. Login calendar grid; today pulses, claimed days get a paw stamp.
17. Streak-aware escalating login reward (day 1 small, day 7 cosmetic).
18. Weekly "catch-up" token retroactively stamping one missed day (ethical).
19. Daily-claim chest with a "next reward in 23:14:02" countdown.
20. Quest progress persists mid-session so an abandoned quest nags (Zeigarnik).
21. "Almost there" toast when a quest is >80% done.
22. Reroll bank: skip today's reroll, stack up to 3.
23. Daily quest variety guarantee (never the same quest two days running).
24. "Surprise quest" hidden until you launch your first game of the day.

### Weekly modifiers & featured games
25. Weekly global modifier ("Big Head Week", "Low Gravity Week") across all games.
26. Featured "Spotlight Game" each week with 2x cosmetic-token payout.
27. Weekly community goal aggregating local high scores into a site-wide bar.
28. "Hard Mode Week" doubling difficulty for an exclusive weekly badge.
29. Rotating control-scheme-of-the-week (one-button, mouse-only).
30. Weekly theme palette (Neon Week, Sepia Week) restyling the arcade.
31. "Throwback Thursday" surfacing the oldest game with a CRT filter.
32. Weekly remix: one game gets a temporary rule twist.
33. Weekend "Double Bork" — all score multipliers doubled Sat/Sun.
34. Sunday "Marathon Mode" chaining all 15 games into one endurance run.
35. Friday "Free-for-All" previewing (not claiming) every locked cosmetic.

### Seasonal events & limited cosmetics
36. Four seasonal pug skins auto-applied by real-world season.
37. Event-only currency spent at an event-only cosmetic stall.
38. Seasonal map dressing (snow piles, falling leaves) across backgrounds.
39. Time-gated cosmetics that "vault" forever after the event (ethical FOMO: never re-sold, just earned).
40. Seasonal soundtrack swap toggleable in settings.
41. Event progress track (free-only battle-pass ladder) that expires.
42. "Last 48 hours" countdown banner nudging completion.
43. Seasonal title cards ("Summer 2026 Champion") permanent on the profile.
44. Rotating seasonal-hat shop where past seasons return on their anniversary.
45. Seasonal "collection book" showing the gaps (Zeigarnik).

### Holidays, anniversaries & time-gated hooks
46. Advent calendar in December — 24 doors, big reveal on the 24th.
47. Halloween "Spooky Pug" event (ghost-pug skin, pumpkin daily).
48. Valentine's "Heart Bork" — gift a redeemable cosmetic code to a friend.
49. New Year "Wrapped" page archiving stats; fresh streaks begin.
50. April Fools "Everything Is Backwards" one-day gag.
51. Pug Appreciation Day free premium cosmetic for everyone.
52. Lunar New Year zodiac costume event.
53. Site-anniversary "Birthday Bork" with candle-hat cosmetic + confetti.
54. Per-profile account-anniversary card + loyalty cosmetic.
55. Milestone events on total-plays counts (site-wide party mode).
56. "Founder" cosmetic for profiles created in the first month.
57. "Mystery game" silhouette with an unlock countdown to a new title.
58. Daily "Happy Hour" date-seeded window with bonus tokens.
59. Midnight-only "Night Owl" mode with a nocturnal skin.
60. Drip-fed lore: one comic panel unlocks per day.
61. Weekend-vault: certain games only playable Sat/Sun.
62. "Coming soon" teaser tiles with a shrinking countdown.

### Streaks, social moments & meta-events
63. Daily-play streak counter with a flame that grows each day.
64. "Streak freeze" earned item protecting one missed day (ethical loss-aversion).
65. Streak-tier rewards at 3/7/14/30/100 days.
66. Pre-loss warning: "Your 12-day streak ends in 4 hours".
67. Separate per-game streaks with a broken-flame icon to lure return.
68. Streak-recovery grace (return within 36h and the streak thaws).
69. Milestone freeze ("you can't lose a 100-day streak") to kill top-end anxiety.
70. "Comeback bonus" for 7+-day returns, no shaming.
71. Daily first-win-of-the-day bonus clearly labeled (goal-gradient).
72. "Weekend Tournament" — Fri bracket, self-reported scores, Sunday winner card.
73. Shareable daily-result emoji card generated client-side.
74. "Challenge a friend" link encoding today's seed.
75. Couch-coop weekend mode unlocking 2-player variants.
76. Cross-game "event passport" stamped by playing one of each during an event.
77. "Pug Parade" finale animation when a community goal bar fills.
78. Monthly "theme vote" picking next month's modifier.
79. "Catch the runaway pug" site-wide hide-and-seek daily.
80. Season finale "vault preview" showing exactly what's leaving (informed, never tricked).

## 14. Streaks, calendars, comeback & habit mechanics

### Freeze, repair & insurance
1. Streak Freeze tokens auto-protecting one missed day.
2. Earn one freeze per 7 perfect days, capped at 3 stored.
3. Streak Repair: pay Bork Bones next day to un-break a 1-day lapse.
4. Repair cost scales with streak length.
5. Streak Insurance: opt in during a hot streak to pre-buy a save.
6. Weekend Shield auto-covering Sat/Sun for casual players.
7. Vacation Mode: declare 1-14 days off and the streak pauses.
8. Sick Day: a once-a-month no-questions free pass.
9. Freeze gifting via a one-time code (local, no server).
10. "Streak Bank": bank extra sessions today to cover tomorrow.
11. Auto-freeze only triggers after a real 7+-day streak.
12. Recovery minigame discount halving repair cost.
13. Unused freezes expire after 30 days (spend, don't hoard).
14. Freezes shown as melting ice-cube icons on the calendar.
15. One-tap "Use Freeze?" prompt on opening after a miss.

### Milestones & rewards
16. Milestone ladder 3/7/14/30/50/100/200/365 with escalating cosmetics.
17. Each milestone unlocks a streak-only pug accessory.
18. 7-day grants a permanent "weekly warrior" badge.
19. 100-day "Centennial Bone" trophy that patinas over time.
20. Milestone confetti + a grander bork sound at bigger milestones.
21. Variable-ratio surprise rare cosmetic on random milestone days.
22. Streak score-multiplier (1+N/100, capped).
23. "Streak shop" currency spendable on exclusive skins.
24. 365-day unlocks a one-of-a-kind animated profile frame.
25. Tiered titles by streak length (Pup → Immortal).
26. Half-milestone teaser ("5 days to your 30-day crown").
27. Hitting 30 retroactively gilds all 30 calendar cells.
28. Per-game streaks unlock that game's signature cosmetic.
29. Every 30 days refills your freezes to max.
30. Double-or-nothing milestone gamble for a rarer reward.

### Visualization & comeback flows
31. GitHub-style year heatmap of play days.
32. Header flame icon growing taller each consecutive day.
33. Calendar where played days connect into a glowing chain.
34. "Don't break the chain" monthly grid with satisfying X marks.
35. Chain visibly snaps with a sad-pug yelp when it breaks.
36. Per-game mini-heatmaps.
37. Longest-streak ghost line overlaid to chase your own record.
38. Flame color by milestone tier (orange→blue→violet).
39. Year-in-review "wrapped" summary.
40. Heatmap export as a shareable pug poster.
41. Welcome-back screen acknowledging time away warmly, never scolding.
42. Comeback bonus scaled to days gone.
43. Auto-restore one broken streak on return if it was your longest-ever.
44. "Resume your streak" one-tap free repair on the comeback day.
45. "3 new daily challenges waiting" return hook.
46. Returning-user difficulty ease-in so the first game back is winnable.
47. Lapsed-streak memorial: "Your 42-day streak — beat it?".
48. Comeback combo: 3 days in a row after returning → "Phoenix" badge.
49. "Quick win" suggested 60-second game on return.
50. Quarterly "amnesty day" reviving all lapsed streaks free.

### Re-engagement, multi-streaks & anti-anxiety
51. Opt-in local notification at the user's learned usual play time.
52. "Your pug misses you" notification with escalating-cute art.
53. Title-bar/favicon badge showing a pending daily challenge.
54. Streak-at-risk alert at 8pm local if today's play is missing.
55. "Last chance" nudge 2 hours before midnight.
56. Quiet-hours setting so nudges never fire during sleep.
57. Frequency cap: at most one nudge per day.
58. Separate streaks: daily-play, daily-challenge, per-game mastery.
59. Weekly streak (play 5 of 7) for non-daily players.
60. Genre streaks (puzzle streak, arcade streak) tracked independently.
61. Improvement streak: beat your own best N days running.
62. Streak "garden" you water daily, growing a pug-shaped plant (sunk-cost visual).
63. Name and customize your streak's pug avatar (investment phase).
64. Streak "level" that persists even after a break (anti-quit).
65. Configurable day-boundary (end "day" at 3am for night owls).
66. All streak logic in local timezone, DST-safe, never UTC.
67. Grace window: a session within 4h after midnight counts for the prior day.
68. "Streak slack": miss 1 day per rolling 7 without breaking.
69. Never guilt-trip on break; reframe as "ready when you are".
70. Streak-anxiety toggle hiding the counter for stressed users.
71. Soft-break: a broken streak shows "frozen" for 24h before resetting.
72. "It's okay" microcopy + one free restart boost after a break.
73. One-tap share card ("Pug played 50 days straight").
74. Local-profile streak leaderboard for sibling rivalry.
75. "Challenge a friend" code starting a synced 7-day race.
76. Streak-recovery minigames: "catch falling bones", "re-light the flame".
77. Recovery difficulty scales with the saved streak's size.
78. Recovery roulette for a chance at a free repair.

## 15. Currency, economy & cosmetic unlocks

### Kibble (soft currency) earn rules
1. Kibble earned by playing any game — never bought.
2. First-win-of-the-day bonus per distinct game.
3. Payout scales with score band, not raw score (anti-farm).
4. New-personal-best bonus.
5. "Honest effort" floor: even a loss pays 1-5 Kibble.
6. Diminishing returns: 4th+ play of one game pays 25%.
7. Cross-game variety bonus (5 different games/day → "Sampler").
8. Daily-login streak adds +10/day up to a 7-day cap.
9. Combo/skill multipliers convert to Kibble at cash-out.
10. Hidden "good sport" Kibble for finishing a losing run.
11. Achievement payouts as one-time lump sums.
12. Time-played never rewarded directly (no AFK farming).

### Golden Bones (rare currency)
13. Golden Bones are prestige currency, never purchasable.
14. Earned only from hard feats (perfect/no-hit/top band).
15. Weekly cap (5/week) keeps them rare.
16. First all-15-played-ever grants a founding bone.
17. Boss/finale clears drop a guaranteed single bone, once each.
18. Bones glow + deep chime into the wallet on earn.
19. "Bone of the Week" themed-feat challenge.
20. Bones never decay/expire; never spent on Kibble-buyable items.

### Economy health & the Bork Shop
21. Soft daily Kibble cap with a visible "rested" meter.
22. Fixed cosmetic prices forever — no dynamic pricing/FOMO discounts.
23. Catch-up "Welcome Back" Kibble boost scaled to days away.
24. Sink-before-source: always somewhere meaningful to spend.
25. Refund window: dismantle a just-bought cosmetic same session.
26. Honest "≈ N runs to afford" estimate on every price.
27. The "Bork Shop": a cozy kennel-store with a shopkeeper pug.
28. Daily featured cosmetic with a "back in stock later" promise.
29. Tabs: Skins / Hats / Trails / Themes / Sound Packs / Mystery / Owned.
30. Live preview pug wears/animates any hovered item.
31. "Try in-game" demo for one run before buying.
32. Wishlist any item to pin it to a savings-goal tracker.
33. Full honest catalog — never blurred frustration-teasers.

### Cosmetic catalog
34. Pug skins (merle, brindle, fawn, panda, galaxy, glow) — visual only.
35. Breed-flair skins (shiba scarf, corgi-stubby, husky-mask).
36. Hats (crown, party cone, propeller beanie, croissant, astronaut helmet).
37. Face accessories (monocle, heart shades, eyepatch, googly eyes).
38. Trails (bubbles, hearts, kibble crumbs, sparkles, footprints).
39. Themes (CRT, blueprint, candy, midnight neon, autumn, vaporwave).
40. Sound packs (8-bit, kazoo, lo-fi, opera-pug, synthwave, honks).
41. Music packs toggleable independent of SFX.
42. Cursor cosmetics (paw cursor, bone pointer, laser-dot).
43. Animated profile idle emotes (zoomies, tail-wag, snore-bubble).
44. All cosmetics strictly visual/audio — zero gameplay effect.

### Reveals, rarity & savings goals
45. Mystery Boxes drop from gameplay milestones only — never sold.
46. Box contents are a guaranteed cosmetic of a stated rarity (no nothing-drops).
47. Reveal animation: wiggle → anticipation → satisfying pop.
48. You see the full possible pool before opening (fair surprise).
49. Duplicate protection: never gives an owned cosmetic.
50. "Pity reveal" guaranteeing a rarer tier after N opens.
51. Slow-reveal vs instant-open player choice.
52. No box keys / no buy-more-attempts.
53. Themed seasonal boxes during events.
54. Rarity tiers: Common→Uncommon→Rare→Epic→Legendary, visual flair only.
55. Dismantle unwanted cosmetics into "Kibble dust" partial refund.
56. Savings-goal bar fills across sessions toward a pinned item.
57. "You're 90 Kibble from your wishlist hat" nudge after a strong run.
58. Legendaries cost Golden Bones (anchored to prestige).

### Gifting, collection, wallet & generosity
59. Earn-to-gift: spend your Kibble to unlock a gift code for another profile.
60. Gifting is purely generous — no trading/markets/scams.
61. Seasonal cosmetics return next year (anti-FOMO).
62. Profile showcase: pin 3 favorite cosmetics.
63. "Rarest owned" auto-flex badge.
64. Title/flair unlocks ("Bone Collector") from economy milestones.
65. Collection log grid with honest silhouettes for unowned.
66. Completion % per category with a 100% reward.
67. "Set" bonuses for full themed sets.
68. A walkable pixel "museum/trophy room" of earned cosmetics.
69. Export a pixel "trading card" of your dressed-up pug.
70. Per-game signature cosmetic earnable only by mastering it.
71. Hidden/secret cosmetics via easter eggs.
72. Wallet widget with a satisfying tick-up animation.
73. Itemized earn breakdown after each run ("+10 win, +5 PB, +50 first-win").
74. Transaction history log for full trust.
75. No currency leaderboard — flex is taste, not wealth.
76. Offline-first; export/import profile incl. wallet + cosmetics.
77. "No real money, ever" banner in the shop.
78. Starter gift: new profiles pick one free cosmetic.
79. Tutorial + first-shop-visit grant free Kibble/cosmetic.
80. Birthday gift + 1,000-lifetime-Kibble confetti milestone.

## 16. Achievements, medals, badges & collections

### Tiers, rarity & secret medals
1. Bronze/Silver/Gold/Platinum tiers, color-shifting the frame.
2. "Diamond Paw" top-1% tier with a slow shimmer.
3. Global rarity % under each medal ("Only 3% earned this").
4. Foil/holographic variant with parallax shine on tilt/hover.
5. "Cursed" black anti-trophies for spectacular failures.
6. Medal values feed the cross-game level (rarer = more XP).
7. Duplicate medals stack a small "x3" pip.
8. Animated rank-up: bronze melts and recasts into silver.
9. "Prestige" a maxed game to recolor its medals.
10. Seasonal hue tag on medals earned in a given month.
11. Hidden medals show "???" + a cryptic riddle.
12. "Konami Pug" code unlocks a secret medal + golden cursor.
13. Idle "Power Nap" medal after 5 minutes untouched.
14. Click the logo 25× for "Logo Goblin".
15. Pet a hidden off-screen NPC pug for a secret medal.
16. Type "bork" anywhere to reveal a hidden medal.
17. Mute and play a whole round for "Stealth Mode".
18. Visit every game page without playing → "Window Shopper".

### Skill-feat & challenge medals
19. "Untouchable" no-damage clear with a shield motif.
20. Pacifist run medal (finish without attacking).
21. Speedrun medals at bronze/silver/gold time thresholds.
22. "One-Life Legend" (beat a game without dying).
23. Combo medal tiers (10/25/50/100 chain).
24. "Pixel Perfect" frame-perfect input medal.
25. Comeback medal (win one hit from defeat).
26. "Flawless Streak" (win 5 rounds in a session).
27. Inverted/hard-mode clear → a mirrored-badge variant.
28. Min-input medal (clear under a move/click budget).

### Collections — Pug Cards & sticker book
29. "Pug Cards" — one character card per game, 15-card base deck.
30. Card rarities with sparkle borders + flavor text.
31. Sticker book page per game; full page → bonus sticker.
32. Shiny/foil card chase variants (~1% drop).
33. Set bonuses for completing themed sets.
34. Card-pack reveal with a riffle + rarity flash.
35. Drag-and-arrange a personal display shelf.
36. "Missing one" highlight spotlighting the single gap.
37. Holiday sticker series dropping only on holidays.
38. Hidden 16th "secret card" after the base 15.
39. Trade-in duplicate cards at a "Pug Vending Machine" for tokens.
40. Craft a chosen card by spending N duplicates (pity).
41. Daily free pug-card pack pull.
42. Token shop for cursors/frames/themes (cosmetic only).

### Meta, cross-game & date-gated
43. Per-game completion ring; site-wide completion % headline.
44. "100% Club" platinum master medal per game.
45. "Borkade Legend" capstone for 100%-ing every game.
46. "Sampler" (first medal in all 15); "Halfway Hound" at 50%.
47. Achievement-for-achievements (10/50/100 total medals).
48. "Secret Hunter" for finding 5 hidden medals no-hint.
49. Cross-game "Arcade Tour" (score in every game in a day).
50. "Pentathlon" (medal in 5 games in one session).
51. Genre-spanning medal (one runner, one shooter, one puzzle).
52. "Night Owl" (play 00:00-01:00 local); "Early Bird" before 7am.
53. Birthday medal on your set pug-birthday; anniversary medal on launch date.
54. Weekend Warrior (both Sat+Sun); leap-day "Rare Day" medal.
55. Holiday-exclusive medals (Halloween bat-pug) live-gated by date.

### Showcase, nudges & anti-busywork
56. Pin 3 "showcase" medals to the top of your profile.
57. Shareable profile-card PNG of rarest medals + completion %.
58. Rotatable trophy cabinet/shelf room.
59. Profile "rarity score" summing owned-medal rarity into one brag number.
60. Equippable titles ("The Untouchable") under your name.
61. Nameplate frames/backgrounds from milestone medals.
62. "Almost there" amber-pulse state within 1 step of unlocking.
63. Progress sub-bars on locked medals ("47/50 combos").
64. Goal-gradient acceleration: the bar speeds up near 100%.
65. Toast + coin-clink + confetti on every unlock.
66. Full-screen slow-mo spotlight reveal for rare medals.
67. "Next up" panel surfacing the 3 closest-to-complete.
68. "You were SO close" near-miss toast.
69. Cap grind medals — every medal demands a distinct action.
70. One-line "why this is fun" design note per medal (audit busywork).
71. No two medals reward the same behavior twice (uniqueness lint).
72. Collapse bronze/silver/gold of one feat into one expandable medal.
73. "Optional" tag on grindy collectibles so 100% isn't gated by them.
74. Front-load easy early medals (goal-gradient onboarding).
75. Skill medals always outnumber grind medals (authoring ratio).
76. "Borkdex" living encyclopedia filling as you meet each character.
77. Hidden "Rainbow Hand" (one card of every rarity).
78. "Generous Pug" for gifting a duplicate card.
79. "Lucky Number" for a palindrome final score.
80. "The Back Room" secret game unlocked at 100% total completion.

## 17. Cross-game progression, levels, prestige & mastery

### XP, levels, titles
1. Baseline "Bork XP" per session, capped to kill idle-farming.
2. Large first-clear bonus the first time you finish any game.
3. Personal-best XP spike (beat your own prior high score).
4. Soft-diminishing curve: repeated same-game plays today pay less.
5. "Fresh-game" 3x multiplier for a game untouched 7+ days.
6. Chunk XP for in-run milestones so partial runs reward.
7. Comeback XP front-loaded on the first run back.
8. Clean-run bonus (no death/restart).
9. Near-flat level curve 1-10 (fast dopamine), then gentle steepen.
10. Daily XP soft-cap with a "rested XP" bar refilling overnight.
11. Discovery XP for first-triggering a rare mechanic.
12. One account-wide "Bork Level" shown as a bone chip everywhere.
13. Punny rank title every 5 levels (Pup, Snacker, Zoomer, Floof Lord).
14. Reveal the next rank at 80% (goal-gradient teaser).
15. "You are level X — top Y% of all pugs" relative line.
16. High ranks unlock a colored name/border tint.
17. Full-screen "level up!" stamp with confetti + new title.
18. Hidden "founder" tier for early accounts.

### Per-game mastery & breadth
19. Each game has a 5-tier mastery track (Bronze→Diamond Bone).
20. Tiers advance on game-specific objectives, not playtime.
21. Mastery badge next to each game tile.
22. Mastery tier multiplies that game's XP payout.
23. Each tier unlocks one cosmetic for that game.
24. Per-game "mastery %" from objectives done.
25. Diamond tier requires a unique "legend run" challenge.
26. Mastery objectives visible up-front as a checklist.
27. "Mastery streak" for advancing tiers in multiple games in a week.
28. Account "Completion %" aggregating mastery + titles + Pup Pass.
29. Weekly "Featured Game" pays double XP to pull toward neglected titles.
30. "Sampler" (play all 15) and "Connoisseur" (clear all 15) badges.
31. A "Pawport" stamp book; each game gives a unique first-clear stamp.
32. "Variety bonus" escalating multiplier for 3+ games per session.
33. Daily "Tour" quest naming 3 games for a chunky shared reward.
34. "Neglected pup" nudge with a catch-up XP bounty.
35. Cross-game combo cosmetics unlocked by mastering several games.
36. "Generalist vs Specialist" dual meters, each with rewards.
37. "Grand slam" for Gold mastery in every game.

### Pup Pass, prestige & profile
38. A fully free ~6-week "Pup Pass" of ~30 cosmetic tiers, no paid track ever.
39. Pass fills from the same XP you already earn.
40. Seasonal themes (Beach/Spooky/Winter Pups).
41. Exclusively cosmetic rewards (skins, hats, trails, barks, frames).
42. Early tiers unlock fast to hook; later tiers stretch.
43. Bonus loop tiers past the finish for completionists.
44. Past-season cosmetics retire to a "vault" badge (a flex of when you played).
45. Weekly challenge tiers nudging breadth.
46. Season countdown with a gentle "on track / behind" hint.
47. Season-end commemorative dated stamp regardless of completion.
48. One "free choice" tier per season to pick a missed cosmetic.
49. Max-level "Prestige" resets visible level to 1 with a permanent pip.
50. Each prestige adds a small capped permanent XP boost (opt-in).
51. Prestige is cosmetic-prestige only; never gates content.
52. Prestige swaps the bone chip's material (wood→bronze→crystal).
53. "Paw-fect" prestige requires account prestige + Diamond in all 15.
54. Toggle whether to display prestige (humble flexing).
55. A single "Pug Profile" hub: avatar, level, titles, completion %, mastery grid, Pawport.
56. Customizable pug avatar from earned parts = cross-site identity.
57. 15-cell mastery grid colored by tier (dedication map).
58. Radial "completion ring" filling toward 100.
59. Scrolling "career timeline" logging milestones with dates.
60. Shareable profile-card PNG (level, titles, mastery grid).
61. "Next unlock in ~N runs" live estimate.

### Skill rating, milestones & anti-grind
62. Per-game "Skill Rating" (0-9999) from your best runs (skill vs grind).
63. "Overall Skill" = average of top-N game ratings (rewards all-rounders).
64. Mastery boards ranked by mastery %, not just high score.
65. Skill ratings decay slowly if unplayed (gentle return nudge).
66. "Personal rival" pins one nearby-skill target per game.
67. Per-game percentile ("better than 87% of pugs").
68. Per-game skill-tier emblem (Pup/Adept/Pro/Ace/Legend).
69. Confetti + unique bark on every rank-up/tier-up/prestige.
70. Round-number level milestones drop exclusive cosmetics.
71. 100% account completion → a golden pug skin + "Top Dog" title.
72. Surprise "lucky bone" drops weighted up by variety played.
73. Hard daily XP soft-cap with a "play for fun now!" message.
74. No streak punishment; streaks only ever add bonuses.
75. All progression vs-yourself by default; competition opt-in.
76. Every reward cosmetic — never pay-to-win or grind-to-win.
77. "Rested bonus" structurally rewards stepping away (anti-burnout).
78. A "Pug Den" home base that visibly upgrades with completion (the investment moat).
79. Export/import profile as a code; versioned save schema with migration.
80. A single "lifetime borks" counter that only ever goes up.

## 18. Leaderboards (local & shareable) & competition

### Personal-best, ghosts & local tables
1. Store every run's score + timestamp, not just the max.
2. "New personal best!" burst the instant you beat your max.
3. Sparkline history of your last 30 scores.
4. Separate PBs per difficulty tier.
5. "You're up 12% vs your 7-day average" trend badge.
6. Session-best counter separate from all-time.
7. Top-5 personal runs as a self-leaderboard.
8. "Consistency" stat (std-dev of last 20 scores).
9. Lifetime-total odometer that only ticks up.
10. "Ghost of yesterday" you race against today.
11. Store input timelines (seed + keystrokes) to replay cheaply.
12. Translucent ghost sprite following your previous-best path.
13. Live "+/- vs ghost" delta updating each second.
14. Pick which past run becomes the ghost.
15. "Phantom pug" of your all-time best on every attempt.
16. Local top-10 with 3-letter arcade initials per game.
17. Persistent default handle across all tables.
18. Bronze/silver/gold/platinum medals at par-score thresholds.
19. "42 points to silver" on the results screen.
20. Dev-tuned "par" target, par-golf style.
21. "Dethroned!" animation when a new score bumps an old one.
22. Cross-game "hall of fame" of each game's #1 local run.

### Daily seeds & shareable codes
23. Deterministic daily seed from the UTC date (same board for all).
24. "Daily Challenge" tile with a rollover countdown.
25. One scoring attempt + unlimited practice on that seed.
26. Personal calendar heatmap of completed dailies.
27. Daily-completion streak with a flame.
28. Weekly "marathon" seed stringing 7 dailies into one score.
29. "Yesterday's daily" replay for latecomers.
30. Daily seed fixes item/spawn RNG so comparisons are fair.
31. Encode {game,seed,score,date,handle} into a base64 share code.
32. HMAC-style checksum to detect edited codes.
33. Varint packing before base64 to keep codes tweetable.
34. Version byte so old codes stay parseable.
35. One-tap "Copy challenge code" on game-over.
36. QR of the code for in-person phone-to-phone sharing.
37. Human-readable summary beside the opaque code for trust.
38. "This code looks tampered" friendly rejection.
39. Code in the URL hash so a link == a score.

### Importing, rivals, tournaments
40. Paste a friend's code to add their run to your local board.
41. Persistent per-game "friends board" from imported codes.
42. Highlight where your best slots in ("you're 2nd of 6").
43. De-dupe imports (newer code replaces old).
44. "Beat this code" loads the friend's exact seed.
45. "You just overtook Mia!" toast.
46. Async duel: both play the same seed-locked code, compare.
47. Auto-pick a "rival" just above you; surface a "nemesis".
48. Head-to-head records on the start screen ("you 4 — Sam 6").
49. "Revenge match" re-challenging whoever last beat you.
50. Paste 4/8/16 codes to auto-seed a local single-elim bracket.
51. Render the bracket as a shareable image/text.
52. Round-robin "league table" mode across many codes.
53. Per-round fresh daily seed for fairness.
54. Export the final bracket as a "champion" code.

### Opt-in cloud, resets & competition juice
55. All cloud features strictly opt-in behind a clear toggle.
56. Back a global board with a player-authorized GitHub Gist.
57. Cloudflare Workers KV as a zero-cost global store option.
58. Submit only the signed score code, never personal data.
59. Validate server-side by re-simulating the input timeline.
60. Cache the remote top-100 locally for offline render.
61. Private "room" boards via a shared room key.
62. Rate-limit submissions per handle.
63. "Delete my cloud scores" purge.
64. Weekly-reset boards + an all-time archive.
65. Baked-in static distribution ("you're in the top 18%").
66. Precise speedrun timer (ms) with a best-clear board.
67. Category splits (any%, 100%, no-damage) each with its board.
68. A "season" concept with its own board + theme + recap card.
69. Encode a whole mini-tournament into a screenshot-friendly card.
70. "Achievements vs friends" matrix from imported codes.
71. "Challenge of the week" community seed; results via codes.
72. Pass-and-play alternating-turns duel on one device.
73. "Rivalry timeline" charting your vs a friend's PBs over time.
74. "Prove it" mode counting a PB only if its replay verifies.
75. Cosmetic for building a 10-friend local board.
76. Auto "trash talk" preset line on outgoing duel codes.
77. "Closest rival" widget on the home page across all games.
78. Star a friend so their ghost auto-loads as default.
79. "Personal Elo" adjusting from local duel outcomes (no server).
80. Export a lifetime "career stats" code summarizing every game.

## 19. Social sharing, share-cards & virality

### Canvas PNG result cards
1. A shared makeShareCard(canvas,{game,score,emoji,palette}) every game calls at game-over.
2. Render at fixed 1200×630 (one canvas = OG image + download).
3. Keep text/logo in the center 80% safe-zone against feed crops.
4. 48px+ pixel font headline stat for thumbnail downscaling.
5. Per-game signature card palette from in-game colors.
6. Pug mascot sprite in a corner for instant brand recognition.
7. Bake borkade.com URL + tiny QR in the bottom strip.
8. Per-game stat line ("Survived 47s / Reached Lv6").
9. Pixel rank badge (Bronze→Diamond) sized by percentile.
10. One-tap "Download card" via canvas.toBlob.
11. Auto-name downloads borkade-<game>-<score>.png.
12. Gold "new personal best" ribbon variant.
13. Date + daily-seed number on daily-mode cards.

### Emoji grids & story/animated cards
14. Wordle-style spoiler-free emoji grid per game encoding the run.
15. Floor-Lava grid: 🟩 per survived tier, 🟥 for the death moment.
16. Maze grid (🐾 steps, 🟦 walls, 💎 loot), spoiler-free.
17. Unicode-only grids so they paste identically everywhere.
18. "🔒 spoiler-free" tag so sharers trust it.
19. Standard header "BORKADE • <Game> • #<dailyNo>".
20. Cap grids at 5 lines for one mobile message bubble.
21. 1080×1920 vertical story card variant.
22. Score in the top third of story cards (above UI chrome).
23. Animated 3-frame GIF card (pug sad→hype reaction).
24. Short WebM replay-glance clip (last 3s) for video platforms.
25. Transparent-bg "story sticker" PNG (score badge only).
26. 1:1 square variant for feed posts.
27. Pre-render all 3 aspect ratios from one source canvas.

### OG meta & share intents
28. Per-game static og:image (1200×630).
29. twitter:card=summary_large_image + twitter:site.
30. Identity-driven og:title/description ("Can you out-waddle the guards?").
31. Dynamic OG via data-URI canvas for daily pages.
32. og:image:width/height + og:image:alt.
33. Cache-busting ?v= when card templates change.
34. Validate with FB Sharing Debugger + Twitter Card Validator on deploy.
35. Host real static PNGs (not just data-URI) for JS-blind scrapers.
36. Native Web Share API with files to share the PNG directly.
37. Feature-detect canShare({files}); fall back to download+copy.
38. Prefilled X/WhatsApp/Telegram/Reddit/Discord share strings.
39. "Copy link" + "Copy card to clipboard" via ClipboardItem.
40. Reorder share buttons by device (WhatsApp first on mobile).

### Memes, referrals & cycle-time
41. Pug meme generator: top/bottom caption over the death frame.
42. 6 preset humor captions ("I had ONE job", "Pug down 💀").
43. Custom caption onto the card before sharing (identity trigger).
44. "Ratio card" comparing your score vs a pasted friend's.
45. "Blame the pug" humorous loss-attribution card.
46. "Rage-quit meter" graphic scaling with how fast you died.
47. Flex vs cope card styles auto-picked by whether you beat your PB.
48. Per-player referral links (?ref=id) in every shared card URL.
49. Both referrer + new player get a cosmetic skin on referral play.
50. Track referrals client-side; unlock skins at thresholds.
51. "Challenge a friend" loads the exact same daily seed.
52. "X friends beat your score" return nudge.
53. Tiered referral rewards (1→hat, 3→cape, 5→golden pug).
54. Tighten daily reset to a fixed UTC time + countdown.
55. Surface share buttons at the game-over peak-emotion moment.
56. Auto-open share on a new personal best.
57. Pre-generate the card during the death animation (instant share).
58. Streak counter on cards to drive daily return + reshare.
59. Corner watermark + invisible PNG-metadata attribution.
60. Post-share "Nice! Play again?" re-engage loop.

### Cross-game loops & hardening
61. Site-wide "Pug Passport" card summarizing bests across all 15 games.
62. Weekly "BORKADE Wrapped" recap card.
63. "Top Pug of the Day" card from the daily leaderboard.
64. "Rarest achievement" exclusivity card.
65. Card footer rotates "Next: try <random game>".
66. "Collection complete" completionist flex card.
67. "Compare with the average pug" percentile line.
68. Preload the pixel font before drawing (no serif fallback).
69. image-rendering: pixelated on all card scaling.
70. Draw on OffscreenCanvas to avoid game-over jank.
71. Degrade to text emoji-grid if canvas/blob unavailable.
72. 1px border so white cards don't vanish on light feeds.
73. Localize stat labels but keep emoji grids universal.
74. Static card for prefers-reduced-motion (no GIF).
75. Keep PNGs <1MB so Web Share/clipboard never fail.
76. A self-test page rendering all 15 cards to catch regressions.
77. Sanitize user captions before drawing.
78. Version the card template in filename + metadata.
79. Embed the run's seed in the card so a screenshot is a playable link.
80. A shared global #BORKADE hashtag landing page as social proof.

## 20. Replays, ghosts & clip export

### Deterministic foundation
1. Replace Math.random() with a seedable PRNG (mulberry32) per run.
2. Stamp every run with a 32-bit seed shown as a 6-char code at game-over.
3. Record inputs as a compact delta blob ([frameDelta, keyMask]).
4. Fixed timestep (60Hz accumulator) so replays never desync.
5. Gate ALL gameplay RNG through the seeded stream.
6. Cosmetic-only RNG on a separate unseeded stream (tiny blobs).
7. Version the format with a 1-byte header (graceful failure).
8. verifyReplay() re-simulates headless, asserts score matches.
9. Store engine + game version in the header.
10. Decouple render from sim so replays verify at 10x.
11. Seed = hash(dailySeed + name) so dailies are identical for all.

### Recording, encoding & viewer
12. RLE-compress held-key stretches (huge for runners).
13. base64url the blob into the URL hash (zero backend).
14. Truncate >2KB blobs to a short ID + optional paste fallback.
15. Sparse keyframe of full state every 600 frames for seeking.
16. Quantize pointer/touch to 8-bit coords.
17. Tag blobs with game/score/duration/date/skin metadata.
18. Strip trailing idle frames (end on the kill).
19. "Copy replay code" bundling seed+blob+score.
20. Checksum to detect tampered fake-high-score codes.
21. Open any code at /replay#<code> in a read-only viewer.
22. Scrubber with draggable playhead + frame readout.
23. Speed controls 0.25x-4x + frame-step.
24. Pause-and-inspect overlay (RNG state, score, inputs).
25. Jump-to-event markers (deaths, power-ups, combos).
26. Loop a selected in/out range.
27. Free-cam/zoom in the viewer.
28. Input-overlay HUD lighting up the recorded button presses.
29. "Watch from here" deep-link pre-seeked to a timestamp.

### Ghosts & ghost races
30. Translucent ghost of your previous-best overlaid live.
31. Race a friend's shared ghost in real time.
32. "Beat the dev" pre-recorded staff ghost per game.
33. Ghost-of-the-day: the daily #1's ghost loaded for everyone.
34. Stack top-5 ghosts as faint trails (optimal line).
35. Green-ahead/red-behind ghost diff coloring + split timer.
36. Ghost checkpoints ping when you pass the ghost's mark.
37. "Phantom collisions" toggle for asymmetric versus.
38. Per-game PB ghost persisted in localStorage.
39. Export your PB ghost as a "beat my ghost?" challenge link.

### Clip export & auto-clipping
40. MediaRecorder (WebM/VP9) one-click 10-second clip download.
41. gif.js (worker) fallback for animated GIF.
42. Render export off the deterministic replay (smooth even if play lagged).
43. Clip-length picker (3s/6s/10s/full).
44. Aspect presets 1:1 / 9:16 / 16:9 with letterbox padding.
45. Frame-rate selector (15/24/30/60).
46. Nearest-neighbor 2x/3x upscale so pixel-art GIFs stay crisp.
47. Encoding progress bar.
48. ffmpeg.wasm MP4 path for platforms rejecting WebM.
49. Capture audio into WebM clips.
50. "Export selection" uses the scrubber in/out range.
51. Death-cam: auto-rewind 3s and slow-mo the final moment.
52. "Clutch moment" detector auto-clips last-second saves.
53. Combo-peak detector auto-clips the highest-multiplier stretch.
54. New-PB auto-clip with a "Share your record?" prompt.
55. Highlight reel stitching the top 3 auto-detected moments.
56. Auto-zoom the death-cam on what killed you.
57. "First time reaching level N" milestone auto-clip.
58. Rage-quit clip (last 5s before manual restart) for comedy.
59. 15s "run recap" reel (start, highlight, death, cross-faded).
60. Tag moments live so post-run export is instant.

### Comparison, stills & the viral loop
61. Split-screen replay diff of two codes, synced clock.
62. Overlay-diff: both runs same view, one tinted.
63. Auto-align comparison by a shared event, not frame 0.
64. "World record vs you" preset.
65. Divergence highlighter flashing where two runs first differ.
66. Stat-diff bars (APM, idle, deaths, accuracy) between replays.
67. Auto contact sheet of 9 evenly-spaced stills.
68. "Best frame" picker from auto-clip moments.
69. Watermark exports "BORKADE • <game> • <score>".
70. Encode the replay code into the watermark/QR (screenshot = link).
71. Comic-strip export (4 key stills + caption).
72. PNG sequence (zip) for external editing.
73. Daily auto-curated "Replay of the Day" from the top verified daily score.
74. Public gallery wall of the day's top 10 replays (tap to watch).
75. One-tap "Share this run" → URL + GIF + caption.
76. OG video/GIF preview so replay links autoplay in feeds.
77. "Remix this run": take over control from any replay frame.
78. Reaction stickers dropped on a replay timeline (heatmap).
79. "Beat this" CTA deep-links into a same-seed attempt.
80. QR on game-over to grab the desktop run's replay on a phone.

## 21. Lightweight & local multiplayer

### Hotseat & turn-taking
1. Universal "pass-the-pug" hotseat shell with a hand-off countdown.
2. Best-of-N ladder with a tug-of-war score-diff bar.
3. Hotseat "ghost gauntlet": P2 races P1's just-finished ghost.
4. Escalating turn timer (each turn 5% less time).
5. "Inherited seed" so all hotseat players get identical RNG.
6. Per-player handicap slider stored locally.
7. Press-your-luck "stop-or-go": bank and pass or risk it all.
8. Round-robin scorecard across all 15 games for a "decathlon" night.
9. Alternating-input relay: swap control every 10s without pausing.
10. "Loser picks next game" auto-spin wheel.
11. Sudden-death tiebreaker mini-round on a tie.
12. Hotseat draft: alternately ban one power-up pre-run.

### Same-device split & shared-keyboard
13. Shared-keyboard versus (WASD vs arrows).
14. Vertical split-screen race for runner games.
15. Horizontal split tuned for a phone laid flat between players.
16. Co-op "two-controls-one-pug" (one steers, one fires).
17. Mirror-mode versus: identical mirrored level, race to center.
18. Shared-screen fog co-op where each lights their own radius.
19. Split-keyboard claw game (one rotates, one extends).
20. Same-screen king-of-the-hill on a moving platform.
21. Tug-of-war button-masher with a live rope position.
22. Co-op survival: each defends a turret on opposite edges.
23. Hot-potato bomb pug passed across the split.
24. Asymmetric: one plays the pug (arrows), one the guard (mouse).

### Party mode & WebRTC 1v1
25. "Party deck" shuffling 5 micro-rounds into a hand-around session.
26. Per-round role cards shown only to the active player.
27. Secret-objective whisper screen each player taps privately.
28. Optional "rule stack" adding one silly constraint each round.
29. Random "who goes next" spinner.
30. "Phone-as-buzzer" fastest-tap round.
31. Reaction-relay: pass the phone the instant a color flashes.
32. Auto-rotating MC voice/text calling the next player by name.
33. "Curse cards" to sabotage the next player's turn.
34. Team party mode with a shared team board.
35. WebRTC host generates a shareable URL with the offer SDP in the hash.
36. Manual copy-paste "answer code" fallback (pure serverless handshake).
37. Trickle-ICE over free public STUN with LAN degrade.
38. DataChannel-only netcode carrying tiny fixed-size input packets.
39. Lockstep deterministic sim for puzzle/turn games (inputs only on the wire).
40. Rollback netcode-lite for the 1v1 action game.
41. Authoritative-host streaming compact state diffs.
42. Heartbeat ping/pong with an on-screen RTT badge.
43. Auto-pause "reconnecting…" with a resumable session token.
44. Adaptive tick rate (30Hz→15Hz) when RTT spikes.
45. Rematch link reusing the room id.

### Signaling, QR & spectating/async
46. Signaling via a free gist mailbox polled by a short code.
47. Cloudflare Worker / Deno Deploy tiny relay, stateless after pairing.
48. PeerJS public cloud default with a self-host flag.
49. BroadcastChannel/localStorage signaling for two tabs/windows.
50. LZ-string-compressed SDP to fit a single QR/chat message.
51. Host shows a QR; joiner scans to land in the lobby.
52. "Handoff QR": transfer your current run/seed/state to another device.
53. Save-state export QR (progress hops phone-to-phone, no account).
54. Daily-challenge QR poster (scan to load today's seed).
55. Animated/cycling QR to pack a larger SDP payload.
56. Local couch bracket generator (single/double elim, round-robin).
57. King-of-the-hill seat: winner stays, challengers queue.
58. Win-streak crown overlay that sparkles the longer the champ holds.
59. Spectator mode over WebRTC (read-only watchers).
60. Spectator emote/reaction stream over the players' screen.
61. "Casting" layout hiding secret info for stream-friendly spectating.
62. Async ghost duel: finish a run, share a code, friend races your ghost.
63. Challenge-card codes encoding seed + ruleset for reproducible matches.
64. Async co-op daily: two friends' separate runs summed into a team score.
65. Turn-by-turn correspondence mode for puzzle games (play a move, send a code).
66. Weekly async ladder: paste your best code, climb without being online.
67. Async "relay race" handing a seed-code between legs.
68. Async puzzle "swap": build a level, trade codes to solve.

### Netcode tiers & couch UX
69. Tag each game a netcode tier (deterministic/lockstep/rollback/host-auth).
70. Frame-fixed timestep across all games so determinism just works.
71. Seeded PRNG everywhere as the foundation.
72. Input-only delta-compressed wire format.
73. Clock-sync handshake so peers agree on tick zero.
74. Desync detector hashing state every N frames; fall back to host-auth.
75. Graceful "your turn is paused" when a backgrounded tab throttles.
76. Big-touch, thumb-reachable party UI with active-player highlighting.
77. Color-blind-safe player colors + icons so split sides are clear.
78. One-tap "rematch / next / quit" end screen for fast hand-around.
79. Endless-runner → split-screen race + async ghost duel.
80. Pug Heist → asymmetric same-device (pug vs guard) + WebRTC 1v1.

## 22. Community, UGC, ratings & Discord

### Discord, roles & bots
1. Persistent "Join the Discord" paw button in the footer.
2. Embed a live Discord widget on /about showing online count (social proof).
3. Bot auto-posts an embed when a new game ships (from a changelog feed).
4. "Day-One Pug" role for pre-launch joiners.
5. Reaction-roles for a "favourite game" role per title.
6. /highscore slash command to post a score screenshot to a review channel.
7. Auto-thread every new game-channel post.
8. Mirror GitHub releases into #changelog via webhook.
9. Gate #beta-pugs behind a verified-bug-report role.
10. Discord stage events for live dev-streams.
11. /randomgame DMs a member a random game link.
12. Discord XP bot ranking Pup → Top Dog from chatting.
13. Pin a single "rules + how to share scores" message.
14. AutoMod keyword filters for self-moderation.
15. A #self-promo-pugs containment channel.

### Seed-sharing & challenges
16. "Challenge Seed" field per game for reproducible runs.
17. Shareable ?seed=PUG123 URL loading the exact same run.
18. "Seed of the Week" pinned, top 3 each Friday.
19. "Copy Challenge Link" bundling seed + your score.
20. Name a seed when sharing ("Greg's Nightmare Maze").
21. "Beat my run" CTA pre-filling a Discord message.
22. Daily date-based seed everyone worldwide shares.
23. #seed-vault community archive of best seeds.
24. Full input replay in a compressed URL hash (ghost sharing).
25. In-game "Ghost of the Day" racing the top daily-seed replay.

### Local ratings & favorites
26. Local 5-star rating widget per game.
27. Seed a plausible baseline aggregate (4.3★, 1.2k votes) so it's never dead.
28. Blend baseline + local vote so your rating visibly nudges the average.
29. Half-star precision aggregate (not suspiciously round).
30. "Rate to reveal community average" gate.
31. Tiny star-distribution histogram per game.
32. "Was this fun? 👍/👎" one-tap micro-rating.
33. "You rated this 4★" badge on cards.
34. Optional local-only one-line "your note" review.
35. "Top Rated This Month" shelf from blended scores.
36. Heart/favourite toggle per card (localStorage).
37. /favourites filtered view.
38. Named local playlists ("Speedrun Night", "Chill Pugs").
39. "Play All" auto-advancing through a playlist.
40. Shareable playlist code (compressed URL) friends import.
41. "Recently played" auto-collection with quick-resume tiles.
42. "Continue where you left off" cards.
43. "Pug Pack" themed mini-collection with custom cover art.
44. Personal "Your Borkade in numbers" stats page.
45. "Completionist" checklist of beaten games.

### Play counts, hall of fame & galleries
46. Track play counts in serverless KV ("🐾 played 12,431 times").
47. Debounced once-per-session increment.
48. "🔥 X playing now" pseudo-live count from recent KV heartbeats.
49. "Most played this week" shelf from KV deltas.
50. "New!" badges auto-expiring 14 days after first-seen.
51. "You're the 10,000th player!" confetti milestone.
52. "Trending" rail ranked by 7-day play-count velocity.
53. hall-of-fame.json accepting scores via a GitHub Issue template.
54. One-click "Submit my score" opening a pre-filled issue.
55. GitHub Action validating issue scores against a ceiling.
56. Auto-built static /leaderboard at deploy time.
57. "Verified" tick for scores with a matching replay hash.
58. Monthly "Champions" snapshot/archive.
59. "Retire undefeated" badge (top a board a full month).
60. "First clear" claim per game immortalizing the first winner.
61. Fan art via PR to /gallery, auto-rendered masonry page.
62. Meme-template generator from pug sprites + "post to Discord".
63. Monthly meme contest decided by Discord reactions.
64. In-game "screenshot mode" hiding UI + a small watermark.
65. Downloadable pug sticker pack (PNG/Telegram).
66. "Pug of the Month" community-drawn spotlight.
67. CC-BY sprite/asset kit for legal fan remixes.

### Events, codes gallery & moderation-light
68. "Borkade Game Jam" — fans fork + submit a microgame via PR.
69. /jam page listing entries from labelled PRs.
70. "Speedrun Saturday" recurring Discord event.
71. Spotlight one community member per release.
72. "Name the next game" poll crediting the winner.
73. "Made by the community" badge on jam-origin games.
74. Seasonal themed events (Spooky Pug October) with cosmetics.
75. "Pug Council" of active members getting early builds + credits.
76. Level/run "share code" encoding params into a short string.
77. /codes gallery of community challenge codes via PR, difficulty-tagged.
78. "Load Code" input on each start screen.
79. Emoji-only on-site reactions (😂🔥😍😱) via KV to minimize moderation.
80. Keep free-text discussion on Discord; "Report" opens a pre-filled issue.

## 23. Adaptive music & dynamic mixing

### MusicDirector core
1. A shared MusicDirector singleton owning the AudioContext + routing.
2. Look-ahead scheduler (25ms tick, 100ms horizon) for jitter-free timing.
3. Global musical clock exposing currentBeat/Bar/bpm games subscribe to.
4. Declarative API: play(themeId,{intensity,key}); setIntensity(0..1).
5. Themes as data (stems, layers, tempo, key, sections) loaded per game.
6. Schedule off audioCtx.currentTime, never setTimeout/rAF.
7. Pool oscillator/gain nodes via a voice allocator.
8. reset()/dispose() to tear down stems cleanly on game exit.
9. Games push playerState snapshots once per frame via an rAF bridge.
10. A --debug-music overlay drawing beat grid, layers, intensity.

### Vertical remixing (layered stems)
11. Author themes as 4-6 coherent stems (bass/drums/arp/pad/lead/fx) in one key/tempo.
12. Crossfade stem gains by intensity (calm = bass+pad; frantic = all).
13. Gate the lead stem to enter only above an intensity threshold.
14. Per-stem enter/exit envelopes swelling over a bar (no pop).
15. Inverse-HP "low-pass tension" stem filtering everything as HP drops.
16. Percussion-density layer tracking player speed/score-rate.
17. Quantize stem entrances/exits to the next bar boundary.
18. Sidechain-duck the pad under the lead automatically.
19. Shared "stem bank" of chiptune voices reused across games.
20. "Minimal mode" collapsing to one stem for low-end devices.

### Horizontal re-sequencing & procedural melody
21. Themes as ordered sections re-sequenced at runtime.
22. Markov transition table picking the next 4-bar phrase by intensity.
23. Section changes only at safe phrase boundaries.
24. Procedural lead melody from a scale-degree Markov chain.
25. Constrain notes to the active scale (never wrong notes).
26. Rhythmic templates the melody generator fills.
27. Call-and-response phrasing (a call answered by a transposed response).
28. Contour rises with intensity (higher register, more leaps).
29. Cache recent phrases so loop A feels familiar, not random.
30. Seed RNG per-run so procedural music is reproducible.

### Tempo/key scaling & beat-sync
31. Scale BPM linearly with difficulty (110→150 across a run).
32. Ramp tempo over several bars (accelerando, not snap).
33. +2-4 BPM per combo milestone, decaying when combo drops.
34. Shift key up at major progression beats for lift.
35. Major→minor (or Dorian/Phrygian) on tension/danger.
36. Modulate to relative minor for game-over; back to major for victory.
37. Lerp currentBpm→targetBpm each tick for glitch-free glides.
38. Clamp tempo/pitch ranges per game.
39. setMusicalContext({key,scale,bpm}) for hard mood cuts at scenes.
40. onBeat/onBar/onPhrase/onDownbeat event bus for visual choreography.
41. Quantize player SFX to the nearest sub-beat (optional rhythm mode).
42. Pulse UI/background/logo in time with the kick.
43. Reward on-beat actions with a brighter SFX + small combo bonus.
44. Spawn enemies/hazards on phrase boundaries (choreographed).
45. Boss telegraphs land on the downbeat so players learn the rhythm.

### Mix states, theming & master bus
46. Named mix states (Explore/Combat/LowHealth/Boss/Victory/Defeat/Menu).
47. Crossfade between states smoothly, never abrupt.
48. "Tension mode" when an enemy aims (dissonant pad + muted drums).
49. "Panic" sub-mix on low timer/HP (faster hats, rising pitch).
50. Sparse "stealth" mix for Pug-Heist sneaking.
51. Swell a triumphant lead on crossing a combo threshold.
52. Fade the bed to 20% during dialogue/pause without stopping it.
53. Blend states by a continuous "danger" scalar.
54. One short BORKADE leitmotif woven into every theme + the hub.
55. Distinct per-game chiptune themes sharing tempo/key conventions.
56. Victory/game-over variants derived from each theme (same motif, new mood).
57. Boss sub-themes reharmonizing the main theme darker/faster.
58. Distinct "new-record" jingle vs normal victory.
59. Hub medley previewing each game's motif on hover.
60. Separate Music + SFX buses; master limiter to prevent clipping.
61. Sidechain-duck Music under important SFX for clarity.
62. User sliders Master/Music/SFX persisted to localStorage.
63. Master high-pass removing sub-rumble from many chiptune voices.

### Performance & policy
64. Pool/reuse a capped voice count; steal the oldest when over budget.
65. Disconnect finished nodes promptly to avoid leaks.
66. Lazy-create AudioContext on first user gesture (autoplay policy).
67. "Tap to enable sound" prompt; resume a suspended context.
68. Suspend on visibilitychange/blur; restore on focus.
69. Pause the scheduler when the tab is hidden.
70. Cap simultaneous voices; thin layers on low-end/mobile.
71. Pre-warm the synth (silent note) to avoid first-note latency.
72. Resync the clock to currentTime if scheduler ticks drift.
73. Throttle procedural-gen work to scheduler boundaries.
74. Reuse one shared AudioContext for miniSfx + MusicDirector.
75. "Lite" single-stem no-procedural fallback for weak devices.
76. preview(themeId) so the hub auditions each theme on hover.
77. A JSON theme-editor page to tweak stems/sections live.
78. Pure testable functions for scale math/Markov/gain curves.
79. Crossfade into "victory" mix the instant a win fires.
80. Carry the musical clock across game transitions (no beat stutter).

## 24. SFX, bork-voice & haptics

### Procedural variety & combo
1. ±n-semitone pitch jitter on every playSound (no identical repeats).
2. Random playbackRate 0.94-1.06 to break machine-gun repetition.
3. Round-robin a 4-variant pool per event (A→B→C→D).
4. Suppress immediate-repeat of the last round-robin variant.
5. Velocity-scale gain to impact strength (tap quiet, slam loud).
6. Velocity-scale brightness via a lowpass that opens with force.
7. ±8ms onset humanization so layered hits feel organic.
8. Random noise-burst seed per footstep (unique grain).
9. Decay inversely with pitch (high snappy, low ringing).
10. Per-event polyphony limiter stealing the oldest voice.
11. Escalate pitch one semitone per combo step; reset on break.
12. Combo-milestone upward arpeggio fanfare at 5/10/25.
13. Layer impacts from sub-thud + body tone + click transient.
14. Coin blip as a 2-note major third transposing up with streak.
15. Tension layer crossfading in as the combo timer drains.
16. Rising filter-sweep "charge" layer tracking a held power meter.
17. "Shimmer" partial on top during an active multiplier.
18. Wider unison detune as combo grows (thick, chorused).
19. Descending "combo-drop" slide the instant a streak is lost.
20. Sub-bass "weight" thump under heavy objects scaling with size.

### Material impacts
21. Per-surface noise-color + resonant-frequency recipes (wood/metal/glass/dirt/water/fur).
22. Glass = bright detuned-triangle cluster, fast decay + pitch-down tail.
23. Metal = inharmonic FM partials, long ring, high-Q clang.
24. Wood = short filtered-noise knock + low woody bump.
25. Dirt/grass = soft pink-noise puff, near-zero tone.
26. Water = bandpassed noise with a quick "bloop" bend.
27. Pick recipe at runtime from the collider's material tag.
28. Resonant frequency inversely with object size.
29. Secondary "scrape" loop tracking sliding velocity.
30. Wet "squish" recipe for fur-on-fur pug collisions.

### Parametric bork-voice
31. One bork(params) synth: glottal pulse → formant bank → amp envelope.
32. size param → base pitch (yip high vs boom low).
33. emotion param (happy/angry/scared/sad/excited) → contour/speed/brightness.
34. Happy bork = rising two-pitch "boop-bORK", bright formants.
35. Angry = low, fast, gravelly growl-into-bark with noise drive.
36. Scared = thin, fast, high stutter of 3-4 clipped yips.
37. Sad whine = slow downward formant glide with vibrato.
38. Excited spam = accelerating round-robin barks then settle.
39. talkingBork mode mapping UI text to pitched bork chatter.
40. Drive talking-bork pitch from vowels (prosody, not monotone).
41. Howl = long formant glide up-hold-down with vibrato.
42. Panting = rhythmic breathy noise-puff loop scaling with exertion.
43. Snoring = slow two-phase rasp for idle/sleep.
44. Growl = low AM rumble for warnings.
45. Breath noise between borks so the voice has "lungs".
46. ±5% formant randomization per utterance (individual "voice print").
47. whimper micro-yelp on damage, pitched by remaining HP.
48. happy "play-bow" double-bark on game start/big rewards.
49. borkSeed per pug for consistent voicing across a session.
50. sigh falling breath for menu-idle/level-complete.

### Spatial, ambient & UI kit
51. Pan SFX by the emitter's on-screen X.
52. Attenuate volume + lowpass by distance (far = quiet, dull).
53. Subtly widen the music bed; keep UI SFX centered.
54. Looping ambient bed per biome (park birds/city hum/cave drips).
55. Crossfade ambient beds on biome transitions.
56. Randomized ambient one-shots (a distant bark) for life.
57. Reverb send rising indoors/caves, drying outdoors.
58. Pan moving objects continuously across the stereo image.
59. Cohesive UI kit: hover-tick/select-blip/confirm-chord/back-thunk/error-buzz/toggle.
60. Menu navigation pitch steps with cursor position (a tonal scale).
61. Confirm = major-chord arp; cancel = soft downward two-note.
62. Short denied "error-buzz" (low square + quick noise), never harsh.
63. Coin-tally "cash register" blip sequence during score counting.
64. Win stinger = rising major fanfare + triumphant happy-bork.
65. Lose stinger = descending minor slide → deflated sad-whine.
66. Distinct "new high score" sparkle stinger.
67. "3-2-1-GO" rising beeps with a brighter GO accent.
68. Level-start play-bow bark + whoosh.
69. Pause = muffling lowpass swell; resume = bright re-open.

### Haptics, accessibility & polish
70. Shared haptics map: tap/hit/heavy-hit/success/fail/combo/heartbeat/warning.
71. Tap=10ms; Hit=25ms; heavy-hit=60ms scaled by velocity.
72. Success = ascending [20,40,20,40,40] paired with the win chord.
73. Fail = one 200ms buzz paired with the lose slide.
74. Combo = pulse count equals the combo tier.
75. Heartbeat = repeating low-HP pattern that speeds up as HP drops.
76. Throttle haptics with a min-interval guard (no merged ugly buzz).
77. Pair every haptic with its audio twin in one feedback(event) call.
78. Gate haptics behind a toggle + a navigator.vibrate capability check.
79. Centralize all recipes/pitches/haptics in one SOUND_SPEC; playEvent(name) facade.
80. Visual sound pulse + captions + mono-downmix + reduce-highs for accessibility; master limiter caps painful spikes.

---

# PART C — Branding, new games, per-game depth, tech & growth

## 25. Branding, mascot, cast & lore

### Mascot identity & voice
1. Lead mascot "Sir Reginald Borkington III" ("Bork") — insists he's royalty, lives in a dumpster.
2. Deadpan one-word catchphrase: "BORK." (always with the period).
3. Personality: 90% confidence, 10% competence, 0% impulse control.
4. Believes every game is secretly about snacks (and is rarely wrong).
5. Permanently half-lidded eyes like he's judging your high score.
6. A crooked crown made of a bent bottle cap, never explained, never removed.
7. Refers to the player only as "intern".
8. Deepest fear: the vacuum cleaner (a recurring boss across games).
9. Motto: "If it fits, I sits; if it sits, I bork."
10. Loading screens read like Bork's intrusive thoughts ("is floor food? investigating…").
11. "Game Over" → "BORK INTERRUPTED" with a sarcastic quip.
12. New-high-score toast: "intern did a competent. logged it. don't get cocky."
13. Brand never says "click" — it says "boop"; buttons are "boopable".
14. Microcopy bans exclamation points except from Bork (one per session).
15. Empty leaderboard: "no legends yet. be the legend. or don't. Bork's not your dad."

### Cast & Pug-Dex
16. "Noodle" — long-bodied chaos goblin who never blinks.
17. "Dame Mochi" — elegant cream pug, the brains, communicates in disappointed sighs.
18. "Tank" — square-jawed black pug, all muscle, cries at commercials.
19. "Pixel" — a glitchy pug who phases between games, speaks corrupted text.
20. "Grandpaw" — ancient gray-muzzle who narrates lore nobody asked for.
21. "Bean" — the smallest pug, mascot-in-training, says "smol bork".
22. "Crumb" — sidekick whose whole arc is finding one dropped fry.
23. "Static" — feral street pug, only appears when the wifi drops (offline cameo).
24. The Pug-Dex: a grid of character cards unlocked by playing across the arcade.
25. Each card: portrait, faction, rarity, one-line bio, "bork stat" radar.
26. Rarity tiers named after treats: Kibble, Biscuit, Jerky, Golden Bone, Mythic Snack.
27. Catching a pug requires a hidden condition (e.g., score X while sad).
28. "Discovered in" tag naming the game where you first met that pug.
29. Holographic "shiny" variants (a pug in sunglasses, 1-in-256).
30. Completion shown as "good boys collected: 42/100".
31. Cards flip on boop to a back-side lore fragment + a fake QR that just borks.
32. Duplicate catches → "treats" currency to bribe pugs into posing better.
33. Locked card silhouette teases the pug with a cryptic riddle.

### BORKADE universe, villains & factions
34. The arcade is canonically a sentient vending machine dreaming these games.
35. Pugs are refugees from "the Old Net", a crashed server-world.
36. The neon-pixel look is in-world "borklight", the only light pugs see by.
37. Each game cabinet is a different "biome" of the BORKADE dimension.
38. Time is measured in "naps", not hours.
39. The high-score table is the sacred "Wall of Goodest Boys".
40. Patch notes are in-world prophecies delivered by Grandpaw.
41. The loading bar is canonically Bork inhaling before a very big bork.
42. Villain "THE BOOP" — a giant disembodied finger that "pets without consent".
43. "Lord Vacuus" — sentient vacuum overlord; weakness is a red laser dot.
44. "The Cat" — smug pixel rival who always has a (rigged) higher score.
45. The villain faction "The Dustbusters" — appliances who hate mess and joy.
46. Four pug clans: Snoot (explorers), Loaf (defense), Zoomie (speed), Floof (chaos).
47. Players pick a clan that themes their profile borklight color.
48. Clan rivalry leaderboards pool weekly bork-points for a cosmetic crown.
49. Each clan has a legendary ancestor as a Mythic Snack Pug-Dex card.
50. Cross-clan "good boy of the week" enshrined on the home page.

### Animations, cameos & collectible meta
51. Idle Bork tips over sideways, snores, springs back up startled.
52. Bork reacts live to your score — leans in on a streak, flops on a loss.
53. On tab-blur Bork falls asleep; on return he panics awake.
54. Bork's pupils follow boops around the screen.
55. Achievement: Bork spins triumphantly then immediately gets dizzy.
56. New PB: Bork sheds a single pixel tear of pride.
57. Hovering the logo makes Bork sneeze, scattering the wordmark letters.
58. Rage-quit detection: Bork offers a tiny pixel juice box.
59. Seasonal skins: Bork wears a holiday hat with zero acknowledgment of why.
60. Crumb's lost fry is hidden in every single game as a 1-pixel collectible.
61. Pixel the glitch-pug randomly appears mid-game for 2s, dropping a rare card.
62. Beating any game flashes a cameo of the next game's host pug waving.
63. The Cat photobombs exactly one share image at random.
64. Find all 15 hidden fries to unlock Crumb as a Mythic playable card.
65. A shared "snack count" persists across all games as one global stat.
66. Card "bork stat" block: Snoot/Floof/Chaos/Snacc/Loaf radar chart.
67. Frame color encodes faction; foil border encodes rarity.
68. "Card of the day" rotates on the home page with a fresh Bork one-liner.
69. Completing a faction set grants a clan banner cosmetic.
70. Full Pug-Dex completion unlocks the true-ending card: Bork was the intern all along.

## 26. Art direction, pixel style guide & animation

### Foundations
1. Lock one master canvas resolution (320×180) and integer-scale every game; never fractional.
2. One universal pixel grid unit; forbid sub-pixel sprite placement in render code.
3. 16×16 base tile for environment, 32×32 for hero/boss props.
4. Nearest-neighbor scaling everywhere; audit canvas/CSS for accidental smoothing.
5. Ban mixed pixel densities in one scene ("pixel clash").
6. Selective-outline rule: dark exterior outline vs backgrounds, none on internal edges.
7. Color-darkened outlines (a darker shade of the fill), not pure black.
8. 1u outline weight for ≤32px sprites; never thicken on scale-up.
9. Ban anti-aliasing on sprite edges; hand-AA only on the title logo.
10. Single canonical light source: top-left ~45°, consistent across all 15 games.
11. 3-tone-minimum ramp per material before any 4-5 tone detailing.
12. "Hue-shifted shading": shadows toward blue/purple, highlights toward yellow.
13. Restrict dithering to 25%/50% checkerboard for gradients/shadows, never as noise.
14. Ban dithering on sprites under 24px (shimmer).
15. Max-detail budget per sprite (≤5 colors per 16px pug).
16. Readable silhouette as rule #1 (identifiable as a black-fill shape).

### Master palette & pug anatomy
17. Build the master palette in OKLCH for perceptually-equal lightness steps.
18. Anchor backgrounds on charcoal (~OKLCH L 0.18), not pure black.
19. Cap neon accent chroma (~C 0.12-0.16) so neon reads vivid but not searing.
20. 8 core hue families, each a 5-step ramp.
21. Ship palette as CSS custom-property tokens shared by every game.
22. Mirror tokens in a JS palette module for canvas games.
23. CVD-safe pairings; never red-vs-green for state alone.
24. Run every pair through deuteranopia/protanopia simulation.
25. 4.5:1 min contrast for text, 3:1 for large UI, verified per token.
26. Semantic tokens (danger/success/coin/energy) for consistent meaning.
27. One "pug-fawn" body token + shadow/highlight so the pug looks identical everywhere.
28. ~32-40 colors max; ban per-game one-offs unless added to the shared set.
29. Reserve pure white only for the brightest specular highlight.
30. Reserve one "alert magenta" token only for critical/fail states.
31. Publish a canonical pug anatomy sheet (head ratio, ears, wrinkles, eyes, tail).
32. Chibi ~1:1.2 head-to-body ratio for consistent cuteness.
33. 2px black eye + 1px white specular dot positioned top-left (light source).
34. Lock the color mask: fawn body, black muzzle/ears, pink tongue.
35. 4 canonical facings (front/back/left/right) with a documented mirror rule.
36. A 3/4 "hero" view for menus/thumbnails distinct from gameplay views.
37. Emotion face-overlay set (happy/scared/determined/dizzy/sleeping).
38. Accessory anchor points (hat/collar/cape) at fixed pixel coords for cosmetics.
39. Size hierarchy 16/32/64px, each redrawn not upscaled.
40. Standard walk-cycle leg geometry so every pug waddles the same.

### Sprite-sheets, animation & VFX
41. One sprite-sheet layout standard (L→R frames, T→B animations, fixed cell).
42. 1u transparent margin per cell to prevent texture-bleed.
43. Frame naming convention entity_action_direction_frame.
44. Machine-readable JSON atlas per sheet (rects, pivots, durations).
45. Fixed bottom-center pivot so characters plant on the ground.
46. Hitbox metadata in the atlas, not hard-coded per game.
47. One shared atlas (pug/coins/UI/particles) loaded by every game.
48. Squash-and-stretch on every jump/land.
49. Anticipation frames before big actions (crouch before jump).
50. 2-3 frame smear frames for dashes/projectile launches.
51. House tempo: idle 4fps, walk 8fps, action 12fps.
52. Secondary motion: ears/tail lag a frame behind the body.
53. Follow-through: tail/ears overshoot then settle on stop.
54. 1-2 frame hitstop on every hit/collect.
55. Idle "breathing" loop (1px body rise/fall) so nothing is static.
56. Easing by frame-spacing (more frames at slow ends).
57. Square-pixel particles only — no soft circles.
58. A 3-frame "poof" puff for spawns/deaths/dust.
59. Coin-sparkle (4-point star, 2 frames) for every collectible.
60. Chunky pixel explosion (square debris + flash frame).
61. Particle palettes limited to master tokens.
62. Named screen-shake amplitude tiers (small/medium/big) reused everywhere.
63. Flash-on-hit (full-white for 1 frame) consistent across games.
64. Additive-glow blending only for neon accents, sparingly.

### Consistency, seasonal, branding & tooling
65. 15-game audit comparing pug sprites side-by-side for drift.
66. Audit every HUD against a shared HUD style (font/radius/tokens/spacing).
67. Normalize to one pixel font + one numeric font sitewide.
68. Per-game contrast/CVD check logged in an art-debt list.
69. Replace anti-aliased legacy sprites flagged by an "is-this-pixelated" check.
70. Shared pixel-dissolve transition between menu/game/game-over.
71. Per-game "art polish pass" template (palette/outline/juice/particles/HUD).
72. An art-consistency scorecard per game, tracked like regression.
73. Seasonal palette-swap layer (winter blues, autumn ambers) site-wide, no re-art.
74. Seasonal cosmetic overlays snapping to accessory anchors.
75. Logo/wordmark spec: pixel kerning grid, mandatory outline, fixed clear-space.
76. Favicon set redrawn per size (16/32/48), crisp at native res.
77. Maskable PWA icon with safe-zone padding + the 3/4 hero pug.
78. Thumbnail house style (pug left-third, title band, neon backdrop, master palette).
79. A palette.js/palette.css generator as the canonical token source.
80. Off-palette-color CI scanner + a living style-guide HTML page as source of truth.

## 27. Marketing, trailers, press kit & merch

### Short-form video & cadence
1. Post 1 vertical clip daily for 30 days pre-launch: "30 pugs till launch" countdown.
2. Three weekly pillars: Monday fail clip, Wednesday devlog peek, Friday new-game tease.
3. "POV: you're the pug" first-person screen-capture runs.
4. Speedrun-the-worst-score clips ("can you do worse?").
5. Loopable 5s satisfying-idle-animation bumpers, no text.
6. "Pug rates your reaction time" cut-to-pug-judging clips.
7. Slow-mo zoom on the exact frame a guard spots you in Pug Heist, meme caption.
8. "Which pug are you?" personality carousel.
9. Duet-bait clip ending mid-jump for stitch predictions.
10. Green-screen the mascot reacting to trending audio over B-roll.
11. "We added this because ONE person asked" feature + original comment.
12. ASMR pixel-sound compilations (coins, waddles, bonks).
13. Before/after juice clips (pre vs post screen-shake/waddle).
14. Keep every video <12s for the first 90 days (completion rate).
15. Reply to comments in the first 60 min with pug-voiced video replies.
16. "Trying to beat my own high score live" raw one-take clips.

### Memes, trailers & press kit
17. Downloadable meme-template pack (blank pug-reaction panels).
18. "Pug staring at the high score" house macro for every milestone.
19. Guard "?" alert icon as a reaction sticker for Discord/iMessage.
20. Animated GIF set (idle/win/fail) on Giphy/Tenor under "borkade".
21. Caption-the-pug weekly contest; winner becomes the pinned banner.
22. Free phone + desktop wallpapers, one per game.
23. Printable sticker-sheet PDF.
24. 15s launch trailer: 1-second cut of all 15 games, ending on a mascot wink.
25. 6s YouTube bumper: one bork sound + logo sting.
26. Per-game 8s teasers dripped, one every two days to launch.
27. "No ads, no tracking, just pugs" text-only anti-corporate trailer.
28. Fake-AAA-cinematic cold open that cuts to the pixel pug (bathos).
29. Silent autoplay-muted trailer with on-screen text + motion.
30. Same 1.5s mascot-and-URL tag ending every trailer (recall).
31. One-page press kit at /press: logos, screenshots, GIFs, fact sheet, contact.
32. Pre-written boilerplate "about" in 50/100/250-word versions.
33. "5 things that make BORKADE different" bullet list for writers.
34. Ready-to-embed hero trailer + three vertical clips in the kit.
35. High-res mascot turnaround + hex palette for accurate reprints.
36. "tl;dr for streamers" blurb with URL + one-line hook.
37. A living "press coverage" wall on the site for social proof.

### Devlog, communities & outreach
38. Turn every version bump into a 30s "patch notes read by the pug".
39. Public roadmap board fans upvote; screenshot monthly.
40. "Bug of the week" devlog showing the funniest glitch.
41. Changelogs in mascot voice ("the pug learned to dodge guards").
42. Pixel-by-pixel sprite time-lapses as satisfying loops.
43. Honest black-screen-crash post-mortem as a story.
44. Post r/WebGames + r/playmygame GIF-first, link-second (9:1 give-before-ask).
45. Be a genuine sub member 6-12 months before self-promoting.
46. "I made 15 free pug games, AMA" once there's a coverage track record.
47. Discord with a #fail-clips channel as the social heart.
48. Discord auto-roles per favorite game to segment/re-engage.
49. HN "Show HN: no-ads no-tracking pixel pug arcade" (privacy/tech angle).
50. Cross-post devlogs to Mastodon #gamedev/#indiedev with alt-text.
51. Weekly Discord high-score tournament with a custom mascot role prize.
52. Drop exclusive early builds in Discord first (insider feeling).
53. Target micro-streamers (50-500 viewers) who play web games.
54. Curate 100 small streamers; DM personalized, no-template asks.
55. "React to my worst game" lower-stakes hook.
56. One-click stream pack (overlays, alerts, !borkade command).
57. 90-second Loom walking a creator through all 15 games.
58. A clippable designed-to-go-viral moment in each game.
59. Creator high-score leaderboard for clout.
60. Vanity URL (borkade.com/theirname) landing on a creator's favorite game.

### Launch, merch & UGC distribution
61. 6-12 months of community + daily socials before the public push.
62. Soft-launch one game standalone to test virality first.
63. Launch-day: coordinate Reddit + HN + Discord + fresh trailer in a 3-hour window.
64. Stagger 15 game reveals advent-style for weeks of coverage.
65. A/B two trailer thumbnails via two near-identical accounts.
66. "Name the next pug" contest for UGC + a signup spike.
67. Referral mechanic: share your high-score link, unlock a cosmetic hat.
68. Measure share-rate per game; double down on the most-clipped.
69. Re-launch the same trailer monthly with fresh trending audio.
70. Capture every analytics milestone (10k plays!) as a celebratory post.
71. Zero-inventory print-on-demand merch only after demand is proven.
72. Free first: ship stickers + wallpapers before asking for a sale.
73. Brand voice: dumb-cute, never cringe-trying-hard; mock only ourselves.
74. Monthly UGC highlight reel crediting fans by handle.
75. Enamel-pin mascot design as the "I was early" loyalty reward.
76. Repost every fan creation within 24h (train the audience that making content pays).
77. "Fan art Friday" feature slot.
78. Printable papercraft pug model.
79. Maintain a "clip kit" of pre-cut 9:16/1:1/16:9 highlights creators grab freely.
80. Auto-generate a shareable score card at game-over with the URL baked in.

## 28. SEO, schema & per-game landing pages

### Structured data / JSON-LD
1. VideoGame JSON-LD on every game page (name, genre, gamePlatform "Web Browser").
2. playMode "SinglePlayer", applicationCategory "GameApplication".
3. aggregateRating only from real votes (never fake reviews).
4. offers price "0" to flag every game free.
5. operatingSystem "Any", browserRequirements "Requires HTML5/JavaScript".
6. FAQPage JSON-LD per page (Is it free?/Unblocked?/Controls?).
7. HowTo JSON-LD for each game's how-to-play steps.
8. BreadcrumbList JSON-LD: Home › Genre › Game.
9. WebSite JSON-LD with SearchAction on the homepage.
10. Organization/Brand JSON-LD (logo, sameAs socials).
11. ItemList JSON-LD enumerating all 15 games on the homepage.
12. datePublished + dateModified for machine-readable freshness.
13. screenshot/image properties pointing at OG captures.
14. Validate every block in Google Rich Results Test.
15. One consolidated @graph array per page.

### Landing-page content & keywords
16. A real /games/<slug>/ landing URL distinct from the raw iframe.
17. H1 = exact game name + a one-sentence hook.
18. "How to Play" with explicit keyboard + touch controls.
19. "Objective/Goal" paragraph stating the win condition.
20. "Tips & Strategy" 5-8 original bullets.
21. Visible FAQ block mirroring the FAQPage schema.
22. A "Controls" table (key|action) doubling as crawlable text.
23. Genre/difficulty/est-play-time spec table.
24. "Similar games" 3-4 internal links.
25. Unique 150-300 word intro per game (no duplicate copy).
26. Visible "Last updated" date matching schema.
27. Target "[game] unblocked" as a primary long-tail per game.
28. Target "free pug game no download", "browser pug game".
29. Long-tail titles ("Pug Heist — Free Online Stealth Pug Game (Unblocked, No Download)").
30. Question H2s ("How do you play Pug Heist?") to win People-Also-Ask.
31. One primary + 2-3 secondary keywords per page (avoid cannibalization).
32. Homepage owns the head term ("free pug games" / "pug arcade").

### Unblocked, pillars & technical SEO
33. A dedicated /unblocked hub listing all games with copy.
34. "Works on school Chromebooks / no Flash required" reassurance.
35. Per-game title/meta variants including "unblocked" (not stuffing H1).
36. Position as legitimately lightweight/static, not a sketchy proxy.
37. Pillar pages per genre (/stealth, /runner, /arcade, /3d, /puzzle).
38. Listicles ("15 Best Free Pug Games", "Best unblocked pug games").
39. "Games like Pug Heist" comparison page for high-intent searches.
40. Generate sitemap.xml with <lastmod> synced to real edit dates.
41. Reference the sitemap in robots.txt; submit in Search Console.
42. Self-referencing canonical on every page.
43. Canonicalize the iframe/canvas source to its landing page.
44. hreflang="en" + x-default scaffolded for future translations.
45. Lowercase hyphenated stable URLs; never change an indexed slug.
46. 301-redirect any legacy game URLs to current slugs.
47. Inline critical CSS + defer non-critical JS for LCP.
48. Lazy-load offscreen thumbnails; preload hero/OG image + main script.
49. Explicit width/height on all images (kill CLS).
50. WebP/AVIF thumbnails with PNG fallback.
51. Target LCP<2.5s, CLS<0.1, INP<200ms per game page.
52. A loading placeholder so the canvas reserves space.

### Media SEO, freshness & monitoring
53. Descriptive alt text on every thumbnail.
54. Semantic image filenames (pug-heist-screenshot.png).
55. <figure>/<figcaption> on hero screenshots.
56. A dedicated 1200×630 OG image per game with the name baked in.
57. twitter:card summary_large_image + per-game twitter:image.
58. An image sitemap for screenshots.
59. A global footer linking every game (≤2 clicks to any page).
60. "Up next / Play another" links on game-over.
61. A site-wide /changelog updated every release for freshness.
62. Per-game devlog feed on its landing page.
63. Descriptive anchor text ("play the stealth pug game"), never "click here".
64. Homepage "Recently updated" rail from real dateModified.
65. "New"/"Updated" date-tied badges on the grid.
66. Submit each new URL via Search Console URL Inspection.
67. Monitor per-page queries/impressions; iterate low-CTR titles.
68. Track "[game] unblocked" rankings; adjust copy quarterly.
69. An RSS/Atom feed of releases to ping aggregators.
70. ~150-char unique meta descriptions per page with a CTA.
71. A/B title formats (game-first vs keyword-first) via Search Console CTR.
72. Pursue legit listings (itch.io, indie directories); avoid spammy links.
73. A master keyword→URL map to prevent cannibalization.
74. Re-run Lighthouse SEO + Rich Results in CI on every deploy.
75. "Players also viewed" recommendations from a co-visit heuristic.
76. Ping Google/Bing sitemaps (or IndexNow) on each deploy.
77. Add inLanguage + author/publisher to primary schema.
78. CollectionPage JSON-LD on each pillar hub.
79. Self-host fonts (or system fonts) to avoid render-blocking requests.
80. Compress OG images under ~100KB.

## 29. Growth, distribution & differentiation

### Portals, embeds & app stores
1. Publish all 15 to itch.io as a single "BORKADE" collection + per-game entries.
2. Upload top 3 to Newgrounds with the mascot in the author banner.
3. Apply to Poki's developer program with the most-polished game.
4. Submit to CrazyGames via the iframe path, flagging "no third-party ads".
5. Pitch Coolmath (school-friendly, non-violent titles only) for whitelisted reach.
6. List on GameJolt with free achievement/trophy integration.
7. Tag precisely on itch ("browser games", "pixel art") for tag-page traffic.
8. A "Play on itch / Newgrounds / CrazyGames" badge row on each game page.
9. One-line <iframe> embed snippet generator per game.
10. Three embed sizes (mobile/square/widescreen) per game.
11. A data-borkade-game web-component embed that lazy-loads on scroll.
12. ?embed=1 flag hiding site chrome for clean iframes.
13. An oEmbed endpoint so links auto-expand into a playable card.
14. WordPress shortcode [borkade game="..."].
15. postMessage events (score, gameover) so host pages can react.
16. Web manifest + service worker so the whole arcade installs as one PWA.
17. Per-game manifest shortcuts → a jump-list of games.
18. Package to Google Play via PWABuilder/Bubblewrap (TWA).
19. Same TWA APK to Amazon Appstore; MSIX to Microsoft Store.
20. iOS-wrapped build via PWABuilder's Capacitor path.
21. In-app "Install BORKADE" prompt after the 2nd session.
22. manifest screenshots + categories:["games"] for richer listings.

### Directories, SEO listings & the manifesto
23. Submit to "awesome-html5-games" GitHub awesome-lists via PR.
24. List on AlternativeTo as the "no-ads alternative" to Poki/CrazyGames.
25. List on privacy-focused directories under "ad-free entertainment".
26. Submit to IndieDB, GameDev.net, HTML5GameDevs forum.
27. Get on "unblocked games" aggregators for the school channel.
28. Per-game VideoGame schema for rich Google results.
29. One keyword-targeted landing page per game.
30. Submit sitemap + canonicals to Google/Bing Search Console.
31. OG + Twitter Card meta per game so shares render a pug thumbnail.
32. Product Hunt "no-ads pug arcade" launch.
33. "Show HN: a pug arcade with no ads and no tracking".
34. Pitch web-game roundup blogs/newsletters with the no-ads angle.
35. A one-page "Why no ads, ever" manifesto linked in every footer.
36. Persistent "0 ads · 0 trackers · 0 cookies" header badge.
37. A live "what we DON'T collect" page.
38. "View source is the privacy policy" — link the GitHub repo.
39. A uBlock/Privacy-Badger "0 trackers blocked" screenshot.
40. Run the site through Blacklight/Webbkoll and publish the clean report.
41. Shareable "I play ad-free" social cards.
42. Frame load speed as a privacy dividend ("no ad scripts = instant play").
43. A comparison table: BORKADE vs a typical portal (ads/trackers/popups/load).

### School access, metrics & cross-promotion
44. A stable apex domain + a memorable short domain for whitelisting.
45. A single static ZIP for teachers/IT to self-host an offline mirror.
46. A school-mirror build with zero external requests.
47. Whitelist instructions ("ask IT to allow borkade.com").
48. Mirror to GitHub Pages + Netlify + custom domain for redundancy.
49. Printable QR-code posters ("Scan to play — no ads") + per-game QRs.
50. A USB-stick/local-folder build for libraries.
51. A low-bandwidth/data-saver build.
52. Server-log analytics (GoAccess) so zero client tracking ships.
53. If needed, self-hosted Plausible/GoatCounter (cookieless).
54. Scores/play-counts fully local with an opt-in aggregate.
55. A privacy-preserving anonymous "play counter" pixel.
56. A/B test thumbnails by deterministic date rotation, not per-user.
57. Publish the analytics setup openly (transparency as marketing).
58. A public aggregate dashboard ("2M pug games played, 0 ads").
59. "After game-over" recommendation of 2 sibling games.
60. A unified "More Pug Games" carousel across all game pages.
61. A daily-rotating "Pug of the Day" featured game.
62. A shared "pug coins" cosmetic currency encouraging arcade-wide play.
63. A "you've played 3/15 — collect them all" completion meter.
64. A single shared leaderboard hub linking every game.
65. An arcade-wide unlockable (golden pug skin) for playing every game once.

### Brand, partnerships & community
66. Lock a short memorable domain + a 1-2 char short-link domain for QR/social.
67. A self-hosted link-in-bio page (no Linktree tracker).
68. Consistent @borkade handles across Mastodon/Bluesky/YouTube/TikTok/itch.
69. Short gameplay clips (no-ads tagline overlay) to TikTok/Shorts/Reels per game.
70. Partner with dog charities ("play pug games, we donate") — no data sale.
71. Offer the arcade free to shelters/vet waiting rooms as branded kiosk mode.
72. Co-market with privacy orgs (EFF/Mozilla) as a tracker-free showcase.
73. Pitch teachers/edu newsletters on the ad-free, distraction-free angle.
74. A community game-jam ("make a pug game for BORKADE").
75. A "fork me / contribute" open-source path for dev word-of-mouth.
76. A recognizable mascot-led 30s trailer reusable across every listing.
77. Register a typo/alt domain redirect to capture typo traffic.
78. A consistent thumbnail template (pug + title + "no ads" ribbon) across platforms.
79. Cross-game deep links ("liked Pug Heist? try Clown Forest").
80. Gentle local "new game added" notifications (no push tracking).

## 30. Performance, bundling & rendering

### Bundling & code-splitting
1. Code-split every game into its own dynamically-imported chunk (hub loads zero game code).
2. Lazy-load each game's main.js only on click via import().
3. Prefetch a game's chunk on pointerenter/focus of its tile.
4. Split PixiJS into a vendor chunk shared across 2D games.
5. Split Three.js into a chunk loaded only by 3D games.
6. Vite manualChunks pinning shared modules into one long-cached chunk.
7. Inline the hub's critical JS (<4KB) for zero-round-trip first paint.
8. A tiny "game shell" loader showing the title card while the chunk streams.
9. <link rel="modulepreload"> for the known-next chunk.
10. Tree-shake Pixi via sub-path imports (@pixi/sprite).
11. Tree-shake Three (import only used modules; drop the examples barrel).
12. Drop unused Three addons per game.
13. Rollup treeshake:'recommended' + sideEffects flags.
14. build.target es2020 (no legacy transpile bloat).
15. Terser/esbuild minify with drop_console/drop_debugger in prod.
16. Per-game byte budgets enforced in CI (reportCompressedSize).
17. Avoid barrel index.js re-exports that defeat tree-shaking.

### Asset & texture optimization
18. Convert pixel-art PNGs to lossless WebP; AVIF (+fallback) for thumbnails.
19. Pack each game's sprites into one texture atlas (cut GPU binds + requests).
20. Generate atlases at build time wired into Vite.
21. NEAREST scale mode; disable mipmaps for pixel-art atlases.
22. Pre-multiply alpha at build time.
23. Strip PNG metadata (oxipng/pngquant) before atlasing.
24. Quantize palettes to 32-64 colors per atlas.
25. Trim transparent padding; restore via atlas frame rects.
26. Power-of-two atlas dims; cap to ~2048px for low-end GPUs.
27. Lazy-load non-first-frame spritesheets (death/win) after start.
28. Inline tiny critical sprites (player idle) as base64.
29. KTX2/Basis for 3D textures; draco/meshopt for glTF meshes.
30. Deduplicate identical sprites across games into the shared atlas.
31. loading="lazy" + decoding="async" + srcset on hub thumbnails.

### Fonts, CSS & critical path
32. Subset the pixel font to glyphs actually used; self-host WOFF2.
33. font-display: swap/optional so text never blocks LCP.
34. Inline critical above-the-fold CSS; defer the rest.
35. content-visibility:auto on off-screen hub rows.
36. aspect-ratio on thumbnails to eliminate CLS.
37. Avoid web-font icon sets; use inline SVG / pixel sprites.
38. Purge unused CSS per page.
39. CSS transforms/opacity for UI animation (compositor, no reflow).
40. Explicit width/height on every canvas + img.
41. One shared long-cached hub stylesheet; flatten @import chains.

### FPS, adaptive quality & GC
42. Fixed-timestep accumulator decoupled from render; interpolate between ticks.
43. Clamp deltaTime to avoid the "spiral of death" after a stall.
44. Cap catch-up substeps so a long stall can't freeze the game.
45. One shared RAF loop; never setInterval for game logic.
46. Pause RAF when not the active tab; performance.now() deltas only.
47. Batch DOM/HUD reads then writes; update HUD text only on change.
48. A hidden FPS overlay behind ?debug.
49. Cap devicePixelRatio (~2) on mobile.
50. Dynamic resolution: drop render scale over budget, raise when idle.
51. Auto step-down particle counts/effects on sustained low FPS.
52. A Low/High quality toggle persisted, auto-defaulted by device probe.
53. Probe hardwareConcurrency + deviceMemory for the initial tier.
54. Reduce shadow/post-FX before cutting resolution.
55. Disable shake/bloom on prefers-reduced-motion/low-power.
56. Pool particles/bullets/enemies; never allocate in the hot path.
57. Reuse scratch vectors; indexed for loops in hot loops (no map/filter).
58. Preallocate typed arrays for particle systems.
59. Pool Pixi sprites and toggle .visible instead of add/remove.
60. Hoist per-frame closures; cache Math/trig tables.

### Workers, visibility, 3D & CI
61. Move guard AI/pathfinding (pug-heist) into a Web Worker.
62. OffscreenCanvas render in a Worker where supported.
63. Offload procedural maze gen to a Worker; transfer ArrayBuffers.
64. Decode/atlas textures via createImageBitmap off-thread.
65. Audio synthesis via an AudioWorklet.
66. IntersectionObserver pauses any off-screen game canvas.
67. Throttle FPS + cut effects on Battery Status API low/charging-off.
68. Stop RAF + audio on visibilitychange hidden.
69. Disable idle hub background animations after N seconds.
70. Merge static 3D geometry into one mesh (fewer draw calls).
71. Instanced meshes for repeated props (backrooms tiles/lights).
72. Frustum-cull aggressively; tight near/far planes.
73. Bake lighting into textures/vertex colors on mobile.
74. Dispose geometries/materials/textures on scene teardown.
75. Reuse a single WebGLRenderer across scene reloads.
76. Lighthouse CI per PR with LCP/CLS/TBT thresholds + a perf floor.
77. Per-game byte budgets enforced via bundlesize/custom check.
78. Track field Core Web Vitals via a tiny web-vitals beacon.
79. Test on a throttled low-end Android profile (4x CPU, Slow 4G) in CI.
80. depcheck/knip for unused deps/dead code each release.

## 31. PWA, offline & service worker

### Manifest & install UX
1. A full maskable icon set (48→512) with safe-zone padding (ears never clip).
2. Separate purpose:"any" + purpose:"maskable" icons.
3. A monochrome icon variant for Android themed-icon mode.
4. A stable manifest id so updates never spawn a duplicate app.
5. categories:["games","entertainment"].
6. display_override:["window-controls-overlay","standalone","minimal-ui"].
7. Paint the logo + coin count into the desktop title-bar overlay region.
8. theme_color + background_color matched to the splash.
9. lang + dir so the install card renders correctly.
10. orientation:"any" globally; per-game JS lock where needed.
11. prefer_related_applications:false (never push a store over the PWA).
12. form_factor "wide" + "narrow" screenshots so Chrome shows the rich install dialog.
13. Caption screenshots via label as a feature tour.
14. Stash beforeinstallprompt; surface your own button on your terms.
15. Fire the install prompt right after a first win (dopamine spike).
16. Show the install toast only after the 2nd session, not first load.
17. Gate the install CTA behind an engagement threshold.
18. After appinstalled: hide install UI + one-time "You're in!" confetti.
19. Record userChoice; back off re-asking for N days if dismissed.
20. Detect display-mode:standalone and hide install UI when installed.
21. A persistent subtle "Install" chip rather than a nagging modal.
22. A desktop QR that deep-links the install on the user's phone.

### iOS & offline precaching
23. apple-touch-icon 180×180 (iOS ignores the manifest icon array).
24. apple-mobile-web-app-capable + status-bar-style for chrome-free launch.
25. apple-mobile-web-app-title so the iOS label says "Borkade".
26. iOS splash-screen <link> images per device resolution.
27. Detect iOS Safari non-standalone → a "Share → Add to Home Screen" coachmark.
28. Suppress that coachmark once navigator.standalone is true.
29. Precache all 15 bundles/sprites/audio on install (offline day one).
30. Version the precache with a build hash; invalidate only changed assets.
31. Split precache into a critical shell + lazy per-game caches.
32. "Downloading arcade for offline… 7/15" progress bar.
33. Per-game "Download for offline" with a cached checkmark.
34. Warm the next-likely game's cache in the background.
35. cached-at timestamps so the UI shows "offline-ready" freshness.

### Caching strategy & update lifecycle
36. Cache-first for immutable hashed assets (sprites/fonts/audio).
37. Stale-while-revalidate for the HTML shell.
38. Network-first w/ timeout for leaderboard/score API → cached fallback offline.
39. Range-request support for audio seeks in the SW.
40. Per-cache LRU caps; trim oldest to respect quota.
41. Bypass the SW for analytics beacons.
42. Self-host CDN fonts to stay offline-safe (opaque cross-origin only with CORS).
43. On updatefound + installed: a non-blocking "New games — Refresh" snackbar.
44. skipWaiting() only after the user taps Refresh (never mid-game).
45. controllerchange → reload once for an atomic version swap.
46. Show the new version/changelog in the update snackbar.
47. Defer SW updates until the player returns to the home screen.
48. A manual "Check for updates" button calling registration.update().
49. Clear stale caches in activate by diffing the version allowlist.
50. clients.claim() so the new SW controls open tabs immediately.

### Offline UI, sync & advanced APIs
51. A custom Borkade offline screen listing cached, playable games.
52. Grey out + tag not-yet-cached tiles as "needs internet" offline.
53. online/offline status pill ("Offline — scores saved locally").
54. Queue score submissions in IndexedDB; flush on reconnect.
55. Render the shell instantly from cache on a cold offline boot.
56. Persist in-progress game state to IndexedDB (no lost runs).
57. Background Sync retrying queued offline scores.
58. Periodic Background Sync refreshing the daily-challenge seed.
59. Badging API: numeric badge for unclaimed daily rewards; clear on open.
60. Register as a Web Share Target (POST multipart) to receive a screenshot for a profile pic.
61. navigator.share on score screens ("I scored X in Pug Heist" card + link).
62. Generate an OG share image on the fly (canvas → blob).

### Shortcuts, packaging, storage & reliability
63. manifest shortcuts for the top 4 games (long-press jump-list).
64. Each shortcut its own icon + url param the shell reads to auto-launch.
65. A "Daily Challenge" shortcut deep-linking today's seeded run.
66. Hash/route deep-links (/#/game/pug-heist) for shortcuts/shares/bookmarks.
67. A "Continue" shortcut resuming the last game from IndexedDB.
68. launchQueue + a web+borkade protocol handler for external launches.
69. Package via Bubblewrap/TWA → Google Play with no native codebase.
70. PWABuilder export for iOS + Windows store packages.
71. navigator.storage.persist() so the OS won't evict offline caches.
72. A "Storage used / clear cache" control via storage.estimate().
73. Warn near quota before a big offline download.
74. JSON-LD VideoGame/SoftwareApplication per game for rich results.
75. sitemap.xml + canonicals so each game is independently indexable.
76. OG + Twitter meta per route so links render a pug thumbnail.
77. Wrap every fetch handler in try/catch with a cached fallback (no white-screen).
78. A "Reset app" button that nukes caches + SW and hard-reloads when stuck.
79. Lighthouse PWA CI check + a Playwright offline-boot test (kill network, all 15 launch).
80. Always network-fetch sw.js (never cache the SW itself) to stay updatable.

## 32. Input, controls, gamepad & touch

### Unified abstraction
1. One InputState polled per fixed-timestep frame; keyboard/gamepad/touch/pointer feed identical action flags.
2. Map raw events to named semantic actions ("jump","dash"), never read KeyW directly.
3. Each action exposed as both digital (pressed/held/released) and analog (0-1).
4. Per-action edge state (justPressed/justReleased) by diffing frame masks.
5. Merge sources: OR for buttons, max-magnitude for axes.
6. Timestamp every sample with performance.now() (buffering survives frame drops).
7. A consume(action) clearing an edge flag once read (no double-trigger).
8. A ring buffer of recent snapshots shared by replays/netcode/combos.
9. Normalize directional input to a unit-circle-capped {x,y} (no diagonal speed bonus).
10. Drive menus from the same action layer as gameplay.
11. Double-buffer sampling vs reading to avoid mid-frame changes.
12. A per-game action manifest (id/label/defaults/category) the remap UI/hints/saves read.

### Remapping & gamepad
13. A remap screen listing every action's binding per device tab.
14. Capture rebinds via "press any key/button" with timeout + Esc-cancel.
15. Live conflict detection highlighting duplicate bindings in red.
16. Swap-on-conflict offering to trade bindings.
17. Up to two bindings per action per device (primary + alternate).
18. Block reserved keys (Esc/F-keys/browser shortcuts) with a clear message.
19. Per-action + global "reset to default" with undo toast.
20. Persist bindings as a versioned JSON blob; migrate on manifest change.
21. Device-correct glyphs (⎵ for Space, ⨯/A for face buttons).
22. Export/import a binding profile as a copyable code.
23. Poll getGamepads() per frame, not just on connect events.
24. gamepadconnected/disconnected hot-swap + a "controller connected" toast.
25. Standard-mapping by index; per-vendor profile fallback when non-standard.
26. Rumble via vibrationActuator.playEffect with graceful no-op.
27. A haptics intensity slider + off switch, persisted.
28. A named rumble vocabulary (light tick/heavy hit/sustained alarm).
29. Dedup phantom pads on id+index.
30. Analog triggers as 0-1 axes for variable accel/braking.
31. Normalize d-pad-as-hat-axis vs buttons to four direction actions.
32. Cancel rumble on pause/blur/game-over.
33. A "test controller" panel lighting up each button/axis live.

### Touch, buffering & latency
34. Render virtual controls on a separate overlay layer (no game-canvas stalls).
35. A floating joystick spawning under the thumb on touchstart in its zone.
36. Swappable D-pad vs analog-stick per game.
37. Min 48×48px touch targets with invisible padding extending the zone.
38. Sliders for control size/opacity/bottom-margin (thumbs, notches).
39. A left/right handedness mirror toggle.
40. Multi-touch so movement + action register simultaneously.
41. touch-action:none + preventDefault to kill scroll/zoom/300ms delay.
42. Visible pressed state + optional navigator.vibrate(10) on tap.
43. Auto-hide touch controls when a gamepad/key is used; fade back on touch.
44. An edit-layout mode dragging controls, persisted per game.
45. Buffer jump/action presses ~120ms so an early input still fires on landing.
46. Coyote time (~100ms) after leaving a ledge.
47. Buffer/coyote as time-based ms constants (consistent 30/60/144Hz).
48. Combo cancel-window leniency rather than frame-perfect timing.
49. Menu key-repeat with initial delay then faster repeat (own, not OS).
50. Suppress OS auto-repeat in gameplay; track held state ourselves.
51. Radial magnitude-based dead-zone (ignore drift without clipping diagonals).
52. A configurable dead-zone slider for worn sticks.
53. Rescale magnitude after the dead-zone (no "dead-zone tax").
54. Response-curve choice (linear/squared/custom).
55. Separate H/V sensitivity for twin-stick aim/camera.
56. Sample input as late as possible in the frame (shave a frame of latency).
57. Never artificial lag/smoothing/inversion as difficulty; keep response <100ms.

### Pointer, multi-pad, hints & accessibility
58. Pointer Events as the single path for mouse/pen/touch; branch on pointerType.
59. setPointerCapture so a fast swipe leaving the element still tracks.
60. getCoalescedEvents() for smooth aiming without flooding the loop.
61. Translate pointer coords through the DPR/scale transform once, centrally.
62. Quick pointerdown→up within a small radius = "tap" vs drag.
63. Pointer hover for tooltips on mouse; degrade gracefully on touch.
64. Assign gamepads to player slots in connect order via a "press A to join" screen.
65. Per-player InputState for up to four pads + keyboard halves.
66. Keyboard split (WASD=P1, arrows=P2) fallback for fewer pads than players.
67. Show each player's device glyphs in join/pause UI.
68. Pause + re-pair prompt when a claimed pad disconnects mid-match.
69. Route rumble to the correct pad index per player.
70. Detect last-used device; swap all prompts to its glyph set within a frame.
71. Maintain keyboard/Xbox/PlayStation glyph sets, auto-picked by vendor id.
72. A one-button mode cycling intent / auto-moving, timing-only control.
73. A one-hand mode remapping essentials into a reachable cluster.
74. A switch-access scanning mode (highlight steps, one input selects).
75. Toggle-vs-hold for run/aim/crouch.
76. Per-action auto-fire/turbo so no physical mashing.
77. Detect coarse pointer (matchMedia) to default touch controls + larger targets.
78. First-run contextual control hints fading after first successful use.
79. Full keyboard operability + visible focus ring; hold-to-confirm on destructive actions.
80. Flush held-input state on visibilitychange/blur (no stuck keys); redundant visual+audio+haptic feedback.

## 33. Testing, CI, code health & architecture

### Unit & smoke tests
1. Unit-test the RNG/seed helper: same seed → identical sequence.
2. Test leaderboard sort + tie-break with fixed arrays.
3. Test save/load JSON round-trips unchanged.
4. Test clamp/lerp/easing at boundaries (0,1,negative,overflow).
5. Test AABB-overlap with touching/nested/disjoint rects.
6. Test vector helpers incl. the zero-vector edge case.
7. Test score-formatting (separators, digit padding).
8. Test color/palette helpers (hex↔rgb, brightness clamp).
9. Test the audio-volume curve (0→silent, 1→full, never over-range).
10. Test input-mapping resolves WASD and arrows to the same actions.
11. Snapshot-test the shared pug-sprite frame table.
12. Test the localStorage wrapper degrades gracefully (private mode throws).
13. Test debounce/throttle fire counts under fake timers.
14. Smoke-test: load each of the 15 games, assert zero console.error.
15. Assert zero uncaught pageerror in each game's first 3s.
16. Assert each game mounts a non-empty <canvas> after load.
17. Assert the hub renders exactly 15 tiles/links.
18. Crawl every hub link; assert 200 + non-blank.
19. Assert no failed network requests (404/500) per game.
20. Assert each game reaches "ready" within a timeout (no infinite black screen).
21. Smoke-test back-nav restores the tile grid.
22. Run smoke tests on a 375×667 mobile viewport.
23. Assert WebGL context for Pixi/Three games (fallback if not).
24. Assert audio doesn't autoplay before a gesture.

### Regression, visual & CI
25. A named regression test reproducing the v2.10 Pug-Heist black-screen.
26. Assert Pug Heist renders ≥1 non-black pixel within 2s (anti-black-screen guard).
27. Pixel-diff baseline of each game's first frame (tolerance-thresholded).
28. Visual-regression the hub grid at desktop + mobile.
29. Golden-frame: deterministic seed + fixed N updates → stable canvas hash.
30. Regression: previous-version save-data still loads (no wipe).
31. Track per-game bundle-size baseline; fail CI on a jump.
32. Capture a short frame-sequence hash to detect "frozen game".
33. Store baselines per-OS to avoid font/AA flakiness.
34. CI: install → lint → typecheck → build → unit → smoke on every PR.
35. Cache node_modules/Vite build keyed on lockfile.
36. Matrix-run on Node LTS + current.
37. Upload Playwright traces/screenshots on failure.
38. Block merge unless vite build produces all 15 bundles without warnings.
39. Lighthouse CI budget check (perf/a11y floors).
40. A broken-link CI job crawling dist/.
41. Required status check so red CI can't merge.
42. Nightly CI to catch dependency/registry rot.
43. Auto-comment the bundle-size diff on each PR.
44. Deploy-preview each PR + post the URL for manual QA.

### Lint, types, interface & resilience
45. ESLint flat config (no-undef, no-unused-vars, no-console warn).
46. Forbid alert/document.write/eval/new Function via ESLint.
47. Prettier + a format:check CI gate; ban var (const/let).
48. eslint-plugin-import to detect unresolved/circular imports.
49. A max-file-length warning to discourage new monoliths.
50. Pre-commit husky/lint-staged on staged files only.
51. An EditorConfig normalizing CRLF/indent (Windows safety).
52. tsconfig with checkJs:true/allowJs:true for gradual typing.
53. JSDoc-annotate src/shared/; run tsc --noEmit as a CI gate.
54. A @typedef game-module interface checked per game.
55. Type the save-data schema so migrations are statically validated.
56. @ts-expect-error budget tracking to drive type-debt down.
57. A standard {init,update,resize,destroy} interface every game exports.
58. One shared rAF loop calling update(dt) with per-frame try/catch.
59. On an update throw: log once, show an error overlay, halt that game (not the page).
60. Pass a clamped max dt so tab-restore doesn't spike physics.
61. destroy() cancels rAF, removes listeners, frees WebGL/audio.
62. Debounced shared resize() so every game handles rotation uniformly.
63. Loader wraps init() in try/catch → a "Failed to load" card.
64. A watchdog: no frame within N ms after init → recovery UI.
65. Standard pause-on-blur/resume-on-focus in the shared loop.
66. A mount(container) contract (no hardcoded DOM ids).

### Manifest, save-data, security & hygiene
67. A single games.json manifest (id/title/path/engine/thumbnail) as source of truth.
68. Generate the hub grid from the manifest (can't desync the list).
69. Validate the manifest at build (unique ids, existing paths).
70. Version every save blob with schemaVersion.
71. Ordered migration functions, each tested old→new.
72. Validate loaded save-data against a schema; back up + reset on failure.
73. Export/import (download/upload JSON) save data.
74. Namespace localStorage keys per game (borkade:<gameId>:...).
75. Wrap storage access in try/catch with quota handling.
76. "Reset this game's data" + "reset all" with confirm.
77. A strict Content-Security-Policy (no inline-eval, pinned sources).
78. rel="noopener noreferrer" on external links; SRI on any CDN scripts.
79. Global window.onerror + unhandledrejection → a user-facing toast.
80. Pin deps + Dependabot/Renovate; npm audit/osv-scanner non-blocking CI; a CONTRIBUTING checklist (manifest entry + smoke test + interface per new game).

## 34. New game concepts — action/arcade/physics

### Borks & shockwaves
1. Bork Blast — a cone-of-bork shockwave shoves enemies AND ragdoll-recoils you; fight by rocket-jumping off your own barks.
2. Echo Snoot — pitch-black cave you see only by borking; the sonar ping reveals walls for half a second.
3. Subwoofer Pug — stand on bass speakers; on-beat borks are 10x bigger, off-beat fizzle.
4. Bork Karaoke Brawl — hold the note (bork volume) to charge a beam; rivals make you flinch so the note cracks.
5. Quiet Hours — stealth where one full bork wakes the apartment; clear levels with only tiny "boof" half-borks.
6. Howl Harmonic — chain rising-pitch borks to shatter glass force-fields.
7. Bork Recoil Racer — no engine, only barking; face backward and bork yourself down the track.
8. Sonic Boof — break the sound barrier by borking while running; visible cones knock down a lane.

### Tongue physics
9. Tongue Grapple — sticky elastic tongue swing; it stretches, drools, snaps back if overstretched.
10. Lick Lasso — whip-pull objects toward you; heavier things drag YOU instead.
11. Slobber Trail — a sticky tongue-line traps enemies (and you on the return).
12. Double-Tongue — two tongues on both sticks; coordinate to climb chameleon-style.
13. Yo-Yo Tongue — weighted tongue yo-yo; do tricks for combo, miss the catch and it slaps you.
14. Frog-Pug — sit still and snipe flies with tongue flicks; a miss whips back and stuns you.
15. Tongue Bridge — extend across gaps; teammates run the slippery span before it dries and snaps.

### Loaf/sploot shape-physics
16. Loaf Mode — toggle to a rigid loaf bowling ball; un-loaf to grab ledges, re-loaf to smash.
17. Sploot Skydive — belly-flat sploot for glide drag; tuck to dive-bomb, sploot to brake.
18. Inflate-a-Pug — gulp air to balloon-float; vent borks to thrust; a pinprick rockets you off.
19. Squish Squeeze — soft-body jelly pug through gaps; more stretch = floppier control.
20. Stack-a-Pug — fling loafed pugs into a wobbling tower to reach the high-shelf treat.
21. Floppy Run — full-ragdoll runner controlling four leg-muscles (QWOP energy, pug verbs).
22. Pancake Pug — flattened to a 2D paper-pug that slides under doors and rights in updrafts.

### Butt/bonk/bumper, zoomies & treats
23. Butt Bumpers — air-hockey arena; reverse-charge your rump to bonk a giant ball, aim with the tail.
24. Bonk Pinball — you ARE the ball; flippers are paws; tilt by leaning your weight.
25. Reverse Gear — move only backward, ramming with your padded butt; turning forbidden.
26. Twerk Quake — rhythmic butt-slam shockwave rings clear waves by timing the bounce.
27. Cannon Caboose — load yourself rump-first into a cannon; steer with tail-flaps.
28. Zoomie Storm — random zoomie bursts ignore inputs for 1s; survive by predicting WHEN.
29. 3AM Zoomies — dark-house runner where furniture is the only brake.
30. Zoomie Tag — catching a rival transfers the zoomies like a hot-potato speed curse.
31. Sugar Rush — a treat triggers a zoomie overdrive you can't switch off until you nap-crash.
32. Treat Hoarder — carry a teetering pile; each treat slows + wobbles you (greed vs escape).
33. One More Treat — vacuum kibble with your snoot; fuller belly = slower, floatier.
34. Kibble Avalanche — tilt the bowl arena to roll treats into your mouth without burying yourself.

### Snoot, drool, tail & swarm
35. Snoot Boop Blitz — rhythm-shooter booping floating snoot-buttons to fire confetti cannons.
36. Sniff Tracker — follow an invisible scent rendered as a hot/cold snoot-meter, speed-run the find.
37. Snot Rocket — charge a sneeze for a snoot-propelled dash; over-charge sneezes you into a wall.
38. Wet-Nose Radar — horror-runner; your nose glows brighter as the unseen thing nears.
39. Drool Surf — surf your own puddle; longer drool = faster but harder to stop.
40. Flood the Floor — fill a room with drool to float treats up, but too much floats you to the ceiling.
41. Helicopter Tail — spin your curly tail to hover; spin faster to climb but get dizzy.
42. Wag Engine — a runner powered by wag-frequency; match rhythm prompts for top speed.
43. Pug Pile Physics — fling velcro-pugs into a growing wrecking-ball (heavier = more destruction, less control).
44. Conga Bork — lead a growing conga line whose whipping tail knocks over the level.
45. Catapug — teammates are ammo; launch a pug at switches, they waddle back to reload.

### Racing, fighting & shooter (pug verbs)
46. Leash Sling — tied to a sprinting owner; slingshot on the leash to corner, too much tension snaps you back.
47. Drift Sploot — drift by splooting to scrub speed; lower sploot = tighter turn + belly-burn.
48. Fetch Drag Race — race to a thrown ball; you can't brake, only overshoot and circle back.
49. Smell-O-Rally — blind rally steered by scent-cones; a wrong sniff = into the hedge.
50. Mud Bath GP — wallowing speeds you short-term but cakes you heavier each lap.
51. Loaf Sumo — two loaf-bricks shove for ring-control; loafing too long roots you in place.
52. Slobber Boxing — soak the rival in drool; the wetter/heavier they get, the slower they punch.
53. Hump Grapple — a grapple-chess wrestler built on clinch/leg-grab throws.
54. Ragdoll Royale — floppy-physics free-for-all flailing limbs to slap rivals off a shrinking platform.
55. Bork-Off — a parry-fighter where borks clash; out-time their bark to stagger then bonk.
56. Fur Shed Storm — molt fur-tufts as a spread-shot; shake to reload but get cold and slow.
57. Sneeze Gunner — twin-stick aiming sneezes; allergens float in to charge bigger achoos.
58. Slobber Splatoon — paint territory with drool; most-covered floor wins, wet floor slips everyone.
59. Treat Trebuchet — fling treats as bouncing grenades; enemies stop to eat them (ammo = bait).
60. Tail-Gun Turret — a fixed turret spinning your tail-whip to deflect toys back at throwers.

### Endless runner (one weird verb each)
61. Sniff-or-Sprint — stop to sniff every lamppost or lose the scent-streak combo.
62. Leash Limit — an invisible leash radius yanks you to a dead stop if you outrun it.
63. Blink Bork — the screen only renders on the frame you bork; ration your voice.
64. Belly Brake — auto-run; the only control is splooting to brake through gaps.
65. Couch Parkour — endless living-room parkour; soft surfaces bounce, hard floors fail.
66. Tail-Chase Treadmill — chase your own tail dodging obstacles a beat ahead, mirroring it.

## 35. New game concepts — puzzle/sim/idle/rhythm/horror/sports

### Puzzle
1. Loaf Stack — fold sleeping pugs into tessellating loaf-cubes; gaps let cold air un-loaf them.
2. Snoot Boop Circuit — route a boop through nose-mirrors to boop every pug in one chain.
3. Drool Flow — pipe-puzzle connecting drool channels into the bowl without flooding the couch.
4. Untangle the Leashes — rotate circled pugs to undo the leash-braid in fewest spins.
5. Sniff Sudoku — place pugs so no nose smells a duplicate scent per room.
6. Bone Tetris — pack weird-shaped buried bones into the yard-hole before the neighbor digs.
7. Belly Rub Path — one unbroken line rubbing every pug's belly exactly once (Hamiltonian sploot).
8. Zoomie Maze — the pug slides in straight lines until it hits a wall; steer at full zoom.
9. Squeaky Toy Match — match-3 where matched squeakers deafen nearby guards.
10. Treat Weight — deduce the heaviest pug by who tips the seesaw.

### Sim / Tycoon
11. Pug Hotel Tycoon — assign rooms by snore-volume so loud snorers don't wake light sleepers.
12. Dog Park Mayor — zone a park; too many egos in one quadrant triggers a butt-sniff gridlock riot.
13. Grooming Salon Sim — time clipper passes to the breathing rhythm or nick a roll.
14. Breeding Genetics Lab — combine snoot-length/wrinkle/curl to hit the show-judge target.
15. Vet Clinic Triage — sort pugs by symptom (ate a sock vs zoomie OD) before the room melts down.
16. Influencer Pug Studio — stage photos; over-posting fatigues the fanbase.
17. Pug Post Office — sort barked letters by accent; misroutes come back chewed.
18. Rescue Shelter Sim — match adopters to pugs by vibe; mismatches return grumpier.
19. Doggy Food-Truck — cook orders, but each pug only eats after a head-tilt "is this for me?".
20. Pup-Cup Stand — price pup-cups against weather; heatwaves spike demand + melt stock.

### Idle / Clicker
21. Bork Inc. — click to bork; prestige by "going feral" for louder vocal cords.
22. Drool Factory — drool drips into vats; upgrade jowls for premium-slobber sales.
23. Treat Mine — auto-dig; deeper strata yield rarer flavors but wake the big dog.
24. Snore Power Plant — convert idle snores to electricity; too loud wakes the turbines.
25. Fur Empire — passively shed → knit sweaters → buy more pugs that shed more.
26. Zoomie Reactor — idle energy builds; vent as zoomies for multipliers or risk a containment breach.
27. Pug Pyramid Scheme — recruit pugs who recruit pugs; the Feline Trade Commission audits fast growth.
28. Couch Excavation — idle-dig cushions for coins, lost kibble, and ancient sock relics.

### Word / Trivia & Rhythm
29. Bork Translator — type the human sentence matching "bork bork arf"; closer = higher score.
30. Name That Snack — guess the half-eaten mystery food before the pug finishes it.
31. Command Recall — Simon-says of commands; the pug obeys only if YOU recall the order you taught.
32. Treat or Trash — rapid-fire "is this safe for dogs?"; wrong answers cost a vet bill.
33. Tail Wag Hero — hit notes by matching tail tempo; faster songs need frantic wags.
34. Snore Symphony — conduct sleeping pugs whose snore-pitch you tune via pillow height.
35. Bork Band — each pug is an instrument; tap snoots on-beat to play without going off-key.
36. Lick the Beat — lick-tap peanut-butter on the screen on rhythm before it dries.
37. Howl Karaoke — sustain a howl matching the pitch line; wobble and the neighbor dogs ruin it.
38. Squeak Sequencer — build a beat from squeaky-toy samples, perform for a judging cat panel.

### Horror / Comedy
39. 3 AM Zoomies — calm a possessed zoomie-pug before it phases through walls.
40. The Vacuum — survival-horror; the Roomba hunts by following fur trails as you hide the pugs.
41. Gassy Manor — fight ghosts with the pug's weaponized silent-but-deadly toots.
42. The Snack That Stares Back — feed the pug before the living kibble bowl feeds on the pug.
43. Doorbell Dread — bork at real threats, stay silent for the mailman, or the house "loses composure".
44. Under the Bed — co-op horror; one is the pug, one is the monster, trading the lost-toy MacGuffin.
45. The Forever Walk — a liminal looping block; find the off-by-one fire hydrant to escape.
46. Whisker Witching Hour — every mirror shows a wronger pug; pick the real one before midnight.

### Sports / Physics & Toy
47. Snoot Soccer — head the ball with nose-boops only; flat faces ricochet unpredictably.
48. Pug Curling — slide a loafed pug down ice; teammates lick the ice to steer.
49. Flyball Faceplant — ragdoll relay; mistime the hurdle and the tennis-ball baton rolls away.
50. Belly-Flop Diving — scored by splat-surface-area; judges are unimpressed cats with cards.
51. Tug-of-War Physics — lean weight + dig paws against an escalating chain of bigger dogs.
52. Sumo Sploot — push the rival out of the dog bed; loaf low to lower your center of gravity.
53. Pug Ragdoll Playground — fling/stretch/stack physics-pugs; squeaks scale with impact.
54. Wrinkle Sculptor — pinch a clay-pug face into the weirdest expression; share the gallery.
55. Snow Globe Pug — shake the globe; pugs sled and build lopsided snow-pugs by shake force.
56. Aquarium of Pugs — a tank of pug-mermaids you feed and decorate, blowing bork-bubbles.

### Card / Deckbuilder & Roguelite
57. Bork Battle Decks — cards are barks; chaining the same pitch builds a "harmonize" combo.
58. Treat Heist Deck — push-your-luck draws; one card is "the click of the treat bag" that ends greed.
59. Pug Poker — bluff with paws; your tail-wag tell auto-flips on a good hand.
60. Genetics Trading Cards — fuse trait-cards; rare recessive wrinkles power the strongest combos.
61. Couch Dungeon — descend cushion-floors; the lost-sock loot pool reshuffles each run.
62. Zoomie Roguelite — the run ends when the zoomies do; grab upgrades mid-sprint.
63. Vet Escape — flee the clinic room-by-room; doors open only with the right distraction-treat.
64. The Long Walk Home — procedural neighborhood crawl; bork-negotiate or flee each yard's dog.
65. Dream Descent — dive through nap-dream layers that warp physics (gravity-toots, floating treats).
66. Trash Panda Truce — nightly bin raids; recruit fragile raccoon allies who betray you for the shiniest scrap.

## 36. Per-game deep dives (Vol.2)

### 1. bork-battle
1. Storm-eye: a drifting "calm" pocket inside the lethal zone forces risky positioning.
2. Vehicle-mod pickups bolting on mid-run (ram spikes, oil-slick, tow-hook) that break off when destroyed.
3. 2v2v2 duos with a shared respawn battery depleting per revive.
4. Boss kart "The Crusher" that invades and steals the leader's kills.
5. Ring-close terrain hazards (collapsing bridges, magnet plates, conveyors).
6. Live killstreak loadout cards (homing sausage, phantom dash) chosen at each ring-stage.
7. Slow-mo "final two" cinematic camera.
8. A beatable replay-ghost of the previous winner as a pace-pug.

### 2. pugfort
1. Day-phase salvage economy: zombie parts → night-upgrade currency.
2. Burrowing tunnel zombies forcing floor-trap placement.
3. Wall HP/material tiers with visible cracking decals.
4. A "siege" boss-zombie that lobs other zombies over your walls.
5. A power-grid: turrets share a generator that can overload or be sabotaged.
6. Weather nights (fog hides spawns, rain slows fire-turrets, storms cut power).
7. Co-op blueprint voting on the next structure.
8. Endless "Onslaught" with a nights-survived leaderboard.

### 3. pug-heist
1. Disguise system (guard outfit) with a filling suspicion meter.
2. Distraction gadgets (squeaky toy, treat-toss) to lure guards off-route.
3. Dynamic guard memory re-sweeping last-seen spots.
4. A vault lock-dial timing mini-game scaling with cheese value.
5. Per-floor security tiers (lasers, pressure plates, hackable cameras).
6. A pre-heist planning phase pre-placing ropes/tools.
7. Loot-weight slowing your waddle and escape.
8. A rival-thief NPC racing you to the loot (steal from / sabotage).

### 4. pug-cafe
1. Signature-dish combo chains for multiplier streaks.
2. VIP critic customers unlocking decor/menu tiers via secret ratings.
3. Kitchen-disaster events (grease fire, fridge outage) demanding triage.
4. Staff-hiring meta with idle-able barista/chef/runner skill trees.
5. Conveyor "rush hour" assembling plates on the move.
6. Weekly rotating seasonal menus + limited ingredients.
7. Customer-mood: slow service spawns "Karen" pugs scaring the queue.
8. Co-op split-station (prep vs service).

### 5. rocket-pug
1. Destructible arena chunks falling into the void.
2. Weapon-fusion pickups combining two guns into hybrids.
3. Jetpack-fuel management with overcharge bursts.
4. Gravity-flip zones inverting aim + movement.
5. A "Mecha-Pug" boss round forcing brief 4-player co-op.
6. Pre-match ban/pick loadout draft.
7. Killcam + taunt-emote post-frag flexing.
8. A ranked ladder with seasonal sausage-skins.

### 6. dungeon-diggers
1. Cave-in physics: over-mined ceilings collapse, blocking paths.
2. Drill-heat forcing cooldown breaks or a blowout.
3. Underground biomes (ice/magma/crystal) with unique ore + hazards.
4. A pet-mole companion auto-mining a chosen vein.
5. A "Cheese Golem" boss with a weak-point puzzle.
6. Map-fog + ping system rewarding cartography upgrades.
7. A surface gem-shop with fluctuating run-to-run prices.
8. A daily seeded dig with a deepest-depth leaderboard.

### 7. mutation-lab
1. Stability meter: mismatched ingredients risk a volatile re-mutating pug.
2. A gene-splice grid where placement (not just choice) alters results.
3. Breeding two created pugs to chase rare recessive traits.
4. A contamination outbreak event infecting your collection.
5. A research-tree meta unlocking reagent slots + rarer ingredients.
6. A trait-photo "Pugdex" with shiny variants.
7. Timed client commissions demanding exact-spec pugs.
8. A "Prime Mutant" boss fusing your three best pugs against you.

### 8. delivery-pugs
1. Branching routes (shortcut alley vs safe road) with risk trade-offs.
2. Parcel-stacking: more packages but worse balance/steering.
3. Vehicle unlocks (skateboard/scooter/hoverboard) with distinct handling.
4. Noise-scaled dynamic zombie hordes.
5. Combo-tricks (grind, wall-ride) banking time-bonus on landing.
6. Weather/time-of-day affecting traction + visibility.
7. A "Tank Zombie" multi-street chase finale.
8. A delivery-streak meta unlocking gear + shortcut maps.

### 9. pugzilla
1. Limb-targeted destruction triggering chain collapses.
2. A rampage-meter ultimate (atomic bork-breath).
3. Military escalation (tanks → jets → mechs → a rival kaiju boss).
4. Evolution-branch choices (armor/speed/fire) reshaping the silhouette.
5. Civilian-panic: eating fleeing crowds heals more than static targets.
6. Grab-and-throw physics (hurl tanks into helicopters).
7. City-district objectives with destruction combos.
8. New Game+ megachonk that one-shots early tiers but draws harder enemies.

### 10. backrooms-pug
1. A sanity meter warping tileset + audio as it drains.
2. The entity learns your pathing and pre-camps routes.
3. Almond-water pickups briefly revealing exits on a minimap.
4. Noise-based detection (sprinting/bumping draws the hunter).
5. Procedural themes (poolrooms/offices/parking) with theme-specific scares.
6. Flickering-light memorization puzzles in the dark.
7. Multiple entities with distinct hunt behaviors per level.
8. Hidden lore notes unlocking a true-ending escape.

### 11. backrooms-3d
1. Stamina + crouch-peek for tense corner checks.
2. A camcorder night-vision mode with battery scarcity + grain.
3. Audio-occlusion 3D footsteps to locate the entity by sound.
4. A maze that silently rearranges walls behind you.
5. Multi-floor descent via stairwells with escalating dread.
6. Entity types: a stalker, a sprinter, a wall-phaser.
7. Flashlight-flicker + heartbeat HUD tied to proximity.
8. Co-op two-player sharing one flashlight battery.

### 12. clown-forest
1. The clown leaves footprints/balloons telegraphing its approach.
2. Item-combination crafting (matches + fuel = torch).
3. Trap-setting (bear traps, noise lures) to delay the chase.
4. Dynamic fog thickening as dawn nears, narrowing vision.
5. Multiple clowns with a coordinated pincer-hunt on hard.
6. Hiding spots with a breath-holding tension meter.
7. Radio static growing louder as the clown closes.
8. Branching forest layout with randomized item spawns.

### 13. floor-lava
1. Wall-jump + dash chains for skill-based recovery.
2. Crumbling/bounce/ice platform variety with telegraphs.
3. Lava-surge events spiking the rise rate.
4. Coins gating cosmetic skins + a starting double-jump.
5. Moving hazards (fireballs, falling rocks).
6. Checkpoint mode vs hardcore no-checkpoint leaderboard.
7. Power-ups (slow-lava, jetpack burst, shield) at intervals.
8. A "Lava Worm" boss lunging at height milestones.

### 14. supermarket-pug
1. Shopping-list objectives prioritizing high-value loot.
2. Shelf-physics: knocked displays create blocking debris + noise.
3. Guard AI with chase/search/reinforcement states.
4. Cart upgrades (bigger basket, turbo wheels, armored bumper).
5. Aisle hazards (wet floor, auto-doors, falling stock).
6. Co-op "one drives, one grabs" cart-tandem.
7. A self-checkout mini-game gating the clean no-alarm exit.
8. A "Store Manager" boss locking exits until you ditch loot.

### 15. pug-td
1. Tower-fusion merging two same-type towers into a hybrid.
2. Boss waves with armor phases + on-death minion splits.
3. Map-terrain editing (dig trenches, build ramps).
4. Per-tower targeting priority (first/last/strongest/closest).
5. Endless mode with scaling modifiers + leaderboard.
6. Elemental synergies (freeze→shatter, oil→ignite).
7. A manually-steered hero-pug to plug emergency leaks.
8. Mid-wave economy (sell/rebuild for interest bonuses).

---

*End of Idea Bank Vol. 2 — ~3,100 curated ideas across 36 sections, built on a
7-brief research foundation (the research → generation pipeline you asked for).
Combined with `IDEA_BANK_1000.md` (Vol. 1, ~1,230) the bank holds ~4,300
deduplicated, research-backed ideas. Each section was condensed from a larger
raw generation pass for usability — the goal is a menu you can actually act on,
not 140k padded lines. Pull from it; don't pour it.*










