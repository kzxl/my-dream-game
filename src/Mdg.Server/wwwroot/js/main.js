/**
 * MDG: Aethelis - 2D Top-Down Pixel Art ARPG Engine
 * Main Orchestrator, Server-Authoritative Map Loader, Collision & Environmental Biome Hazards
 */

import { TILE_SIZE, camera, player, otherPlayers, monsters, trainingDummies, npcs, portals, props, pois, projectiles, particles, floatingTexts, groundLoot, zoneExploration, keys, mouse } from './state.js';
import { ZONES, fetchMasterZonesFromServer } from './data/zones.js';
import { POSSIBLE_LOOT, generateLootItem, fetchMasterItemsFromServer } from './data/items.js';
import { SKILLS, fetchMasterSkillsFromServer } from './data/skills.js';
import { AudioEngine } from './audio.js';
import { renderGame } from './renderer.js';
import { castSlash, castFireball, castFrostNova, castMeteor, castDash, spawnDamageNumber, updateTargetAilments, dealDamage, dealDamageToPlayer, handlePlayerDefeated, dropMonsterLoot, applyChill, updateCurseAuras, updatePlayerLeech } from './combat.js';
import { updateBackpackUI, updatePaperdollUI, pickUpLoot } from './ui/inventory.js';
import { addSkillExp, updateSkillBadges, renderSkillUpgradeModal } from './ui/skills-ui.js';
import { showZoneBanner, setupUIListeners, toggleModal, updateExpBar, updateHudAvatar, updateBuffsHUD, openChannelModal, closeChannelModal } from './ui/hud.js';
import { saveToDatabase, loadFromDatabase, startAutoSave } from './save-system.js';
import { MapGenerator } from './map-generator.js';
import { updateCompanion } from './companion.js';
import { renderSharedStashModal } from './ui/stash-ui.js';
import { openNpcDialogue, fetchMasterNpcsFromServer } from './ui/npc-dialog-ui.js';
import { renderMapDeviceModal } from './ui/map-device-ui.js';
import { initDefeatUI } from './ui/defeat-ui.js';
import { setupBestiaryUI, toggleBestiaryUI } from './ui/bestiary-ui.js';
import { setupRosterUI, openRosterUI } from './ui/roster-ui.js';
import { renderDevotionModal, fetchMasterDevotionFromServer } from './ui/devotion-ui.js';
import { MPClient } from './services/multiplayer-client.js';
import { getTownForAct, fetchMasterCampaignFromServer, fetchMasterQuestsFromServer } from './data/campaign.js';
import { checkGoogleOAuthRedirectResult } from './auth.js';
import { fetchMasterMonstersFromServer, fetchMasterFamilyMasteryFromServer } from './data/monsters.js';
import { SHRINE_TYPES, ALL_SHRINE_KEYS } from './data/shrines.js';
import { spawnMapIncursions, updateMapIncursions } from './systems/map-incursions.js';
import { useFlask, updateFlasks, renderFlaskHUD, initFlasks } from './systems/flask-system.js';
import { renderSpireModal } from './ui/spire-ui.js';
import { extractShadow, updateShadowArmy } from './systems/shadow-extraction.js';
import { initPlayerProfessions, spawnResourceNodesForZone, updateGatheringSystem, tryInteractGatheringNode } from './systems/gathering-system.js';
import { loadGameSettings, getGameSetting, toggleSettingsModal, renderSettingsModal } from './ui/settings-ui.js';
import { setupCompendiumUI, toggleCompendiumUI, openCompendiumUI, closeCompendiumUI } from './ui/compendium-ui.js';
import { renderHunterGuildModal } from './ui/hunter-guild-ui.js';
import { toggleMarketModal, openMarketModal } from './ui/trade-market-ui.js';
import { initGamepadSystem, updateGamepad, toggleRadialWheel } from './systems/gamepad-controller.js';
import { t, applyLocalization } from './i18n.js';

window.keys = keys;
window.player = player;
window.pois = pois;
window.monsters = monsters;
window.loadZone = loadZone;
window.toggleModal = toggleModal;
window.toggleMarketModal = toggleMarketModal;
window.toggleRadialWheel = toggleRadialWheel;
window.toggleModal = toggleModal;
window.showZoneBanner = showZoneBanner;
window.renderSkillUpgradeModal = renderSkillUpgradeModal;
window.toggleSettingsModal = toggleSettingsModal;
window.toggleCompendiumUI = toggleCompendiumUI;
window.renderHunterGuildModal = renderHunterGuildModal;

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
let zoneMonsterSpawners = [];
let zoneRespawnTimer = 0;
let shrineInfernoTimer = 0;
window.currentZoneId = currentZoneId;

export function canWalk(x, y) {
  if (!currentZoneMap || !currentZoneMap.grid) return true;
  const tx = Math.floor(x / 48);
  const ty = Math.floor(y / 48);
  if (ty < 0 || ty >= currentZoneMap.heightInTiles || tx < 0 || tx >= currentZoneMap.widthInTiles) return false;
  const tile = currentZoneMap.grid[ty][tx];
  return tile !== 1 && tile !== 2 && tile !== 10 && tile !== 11 && tile !== 15; // 1 = Wall, 2 = Deep Water, 10 = Pillar, 11 = Chasm, 15 = Destructible Wall
}

export function isProjectileBlocked(x, y) {
  if (!currentZoneMap || !currentZoneMap.grid) return false;
  const tx = Math.floor(x / 48);
  const ty = Math.floor(y / 48);
  if (ty < 0 || ty >= currentZoneMap.heightInTiles || tx < 0 || tx >= currentZoneMap.widthInTiles) return true;
  const tile = currentZoneMap.grid[ty][tx];

  // If projectile strikes Destructible Wall (Tile 15), break it!
  if (tile === 15) {
    currentZoneMap.grid[ty][tx] = 0;
    AudioEngine.playTone?.(140, 'sawtooth', 0.25, 0.15);
    floatingTexts.push({ x: (tx + 0.5) * 48, y: (ty + 0.5) * 48 - 20, text: '💥 BARRICADE DESTROYED!', color: '#ffd700', life: 1.5 });
    for (let k = 0; k < 12; k++) {
      particles.push({
        x: (tx + 0.5) * 48 + (Math.random() - 0.5) * 30,
        y: (ty + 0.5) * 48 + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        color: '#8e7960',
        life: 0.6,
        size: 5
      });
    }
    return true;
  }

  return tile === 1 || tile === 10; // 1 = Solid Wall, 10 = Solid Stone Pillar
}

window.canWalk = canWalk;
window.isProjectileBlocked = isProjectileBlocked;

export function findSafeWalkableCoord(reqX, reqY) {
  if (!currentZoneMap || !currentZoneMap.grid) return { x: reqX || 672, y: reqY || 672 };
  const mapW = currentZoneMap.worldWidth || (currentZoneMap.widthInTiles * 48) || 1344;
  const mapH = currentZoneMap.worldHeight || (currentZoneMap.heightInTiles * 48) || 1344;
  const centerMapX = Math.floor(mapW / 2);
  const centerMapY = Math.floor(mapH / 2);

  let cx = reqX !== undefined ? reqX : (currentZoneMap.spawnX || centerMapX);
  let cy = reqY !== undefined ? reqY : (currentZoneMap.spawnY || centerMapY);

  // 1. Detect if target coordinates overlap or are dangerously near any portal in the new map
  if (currentZoneMap.portals && currentZoneMap.portals.length > 0) {
    for (const p of currentZoneMap.portals) {
      const distToPortal = Math.hypot(cx - p.x, cy - p.y);
      if (distToPortal < 130) {
        // Calculate direction pointing away from portal into map center
        const dirX = centerMapX - p.x;
        const dirY = centerMapY - p.y;
        const len = Math.hypot(dirX, dirY) || 1;
        cx = Math.round(p.x + (dirX / len) * 180);
        cy = Math.round(p.y + (dirY / len) * 180);
        break;
      }
    }
  }

  // 2. Prevent being cornered against map perimeter walls (keep 144px / 3 tiles buffer)
  cx = Math.max(144, Math.min(mapW - 144, cx));
  cy = Math.max(144, Math.min(mapH - 144, cy));

  // Helper: check walkable tile and not directly inside a portal circle
  const isCoordSafe = (x, y) => {
    if (!canWalk(x, y)) return false;
    if (currentZoneMap.portals) {
      for (const p of currentZoneMap.portals) {
        if (Math.hypot(x - p.x, y - p.y) < 80) return false;
      }
    }
    return true;
  };

  if (isCoordSafe(cx, cy)) return { x: cx, y: cy };

  // 3. Spiral search for nearest open safe floor tile
  for (let radius = 1; radius <= 20; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          const testX = cx + dx * 48;
          const testY = cy + dy * 48;
          if (testX >= 144 && testX <= mapW - 144 && testY >= 144 && testY <= mapH - 144) {
            if (isCoordSafe(testX, testY)) {
              return { x: testX, y: testY };
            }
          }
        }
      }
    }
  }

  return { x: currentZoneMap.spawnX || centerMapX, y: currentZoneMap.spawnY || centerMapY };
}

