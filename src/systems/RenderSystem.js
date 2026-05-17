import { CONFIG } from "../config.js";

export class RenderSystem {
  constructor(ctx, game) {
    this.ctx = ctx;
    this.game = game;
  }

  render() {
    const { ctx, game } = this;

    ctx.save();
    ctx.fillStyle = `rgba(3, 6, 11, ${CONFIG.WORLD_FADE_ALPHA})`;
    ctx.fillRect(0, 0, game.worldWidth, game.worldHeight);
    ctx.restore();

    ctx.save();
    ctx.translate(game.camera.offsetX, game.camera.offsetY);

    this.drawGrid();
    this.drawStars();
    this.drawPlayerTrail();
    this.drawMissileTrails();
    this.drawParticles();
    this.drawMissiles();
    this.drawPlayer();

    ctx.restore();

    this.drawHud();
    this.drawStateOverlay();
  }

  toScreen(world) {
    return this.game.worldToScreen(world.x, world.y);
  }

  drawGrid() {
    const { ctx, game } = this;

    const spacing = 96;
    const cx = game.player.pos.x;
    const cy = game.player.pos.y;
    const left = cx - game.worldWidth * 0.5;
    const right = cx + game.worldWidth * 0.5;
    const top = cy - game.worldHeight * 0.5;
    const bottom = cy + game.worldHeight * 0.5;

    const startX = Math.floor(left / spacing) * spacing;
    const startY = Math.floor(top / spacing) * spacing;

    ctx.save();
    ctx.strokeStyle = "rgba(94, 124, 208, 0.05)";
    ctx.lineWidth = 1;

    for (let x = startX; x <= right; x += spacing) {
      const sx = x - cx + game.worldWidth * 0.5;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, game.worldHeight);
      ctx.stroke();
    }

