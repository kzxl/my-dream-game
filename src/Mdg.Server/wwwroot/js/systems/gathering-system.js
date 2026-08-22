/**
 * MDG: Aethelis - Gathering & Profession Engine
 * 3 Gathering Professions: Mining (⛏️), Herbalism (🌿), Skinning & Hunting (🐺)
 * Material Tiers (T1 to T4) with Profession Level Requirements (Lv. 1, 10, 25, 40)
 * Interactive World Resource Nodes, Channeling Progress Bar & Monster Drop Integration
 */

import { player, particles } from '../state.js';
import { assets } from '../assets.js';
import { AudioEngine } from '../audio.js';
import { spawnDamageNumber } from '../combat.js';
import { saveToDatabase } from '../save-system.js';
import { getMaterialInfo } from '../data/materials.js';

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
  // Mining Nodes (Quặng & Cát Thạch Anh)
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
    channelTime: 0.8
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
    channelTime: 1.2
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
    channelTime: 1.4
  },
  node_aether_crystal: {
    id: 'node_aether_crystal',
    name: 'Arcane Aether Geode',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 25,
    tier: 3,
    icon: '🔮',
    color: '#c678dd',
    yieldMatId: 'mat_aether_crystal',
    minYield: 2,
    maxYield: 3,
    expGain: 80,
    channelTime: 1.6
  },
  node_adamantite: {
    id: 'node_adamantite',
    name: 'Volcanic Adamantite Core',
    profType: 'mining',
    profName: 'Mining',
    reqLevel: 40,
    tier: 4,
    icon: '🪨',
    color: '#ffd700',
    yieldMatId: 'mat_adamantite_ingot',
    minYield: 1,
    maxYield: 2,
    expGain: 120,
    channelTime: 2.0
  },

  // Herbalism Nodes (Thảo dược, Nước Suối & Gỗ)
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
    channelTime: 0.8
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
    channelTime: 1.0
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
    expGain: 50,
    channelTime: 1.2
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
    expGain: 80,
    channelTime: 1.5
  },
  node_heartwood: {
    id: 'node_heartwood',
    name: 'Ancient Elder Heartwood',
    profType: 'herbalism',
    profName: 'Gathering',
    reqLevel: 15,
    tier: 2,
    icon: '🪵',
    color: '#a16207',
    yieldMatId: 'mat_heartwood',
    minYield: 1,
    maxYield: 3,
    expGain: 60,
    channelTime: 1.5
  }
};

export const activeResourceNodes = [];
let activeChanneling = null; // { node, timer, maxTime }

/**
 * Initialize / ensure player profession stats
 */
export function initPlayerProfessions() {
  if (!player.professions) {
    player.professions = {
      mining: { level: 1, exp: 0 },
      herbalism: { level: 1, exp: 0 },
      skinning: { level: 1, exp: 0 }
    };
  }
}

/**
 * Spawn resource nodes appropriate for current zone biome
 */
