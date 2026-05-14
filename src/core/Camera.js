import { CONFIG } from "../config.js";
import { randomRange } from "../utils/math.js";

export class Camera {
  constructor() {
    this.trauma = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  update(dt) {
    this.trauma = Math.max(0, this.trauma - CONFIG.CAMERA.TRAUMA_DECAY * dt);

    const shake = this.trauma * this.trauma * CONFIG.CAMERA.MAX_SHAKE;
    this.offsetX = randomRange(-1, 1) * shake;
    this.offsetY = randomRange(-1, 1) * shake;
  }
}
