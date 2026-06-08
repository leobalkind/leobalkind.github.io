// =============================================================================
// SHARE CARD & CHALLENGE LINKS — the Wordle-style viral loop, 100% client-side.
//
// Two halves of the no-backend share loop (IDEA_BANK Vol.4 §V4-5):
//   1. buildShareString() — a copy-pasteable emoji/text "result card" that tells
//      the story of a run (🟩 cleared / 🟥 failed / 🟨 close) WITHOUT a spoiler
//      image and stays under 280 chars so it pastes cleanly anywhere.
//   2. encodeChallenge()/decodeChallenge() — pack a (game, seed) into a URL hash
//      like `#game=heist&seed=214` so "beat this exact run" links load instantly
//      with no server. Round-trips losslessly.
//
// Plus two guarded browser helpers: copyToClipboard() and parseIncomingChallenge()
// (reads location.hash). All browser APIs are feature-guarded so the string- and
// hash-building logic stays pure and Node-importable for tests.
//
//   import { buildShareString, encodeChallenge, decodeChallenge,
//            copyToClipboard, parseIncomingChallenge } from '.../shared/shareCard.js';
//
//   const card = buildShareString({
//     game: 'Pug Heist', index: 214, score: 9400, rank: '🥇',
//     grid: [['🟩','🟩','🟥'], ['🟩','🟨','🟩']],
//   });
//   await copyToClipboard(card);
//
//   location.hash = encodeChallenge({ game: 'heist', seed: 214 });
//   const incoming = parseIncomingChallenge();   // { game, seed } | null
// =============================================================================

// Public site URL used in the share footer / challenge links. No tracking params
// are ever appended (the no-ads/no-tracking promise is itself a virality asset).
export const SHARE_BASE_URL = 'https://borkade.com';

// Hard cap so a card always fits in a tweet / iMessage / Discord line cleanly.
export const MAX_SHARE_CHARS = 280;

// --- result card ------------------------------------------------------------

// Render a 2D emoji grid (array of rows of cells) into newline-joined text.
function _renderGrid(grid) {
  if (!Array.isArray(grid)) return '';
  return grid
    .map((row) => (Array.isArray(row) ? row.join('') : String(row)))
    .join('\n');
}

// Build the shareable result card. Returns a single string, guaranteed ≤280
// chars: lower-priority lines (the grid) are trimmed before the header/footer.
//
//   { game, index, score, rank, grid }
//     game  — display name, e.g. 'Pug Heist'
//     index — daily number, e.g. 214 → "#214" (omit/null for non-daily runs)
//     score — number, formatted with thousands separators
//     rank  — optional crest/emoji or label, e.g. '🥇' or 'S+'
//     grid  — optional 2D array of emoji cells encoding the run
export function buildShareString({ game = 'Borkade', index = null, score = null, rank = null, grid = null } = {}) {
  const title = index != null ? `🐶 Bork Daily #${index} — ${game}` : `🐶 Borkade — ${game}`;

  const statBits = [];
  if (rank != null && rank !== '') statBits.push(String(rank));
  if (score != null) statBits.push(`🦴 ${Number(score).toLocaleString('en-US')}`);
  const statLine = statBits.join('  ');

  const footer = `BORK! ${SHARE_BASE_URL}`;
  const gridText = _renderGrid(grid);

  // Assemble with the grid as the trimmable middle section. Header, stat line,
  // and footer are always kept; the grid is dropped wholesale if it would push
  // the card over the cap (a half-grid would misrepresent the run).
  const head = [title, statLine].filter(Boolean).join('\n');
  const withGrid = [head, gridText, footer].filter(Boolean).join('\n\n');
  if (withGrid.length <= MAX_SHARE_CHARS) return withGrid;

  const noGrid = [head, footer].filter(Boolean).join('\n\n');
  if (noGrid.length <= MAX_SHARE_CHARS) return noGrid;

  // Pathological case (absurdly long game name): hard-truncate as a last resort.
  return noGrid.slice(0, MAX_SHARE_CHARS);
}

// --- challenge links (URL hash round-trip) ----------------------------------

// Encode a challenge as a URL hash fragment, e.g. `#game=heist&seed=214`.
// Returns the fragment INCLUDING the leading '#' so it can be assigned straight
// to location.hash or appended to SHARE_BASE_URL.
export function encodeChallenge({ game, seed } = {}) {
  const params = new URLSearchParams();
  if (game != null) params.set('game', String(game));
  if (seed != null) params.set('seed', String(seed >>> 0));
  return '#' + params.toString();
}

// Full shareable URL for a challenge (base + encoded hash).
export function challengeUrl(challenge) {
  return SHARE_BASE_URL + '/' + encodeChallenge(challenge);
}

// Decode a hash string (with or without a leading '#') back into { game, seed }.
// `seed` comes back as a uint number; missing fields are null. Returns null if
// there is no recognizable challenge data.
export function decodeChallenge(hashString) {
  if (!hashString) return null;
  const raw = String(hashString).replace(/^#/, '');
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const game = params.get('game');
  const seedRaw = params.get('seed');
  if (game == null && seedRaw == null) return null;
  const seed = seedRaw == null ? null : (Number(seedRaw) >>> 0);
  return { game: game ?? null, seed };
}

// --- guarded browser helpers ------------------------------------------------

// Copy text to the clipboard. Guarded for non-browser / insecure-context use;
// falls back to a hidden-textarea execCommand path, then resolves false if no
// method is available. Always resolves a boolean (never throws).
export async function copyToClipboard(text) {
  const str = String(text);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch { /* fall through to legacy path */ }

  try {
    if (typeof document === 'undefined') return false;
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  } catch { return false; }
}

// Read any incoming challenge from the current page URL hash. Guarded so it is
// safe to call under Node (returns null). Use on load to auto-start a friend's
// challenge: const c = parseIncomingChallenge(); if (c) startSeed(c.seed);
export function parseIncomingChallenge() {
  try {
    if (typeof location === 'undefined' || !location.hash) return null;
    return decodeChallenge(location.hash);
  } catch { return null; }
}
