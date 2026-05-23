// Centralized input. Tracks WASD, space, E, mouse position, mouse buttons.
// Optional touchControls (from src/touch/touchControls.js) supplies move/aim/fire
// state on mobile devices; desktop keyboard+mouse takes precedence when active.
export class Input {
  constructor(canvas, touchControls = null, gamepad = null) {
    this.canvas = canvas;
    this.touch = touchControls;
    this.gp = gamepad;
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, screenX: 0, screenY: 0 };
    this.mouseDown = false;
    this._spaceJustReleased = false;
    this._spaceDown = false;
    this._eJustPressed = false;
    this._qJustPressed = false;
    this._rJustPressed = false;
    // Touch button hooks — set by main.js so the 3 ability buttons can
    // virtually "press" E/Q/R without us caring whether it was keyboard or DOM.
    this._touchEJustPressed = false;
    this._touchQJustPressed = false;
    this._touchRJustPressed = false;

    // Normalize arrow keys → wasd so moveVector() can stay simple
    const norm = (k) => ({ arrowup: 'w', arrowdown: 's', arrowleft: 'a', arrowright: 'd' }[k] || k);
    window.addEventListener('keydown', (e) => {
      const raw = e.key.toLowerCase();
      const k = norm(raw);
      const isSpace = e.code === 'Space' || k === ' ';
      if (['w','a','s','d','e','q','r','m','b'].includes(k) || isSpace) e.preventDefault();
      if (isSpace) {
        if (!this._spaceDown) this._spaceJustPressed = true;
        this._spaceDown = true;
      }
      if (k === 'e' && !this.keys.has('e')) {
        this._eJustPressed = true;
      }
      if (k === 'q' && !this.keys.has('q')) {
        this._qJustPressed = true;
      }
      if (k === 'r' && !this.keys.has('r')) {
        this._rJustPressed = true;
      }
      this.keys.add(k);
    });
    window.addEventListener('keyup', (e) => {
      const raw = e.key.toLowerCase();
      const k = norm(raw);
      const isSpace = e.code === 'Space' || k === ' ';
      if (isSpace) {
        this._spaceJustReleased = true;
        this._spaceDown = false;
      }
      this.keys.delete(k);
    });
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.screenX = e.clientX - rect.left;
      this.mouse.screenY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousedown', () => { this.mouseDown = true; });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Movement direction — keyboard → gamepad → touch joystick.
  moveVector() {
    let x = 0, y = 0;
    if (this.keys.has('w')) y -= 1;
    if (this.keys.has('s')) y += 1;
    if (this.keys.has('a')) x -= 1;
    if (this.keys.has('d')) x += 1;
    if (x !== 0 || y !== 0) {
      const len = Math.hypot(x, y);
      return { x: x / len, y: y / len };
    }
    if (this.gp?.connected && (this.gp.move.x || this.gp.move.y)) {
      return this.gp.move;
    }
    if (this.touch?.enabled) return this.touch.getMove();
    return { x: 0, y: 0 };
  }

  // Aim vector — gamepad right stick OR touch right stick; null otherwise.
  touchAim() {
    if (this.gp?.connected && this.gp.aim) return this.gp.aim;
    return this.touch?.enabled ? this.touch.getAim() : null;
  }

  isFiring() {
    if (this.mouseDown) return true;
    if (this.gp?.connected && this.gp.firing) return true;
    return this.touch?.enabled && this.touch.isFiring();
  }

  // Call once per frame after reading
  postUpdate() {
    this._spaceJustReleased = false;
    this._spaceJustPressed = false;
    this._eJustPressed = false;
    this._qJustPressed = false;
    this._rJustPressed = false;
    this._touchEJustPressed = false;
    this._touchQJustPressed = false;
    this._touchRJustPressed = false;
  }

  spaceDown() {
    if (this._spaceDown) return true;
    if (this.gp?.connected && this.gp.abilityDown) return true;
    return this.touch?.enabled && this.touch.abilityDown;
  }
  spaceJustReleased() {
    if (this._spaceJustReleased) return true;
    return this.touch?.enabled && this.touch.consumeAbilityReleased();
  }
  spaceJustPressed() {
    if (this._spaceJustPressed) return true;
    if (this.gp?.connected && this.gp.justAbility) return true;
    return this.touch?.enabled && this.touch.consumeAbilityPressed();
  }
  eJustPressed() { return this._eJustPressed || this._touchEJustPressed; }
  qJustPressed() { return this._qJustPressed || this._touchQJustPressed; }
  rJustPressed() { return this._rJustPressed || this._touchRJustPressed; }
  // Touch button hooks — called by main.js when DOM ability buttons fire.
  triggerTouchE() { this._touchEJustPressed = true; }
  triggerTouchQ() { this._touchQJustPressed = true; }
  triggerTouchR() { this._touchRJustPressed = true; }
}
