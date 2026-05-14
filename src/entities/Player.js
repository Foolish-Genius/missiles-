import { CONFIG } from "../config.js";

export class Player {
  constructor(x, y) {
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.angle = -Math.PI / 2;
    this.radius = CONFIG.PLAYER.RADIUS;
    this.alive = true;
    this.planeIndex = 0;

    this.trail = [];
    this.trailTimer = 0;
  }

  reset(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.vel.x = 0;
    this.vel.y = 0;
    this.angle = -Math.PI / 2;
    this.alive = true;
    this.trail.length = 0;
    this.trailTimer = 0;
  }

  nextPlane() {
    this.planeIndex = (this.planeIndex + 1) % CONFIG.PLANES.length;
  }

  update(dt, turnAxis, speedMult = 1) {
    this.angle += turnAxis * CONFIG.PLAYER.TURN_SPEED * dt;

    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    this.vel.x = forwardX * CONFIG.PLAYER.SPEED * speedMult;
    this.vel.y = forwardY * CONFIG.PLAYER.SPEED * speedMult;

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    this.trailTimer += dt;
    if (this.trailTimer >= CONFIG.PLAYER.TRAIL_INTERVAL) {
      this.trailTimer = 0;
      this.trail.push({ x: this.pos.x, y: this.pos.y });
      if (this.trail.length > CONFIG.PLAYER.TRAIL_LENGTH) {
        this.trail.shift();
      }
    }
  }
}
