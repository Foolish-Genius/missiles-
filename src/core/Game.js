import { CONFIG } from "../config.js";
import { Player } from "../entities/Player.js";
import { Camera } from "./Camera.js";
import { Input } from "./Input.js";
import { CollisionSystem } from "../systems/CollisionSystem.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
import { RenderSystem } from "../systems/RenderSystem.js";
import { Spawner } from "../systems/Spawner.js";
import { SoundSystem } from "../systems/SoundSystem.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!this.ctx) {
      this.ctx = canvas.getContext("2d");
    }
    if (!this.ctx) {
      throw new Error("Canvas rendering context not available.");
    }

    this.input = new Input(window, canvas);
    this.camera = new Camera();
    this.spawner = new Spawner();
    this.particleSystem = new ParticleSystem();
    this.soundSystem = new SoundSystem();

    this.worldWidth = 0;
    this.worldHeight = 0;

    this.player = new Player(0, 0);
    this.missiles = [];
    this.stars = [];
    this.starSpawnTimer = 0;
    this.starsCollected = 0;
    this.bestScore = 0;

    this.renderer = new RenderSystem(this.ctx, this);

    this.state = "menu";
    this.mode = "normal";
    this.mobileControlMode = null;
    this.elapsed = 0;
    this.score = 0;
    this.destroyedMissiles = 0;
    this.nearMisses = 0;
    this.missileCap = CONFIG.DIFFICULTY.MISSILE_CAP_START;
    this.soundEnabled = true;

    this.lastFrameTime = 0;
    this.rafId = 0;

    this.loop = this.loop.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.setupMobileHooks();
    this.handleResize();
    this.reset(true);
  }

  setupMobileHooks() {
    // Placeholder for touch controls so mobile steering can be added later.
    this.canvas.addEventListener("pointercancel", () => this.input.setVirtualTurnAxis(0));
    this.canvas.addEventListener("pointerup", () => this.input.setVirtualTurnAxis(0));
  }

  start() {
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.handleResize);
    this.input.destroy();
  }

  reset(toMenu = false) {
    this.state = toMenu ? "menu" : "running";
    this.elapsed = 0;
    this.score = 0;
    this.destroyedMissiles = 0;
    this.nearMisses = 0;
    this.starsCollected = 0;
    this.starSpawnTimer = 0;
    this.missileCap = CONFIG.DIFFICULTY.MISSILE_CAP_START;

    this.missiles.length = 0;
    this.stars.length = 0;
    this.spawner.reset();

    this.player.reset(0, 0);

    this.ctx.fillStyle = "#05070b";
    this.ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);
  }

  toggleMode() {
    this.mode = this.mode === "normal" ? "fast" : "normal";
  }

  normalizeAngle(angle) {
    let a = angle;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  handleResize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.worldWidth = width;
    this.worldHeight = height;
  }

  loop(timestamp) {
    const rawDt = (timestamp - this.lastFrameTime) / 1000;
    const dt = Math.min(CONFIG.MAX_DT, Math.max(0, rawDt));
    this.lastFrameTime = timestamp;

    this.handleSystemInput();

    if (this.state === "running") {
      this.update(dt);
    } else {
      this.camera.update(dt);
      this.particleSystem.update(dt);
    }

    this.render();
    this.input.endFrame();
    this.rafId = requestAnimationFrame(this.loop);
  }

  handleSystemInput() {
    if (this.input.wasPressed("toggleMode") && this.state !== "running") {
      this.toggleMode();
    }

    if (this.input.wasPressed("nextPlane") && this.state !== "running") {
      this.player.nextPlane();
    }

    if (this.input.wasPressed("toggleSound")) {
      this.soundEnabled = !this.soundEnabled;
      this.soundSystem.setEnabled(this.soundEnabled);
      this.soundSystem.playModeToggle();
    }

    if (this.input.wasPressed("pause") && this.state !== "menu" && this.state !== "gameover") {
      this.state = this.state === "paused" ? "running" : "paused";
    }

    if (this.input.wasPressed("restart")) {
      if (this.state === "menu") {
        if (this.isMobile() && !this.mobileControlMode) {
          this.state = "controlselect";
        } else {
          this.reset(false);
        }
      } else if (this.state === "gameover") {
        if (this.isMobile() && !this.mobileControlMode) {
          this.state = "controlselect";
        } else {
          this.reset(false);
        }
      }
    }

    if (this.state === "controlselect" && this.input.wasPressed("restart")) {
      if (this.mobileControlMode) {
        this.reset(false);
      }
    }
  }

  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  setMobileControlMode(mode) {
    this.mobileControlMode = mode;
  }

  update(dt) {
    this.elapsed += dt;

    const mode = CONFIG.MODES[this.mode];
    const baseCap = CONFIG.DIFFICULTY.MISSILE_CAP_START * mode.missileCapMultiplier;
    const capGrowth = CONFIG.DIFFICULTY.MISSILE_CAP_GROWTH * mode.missileCapMultiplier;
    this.missileCap = Math.floor(
      Math.min(
        CONFIG.DIFFICULTY.MISSILE_CAP_MAX,
        baseCap + this.elapsed * capGrowth
      )
    );

    this.spawner.update(dt, this);

    let turnAxis = this.input.getTurnAxis();
    const pointerAngle = this.input.getPointerAngle();
    
    if (pointerAngle !== null) {
      const angleDiff = this.normalizeAngle(pointerAngle - this.player.angle);
      const maxTurn = CONFIG.PLAYER.TURN_SPEED * dt;
      const pointerTurn = Math.max(-1, Math.min(1, angleDiff / (maxTurn || 1)));
      turnAxis = Math.max(-1, Math.min(1, turnAxis + pointerTurn * 0.6));
    }

    const speedMult = mode.playerSpeedMultiplier || 1;
    this.player.update(dt, turnAxis, speedMult);
    const missileSpeedScale = (1 + this.elapsed * 0.012) * mode.missileSpeedMultiplier;
    for (let i = 0; i < this.missiles.length; i += 1) {
      this.missiles[i].update(dt, this.player, missileSpeedScale);
    }

    this.updateStars(dt);

    this.particleSystem.update(dt);
    this.camera.update(dt);

    const nearMissCount = CollisionSystem.awardNearMisses(this.player, this.missiles);
    if (nearMissCount > 0) {
      this.nearMisses += nearMissCount;
      this.score += nearMissCount * CONFIG.SCORING.NEAR_MISS_BONUS * mode.scoreMultiplier;
      for (let i = 0; i < nearMissCount; i++) {
        this.soundSystem.playNearMiss();
      }
    }

    const destroyedByCollision = CollisionSystem.checkMissileCollisions(
      this.missiles,
      this.particleSystem,
      this.camera
    );

    if (destroyedByCollision > 0) {
      this.destroyedMissiles += destroyedByCollision;
      this.score += destroyedByCollision * CONFIG.SCORING.DESTROY_BONUS * mode.scoreMultiplier;
      this.compactMissiles();
      for (let i = 0; i < destroyedByCollision; i++) {
        this.soundSystem.playDestruction();
      }
    }

    const hitMissile = CollisionSystem.checkPlayerHit(this.player, this.missiles);
    if (hitMissile) {
      this.player.alive = false;
      this.state = "gameover";
      this.bestScore = Math.max(this.bestScore, Math.floor(this.score));
      this.soundSystem.playGameOver();
      this.particleSystem.emitExplosion(
        this.player.pos.x,
        this.player.pos.y,
        CONFIG.PARTICLES.EXPLOSION_COUNT,
        "#ffffff",
        120,
        360
      );
      this.particleSystem.emitExplosion(
        this.player.pos.x,
        this.player.pos.y,
        CONFIG.PARTICLES.EXPLOSION_COUNT,
        "#ff4f4f",
        90,
        300
      );
    }

    this.score += dt * CONFIG.SCORING.SURVIVAL_PER_SEC * mode.scoreMultiplier;
  }

  updateStars(dt) {
    this.starSpawnTimer -= dt;

    if (this.starSpawnTimer <= 0 && this.stars.length < CONFIG.STARS.MAX_ACTIVE) {
      this.spawnStar();
      this.starSpawnTimer = CONFIG.STARS.SPAWN_INTERVAL;
    }

    const pickupRadius = this.player.radius + CONFIG.STARS.RADIUS;
    const pickupSq = pickupRadius * pickupRadius;
    const maxDistSq = CONFIG.STARS.DESPAWN_DISTANCE * CONFIG.STARS.DESPAWN_DISTANCE;

    for (let i = this.stars.length - 1; i >= 0; i -= 1) {
      const star = this.stars[i];
      const dx = star.x - this.player.pos.x;
      const dy = star.y - this.player.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= pickupSq) {
        this.stars.splice(i, 1);
        this.starsCollected += 1;
        this.score += CONFIG.SCORING.STAR_BONUS * CONFIG.MODES[this.mode].scoreMultiplier;
        this.particleSystem.emitExplosion(star.x, star.y, 10, "#ffcc48", 40, 140);
        this.soundSystem.playStarPickup();
        continue;
      }

      if (distSq > maxDistSq) {
        this.stars.splice(i, 1);
      }
    }
  }

  spawnStar() {
    const margin = 80;
    const x =
      this.player.pos.x +
      (Math.random() - 0.5) * (this.worldWidth - margin * 2) +
      (Math.random() > 0.5 ? margin : -margin);
    const y =
      this.player.pos.y +
      (Math.random() - 0.5) * (this.worldHeight - margin * 2) +
      (Math.random() > 0.5 ? margin : -margin);

    this.stars.push({ x, y, radius: CONFIG.STARS.RADIUS, rotation: Math.random() * Math.PI * 2 });
  }

  compactMissiles() {
    let writeIndex = 0;
    for (let i = 0; i < this.missiles.length; i += 1) {
      const missile = this.missiles[i];
      if (!missile.active || missile.markedForRemoval) continue;
      this.missiles[writeIndex] = missile;
      writeIndex += 1;
    }
    this.missiles.length = writeIndex;
  }

  isVisible(x, y, margin = 80) {
    const sx = x - this.player.pos.x + this.worldWidth * 0.5;
    const sy = y - this.player.pos.y + this.worldHeight * 0.5;

    return (
      sx >= -margin &&
      sy >= -margin &&
      sx <= this.worldWidth + margin &&
      sy <= this.worldHeight + margin
    );
  }

  worldToScreen(x, y) {
    return {
      x: x - this.player.pos.x + this.worldWidth * 0.5,
      y: y - this.player.pos.y + this.worldHeight * 0.5,
    };
  }

  render() {
    this.renderer.render();
  }
}
