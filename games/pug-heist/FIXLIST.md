# Pug Heist — Fix / Polish List

Working list for Pug Heist. Status as of 2026-06-05.

## 🔴 Critical (FIXED this session)
- [x] **Black-screen crash on start (game was unplayable).** `start()` set
  `running = true` and showed the pre-floor briefing *before* `genFloor()` built
  `pug` / `walls`. While the briefing was up, `tick()` read `pug.fartT` (undefined)
  and threw; the uncaught error skipped `requestAnimationFrame(loop)`, permanently
  killing the render loop → black screen even after INFILTRATE.
  Fix: early-return guards in `tick()` (`if (!pug) return;`) and `render()`
  (`if (!pug || !walls) return;`), plus a `try/catch` around the loop body so no
  single frame error can ever brick the game again (it logs and keeps going).
  **This shipped broken in v2.10 — needs to be pushed live ASAP.**

## 🟢 Game feel (DONE this session)
- [x] **Rigid camera → smooth follow + look-ahead.** Camera center now eases
  toward the pug with a short velocity lead (`_camCX/_camCY` in `tick`); snaps on
  big gaps (new floor / vent teleport).
- [x] **Static walking pug → waddle + squash/stretch.** `_pugWaddle()` adds a
  hoppy bob and alternating squash that scales with speed (fart-sprint reads more
  frantic). Skipped during the knockout pose.

## 🟡 Next game-feel candidates (not yet done)
- [x] **Footstep cadence audio synced to the waddle phase.** `_footstep()` fires
      on each waddle foot-plant (phase crossing a multiple of π in `tick`):
      alternating L/R pitch (132/116 Hz), stereo-panned by the pug's screen
      position, slightly louder + brighter during a fart-sprint, with a faint
      scuff tick. Purely cosmetic — does NOT feed `pug.sound`, so sneaking stays
      silent to guards. Verified in-browser: ~3 steps/s, clean L/R alternation,
      no errors.
- [x] **Loot-grab "pop".** On pickup, a quick scale-punch on the pug
      (`pug._grabPop`, eased back to 1 with a squared falloff, composed with the
      waddle squash) plus the loot icon balloons (~1.7×) and fades as it's
      snatched (`lt._popT`), instead of just vanishing. Adds to the existing
      particles/popup/shake. Verified in-browser: loot pop scale peaks ~1.67×,
      render transforms stay balanced, no errors.
- [ ] Guard-cone edge pulse / desaturation as you near its rim, to telegraph
      "you're about to be seen" before the awareness color flips.
- [ ] Controller + touch parity check for the new feel (waddle is render-only so
      it's input-agnostic, but verify joystick movement drives look-ahead too).

## ⚪ Minor / verify
- [ ] `/icon-192.svg` 404s on a repo-root-served instance (file lives in
      `public/` and `dist/`). Confirm it resolves in the deployed Pages build;
      if not, copy the icon to the served root.

## How this was verified
Loaded via local HTTP server in a real browser (Playwright), ran SNEAK IN →
INFILTRATE → movement. Before the fix: canvas fully black (maxBrightness 0) on
HEAD. After: world renders (maxBrightness 750, ~99% of sampled pixels lit), zero
frame errors (only the unrelated favicon 404 remains).
