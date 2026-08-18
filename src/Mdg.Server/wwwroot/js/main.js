/**
 * MDG: Aethelis - 2D Top-Down Pixel Art ARPG Engine
 * Main Orchestrator, Server-Authoritative Map Loader, Collision & Environmental Biome Hazards
 */

import { TILE_SIZE, camera, player, monsters, trainingDummies, npcs, portals, props, projectiles, particles, floatingTexts, groundLoot, keys, mouse } from './state.js';
import { ZONES } from './data/zones.js';
import { POSSIBLE_LOOT } from './data/items.js';
import { SKILLS } from './data/skills.js';
import { AudioEngine } from './audio.js';
import { renderGame } from './renderer.js';
import { castSlash, castFireball, castFrostNova, castMeteor, castDash, spawnDamageNumber, updateTargetAilments } from './combat.js';
import { updateBackpackUI, updatePaperdollUI, pickUpLoot } from './ui/inventory.js';
import { addSkillExp, updateSkillBadges, renderSkillUpgradeModal } from './ui/skills-ui.js';
import { showZoneBanner, setupUIListeners, toggleModal, updateExpBar, updateHudAvatar } from './ui/hud.js';
import { saveToDatabase, loadFromDatabase, startAutoSave } from './save-system.js';
import { MapGenerator } from './map-generator.js';

window.keys = keys;

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

let currentZoneId = 'SanctuaryHaven';
let currentZone = ZONES[currentZoneId];
let currentZoneMap = null;
window.currentZoneId = currentZoneId;

export function canWalk(x, y) {
  if (!currentZoneMap || !currentZoneMap.grid) return true;
  const tx = Math.floor(x / 48);
  const ty = Math.floor(y / 48);
  if (ty < 0 || ty >= currentZoneMap.heightInTiles || tx < 0 || tx >= currentZoneMap.widthInTiles) return false;
  return currentZoneMap.grid[ty][tx] !== 1; // 1 = WALL
}

export function findSafeWalkableCoord(reqX, reqY) {
  if (!currentZoneMap || !currentZoneMap.grid) return { x: reqX || 672, y: reqY || 672 };
  const mapW = currentZoneMap.worldWidth || (currentZoneMap.widthInTiles * 48) || 1344;
  const mapH = currentZoneMap.worldHeight || (currentZoneMap.heightInTiles * 48) || 1344;

  let cx = Math.max(96, Math.min(mapW - 96, reqX || 672));
  let cy = Math.max(96, Math.min(mapH - 96, reqY || 672));

  if (canWalk(cx, cy)) return { x: cx, y: cy };

  // Spiral search for nearest floor tile
  for (let radius = 1; radius <= 16; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          const testX = cx + dx * 48;
          const testY = cy + dy * 48;
          if (canWalk(testX, testY)) {
            return { x: testX, y: testY };
          }
        }
      }
    }
  }

  return { x: currentZoneMap.spawnX || 672, y: currentZoneMap.spawnY || 672 };
}

