// Shared localStorage-backed high-score store.
// Each game records (kills, time, etc.) and the highest is shown on the
// start/end overlays.
//
// Profile-aware: if a profile is active (via src/shared/profile.js), keys are
// scoped under `wg:p:<profileId>:hs:<gameId>`. Falls back to legacy `wg:hs:*`
// when no profile is logged in (guest mode).

function _key(gameId) {
  let activeId = null;
  try { activeId = localStorage.getItem('wg:profiles:active'); } catch {}
  return activeId ? `wg:p:${activeId}:hs:${gameId}` : `wg:hs:${gameId}`;
}

export function loadBest(gameId) {
  try {
    const raw = localStorage.getItem(_key(gameId));
    if (raw) return JSON.parse(raw);
    // Fallback: if profile-scoped key missing, try legacy un-prefixed (helps if
    // a player created a profile after already playing as guest).
    const legacy = localStorage.getItem('wg:hs:' + gameId);
    return legacy ? JSON.parse(legacy) : null;
  } catch { return null; }
}

export function saveBest(gameId, payload) {
  try {
    localStorage.setItem(_key(gameId), JSON.stringify({ ...payload, ts: Date.now() }));
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
