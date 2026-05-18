import { defineConfig } from 'vite';
import { resolve } from 'path';

// Now a user-page repo (leobalkind.github.io) — serves from root '/'.
// Override with VITE_BASE env var for other hosts if needed.
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
        borkBattle: resolve(__dirname, 'games/bork-battle/index.html'),
        pugfort: resolve(__dirname, 'games/pugfort/index.html'),
        pugSnake: resolve(__dirname, 'games/pug-snake/index.html'),
        boopSnoot: resolve(__dirname, 'games/boop-snoot/index.html'),
        pugWhisperer: resolve(__dirname, 'games/pug-whisperer/index.html'),
        tongueStretch: resolve(__dirname, 'games/tongue-stretch/index.html'),
        borkSimon: resolve(__dirname, 'games/bork-simon/index.html'),
        tummySumo: resolve(__dirname, 'games/tummy-sumo/index.html'),
        borkEcho: resolve(__dirname, 'games/bork-echo/index.html'),
        meltPug: resolve(__dirname, 'games/melt-pug/index.html'),
        buttBumper: resolve(__dirname, 'games/butt-bumper/index.html'),
        pugTraffic: resolve(__dirname, 'games/pug-traffic/index.html'),
        snootGauntlet: resolve(__dirname, 'games/snoot-gauntlet/index.html'),
      },
    },
  },
}));
