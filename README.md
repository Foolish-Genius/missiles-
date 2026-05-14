# Missile Arcade – Canvas Edition

A pure JavaScript arcade survival game inspired by **Missiles!** by Macaque. Dodge endless homing missiles, collect stars, survive as long as possible. Desktop and mobile friendly with infinite-world scrolling camera, dual game modes, customizable planes, and visceral particle feedback.

---

## 🎮 Features

### Core Gameplay
- **Infinite-World Camera**: No screen edges—fly forever in an endless scrolling world centered on your aircraft
- **Homing Missiles**: Enemies that intelligently track your position with configurable steering and speed growth
- **Collision Physics**: Missile-to-missile and missile-to-player detection with instant particle explosions
- **Survival Challenge**: Escalating difficulty with increasing missile spawn rates and speeds based on elapsed time

### Game Modes
- **Normal**: Balanced starting difficulty (2–24 missiles max), ideal for learning and steady gameplay
- **Fast**: Chaotic mayhem with 2.42× missile speed, 1.45× spawn rate, and 1.6× score multiplier for hardcore players

### Aircraft & Variants
Four distinct plane styles with unique colors and glows:
- **WHITE**: Classic minimalist design
- **RED**: Aggressive red-hot appearance
- **GOLD**: Rich golden glow (rare prestige pick)
- **STEALTH**: Dim, shadowy profile

Select your plane before starting or after game over using the `C` key.

### Star System
- Collectible stars spawn randomly in the world
- Picking up a star grants bonus points and visible satisfaction
- Stars are rendered as rotating 10-point geometry for visual distinctness
- Tracking encourages tactical flight planning beyond pure survival

### Scoring & Progression
- **Survival Bonus**: +1 point per second of continuous gameplay
- **Destruction Bonus**: +50 points per missile destroyed via missile-to-missile collision
- **Near-Miss Bonus**: +100 points per missile that passes within near-miss radius without collision (cooldown prevents spam)
- **Star Bonus**: +250 points per star collected
- **Mode Multiplier**: Fast mode grants 1.6× score multiplier for all bonuses

### Particle System
- **Explosion Effects**: 28 particles per standard missile destruction, 16 per missile-to-missile collision
- **Object-Pooled Rendering**: Pre-allocated pool of 1,400 particles for optimal performance
- **Visual Feedback**: Particles use "lighter" composite blending for vibrant, visible impacts
- **Lifecycle**: Each particle fades over 0.18–0.54 seconds, creating snappy impact bursts rather than lingering trails

### Visual Design
- **Dark Neon Atmosphere**: Deep blue-black background with subtle radial gradients and atmospheric depth
- **Trails & Glows**: Player and missile trails (shorter, punchier feel) with color-coded glows
- **Scanline Overlay**: Classic CRT effect for retro arcade feel
- **Responsive HUD**: Real-time display of score, missile count, elapsed time, active mode, selected plane
- **Minimal Clutter**: Clean UI that doesn't obscure the action

---

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- ES6+ module support (all modern browsers)
- Touch input supported on iOS, Android, iPad, tablets

### Run Locally

The game uses ES6 modules, so it requires an HTTP server. Use any of these:

**Python 3:**
```bash
python -m http.server 5500
```

**Python 2:**
```bash
python -m SimpleHTTPServer 5500
```

**Node.js (http-server):**
```bash
npx http-server -p 5500
```

Then open **`http://localhost:5500`** in your browser.

⚠️ **Note:** Running `index.html` directly with `file://` protocol won't work due to ES6 module restrictions. Always use an HTTP server.

---

## 🎛️ Controls

### Desktop (Keyboard + Mouse/Pointer)

| Action | Key(s) |
|--------|--------|
| **Turn Left** | `A` or `Left Arrow` |
| **Turn Right** | `D` or `Right Arrow` |
| **Aim with Pointer** | Move mouse or drag finger (60% blend with keyboard) |
| **Start Game** | `Space` or click canvas |
| **Restart** | `Space` from game-over screen |
| **Pause/Resume** | `Escape` |
| **Toggle Mode** | `M` (Normal ↔ Fast) |
| **Cycle Plane** | `C` (cycles through 4 variants) |