export async function loadZone(zoneId, spawnX, spawnY) {
  currentZoneId = zoneId || 'SanctuaryHaven';
  currentZone = ZONES[currentZoneId] || { id: currentZoneId, name: currentZoneId, subtitle: '' };
  window.currentZoneId = currentZoneId;
  window.spireFloorCleared = false;
  player.zoneResurrectionsUsed = 0; // Reset map resurrection counter per map session
  player.portalCooldown = 2.0; // 2s portal cooldown to prevent bounce loops

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
  pois.length = 0;
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

  // Notify Multiplayer Server of Zone Transition
  MPClient.changeZone(currentZoneId, safe.x, safe.y);

  // 1.5. Initialize Fog of War Exploration Grid
  const gridH = currentZoneMap.heightInTiles || 28;
  const gridW = currentZoneMap.widthInTiles || 28;
  if (!zoneExploration[currentZoneId]) {
    zoneExploration[currentZoneId] = [];
    for (let y = 0; y < gridH; y++) {
      zoneExploration[currentZoneId][y] = new Uint8Array(gridW);
      if (currentZoneId === 'SanctuaryHaven') {
        zoneExploration[currentZoneId][y].fill(1); // Town is pre-revealed
      }
    }
  }
  revealPlayerVision(player.x, player.y, currentZoneId, 7);
  window.minimapDirty = true;

  // 2. Load Elements from ZoneMap
  if (currentZoneMap.portals) currentZoneMap.portals.forEach(p => portals.push({ ...p }));
  if (currentZoneMap.npcs) currentZoneMap.npcs.forEach(n => npcs.push({ ...n }));
  if (currentZoneMap.dummies) {
    currentZoneMap.dummies.forEach(d => {
      trainingDummies.push({ x: d.x, y: d.y, name: d.name, life: 99999, maxLife: 99999, armor: 200, isAlive: true, hurtTimer: 0 });
    });
  }
  if (currentZoneMap.props) currentZoneMap.props.forEach(pr => props.push({ ...pr }));

  // Procedural Flora & Foliage Spawning (Flowers, Bushes, Mushrooms, Water Lilies)
  spawnZoneFoliageAndProps(currentZoneId, mapW, mapH);

  // Procedural High-Fantasy Shrines (Only in Wild / Combat Zones, NEVER in Town)
  if (currentZoneId !== 'SanctuaryHaven') {
    spawnRandomMapShrines();
  }

  // 3. Spawn Monster Clusters & Track Zone Spawners
  zoneMonsterSpawners = currentZoneMap.monsterSpawns || [];
  zoneRespawnTimer = 0;

  if (currentZoneMap.monsterSpawns && currentZoneMap.monsterSpawns.length > 0) {
    currentZoneMap.monsterSpawns.forEach(sp => {
      if (sp.type === 'boss') {
        spawnMonster(sp.x, sp.y, 'boss');
      } else {
        spawnMonsterCluster(sp.x, sp.y, sp.count || 6, sp.type);
      }
    });
  }

  // 3.5. Spawn Dynamic Map Incursions (Void Breach & Treasure Goblin)
  spawnMapIncursions(currentZoneId, mapW, mapH, canWalk);

  // 3.6. Spawn World Mineral Veins & Herb Patches for Gathering Professions
  spawnResourceNodesForZone(currentZoneId, mapW, mapH, canWalk);

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

/**
 * Procedural Flora & Foliage Spawning (Wildflowers, Sylvan Bushes, Ferns, Glowing Fungi)
 */
export function spawnZoneFoliageAndProps(zoneId, mapW, mapH) {
  if (!currentZoneMap || !currentZoneMap.grid) return;
  const grid = currentZoneMap.grid;
  const h = grid.length;
  const w = grid[0].length;
  const tileSize = 48;

  const isTown = zoneId === 'SanctuaryHaven';
  const isPlains = zoneId === 'WhisperingPlains';
  const isCrypt = zoneId === 'ForgottenCrypt';

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tile = grid[y][x];
      const wx = x * tileSize + 24;
      const wy = y * tileSize + 24;
      const rand = Math.random();

      if (tile === 0) {
        // Natural Grass Floor
        if (isTown || isPlains) {
          if (rand < 0.08) {
            const types = ['flowers_red', 'flowers_blue', 'flowers_gold', 'flowers_purple', 'four_leaf_clover', 'wildflowers'];
            props.push({ x: wx + (Math.random() - 0.5) * 16, y: wy + (Math.random() - 0.5) * 16, type: types[Math.floor(Math.random() * types.length)] });
          } else if (rand < 0.14) {
            const shrubs = ['bush', 'flowered_bush', 'tall_grass', 'fern'];
            props.push({ x: wx + (Math.random() - 0.5) * 12, y: wy + (Math.random() - 0.5) * 12, type: shrubs[Math.floor(Math.random() * shrubs.length)] });
          } else if (rand < 0.16) {
            props.push({ x: wx, y: wy, type: Math.random() < 0.5 ? 'mushroom_glow' : 'mushroom_cyan' });
          }
        } else if (isCrypt) {
          if (rand < 0.06) {
            props.push({ x: wx, y: wy, type: Math.random() < 0.6 ? 'mushroom_glow' : 'mushroom_cyan' });
          }
        }
      } else if (tile === 2) {
        // Water tiles (Spawn water lilies!)
        if (rand < 0.09) {
          props.push({ x: wx, y: wy, type: 'water_lily' });
        }
      }
    }
  }
}

/**
 * Procedural Shrine Spawner for Wild Zones (1 to 3 unique shrines per map, NEVER in town)
 */
export function spawnRandomMapShrines() {
  if (!currentZoneMap || currentZoneId === 'SanctuaryHaven') return;

  const mapW = currentZoneMap.worldWidth || (currentZoneMap.widthInTiles * 48) || 1344;
  const mapH = currentZoneMap.worldHeight || (currentZoneMap.heightInTiles * 48) || 1344;

  const isLargeMap = mapW >= 2000 || mapH >= 2000 || currentZoneMap.isRift;
  const targetCount = isLargeMap ? (Math.floor(Math.random() * 2) + 2) : (Math.floor(Math.random() * 2) + 1);

  const availableKeys = [...ALL_SHRINE_KEYS];
  // Shuffle available shrine keys
  for (let i = availableKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableKeys[i], availableKeys[j]] = [availableKeys[j], availableKeys[i]];
  }

  let spawned = 0;
  let attempts = 0;

  while (spawned < targetCount && attempts < 120 && availableKeys.length > 0) {
    attempts++;
    const testX = Math.floor(Math.random() * (mapW - 180)) + 90;
    const testY = Math.floor(Math.random() * (mapH - 180)) + 90;

    if (!canWalk(testX, testY)) continue;

    // Check distance to player
    if (Math.hypot(testX - player.x, testY - player.y) < 200) continue;

    // Check distance to other shrines
    const tooCloseToOtherShrines = pois.some(p => Math.hypot(testX - p.x, testY - p.y) < 260);
    if (tooCloseToOtherShrines) continue;

    // Check distance to portals
    const tooCloseToPortals = portals.some(p => Math.hypot(testX - p.x, testY - p.y) < 120);
    if (tooCloseToPortals) continue;

    const key = availableKeys.pop();
    const sDef = SHRINE_TYPES[key];
    if (sDef) {
      pois.push({
        id: 'shrine_' + Math.random().toString(36).substring(2, 9),
        type: 'shrine',
        shrineKey: sDef.id,
        name: sDef.name,
        buffType: sDef.buffType,
        buffDuration: sDef.duration || 90,
        icon: sDef.icon,
        color: sDef.color,
        description: sDef.description,
        lore: sDef.lore,
        x: testX,
        y: testY,
        radius: 80,
        isActivated: false
      });
      spawned++;
    }
  }
}

/**
 * Reveal tiles around player position on Fog of War exploration grid
 */
export function revealPlayerVision(px, py, zoneId, radiusTiles = 8) {
  if (!currentZoneMap) return;
  const grid = zoneExploration[zoneId];
  if (!grid || grid.length === 0) return;

  const pTileX = Math.floor(px / 48);
  const pTileY = Math.floor(py / 48);
  const h = grid.length;
  const w = grid[0].length;

  const rSq = radiusTiles * radiusTiles;
  const minY = Math.max(0, pTileY - radiusTiles);
  const maxY = Math.min(h - 1, pTileY + radiusTiles);
  const minX = Math.max(0, pTileX - radiusTiles);
  const maxX = Math.min(w - 1, pTileX + radiusTiles);

  let newlyRevealed = false;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - pTileX;
      const dy = y - pTileY;
      if (dx * dx + dy * dy <= rSq) {
        if (grid[y][x] === 0) {
          grid[y][x] = 1;
          newlyRevealed = true;
        }
      }
    }
  }

  if (newlyRevealed) {
    window.minimapDirty = true;
  }

  // Zone Exploration Progress & Reward Check (85%+ Map Clearance)
  if (newlyRevealed && zoneId !== 'SanctuaryHaven') {
    if (!player.exploredZonesRewards) player.exploredZonesRewards = {};
    if (!player.exploredZonesRewards[zoneId]) {
      let revealedCount = 0;
      let totalCount = 0;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          totalCount++;
          if (grid[y][x] === 1) revealedCount++;
        }
      }
      const pct = totalCount > 0 ? (revealedCount / totalCount) * 100 : 0;
      if (pct >= 85) {
        player.exploredZonesRewards[zoneId] = true;
        spawnDamageNumber(player.x, player.y - 85, '🗺️ 85%+ ZONE EXPLORATION MASTERY! (+300 EXP & AETHER CRYSTALS)', true, '#ffd700');
        AudioEngine.playLevelUp?.();
        if (window.gainExp) window.gainExp(300);
        player.materials = player.materials || {};
        player.materials['mat_aether_crystal'] = (player.materials['mat_aether_crystal'] || 0) + 3;
      }
    }
  }
}

