/**
 * MDG: Aethelis - Gathering & Profession Engine
 * 3 Gathering Professions: Mining (⛏️), Herbalism (🌿), Skinning & Hunting (🐺)
 * Material Tiers (T1 to T4) with Profession Level Requirements (Lv. 1, 10, 20, 30, 40)
 * Biome & Terrain-Constrained Resource Spawning, Spatial Chunk Capping,
 * 6% Rare/Prismatic Node Jackpot Variant, Dynamic Regrowth & Interactive Channeling
 */

import { player, particles } from '../state.js';
import { assets } from '../assets.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';
import { getMaterialInfo } from '../data/materials.js';
import { ApiClient } from '../services/api-client.js';

export const PROFESSIONS_INFO = {
  mining: {
    id: 'mining',
    name: 'Mining (Khai Khoáng)',
    icon: '⛏️',
    color: '#00f2fe',
    desc: 'Extract raw metal ores and arcane crystals from subterranean rock veins.'
  },
  herbalism: {
    id: 'herbalism',
    name: 'Herbalism (Thảo Dược Học)',
    icon: '🌿',
    color: '#4ade80',
    desc: 'Harvest vital roots, dew-blooms, and elemental leaves for alchemy.'
  },
  skinning: {
    id: 'skinning',
    name: 'Skinning & Hunting (Lột Da / Săn Thú)',
    icon: '🐺',
    color: '#ffd700',
    desc: 'Harvest beast leathers, demonic horns, and dragon scales from slain foes.'
  }
};