### Mobile / Tablet

- **Tap/Touch Canvas**: Start game from menu
- **Move Finger/Drag**: Aim aircraft toward touch point (blended with tilt/joystick if available)
- **Control Types** (selectable via menu):
  - **Arrow Keys**: Traditional A/D or arrow key controls (desktop)
  - **Touch/Drag**: Point where you want to aim; aircraft rotates toward pointer
  - **Virtual Joystick**: (Available on tablets) Left zone to turn left, right zone to turn right

Select your preferred control type on the menu screen. Your choice is remembered during your session.

---

## 🎯 Game Modes Explained

### Normal Mode
- **Missile Speed Multiplier**: 1.0× (base 250 px/s)
- **Spawn Rate Multiplier**: 1.0× (default intervals)
- **Score Multiplier**: 1.0× (base scoring)
- **Missile Cap**: Starts at 2, grows to max 24 over time
- **Best For**: Learning mechanics, steady challenge, relaxed sessions

### Fast Mode
- **Missile Speed Multiplier**: 2.42× (base 250 → ~605 px/s, accelerating further over time)
- **Spawn Rate Multiplier**: 1.45× (missiles spawn 45% more frequently)
- **Score Multiplier**: 1.6× (all bonuses × 1.6)
- **Missile Cap**: Starts at 3, grows to 34 (1.4× normal max)
- **Player Speed Boost**: Player moves 10% faster to match intensity
- **Best For**: Adrenaline junkies, high-score runs, practiced players

**Difficulty Escalation:** Both modes increase missile speed and spawn rate over elapsed time, accelerating the challenge the longer you survive.

---

## ⭐ Planes & Customization

Each plane has distinct visual styling while maintaining identical gameplay:

| Plane | Color Theme | Glow | Vibe |
|-------|-------------|------|------|
| **WHITE** | Pale white body | Cool cyan | Neutral, clean |
| **RED** | Crimson body | Hot red-orange | Aggressive, hot |
| **GOLD** | Golden yellow | Warm amber | Prestigious, rare feel |
| **STEALTH** | Dark gray/black | Dim purple | Tactical, low-key |

Select or change your plane on the menu screen or after game over by pressing `C`.

---

## 💫 Star System

### How Stars Work
1. **Spawn**: Random stars appear throughout the world
2. **Collect**: Fly through a star to collect it (+250 points)
3. **Visual**: Stars render as rotating 10-point geometric shapes
4. **Tracking**: Your total stars collected displays on the game-over screen

### Strategy
Stars encourage exploration beyond pure evasion. Balancing dodging missiles with star collection adds a secondary objective and risk/reward dynamic.

---

## ✨ Particle System Explained

The particle system provides visceral, immediate visual feedback for every action. It's performance-optimized using object pooling.

### Pool Architecture
- **Total Pool**: 1,400 pre-allocated particles
- **Lifecycle**: Each particle is reused after expiration
- **Zero GC**: Pre-allocation avoids garbage collection during gameplay

### Particle Events