export function spawnMonster(x, y, type = 'slime', forcedTier = null) {
  const isBoss = type === 'boss' || type === 'ignis_boss' || type === 'vael_boss' || type === 'malakor_boss';

  let mName = 'Toxic Slime';
  let maxHp = 120;
  let armor = 60;
  let fireRes = 15;
  let coldRes = 25;
  let lightRes = 15;
  let chaosRes = 10;
  let evasionChance = 25;
  let blockChance = 0;
  let expVal = 35;
  let baseSpd = 75;
  let attackDmg = 16;
  let attackRange = 40;
  let attackCooldown = 1.2;
  let dmgType = 'physical';

  if (type === 'wolf') {
    mName = 'Shadow Direwolf';
    maxHp = 180;
    armor = 80;
    fireRes = 20; coldRes = 20; lightRes = 20; chaosRes = 15;
    evasionChance = 30; blockChance = 0;
    expVal = 45; baseSpd = 115;
    attackDmg = 26; attackRange = 44; attackCooldown = 0.95;
  } else if (type === 'goblin') {
    mName = 'Goblin Raider';
    maxHp = 160;
    armor = 110;
    fireRes = 20; coldRes = 20; lightRes = 20; chaosRes = 15;
    evasionChance = 35; blockChance = 10;
    expVal = 40; baseSpd = 95;
    attackDmg = 20; attackRange = 42; attackCooldown = 1.1;
  } else if (type === 'skeleton') {
    mName = 'Skeleton Guard';
    maxHp = 240;
    armor = 220;
    fireRes = 25; coldRes = 25; lightRes = 25; chaosRes = 20;
    evasionChance = 5; blockChance = 25;
    expVal = 50; baseSpd = 75;
    attackDmg = 30; attackRange = 46; attackCooldown = 1.35;
  } else if (type === 'undead_knight') {
    mName = 'Undead Dreadknight';
    maxHp = 520;
    armor = 420;
    fireRes = 35; coldRes = 35; lightRes = 35; chaosRes = 25;
    evasionChance = 10; blockChance = 40;
    expVal = 95; baseSpd = 70;
    attackDmg = 52; attackRange = 50; attackCooldown = 1.4; dmgType = 'chaos';
  } else if (type === 'frost_golem') {
    mName = 'Glacial Frost Golem';
    maxHp = 600;
    armor = 480;
    fireRes = 20; coldRes = 60; lightRes = 20; chaosRes = 20;
    evasionChance = 0; blockChance = 30;
    expVal = 110; baseSpd = 65;
    attackDmg = 58; attackRange = 54; attackCooldown = 1.5; dmgType = 'cold';
  } else if (type === 'fire_imp') {
    mName = 'Infernal Fire Imp';
    maxHp = 200;
    armor = 100;
    fireRes = 60; coldRes = 15; lightRes = 20; chaosRes = 20;
    evasionChance = 25; blockChance = 10;
    expVal = 55; baseSpd = 105;
    attackDmg = 32; attackRange = 220; attackCooldown = 1.6; dmgType = 'fire';
  } else if (type === 'magma_golem') {
    mName = 'Magma Behemoth';
    maxHp = 680;
    armor = 500;
    fireRes = 65; coldRes = 15; lightRes = 20; chaosRes = 20;
    evasionChance = 5; blockChance = 30;
    expVal = 130; baseSpd = 60;
    attackDmg = 70; attackRange = 58; attackCooldown = 1.6; dmgType = 'fire';
  } else if (type === 'void_spectre') {
    mName = 'Abyssal Shadow Spectre';
    maxHp = 750; armor = 160;
    fireRes = 20; coldRes = 35; lightRes = 20; chaosRes = 55;
    evasionChance = 35; blockChance = 0;
    expVal = 140; baseSpd = 100;
    attackDmg = 55; attackRange = 50; attackCooldown = 1.2; dmgType = 'chaos';
  } else if (type === 'chaos_eye') {
    mName = 'Void Eye of Chaos';
    maxHp = 680; armor = 120;
    fireRes = 25; coldRes = 25; lightRes = 50; chaosRes = 60;
    evasionChance = 30; blockChance = 0;
    expVal = 150; baseSpd = 85;
    attackDmg = 65; attackRange = 240; attackCooldown = 1.5; dmgType = 'chaos';
  } else if (type === 'tentacle_fiend') {
    mName = 'Dark Tentacle Fiend';
    maxHp = 1100; armor = 350;
    fireRes = 15; coldRes = 40; lightRes = 25; chaosRes = 45;
    evasionChance = 10; blockChance = 20;
    expVal = 180; baseSpd = 65;
    attackDmg = 60; attackRange = 65; attackCooldown = 1.3; dmgType = 'chaos';
  } else if (type === 'horror_stalker') {
    mName = 'Cosmic Horror Stalker';
    maxHp = 1400; armor = 400;
    fireRes = 35; coldRes = 35; lightRes = 35; chaosRes = 50;
    evasionChance = 25; blockChance = 15;
    expVal = 240; baseSpd = 115;
    attackDmg = 80; attackRange = 55; attackCooldown = 1.0; dmgType = 'chaos';
  } else if (type === 'storm_drake') {
    mName = 'Storm Drake Dragon';
    maxHp = 1200; armor = 360;
    fireRes = 30; coldRes = 20; lightRes = 65; chaosRes = 25;
    evasionChance = 20; blockChance = 15;
    expVal = 200; baseSpd = 110;
    attackDmg = 75; attackRange = 60; attackCooldown = 1.1; dmgType = 'lightning';
  } else if (type === 'fire_salamander') {
    mName = 'Molten Fire Salamander';
    maxHp = 950; armor = 300;
    fireRes = 70; coldRes = 10; lightRes = 20; chaosRes = 20;
    evasionChance = 15; blockChance = 10;
    expVal = 160; baseSpd = 90;
    attackDmg = 62; attackRange = 50; attackCooldown = 1.2; dmgType = 'fire';
  } else if (type === 'crystal_serpent') {
    mName = 'Frost Crystal Serpent';
    maxHp = 1050; armor = 340;
    fireRes = 10; coldRes = 75; lightRes = 20; chaosRes = 20;
    evasionChance = 25; blockChance = 10;
    expVal = 175; baseSpd = 85;
    attackDmg = 65; attackRange = 55; attackCooldown = 1.25; dmgType = 'cold';
  } else if (type === 'thunder_roc') {
    mName = 'Thunder Roc Beast';
    maxHp = 1150; armor = 280;
    fireRes = 25; coldRes = 25; lightRes = 70; chaosRes = 20;
    evasionChance = 35; blockChance = 5;
    expVal = 190; baseSpd = 120;
    attackDmg = 72; attackRange = 55; attackCooldown = 0.95; dmgType = 'lightning';
  } else if (type === 'stone_colossus') {
    mName = 'Runic Stone Colossus';
    maxHp = 1850; armor = 600;
    fireRes = 40; coldRes = 40; lightRes = 40; chaosRes = 30;
    evasionChance = 0; blockChance = 40;
    expVal = 260; baseSpd = 55;
    attackDmg = 85; attackRange = 65; attackCooldown = 1.6; dmgType = 'physical';
  } else if (type === 'clockwork_spider') {
    mName = 'Clockwork Automaton Spider';
    maxHp = 850; armor = 320;
    fireRes = 35; coldRes = 35; lightRes = 15; chaosRes = 30;
    evasionChance = 25; blockChance = 10;
    expVal = 150; baseSpd = 105;
    attackDmg = 58; attackRange = 48; attackCooldown = 1.05; dmgType = 'physical';
  } else if (type === 'bone_archon') {
    mName = 'Cursed Bone Archon Lich';
    maxHp = 1300; armor = 260;
    fireRes = 15; coldRes = 55; lightRes = 20; chaosRes = 55;
    evasionChance = 20; blockChance = 20;
    expVal = 220; baseSpd = 75;
    attackDmg = 80; attackRange = 220; attackCooldown = 1.4; dmgType = 'chaos';
  } else if (type === 'doom_knight') {
    mName = 'Armored Doom Knight';
    maxHp = 1650; armor = 550;
    fireRes = 40; coldRes = 40; lightRes = 40; chaosRes = 45;
    evasionChance = 5; blockChance = 35;
    expVal = 250; baseSpd = 80;
    attackDmg = 88; attackRange = 60; attackCooldown = 1.3; dmgType = 'chaos';
  } else if (isBoss) {
    mName = '🔥 Dark Shadow Lord (Lord of Ruin)';
    maxHp = 4800;
    armor = 650;
    fireRes = 60; coldRes = 60; lightRes = 60; chaosRes = 35;
    evasionChance = 20; blockChance = 35;
    expVal = 650; baseSpd = 80;
    attackDmg = 85; attackRange = 72; attackCooldown = 1.1; dmgType = 'fire';
  }

  // Determine Rarity Variant Tier: Normal (80%), Elite (14%), Mutant (6%)
  let rarityTier = 'normal';
  let scale = isBoss ? 1.8 : 1.2;
  let affixes = [];

  if (!isBoss) {
    const roll = forcedTier || (Math.random());
    if (roll === 'mutant' || (typeof roll === 'number' && roll < 0.06)) {
      rarityTier = 'mutant';
      scale = 1.5;
      maxHp = Math.round(maxHp * 4.5);
      armor = Math.round(armor * 2.0);
      attackDmg = Math.round(attackDmg * 1.5);
      baseSpd = Math.round(baseSpd * 1.15);
      expVal = Math.round(expVal * 5.0);
      const mutantPrefixes = ['👑 Void-Touched', '💀 Abyssal Mutated', '🌟 Cosmic Anomaly', '🔮 Chaos-Corrupted'];
      mName = `${mutantPrefixes[Math.floor(Math.random() * mutantPrefixes.length)]} ${mName}`;
      affixes = ['Void Aura', 'Molten Core', 'Vampiric'];
    } else if (roll === 'elite' || (typeof roll === 'number' && roll < 0.20)) {
      rarityTier = 'elite';
      scale = 1.35;
      maxHp = Math.round(maxHp * 2.4);
      armor = Math.round(armor * 1.5);
      attackDmg = Math.round(attackDmg * 1.25);
      expVal = Math.round(expVal * 2.8);
      const elitePrefixes = ['⚡ Elite', '🔥 Champion', '❄️ Hardened', '⚔️ Berserk'];
      mName = `${elitePrefixes[Math.floor(Math.random() * elitePrefixes.length)]} ${mName}`;
      affixes = ['Haste', 'Damage Reflection'];
    }
  }

  monsters.push({
    id: Math.random().toString(36).substring(2, 9),
    x: x,
    y: y,
    vx: 0,
    vy: 0,
    type: type,
    name: mName,
    rarityTier: rarityTier,
    affixes: affixes,
    maxLife: maxHp,
    life: maxHp,
    armor: armor,
    fireRes: fireRes,
    coldRes: coldRes,
    lightRes: lightRes,
    chaosRes: chaosRes,
    evasionChance: evasionChance,
    blockChance: blockChance,
    speed: baseSpd + Math.random() * 15,
    attackDmg: attackDmg,
    attackRange: attackRange,
    attackCooldown: attackCooldown,
    attackCooldownTimer: Math.random() * attackCooldown,
    dmgType: dmgType,
    expValue: expVal,
    state: 'idle',
    animTimer: Math.random() * 10,
    isAlive: true,
    hurtTimer: 0,
    scale: scale
  });
}

