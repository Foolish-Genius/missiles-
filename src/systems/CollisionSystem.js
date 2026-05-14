import { CONFIG } from "../config.js";
import { distanceSquared } from "../utils/math.js";

export class CollisionSystem {
  static checkPlayerHit(player, missiles) {
    const r = player.radius + CONFIG.MISSILE.RADIUS;
    const rr = r * r;

    for (let i = 0; i < missiles.length; i += 1) {
      const m = missiles[i];
      if (!m.active) continue;

      if (distanceSquared(player.pos, m.pos) <= rr) {
        return m;
      }
    }

    return null;
  }

  static checkMissileCollisions(missiles, particleSystem, camera) {
    let destroyed = 0;

    for (let i = 0; i < missiles.length; i += 1) {
      const a = missiles[i];
      if (!a.active) continue;

      for (let j = i + 1; j < missiles.length; j += 1) {
        const b = missiles[j];
        if (!b.active) continue;

        const r = a.radius + b.radius;
        if (distanceSquared(a.pos, b.pos) > r * r) continue;

        const x = (a.pos.x + b.pos.x) * 0.5;
        const y = (a.pos.y + b.pos.y) * 0.5;

        a.destroy();
        b.destroy();
        destroyed += 2;

        particleSystem.emitExplosion(
          x,
          y,
          CONFIG.PARTICLES.MISSILE_COLLISION_COUNT,
          "#ff4b4b",
          70,
          220
        );
        break;
      }
    }

    return destroyed;
  }

  static awardNearMisses(player, missiles) {
    let nearMissCount = 0;
    const radius = CONFIG.SCORING.NEAR_MISS_DISTANCE;
    const rr = radius * radius;

    for (let i = 0; i < missiles.length; i += 1) {
      const missile = missiles[i];
      if (!missile.active) continue;
      if (missile.nearMissTimer > 0) continue;

      if (distanceSquared(player.pos, missile.pos) <= rr) {
        missile.nearMissTimer = CONFIG.SCORING.NEAR_MISS_COOLDOWN;
        nearMissCount += 1;
      }
    }

    return nearMissCount;
  }
}