export function spawnResourceNodesForZone(zoneId, mapW, mapH, canWalkFn) {
  activeResourceNodes.length = 0;
  activeChanneling = null;

  if (zoneId === 'Haven' || zoneId === 'SpireArena') return; // No gathering in town or Spire arena

  initPlayerProfessions();

  let pool = [];
  if (zoneId === 'WhisperingPlains' || zoneId === 'ShatteredCanopy') {
    pool = ['node_iron_ore', 'node_blood_herb', 'node_mana_bloom'];
  } else if (zoneId === 'GlacialHollow' || zoneId === 'StormpeakRidge') {
    pool = ['node_mithril', 'node_mana_bloom', 'node_wind_leaf'];
  } else if (zoneId === 'VoidAbyss' || zoneId === 'GenesisCore') {
    pool = ['node_aether_crystal', 'node_adamantite', 'node_wind_leaf'];
  } else if (zoneId === 'MoltenCaldera' || zoneId === 'CrimsonDunes') {
    pool = ['node_adamantite', 'node_blood_herb', 'node_iron_ore'];
  } else {
    pool = ['node_iron_ore', 'node_blood_herb', 'node_mithril', 'node_mana_bloom'];
  }

  const nodeCount = 4 + Math.floor(Math.random() * 3); // 4-6 nodes

  for (let i = 0; i < nodeCount; i++) {
    const nodeProtoId = pool[Math.floor(Math.random() * pool.length)];
    const proto = RESOURCE_NODES_CATALOG[nodeProtoId];
    if (!proto) continue;

    let placed = false;
    for (let attempts = 0; attempts < 40; attempts++) {
      const rx = 100 + Math.random() * (mapW * 48 - 200);
      const ry = 100 + Math.random() * (mapH * 48 - 200);
      const tx = Math.floor(rx / 48);
      const ty = Math.floor(ry / 48);

      if (canWalkFn(tx, ty) && Math.hypot(rx - player.x, ry - player.y) > 200) {
        const tooClose = activeResourceNodes.some(n => Math.hypot(rx - n.x, ry - n.y) < 180);
        if (!tooClose) {
          activeResourceNodes.push({
            id: `node_${Date.now()}_${i}`,
            protoId: nodeProtoId,
            name: proto.name,
            profType: proto.profType,
            profName: proto.profName,
            reqLevel: proto.reqLevel,
            tier: proto.tier,
            icon: proto.icon,
            color: proto.color,
            yieldMatId: proto.yieldMatId,
            minYield: proto.minYield,
            maxYield: proto.maxYield,
            expGain: proto.expGain,
            channelTime: proto.channelTime,
            x: rx,
            y: ry,
            radius: 65,
            isDepleted: false,
            sparkleTimer: Math.random() * 2
          });
          placed = true;
          break;
        }
      }
    }
  }
}

/**
 * Update gathering logic & channeling timer
 */