export function spawnMonsterCluster(cx, cy, count, typeOverride) {
  let types = ['slime', 'goblin', 'wolf', 'skeleton'];
  if (typeOverride) {
    types = Array.isArray(typeOverride) ? typeOverride : [typeOverride];
  } else if (currentZoneId === 'ForgottenCrypt') {
    types = ['skeleton_warrior', 'undead_knight', 'bone_archon', 'clockwork_spider'];
  } else if (currentZoneId === 'FrostpeakTundra' || currentZoneId === 'StormpeakRidge') {
    types = ['frost_wolf', 'frost_golem', 'storm_drake', 'crystal_serpent', 'thunder_roc'];
  } else if (currentZoneId === 'InfernalCaldera' || currentZoneId === 'MoltenCaldera') {
    types = ['fire_imp', 'magma_golem', 'fire_salamander', 'stone_colossus', 'doom_knight'];
  } else if (currentZoneId === 'VoidAbyss' || currentZoneId === 'GenesisCore') {
    types = ['void_spectre', 'chaos_eye', 'tentacle_fiend', 'horror_stalker', 'doom_knight'];
  }

  const packRoll = Math.random();
  let hasLeader = false;

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const mx = cx + (Math.random() - 0.5) * 260;
    const my = cy + (Math.random() - 0.5) * 260;
    if (canWalk(mx, my)) {
      if (!hasLeader && i === 0 && packRoll < 0.25) {
        hasLeader = true;
        const leaderTier = packRoll < 0.08 ? 'mutant' : 'elite';
        spawnMonster(mx, my, type, leaderTier);
      } else {
        spawnMonster(mx, my, type, 'normal');
      }
    }
  }
}