export const RESOURCE_NODES_CATALOG = {
  // --- MINING NODES (T1 to T4) ---
  node_silica_sand: {
    id: 'node_silica_sand',
    name: 'Silica Quartz Sandbank',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 1,
    tier: 1,
    icon: '📦',
    color: '#e2e8f0',
    yieldMatId: 'mat_silica_sand',
    minYield: 3,
    maxYield: 6,
    expGain: 20,
    channelTime: 0.8,
    preferredTileTypes: [9, 2, 0], // Sand / Shallow Water / Floor
    preferWaterAdjacent: true
  },
  node_iron_ore: {
    id: 'node_iron_ore',
    name: 'Iron Ore Vein',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 1,
    tier: 1,
    icon: '⛏️',
    color: '#a0a8b7',
    yieldMatId: 'mat_iron_ore',
    minYield: 2,
    maxYield: 4,
    expGain: 25,
    channelTime: 1.2,
    preferredTileTypes: [0, 3, 4],
    preferWallAdjacent: true
  },
  node_mithril: {
    id: 'node_mithril',
    name: 'Glacial Mithril Vein',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 10,
    tier: 2,
    icon: '💎',
    color: '#00f2fe',
    yieldMatId: 'mat_mithril_chunk',
    minYield: 2,
    maxYield: 3,
    expGain: 50,
    channelTime: 1.4,
    preferredTileTypes: [7, 12, 0], // Glacial Ice / Snow / Floor
    preferWallAdjacent: true
  },
  node_pure_silver: {
    id: 'node_pure_silver',
    name: 'Ancient Pure Silver Vein',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 15,
    tier: 2,
    icon: '🪙',
    color: '#e2e8f0',
    yieldMatId: 'mat_pure_silver',
    minYield: 2,
    maxYield: 4,
    expGain: 60,
    channelTime: 1.4,
    preferredTileTypes: [0, 4, 10], // Crypt Floor / Plaza / Pillar
    preferWallAdjacent: true
  },
  node_titan_ore: {
    id: 'node_titan_ore',
    name: 'Titan Heavy Ore Vein',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 25,
    tier: 3,
    icon: '🪨',
    color: '#94a3b8',
    yieldMatId: 'mat_titan_ore',
    minYield: 2,
    maxYield: 3,
    expGain: 80,
    channelTime: 1.6,
    preferredTileTypes: [0, 3, 10],
    preferWallAdjacent: true
  },
  node_adamantite: {
    id: 'node_adamantite',
    name: 'Volcanic Adamantite Core',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 35,
    tier: 3,
    icon: '🪨',
    color: '#ffd700',
    yieldMatId: 'mat_adamantite_ingot',
    minYield: 1,
    maxYield: 2,
    expGain: 120,
    channelTime: 2.0,
    preferredTileTypes: [13, 0, 5], // Burnt Ground / Floor
    preferLavaAdjacent: true
  },
  node_aether_crystal: {
    id: 'node_aether_crystal',
    name: 'Arcane Aether Geode',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 40,
    tier: 4,
    icon: '🔮',
    color: '#c678dd',
    yieldMatId: 'mat_aether_crystal',
    minYield: 2,
    maxYield: 3,
    expGain: 140,
    channelTime: 1.8,
    preferredTileTypes: [0, 11, 8],
    preferWallAdjacent: true
  },
  node_astral_crystal: {
    id: 'node_astral_crystal',
    name: 'Genesis Astral Crystal',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 45,
    tier: 4,
    icon: '💠',
    color: '#00f2fe',
    yieldMatId: 'mat_astral_crystal',
    minYield: 1,
    maxYield: 2,
    expGain: 180,
    channelTime: 2.2,
    preferredTileTypes: [0, 4, 10],
    preferWallAdjacent: true
  },

  // --- HERBALISM NODES (T1 to T4) ---
  node_aether_water: {
    id: 'node_aether_water',
    name: 'Pure Aether Spring',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 1,
    tier: 1,
    icon: '💧',
    color: '#67e8f9',
    yieldMatId: 'mat_aether_water',
    minYield: 2,
    maxYield: 5,
    expGain: 20,
    channelTime: 0.8,
    preferredTileTypes: [9, 2, 0],
    preferWaterAdjacent: true
  },
  node_blood_herb: {
    id: 'node_blood_herb',
    name: 'Crimson Bloodroot Patch',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 1,
    tier: 1,
    icon: '🌿',
    color: '#ff4d4f',
    yieldMatId: 'mat_blood_herb',
    minYield: 2,
    maxYield: 4,
    expGain: 25,
    channelTime: 1.0,
    preferredTileTypes: [0, 14] // Grass / Bush
  },
  node_mana_bloom: {
    id: 'node_mana_bloom',
    name: 'Astral Mana Bloom',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 10,
    tier: 2,
    icon: '🌸',
    color: '#1890ff',
    yieldMatId: 'mat_mana_bloom',
    minYield: 2,
    maxYield: 3,
    expGain: 40,
    channelTime: 1.2,
    preferredTileTypes: [0, 14, 9]
  },
  node_moon_spore: {
    id: 'node_moon_spore',
    name: 'Moonlight Mushroom Shrub',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 15,
    tier: 2,
    icon: '🍄',
    color: '#c084fc',
    yieldMatId: 'mat_moon_spore',
    minYield: 2,
    maxYield: 4,
    expGain: 55,
    channelTime: 1.2,
    preferredTileTypes: [14, 0] // Bush preferred
  },
  node_heartwood: {
    id: 'node_heartwood',
    name: 'Ancient Elder Heartwood',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 20,
    tier: 2,
    icon: '🪵',
    color: '#a16207',
    yieldMatId: 'mat_heartwood',
    minYield: 1,
    maxYield: 3,
    expGain: 60,
    channelTime: 1.5,
    preferredTileTypes: [0, 14]
  },
  node_wind_leaf: {
    id: 'node_wind_leaf',
    name: 'Gale Windstrider Shrub',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 25,
    tier: 3,
    icon: '🍃',
    color: '#52c41a',
    yieldMatId: 'mat_wind_leaf',
    minYield: 2,
    maxYield: 3,
    expGain: 75,
    channelTime: 1.5,
    preferredTileTypes: [0, 7, 12]
  },
  node_dragon_lily: {
    id: 'node_dragon_lily',
    name: 'Dragonflame Lily',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 35,
    tier: 3,
    icon: '🌺',
    color: '#f97316',
    yieldMatId: 'mat_dragon_lily',
    minYield: 2,
    maxYield: 4,
    expGain: 110,
    channelTime: 1.8,
    preferredTileTypes: [13, 0],
    preferLavaAdjacent: true
  },
  node_starflower: {
    id: 'node_starflower',
    name: 'Astral Starflower',
    profType: 'herbalism',
    profName: 'Herbalism',
    reqLevel: 45,
    tier: 4,
    icon: '✨',
    color: '#ffd700',
    yieldMatId: 'mat_starflower',
    minYield: 1,
    maxYield: 2,
    expGain: 160,
    channelTime: 2.0,
    preferredTileTypes: [0, 4, 14]
  }
};

