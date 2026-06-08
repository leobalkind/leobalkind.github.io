import { defineConfig, devices } from '@playwright/test';

// =============================================================================
// Smoke-test config. Serves the PRODUCTION build (vite preview → dist) so the
// tests exercise exactly what gets deployed — the same bundling that turned a
// bare import into a black screen in v2.10.
//
// Local use:   npm run build && npm run test:smoke
// CI:          build runs as its own step; this previews the existing dist.
// =============================================================================

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