window.gainExp = function(amount) {
  if (!amount || amount <= 0) return;
  player.currentExp = (player.currentExp || 0) + amount;
  if (!player.expToNext || player.expToNext <= 0) player.expToNext = 100;

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

  if (player.invulnerableTimer > 0) {
    player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  }

  // 1. Player Movement & Smooth Wall Slide Collision
  let mx = 0, my = 0;
  if (player.isDead) {
    // Player defeated: cannot move
  } else if (player.freezeTimer > 0) {
    player.freezeTimer -= dt;
  } else {
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    if (player.gamepadMoving) {
      mx += player.gamepadVx || 0;
      my += player.gamepadVy || 0;
    }
  }

  player.isMoving = (mx !== 0 || my !== 0) && !player.isDead;
  if (player.isMoving) {
    const len = Math.hypot(mx, my);
    let currentSpeed = player.speed || 240;
    if (player.isOnIce) {
      currentSpeed *= 1.25; // +25% Speed on slick ice
    }
    if (player.activeBuffs && player.activeBuffs.some(b => b.buffType === 'Swiftness')) {
      currentSpeed *= 1.50;
    }
    if (player.temporalSnareSlowTimer > 0) {
      player.temporalSnareSlowTimer = Math.max(0, player.temporalSnareSlowTimer - dt);
      currentSpeed *= 0.60;
    }
    if (player.chillTimer > 0) {
      player.chillTimer = Math.max(0, player.chillTimer - dt);
      currentSpeed *= 0.55;
    }
    player.vx = (mx / len) * currentSpeed;
    player.vy = (my / len) * currentSpeed;

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

    // Check Player's Current Tile Status
    const curTx = Math.floor(player.x / 48);
    const curTy = Math.floor(player.y / 48);
    const currentGroundTile = currentZoneMap?.grid?.[curTy]?.[curTx];
    player.isStealthed = (currentGroundTile === 14);
    player.isOnIce = (currentGroundTile === 7);

    player.animTimer += dt * 5.5;
    player.animFrame = Math.floor(player.animTimer) % 4;
  } else {
    player.vx = 0;
    player.vy = 0;
    player.animTimer += dt * 2;
    player.animFrame = 0;
  }

  // Dynamic Fog of War Line-of-Sight Reveal
  revealPlayerVision(player.x, player.y, currentZoneId, 7);

  // 2. Environmental Hazards & Tile-Based Ground Hazards
  hazardTickTimer += dt;
  if (hazardTickTimer >= 0.8 && !player.isDead && (!player.invulnerableTimer || player.invulnerableTimer <= 0)) {
    hazardTickTimer = 0;

    // Check Player's Current Tile
    const pTileX = Math.floor(player.x / 48);
    const pTileY = Math.floor(player.y / 48);
    const pTile = currentZoneMap?.grid?.[pTileY]?.[pTileX];

    // Direct Tile Hazard Damage
    if (pTile === 5 || pTile === 13) {
      // Lava Ground & Scorched Earth (Tile 5 or 13)
      const lavaDmg = Math.max(8, Math.round(40 * (1 - (player.fireRes || 0) / 100)));
      player.life = Math.max(0, player.life - lavaDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${lavaDmg} 🔥 Lava Burn!`, true, '#ff3d00');
      if (player.life <= 0) handlePlayerDefeated();

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
    } else if (pTile === 2 || pTile === 9) {
      // Water Stream & Shallow Shoals (Tile 2 or 9 - Pure Water Splash, NO Burn)
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: player.x + (Math.random() - 0.5) * 16,
          y: player.y + 16 + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 40,
          vy: -20 - Math.random() * 20,
          color: '#4facfe',
          life: 0.4,
          maxLife: 0.4,
          size: 2.5
        });
      }
    } else if (pTile === 6) {
      // Toxic Miasma Tile
      const toxicDmg = Math.max(6, Math.round(30 * (1 - (player.chaosRes || 0) / 100)));
      player.life = Math.max(0, player.life - toxicDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${toxicDmg} ☠️ Toxic Ground!`, false, '#c678dd');
      if (player.life <= 0) handlePlayerDefeated();
    } else if (pTile === 7) {
      // Deep Glacial Ice Tile
      const iceDmg = Math.max(4, Math.round(20 * (1 - (player.coldRes || 0) / 100)));
      player.life = Math.max(0, player.life - iceDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${iceDmg} ❄️ Deep Frost!`, false, '#4facfe');
      if (player.life <= 0) handlePlayerDefeated();
    } else if (pTile === 8) {
      // Static Electric Ground Tile
      const electricDmg = Math.max(5, Math.round(25 * (1 - (player.lightningRes || 0) / 100)));
      player.life = Math.max(0, player.life - electricDmg);
      spawnDamageNumber(player.x, player.y - 45, `-${electricDmg} ⚡ Static Shock!`, false, '#ffd700');
      if (player.life <= 0) handlePlayerDefeated();
    }

    // Biome Ambient Heat / Peace
    if (currentZoneId === 'MoltenCaldera' && player.fireRes < 75 && pTile !== 5) {
      const heatDmg = Math.max(5, Math.round((75 - player.fireRes) * 1.5));
      player.life = Math.max(0, player.life - heatDmg);
      spawnDamageNumber(player.x, player.y - 40, `-${heatDmg} 🔥 Heatwave!`, false, '#ff5722');
      if (player.life <= 0) handlePlayerDefeated();
    } else if (currentZoneId === 'SanctuaryHaven' && !player.isDead) {
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

  // 3. Portals & Loot (Protected by portal cooldown)
  if (player.portalCooldown > 0) {
    player.portalCooldown -= dt;
  } else {
    portals.forEach(p => {
      if (Math.hypot(player.x - p.x, player.y - p.y) < 45) {
        player.portalCooldown = 2.0;
        if (p.isSpireNext) {
          window.selectedSpireFloor = p.nextFloor;
        }
        loadZone(p.targetZone, p.targetX, p.targetY);
      }
    });
  }

  // Ground Loot Physics & Despawn Lifecycles (Prevent accumulation on long idle sessions)
  for (let i = groundLoot.length - 1; i >= 0; i--) {
    const loot = groundLoot[i];
    if (loot.bounceTimer > 0) {
      loot.bounceTimer -= dt;
      loot.x += (loot.targetX - loot.x) * 0.15;
      loot.y += (loot.targetY - loot.y) * 0.15;
    }
    // Despawn common items & gold after 180s (Never despawn Unique, Set, or Rare items)
    if (loot.item && loot.item.rarity !== 'Unique' && loot.item.rarity !== 'Set' && loot.item.rarity !== 'Rare') {
      loot.despawnTimer = (loot.despawnTimer !== undefined ? loot.despawnTimer : 180) - dt;
      if (loot.despawnTimer <= 0) {
        groundLoot.splice(i, 1);
      }
    }
  }

  // Cap ground loot to max 120 items
  if (groundLoot.length > 120) {
    for (let i = 0; i < groundLoot.length && groundLoot.length > 120; i++) {
      if (groundLoot[i].item?.rarity !== 'Unique' && groundLoot[i].item?.rarity !== 'Set') {
        groundLoot.splice(i, 1);
        i--;
      }
    }
  }

  // Auto Magnet for Gold Coins and Auto-Loot Currencies
  if (!player.isDead) {
    for (let i = groundLoot.length - 1; i >= 0; i--) {
      const loot = groundLoot[i];
      if (!loot || !loot.item) continue;
      const dist = Math.hypot(player.x - loot.x, player.y - loot.y);

      if (loot.item.isGold) {
        if (dist < 110) {
          // Magnetize gold towards player
          const angle = Math.atan2(player.y - loot.y, player.x - loot.x);
          loot.x += Math.cos(angle) * 380 * dt;
          loot.y += Math.sin(angle) * 380 * dt;
          if (dist < 36) {
            pickUpLoot(i);
          }
        }
      } else if (getGameSetting('autoLootCurrencies')) {
        const cat = (loot.item.category || '').toLowerCase();
        const rarity = (loot.item.rarity || '').toLowerCase();
        if (cat === 'currency' || cat === 'material' || cat === 'recipe' || rarity === 'currency') {
          if (dist < 65) {
            pickUpLoot(i);
          }
        }
      }
    }
  }

  // Camera Shake Decay (If enabled)
  if (camera.shakeTimer > 0) {
    camera.shakeTimer -= dt;
    if (getGameSetting('screenShake')) {
      const mag = camera.shakeMagnitude || 5;
      camera.shakeX = (Math.random() - 0.5) * mag * 2;
      camera.shakeY = (Math.random() - 0.5) * mag * 2;
    } else {
      camera.shakeX = 0;
      camera.shakeY = 0;
    }
    if (camera.shakeTimer <= 0) {
      camera.shakeX = 0;
      camera.shakeY = 0;
    }
  } else {
    camera.shakeX = 0;
    camera.shakeY = 0;
  }

  for (let k in player.cooldowns) {
    if (player.cooldowns[k] > 0) player.cooldowns[k] = Math.max(0, player.cooldowns[k] - dt);
  }
  if (player.attackTimer > 0) {
    player.attackTimer -= dt;
    if (player.attackTimer <= 0) player.isAttacking = false;
  }
  if (!player.isDead) {
    player.mana = Math.min(player.maxMana, player.mana + 10 * dt);
    player.life = Math.min(player.maxLife, player.life + 4 * dt);
  }

  // 1. Channeling Logic (Aether Shrines)
  if (player.channeling) {
    const ch = player.channeling;
    const distToTarget = Math.hypot(player.x - ch.targetX, player.y - ch.targetY);
    if (distToTarget > 140) {
      floatingTexts.push({ x: player.x, y: player.y - 45, text: '❌ Channeling Interrupted (Moved Too Far)!', color: '#e74c3c', life: 1.5 });
      player.channeling = null;
    } else {
      ch.timer -= dt;
      // Channeling particle stream from shrine to player
      if (Math.random() < 0.45) {
        particles.push({
          x: ch.targetX + (Math.random() - 0.5) * 30,
          y: ch.targetY + (Math.random() - 0.5) * 30,
          vx: (player.x - ch.targetX) * 1.8 + (Math.random() - 0.5) * 30,
          vy: (player.y - ch.targetY) * 1.8 + (Math.random() - 0.5) * 30,
          size: Math.random() * 3 + 2,
          color: ch.poi.color || '#ffd700',
          life: 0.55
        });
      }

      if (ch.timer <= 0) {
        ch.poi.isActivated = true;
        player.activeBuffs = (player.activeBuffs || []).filter(b => b.buffType !== ch.poi.buffType);
        player.activeBuffs.push({
          id: ch.poi.id,
          name: ch.poi.name,
          buffType: ch.poi.buffType,
          duration: ch.poi.buffDuration || 90,
          maxDuration: ch.poi.buffDuration || 90,
          icon: ch.poi.icon,
          color: ch.poi.color,
          description: ch.poi.description
        });
        AudioEngine.playSpellCast?.('meteor');
        floatingTexts.push({ x: player.x, y: player.y - 45, text: `✨ ${ch.poi.name} RECEIVED!`, color: ch.poi.color || '#ffd700', isCrit: true, life: 2.4 });
        for (let i = 0; i < 28; i++) {
          particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 180,
            vy: (Math.random() - 0.5) * 180,
            size: Math.random() * 5 + 3,
            color: ch.poi.color || '#ffd700',
            life: 1.2
          });
        }
        player.channeling = null;
        updateBuffsHUD();
      }
    }
  }

  // Active Shrine Blessings Countdown & Passive Effect Ticks
  if (player.activeBuffs && player.activeBuffs.length > 0) {
    for (let i = player.activeBuffs.length - 1; i >= 0; i--) {
      const b = player.activeBuffs[i];
      b.duration -= dt;
      if (b.duration <= 0) {
        floatingTexts.push({ x: player.x, y: player.y - 45, text: `⏳ ${b.name} Expired`, color: '#a0aec0', life: 1.5 });
        player.activeBuffs.splice(i, 1);
      } else if (!player.isDead) {
        if (b.buffType === 'AegisSanctuary') {
          player.life = Math.min(player.maxLife, player.life + player.maxLife * 0.06 * dt);
        }
        if (b.buffType === 'InfiniteAether') {
          player.mana = Math.min(player.maxMana, player.mana + player.maxMana * 0.15 * dt);
          player.es = Math.min(player.maxEs, (player.es || 0) + player.maxEs * 0.15 * dt);
        }
        if (b.buffType === 'SolarInferno') {
          shrineInfernoTimer += dt;
          if (shrineInfernoTimer >= 0.5) {
            shrineInfernoTimer = 0;
            monsters.forEach(m => {
              if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) < 180) {
                dealDamage(m, 0, 80, 0, 0, 0, false, { x: player.x, y: player.y }, false, true);
              }
            });
            particles.push({
              x: player.x + (Math.random() - 0.5) * 50,
              y: player.y + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 40,
              vy: -50 - Math.random() * 30,
              color: '#ff7849',
              life: 0.35,
              maxLife: 0.35,
              size: 4
            });
          }
        }
        if (b.buffType === 'AbsoluteFrost') {
          monsters.forEach(m => {
            if (m.isAlive && Math.hypot(m.x - player.x, m.y - player.y) < 180) {
              applyChill(m, 0.8);
            }
          });
        }
      }
    }
  }
  updateBuffsHUD();

  // 2. Dynamic Periodic Monster Respawn Engine
  if (currentZoneId !== 'SanctuaryHaven' && zoneMonsterSpawners && zoneMonsterSpawners.length > 0) {
    zoneRespawnTimer += dt;
    if (zoneRespawnTimer >= 14.0) {
      zoneRespawnTimer = 0;
      const aliveCount = monsters.filter(m => m.isAlive).length;
      if (aliveCount < 45) {
        const validSpawners = zoneMonsterSpawners.filter(sp => {
          if (sp.type === 'boss') return false;
          const dist = Math.hypot(player.x - sp.x, player.y - sp.y);
          return dist >= 350 && dist <= 1200;
        });

        if (validSpawners.length > 0) {
          const targetSp = validSpawners[Math.floor(Math.random() * validSpawners.length)];
          for (let k = 0; k < 16; k++) {
            particles.push({
              x: targetSp.x + (Math.random() - 0.5) * 60,
              y: targetSp.y + (Math.random() - 0.5) * 60,
              vx: (Math.random() - 0.5) * 60,
              vy: -Math.random() * 80,
              color: '#9b59b6',
              life: 1.2,
              size: 4
            });
          }
          floatingTexts.push({ x: targetSp.x, y: targetSp.y - 40, text: '🌀 Monsters Emerging...', color: '#9b59b6', life: 1.8 });
          spawnMonsterCluster(targetSp.x, targetSp.y, targetSp.count || 5, targetSp.type);
        }
      }
    }
  }

  if (!player.isDead && mouse.isDown && (player.cooldowns.slash || 0) <= 0 && (player.freezeTimer || 0) <= 0) {
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

    // 1. Terrain Wall / Pillar Collision Check
    if (isProjectileBlocked(p.x, p.y)) {
      hit = true;
      AudioEngine.playTone(180, 'triangle', 0.12, 0.08);
    }

    // 2. Monster & Player Hit Checks
    if (!hit) {
      if (p.isMonsterProjectile) {
        // Monster bullet hits Player
        if (Math.hypot(player.x - p.x, player.y - p.y) < 24) {
          dealDamageToPlayer({ attackDmg: p.damage || 25, dmgType: p.fireDmg ? 'fire' : 'physical', isAlive: true });
          hit = true;
        }
      } else {
        // Player bullet hits Monsters / Dummies
        monsters.forEach(m => {
          if (m.isAlive && !hit && Math.hypot(m.x - p.x, m.y - p.y) < 28 * (m.scale || 1)) {
            if (p.type === 'windblade') {
              dealDamage(m, p.damage || 85, 0, 0, 0, 0, true, { x: p.x, y: p.y }, true, false, 'slash');
            } else if (p.type === 'frost') {
              dealDamage(m, 10, 0, p.damage || 85, 0, 0, true, { x: p.x, y: p.y }, false, false, 'frost');
            } else {
              // Fireball (supports partial Chaos from Hellfire Chaos)
              dealDamage(m, 10, p.fireDmg !== undefined ? p.fireDmg : (p.damage || 85), 0, 0, p.chaosDmg || 0, true, { x: p.x, y: p.y }, false, false, 'fireball');
            }
            hit = true;
          }
        });

        trainingDummies.forEach(d => {
          if (!hit && Math.hypot(d.x - p.x, d.y - p.y) < 28) {
            if (p.type === 'windblade') {
              dealDamage(d, p.damage || 85, 0, 0, 0, 0, true, { x: p.x, y: p.y }, true, false, 'slash');
            } else if (p.type === 'frost') {
              dealDamage(d, 10, 0, p.damage || 85, 0, 0, true, { x: p.x, y: p.y }, false, false, 'frost');
            } else {
              dealDamage(d, 10, p.fireDmg !== undefined ? p.fireDmg : (p.damage || 85), 0, 0, p.chaosDmg || 0, true, { x: p.x, y: p.y }, false, false, 'fireball');
            }
            hit = true;
          }
        });
      }
    }

    if (hit || p.life <= 0) {
      const impactColor = p.type === 'frost' ? '#00f2fe' : (p.type === 'windblade' ? '#ffd700' : (p.chaosDmg ? '#c678dd' : '#ff5722'));
      for (let k = 0; k < 12; k++) {
        particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 180,
          vy: (Math.random() - 0.5) * 180,
          color: impactColor,
          life: 0.3,
          maxLife: 0.3,
          size: 5
        });
      }
      projectiles.splice(i, 1);
    }
  }

  // Blasphemy Curse Auras Radius Checks
  updateCurseAuras(dt);

  // Boss & Monster AI + Ailments
  let activeBoss = null;
  monsters.forEach(m => {
    if (!m.isAlive) return;
    if (m.type === 'boss' || m.type === 'ignis_boss' || m.type === 'vael_boss' || m.type === 'malakor_boss') {
      activeBoss = m;
    }

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

    // Monster AI Hibernation: Skip expensive calculations if monster is far off-screen (>650px)
    if (dist > 650 && m.type !== 'boss') return;

    // Monster Aggro Distance (Reduced from 450px to 90px if player is Stealthed in Camouflage Bush!)
    const aggroDist = player.isStealthed ? 90 : 450;
    if (!player.isDead && dist < aggroDist && dist > 35) {
      const angle = Math.atan2(player.y - m.y, player.x - m.x);
      const nx = m.x + Math.cos(angle) * currentSpeed * dt;
      const ny = m.y + Math.sin(angle) * currentSpeed * dt;
      if (canWalk(nx, m.y)) m.x = nx;
      if (canWalk(m.x, ny)) m.y = ny;
    }

    // Monster attacks player on contact or within attack range
    m.attackCooldownTimer = Math.max(0, (m.attackCooldownTimer || 0) - dt);

    if (!player.isDead && dist <= (m.attackRange || 45) && m.attackCooldownTimer <= 0) {
      m.attackCooldownTimer = m.attackCooldown || 1.2;
      dealDamageToPlayer(m);

      if (currentZoneId === 'FrostpeakTundra' && player.coldRes < 75 && Math.random() < 0.25) {
        player.freezeTimer = 0.8;
        spawnDamageNumber(player.x, player.y - 45, '❄️ FROZEN BY BLIZZARD!', true, '#00f2fe');
      }
    } else if (!player.isDead && m.type === 'fire_imp' && dist <= 240 && dist > 50 && m.attackCooldownTimer <= 0) {
      // Fire Imp Ranged Fireball attack towards player
      m.attackCooldownTimer = m.attackCooldown || 1.6;
      const fAngle = Math.atan2(player.y - m.y, player.x - m.x);
      projectiles.push({
        x: m.x,
        y: m.y,
        vx: Math.cos(fAngle) * 280,
        vy: Math.sin(fAngle) * 280,
        type: 'fireball',
        damage: m.attackDmg || 25,
        fireDmg: m.attackDmg || 25,
        chaosDmg: 0,
        radius: 10,
        life: 1.5,
        isMonsterProjectile: true
      });
      AudioEngine.playTone(380, 'sawtooth', 0.1, 0.08);
    }

    // Monster Affix: Frostpulse (periodic 3.5s frost pulse ring)
    if (m.affixes && m.affixes.includes('frostpulse')) {
      m.frostpulseTimer = (m.frostpulseTimer || 3.5) - dt;
      if (m.frostpulseTimer <= 0) {
        m.frostpulseTimer = 3.5;
        if (dist <= 200 && !player.isDead) {
          dealDamageToPlayer({ attackDmg: 18, dmgType: 'cold', isAlive: true });
          applyChill(player, 2.0);
          spawnDamageNumber(player.x, player.y - 45, '❄️ FROSTPULSE SLOW!', false, '#00f2fe');
        }
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          particles.push({
            x: m.x,
            y: m.y,
            vx: Math.cos(a) * 160,
            vy: Math.sin(a) * 160,
            color: '#00f2fe',
            life: 0.4,
            maxLife: 0.4,
            size: 4
          });
        }
      }
    }

    // Monster Affix: Temporal Snare (40% slow within 220px)
    if (m.affixes && m.affixes.includes('temporal_snare') && dist <= 220 && !player.isDead) {
      player.temporalSnareSlowTimer = 0.5;
    }

    // Boss Enraged Bullet-Hell Spiral Barrage
    if (m.isEnraged && dist <= 500 && !player.isDead) {
      m.bulletHellTimer = (m.bulletHellTimer || 1.8) - dt;
      if (m.bulletHellTimer <= 0) {
        m.bulletHellTimer = 1.8;
        spawnDamageNumber(m.x, m.y - 80, '🔥 CATACLYSM BARRAGE!', true, '#ff3d00');
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          projectiles.push({
            x: m.x,
            y: m.y,
            vx: Math.cos(a) * 240,
            vy: Math.sin(a) * 240,
            type: 'fireball',
            damage: 28,
            fireDmg: 28,
            chaosDmg: 0,
            radius: 12,
            life: 2.0,
            isMonsterProjectile: true
          });
        }
        AudioEngine.playTone(280, 'sawtooth', 0.2, 0.12);
      }
    }
  });

  // Companion Pet Engine Update (Auto-loot, Aura & Delivery)
  updateCompanion(dt);

  // Gathering & Profession System Update (Channeling & Node Sparkles)
  updateGatheringSystem(dt);

  const bossHud = document.getElementById('boss-hud') || document.getElementById('boss-hud-bar');
  if (bossHud) {
    if (activeBoss && activeBoss.isAlive && Math.hypot(player.x - activeBoss.x, player.y - activeBoss.y) < 1100) {
      bossHud.classList.remove('boss-hud-hide');
      const hpPct = Math.max(0, (activeBoss.life / activeBoss.maxLife) * 100);
      const hpFill = document.getElementById('boss-hp-fill');
      if (hpFill) hpFill.style.width = `${hpPct}%`;

      const bossDisplayName = activeBoss.type === 'ignis_boss' ? '🌋 Ignis, The Molten Archon' :
                             (activeBoss.type === 'vael_boss' ? '❄️ Vael, The Frost Sovereign' :
                             (activeBoss.type === 'malakor_boss' ? '🌌 Malakor, The Shadow Devourer' : (activeBoss.name || '👑 Guardian Sovereign')));
      const nameEl = document.getElementById('boss-name') || document.getElementById('boss-name-title');
      if (nameEl) nameEl.innerText = bossDisplayName;
      const hpTextEl = document.getElementById('boss-hp-text');
      if (hpTextEl) hpTextEl.innerText = `${Math.round(activeBoss.life)} / ${activeBoss.maxLife} (${Math.round(hpPct)}%)`;

      // Update Stagger Bar
      const stFill = document.getElementById('boss-stagger-fill');
      const stText = document.getElementById('boss-stagger-text');
      if (activeBoss.isStaggered) {
        activeBoss.staggerTimer = Math.max(0, (activeBoss.staggerTimer || 6.0) - dt);
        if (activeBoss.staggerTimer <= 0) {
          activeBoss.isStaggered = false;
          activeBoss.stagger = 0;
        }
        if (stFill) stFill.style.width = `${(activeBoss.staggerTimer / 6.0) * 100}%`;
        if (stText) stText.innerText = `⚡ STAGGERED! (+50% BURST: ${activeBoss.staggerTimer.toFixed(1)}s)`;
      } else {
        const curSt = activeBoss.stagger || 0;
        const maxSt = activeBoss.maxStagger || 100;
        const stPct = (curSt / maxSt) * 100;
        if (stFill) stFill.style.width = `${stPct}%`;
        if (stText) stText.innerText = `⚡ STAGGER: ${Math.round(stPct)}%`;
      }
    } else {
      bossHud.classList.add('boss-hud-hide');
    }
  }

  // Frame-level cleanup: Purge any dead or handled monsters to keep monsters array lean
  for (let i = monsters.length - 1; i >= 0; i--) {
    if (!monsters[i].isAlive || monsters[i].defeatedHandled) {
      monsters.splice(i, 1);
    }
  }

  // Update & Clamp Particles (Max 250)
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.life -= dt;
    if (pt.life <= 0) particles.splice(i, 1);
  }
  if (particles.length > 250) {
    particles.splice(0, particles.length - 250);
  }

  // Update & Clamp Floating Numbers / Texts (Max 40)
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
  if (floatingTexts.length > 40) {
    floatingTexts.splice(0, floatingTexts.length - 40);
  }

  // Spire Arena Victory & Next Floor Check
  if (currentZoneId === 'SpireArena' && monsters.length === 0 && !window.spireFloorCleared) {
    window.spireFloorCleared = true;
    const curF = window.selectedSpireFloor || 1;
    if (curF > (player.highestClearedSpireFloor || 0)) {
      player.highestClearedSpireFloor = curF;
      saveToDatabase();
    }
    AudioEngine.playLevelUp?.();
    spawnDamageNumber(player.x, player.y - 70, `🎉 SPIRE FLOOR ${curF} CLEARED!`, true, '#ffd700');
    
    // Spawn portal to next floor in arena center
    portals.push({
      id: `spire_next_${curF}`,
      name: `🌀 Advance to Spire Floor ${curF + 1}`,
      x: (currentZoneMap.worldWidth / 2),
      y: (currentZoneMap.worldHeight / 2),
      targetZone: 'SpireArena',
      radius: 65,
      isSpireNext: true,
      nextFloor: curF + 1
    });
  }

  // Update Other Multiplayer Peers with Smooth Exponential Reconciliation (<48px lag compensation)
  otherPlayers.forEach(peer => {
    if (peer.targetX !== undefined && peer.targetY !== undefined) {
      const dx = peer.targetX - peer.x;
      const dy = peer.targetY - peer.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 400) {
        peer.x = peer.targetX;
        peer.y = peer.targetY;
      } else if (dist > 1) {
        const lerpFactor = Math.min(1.0, dt * 12);
        peer.x += dx * lerpFactor;
        peer.y += dy * lerpFactor;
      }
    }
  });

  updatePlayerLeech(dt);
  updateGamepad(dt);
  updateMapIncursions(dt);
  updateFlasks(dt);
  updateShadowArmy(dt);
  updateHUD();
}

const hudCache = {
  barEs: null, textEs: null,
  barLife: null, textLife: null,
  barMana: null, textMana: null,
  hudLevel: null, zoomText: null,
  cds: {},
  lastEs: -1, lastMaxEs: -1,
  lastLife: -1, lastMaxLife: -1,
  lastMana: -1, lastMaxMana: -1,
  lastLevel: -1, lastZoom: -1,
  lastCds: {}
};

function updateHUD() {
  if (!hudCache.barEs) {
    hudCache.barEs = document.getElementById('bar-es');
    hudCache.textEs = document.getElementById('text-es');
    hudCache.barLife = document.getElementById('bar-life');
    hudCache.textLife = document.getElementById('text-life');
    hudCache.barMana = document.getElementById('bar-mana');
    hudCache.textMana = document.getElementById('text-mana');
    hudCache.hudLevel = document.getElementById('hud-level');
    hudCache.zoomText = document.getElementById('zoom-level-text');
  }

  const curEs = Math.round(player.es || 0);
  const curMaxEs = player.maxEs || 100;
  if (curEs !== hudCache.lastEs || curMaxEs !== hudCache.lastMaxEs) {
    hudCache.lastEs = curEs;
    hudCache.lastMaxEs = curMaxEs;
    if (hudCache.barEs) hudCache.barEs.style.width = `${(curEs / curMaxEs) * 100}%`;
    if (hudCache.textEs) hudCache.textEs.innerText = `ES: ${curEs} / ${curMaxEs}`;
  }

  const curLife = Math.round(player.life || 0);
  const curMaxLife = player.maxLife || 250;
  if (curLife !== hudCache.lastLife || curMaxLife !== hudCache.lastMaxLife) {
    hudCache.lastLife = curLife;
    hudCache.lastMaxLife = curMaxLife;
    if (hudCache.barLife) hudCache.barLife.style.width = `${(curLife / curMaxLife) * 100}%`;
    if (hudCache.textLife) hudCache.textLife.innerText = `HP: ${curLife} / ${curMaxLife}`;
  }

  const curMana = Math.round(player.mana || 0);
  const curMaxMana = player.maxMana || 120;
  if (curMana !== hudCache.lastMana || curMaxMana !== hudCache.lastMaxMana) {
    hudCache.lastMana = curMana;
    hudCache.lastMaxMana = curMaxMana;
    if (hudCache.barMana) hudCache.barMana.style.width = `${(curMana / curMaxMana) * 100}%`;
    if (hudCache.textMana) hudCache.textMana.innerText = `MP: ${curMana} / ${curMaxMana}`;
  }

  if (player.level !== hudCache.lastLevel) {
    hudCache.lastLevel = player.level;
    if (hudCache.hudLevel) hudCache.hudLevel.innerText = `Lv.${player.level}`;
  }

  const curZoom = Math.round(camera.zoom * 100);
  if (curZoom !== hudCache.lastZoom) {
    hudCache.lastZoom = curZoom;
    if (hudCache.zoomText) hudCache.zoomText.innerText = `${curZoom}%`;
  }

  updateExpBar();

  for (let k in player.cooldowns) {
    if (!hudCache.cds[k]) hudCache.cds[k] = document.getElementById(`cd-${k}`);
    const el = hudCache.cds[k];
    if (el) {
      const maxCd = SKILLS[k] ? SKILLS[k].baseCooldown : 1.0;
      const pct = Math.round((player.cooldowns[k] / maxCd) * 100);
      if (hudCache.lastCds[k] !== pct) {
        hudCache.lastCds[k] = pct;
        el.style.height = `${pct}%`;
      }
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

  // Smooth camera zoom interpolation bounded to [minZoom, maxZoom]
  if (camera.targetZoom !== undefined && Math.abs(camera.zoom - camera.targetZoom) > 0.001) {
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.15;
  }

  update(dt);
  renderGame(canvas, ctx, minimapCanvas, mmCtx, currentZone, currentZoneMap);

  requestAnimationFrame(gameLoop);
}

// Window Event Listeners
window.addEventListener('wheel', e => {
  if (document.querySelector('.worldmap-modal-wrap:not(.hidden)')) return;
  e.preventDefault();
  const zoomFactor = -Math.sign(e.deltaY) * 0.08;
  camera.targetZoom = Math.max(camera.minZoom || 0.85, Math.min(camera.maxZoom || 1.35, (camera.targetZoom || camera.zoom || 1.0) + zoomFactor));
}, { passive: false });

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Digit1') useFlask(0);
  if (e.code === 'Digit2') useFlask(1);
  if (e.code === 'Digit3') useFlask(2);
  if (e.code === 'Digit4') useFlask(3);
  if (e.code === 'KeyQ') castFireball();
  if (e.code === 'KeyW') castFrostNova();
  if (e.code === 'KeyE') castMeteor();
  if (e.code === 'Space') castDash();
  if (e.code === 'KeyK') toggleModal('skills-modal');
  if (e.code === 'KeyL') toggleCodexModal();
  if (e.code === 'KeyM') toggleModal('worldmap-modal');
  if (e.code === 'KeyC') toggleModal('stats-modal');
  if (e.code === 'KeyI') toggleModal('inventory-modal');
  if (e.code === 'KeyU') renderSpireModal();
  if (e.code === 'KeyT') toggleMarketModal();
  if (e.code === 'KeyG') extractShadow();
  if (e.code === 'KeyY') toggleCompendiumUI('bestiary');
  if (e.code === 'Tab') {
    e.preventDefault();
    toggleRadialWheel();
  }
  if (e.code === 'Escape') {
    const allModalIds = [
      'ascension-modal', 'skills-modal', 'inventory-modal', 'worldmap-modal',
      'stats-modal', 'character-roster-modal', 'defeat-modal', 'sharedStashModal',
      'forgeBenchModal', 'devotionModal', 'mapDeviceModal', 'npcDialogueModal',
      'bestiaryModal', 'rosterModal', 'codexModal', 'googleAuthModal', 'channelModal', 'spireModal', 'settingsModal', 'marketModal', 'radialMenuOverlay'
    ];
    let closedAny = false;
    allModalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.style.display !== 'none' && !el.classList.contains('hidden')) {
        el.classList.remove('active');
        el.classList.add('hidden');
        el.style.display = 'none';
        closedAny = true;
      }
    });
    if (!closedAny) {
      toggleSettingsModal();
    }
  }

  if (e.code === 'KeyF') {
    // -1. Check Gathering Resource Nodes (Mining / Herbalism)
    if (tryInteractGatheringNode()) {
      return;
    }

    // 0. Check near POI (Aether Shrine, Corrupted Monolith, Sub-Cave)
    const nearPoi = pois.find(p => Math.hypot(player.x - p.x, player.y - p.y) < (p.radius || 75));
    if (nearPoi) {
      if (nearPoi.isActivated) {
        floatingTexts.push({ x: nearPoi.x, y: nearPoi.y - 40, text: '(Already Activated)', color: '#7f8c8d', life: 1.2 });
        return;
      }
      if (nearPoi.type === 'shrine') {
        if (player.channeling && player.channeling.poi?.id === nearPoi.id) {
          return; // already channeling this shrine
        }
        player.channeling = {
          type: 'shrine',
          poi: nearPoi,
          duration: 2.5,
          timer: 2.5,
          targetX: nearPoi.x,
          targetY: nearPoi.y
        };
        AudioEngine.playTone?.(440, 'sine', 0.15, 0.08);
        floatingTexts.push({ x: player.x, y: player.y - 45, text: '⏳ Channeling Blessing (2.5s)...', color: '#ffd700', life: 1.5 });
        return;
      } else if (nearPoi.type === 'monolith') {
        nearPoi.isActivated = true;
        floatingTexts.push({ x: nearPoi.x, y: nearPoi.y - 40, text: '⚠️ CORRUPTED MONOLITH AWAKENED!', color: '#e74c3c', isCrit: true, life: 2.5 });
        spawnMonsterCluster(nearPoi.x - 60, nearPoi.y - 60, 4, 'undead_knight');
        spawnMonsterCluster(nearPoi.x + 60, nearPoi.y + 60, 4, 'goblin');
        spawnMonster(nearPoi.x, nearPoi.y, 'boss');
        return;
      } else if (nearPoi.type === 'sub_cave') {
        loadZone(nearPoi.targetSubZone || 'ForgottenCrypt', 300, 300);
        return;
      }
    }

    // 1. Check near NPC to talk
    const nearNpc = npcs.find(n => Math.hypot(player.x - n.x, player.y - n.y) < 110);
    if (nearNpc) {
      openNpcDialogue(nearNpc);
      return;
    }

    // 2. Check near Map Device in Town
    if (player.zoneId === 'SanctuaryHaven') {
      const nearMapDevice = props.find(p => p.type === 'map_device' && Math.hypot(player.x - p.x, player.y - p.y) < 100);
      if (nearMapDevice) {
        renderMapDeviceModal();
        return;
      }
    }

    // 3. Check near Stash Chest Prop in Town
    if (player.zoneId === 'SanctuaryHaven') {
      const nearChest = props.find(p => p.type === 'chest' && Math.hypot(player.x - p.x, player.y - p.y) < 100);
      if (nearChest) {
        renderSharedStashModal();
        return;
      }
    }

    // 4. Pickup Loot
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
  if (player.isDead) return;
  if (e.button === 0 && e.target === canvas) {
    AudioEngine.init();

    // Check click on NPC to talk
    const clickedNpc = npcs.find(n => Math.hypot(mouse.worldX - n.x, mouse.worldY - n.y) < 40);
    if (clickedNpc && Math.hypot(player.x - clickedNpc.x, player.y - clickedNpc.y) < 160) {
      openNpcDialogue(clickedNpc);
      return;
    }

    // Check click on Map Device in Town
    if (player.zoneId === 'SanctuaryHaven') {
      const clickedDevice = props.find(p => p.type === 'map_device' && Math.hypot(mouse.worldX - p.x, mouse.worldY - p.y) < 45);
      if (clickedDevice && Math.hypot(player.x - clickedDevice.x, player.y - clickedDevice.y) < 160) {
        renderMapDeviceModal();
        return;
      }
    }

    // Check click on chest prop in Town
    if (player.zoneId === 'SanctuaryHaven') {
      const clickedChest = props.find(p => p.type === 'chest' && Math.hypot(mouse.worldX - p.x, mouse.worldY - p.y) < 40);
      if (clickedChest && Math.hypot(player.x - clickedChest.x, player.y - clickedChest.y) < 140) {
        renderSharedStashModal();
        return;
      }
    }

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

// Setup 5 Master Hub Buttons & World Map
document.getElementById('btn-toggle-hero-hub')?.addEventListener('click', () => toggleModal('inventory-modal'));
document.getElementById('btn-toggle-compendium')?.addEventListener('click', () => toggleCompendiumUI());
document.getElementById('btn-toggle-adventure-hub')?.addEventListener('click', () => toggleModal('worldmap-modal'));
document.getElementById('btn-toggle-market')?.addEventListener('click', toggleMarketModal);
document.getElementById('btn-toggle-settings')?.addEventListener('click', toggleSettingsModal);

// Legacy hotkey button references
document.getElementById('btn-toggle-bestiary')?.addEventListener('click', () => toggleCompendiumUI('bestiary'));
document.getElementById('btn-toggle-roster')?.addEventListener('click', openRosterUI);
document.getElementById('btn-toggle-spire')?.addEventListener('click', renderSpireModal);
document.getElementById('btn-toggle-codex')?.addEventListener('click', () => toggleCompendiumUI('lore'));

// Zone Chat input listener
const chatInput = document.getElementById('zoneChatInput');
const btnSendChat = document.getElementById('btnSendChat');

const sendCurrentChat = () => {
  if (!chatInput) return;
  const raw = chatInput.value.trim();
  if (!raw) return;
  let scope = 'channel';
  let msg = raw;
  if (raw.startsWith('/w ') || raw.startsWith('/world ')) {
    scope = 'world';
    msg = raw.replace(/^\/(w|world)\s+/, '');
  } else if (raw.startsWith('/z ') || raw.startsWith('/zone ')) {
    scope = 'zone';
    msg = raw.replace(/^\/(z|zone)\s+/, '');
  }
  if (msg) {
    MPClient.sendChat(msg, scope);
    chatInput.value = '';
  }
};

if (chatInput) {
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendCurrentChat();
    }
  });
}
if (btnSendChat) {
  btnSendChat.onclick = () => {
    sendCurrentChat();
  };
}

// Zone Chat minimize / expand controls
const chatPanel = document.getElementById('zone-chat-panel');
const btnMinimizeChat = document.getElementById('btnMinimizeChat');
const btnExpandChat = document.getElementById('btnExpandChat');
const chatHeaderToggle = document.getElementById('chatHeaderToggle');

if (chatPanel) {
  let isChatMinimized = false;
  let isChatExpanded = false;

  const updateChatState = () => {
    chatPanel.classList.toggle('is-minimized', isChatMinimized);
    chatPanel.classList.toggle('is-expanded', isChatExpanded);
    if (btnMinimizeChat) btnMinimizeChat.innerText = isChatMinimized ? '▢' : '─';
    if (btnExpandChat) btnExpandChat.innerText = isChatExpanded ? '⤡' : '⤢';
  };

  btnMinimizeChat?.addEventListener('click', (e) => {
    e.stopPropagation();
    isChatMinimized = !isChatMinimized;
    if (isChatMinimized) isChatExpanded = false;
    updateChatState();
  });

  btnExpandChat?.addEventListener('click', (e) => {
    e.stopPropagation();
    isChatExpanded = !isChatExpanded;
    if (isChatExpanded) isChatMinimized = false;
    updateChatState();
  });

  chatHeaderToggle?.addEventListener('click', (e) => {
    if (e.target === btnMinimizeChat || e.target === btnExpandChat) return;
    if (isChatMinimized) {
      isChatMinimized = false;
      updateChatState();
    }
  });
}

// Initialize UI and Game
setupUIListeners();
initDefeatUI();
setupCompendiumUI();
setupRosterUI();
initGamepadSystem();
MPClient.init();
document.getElementById('btn-toggle-settings')?.addEventListener('click', toggleSettingsModal);

// Load previous savegame from SQLite DB and begin auto-save loop
(async function initSave() {
  loadGameSettings();
  applyLocalization();
  await checkGoogleOAuthRedirectResult();
  await Promise.all([
    fetchMasterItemsFromServer(),
    fetchMasterMonstersFromServer(),
    fetchMasterFamilyMasteryFromServer(),
    fetchMasterSkillsFromServer(),
    fetchMasterZonesFromServer(),
    fetchMasterCampaignFromServer(),
    fetchMasterQuestsFromServer(),
    fetchMasterNpcsFromServer(),
    fetchMasterDevotionFromServer()
  ]);
  const loaded = await loadFromDatabase();
  
  // Always return player safely to the Safe-Haven Town of their current Act upon login / session start
  const targetTown = getTownForAct(player.zoneId || 'SanctuaryHaven');
  await loadZone(targetTown);
  
  // Restore life and mana upon entering town
  player.life = player.maxLife || 500;
  player.mana = player.maxMana || 200;
  player.es = player.maxEs || 0;
  player.isDead = false;

  updateHudAvatar();
  updateExpBar();
  initFlasks();
  renderFlaskHUD();
  applyLocalization();
  startAutoSave(10000);
})();

requestAnimationFrame(gameLoop);