    for (let y = startY; y <= bottom; y += spacing) {
      const sy = y - cy + game.worldHeight * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(game.worldWidth, sy);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawStars() {
    const { ctx, game } = this;

    for (let i = 0; i < game.stars.length; i += 1) {
      const star = game.stars[i];
      if (!game.isVisible(star.x, star.y, 16)) continue;
      const p = this.toScreen(star);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(star.rotation);
       ctx.shadowColor = "rgba(255, 201, 86, 0.3)";
       ctx.shadowBlur = 4;
      ctx.fillStyle = "#f4b330";
      ctx.beginPath();
       for (let j = 0; j < 10; j += 1) {
         const a = -Math.PI / 2 + (j * Math.PI * 2) / 5;
         const r = j % 2 === 0 ? star.radius : star.radius * 0.5;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      star.rotation += 0.06;
    }
  }

  drawPlayerTrail() {
    const { ctx, game } = this;
    const trail = game.player.trail;
    if (trail.length < 2) return;

    for (let i = 1; i < trail.length; i += 1) {
      const p0 = this.toScreen(trail[i - 1]);
      const p1 = this.toScreen(trail[i]);
      const alpha = i / trail.length;

       ctx.strokeStyle = `rgba(235, 245, 255, ${alpha * 0.12})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
  }

  drawMissileTrails() {
    const { ctx, game } = this;

    for (let i = 0; i < game.missiles.length; i += 1) {
      const missile = game.missiles[i];
      if (!missile.active) continue;

      const trail = missile.trail;
      if (trail.length < 2) continue;

      for (let t = 1; t < trail.length; t += 1) {
        const p0 = this.toScreen(trail[t - 1]);
        const p1 = this.toScreen(trail[t]);
        const alpha = t / trail.length;
         ctx.strokeStyle = `rgba(255, 66, 66, ${alpha * 0.12})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
  }

  drawParticles() {
    const { ctx, game } = this;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const pool = game.particleSystem.pool;
    for (let i = 0; i < pool.length; i += 1) {
      const p = pool[i];
      if (!p.active) continue;
      if (!game.isVisible(p.x, p.y, 30)) continue;

      const s = this.toScreen(p);
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawPlayer() {
    const { ctx, game } = this;
    const player = game.player;

    if (!player.alive) return;

    const style = CONFIG.PLANES[player.planeIndex];

    ctx.save();
    ctx.translate(game.worldWidth * 0.5, game.worldHeight * 0.5);
    ctx.rotate(player.angle + Math.PI / 2);

    ctx.shadowColor = style.glow;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = style.body;
    ctx.fillStyle = style.wing;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(8, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.stroke();

    ctx.globalAlpha = 0.9;
    ctx.fillRect(-8, 2.5, 16, 2.2);
    ctx.fillRect(-1.3, 9, 2.6, 6);

    ctx.restore();
  }

  drawMissiles() {
    const { ctx, game } = this;

    for (let i = 0; i < game.missiles.length; i += 1) {
      const missile = game.missiles[i];
      if (!missile.active) continue;
      if (!game.isVisible(missile.pos.x, missile.pos.y, 24)) continue;

      const p = this.toScreen(missile.pos);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(missile.angle);

       ctx.shadowColor = "rgba(255, 64, 64, 0.2)";
       ctx.shadowBlur = 2;
      ctx.fillStyle = "#ff3f3f";
      ctx.beginPath();
       ctx.moveTo(8, 0);
       ctx.lineTo(-5, 4);
       ctx.lineTo(-5, -4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  drawHudPill(x, y, w, h, label, value) {
    const { ctx } = this;
    const r = h * 0.5;

    ctx.fillStyle = "rgba(6, 13, 24, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(150, 172, 212, 0.9)";
    ctx.font = "600 11px Trebuchet MS";
    ctx.textBaseline = "top";
    ctx.fillText(label, x + 11, y + 7);

    ctx.fillStyle = "rgba(242, 246, 255, 0.96)";
    ctx.font = "700 16px Trebuchet MS";
    ctx.fillText(String(value), x + 11, y + 20);
  }

  drawHud() {
    const { ctx, game } = this;

    const compact = game.worldWidth < 620;
    const pillW = compact ? Math.floor((game.worldWidth - 40) / 3) : 116;
    const pillH = compact ? 42 : 48;
    const gap = compact ? 6 : 8;
    const x0 = 14;
    const y0 = 12;

    ctx.save();
    this.drawHudPill(x0, y0, pillW, pillH, "TIME", game.elapsed.toFixed(1));
    this.drawHudPill(x0 + pillW + gap, y0, pillW, pillH, "SCORE", Math.floor(game.score));
    this.drawHudPill(x0 + (pillW + gap) * 2, y0, pillW, pillH, "STARS", game.starsCollected);

    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(202, 214, 242, 0.92)";
    ctx.font = compact ? "600 11px Trebuchet MS" : "600 12px Trebuchet MS";
    const modeLabel = CONFIG.MODES[game.mode].label;
    const planeLabel = CONFIG.PLANES[game.player.planeIndex].label;
    ctx.fillText(`MODE ${modeLabel} | PLANE ${planeLabel}`, game.worldWidth - 14, compact ? 58 : 14);

    ctx.fillStyle = "rgba(163, 180, 216, 0.9)";
    const controlText = compact ? "A/D or Click Turn" : "A/D or Click/Drag to Aim";
    ctx.fillText(controlText, game.worldWidth - 14, compact ? 73 : 31);

     const soundLabel = game.soundEnabled ? "SND ON" : "SND OFF";
     const soundColor = game.soundEnabled ? "rgba(120, 255, 120, 0.9)" : "rgba(255, 120, 120, 0.9)";
     ctx.fillStyle = soundColor;
     ctx.font = compact ? "600 10px Trebuchet MS" : "600 11px Trebuchet MS";
     ctx.fillText(`${soundLabel} (S)`, game.worldWidth - 14, compact ? 88 : 48);

    ctx.restore();
  }

  drawStateOverlay() {
    const { ctx, game } = this;
    if (game.state === "running") return;

    ctx.save();
    ctx.fillStyle = "rgba(2, 4, 8, 0.66)";
    ctx.fillRect(0, 0, game.worldWidth, game.worldHeight);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (game.state === "menu") {
      const compact = game.worldWidth < 760;
      const titleY = compact ? game.worldHeight * 0.24 : game.worldHeight * 0.30;
      const subtitleY = titleY + (compact ? 44 : 48);

      ctx.font = compact ? "800 46px Trebuchet MS" : "800 64px Trebuchet MS";
      ctx.fillStyle = "rgba(248, 250, 255, 0.98)";
      ctx.fillText("Missile++", game.worldWidth * 0.5, titleY);
      ctx.font = compact ? "700 15px Trebuchet MS" : "700 18px Trebuchet MS";
      ctx.fillStyle = "rgba(215, 227, 255, 0.95)";
      ctx.fillText("Mission: To delay death", game.worldWidth * 0.5, subtitleY);
      ctx.fillText("Tap to Start  |  M Toggle Mode  |  C Change Plane", game.worldWidth * 0.5, game.worldHeight * 0.47);
      ctx.fillText("A/D or Click/Drag to aim", game.worldWidth * 0.5, game.worldHeight * 0.51);
      ctx.fillText(`Mode ${CONFIG.MODES[game.mode].label}`, game.worldWidth * 0.5, game.worldHeight * 0.54);
      ctx.fillText(`Plane ${CONFIG.PLANES[game.player.planeIndex].label}`, game.worldWidth * 0.5, game.worldHeight * 0.58);
      if (game.bestScore > 0) {
        ctx.fillStyle = "rgba(255, 216, 140, 0.95)";
        ctx.fillText(`Best ${game.bestScore}`, game.worldWidth * 0.5, game.worldHeight * 0.63);
      }
    }

    if (game.state === "gameover") {
      const compact = game.worldWidth < 760;
      ctx.font = compact ? "700 46px Trebuchet MS" : "700 52px Trebuchet MS";
      ctx.fillText("DESTROYED", game.worldWidth * 0.5, game.worldHeight * 0.42);
      ctx.font = compact ? "700 20px Trebuchet MS" : "700 24px Trebuchet MS";
      ctx.fillStyle = "rgba(255, 76, 76, 0.95)";
      ctx.fillText(`Final Score ${Math.floor(game.score)}`, game.worldWidth * 0.5, game.worldHeight * 0.5);
      ctx.fillStyle = "rgba(245, 210, 120, 0.95)";
      ctx.fillText(`Stars ${game.starsCollected}`, game.worldWidth * 0.5, game.worldHeight * 0.55);
      ctx.font = compact ? "600 15px Trebuchet MS" : "600 18px Trebuchet MS";
      ctx.fillStyle = "rgba(220, 228, 255, 0.9)";
      ctx.fillText("Press Space to play again", game.worldWidth * 0.5, game.worldHeight * 0.61);
      const modeLabel = CONFIG.MODES[game.mode].label;
      const planeLabel = CONFIG.PLANES[game.player.planeIndex].label;
      ctx.fillStyle = "rgba(180, 200, 255, 0.88)";
      ctx.fillText(`Mode: ${modeLabel} (M)  |  Plane: ${planeLabel} (C)`, game.worldWidth * 0.5, game.worldHeight * 0.65);
    }

    if (game.state === "paused") {
      ctx.font = "700 48px Trebuchet MS";
      ctx.fillText("PAUSED", game.worldWidth * 0.5, game.worldHeight * 0.48);
      ctx.font = "600 20px Trebuchet MS";
      ctx.fillStyle = "rgba(210, 220, 255, 0.9)";
      ctx.fillText("Press Esc to resume", game.worldWidth * 0.5, game.worldHeight * 0.56);
    }

    ctx.restore();
  }
}
