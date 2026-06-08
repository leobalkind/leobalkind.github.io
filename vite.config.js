import { defineConfig } from 'vite';
import { resolve } from 'path';
import { GAMES } from './src/shared/games.js';

// Now a user-page repo (leobalkind.github.io) — serves from root '/'.
// Override with VITE_BASE env var for other hosts if needed.
//
// The per-game build inputs are derived from the games registry
// (src/shared/games.js) so adding a game means editing ONE list, not this file
// too. `viteKey` is the rollup chunk name; `path` is '/games/<id>/index.html'.
const gameInputs = Object.fromEntries(
  GAMES.map((g) => [g.viteKey, resolve(__dirname, g.path.replace(/^\//, ''))])
);

export default defineConfig(({ command }) => ({
  root: '.',
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 5173,
    open: true,
    // Allow public tunneling (cloudflared, ngrok, etc.) to forward to dev server
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, 'index.html'),
        ...gameInputs,
      },
    },
  },
}));
