import { CONFIG } from "../config.js";
import { clamp, normalizeAngle } from "../utils/math.js";

let missileId = 0;

export class Missile {
  constructor(x, y, angle, speed, turnRate) {
    this.id = missileId += 1;
    this.pos = { x, y };
    this.vel = { x: 0, y: 0 };
    this.angle = angle;

    this.baseSpeed = speed;
    this.turnRate = turnRate;
    this.radius = CONFIG.MISSILE.RADIUS;

    this.active = true;
    this.markedForRemoval = false;
    this.nearMissTimer = 0;

    this.trail = [];
    this.trailTimer = 0;
  }

  update(dt, target, speedScale) {
    if (!this.active) return;

    const desired = Math.atan2(target.pos.y - this.pos.y, target.pos.x - this.pos.x);
    const delta = normalizeAngle(desired - this.angle);
    const maxTurn = this.turnRate * dt;
    this.angle += clamp(delta, -maxTurn, maxTurn);

    const speed = this.baseSpeed * speedScale;
    this.vel.x = Math.cos(this.angle) * speed;
    this.vel.y = Math.sin(this.angle) * speed;

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    this.nearMissTimer = Math.max(0, this.nearMissTimer - dt);

    this.trailTimer += dt;
    if (this.trailTimer >= CONFIG.MISSILE.TRAIL_INTERVAL) {
      this.trailTimer = 0;
      this.trail.push({ x: this.pos.x, y: this.pos.y });
      if (this.trail.length > CONFIG.MISSILE.TRAIL_LENGTH) {
        this.trail.shift();
      }
    }
  }

  destroy() {
    this.active = false;
    this.markedForRemoval = true;
  }
}