export async function loadZone(zoneId, spawnX, spawnY) {
  currentZoneId = zoneId || 'SanctuaryHaven';
  currentZone = ZONES[currentZoneId] || { id: currentZoneId, name: currentZoneId, subtitle: '' };
  window.currentZoneId = currentZoneId;

  // 1. Fetch Server-Authoritative Procedural Zone Map (with fallback)
  try {
    const res = await fetch(`/api/v1/zones/${currentZoneId}`);
    if (res.ok) {
      currentZoneMap = await res.json();
    } else {
      currentZoneMap = MapGenerator.generateZone(currentZoneId);
    }
  } catch {
    currentZoneMap = MapGenerator.generateZone(currentZoneId);
  }

  monsters.length = 0;
  trainingDummies.length = 0;
  npcs.length = 0;
  portals.length = 0;
  props.length = 0;
  projectiles.length = 0;
  particles.length = 0;
  floatingTexts.length = 0;
  groundLoot.length = 0;

  const mapW = currentZoneMap.worldWidth || (currentZoneMap.widthInTiles * 48) || 1344;
  const mapH = currentZoneMap.worldHeight || (currentZoneMap.heightInTiles * 48) || 1344;

  const defaultSpawnX = currentZoneMap.spawnX || Math.floor(mapW / 2);
  const defaultSpawnY = currentZoneMap.spawnY || Math.floor(mapH / 2);

  const desiredX = (spawnX !== undefined && spawnX >= 48 && spawnX <= mapW - 48) ? spawnX : defaultSpawnX;
  const desiredY = (spawnY !== undefined && spawnY >= 48 && spawnY <= mapH - 48) ? spawnY : defaultSpawnY;

  const safe = findSafeWalkableCoord(desiredX, desiredY);
  player.x = safe.x;
  player.y = safe.y;
  player.vx = 0;
  player.vy = 0;
  camera.x = safe.x;
  camera.y = safe.y;

  // 2. Load Elements from ZoneMap
  if (currentZoneMap.portals) currentZoneMap.portals.forEach(p => portals.push({ ...p }));
  if (currentZoneMap.npcs) currentZoneMap.npcs.forEach(n => npcs.push({ ...n }));
  if (currentZoneMap.dummies) {
    currentZoneMap.dummies.forEach(d => {
      trainingDummies.push({ x: d.x, y: d.y, name: d.name, life: 99999, maxLife: 99999, armor: 200, isAlive: true, hurtTimer: 0 });
    });
  }
  if (currentZoneMap.props) currentZoneMap.props.forEach(pr => props.push({ ...pr }));

  // 3. Spawn Monster Clusters
  if (currentZoneMap.monsterSpawns && currentZoneMap.monsterSpawns.length > 0) {
    currentZoneMap.monsterSpawns.forEach(sp => {
      if (sp.type === 'boss') {
        spawnMonster(sp.x, sp.y, 'boss');
      } else {
        spawnMonsterCluster(sp.x, sp.y, sp.count || 6, sp.type);
      }
    });
  }

  // 4. Environmental Hazard Alert & Banner
  const subText = currentZoneMap.hazard ? `⚠️ ${currentZoneMap.hazard.hazardName}: ${currentZoneMap.hazard.description}` : currentZoneMap.subtitle;
  showZoneBanner(currentZoneMap.name, subText);
  document.getElementById('hud-zone-tag').innerText = `📍 ${currentZoneMap.name} (${currentZoneMap.levelRange || 'Lv. 1+'})`;
  document.getElementById('minimap-zone-title').innerText = currentZoneMap.name.toUpperCase();

  document.querySelectorAll('.zone-node').forEach(node => {
    node.classList.toggle('active-node', node.getAttribute('data-zone') === currentZoneId);
  });

  updateBackpackUI();
  updatePaperdollUI();
  updateSkillBadges();
  renderSkillUpgradeModal();
}

export function spawnMonster(x, y, type = 'slime') {
  const isBoss = type === 'boss';
  monsters.push({
    id: Math.random().toString(36).substring(2, 9),
    x: x,
    y: y,
    vx: 0,
    vy: 0,
    type: type,
    name: isBoss ? '🔥 Dark Shadow Fiend (Lord of Crypt)' : (type === 'slime' ? 'Toxic Slime' : (type === 'skeleton' ? 'Skeleton Warrior' : 'Goblin Scout')),
    maxLife: isBoss ? 2400 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
    life: isBoss ? 2400 : (type === 'slime' ? 90 : (type === 'skeleton' ? 180 : 130)),
    armor: isBoss ? 600 : (type === 'skeleton' ? 350 : 100),
    fireRes: type === 'slime' ? 0 : (isBoss ? 50 : 30),
    coldRes: type === 'slime' ? 70 : (isBoss ? 40 : 10),
    speed: isBoss ? 140 : (100 + Math.random() * 40),
    expValue: isBoss ? 500 : (type === 'slime' ? 30 : 45),
    state: 'idle',
    animTimer: Math.random() * 10,
    isAlive: true,
    hurtTimer: 0,
    scale: isBoss ? 1.8 : 1.2
  });
}

