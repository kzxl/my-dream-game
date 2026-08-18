/**
 * MDG: Aethelis - 2D Top-Down Pixel Art ARPG Engine
 * Clean Transparent PNG Sprites & Seamless Ground Rendering
 */

(function () {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const minimapCanvas = document.getElementById('minimapCanvas');
  const mmCtx = minimapCanvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  // World & Camera Settings
  const WORLD_SIZE = 2400;
  const TILE_SIZE = 48;
  const camera = { x: 0, y: 0 };

  // ==========================================
  // 1. ASSET LOADER (Transparent PNGs)
  // ==========================================
  const assets = {
    hero: new Image(),
    monsters: new Image(),
    tileset: new Image(),
    loaded: 0
  };

  function onAssetLoad() {
    assets.loaded++;
  }

  assets.hero.onload = onAssetLoad;
  assets.hero.src = '/assets/character_spritesheet.png';

  assets.monsters.onload = onAssetLoad;
  assets.monsters.src = '/assets/monsters_pack.png';

  assets.tileset.onload = onAssetLoad;
  assets.tileset.src = '/assets/world_tileset.png';

  // ==========================================
  // 2. PLAYER STATE (PoE Stats & Logic)
  // ==========================================
  const player = {
    x: 1200,
    y: 1200,
    vx: 0,
    vy: 0,
    speed: 260,
    facing: 'down',
    isMoving: false,
    animFrame: 0,
    animTimer: 0,

    life: 250,
    maxLife: 250,
    mana: 120,
    maxMana: 120,
    es: 100,
    maxEs: 100,

    armor: 500,
    evasion: 350,
    fireRes: 75,
    coldRes: 75,
    lightRes: 75,
    chaosRes: 40,
    critChance: 35,
    critMulti: 220,

    cooldowns: { slash: 0, fireball: 0, frost: 0, meteor: 0, dash: 0 },
    maxCooldowns: { slash: 0.35, fireball: 1.0, frost: 2.5, meteor: 4.5, dash: 1.2 }
  };

  // World Entities
  const monsters = [];
  const projectiles = [];
  const particles = [];
  const floatingTexts = [];
  const props = [];

  // Input State
  const keys = {};
  const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false };

  // ==========================================
  // 3. WORLD INITIALIZATION
  // ==========================================
  function initWorld() {
    // Spawn Props with varied positions
    for (let i = 0; i < 70; i++) {
      const typeRoll = Math.random();
      let type = 'tree';
      if (typeRoll < 0.50) type = 'tree';
      else if (typeRoll < 0.75) type = 'rock';
      else if (typeRoll < 0.90) type = 'barrel';
      else type = 'chest';

      props.push({
        x: Math.random() * (WORLD_SIZE - 300) + 150,
        y: Math.random() * (WORLD_SIZE - 300) + 150,
        type: type
      });
    }

    // Central Campfire
    props.push({ x: 1260, y: 1200, type: 'campfire' });

    // Initial Monster Encounters
    spawnMonsterCluster(1420, 1100, 4);
    spawnMonsterCluster(980, 1350, 5);
    spawnMonster(1650, 1400, 'boss');
  }

  function spawnMonster(x, y, type = 'slime') {
    const isBoss = type === 'boss';
    monsters.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      type: type,
      name: isBoss ? '🔥 Shadow Fiend (Boss)' : (type === 'slime' ? 'Toxic Slime' : (type === 'skeleton' ? 'Skeleton Warrior' : 'Goblin Scout')),
      maxLife: isBoss ? 1200 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
      life: isBoss ? 1200 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
      armor: isBoss ? 600 : (type === 'skeleton' ? 350 : 100),
      fireRes: type === 'slime' ? 0 : (isBoss ? 50 : 30),
      coldRes: type === 'slime' ? 70 : (isBoss ? 40 : 10),
      speed: isBoss ? 140 : (100 + Math.random() * 40),
      state: 'idle',
      animTimer: Math.random() * 10,
      isAlive: true,
      hurtTimer: 0,
      scale: isBoss ? 1.8 : 1.2
    });
  }

  function spawnMonsterCluster(cx, cy, count) {
    const types = ['slime', 'skeleton', 'goblin'];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      spawnMonster(cx + (Math.random() - 0.5) * 240, cy + (Math.random() - 0.5) * 240, type);
    }
  }

  // ==========================================
  // 4. COMBAT PIPELINE (PoE Mitigation)
  // ==========================================
  function dealDamage(target, rawPhysical, rawFire, rawCold, rawLightning, rawChaos, canCrit = true) {
    if (!target.isAlive) return;

    let isCrit = false;
    let multiplier = 1.0;
    if (canCrit && Math.random() * 100 <= player.critChance) {
      isCrit = true;
      multiplier = player.critMulti / 100;
    }

    const physDmg = rawPhysical * multiplier;
    let physMitigation = 0;
    if (target.armor > 0 && physDmg > 0) {
      physMitigation = Math.min(0.9, target.armor / (target.armor + 5 * physDmg));
    }
    const finalPhys = physDmg * (1 - physMitigation);

    const finalFire = (rawFire * multiplier) * (1 - (target.fireRes || 0) / 100);
    const finalCold = (rawCold * multiplier) * (1 - (target.coldRes || 0) / 100);
    const finalLight = (rawLightning * multiplier) * 1.0;
    const finalChaos = (rawChaos * multiplier) * 1.0;

    const totalDamage = Math.max(1, Math.round(finalPhys + finalFire + finalCold + finalLight + finalChaos));

    target.life -= totalDamage;
    target.hurtTimer = 0.25;

    const color = isCrit ? '#ffd700' : (rawFire > 0 ? '#ff7849' : (rawCold > 0 ? '#4facfe' : '#ffffff'));
    spawnDamageNumber(target.x, target.y - 30 * (target.scale || 1), totalDamage, isCrit, color);

    for (let i = 0; i < (isCrit ? 12 : 6); i++) {
      particles.push({
        x: target.x,
        y: target.y - 10,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        color: rawFire > 0 ? '#ff5722' : (rawCold > 0 ? '#00f2fe' : '#e06c75'),
        life: 0.35,
        maxLife: 0.35,
        size: 3 + Math.random() * 4
      });
    }

    if (target.life <= 0) {
      target.isAlive = false;
      target.life = 0;
      spawnDamageNumber(target.x, target.y - 50, 'DEFEATED!', true, '#e5c07b');
    }
  }

  function spawnDamageNumber(x, y, text, isCrit, color) {
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 24,
      y: y,
      text: text.toString(),
      isCrit: isCrit,
      color: color || '#ffffff',
      life: 0.85,
      maxLife: 0.85,
      vy: isCrit ? -80 : -55
    });
  }

  // ==========================================
  // 5. SKILLS
  // ==========================================
  function castSlash() {
    if (player.cooldowns.slash > 0) return;
    player.cooldowns.slash = player.maxCooldowns.slash;

    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
    const reach = 75;
    const slashX = player.x + Math.cos(angle) * 40;
    const slashY = player.y + Math.sin(angle) * 40;

    monsters.forEach(m => {
      if (m.isAlive) {
        const dist = Math.hypot(m.x - slashX, m.y - slashY);
        if (dist < reach) {
          dealDamage(m, 50, 20, 0, 0, 0);
        }
      }
    });

    for (let i = 0; i < 12; i++) {
      const spread = angle + (Math.random() - 0.5) * 1.4;
      particles.push({
        x: player.x + Math.cos(spread) * 30,
        y: player.y + Math.sin(spread) * 30,
        vx: Math.cos(spread) * 160,
        vy: Math.sin(spread) * 160,
        color: '#e5c07b',
        life: 0.22,
        maxLife: 0.22,
        size: 4
      });
    }
  }

  function castFireball() {
    if (player.cooldowns.fireball > 0 || player.mana < 10) return;
    player.mana -= 10;
    player.cooldowns.fireball = player.maxCooldowns.fireball;

    const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
    projectiles.push({
      x: player.x,
      y: player.y - 10,
      vx: Math.cos(angle) * 480,
      vy: Math.sin(angle) * 480,
      type: 'fireball',
      radius: 12,
      life: 1.6
    });
  }

  function castFrostNova() {
    if (player.cooldowns.frost > 0 || player.mana < 15) return;
    player.mana -= 15;
    player.cooldowns.frost = player.maxCooldowns.frost;

    const novaRadius = 150;
    monsters.forEach(m => {
      if (m.isAlive) {
        const dist = Math.hypot(m.x - player.x, m.y - player.y);
        if (dist <= novaRadius) {
          dealDamage(m, 15, 0, 90, 0, 0);
        }
      }
    });

    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * 260,
        vy: Math.sin(a) * 260,
        color: '#00f2fe',
        life: 0.45,
        maxLife: 0.45,
        size: 6
      });
    }
  }

  function castMeteor() {
    if (player.cooldowns.meteor > 0 || player.mana < 30) return;
    player.mana -= 30;
    player.cooldowns.meteor = player.maxCooldowns.meteor;

    const targetX = mouse.worldX;
    const targetY = mouse.worldY;

    particles.push({
      x: targetX,
      y: targetY,
      vx: 0,
      vy: 0,
      color: 'rgba(255, 65, 108, 0.45)',
      life: 0.45,
      maxLife: 0.45,
      size: 50,
      isRing: true
    });

    setTimeout(() => {
      const radius = 135;
      monsters.forEach(m => {
        if (m.isAlive) {
          const dist = Math.hypot(m.x - targetX, m.y - targetY);
          if (dist <= radius) {
            dealDamage(m, 50, 180, 0, 0, 30);
          }
        }
      });

      for (let i = 0; i < 45; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = 60 + Math.random() * 260;
        particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          color: Math.random() > 0.3 ? '#ff3b00' : '#ffd700',
          life: 0.65,
          maxLife: 0.65,
          size: 6 + Math.random() * 6
        });
      }
    }, 420);
  }

  function castDash() {
    if (player.cooldowns.dash > 0) return;
    player.cooldowns.dash = player.maxCooldowns.dash;

    let dx = 0, dy = 0;
    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    if (dx === 0 && dy === 0) {
      const angle = Math.atan2(mouse.worldY - player.y, mouse.worldX - player.x);
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    player.x += dx * 180;
    player.y += dy * 180;

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: player.x - dx * (i * 20),
        y: player.y - dy * (i * 20),
        vx: 0,
        vy: 0,
        color: 'rgba(255, 255, 255, 0.4)',
        life: 0.25,
        maxLife: 0.25,
        size: 16
      });
    }
  }

  // ==========================================
  // 6. UPDATE LOOP
  // ==========================================
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;

  function update(dt) {
    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;

    player.isMoving = mx !== 0 || my !== 0;
    if (player.isMoving) {
      const len = Math.hypot(mx, my);
      player.vx = (mx / len) * player.speed;
      player.vy = (my / len) * player.speed;

      if (Math.abs(mx) > Math.abs(my)) {
        player.facing = mx > 0 ? 'right' : 'left';
      } else {
        player.facing = my > 0 ? 'down' : 'up';
      }

      player.x = Math.max(60, Math.min(WORLD_SIZE - 60, player.x + player.vx * dt));
      player.y = Math.max(60, Math.min(WORLD_SIZE - 60, player.y + player.vy * dt));

      player.animTimer += dt * 9;
      player.animFrame = Math.floor(player.animTimer) % 6;
    } else {
      player.vx = 0;
      player.vy = 0;
      player.animTimer += dt * 3;
      player.animFrame = Math.floor(player.animTimer) % 3;
    }

    for (let k in player.cooldowns) {
      if (player.cooldowns[k] > 0) player.cooldowns[k] = Math.max(0, player.cooldowns[k] - dt);
    }
    player.mana = Math.min(player.maxMana, player.mana + 10 * dt);
    player.life = Math.min(player.maxLife, player.life + 4 * dt);

    if (mouse.isDown && player.cooldowns.slash <= 0) {
      castSlash();
    }

    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
    camera.x = Math.max(0, Math.min(WORLD_SIZE - canvas.width, camera.x));
    camera.y = Math.max(0, Math.min(WORLD_SIZE - canvas.height, camera.y));

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      let hit = false;
      monsters.forEach(m => {
        if (m.isAlive && !hit) {
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d < 28 * (m.scale || 1)) {
            dealDamage(m, 10, 85, 0, 0, 0);
            hit = true;
          }
        }
      });

      if (hit || p.life <= 0) {
        for (let k = 0; k < 12; k++) {
          particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 180,
            vy: (Math.random() - 0.5) * 180,
            color: '#ff5722',
            life: 0.3,
            maxLife: 0.3,
            size: 5
          });
        }
        projectiles.splice(i, 1);
      }
    }

    // Monster AI
    monsters.forEach(m => {
      if (!m.isAlive) return;
      if (m.hurtTimer > 0) m.hurtTimer -= dt;
      m.animTimer += dt * 6;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);
      if (dist < 400 && dist > 35) {
        const angle = Math.atan2(player.y - m.y, player.x - m.x);
        m.x += Math.cos(angle) * m.speed * dt;
        m.y += Math.sin(angle) * m.speed * dt;
      }
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    updateUI();
  }

  function updateUI() {
    document.getElementById('bar-es').style.width = `${(player.es / player.maxEs) * 100}%`;
    document.getElementById('text-es').innerText = `ES: ${Math.round(player.es)} / ${player.maxEs}`;

    document.getElementById('bar-life').style.width = `${(player.life / player.maxLife) * 100}%`;
    document.getElementById('text-life').innerText = `HP: ${Math.round(player.life)} / ${player.maxLife}`;

    document.getElementById('bar-mana').style.width = `${(player.mana / player.maxMana) * 100}%`;
    document.getElementById('text-mana').innerText = `MP: ${Math.round(player.mana)} / ${player.maxMana}`;

    for (let k in player.cooldowns) {
      const el = document.getElementById(`cd-${k}`);
      if (el) {
        const pct = (player.cooldowns[k] / player.maxCooldowns[k]) * 100;
        el.style.height = `${pct}%`;
      }
    }
  }

  // ==========================================
  // 7. RENDERING (Seamless Grass & Transparent PNGs)
  // ==========================================
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw Seamless Pixel-Art Ground (Clean Grass & Paths)
    drawSeamlessGround();

    // 2. Y-Sorting Render Queue
    const renderList = [];

    props.forEach(p => {
      renderList.push({ y: p.y, render: () => drawPropPng(p) });
    });

    monsters.forEach(m => {
      if (m.isAlive) {
        renderList.push({ y: m.y, render: () => drawMonsterPng(m) });
      }
    });

    renderList.push({ y: player.y, render: () => drawPlayerPng() });

    renderList.sort((a, b) => a.y - b.y);
    renderList.forEach(item => item.render());

    // 3. Projectiles
    projectiles.forEach(p => {
      ctx.fillStyle = '#ff7849';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Particles
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      if (pt.isRing) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }
    });

    // 5. Floating Text
    floatingTexts.forEach(ft => {
      ctx.font = ft.isCrit ? 'bold 16px "Press Start 2P", monospace' : 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore();

    renderMinimap();
  }

  // Seamless Pixel-Art Grass & Dirt Tilemap (No White Grid Borders!)
  function drawSeamlessGround() {
    const startX = Math.floor(camera.x / TILE_SIZE) * TILE_SIZE;
    const endX = startX + canvas.width + TILE_SIZE * 2;
    const startY = Math.floor(camera.y / TILE_SIZE) * TILE_SIZE;
    const endY = startY + canvas.height + TILE_SIZE * 2;

    for (let x = startX; x < endX; x += TILE_SIZE) {
      for (let y = startY; y < endY; y += TILE_SIZE) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        // Base Grass Palette
        if (rand > 0.82) {
          ctx.fillStyle = '#4c7328'; // Dark shade
        } else if (rand > 0.65) {
          ctx.fillStyle = '#618c35'; // Vibrant blade
        } else {
          ctx.fillStyle = '#557d2f'; // Primary grass
        }
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Grass Tufts & Flower details
        if (rand > 0.90) {
          // Yellow / Red Flower
          ctx.fillStyle = rand > 0.95 ? '#ffd700' : '#e06c75';
          ctx.fillRect(x + 16, y + 16, 4, 4);
          ctx.fillStyle = '#3e5c1e';
          ctx.fillRect(x + 18, y + 20, 2, 4);
        } else if (rand > 0.78) {
          // Tiny Grass Blade
          ctx.fillStyle = '#6fa13d';
          ctx.fillRect(x + 8, y + 12, 2, 6);
          ctx.fillRect(x + 12, y + 10, 2, 8);
        }
      }
    }
  }

  // Draw Player from Transparent character_spritesheet.png
  function drawPlayerPng() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = assets.hero;
    if (img.complete && img.naturalWidth > 0) {
      const frameW = img.naturalWidth / 6;
      const frameH = img.naturalHeight / 4;

      let row = 1;
      let col = player.animFrame;

      if (!player.isMoving) {
        row = 0;
        col = player.facing === 'right' ? 3 : (player.facing === 'left' ? 4 : (player.facing === 'up' ? 1 : 0));
      } else {
        if (player.facing === 'down') row = 1;
        else if (player.facing === 'up') row = 2;
        else row = 3;
      }

      const sx = col * frameW;
      const sy = row * frameH;
      const destW = 56;
      const destH = 56;

      if (player.facing === 'left') {
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
        ctx.scale(-1, 1);
      } else {
        ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
      }
    } else {
      ctx.fillStyle = '#2b5c8f';
      ctx.fillRect(-12, -12, 24, 24);
    }

    // Nameplate
    ctx.font = '10px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Vanguard Hero [Lvl.99]', 0, -42);

    ctx.restore();
  }

  // Draw Monster from Transparent monsters_pack.png
  function drawMonsterPng(m) {
    ctx.save();
    ctx.translate(m.x, m.y);

    const scale = m.scale || 1.2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * scale, 14 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = assets.monsters;
    if (img.complete && img.naturalWidth > 0) {
      const colW = img.naturalWidth / 7;
      const rowH = img.naturalHeight / 4;

      let row = 0;
      if (m.type === 'skeleton') row = 1;
      else if (m.type === 'goblin') row = 2;
      else if (m.type === 'boss') row = 3;

      let col = Math.floor(m.animTimer) % 2;
      if (m.hurtTimer > 0) col = 5;

      const sx = col * colW;
      const sy = row * rowH;
      const dw = 50 * scale;
      const dh = 50 * scale;

      ctx.drawImage(img, sx, sy, colW, rowH, -dw / 2, -dh + 18 * scale, dw, dh);
    } else {
      ctx.fillStyle = m.type === 'slime' ? '#98c379' : '#dcdfe4';
      ctx.beginPath();
      ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar
    const hpPct = Math.max(0, m.life / m.maxLife);
    const barW = 34 * scale;
    ctx.fillStyle = '#1e222b';
    ctx.fillRect(-barW / 2, -32 * scale, barW, 5);
    ctx.fillStyle = hpPct > 0.5 ? '#98c379' : '#e06c75';
    ctx.fillRect(-barW / 2 + 1, -32 * scale + 1, (barW - 2) * hpPct, 3);

    // Name Tag
    ctx.font = m.type === 'boss' ? 'bold 11px "Outfit", sans-serif' : '9px "Outfit", sans-serif';
    ctx.fillStyle = m.type === 'boss' ? '#ffd700' : '#abb2bf';
    ctx.textAlign = 'center';
    ctx.fillText(m.name, 0, -36 * scale);

    ctx.restore();
  }

  // Draw Props from Transparent world_tileset.png
  function drawPropPng(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    const img = assets.tileset;
    if (img.complete && img.naturalWidth > 0) {
      if (p.type === 'tree') {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(img, 60, 520, 175, 200, -50, -110, 100, 120);
      } else if (p.type === 'rock') {
        ctx.drawImage(img, 60, 735, 130, 115, -28, -24, 56, 48);
      } else if (p.type === 'campfire') {
        ctx.drawImage(img, 520, 755, 130, 125, -30, -30, 60, 60);
      } else if (p.type === 'chest') {
        ctx.drawImage(img, 700, 885, 100, 60, -22, -14, 44, 28);
      } else {
        ctx.drawImage(img, 385, 735, 60, 65, -15, -18, 30, 34);
      }
    } else {
      ctx.fillStyle = '#6b4f2c';
      ctx.fillRect(-6, -10, 12, 24);
    }

    ctx.restore();
  }

  // Minimap
  function renderMinimap() {
    mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    const scaleX = minimapCanvas.width / WORLD_SIZE;
    const scaleY = minimapCanvas.height / WORLD_SIZE;

    monsters.forEach(m => {
      if (m.isAlive) {
        mmCtx.fillStyle = m.type === 'boss' ? '#ffd700' : '#e06c75';
        const sz = m.type === 'boss' ? 5 : 3;
        mmCtx.fillRect(m.x * scaleX - 1, m.y * scaleY - 1, sz, sz);
      }
    });

    mmCtx.fillStyle = '#61afef';
    mmCtx.beginPath();
    mmCtx.arc(player.x * scaleX, player.y * scaleY, 4, 0, Math.PI * 2);
    mmCtx.fill();
  }

  // Main Loop
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    frameCount++;
    fpsTimer += dt;
    if (fpsTimer >= 1.0) {
      document.getElementById('fps-counter').innerText = `${frameCount} FPS`;
      frameCount = 0;
      fpsTimer = 0;
    }

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // Input Listeners
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyQ') castFireball();
    if (e.code === 'KeyW') castFrostNova();
    if (e.code === 'KeyE') castMeteor();
    if (e.code === 'Space') castDash();
    if (e.code === 'KeyC') toggleModal('stats-modal');
    if (e.code === 'KeyI') toggleModal('inventory-modal');
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.worldX = mouse.x + camera.x;
    mouse.worldY = mouse.y + camera.y;
  });

  window.addEventListener('mousedown', e => {
    if (e.button === 0 && e.target === canvas) {
      mouse.isDown = true;
      castSlash();
    }
  });

  window.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.isDown = false;
  });

  function toggleModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
  }

  document.getElementById('btn-toggle-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-close-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-toggle-inventory').addEventListener('click', () => toggleModal('inventory-modal'));
  document.getElementById('btn-close-inventory').addEventListener('click', () => toggleModal('inventory-modal'));

  document.getElementById('btn-spawn-monster').addEventListener('click', () => {
    spawnMonsterCluster(player.x + (Math.random() - 0.5) * 350, player.y + (Math.random() - 0.5) * 350, 4);
  });

  document.getElementById('slot-slash').addEventListener('click', castSlash);
  document.getElementById('slot-fireball').addEventListener('click', castFireball);
  document.getElementById('slot-frost').addEventListener('click', castFrostNova);
  document.getElementById('slot-meteor').addEventListener('click', castMeteor);
  document.getElementById('slot-dash').addEventListener('click', castDash);

  initWorld();
  requestAnimationFrame(gameLoop);
})();