export const ZONE_RESOURCE_POOLS = {
  SanctuaryHaven: [],
  Haven: [],
  SpireArena: [],
  WhisperingPlains: ['node_iron_ore', 'node_blood_herb', 'node_silica_sand', 'node_aether_water'],
  VerdantCanopy: ['node_blood_herb', 'node_moon_spore', 'node_heartwood', 'node_iron_ore'],
  ShatteredCanopy: ['node_blood_herb', 'node_moon_spore', 'node_heartwood', 'node_iron_ore'],
  GlacialHollow: ['node_mithril', 'node_mana_bloom', 'node_wind_leaf'],
  FrostpeakTundra: ['node_mithril', 'node_mana_bloom', 'node_wind_leaf'],
  GlacialOutpost: ['node_mithril', 'node_mana_bloom', 'node_wind_leaf'],
  ForgottenCrypt: ['node_pure_silver', 'node_iron_ore', 'node_moon_spore'],
  Catacombs: ['node_pure_silver', 'node_iron_ore', 'node_moon_spore'],
  StormpeakRidge: ['node_titan_ore', 'node_wind_leaf', 'node_mithril'],
  MoltenCaldera: ['node_adamantite', 'node_dragon_lily', 'node_blood_herb'],
  InfernalChasm: ['node_adamantite', 'node_dragon_lily', 'node_iron_ore'],
  CrimsonDunes: ['node_adamantite', 'node_silica_sand', 'node_blood_herb'],
  VoidAbyss: ['node_aether_crystal', 'node_mana_bloom', 'node_astral_crystal'],
  GenesisCore: ['node_astral_crystal', 'node_starflower', 'node_aether_crystal']
};

export const activeResourceNodes = [];
let activeChanneling = null; // { node, timer, maxTime }
const MAX_ZONE_NODES = 7;
const CHUNK_SIZE = 32 * 48; // 1536 px (32 tiles)

/**
 * Initialize / ensure player profession stats
 */
export function initPlayerProfessions() {
  if (!player.professions) player.professions = {};
  if (!player.professions.mining) player.professions.mining = { level: 1, exp: 0 };
  if (!player.professions.herbalism) player.professions.herbalism = { level: 1, exp: 0 };
  if (!player.professions.skinning) player.professions.skinning = { level: 1, exp: 0 };
}

/**
 * Check if a candidate tile matches terrain criteria for a node prototype
 */
function isTerrainSuitableForNode(proto, tx, ty, getTileFn) {
  if (!getTileFn) return true;
  const currentTile = getTileFn(tx, ty);

  // Check if tile is in preferred list
  if (proto.preferredTileTypes && proto.preferredTileTypes.length > 0) {
    if (!proto.preferredTileTypes.includes(currentTile)) {
      return false;
    }
  }

  // Check adjacent tiles for wall / water / lava
  if (proto.preferWallAdjacent || proto.preferWaterAdjacent || proto.preferLavaAdjacent) {
    const neighbors = [
      getTileFn(tx + 1, ty),
      getTileFn(tx - 1, ty),
      getTileFn(tx, ty + 1),
      getTileFn(tx, ty - 1)
    ];

    if (proto.preferWallAdjacent && !neighbors.some(t => t === 1 || t === 10 || t === 15)) {
      return false;
    }
    if (proto.preferWaterAdjacent && !neighbors.some(t => t === 2 || t === 9)) {
      return false;
    }
    if (proto.preferLavaAdjacent && !neighbors.some(t => t === 5 || t === 13)) {
      return false;
    }
  }

  return true;
}

/**
 * Try spawning a single node respecting chunk limits and terrain
 */