export function spawnMonsterCluster(cx, cy, count, typeOverride) {
  const types = typeOverride ? [typeOverride] : ['slime', 'goblin'];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const mx = cx + (Math.random() - 0.5) * 260;
    const my = cy + (Math.random() - 0.5) * 260;
    if (canWalk(mx, my)) spawnMonster(mx, my, type);
  }
}

export function dropMonsterLoot(x, y, isBoss) {
  const dropCount = isBoss ? Math.floor(Math.random() * 3) + 4 : (Math.random() < 0.65 ? 1 : 0);

  for (let i = 0; i < dropCount; i++) {
    let itemTemplate;
    if (isBoss && i === 0) {
      itemTemplate = POSSIBLE_LOOT.find(it => it.rarity === 'Unique') || POSSIBLE_LOOT[0];
    } else {
      itemTemplate = POSSIBLE_LOOT[Math.floor(Math.random() * POSSIBLE_LOOT.length)];
    }

    const dropAngle = Math.random() * Math.PI * 2;
    const dropDistance = 40 + Math.random() * 80;

    groundLoot.push({
      id: Math.random().toString(36).substring(2, 9),
      x: x,
      y: y,
      targetX: x + Math.cos(dropAngle) * dropDistance,
      targetY: y + Math.sin(dropAngle) * dropDistance,
      item: { ...itemTemplate },
      bounceTimer: 0.5,
      beamHeight: itemTemplate.rarity === 'Unique' ? 350 : (itemTemplate.rarity === 'Rare' || itemTemplate.rarity === 'Currency' ? 240 : 0)
    });

    AudioEngine.playLootDrop(itemTemplate.rarity);
  }
}

window.gainExp = function(amount) {
  if (!amount || amount <= 0) return;
  player.currentExp = (player.currentExp || 0) + amount;
  if (!player.expToNext || player.expToNext <= 0) player.expToNext = 100;

  for (let k in SKILLS) addSkillExp(k, Math.round(amount * 0.8));

  let leveledUp = false;
  let loops = 0;
  while (player.currentExp >= player.expToNext && player.level < 100 && loops < 50) {
    loops++;
    player.currentExp -= player.expToNext;
    player.level++;
    player.skillPoints++;
    player.expToNext = Math.max(50, Math.round(player.expToNext * 1.4));
    leveledUp = true;

    player.maxLife += 20;
    player.life = player.maxLife;
    player.maxMana += 10;
    player.mana = player.maxMana;

    AudioEngine.playLevelUp();
    spawnDamageNumber(player.x, player.y - 60, `LEVEL UP (Lv.${player.level})! +1 SP`, true, '#ffd700');

    const hudLevel = document.getElementById('hud-level');
    if (hudLevel) hudLevel.innerText = `Lv.${player.level}`;

    if (player.level >= 10 && player.classSpec === 'Novice') {
      document.getElementById('btn-ascend-trigger')?.classList.remove('hidden');
    }
  }

  if (leveledUp) {
    updateSkillBadges();
    renderSkillUpgradeModal();
    updateExpBar();
  }
};

let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = 0;
let hazardTickTimer = 0;

