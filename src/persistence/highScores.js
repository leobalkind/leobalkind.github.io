// Shared localStorage-backed high-score store.
// Each game records (kills, time, etc.) and the highest is shown on the
// start/end overlays.
const NS = 'wg:hs:';

export function loadBest(gameId) {
  try {
    const raw = localStorage.getItem(NS + gameId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveBest(gameId, payload) {
  try {
    localStorage.setItem(NS + gameId, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch {}
}

// Submit a run and return { isNewBest, prev, current } where current is whatever
// got persisted (either the existing record, or the new one if it beat it).
// `compare` is a function(a, b) → -1/0/1; default sorts by .score descending.
export function submitRun(gameId, run, compare = null) {
  const prev = loadBest(gameId);
  const cmp = compare || ((a, b) => (b.score || 0) - (a.score || 0));
  const isNewBest = !prev || cmp(run, prev) < 0;
  if (isNewBest) saveBest(gameId, run);
  return { isNewBest, prev, current: isNewBest ? run : prev };
}
