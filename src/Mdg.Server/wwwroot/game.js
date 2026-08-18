/**
 * MDG: Aethelis - 2D Top-Down Pixel Art ARPG Engine
 * Seamless Natural Terrain, 4000x4000 World Map & Smooth Dynamic Zoom (In/Out)
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

  // World & Camera Settings (Expanded to 4000x4000)
  const WORLD_SIZE = 4000;
  const TILE_SIZE = 64;

  const camera = {
    x: 2000,
    y: 2000,
    zoom: 1.0,
    targetZoom: 1.0,
    minZoom: 0.45,
    maxZoom: 2.0
  };

  // ==========================================
  // 1. ASSET LOADER (Clean Transparent PNGs)
  // ==========================================
  const assets = {
    hero: new Image(),
    monsters: new Image(),
    props: new Image(),
    loaded: 0
  };

  function onAssetLoad() {
    assets.loaded++;
  }

  const cacheBust = '?v=' + Date.now();
  assets.hero.onload = onAssetLoad;
  assets.hero.src = '/assets/character_spritesheet.png' + cacheBust;

  assets.monsters.onload = onAssetLoad;
  assets.monsters.src = '/assets/monsters_pack.png' + cacheBust;

  assets.props.onload = onAssetLoad;
  assets.props.src = '/assets/props_pack.png' + cacheBust;

  // ==========================================
  // 2. ZONE DEFINITIONS (4000x4000 Layout)
  // ==========================================
  const ZONES = {
    SanctuaryHaven: {
      id: 'SanctuaryHaven',
      name: 'Sanctuary Haven',
      subtitle: '🌿 Vùng Đất Khởi Đầu - Thị Trấn An Toàn (4000x4000)',
      levelRange: 'Lv. 1-5',
      portals: [
        { x: 3200, y: 2000, targetZone: 'WhisperingPlains', targetX: 600, targetY: 2000, name: '🌀 Đến Whispering Plains' }
      ],
      npcs: [
        { x: 1900, y: 1900, name: 'Rèn Cổ (Blacksmith)', title: 'Thợ Rèn', color: '#e5c07b' },
        { x: 2100, y: 1900, name: 'Học Giả Aethel (Sage)', title: 'Nhiệm Vụ', color: '#61afef' }
      ],
      props: [
        { x: 2000, y: 2000, type: 'campfire' },
        { x: 1850, y: 1880, type: 'chest' },
        { x: 1880, y: 1940, type: 'barrel' },
        { x: 2120, y: 1940, type: 'barrel' },
        { x: 1600, y: 1600, type: 'tree' },
        { x: 2400, y: 1600, type: 'tree' },
        { x: 1500, y: 2300, type: 'rock' },
        { x: 2500, y: 2300, type: 'rock' }
      ],
      dummies: [
        { x: 1900, y: 2150, name: 'Bù Nhìn Gỗ (Dummy 1)' },
        { x: 2100, y: 2150, name: 'Bù Nhìn Gỗ (Dummy 2)' }
      ]
    },

    WhisperingPlains: {
      id: 'WhisperingPlains',
      name: 'Whispering Plains',
      subtitle: '🌾 Đồng Cỏ Thì Thầm - Bãi Săn Quái Bạt Ngàn (4000x4000)',
      levelRange: 'Lv. 5-15',
      portals: [
        { x: 500, y: 2000, targetZone: 'SanctuaryHaven', targetX: 3000, targetY: 2000, name: '🌀 Về Sanctuary Haven' },
        { x: 3500, y: 2000, targetZone: 'ForgottenCrypt', targetX: 600, targetY: 2000, name: '🌀 Cổng vào Forgotten Crypt' }
      ],
      props: [],
      dummies: []
    },

    ForgottenCrypt: {
      id: 'ForgottenCrypt',
      name: 'Forgotten Crypt',
      subtitle: '🏰 Hầm Ngục Cổ Đại - Hang Ổ Shadow Fiend Boss (4000x4000)',
      levelRange: 'Lv. 15-25',
      portals: [
        { x: 500, y: 2000, targetZone: 'WhisperingPlains', targetX: 3300, targetY: 2000, name: '🌀 Thoát Khỏi Hầm Ngục' }
      ],
      props: [],
      dummies: []
    }
  };

  let currentZoneId = 'SanctuaryHaven';
  let currentZone = ZONES[currentZoneId];

  // ==========================================
  // 3. PLAYER STATE (PoE Stats)
  // ==========================================
  const player = {
    x: 2000,
    y: 2000,
    vx: 0,
    vy: 0,
    speed: 280,
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

  // Dynamic World Entities
  const monsters = [];
  const trainingDummies = [];
  const npcs = [];
  const portals = [];
  const props = [];
  const projectiles = [];
  const particles = [];
  const floatingTexts = [];

  // Input State
  const keys = {};
  const mouse = { x: 0, y: 0, worldX: 2000, worldY: 2000, isDown: false };

  // ==========================================
  // 4. ZONE LOADING & WORLD GENERATION
  // ==========================================
  function loadZone(zoneId, spawnX, spawnY) {
    if (!ZONES[zoneId]) return;
    currentZoneId = zoneId;
    currentZone = ZONES[zoneId];

    monsters.length = 0;
    trainingDummies.length = 0;
    npcs.length = 0;
    portals.length = 0;
    props.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    floatingTexts.length = 0;

    player.x = spawnX !== undefined ? spawnX : 2000;
    player.y = spawnY !== undefined ? spawnY : 2000;

    currentZone.portals.forEach(p => portals.push({ ...p }));

    if (currentZone.npcs) {
      currentZone.npcs.forEach(n => npcs.push({ ...n }));
    }

    if (currentZone.dummies) {
      currentZone.dummies.forEach(d => {
        trainingDummies.push({
          x: d.x,
          y: d.y,
          name: d.name,
          life: 99999,
          maxLife: 99999,
          armor: 200,
          isAlive: true,
          hurtTimer: 0
        });
      });
    }

    // Generate Props across expanded 4000x4000 map
    if (currentZone.props && currentZone.props.length > 0) {
      currentZone.props.forEach(pr => props.push({ ...pr }));
    }

    const propCount = currentZone.id === 'ForgottenCrypt' ? 60 : 120;
    for (let i = 0; i < propCount; i++) {
      let type = 'tree';
      if (currentZone.id === 'ForgottenCrypt') {
        type = Math.random() < 0.7 ? 'rock' : 'chest';
      } else {
        type = Math.random() < 0.65 ? 'tree' : (Math.random() < 0.85 ? 'rock' : 'barrel');
      }

      const px = Math.random() * (WORLD_SIZE - 400) + 200;
      const py = Math.random() * (WORLD_SIZE - 400) + 200;

      // Don't spawn props directly on center spawn
      if (Math.hypot(px - 2000, py - 2000) > 200) {
        props.push({ x: px, y: py, type: type });
      }
    }

    // Spawn Monsters across Expanded Map
    if (currentZone.id === 'WhisperingPlains') {
      spawnMonsterCluster(1200, 1200, 6);
      spawnMonsterCluster(2800, 1400, 7);
      spawnMonsterCluster(1800, 2800, 8);
      spawnMonsterCluster(3200, 2600, 6);
      spawnMonsterCluster(1000, 3000, 5);
    } else if (currentZone.id === 'ForgottenCrypt') {
      spawnMonsterCluster(1200, 1500, 8);
      spawnMonsterCluster(2200, 1200, 8);
      spawnMonsterCluster(2600, 2800, 10);
      spawnMonster(3200, 2000, 'boss'); // Boss in Throne Chamber
    }

    showZoneBanner(currentZone.name, currentZone.subtitle);
    document.getElementById('hud-zone-tag').innerText = `📍 ${currentZone.name}`;
    document.getElementById('minimap-zone-title').innerText = currentZone.name.toUpperCase();

    document.querySelectorAll('.zone-node').forEach(node => {
      node.classList.toggle('active-node', node.getAttribute('data-zone') === currentZoneId);
    });
  }

  function showZoneBanner(title, sub) {
    const banner = document.getElementById('zone-banner');
    document.getElementById('zone-banner-title').innerText = title.toUpperCase();
    document.getElementById('zone-banner-sub').innerText = sub;
    banner.classList.remove('zone-banner-hide');

    clearTimeout(banner._timeout);
    banner._timeout = setTimeout(() => {
      banner.classList.add('zone-banner-hide');
    }, 3500);
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
      name: isBoss ? '🔥 Dark Shadow Fiend (Boss)' : (type === 'slime' ? 'Toxic Slime' : (type === 'skeleton' ? 'Skeleton Warrior' : 'Goblin Scout')),
      maxLife: isBoss ? 1800 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
      life: isBoss ? 1800 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
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
    const types = currentZone.id === 'ForgottenCrypt' ? ['skeleton', 'goblin'] : ['slime', 'goblin'];
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      spawnMonster(cx + (Math.random() - 0.5) * 320, cy + (Math.random() - 0.5) * 320, type);
    }
  }

  // ==========================================
  // 5. COMBAT PIPELINE (PoE Mitigation)
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

    if (target.life < 90000) {
      target.life -= totalDamage;
    }
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

    if (target.life <= 0 && target.life < 90000) {
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
  // 6. SKILLS
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

    trainingDummies.forEach(d => {
      const dist = Math.hypot(d.x - slashX, d.y - slashY);
      if (dist < reach) {
        dealDamage(d, 50, 20, 0, 0, 0);
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

    trainingDummies.forEach(d => {
      const dist = Math.hypot(d.x - player.x, d.y - player.y);
      if (dist <= novaRadius) {
        dealDamage(d, 15, 0, 90, 0, 0);
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

      trainingDummies.forEach(d => {
        const dist = Math.hypot(d.x - targetX, d.y - targetY);
        if (dist <= radius) {
          dealDamage(d, 50, 180, 0, 0, 30);
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

    player.x += dx * 190;
    player.y += dy * 190;

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
  // 7. UPDATE LOOP & SMOOTH ZOOM
  // ==========================================
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;

  function update(dt) {
    // Smooth Camera Zoom Interpolation
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.12;

    // Movement
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

      player.x = Math.max(80, Math.min(WORLD_SIZE - 80, player.x + player.vx * dt));
      player.y = Math.max(80, Math.min(WORLD_SIZE - 80, player.y + player.vy * dt));

      player.animTimer += dt * 8;
      player.animFrame = Math.floor(player.animTimer) % 4;
    } else {
      player.vx = 0;
      player.vy = 0;
      player.animTimer += dt * 2;
      player.animFrame = 0;
    }

    // Portals
    portals.forEach(p => {
      const dist = Math.hypot(player.x - p.x, player.y - p.y);
      if (dist < 55) {
        loadZone(p.targetZone, p.targetX, p.targetY);
      }
    });

    // Cooldowns & Regen
    for (let k in player.cooldowns) {
      if (player.cooldowns[k] > 0) player.cooldowns[k] = Math.max(0, player.cooldowns[k] - dt);
    }
    player.mana = Math.min(player.maxMana, player.mana + 10 * dt);
    player.life = Math.min(player.maxLife, player.life + 4 * dt);

    if (mouse.isDown && player.cooldowns.slash <= 0) {
      castSlash();
    }

    // Camera follow player
    camera.x = player.x;
    camera.y = player.y;

    // Recalculate Mouse World Coordinates with dynamic zoom
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    mouse.worldX = player.x + (mouse.x - centerX) / camera.zoom;
    mouse.worldY = player.y + (mouse.y - centerY) / camera.zoom;

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

      trainingDummies.forEach(d => {
        if (!hit) {
          const dist = Math.hypot(d.x - p.x, d.y - p.y);
          if (dist < 28) {
            dealDamage(d, 10, 85, 0, 0, 0);
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
      m.animTimer += dt * 5;

      const dist = Math.hypot(player.x - m.x, player.y - m.y);
      if (dist < 450 && dist > 35) {
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

    document.getElementById('zoom-level-text').innerText = `${Math.round(camera.zoom * 100)}%`;

    for (let k in player.cooldowns) {
      const el = document.getElementById(`cd-${k}`);
      if (el) {
        const pct = (player.cooldowns[k] / player.maxCooldowns[k]) * 100;
        el.style.height = `${pct}%`;
      }
    }
  }

  // ==========================================
  // 8. NATURAL TERRAIN & ZOOMED RENDERING
  // ==========================================
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center camera on screen and apply dynamic zoom
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-player.x, -player.y);

    // 1. Draw Seamless Natural Terrain (Zero Checkerboard)
    drawSeamlessTerrain();

    // 2. Y-Sorting Render Queue
    const renderList = [];

    portals.forEach(p => {
      renderList.push({ y: p.y, render: () => drawPortal(p) });
    });

    props.forEach(p => {
      renderList.push({ y: p.y, render: () => drawPropClean(p) });
    });

    npcs.forEach(n => {
      renderList.push({ y: n.y, render: () => drawNpc(n) });
    });

    trainingDummies.forEach(d => {
      renderList.push({ y: d.y, render: () => drawDummy(d) });
    });

    monsters.forEach(m => {
      if (m.isAlive) {
        renderList.push({ y: m.y, render: () => drawMonsterClean(m) });
      }
    });

    renderList.push({ y: player.y, render: () => drawPlayerClean() });

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

    // 5. Floating Damage Text
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

  // Draw Natural Seamless Terrain (No Grid Lines, Soft Color Blends)
  function drawSeamlessTerrain() {
    const viewW = canvas.width / camera.zoom;
    const viewH = canvas.height / camera.zoom;
    const startX = Math.max(0, Math.floor((player.x - viewW / 2) / TILE_SIZE) * TILE_SIZE);
    const endX = Math.min(WORLD_SIZE, startX + viewW + TILE_SIZE * 2);
    const startY = Math.max(0, Math.floor((player.y - viewH / 2) / TILE_SIZE) * TILE_SIZE);
    const endY = Math.min(WORLD_SIZE, startY + viewH + TILE_SIZE * 2);

    const isCrypt = currentZone.id === 'ForgottenCrypt';
    const isHaven = currentZone.id === 'SanctuaryHaven';

    // 1. Fill base solid field for the whole visible screen first
    ctx.fillStyle = isCrypt ? '#241b2f' : '#4d752c';
    ctx.fillRect(startX - 10, startY - 10, endX - startX + 20, endY - startY + 20);

    // 2. Draw organic features
    for (let x = startX; x < endX; x += TILE_SIZE) {
      for (let y = startY; y < endY; y += TILE_SIZE) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        if (isCrypt) {
          // Crypt: Dark slate tiles with subtle moss
          if (rand > 0.6) {
            ctx.fillStyle = '#2f233d';
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          }
          if (rand > 0.85) {
            ctx.fillStyle = '#3d2e50';
            ctx.fillRect(x + 14, y + 14, 12, 12);
          }
        } else if (isHaven) {
          // Sanctuary Haven: Cobblestone town plaza in center
          const distToCenter = Math.hypot(x - 2000, y - 2000);
          if (distToCenter < 240) {
            ctx.fillStyle = '#6b7280';
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.fillStyle = '#565d6b';
            ctx.fillRect(x + 12, y + 12, 24, 24);
          } else {
            // Soft Meadow & subtle grass tufts
            if (rand > 0.7) {
              ctx.fillStyle = '#588334';
              ctx.fillRect(x + 10, y + 12, 4, 8);
              ctx.fillRect(x + 14, y + 10, 4, 10);
            }
            if (rand > 0.92) {
              ctx.fillStyle = '#ffd700'; // Yellow daisy
              ctx.fillRect(x + 24, y + 24, 5, 5);
            }
          }
        } else {
          // Whispering Plains: Seamless emerald wilderness
          if (rand > 0.65) {
            ctx.fillStyle = '#598436';
            ctx.fillRect(x + 8, y + 14, 4, 8);
            ctx.fillRect(x + 14, y + 10, 4, 12);
          }
          if (rand > 0.90) {
            ctx.fillStyle = rand > 0.95 ? '#ff416c' : '#ffd700';
            ctx.fillRect(x + 22, y + 22, 6, 6);
          }
        }
      }
    }
  }

  // Draw Clean Player
  function drawPlayerClean() {
    ctx.save();
    ctx.translate(player.x, player.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 20, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = assets.hero;
    if (img.complete && img.naturalWidth > 0) {
      const frameW = img.naturalWidth / 4;
      const frameH = img.naturalHeight / 4;

      let row = 0;
      let col = player.isMoving ? (player.animFrame % 3) : 0;

      if (player.facing === 'down') row = 0;
      else if (player.facing === 'up') row = 1;
      else if (player.facing === 'right') row = 2;
      else if (player.facing === 'left') row = 3;

      const sx = col * frameW;
      const sy = row * frameH;
      const destW = 56;
      const destH = 56;

      ctx.drawImage(img, sx, sy, frameW, frameH, -destW / 2, -destH + 20, destW, destH);
    } else {
      ctx.fillStyle = '#2b5c8f';
      ctx.fillRect(-12, -12, 24, 24);
    }

    ctx.font = '10px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Vanguard Hero [Lvl.99]', 0, -42);

    ctx.restore();
  }

  // Draw Clean Monster
  function drawMonsterClean(m) {
    ctx.save();
    ctx.translate(m.x, m.y);

    const scale = m.scale || 1.2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16 * scale, 14 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = assets.monsters;
    if (img.complete && img.naturalWidth > 0) {
      const colW = img.naturalWidth / 4;
      const rowH = img.naturalHeight / 4;

      let sx = 0, sy = 0;
      const isMoving = Math.floor(m.animTimer) % 2 === 1;

      if (m.type === 'slime') {
        sx = (isMoving ? 1 : 0) * colW;
        sy = 0 * rowH;
      } else if (m.type === 'skeleton') {
        sx = (isMoving ? 3 : 2) * colW;
        sy = 0 * rowH;
      } else if (m.type === 'goblin') {
        sx = (isMoving ? 1 : 0) * colW;
        sy = 2 * rowH;
      } else {
        sx = (isMoving ? 3 : 2) * colW;
        sy = 2 * rowH;
      }

      const dw = 52 * scale;
      const dh = 52 * scale;

      ctx.drawImage(img, sx, sy, colW, rowH, -dw / 2, -dh + 18 * scale, dw, dh);
    } else {
      ctx.fillStyle = m.type === 'slime' ? '#98c379' : '#dcdfe4';
      ctx.beginPath();
      ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    const hpPct = Math.max(0, m.life / m.maxLife);
    const barW = 34 * scale;
    ctx.fillStyle = '#1e222b';
    ctx.fillRect(-barW / 2, -34 * scale, barW, 5);
    ctx.fillStyle = hpPct > 0.5 ? '#98c379' : '#e06c75';
    ctx.fillRect(-barW / 2 + 1, -34 * scale + 1, (barW - 2) * hpPct, 3);

    ctx.font = m.type === 'boss' ? 'bold 11px "Outfit", sans-serif' : '9px "Outfit", sans-serif';
    ctx.fillStyle = m.type === 'boss' ? '#e5c07b' : '#abb2bf';
    ctx.textAlign = 'center';
    ctx.fillText(m.name, 0, -38 * scale);

    ctx.restore();
  }

  // Draw Clean Props
  function drawPropClean(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    const img = assets.props;
    if (img.complete && img.naturalWidth > 0) {
      const W = img.naturalWidth;
      const H = img.naturalHeight;

      if (p.type === 'tree') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 36, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(img, W * 0.05, H * 0.02, W * 0.55, H * 0.48, -55, -120, 110, 130);
      } else if (p.type === 'rock') {
        ctx.drawImage(img, W * 0.60, H * 0.01, W * 0.38, H * 0.36, -30, -26, 60, 52);
      } else if (p.type === 'barrel') {
        ctx.drawImage(img, W * 0.01, H * 0.38, W * 0.28, H * 0.34, -18, -20, 36, 42);
      } else if (p.type === 'chest') {
        ctx.drawImage(img, W * 0.64, H * 0.46, W * 0.26, H * 0.26, -22, -16, 44, 32);
      } else if (p.type === 'campfire') {
        ctx.drawImage(img, W * 0.35, H * 0.70, W * 0.30, H * 0.28, -32, -32, 64, 64);
      }
    } else {
      ctx.fillStyle = '#6b4f2c';
      ctx.fillRect(-6, -10, 12, 24);
    }

    ctx.restore();
  }

  // Draw Glowing Portal
  function drawPortal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    const pulse = (Math.sin(performance.now() / 250) + 1) * 0.5;

    const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 38);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#c678dd');
    grad.addColorStop(0.8, '#61afef');
    grad.addColorStop(1, 'rgba(97, 175, 239, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 32 + pulse * 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e5c07b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '10px "Outfit", sans-serif';
    ctx.fillStyle = '#e5c07b';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, 0, -36);

    ctx.restore();
  }

  function drawNpc(n) {
    ctx.save();
    ctx.translate(n.x, n.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = n.color || '#e5c07b';
    ctx.fillRect(-8, -12, 16, 24);
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(-6, -22, 12, 10);
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(-4, -18, 2, 2);
    ctx.fillRect(2, -18, 2, 2);

    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'center';
    ctx.fillText(`«${n.title}»`, 0, -38);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(n.name, 0, -26);

    ctx.restore();
  }

  function drawDummy(d) {
    ctx.save();
    ctx.translate(d.x, d.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8c6239';
    ctx.fillRect(-6, -16, 12, 28);
    ctx.fillStyle = '#d19a66';
    ctx.fillRect(-12, -8, 24, 6);

    ctx.font = '9px "Outfit", sans-serif';
    ctx.fillStyle = '#abb2bf';
    ctx.textAlign = 'center';
    ctx.fillText(d.name, 0, -26);

    ctx.restore();
  }

  // Minimap with 4000x4000 Scaling
  function renderMinimap() {
    mmCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height);
    const scaleX = minimapCanvas.width / WORLD_SIZE;
    const scaleY = minimapCanvas.height / WORLD_SIZE;

    // Portals
    portals.forEach(p => {
      mmCtx.fillStyle = '#c678dd';
      mmCtx.beginPath();
      mmCtx.arc(p.x * scaleX, p.y * scaleY, 4, 0, Math.PI * 2);
      mmCtx.fill();
    });

    // Monsters
    monsters.forEach(m => {
      if (m.isAlive) {
        mmCtx.fillStyle = m.type === 'boss' ? '#ffd700' : '#e06c75';
        const sz = m.type === 'boss' ? 5 : 3;
        mmCtx.fillRect(m.x * scaleX - 1, m.y * scaleY - 1, sz, sz);
      }
    });

    // Player Dot
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

  // ==========================================
  // 9. INPUT & ZOOM LISTENERS
  // ==========================================
  // Mouse Wheel Zoom In / Out
  window.addEventListener('wheel', e => {
    // Only zoom when not scrolling inside modals
    if (document.querySelector('.worldmap-modal-wrap:not(.hidden)')) return;
    
    e.preventDefault();
    const zoomFactor = -Math.sign(e.deltaY) * 0.15;
    camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.targetZoom + zoomFactor));
  }, { passive: false });

  // Zoom Buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    camera.targetZoom = Math.min(camera.maxZoom, camera.targetZoom + 0.25);
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    camera.targetZoom = Math.max(camera.minZoom, camera.targetZoom - 0.25);
  });
  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    camera.targetZoom = 1.0;
  });

  window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyQ') castFireball();
    if (e.code === 'KeyW') castFrostNova();
    if (e.code === 'KeyE') castMeteor();
    if (e.code === 'Space') castDash();
    if (e.code === 'KeyM') toggleModal('worldmap-modal');
    if (e.code === 'KeyC') toggleModal('stats-modal');
    if (e.code === 'KeyI') toggleModal('inventory-modal');
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
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

  document.getElementById('btn-toggle-worldmap').addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-close-worldmap').addEventListener('click', () => toggleModal('worldmap-modal'));
  document.getElementById('btn-toggle-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-close-stats').addEventListener('click', () => toggleModal('stats-modal'));
  document.getElementById('btn-toggle-inventory').addEventListener('click', () => toggleModal('inventory-modal'));
  document.getElementById('btn-close-inventory').addEventListener('click', () => toggleModal('inventory-modal'));

  document.getElementById('btn-spawn-monster').addEventListener('click', () => {
    spawnMonsterCluster(player.x + (Math.random() - 0.5) * 400, player.y + (Math.random() - 0.5) * 400, 5);
  });

  document.querySelectorAll('.zone-node').forEach(node => {
    node.addEventListener('click', () => {
      const zone = node.getAttribute('data-zone');
      if (zone === 'MoltenCaldera') {
        alert('Khu vực Molten Caldera (Lv. 35+) hiện đang bị phong ấn bởi ma thuật cổ!');
        return;
      }
      toggleModal('worldmap-modal');
      loadZone(zone);
    });
  });

  document.getElementById('slot-slash').addEventListener('click', castSlash);
  document.getElementById('slot-fireball').addEventListener('click', castFireball);
  document.getElementById('slot-frost').addEventListener('click', castFrostNova);
  document.getElementById('slot-meteor').addEventListener('click', castMeteor);
  document.getElementById('slot-dash').addEventListener('click', castDash);

  loadZone('SanctuaryHaven', 2000, 2000);
  requestAnimationFrame(gameLoop);
})();
