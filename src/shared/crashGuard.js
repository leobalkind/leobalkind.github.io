// =============================================================================
// CRASH GUARD — turns a dead black screen into a friendly, actionable overlay.
// =============================================================================
//
// Context: v2.10 of Pug Heist shipped a black-screen crash because an uncaught
// error during boot left the canvas blank with no feedback. This module is the
// runtime safety net: it catches uncaught errors and unhandled promise
// rejections and, instead of a silent black void, shows a small pixel-styled
// card with a clear message, a Reload button, and a "Back to arcade" link.
//
// Usage — just import it once, as early as possible, on every game page:
//
//   <script type="module">import '/src/shared/crashGuard.js';</script>
//
// or from the game's entry module:
//
//   import '/src/shared/crashGuard.js';
//
// It is import-idempotent (installing twice is a no-op). It styles itself inline
// so it still works even if the page's CSS failed to load. It deliberately does
// NOT swallow errors — they still reach the console for debugging; it only adds
// a human-facing fallback on top.
// =============================================================================

const FLAG = '__borkadeCrashGuard';

function alreadyInstalled() {
  try { return !!window[FLAG]; } catch { return false; }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function showOverlay(message, detail) {
  // Only ever show one overlay, even if many errors fire.
  if (document.getElementById('borkade-crash')) return;

  const wrap = document.createElement('div');
  wrap.id = 'borkade-crash';
  wrap.setAttribute('role', 'alertdialog');
  wrap.setAttribute('aria-label', 'Something broke');
  wrap.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483647',
    'display:flex', 'align-items:center', 'justify-content:center',
    'background:rgba(8,4,20,0.92)', 'backdrop-filter:blur(3px)',
    'font-family:system-ui,sans-serif', 'color:#e8ecff', 'padding:20px',
  ].join(';');

  const safeMsg = escapeHtml(message || 'An unexpected error happened.');
  const safeDetail = detail ? escapeHtml(detail) : '';

  wrap.innerHTML = `
    <div style="max-width:420px;width:100%;background:#140a2e;border:2px solid #ff3aa1;
                border-radius:14px;padding:22px 22px 18px;box-shadow:0 0 0 4px rgba(255,58,161,0.15)">
      <div style="font-size:34px;line-height:1;margin-bottom:10px">🐶💥</div>
      <h2 style="margin:0 0 6px;font-size:18px;color:#ff3aa1;letter-spacing:0.5px">BORK. Something broke.</h2>
      <p style="margin:0 0 14px;font-size:13px;line-height:1.5;color:#b9c0e6">
        This game hit a snag and stopped. It's not your fault — a reload usually fixes it.
      </p>
      <p style="margin:0 0 16px;font-size:12px;line-height:1.4;color:#7e86b8;
                background:#0b0620;border:1px solid #2a2150;border-radius:8px;padding:8px 10px;
                word-break:break-word;max-height:96px;overflow:auto">${safeMsg}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button id="borkade-crash-reload" style="flex:1;min-width:120px;cursor:pointer;
                background:#ff3aa1;color:#fff;border:0;border-radius:9px;padding:11px 14px;
                font-size:14px;font-weight:700">↻ Reload game</button>
        <a id="borkade-crash-home" href="/" style="flex:1;min-width:120px;text-align:center;
                text-decoration:none;background:#241a47;color:#cdd3f5;border:1px solid #3a2f66;
                border-radius:9px;padding:11px 14px;font-size:14px;font-weight:700">← Back to arcade</a>
      </div>
      ${safeDetail ? `<details style="margin-top:12px;font-size:11px;color:#6b73a3">
        <summary style="cursor:pointer">Technical details</summary>
        <pre style="white-space:pre-wrap;word-break:break-word;margin:8px 0 0;max-height:140px;overflow:auto">${safeDetail}</pre>
      </details>` : ''}
    </div>`;

  const mount = () => {
    if (!document.body) { setTimeout(mount, 30); return; }
    document.body.appendChild(wrap);
    const reload = document.getElementById('borkade-crash-reload');
    if (reload) reload.addEventListener('click', () => location.reload());
  };
  mount();
}

function install() {
  if (typeof window === 'undefined' || alreadyInstalled()) return;
  try { window[FLAG] = true; } catch { /* ignore */ }

  window.addEventListener('error', (e) => {
    // Ignore resource-load errors (e.g. a missing image) — those don't blank
    // the game and shouldn't trigger a full-screen takeover.
    if (e && e.target && e.target !== window && (e.target.tagName === 'IMG' ||
        e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) return;
    const err = e && e.error;
    const msg = (err && err.message) || (e && e.message) || 'Unknown error';
    const stack = err && err.stack ? String(err.stack) : '';
    showOverlay(msg, stack);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e && e.reason;
    const msg = (reason && reason.message) || String(reason || 'Unhandled promise rejection');
    const stack = reason && reason.stack ? String(reason.stack) : '';
    showOverlay(msg, stack);
  });
}

// Manual trigger, handy for testing the overlay or for catching errors in code
// that swallows its own exceptions.
export function reportCrash(error) {
  const msg = (error && error.message) || String(error || 'Manual crash report');
  const stack = error && error.stack ? String(error.stack) : '';
  showOverlay(msg, stack);
}

export { install as installCrashGuard };

// Auto-install on import so a single `import '.../crashGuard.js'` is enough.
install();
