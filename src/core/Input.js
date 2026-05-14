const ACTION_BINDINGS = {
  turnLeft: ["KeyA", "ArrowLeft"],
  turnRight: ["KeyD", "ArrowRight"],
  restart: ["Space"],
  pause: ["Escape"],
  toggleMode: ["KeyM"],
  nextPlane: ["KeyC"],
  toggleSound: ["KeyS"],
  tap: ["Enter"],
};
export class Input {
  constructor(target = window, canvas = null) {
    this.target = target;
    this.canvas = canvas;
    this.keyDown = new Set();
    this.justPressed = new Set();
    this.virtualTurnAxis = 0;
    this.pointerAngle = null;
    this.pointerPos = null;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);

    this.target.addEventListener("keydown", this.onKeyDown, { passive: false });
    this.target.addEventListener("keyup", this.onKeyUp, { passive: false });
    
    if (canvas) {
      canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
      canvas.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
      canvas.addEventListener("click", this.onCanvasClick, { passive: true });
    }
  }

  onKeyDown(event) {
    const { code } = event;
    if (!this.keyDown.has(code)) {
      this.justPressed.add(code);
    }

    if (code in this.codeToActionMap()) {
      event.preventDefault();
    }

    this.keyDown.add(code);
  }

  onKeyUp(event) {
    this.keyDown.delete(event.code);
  }

  codeToActionMap() {
    if (this._codeAction) {
      return this._codeAction;
    }

    this._codeAction = {};
    for (const action of Object.keys(ACTION_BINDINGS)) {
      for (const code of ACTION_BINDINGS[action]) {
        this._codeAction[code] = action;
      }
    }

    return this._codeAction;
  }

  isDown(action) {
    const codes = ACTION_BINDINGS[action] || [];
    for (let i = 0; i < codes.length; i += 1) {
      if (this.keyDown.has(codes[i])) {
        return true;
      }
    }
    return false;
  }

  wasPressed(action) {
    const codes = ACTION_BINDINGS[action] || [];
    for (let i = 0; i < codes.length; i += 1) {
      if (this.justPressed.has(codes[i])) {
        return true;
      }
    }
    return false;
  }

  getTurnAxis() {
    let axis = 0;
    if (this.isDown("turnLeft")) axis -= 1;
    if (this.isDown("turnRight")) axis += 1;

    const virtual = Math.max(-1, Math.min(1, this.virtualTurnAxis));
    const merged = axis + virtual;

    if (merged > 1) return 1;
    if (merged < -1) return -1;
    return merged;
  }

  onPointerMove(event) {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.5;
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;

    this.pointerAngle = Math.atan2(py - centerY, px - centerX);
    this.pointerPos = { x: px, y: py };
  }

  onPointerLeave() {
    this.pointerAngle = null;
    this.pointerPos = null;
  }

  onCanvasClick() {
    this.justPressed.add("Space");
  }

  getPointerAngle() {
    return this.pointerAngle;
  }

  setVirtualTurnAxis(axis) {
    this.virtualTurnAxis = axis;
  }

  endFrame() {
    this.justPressed.clear();
  }

  destroy() {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
      this.canvas.removeEventListener("click", this.onCanvasClick);
    }
  }
}