**Standard Missile Destruction** (missile-to-missile collision):
- **Count**: 28 particles
- **Spread**: Circular burst around collision point
- **Color**: Bright yellow (#f4b330)
- **Life**: 0.18–0.54 seconds
- **Speed**: 80–240 px/s radial spread

**Missile-to-Missile Collision**:
- **Count**: 16 particles (reduced for snappiness)
- **Color**: Bright yellow
- **Life**: 0.18–0.54 seconds
- **Spread**: Tighter burst (50–150 px/s)

### Rendering
- **Blend Mode**: "lighter" (additive) for bright, punchy visibility
- **Size**: 1–3 px per particle
- **Fade**: Linear alpha interpolation from full opacity to transparent
- **Performance**: Efficient pooled updates and conditional rendering

### Why This Matters
Short-lived, visible particles create **snappy feedback** that makes collisions feel impactful. The "lighter" blend mode ensures particles cut through dark backgrounds and UI without getting lost.

---

## 🏗️ Architecture

The codebase follows a modular, layered design:

```
index.html                          ← App shell with canvas
styles.css                          ← Neon atmosphere & layout
src/main.js                         ← Bootstrap (instantiate Game and start)
src/config.js                       ← All tunable constants (single source of truth)
src/core/
  ├── Game.js                       ← Main loop, state machine, entity orchestration
  ├── Input.js                      ← Keyboard, mouse, touch, virtual joystick handlers
  └── Camera.js                     ← Infinite-world viewport management
src/entities/
  ├── Player.js                     ← Player aircraft with movement & trail tracking
  └── Missile.js                    ← Homing projectile with steering AI
src/systems/
  ├── Spawner.js                    ← Missile generation with difficulty escalation
  ├── CollisionSystem.js            ← Collision detection & response
  ├── RenderSystem.js               ← Canvas drawing for all visual elements
  └── ParticleSystem.js             ← Object-pooled particle management
src/utils/
  └── math.js                       ← Utilities (clamp, normalizeAngle, distanceSquared, etc.)
```

### Key Abstractions

| Layer | Responsibility |
|-------|-----------------|
| **Game.js** | Main game loop, state transitions (menu→running→paused→gameover), entity updates, scoring |
| **Input.js** | Abstract keyboard, mouse, touch input; calculate turn axis and pointer aiming angle |
| **Camera.js** | Transform world coordinates to screen coordinates; manage infinite viewport |
| **Player.js** | Aircraft movement, rotation, trail recording |
| **Missile.js** | Homing behavior, collision state, trail recording |
| **Spawner.js** | Spawn missiles off-screen with difficulty ramping |
| **CollisionSystem.js** | Static checks for player hits, missile collisions, near-misses |
| **RenderSystem.js** | Render grid, player, missiles, stars, trails, particles, HUD, overlays |
| **ParticleSystem.js** | Manage particle pool, lifecycle, updates |

### Game Loop (Simplified)
```javascript
while (running) {
  dt = elapsed time since last frame (clamped to 1/30s max)
  
  // Update
  input.update(dt)
  player.update(dt, input.getTurnAxis())
  spawner.update(dt, game)
  missiles.forEach(m => m.update(dt, player, modeSpeedScale))
  particleSystem.update(dt)
  updateStars(dt)
  
  // Collision Detection
  if (CollisionSystem.checkPlayerHit(player, missiles)) gameOver()
  collisionsCount = CollisionSystem.checkMissileCollisions(missiles)
  nearMissCount = CollisionSystem.awardNearMisses(player, missiles)
  
  // Score
  score += survival bonus + destruction + near-miss + star pickup
  
  // Render
  camera.update(dt)
  renderer.render(canvas, game state, all entities)
}
```

---

## ⚙️ Configuration & Tuning

All gameplay parameters live in `src/config.js`. Modify these values to adjust feel:

### Player Settings
```javascript
PLAYER: {
  SPEED: 238,           // pixels/second forward velocity
  TURN_SPEED: 4.2,      // radians/second rotation rate
  TRAIL_INTERVAL: 1,    // update trail every N frames
  TRAIL_LENGTH: 7,      // max trail points (shorter = punchier)
}
```

### Missile Settings
```javascript
MISSILE: {
  BASE_SPEED: 250,      // initial px/s
  TURN_RATE: 3.2,       // initial rotation speed
  SPEED_GROWTH: 0.08,   // linear acceleration over time
  TRAIL_INTERVAL: 3,
  TRAIL_LENGTH: 14,
}
```

### Difficulty Ramp
```javascript
DIFFICULTY: {
  SPAWN_INTERVAL_BASE: 0.8,  // seconds between spawns
  SPAWN_INTERVAL_MIN: 0.3,   // fastest spawn rate
  SPAWN_DECAY: 0.04,         // how fast intervals shrink
  MISSILE_CAP_START: 2,      // initial max missiles (normal mode)
  MISSILE_CAP_GROWTH: 0.065, // cap growth rate per second
  MISSILE_CAP_MAX: 24,       // hard max for normal mode
}
```

### Game Modes
```javascript
MODES: {
  normal: {
    missileSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    scoreMultiplier: 1.0,
    missileCapMultiplier: 1.0,
  },
  fast: {
    missileSpeedMultiplier: 2.42,   // 2.42× chaos
    spawnRateMultiplier: 1.45,
    scoreMultiplier: 1.6,           // 60% more points
    missileCapMultiplier: 1.4,
  },
}
```

### Scoring
```javascript
SCORING: {
  SURVIVAL: 1,          // points per second
  DESTRUCTION: 50,      // per missile destroyed
  NEAR_MISS: 100,       // per missile that passes close
  STAR_PICKUP: 250,
}
```

### Particle System
```javascript
PARTICLES: {
  POOL_SIZE: 1400,
  EXPLOSION_COUNT: 28,
  COLLISION_COUNT: 16,
  LIFE_MIN: 0.18,
  LIFE_MAX: 0.54,
  MIN_SPEED: 80,
  MAX_SPEED: 240,
}
```

**Pro Tip**: Experiment with `TRAIL_LENGTH`, `SPAWN_INTERVAL_MIN`, and mode multipliers to customize the feel. Shorter trails = snappier; lower spawn intervals = higher chaos.

---

## 🌐 Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome/Chromium | ✅ Full Support | Recommended, best performance |
| Firefox | ✅ Full Support | Great performance |
| Safari | ✅ Full Support | iOS/iPad with touch support |
| Edge | ✅ Full Support | Chromium-based, same as Chrome |
| Mobile Safari (iOS) | ✅ Full Support | Pinch-zoom disabled, touch aiming works |
| Android Chrome | ✅ Full Support | Touch and virtual joystick ready |

**Requirements:**
- ES6+ module support
- Canvas 2D context
- Mouse/Touch event APIs
- requestAnimationFrame

---

## 📋 How to Play – Quick Start

1. **Start Game**: Press `Space` or click the canvas
2. **Survive**: Use `A/D` or arrows to dodge incoming missiles
3. **Optional Aiming**: Move mouse to aim (blends with keyboard)
4. **Collect Stars**: Pick up rotating golden stars for bonus points
5. **Destroy Missiles**: Let two missiles collide with each other (+50 points, particle burst)
6. **Score Bonuses**: Get near-miss points (+100) by flying close to missiles without hitting
7. **Game Over**: When a missile hits you, the game ends
8. **Try Again**: Press `Space` to restart, or pick a new plane with `C`, toggle mode with `M`

### Tips for High Scores
- **Fast Mode** is higher-risk, higher-reward (1.6× scoring) but significantly harder
- **Near-misses** are "free" points if you can thread the needle safely
- **Stars** grant the highest per-item bonus (+250); detours worth it if safe
- **Destruction** (missile-to-missile collisions) grants steady +50 points
- **Mode Cycling**: Toggle between Normal and Fast to practice before committing to hardcore runs

---

## 🔮 Future Enhancements

Potential directions for expansion:

- **Sound Design**: Explosions, missile warnings, mode transitions, star pickups
- **More Plane Variants**: 8+ unique designs with cosmetic customization
- **Obstacles**: Immovable asteroids, walls, or dynamic hazards
- **Power-Ups**: Shield, slow-time, missile vacuum, temporary invulnerability
- **Leaderboards**: Local or cloud-based high-score tracking
- **Difficulty Presets**: "Easy," "Normal," "Insane" with balanced starting parameters
- **Visual Themes**: Multiple neon color schemes, dark/light modes
- **Unlockables**: Planes, trails, or effects earned through high scores
- **Multiplayer**: Cooperative survival or competitive missile-dodging
- **Mobile Optimization**: Refined joystick rendering, landscape/portrait modes

---

## 🤝 Contributing & Customization

This is a single-player game designed for learning and experimentation. Feel free to:

- Fork and modify game parameters in `src/config.js`
- Add new plane variants by extending `CONFIG.PLANES`
- Experiment with particle counts and lifespans for different feels
- Implement new collision responses or visual effects
- Optimize rendering or physics as needed

---

## 📝 License

Inspired by **Missiles!** by Macaque. This implementation is a personal recreation for learning and entertainment.

---

**Happy flying! 🎮✨**
