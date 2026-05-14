import { CONFIG } from "../config.js";
import { randomRange } from "../utils/math.js";

class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 1;
    this.color = "#ffffff";
  }
}

export class ParticleSystem {
  constructor() {
    const size = CONFIG.PARTICLES.POOL_SIZE;
    this.pool = new Array(size);
    this.free = new Array(size);

    for (let i = 0; i < size; i += 1) {
      this.pool[i] = new Particle();
      this.free[i] = i;
    }

    this.freeTop = size;
  }

  spawn(x, y, vx, vy, life, size, color) {
    if (this.freeTop <= 0) return;

    this.freeTop -= 1;
    const index = this.free[this.freeTop];
    const p = this.pool[index];

    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = life;
    p.maxLife = life;
    p.size = size;
    p.color = color;
  }

  emitExplosion(x, y, count, color = "#ff3a3a", speedMin = 90, speedMax = 320) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomRange(speedMin, speedMax);
      const life = randomRange(0.18, 0.54);
      const size = randomRange(1.4, 2.8);

      this.spawn(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, life, size, color);
    }
  }

  update(dt) {
    for (let i = 0; i < this.pool.length; i += 1) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        this.free[this.freeTop] = i;
        this.freeTop += 1;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.vx *= 0.985;
      p.vy *= 0.985;
    }
  }
}