function update(dt) {
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.12;

  // 1. Player Movement & Smooth Wall Slide Collision
  let mx = 0, my = 0;
  if (player.freezeTimer > 0) {
    player.freezeTimer -= dt;
  } else {
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
  }

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

    const newX = player.x + player.vx * dt;
    const newY = player.y + player.vy * dt;

    if (canWalk(newX, player.y)) player.x = newX;
    if (canWalk(player.x, newY)) player.y = newY;

    // Hard boundary clamp within current map dimensions
    if (currentZoneMap) {
      const mapW = currentZoneMap.worldWidth || (currentZoneMap.widthInTiles * 48) || 1344;
      const mapH = currentZoneMap.worldHeight || (currentZoneMap.heightInTiles * 48) || 1344;
      player.x = Math.max(36, Math.min(mapW - 36, player.x));
      player.y = Math.max(36, Math.min(mapH - 36, player.y));
    }

    player.animTimer += dt * 8;
    player.animFrame = Math.floor(player.animTimer) % 4;
  } else {
    player.vx = 0;
    player.vy = 0;
    player.animTimer += dt * 2;
    player.animFrame = 0;
  }

  // 2. Environmental Hazards & Tile-Based Ground Hazards
  hazardTickTimer += dt;
  if (hazardTickTimer >= 0.8) {
    hazardTickTimer = 0;

    // Check Player's Current Tile
    const pTileX = Math.floor(player.x / 48);
    const pTileY = Math.floor(player.y / 48);
    const pTile = currentZoneMap?.grid?.[pTileY]?.[pTileX];

    // Direct Tile Hazard Damage
    if (pTile === 2 || pTile === 5) {
      // Lava Ground (Tile 2 or 5)
      const lavaDmg = Math.max(8, Math.round(40 * (1 - (player.fireRes || 0) / 100)));
      player.life = Math.max(1, player.life - lavaDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${lavaDmg} 🔥 Lava Burn!`, true, '#ff3d00');

      // Splash Lava Sparks under player feet
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 20,
          y: player.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 60,
          vy: -50 - Math.random() * 40,
          color: '#ff7849',
          life: 0.6,
          maxLife: 0.6,
          size: 3
        });
      }
    } else if (pTile === 6) {
      // Toxic Miasma Tile
      const toxicDmg = Math.max(6, Math.round(30 * (1 - (player.chaosRes || 0) / 100)));
      player.life = Math.max(1, player.life - toxicDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${toxicDmg} ☠️ Toxic Ground!`, false, '#c678dd');
    } else if (pTile === 7) {
      // Deep Glacial Ice Tile
      const iceDmg = Math.max(4, Math.round(20 * (1 - (player.coldRes || 0) / 100)));
      player.life = Math.max(1, player.life - iceDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${iceDmg} ❄️ Deep Frost!`, false, '#4facfe');
    }

    // Biome Ambient Heat / Peace
    if (currentZoneId === 'MoltenCaldera' && player.fireRes < 75 && pTile !== 2 && pTile !== 5) {
      const heatDmg = Math.max(5, Math.round((75 - player.fireRes) * 1.5));
      player.life = Math.max(1, player.life - heatDmg);
      spawnDamageNumber(player.x, player.y - 40, `-${heatDmg} 🔥 Heatwave!`, false, '#ff5722');
    } else if (currentZoneId === 'SanctuaryHaven') {
      player.life = Math.min(player.maxLife, player.life + player.maxLife * 0.05);
      player.mana = Math.min(player.maxMana, player.mana + player.maxMana * 0.05);
    }
  }

  // Weather Ambient Particles
  if (currentZoneId === 'FrostpeakTundra' && Math.random() < 0.3) {
    particles.push({
      x: player.x + (Math.random() - 0.5) * 900,
      y: player.y - 450,
      vx: (Math.random() - 0.5) * 80,
      vy: 120 + Math.random() * 80,
      color: '#e2ecf5',
      life: 2.5,
      maxLife: 2.5,
      size: 3
    });
  } else if (currentZoneId === 'MoltenCaldera' && Math.random() < 0.3) {
    particles.push({
      x: player.x + (Math.random() - 0.5) * 800,
      y: player.y + 400,
      vx: (Math.random() - 0.5) * 60,
      vy: -100 - Math.random() * 60,
      color: '#ff5722',
      life: 2.0,
      maxLife: 2.0,
      size: 4
    });
  }

  // 3. Portals & Loot
  portals.forEach(p => {
    if (Math.hypot(player.x - p.x, player.y - p.y) < 55) {
      loadZone(p.targetZone, p.targetX, p.targetY);
    }
  });

  groundLoot.forEach(loot => {
    if (loot.bounceTimer > 0) {
      loot.bounceTimer -= dt;
      loot.x += (loot.targetX - loot.x) * 0.15;
      loot.y += (loot.targetY - loot.y) * 0.15;
    }
  });

  for (let k in player.cooldowns) {
    if (player.cooldowns[k] > 0) player.cooldowns[k] = Math.max(0, player.cooldowns[k] - dt);
  }
  player.mana = Math.min(player.maxMana, player.mana + 10 * dt);
  player.life = Math.min(player.maxLife, player.life + 4 * dt);

  if (mouse.isDown && player.cooldowns.slash <= 0 && player.freezeTimer <= 0) {
    castSlash();
  }

  camera.x = player.x;
  camera.y = player.y;

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
      if (m.isAlive && !hit && Math.hypot(m.x - p.x, m.y - p.y) < 28 * (m.scale || 1)) {
        dealDamage(m, 10, p.damage || 85, 0, 0, 0);
        hit = true;
      }
    });

    trainingDummies.forEach(d => {
      if (!hit && Math.hypot(d.x - p.x, d.y - p.y) < 28) {
        dealDamage(d, 10, p.damage || 85, 0, 0, 0);
        hit = true;
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

  // Boss & Monster AI + Ailments
  let activeBoss = null;
  monsters.forEach(m => {
    if (!m.isAlive) return;
    if (m.type === 'boss') activeBoss = m;

    updateTargetAilments(m, dt);

    // Dynamic Knockback Velocity Decay
    if (m.vx || m.vy) {
      const kx = m.x + (m.vx || 0) * dt;
      const ky = m.y + (m.vy || 0) * dt;
      if (canWalk(kx, m.y)) m.x = kx;
      if (canWalk(m.x, ky)) m.y = ky;
      m.vx = (m.vx || 0) * 0.85;
      m.vy = (m.vy || 0) * 0.85;
      if (Math.abs(m.vx) < 1) m.vx = 0;
      if (Math.abs(m.vy) < 1) m.vy = 0;
    }

    if (m.freezeTimer > 0) {
      m.animTimer += dt * 1;
      return; // Stunned while frozen
    }

    if (m.hurtTimer > 0) m.hurtTimer -= dt;
    m.animTimer += dt * 5;

    const currentSpeed = m.chillTimer > 0 ? (m.speed * 0.55) : m.speed;
    const dist = Math.hypot(player.x - m.x, player.y - m.y);
    if (dist < 450 && dist > 35) {
      const angle = Math.atan2(player.y - m.y, player.x - m.x);
      const nx = m.x + Math.cos(angle) * currentSpeed * dt;
      const ny = m.y + Math.sin(angle) * currentSpeed * dt;
      if (canWalk(nx, m.y)) m.x = nx;
      if (canWalk(m.x, ny)) m.y = ny;
    }

    // Monster attacks player on contact
    if (dist < 40 && Math.random() < 0.05) {
      if (currentZoneId === 'FrostpeakTundra' && player.coldRes < 75 && Math.random() < 0.35) {
        player.freezeTimer = 1.0;
        spawnDamageNumber(player.x, player.y - 45, '❄️ FROZEN BY BLIZZARD!', true, '#00f2fe');
      }
    }
  });

  const bossHud = document.getElementById('boss-hud-bar');
  if (activeBoss && activeBoss.isAlive && Math.hypot(player.x - activeBoss.x, player.y - activeBoss.y) < 950) {
    bossHud.classList.remove('boss-hud-hide');
    const hpPct = Math.max(0, (activeBoss.life / activeBoss.maxLife) * 100);
    document.getElementById('boss-hp-fill').style.width = `${hpPct}%`;
    document.getElementById('boss-hp-text').innerText = `${Math.round(activeBoss.life)} / ${activeBoss.maxLife} (${Math.round(hpPct)}%)`;
  } else {
    bossHud.classList.add('boss-hud-hide');
  }

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

  updateHUD();
}

function updateHUD() {
  document.getElementById('bar-es').style.width = `${(player.es / player.maxEs) * 100}%`;
  document.getElementById('text-es').innerText = `ES: ${Math.round(player.es)} / ${player.maxEs}`;

  document.getElementById('bar-life').style.width = `${(player.life / player.maxLife) * 100}%`;
  document.getElementById('text-life').innerText = `HP: ${Math.round(player.life)} / ${player.maxLife}`;

  document.getElementById('bar-mana').style.width = `${(player.mana / player.maxMana) * 100}%`;
  document.getElementById('text-mana').innerText = `MP: ${Math.round(player.mana)} / ${player.maxMana}`;

  document.getElementById('hud-level').innerText = `Lv.${player.level}`;
  document.getElementById('zoom-level-text').innerText = `${Math.round(camera.zoom * 100)}%`;

  updateExpBar();

  for (let k in player.cooldowns) {
    const el = document.getElementById(`cd-${k}`);
    if (el) {
      const maxCd = SKILLS[k] ? SKILLS[k].baseCooldown : 1.0;
      const pct = (player.cooldowns[k] / maxCd) * 100;
      el.style.height = `${pct}%`;
    }
  }
}

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
  renderGame(canvas, ctx, minimapCanvas, mmCtx, currentZone, currentZoneMap);

  requestAnimationFrame(gameLoop);
}

// Window Event Listeners
window.addEventListener('wheel', e => {
  if (document.querySelector('.worldmap-modal-wrap:not(.hidden)')) return;
  e.preventDefault();
  const zoomFactor = -Math.sign(e.deltaY) * 0.15;
  camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.targetZoom + zoomFactor));
}, { passive: false });

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyQ') castFireball();
  if (e.code === 'KeyW') castFrostNova();
  if (e.code === 'KeyE') castMeteor();
  if (e.code === 'Space') castDash();
  if (e.code === 'KeyK') toggleModal('skills-modal');
  if (e.code === 'KeyM') toggleModal('worldmap-modal');
  if (e.code === 'KeyC') toggleModal('stats-modal');
  if (e.code === 'KeyI') toggleModal('inventory-modal');
  if (e.code === 'Escape') {
    document.getElementById('ascension-modal')?.classList.add('hidden');
    document.getElementById('skills-modal')?.classList.add('hidden');
    document.getElementById('inventory-modal')?.classList.add('hidden');
    document.getElementById('worldmap-modal')?.classList.add('hidden');
    document.getElementById('stats-modal')?.classList.add('hidden');
    document.getElementById('character-roster-modal')?.classList.add('hidden');
  }

  if (e.code === 'KeyF') {
    let closestIdx = -1;
    let minDistance = 120;
    groundLoot.forEach((loot, idx) => {
      const dist = Math.hypot(player.x - loot.x, player.y - loot.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });
    if (closestIdx !== -1) pickUpLoot(closestIdx);
  }
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
    AudioEngine.init();

    let clickedLootIdx = -1;
    groundLoot.forEach((loot, idx) => {
      if (Math.hypot(mouse.worldX - loot.x, mouse.worldY - loot.y) < 40) clickedLootIdx = idx;
    });

    if (clickedLootIdx !== -1) {
      const loot = groundLoot[clickedLootIdx];
      if (Math.hypot(player.x - loot.x, player.y - loot.y) < 140) {
        pickUpLoot(clickedLootIdx);
        return;
      }
    }

    mouse.isDown = true;
    castSlash();
  }
});

window.addEventListener('mouseup', e => {
  if (e.button === 0) mouse.isDown = false;
});

// Setup Hotbar Clicks
document.getElementById('slot-slash')?.addEventListener('click', castSlash);
document.getElementById('slot-fireball')?.addEventListener('click', castFireball);
document.getElementById('slot-frost')?.addEventListener('click', castFrostNova);
document.getElementById('slot-meteor')?.addEventListener('click', castMeteor);
document.getElementById('slot-dash')?.addEventListener('click', castDash);

// Setup World Map Fast Travel
document.querySelectorAll('.zone-node').forEach(node => {
  node.addEventListener('click', () => {
    const zone = node.getAttribute('data-zone');
    toggleModal('worldmap-modal');
    loadZone(zone);
    saveToDatabase(true);
  });
});

// Initialize UI and Game
setupUIListeners();

// Load previous savegame from SQLite DB and begin auto-save loop
(async function initSave() {
  const loaded = await loadFromDatabase();
  const targetZone = (player.zoneId && ZONES[player.zoneId]) ? player.zoneId : 'SanctuaryHaven';
  await loadZone(targetZone, player.x, player.y);
  updateHudAvatar();
  updateExpBar();
  startAutoSave(10000);
})();

requestAnimationFrame(gameLoop);
