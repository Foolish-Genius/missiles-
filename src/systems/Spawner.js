import { CONFIG } from "../config.js";
import { Missile } from "../entities/Missile.js";
import { randomRange } from "../utils/math.js";

export class Spawner {
  constructor() {
    this.spawnTimer = 0;
  }

  reset() {
    this.spawnTimer = 0;
  }

  update(dt, game) {
    this.spawnTimer -= dt;

    while (this.spawnTimer <= 0) {
      if (game.missiles.length >= game.missileCap) {
        this.spawnTimer = 0.1;
        break;
      }

      this.spawn(game);

      const mode = CONFIG.MODES[game.mode];
      const interval = Math.max(
        CONFIG.SPAWNER.MIN_INTERVAL,
        CONFIG.SPAWNER.START_INTERVAL - game.elapsed * CONFIG.SPAWNER.RAMP_PER_SEC
      );

      this.spawnTimer += interval / mode.spawnRateMultiplier;
    }
  }

  spawn(game) {
    const margin = CONFIG.SPAWNER.OFFSCREEN_MARGIN;
    const halfW = game.worldWidth * 0.5;
    const halfH = game.worldHeight * 0.5;
    const px = game.player.pos.x;
    const py = game.player.pos.y;

    const edge = Math.floor(Math.random() * 4);

    let x = 0;
    let y = 0;

    if (edge === 0) {
      x = randomRange(px - halfW, px + halfW);
      y = py - halfH - margin;
    } else if (edge === 1) {
      x = px + halfW + margin;
      y = randomRange(py - halfH, py + halfH);
    } else if (edge === 2) {
      x = randomRange(px - halfW, px + halfW);
      y = py + halfH + margin;
    } else {
      x = px - halfW - margin;
      y = randomRange(py - halfH, py + halfH);
    }

    const toPlayer = Math.atan2(game.player.pos.y - y, game.player.pos.x - x);
    const angle = toPlayer + randomRange(-0.22, 0.22);

    const speed = CONFIG.MISSILE.BASE_SPEED + game.elapsed * CONFIG.MISSILE.SPEED_GROWTH_PER_SEC;
    const turnRate = CONFIG.MISSILE.BASE_TURN_RATE + game.elapsed * CONFIG.MISSILE.TURN_GROWTH_PER_SEC;

    game.missiles.push(new Missile(x, y, angle, speed, turnRate));
  }
}
