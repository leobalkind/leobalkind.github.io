# BORKADE — Refined Top Ideas (QA / improvement pass)

> Created 2026-06-08. Stage 3 of the pipeline: **7 QA agents audited the live
> codebase** and the full idea bank (Vol.1 `IDEA_BANK_1000.md` + Vol.2
> `IDEA_BANK_5000.md`), cut the small/cosmetic ideas, kept and sharpened only the
> **big, high-impact** ones, scored each by **Impact ÷ Effort**, and added major
> ideas the bank missed. Below: a synthesized **master Top 20 to build**, then the
> 7 full QA shortlists.
>
> This is the doc to actually build from. Every item is high-impact and tailored
> to a free, static, no-ads, no-tracking pug arcade.

---

## ★ MASTER TOP 20 — ranked by impact ÷ effort

Synthesized from all 7 QA "Top 5 to build first" lists; deduplicated and ordered.
**Effort:** S = hours, M = a day or two, L = multi-day.

### Tier 1 — do these first (reliability + keystones)
1. **Playwright smoke suite that GATES the deploy** — load all 15 games + hub, wait 3s, assert the canvas drew and zero console errors; fail = no publish. *(High / M)* — This is *exactly* how the v2.10 black-screen shipped; it can never happen again. **[QA7]**
2. **Shared crash boundary** (`safeBoot.js` + global `window.onerror`/`unhandledrejection`) — any fatal error renders "this game crashed → back to arcade", never a dead/black tab. *(High / M)* **[QA7]**
3. **Games registry** (`games.js`: id/title/folder/tags/blurb) — hub cards, PWA shortcuts, SW precache, smoke test, and "random game" all read one source of truth; no more hand-editing the 5k-line index.html per game. *(High / M)* **[QA7]**
4. **Shared deterministic RNG** (`rng.js`, mulberry32, seed/save/restore) and route every game's randomness through it. *(High / L)* — The keystone: unlocks daily challenges, shareable seeds, ghosts, and replays (4+ items below depend on it). **[QA4]**