function trySpawnSingleNode(zoneId, mapW, mapH, canWalkFn, getTileFn) {
  const pool = ZONE_RESOURCE_POOLS[zoneId] || ['node_iron_ore', 'node_blood_herb', 'node_mana_bloom', 'node_mithril'];
  if (pool.length === 0) return false;

  const nodeProtoId = pool[Math.floor(Math.random() * pool.length)];
  const proto = RESOURCE_NODES_CATALOG[nodeProtoId];
  if (!proto) return false;

  for (let attempts = 0; attempts < 50; attempts++) {
    const rx = 120 + Math.random() * (mapW * 48 - 240);
    const ry = 120 + Math.random() * (mapH * 48 - 240);
    const tx = Math.floor(rx / 48);
    const ty = Math.floor(ry / 48);

    if (!canWalkFn(rx, ry)) continue;
    if (Math.hypot(rx - player.x, ry - player.y) < 220) continue;

    // Density checks: min distance from other nodes >= 220px
    const tooClose = activeResourceNodes.some(n => Math.hypot(rx - n.x, ry - n.y) < 220);
    if (tooClose) continue;

    // Chunk cap: max 2 nodes per 32x32 chunk
    const cx = Math.floor(rx / CHUNK_SIZE);
    const cy = Math.floor(ry / CHUNK_SIZE);
    const nodesInChunk = activeResourceNodes.filter(n => Math.floor(n.x / CHUNK_SIZE) === cx && Math.floor(n.y / CHUNK_SIZE) === cy).length;
    if (nodesInChunk >= 2) continue;

    // Terrain match test
    if (!isTerrainSuitableForNode(proto, tx, ty, getTileFn)) continue;

    // 6% Rare / Prismatic Variant Roll
    const isRare = Math.random() < 0.06;
    const variantName = isRare ? `★ Prismatic ${proto.name}` : proto.name;
    const yieldMultiplier = isRare ? 2.5 : 1.0;
    const expGain = isRare ? Math.round(proto.expGain * 2.5) : proto.expGain;
    const auraColor = isRare ? '#ffd700' : proto.color;

    activeResourceNodes.push({
      id: `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      protoId: nodeProtoId,
      name: variantName,
      isRare: isRare,
      variant: isRare ? 'Prismatic' : 'Normal',
      auraColor: auraColor,
      profType: proto.profType,
      profName: proto.profName,
      reqLevel: proto.reqLevel,
      tier: proto.tier,
      icon: proto.icon,
      color: proto.color,
      yieldMatId: proto.yieldMatId,
      minYield: proto.minYield,
      maxYield: proto.maxYield,
      yieldMultiplier: yieldMultiplier,
      expGain: expGain,
      channelTime: proto.channelTime,
      x: rx,
      y: ry,
      radius: 65,
      isDepleted: false,
      respawnTimer: 0,
      sparkleTimer: Math.random() * 2
    });
    return true;
  }
  return false;
}

/**
 * Spawn resource nodes appropriate for current zone biome & terrain
 */
export function spawnResourceNodesForZone(zoneId, mapW, mapH, canWalkFn, getTileFn) {
  activeResourceNodes.length = 0;
  activeChanneling = null;

  if (zoneId === 'SanctuaryHaven' || zoneId === 'Haven' || zoneId === 'SpireArena') return;

  initPlayerProfessions();

  const targetCount = 4 + Math.floor(Math.random() * 3); // 4-6 nodes
  for (let i = 0; i < targetCount; i++) {
    trySpawnSingleNode(zoneId, mapW, mapH, canWalkFn, getTileFn);
  }
}

/**
 * Update gathering logic, channeling timer & resource node regrowth
 */
export function updateGatheringSystem(dt, zoneId, mapW, mapH, canWalkFn, getTileFn) {
  // 1. Channeling progression
  if (activeChanneling) {
    activeChanneling.timer += dt;

    // Emit sparkles while channeling
    if (Math.random() < 0.35) {
      particles.push({
        x: activeChanneling.node.x + (Math.random() - 0.5) * 30,
        y: activeChanneling.node.y - 15 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -40 - Math.random() * 40,
        color: activeChanneling.node.auraColor || activeChanneling.node.color,
        life: 0.45,
        maxLife: 0.45,
        size: activeChanneling.node.isRare ? 5 : 3
      });
    }

    if (activeChanneling.timer >= activeChanneling.maxTime) {
      completeGatheringNode(activeChanneling.node);
      activeChanneling = null;
    }
  }

  // 2. Node Sparkles & Regrowth cycle for depleted nodes
  for (let i = activeResourceNodes.length - 1; i >= 0; i--) {
    const node = activeResourceNodes[i];
    if (node.isDepleted) {
      node.respawnTimer -= dt;
      if (node.respawnTimer <= 0) {
        activeResourceNodes.splice(i, 1);
        // Regrow a fresh node if under max cap
        if (canWalkFn && activeResourceNodes.filter(n => !n.isDepleted).length < MAX_ZONE_NODES) {
          trySpawnSingleNode(zoneId || window.currentZoneId, mapW || 64, mapH || 64, canWalkFn, getTileFn);
        }
      }
    } else if (node.isRare) {
      // Rare nodes constantly emit subtle cosmic sparks
      node.sparkleTimer -= dt;
      if (node.sparkleTimer <= 0) {
        node.sparkleTimer = 0.2 + Math.random() * 0.3;
        particles.push({
          x: node.x + (Math.random() - 0.5) * 40,
          y: node.y - 10 + (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 30,
          vy: -30 - Math.random() * 30,
          color: '#ffd700',
          life: 0.6,
          maxLife: 0.6,
          size: 4
        });
      }
    }
  }
}

/**
 * Start interaction with resource node (Key F)
 */
export function tryInteractGatheringNode() {
  initPlayerProfessions();

  const nearNode = activeResourceNodes.find(n => !n.isDepleted && Math.hypot(player.x - n.x, player.y - n.y) < n.radius);
  if (!nearNode) return false;

  const currentProf = player.professions[nearNode.profType] || { level: 1, exp: 0 };
  if (currentProf.level < nearNode.reqLevel) {
    spawnDamageNumber(nearNode.x, nearNode.y - 45, `⚠️ Requires ${nearNode.profName} Lv.${nearNode.reqLevel} (Current: Lv.${currentProf.level})`, true, '#ef4444');
    AudioEngine.playTone(220, 'sawtooth', 0.25, 0.15);
    return true;
  }

  // Start Channeling
  activeChanneling = {
    node: nearNode,
    timer: 0,
    maxTime: nearNode.channelTime
  };

  AudioEngine.playTone(520, 'triangle', 0.1, 0.08);
  return true;
}

/**
 * Complete gathering process and grant rewards & profession EXP
 */
async function completeGatheringNode(node) {
  node.isDepleted = true;
  node.respawnTimer = 60 + Math.random() * 30; // 60-90s regrowth timer

  if (!player.materials) player.materials = {};
  if (!player.currencies) player.currencies = {};
  const prof = player.professions[node.profType] || { level: 1, exp: 0 };

  let rawYield = Math.floor(Math.random() * (node.maxYield - node.minYield + 1)) + node.minYield;
  let yieldCount = Math.round(rawYield * (node.yieldMultiplier || 1.0));
  let expGained = node.expGain;
  let leveledUp = false;

  // Server-authoritative gathering calculation
  const serverRes = await ApiClient.gatherResource(node.protoId || node.id, node.profType, prof.level, prof.exp);
  if (serverRes && serverRes.success) {
    yieldCount = Math.round(serverRes.yieldQuantity * (node.yieldMultiplier || 1.0));
    expGained = Math.round(serverRes.expGained * (node.yieldMultiplier || 1.0));
    prof.level = serverRes.newProfessionLevel;
    prof.exp = serverRes.newExp;
    leveledUp = serverRes.leveledUp;
    player.materials[serverRes.yieldMatId] = (player.materials[serverRes.yieldMatId] || 0) + yieldCount;
  } else {
    player.materials[node.yieldMatId] = (player.materials[node.yieldMatId] || 0) + yieldCount;
    prof.exp = (prof.exp || 0) + expGained;
    const maxExp = prof.level * 100;
    if (prof.exp >= maxExp && prof.level < 50) {
      prof.exp -= maxExp;
      prof.level++;
      leveledUp = true;
    }
  }

  // Bonus Rare Drops (Genesis Catalyst / Spark)
  if (node.isRare) {
    player.currencies.curr_spark = (player.currencies.curr_spark || 0) + 1;
    if (Math.random() < 0.4) {
      player.currencies.curr_prism = (player.currencies.curr_prism || 0) + 1;
    }
  }

  const matInfo = getMaterialInfo(node.yieldMatId);

  // Audio & Floating Text
  if (node.isRare) {
    AudioEngine.playLevelUp?.() || AudioEngine.playTone(920, 'sine', 0.4, 0.25);
    spawnDamageNumber(node.x, node.y - 65, `🌟 JACKPOT! +${yieldCount} ${matInfo.name} & +1 Aether Spark! (+${expGained} EXP)`, true, '#ffd700');
  } else {
    AudioEngine.playPickup?.() || AudioEngine.playTone(680, 'sine', 0.2, 0.15);
    spawnDamageNumber(node.x, node.y - 50, `+${yieldCount} ${matInfo.name}! (+${expGained} EXP)`, true, node.color);
  }

  if (leveledUp) {
    setTimeout(() => {
      AudioEngine.playLevelUp?.() || AudioEngine.playTone(880, 'sine', 0.35, 0.2);
      spawnDamageNumber(player.x, player.y - 65, `🎉 ${node.profName} LEVEL UP! (Lv. ${prof.level})`, true, '#ffd700');
    }, 300);
  }

  // Burst Particles (Triple particle burst for rare jackpot)
  const particleCount = node.isRare ? 36 : 16;
  for (let i = 0; i < particleCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 40 + Math.random() * (node.isRare ? 140 : 90);
    particles.push({
      x: node.x,
      y: node.y - 10,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      color: node.isRare ? '#ffd700' : node.color,
      life: 0.5,
      maxLife: 0.5,
      size: 4 + Math.random() * (node.isRare ? 5 : 3)
    });
  }

  saveToDatabase();
}

/**
 * Grant Skinning & Hunting EXP and Drops from Monsters
 */
export function handleMonsterSkinningDrop(monster) {
  initPlayerProfessions();
  if (!player.materials) player.materials = {};

  let dropMatId = null;
  let expGain = 15;

  const isBoss = monster.type === 'boss' || monster.isBoss;
  const isRare = monster.rarity === 'rare';

  // Biome & Type check
  if (monster.type && (monster.type.includes('dragon') || monster.type.includes('ignis') || monster.type.includes('molten'))) {
    dropMatId = 'mat_dragon_scale';
    expGain = isBoss ? 150 : 60;
  } else if (monster.type && (monster.type.includes('void') || monster.type.includes('malakor') || monster.type.includes('fiend'))) {
    dropMatId = 'mat_fiend_horn';
    expGain = isBoss ? 120 : 45;
  } else if (monster.type && (monster.type.includes('golem') || monster.type.includes('construct'))) {
    dropMatId = 'mat_mithril_chunk';
    expGain = isBoss ? 100 : 35;
  } else {
    dropMatId = 'mat_beast_leather';
    expGain = isBoss ? 80 : (isRare ? 35 : 15);
  }

  if (dropMatId) {
    const qty = isBoss ? (3 + Math.floor(Math.random() * 3)) : (isRare ? 2 : 1);
    player.materials[dropMatId] = (player.materials[dropMatId] || 0) + qty;

    const prof = player.professions.skinning;
    prof.exp = (prof.exp || 0) + expGain;
    const maxExp = prof.level * 100;
    if (prof.exp >= maxExp && prof.level < 50) {
      prof.exp -= maxExp;
      prof.level++;
      spawnDamageNumber(player.x, player.y - 60, `🎉 Skinning LEVEL UP! (Lv. ${prof.level})`, true, '#ffd700');
    }

    const matInfo = getMaterialInfo(dropMatId);
    spawnDamageNumber(monster.x, monster.y - 25, `🐺 Harvested +${qty} ${matInfo.name}`, true, '#ffd700');
    saveToDatabase();
  }
}

/**
 * Render resource nodes & glowing harvesting aura on map canvas
 */
export function renderGatheringNodes(ctx, camX, camY) {
  if (!activeResourceNodes || activeResourceNodes.length === 0) return;

  const now = Date.now();

  activeResourceNodes.forEach(node => {
    if (node.isDepleted) return;

    ctx.save();
    ctx.translate(node.x, node.y);

    const isMining = node.profType === 'mining';

    // 1. Rare / Prismatic Pulsing Glowing Aura
    if (node.isRare) {
      const pulse = 1 + Math.sin(now * 0.005) * 0.18;
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, -10, 24 * pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Outer rainbow ring
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, -10, 32 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Base Glow Ring
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = node.color + '22';
    ctx.fill();
    ctx.strokeStyle = node.isRare ? '#ffd700' : (node.color + '66');
    ctx.lineWidth = node.isRare ? 2 : 1;
    ctx.stroke();

    // 3. Render Sprite or Fallback Icon
    let renderedSprite = false;
    if (assets.gatheringNodes && assets.gatheringNodes.complete && (assets.gatheringNodes.naturalWidth || assets.gatheringNodes.width) > 0) {
      const sw = (assets.gatheringNodes.naturalWidth || assets.gatheringNodes.width) / 4;
      const sh = (assets.gatheringNodes.naturalHeight || assets.gatheringNodes.height) / 4;

      let col = 0, row = 0;
      if (node.protoId === 'node_iron_ore') { col = 2; row = 0; }
      else if (node.protoId === 'node_pure_silver' || node.protoId === 'node_titan_ore') { col = 1; row = 0; }
      else if (node.protoId === 'node_mithril') { col = 0; row = 0; }
      else if (node.protoId === 'node_adamantite' || node.protoId === 'node_aether_crystal' || node.protoId === 'node_astral_crystal') { col = 3; row = 0; }
      else if (node.protoId === 'node_blood_herb') { col = 2; row = 2; }
      else if (node.protoId === 'node_mana_bloom' || node.protoId === 'node_aether_water') { col = 3; row = 2; }
      else if (node.protoId === 'node_wind_leaf' || node.protoId === 'node_moon_spore') { col = 1; row = 2; }
      else { col = 0; row = 2; }

      ctx.drawImage(assets.gatheringNodes, col * sw, row * sh, sw, sh, -24, -32, 48, 48);
      renderedSprite = true;
    }

    if (!renderedSprite) {
      // Fallback Icon
      ctx.font = '24px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.icon, 0, -10);
    }

    // 4. Prompt & Nameplate
    const dist = Math.hypot(player.x - node.x, player.y - node.y);
    const isNear = dist < node.radius;

    ctx.font = node.isRare ? 'bold 11px "Outfit", sans-serif' : 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = node.isRare ? '#ffd700' : node.color;
    ctx.textAlign = 'center';
    ctx.fillText(`${node.name} (T${node.tier})`, 0, -34);

    if (isNear) {
      const curLvl = (player.professions && player.professions[node.profType]) ? player.professions[node.profType].level : 1;
      const canHarvest = curLvl >= node.reqLevel;

      ctx.fillStyle = canHarvest ? '#ffd700' : '#ef4444';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillText(canHarvest ? `[F] ${isMining ? 'MINE' : 'GATHER'} (Lv.${node.reqLevel})` : `⚠️ Requires Lv.${node.reqLevel}`, 0, 24);

      // Pulse ring
      ctx.strokeStyle = canHarvest ? '#ffd700' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, node.radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  });

  // Render Channeling Progress Bar if active
  if (activeChanneling) {
    const n = activeChanneling.node;
    const pct = Math.min(1, activeChanneling.timer / activeChanneling.maxTime);

    ctx.save();
    ctx.translate(player.x, player.y - 45);

    // Bar Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(-35, -5, 70, 10);
    ctx.strokeStyle = n.auraColor || n.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(-35, -5, 70, 10);

    // Bar Fill
    ctx.fillStyle = n.auraColor || n.color;
    ctx.fillRect(-33, -3, 66 * pct, 6);

    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${n.profName}...`, 0, -8);

    ctx.restore();
  }
}
