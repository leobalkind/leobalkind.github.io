import { test, expect } from '@playwright/test';
import { GAMES } from '../src/shared/games.js';

// =============================================================================
// SMOKE SUITE — boots the hub and every game's built page and FAILS the deploy
// if any of them throws an uncaught error or logs an error during the first few
// seconds of boot. This is the gate that would have caught the v2.10 Pug Heist
// black-screen crash before it ever reached players.
//
// It is intentionally shallow (does not play the games) but broad (covers all
// 15 + hub). The single most valuable signal is "did booting this page throw?".
// =============================================================================

// Console noise that is not a real failure. Keep this list tight and explicit.
const IGNORE = [
  /favicon/i,
  /\bAudioContext\b/i,                 // autoplay policy: audio resumes on input
  /play\(\) (request|failed)/i,        // media autoplay gesture requirement
  /The AudioContext was not allowed to start/i,
  /Unable to decode audio data/i,
  /WebGL.*deprecat/i,
  /Slow network is detected/i,
  /\[vite\]/i,
];

function isIgnorable(text) {
  return IGNORE.some((re) => re.test(text));
}

// Attach error collectors to a page and return an array that fills with real
// problems (uncaught exceptions + console.error lines that aren't noise).
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!isIgnorable(text)) errors.push(`console.error: ${text}`);
  });
  return errors;
}

test('hub boots without errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/', { waitUntil: 'load' });
  // The hub should render its game grid.
  await expect(page.locator('a.card').first()).toBeVisible({ timeout: 10_000 });
  const cards = await page.locator('a.card').count();
  expect(cards, 'hub should show all 15 game cards').toBe(GAMES.length);
  await page.waitForTimeout(1500);
  expect(errors, `hub boot errors:\n${errors.join('\n')}`).toEqual([]);
});

test('crash guard installs and shows a friendly overlay (not a black screen)', async ({ page }) => {
  // crashGuard auto-installs on import; uncaught errors here would normally be
  // collected, but this test intentionally triggers one, so don't fail on it.
  await page.goto('/games/pug-heist/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // The guard should have installed its global flag.
  const installed = await page.evaluate(() => !!window.__borkadeCrashGuard);
  expect(installed, 'crash guard should auto-install on import').toBeTruthy();

  // Simulate an uncaught error and confirm the human-facing overlay appears
  // instead of leaving a dead screen.
  await page.evaluate(() => {
    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error('synthetic boot crash'),
      message: 'synthetic boot crash',
    }));
  });
  await expect(page.locator('#borkade-crash')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#borkade-crash-reload')).toBeVisible();
  await expect(page.locator('#borkade-crash-home')).toHaveAttribute('href', '/');
});

for (const game of GAMES) {
  test(`${game.id} boots without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(game.path, { waitUntil: 'load' });

    // Give the game a moment to initialize its renderer / start screen.
    await page.waitForTimeout(2500);

    // A booted game should have SOMETHING on screen: a canvas (most games) or
    // meaningful DOM. A black-screen crash leaves neither + throws — so the
    // error assertion below is the real gate; this is a secondary sanity check.
    const hasCanvas = (await page.locator('canvas').count()) > 0;
    const bodyText = (await page.locator('body').innerText().catch(() => '')) || '';
    const hasContent = hasCanvas || bodyText.trim().length > 0;
    expect(hasContent, `${game.id} rendered nothing (likely a crash)`).toBeTruthy();

    expect(errors, `${game.id} boot errors:\n${errors.join('\n')}`).toEqual([]);
  });
}