export function updateGatheringSystem(dt) {
  if (activeChanneling) {
    activeChanneling.timer += dt;

    // Emit sparkles while channeling
    if (Math.random() < 0.3) {
      particles.push({
        x: activeChanneling.node.x + (Math.random() - 0.5) * 30,
        y: activeChanneling.node.y - 15 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -40 - Math.random() * 40,
        color: activeChanneling.node.color,
        life: 0.4,
        maxLife: 0.4,
        size: 4
      });
    }

    if (activeChanneling.timer >= activeChanneling.maxTime) {
      completeGatheringNode(activeChanneling.node);
      activeChanneling = null;
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
function completeGatheringNode(node) {
  node.isDepleted = true;

  if (!player.materials) player.materials = {};

  const yieldCount = Math.floor(Math.random() * (node.maxYield - node.minYield + 1)) + node.minYield;
  player.materials[node.yieldMatId] = (player.materials[node.yieldMatId] || 0) + yieldCount;

  const matInfo = getMaterialInfo(node.yieldMatId);

  // Add Profession EXP
  const prof = player.professions[node.profType];
  prof.exp = (prof.exp || 0) + node.expGain;
  const maxExp = prof.level * 100;

  let leveledUp = false;
  if (prof.exp >= maxExp && prof.level < 50) {
    prof.exp -= maxExp;
    prof.level++;
    leveledUp = true;
  }

  // Audio & Floating Text
  AudioEngine.playPickup?.() || AudioEngine.playTone(680, 'sine', 0.2, 0.15);

  spawnDamageNumber(node.x, node.y - 50, `+${yieldCount} ${matInfo.name}! (+${node.expGain} EXP)`, true, node.color);

  if (leveledUp) {
    setTimeout(() => {
      AudioEngine.playLevelUp?.() || AudioEngine.playTone(880, 'sine', 0.35, 0.2);
      spawnDamageNumber(player.x, player.y - 65, `🎉 ${node.profName} LEVEL UP! (Lv. ${prof.level})`, true, '#ffd700');
    }, 300);
  }

  // Burst Particles
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 40 + Math.random() * 90;
    particles.push({
      x: node.x,
      y: node.y - 10,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      color: node.color,
      life: 0.45,
      maxLife: 0.45,
      size: 4 + Math.random() * 3
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
    dropMatId = isBoss ? 'mat_adamantite_ingot' : 'mat_iron_ore';
    expGain = isBoss ? 100 : 35;
  } else {
    dropMatId = 'mat_beast_leather';
    expGain = isBoss ? 80 : 20;
  }

  const dropChance = isBoss ? 1.0 : (isRare ? 0.60 : 0.25);
  if (Math.random() <= dropChance && dropMatId) {
    const count = isBoss ? (Math.floor(Math.random() * 3) + 2) : 1;
    player.materials[dropMatId] = (player.materials[dropMatId] || 0) + count;
    const matInfo = getMaterialInfo(dropMatId);

    // Add Skinning EXP
    const prof = player.professions.skinning;
    prof.exp = (prof.exp || 0) + expGain;
    const maxExp = prof.level * 100;
    if (prof.exp >= maxExp && prof.level < 50) {
      prof.exp -= maxExp;
      prof.level++;
      spawnDamageNumber(player.x, player.y - 75, `🎉 Skinning Level Up! (Lv. ${prof.level})`, true, '#ffd700');
    }

    spawnDamageNumber(monster.x, monster.y - 40, `🥩 +${count} ${matInfo.name}`, false, matInfo.color || '#ffd700');
  }
}

/**
 * Render all active resource nodes on map
 */
export function renderGatheringNodes(ctx) {
  activeResourceNodes.forEach(node => {
    if (node.isDepleted) return;

    ctx.save();
    ctx.translate(node.x, node.y);

    const isMining = node.profType === 'mining';

    // Base Glow Aura
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
    grad.addColorStop(0, node.color + 'aa');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Render High-Quality Sprite from assets.gatheringNodes if available
    let renderedSprite = false;
    if (assets.gatheringNodes && assets.gatheringNodes.complete && (assets.gatheringNodes.naturalWidth || assets.gatheringNodes.width) > 0) {
      const sw = (assets.gatheringNodes.naturalWidth || assets.gatheringNodes.width) / 4;
      const sh = (assets.gatheringNodes.naturalHeight || assets.gatheringNodes.height) / 4;
      
      let col = 0, row = 0;
      if (node.id === 'node_iron') { col = 2; row = 0; }
      else if (node.id === 'node_gold') { col = 1; row = 0; }
      else if (node.id === 'node_mithril') { col = 0; row = 0; }
      else if (node.id === 'node_adamantite' || node.id === 'node_voidstone') { col = 3; row = 0; }
      else if (node.id === 'node_blood_herb') { col = 2; row = 2; }
      else if (node.id === 'node_mana_bloom' || node.id === 'node_aether_water') { col = 3; row = 2; }
      else if (node.id === 'node_wind_leaf') { col = 1; row = 2; }
      else { col = 0; row = 2; } // sunblossom / default

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

    // Prompt & Nameplate
    const dist = Math.hypot(player.x - node.x, player.y - node.y);
    const isNear = dist < node.radius;

    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillStyle = node.color;
    ctx.fillText(`${node.name} (T${node.tier})`, 0, -32);

    if (isNear) {
      const curLvl = (player.professions && player.professions[node.profType]) ? player.professions[node.profType].level : 1;
      const canHarvest = curLvl >= node.reqLevel;

      ctx.fillStyle = canHarvest ? '#ffd700' : '#ef4444';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillText(canHarvest ? `[F] ${isMining ? 'MINE' : 'GATHER'} (Lv.${node.reqLevel})` : `⚠️ Requires Lv.${node.reqLevel}`, 0, 22);

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
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(-35, -5, 70, 10);

    // Bar Fill
    ctx.fillStyle = n.color;
    ctx.fillRect(-33, -3, 66 * pct, 6);

    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${n.profName}...`, 0, -8);

    ctx.restore();
  }
}
