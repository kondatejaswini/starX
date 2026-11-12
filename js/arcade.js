/**
 * StarX — Space Arcade: Asteroid Dodger: Cosmic Survival
 * A high-performance 2D Canvas space survival game featuring a responsive spaceship,
 * dynamic asteroid physics, energy crystal collection, power-ups (Shield, Boost, Magnet),
 * lives system, milestones, audio synthesizer FX, and desktop/mobile touch controls.
 */

class AsteroidDodgerGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;

    // Difficulty settings
    this.difficulty = 'normal'; // 'easy', 'normal', 'hard'
    this.difficultyConfig = {
      easy: { asteroidSpeedMult: 0.7, spawnInterval: 1100, crystalSpawnInterval: 2200 },
      normal: { asteroidSpeedMult: 1.0, spawnInterval: 800, crystalSpawnInterval: 2800 },
      hard: { asteroidSpeedMult: 1.4, spawnInterval: 550, crystalSpawnInterval: 3400 }
    };

    // Game stats
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('starx_arcade_highscore') || '0', 10);
    this.lives = 3;
    this.maxLives = 3;
    this.crystalsCollected = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.lastAsteroidSpawn = 0;
    this.lastCrystalSpawn = 0;
    this.lastPowerUpSpawn = 0;

    // Player spaceship
    this.ship = {
      x: 0,
      y: 0,
      radius: 18,
      vx: 0,
      vy: 0,
      maxSpeed: 6.5,
      acceleration: 0.55,
      friction: 0.92,
      rotation: -Math.PI / 2, // Facing upwards
      isInvulnerable: false,
      invulnerableTimer: 0,
      hasShield: false,
      shieldTimer: 0,
      hasBoost: false,
      boostTimer: 0,
      hasMagnet: false,
      magnetTimer: 0,
      engineParticles: []
    };

    // Game objects
    this.asteroids = [];
    this.crystals = [];
    this.powerUps = [];
    this.floatingTexts = [];
    this.explosions = [];
    this.backgroundStars = [];

    // Inputs
    this.keys = {};
    this.touchPos = null;
    this.isBoosting = false;

    // Sound
    this.isMuted = true;
    this.initAudioContext();

    this.resizeCanvas();
    this.initBackgroundStars();
    this.setupEventListeners();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playSound(type) {
    if (this.isMuted || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const t = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'crystal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.15); // A5
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.18);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.28);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    } else if (type === 'shield') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    } else if (type === 'boost') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.25);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.clientWidth || 900;
      this.canvas.height = parent.clientHeight || 580;
    }
    if (this.ship) {
      this.ship.x = this.canvas.width / 2;
      this.ship.y = this.canvas.height * 0.75;
    }
  }

  initBackgroundStars() {
    this.backgroundStars = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.backgroundStars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.isRunning && !this.isGameOver) {
          this.togglePause();
        }
      }
      if (e.code === 'Space') {
        this.isBoosting = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.isBoosting = false;
      }
    });

    // Touch controls for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchPos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.touchPos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.touchPos = null;
    }, { passive: true });
  }

  start(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.resizeCanvas();
    this.score = 0;
    this.lives = this.maxLives;
    this.crystalsCollected = 0;
    this.asteroids = [];
    this.crystals = [];
    this.powerUps = [];
    this.floatingTexts = [];
    this.explosions = [];
    this.ship.x = this.canvas.width / 2;
    this.ship.y = this.canvas.height * 0.75;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.hasShield = true; // Friendly starting shield
    this.ship.shieldTimer = 4000;
    this.ship.hasBoost = false;
    this.ship.hasMagnet = false;
    this.ship.isInvulnerable = true;
    this.ship.invulnerableTimer = 2500;

    this.startTime = performance.now();
    this.elapsedTime = 0;
    this.lastAsteroidSpawn = 0;
    this.lastCrystalSpawn = 0;
    this.lastPowerUpSpawn = 0;

    this.isRunning = true;
    this.isPaused = false;
    this.isGameOver = false;

    this.updateHUD();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    const pauseOverlay = document.getElementById('arcade-pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.classList.toggle('active', this.isPaused);
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  spawnAsteroid() {
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y, vx, vy;
    const speedMult = this.difficultyConfig[this.difficulty].asteroidSpeedMult;
    const baseSpeed = (Math.random() * 2.2 + 1.2) * speedMult;
    const radius = Math.random() * 22 + 14;

    if (edge === 0) {
      x = Math.random() * this.canvas.width;
      y = -radius;
      vx = (Math.random() - 0.5) * 2;
      vy = baseSpeed;
    } else if (edge === 1) {
      x = this.canvas.width + radius;
      y = Math.random() * (this.canvas.height * 0.7);
      vx = -baseSpeed;
      vy = (Math.random() - 0.5) * 2;
    } else if (edge === 2) {
      x = Math.random() * this.canvas.width;
      y = this.canvas.height + radius;
      vx = (Math.random() - 0.5) * 2;
      vy = -baseSpeed * 0.5;
    } else {
      x = -radius;
      y = Math.random() * (this.canvas.height * 0.7);
      vx = baseSpeed;
      vy = (Math.random() - 0.5) * 2;
    }

    // Rocky polygon vertices
    const vertices = [];
    const pointsCount = Math.floor(Math.random() * 4) + 7;
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * Math.PI * 2;
      const dist = radius * (0.75 + Math.random() * 0.5);
      vertices.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }

    this.asteroids.push({
      x, y, vx, vy,
      radius,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      vertices,
      color: Math.random() > 0.4 ? '#8b7e74' : '#6b7280'
    });
  }

  spawnCrystal() {
    this.crystals.push({
      x: Math.random() * (this.canvas.width - 80) + 40,
      y: -20,
      vy: Math.random() * 1.5 + 1.0,
      radius: 12,
      rotation: 0,
      pulse: 0
    });
  }

  spawnPowerUp() {
    const types = ['shield', 'boost', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push({
      type,
      x: Math.random() * (this.canvas.width - 80) + 40,
      y: -25,
      vy: Math.random() * 1.2 + 0.8,
      radius: 16,
      rotation: 0
    });
  }

  gameLoop(timestamp) {
    if (!this.isRunning || this.isPaused) return;

    this.update(timestamp);
    this.render();

    if (!this.isGameOver) {
      requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  update(timestamp) {
    this.elapsedTime = Math.floor((timestamp - this.startTime) / 1000);
    this.score += 1; // Passive survival score

    // Update difficulty progression
    const cfg = this.difficultyConfig[this.difficulty];
    if (timestamp - this.lastAsteroidSpawn > cfg.spawnInterval) {
      this.spawnAsteroid();
      this.lastAsteroidSpawn = timestamp;
    }

    if (timestamp - this.lastCrystalSpawn > cfg.crystalSpawnInterval) {
      this.spawnCrystal();
      this.lastCrystalSpawn = timestamp;
    }

    if (timestamp - this.lastPowerUpSpawn > 14000) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = timestamp;
    }

    // 1. Update Ship Physics
    this.updateShip();

    // 2. Update Asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      ast.x += ast.vx;
      ast.y += ast.vy;
      ast.rotation += ast.rotSpeed;

      // Despawn off-screen
      if (ast.y > this.canvas.height + 60 || ast.x < -60 || ast.x > this.canvas.width + 60) {
        this.asteroids.splice(i, 1);
        continue;
      }

      // Check collision with ship
      const dist = Math.hypot(ast.x - this.ship.x, ast.y - this.ship.y);
      if (dist < ast.radius + this.ship.radius) {
        if (this.ship.hasShield) {
          // Shield absorbs the blow!
          this.ship.hasShield = false;
          this.createExplosion(ast.x, ast.y, '#38bdf8', 16);
          this.floatingTexts.push({ text: 'SHIELD DEFLECTED!', x: this.ship.x, y: this.ship.y - 30, life: 40, color: '#38bdf8' });
          this.asteroids.splice(i, 1);
          this.playSound('shield');
        } else if (!this.ship.isInvulnerable) {
          // Player hit!
          this.lives--;
          this.ship.isInvulnerable = true;
          this.ship.invulnerableTimer = 2200;
          this.createExplosion(this.ship.x, this.ship.y, '#ef4444', 24);
          this.playSound('hit');
          this.asteroids.splice(i, 1);

          if (this.lives <= 0) {
            this.triggerGameOver();
            return;
          }
        }
      }
    }

    // 3. Update Crystals
    for (let i = this.crystals.length - 1; i >= 0; i--) {
      const cry = this.crystals[i];
      cry.y += cry.vy;
      cry.rotation += 0.04;
      cry.pulse = Math.sin(timestamp * 0.006) * 3;

      // Magnet pull
      if (this.ship.hasMagnet) {
        const dx = this.ship.x - cry.x;
        const dy = this.ship.y - cry.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          cry.x += (dx / dist) * 7.5;
          cry.y += (dy / dist) * 7.5;
        }
      }

      // Collect crystal
      const dist = Math.hypot(cry.x - this.ship.x, cry.y - this.ship.y);
      if (dist < cry.radius + this.ship.radius) {
        this.crystalsCollected++;
        const points = this.ship.hasBoost ? 250 : 150;
        this.score += points;
        this.playSound('crystal');
        this.floatingTexts.push({ text: `+${points}`, x: cry.x, y: cry.y, life: 35, color: '#4bf0ff' });
        this.createExplosion(cry.x, cry.y, '#4bf0ff', 10);
        this.crystals.splice(i, 1);
        continue;
      }

      if (cry.y > this.canvas.height + 30) {
        this.crystals.splice(i, 1);
      }
    }

    // 4. Update Power-Ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      p.y += p.vy;
      p.rotation += 0.02;

      const dist = Math.hypot(p.x - this.ship.x, p.y - this.ship.y);
      if (dist < p.radius + this.ship.radius) {
        this.applyPowerUp(p.type);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (p.y > this.canvas.height + 30) {
        this.powerUps.splice(i, 1);
      }
    }

    // 5. Update Background Stars
    for (const star of this.backgroundStars) {
      star.y += star.speed * (this.ship.hasBoost ? 2.5 : 1.0);
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    }

    // 6. Update Particle Systems
    this.updateParticles();

    this.updateHUD();
  }

  applyPowerUp(type) {
    if (type === 'shield') {
      this.ship.hasShield = true;
      this.ship.shieldTimer = 9000;
      this.floatingTexts.push({ text: 'SHIELD ONLINE! 🛡️', x: this.ship.x, y: this.ship.y - 35, life: 45, color: '#38bdf8' });
      this.playSound('shield');
    } else if (type === 'boost') {
      this.ship.hasBoost = true;
      this.ship.boostTimer = 7000;
      this.floatingTexts.push({ text: 'WARP BOOST! ⚡ (2x Score)', x: this.ship.x, y: this.ship.y - 35, life: 45, color: '#fbbf24' });
      this.playSound('boost');
    } else if (type === 'magnet') {
      this.ship.hasMagnet = true;
      this.ship.magnetTimer = 8500;
      this.floatingTexts.push({ text: 'CRYSTAL MAGNET! 🧲', x: this.ship.x, y: this.ship.y - 35, life: 45, color: '#c084fc' });
      this.playSound('crystal');
    }
  }

  updateShip() {
    let ax = 0;
    let ay = 0;

    // Keyboard inputs
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) ax -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) ax += 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) ay -= 1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) ay += 1;

    // Touch joystick inputs
    if (this.touchPos) {
      const dx = this.touchPos.x - this.ship.x;
      const dy = this.touchPos.y - this.ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 15) {
        ax = dx / dist;
        ay = dy / dist;
      }
    }

    // Normalize diagonal acceleration
    const len = Math.hypot(ax, ay);
    if (len > 0) {
      ax /= len;
      ay /= len;
    }

    const accel = this.ship.acceleration * (this.ship.hasBoost ? 1.6 : 1.0);
    this.ship.vx += ax * accel;
    this.ship.vy += ay * accel;

    this.ship.vx *= this.ship.friction;
    this.ship.vy *= this.ship.friction;

    const maxSpeed = this.ship.maxSpeed * (this.ship.hasBoost ? 1.5 : 1.0);
    const speed = Math.hypot(this.ship.vx, this.ship.vy);
    if (speed > maxSpeed) {
      this.ship.vx = (this.ship.vx / speed) * maxSpeed;
      this.ship.vy = (this.ship.vy / speed) * maxSpeed;
    }

    this.ship.x += this.ship.vx;
    this.ship.y += this.ship.vy;

    // Boundaries
    const pad = this.ship.radius + 4;
    this.ship.x = Math.max(pad, Math.min(this.canvas.width - pad, this.ship.x));
    this.ship.y = Math.max(pad, Math.min(this.canvas.height - pad, this.ship.y));

    // Dynamic bank angle based on horizontal velocity
    this.ship.rotation = -Math.PI / 2 + this.ship.vx * 0.05;

    // Engine exhaust particles
    if (Math.random() > 0.3) {
      this.ship.engineParticles.push({
        x: this.ship.x - Math.cos(this.ship.rotation) * 16 + (Math.random() - 0.5) * 6,
        y: this.ship.y - Math.sin(this.ship.rotation) * 16 + (Math.random() - 0.5) * 6,
        vx: -this.ship.vx * 0.2 + (Math.random() - 0.5) * 1.5,
        vy: 3.5 + Math.random() * 2,
        life: 20,
        maxLife: 20,
        color: this.ship.hasBoost ? '#fbbf24' : '#4bf0ff'
      });
    }

    // Power-up timers
    if (this.ship.hasShield) {
      this.ship.shieldTimer -= 16;
      if (this.ship.shieldTimer <= 0) this.ship.hasShield = false;
    }
    if (this.ship.hasBoost) {
      this.ship.boostTimer -= 16;
      if (this.ship.boostTimer <= 0) this.ship.hasBoost = false;
    }
    if (this.ship.hasMagnet) {
      this.ship.magnetTimer -= 16;
      if (this.ship.magnetTimer <= 0) this.ship.hasMagnet = false;
    }
    if (this.ship.isInvulnerable) {
      this.ship.invulnerableTimer -= 16;
      if (this.ship.invulnerableTimer <= 0) this.ship.isInvulnerable = false;
    }
  }

  updateParticles() {
    // Engine particles
    for (let i = this.ship.engineParticles.length - 1; i >= 0; i--) {
      const p = this.ship.engineParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.ship.engineParticles.splice(i, 1);
    }

    // Explosion particles
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      exp.x += exp.vx;
      exp.y += exp.vy;
      exp.vx *= 0.94;
      exp.vy *= 0.94;
      exp.life--;
      if (exp.life <= 0) this.explosions.splice(i, 1);
    }

    // Floating text popups
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const txt = this.floatingTexts[i];
      txt.y -= 1.2;
      txt.life--;
      if (txt.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 1.5;
      this.explosions.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color
      });
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Deep space gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGrad.addColorStop(0, '#040816');
    bgGrad.addColorStop(1, '#02040b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Moving stars
    for (const star of this.backgroundStars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Engine exhaust
    for (const p of this.ship.engineParticles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (1 - alpha * 0.5) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Render Asteroids
    for (const ast of this.asteroids) {
      ctx.save();
      ctx.translate(ast.x, ast.y);
      ctx.rotate(ast.rotation);

      ctx.fillStyle = ast.color;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ast.vertices.length; i++) {
        const v = ast.vertices[i];
        if (i === 0) ctx.moveTo(v.x, v.y);
        else ctx.lineTo(v.x, v.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle crater details
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.arc(ast.radius * 0.25, ast.radius * 0.2, ast.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Energy Crystals
    for (const cry of this.crystals) {
      ctx.save();
      ctx.translate(cry.x, cry.y);
      ctx.rotate(cry.rotation);

      // Glow aura
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, cry.radius + cry.pulse + 8);
      auraGrad.addColorStop(0, 'rgba(75, 240, 255, 0.8)');
      auraGrad.addColorStop(1, 'rgba(75, 240, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, cry.radius + cry.pulse + 8, 0, Math.PI * 2);
      ctx.fill();

      // Diamond crystal shape
      ctx.fillStyle = '#4bf0ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -cry.radius);
      ctx.lineTo(cry.radius * 0.7, 0);
      ctx.lineTo(0, cry.radius);
      ctx.lineTo(-cry.radius * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Render Power-Ups
    for (const p of this.powerUps) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      const color = p.type === 'shield' ? '#38bdf8' : p.type === 'boost' ? '#fbbf24' : '#c084fc';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = p.type === 'shield' ? '🛡️' : p.type === 'boost' ? '⚡' : '🧲';
      ctx.fillText(icon, 0, 0);

      ctx.restore();
    }

    // Render Player Ship
    if (!this.ship.isInvulnerable || Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.save();
      ctx.translate(this.ship.x, this.ship.y);
      ctx.rotate(this.ship.rotation + Math.PI / 2);

      // Ship body
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -this.ship.radius); // Nose
      ctx.lineTo(this.ship.radius * 0.85, this.ship.radius * 0.85); // Right wing
      ctx.lineTo(0, this.ship.radius * 0.4); // Tail indenture
      ctx.lineTo(-this.ship.radius * 0.85, this.ship.radius * 0.85); // Left wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit glass
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(0, -this.ship.radius * 0.2, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shield Bubble
      if (this.ship.hasShield) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, this.ship.radius + 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // Render Explosions
    for (const exp of this.explosions) {
      const alpha = exp.life / exp.maxLife;
      ctx.fillStyle = exp.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Render Floating Text Popups
    for (const txt of this.floatingTexts) {
      ctx.fillStyle = txt.color;
      ctx.font = 'bold 15px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.globalAlpha = txt.life / 40;
      ctx.fillText(txt.text, txt.x, txt.y);
      ctx.globalAlpha = 1.0;
    }
  }

  updateHUD() {
    const scoreEl = document.getElementById('arcade-score-val');
    if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

    const highEl = document.getElementById('arcade-high-val');
    if (highEl) highEl.textContent = this.highScore.toLocaleString();

    const timeEl = document.getElementById('arcade-timer-val');
    if (timeEl) {
      const mins = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
      const secs = (this.elapsedTime % 60).toString().padStart(2, '0');
      timeEl.textContent = `${mins}:${secs}`;
    }

    const livesEl = document.getElementById('arcade-lives-container');
    if (livesEl) {
      let hearts = '';
      for (let i = 0; i < this.maxLives; i++) {
        hearts += i < this.lives ? '❤️ ' : '🖤 ';
      }
      livesEl.textContent = hearts;
    }

    const crystalsEl = document.getElementById('arcade-crystals-val');
    if (crystalsEl) crystalsEl.textContent = this.crystalsCollected;
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.isRunning = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('starx_arcade_highscore', this.highScore.toString());
      } catch (e) {}
    }

    const modal = document.getElementById('arcade-gameover-modal');
    if (modal) {
      const finalScoreEl = document.getElementById('gameover-final-score');
      const finalTimeEl = document.getElementById('gameover-final-time');
      const finalCrystalsEl = document.getElementById('gameover-final-crystals');
      const finalHighEl = document.getElementById('gameover-high-score');

      if (finalScoreEl) finalScoreEl.textContent = this.score.toLocaleString();
      if (finalTimeEl) finalTimeEl.textContent = `${Math.floor(this.elapsedTime / 60)}m ${this.elapsedTime % 60}s`;
      if (finalCrystalsEl) finalCrystalsEl.textContent = this.crystalsCollected;
      if (finalHighEl) finalHighEl.textContent = this.highScore.toLocaleString();

      modal.classList.add('active');
    }
  }
}

window.AsteroidDodgerGame = AsteroidDodgerGame;