### Tier 2 — the growth + retention engine
5. **Real Daily Challenge + streak** wired to the existing (currently cosmetic) DAILY chip — same UTC seed for everyone, local leaderboard, streak with a freeze/grace day. *(High / M)* — Wordle-style habit loop; the #1 no-backend retention lever. **[QA3/QA4/QA5/QA7]**
6. **Generated 1200×630 PNG share-card + spoiler-free emoji result string** at the game-over peak moment. *(High / M)* — The single biggest organic-acquisition loop for a no-ads site; the share modal exists, only the image is missing. **[QA4/QA5/QA6]**
7. **Cross-game meta-progression** — one shared currency/XP + a cosmetic pug customizer (hats/skins/palettes) that persists across all games. *(High / L)* — Turns 15 isolated toys into one arcade with a reason to return daily. **[QA3/QA4/QA5/QA7]**
8. **Personalized "Recommended for you" rail** on the hub from local plays + recents + favorited tags. *(High / M)* — The biggest *missing* discovery capability; converts a flat grid into a retention engine. **[QA1/QA2]**
9. **Personal-best ghost** in every game (race a translucent past-self). *(High / M)* — The cheapest async-competition hook and the first payoff of the deterministic RNG (#4). **[QA4]**

### Tier 3 — reach (SEO, performance, accessibility)
10. **SEO bundle: sitemap.xml + robots.txt + per-game `VideoGame`/`BreadcrumbList` JSON-LD + per-game OG images.** *(High / S-M)* — Highest impact-per-hour; currently links share as plain text and crawlers may miss games entirely. **[QA6]**
11. **Engine code-splitting** so 2D (Pixi) games never ship Three.js and vice-versa; lazy-load each engine. *(High / M)* — The biggest load-time win; load time gates every growth metric. **[QA6]**
12. **"Unblocked at school" landing channel** — a dedicated page + lightweight embeds targeting that huge query; the static/no-login/no-ads build is ideal for it. *(High / M)* **[QA6]**
13. **Keyboard play + screen-reader live regions + remappable controls** across all games. *(High / M)* — The biggest accessibility/reach/legal gap; locks in the keyboard-only + motor-impaired + blind segments. **[QA3]**
14. **Data export/import (JSON)** for profiles/scores/cosmetics/settings. *(High / S)* — localStorage is the *only* copy; one cache-clear wipes everything. Essential for a no-tracking site. **[QA2/QA3]**

### Tier 4 — brand, feel & breadth
15. **Name + canonize the mascot & cast** (a hero pug with personality + recurring named characters). *(High / S)* — Near-zero code; anchors all marketing, loaders, 404s, and unblocks the Pug-Dex/lore. **[QA5]**
16. **Shared MusicDirector** — one continuous adaptive track that crossfades mood across hub→game→hub instead of 15 separate restarts. *(High / M)* — Transforms "15 demos" into "one arcade"; per-game tracks already exist to fold in. **[QA5]**
17. **Bork-voice engine + haptics in the shared SFX layer** — a parametric woof/yip synth (the brand's literal voice) + `navigator.vibrate` on every hit/win. *(High / S-M)* — Both live in one shared file and touch every game at once. **[QA5]**
18. **Command palette (Cmd-K)** + **multi-select combinable filters** + **URL state** for search/filter/sort. *(High / M)* — Transformative navigation; unlocks the catalog's already-rich tag data; makes views shareable + Back-button-correct. **[QA1/QA2]**
19. **Wire the existing gamepad wrapper into all 15 games** via a unified input layer (only 2/15 use it today). *(High / M)* — Controller/couch play is ~90% built and 0% delivered in 13 games. **[QA7]**
20. **"No ads. No tracking. No sign-up." as the headline brand promise** everywhere (hub, OG, clips) + a shared pixel **style guide + tokens**. *(High / S-M)* — The one claim competitors structurally can't match, plus a coherent look = the cheapest brand moat. **[QA6/QA1/QA5]**

### Bonus — strongest NEW games to add (from QA7), all share-loop friendly
- **Pug Go** (one-tap endless runner, daily-seed leaderboard) — cheapest + most viral. *(High / S)*
- **Flappy Pug** (one-button, brutal, leaderboard) — proven viral skeleton. *(High / S)*
- **Vampire Pugvivor** (auto-attack horde survival) — the most meme-able genre right now. *(High / M)*
- **Pug.io** (eat-and-grow vs bots, no netcode) — instantly shareable framing. *(High / M)*

---

# Full QA shortlists (per domain)

## QA1 — Hub, cards, motion, theming, type
Audited against the live hub. Baseline already strong (animated card art, 3 themes, reduced-motion guards, featured-of-day, Bork Level, favorites, streaks, NEW/HOT). Highest-impact moves are about hierarchy, instant-play perception, personalization, motion at scale.

**Hero / first-impression:** live/animated featured hero (a 5s auto-loop) replacing the text ribbon *(High/M)*; "Resume / Jump back in" hero strip for returners *(High/S)*; collapse the header by default on return visits *(High/S)*; lead with "15 free pug games. No ads. Press play." as dominant type *(Med/S)*; animate the logo pug (blink/ear-twitch/bork) *(Med/S)*.
**Cards:** real animated gameplay thumbnail on hover/focus *(High/L)*; difficulty/session-length/player-count meta badges *(High/M)*; always-visible best-score + medal on the card face *(High/S)*; 1-2 hero cards span 2×2 (editorial differentiation) *(High/M)*; category-coded border/glow *(Med/S)*; auto NEW/UPDATED from a versions manifest *(Med/S)*; card→game expand/wipe transition (kill white flash) *(Med/M)*.
**Personalization (biggest gap):** "Because you played X" row *(High/M)*; "Surprise me" weighted-random dice *(Med/S)*; "continue your streak — play today's pick" nudge *(Med/S)*; played/unplayed dimming + "✓ Played" stamp *(Med/S)*.
**Motion:** re-fire the staggered card cascade on filter change *(Med/S)*; tactile press/spring + bork on tap *(Med/S)*; optional hub sound layer (off by default) *(Med/M)*; IntersectionObserver-pause ambient motion off-screen/low-power *(Med/S)*.
**Theming/type:** auto theme via prefers-color-scheme + seasonal palettes *(Med/S)*; typographic legibility pass (VT323 too low-contrast small) *(High/S)*; per-game accent from each card's art *(Med/M)*; consistent custom pixel-icon set (replace mixed emoji) *(Med/S)*; theme-aware card art (CRT overlay in retro theme) *(Med/M)*.
**Top 5:** live featured hero · "Resume" strip · card meta badges · "Because you played" row · typography legibility pass.

## QA2 — Discovery, search, filtering, states, settings
Grounded in the live hub (fuzzy search, single-select chips, sort select, favorites, recently-played, profiles).

**Top items:** Command palette (Cmd-K) over games + actions *(High/M)*; multi-select combinable filters (stack HORROR+STEALTH) *(High/M)*; personalized "Recommended for you" rail *(High/M)*; filter/sort state in the URL + Back-button restore *(High/S)*; actionable empty state (did-you-mean + reset + popular picks) *(High/S)*; search across controls/players/perspective/difficulty *(Med/M)*; synonym/alias map (spooky→horror) *(Med/S)*; removable active-filter pills with one-tap clear *(High/S)*; "Surprise me" weighted-random *(Med/S)*; richer continue-playing depth (level/best in the rail) *(High/M)*; **settings data export/import (JSON)** *(High/M)*; clickable per-card tag chips → filter *(High/M)*; "what's new/by date" browse view *(Med/S)*; card skeletons + aria-busy *(Med/S)*; keyboard grid navigation (arrows + Enter) *(High/M)*; persist last category + search (only sort persists today) *(Med/S)*; hide-played / "hidden gems" toggle *(Med/S)*; localStorage quota/error handling + toast *(Med/S)*; hub theme/accent + density controls *(Med/M)*; search debounce + aria-live result count *(Med/S)*; **curated Collections/playlists** ("Spooky Night", "Quick 2-min") *(High/M)*; recently-played manage UI w/ timestamps *(Med/S)*; interactive featured-of-day ("more like this") *(Med/S)*; granular settings reset *(Med/S)*; tag-coverage audit + 1P/2P/controls metadata *(Med/S)*.
**Top 5:** multi-select filters · command palette · recommended-for-you rail · data export/import · URL state.

## QA3 — Accessibility, i18n, engagement loops, streaks, economy
**Accessibility:** full keyboard play + visible focus per game (WCAG 2.1.1, biggest gap) *(High/M)*; remappable controls *(High/M)*; SR live-region announcements (score/lives/game-over) *(High/M)*; pause-anywhere + speed slider 0.5-1x *(High/M)*; hold-instead-of-mash + sticky-keys *(Med/S)*; audio captions for game events *(Med/M)*; dyslexia font + spacing *(Med/S)*; **screen-flash/brightness cap (seizure safety, WCAG 2.3.1)** *(High/S)*.
**i18n (biggest reach multiplier):** externalize all UI strings to a JSON i18n layer *(High/L)*; ship 3-5 launch locales (ES/PT-BR/FR/DE/JA) *(High/M)*; lang/dir + RTL + locale formatting *(Med/M)*; auto-detect navigator.language + override *(Med/S)*.
**Loops:** weekly rotating challenge + modifier-of-the-week *(High/M)*; seasonal themes/events *(High/M)*; cross-game daily quest board *(High/M)*; deterministic daily seed = shareable identical run *(Med/S)*; share-card image generator *(High/M)*.
**Streaks:** streak freeze/grace day *(High/S)*; comeback/win-back state *(High/S)*; streak milestone cosmetics *(Med/S)*; opt-in local reminder notifications *(Med/M)*.
**Economy:** single soft currency + cosmetics shop *(High/L)*; pug customizer (persists across games) *(High/M)*; collection/sticker album + completion % *(Med/M)*; export/import save *(High/S)*. Plus a **first-run unified settings + accessibility prompt** (discoverability multiplies all of the above) *(High/M)*.
**Top 5:** i18n externalization · soft currency + shop + customizer + save-export · keyboard play + SR live regions · streak freeze + comeback · share-card + deterministic daily seed.

## QA4 — Achievements, progression, leaderboards, sharing, replays
Verified: per-game achievements exist but no cross-game meta; the DAILY chip is a cosmetic label; friend code is "cosmetic only"; the share modal has no image card; a seeded RNG exists in ONE game only and most games mix a half-wired seed with raw Math.random() (nothing is deterministic); cloud sync is built but flag-off.

**Top items:** shared deterministic RNG module (keystone) *(High/L)*; generated PNG share-card *(High/M)*; cross-game level/XP system *(High/M)*; real daily challenge wired to the chip *(High/M)*; shareable seed/challenge codes *(High/M)*; ghost replays *(High/L)*; cross-game meta-achievements *(High/M)*; achievement gallery/trophy room w/ locked silhouettes + rarity *(High/M)*; per-game mastery tiers (Bronze→Diamond badge on cards) *(High/M)*; clip/GIF export (gifuct already a dep) *(High/L)*; friend leaderboard via imported codes *(High/M)*; "challenge a friend" deep link *(High/M)*; streak system *(High/S)*; prestige *(Med/M)*; animated rarity-flair unlocks *(Med/S)*; hub stats "year-in-review" card *(Med/M)*; personal-best ghost (ship before rival ghosts) *(High/M)*; end-screen "share this run" CTA *(High/S)*; standardized +XP/milestone feedback *(Med/S)*; collectible cosmetic unlocks via pugSprite *(High/L)*; weekly modifier *(Med/S)*; achievement rarity % *(Med/M)*; opt-in cloud global top-100 (infra exists) *(High/M)*; replay theater/share link *(Med/L)*; first-week onboarding achievement path *(Med/S)*.
**Top 5:** deterministic RNG · PNG share-card · cross-game XP · daily challenge + streak · personal-best ghost.

## QA5 — Multiplayer, community, audio, branding
Grounded: shared miniSfx (no haptics/bork-voice), per-game musicTrack with setIntensity wired in ~10 games but no shared director, profile + optional Supabase, strong pugSprite but no named mascot/cast, zero multiplayer.

**Multiplayer:** universal hotseat "Pass-the-Pug" wrapper (retrofits 2-4P onto every game) *(High/M)*; WebRTC P2P via QR/link, serverless manual signaling *(High/L)*; async ghost/score-attack challenge links *(High/M)*; shared daily seed *(High/S)*; BroadcastChannel same-device co-op *(Med/M)*.
**Community:** Wordle-style share card (image + emoji) *(High/S)*; per-game emoji result strings *(High/S)*; in-hub Discord/community CTA *(Med/S)*; UGC level codes for editable games *(High/L)*; cloud global leaderboards (Supabase wired) *(High/M)*; player-submitted skins gallery *(Med/M)*.
**Audio:** **shared MusicDirector (one continuous track across hub→game→hub)** *(High/M)*; standardized adaptive-intensity hooks *(High/S)*; win/lose/boss stinger layer *(Med/S)*; ducking bus *(Med/S)*.
**SFX/voice:** procedural bork-voice engine *(High/M)*; haptics in shared SFX layer *(High/S)*; reactive bork announcer *(Med/M)*; per-game SFX identity palette *(Med/S)*.
**Branding:** name + canonize the mascot *(High/S)*; named recurring cast across games *(High/M)*; Pug-Dex collectible codex *(High/M)*; animated mascot on loading/empty/404 *(Med/S)*; cross-game lore/world framing *(Med/M)*; branded first-run mascot intro *(Med/S)*.
**Top 5:** shared MusicDirector · name the mascot & cast · daily seed + emoji result · bork-voice + haptics · Pass-the-Pug hotseat.

## QA6 — Art, marketing, SEO, growth, performance
Confirmed: Vite multi-page build (Pixi 8 AND Three 0.184 both bundled), PWA exists, but no root sitemap/robots, no shared style guide, no per-game OG images.

**Art:** single shared pixel style guide + tokens.css/palette.json *(High/M)*; unified HUD/menu component *(High/M)*; canonical mascot sprite sheet everywhere *(High/S)*; animated loading mascot (vs the black-canvas-on-3D-boot bug) *(Med/S)*; colorblind-safe palette + readable pixel font in the guide *(Med/S)*.
**Marketing:** 15s auto-captioned vertical clips per game *(High/M)*; one 45s site sizzle trailer *(High/M)*; "No ads. No tracking. No sign-up." as the headline promise *(High/S)*; press/curator kit page *(Med/S)*; print-on-demand mascot merch *(Med/S)*; one-game-at-a-time Reddit/Discord launch cadence *(Med/S)*.
**SEO:** root sitemap.xml + robots.txt (missing!) *(High/S)*; VideoGame + BreadcrumbList JSON-LD per game *(High/S)*; per-game OG/Twitter images *(High/M)*; dedicated SEO landing page per game (controls/tips/FAQ) *(High/M)*; genre/collection hub pages *(Med/M)*; crawlable `<a href>` links to every game *(Med/S)*.
**Growth:** "unblocked at school" channel *(High/M)*; publish to itch.io/Newgrounds/CrazyGames *(High/M)*; finish PWA install polish (offline + per-game icons) *(High/M)*; TWA/PWABuilder → Google Play *(Med/M)*; cross-game retention loop (shared profile/streak/game-of-day) *(High/M)*.
**Performance:** code-split so Pixi games never ship Three *(High/M)*; lazy-load each engine + shared vendor chunk *(High/M)*; preload/responsive hero & OG images, lazy-load thumbs *(Med/S)*.
**Top 5:** shared style guide + tokens · SEO bundle (sitemap/robots + JSON-LD + OG images) · "no ads" headline promise · engine code-splitting · "unblocked at school" channel.

## QA7 — PWA, input, testing/architecture, new games, per-game
Verified: SW precaches only the hub shell (so "offline forever" is currently false); the gamepad wrapper exists but only 2/15 games use it; the 15 cards are hand-authored in a 5,339-line index.html (no registry); CI deploys on every push to main with ZERO validation (how the black-screen shipped); no game has window.onerror.

**Testing/architecture:** Playwright smoke test for all 15 + hub *(High/M)*; gate the deploy on it *(High/S)*; shared crash boundary (safeBoot + global handlers) *(High/M)*; games registry *(High/M)*; shared resilient game loop (fixed timestep, auto-pause, dt clamp) *(High/M)*; Lighthouse-CI/asset-budget *(Med/S)*; PR preview deploys *(Med/M)*.
**PWA:** precache all 15 games on install (make the offline promise true) *(High/M)*; update-available toast *(High/S)*; PNG/maskable/Apple-touch icons (SVG-only breaks iOS) *(Med/S)*; in-app install prompt *(Med/S)*.
**Input:** wire gamepad.js into all 15 games *(High/M)*; unified input abstraction (move/aim/fire/ability/pause) *(High/M)*; touch-controls audit + haptics *(Med/M)*; rebindable keys + persisted profile *(Med/M)*.
**New games (strongest/most buildable):** Pug Go (one-tap runner) *(High/S)*; Vampire Pugvivor *(High/M)*; Pug.io *(High/M)*; Flappy Pug *(High/S)*; Bork Tycoon idle *(Med/M)*; Pug Crossing (reuse delivery-pugs art) *(Med/S)*; Pug Royale vs bots *(Med/M)*.
**Per-game depth:** daily-seed + leaderboards across ALL games *(High/M)*; meta-progression layer (shared currency + cross-game unlockable skins) *(High/L)*.
**Top 5:** smoke suite gating deploy · shared crash boundary · games registry · unified input + wire gamepad to all 15 · daily-seed leaderboards across all games.

---

*Pipeline: 7 research briefs → 36 idea-generation sections (~3,100 ideas) → 7 QA
agents (code-grounded refinement) → this ranked action list. Build top-down from
the Master Top 20.*

